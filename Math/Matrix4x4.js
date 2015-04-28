function Matrix4x4(_11, _12, _13, _14,
                   _21, _22, _23, _24,
                   _31, _32, _33, _34,
                   _41, _42, _43, _44)
{
    this._11 = _11 || 1;
    this._12 = _12 || 0;
    this._13 = _13 || 0;
    this._14 = _14 || 0;

    this._21 = _21 || 0;
    this._22 = _22 || 1;
    this._23 = _23 || 0;
    this._24 = _24 || 0;

    this._31 = _31 || 0;
    this._32 = _32 || 0;
    this._33 = _33 || 1;
    this._34 = _34 || 0;

    this._41 = _41 || 0;
    this._42 = _42 || 0;
    this._43 = _43 || 0;
    this._44 = _44 || 1;
}

Matrix4x4.prototype.alert = function()
{
    alert([[this._11, this._12, this._13, this._14].join(" "),
           [this._21, this._22, this._23, this._24].join(" "),
           [this._31, this._32, this._33, this._34].join(" "),
           [this._41, this._42, this._43, this._44].join(" ")].join("\n") 
    );
}

Matrix4x4.prototype.flatten = function()
{
    var v = [
        this._11, this._12, this._13, this._14,
        this._21, this._22, this._23, this._24,
        this._31, this._32, this._33, this._34,
        this._41, this._42, this._43, this._44
    ];
    
    return v;
}

Matrix4x4.prototype.getAt = function(row, col)
{
    switch (row)
    {
    case 0:
        {
            switch (col)
            {
            case 0: return this._11;
            case 1: return this._12;
            case 2: return this._13;
            case 3: return this._14;
            }
        }
        break;
     
    case 1:
        {
            switch (col)
            {
            case 0: return this._21;
            case 1: return this._22;
            case 2: return this._23;
            case 3: return this._24;
            }
        }
        break;
        
    case 2:
        {
            switch (col)
            {
            case 0: return this._31;
            case 1: return this._32;
            case 2: return this._33;
            case 3: return this._34;
            }
        }
        break;
        
    case 3:
        {
            switch (col)
            {
            case 0: return this._41;
            case 1: return this._42;
            case 2: return this._43;
            case 3: return this._44;
            }
        }
        break;
    }
}

Matrix4x4.prototype.setAt = function(row, col, value)
{
    switch (row)
    {
    case 0:
        {
            switch (col)
            {
            case 0: this._11 = value; break;
            case 1: this._12 = value; break;
            case 2: this._13 = value; break;
            case 3: this._14 = value; break;
            }
        }
        break;
     
    case 1:
        {
            switch (col)
            {
            case 0: this._21 = value; break;
            case 1: this._22 = value; break;
            case 2: this._23 = value; break;
            case 3: this._24 = value; break;
            }
        }
        break;
        
    case 2:
        {
            switch (col)
            {
            case 0: this._31 = value; break;
            case 1: this._32 = value; break;
            case 2: this._33 = value; break;
            case 3: this._34 = value; break;
            }
        }
        break;
        
    case 3:
        {
            switch (col)
            {
            case 0: this._41 = value; break;
            case 1: this._42 = value; break;
            case 2: this._43 = value; break;
            case 3: this._44 = value; break;
            }
        }
        break;
    }
}

Matrix4x4.prototype.load = function(_11, _12, _13, _14,
                                    _21, _22, _23, _24,
                                    _31, _32, _33, _34,
                                    _41, _42, _43, _44)
{
    this._11 = _11;
    this._12 = _12;
    this._13 = _13;
    this._14 = _14;
    
    this._21 = _21;
    this._22 = _22;
    this._23 = _23;
    this._24 = _24;
    
    this._31 = _31;
    this._32 = _32;
    this._33 = _33;
    this._34 = _34;
    
    this._41 = _41;
    this._42 = _42;
    this._43 = _43;
    this._44 = _44;
}

Matrix4x4.prototype.loadMatrix = function(matrix)
{
    this._11 = matrix._11;
    this._12 = matrix._12;
    this._13 = matrix._13;
    this._14 = matrix._14;
    
    this._21 = matrix._21;
    this._22 = matrix._22;
    this._23 = matrix._23;
    this._24 = matrix._24;
    
    this._31 = matrix._31;
    this._32 = matrix._32;
    this._33 = matrix._33;
    this._34 = matrix._34;
    
    this._41 = matrix._41;
    this._42 = matrix._42;
    this._43 = matrix._43;
    this._44 = matrix._44;
}

