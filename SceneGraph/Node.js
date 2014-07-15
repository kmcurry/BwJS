Node.prototype = new AttributeContainer();
Node.prototype.constructor = Node;

function Node()
{
    AttributeContainer.call(this);
    this.className = "Node";
    this.attrType = eAttrType.Node;
    
    this.children = [];
    this.parents = [];
    this.modificationCount = 0;
    this.thisModified = false;
    this.childModified = false;
    this.childrenModified = [];
    
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
    
    this.incrementModificationCount();
    
    child.addParent(this);
}

Node.prototype.insertChild = function(child, before)
{
    this.children.splice(before, 0, child);
    
    this.incrementModificationCount();
    
    child.addParent(this);
}

Node.prototype.removeChild = function(child)
{
    this.children.splice(this.children.indexOf(child), 1);
    
    this.incrementModificationCount();
    
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
    // only update if this and/or child has been modified
    if (!this.thisModified && !this.childModified)
    {
        // no need to update; inform parent this node is unmodified
        this.setChildModified(false, false);
        params.visited.push(this);
        return;
    }
    
    params.visited.push(this);
    
    if (visitChildren)
    {
        // call for all children
        for (var i=0; i < this.children.length; i++)
        {
            this.children[i].update(params, visitChildren);
        }
    }
    
    this.childModified = this.isChildModified();
}

Node.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }

    if (visitChildren)
    {
        if (params.path)
        {
            // call for next node in path if next node in path is a child of this node
            if (params.path.length > params.pathIndex)
            {
                for (var i=0; i < this.children.length; i++)
                {
                    var next = params.path[params.pathIndex];

                    if (this.children[i] == next)
                    {
                        params.pathIndex++;
                        this.children[i].apply(directive, params, visitChildren);
                    }
                }
            }
        }
        else
        {
            // call for all children
            for (var i=0; i < this.children.length; i++)
            {
                this.children[i].apply(directive, params, visitChildren);
            }
        }
    }
}

Node.prototype.applyNode = function(node, directive, params, visitChildren)
{
    node.apply(directive, params, visitChildren);
}

Node.prototype.setModified = function()
{
    this.thisModified = true;

    // notify parent(s) of modification so that display lists can be maintained
    this.setChildModified(true, true);
}

Node.prototype.incrementModificationCount = function()
{
    this.modificationCount++;
    
    this.setModified();
}

Node.prototype.setChildModified = function(modified, recurse)
{
    // set on parent(s) of this; recurse if specified
    var parent = null;
    for (var i=0; i < this.parents.length; i++)
    {
        parent = this.parents[i];
        if (parent)
        {
            parent.childrenModified[this] = modified;
            parent.childModified = modified ? true : parent.isChildModified();
            if (recurse) parent.setChildModified(modified, recurse);
        }
    }
}

Node.prototype.isChildModified = function()
{
    for (var i in this.childrenModified)
    {
        if (this.childrenModified[i] == true) return true;
    }

    return false;
}