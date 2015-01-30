function Vector3D(x, y, z)
{
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

    this.equals = function(rhs)
    {
        return (this.x == rhs.x &&
                this.y == rhs.y &&
                this.z == rhs.z);
    }
}

Vector3D.prototype.alert = function()
{
    var msg  = "x: " + this.x + "\n";
        msg += "y: " + this.y + "\n";
        msg += "z: " + this.z + "\n";
    alert(msg);
}

Vector3D.prototype.v = function()
{
    var values = [ this.x, this.y, this.z ];
    return values;
}

Vector3D.prototype.load = function(x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
}

Vector3D.prototype.copy = function(vector)
{
    if (vector)
    {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
    }
}

Vector3D.prototype.multiplyScalar = function(scalar)
{
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
}

Vector3D.prototype.multiplyVector = function(vector)
{
    this.x *= vector.x;
    this.y *= vector.y;
    this.z *= vector.z;
}

Vector3D.prototype.addVector = function(vector)
{
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
}

Vector3D.prototype.subtractVector = function(vector)
{
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
}

Vector3D.prototype.normalize = function()
{
    var mag = magnitude(this.x, this.y, this.z);
    if (mag != 0)
    {
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }
}

function dotProduct(v1, v2)
{
    return ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
}

function crossProduct(v1, v2)
{
    var result = new Vector3D();
    
    result.x = (v1.y * v2.z) - (v1.z * v2.y);
    result.y = (v1.z * v2.x) - (v1.x * v2.z);
    result.z = (v1.x * v2.y) - (v1.y * v2.x);
    
    return result;
}

function cosineAngleBetween(v1, v2)
{
    var mag = magnitude(v1.x, v1.y, v1.z) * magnitude(v2.x, v2.y, v2.z);
    if (mag != 0)
    {
        var cosAngle = dotProduct(v1, v2) / mag;

        // clamp values between -1 and 1
        if (cosAngle > 1) cosAngle = 1;
        else if (cosAngle < -1) cosAngle = -1;

        return cosAngle;
    }

    return 1;
}

function midpoint(v1, v2)
{
    var result = new Vector3D();
    
    result.x = (v1.x + v2.x) / 2;
    result.y = (v1.y + v2.y) / 2;
    result.z = (v1.z + v2.z) / 2;
    
    return result;
}

function distanceBetween(v1, v2)
{
    return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + 
                     (v1.y - v2.y) * (v1.y - v2.y) +
                     (v1.z - v2.z) * (v1.z - v2.z));
}

function subtract3D(v1, v2)
{
    var result = new Vector3D(v1.x, v1.y, v1.z);
    result.subtractVector(v2);
    return result;
}