BBoxParams.prototype = new DirectiveParams();
BBoxParams.prototype.constructor = BBoxParams();

function BBoxParams()
{
    DirectiveParams.call(this);

    this.viewSpace = false;
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.minPoint = new Vector3D();
    this.maxPoint = new Vector3D();
    this.minMaxSet = false;
}

BBoxDirective.prototype = new SGDirective();
BBoxDirective.prototype.constructor = BBoxDirective;

function BBoxDirective()
{
    SGDirective.call(this);
    this.className = "BBoxDirective";
    this.attrType = eAttrType.BBoxDirective;

    this.min = new Vector3D();
    this.max = new Vector3D();
    
    this.name.setValueDirect("BBoxDirective");

    this.viewSpace = new BooleanAttr(false);
    this.viewTransform = new Matrix4x4Attr(1, 0, 0, 0,
                                           0, 1, 0, 0,
                                           0, 0, 1, 0,
                                           0, 0, 0, 1);

    this.registerAttribute(this.viewSpace, "viewSpace");
    this.registerAttribute(this.viewTransform, "viewTransform");
}

BBoxDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // setup bbox params structure
    var params = new BBoxParams();
    params.viewSpace = this.viewSpace.getValueDirect();
    var viewMatrix = this.viewTransform.getValueDirect();
    params.viewMatrix.load(viewMatrix._11, viewMatrix._12, viewMatrix._13, viewMatrix._14,
                           viewMatrix._21, viewMatrix._22, viewMatrix._23, viewMatrix._24,
                           viewMatrix._31, viewMatrix._32, viewMatrix._33, viewMatrix._34,
                           viewMatrix._41, viewMatrix._42, viewMatrix._43, viewMatrix._44);

    // calculate bounding box
    root.apply("bbox", params, true);

    this.min = params.minPoint;
    this.max = params.maxPoint;
}

BBoxDirective.prototype.getBounds = function()
{
    return { min: this.min, max: this.max };
}
