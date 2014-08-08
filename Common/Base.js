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

var message = "";
var imgeData = "";
var cimageData = "";

Allocator.prototype.allocate = function()
{
    return null;
}