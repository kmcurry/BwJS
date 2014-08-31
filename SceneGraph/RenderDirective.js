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
    this.detectCollisions = new Array();
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
    this.timeIncrement = new NumberAttr(0);
    
    this.viewport.addModifiedCB(RenderDirective_ViewportModifiedCB, this);
    this.backgroundImageFilename.addModifiedCB(RenderDirective_BackgroundImageFilenameModifiedCB, this);
    
    this.registerAttribute(this.viewport, "viewport"); 
    this.registerAttribute(this.backgroundImageFilename, "backgroundImageFilename");
    this.registerAttribute(this.foregroundImageFilename, "foregroundImageFilename");
    this.registerAttribute(this.foregroundAlphaFilename, "foregroundAlphaFilename");   
    this.registerAttribute(this.foregroundFadeEnabled, "foregroundFadeEnabled");   
    this.registerAttribute(this.texturesEnabled, "texturesEnabled");   
    this.registerAttribute(this.timeIncrement, "timeIncrement");
    
    this.updateDirective = new UpdateDirective();
    this.timeIncrement.addTarget(this.updateDirective.getAttribute("timeIncrement"));
    this.resetDisplayLists = false;
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

    // update; combined CUpdateParams & GtUpdateParams in this version
    var params = new UpdateParams();
    params.directive = this.updateDirective;
    params.disableDisplayLists = this.resetDisplayLists;
     
    var visited = this.updateDirective.execute(root, params);

    // render
    var params = new RenderParams();
    /*
    renderParams.path = NULL;//m_path;
    renderParams.pathIndex = 1;
    renderParams.viewport = m_currentViewport;
    renderParams.jitterAmt = m_currentJitterAmt + jitterAmt; // RenderDirective jitter + AA jitter
    renderParams.distanceSortAgent = m_distanceSortAgent;
    renderParams.polygonSortAgent = m_polygonSortAgent;
    renderParams.renderSequenceAgent = m_renderSequenceAgent;
    renderParams.shadowRenderAgent = m_shadowRenderAgent;
    renderParams.drawTextures = m_texturesEnabled->GetValueDirect();
    renderParams.userData = m_userData->GetValueDirect();
     */
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

    this.graphMgr.setCollisions(this.detectCollisions(params.detectCollisions));
    
    // sort and draw semi-transparent geometries (if any)
    if (!this.distanceSortAgent.isEmpty())
    {
        this.distanceSortAgent.sort();
        this.distanceSortAgent.draw();
        this.distanceSortAgent.clear();
    }
}

RenderDirective.prototype.detectCollisions = function(boundingTrees)
{
    var names = [];
    var trees = [];
    var collisions = [];
    var tested = [];
    
    for (var i in boundingTrees)
    {
        names.push(i);
        trees.push(boundingTrees[i]);
        tested.push(false);
    }
    
    for (var i = 0; i < trees.length; i++)
    {
        if (tested[i]) continue;
        
        for (var j = i+1; j < trees.length; j++)
        {
            if (tested[j]) continue;
            
            if (trees[i].collides(trees[j]))
            {
                collisions.push(names[i]);
                collisions.push(names[j]);
                tested[i] = tested[j] = true;
                break;
            }
        }
    }
    
    return collisions;
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