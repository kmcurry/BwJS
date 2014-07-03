RenderParams.prototype = new DirectiveParams();
RenderParams.prototype.constructor = RenderParams();

function RenderParams()
{
    DirectiveParams.call(this);
    
    this.viewport = new Viewport();
    this.projMatrix = new Matrix4x4();
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.dissolve = 0;
    this.opacity = 1;
    this.distanceSortAgent = null;
    this.drawTextures = true;
}

RenderDirective.prototype = new SGDirective();
RenderDirective.prototype.constructor = RenderDirective;

function RenderDirective()
{
    SGDirective.call(this);
    this.className = "RenderDirective";
    this.attrType = eAttrType.RenderDirective;
    
    this.name.setValueDirect("RenderDirective");

    this.distanceSortAgent = new DistanceSortAgent();
    
    this.viewport = new ViewportAttr();
    this.backgroundImageFilename = new StringAttr("");
    this.foregroundImageFilename = new StringAttr("");
    this.foregroundAlphaFilename = new StringAttr("");
    this.foregroundFadeEnabled = new BooleanAttr(false);
    this.texturesEnabled = new BooleanAttr(true);
    
    this.viewport.addModifiedCB(RenderDirective_ViewportModifiedCB, this);
    this.backgroundImageFilename.addModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, this);
    
    this.registerAttribute(this.viewport, "viewport"); 
    this.registerAttribute(this.backgroundImageFilename, "backgroundImageFilename");
    this.registerAttribute(this.foregroundImageFilename, "foregroundImageFilename");
    this.registerAttribute(this.foregroundAlphaFilename, "foregroundAlphaFilename");   
    this.registerAttribute(this.foregroundFadeEnabled, "foregroundFadeEnabled");   
    this.registerAttribute(this.texturesEnabled, "texturesEnabled");   
       
    this.updateDirective = new UpdateDirective();
}

RenderDirective.prototype.setGraphMgr = function(graphMgr)
{
    this.distanceSortAgent.setGraphMgr(graphMgr);
    
    // call base-class implementation
    SGDirective.prototype.setGraphMgr.call(this, graphMgr);
}

RenderDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // update
    this.updateDirective.execute(root);

    // render
    var params = new RenderParams();
    params.directive = this;
    params.viewport.loadViewport(this.viewport.getValueDirect());
    params.distanceSortAgent = this.distanceSortAgent;
    params.drawTextures = this.texturesEnabled.getValueDirect();

    root.apply("render", params, true);

    // sort and draw semi-transparent geometries (if any)
    if (!this.distanceSortAgent.isEmpty())
    {
        this.distanceSortAgent.sort();
        this.distanceSortAgent.draw();
        this.distanceSortAgent.clear();
    }
}

function RenderDirective_ViewportModifiedCB(attribute, container)
{
//    var vp = container.viewport.getValueDirect();
//    var url = container.backgroundImageFilename.getValueDirect().join("");
//    container.graphMgr.renderContext.setBackgroundImage(url, vp.width, vp.height);
}

function RenderDirective_BackgroundImageFilenameModifiedCB(attribute, container)
{
    var vp = container.viewport.getValueDirect();
    var pathInfo = formatPath(container.backgroundImageFilename.getValueDirect().join(""));
    
    container.backgroundImageFilename.removeModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, container);
    container.backgroundImageFilename.setValueDirect(pathInfo[0]);
    container.backgroundImageFilename.addModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, container);
    
    container.graphMgr.renderContext.setBackgroundImage(pathInfo[0], vp.width, vp.height);
}