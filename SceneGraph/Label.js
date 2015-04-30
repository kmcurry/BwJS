Label.prototype = new RasterComponent();
Label.prototype.constructor = Label;

function Label()
{
    RasterComponent.call(this);
    this.className = "Label";
    this.attrType = eAttrType.Label;

    this.iconRect = new Rect(0, 0, 0, 0);
    this.labelRect = new Rect(0, 0, 0, 0);

    this.text = new StringAttr("");
    this.description = new StringAttr("");
    this.depthShadingEnabled = new BooleanAttr(true);
    this.labelStyle = new LabelStyleAttr();
    this.iconStyle = new IconStyleAttr();
    this.balloonTipLabelStyle = new BalloonTipLabelStyleAttr();

    this.text.addModifiedCB(Label_TextModifiedCB, this);
    this.description.addModifiedCB(Label_DescriptionModifiedCB, this);
    this.labelStyle.backgroundColor.addModifiedCB(Label_LabelStyleBackgroundColorModifiedCB, this);
    this.labelStyle.backgroundOpacity.addModifiedCB(Label_LabelStyleBackgroundOpacityModifiedCB, this);
    this.labelStyle.fontStyle.borderColor.addModifiedCB(Label_LabelStyleFontBorderModifiedCB, this);
    this.labelStyle.fontStyle.borderWidth.addModifiedCB(Label_LabelStyleFontBorderModifiedCB, this);
    this.labelStyle.fontStyle.color.addModifiedCB(Label_LabelStyleFontStyleColorModifiedCB, this);
    this.labelStyle.fontStyle.font.addModifiedCB(Label_LabelStyleFontStyleFontModifiedCB, this);
    this.labelStyle.fontStyle.opacity.addModifiedCB(Label_LabelStyleFontStyleOpacityModifiedCB, this);
    this.labelStyle.fontStyle.size.addModifiedCB(Label_LabelStyleFontStyleSizeModifiedCB, this);
    this.labelStyle.fontStyle.style.addModifiedCB(Label_LabelStyleFontStyleStyleModifiedCB, this);
    this.labelStyle.format.addModifiedCB(Label_LabelStyleFormatModifiedCB, this);
    this.labelStyle.padding.addModifiedCB(Label_LabelStylePaddingModifiedCB, this);
    this.iconStyle.url.addModifiedCB(Label_IconStyleUrlModifiedCB, this);
    this.balloonTipLabelStyle.addModifiedCB(Label_BalloonTipLabelStyleModifiedCB, this);

    this.registerAttribute(this.text, "text");
    this.registerAttribute(this.description, "description");
    this.registerAttribute(this.depthShadingEnabled, "depthShadingEnabled");
    this.registerAttribute(this.labelStyle, "labelStyle");
    this.registerAttribute(this.iconStyle, "iconStyle");
    this.registerAttribute(this.balloonTipLabelStyle, "balloonTipLabelStyle");

    this.styles.registerStyle(this.iconStyle, "iconStyle");
    this.styles.registerStyle(this.labelStyle, "labelStyle");
    this.styles.registerStyle(this.balloonTipLabelStyle, "balloonTipLabelStyle");
}

