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
        switch (this.isSelected(this.bodyModels[i]))
        {
            case 0:
                // unselected
                {
                    // if not added, restore
                    if (!this.bodyAdded[i])
                    {
                        this.restorePhysicsBody(i);
                        this.bodyAdded[i] = true;
                    }
                }
                break;

            case 1:
                // selected
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
    }
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
        model.getAttribute("scale").removeModifiedCB(PhysicsSimulator_ModelScaleModifiedCB, this);
        model.getAttribute("parent").removeModifiedCB(PhysicsSimulator_ModelParentModifiedCB, this);
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
        var model = this.registry.find(this.bodies.getAt(i).getValueDirect().join(""));
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
        
        var physicalProperties = model.getAttribute("physicalProperties");
        var mass = physicalProperties.getAttribute("mass").getValueDirect();

        var startTransform = new Ammo.btTransform();
        startTransform.setIdentity();
        
        var position = model.getAttribute("sectorPosition").getValueDirect();
        // temporary fix to remove y-axis padding between static and dynamic objects
        if (mass == 0)
        {
            position.y -= 0.075;
        }
        startTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

        var rotation = model.getAttribute("rotation").getValueDirect();
        var quat = new Quaternion();
        quat.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);
        startTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        
        var isDynamic = (mass != 0);
        var localInertia = new Ammo.btVector3(0, 0, 0);
        if (isDynamic)
        {
            shape.calculateLocalInertia(mass, localInertia);
        }

        var motionState = new Ammo.btDefaultMotionState(startTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        var physicsBody = new Ammo.btRigidBody(rbInfo);

        this.world.addRigidBody(physicsBody);
        if (isDynamic)
        {
            this.bodyModels.push(model);
            this.physicsShapes.push(shape);
            this.physicsBodies.push(physicsBody);
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
    matrix.loadMatrix(pivotMatrix.multiply(rotationMatrix.multiply(translationMatrix)));
    
    var shape = new Ammo.btConvexHullShape();
    var verts = model.getAttribute("vertices").getValueDirect();
    for (var i = 0; i < verts.length; i += 3)
    {
        var scaledVerts = matrix.transform(verts[i], verts[i + 1], verts[i + 2], 1);
        var xformedVerts = scaleMatrix.transform(scaledVerts.x, scaledVerts.y, scaledVerts.z, 1);
        shape.addPoint(new Ammo.btVector3(xformedVerts.x, xformedVerts.y, xformedVerts.z));
    }
    
    return shape;
}

PhysicsSimulator.prototype.updatePhysicsShape = function(body)
{
    // locate array position of body
    var n = -1;
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == body)
        {
            n = i;
            break;
        }
    }
    if (n == -1)
        return;

    // scale vertices
    var scaleMatrix = new Matrix4x4();
    var scale = body.getAttribute("scale").getValueDirect();
    scaleMatrix.loadScale(scale.x, scale.y, scale.z);

    var physicsShape = new Ammo.btConvexHullShape();
    var verts = body.getAttribute("vertices").getValueDirect();
    for (var i = 0; i < verts.length; i += 3)
    {
        var scaledVerts = scaleMatrix.transform(verts[i], verts[i + 1], verts[i + 2], 1);
        physicsShape.addPoint(new Ammo.btVector3(scaledVerts.x, scaledVerts.y, scaledVerts.z));
    }

    var physicalProperties = body.getAttribute("physicalProperties");
    var mass = physicalProperties.getAttribute("mass").getValueDirect();

    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        physicsShape.calculateLocalInertia(mass, localInertia);
    }

    var motionState = this.physicsBodies[n].getMotionState();
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    var physicsBody = new Ammo.btRigidBody(rbInfo);

    this.world.removeRigidBody(this.physicsBodies[n]);
    // remove previous
    this.world.addRigidBody(physicsBody);
    this.physicsBodies[n] = physicsBody;
    this.physicsShapes[n] = physicsShape;
}

PhysicsSimulator.prototype.restorePhysicsBody = function(n)
{
    var body = this.bodyModels[n];
    var physicsShape = this.physicsShapes[n];

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

    var physicalProperties = body.getAttribute("physicalProperties");
    var mass = physicalProperties.getAttribute("mass").getValueDirect();

    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
    {
        physicsShape.calculateLocalInertia(mass, localInertia);
    }

    var motionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    var physicsBody = new Ammo.btRigidBody(rbInfo);

    this.world.addRigidBody(physicsBody);
    this.physicsBodies[n] = physicsBody;
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

PhysicsSimulator.prototype.addSocketConnectorsModifiedCBs = function(model)
{
    var socketConnectors = model.getAttribute("socketConnectors");
    if (socketConnectors)
    {
        for (var i = 0; i < socketConnectors.Size(); i++)
        {
            var socketConnector = socketConnectors.getAt(i);
            socketConnector.getAttribute("connected").addModifiedCB(PhysicsSimulator_ModelSocketConnectorModifiedCB, this);
        }
    }
}

PhysicsSimulator.prototype.removeSocketConnectorsModifiedCBs = function(model)
{
    var socketConnectors = model.getAttribute("socketConnectors");
    if (socketConnectors)
    {
        for (var i = 0; i < socketConnectors.Size(); i++)
        {
            var socketConnector = socketConnectors.getAt(i);
            socketConnector.getAttribute("connected").removeModifiedCB(PhysicsSimulator_ModelSocketConnectorModifiedCB, this);
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
