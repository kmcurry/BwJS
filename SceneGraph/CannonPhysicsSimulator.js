CannonPhysicsSimulator.prototype = new Evaluator();
CannonPhysicsSimulator.prototype.constructor = CannonPhysicsSimulator;

function CannonPhysicsSimulator()
{
    Evaluator.call(this);
    this.className = "CannonPhysicsSimulator";
    this.attrType = eAttrType.CannonPhysicsSimulator;

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
    this.selector = null;

    this.timeIncrement = new NumberAttr(0);
    this.timeScale = new NumberAttr(1);
    this.gravity = new Vector3DAttr(0, -0.8, 0);
    this.worldHalfExtents = new Vector3DAttr(10000, 10000, 10000); // TODO: does this need to be configurable? 
    this.bodies = new AttributeVector(new StringAttrAllocator());

    this.bodies.getAttribute("appendParsedElements").setValueDirect(true);

    this.gravity.addModifiedCB(CannonPhysicsSimulator_GravityModifiedCB, this);
    this.bodies.addModifiedCB(CannonPhysicsSimulator_BodiesModifiedCB, this);
    this.enabled.addModifiedCB(CannonPhysicsSimulator_EnabledModifiedCB, this);

    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.timeScale, "timeScale");
    this.registerAttribute(this.gravity, "gravity");
    this.registerAttribute(this.worldHalfExtents, "worldHalfExtents");
    this.registerAttribute(this.bodies, "bodies");

    this.name.setValueDirect("CannonPhysicsSimulator");

    this.initPhysics();
}

CannonPhysicsSimulator.prototype.setRegistry = function(registry)
{
    // use Bridgeworks' physics simulator for collision detection
    var bworks = registry.find("Bridgeworks");
    this.selector = bworks.selector;
    
    // call base-class implementation
    SGDirective.prototype.setRegistry.call(this, registry);
}

CannonPhysicsSimulator.prototype.evaluate = function()
{
    if (!(this.enabled.getValueDirect()))
    {
        return;
    }
    
    this.evaluating = true;
    
    var selected = this.selector.selected;
    if (selected)
    {
        var index = this.getPhysicsBodyIndex(selected);
        if (index >= 0 && this.bodyAdded[index])
        {
            // stop positional updates 
            this.bodyAdded[index] = false;
        }
    }
    
    // add/remove bodies based on selection state (allows for object inspection)
    for (var i = 0; i < this.bodyAdded.length; i++)
    {
        // if not added, update its position and add
        if (!this.bodyAdded[i])
        {
            if (this.bodyModels[i] != selected)
            {
                this.bodyAdded[i] = true;
                if (this.bodyModels[i].physicsEnabled.getValueDirect())
                {
                    this.updatePhysicsBodyPosition(i, false);
                }
            }
        }
    }

    this.stepSimulation();
    
    //var worldHalfExtents = this.worldHalfExtents.getValueDirect();
    //var modelsOutOfBounds = [];
    for (var i = 0; i < this.physicsBodies.length; i++)
    {
        var physicsEnabled = this.bodyModels[i].physicsEnabled.getValueDirect();
        if (!this.bodyAdded[i] || !physicsEnabled)
            continue;

        var body = this.physicsBodies[i];
        
        var position = body.position;

        var rotation = body.quaternion;
        var quat = new Quaternion();
        quat.load(rotation.w, rotation.x, rotation.y, rotation.z);

        this.bodyModels[i].getAttribute("position").setValueDirect(position.x, position.y, position.z);
        this.bodyModels[i].getAttribute("quaternion").setValueDirect(quat);
        /*
        // if object has moved outside of the world boundary, remove it from the simulation (memory errors occur when positions become too large)
        if (position.x < -worldHalfExtents.x || position.x > worldHalfExtents.x ||
            position.y < -worldHalfExtents.y || position.y > worldHalfExtents.y ||
            position.z < -worldHalfExtents.z || position.z > worldHalfExtents.z)
        {
            modelsOutOfBounds.push(this.bodyModels[i]);
        }*/
    }
    /*
    // remove any models that have moved outside of the world boundary
    for (var i = 0; i < modelsOutOfBounds.length; i++)
    {
        this.deletePhysicsBody(modelsOutOfBounds[i]);
    }
    */
    this.evaluating = false;
}

