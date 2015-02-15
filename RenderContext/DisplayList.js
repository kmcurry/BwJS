var eRenderContextMethod =
{
	Unknown									: 0,
	
	ApplyModelViewTransform    				: 1,
    ApplyProjectionTransform				: 2,
    Clear           						: 3,
    ClearColor								: 4,
    ClearDepth                              : 5,
    ClearStencil                            : 6,
    CreateVertexBuffer					    : 7,
    CreateTextureObject 					: 8,
    Disable     							: 9,
    Enable  								: 10,
    EnableClipPlane                         : 11,
    Enabled	    							: 12,
    EnableLight								: 13,
    EnableTextureStage						: 14,
    Finish  								: 15,
    GetClipPlane                            : 16,
    GetEnabledClipPlanes                    : 17,
    GetEnabledLights						: 18,
    GetGlobalIllumination					: 19,
    GetLight            					: 20,
    GetMaxLightCount    					: 21,
    GetMaxTextureStages						: 22,
    PerspectiveMatrixLH						: 23,
    OrthographicMatrixLH					: 24,
    SetBlendColor                           : 25,
    SetBlendFactor							: 26,
    SetClipPlane                            : 27,
    SetDepthFunc                            : 28,
    SetEnabledClipPlanes                    : 29,
    SetEnabledLights						: 30,
    SetFrontMaterial						: 31,
    SetGlobalIllumination					: 32,
    SetLight 			                    : 33,
    SetShadeModel                           : 34,
    SetStencilFunc                          : 35,
    SetStencilMask                          : 36,
    SetStencilOp                            : 37,
    SetTextureBlendFactor					: 38,
    SetTextureBlendOp						: 39,
    SetTextureColorMask                     : 40,
    SetViewport						        : 41,
    VB_SetPrimitiveType                     : 42,
    VB_SetVertices                          : 43,
    VB_SetNormals                           : 44,
    VB_SetColors                            : 45,
    VB_SetUVCoords                          : 46,
    VB_SetTextureStage                      : 47,
    VB_Draw                                 : 48,
    TO_SetImage                             : 49,
    TO_SetImageData                         : 50,
    TO_SetVideo                             : 51,
    SetMatrixMode							: 52,
    PushMatrix								: 53,
    PopMatrix								: 54,
    LoadMatrix								: 55,
    LeftMultMatrix							: 56,
    RightMultMatrix							: 57
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
    for (var i=0; i < this.displayList.length; i++)
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
        case eRenderContextMethod.ApplyModelViewTransform:
        {
            this.renderContext.applyModelViewTransform();    
        }   
        break;
        
        case eRenderContextMethod.ApplyProjectionTransform:
        {
            this.renderContext.applyProjectionTransform();
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
        
        case eRenderContextMethod.CreateVertexBuffer:
        {
            return this.renderContext.createVertexBuffer(desc.params[0]);            
        }
        break;
        
        case eRenderContextMethod.CreateTextureObject:
        {
            this.renderContext.createTextureObject();    
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
        
        case eRenderContextMethod.getMaxTextureStages:
        {
            return this.renderContext.getMaxTextureStages();
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
    }
}

function DL_ADD_METHOD_DESC(dlObj, method, params)
{
    if (dlObj)
    {
        dlObj.addMethodDesc(new RenderContextMethodDesc(method, params));
    }    
}
