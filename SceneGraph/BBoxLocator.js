BBoxLocator.prototype = new Evaluator();
BBoxLocator.prototype.constructor = BBoxLocator;

function BBoxLocator()
{
    Evaluator.call(this);
    this.className = "BBoxLocator";
    this.attrType = eAttrType.BBoxLocator;

    this.viewPosition = new Vector3DAttr(0, 0, 0);
    this.viewTransform = new Matrix4x4Attr(1, 0, 0, 0,
                                           0, 1, 0, 0,
                                           0, 0, 1, 0,
                                           0, 0, 0, 1);
    this.viewVolume = new ViewVolumeAttr();
    this.viewport = new ViewportAttr(0, 0, 0, 0);
    this.nearDistance = new NumberAttr(0);
    this.bbox = new BBoxAttr();
    this.bboxView = new BBoxAttr();
    this.closeness = new NumberAttr(0.5);
    this.resultPosition = new Vector3DAttr(0, 0, 0);
    this.resultWidth = new NumberAttr(0);
    this.resultFarDistance = new NumberAttr(0);
    this.resultPivotDistance = new NumberAttr(0);
    
    this.registerAttribute(this.viewPosition, "viewPosition");
    this.registerAttribute(this.viewTransform, "viewTransform");
    this.registerAttribute(this.viewVolume, "viewVolume");
    this.registerAttribute(this.viewport, "viewport");
    this.registerAttribute(this.nearDistance, "nearDistance");
    this.registerAttribute(this.bbox, "bbox");
    this.registerAttribute(this.bboxView, "bboxView");
    this.registerAttribute(this.closeness, "closeness");
    this.registerAttribute(this.resultPosition, "resultPosition");
    this.registerAttribute(this.resultWidth, "resultWidth");
    this.registerAttribute(this.resultFarDistance, "resultFarDistance");
    this.registerAttribute(this.resultPivotDistance, "resultPivotDistance");
}

