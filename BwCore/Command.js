Command.prototype = new EventListener();
Command.prototype.constructor = Command;

function Command()
{
    EventListener.call(this);
    this.className = "Command";
    this.attrType = eAttrType.Command;
    
    this.borrowedAttributes = [];
    this.attributeValuePairs = [];
    this.attributeRefPairs = [];
    
    this.target = new StringAttr("");
    
    this.registerAttribute(this.target, "target");
}

Command.prototype.finalize = function()
{  
}

Command.prototype.eventPerformed = function(event)
{
    if (this.listen.getValueDirect() == true)
    {
        this.execute();
    }
    
    // call base-class implementation
    EventListener.prototype.eventPerformed.call(this, event);
}

Command.prototype.isBorrowed = function(attribute)
{
    for (var i=0; i < this.borrowedAttributes.length; i++)
    {
        if (attribute == this.borrowedAttributes[i])
        {
            return true;
        }
    }

    return false;
}

Command.prototype.isBorrowedAndValueModified = function(attribute)
{
    if (this.isBorrowed(attribute))
    {
        for (var i=0; i < this.attributeValuePairs.length; i++)
        {
            if (attribute == this.attributeValuePairs[i].first)
            {
                return { borrowed: true, value: this.attributeValuePairs[i].second };
            }
        }
    }

    return { borrowed: false, value: null };
}

Command.prototype.isBorrowedAndReferenceModified = function(attribute)
{
    if (this.isBorrowed(attribute))
    {
        for (var i=0; i < this.attributeRefPairs.length; i++)
        {
            if (attribute == this.attributeRefPairs[i].second)
            {
                return { borrowed: true, reference: this.attributeRefPairs[i].first };
            }
        }
    }

    return { borrowed: false, reference: null };
}

