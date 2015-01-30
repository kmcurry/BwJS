KeyframeAttr.prototype = new AttributeContainer();
KeyframeAttr.prototype.constructor = KeyframeAttr;

function KeyframeAttr()
{
    AttributeContainer.call(this);
    this.className = "KeyframeAttr";
    this.attrType = eAttrType.KeyframeAttr;

    this.time = new NumberAttr();
    this.value = new NumberAttr();
    this.shape = new NumberAttr();
    this.params = new AttributeVector();

    for (var i = 0; i < 6; i++)
    {
        this.params.push_back(new NumberAttr(0));
    }

    this.registerAttribute(this.time, "time");
    this.registerAttribute(this.value, "value");
    this.registerAttribute(this.shape, "shape");
    this.registerAttribute(this.params, "params");

    this.getTime = function () {
        return this.time.getValueDirect();
    }
    this.getValue = function () {
        return this.value.getValueDirect();
    }
    this.getShape = function () {
        return this.shape.getValueDirect();
    }
    this.getParams = function (i) {
        return this.params.getAt(i).getValueDirect();
    }
}

KeyframesAttr.prototype = new AttributeVector();
KeyframesAttr.prototype.constructor = KeyframesAttr;

function KeyframesAttr()
{
    AttributeVector.call(this);
    this.className = "KeyframesAttr";
    this.attrType = eAttrType.KeyframesAttr;
}

BBoxAttr.prototype = new AttributeContainer();
BBoxAttr.prototype.constructor = BBoxAttr;

function BBoxAttr()
{
    AttributeContainer.call(this);
    this.className = "BBoxAttr";
    this.attrType = eAttrType.BBoxAttr;

    this.min = new Vector3DAttr();
    this.max = new Vector3DAttr();

    this.registerAttribute(this.min, "min");
    this.registerAttribute(this.max, "max");
}

BBoxAttr.prototype.setValueDirect = function (min, max)
{
    this.min.setValueDirect(min.x, min.y, min.z);
    this.max.setValueDirect(max.x, max.y, max.z);
}

ImageAttr.prototype = new AttributeContainer();
ImageAttr.prototype.constructor = ImageAttr;

function ImageAttr()
{
    AttributeContainer.call(this);
    this.className = "ImageAttr";
    this.attrType = eAttrType.ImageAttr;

    this.width = new NumberAttr(0);
    this.height = new NumberAttr(0);
    this.byteAlignment = new NumberAttr(0);
    this.pixelFormat = new NumberAttr(ePixelFormat.Unknown);
    this.pixels = new NumberArrayAttr();

    this.registerAttribute(this.width, "width");
    this.registerAttribute(this.height, "height");
    this.registerAttribute(this.byteAlignment, "byteAlignment");
    this.registerAttribute(this.pixelFormat, "pixelFormat");
    this.registerAttribute(this.pixels, "pixels");
}

RectAttr.prototype = new AttributeContainer();
RectAttr.prototype.constructor = RectAttr;

function RectAttr()
{
    AttributeContainer.call(this);
    this.className = "RectAttr";
    this.attrType = eAttrType.RectAttr;

    this.left = new NumberAttr(0);
    this.top = new NumberAttr(0);
    this.right = new NumberAttr(0);
    this.bottom = new NumberAttr(0);

    this.registerAttribute(this.left, "left");
    this.registerAttribute(this.top, "top");
    this.registerAttribute(this.right, "right");
    this.registerAttribute(this.bottom, "bottom");
}

RectAttr.prototype.getValueDirect = function ()
{
    var rect = new Rect();
    rect.left = this.left.getValueDirect();
    rect.top = this.top.getValueDirect();
    rect.right = this.right.getValueDirect();
    rect.bottom = this.bottom.getValueDirect();
    return rect;
}

