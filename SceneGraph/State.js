function StateRec()
{
    this.material = null;
    this.renderStateRec = null;
    this.cullBackFace = false;
    this.textures = null;
    this.projectionTextures = null;
    this.globalIllumination = new Color();
}

function GetCurrentState(graphMgr)
{
    var rec = new StateRec();
	
    rec.material = graphMgr.getCurrentMaterial();
    rec.renderStateRec = graphMgr.renderState.getState(RENDERSTATE_ALL_BITS);
    rec.cullBackFace = graphMgr.renderContext.enabled(eRenderMode.CullBackFace);
    rec.textures = graphMgr.textureArrayStack.top();
    rec.projectionTextures = graphMgr.projectionTextureArrayStack.top();
    rec.globalIllumination.copy(graphMgr.renderContext.getGlobalIllumination());
    
    return rec;
}

function SetCurrentState(graphMgr, stateRec)
{
    graphMgr.setCurrentMaterial(stateRec.material);
    graphMgr.renderState.setState(RENDERSTATE_ALL_BITS, stateRec.renderStateRec);
    if (stateRec.cullBackFace)
    {
        graphMgr.renderContext.enable(eRenderMode.CullBackFace);
    }
    else
    {
        graphMgr.renderContext.disable(eRenderMode.CullBackFace);
    }
    graphMgr.textureArrayStack.load(stateRec.textures);
    graphMgr.projectionTextureArrayStack.load(stateRec.projectionTextures);
    graphMgr.renderContext.setGlobalIllumination(stateRec.globalIllumination);
}