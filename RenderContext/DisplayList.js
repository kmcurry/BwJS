var eRenderContextMethod =
{
	Unknown									: 0,
	
	ApplyModelViewTransform    				: 1,
    ApplyProjectionTransform				: 2,
    Clear           						: 3,
    ClearColor								: 4,
    CreateVertexBuffer					    : 5,
    CreateTextureObject 					: 6,
    Disable     							: 7,
    Enable  								: 8,
    Enabled	    							: 9,
    EnableLight								: 10,
    EnableTextureStage						: 11,
    Finish  								: 12,
    GetEnabledLights						: 13,
    GetGlobalIllumination					: 14,
    GetLight            					: 15,
    GetMaxLightCount    					: 16,
    GetMaxTextureStages						: 17,
    PerspectiveMatrixLH						: 18,
    OrthographicMatrixLH					: 19,
    SetBlendFactor							: 20,
    SetEnabledLights						: 21,
    SetFrontMaterial						: 22,
    SetGlobalIllumination					: 23,
    SetLight 			                    : 24,
    SetTextureBlendFactor					: 25,
    SetTextureBlendOp						: 26,
    SetViewport						        : 27,
    VB_SetPrimitiveType                     : 28,
    VB_SetVertices                          : 29,
    VB_SetNormals                           : 30,
    VB_SetUVCoords                          : 31,
    VB_SetTextureStage                      : 32,
    VB_Draw                                 : 33,
    TO_SetImage                             : 34,
    TO_SetImageData                         : 35,
    TO_SetVideo                             : 36,
    SetMatrixMode							: 37,
    PushMatrix								: 38,
    PopMatrix								: 39,
    LoadMatrix								: 40,
    LeftMultMatrix							: 41,
    RightMultMatrix							: 42
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
            return this.renderContext.clear();
        }
        break;
        
        case eRenderContextMethod.ClearColor:
        {
            this.renderContext.clearColor(desc.params[0], desc.params[1], desc.params[2], desc.params[3]);
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