CannonPhysicsSimulator.prototype.update = function()
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
        this.updatePhysicsBodyPosition(this.updateBodyPositions[0], true);
    }
}

CannonPhysicsSimulator.prototype.stepSimulation = function(timeIncrement, maxSubSteps)
{
    timeIncrement = timeIncrement || this.timeIncrement.getValueDirect() * this.timeScale.getValueDirect();
    maxSubSteps = 1;//maxSubSteps || 10;
    
    this.update();
    this.world.step(timeIncrement, maxSubSteps);
}

CannonPhysicsSimulator.prototype.detectCollisions = function()
{
    this.update();
    this.stepSimulation(0.0001, 1);
}
    
CannonPhysicsSimulator.prototype.isColliding = function(model)
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
            
            var a, b, distance;
            var numContacts = contactManifold.getNumContacts();
            for (var j = 0; j < numContacts; j++)
            {
                var pt = contactManifold.getContactPoint(j);
                var ptA = pt.getPositionWorldOnA();
                var ptB = pt.getPositionWorldOnB();

                a = new Vector3D(ptA.x(), ptA.y(), ptA.z());
                b = new Vector3D(ptB.x(), ptB.y(), ptB.z());
            
                distance = Math.min(distanceBetween(new Vector3D(ptA.x(), ptA.y(), ptA.z()), new Vector3D(ptB.x(), ptB.y(), ptB.z()), distance));
                if (distance < 0.01) continue; // don't consider very small distances
                            
                if (body0.ptr == physicsBody.ptr)
                {
                    if (a.y > 0) continue; // don't consider "collisions" outside of the collidee
                    /*
                    var collidee = null;
                    for (var j = 0; j < this.physicsBodies.length; j++)
                    {
                        if (body1.ptr == this.physicsBodies[j].ptr)
                        {
                            collidee = this.bodyModels[j];                                                      
                            //console.log(distance);               
                            //break;
                        }
                    }*/
                }
                else if (body1.ptr == physicsBody.ptr)
                {
                    if (b.y > 0) continue; // don't consider "collisions" outside of the collidee
                    /*
                    for (var j = 0; j < this.physicsBodies.length; j++)
                    {
                        if (body0.ptr == this.physicsBodies[j].ptr)
                        {
                            collidee = this.bodyModels[j];
                            
                            //console.log(distance);               
                            //break;
                        }
                    }*/
                }
                                   
                return { colliding: true, distance: distance };
            }
        }
    }

    return { colliding: false, distance: FLT_MAX };
}

CannonPhysicsSimulator.prototype.getColliders = function(model)
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

CannonPhysicsSimulator.prototype.getPhysicsBody = function(bodyModel)
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

CannonPhysicsSimulator.prototype.getPhysicsBodyIndex = function(bodyModel)
{
    return this.bodyModels.indexOf(bodyModel);
}

CannonPhysicsSimulator.prototype.getBodyModel = function(physicsBody)
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
    
CannonPhysicsSimulator.prototype.updatePhysicsBodies = function()
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
            for (j = 0; j < this.bodyModels.length; j++)
            {
                if (this.bodyModels[j].name == body)
                {
                    removed.push(this.bodyModels[j]);
                    break;
                }
            }
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

