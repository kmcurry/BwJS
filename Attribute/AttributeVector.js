AttributeVector.prototype = new AttributeContainer();
AttributeVector.prototype.constructor = AttributeVector;

function AttributeVector(allocator) // TODO: not sure if allocator is needed
{
    AttributeContainer.call(this);
    this.className = "AttributeVector";
    this.attrType = eAttrType.AttributeVector;
    
    this.vector = [];
    
    this.allocator = allocator;
    
    this.size = new NumberAttr(0);
    this.baseName = new StringAttr("item");
    this.appendParsedElements = new BooleanAttr(false);
    this.elementModified = new PulseAttr();
    
    this.size.addModifiedCB(AttributeVector_SizeModifiedCB, this);
    this.baseName.addModifiedCB(AttributeVector_BaseNameModifiedCB, this);
    
    this.registerAttribute(this.size, "size");
    this.registerAttribute(this.baseName, "baseName");
    this.registerAttribute(this.appendParsedElements, "appendParsedElements");
    this.registerAttribute(this.elementModified, "elementModified");
}

AttributeVector.prototype.allocatesElements = function() // TODO: necessary (?)
{
    return (this.allocator ? true : false);
}

AttributeVector.prototype.push_back = function(item)
{
    this.addElement(this.vector.length, item);
}

AttributeVector.prototype.erase = function(item)
{
    for (var i=0; i < this.vector.length; i++)
    {
        if (this.vector[i] == item)
        { 
            this.removeElement(i);
            return;
        }
    }
}

AttributeVector.prototype.resize = function(size)
{
    this.size.setValueDirect(size);
}

AttributeVector.prototype.clear = function()
{
    this.resize(0);
}

AttributeVector.prototype.indexOf = function(item)
{
    for (var i = 0; i < this.vector.length; i++)
    {
        if (this.vector[i] == item)
        {
            return i;
        }
    }
    
    return -1;
}

AttributeVector.prototype.getAt = function(index)
{
    if (this.vector.length > index)
    {
        return this.vector[index];
    }
    
    return null;
}

AttributeVector.prototype.setAt = function(index, item)
{
    if (this.vector.length > index)
    {
        this.vector[index] = item;
    }
}

AttributeVector.prototype.prev = function(element)
{
    for (var i = 0; i < this.vector.length; i++)
    {
        if (this.vector[i] == element)
        {
            if (i > 0) return this.vector[i-1];
            break;
        }        
    }
    
    return null;
}

AttributeVector.prototype.next = function(element)
{
    for (var i = 0; i < this.vector.length; i++)
    {
        if (this.vector[i] == element)
        {
            if (i < (this.vector.length - 1)) return this.vector[i+1];
            break;
        }        
    }
    
    return null;
}

AttributeVector.prototype.addElement = function(index, element)
{
    this.vector.splice(index, 0, element);
    this.size.setValueDirect(this.vector.length);
}

AttributeVector.prototype.removeElement = function(index)
{
    this.vector.splice(index, 1);
    this.size.setValueDirect(this.vector.length);
}

AttributeVector.prototype.Size = function()
{
    return this.size.getValueDirect();
}

AttributeVector.prototype.AppendParsedElements = function()
{
    return this.appendParsedElements.getValueDirect();
}

AttributeVector.prototype.setElementName = function(element, name)
{
    this.unregisterAttribute(element); // don't allow registration under multiple names
    this.registerAttribute(element, name);
    
    // TODO: add to element name map
    console.debug("TODO: add to element name map");
}

AttributeVector.prototype.synchronize = function(src, syncValues)
{
    var length = this.Size();
    var srcLength = src.Size();
    
    while (srcLength > length)
    {
        this.push_back(src.getAt(length));
        length++;
    }
    
    while (srcLength < length)
    {
        this.removeElement(length-1);
        length--;
    }
    
    if (syncValues)
    {
        for (var i = 0; i < length; i++)
        {
            if (src.getAt(i).getValueDirect() != this.getAt(i).getValueDirect())
            {
                this.getAt(i).copyValue(src.getAt(i));
            }
        }
    }
}

AttributeVector.prototype.isCollection = function()
{
    return true;
}

AttributeVector.prototype.sizeModified = function()
{
    var lastSize = this.vector.length;
    var nextSize = this.size.getValueDirect();
    var start, end;

    if (nextSize > lastSize)
    {
        start = lastSize;
        end = start + (nextSize - lastSize);

        for (var i = start; i < end; i++)
        {
            this.addElement(i, this.allocator ? this.allocator.allocate() : null);
        }
    }
    else if (nextSize < lastSize)
    {
        start = lastSize;
        end = start - (lastSize - nextSize);

        for (var i = start - 1; i >= end; i--)
        {
            this.removeElement(i);
        }
    }
}

function AttributeVector_SizeModifiedCB(attribute, container)
{
    container.sizeModified();
}

function AttributeVector_BaseNameModifiedCB(attribute, container)
{
}
