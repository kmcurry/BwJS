PhysicsSimulator.prototype = new Evaluator();
PhysicsSimulator.prototype.constructor = PhysicsSimulator;

function PhysicsSimulator()
{
    Evaluator.call(this);
    this.className = "PhysicsSimulator";
    this.attrType = eAttrType.PhysicsSimulator;

    this.collisionConfiguration = null;
    this.dispatcher = null;
    this.overlappingPairCache = null;
    this.solver = null;
    this.world = null;
    this.physicsBodies = [];
    this.physicsShapes = [];
    this.bodyAdded = [];
    this.bodyModels = [];
    this.updateWorld = false;
    this.updateBodies = false;
    this.updateBodyPositions = [];
    this.lastBodies = [];

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
    // add/remove bodies based on selection state (allows for object inspection)
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        switch (this.isSelected(this.bodyModels[i]))
        {
            case 0:
                // unselected
                {
                    // if not added, update its position and add
                    if (!this.bodyAdded[i])
                    {
                        this.bodyAdded[i] = true;
                        this.updatePhysicsBodyPosition(i);
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

    var timeIncrement = this.timeIncrement.getValueDirect() * this.timeScale.getValueDirect();
    this.stepSimulation(timeIncrement);
    
    var trans = new
    Ammo.btTransform();
    var worldHalfExtents = this.worldHalfExtents.getValueDirect();
    var modelsOutOfBounds = [];
    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        var physicsEnabled = this.bodyModels[i].physicsEnabled.getValueDirect();
        if (!this.bodyAdded[i] || !physicsEnabled)
            continue;

        this.physicsBodies[i].getMotionState().getWorldTransform(trans);
        var origin = trans.getOrigin();
        var position = new Vector3D(origin.x(), origin.y(), origin.z());

        var rot = trans.getRotation();
        var quat = new Quaternion();
        quat.load(rot.w(), rot.x(), rot.y(), rot.z());

        this.bodyModels[i].getAttribute("position").removeModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this);
        //this.bodyModels[i].getAttribute("rotation").removeModifiedCB(PhysicsSimulator_ModelRotationModifiedCB, this);
        this.bodyModels[i].getAttribute("quaternion").removeModifiedCB(PhysicsSimulator_ModelQuaternionModifiedCB, this);
    
        this.bodyModels[i].getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);
        this.bodyModels[i].getAttribute("quaternion").setValueDirect(quat);

        this.bodyModels[i].getAttribute("position").addModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this);
        //this.bodyModels[i].getAttribute("rotation").addModifiedCB(PhysicsSimulator_ModelRotationModifiedCB, this);
        this.bodyModels[i].getAttribute("quaternion").addModifiedCB(PhysicsSimulator_ModelQuaternionModifiedCB, this);
        
        // if object has moved outside of the world boundary, remove it from the simulation (memory errors occur when positions become too large)
        if (position.x < -worldHalfExtents.x || position.x > worldHalfExtents.x ||
            position.y < -worldHalfExtents.y || position.y > worldHalfExtents.y ||
            position.z < -worldHalfExtents.z || position.z > worldHalfExtents.z)
        {
            modelsOutOfBounds.push(this.bodyModels[i]);
        }
    }
    Ammo.destroy(trans);

    // remove any models that have moved outside of the world boundary
    for (var i = 0; i < modelsOutOfBounds.length; i++)
    {
        this.deletePhysicsBody(modelsOutOfBounds[i]);
    }
}

PhysicsSimulator.prototype.update = function()
{
    if (this.updateWorld)
    {
        this.updateWorld = false;
        this.updateBodies = true;
        this.initPhysics();
    }

    if (this.updateBodies)
    {
        this.updateBodies = false;
        this.updatePhysicsBodies();
        
        this.lastBodies = [];
        for (var i = 0; i < this.bodies.Size(); i++)
        {
            this.lastBodies.push(this.bodies.getAt(i));
        }
    }
    
    while (this.updateBodyPositions.length > 0)
    {
        this.updatePhysicsBodyPosition(this.updateBodyPositions[0]);
    }
}

PhysicsSimulator.prototype.stepSimulation = function(timeIncrement, maxSubSteps)
{
    maxSubSteps = maxSubSteps || 10;
    
    this.update();
    this.world.stepSimulation(timeIncrement, maxSubSteps);
}