RectAttr.prototype.setValueDirect = function (rect)
{
    this.left.setValueDirect(rect.left);
    this.top.setValueDirect(rect.top);
    this.right.setValueDirect(rect.right);
    this.bottom.setValueDirect(rect.bottom);
}

RectAttr.prototype.containsPoint = function (x, y)
{
    if (x >= this.left.getValueDirect() &&
            y >= this.top.getValueDirect() &&
            x <= this.right.getValueDirect() &&
            y <= this.bottom.getValueDirect())
        return true;

    return false;
}

FontStyleAttr.prototype = new StyleAttr();
FontStyleAttr.prototype.constructor = FontStyleAttr;

function FontStyleAttr()
{
    StyleAttr.call(this);
    this.className = "FontStyleAttr";
    this.attrType = eAttrType.FontStyleAttr;

    this.antialiasType = new NumberAttr(eImageAntialiasOp.EightPass);
    this.borderColor = new ColorAttr(0, 0, 0, 1);
    this.borderWidth = new NumberAttr(2);
    this.color = new ColorAttr(1, 1, 1, 1);
    this.effects = new StringAttr();
    this.font = new StringAttr("Arial");
    this.opacity = new NumberAttr(1);
    this.size = new NumberAttr(18);
    this.style = new StringAttr("Bold");

    this.registerAttribute(this.antialiasType, "antialiasType");
    this.registerAttribute(this.borderColor, "borderColor");
    this.registerAttribute(this.borderWidth, "borderWidth");
    this.registerAttribute(this.color, "color");
    this.registerAttribute(this.effects, "effects");
    this.registerAttribute(this.font, "font");
    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.size, "size");
    this.registerAttribute(this.style, "style");
}

FontStyleAttr.prototype.updateStyle = function (style)
{
    var setOp = style.setOp.getValueDirect();

    // antialiasType
    if (style.getAttributeModificationCount(style.antialiasType))
    {
        this.antialiasType.copyValue(style.antialiasType, setOp);
    }

    // borderColor
    if (style.getAttributeModificationCount(style.borderColor))
    {
        this.borderColor.copyValue(style.borderColor, setOp);
    }

    // borderWidth
    if (style.getAttributeModificationCount(style.borderWidth))
    {
        this.borderWidth.copyValue(style.borderWidth, setOp);
    }

    // color
    if (style.getAttributeModificationCount(style.color))
    {
        this.color.copyValue(style.color, setOp);
    }

    // effects
    if (style.getAttributeModificationCount(style.effects))
    {
        this.effects.copyValue(style.effects, setOp);
    }

    // font
    if (style.getAttributeModificationCount(style.font))
    {
        this.font.copyValue(style.font, setOp);
    }

    // opacity
    if (style.getAttributeModificationCount(style.opacity))
    {
        this.opacity.copyValue(style.opacity, setOp);
    }

    // size
    if (style.getAttributeModificationCount(style.size))
    {
        this.size.copyValue(style.size, setOp);
    }

    // style
    if (style.getAttributeModificationCount(style.style))
    {
        this.style.copyValue(style.style, setOp);
    }
}

LabelStyleAttr.prototype = new StyleAttr();
LabelStyleAttr.prototype.constructor = LabelStyleAttr;

function LabelStyleAttr()
{
    StyleAttr.call(this);
    this.className = "LabelStyleAttr";
    this.attrType = eAttrType.LabelStyleAttr;

    this.angle = new NumberAttr(0);
    this.backgroundColor = new ColorAttr(0, 0, 0, 1);
    this.backgroundOpacity = new NumberAttr(0);
    this.fontStyle = new FontStyleAttr();
    this.format = new StringAttr("left");
    this.height = new NumberAttr(0);
    this.offset = new Vector2DAttr(0, 0);
    this.padding = new NumberAttr(0);
    this.scale = new Vector3DAttr(1, 1, 1);
    this.textAlign = new StringAttr("middleRight");
    this.width = new NumberAttr(0);

    this.registerAttribute(this.angle, "angle");
    this.registerAttribute(this.backgroundColor, "backgroundColor");
    this.registerAttribute(this.backgroundOpacity, "backgroundOpacity");
    this.registerAttribute(this.fontStyle, "fontStyle");
    this.registerAttribute(this.format, "format");
    this.registerAttribute(this.height, "height");
    this.registerAttribute(this.offset, "offset");
    this.registerAttribute(this.padding, "padding");
    this.registerAttribute(this.scale, "scale");
    this.registerAttribute(this.textAlign, "textAlign");
    this.registerAttribute(this.width, "width");
}

