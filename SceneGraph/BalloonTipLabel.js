BalloonTipLabel.prototype = new RasterComponent();
BalloonTipLabel.prototype.constructor = BalloonTipLabel;

function BalloonTipLabel()
{
    RasterComponent.call(this);
    this.className = "BallonTipLabel";
    this.attrType = eAttrType.BalloonTipLabel;
    
    this.qtip = null;
    this.qtip_api = null;
    
    this.labelRect = new Rect(0, 0, 0, 0);
    
    this.balloonTipLabelStyle = new BalloonTipLabelStyleAttr();
    this.labelWidth = new NumberAttr(0);
    this.labelHeight = new NumberAttr(0);
    
    this.balloonTipLabelStyle.bgColor.addModifiedCB(BalloonTipLabel_balloonTipLabelStyleBgColorModifiedCB, this);
    this.balloonTipLabelStyle.htmlLabelStyle.addModifiedCB(BalloonTipLabel_BalloonTipLabelStyleHTMLLabelStyleModifiedCB, this);
    this.balloonTipLabelStyle.displayMode.addModifiedCB(BalloonTipLabel_balloonTipLabelStyleDisplayModeModifiedCB, this);
    this.show.addModifiedCB(BalloonTipLabel_showModifiedCB, this);
    this.renderSequenceSlot.addModifiedCB(BalloonTipLabel_renderSequenceSlotModifiedCB, this);

    this.registerAttribute(this.balloonTipLabelStyle, "balloonTipLabelStyle");
    this.registerAttribute(this.labelWidth, "labelWidth");
    this.registerAttribute(this.labelHeight, "labelHeight");
    
    this.styles.registerStyle(this.balloonTipLabelStyle, "balloonTipLabelStyle");
}

BalloonTipLabel.prototype.setGraphMgr = function(graphMgr)
{
    // call base-class implementation
    RasterComponent.prototype.setGraphMgr.call(this, graphMgr);
    
    // create id
    this.id = "BalloonTipLabel" + this.graphMgr.getNextBalloonTipLabelIndex();
    
    // create html components for canvas overlay
    var htmlBalloonTipLabel = CreateHTMLBalloonTipLabel(this.id);
    this.htmlBalloonTipLabel = htmlBalloonTipLabel.label;
    this.qtip = htmlBalloonTipLabel.qtip;
    
    // get qtip api 
    this.qtip_api = $('a[id=' + this.id + ']').qtip("api");
}

BalloonTipLabel.prototype.update = function(params, visitChildren)
{
    if (params.userData)
    {
        var updateParams = params.userData;
        if (this.show.getValueDirect())// && (this.updateLabel || isRenderStateModified(updateParams.viewport)))
        {
            this.updateLabel = false;

            //updateLabel(updateParams.viewport);
        }
    }

    // call base-class implementation
    RasterComponent.prototype.update.call(this, params, visitChildren);
}

BalloonTipLabel.prototype.apply = function(directive, params, visitChildren)
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
    }
    
    // call base-class implementation
    RasterComponent.prototype.apply.call(this, directive, params, visitChildren);
}

BalloonTipLabel.prototype.updateLabel = function(viewport)
{
}

BalloonTipLabel.prototype.updateLabelDimensions = function(viewport)
{
}

BalloonTipLabel.prototype.updateShowStates = function()
{
}

BalloonTipLabel.prototype.draw = function()
{
    if (!(this.show.getValueDirect()))
    {
        if (this.graphMgr.getCurrentBalloonTipLabel() == this)
        {
            this.graphMgr.setCurrentBalloonTipLabel(null);
        }
        return;
    }
    /*
     // only allow one balloon tip to display at a time (per Ted)
     BalloonTipLabel* currentBTL = this.graphMgr.getCurrentBalloonTipLabel();
     if (currentBTL && currentBTL != this)
     {
     this.show.setValueDirect(false, false);
     return;
     }
     */
    this.graphMgr.setCurrentBalloonTipLabel(this);
    
    var bworks = this.registry.find("Bridgeworks");
    
    // determine the rendering positions
    var positions = this.getRenderingPositions();
    
    var labelWidth = this.htmlBalloonTipLabel.offsetWidth; // * this.htmlLabel.style.zoom;
    var labelHeight = this.htmlBalloonTipLabel.offsetHeight; // * this.htmlLabel.style.zoom;
    
    // update positions if visible
    //if (this.show.getValueDirect())
    {
        this.htmlBalloonTipLabel.style.left = bworks.canvas.offsetLeft + positions.labelX;
        this.htmlBalloonTipLabel.style.top = bworks.canvas.offsetTop + positions.labelY;

        this.labelRect.load(bworks.canvas.offsetLeft + positions.labelX,
                            bworks.canvas.offsetTop + positions.labelY,
                            this.labelRect.left + labelWidth,
                            this.labelRect.top + labelHeight);
        
        if (this.qtip_api)
        {
            this.qtip_api.reposition(null, false); // Reposition without animation
            //this.qtip_api.show();
        }
    }
    //else
    //{
    //    this.labelRect.load(0, 0, 0, 0);
    //}
    
    // update screen rect
    var screenRect = new Rect(0, 0, 0, 0);
    //if (this.show.getValueDirect())
    {
        screenRect.loadRect(this.labelRect);
    }
    this.screenRect.setValueDirect(screenRect);
}

