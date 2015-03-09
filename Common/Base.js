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
//These are created in global scope that way 3Scape can access them
var message = "";
var imgeData = "";
var cimageData = "";
var serializedScene = "";

Allocator.prototype.allocate = function()
{
    return null;
}