StyleAttr.prototype = new AttributeContainer();
StyleAttr.prototype.constructor = StyleAttr;

function StyleAttr()
{
    AttributeContainer.call(this);
    this.className = "StyleAttr";
    this.attrType = eAttrType.StyleAttr;

    this.setOp = new NumberAttr(eAttrSetOp.Replace);
    this.styleUrl = new StringAttr();

    this.styleUrl.addModifiedCB(StyleAttr_StyleUrlModifiedCB, this);
    
    this.registerAttribute(this.setOp, "setOp");
    this.registerAttribute(this.styleUrl, "styleUrl");
}

StyleAttr.prototype.updateStyle = function(style)
{
    // implemented by derived classes
}

StyleAttr.prototype.styleUrlModified = function()
{
    var styleUrl = this.styleUrl.getValueDirect().join("");
    if (this.registry)
    {
        this.updateStyle(this.registry.find(styleUrl));
    }
}

function StyleAttr_StyleUrlModifiedCB(attribute, container)
{
    container.styleUrlModified();
}

StylesAttr.prototype = new AttributeVector();
StylesAttr.prototype.constructor = StylesAttr;

function StylesAttr()
{
    AttributeVector.call(this);
    this.className = "StylesAttr";
    this.attrType = eAttrType.StylesAttr;

    this.registeredCBs = [];
    this.registeredCBsData = [];
    
    this.enabled = new BooleanAttr(true);

    this.registerAttribute(this.enabled, "enabled");
}

StylesAttr.prototype.updateStyle = function(style)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }

    for (var i = 0; i < style.Size(); i++)
    {
        for (var j = 0; j < this.Size(); j++)
        {
            if (this.vector[j].attrType == style.vector[i].attrType)
            {
                this.vector[j].updateStyle(style.vector[i]);
                break;
            }
        }
    }
}

StylesAttr.prototype.registerStyle = function(style, name)
{
    this.push_back(style);
    this.setElementName(style, name);
    this.alertRegisteredCBs(style, true);
}

StylesAttr.prototype.unregisterStyle = function(style)
{
    for (var i in this.vector)
    {
        if (this.vector[i] == style)
        {
            this.alertRegisteredCBs(style, false);
            delete this.vector[i];
            break;
        }
    }
}

StylesAttr.prototype.addRegisteredCB = function(callback, data)
{
    this.registeredCBs.push(callback);
    this.registeredCBsData.push(data);
}

StylesAttr.prototype.alertRegisteredCBs = function(style, registered)
{
    for (var i = 0; i < this.registeredCBs.length; i++)
    {
        this.registeredCBs[i](style, this.registeredCBs[i]);
    }
}

StylesAttr.prototype.push_back = function(item)
{
    // call base-class implementation
    AttributeVector.prototype.push_back.call(this, item);

    this.alertRegisteredCBs(item, true);
}

StylesAttr.prototype.getStyle = function(type)
{
    for (var i = 0; i < this.Size(); i++)
    {
        if (this.vector[i].attrType == type)
        {
            return this.vector[i];
        }
    }

    return undefined;
}

StyleMapAttr.prototype = new AttributeContainer();
StyleMapAttr.prototype.constructor = StyleMapAttr;

function StyleMapAttr()
{
    AttributeContainer.call(this);
    this.className = "StyleMapAttr";
    this.attrType = eAttrType.StyleMapAttr;

    this.eventType = eEventType.Unknown;
    this.targetContainer = null;
    
    this.event = new StringAttr();
    this.styles = new StylesAttr();
    this.styleUrl = new StringAttr();
    this.target = new StringAttr();

    this.event.addModifiedCB(StyleMapAttr_EventModifiedCB, this);
    this.styleUrl.addModifiedCB(StyleMapAttr_styleUrlModifiedCB, this);
    this.target.addModifiedCB(StyleMapAttr_TargetModifiedCB, this);

    this.registerAttribute(this.event, "event");
    this.registerAttribute(this.styleUrl, "styleUrl");
    this.registerAttribute(this.target, "target");
}

StyleMapAttr.prototype.getStyles = function(eventType)
{
    var styles = null;
    var target = null;

    if (this.eventType == eventType)
    {
        styles = this.styles;
        target = this.targetContainer;
    }

    return { styles: styles, target: target };
}

StyleMapAttr.prototype.setStyles = function(styles)
{
    this.styles = styles;
}

StyleMapAttr.prototype.setTargetContainer = function(targetContainer)
{
    this.targetContainer = targetContainer;
}

StyleMapAttr.prototype.eventModified = function()
{
    var eventName = this.event.getValueDirect().join("");

    this.eventType = eEventNameMap[eventName];
}

StyleMapAttr.prototype.styleUrlModified = function()
{
    var styleUrl = this.styleUrl.getValueDirect();
    if (styleUrl[0] == '#')
    {
        styleUrl.splice(0, 1);
    }
    styleUrl = styleUrl.join("");

    var styles = this.registry.find(styleUrl);
    if (styles)
    {
        this.styles = styles;
    }
}

StyleMapAttr.prototype.targetModified = function()
{
    var target = this.target.getValueDirect().join("");

    this.targetContainer = this.registry.find(target);
}

function StyleMapAttr_EventModifiedCB(attribute, container)
{
    container.eventModified();
}

function StyleMapAttr_styleUrlModifiedCB(attribute, container)
{
    container.styleUrlModified();
}

function StyleMapAttr_TargetModifiedCB(attribute, container)
{
    container.targetModified();
}

StyleMapAttrAllocator.prototype = new Allocator();
StyleMapAttrAllocator.prototype.constructor = StyleMapAttrAllocator;

function StyleMapAttrAllocator()
{
}

StyleMapAttrAllocator.prototype.allocate = function()
{
    return new StyleMapAttr();
}

StylesMapAttr.prototype = new AttributeVector();
StylesMapAttr.prototype.constructor = StylesMapAttr;

function StylesMapAttr()
{
    AttributeVector.call(this, new StyleMapAttrAllocator());
    this.className = "StylesMapAttr";
    this.attrType = eAttrType.StylesMapAttr;

    this.stylesEnabledMap = [];

    this.size.addModifiedCB(StylesMapAttr_SizeModifiedCB, this);

    this.appendParsedElements.setValueDirect(true);
}

StylesMapAttr.prototype.getStyles = function(eventType)
{
    var styles = null;
    var enabled = false;
    var target = null;

    for (var i = 0; i < this.Size(); i++)
    {
        var result = this.vector[i].getStyles(eventType);
        if (result.styles)
        {
            styles = result.styles;
            target = result.target;
            if (this.stylesEnabledMap[result.styles])
            {
                enabled = this.stylesEnabledMap[result.styles];
            }
        }
    }

    return { styles: styles, target: target, enabled: enabled };
}

StylesMapAttr.prototype.StylesMapAttr_SizeModified = function()
{
    for (var i = 0; i < this.Size(); i++)
    {
        if (!(this.vector[i].registry))
        {
            this.vector[i].setRegistry(this.registry);
        }

        if (!(this.stylesEnabledMap[this.vector[i].styles]))
        {
            this.stylesEnabledMap[this.vector[i].styles] = new BooleanAttr(true);
        }
    }
}

function StylesMapAttr_SizeModifiedCB(attribute, container)
{
    container.StylesMapAttr_SizeModified();
}