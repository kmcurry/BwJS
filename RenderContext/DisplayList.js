var eRenderContextMethod =
{
    Unknown:                        0,
    ApplyProjectionTransform:       1,
    ApplyViewTransform:             2,
    ApplyWorldTransform:            3,
    Clear:                          4,
    ClearColor:                     5,
    ClearDepth:                     6,
    ClearStencil:                   7,
    CreateProgram:                  8,
    CreateTextureObject:            9,
    CreateVertexBuffer:             10,
    CullFace:                       11,
    Disable:                        12,
    Enable:                         13,
    EnableClipPlane:                14,
    Enabled:                        15,
    EnableLight:                    16,
    EnableTextureStage:             17,
    Finish:                         18,
    GetClipPlane:                   19,
    GetEnabledClipPlanes:           20,
    GetEnabledLights:               21,
    GetGlobalIllumination:          22,
    GetLight:                       23,
    GetMaxLightCount:               24,
    GetMaxTextureStages:            25,
    GetProgram:                     26,
    PerspectiveMatrixLH:            27,
    OrthographicMatrixLH:           28,
    SetBlendColor:                  29,
    SetBlendFactor:                 30,
    SetClipPlane:                   31,
    SetDepthFunc:                   32,
    SetEnabledClipPlanes:           33,
    SetEnabledLights:               34,
    SetFrontMaterial:               35,
    SetGlobalIllumination:          36,
    SetLight:                       37,
    SetShadeModel:                  38,
    SetStencilFunc:                 39,
    SetStencilMask:                 40,
    SetStencilOp:                   41,
    SetTextureBlendFactor:          42,
    SetTextureBlendOp:              43,
    SetTextureColorMask:            44,
    SetViewport:                    45,
    VB_SetPrimitiveType:            46,
    VB_SetVertices:                 47,
    VB_SetNormals:                  48,
    VB_SetColors:                   49,
    VB_SetUVCoords:                 50,
    VB_SetTextureStage:             51,
    VB_Draw:                        52,
    TO_SetImage:                    53,
    TO_SetImageData:                54,
    TO_SetVideo:                    55,
    SetMatrixMode:                  56,
    PushMatrix:                     57,
    PopMatrix:                      58,
    LoadMatrix:                     59,
    LeftMultMatrix:                 60,
    RightMultMatrix:                61,
    UseProgram:                     62
}

function RenderContextMethodDesc(method, params)
{
    this.method = method;
    this.params = params;
}

function DisplayListObj(renderContext)
{
    this.renderContext = renderContext;
    this.displayList = [];
}

DisplayListObj.prototype.record_begin = function()
{
    this.clear();
    this.renderContext.setDisplayList(this);
}

DisplayListObj.prototype.record_end = function()
{
    this.renderContext.setDisplayList(null);
}

DisplayListObj.prototype.play = function()
{
    for (var i = 0; i < this.displayList.length; i++)
    {
        this.invokeMethod(this.displayList[i]);
    }
}

DisplayListObj.prototype.addMethodDesc = function(desc)
{
    this.displayList.push(desc);
}

DisplayListObj.prototype.clear = function()
{
    this.displayList = [];
}

