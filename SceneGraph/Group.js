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
    
    this.enableDisplayList.addModifiedCB(Group_EnableDisplayListModifiedCB, this);
    
    // enable auto-display lists
    this.autoDisplayList.setValueDirect(true);
    this.autoDisplayList.addModifiedCB(Group_AutoDisplayListModifiedCB, this);
}

Group.prototype.addChild = function(child)
{
	if (this.proxyChildAttrs.getValueDirect() == true)
    {
        this.proxyAttributes(child);
    }

    var autoDL = child.getAttribute("autoDisplayList");
    if (autoDL)
    {
        autoDL.addTarget(this.autoDisplayList, eAttrSetOp.AND);
        autoDL.addModifiedCB(Group_ChildAutoDisplayListModifiedCB, this);
    }
	else // cannot use auto display lists because child doesn't support them
	{
		this.autoDisplayList.setValueDirect(false);
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

    var autoDL = child.getAttribute("autoDisplayList");
    if (autoDL)
    {
        autoDL.addTarget(this.autoDisplayList, eAttrSetOp.AND);
        autoDL.addModifiedCB(Group_ChildAutoDisplayListModifiedCB, this);
    }
	else // cannot use auto display lists because child doesn't support them
	{
		this.autoDisplayList.setValueDirect(false);
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

    var autoDL = child.getAttribute("autoDisplayList");
    if (autoDL)
    {
        autoDL.removeTarget(this.autoDisplayList, eAttrSetOp.AND);
        autoDL.removeModifiedCB(Group_ChildAutoDisplayListModifiedCB, this);
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

	var autoDL = replacee.getAttribute("autoDisplayList");
    if (autoDL)
    {
        autoDL.removeTarget(this.autoDisplayList, eAttrSetOp.AND);
        autoDL.removeModifiedCB(Group_ChildAutoDisplayListModifiedCB, this);
    }
    
    autoDL = replacement.getAttribute("autoDisplayList");
    if (autoDL)
    {
    	autoDL.addTarget(this.autoDisplayList, eAttrSetOp.AND);
    	autoDL.addModifiedCB(Group_ChildAutoDisplayListModifiedCB, this);	
    }
    else // cannot use auto display lists because replacement doesn't support them
	{
		this.autoDisplayList.setValueDirect(false);
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

Group.prototype.childAutoDisplayListModified = function()
{
    // check the state of all children's autoDisplayList.  If all are set to true, set this node's autoDisplayList to true; if any
    // are set to false, set this node's autoDisplayList to false (cannot rely solely upon the fact that the children's autoDisplayList
    // attribute are 'AND' targeted to this node's autoDisplayList, because as soon as this node's autoDisplayList is false, 'AND' with
    // all children will still be false, even if all children are true; that portion of the algorithm handles the case when a child with
    // autoDisplayList set to false is added to this; this step handles the other portion of the algorithm).
    var autoDL = true;
    for (var i=0; i < this.children.length; i++)
    {
        childAutoDL = this.children[i].getAttribute("autoDisplayList");
        if (childAutoDL)
        {
            autoDL &= childAutoDL.getValueDirect();
            if (!autoDL)
            {
                break;
            }
        }
    }

    this.autoDisplayList.setValueDirect(autoDL);
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
    var enableDL = attribute.getValueDirect();    
}

function Group_AutoDisplayListModifiedCB(attribute, container)
{
    var autoDL = attribute.getValueDirect();
    if (!autoDL && container)
    {
        if (container.enableDisplayList.getValueDirect() == true)
        {
            container.enableDisplayList.setValueDirect(attribute.getValueDirect());
        }
    }  
}

function Group_ChildAutoDisplayListModifiedCB(attribute, container)
{
    container.childAutoDisplayListModified();
}

