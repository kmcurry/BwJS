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
    
    this.lastDetected = null;
    this.lastColliding = false;
    this.lastCollidingDistance = FLT_MAX;
    this.selector = null;
    
    this.name.setValueDirect("CollideDirective");
}

CollideDirective.prototype.setRegistry = function(registry)
{
    // use Bridgeworks' physics simulator for collision detection
    var bworks = registry.find("Bridgeworks");
    this.physicsSimulator = bworks.physicsSimulator;
    this.selector = bworks.selector;
    
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
    //this.detectCollisions(params.detectCollisions);

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
        //this.physicsSimulator.evaluate();
        this.lastDetected = null; // clear last selected
        return;
    }
    
    //this.physicsSimulator.evaluate();
    
    // if selected is not the same as last selected, reset last selected position
    if (selected != this.lastDetected)
    {
        selected.lastPosition = selected.position.getValueDirect();
        selected.lastQuaternion = getInspectionGroupQuaternion(selected).getValueDirect();
        this.lastDetected = selected;
        this.lastColliding = false;
        this.lastCollidingDistance = FLT_MAX;
    }
    /*
    var position = selected.position.getValueDirect();
    var lastPosition = selected.lastPosition || position;
    var delta = new Vector3D(position.x - lastPosition.x, position.y - lastPosition.y, position.z - lastPosition.z);
    var delta_distance = distanceBetween(new Vector3D(position.x, position.y, position.z),
                                         new Vector3D(lastPosition.x, lastPosition.y, lastPosition.z));
    console.log(delta_distance);
    var bbox_min = selected.bbox.min.getValueDirect();
    var bbox_max = selected.bbox.max.getValueDirect();
    var bbox_size = distanceBetween(new Vector3D(bbox_min.x, bbox_min.y, bbox_min.z),
                                    new Vector3D(bbox_max.x, bbox_max.y, bbox_max.z));
    var iterations = 1;
    if (delta_distance > bbox_size)
    {
        iterations = Math.ceil(delta_distance / bbox_size);
    }
    delta.multiplyScalar(1 / iterations);
    var timeIncrement = this.physicsSimulator.timeIncrement.getValueDirect() / iterations;
    this.physicsSimulator.timeIncrement.setValueDirect(timeIncrement);
    for (var i = 0; i < iterations; i++)
    {
        position.x += delta.x;
        position.y += delta.y;
        position.z += delta.z;
        selected.position.setValueDirect(position.x, position.y, position.z);
    */
        if (this.detectCollision(selected))
        {
            return;
        }
    //}
 }
    
CollideDirective.prototype.detectCollision = function(model)
{
    if (model.physicalProperties.mass.getValueDirect() == 0) return false;
    
    // if selected is not the same as last selected, reset last selected position
    if (model != this.lastDetected)
    {    
        model.lastPosition = model.position.getValueDirect();
        model.lastQuaternion = getInspectionGroupQuaternion(model).getValueDirect();
        this.lastDetected = model;
        this.lastColliding = false;
        this.lastCollidingDistance = FLT_MAX;
    }

    // update position of selected model with physics simulator
    this.physicsSimulator.updatePhysicsBodyPosition(this.physicsSimulator.getPhysicsBodyIndex(model), true);
    
    // perform CD 
    //this.physicsSimulator.detectCollisions(); 
    
    // check collision status
    var colliding = this.isColliding(model);
    // if colliding and the distance between collision points is < MIN_COLLIDE_DISTANCE, update position to physics engine's position
    if (colliding.colliding)
    {   
        // if model is set to stop on collision, update its position from the physics simulator
        if (model.getAttribute("stopOnCollision").getValueDirect())
        {    
            //if (colliding.distance > 0.01) // check already performed by PhysicsSimulator::isColliding
            {
                if (this.lastColliding)
                {                   
                    var trans = new Ammo.btTransform();
                    this.physicsSimulator.getPhysicsBody(model).getMotionState().getWorldTransform(trans);
                    var origin = trans.getOrigin();
                    //var rot = trans.getRotation();
                    //var quaternion = new Quaternion();
                    //quaternion.load(rot.w(), rot.x(), rot.y(), rot.z());
                    Ammo.destroy(trans);
                
                    var position = new Vector3D(origin.x(), origin.y(), origin.z());                        
                    model.lastPosition = position;
                    //model.lastQuaternion = quaternion;
                }
                
                model.getAttribute("position").removeModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);    
                model.getAttribute("position").setValueDirect(model.lastPosition.x, model.lastPosition.y, model.lastPosition.z);
                model.getAttribute("position").addModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);
                
                //model.getAttribute("quaternion").removeModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);    
                //model.getAttribute("quaternion").setValueDirect(model.lastQuaternion);
                //model.getAttribute("quaternion").addModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this.physicsSimulator);
                //getInspectionGroupQuaternion(model).setValueDirect(model.lastQuaternion);
            }

            this.lastColliding = true;
            this.lastCollidingDistance = colliding.distance;
            //console.log("colliding");
        }
    }
    else
    {
        // no collision
        model.lastPosition = model.position.getValueDirect();
        model.lastQuaternion = getInspectionGroupQuaternion(model).getValueDirect();
        this.lastColliding = false;
        this.lastCollidingDistance = FLT_MAX;
        //console.log("not colliding");
    }
    
    return this.lastColliding;
}

