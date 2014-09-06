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

function CollideRec(model, tree)
{
    this.model = model;
    this.tree = tree;    
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