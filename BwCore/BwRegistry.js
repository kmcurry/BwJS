BwRegistry.prototype = new AttributeRegistry();
BwRegistry.prototype.constructor = BwRegistry;

function BwRegistry()
{
    AttributeRegistry.call(this);
    this.className = "BwRegistry";
    this.attrType = eAttrType.AttributeRegistry;
    
    this.rootPtr = new ReferenceAttr(null);
    this.subtreePtr = new ReferenceAttr(null);
    this.sgPointer = new StringAttr("");
    this.maxAnimationTimeInSecs = new NumberAttr(0);

    this.rootPtr.addModifiedCB(BwRegistry_RootPtrModifiedCB, this);
    this.sgPointer.addModifiedCB(BwRegistry_SgPointerModifiedCB, this);
    
    this.registerAttribute(this.rootPtr, "rootPtr");
    this.registerAttribute(this.subtreePtr, "subtreePtr");
    this.registerAttribute(this.sgPointer, "sgPointer");
    this.registerAttribute(this.maxAnimationTimeInSecs, "maxAnimationTimeInSecs");
    
    this.registerByName(this, "NodeMgr");      // backward-compatibility
    this.registerByName(this, "EvaluatorMgr"); // backward-compatibility
}

BwRegistry.prototype.find = function(name)
{
    if (!name) return null;
    
    // tokenize name path
    var tokens = [];
    var index = 0;
    while ((index = name.indexOf('/')) > -1)
    {
        tokens.push(name.substring(0, index));
        name = name.substring(index+1, name.length);
    }
    tokens.push(name);
    
    // call get() on first token
    var resource = this.getByName(tokens[0]);
    if (resource) resource = resource[0];
    
    // call getAttribute() on subsequent tokens
    for (var i=1; i < tokens.length && resource; i++)
    {
        resource = resource.getAttribute(tokens[i]);
    }
    
    return resource;
}

BwRegistry.prototype.findContext = function(name, context)
{
    // TODO
}

BwRegistry.prototype.registerResource = function(container)
{
    // setup parent relationship for nodes (not all containers passed to this method will be nodes)
    if (container.isNode() && container.getAttribute("orphan").getValueDirect() == false)
    {
        this.updateTree(container);
    }
}

BwRegistry.prototype.finalizeResource = function(container)
{
    if (container.isNode() && container.getParentCount() > 0)
    {
        this.subtreePtr.setValueDirect(container.getParent(0));
    }
}

BwRegistry.prototype.register = function(container)
{
    // call base-class implementation
    AttributeRegistry.prototype.register.call(this, container);
    
    // TODO
}

BwRegistry.prototype.unregister = function(container)
{
    // call base-class implementation
    AttributeRegistry.prototype.unregister.call(this, container);
    
    // TODO
}

BwRegistry.prototype.clear = function()
{
    this.rootPtr.setValueDirect(null);
    this.subtreePtr.setValueDirect(null);
    this.sgPointer.setValueDirect(null);
    
    // call base-class implementation
    AttributeRegistry.prototype.clear.call(this);    
}

BwRegistry.prototype.updateTree = function(node)
{
    var root = this.rootPtr.getValueDirect();
    var subtree = this.subtreePtr.getValueDirect();
  
    // by default, first node is the root
    if (root == null)
    {
        root = subtree = node;
    }
    else
    {
        if (subtree)
        {
            subtree.addChild(node);
        }
        else
        {
            root.addChild(node);
        }
        
        subtree = node;
    }
    
    this.rootPtr.setValueDirect(root);
    this.subtreePtr.setValueDirect(subtree);
}

BwRegistry.prototype.updateMaxAnimationTime = function()
{
    // TODO
}

BwRegistry.prototype.formatContext = function(attribute, name)
{
    // TODO
}

BwRegistry.prototype.sgPointerModified = function()
{
    var resource = this.find(this.sgPointer.getValueDirect().join(""));
    if (resource)
    {
        this.subtreePtr.setValueDirect(resource);
    }
}

function BwRegistry_RootPtrModifiedCB(attribute, container)
{
    var resource = attribute.getValueDirect();
}

function BwRegistry_SgPointerModifiedCB(attribute, container)
{
    container.sgPointerModified();
}