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
    var collisions = this.detectCollisions(params.detectCollisions);   
    for (var i = 0; i < collisions.length; i++)
    {
        collisions[i].getAttribute("collisionDetected").pulse();
    }
}

CollideDirective.prototype.detectCollisions = function(collideRecs)
{
    var models = [];
    var trees = [];
    var collisions = [];
    var tested = [];
    
    for (var i in collideRecs)
    {
        models.push(collideRecs[i].model);
        trees.push(collideRecs[i].tree);
        tested.push(false);
    }
    
    for (var i = 0; i < trees.length; i++)
    {
        if (tested[i]) continue;
        
        for (var j = i+1; j < trees.length; j++)
        {
            if (tested[j]) continue;
            
            if (trees[i].collides(trees[j]))
            {
                collisions.push(models[i]);
                collisions.push(models[j]);
                tested[i] = tested[j] = true;
                break;
            }
        }
    }
    
    return collisions;
}