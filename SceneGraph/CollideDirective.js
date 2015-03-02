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

    this.physicsSim = new PhysicsSimulator();
    this.physicsSim.getAttribute("gravity").setValueDirect(0, 0, 0);

    this.name.setValueDirect("CollideDirective");
}

CollideDirective.prototype.setRegistry = function(registry)
{
    this.physicsSim.setRegistry(registry);

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
    // synchronize models with physics simulator
    var models = [];
    var bodies = new AttributeVector();
    for (var i in collideRecs)
    {
        var model = collideRecs[i].model;

        model.getAttribute("collisionDetected").setValueDirect(false);
        model.getAttribute("collisionList").clear();

        if (model.motionParent)
            continue;
        // physics simulator uses parents for child models

        models.push(model);
        var name = new StringAttr(model.getAttribute("name").getValueDirect().join(""));
        bodies.push_back(name);
    }
    this.physicsSim.getAttribute("bodies").synchronize(bodies);

    // update positions of models (retain inspection group's rotation)
    for (var i = 0; i < models.length; i++)
    {
        var model = models[i];

        var rotationGroup = getInspectionGroup(model);
        var rotationQuat = rotationGroup ? rotationGroup.getChild(2).getAttribute("rotationQuat").getValueDirect() : new Quaternion();

        this.physicsSim.updatePhysicsBody(i);

        if (rotationGroup) rotationGroup.getChild(2).getAttribute("rotationQuat").setValueDirect(rotationQuat);
    }

    // update physics simulation
    this.physicsSim.stepSimulation(0.1);

    // get collisions
    for (var i = 0; i < models.length; i++)
    {
        var model = models[i];

        var colliders = this.physicsSim.getColliders(model);
        if (colliders.length > 0)
        {
            // TODO: should parent's collision be propagated to child models?
            for (var j = 0; j < colliders.length; j++)
            {
                model.getAttribute("collisionList").push_back(colliders[j]);
            }
            model.getAttribute("collisionDetected").setValueDirect(true);

            // if model is set to stop on collision, update its position from the physics simulator
            if (model.getAttribute("stopOnCollision").getValueDirect())
            {
                var trans = new Ammo.btTransform();
                this.physicsSim.getPhysicsBody(model).getMotionState().getWorldTransform(trans);
                var origin = trans.getOrigin();
                Ammo.destroy(trans);
                var position = new Vector3D(origin.x(), origin.y(), origin.z());
                model.getAttribute("sectorPosition").setValueDirect(position.x, position.y, position.z);
            }
        }
    }
}

CollideDirective.prototype.detectObstructions = function(collideRecs)
{
    var models = [];
    var trees = [];
    var obstructions = [];

    for (var i in collideRecs)
    {
        models.push(collideRecs[i].model);
        trees.push(collideRecs[i].tree);
        obstructions.push(false);

        collideRecs[i].model.getAttribute("obstructionList").clear();
    }

    var distance = 0;
    var minDistance = FLT_MAX;
    for (var i = 0; i < trees.length; i++)
    {
        var directionVectors = models[i].getDirectionVectors();
        directionVectors.forward.x *= MAX_SEE_AHEAD;
        directionVectors.forward.y *= MAX_SEE_AHEAD;
        directionVectors.forward.z *= MAX_SEE_AHEAD;

        for (var j = 0; j < trees.length; j++)
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

    for (var i = 0; i < obstructions.length; i++)
    {
        models[i].getAttribute("obstructionDetected").setValueDirect(obstructions[i]);
    }
}

CollideDirective.prototype.detectSnapConnections = function(collideRecs)
{
    var sockets = [];
    var plugs = [];

    // get disconnected sockets/plugs
    for (var i in collideRecs)
    {
        var socketConnectors = collideRecs[i].model.getAttribute("socketConnectors");
        for (var j = 0; j < socketConnectors.Size(); j++)
        {
            var socketConnector = socketConnectors.getAt(j);
            if (socketConnector.getAttribute("connected").getValueDirect() == false)
            {
                sockets.push(new Pair(socketConnector, collideRecs[i]));
            }
        }

        var plugConnectors = collideRecs[i].model.getAttribute("plugConnectors");
        for (var j = 0; j < plugConnectors.Size(); j++)
        {
            var plugConnector = plugConnectors.getAt(j);
            if (plugConnector.getAttribute("connected").getValueDirect() == false)
            {
                plugs.push(new Pair(plugConnector, collideRecs[i]));
            }
        }
    }

    // test plugs for collision with sockets
    for (var i = 0; i < plugs.length; i++)
    {
        var plugType = plugs[i].first.getAttribute("type").getValueDirect().join("");

        for (var j = 0; j < sockets.length; j++)
        {
            // only test sockets/plugs between different models, and models that are not already in a motion
            // ancestor/descendent relationship
            if (plugs[i].second.model == sockets[j].second.model ||
                plugs[i].second.model.isMotionAncestor(sockets[j].second.model) ||
                sockets[j].second.model.isMotionAncestor(plugs[i].second.model))
                continue;
            
            var socketType = sockets[j].first.getAttribute("type").getValueDirect().join("");
            if (plugType != socketType)
                continue;

            var connection = plugs[i].first.collides(sockets[j].first, plugs[i].second.worldMatrix, sockets[j].second.worldMatrix);
            if (connection > 0)
            {
                // get socket world matrix
                
                // remove any object-inspected rotation from the socket world matrix
                var inspectionRotationMatrix = new Matrix4x4();
                var inspectionGroup = getInspectionGroup(sockets[j].second.model);
                if (inspectionGroup)
                {
                    var translate = inspectionGroup.getChild(0);
                    var translationMatrix = translate.getAttribute("matrix").getValueDirect();

                    var scaleInverse = inspectionGroup.getChild(1);
                    var scaleInverseMatrix = scaleInverse.getAttribute("matrix").getValueDirect();

                    var quaternionRotate = inspectionGroup.getChild(2);
                    var rotationMatrix = quaternionRotate.getAttribute("matrix").getValueDirect();

                    var scale = inspectionGroup.getChild(3);
                    var scaleMatrix = scale.getAttribute("matrix").getValueDirect();

                    var translateBack = inspectionGroup.getChild(4);
                    var translationBackMatrix = translateBack.getAttribute("matrix").getValueDirect();

                    inspectionRotationMatrix = translationBackMatrix.multiply(scaleMatrix.multiply(
                        rotationMatrix.multiply(scaleInverseMatrix.multiply(translationMatrix))));
                }
                inspectionRotationMatrix.invert();
                
                var socketWorldMatrix = sockets[j].second.worldMatrix.multiply(inspectionRotationMatrix);
        
                // perform snap-to!
                var factory = this.registry.find("AttributeFactory");
                var snapTo = factory.create("SnapTo");
                snapTo.getAttribute("target").copyValue(sockets[j].second.model.getAttribute("name"));
                snapTo.getAttribute("plug").copyValue(plugs[i].second.model.getAttribute("name"));
                snapTo.getAttribute("socketConnector").copyValue(sockets[j].first);
                snapTo.getAttribute("plugConnector").copyValue(plugs[i].first);
                snapTo.getAttribute("socketWorldMatrix").setValueDirect(socketWorldMatrix);
                snapTo.getAttribute("plugWorldMatrix").setValueDirect(plugs[i].second.worldMatrix);
                snapTo.getAttribute("slot").setValueDirect(connection);
                snapTo.execute();

                // flag plug/socket as connected
                plugs[i].first.getAttribute("connected").setValueDirect(true);
                sockets[j].first.getAttribute("connected").setValueDirect(true);
                break;
            }
        }
    }
}