CannonPhysicsSimulator.prototype.createPhysicsBody = function(model)
{
    if (!model)
        return;

    // watch for changes in vertices
    model.getAttribute("vertices").addModifiedCB(CannonPhysicsSimulator_ModelVerticesModifiedCB, this);
    model.getAttribute("position").addModifiedCB(CannonPhysicsSimulator_ModelPositionModifiedCB, this);
    model.getAttribute("rotation").addModifiedCB(CannonPhysicsSimulator_ModelRotationModifiedCB, this);
    model.getAttribute("quaternion").addModifiedCB(CannonPhysicsSimulator_ModelQuaternionModifiedCB, this);
    // watch for changes in scale
    model.getAttribute("scale").addModifiedCB(CannonPhysicsSimulator_ModelScaleModifiedCB, this);
    // watch for changes in parent
    model.getAttribute("parent").addModifiedCB(CannonPhysicsSimulator_ModelParentModifiedCB, this);
    // watch for changes in enabled
    model.getAttribute("enabled").removeModifiedCB(CannonPhysicsSimulator_ModelEnabledModifiedCB, this); // ensure no dups (not removed by delete)
    model.getAttribute("enabled").addModifiedCB(CannonPhysicsSimulator_ModelEnabledModifiedCB, this);
    // watch for changes in physical properties
    model.getAttribute("physicalProperties").addModifiedCB(CannonPhysicsSimulator_ModelPhysicalPropertiesModifiedCB, this);

    // if model is disabled, don't create
    if (model.getAttribute("enabled").getValueDirect() == false)
        return;
    
    // if model is parented, don't add here; it will be added as a shape to the parent model's body
    if (model.motionParent)
        return;

    var properties = this.getNetProperties(model);

    var body = new CANNON.Body({
        mass: properties.mass
    });
    
    this.getCompoundShape(model, body);

    var position = model.getAttribute("position").getValueDirect();
    // temporary fix to remove y-axis padding between static and dynamic objects
    if (properties.mass == 0)
    {
        //position.y -= 0.075;
    }
    body.position.x = position.x;
    body.position.y = position.y;
    body.position.z = position.z;

    var rotation = model.getAttribute("quaternion").getValueDirect();
    body.quaternion.x = rotation.x;
    body.quaternion.y = rotation.y;
    body.quaternion.z = rotation.z;
    body.quaternion.w = rotation.w;

    this.world.addBody(body);
    //if (isDynamic)
    {
        this.bodyModels.push(model);
        this.physicsBodies.push(body);
        this.bodyAdded.push(true);
    }
}

CannonPhysicsSimulator.prototype.deletePhysicsBodies = function()
{
    while (this.bodyModels.length > 0)
    {
        this.deletePhysicsBody(this.bodyModels[0]);
    }
}

CannonPhysicsSimulator.prototype.deletePhysicsBody = function(model)
{
    for (var i = 0; i < this.bodyModels.length; i++)
    {
        if (this.bodyModels[i] == model)
        {
            this.bodyModels[i].getAttribute("vertices").removeModifiedCB(CannonPhysicsSimulator_ModelVerticesModifiedCB, this);
            this.bodyModels[i].getAttribute("position").removeModifiedCB(CannonPhysicsSimulator_ModelPositionModifiedCB, this);
            this.bodyModels[i].getAttribute("rotation").removeModifiedCB(CannonPhysicsSimulator_ModelRotationModifiedCB, this);
            this.bodyModels[i].getAttribute("quaternion").removeModifiedCB(CannonPhysicsSimulator_ModelQuaternionModifiedCB, this);
            this.bodyModels[i].getAttribute("scale").removeModifiedCB(CannonPhysicsSimulator_ModelScaleModifiedCB, this);
            this.bodyModels[i].getAttribute("parent").removeModifiedCB(CannonPhysicsSimulator_ModelParentModifiedCB, this);
            //this.bodyModels[i].getAttribute("enabled").removeModifiedCB(CannonPhysicsSimulator_ModelEnabledModifiedCB, this);
            this.world.removeBody(this.physicsBodies[i]);
            this.physicsBodies.splice(i, 1);
            this.bodyModels.splice(i, 1);
            this.bodyAdded.splice(i, 1);
            return;
        }
    }
}

CannonPhysicsSimulator.prototype.getCompoundShape = function(model, body)
{
    var position = new Vector3D();
    var rotation = new Vector3D();
    var scale = model.getAttribute("scale").getValueDirect();
    this.addCollisionShape(model, position, rotation, scale, body);
}

CannonPhysicsSimulator.prototype.addCollisionShape = function(model, position, rotation, scale, body)
{
    // get collision shape(s)
    this.getCollisionShape(model, position, rotation, scale, body);
    
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

        this.addCollisionShape(child, childPosition, childRotation, childScale, body);
    }
}