PhysicsSimulator.prototype.isColliding = function(model)
{
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
            
            //var distance = FLT_MAX;
            var numContacts = contactManifold.getNumContacts();
            /*for (var j = 0; j < numContacts; j++)
            {
                var pt = contactManifold.getContactPoint(j);
                var ptA = pt.getPositionWorldOnA();
                var ptB = pt.getPositionWorldOnB();

                var distance = Math.min(distanceBetween(new Vector3D(ptA.x(), ptA.y(), ptA.z()), new Vector3D(ptB.x(), ptB.y(), ptB.z()), distance));
                //console.log(distance);               
            }
            */
            //if (distance < 0.05)
            if (numContacts > 0)
            {
                if (body0.ptr == physicsBody.ptr)
                {
                    return true;
                }
                else if (body1.ptr == physicsBody.ptr)
                {
                    return true;
                }
            }
        }
    }

    return false;
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
            
            //var distance = FLT_MAX;
            var numContacts = contactManifold.getNumContacts();
            /*for (var j = 0; j < numContacts; j++)
            {
                var pt = contactManifold.getContactPoint(j);
                var ptA = pt.getPositionWorldOnA();
                var ptB = pt.getPositionWorldOnB();

                var distance = Math.min(distanceBetween(new Vector3D(ptA.x(), ptA.y(), ptA.z()), new Vector3D(ptB.x(), ptB.y(), ptB.z()), distance));
                //console.log(distance);               
            }
            */
            //if (distance < 0.05)
            if (numContacts > 0)
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

PhysicsSimulator.prototype.getPhysicsBodyIndex = function(bodyModel)
{
    return this.bodyModels.indexOf(bodyModel);
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
    var i;
    
    // determine changes between lastBodies and bodies
    var added = [];
    for (i = 0; i < this.bodies.Size(); i++)
    {
        var body = this.bodies.getAt(i);
        var index = this.lastBodies.indexOf(body);
        if (index < 0)
        {
            added.push(body);
        }
    }
    var removed = [];
    for (i = 0; i < this.lastBodies.length; i++)
    {
        var body = this.lastBodies[i];
        var index = this.bodies.indexOf(body);
        if (index < 0)
        {
            removed.push(this.bodyModels[i]);
        }
    }
    
    // remove any removed bodies
    for (i = 0; i < removed.length; i++)
    {
        this.deletePhysicsBody(removed[i]);
    }

    // add any added bodies to world
    for (var i = 0; i < added.length; i++)
    {
        var name = added[i].getValueDirect().join("");
        var model = this.registry.find(name);
        if (model)
        {
            this.createPhysicsBody(model);
        }
    }
}

PhysicsSimulator.prototype.createPhysicsBody = function(model)
{
    if (!model)
        return;

    // watch for changes in vertices
    model.getAttribute("vertices").addModifiedCB(PhysicsSimulator_ModelVerticesModifiedCB, this);
    model.getAttribute("position").addModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this);
    model.getAttribute("rotation").addModifiedCB(PhysicsSimulator_ModelRotationModifiedCB, this);
    model.getAttribute("quaternion").addModifiedCB(PhysicsSimulator_ModelQuaternionModifiedCB, this);
    // watch for changes in scale
    model.getAttribute("scale").addModifiedCB(PhysicsSimulator_ModelScaleModifiedCB, this);
    // watch for changes in parent
    model.getAttribute("parent").addModifiedCB(PhysicsSimulator_ModelParentModifiedCB, this);
    // watch for changes in enabled
    model.getAttribute("enabled").removeModifiedCB(PhysicsSimulator_ModelEnabledModifiedCB, this); // ensure no dups (not removed by delete)
    model.getAttribute("enabled").addModifiedCB(PhysicsSimulator_ModelEnabledModifiedCB, this);

    // if model is disabled, don't create
    if (model.getAttribute("enabled").getValueDirect() == false)
        return;
    
    // if model is parented, don't add here; it will be added as a shape to the parent model's body
    if (model.motionParent)
        return;

    var shape = this.getCompoundShape(model);

    var properties = this.getNetProperties(model);

    var transform = new Ammo.btTransform();
    transform.setIdentity();

    var position = model.getAttribute("sectorPosition").getValueDirect();
    // temporary fix to remove y-axis padding between static and dynamic objects
    if (properties.mass == 0)
    {
        position.y -= 0.075;
    }
    var vector = new Ammo.btVector3(position.x, position.y, position.z);
    transform.setOrigin(vector);
    Ammo.destroy(vector);

    var quat = model.getAttribute("quaternion").getValueDirect();
    var quaternion = new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
    transform.setRotation(quaternion);
    Ammo.destroy(quaternion);

    var isDynamic = (properties.mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(properties.mass, localInertia);
    }

    var motionState = new Ammo.btDefaultMotionState(transform);
    Ammo.destroy(transform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(properties.mass, motionState, shape, localInertia);
    rbInfo.set_m_friction(properties.friction);
    rbInfo.set_m_restitution(properties.restitution);
    Ammo.destroy(localInertia);
    var body = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);
    
    this.world.addRigidBody(body);
    //if (isDynamic)
    {
        this.bodyModels.push(model);
        this.physicsShapes.push(shape);
        this.physicsBodies.push(body);
        this.bodyAdded.push(true);
    }
}

