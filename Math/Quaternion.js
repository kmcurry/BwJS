function Quaternion()
{
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
}

Quaternion.prototype.load = function(w, x, y, z)
{
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
}

Quaternion.prototype.loadQuaternion = function(quaternion)
{
    this.w = quaternion.w;
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
}

Quaternion.prototype.loadArray = function(array)
{
    this.w = array[0];
    this.x = array[1];
    this.y = array[2];
    this.z = array[3];
}

Quaternion.prototype.loadIdentity = function()
{
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
}

Quaternion.prototype.magnitude = function()
{
    return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
}

Quaternion.prototype.normalize = function()
{
    var magnitude = this.magnitude();
    
    this.w /= magnitude;
    this.x /= magnitude;
    this.y /= magnitude;
    this.z /= magnitude; 
}

Quaternion.prototype.loadRotation = function(x, y, z, degrees)
{
    var radians = toRadians(degrees) / 2;
    
    var sinAngle = Math.sin(radians);
    var cosAngle = Math.cos(radians);
    
    this.w = cosAngle;
    this.x = x * sinAngle;
    this.y = y * sinAngle;
    this.z = z * sinAngle;
    
    this.normalize();
}

Quaternion.prototype.loadXAxisRotation = function(degrees)
{
    var radians = toRadians(degrees) / 2;
    
    this.w = Math.cos(radians);
    this.x = Math.sin(radians);
    this.y = 0;
    this.z = 0;
}

Quaternion.prototype.loadYAxisRotation = function(degrees)
{
    var radians = toRadians(degrees) / 2;
    
    this.w = Math.cos(radians);
    this.x = 0
    this.y = Math.sin(radians);;
    this.z = 0;
}

Quaternion.prototype.loadZAxisRotation = function(degrees)
{
    var radians = toRadians(degrees) / 2;
    
    this.w = Math.cos(radians);
    this.x = 0;
    this.y = 0;
    this.z = Math.sin(radians);
}

Quaternion.prototype.loadXYZAxisRotation = function(degreesX, degreesY, degreesZ)
{
    var radiansX = toRadians(degreesX) / 2;
    var radiansY = toRadians(degreesY) / 2;
    var radiansZ = toRadians(degreesZ) / 2;
    
    var qX = new Quaternion();
    qX.load(Math.cos(radiansX), Math.sin(radiansX), 0, 0);
    
    var qY = new Quaternion();
    qY.load(Math.cos(radiansY), 0, Math.sin(radiansY), 0);
    
    var qZ = new Quaternion();
    qZ.load(Math.cos(radiansZ), 0, 0, Math.sin(radiansZ));
    
    // sum rotations
    var result = qY.multiply(qX.multiply(qZ));
    this.loadQuaternion(result);
}

Quaternion.prototype.multiply = function(rhs)
{
    var result = new Quaternion();
    
    result.load
    (
        this.w * rhs.w - this.x * rhs.x - this.y * rhs.y - this.z * rhs.z,
        this.w * rhs.x + this.x * rhs.w + this.y * rhs.z - this.z * rhs.y,
        this.w * rhs.y + this.y * rhs.w + this.z * rhs.x - this.x * rhs.z,
        this.w * rhs.z + this.z * rhs.w + this.x * rhs.y - this.y * rhs.x    
    );
    
    return result;
}

Quaternion.prototype.getMatrix = function()
{
    var matrix = new Matrix4x4();
    
    var x2 = this.x + this.x;
    var y2 = this.y + this.y;
    var z2 = this.z + this.z;
    var xx = this.x * x2;
    var xy = this.x * y2;
    var xz = this.x * z2;
    var yy = this.y * y2;
    var yz = this.y * z2;
    var zz = this.z * z2;
    var wx = this.w * x2;
    var wy = this.w * y2;
    var wz = this.w * z2;

    matrix._11 = 1 - (yy + zz);
    matrix._21 = xy - wz;
    matrix._31 = xz + wy;
    matrix._41 = 0;

    matrix._12 = xy + wz;
    matrix._22 = 1 - (xx + zz);
    matrix._32 = yz - wx;
    matrix._42 = 0;

    matrix._13 = xz - wy;
    matrix._23 = yz + wx;
    matrix._33 = 1 - (xx + yy);
    matrix._43 = 0;

    matrix._14 = 0;
    matrix._24 = 0;
    matrix._34 = 0;
    matrix._44 = 1;
    
    return matrix;
}
