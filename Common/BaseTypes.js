function Color()
{
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
}

Color.prototype.v = function()
{
    var values = [ this.r, this.g, this.b, this.a ];
    return values; 
}

Color.prototype.load = function(r, g, b, a)
{
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

Color.prototype.copy = function(color)
{
    if (color)
    {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }
}

function Pair(first, second)
{
    this.first = first;
    this.second = second;
}

function Rect(left, top, right, bottom)
{
    this.left = left || 0;
    this.top = top || 0;
    this.right = right || 0;
    this.bottom = bottom || 0;
}

Rect.prototype.load = function(left, top, right, bottom)
{
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
}

Rect.prototype.loadRect = function(rect)
{
    this.left = rect.left;
    this.top = rect.top;
    this.right = rect.right;
    this.bottom = rect.bottom;
}

function Viewport()
{
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    
    this.equals = function(rhs)
    {
        return (this.x == rhs.x &&
                this.y == rhs.y &&
                this.width == rhs.width &&
                this.height == rhs.height); 
    }
}

Viewport.prototype.load = function(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Viewport.prototype.loadViewport = function(vp)
{
    this.x = vp.x;
    this.y = vp.y;
    this.width = vp.width;
    this.height = vp.height;
}

Viewport.prototype.containsPoint = function(x, y)
{
    if (x >= this.x &&
        y >= this.y &&
        x <= (this.x + this.width) &&
        y <= (this.y + this.height))
        return true;

    return false;
}