PhysicsSimulator.prototype.deletePhysicsBodies = function()
{
    while (this.bodyModels.length > 0)
    {
        this.deletePhysicsBody(this.bodyModels[0]);
    }
}

PhysicsSimulator.prototype.deletePhysicsBody = function(model)
{
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == model)
        {
            this.bodyModels[i].getAttribute("vertices").removeModifiedCB(PhysicsSimulator_ModelVerticesModifiedCB, this);
            this.bodyModels[i].getAttribute("position").removeModifiedCB(PhysicsSimulator_ModelPositionModifiedCB, this);
            this.bodyModels[i].getAttribute("rotation").removeModifiedCB(PhysicsSimulator_ModelRotationModifiedCB, this);
            this.bodyModels[i].getAttribute("quaternion").removeModifiedCB(PhysicsSimulator_ModelQuaternionModifiedCB, this);
            this.bodyModels[i].getAttribute("scale").removeModifiedCB(PhysicsSimulator_ModelScaleModifiedCB, this);
            this.bodyModels[i].getAttribute("parent").removeModifiedCB(PhysicsSimulator_ModelParentModifiedCB, this);
            //this.bodyModels[i].getAttribute("enabled").removeModifiedCB(PhysicsSimulator_ModelEnabledModifiedCB, this);
            this.world.removeRigidBody(this.physicsBodies[i]);
            Ammo.destroy(this.physicsShapes[i]);
            Ammo.destroy(this.physicsBodies[i].getMotionState());
            Ammo.destroy(this.physicsBodies[i]);
            this.physicsBodies.splice(i, 1);
            this.physicsShapes.splice(i, 1);
            this.bodyModels.splice(i, 1);
            this.bodyAdded.splice(i, 1);
            this.bodies.removeElement(i);
            return;
        }
    }
}

PhysicsSimulator.prototype.getCompoundShape = function(model)
{
    var compoundShape = new Ammo.btCompoundShape();

    var position = new Vector3D();
    var rotation = new Vector3D();
    var scale = model.getAttribute("scale").getValueDirect();
    this.addCollisionShape(model, position, rotation, scale, compoundShape);

    return compoundShape;
}

PhysicsSimulator.prototype.addCollisionShape = function(model, position, rotation, scale, compoundShape)
{
    var center = model.getAttribute("center").getValueDirect();
    
    for (var i = 0; i < model.surfaces.length; i++)
    {
        var shape = this.getCollisionShape(model.surfaces[i], center, scale);

        var transform = new Ammo.btTransform();
        transform.setIdentity();
        var origin = new Ammo.btVector3(position.x, position.y, position.z);
        transform.setOrigin(origin);
        Ammo.destroy(origin);
        var quat = new Quaternion();
        quat.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);
        var quaternion = new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
        transform.setRotation(quaternion);
        Ammo.destroy(quaternion);

        compoundShape.addChildShape(transform, shape);
        Ammo.destroy(transform);
    }

    // recurse on motion children
    for (var i = 0; i < model.motionChildren.length; i++)
    {
        var child = model.motionChildren[i];

        var childPosition = child.getAttribute("position").getValueDirect();
        childPosition.x += position.x;
        childPosition.y += position.y;
        childPosition.z += position.z;

        var childRotation = child.getAttribute("rotation").getValueDirect();
        childRotation.x += rotation.x;
        childRotation.y += rotation.y;
        childRotation.z += rotation.z;

        var childScale = child.getAttribute("scale").getValueDirect();
        childScale.x *= scale.x;
        childScale.y *= scale.y;
        childScale.z *= scale.z;

        this.addCollisionShape(child, childPosition, childRotation, childScale, compoundShape);
    }
}

