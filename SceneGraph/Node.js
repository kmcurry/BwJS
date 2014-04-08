Node.prototype = new AttributeContainer();
Node.prototype.constructor = Node;

function Node()
{
    AttributeContainer.call(this);
    this.className = "Node";
    this.attrType = eAttrType.Node;
    
    this.children = [];
    this.parents = [];
    
    this.name = new StringAttr("");
    this.enabled = new BooleanAttr(true);
    this.orphan = new BooleanAttr(false);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.enabled, "enabled");
    this.registerAttribute(this.orphan, "orphan");
}

Node.prototype.isNode = function()
{
    return true;
}

Node.prototype.addChild = function(child)
{
    this.children.push(child);
    
    child.addParent(this);
}

Node.prototype.insertChild = function(child, before)
{
    this.children.splice(before, 0, child);
    
    child.addParent(this);
}

Node.prototype.removeChild = function(child)
{
    this.children.splice(this.children.indexOf(child), 1);
    
    child.removeParent(this);
}

Node.prototype.replaceChild = function(replacement, replacee)
{
    this.children.splice(this.children.indexOf(replacement), 1, replacee);
    replacement.removeParent(this);
    replacee.addParent(this);
}

Node.prototype.getChild = function(n)
{
    if (this.children.length > n)
    {
        return this.children[n];
    }
    
    return null;
}

Node.prototype.getNamedChild = function(name)
{
    for (var i=0; i < this.children.length; i++)
    {
        if (this.children[i].name.getValueDirect().join("") == name)
        {
            return this.children[i];
        }
    }
    
    return null;
}

Node.prototype.getChildCount = function()
{
    return this.children.length;
}

Node.prototype.getParent = function(n)
{
    if (this.parents.length > n)
    {
        return this.parents[n];
    }
    
    return null;
}

Node.prototype.getParentCount = function()
{
    return this.parents.length;
}

Node.prototype.addParent = function(parent)
{
    this.parents.push(parent);
}

Node.prototype.removeParent = function(parent)
{
    this.parents.splice(this.parents.indexOf(parent), 1);
}

Node.prototype.update = function(params, visitChildren)
{
    params.path.push(this);
    
    if (visitChildren)
    {
        // call for all children
        for (var i=0; i < this.children.length; i++)
        {
            this.children[i].update(params, visitChildren);
        }
    }
    
    params.path.pop();
}

Node.prototype.updateNode = function(node, params, visitChildren)
{
    node.update(params, visitChildren);
}

Node.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }

    params.path.push(this);
    
    if (visitChildren)
    {
        // call for all children
        for (var i=0; i < this.children.length; i++)
        {
            this.children[i].apply(directive, params, visitChildren);
        }  
    }
    
    params.path.pop();
}

Node.prototype.applyNode = function(node, directive, params, visitChildren)
{
    node.apply(directive, params, visitChildren);
}