LabelStyleAttr.prototype.updateStyle = function (style)
{
    var setOp = style.setOp.getValueDirect();

    // angle
    if (style.getAttributeModificationCount(style.angle))
    {
        this.angle.copyValue(style.angle, setOp);
    }

    // backgroundColor
    if (style.getAttributeModificationCount(style.backgroundColor))
    {
        this.backgroundColor.copyValue(style.backgroundColor, setOp);
    }

    // backgroundOpacity
    if (style.getAttributeModificationCount(style.backgroundOpacity))
    {
        this.backgroundOpacity.copyValue(style.backgroundOpacity, setOp);
    }

    // fontStyle
    this.fontStyle.updateStyle(style.fontStyle);

    // format
    if (style.getAttributeModificationCount(style.format))
    {
        this.format.copyValue(style.format, setOp);
    }

    // height
    if (style.getAttributeModificationCount(style.height))
    {
        this.height.copyValue(style.height, setOp);
    }

    // offset
    if (style.getAttributeModificationCount(style.offset))
    {
        this.offset.copyValue(style.offset, setOp);
    }

    // padding
    if (style.getAttributeModificationCount(style.padding))
    {
        this.padding.copyValue(style.padding, setOp);
    }

    // scale
    if (style.getAttributeModificationCount(style.scale))
    {
        this.scale.copyValue(style.scale, setOp);
    }

    // textAlign
    if (style.getAttributeModificationCount(style.textAlign))
    {
        this.textAlign.copyValue(style.textAlign, setOp);
    }

    // width
    if (style.getAttributeModificationCount(style.width))
    {
        this.width.copyValue(style.width, setOp);
    }
}

IconStyleAttr.prototype = new StyleAttr();
IconStyleAttr.prototype.constructor = IconStyleAttr;

function IconStyleAttr()
{
    StyleAttr.call(this);
    this.className = "IconStyleAttr";
    this.attrType = eAttrType.IconStyleAttr;

    this.alphaUrl = new StringAttr("");
    this.color = new ColorAttr(1, 1, 1, 1);
    this.opacity = new NumberAttr(1);
    this.scale = new Vector3DAttr(1, 1, 1);
    this.url = new StringAttr("");

    this.registerAttribute(this.alphaUrl, "alphaUrl");
    this.registerAttribute(this.color, "color");
    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.scale, "scale");
    this.registerAttribute(this.url, "url");
}

IconStyleAttr.prototype.updateStyle = function (style)
{
    var setOp = style.setOp.getValueDirect();

    // alphaUrl
    if (style.getAttributeModificationCount(style.alphaUrl))
    {
        this.alphaUrl.copyValue(style.alphaUrl, setOp);
    }

    // color
    if (style.getAttributeModificationCount(style.color))
    {
        this.color.copyValue(style.color, setOp);
    }

    // opacity
    if (style.getAttributeModificationCount(style.opacity))
    {
        this.opacity.copyValue(style.opacity, setOp);
    }

    // scale
    if (style.getAttributeModificationCount(style.scale))
    {
        this.scale.copyValue(style.scale, setOp);
    }

    // url
    if (style.getAttributeModificationCount(style.url))
    {
        this.url.copyValue(style.url, setOp);
    }
}