Matrix4x4.prototype.loadArray = function(array)
{
    this._11 = array[0];
    this._12 = array[1];
    this._13 = array[2];
    this._14 = array[3];

    this._21 = array[4];
    this._22 = array[5];
    this._23 = array[6];
    this._24 = array[7];

    this._31 = array[8];
    this._32 = array[9];
    this._33 = array[10];
    this._34 = array[11];

    this._41 = array[12];
    this._42 = array[13];
    this._43 = array[14];
    this._44 = array[15];
}

Matrix4x4.prototype.loadIdentity = function()
{
    this._11 = 1;
    this._12 = 0;
    this._13 = 0;
    this._14 = 0;
        
    this._21 = 0;
    this._22 = 1;
    this._23 = 0;
    this._24 = 0;
    
    this._31 = 0;
    this._32 = 0;
    this._33 = 1;
    this._34 = 0;
    
    this._41 = 0;
    this._42 = 0;
    this._43 = 0;
    this._44 = 1;
}

Matrix4x4.prototype.loadTranslation = function(x, y, z)
{
    this.loadIdentity();
    
    this._41 = x;
    this._42 = y;
    this._43 = z;
}

Matrix4x4.prototype.loadRotation = function(x, y, z, degrees)
{
    // build rotation (and inverse rotation) matrix to rotate space 
    // about the X axis so that the rotation axis lies in the XZ plane
    var mX = new Matrix4x4();
    var mXinv = new Matrix4x4();
    var v = Math.sqrt(y * y + z * z);
    if (v != 0)
    {
        var y_v = y / v;
        var z_v = z / v;

        mX._22 =  z_v;
        mX._23 =  y_v;
        mX._32 = -y_v;
        mX._33 =  z_v;

        mXinv._22 =  z_v;
        mXinv._23 = -y_v;
        mXinv._32 =  y_v;
        mXinv._33 =  z_v;
    }

    // build rotation (and inverse rotation) matrix to rotate space 
    // about the Y axis so that the rotation axis is aligned with the Z axis
    var mY = new Matrix4x4();
    var mYinv = new Matrix4x4();
    var v2 = magnitude(x, y, z);
    if (v2 != 0)
    {
        var v_v2 = v / v2;
        var x_v2 = x / v2;

        mY._11 =  v_v2;
        mY._13 =  x_v2;
        mY._31 = -x_v2;
        mY._33 =  v_v2;

        mYinv._11 =  v_v2;
        mYinv._13 = -x_v2;
        mYinv._31 =  x_v2;
        mYinv._33 =  v_v2;
    }

    // build rotation matrix to rotate about the Z axis
    var mZ = new Matrix4x4();
    var cosAngle = Math.cos(toRadians(degrees));
    var sinAngle = Math.sin(toRadians(degrees));
    mZ._11 =  cosAngle;
    mZ._12 =  sinAngle;
    mZ._21 = -sinAngle;
    mZ._22 =  cosAngle;

    // sum rotations
    var result = mX.multiply(mY.multiply(mZ.multiply(mYinv.multiply(mXinv))));
    this.loadMatrix(result);
}

Matrix4x4.prototype.loadXAxisRotation = function(degrees)
{
    this.loadIdentity();

    var cosAngle = Math.cos(toRadians(degrees));
    var sinAngle = Math.sin(toRadians(degrees));

    this._22 =  cosAngle;
    this._23 =  sinAngle;
    this._32 = -sinAngle;
    this._33 =  cosAngle;
}

Matrix4x4.prototype.loadYAxisRotation = function(degrees)
{
    this.loadIdentity();

    var cosAngle = Math.cos(toRadians(degrees));
    var sinAngle = Math.sin(toRadians(degrees));

    this._11 =  cosAngle;
    this._13 = -sinAngle;
    this._31 =  sinAngle;
    this._33 =  cosAngle;
}

Matrix4x4.prototype.loadZAxisRotation = function(degrees)
{
    this.loadIdentity();

    var cosAngle = Math.cos(toRadians(degrees));
    var sinAngle = Math.sin(toRadians(degrees));

    this._11 =  cosAngle;
    this._12 =  sinAngle;
    this._21 = -sinAngle;
    this._22 =  cosAngle;
}

Matrix4x4.prototype.loadXYZAxisRotation = function(degreesX, degreesY, degreesZ)
{
    var mX = new Matrix4x4();
    var mY = new Matrix4x4();
    var mZ = new Matrix4x4();

    mX.loadXAxisRotation(degreesX);
    mY.loadYAxisRotation(degreesY);
    mZ.loadZAxisRotation(degreesZ);

    // sum rotations
    var result = mY.multiply(mX.multiply(mZ));
    this.loadMatrix(result);
}

