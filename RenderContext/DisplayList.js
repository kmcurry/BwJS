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
    Enabled	    							: 11,
    EnableLight								: 12,
    EnableTextureStage						: 13,
    Finish  								: 14,
    GetEnabledLights						: 15,
    GetGlobalIllumination					: 16,
    GetLight            					: 17,
    GetMaxLightCount    					: 18,
    GetMaxTextureStages						: 19,
    PerspectiveMatrixLH						: 20,
    OrthographicMatrixLH					: 21,
    SetBlendFactor							: 22,
    SetDepthFunc                            : 23,
    SetEnabledLights						: 24,
    SetFrontMaterial						: 25,
    SetGlobalIllumination					: 26,
    SetLight 			                    : 27,
    SetShadeModel                           : 28,
    SetStencilFunc                          : 29,
    SetStencilMask                          : 30,
    SetStencilOp                            : 31,
    SetTextureBlendFactor					: 32,
    SetTextureBlendOp						: 33,
    SetViewport						        : 34,
    VB_SetPrimitiveType                     : 35,
    VB_SetVertices                          : 36,
    VB_SetNormals                           : 37,
    VB_SetColors                            : 38,
    VB_SetUVCoords                          : 39,
    VB_SetTextureStage                      : 40,
    VB_Draw                                 : 41,
    TO_SetImage                             : 42,
    TO_SetImageData                         : 43,
    TO_SetVideo                             : 44,
    SetMatrixMode							: 45,
    PushMatrix								: 46,
    PopMatrix								: 47,
    LoadMatrix								: 48,
    LeftMultMatrix							: 49,
    RightMultMatrix							: 50
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
        
        case eRenderContextMethod.SetBlendFactor:
        {
            this.renderContext.setBlendFactor(desc.params[0], desc.params[1]);
        }
        break;

        case eRenderContextMethod.SetDepthFunc:
        {
            this.renderContext.setDepthFunc(desc.params[0]);
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
