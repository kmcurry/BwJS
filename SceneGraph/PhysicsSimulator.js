PhysicsSimulator.prototype = new Evaluator();
PhysicsSimulator.prototype.constructor = PhysicsSimulator;

function PhysicsSimulator()
{
    Evaluator.call(this);
    this.className = "PhysicsSimulator";
    this.attrType = eAttrType.PhysicsSimulator;

    this.world = null;
    this.physicsBodies = [];
    this.physicsShapes = [];
    this.bodyAdded = [];
    this.bodyModels = [];
    this.updateWorld = false;
    this.updateBodies = false;

    this.timeIncrement = new NumberAttr(0);
    this.timeScale = new NumberAttr(1);
    this.gravity = new Vector3DAttr(0, -9.8, 0);
    this.worldHalfExtents = new Vector3DAttr(10000, 10000, 10000); // TODO: does this need to be configurable? 
    this.bodies = new AttributeVector(new StringAttrAllocator());

    this.bodies.getAttribute("appendParsedElements").setValueDirect(true);

    this.gravity.addModifiedCB(PhysicsSimulator_GravityModifiedCB, this);
    this.bodies.addModifiedCB(PhysicsSimulator_BodiesModifiedCB, this);

    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.timeScale, "timeScale");
    this.registerAttribute(this.gravity, "gravity");
    this.registerAttribute(this.worldHalfExtents, "worldHalfExtents");
    this.registerAttribute(this.bodies, "bodies");

    this.initPhysics();
}

PhysicsSimulator.prototype.evaluate = function()
{
    var timeIncrement = this.timeIncrement.getValueDirect() * this.timeScale.getValueDirect();
    this.stepSimulation(timeIncrement, 10);

    // add/remove bodies based on selection state (allows for object inspection)
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        switch (this.isSelected(this.bodyModels[i]))
        {
            case 0:
                // unselected
                {
                    // if not added, restore
                    if (!this.bodyAdded[i])
                    {
                        // it's unclear why every model needs to be updated here, but if this step is not taken, 
                        // other models might not react to the changes from the unselected model
                        for (var j = 0; j < this.physicsBodies.length; j++)
                        {
                            this.updatePhysicsBody(j);
                        }
                    }
                }
                break;

            case 1:
                // selected
                {
                    // stop positional updates
                    this.bodyAdded[i] = false;
                }
                break;
        }
    }
    
    var trans = new Ammo.btTransform();
    var worldHalfExtents = this.worldHalfExtents.getValueDirect();
    var modelsOutOfBounds = [];
    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        if (!this.bodyAdded[i])
            continue;

        this.physicsBodies[i].getMotionState().getWorldTransform(trans);
        var origin = trans.getOrigin();
        var position = new Vector3D(origin.x(), origin.y(), origin.z());

        var rot = trans.getRotation();
        var quat = new Quaternion();
        quat.load(rot.w(), rot.x(), rot.y(), rot.z());

        this.bodyModels[i].getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);
        this.bodyModels[i].getAttribute("quaternion").setValueDirect(quat);
        
        // if object has moved outside of the world boundary, remove it from the simulation (memory errors occur when positions become too large)
        if (position.x < -worldHalfExtents.x || position.x > worldHalfExtents.x ||
            position.y < -worldHalfExtents.y || position.y > worldHalfExtents.y ||
            position.z < -worldHalfExtents.z || position.z > worldHalfExtents.z)
        {
            modelsOutOfBounds.push(this.bodyModels[i]);      
        }
    }
    
    // remove any models that have moved outside of the world boundary (memory errors occur when positions become too large)
    for (var i = 0; i < modelsOutOfBounds.length; i++)
    {
        this.remove(modelsOutOfBounds[i]);
    }
}

PhysicsSimulator.prototype.update = function()
{
    if (this.updateWorld)
    {
        this.updateWorld = false;
        this.initPhysics();
    }

    if (this.updateBodies)
    {
        this.updateBodies = false;
        this.updatePhysicsBodies();
    }
}

PhysicsSimulator.prototype.stepSimulation = function(timeIncrement)
{
    this.update();
    this.world.stepSimulation(timeIncrement, 10);
}