Matrix4x4.prototype.getRotationAngles = function()
{
    var x, y, z;
    
    x = Math.asin(clamp(this._23, -1, 1));
    var cosx = Math.cos(x);
    
    if (!epsilonEqual(cosx, 0, FLT_EPSILON))
    {
        y = Math.atan2(-(this._13) / cosx, this._33 / cosx);
        z = Math.atan2(-(this._21) / cosx, this._22 / cosx); 
    }
    else // cosx == 0
    {
        // remove x-axis rotation to obtain z-axis rotation by 
        // multiplying this matrix with inverse of x-axis rotation
        var zAxisRot = new Matrix4x4();
        zAxisRot.loadXAxisRotation(toDegrees(x));
        zAxisRot.transpose(); // invert rotation
        zAxisRot.loadMatrix(zAxisRot.multiply(this));
        
        y = 0;
        z = Math.atan2(-(zAxisRot._21), zAxisRot._22);
    }
    
    return { x: toDegrees(x), y: toDegrees(y), z: toDegrees(z) };
}

Matrix4x4.prototype.getQuaternion = function()
{
    var m = new Matrix4x4();
    m.loadMatrix(this);
    
    // remove scale
    var scalingFactors = m.getScalingFactors();
    var scale = new Matrix4x4();
    scale.loadScale(1 / scalingFactors.x, 1 / scalingFactors.y, 1 / scalingFactors.z);
    m = m.multiply(scale);
    
    m.transpose();
    
    var q = new Quaternion();
    
    q.w = Math.sqrt( Math.max( 0, 1 + m._11 + m._22 + m._33 ) ) / 2; 
    q.x = Math.sqrt( Math.max( 0, 1 + m._11 - m._22 - m._33 ) ) / 2; 
    q.y = Math.sqrt( Math.max( 0, 1 - m._11 + m._22 - m._33 ) ) / 2; 
    q.z = Math.sqrt( Math.max( 0, 1 - m._11 - m._22 + m._33 ) ) / 2; 
    
    q.x *= SIGN( m._32 - m._23 );
    q.y *= SIGN( m._13 - m._31 );
    q.z *= SIGN( m._21 - m._12 );
    
    return q;
}

Matrix4x4.prototype.loadScale = function(x, y, z)
{
    this.loadIdentity();

    this._11 = x;
    this._22 = y;
    this._33 = z;
}

Matrix4x4.prototype.getScalingFactors = function()
{
    var a, b;
    
    // x
    a = this.transform(1, 0, 0, 0);
    b = this.transform(2, 0, 0, 0);
    var scalingX = magnitude(b.x, b.y, b.z) - magnitude(a.x, a.y, a.z);
    
    // y
    a = this.transform(0, 1, 0, 0);
    b = this.transform(0, 2, 0, 0);
    var scalingY = magnitude(b.x, b.y, b.z) - magnitude(a.x, a.y, a.z);
    
    // z
    a = this.transform(0, 0, 1, 0);
    b = this.transform(0, 0, 2, 0);
    var scalingZ = magnitude(b.x, b.y, b.z) - magnitude(a.x, a.y, a.z);
    
    return { x: scalingX, y: scalingY, z: scalingZ };
}

Matrix4x4.prototype.multiply = function(rhs)
{
    var result = new Matrix4x4();
    
    if (!rhs)
    {
        return null;    
    }
    
    result.load
    (
        this._11 * rhs._11 + this._12 * rhs._21 + this._13 * rhs._31 + this._14 * rhs._41,
        this._11 * rhs._12 + this._12 * rhs._22 + this._13 * rhs._32 + this._14 * rhs._42,
        this._11 * rhs._13 + this._12 * rhs._23 + this._13 * rhs._33 + this._14 * rhs._43,
        this._11 * rhs._14 + this._12 * rhs._24 + this._13 * rhs._34 + this._14 * rhs._44,
        this._21 * rhs._11 + this._22 * rhs._21 + this._23 * rhs._31 + this._24 * rhs._41,
        this._21 * rhs._12 + this._22 * rhs._22 + this._23 * rhs._32 + this._24 * rhs._42,
        this._21 * rhs._13 + this._22 * rhs._23 + this._23 * rhs._33 + this._24 * rhs._43,
        this._21 * rhs._14 + this._22 * rhs._24 + this._23 * rhs._34 + this._24 * rhs._44,
        this._31 * rhs._11 + this._32 * rhs._21 + this._33 * rhs._31 + this._34 * rhs._41,
        this._31 * rhs._12 + this._32 * rhs._22 + this._33 * rhs._32 + this._34 * rhs._42,
        this._31 * rhs._13 + this._32 * rhs._23 + this._33 * rhs._33 + this._34 * rhs._43,
        this._31 * rhs._14 + this._32 * rhs._24 + this._33 * rhs._34 + this._34 * rhs._44,
        this._41 * rhs._11 + this._42 * rhs._21 + this._43 * rhs._31 + this._44 * rhs._41,
        this._41 * rhs._12 + this._42 * rhs._22 + this._43 * rhs._32 + this._44 * rhs._42,
        this._41 * rhs._13 + this._42 * rhs._23 + this._43 * rhs._33 + this._44 * rhs._43,  
        this._41 * rhs._14 + this._42 * rhs._24 + this._43 * rhs._34 + this._44 * rhs._44
     );
     
     return result; 
}

