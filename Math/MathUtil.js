var FLT_EPSILON = 1.192092896e-07;
var FLT_MAX     = 3.402823466e+38;

var TWOPI     = Math.PI * 2;
var HALFPI    = Math.PI / 2;
var QUARTERPI = Math.PI / 4;

function min3(x, y, z)
{
    return Math.min(x, Math.min(y, z));
}

function max3(x, y, z)
{
    return Math.max(x, Math.max(y, z));
}

function toRadians(degrees)
{
    return degrees * Math.PI / 180;
}

function toDegrees(radians)
{
    return radians * 180 / Math.PI;
}

function magnitude(x, y, z)
{
    return Math.sqrt(((x) * (x)) + ((y) * (y)) + ((z) * (z)));
}

function clamp(value, min, max)
{
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

/*
 * Normalize a degree value so that it falls between [0, 360)
 * @params deg the degree value to normalize
 * @return T the normalized value
 */
function degreeNormalize(deg)
{
    while (deg < 0)
    {
        deg += 360;
    }

    while (deg >=360)
    {
        deg -= 360;
    }

    return deg;
}

function epsilonEqual(value1, value2, epsilon)
{
    if (Math.abs(value1 - value2) < epsilon)
    {
        return true;
    }
    
    return false;
}

function determinant2x2(_11, _12, 
                        _21, _23)
{
    return (_11 * _23) - (_12 * _21);
}

function determinant3x3(_11, _12, _13, 
                        _21, _22, _23,
                        _31, _32, _33)
{
    var a = determinant2x2(_22, _23, _32, _33);
    var b = determinant2x2(_21, _23, _31, _33);
    var c = determinant2x2(_21, _22, _31, _32);
    
    return (_11 * a) - (_12 * b) + (_13 * c);
}
        
function determinant4x4(_11, _12, _13, _14,
                        _21, _22, _23, _24,
                        _31, _32, _33, _34,
                        _41, _42, _43, _44)
{
    var a = determinant3x3(_22, _23, _24, _32, _33, _34, _42, _43, _44);
    var b = determinant3x3(_21, _23, _24, _31, _33, _34, _41, _43, _44);
    var c = determinant3x3(_21, _22, _24, _31, _32, _34, _41, _42, _44);
    var d = determinant3x3(_21, _22, _23, _31, _32, _33, _41, _42, _43);
    
    return (_11 * a) - (_12 * b) + (_13 * c) - (_14 * d);  
}        

function modf(x)
{
    var integerPart = (x < 0 ? Math.ceil(x) : Math.floor(x));
    var fractionalPart = x - integerPart;
    
    return { integerPart: integerPart, fractionalPart: fractionalPart };
}

function XYZtoH(x, y, z)
{
    var heading = 0;
    
    if (x == 0)
    {
        if (z >= 0)
        {
            heading = 0.0;
        }
        else
        {
            heading = Math.PI;
        }
    }
    else if (z == 0)
    {
        if (x >= 0)
        {
            heading = 3 * HALFPI;
        }
        else
        {
            heading = HALFPI;
        }
    }
    else
    {
        if (x > 0 && z > 0) // I
        {
            heading = TWOPI - Math.atan(x / z);
        }
        else if (x < 0 && z > 0) // II
        {
            heading = -Math.atan(x / z);
        }
        else if (x < 0 && z < 0)  // III
        {
            heading = HALFPI + Math.atan(z / x);
        }
        else // (x > 0 && z < 0)  // IV
        {
            heading = 3 * HALFPI + Math.atan(z / x);
        }
    }
    
    return heading;
}

function XYZtoHP(x, y, z)
{
    var heading = 0;
    var pitch = 0;
    
    if (x == 0 && z == 0) 
    {
        heading = 0;
        if (y != 0)
        {
            pitch = (y < 0 ? -HALFPI : HALFPI);
        }
        else
        {
            pitch = 0;
        }
    }
    else 
    {
        if (z == 0)
        {
            heading = (x > 0 ? HALFPI : -HALFPI);
        }
        else if (z < 0)
        {
            heading = -Math.atan(x / z) + Math.PI;
        }
        else
        {
            heading = -Math.atan(x / z);
        }

        x = Math.sqrt(x * x + z * z);

        if (x == 0)
        {
            pitch = (y < 0 ? -HALFPI : HALFPI);
        }
        else
        {
            pitch = Math.atan(y / x);
        }
    }
    
    return { heading: heading, pitch: pitch };
}

function rectContainsPoint(x, y, rect)
{
    if (x >= rect.left &&
        y >= rect.top &&
        x <= rect.right &&
        y <= rect.bottom)
        return true;
        
    return false;
}