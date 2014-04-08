ViewportMgr.prototype = new AttributeContainer();
ViewportMgr.prototype.constructor = ViewportMgr;

function ViewportMgr()
{
    AttributeContainer.call(this);
    this.className = "ViewportMgr";
    
    this.name = new StringAttr("ViewportMgr");
    this.cursor = new StringAttr("Arrow");
    this.width = new NumberAttr(0);
    this.height = new NumberAttr(0);
    this.layout = new ReferenceAttr(null);
    
    this.cursor.addModifiedCB(ViewportMgr_CursorModifiedCB, this);
    this.width.addModifiedCB(ViewportMgr_WidthModifiedCB, this);
    this.height.addModifiedCB(ViewportMgr_HeightModifiedCB, this);
    this.layout.addModifiedCB(ViewportMgr_LayoutModifiedCB, this);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.cursor, "cursor");
    this.registerAttribute(this.width, "width");
    this.registerAttribute(this.height, "height");
    this.registerAttribute(this.layout, "layout");
}

ViewportMgr.prototype.initLayout = function()
{
    var layout = this.layout.getValueDirect();
    if (layout)
    {
        layout.initialize();
    }
}

ViewportMgr.prototype.layoutDirectives = function(directives)
{
    var layout = this.layout.getValueDirect();
    if (layout)
    {
        layout.layoutDirectives(directives);   
    }
}

ViewportMgr.prototype.getViewportAtScreenXY = function(x, y)
{
    var width = this.width.getValueDirect();
    var height = this.height.getValueDirect();
    
    // make sure x, y fall between [0, viewport width/height]
    x = clamp(x, 0, width);
    y = clamp(y, 0, height);
    
    // get cameras
    var cameras = this.registry.getByType(eAttrType.Camera);
    
    // get smallest viewport containing screen x, y (necessary for picture-in-picture)
    var minWidth = width;
    var minHeight = height;
    var camera, viewport;
    for (var i=0; i < cameras.length; i++)
    {
        if (cameras[i].viewport.containsPoint(x, y) &&
            cameras[i].viewport.width <= minWidth &&
            cameras[i].viewport.height <= minHeight)
        {
            camera = cameras[i];
            viewport = cameras[i].viewport;
            minWidth = cameras[i].viewport.width;
            minHeight = cameras[i].viewport.height
        }
    }
    
    return { viewport: viewport, camera: camera };
}

function ViewportMgr_CursorModifiedCB(attribute, container)
{
    // TODO
}

function ViewportMgr_WidthModifiedCB(attribute, container)
{
    var layout = container.layout.getValueDirect();
    if (layout)
    {
        layout.getAttribute("width").setValueDirect(attribute.getValueDirect());
    }
}

function ViewportMgr_HeightModifiedCB(attribute, container)
{
    var layout = container.layout.getValueDirect();
    if (layout)
    {
        layout.getAttribute("height").setValueDirect(attribute.getValueDirect());
    }
}

function ViewportMgr_LayoutModifiedCB(attribute, container)
{
    var layout = attribute.getValueDirect();
    if (layout)
    {
        layout.getAttribute("width").setValueDirect(container.width.getValueDirect());
        layout.getAttribute("height").setValueDirect(container.height.getValueDirect());
    }
}