PhysicsSimulator.prototype.getColliders = function(model)
{
    var colliders = [];

    // if model is parented, get parent
    while (model.motionParent)
    {
        model = model.motionParent;
    }

    // find physics body corresponding to model
    var physicsBody = this.getPhysicsBody(model);
    if (physicsBody)
    {
        var numManifolds = this.world.getDispatcher().getNumManifolds();
        for (var i = 0; i < numManifolds; i++)
        {
            var contactManifold = this.world.getDispatcher().getManifoldByIndexInternal(i);
            var body0 = contactManifold.getBody0();
            var body1 = contactManifold.getBody1();
            
            var distance = FLT_MAX;
            var numContacts = contactManifold.getNumContacts();
            for (var j = 0; j < numContacts; j++)
            {
                var pt = contactManifold.getContactPoint(j);
                var ptA = pt.getPositionWorldOnA();
                var ptB = pt.getPositionWorldOnB();

                var distance = Math.min(distanceBetween(new Vector3D(ptA.x(), ptA.y(), ptA.z()), new Vector3D(ptB.x(), ptB.y(), ptB.z()), distance));
                //console.log(distance);               
            }
            
            //if (distance < 0.05)
            {
                if (body0.ptr == physicsBody.ptr)
                {
                    colliders.push(this.getBodyModel(body1));
                }
                else if (body1.ptr == physicsBody.ptr)
                {
                    colliders.push(this.getBodyModel(body0));
                }
            }
        }
    }

    return colliders;
}
               
PhysicsSimulator.prototype.getPhysicsBody = function(bodyModel)
{
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == bodyModel)
        {
            return this.physicsBodies[i];
        }
    }

    return null;
}

PhysicsSimulator.prototype.getBodyModel = function(physicsBody)
{
    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        if (this.physicsBodies[i].ptr == physicsBody.ptr)
        {
            return this.bodyModels[i];
        }
    }

    return null;
}

PhysicsSimulator.prototype.isSelected = function(model)
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

PhysicsSimulator.prototype.updatePhysicsBodies = function()
{
    // clear modified CBs
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        this.bodyModels[i].getAttribute("scale").removeModifiedCB(PhysicsSimulator_ModelScaleModifiedCB, this);
        this.bodyModels[i].getAttribute("parent").removeModifiedCB(PhysicsSimulator_ModelParentModifiedCB, this);
    }

    // reset bodies
    this.initPhysics();
    this.physicsBodies = [];
    this.physicsShapes = [];
    this.bodyAdded = [];
    this.bodyModels = [];

    // add bodies to world
    for (var i = 0; i < this.bodies.Size(); i++)
    {
        var name = this.bodies.getAt(i);
        var model = this.registry.find(name.getValueDirect().join(""));
        if (!model)
            continue;

        // watch for changes in scale
        model.getAttribute("scale").addModifiedCB(PhysicsSimulator_ModelScaleModifiedCB, this);
        // watch for changes in parent
        model.getAttribute("parent").addModifiedCB(PhysicsSimulator_ModelParentModifiedCB, this);

        // if model is parented, don't add here; it will be added as a shape to the parent model's body
        if (model.motionParent)
            continue;

        var shape = this.getCompoundShape(model);

        var mass = this.getNetMass(model);

        var transform = new Ammo.btTransform();
        transform.setIdentity();

        var position = model.getAttribute("sectorPosition").getValueDirect();
        // temporary fix to remove y-axis padding between static and dynamic objects
        if (mass == 0)
        {
            position.y -= 0.075;
        }
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

        var rotation = model.getAttribute("rotation").getValueDirect();
        var quat = new Quaternion();
        quat.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        var isDynamic = (mass != 0);
        var localInertia = new Ammo.btVector3(0, 0, 0);
        if (isDynamic)
        {
            shape.calculateLocalInertia(mass, localInertia);
        }

        var motionState = new Ammo.btDefaultMotionState(transform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        this.world.addRigidBody(body);
        //if (isDynamic)
        {
            this.bodyModels.push(model);
            this.physicsShapes.push(shape);
            this.physicsBodies.push(body);
            this.bodyAdded.push(true);
        }
    }
}

PhysicsSimulator.prototype.getCompoundShape = function(model)
{
    var compoundShape = new Ammo.btCompoundShape();

    this.addCollisionShape(model, model.getAttribute("scale").getValueDirect(), compoundShape);

    return compoundShape;
}

PhysicsSimulator.prototype.addCollisionShape = function(model, scale, compoundShape)
{
    var shape = this.getCollisionShape(model, scale);

    var transform = new Ammo.btTransform();
    transform.setIdentity();

    compoundShape.addChildShape(transform, shape);

    // recurse on motion children
    for (var i = 0; i < model.motionChildren.length; i++)
    {
        var child = model.motionChildren[i];
        var childScale = child.getAttribute("scale").getValueDirect();
        childScale.x *= scale.x;
        childScale.y *= scale.y;
        childScale.z *= scale.z;

        this.addCollisionShape(child, childScale, compoundShape);
    }
}

