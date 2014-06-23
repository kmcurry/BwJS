GraphMgr.prototype = new AttributeContainer();
GraphMgr.prototype.constructor = GraphMgr;

function GraphMgr()
{
    AttributeContainer.call(this);
    this.className = "GraphMgr";
    
    this.renderContext = null;
    this.renderState = null;
    this.lightIndex = 0;
    this.material = null;
    this.dissolve = null;
    this.drawTextures = true;
    this.textureArrayStack = new Stack(new TextureArray());
    this.projectionTextureArrayStack = new Stack(new TextureArray());
    this.labelIndex = 1;
    this.styleMgr = new StyleMgr();
    
    this.name = new StringAttr("GraphMgr");
    
    this.registerAttribute(this.name, "name");
}

GraphMgr.prototype.setRenderContext = function(rc)
{
    this.renderContext = rc;
    this.renderState = new RenderState(rc);
}

GraphMgr.prototype.getAvailableLightIndex = function()
{
    return this.lightIndex++;
}

GraphMgr.prototype.getCurrentMaterial = function()
{
    return this.material;
}

GraphMgr.prototype.setCurrentMaterial = function(material)
{
    this.material = material;
}

GraphMgr.prototype.getCurrentDissolve = function()
{
    return this.dissolve;
}

GraphMgr.prototype.setCurrentDissolve = function(dissolve)
{
    this.dissolve = dissolve;
}

GraphMgr.prototype.getDrawTextures = function()
{
    return this.drawTextures;
}

GraphMgr.prototype.setDrawTextures = function(drawTextures)
{
    this.drawTextures = drawTextures;
}

GraphMgr.prototype.getNextLabelIndex = function()
{
    return this.labelIndex++;
}
GraphMgr.prototype.reset = function ()
{
    //DO WE EVEN NEED THIS FUNCTION??
//    setCurrentCamera(NULL); No set current camera function
    this.lightIndex = 0;
    this.labelIndex = 1;
    this.setCurrentDissolve(null);
    this.setCurrentMaterial(null);
    this.setDrawTextures(true);
//    this.setCurrentProjector(null); No set current Projector function
//    this.nodeRegistry.clear();
//    this.agentRegistry.clear();
//    this.directiveRegistry.clear();
//    this.sectorOrigin.setValueDirect(0, 0, 0);

    for (var i=0; i < gl_MaxLights; i++)
    {
        this.renderContext.enableLight(i, false);
    }
}