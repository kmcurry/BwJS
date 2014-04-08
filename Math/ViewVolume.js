function ViewVolume()
{
    this.left = null;
    this.right = null;
    this.top = null;
    this.bottom = null;
    this.near = null;
    this.far = null;
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
    this.left   = new Plane2(frontTopLeft, frontBotLeft, backBotLeft);
    this.right  = new Plane2(frontBotRight, frontTopRight, backTopRight);
    this.top    = new Plane2(frontTopLeft,  backTopLeft,   backTopRight);
    this.bottom = new Plane2(frontBotLeft, frontBotRight, backBotRight);
    this.near   = new Plane2(frontBotLeft,  frontTopLeft,  frontTopRight);
    this.far    = new Plane2(backBotRight,  backTopRight,  backTopLeft);
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
    this.near   = new Plane2(frontBotLeft,  frontTopLeft,  frontTopRight);
    this.far    = new Plane2(backBotRight,  backTopRight,  backTopLeft);
}