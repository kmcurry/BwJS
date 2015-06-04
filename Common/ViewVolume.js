var eViewVolumePlane = {
    Unknown                     :-1,
    
    Left                        :0,
    Right                       :1,
    Top                         :2,
    Bottom                      :3,
    Near                        :4,
    Far                         :5
};

function ViewVolume()
{
    var left = null;
    var right = null;
    var top = null;
    var bottom = null;
    var near = null;
    var far = null;
}

ViewVolume.prototype.setPerspective = function(fovyRadians, aspectRatio, near, far)
{
    // calculate the front and back frustum plane quadrilateral endpoints
    // for a symmetric frustum volume

    // front quad
   
    // derive 1/2 quad height from y-FOV and distance from origin
    var height = near * Math.tan(0.5 * fovyRadians);

    // derive 1/2 quad width from aspect ratio
    var width = height * aspectRatio;

    // set front quad endpoints
    var frontTopLeft  = new Vector3D(-width, height, near);
    var frontTopRight = new Vector3D( width, height, near);
    var frontBotLeft  = new Vector3D(-width,-height, near);
    var frontBotRight = new Vector3D( width,-height, near);

    // back quad
    height = far * Math.tan(0.5 * fovyRadians);
    width = height * aspectRatio;

    var backTopLeft  = new Vector3D(-width, height, far);
    var backTopRight = new Vector3D( width, height, far);
    var backBotLeft  = new Vector3D(-width,-height, far);
    var backBotRight = new Vector3D( width,-height, far);

    // derive planes from frustum endpoints (specify points in 
    // clockwise order so that plane normals point out of frustum)
    this.left   = new Plane2(frontTopLeft,  frontBotLeft,  backBotLeft);
    this.right  = new Plane2(frontBotRight, frontTopRight, backTopRight);
    this.top    = new Plane2(frontTopLeft,  backTopLeft,   backTopRight);
    this.bottom = new Plane2(frontBotLeft,  frontBotRight, backBotRight);
    this.near  = new Plane2(frontBotLeft,  frontTopLeft,  frontTopRight);
    this.far   = new Plane2(backBotRight,  backTopRight,  backTopLeft);
}

ViewVolume.prototype.setOrthographic = function(left, right, top, bottom, near, far)
{
    // calculate the front and back frustum plane quadrilateral endpoints
    // for a symmetric frustum volume

    // set front quad endpoints
    var frontTopLeft  = new Vector3D(left,  top,    near);
    var frontTopRight = new Vector3D(right, top,    near);
    var frontBotLeft  = new Vector3D(left,  bottom, near);
    var frontBotRight = new Vector3D(right, bottom, near);

    // back quad
    var backTopLeft   = new Vector3D(left,  top,    far);
    var backTopRight  = new Vector3D(right, top,    far);
    var backBotLeft   = new Vector3D(left,  bottom, far);
    var backBotRight  = new Vector3D(right, bottom, far);

    // derive planes from frustum endpoints (specify points in 
    // clockwise order so that plane normals point out of frustum)
    this.left   = new Plane2(backBotLeft,   backTopLeft,   frontTopLeft);
    this.right  = new Plane2(frontBotRight, frontTopRight, backTopRight);
    this.top    = new Plane2(frontTopLeft,  backTopLeft,   backTopRight);
    this.bottom = new Plane2(backBotRight,  backBotLeft,   frontBotLeft);
    this.near  = new Plane2(frontBotLeft,  frontTopLeft,  frontTopRight);
    this.far   = new Plane2(backBotRight,  backTopRight,  backTopLeft);
}

ViewVolume.prototype.getPlane = function(planeEnum)
{
    switch (planeEnum)
    {
    case eViewVolumePlane.Left:
        return left;

    case eViewVolumePlane.Right:
        return right;

    case eViewVolumePlane.Top:
        return top;

    case eViewVolumePlane.Bottom:
        return bottom;

    case eViewVolumePlane.Near:
        return near;

    case eViewVolumePlane.Far:
        return far;
    }
    
    return null;
}

function viewVolumeCull(viewVolume, sphere, scale, worldView)
{
    // get frustum planes
    var left   = viewVolume.left;
    var right  = viewVolume.right;
    var top    = viewVolume.top;
    var bottom = viewVolume.bottom;
    var near  = viewVolume.near;
    var far   = viewVolume.far;

    // transform sphere center by world-view transformation (put into view-space)
    var center = worldView.transform(sphere.center.x, sphere.center.y, sphere.center.z, 1);   

    // adjust sphere radius by scale factor
    var radius = sphere.radius * scale;

    // test center against frustum planes; 
    // if (N·center > d + radius) for a given frustum plane, then the sphere is outside 
    //    the plane (on the side of the plane in the direction of the normal), 
    //    and is thus outside of the frustum;
    // if (N·center < d - radius) for a given frustum plane, then the sphere is inside 
    //    the plane (on the side of the plane in the opposite direction of the normal);
    // if the sphere is inside all frustum planes, then it is inside the frustum
    // if the sphere is neither inside nor outside the frustum, then it is partially
    // contained by the frustum, and thus intersects the frustum.
    if (dotProduct(left.normal, center)  > (left.dot + radius)   ||
        dotProduct(right.normal, center) > (right.dot + radius)  ||
        dotProduct(top.normal, center)   > (top.dot + radius)    ||
        dotProduct(bottom.normal, center)> (bottom.dot + radius) ||
        // near and far planes (in view-space) always have normal (0, 0, +/-1), 
        // so just use the properly signed center z component for comparison
        (near.normal.z > 0 ? center.z : -center.z) > (near.dot + radius) ||
        (far.normal.z > 0 ? center.z : -center.z)  > (far.dot + radius))
    {
        return eCullResult.Outside;
    }

    if (dotProduct(left.normal, center)  < (left.dot - radius)   &&
        dotProduct(right.normal, center) < (right.dot - radius)  &&
        dotProduct(top.normal, center)   < (top.dot - radius)    &&
        dotProduct(bottom.normal, center)< (bottom.dot - radius) &&
        // near and far planes (in view-space) always have normal (0, 0, +/-1), 
        // so just use the properly signed center z component for comparison
        (near.normal.z > 0 ? center.z : -center.z) < (near.dot - radius) &&
        (far.normal.z > 0 ? center.z : -center.z)  < (far.dot - radius))
    {
        return eCullResult.Inside;
    }
    
    return eCullResult.Intersects;
}

function insideViewVolume(viewVolume, point)
{
    return (pointOnNegativeSideOfPlane(point, viewVolume.left) &&
            pointOnNegativeSideOfPlane(point, viewVolume.right) &&
            pointOnNegativeSideOfPlane(point, viewVolume.top) &&
            pointOnNegativeSideOfPlane(point, viewVolume.bottom) &&
            pointOnNegativeSideOfPlane(point, viewVolume.near) &&
            pointOnNegativeSideOfPlane(point, viewVolume.far));
}