Label.prototype.setGraphMgr = function(graphMgr)
{
    // call base-class implementation
    RasterComponent.prototype.setGraphMgr.call(this, graphMgr);

    // create id
    this.id = "Label" + this.graphMgr.getNextLabelIndex();
    this.labelId = this.id + "_label";
    this.iconId = this.id + "_icon";

    // create html div for canvas overlay
    var htmlLabel = CreateHTMLLabel(this.id, this.labelId, this.iconId);
    this.htmlLabel = htmlLabel.label;
    this.htmlIconImg = htmlLabel.iconImg;
    this.htmlIconDiv = htmlLabel.iconDiv;

    // initialize base dimensions of icon (used for scaling)
    this.htmlIconImg.baseWidth = 0;
    this.htmlIconImg.baseHeight = 0;

    // set initial style
    Label_LabelStyleBackgroundColorModifiedCB(this.labelStyle.backgroundColor, this);
    Label_LabelStyleBackgroundOpacityModifiedCB(this.labelStyle.backgroundOpacity, this);
    Label_LabelStyleFontBorderModifiedCB(null, this); // handles borderColor and borderWidth
    Label_LabelStyleFontStyleColorModifiedCB(this.labelStyle.fontStyle.color, this);
    Label_LabelStyleFontStyleFontModifiedCB(this.labelStyle.fontStyle.font, this);
    Label_LabelStyleFontStyleOpacityModifiedCB(this.labelStyle.fontStyle.opacity, this);
    Label_LabelStyleFontStyleSizeModifiedCB(this.labelStyle.fontStyle.size, this);
    Label_LabelStyleFontStyleStyleModifiedCB(this.labelStyle.fontStyle.style, this);
    Label_LabelStyleFormatModifiedCB(this.labelStyle.format, this);
    Label_LabelStylePaddingModifiedCB(this.labelStyle.padding, this);
    Label_IconStyleUrlModifiedCB(this.iconStyle.url, this);
}

Label.prototype.update = function(params, visitChildren)
{
    // update icon scale
    // (necessary because dimensions are not available until image is actually loaded)
    this.updateIconScale();
    
    // call base-class implementation
    RasterComponent.prototype.update.call(this, params, visitChildren);
}

Label.prototype.updateIconScale = function()
{
    var scale = this.iconStyle.scale.getValueDirect();

    // obtain original dimensions
    if (this.htmlIconImg.baseWidth == 0)
    {
        this.htmlIconImg.baseWidth = this.htmlIconImg.offsetWidth;
        this.htmlIconImg.baseHeight = this.htmlIconImg.offsetHeight;
    }

    // scale
    if (this.htmlIconImg.baseWidth)
    {
        this.htmlIconImg.width = this.htmlIconImg.baseWidth * scale.x;
        this.htmlIconImg.height = this.htmlIconImg.baseHeight * scale.y;
    }
}

Label.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled_)
    {
        // call base-class implementation
        RasterComponent.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
        case "render":
            {
                this.draw(params.viewport);
            }
            break;

        case "rayPick":
            {
                if (this.selectable.getValueDirect() == true &&
                        this.show.getValueDirect() == true)
                {
                    if (this.isSelected(params.clickPoint.x, params.clickPoint.y))
                    {
                        var intersectRecord = new RayIntersectRecord();
                        intersectRecord.distance = 0;

                        params.currentNodePath.push(this);
                        params.directive.addPickRecord(new RayPickRecord(params.currentNodePath, intersectRecord, params.camera));
                        params.currentNodePath.pop();
                    }
                }
            }
            break;
    }

    // call base-class implementation
    RasterComponent.prototype.apply.call(this, directive, params, visitChildren);
}