Matrix4x4.prototype.leftMultiply = function(lhs)
{
    var result = lhs.multiply(this);
    
    return result;
}

Matrix4x4.prototype.transpose = function()
{
    var temp = new Matrix4x4();
    temp.loadMatrix(this);
    
    this._11 = temp._11;
    this._12 = temp._21;
    this._13 = temp._31;
    this._14 = temp._41;

    this._21 = temp._12;
    this._22 = temp._22;
    this._23 = temp._32;
    this._24 = temp._42;

    this._31 = temp._13;
    this._32 = temp._23;
    this._33 = temp._33;
    this._34 = temp._43;

    this._41 = temp._14;
    this._42 = temp._24;
    this._43 = temp._34;
    this._44 = temp._44;
}

Matrix4x4.prototype.invert = function(transpose)
{
    var det = determinant4x4(this._11, this._12, this._13, this._14,
                             this._21, this._22, this._23, this._24,
                             this._31, this._32, this._33, this._34,
                             this._41, this._42, this._43, this._44);
    if (det == 0)
    {
        // no inverse
        return;
    }
    
    var inverse  = new Matrix4x4();
    
    var i, j, i2, j2, k;
    
    for (i=0; i < 4; i++)
    {
        for (j=0; j < 4; j++)
        {
            var sub = [];

            for (i2=0, k=0; i2 < 4; i2++)
            {
                if (i2 == i) continue;

                for (j2=0; j2 < 4; j2++)
                {
                    if (j2 == j) continue;

                    sub[k++] = this.getAt(i2, j2);
                }
            }

            inverse.setAt(i, j, determinant3x3(sub[0], sub[1], sub[2], sub[3], sub[4], sub[5], sub[6], sub[7], sub[8]) / det * (i+j & 1 ? -1 : 1));
        }
    }

    // if transpose requested, don't transpose (because inverse is already transposed at this point)
    if (!transpose)
    {
        inverse.transpose();
    }

    this.loadMatrix(inverse);
}

Matrix4x4.prototype.transform = function(x, y, z, w)
{
    var tx, ty, tz;
    
    if (w == 0)
    {
        tx = this._11 * x + this._21 * y + this._31 * z;
        ty = this._12 * x + this._22 * y + this._32 * z;
        tz = this._13 * x + this._23 * y + this._33 * z;
    }
    else if (w == 1)
    {
        tx = this._11 * x + this._21 * y + this._31 * z + this._41;
        ty = this._12 * x + this._22 * y + this._32 * z + this._42;
        tz = this._13 * x + this._23 * y + this._33 * z + this._43;
    }
    else
    {
        tx = this._11 * x + this._21 * y + this._31 * z + this._41 * w;
        ty = this._12 * x + this._22 * y + this._32 * z + this._42 * w;
        tz = this._13 * x + this._23 * y + this._33 * z + this._43 * w;
    } 
    
    return { x: tx, y: ty, z: tz };
}

Matrix4x4.prototype.transformw = function(x, y, z, w)
{
    var tx, ty, tz, tw;
    
    if (w == 0)
    {
        tx = this._11 * x + this._21 * y + this._31 * z;
        ty = this._12 * x + this._22 * y + this._32 * z;
        tz = this._13 * x + this._23 * y + this._33 * z;
        tw = this._14 * x + this._24 * y + this._34 * z;
    }
    else if (w == 1)
    {
        tx = this._11 * x + this._21 * y + this._31 * z + this._41;
        ty = this._12 * x + this._22 * y + this._32 * z + this._42;
        tz = this._13 * x + this._23 * y + this._33 * z + this._43;
        tw = this._14 * x + this._24 * y + this._34 * z + this._44;
    }
    else
    {
        tx = this._11 * x + this._21 * y + this._31 * z + this._41 * w;
        ty = this._12 * x + this._22 * y + this._32 * z + this._42 * w;
        tz = this._13 * x + this._23 * y + this._33 * z + this._43 * w;
        tw = this._14 * x + this._24 * y + this._34 * z + this._44 * w;
    } 
    
    return { x: tx, y: ty, z: tz, w: tw };
}

Matrix4x4.prototype.transformVector3D = function(vector, w)
{
    return this.transform(vector.x, vector.y, vector.z, w);
}