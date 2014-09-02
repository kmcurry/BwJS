CollisionDetectParams.prototype = new DirectiveParams();
CollisionDetectParams.prototype.constructor = CollisionDetectParams();

function CollisionDetectParams()
{
    DirectiveParams.call(this);

    this.viewSpace = false;
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.detectList = new Array();
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

BBoxDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // setup collision Detect params structure
    var params = new CollisionDetectParams();

    // calculate bounding box
    root.apply("collisionDetect", params, true);
}