HTMLLabelStyleAttr.prototype = new StyleAttr();
HTMLLabelStyleAttr.prototype.constructor = HTMLLabelStyleAttr;

function HTMLLabelStyleAttr()
{
    StyleAttr.call(this);
    this.className = "HTMLLabelStyleAttr";
    this.attrType = eAttrType.HTMLLabelStyleAttr;

    this.bgColor = new ColorAttr(1, 1, 1, 1); // white
    this.height = new NumberAttr(0); // 0 (auto-calculate)
    this.html = new StringAttr(); // empty string
    this.left = new NumberAttr(0);
    //if (!(this.scrollBarLabelStyle = New<ScrollBarLabelStyleAttr>())) return;
    this.top = new NumberAttr(0);
    this.url = new StringAttr(); // empty string
    this.width = new NumberAttr(0); // 0 (auto-calculate)

    this.registerAttribute(this.bgColor, "bgColor");
    this.registerAttribute(this.height, "height");
    this.registerAttribute(this.html, "html");
    this.registerAttribute(this.html, "userData");          // for CDATA
    this.registerAttribute(this.left, "left");
    //this.registerAttribute(this.scrollBarLabelStyle, "scrollBarLabelStyle");
    this.registerAttribute(this.top, "top");
    this.registerAttribute(this.url, "url");
    this.registerAttribute(this.width, "width");
}

BalloonTipLabelStyleAttr.prototype = new StyleAttr();
BalloonTipLabelStyleAttr.prototype.constructor = BalloonTipLabelStyleAttr;

function BalloonTipLabelStyleAttr()
{
    StyleAttr.call(this);
    this.className = "BalloonTipLabelStyleAttr";
    this.attrType = eAttrType.BalloonTipLabelStyleAttr;

    this.balloonOffset = new NumberAttr(100);
    this.bgColor = new ColorAttr(1, 1, 1, 1);
    this.displayMode = new StringAttr("default");
    this.htmlLabelStyle = new HTMLLabelStyleAttr();
    this.text = new StringAttr();
    this.textColor = new ColorAttr(0, 0, 0, 1);

    this.registerAttribute(this.balloonOffset, "balloonOffset");
    this.registerAttribute(this.bgColor, "bgColor");
    this.registerAttribute(this.displayMode, "displayMode");
    this.registerAttribute(this.htmlLabelStyle, "htmlLabelStyle");
    this.registerAttribute(this.text, "text");
    this.registerAttribute(this.textColor, "textColor");
}

BalloonTipLabelStyleAttr.prototype.updateStyle = function (style)
{
    var setOp = style.setOp.getValueDirect();

    // balloonOffset
    if (style.getAttributeModificationCount(style.balloonOffset))
    {
        this.balloonOffset.copyValue(style.balloonOffset, setOp);
    }

    // bgColor
    if (style.getAttributeModificationCount(style.bgColor))
    {
        this.bgColor.copyValue(style.bgColor, setOp);
    }

    // displayMode
    if (style.getAttributeModificationCount(style.displayMode))
    {
        this.displayMode.copyValue(style.displayMode, setOp);
    }

    // htmlLabelStyle
    this.htmlLabelStyle.updateStyle(style.htmlLabelStyle);

    // text
    if (style.getAttributeModificationCount(style.text))
    {
        this.text.copyValue(style.text, setOp);
    }

    // textColor
    if (style.getAttributeModificationCount(style.textColor))
    {
        this.textColor.copyValue(style.textColor, setOp);
    }
}

RenderableElementStyleAttr.prototype = new StyleAttr();
RenderableElementStyleAttr.prototype.constructor = RenderableElementStyleAttr;

function RenderableElementStyleAttr()
{
    StyleAttr.call(this);
    this.className = "RenderableElementStyleAttr";
    this.attrType = eAttrType.RenderableElementStyleAttr;

    this.hasFocus = new TernaryAttr(0);
    this.selected = new TernaryAttr(0);

    this.registerAttribute(this.hasFocus, "hasFocus");
    this.registerAttribute(this.selected, "selected");
}

