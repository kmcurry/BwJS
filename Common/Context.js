function Context()
{
    this.container = null;
    this.attribute = null;
    this.item = new NumberAttr(0);
    this.containerName = new StringAttr("");
    this.attributeName = new StringAttr("");
}

Context.prototype.clear = function()
{
    this.container = null;
    this.attribute = null;
    this.item = 0;
    this.containerName = "";
    this.attributeName = "";
}