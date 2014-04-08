function Vector4D(x, y, z, w)
{
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
}

Vector4D.prototype.v = function()
{
    var values = [ this.x, this.y, this.z, this.w ];
    return values;
}

Vector4D.prototype.load = function(x, y, z, w)
{
    if (Vector4D)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

Vector4D.prototype.copy = function(vector)
{
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    this.w = vector.w;
}