PhysicsSimulator.prototype.getCollisionShape = function(surface, center, scale)
{
    // scale vertices
    var scaleMatrix = new Matrix4x4();
    scaleMatrix.loadScale(scale.x, scale.y, scale.z);

    var matrix = scaleMatrix;
    
    var shape = new Ammo.btConvexHullShape();
    var verts = surface.getAttribute("vertices").getValueDirect();
    for (var i = 0; i < verts.length; i += 3)
    {
        //var vert = matrix.transform(verts[i] - center.x, verts[i + 1] /*- center.y*/, verts[i + 2] - center.z, 1);
        var vert = matrix.transform(verts[i], verts[i + 1], verts[i + 2], 1);
        var point = new Ammo.btVector3(vert.x, vert.y, vert.z);
        shape.addPoint(point);
        Ammo.destroy(point);
    }

    return shape;
}

PhysicsSimulator.prototype.getNetProperties = function(model)
{
    var mass = 0;  
    var friction = 0;
    var restitution = 0;

    // calculate scaled mass for model
    var scale = model.getAttribute("scale").getValueDirect();
    var avgScale = (scale.x + scale.y + scale.z) / 3;
    var physicalProperties = model.getAttribute("physicalProperties");
    var mass = physicalProperties.getAttribute("mass").getValueDirect() * avgScale;
    var friction = physicalProperties.getAttribute("friction").getValueDirect();
    var restitution = physicalProperties.getAttribute("restitution").getValueDirect();
    
    // add children's properties (if any)
    for (var i = 0; i < model.motionChildren.length; i++)
    {
        var childProperties = this.getNetProperties(model.motionChildren[i]);
        mass += childProperties.mass;
        friction += childProperties.friction;
        restitution += childProperties.restitution;
    }

    return { mass: mass, friction: friction, restitution: restitution };
}

PhysicsSimulator.prototype.updatePhysicsShape = function(model)
{
    // locate array position of model
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

    var properties = this.getNetProperties(model);

    var isDynamic = (properties.mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(properties.mass, localInertia);
    }

    var motionState = this.physicsBodies[n].getMotionState();
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(properties.mass, motionState, shape, localInertia);
    rbInfo.set_m_friction(properties.friction);
    rbInfo.set_m_restitution(properties.restitution);
    Ammo.destroy(localInertia);
    var body = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);

    // remove previous before adding
    this.world.removeRigidBody(this.physicsBodies[n]);
    Ammo.destroy(this.physicsBodies[n]);
    // don't destroy motionState because it's now being used by the new body

    this.world.addRigidBody(body);
    this.physicsBodies[n] = body;
    this.physicsShapes[n] = shape;
}

PhysicsSimulator.prototype.updatePhysicsBody = function(n)
{
    var model = this.bodyModels[n];
    if (!model)
        return;
    var body = this.physicsBodies[n];
    if (!body)
        return;
    var shape = this.physicsShapes[n];
    if (!shape)
        return;

    var transform = new Ammo.btTransform();
    transform.setIdentity();

    var position = model.getAttribute("sectorPosition").getValueDirect();
    var vector = new Ammo.btVector3(position.x, position.y, position.z);
    transform.setOrigin(vector);
    Ammo.destroy(vector);

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

        var quaternion = new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
        transform.setRotation(quaternion);
        Ammo.destroy(quaternion);
    }

    this.world.removeRigidBody(body);
    
    var properties = this.getNetProperties(model);

    var isDynamic = (properties.mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(properties.mass, localInertia);
    }

    var motionState = new Ammo.btDefaultMotionState(transform);
    Ammo.destroy(transform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(properties.mass, motionState, shape, localInertia);
    rbInfo.set_m_friction(properties.friction);
    rbInfo.set_m_restitution(properties.restitution);
    Ammo.destroy(localInertia);
    var body = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);

    this.world.addRigidBody(body);
    this.physicsBodies[n] = body;
}