Label.prototype.draw = function(viewport)
{
    var bworks = this.registry.find("Bridgeworks");

    // show
    if (this.show.getValueDirect() == false)
    {
        this.htmlLabel.style.visibility = "hidden";
        this.htmlIconImg.style.visibility = "hidden";
        return;
    }

    this.htmlLabel.style.visibility = "visible";
    this.htmlIconImg.style.visibility = "visible";

    // update visibility with respect to color/opacity
    if (this.labelStyle.fontStyle.opacity.getValueDirect() == 0)
    {
        this.htmlLabel.style.visibility = "hidden";
    }
    var iconColor = this.iconStyle.color.getValueDirect();
    if (iconColor.a == 0 || this.iconStyle.opacity.getValueDirect() == 0)
    {
        this.htmlIconImg.style.visibility = "hidden";
    }

    // determine the rendering positions
    var positions = this.getRenderingPositions();

    var labelWidth = this.htmlLabel.offsetWidth; // * this.htmlLabel.style.zoom;
    var labelHeight = this.htmlLabel.offsetHeight; // * this.htmlLabel.style.zoom;
    var iconWidth = this.htmlIconImg.offsetWidth;
    var iconHeight = this.htmlIconImg.offsetHeight;

    // determine if label is fully contained within viewport
    if (positions.labelX < 0 ||
        positions.labelY < 0 ||
        positions.labelX + labelWidth > bworks.canvas.width ||
        positions.labelY + labelHeight > bworks.canvas.height)
    {
        this.htmlLabel.style.visibility = "hidden";
    }

    // determine if icon is fully contained within viewport
    if (positions.iconX < 0 ||
        positions.iconY < 0 ||
        positions.iconX + iconWidth > bworks.canvas.width ||
        positions.iconY + iconHeight > bworks.canvas.height)
    {
        this.htmlIconImg.style.visibility = "hidden";
    }

    // update positions if visible
    if (this.htmlLabel.style.visibility == "visible")
    {
        this.htmlLabel.style.left = bworks.canvas.offsetLeft + positions.labelX;
        this.htmlLabel.style.top = bworks.canvas.offsetTop + positions.labelY;

        this.labelRect.load(bworks.canvas.offsetLeft + positions.labelX,
                bworks.canvas.offsetTop + positions.labelY,
                this.labelRect.left + labelWidth,
                this.labelRect.top + labelHeight);
    }
    else
    {
        this.labelRect.load(0, 0, 0, 0);
    }
    if (this.htmlIconImg.style.visibility == "visible")
    {
        this.htmlIconDiv.style.left = bworks.canvas.offsetLeft + positions.iconX;
        this.htmlIconDiv.style.top = bworks.canvas.offsetTop + positions.iconY;

        this.iconRect.load(bworks.canvas.offsetLeft + positions.iconX,
                bworks.canvas.offsetTop + positions.iconY,
                this.iconRect.left + iconWidth,
                this.iconRect.top + iconHeight);
    }
    else
    {
        this.iconRect.load(0, 0, 0, 0);
    }

    // update screen rect
    var screenRect = new Rect(0, 0, 0, 0);
    if (this.htmlLabel.style.visibility == "visible" &&
            this.htmlIconImg.style.visibility == "visible")
    {
        screenRect.left = Math.min(this.labelRect.left, this.iconRect.left);
        screenRect.top = Math.min(this.labelRect.top, this.iconRect.top);
        screenRect.right = Math.max(this.labelRect.right, this.iconRect.right);
        screenRect.bottom = Math.max(this.labelRect.bottom, this.iconRect.bottom);
    }
    else if (this.htmlLabel.style.visibility == "visible")
    {
        screenRect.loadRect(this.labelRect);
    }
    else if (this.htmlIconImg.style.visibility == "visible")
    {
        screenRect.loadRect(this.iconRect);
    }
    this.screenRect.setValueDirect(screenRect);
}

