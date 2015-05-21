var MIN_COLLIDE_DISTANCE = 0.01;
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
    
    this.lastSelected = null;
    this.lastColliding = false;
    this.lastCollidingDistance = FLT_MAX;
    
    this.name.setValueDirect("CollideDirective");
}

CollideDirective.prototype.setRegistry = function(registry)
{
    // use Bridgeworks' physics simulator for collision detection
    var bworks = registry.find("Bridgeworks");
    this.physicsSimulator = bworks.physicsSimulator;

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
    if (!this.physicsSimulator) return;
        
    // reset model's collision attributes; get selected model
    var selected = null;
    for (var i in collideRecs)
    {
        var model = collideRecs[i].model;

        model.getAttribute("collisionDetected").setValueDirect(false);
        model.getAttribute("collisionList").clear();

        if (this.isSelected(model))
        {
            selected = model;
        }
    }
    // currently only detecting collisions on selected model, but still need to evaluate physics simulator
    if (!selected)
    {
        this.physicsSimulator.evaluate();
        this.lastSelected = null; // clear last selected
        return;
    }

    // if selected is not the same as last selected, reset last selected position
    if (selected != this.lastSelected)
    {
        selected.lastSelectedPosition = new Stack(selected.position.getValueDirect());
        this.lastSelected = selected;
        this.lastColliding = false;
        this.lastCollidingDistance = FLT_MAX;
    }
    
    //var position = selected.position.getValueDirect();
    //var lastPosition = selected.lastSelectedPosition || position;
    //var delta = new Vector3D(position.x - lastPosition.x, position.y - lastPosition.y, position.z - lastPosition.z);
    //delta.multiplyScalar(1 / 5);
    //var timeIncrement = this.physicsSimulator.timeIncrement.getValueDirect() / 5;
    //this.physicsSimulator.timeIncrement.setValueDirect(timeIncrement);
    //for (var i = 0; i < 5; i++)
    {
        //position.x += delta.x;
        //position.y += delta.y;
        //position.z += delta.z;
        //selected.position.setValueDirect(position.x, position.y, position.z);
        //if (selected.physicalProperties.mass.getValueDirect() > 0)
        if (this.detectCollision(selected))
        {
            return;
        }
    }
 }
    
CollideDirective.prototype.detectCollision = function(selected)
{  
    // update position of selected model with physics simulator
    this.physicsSimulator.updatePhysicsBodyPosition(this.physicsSimulator.getPhysicsBodyIndex(selected), true);
    
    // evaluate physics simulator   
    this.physicsSimulator.evaluate();

    if (selected.physicalProperties.mass.getValueDirect() == 0) return false;
    
    // check collision status
    var collidees = this.physicsSimulator.isColliding(selected);
    // if colliding and the distance between collision points is < MIN_COLLIDE_DISTANCE, update position to physics engine's position
    if (collidees.colliding)
    {   
        // if model is set to stop on collision, update its position from the physics simulator
        if (selected.getAttribute("stopOnCollision").getValueDirect())
        {    
            // if last selected position hasn't been set yet, set to physics engine's position
            //if (!selected.lastSelectedPosition || this.lastColliding)
            if (collidees.distance > 0.01)
            {
                var trans = new Ammo.btTransform();
                this.physicsSimulator.getPhysicsBody(selected).getMotionState().getWorldTransform(trans);
                var origin = trans.getOrigin();
                var rot = trans.getRotation();
                var quaternion = new Quaternion();
                quaternion.load(rot.w(), rot.x(), rot.y(), rot.z());
                Ammo.destroy(trans);
                
                //selected.lastSelectedPosition.x -= collidees.pos.x;
                //selected.lastSelectedPosition.y -= collidees.pos.y;
                //selected.lastSelectedPosition.z -= collidees.pos.z;
                this.lastColliding = true;
                
                if (this.lastColliding)
                {
                    //if (selected.lastSelectedPosition.length() > 1)
                    {
                    //    selected.lastSelectedPosition.pop();
                    }
                    //else
                    {
                        var position = new Vector3D(origin.x(), origin.y(), origin.z());                        
                        selected.lastSelectedPosition.push(position);
                        //this.lastColliding = false;
                        
                        selected.getAttribute("quaternion").removeModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);    
                        selected.getAttribute("quaternion").setValueDirect(quaternion.x, quaternion.y, quaternion.z);//origin.x(), origin.y(), origin.z()); 
                        selected.getAttribute("quaternion").addModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);
                        //zeroInspectionGroup(selected);
                    }
                }
                var lastSelectedPosition = selected.lastSelectedPosition.top();
                
                selected.getAttribute("position").removeModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);    
                selected.getAttribute("position").setValueDirect(lastSelectedPosition.x, lastSelectedPosition.y, lastSelectedPosition.z);//origin.x(), origin.y(), origin.z()); 
                selected.getAttribute("position").addModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);
            }

            this.lastCollidingDistance = 0;
            console.log("colliding");
        }
    }
    else
    {
        // no collision; update last selected position to current position
        selected.lastSelectedPosition.push(selected.position.getValueDirect());
        this.lastColliding = false;
        this.lastCollidingDistance = FLT_MAX;
        console.log("not colliding");
    }
    
    return this.lastColliding;
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
        if (snapper.boundingTree.collides(snappees[i].boundingTree) &&
            snapMgr.trySnap(snapper, snappees[i]))
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