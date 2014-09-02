CollisionDetectParams.prototype = new DirectiveParams();
CollisionDetectParams.prototype.constructor = CollisionDetectParams();

function CollisionDetectParams()
{
    DirectiveParams.call(this);

    this.viewSpace = false;
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.detectCollisions = new Array();
}

CollisionDetectDirective.prototype = new SGDirective();
CollisionDetectDirective.prototype.constructor = CollisionDetectDirective;

function CollisionDetectDirective()
{
    SGDirective.call(this);
    this.className = "CollisionDetectDirective";
    this.attrType = eAttrType.CollisionDetectDirective;

    this.name.setValueDirect("CollisionDetectDirective");
}

CollisionDetectDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // setup collision Detect params structure
    var params = new CollisionDetectParams();

    // calculate bounding box
    root.apply("collisionDetect", params, true);
    
    this.graphMgr.setCollisions(this.detectCollisions(params.detectCollisions));
}

CollisionDetectDirective.prototype.detectCollisions = function(boundingTrees)
{
    var names = [];
    var trees = [];
    var collisions = [];
    var tested = [];
    
    for (var i in boundingTrees)
    {
        names.push(i);
        trees.push(boundingTrees[i]);
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
                collisions.push(names[i]);
                collisions.push(names[j]);
                tested[i] = tested[j] = true;
                break;
            }
        }
    }
    
    return collisions;
}