Label.prototype.getRenderingPositions = function()
{
    // initialize
    var labelX = 0;
    var labelY = 0;
    var iconX = 0;
    var iconY = 0;

    // get screen position
    var screen = this.screenPosition.getValueDirect();

    // get anchor position
    var anchor = this.anchor.getValueDirect();

    // get label offset
    var offset = this.labelStyle.offset.getValueDirect();

    if (this.htmlIconImg.offsetWidth > 0 &&
            this.htmlLabel.offsetWidth > 0) // icon and label present
    {
        var labelWidth = this.htmlLabel.offsetWidth;// * this.htmlLabel.style.zoom;
        var labelHeight = this.htmlLabel.offsetHeight;// * this.htmlLabel.style.zoom;
        var iconWidth = this.htmlIconImg.offsetWidth;
        var iconHeight = this.htmlIconImg.offsetHeight;

        // measure from origin
        if (this.origin.getValueDirect().join("") == "bottomLeft")
        {
            anchor.y = iconHeight - anchor.y;
        }

        // 
        iconX = screen.x - anchor.x;
        iconY = screen.y - anchor.y;
        labelX = iconX + offset.x;
        labelY = iconY + offset.y;

        // adjust according to alignment
        switch (this.labelStyle.textAlign.getValueDirect().join(""))
        {
            case "topLeft":
                labelX -= labelWidth;
                labelY -= labelHeight / 2;
                break;

            case "middleLeft":
                labelX -= labelWidth;
                labelY += iconHeight / 2 - labelHeight / 2;
                break;

            case "bottomLeft":
                labelX -= labelWidth;
                labelY += iconHeight - labelHeight / 2;
                break;

            case "topCenter":
                labelX += iconWidth / 2 - labelWidth / 2;
                labelY -= labelHeight;
                break;

            case "middleCenter":
                labelX += iconWidth / 2 - labelWidth / 2;
                labelY += iconHeight / 2 - labelHeight / 2;
                break;

            case "bottomCenter":
                labelX += iconWidth / 2 - labelWidth / 2;
                labelY += iconHeight;
                break;

            case "topRight":
                labelX += iconWidth;
                labelY -= labelHeight / 2;
                break;

            case "bottomRight":
                labelX += iconWidth;
                labelY += iconHeight - labelHeight / 2;
                break;

            case "middleRight": // default
            default:
                labelX += iconWidth;
                labelY += iconHeight / 2 - labelHeight / 2;
                break;
        }
    }
    else if (this.htmlLabel.offsetWidth > 0)
    {
        var labelWidth = this.htmlLabel.offsetWidth;// * this.htmlLabel.style.zoom;
        var labelHeight = this.htmlLabel.offsetHeight;// * this.htmlLabel.style.zoom;

        // 
        labelX = screen.x + anchor.x + offset.x;
        labelY = screen.y - anchor.y + offset.y;

        // adjust according to alignment
        switch (this.labelStyle.textAlign.getValueDirect().join(""))
        {
            case "topLeft":
                labelX -= labelWidth;
                labelY -= labelHeight;
                break;

            case "middleLeft":
                labelX -= labelWidth;
                labelY -= labelHeight / 2;
                break;

            case "bottomLeft":
                labelX -= labelWidth;
                break;

            case "topCenter":
                labelX -= labelWidth / 2;
                labelY -= labelHeight;
                break;

            case "middleCenter":
                labelX -= labelWidth / 2;
                labelY -= labelHeight / 2;
                break;

            case "bottomCenter":
                labelX -= labelWidth / 2;
                break;

            case "topRight":
                labelY -= labelHeight;
                break;

            case "bottomRight":
                break;

            case "middleRight": // default
            default:
                labelY -= labelHeight / 2;
                break;
        }
    }
    else // only icon present
    {
        var iconWidth = this.htmlIconImg.offsetWidth;
        var iconHeight = this.htmlIconImg.offsetHeight;

        // measure from bottom left
        anchor.y = iconHeight - anchor.y;

        iconX = screen.x - anchor.x;
        iconY = screen.y - anchor.y;
    }

    return {labelX: labelX, labelY: labelY, iconX: iconX, iconY: iconY};
}

Label.prototype.eventPerformed = function(event)
{
    if (!(this.show.getValueDirect()))
    {
        return false;
    }

    var selected = this.isSelected(event.x, event.y);

    return selected;
}

Label.prototype.labelStyleFontBorderModified = function()
{
    var color = this.labelStyle.fontStyle.borderColor.getValueDirect();
    color.a *= this.labelStyle.fontStyle.opacity.getValueDirect();
    var width = this.labelStyle.fontStyle.borderWidth.getValueDirect();

    var shadow = "";
    for (var i = 0; i < color.a; i += 0.2)
    {
        if (i > 0)
            shadow += ", ";

        shadow += "rgba(" + color.r * 255 + ","
                + color.g * 255 + ","
                + color.b * 255 + ","
                + color.a + ")" + " 0px 0px " + width * 2 + "px";
    }

    this.htmlLabel.style.textShadow = shadow;
}