CannonPhysicsSimulator.prototype.getCollisionShape = function(model, position, rotation, scale, body)
{
    switch (model.attrType)
    {
        case eAttrType.Model:
        case eAttrType.Box:
        case eAttrType.Beam:       
        case eAttrType.Plank:    
        case eAttrType.Wall:
            this.getBoxCollisionShape(model, position, rotation, scale, body);
            break;
            
        case eAttrType.Ball:
            this.getSphereCollisionShape(model, position, rotation, scale, body);
            break;
        
        case eAttrType.Elbow:
        case eAttrType.Gear:
        case eAttrType.Pyramid:
        case eAttrType.Ring:
        case eAttrType.Tube:
        case eAttrType.Wedge:
        case eAttrType.SnapModel:
        default:
            this.getConvexCollisionShape(model, position, rotation, scale, body);
            break;
    }
}

CannonPhysicsSimulator.prototype.getConvexCollisionShape = function(model, center, position, rotation, scale, body)
{
    // scale vertices
    var matrix = new Matrix4x4();
    matrix.loadScale(scale.x, scale.y, scale.z);
    
    var points = [];
    var faces = [];
    for (var i = 0; i < model.geometries.length; i++)
    {
        var geometry = model.geometries[i];
        var tris = geometry.getTriangles();
        var polys = this.getConvexPolys(tris);
        
        for (var j = 0; j < polys.points.length; j++)
        {
            var point = matrix.transform(polys.points[j].x, polys.points[j].y, polys.points[j].z, 1);
            points.push(new CANNON.Vec3(point.x, point.y, point.z));
        }
        
        faces = faces.concat(polys.faces);
    }

    if (points.length > 0)
    {
        var shape = new CANNON.ConvexPolyhedron(points, faces);
        
        body.addShape(shape);
    }
}

CannonPhysicsSimulator.prototype.getConvexPolys = function(tris)
{
    var points = [];
    var faces = [];   
    var indices = [];
    
    for (var i = 0; i < tris.length; i++)
    {
        var tri = tris[i];
        var v0 = tri.v0;
        var v1 = tri.v1;
        var v2 = tri.v2;
            
        indices[0] = indices[1] = indices[2] = -1;
        
        for (var j = 0; j < points.length; j++)
        {
            if (indices[0] == -1 &&
                epsilonEqual(v0.x, points[j].x, FLT_EPSILON) &&
                epsilonEqual(v0.y, points[j].y, FLT_EPSILON) &&
                epsilonEqual(v0.z, points[j].z, FLT_EPSILON))
            {
                indices[0] = j;
                continue;
            }
            
            if (indices[1] == -1 &&
                epsilonEqual(v1.x, points[j].x, FLT_EPSILON) &&
                epsilonEqual(v1.y, points[j].y, FLT_EPSILON) &&
                epsilonEqual(v1.z, points[j].z, FLT_EPSILON))
            {
                indices[1] = j;
                continue;
            }
            
            if (indices[2] == -1 &&
                epsilonEqual(v2.x, points[j].x, FLT_EPSILON) &&
                epsilonEqual(v2.y, points[j].y, FLT_EPSILON) &&
                epsilonEqual(v2.z, points[j].z, FLT_EPSILON))
            {
                indices[2] = j;
                continue;
            }
        }
        
        if (indices[0] == -1)
        {
            points.push(v0);
            indices[0] = points.length - 1;
        }
        
        if (indices[1] == -1)
        {
            points.push(v1);
            indices[1] = points.length - 1;
        }
        
        if (indices[2] == -1)
        {
            points.push(v2);
            indices[2] = points.length - 1;
        }
        
        faces.push([indices[0], indices[1], indices[2]]);
    }

    return { points: points, faces: faces }
}
    
CannonPhysicsSimulator.prototype.getBoxCollisionShape = function(model, position, rotation, scale, body)
{
    var bbox_min = model.bbox.min.getValueDirect();
    var bbox_max = model.bbox.max.getValueDirect();

    var halfExtents = new CANNON.Vec3((Math.max(((bbox_max.x - bbox_min.x) * scale.x) / 2, 0.1)),
                                      (Math.max(((bbox_max.y - bbox_min.y) * scale.y) / 2, 0.1)),
                                      (Math.max(((bbox_max.z - bbox_min.z) * scale.z) / 2, 0.1)));
    var shape = new CANNON.Box(halfExtents);
    
    body.addShape(shape);
}

