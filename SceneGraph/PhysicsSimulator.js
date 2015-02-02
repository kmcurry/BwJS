PhysicsSimulator.prototype = new Evaluator();
PhysicsSimulator.prototype.constructor = PhysicsSimulator;

function PhysicsSimulator()
{
    Evaluator.call(this);
    this.className = "PhysicsSimulator";
    this.attrType = eAttrType.PhysicsSimulator;

    this.world = null;
    this.physicsBodies = [];
    this.bodyModels = [];
    this.updateBodies = false;

    this.timeIncrement = new NumberAttr(0);
    this.gravity = new Vector3DAttr(0, -1.8, 0);
    this.bodies = new AttributeVector(new StringAttrAllocator());

    this.bodies.getAttribute("appendParsedElements").setValueDirect(true);

    this.gravity.addModifiedCB(PhysicsSimulator_GravityModifiedCB, this);
    this.bodies.addModifiedCB(PhysicsSimulator_BodiesModifiedCB, this);

    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.gravity, "gravity");
    this.registerAttribute(this.bodies, "bodies");

    this.initPhysics();
}

PhysicsSimulator.prototype.evaluate = function()
{
    if (this.updateBodies)
    {
        this.updateBodies = false;
        this.updatePhysicsBodies();
    }

    var timeIncrement = this.timeIncrement.getValueDirect();
    this.world.stepSimulation(timeIncrement, 10);

    var trans = new Ammo.btTransform();
    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        this.physicsBodies[i].getMotionState().getWorldTransform(trans);
        var position = new Vector3D(trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2));
        
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
    this.bodyModels = [];

    // add bodies to world
    for (var b = 0; b < this.bodies.Size(); b++)
    {
        var body = this.registry.find(this.bodies.getAt(b).getValueDirect().join(""));
        if (!body)
            continue;
        this.bodyModels.push(body);

        var physicalProperties = body.getAttribute("physicalProperties");
        var mass = physicalProperties.getAttribute("mass").getValueDirect();

        var colShape = new Ammo.btConvexHullShape();
        var verts = body.getAttribute("vertices").getValueDirect();
        for (var i = 0; i < verts.length; i += 3)
        {
            colShape.addPoint(new Ammo.btVector3(verts[i], verts[i + 1], verts[i + 2]));
        }       
        
        var startTransform = new Ammo.btTransform();
        startTransform.setIdentity();

        var position = body.getAttribute("sectorPosition").getValueDirect();
        startTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        // TODO: rotation, scale
        
        var isDynamic = (mass != 0);
        var localInertia = new Ammo.btVector3(0, 0, 0);
        if (isDynamic)
            colShape.calculateLocalInertia(mass, localInertia);
        
        var motionState = new Ammo.btDefaultMotionState(startTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        this.world.addRigidBody(body);
        this.physicsBodies.push(body);
    }
}

PhysicsSimulator.prototype.initPhysics = function()
{
    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    this.world.setGravity(new Ammo.btVector3(0, -9.8, 0));

    var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 0.1, 50));

    var groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -0.1, 0));

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
    var gravity = attribute.getValueDirect();
    container.world.gravity.set(gravity.x, gravity.y, gravity.z);
}

function PhysicsSimulator_BodiesModifiedCB(attribute, container)
{
    container.updateBodies = true;
}