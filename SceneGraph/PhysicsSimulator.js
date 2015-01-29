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
    this.world.step(timeIncrement);

    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        var position = this.physicsBodies[i].position;
        var quaternion = this.physicsBodies[i].quaternion;

        //meshes[i].position.copy(bodies[i].position);
        //meshes[i].quaternion.copy(bodies[i].quaternion);
        this.bodyModels[i].getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);
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

        var physicsBody = new CANNON.Body({mass: mass});
        this.physicsBodies.push(physicsBody);
        
        var tris = [];
        for (var i = 0; i < body.geometry.length; i++)
        {
            tris = tris.concat(body.geometry[i].getTriangles());
        }

        var verts = [];
        var faces = [];
        for (var i = 0, j = 0; i < tris.length; i++, j+=3)
        {
            var tri = tris[i];
            verts.push(new CANNON.Vec3(tri.v0.x, tri.v0.y, tri.v0.z));
            verts.push(new CANNON.Vec3(tri.v1.x, tri.v1.y, tri.v1.z));
            verts.push(new CANNON.Vec3(tri.v2.x, tri.v2.y, tri.v2.z));
            
            faces.push([j, j+1, j+2]);    
        }       
        var poly = new CANNON.Box(new CANNON.Vec3(0.25,0.25,0.25));//new CANNON.ConvexPolyhedron(verts, faces);
        var position = body.getAttribute("sectorPosition").getValueDirect();
        physicsBody.position.set(position.x, position.y, position.z);
        // TODO: rotation
        physicsBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        //var z180 = new CANNON.Quaternion();
        //z180.setFromAxisAngle(new CANNON.Vec3(0,0,1),Math.PI);
        //physicsBody.quaternion = z180.mult(physicsBody.quaternion);
        physicsBody.addShape(poly);
        
        this.world.add(physicsBody);
    }
}

PhysicsSimulator.prototype.initPhysics = function()
{
    this.world = new CANNON.World();

    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;

    var gravity = this.gravity.getValueDirect();
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);

    this.world.broadphase = new CANNON.NaiveBroadphase();

    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({mass: 0});
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.add(groundBody);
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