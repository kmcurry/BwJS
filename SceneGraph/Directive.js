function DirectiveParams()
{
    this.directive = null;
    this.path = null;
    this.pathIndex = 0;
    this.currentNodePath = new Stack();
    this.userData = null;
}

Directive.prototype = new AttributeContainer();
Directive.prototype.constructor = Directive;

function Directive()
{
    AttributeContainer.call(this);
    this.className = "Directive";
    this.attrType = eAttrType.Directive;
    
    this.name = new StringAttr("");
    this.enabled = new BooleanAttr(true);
    this.rootNode = new ReferenceAttr(null);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.enabled, "enabled");
    this.registerAttribute(this.rootNode, "rootNode");
}