PhysicsSimulator.prototype.getCollisionShape = function(model, scale)
{
    // scale vertices
    var scaleMatrix = new Matrix4x4();
    scaleMatrix.loadScale(scale.x, scale.y, scale.z);

    // set local transform for motion children
    var translationMatrix = new Matrix4x4();
    var rotationMatrix = new Matrix4x4();
    var pivotMatrix = new Matrix4x4();
    if (model.motionParent)
    {
        var position = model.getAttribute("sectorPosition").getValueDirect();
        translationMatrix.loadTranslation(position.x, position.y, position.z);

        var rotation = model.getAttribute("rotation").getValueDirect();
        rotationMatrix.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);

        var pivot = model.getAttribute("pivot").getValueDirect();
        pivotMatrix.loadTranslation(-pivot.x, -pivot.y, -pivot.z);
    }

    var matrix = new Matrix4x4();
    matrix.loadMatrix(scaleMatrix.leftMultiply(pivotMatrix.multiply(rotationMatrix.multiply(translationMatrix))));

    var shape = new Ammo.btConvexHullShape();
    var verts = model.getAttribute("vertices").getValueDirect();
    for (var i = 0; i < verts.length; i += 3)
    {
        var vert = matrix.transform(verts[i], verts[i + 1], verts[i + 2], 1);
        shape.addPoint(new Ammo.btVector3(vert.x, vert.y, vert.z));
    }

    return shape;
}

PhysicsSimulator.prototype.getNetMass = function(model)
{
    var mass = 0;

    // calculate scaled mass for model
    var scale = model.getAttribute("scale").getValueDirect();
    var avgScale = (scale.x + scale.y + scale.z) / 3;
    var physicalProperties = model.getAttribute("physicalProperties");
    var mass = physicalProperties.getAttribute("mass").getValueDirect() * avgScale;

    // add children's mass (if any)
    for (var i = 0; i < model.motionChildren.length; i++)
    {
        mass += this.getNetMass(model.motionChildren[i]);
    }

    return mass;
}

PhysicsSimulator.prototype.updatePhysicsShape = function(model)
{
    // locate array position of body
    var n = -1;
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == model)
        {
            n = i;
            break;
        }
    }
    if (n == -1)
        return;

    var shape = this.getCompoundShape(model);

    var mass = this.getNetMass(model);

    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(mass, localInertia);
    }

    var motionState = this.physicsBodies[n].getMotionState();
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    // remove previous before adding
    this.world.removeRigidBody(this.physicsBodies[n]);
    this.world.addRigidBody(body);
    this.physicsBodies[n] = body;
    this.physicsShapes[n] = shape;
}

PhysicsSimulator.prototype.updatePhysicsBody = function(n)
{
    this.removePhysicsBody(n);
    this.restorePhysicsBody(n);
}

PhysicsSimulator.prototype.removePhysicsBody = function(n)
{
    var body = this.physicsBodies[n];
    if (!body)
        return;

    this.world.removeRigidBody(body);
    this.bodyAdded[n] = false;
}

PhysicsSimulator.prototype.restorePhysicsBody = function(n)
{
    var model = this.bodyModels[n];
    if (!model)
        return;
    var shape = this.physicsShapes[n];
    if (!shape)
        return;

    var transform = new Ammo.btTransform();
    transform.setIdentity();

    var position = model.getAttribute("sectorPosition").getValueDirect();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

    // update rotation to include rotation caused by object inspection
    var rotationGroup = getInspectionGroup(model);
    if (rotationGroup)
    {
        var rotationQuat = rotationGroup.getChild(2).getAttribute("rotationQuat").getValueDirect();
        var quat1 = new Quaternion();
        quat1.load(rotationQuat.w, rotationQuat.x, rotationQuat.y, rotationQuat.z);

        var modelQuat = model.getAttribute("quaternion").getValueDirect();
        var quat2 = new Quaternion();
        quat2.load(modelQuat.w, modelQuat.x, modelQuat.y, modelQuat.z);

        var quat = quat2.multiply(quat1);

        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        // clear inspection group's rotation
        rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(new Quaternion());
    }

    var mass = this.getNetMass(model);

    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(mass, localInertia);
    }

    var motionState = new Ammo.btDefaultMotionState(transform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    this.world.addRigidBody(body);
    this.physicsBodies[n] = body;
    this.bodyAdded[n] = true;
}

PhysicsSimulator.prototype.initPhysics = function()
{
    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

    var gravity = this.gravity.getValueDirect();
    this.world.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));
}

PhysicsSimulator.prototype.remove = function(model)
{
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == model)
        {
            this.world.removeRigidBody(this.physicsBodies[i]);
            // don't notify modified CB
            this.bodies.removeModifiedCB(PhysicsSimulator_BodiesModifiedCB, this);
            this.physicsBodies.splice(i, 1);
            this.physicsShapes.splice(i, 1);
            this.bodyModels.splice(i, 1);
            this.bodyAdded.splice(i, 1);
            this.bodies.addModifiedCB(PhysicsSimulator_BodiesModifiedCB, this);
            return;
        }
    }
}

function PhysicsSimulator_GravityModifiedCB(attribute, container)
{
    container.updateWorld = true;
}

function PhysicsSimulator_BodiesModifiedCB(attribute, container)
{
    container.updateBodies = true;
}

function PhysicsSimulator_ModelScaleModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function PhysicsSimulator_ModelParentModifiedCB(attribute, container)
{
    container.updateBodies = true;
}