CannonPhysicsSimulator.prototype.getSphereCollisionShape = function(model, position, rotation, scale, body)
{
    var bbox_min = model.bbox.min.getValueDirect();
    var bbox_max = model.bbox.max.getValueDirect();

    var radius = ((bbox_max.x - bbox_min.x) * scale.x) / 2;
    var shape = new CANNON.Sphere(radius);
            
    body.addShape(shape);
}
/*
CannonPhysicsSimulator.prototype.getSnapCollisionShape = function(model, position, rotation, scale, compoundShape)
{
    for (var i in model.snaps)
    {
        var snapped = model.snaps[i].model;
        var matrix = model.snaps[i].matrix;
        
        var snappedPosition = matrix.getTranslation();
        snappedPosition.x += position.x;
        snappedPosition.y += position.y;
        snappedPosition.z += position.z;
        snappedPosition.x *= scale.x;
        snappedPosition.y *= scale.y;
        snappedPosition.z *= scale.z;
        
        var snappedRotation = matrix.getRotationAngles();
        snappedRotation.x += rotation.x;
        snappedRotation.y += rotation.y;
        snappedRotation.z += rotation.z;
        
        var snappedScale = scale;//matrix.getScalingFactors();
        //snappedScale.x *= scale.x;
        //snappedScale.y *= scale.y;
        //snappedScale.z *= scale.z;
        
        this.getCollisionShape(snapped, snappedPosition, snappedRotation, snappedScale, compoundShape);
    }
}
*/
CannonPhysicsSimulator.prototype.getNetProperties = function(model)
{
    // calculate scaled mass for model
    var scale = model.getAttribute("scale").getValueDirect();
    var avgScale = (scale.x + scale.y + scale.z) / 3;
    var physicalProperties = model.getAttribute("physicalProperties");
    var mass = physicalProperties.getAttribute("mass").getValueDirect() * avgScale;
    var friction = physicalProperties.getAttribute("friction").getValueDirect();
    var restitution = physicalProperties.getAttribute("restitution").getValueDirect();
    var linearDamping = physicalProperties.getAttribute("linearDamping").getValueDirect();
    var angularDamping = physicalProperties.getAttribute("angularDamping").getValueDirect();
    var rollingFriction = physicalProperties.getAttribute("rollingFriction").getValueDirect();
    
    // add children's properties (if any)
    for (var i = 0; i < model.motionChildren.length; i++)
    {
        var childProperties = this.getNetProperties(model.motionChildren[i]);
        mass += childProperties.mass;
        friction += childProperties.friction;
        restitution += childProperties.restitution;
        linearDamping += childProperties.linearDamping;
        angularDamping += childProperties.angularDamping;
        rollingFriction += childProperties.rollingFriction;
    }

    return { mass: mass, 
             friction: friction, 
             restitution: restitution, 
             linearDamping: linearDamping,
             angularDamping: angularDamping,
             rollingFriction: rollingFriction };
}

CannonPhysicsSimulator.prototype.updatePhysicsShape = function(model, shape)
{
    // locate array position of model
    var n = this.getPhysicsBodyIndex(model);
    if (n == -1)
        return;

    shape = shape || this.getCompoundShape(model);

    var properties = this.getNetProperties(model);

    var body = new CANNON.Body({
        mass: properties.mass
    });
    
    // remove previous before adding
    this.world.removeBody(this.physicsBodies[n]);

    this.world.addBody(body);
    this.physicsBodies[n] = body;
}

CannonPhysicsSimulator.prototype.updatePhysicsBody = function(n)
{
    var model = this.bodyModels[n];
    if (!model)
        return;
    var body = this.physicsBodies[n];
    if (!body)
        return;
    
    var position = model.getAttribute("position").getValueDirect();
    body.position = new CANNON.Vec3(position.x, position.y, position.z);

    // update rotation to include rotation caused by object inspection
    var rotation = new Quaternion();
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
        rotation.loadQuaternion(quat);
        
        // clear inspection group's rotation
        rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(new Quaternion());
    }   
    body.quaternion = new CANNON.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
}