BalloonTipLabel.prototype.getRenderingPositions = function()
{
    // initialize
    var labelX = 0;
    var labelY = 0;
    
    // get screen position
    var screen = this.screenPosition.getValueDirect();
    
    // get anchor position
    var anchor = this.anchor.getValueDirect();
    
    labelX = screen.x + anchor.x;
    labelY = screen.y - anchor.y;
    
    return { labelX: labelX, labelY: labelY };
}

BalloonTipLabel.prototype.eventPerformed = function(event)
{
    if (!(this.show.getValueDirect()))
    {
        return false;
    }

    var selected = this.isSelected(event.x, event.y);

    return selected;
}

BalloonTipLabel.prototype.balloonTipLabelStyleModified = function(update)
{
}

BalloonTipLabel.prototype.balloonTipLabelStyleBgColorModified = function()
{
}

BalloonTipLabel.prototype.balloonTipLabelStyleDisplayModeModified = function(mode)
{
    switch (mode)
    {
        case "default":
        {
            this.show.setValueDirect(true, false);
        }
        break;
        
        case "hide":
        {
            // don't hide if parent has focus
            if (this.motionParent && this.motionParent.getAttribute("hasFocus").getValueDirect() > 0)
            {
                // a bit kludgy for this programmer, but this is nessary to get the "Google Earth"-like behavior [MCB]
                this.hasFocus.setValueDirect(1);
                //DisableInspectionState();
            }
            else
            {
                this.show.setValueDirect(false, false);
            }
        }
        break;
    }
        
    this.setModified();
}

BalloonTipLabel.prototype.balloonTipLabelStyleHtmlLabelStyleModified = function()
{
    // html
    var html = this.balloonTipLabelStyle.htmlLabelStyle.html.getValueDirect().join("");
    
    if (this.qtip_api)
    {
        this.qtip_api.set("content.text", html);
    }
    
    this.setModified();
}

BalloonTipLabel.prototype.renderSequenceSlotModified = function()
{
}

BalloonTipLabel.prototype.showModified = function(show)
{
    if (this.qtip_api)
    {
        if (show)
        {
            this.qtip_api.show();
        }
        else
        {
            this.qtip_api.hide();
        }
    }
}

function CreateHTMLBalloonTipLabel(id)
{
    var newA = null;

    // Needs further refactoring. Currently set in an app Helper
    // because we don't have container scope here to append these elements
    if (bridgeworks.rasterComponents)
    {
        newA = document.createElement("a");
        if (newA)
        {
            newA.setAttribute("id", id);
            //newA.innerHTML = "";
            newA.style.visibility = "hidden";
            newA.style.position = "absolute";

            bridgeworks.rasterComponents.appendChild(newA);
        }
    }

    var id = 'a[id=' + id + ']';
    var qtip = $(id).qtip(
    {
        style:
        {
            classes: 'qtip-bootstrap qtip-rounded qtip-shadow qtip-close'
        },
        content :
        {
            text: '',
            button: true
        },
        //show : true,
        hide:
        {
            event: false
        }
    });
   
    return { label: newA, qtip: qtip };
}

function BalloonTipLabel_balloonTipLabelStyleModifiedCB(attribute, container)
{
    container.balloonTipLabelStyleModified();
}

function BalloonTipLabel_balloonTipLabelStyleBgColorModifiedCB(attribute, container)
{
}

function BalloonTipLabel_balloonTipLabelStyleDisplayModeModifiedCB(attribute, container)
{
    container.balloonTipLabelStyleDisplayModeModified(attribute.getValueDirect().join(""));
}

function BalloonTipLabel_BalloonTipLabelStyleHTMLLabelStyleModifiedCB(attribute, container)
{
    container.balloonTipLabelStyleHtmlLabelStyleModified();
}

function BalloonTipLabel_HTMLLabel_PageDimensionsModifiedCB(attribute, container)
{
}

function BalloonTipLabel_showModifiedCB(attribute, container)
{
    container.showModified(attribute.getValueDirect());
}

function BalloonTipLabel_renderSequenceSlotModifiedCB(attribute, container)
{
}
