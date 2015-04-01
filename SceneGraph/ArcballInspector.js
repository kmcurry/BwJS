ArcballInspector.prototype = new Evaluator();
ArcballInspector.prototype.constructor = ArcballInspector;

function ArcballInspector()
{
    Evaluator.call(this);
    this.className = "ArcballInspector";
    this.attrType = eAttrType.ArcballInspector;

    this.sphereCenter = new Vector3DAttr(0, 0, 0);
    this.sphereRadius = new NumberAttr(0);
    this.mouseDown = new Vector2DAttr(0, 0);
    this.mouseNow = new Vector2DAttr(0, 0);
    this.quatAtMouseDown = new QuaternionAttr(1, 0, 0, 0);
    this.viewport = new ViewportAttr(0, 0, 0, 0);
    this.worldTransform = new Matrix4x4Attr();
    this.viewTransform = new Matrix4x4Attr();
    this.constrainToAxis = new BooleanAttr(false);
    this.constraintAxis = new Vector3DAttr(0, 0, 0);
    this.resultQuat = new QuaternionAttr(1, 0, 0, 0);

    this.registerAttribute(this.sphereCenter, "sphereCenter");
    this.registerAttribute(this.sphereRadius, "sphereRadius");
    this.registerAttribute(this.mouseDown, "mouseDown");
    this.registerAttribute(this.mouseNow, "mouseNow");
    this.registerAttribute(this.quatAtMouseDown, "quatAtMouseDown");
    this.registerAttribute(this.viewport, "viewport");
    this.registerAttribute(this.worldTransform, "worldTransform");
    this.registerAttribute(this.viewTransform, "viewTransform");
    this.registerAttribute(this.constrainToAxis, "constrainToAxis");
    this.registerAttribute(this.constraintAxis, "constraintAxis");
    this.registerAttribute(this.resultQuat, "resultQuat");
}

ArcballInspector.prototype.evaluate = function()
{
    if (!(this.enabled.getValueDirect()))
    {
        return;
    }

    // get input values

    // sphere center
    var center = this.sphereCenter.getValueDirect();

    // sphere radius
    var radius = this.sphereRadius.getValueDirect();

    // mouse coords
    var mouseDown = this.mouseDown.getValueDirect();
    var mouseNow = this.mouseNow.getValueDirect();

    // mouse down quat
    var quatDown = this.quatAtMouseDown.getValueDirect();

    // viewport
    var vp = this.viewport;
 
    // world transform
    var world = this.worldTransform.getValueDirect();

    // view transform
    var view = this.viewTransform.getValueDirect();

    // invert world transform (to account for existing transformations) and combine with view transform
    world.invert();
    view = view.multiply(world);

    // constrain to axis
    var constrain = this.constrainToAxis.getValueDirect();

    // normalize screen coordinates to [-1, 1] (invert y -- screen y coords are reversed)
    center.x    = 2 * (center.x - vp.x) / vp.width -1;
    center.y    = 2 * (vp.height - center.y - vp.y) / vp.height - 1;
    mouseDown.x = 2 * (mouseDown.x - vp.x) / vp.width  - 1;
    mouseDown.y = 2 * (vp.height - mouseDown.y - vp.y) / vp.height - 1;
    mouseNow.x  = 2 * (mouseNow.x  - vp.x) / vp.width  - 1;
    mouseNow.y  = 2 * (vp.height - mouseNow.y  - vp.y) / vp.height - 1;
    
    // get points on sphere corresponding to mouse down and mouse now
    var ptDown, ptNow;
    if (!constrain)
    {
        ptDown = this.getSpherePoint(mouseDown, center, radius);
        ptNow = this.getSpherePoint(mouseNow, center, radius);
    }
    else // constrain
    {
        // constraint axis
        var axis = this.constraintAxis.getValueDirect();

        ptDown = this.getSpherePointAboutAxis(mouseDown, center, radius, axis);
        ptNow = this.getSpherePointAboutAxis(mouseNow, center, radius, axis);
    }

    // transform by view matrix
    var ptDownX = view.transform(ptDown.x, ptDown.y, ptDown.z, 0);
    var ptNowX = view.transform(ptNow.x, ptNow.y, ptNow.z, 0);
    ptDown.x = ptDownX.x;
    ptDown.y = ptDownX.y;
    ptDown.z = ptDownX.z;
    ptNow.x = ptNowX.x;
    ptNow.y = ptNowX.y;
    ptNow.z = ptNowX.z;
    ptDown.normalize();
    ptNow.normalize();

    // construct unit quaternion from the two points on sphere
    var quatDrag = this.getQuatFromSpherePoints(ptDown, ptNow);

    // multiply drag quaternion with down quaternion
    quatDrag = quatDrag.multiply(quatDown);
    
    this.resultQuat.setValueDirect(quatDrag);
}

ArcballInspector.prototype.getSpherePoint = function(mouse, center, radius)
{
    var point = new Vector3D();
    
    point.x = (mouse.x - center.x) / radius;
    point.y = (mouse.y - center.y) / radius;

    var mag = point.x * point.x + point.y * point.y;
    if (mag > 1.0)
    {
        var scale = 1 / Math.sqrt(mag);
        point.x *= scale;
        point.y *= scale;
        point.z = 0;
    }
    else // mag <= 1.0f
    {
        point.z = -(Math.sqrt(1 - mag));
    }
    return point;
}

ArcballInspector.prototype.getSpherePointAboutAxis = function(mouse, center, radius, axis)
{
    point = this.getSpherePoint(mouse, center, radius);

    var dot = dotProduct(point, axis);
    
    axis.multiplyScalar(dot);
    
    var proj = new Vector3D(point.x, point.y, point.z);
    
    proj.subtractVector(axis);
    
    var norm = magnitude(proj.x, proj.y, proj.z);
    
    point = null;
    
    if (norm > 0)
    {
        var s = 1 / Math.sqrt(norm);
        if (proj.z < 0)
        {
            proj.x = -proj.x;
            proj.y = -proj.y;
            proj.z = -proj.z;
        }

        point = proj.multiplyScalar(s);
    }
    else if (axis.z == 1.0)
    {
        point = new Vector3D(1, 0, 0);
    }
    else
    {
        point.normalize();
    }
}

ArcballInspector.prototype.getQuatFromSpherePoints = function(pt1, pt2)
{
    var quat = new Quaternion();
    quat.x = pt1.y * pt2.z - pt1.z * pt2.y;
    quat.y = pt1.z * pt2.x - pt1.x * pt2.z;
    quat.z = pt1.x * pt2.y - pt1.y * pt2.x;
    quat.w = pt1.x * pt2.x + pt1.y * pt2.y + pt1.z * pt2.z;
    return quat;
}

// doesn't do anything
function ArcballInspector_ViewTransformModifiedCB(attribute, container)
{
    /*
    if (attr)
    {
        CMatrix4x4FloatAttr* viewTransform = dynamic_cast<CMatrix4x4FloatAttr*>(attr);
        if (viewTransform)
        {
            CMatrix4x4f m;
            viewTransform.getValueDirect(m);
        }
    }
    */
}

