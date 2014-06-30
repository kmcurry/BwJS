BalloonTipLabel.prototype = new RasterComponent();
BalloonTipLabel.prototype.constructor = BalloonTipLabel;

var g_hb1 = null;

function BalloonTipLabel()
{
    RasterComponent.call(this);
    this.className = "BallonTipLabel";
    this.attrType = eAttrType.BalloonTipLabel;
    
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
    
    // create html div for canvas overlay
    var htmlBalloonTipLabel = CreateHTMLBalloonTipLabel(this.id);
    this.htmlBalloonTipLabel = htmlBalloonTipLabel;
}

BalloonTipLabel.prototype.update = function(params, visitChildren)
{
    if (params.userData)
    {
        var updateParams = params.userData;
        if (this.show.getValueDirect())// && (this.updateLabel || isRenderStateModified(updateParams.viewport)))
        {
            this.updateLabel = false;

            updateLabel(updateParams.viewport);
        }
    }

    // call base-class implementation
    RasterComponent.prototype.update.call(this, params, visitChildren);
}

BalloonTipLabel.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
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
    //if (this.htmlBalloonTipLabel.style.visibility == "visible")
    {
        this.htmlBalloonTipLabel.style.left = bworks.canvas.offsetLeft + positions.labelX;
        this.htmlBalloonTipLabel.style.top = bworks.canvas.offsetTop + positions.labelY;

        this.labelRect.load(bworks.canvas.offsetLeft + positions.labelX,
                            bworks.canvas.offsetTop + positions.labelY,
                            this.labelRect.left + labelWidth,
                            this.labelRect.top + labelHeight);
        
        if (g_hb1){
        var id = 'a[id=' + this.id + ']';  
        //$(id).qtip("reposition");
        var api = $(id).qtip("api");
        api.reposition(null, false); // Reposition without animation
        }
    }
    //else
    {
        this.labelRect.load(0, 0, 0, 0);
    }
    
    // update screen rect
    var screenRect = new Rect(0, 0, 0, 0);
    //if (this.htmlBalloonTipLabel.style.visibility == "visible")
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
    var labelStyle = this.styles.getStyle();
    if (labelStyle)
    {
        // displayMode
        var displayMode;
        labelStyle.displayMode().getValueDirect(displayMode);
        if (!displayMode.empty())
        {
            if (!strcmp("default", displayMode[0]))
            {
                this.show.setValueDirect(true, false);
            }
            else
            if (!strcmp("hide", displayMode[0]))
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
        }
    }

    this.updateLabel = update;
    incrementModificationCount();
}

BalloonTipLabel.prototype.balloonTipLabelStyleBgColorModified = function()
{
}

BalloonTipLabel.prototype.balloonTipLabelStyleDisplayModeModifiedCB = function(mode)
{
}

BalloonTipLabel.prototype.renderSequenceSlotModified = function()
{
}

BalloonTipLabel.prototype.showModified = function(show)
{
}

function CreateHTMLBalloonTipLabel(id)
{
    var newA = null;

    // Needs further refactoring. Currently set in an app Helper
    // because we don't have container scope here to append these elements
    if (bridgeworks.rasterComponents)
    {
        // containing div
        newA = document.createElement("a");
        if (newA)
        {
            newA.setAttribute("id", id);
            newA.innerHTML = "Test";
            newA.style.visibility = "hidden";
            newA.style.position = "absolute";

            bridgeworks.rasterComponents.appendChild(newA);
        }
    }

    var aid = 'a[id=' + id + ']';
    g_hb1 = $(aid).qtip(
    {
        style :
        {
            classes : 'qtip-bootstrap qtip-rounded qtip-shadow'
        },
        content :
        {
            text : '<html><body><H1 id="H1">BalloonTipLabel</H1></body></html>'
        },
        //show : true,
        hide : false
    });
    g_hb1.qtip("show");
   
    return newA;
}

function BalloonTipLabel_balloonTipLabelStyleModifiedCB(attribute, container)
{
}

function BalloonTipLabel_balloonTipLabelStyleBgColorModifiedCB(attribute, container)
{
}

function BalloonTipLabel_balloonTipLabelStyleDisplayModeModifiedCB(attribute, container)
{
}

function BalloonTipLabel_BalloonTipLabelStyleHTMLLabelStyleModifiedCB(attribute, container)
{
}

function BalloonTipLabel_HTMLLabel_PageDimensionsModifiedCB(attribute, container)
{
}

function BalloonTipLabel_showModifiedCB(attribute, container)
{
}

function BalloonTipLabel_renderSequenceSlotModifiedCB(attribute, container)
{
}