BBoxLocator.prototype.evaluate = function()
{
    // get input values

    // position
    var viewPosition = this.viewPosition.getValueDirect();

    // view transform
    var viewTransform = this.viewTransform.getValueDirect();

    // view volume planes
    var left = this.viewVolume.left.getValueDirect();
    var right = this.viewVolume.right.getValueDirect();
    var top = this.viewVolume.top.getValueDirect();
    var bottom = this.viewVolume.bottom.getValueDirect();
    var near = this.viewVolume.near.getValueDirect();
    var far = this.viewVolume.far.getValueDirect();

    // viewport
    var viewport = this.viewport.getValueDirect();

    // bbox min/max points
    var min = this.bbox.min.getValueDirect();
    var max = this.bbox.max.getValueDirect();

    // closeness
    var closeness = this.closeness.getValueDirect();
    if (closeness != 0)
    {
        var bbw = max.x - min.x;
        var bbh = max.y - min.y;

        bbw += bbw * closeness;
        bbh += bbh * closeness;

        if (viewport.width / viewport.height < bbw / bbh)
        {
            bbw = (bbw - (max.x - min.x)) / 2;
            min.x -= bbw;
            max.x += bbw;
        }
        else // (viewport.width / viewport.height >= bbw / bbh)
        {
            bbh = (bbh - (max.y - min.y)) / 2;
            min.y -= bbh;
            max.y += bbh;
        }
    }

    // formulate bbox endpoints
    var p = new Array(8);
    p[0] = new Vector3D(min.x, min.y, min.z);
    p[1] = new Vector3D(min.x, min.y, max.z);
    p[2] = new Vector3D(min.x, max.y, min.z);
    p[3] = new Vector3D(min.x, max.y, max.z);
    p[4] = new Vector3D(max.x, min.y, min.z);
    p[5] = new Vector3D(max.x, min.y, max.z);
    p[6] = new Vector3D(max.x, max.y, min.z);
    p[7] = new Vector3D(max.x, max.y, max.z);

    // get center of world-space bbox
    var center = new Vector3D((min.x + max.x) / 2,
                              (min.y + max.y) / 2,
                              (min.z + max.z) / 2);

    // get camera forward vector
    var fwd = new Vector3D();
    fwd.copy(viewTransform.transform(0, 0, 1, 0));
    fwd.normalize();

    var distance = 0;
    var resultPosition;
    var perspectiveViewVolume = planesIntersect(left, right);

    // if perspective camera...
    if (perspectiveViewVolume)
    {
        // formulate camera-oriented view-volume planes centered at bbox center
        var vvPlanes = new Array(5); // don't consider far plane

        vvPlanes[0] = this.getPlane(left.point, center, left.normal, viewTransform);
        vvPlanes[1] = this.getPlane(right.point, center, right.normal, viewTransform);
        vvPlanes[2] = this.getPlane(top.point, center, top.normal, viewTransform);
        vvPlanes[3] = this.getPlane(bottom.point, center, bottom.normal, viewTransform);
        vvPlanes[4] = this.getPlane(near.point, center, near.normal, viewTransform);

        // for each bbox point, determine the maximum distance necessary to move all points to within the
        // view-volume along the camera forward vector		
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 5; j++)
            {
                if (pointOnPositiveSideOfPlane(p[i], vvPlanes[j]))
                {
                    var d = this.distanceFromPlane(p[i], fwd, vvPlanes[j]);
                    if (d.intersection)
                    {
                        distance = Math.max(distance, d.distance);
                    }
                }
            }
        }

        resultPosition = new Vector3D(center.x, center.y, center.z);
        fwd.multiplyScalar(distance);
        resultPosition.subtractVector(fwd);
    }
    else // orthographic camera
    {
        resultPosition = new Vector3D(center.x, center.y, center.z);
        distance = magnitude(viewPosition.x, viewPosition.y, viewPosition.z);
        fwd.multiplyScalar(distance);
        resultPosition.subtractVector(fwd);

        // set width

        // get bboxView min/max points
        var vmin = this.bboxView.min.getValueDirect();
        var vmax = this.bboxView.max.getValueDirect();

        var width = distanceBetweenPlanes(right, left);
        var height = distanceBetweenPlanes(top, bottom);
        var aspect = width / height;

        var xDim = Math.abs(vmax.x - vmin.x);
        var yDim = Math.abs(vmax.y - vmin.y);

        // this could probably be simplified, but it works
        if (xDim > yDim)
        {
            width = xDim;

            height = width / aspect;
            if (height < yDim)
            {
                height = yDim;
                width = height * aspect;
            }
        }
        else
        {
            height = yDim;
            width = height * aspect;

            if (width < xDim)
            {
                width = xDim;
            }
        }

        // output result
        this.resultWidth.setValueDirect(width);
    }

    // output result(s)
    this.resultPosition.setValueDirect(resultPosition.x, resultPosition.y, resultPosition.z);

    // determine distance of all points from near clipping plane
    distance = 0;
    for (var i = 0; i < 8; i++)
    {
        var px = viewTransform.transform(p[i].x, p[i].y, p[i].z, 1);
        distance = Math.max(distance, distanceBetween(p[i], resultPosition));
    }

    this.resultFarDistance.setValueDirect(this.nearDistance.getValueDirect() + distance);

    // determine pivot distance (distance between camera and center of bbox in world-space)
    distance = distanceBetween(resultPosition, new Vector3D(center.x, center.y, center.z));
    this.resultPivotDistance.setValueDirect(distance);
}

BBoxLocator.prototype.getPlane = function(point, offset, normal, transform)
{
    var xpoint = transform.transformVector3D(point, 0);
    xpoint.x += offset.x;
    xpoint.y += offset.y;
    xpoint.z += offset.z;

    var xnormal = transform.transformVector3D(normal, 0);

    var plane = new Plane(new Vector3D(xpoint.x, xpoint.y, xpoint.z), new Vector3D(xnormal.x, xnormal.y, xnormal.z));

    return plane;
}

BBoxLocator.prototype.distanceFromPlane = function(point, dir, plane)
{
    var line = new Line(point, dir);
    var distance;

    var intersection = lineIntersectsPlane(line, plane);
    switch (intersection.result)
    {
    case 0: // no intersection
        distance = FLT_MAX;
        break;

    case 1: // intersection at 1 point
        distance = distanceBetween(point, intersection.point);
        break;

    case 2: // intersection at infinite points (line on plane) 
    default:
        distance = 0;
        break;
    }

    return { intersection: intersection.result, distance: distance };
}