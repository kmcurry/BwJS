AttributeContainer.prototype = new Attribute();
AttributeContainer.prototype.constructor = AttributeContainer;

function AttributeContainer()
{
    Attribute.call(this);
    this.className = "AttributeContainer";
    this.attrType = eAttrType.AttributeContainer;

    this.attrNameMap = [];
    this.attrModifiedCountMap = [];
}

AttributeContainer.prototype.destroy = function()
{
    // destroy all registered attributes with this as the container
    for (var i in this.attrNameMap)
    {
        for (var j=0; j < this.attrNameMap[i].length; j++)
        {
            var attr = this.attrNameMap[i][j];
            if (attr.getContainer() == this)
            {
                attr.destroy();
            }
        }
    }

    // call base-class implementation
    Attribute.prototype.destroy.call(this);
}

AttributeContainer.prototype.isContainer = function()
{
    return true;
}

AttributeContainer.prototype.registerAttribute = function(attribute, name)
{
    if (this.attrNameMap[name] == undefined)
    {
        this.attrNameMap[name] = new Array();
    }
    this.attrNameMap[name].push(attribute);
    //this.attrModifiedCountMap[attribute] = 0; // doesn't work
    this.attrModifiedCountMap.push(new Pair(attribute, 0));

    // set the container if null
    if (!attribute.getContainer())
    {
        attribute.setContainer(this);
    }

    attribute.addModifiedCB(AttributeContainer_AttributeModifiedCB, this);
    attribute.addModifiedCB(AttributeContainer_AttributeModifiedCounterCB, this);
}

AttributeContainer.prototype.unregisterAttribute = function(attribute)
{
    for (var i in this.attrNameMap)
    {
        for (var j=0; j < this.attrNameMap[i].length; j++)
        {
            if (this.attrNameMap[i][j] == attribute)
            {
                attribute.removeModifiedCB(AttributeContainer_AttributeModifiedCB, this);
                attribute.removeModifiedCB(AttributeContainer_AttributeModifiedCounterCB, this);
                delete this.attrNameMap[i][j];
                this.attrNameMap[i].splice(j,1);
                break;
            }
        }
    }
}

AttributeContainer.prototype.getAttribute = function(name)
{
    if (this.attrNameMap[name] == undefined)
    {
        return null;
    }
    
    return this.attrNameMap[name][0];
}

AttributeContainer.prototype.getAttributeAt = function(index)
{
    var count = 0;
    for (var i in this.attrNameMap)
    {
        for (var j=0; j < this.attrNameMap[i].length; j++)
        {
            if (count == index)
            {
                return this.attrNameMap[i][j];
            }
            count++;
        }
    }
    
    return null;
}

AttributeContainer.prototype.getAttributeName = function(attribute)
{
    var count = 0;
    for (var i in this.attrNameMap)
    {
        for (var j=0; j < this.attrNameMap[i].length; j++)
        {
            if (this.attrNameMap[i][j] == attribute)
            {
                return i;
            }
            count++;
        }
    }

    return null;
}

AttributeContainer.prototype.getAttributeNameAt = function(index)
{
    var count = 0;
    for (var i in this.attrNameMap)
    {
        for (var j=0; j < this.attrNameMap[i].length; j++)
        {
            if (count == index)
            {
                return i;
            }
            count++;
        }
    }
    
    return null;
}

AttributeContainer.prototype.getAttributeCount = function()
{
    var count = 0;
    for (var i in this.attrNameMap) count += this.attrNameMap[i].length;
    return count;
}

AttributeContainer.prototype.getAttributeModificationCount = function(attribute)
{
    //return this.attrModifiedCountMap[attribute];
    for (var i in this.attrModifiedCountMap)
    {
        if (this.attrModifiedCountMap[i].first == attribute)
        {
            return this.attrModifiedCountMap[i].second;
        }
    }

    return undefined;
}

AttributeContainer.prototype.incrementAttributeModificationCount = function(attribute)
{
    //this.attrModifiedCountMap[attribute]++;
    for (var i in this.attrModifiedCountMap)
    {
        if (this.attrModifiedCountMap[i].first == attribute)
        {
            this.attrModifiedCountMap[i].second++;
            break;
        }
    }
}

AttributeContainer.prototype.addTarget = function(target, op, converter, setValueOnTargeting)
{
    if (target)
    {
        if (op == undefined) op = null;
        if (converter == undefined) converter = null;
        if (setValueOnTargeting == undefined) setValueOnTargeting = true;
        
        var numAttributesToConnect = Math.max(this.getAttributeCount(), target.getAttributeCount());
        if (numAttributesToConnect == 0)
        {
            return;
        }

        var sourceAttr = null;
        var targetAttr = null;
        for (var i = 0; i < numAttributesToConnect; i++)
        {
            sourceAttr = this.getAttributeAt(i);
            targetAttr = target.getAttribute(this.getAttributeNameAt(i));
            if (!sourceAttr || !targetAttr)
            {
                continue;
            }

            sourceAttr.addTarget(targetAttr, op, converter, setValueOnTargeting);
        }
    }
}

AttributeContainer.prototype.removeTarget = function(target)
{
    if (target)
    {
        var numAttributesToConnect = Math.max(this.getAttributeCount(), target.getAttributeCount());
        if (numAttributesToConnect == 0)
        {
            return;
        }

        var sourceAttr = null;
        var targetAttr = null;
        for (var i = 0; i < numAttributesToConnect; i++)
        {
            sourceAttr = this.getAttributeAt(i);
            targetAttr = target.getAttribute(this.getAttributeNameAt(i));
            if (!sourceAttr || !targetAttr)
            {
                continue;
            }

            sourceAttr.removeTarget(targetAttr);
        }
    }
}

AttributeContainer.prototype.synchronize = function(src, syncValues)
{
    if (syncValues == undefined) syncValues = true;

    for (var i in src.attrNameMap)
    {
        for (var j=0; j < src.attrNameMap.length; j++)
        {
            var attr = this.attrNameMap[i][j];
            if (!attr)
            {
                attr = src.attrNameMap[i].clone();
                if (!attr) continue;
                attr.setContainer(this);
                this.registerAttribute(attr, i);
            }
    
            if (attr && syncValues)
            {
                attr.copyValue(src.attrNameMap[i]);
            }
        }
    }
}

function AttributeContainer_AttributeModifiedCB(attribute, container)
{
    for (var i=0; i < container.modifiedCBs.length; i++)
    {
        container.modifiedCBs[i](container, container.modifiedCBsData[i]);
    }
}

function AttributeContainer_AttributeModifiedCounterCB(attribute, container)
{
    container.incrementAttributeModificationCount(attribute);  
}