CollideDirective.prototype.detectGroundCollision = function(model, transDelta)
{   
    // get ground model
    var ground = this.registry.find("Ground");
    if (!ground) 
    {
        return { colliding: false, distance: FLT_MAX }
    }
    
    // get model center
    var center = model.center.getVector3D();
    
    // get model current position
    var position = model.position.getVector3D();
    
    // get model next position
    var nextPosition = new Vector3D(position.x + transDelta.x, position.y + transDelta.y, position.z + transDelta.z);
    
    // get distance between current and next position
    var distance = distanceBetween(position, nextPosition);
    
    // perform ray pick from model current position to ground along direction and retrieve distance rpG
    var scale = ground.scale.getVector3D();
    var scale_max = max3(scale.x, scale.y, scale.z);
    var rpG = rayPick(ground.boundingTree, new Vector3D(position.x, position.y, position.z), transDelta,
                      0, 10000, ground.transformCompound, new Matrix4x4(), scale_max, false, null);
    if (!rpG)
    {
        return { colliding: false, distance: FLT_MAX }
    } 
    var ground_y_distance = position.y - rpG.pointWorld.y;

    // perform ray pick from model current position to farthest model edge along y direction and retrieve distance model_distance
    
    // account for model's object-inspected rotation
    /*var rotationMatrix = new Matrix4x4();
    var inspectionGroup = getInspectionGroup(model);
    if (inspectionGroup)
    {
        var quaternionRotate = inspectionGroup.getChild(2);
        rotationMatrix = quaternionRotate.getAttribute("matrix").getValueDirect();
    }*/
    
    var model_y_distance = 0;
    scale = model.scale.getVector3D();
    /*scale_max = max3(scale.x, scale.y, scale.z);
    var rpM = rayPick(model.boundingTree, new Vector3D(), rotationMatrix.transform(0, -1, 0, 0),
                  0, 10000, new Matrix4x4(), new Matrix4x4(), scale_max, true, null, true);
    if (rpM)
    {
        model_y_distance = rpM.distance * scale_max;
    }
    else // !rpM*/
    {
        var bbox_max = model.bbox.max.getVector3D();
        var bbox_min = model.bbox.min.getVector3D();
        model_y_distance = scale.y * (bbox_max.y - bbox_min.y) / 2;
    }    
    
    // find collision distance (ground_y_distance - model_distance)
    var collisionDistance = ground_y_distance - model_y_distance;
    //console.log(collisionDistance);
    
    // if collision distance < distance, return colliding with collision distance
    if (collisionDistance < distance)
    {
        //if (collisionDistance < 0) collisionDistance = 0; // don't allow negative values
        return { colliding: true, distance: collisionDistance }
    }
    
    // collision distance > distance, return false
    return { colliding: false, distance: FLT_MAX }
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
    var snapper = this.selector.selected;
    if (!snapper || snapper.getAttribute("snapEnabled").getValueDirect() == false) return;

    // test plugs for collision with sockets
    var snapMgr = this.registry.find("SnapMgr");
    for (var i in collideRecs)
    {
        var snappee = collideRecs[i].model;
        if (snappee == snapper || snappee.getAttribute("snapEnabled").getValueDirect() == false) continue;
        if (snapper.boundingTree.collides(snappee.boundingTree) &&
            snapMgr.trySnap(snapper, snappee))
        {     
            return;
            //break;
        }
    }
}
    
CollideDirective.prototype.isColliding = function(model)
{   
    var colliding = this.physicsSimulator.isColliding(model);
    
    return colliding;
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