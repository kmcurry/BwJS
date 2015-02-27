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
    this.displayListObj = null;
    this.disableDisplayLists = false;
    this.resetDisplayLists = false;
    this.lights = [];
    this.modelID = 0;
}

RenderDirective.prototype = new SGDirective();
RenderDirective.prototype.constructor = RenderDirective;

function RenderDirective()
{
    SGDirective.call(this);
    this.className = "RenderDirective";
    this.attrType = eAttrType.RenderDirective;
    
    this.name.setValueDirect("RenderDirective");

    this.backgroundImageSet = false;
    
    this.program = null;
    this.viewport = new ViewportAttr();
    this.backgroundColor = new ColorAttr(1, 1, 1, 1);
    this.backgroundImageFilename = new StringAttr("");
    this.foregroundImageFilename = new StringAttr("");
    this.foregroundAlphaFilename = new StringAttr("");
    this.foregroundFadeEnabled = new BooleanAttr(false);
    this.texturesEnabled = new BooleanAttr(true);
    this.timeIncrement = new NumberAttr(0);
    this.highlightType = new NumberAttr(eHighlightType.None);
    
    this.viewport.addModifiedCB(RenderDirective_ViewportModifiedCB, this);
    this.backgroundColor.addModifiedCB(RenderDirective_BackgroundColorModifiedCB, this);
    this.backgroundImageFilename.addModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, this);
    
    this.registerAttribute(this.viewport, "viewport");
    this.registerAttribute(this.backgroundColor, "backgroundColor");
    this.registerAttribute(this.backgroundImageFilename, "backgroundImageFilename");
    this.registerAttribute(this.foregroundImageFilename, "foregroundImageFilename");
    this.registerAttribute(this.foregroundAlphaFilename, "foregroundAlphaFilename");   
    this.registerAttribute(this.foregroundFadeEnabled, "foregroundFadeEnabled");   
    this.registerAttribute(this.texturesEnabled, "texturesEnabled");   
    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.highlightType, "highlightType");
    
    this.updateDirective = new UpdateDirective();
    this.timeIncrement.addTarget(this.updateDirective.getAttribute("timeIncrement"));
    this.resetDisplayLists = false;
    
    this.distanceSortAgent = new DistanceSortAgent();
       
    this.highlightDirective = new HighlightDirective();
    this.highlightType.addTarget(this.highlightDirective.getAttribute("highlightType"));
    
    this.shadowDirective = new ShadowDirective();
    
    this.backgroundScreen = new Isolator();
    this.backgroundScreen.isolateTextures.setValueDirect(true);
    
    this.backgroundTexture = new MediaTexture();
    this.backgroundScreen.addChild(this.backgroundTexture);
    
    this.backgroundScreenRect = new ScreenRect();
    this.backgroundScreenRect.setTexture(this.backgroundTexture);
    this.backgroundScreen.addChild(this.backgroundScreenRect);
}

RenderDirective.prototype.setRegistry = function(registry)
{
    this.distanceSortAgent.setRegistry(registry);
    this.updateDirective.setRegistry(registry);
    this.highlightDirective.setRegistry(registry);
    this.shadowDirective.setRegistry(registry); registry.register(this.shadowDirective);
    this.backgroundScreen.setRegistry(registry);
    this.backgroundTexture.setRegistry(registry);
    this.backgroundScreenRect.setRegistry(registry);
    
    // call base-class implementation
    SGDirective.prototype.setRegistry.call(this, registry);    
}

RenderDirective.prototype.setGraphMgr = function(graphMgr)
{
    this.distanceSortAgent.setGraphMgr(graphMgr);
    this.updateDirective.setGraphMgr(graphMgr);
    this.highlightDirective.setGraphMgr(graphMgr);
    this.shadowDirective.setGraphMgr(graphMgr);
    this.backgroundScreen.setGraphMgr(graphMgr);
    this.backgroundTexture.setGraphMgr(graphMgr);
    this.backgroundScreenRect.setGraphMgr(graphMgr);
    
    // create shader program
    //this.program = graphMgr.renderContext.createProgram(default_vertex_lighting_vs, default_vertex_lighting_fs);
    this.program = graphMgr.renderContext.createProgram(pcf_shadow_mapping_render_pass_vs, pcf_shadow_mapping_render_pass_fs);
    
    // call base-class implementation
    SGDirective.prototype.setGraphMgr.call(this, graphMgr);
}

RenderDirective.prototype.execute = function(root)
{  
    // set shader program
    this.graphMgr.renderContext.useProgram(this.program);
    
    // draw background
    //this.drawBackground();
    
    root = root || this.rootNode.getValueDirect();

    var visited = this.updateDirective.execute(root);
    
    // setup shadow map
    this.shadowDirective.execute(root);
    
    // render
    params = new RenderParams();
    params.directive = this;
    params.path = null;
    params.pathIndex = 1;
    params.viewport.loadViewport(this.viewport.getValueDirect());
    params.distanceSortAgent = this.distanceSortAgent;
    params.drawTextures = this.texturesEnabled.getValueDirect();

    // if resetting display lists, set the disableDisplayLists renderParams flag this render
    if (this.resetDisplayLists)
    {
    	params.resetDisplayLists = true;
        this.resetDisplayLists = false;
    }
        
    visited[0].apply("render", params, true);
    
    // sort and draw semi-transparent geometries (if any)
    if (!this.distanceSortAgent.isEmpty())
    {
        this.distanceSortAgent.sort();
        this.distanceSortAgent.draw();
        this.distanceSortAgent.clear();
    }
    
    // draw highlights
    this.drawHighlights(root);
}

RenderDirective.prototype.drawBackground = function()
{
    if (!this.backgroundImageSet) return;
    
    // update
    var visited = this.updateDirective.execute(this.backgroundScreen, false);
    
    // render
    params = new RenderParams();
    params.directive = this;
    params.path = null;
    params.pathIndex = 1;
    params.viewport.loadViewport(this.viewport.getValueDirect());

    visited[0].apply("render", params, true);
}

RenderDirective.prototype.drawHighlights = function(root)
{
    // apply highlight directive if specified
    switch (this.highlightType.getValueDirect())
    {
    case eHighlightType.FourPass:
    case eHighlightType.EightPass:
        this.highlightDirective.execute(root);
        break;

    case eHighlightType.None:
    default:
        break;
    }   
}

RenderDirective.prototype.backgroundColorModified = function()
{
    var color = this.backgroundColor.getValueDirect();
    this.graphMgr.renderContext.clearColor(color.r, color.g, color.b, color.a);    
}

function RenderDirective_ViewportModifiedCB(attribute, container)
{
    var vp = container.viewport.getValueDirect();
    var url = container.backgroundImageFilename.getValueDirect().join("");
    container.graphMgr.renderContext.setBackgroundImage(url, vp.width, vp.height);
}

function RenderDirective_BackgroundColorModifiedCB(attribute, container)
{
    container.backgroundColorModified();
}

function RenderDirective_BackgroundImageFilenameModifiedCB(attribute, container)
{
    var vp = container.viewport.getValueDirect();
    var pathInfo = formatPath(container.backgroundImageFilename.getValueDirect().join(""));
    
    container.backgroundImageFilename.removeModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, container);
    container.backgroundImageFilename.setValueDirect(pathInfo[0]);
    container.backgroundImageFilename.addModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, container);
    
    //container.graphMgr.renderContext.setBackgroundImage(pathInfo[0], vp.width, vp.height);
    container.backgroundTexture.imageFilename.setValueDirect(pathInfo[0]);
    container.backgroundImageSet = true;
}