Group.prototype = new SGNode();
Group.prototype.constructor = Group;

function Group()
{
    SGNode.call(this);
    this.className = "Group";
    this.attrType = eAttrType.Group;

    this.proxyChildAttrs = new BooleanAttr(false);

    this.proxyChildAttrs.addModifiedCB(Group_ProxyChildAttrsModifiedCB, this);

    this.registerAttribute(this.proxyChildAttrs, "proxyChildAttrs");
}

Group.prototype.addChild = function(child)
{
    if (this.proxyChildAttrs.getValueDirect() == true)
    {
        this.proxyAttributes(child);
    }

    // call base-class implementation
    SGNode.prototype.addChild.call(this, child);
}

Group.prototype.insertChild = function(child, at)
{
    if (this.proxyChildAttrs.getValueDirect() == true)
    {
        this.proxyAttributes(child);
    }

    // call base-class implementation
    SGNode.prototype.insertChild.call(this, child, at);
}

Group.prototype.removeChild = function(child)
{
    if (this.proxyChildAttrs.getValueDirect() == true)
    {
        //UnProxyAttributes(child);
        this.synchronizeProxiedAttributes();
    }

    // call base-class implementation
    return SGNode.prototype.removeChild.call(this, child);
}

Group.prototype.replaceChild = function(replacement, replacee)
{
    if (this.proxyChildAttrs.getValueDirect() == true)
    {
        //UnProxyAttributes(replacee);
        this.proxyAttributes(replacement);
        this.synchronizeProxiedAttributes(); // replacement might not be the same type as replacee
    }

    // call base-class implementation
    return SGNode.prototype.replaceChild.call(this, replacement, replacee);
}

Group.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    SGNode.prototype.update.call(this, params, visitChildren);
}

Group.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class implementation
    SGNode.prototype.apply.call(this, directive, params, visitChildren);
}

Group.prototype.proxyChildAttrsModified = function()
{
    // TODO
}

function Group_ProxyChildAttrsModifiedCB(attribute, container)
{
    container.proxyChildAttrsModified();
}

function Group_ProxiedAttrModifiedCB(attribute, data)
{
    data.group.proxiedAttrModified(data.proxiedNodeTypeString, attribute, data.proxiedAttrName);
}
