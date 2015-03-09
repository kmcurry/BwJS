RasterComponent.prototype = new ParentableMotionElement();
RasterComponent.prototype.constructor = RasterComponent;

function RasterComponent()
{
    ParentableMotionElement.call(this);
    this.className = "RasterComponent";
    this.attrType = eAttrType.RasterComponent;

    this.rcEventListener = null;

    this.opacity = new NumberAttr(1);				// opaque
    this.anchor = new Vector2DAttr(0, 0);			// 0, 0
    this.origin = new StringAttr("bottomLeft");		// bottom-left
    this.show = new BooleanAttr(true);				// true
    this.selectable = new BooleanAttr(true);		// true
    this.cullable = new BooleanAttr(true);			// true
    this.clampToViewport = new BooleanAttr(false);	// false
    this.rasterPosition = new Vector3DAttr();
    this.inspectionOffset = new Vector3DAttr();
    this.componentRect = new RectAttr();
    this.screenRect = new RectAttr();

    this.stylesMap.size.addModifiedCB(RasterComponent_StylesMapSizeModifiedCB, this);
    this.show.addModifiedCB(RasterComponent_ShowModifiedCB, this);

    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.anchor, "anchor");
    this.registerAttribute(this.origin, "origin");
    this.registerAttribute(this.show, "show");
    this.registerAttribute(this.selectable, "selectable");
    this.registerAttribute(this.cullable, "cullable");
    this.registerAttribute(this.rasterPosition, "rasterPosition");
    this.registerAttribute(this.inspectionOffset, "inspectionOffset");
    this.registerAttribute(this.clampToViewport, "clampToViewport");
    this.registerAttribute(this.componentRect, "componentRect");
    this.registerAttribute(this.screenRect, "screenRect");

    this.renderSequenceSlot.setValueDirect(0xffff);
}

RasterComponent.prototype.setRegistry = function(registry)
{
    var bworks = registry.find("Bridgeworks");
    if (bworks)
    {
        this.rcEventListener = bworks.rasterComponentEventListener;
        if (this.rcEventListener)
        {
            this.rcEventListener.registerComponent(this); // TODO: unable to unregister without dtor
            this.rcEventListener.Listen(this);
        }
    }

    ParentableMotionElement.prototype.setRegistry.call(this, registry);
}

RasterComponent.prototype.isSelected = function(x, y)
{
    var show = this.show.getValueDirect();
    if (show)
    {
        if (this.screenRect.containsPoint(x, y))
        {
            return true;
        }
    }

    return false;
}

RasterComponent.prototype.stylesMapSizeModified = function()
{
    var size = this.stylesMap.Size();
    for (var i = 0; i < size; i++)
    {
        var styleMap = this.stylesMap.getAt(i);
        if (styleMap)
        {
            // add modified CBs for styles map elements' events (remove first to eliminate duplicates)
            styleMap.event.removeModifiedCB(RasterComponent_StylesMapElementEventModifiedCB, this);
            styleMap.event.addModifiedCB(RasterComponent_StylesMapElementEventModifiedCB, this);
            // invoke CB now for stylesMap that are set by reference
            RasterComponent_StylesMapElementEventModifiedCB(styleMap.event, this);
        }
    }
}

RasterComponent.prototype.stylesMapElementEventModified = function(eventName)
{
    this.rcEventListener.listenEvent(this, eEventNameMap[eventName]);
}

RasterComponent.prototype.showModified = function()
{
}

function RasterComponent_StylesMapSizeModifiedCB(attribute, container)
{
    container.stylesMapSizeModified();
}

function RasterComponent_StylesMapElementEventModifiedCB(attribute, container)
{
    container.stylesMapElementEventModified(attribute.getValueDirect().join(""));
}

function RasterComponent_ShowModifiedCB(attribute, container)
{
    container.showModified();
}