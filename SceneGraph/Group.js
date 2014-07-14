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

Group.prototype.childAutoDisplayListModified = function()
{
    
}

function Group_ProxyChildAttrsModifiedCB(attribute, container)
{
    container.proxyChildAttrsModified();
}

function Group_ProxiedAttrModifiedCB(attribute, data)
{
    data.group.proxiedAttrModified(data.proxiedNodeTypeString, attribute, data.proxiedAttrName);
}

function Group_EnableDisplayListModifiedCB(attribute, container)
{
    
}

function Group_AutoDisplayListModifiedCB(attribute, container)
{
    
}

function Group_ChildAutoDisplayListModifiedCB(attribute, container)
{
    
}