PhysicsSimulator.prototype.updatePhysicsBodyPosition = function(n)
{
    var index = this.updateBodyPositions.indexOf(n);
    if (index >= 0)
    {
        this.updateBodyPositions.splice(index, 1);
    }
    
    if (!this.bodyAdded[n]) return;
    
    var model = this.bodyModels[n];
    if (!model)
        return;
    var body = this.physicsBodies[n];
    if (!body)
        return;
    
    var transform = new Ammo.btTransform();
    transform.setIdentity();

    var position = model.getAttribute("sectorPosition").getValueDirect();
    var vector = new Ammo.btVector3(position.x, position.y, position.z);
    transform.setOrigin(vector);
    Ammo.destroy(vector);

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

        var quaternion = new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
        transform.setRotation(quaternion);
        Ammo.destroy(quaternion);

        // clear inspection group's rotation
        rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(new Quaternion());
    }
    
    body.setWorldTransform(transform);
    body.getMotionState().setWorldTransform(transform);
    body.activate(true);
    Ammo.destroy(transform);
}

PhysicsSimulator.prototype.initPhysics = function()
{
    if (this.collisionConfiguration)
        Ammo.destroy(this.collisionConfiguration);
    if (this.dispatcher)
        Ammo.destroy(this.dispatcher);
    if (this.overlappingPairCache)
        Ammo.destroy(this.overlappingPairCache);
    if (this.solver)
        Ammo.destroy(this.solver);
    //if (this.world) Ammo.destroy(this.world);

    this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.overlappingPairCache = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);

    var gravity = this.gravity.getValueDirect();
    this.world.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));
}

PhysicsSimulator.prototype.bodiesModified = function()
{
    this.updateBodies = true;
}

PhysicsSimulator.prototype.modelEnabledModified = function(model, enabled)
{
    if (enabled)
    {
        this.deletePhysicsBody(model); // ensure model is not added multiple times
        this.createPhysicsBody(model);
    }
    else // !enabled
    {
        this.deletePhysicsBody(model);
    }
}

function PhysicsSimulator_GravityModifiedCB(attribute, container)
{
    container.updateWorld = true;
}

function PhysicsSimulator_BodiesModifiedCB(attribute, container)
{
    container.bodiesModified();
}

function PhysicsSimulator_ModelVerticesModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function PhysicsSimulator_ModelPositionModifiedCB(attribute, container)
{
    //container.updatePhysicsBodyPosition(container.getPhysicsBodyIndex(attribute.getContainer()));
    //container.updateBodyPositions.push(container.getPhysicsBodyIndex(attribute.getContainer()));
    var index = container.getPhysicsBodyIndex(attribute.getContainer());
    if (index >= 0)
    {
        if (container.updateBodyPositions.indexOf(index) == -1)
        {
            container.updateBodyPositions.push(index);
        }
    }
}

function PhysicsSimulator_ModelRotationModifiedCB(attribute, container)
{
    //container.updatePhysicsBodyPosition(container.getPhysicsBodyIndex(attribute.getContainer()));
    //container.updateBodyPositions.push(container.getPhysicsBodyIndex(attribute.getContainer()));
    var index = container.getPhysicsBodyIndex(attribute.getContainer());
    if (index >= 0)
    {
        if (container.updateBodyPositions.indexOf(index) == -1)
        {
            container.updateBodyPositions.push(index);
        }
    }
}

function PhysicsSimulator_ModelQuaternionModifiedCB(attribute, container)
{
    //container.updatePhysicsBodyPosition(container.getPhysicsBodyIndex(attribute.getContainer()));
    //container.updateBodyPositions.push(container.getPhysicsBodyIndex(attribute.getContainer()));
    var index = container.getPhysicsBodyIndex(attribute.getContainer());
    if (index >= 0)
    {
        if (container.updateBodyPositions.indexOf(index) == -1)
        {
            container.updateBodyPositions.push(index);
        }
    }
}

function PhysicsSimulator_ModelScaleModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function PhysicsSimulator_ModelParentModifiedCB(attribute, container)
{
    container.updateBodies = true;
}

function PhysicsSimulator_ModelEnabledModifiedCB(attribute, container)
{
    container.modelEnabledModified(attribute.getContainer(), attribute.getValueDirect());
}
