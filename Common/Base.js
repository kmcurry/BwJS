function Base() 
{
    this.userData = "";
    this.className = "";
}

Base.prototype.destroy = function()
{
    delete this;
}

function Allocator()
{
}

Allocator.prototype.allocate = function()
{
    return null;
}