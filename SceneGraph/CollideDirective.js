var MAX_SEE_AHEAD   = 2;

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
    this.worldMatrix = worldMatrix;
}

CollideDirective.prototype = new SGDirective();
CollideDirective.prototype.constructor = CollideDirective;

function CollideDirective()
{
    SGDirective.call(this);
    this.className = "CollideDirective";
    this.attrType = eAttrType.CollideDirective;

    this.name.setValueDirect("CollideDirective");
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
    var models = [];
    var trees = [];
    var collisions = [];
    
    for (var i in collideRecs)
    {
        models.push(collideRecs[i].model);
        trees.push(collideRecs[i].tree);
        collisions.push(false);

        collideRecs[i].model.getAttribute("collisionList").clear();
    }

    for (var i = 0; i < trees.length; i++)
    {
        for (var j = i+1; j < trees.length; j++)
        {
            if (trees[i].collides(trees[j]))
            {
                models[i].getAttribute("collisionList").push_back(models[j]);                
                models[j].getAttribute("collisionList").push_back(models[i]);
                collisions[i] = collisions[j] = true;
            }
        }
    }
    
    for (var i = 0; i < collisions.length; i++)
    {
        models[i].getAttribute("collisionDetected").setValueDirect(collisions[i]);
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
            if (i == j) continue;
            
            if ((distance = trees[j].obstructs(trees[i], directionVectors.forward)) > 0 &&
                 distance < minDistance)
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
        for (var j=0; j < socketConnectors.Size(); j++)
        {
            var socketConnector = socketConnectors.getAt(j);
            if (socketConnector.getAttribute("connected").getValueDirect() == false)
            {
                sockets.push(new Pair(socketConnector, collideRecs[i]));
            }
        }
        
        var plugConnectors = collideRecs[i].model.getAttribute("plugConnectors");
        for (var j=0; j < plugConnectors.Size(); j++)
        {
            var plugConnector = plugConnectors.getAt(j);
            if (plugConnector.getAttribute("connected").getValueDirect() == false)
            {
                plugs.push(new Pair(plugConnector, collideRecs[i]));
            }
        }
    }
    
    // test plugs for collision with sockets
    for (var i=0; i < plugs.length; i++)
    {
        for (var j=0; j < sockets.length; j++)
        {
            var connection = plugs[i].first.collides(sockets[j].first, plugs[i].second.worldMatrix, sockets[j].second.worldMatrix);
            if (connection > 0)
            {
                // perform snap-to!
                var factory = this.registry.find("AttributeFactory");
                var snapTo = factory.create("SnapTo");
                snapTo.getAttribute("target").copyValue(sockets[j].second.model.getAttribute("name"));
                snapTo.getAttribute("plug").copyValue(plugs[i].second.model.getAttribute("name"));
                snapTo.getAttribute("socketConnector").copyValue(sockets[j].first);
                snapTo.getAttribute("plugConnector").copyValue(plugs[i].first);
                snapTo.getAttribute("socketWorldMatrix").setValueDirect(sockets[j].second.worldMatrix);
                snapTo.getAttribute("plugWorldMatrix").setValueDirect(plugs[i].second.worldMatrix);
                snapTo.getAttribute("slot").setValueDirect(connection);
                snapTo.execute();
                
    
                // flag plug/socket as connected
                plugs[i].first.getAttribute("connected").setValueDirect(true);             
                sockets[j].first.getAttribute("connected").setValueDirect(true);
                
                // make plug model unmoveable
                plugs[i].second.model.getAttribute("moveable").setValueDirect(false);
            }
        }
    }
}