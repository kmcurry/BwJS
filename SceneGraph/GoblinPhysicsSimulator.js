GoblinPhysicsSimulator.prototype = new Evaluator();
GoblinPhysicsSimulator.prototype.constructor = GoblinPhysicsSimulator;

function GoblinPhysicsSimulator()
{
    Evaluator.call(this);
    this.className = "GoblinPhysicsSimulator";
    this.attrType = eAttrType.GoblinPhysicsSimulator;

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

    this.timeIncrement = new NumberAttr(0);
    this.timeScale = new NumberAttr(1);
    this.gravity = new Vector3DAttr(0, -9.8, 0);
    this.worldHalfExtents = new Vector3DAttr(10000, 10000, 10000); // TODO: does this need to be configurable? 
    this.bodies = new AttributeVector(new StringAttrAllocator());

    this.bodies.getAttribute("appendParsedElements").setValueDirect(true);

    this.gravity.addModifiedCB(GoblinPhysicsSimulator_GravityModifiedCB, this);
    this.bodies.addModifiedCB(GoblinPhysicsSimulator_BodiesModifiedCB, this);

    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.timeScale, "timeScale");
    this.registerAttribute(this.gravity, "gravity");
    this.registerAttribute(this.worldHalfExtents, "worldHalfExtents");
    this.registerAttribute(this.bodies, "bodies");

    this.initPhysics();
}

GoblinPhysicsSimulator.prototype.evaluate = function()
{
    var timeIncrement = this.timeIncrement.getValueDirect() * this.timeScale.getValueDirect();
    this.stepSimulation(timeIncrement);

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
                        this.updatePhysicsBody(i);
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
        var physicsEnabled = this.bodyModels[i].physicsEnabled.getValueDirect();
        if (!this.bodyAdded[i] || !physicsEnabled)
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
    Ammo.destroy(trans);

    // remove any models that have moved outside of the world boundary
    for (var i = 0; i < modelsOutOfBounds.length; i++)
    {
        this.deletePhysicsBody(modelsOutOfBounds[i]);
    }
}

GoblinPhysicsSimulator.prototype.update = function()
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
    }
}

GoblinPhysicsSimulator.prototype.stepSimulation = function(timeIncrement, maxSubSteps)
{
    maxSubSteps = maxSubSteps || 10;
    
    this.update();
    this.world.stepSimulation(timeIncrement, maxSubSteps);
}

GoblinPhysicsSimulator.prototype.isColliding = function(model)
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

GoblinPhysicsSimulator.prototype.getColliders = function(model)
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

GoblinPhysicsSimulator.prototype.getPhysicsBody = function(bodyModel)
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

GoblinPhysicsSimulator.prototype.getBodyModel = function(physicsBody)
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

GoblinPhysicsSimulator.prototype.isSelected = function(model)
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

GoblinPhysicsSimulator.prototype.updatePhysicsBodies = function()
{
    // remove existing bodies
    while (this.bodyModels.length > 0)
    {
        this.deletePhysicsBody(this.bodyModels[0]);
    }

    // add bodies to world (if not already present)
    for (var i = 0; i < this.bodies.Size(); i++)
    {
        var name = this.bodies.getAt(i).getValueDirect().join("");
        var model = this.registry.find(name);
        if (model)
        {
            this.createPhysicsBody(model);
        }
    }
}