function CreateHTMLLabel(id, labelId, iconId)
{
    var newDiv = null;
    var newLabel = null;
    var newIconImg = null;
    var newIconDiv = null;

    // Needs further refactoring. Currently set in an app Helper
    // because we don't have container scope here to append these elements
    if (bridgeworks.rasterComponents)
    {
        // containing div
        newDiv = document.createElement("div");
        if (newDiv)
        {
            newDiv.setAttribute("id", id);

            // label
            newLabel = document.createElement("span");
            if (newLabel)
            {
                newLabel.setAttribute("id", labelId);
                newLabel.setAttribute("class", "labelText");
                newLabel.style.visibility = "hidden";
                newLabel.style.position = "absolute";
                newLabel.style.zIndex = 3;
                //newLabel.style.zoom = 1;//.95;
                newLabel.onmousedown = function() { /*onMouseDown();*/
                };
                newLabel.onmouseup = function() { /*onMouseUp();*/
                };
                newLabel.onmousemove = function() { /*onMouseMove();*/
                };
                // disable selection
                newLabel.onselectstart = new Function("return false");

                newDiv.appendChild(newLabel);
            }

            // icon
            newIconDiv = document.createElement("div");
            if (newIconDiv)
            {
                newIconDiv.setAttribute("id", iconId);
                newIconDiv.style.position = "absolute";
                newIconDiv.style.zIndex = 3;

                newIconImg = document.createElement("img");
                if (newIconImg)
                {
                    newIconImg.setAttribute("class", "labelIcon");
                    newIconImg.style.visibility = "hidden";
                    newIconImg.src = "BwContent/images/1x1.png";
                    //newIconImg.onmousedown = function(){onMouseDown();};
                    newIconImg.onmouseup = function() { /*onMouseUp();*/
                    };
                    newIconImg.onmousemove = function() { /*onMouseMove();*/
                    };
                    // disable selection
                    newIconImg.onmousedown = function() {
                        return false;
                    };

                    newIconDiv.appendChild(newIconImg);
                }
                newDiv.appendChild(newIconDiv);
            }

            bridgeworks.rasterComponents.appendChild(newDiv);
        }
    }

    return {div: newDiv, label: newLabel, iconDiv: newIconDiv, iconImg: newIconImg};
}

function Label_TextModifiedCB(attribute, container)
{
    container.htmlLabel.innerHTML = attribute.getValueDirect().join("");
}

function Label_DescriptionModifiedCB(attribute, container)
{
    var description = attribute.getValueDirect().join("");
    if (description.length > 0)
    {
        // desired dimensions; if 0, use 50% canvas size
        var width = container.balloonTipLabelStyle.htmlLabelStyle.width.getValueDirect();
        var height = container.balloonTipLabelStyle.htmlLabelStyle.height.getValueDirect();
        if (width == 0 || height == 0)
        {
            var viewportMgr = container.registry.find("ViewportMgr");
            if (width == 0)
                width = viewportMgr.getAttribute("width").getValueDirect() * 0.5;
            if (height == 0)
                height = viewportMgr.getAttribute("height").getValueDirect() * 0.5;
        }

        var id = '#' + container.iconId;
        description = "<div class='gmap' style='" +
                "width:" + (width + 12) + "px;" + // (+ 12 accounts for close button)
                "height:12px;'>" +
                "<a href='javascript:void($(\"" +
                id +
                "\").btOff());'><img src='libs/jquery/bt/close.gif' alt='close' width='12' height='12' class='gmap-close' /></a> " +
                "</div>" +
                "<div style='" +
                "width:" + (width + 12) + "px;" + // (+ 12 accounts for close button)
                "height:" + height + "px;" +
                "overflow:auto;'>" +
                description +
                "</div>";

        var bgColor = container.balloonTipLabelStyle.bgColor.getValueDirect();
        var fill = "rgba(" + bgColor.r * 255 + ","
                + bgColor.g * 255 + ","
                + bgColor.b * 255 + ","
                + bgColor.a * 255 + ")";

        $(id).bt(description, {trigger: 'click',
            width: width + 12 + "px", // (+ 12 accounts for close button)
            height: height + 12 + "px", // (+ 12 accounts for close button)
            shrinkToFit: ((width == 0 && height == 0) ? true : false),
            centerPointX: .9,
            spikeLength: container.balloonTipLabelStyle.balloonOffset.getValueDirect(),
            spikeGirth: 30,
            padding: 15,
            cornerRadius: 25,
            fill: fill,
            strokeStyle: '#ABABAB',
            strokeWidth: 1,
            shadow: true,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,.9)',
            shadowOverlap: false,
            noShadowOpts: {strokeStyle: '#999', strokeWidth: 2}});
    }
    else
    {
        var id = '#' + container.iconId;
        $(id).bt("", {trigger: 'click'});
    }
}

