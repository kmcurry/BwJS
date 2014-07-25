function Context()
{
    this.clear();
}

Context.prototype.clear = function()
{
    this.container = null;
    this.attribute = null;
    this.item = 0;
    this.containerName = "";
    this.attributeName = "";
}