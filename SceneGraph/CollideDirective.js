var MAX_SEE_AHEAD = 2;

CollideParams.prototype = new DirectiveParams();
CollideParams.prototype.constructor = CollideParams();

function CollideParams()
{
    DirectiveParams.call(this);

    this.viewSpace = false;
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.detectCollisions = new Array();
}

function CollideRec(model, tree, worldMatrix)
{
    this.model = model;
    this.tree = tree;
    this.worldMatrix = new Matrix4x4();
    this.worldMatrix.loadMatrix(worldMatrix);
}

CollideDirective.prototype = new SGDirective();
CollideDirective.prototype.constructor = CollideDirective;

function CollideDirective()
{
    SGDirective.call(this);
    this.className = "CollideDirective";
    this.attrType = eAttrType.CollideDirective;

    this.physicsSim = new PhysicsSimulator();
    this.physicsSim.getAttribute("gravity").setValueDirect(0, 0, 0);

    this.name.setValueDirect("CollideDirective");
}

CollideDirective.prototype.setRegistry = function(registry)
{
    this.physicsSim.setRegistry(registry);

    // call base-class implementation
    SGDirective.prototype.setRegistry.call(this, registry);
}

CollideDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // setup collision Detect params structure
    var params = new CollideParams();

    // get list of models for collision detection
    root.apply("collide", params, true);

    // detect collisions
    this.detectCollisions(params.detectCollisions);

    // detect obstructions
    this.detectObstructions(params.detectCollisions);

    // detect snap-to connections
    this.detectSnapConnections(params.detectCollisions);
}

CollideDirective.prototype.detectCollisions = function(collideRecs)
{
    var i, j;
    
    // synchronize models with physics simulator
    var models = [];
    var bodies = new AttributeVector();
    for (i in collideRecs)
    {
        var model = collideRecs[i].model;

        model.getAttribute("collisionDetected").setValueDirect(false);
        model.getAttribute("collisionList").clear();

        if (model.motionParent)
            continue;
        // physics simulator uses parents for child models

        models.push(model);
        var name = new StringAttr(model.getAttribute("name").getValueDirect().join(""));
        bodies.push_back(name);
    }
    this.physicsSim.getAttribute("bodies").synchronize(bodies, true);
    this.physicsSim.update();
    
    // update positions of models (retain inspection group's rotation)
    for (i = 0; i < models.length; i++)
    {
        var model = models[i];

        var rotationGroup = getInspectionGroup(model);
        var rotationQuat = rotationGroup ? rotationGroup.getChild(2).getAttribute("rotationQuat").getValueDirect() : new Quaternion();

        this.physicsSim.updatePhysicsBodyPosition(i);

        if (rotationGroup) rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(rotationQuat);
    }

    // update physics simulation
    this.physicsSim.stepSimulation(1, 1);

    // get collisions
    for (i = 0; i < models.length; i++)
    {
        var model = models[i];
        if (!this.isSelected(model)) continue; // for now only test currently selected model
            
        /*
        var colliders = this.physicsSim.getColliders(model);
        if (colliders.length > 0)
        {
            // TODO: should parent's collision be propagated to child models?
            for (j = 0; j < colliders.length; j++)
            {
                model.getAttribute("collisionList").push_back(colliders[j]);
            }
            model.getAttribute("collisionDetected").setValueDirect(true);

            // if model is set to stop on collision, update its position from the physics simulator
            if (model.getAttribute("stopOnCollision").getValueDirect())
            {
                var trans = new Ammo.btTransform();
                this.physicsSim.getPhysicsBody(model).getMotionState().getWorldTransform(trans);
                var origin = trans.getOrigin();
                Ammo.destroy(trans);
                var position = new Vector3D(origin.x(), origin.y(), origin.z());
                model.getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);
                
            }
        }
        */
        var colliding = this.physicsSim.isColliding(model);
        if (colliding)
        {
            // if model is set to stop on collision, update its position from the physics simulator
            if (model.getAttribute("stopOnCollision").getValueDirect())
            {
                var trans = new Ammo.btTransform();
                this.physicsSim.getPhysicsBody(model).getMotionState().getWorldTransform(trans);
                var origin = trans.getOrigin();
                Ammo.destroy(trans);
                var position = new Vector3D(origin.x(), origin.y(), origin.z());
                model.getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);               
            }
        }
    }
}

CollideDirective.prototype.detectObstructions = function(collideRecs)
{
    var i, j;
    var models = [];
    var trees = [];
    var obstructions = [];

    for (i in collideRecs)
    {
        if (collideRecs[i].model.getAttribute("detectObstruction").getValueDirect() == false) continue;
        
        models.push(collideRecs[i].model);
        trees.push(collideRecs[i].tree);
        obstructions.push(false);

        collideRecs[i].model.getAttribute("obstructionList").clear();
    }

    var distance = 0;
    var minDistance = FLT_MAX;
    for (i = 0; i < trees.length; i++)
    {
        var scale = models[i].scale.getValueDirect();
        
        var directionVectors = models[i].getDirectionVectors();
        directionVectors.forward.x *= MAX_SEE_AHEAD * scale.x;
        directionVectors.forward.y *= MAX_SEE_AHEAD * scale.y;
        directionVectors.forward.z *= MAX_SEE_AHEAD * scale.z;

        for (j = 0; j < trees.length; j++)
        {
            if (i == j)
                continue;

            if (( distance = trees[j].obstructs(trees[i], directionVectors.forward)) > 0 && distance < minDistance)
            {
                models[i].getAttribute("obstructionList").clear();
                models[i].getAttribute("obstructionList").push_back(models[j]);
                obstructions[i] = true;
                minDistance = distance;
            }
        }
    }

    for (i = 0; i < obstructions.length; i++)
    {
        models[i].getAttribute("obstructionDetected").setValueDirect(obstructions[i]);
    }
}

CollideDirective.prototype.detectSnapConnections = function(collideRecs)
{
    var i;
    var snapper = null;
    var snappees = [];
    
    for (i in collideRecs)
    {
        // only test plugs from the currently selected model
        if (this.isSelected(collideRecs[i].model) &&
            collideRecs[i].model.getAttribute("snapEnabled").getValueDirect())
        {
            snapper = collideRecs[i].model;
        }
        else if (collideRecs[i].model.getAttribute("snapEnabled").getValueDirect()) // !selected
        {
            snappees.push(collideRecs[i].model);
        }       
    }
    if (!snapper || snappees.length == 0) return;

    // test plugs for collision with sockets
    var snapMgr = this.registry.find("SnapMgr");
    for (i = 0; i < snappees.length; i++)
    {
        if (snapMgr.trySnap(snapper, snappees[i]))
        {     
            return;
            //break;
        }
    }
}
    
CollideDirective.prototype.isSelected = function(model)
{
    var selected = model.getAttribute("selected").getValueDirect();
    if (!selected)
    {
        for (var i = 0; i < model.motionChildren.length && !selected; i++)
        {
            selected = this.isSelected(model.motionChildren[i]);
        }
    }

    return selected;
}