GoblinPhysicsSimulator.prototype.createPhysicsBody = function(model)
{
    if (!model)
        return;

    // watch for changes in vertices
    model.getAttribute("vertices").addModifiedCB(GoblinPhysicsSimulator_ModelVerticesModifiedCB, this);
    // watch for changes in scale
    model.getAttribute("scale").addModifiedCB(GoblinPhysicsSimulator_ModelScaleModifiedCB, this);
    // watch for changes in parent
    model.getAttribute("parent").addModifiedCB(GoblinPhysicsSimulator_ModelParentModifiedCB, this);
    // watch for changes in enabled
    model.getAttribute("enabled").removeModifiedCB(GoblinPhysicsSimulator_ModelEnabledModifiedCB, this); // ensure no dups (not removed by delete)
    model.getAttribute("enabled").addModifiedCB(GoblinPhysicsSimulator_ModelEnabledModifiedCB, this);

    // if model is disabled, don't create
    if (model.getAttribute("enabled").getValueDirect() == false)
        return;
    
    // if model is parented, don't add here; it will be added as a shape to the parent model's body
    if (model.motionParent)
        return;

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
    var vector = new Ammo.btVector3(position.x, position.y, position.z);
    transform.setOrigin(vector);
    Ammo.destroy(vector);

    var quat = model.getAttribute("quaternion").getValueDirect();
    var quaternion = new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
    transform.setRotation(quaternion);
    Ammo.destroy(quaternion);

    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(mass, localInertia);
    }

    var motionState = new Ammo.btDefaultMotionState(transform);
    Ammo.destroy(transform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
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

GoblinPhysicsSimulator.prototype.deletePhysicsBody = function(model)
{
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == model)
        {
            this.bodyModels[i].getAttribute("vertices").removeModifiedCB(GoblinPhysicsSimulator_ModelVerticesModifiedCB, this);
            this.bodyModels[i].getAttribute("scale").removeModifiedCB(GoblinPhysicsSimulator_ModelScaleModifiedCB, this);
            this.bodyModels[i].getAttribute("parent").removeModifiedCB(GoblinPhysicsSimulator_ModelParentModifiedCB, this);
            //this.bodyModels[i].getAttribute("enabled").removeModifiedCB(GoblinPhysicsSimulator_ModelEnabledModifiedCB, this);
            this.world.removeRigidBody(this.physicsBodies[i]);
            Ammo.destroy(this.physicsShapes[i]);
            Ammo.destroy(this.physicsBodies[i].getMotionState());
            Ammo.destroy(this.physicsBodies[i]);
            this.physicsBodies.splice(i, 1);
            this.physicsShapes.splice(i, 1);
            this.bodyModels.splice(i, 1);
            this.bodyAdded.splice(i, 1);
            return;
        }
    }
}

GoblinPhysicsSimulator.prototype.getCompoundShape = function(model)
{
    var compoundShape = new Ammo.btCompoundShape();

    var position = new Vector3D();
    var rotation = new Vector3D();
    var scale = model.getAttribute("scale").getValueDirect();
    this.addCollisionShape(model, position, rotation, scale, compoundShape);

    return compoundShape;
}

GoblinPhysicsSimulator.prototype.addCollisionShape = function(model, position, rotation, scale, compoundShape)
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

GoblinPhysicsSimulator.prototype.getCollisionShape = function(surface, center, scale)
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

GoblinPhysicsSimulator.prototype.getNetMass = function(model)
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

GoblinPhysicsSimulator.prototype.updatePhysicsShape = function(model)
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

    var mass = this.getNetMass(model);

    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        shape.calculateLocalInertia(mass, localInertia);
    }

    var motionState = this.physicsBodies[n].getMotionState();
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
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

GoblinPhysicsSimulator.prototype.updatePhysicsBody = function(n)
{
    this.removePhysicsBody(n);
    this.restorePhysicsBody(n);
}

GoblinPhysicsSimulator.prototype.removePhysicsBody = function(n)
{
    //if (!this.bodyAdded[n]) 
    //    return; // don't re-remove
    
    var body = this.physicsBodies[n];
    if (!body)
        return;

    this.world.removeRigidBody(body);
    Ammo.destroy(body.getMotionState());
    Ammo.destroy(body);
    this.bodyAdded[n] = false;
}

GoblinPhysicsSimulator.prototype.restorePhysicsBody = function(n)
{
    //if (this.bodyAdded[n]) 
    //    return; // don't re-restore
    
    var model = this.bodyModels[n];
    if (!model)
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
    Ammo.destroy(transform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    Ammo.destroy(localInertia);
    var body = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);

    this.world.addRigidBody(body);
    this.physicsBodies[n] = body;
    this.bodyAdded[n] = true;
}

GoblinPhysicsSimulator.prototype.initPhysics = function()
{
    this.world = new Goblin.World(new Goblin.BasicBroadphase(), new Goblin.NarrowPhase(), new Goblin.IterativeSolver());

    var gravity = this.gravity.getValueDirect();
    this.world.gravity.x = gravity.x;
    this.world.gravity.y = gravity.y;
    this.world.gravity.z = gravity.z;
}

GoblinPhysicsSimulator.prototype.bodiesModified = function()
{
    this.updateBodies = true;
}

GoblinPhysicsSimulator.prototype.modelEnabledModified = function(model, enabled)
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

function GoblinPhysicsSimulator_GravityModifiedCB(attribute, container)
{
    container.updateWorld = true;
}

function GoblinPhysicsSimulator_BodiesModifiedCB(attribute, container)
{
    container.bodiesModified();
}

function GoblinPhysicsSimulator_ModelVerticesModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function GoblinPhysicsSimulator_ModelScaleModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function GoblinPhysicsSimulator_ModelParentModifiedCB(attribute, container)
{
    container.updateBodies = true;
}

function GoblinPhysicsSimulator_ModelEnabledModifiedCB(attribute, container)
{
    container.modelEnabledModified(attribute.getContainer(), attribute.getValueDirect());
}
