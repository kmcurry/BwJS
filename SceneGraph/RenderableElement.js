RenderableElement.prototype = new SGNode();
RenderableElement.prototype.constructor = RenderableElement;

function RenderableElement()
{
    SGNode.call(this);
    this.className = "RenderableElement";
    this.attrType = eAttrType.RenderableElement;
    
    this.bbox = new BBoxAttr();
    this.renderSequenceSlot = new NumberAttr(0);
    this.hasFocus = new TernaryAttr(0);
    this.selected = new TernaryAttr(0);
    this.styles = new StylesAttr();
    this.stylesMap = new StylesMapAttr();
    this.renderableElementStyle = new RenderableElementStyleAttr();
    this.renderedSlot = new NumberAttr(0);
    
    this.registerAttribute(this.bbox, "bbox");
    this.registerAttribute(this.renderSequenceSlot, "renderSequenceSlot");
    this.registerAttribute(this.hasFocus, "hasFocus");
    this.registerAttribute(this.selected, "selected");
    this.registerAttribute(this.styles, "styles");
    this.registerAttribute(this.stylesMap, "stylesMap");
    this.registerAttribute(this.renderableElementStyle, "renderableElementStyle");
    this.registerAttribute(this.renderedSlot, "renderedSlot");
}

RenderableElement.prototype.setRegistry = function(registry)
{
    this.stylesMap.setRegistry(registry);

    // call base-class implementation
    SGNode.prototype.setRegistry.call(this, registry);
}

RenderableElement.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    SGNode.prototype.update.call(this, params, visitChildren);
}

RenderableElement.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class implementation
    SGNode.prototype.apply.call(this, directive, params, visitChildren);
}