RenderableElementStyleAttr.prototype.updateStyle = function (style)
{
    var setOp = style.setOp.getValueDirect();

    // hasFocus
    if (style.getAttributeModificationCount(style.hasFocus))
    {
        this.hasFocus.copyValue(style.hasFocus, setOp);
    }

    // selected
    if (style.getAttributeModificationCount(style.selected))
    {
        this.selected.copyValue(style.selected, setOp);
    }
}

PlaneAttr.prototype = new AttributeContainer();
PlaneAttr.prototype.constructor = PlaneAttr;

function PlaneAttr()
{
    AttributeContainer.call(this);
    this.className = "PlaneAttr";
    this.attrType = eAttrType.PlaneAttr;

    this.point = new Vector3DAttr(0, 0, 0);
    this.normal = new Vector3DAttr(0, 0, 1);
    this.dot = new NumberAttr(0);

    this.registerAttribute(this.point, "point");
    this.registerAttribute(this.normal, "normal");
    this.registerAttribute(this.dot, "dot");
}

PlaneAttr.prototype.getValueDirect = function ()
{
    var point = this.point.getValueDirect();
    var normal = this.normal.getValueDirect();
    var plane = new Plane(new Vector3D(point.x, point.y, point.z), new Vector3D(normal.x, normal.y, normal.z));
    return plane;
}

PlaneAttr.prototype.setValueDirect = function (plane)
{
    this.point.setValueDirect(plane.point.x, plane.point.y, plane.point.z);
    this.normal.setValueDirect(plane.normal.x, plane.normal.y, plane.normal.z);
    this.dot.setValueDirect(plane.dot);
}

ViewVolumeAttr.prototype = new AttributeContainer();
ViewVolumeAttr.prototype.constructor = ViewVolumeAttr;

function ViewVolumeAttr()
{
    AttributeContainer.call(this);
    this.className = "ViewVolumeAttr";
    this.attrType = eAttrType.ViewVolumeAttr;

    this.left = new PlaneAttr();
    this.right = new PlaneAttr();
    this.top = new PlaneAttr();
    this.bottom = new PlaneAttr();
    this.near = new PlaneAttr();
    this.far = new PlaneAttr();

    this.registerAttribute(this.left, "left");
    this.registerAttribute(this.right, "right");
    this.registerAttribute(this.top, "top");
    this.registerAttribute(this.bottom, "bottom");
    this.registerAttribute(this.near, "near");
    this.registerAttribute(this.far, "far");
}

ViewVolumeAttr.prototype.setValueDirect = function (left, right, top, bottom, near, far)
{
    this.left.setValueDirect(left);
    this.right.setValueDirect(right);
    this.top.setValueDirect(top);
    this.bottom.setValueDirect(bottom);
    this.near.setValueDirect(near);
    this.far.setValueDirect(far);
}

SphereAttr.prototype = new AttributeContainer();
SphereAttr.prototype.constructor = SphereAttr;

function SphereAttr()
{
    AttributeContainer.call(this);
    this.className = "SphereAttr";
    this.attrType = eAttrType.SphereAttr;

    this.sphere = new Sphere();

    this.center = new Vector3DAttr(0, 0, 0);
    this.radius = new NumberAttr(0);

    this.center.addModifiedCB(SphereAttr_CenterModifiedCB, this);
    this.radius.addModifiedCB(SphereAttr_RadiusModifiedCB, this);
    
    this.registerAttribute(this.center, "center");
    this.registerAttribute(this.radius, "radius");
}

function SphereAttr_CenterModifiedCB(attribute, container)
{
    container.sphere.center = attribute.getValueDirect();
}

function SphereAttr_RadiusModifiedCB(attribute, container)
{
    container.sphere.radius = attribute.getValueDirect();
}