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
    this.gravity = new Vector3DAttr(0, -9.8, 0);
    this.groundHalfExtents = new Vector3DAttr(0, 0, 0);
    this.bodies = new AttributeVector(new StringAttrAllocator());

    this.bodies.getAttribute("appendParsedElements").setValueDirect(true);

    this.gravity.addModifiedCB(PhysicsSimulator_GravityModifiedCB, this);
    this.groundHalfExtents.addModifiedCB(PhysicsSimulator_GroundHalfExtentsCB, this);
    this.bodies.addModifiedCB(PhysicsSimulator_BodiesModifiedCB, this);

    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.gravity, "gravity");
    this.registerAttribute(this.groundHalfExtents, "groundHalfExtents");
    this.registerAttribute(this.bodies, "bodies");

    this.initPhysics();
}

PhysicsSimulator.prototype.evaluate = function()
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

    // add/remove bodies based on selection state (allows for object inspection)
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        switch (this.bodyModels[i].getAttribute("selected").getValueDirect())
        {
            case 0: // unselected
                {
                    // if not added, restore
                    if (!this.bodyAdded[i])
                    {
                        this.restorePhysicsBody(i);
                        this.bodyAdded[i] = true;
                    }
                }
                break;

            case 1: // selected
                {
                    // if added, remove
                    if (this.bodyAdded[i])
                    {
                        this.world.removeRigidBody(this.physicsBodies[i]);
                        this.bodyAdded[i] = false;
                    }
                }
                break;
        }
    }

    var timeIncrement = this.timeIncrement.getValueDirect();
    this.world.stepSimulation(timeIncrement, 10);

    var trans = new Ammo.btTransform();
    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        if (!this.bodyAdded[i]) continue;
        
        this.physicsBodies[i].getMotionState().getWorldTransform(trans);
        var origin = trans.getOrigin();
        var position = new Vector3D(origin.x(), origin.y(), origin.z());

        var rot = trans.getRotation();
        var quat = new Quaternion();
        quat.load(rot.w(), rot.x(), rot.y(), rot.z());

        this.bodyModels[i].getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);
        this.bodyModels[i].getAttribute("quaternion").setValueDirect(quat);
    }
}

PhysicsSimulator.prototype.updatePhysicsBodies = function()
{
    // reset bodies
    this.initPhysics();
    this.physicsBodies = [];
    this.physicsShapes = [];
    this.bodyAdded = [];
    this.bodyModels = [];

    // add bodies to world
    for (var b = 0; b < this.bodies.Size(); b++)
    {
        var body = this.registry.find(this.bodies.getAt(b).getValueDirect().join(""));
        if (!body)
            continue;
        this.bodyModels.push(body);

        var colShape = new Ammo.btConvexHullShape();
        var verts = body.getAttribute("vertices").getValueDirect();
        for (var i = 0; i < verts.length; i += 3)
        {
            colShape.addPoint(new Ammo.btVector3(verts[i], verts[i + 1], verts[i + 2]));
        }
        this.physicsShapes.push(colShape);

        var startTransform = new Ammo.btTransform();
        startTransform.setIdentity();

        var position = body.getAttribute("sectorPosition").getValueDirect();
        startTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

        var rotation = body.getAttribute("rotation").getValueDirect();
        var quat = new Quaternion();
        quat.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);
        startTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        // TODO: scale

        var physicalProperties = body.getAttribute("physicalProperties");
        var mass = physicalProperties.getAttribute("mass").getValueDirect();
        
        var isDynamic = (mass != 0);
        var localInertia = new Ammo.btVector3(0, 0, 0);
        if (isDynamic)
            colShape.calculateLocalInertia(mass, localInertia);

        var motionState = new Ammo.btDefaultMotionState(startTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        this.world.addRigidBody(body);
        this.physicsBodies.push(body);
        this.bodyAdded.push(true);
    }
}

PhysicsSimulator.prototype.restorePhysicsBody = function(n)
{
    var body = this.bodyModels[n];
    var shape = this.physicsShapes[n];
    
    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();

    var position = body.getAttribute("sectorPosition").getValueDirect();
    startTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

    // update rotation to include rotation caused by object inspection
    var rotationGroup = getInspectionGroup(body);
    if (rotationGroup)
    {
        var rotQuat = rotationGroup.getChild(2).getAttribute("rotationQuat").getValueDirect();
        var quat1 = new Quaternion();
        quat1.load(rotQuat.w, rotQuat.x, rotQuat.y, rotQuat.z);
        
        var bodyQuat = body.getAttribute("quaternion").getValueDirect();
        var quat2 = new Quaternion();
        quat2.load(bodyQuat.w, bodyQuat.x, bodyQuat.y, bodyQuat.z);
        
        var quat = quat2.multiply(quat1);
        
        startTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
                    
        // clear inspection group's rotation
        rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(new Quaternion());
    }

    // TODO: scale

    var physicalProperties = body.getAttribute("physicalProperties");
    var mass = physicalProperties.getAttribute("mass").getValueDirect();
        
    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
        shape.calculateLocalInertia(mass, localInertia);

    var motionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    this.world.addRigidBody(body);
    this.physicsBodies[n] = body;
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

    var groundHalfExtents = this.groundHalfExtents.getValueDirect();
    var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(groundHalfExtents.x, groundHalfExtents.y, groundHalfExtents.z));

    var groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -groundHalfExtents.y, 0));

    var mass = 0;
    var isDynamic = mass !== 0;
    var localInertia = new Ammo.btVector3(0, 0, 0);

    if (isDynamic)
        groundShape.calculateLocalInertia(mass, localInertia);

    var motionState = new Ammo.btDefaultMotionState(groundTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, groundShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    this.world.addRigidBody(body);
}

function PhysicsSimulator_GravityModifiedCB(attribute, container)
{
    container.updateWorld = true;
}

function PhysicsSimulator_GroundHalfExtentsCB(attribute, container)
{
    container.updateWorld = true;
}

function PhysicsSimulator_BodiesModifiedCB(attribute, container)
{
    container.updateBodies = true;
}