DisplayListObj.prototype.invokeMethod = function(desc)
{
    switch (desc.method)
    {
        case eRenderContextMethod.ApplyProjectionTransform:
            {
                this.renderContext.applyProjectionTransform();
            }
            break;

        case eRenderContextMethod.ApplyViewTransform:
            {
                this.renderContext.applyViewTransform();
            }
            break;
            
        case eRenderContextMethod.ApplyWorldTransform:
            {
                this.renderContext.applyWorldTransform();
            }
            break;
            
        case eRenderContextMethod.Clear:
            {
                return this.renderContext.clear(desc.params[0]);
            }
            break;

        case eRenderContextMethod.ClearColor:
            {
                this.renderContext.clearColor(desc.params[0], desc.params[1], desc.params[2], desc.params[3]);
            }
            break;

        case eRenderContextMethod.ClearDepth:
            {
                this.renderContext.clearDepth(desc.params[0]);
            }
            break;

        case eRenderContextMethod.ClearStencil:
            {
                this.renderContext.clearStencil(desc.params[0]);
            }
            break;

        case eRenderContextMethod.CreateProgram:
            {
                return this.renderContext.createProgram();
            }
            break;
            
        case eRenderContextMethod.CreateTextureObject:
            {
                return this.renderContext.createTextureObject();
            }
            break;
            
        case eRenderContextMethod.CreateVertexBuffer:
            {
                return this.renderContext.createVertexBuffer(desc.params[0]);
            }
            break;

        case eRenderContextMethod.CullFace:
            {
                return this.renderContext.cullFace(desc.params[0]);
            }
            break;
            
        case eRenderContextMethod.Disable:
            {
                this.renderContext.disable(desc.params[0]);
            }
            break;

        case eRenderContextMethod.Enable:
            {
                this.renderContext.enable(desc.params[0]);
            }
            break;

        case eRenderContextMethod.EnableClipPlane:
            {
                this.renderContext.enableClipPlane(desc.params[0], desc.params[1]);
            }
            break;

        case eRenderContextMethod.Enabled:
            {
                return this.renderContext.enabled(desc.params[0]);
            }
            break;

        case eRenderContextMethod.EnableLight:
            {
                this.renderContext.enableLight(desc.params[0], desc.params[1]);
            }
            break;

        case eRenderContextMethod.EnableTextureStage:
            {
                this.renderContext.enableTextureStage(desc.params[0], desc.params[1]);
            }
            break;

        case eRenderContextMethod.Finish:
            {
                this.renderContext.finish();
            }
            break;

        case eRenderContextMethod.GetClipPlane:
            {
                return this.renderContext.getClipPlane(desc.params[0]);
            }
            break;

        case eRenderContextMethod.GetEnabledClipPlanes:
            {
                return this.renderContext.getEnabledClipPlanes();
            }
            break;

        case eRenderContextMethod.GetEnabledLights:
            {
                return this.renderContext.getEnabledLights();
            }
            break;

        case eRenderContextMethod.GetGlobalIllumination:
            {
                return this.renderContext.getGlobalIllumination();
            }
            break;

        case eRenderContextMethod.GetLight:
            {
                return this.renderContext.getLight(desc.params[0]);
            }
            break;

        case eRenderContextMethod.GetMaxLightCount:
            {
                return this.renderContext.getMaxLightCount();
            }
            break;

        case eRenderContextMethod.GetMaxTextureStages:
            {
                return this.renderContext.getMaxTextureStages();
            }
            break;

        case eRenderContextMethod.GetProgram:
            {
                return this.renderContext.getProgram();
            }
            break;
            
        case eRenderContextMethod.PerspectiveMatrixLH:
            {
                this.renderContext.perspectiveMatrixLH(desc.params[0], desc.params[1], desc.params[2],
                        desc.params[3], desc.params[4], desc.params[5]);
            }
            break;

        case eRenderContextMethod.OrthographicMatrixLH:
            {
                this.renderContext.orthographicMatrixLH(desc.params[0], desc.params[1], desc.params[2],
                        desc.params[3], desc.params[4], desc.params[5]);
            }
            break;

        case eRenderContextMethod.SetBlendColor:
            {
                this.renderContext.setBlendColor(desc.params[0], desc.params[1], desc.params[2], desc.params[3]);
            }
            break;

        case eRenderContextMethod.SetBlendFactor:
            {
                this.renderContext.setBlendFactor(desc.params[0], desc.params[1]);
            }
            break;

        case eRenderContextMethod.SetClipPlane:
            {
                this.renderContext.setClipPlane(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetDepthFunc:
            {
                this.renderContext.setDepthFunc(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetEnabledClipPlanes:
            {
                this.renderContext.setEnabledClipPlanes(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetEnabledLights:
            {
                this.renderContext.setEnabledLights(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetFrontMaterial:
            {
                this.renderContext.setFrontMaterial(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetGlobalIllumination:
            {
                this.renderContext.setGlobalIllumination(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetLight:
            {
                this.renderContext.setLight(desc.params[0], desc.params[1]);
            }
            break;

        case eRenderContextMethod.SetShadeModel:
            {
                this.renderContext.setShadeModel(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetStencilFunc:
            {
                this.renderContext.setStencilFunc(desc.params[0], desc.params[1], desc.params[2]);
            }
            break;

        case eRenderContextMethod.SetStencilMask:
            {
                this.renderContext.setStencilMask(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetStencilOp:
            {
                this.renderContext.setStencilOp(desc.params[0], desc.params[1], desc.params[2]);
            }
            break;

        case eRenderContextMethod.SetTextureBlendFactor:
            {
                this.renderContext.setTextureBlendFactor(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetTextureBlendOp:
            {
                this.renderContext.setTextureBlendOp(desc.params[0]);
            }
            break;

        case eRenderContextMethod.SetTextureColorMask:
            {
                this.renderContext.setTextureColorMask(desc.params[0], desc.params[1], desc.params[2], desc.params[3]);
            }
            break;

        case eRenderContextMethod.SetViewport:
            {
                this.renderContext.setViewport(desc.params[0], desc.params[1], desc.params[2],
                        desc.params[3]);
            }
            break;

        case eRenderContextMethod.VB_SetPrimitiveType:
            {
                desc.params[0].setPrimitiveType(desc.params[1]);
            }
            break;

        case eRenderContextMethod.VB_SetVertices:
            {
                desc.params[0].setVertices(desc.params[1]);
            }
            break;

        case eRenderContextMethod.VB_SetNormals:
            {
                desc.params[0].setNormals(desc.params[1]);
            }
            break;

        case eRenderContextMethod.VB_SetColors:
            {
                desc.params[0].setColors(desc.params[1]);
            }
            break;

        case eRenderContextMethod.VB_SetUVCoords:
            {
                desc.params[0].setUVCoords(desc.params[1], desc.params[2]);
            }
            break;

        case eRenderContextMethod.VB_SetTextureStage:
            {
                desc.params[0].setTextureStage(desc.params[1], desc.params[2], desc.params[3],
                        desc.params[4], desc.params[5], desc.params[6]);
            }
            break;

        case eRenderContextMethod.VB_Draw:
            {
                desc.params[0].draw();
            }
            break;

        case eRenderContextMethod.TO_SetImage:
            {
                desc.params[0].setImage(desc.params[1], desc.params[2], desc.params[3]);
            }
            break;

        case eRenderContextMethod.TO_SetImageData:
            {
                desc.params[0].setImageData(desc.params[1], desc.params[2], desc.params[3],
                        desc.params[4], desc.params[5]);
            }
            break;

        case eRenderContextMethod.TO_SetVideo:
            {
                desc.params[0].setVideo(desc.params[1]);
            }
            break;

        case eRenderContextMethod.SetMatrixMode:
            {
                this.renderContext.setMatrixMode(desc.params[0]);
            }
            break;

        case eRenderContextMethod.PushMatrix:
            {
                this.renderContext.pushMatrix();
            }
            break;

        case eRenderContextMethod.PopMatrix:
            {
                this.renderContext.popMatrix();
            }
            break;

        case eRenderContextMethod.LoadMatrix:
            {
                this.renderContext.loadMatrix(desc.params[0]);
            }
            break;

        case eRenderContextMethod.LeftMultMatrix:
            {
                this.renderContext.leftMultMatrix(desc.params[0]);
            }
            break;

        case eRenderContextMethod.RightMultMatrix:
            {
                this.renderContext.rightMultMatrix(desc.params[0]);
            }
            break;
            
        case eRenderContextMethod.UseProgram:
            {
                this.renderContext.useProgram(desc.params[0]);
            }
            break;
    }
}

function DL_ADD_METHOD_DESC(dlObj, method, params)
{
    if (dlObj)
    {
        dlObj.addMethodDesc(new RenderContextMethodDesc(method, params));
    }
}
