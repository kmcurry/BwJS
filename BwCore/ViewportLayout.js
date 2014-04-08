ViewportLayout.prototype = new AttributeContainer();
ViewportLayout.prototype.constructor = ViewportLayout;

function ViewportLayout()
{
    AttributeContainer.call(this);
    this.className = "ViewportLayout";
    
    this.name = new StringAttr("ViewportLayout");
    this.width = new NumberAttr(0);
    this.height = new NumberAttr(0);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.width, "width");
    this.registerAttribute(this.height, "height");
}

ViewportLayout.prototype.initialize = function()
{
}

ViewportLayout.prototype.layoutDirectives = function(directives)
{
}
