function Vector2D(x, y)
{
    this.x = x || 0;
    this.y = y || 0;
}

Vector2D.prototype.v = function()
{
    var values = [ this.x, this.y ];
    return values;
}

Vector2D.prototype.load = function(x, y)
{
    this.x = x;
    this.y = y;
}

Vector2D.prototype.copy = function(vector)
{
    if (vector)
    {
        this.x = vector.x;
        this.y = vector.y;
    }
}