function Label_LabelStyleBackgroundColorModifiedCB(attribute, container)
{
    var color = attribute.getValueDirect();
    color.a *= attribute.getContainer().getAttribute("backgroundOpacity").getValueDirect();
    container.htmlLabel.style.backgroundColor = "rgba(" + color.r * 255 + ","
            + color.g * 255 + ","
            + color.b * 255 + ","
            + color.a + ")";
}

function Label_LabelStyleBackgroundOpacityModifiedCB(attribute, container)
{
    Label_LabelStyleBackgroundColorModifiedCB(container.labelStyle.backgroundColor, container);
}

function Label_LabelStyleFontBorderModifiedCB(attribute, container)
{
    container.labelStyleFontBorderModified();
}

function Label_LabelStyleFontStyleColorModifiedCB(attribute, container)
{
    var color = attribute.getValueDirect();
    color.a *= attribute.getContainer().getAttribute("opacity").getValueDirect();
    container.htmlLabel.style.color = "rgba(" + color.r * 255 + ","
            + color.g * 255 + ","
            + color.b * 255 + ","
            + color.a + ")";
}

function Label_LabelStyleFontStyleFontModifiedCB(attribute, container)
{
    container.htmlLabel.style.fontFamily = attribute.getValueDirect().join("");
}

function Label_LabelStyleFontStyleOpacityModifiedCB(attribute, container)
{
    Label_LabelStyleFontStyleColorModifiedCB(container.labelStyle.fontStyle.color, container);
    Label_LabelStyleFontBorderModifiedCB(null, container);
}

function Label_LabelStyleFontStyleSizeModifiedCB(attribute, container)
{
    container.htmlLabel.style.fontSize = attribute.getValueDirect() + "pt";
}

function Label_LabelStyleFontStyleStyleModifiedCB(attribute, container)
{
    switch (attribute.getValueDirect().join(""))
    {
        case "Bold":
            container.htmlLabel.style.fontWeight = "bold";
            break;

        case "Heavy":
            container.htmlLabel.style.fontWeight = "bolder";
            break;

        case "Normal":
            container.htmlLabel.style.fontWeight = "normal";
            break;

        case "Thin":
            container.htmlLabel.style.fontWeight = "lighter";
            break;
    }
}

function Label_LabelStyleFormatModifiedCB(attribute, container)
{
    var format = attribute.getValueDirect().join("");
    //container.htmlLabel.style.setProperty("textAlign", format, "normal");
    // TODO
}

function Label_LabelStylePaddingModifiedCB(attribute, container)
{
    var padding = attribute.getValueDirect() + "px";
    container.htmlLabel.style.paddingLeft = padding;
    container.htmlLabel.style.paddingRight = padding;
    container.htmlLabel.style.paddingTop = padding;
    container.htmlLabel.style.paddingBottom = padding;
}

function Label_IconStyleUrlModifiedCB(attribute, container)
{
    var url = attribute.getValueDirect().join("");
    switch (url)
    {
        case "":
            //container.htmlIconImg.src = null;
            break;

        default:
            container.htmlIconImg.src = document.location.href + "/../BwContent/" + url;
            break;
    }
}

function Label_BalloonTipLabelStyleModifiedCB(attribute, container)
{
    Label_DescriptionModifiedCB(container.description, container);
}