CannonPhysicsSimulator.prototype.updatePhysicsBodyPosition = function(n, retainInspectionGroupRotation)
{
    var index = this.updateBodyPositions.indexOf(n);
    if (index >= 0)
    {
        this.updateBodyPositions.splice(index, 1);
    }
    
    //if (!this.bodyAdded[n]) return;
    
    var model = this.bodyModels[n];
    if (!model)
        return;
    var body = this.physicsBodies[n];
    if (!body)
        return;
    
    var position = model.getAttribute("position").getValueDirect();
    body.position = new CANNON.Vec3(position.x, position.y, position.z);

    // update rotation to include rotation caused by object inspection
    var rotation = new Quaternion();
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
        rotation.loadQuaternion(quat);
        
        // clear inspection group's rotation
        if (!retainInspectionGroupRotation) 
        {
            rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(new Quaternion());
        }
    }   
    body.quaternion = new CANNON.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
}

CannonPhysicsSimulator.prototype.initPhysics = function()
{   /*
    var gravity = this.gravity.getValueDirect();
    
    this.world = new CANNON.World({
        //gravity: new CANNON.Vec3(gravity.x, gravity.y, gravity.z)
    });
    
    this.world.gravity = new CANNON.Vec3(gravity.x, gravity.y, gravity.z);*/
    
    this.world = new CANNON.World({
        //gravity: new CANNON.Vec3(gravity.x, gravity.y, gravity.z)
    });

    this.world.gravity.set(0, -1, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 20;
    this.world.defaultContactMaterial.contactEquationStiffness = 1e10;
    this.world.defaultContactMaterial.contactEquationRelaxation = 10;
}

CannonPhysicsSimulator.prototype.bodiesModified = function()
{
    this.updateBodies = true;
}

CannonPhysicsSimulator.prototype.modelEnabledModified = function(model, enabled)
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

CannonPhysicsSimulator.prototype.modelPhysicalPropertiesModified = function(model)
{
    // locate array position of model
    var n = this.getPhysicsBodyIndex(model);
    if (n == -1)
        return;
    
    this.updatePhysicsShape(model, this.physicsShapes[n]);
}

function CannonPhysicsSimulator_GravityModifiedCB(attribute, container)
{
    container.updateWorld = true;
}

function CannonPhysicsSimulator_BodiesModifiedCB(attribute, container)
{
    container.bodiesModified();
}

function CannonPhysicsSimulator_EnabledModifiedCB(attribute, container)
{
    var enabled = attribute.getValueDirect();
}

function CannonPhysicsSimulator_ModelVerticesModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function CannonPhysicsSimulator_ModelPositionModifiedCB(attribute, container)
{
    if (this.evaluating) return;
    
    //container.updatePhysicsBodyPosition(container.getPhysicsBodyIndex(attribute.getContainer()), true);
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

function CannonPhysicsSimulator_ModelRotationModifiedCB(attribute, container)
{
    if (this.evaluating) return;
    
    //container.updatePhysicsBodyPosition(container.getPhysicsBodyIndex(attribute.getContainer()), true);
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

function CannonPhysicsSimulator_ModelQuaternionModifiedCB(attribute, container)
{
    if (this.evaluating) return;
    
    //container.updatePhysicsBodyPosition(container.getPhysicsBodyIndex(attribute.getContainer()), true);
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

function CannonPhysicsSimulator_ModelScaleModifiedCB(attribute, container)
{
    container.updatePhysicsShape(attribute.getContainer());
}

function CannonPhysicsSimulator_ModelParentModifiedCB(attribute, container)
{
    container.updateBodies = true;
}

function CannonPhysicsSimulator_ModelEnabledModifiedCB(attribute, container)
{
    container.modelEnabledModified(attribute.getContainer(), attribute.getValueDirect());
}

function CannonPhysicsSimulator_ModelPhysicalPropertiesModifiedCB(attribute, container)
{
    container.modelPhysicalPropertiesModified(attribute.getContainer());
}