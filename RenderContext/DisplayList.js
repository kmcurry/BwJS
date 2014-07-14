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
    SetViewport						        : 27
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
        case eRenderMethod.ApplyModelViewTransform:
        {
            this.renderContext.applyModelViewTransform();    
        }   
        break;
        
        case eRenderMethod.ApplyProjectionTransform:
        {
            this.renderContext.applyProjectionTransform();
        }   
        break;
        
        case eRenderMethod.Clear:
        {
            return this.renderContext.clear();
        }
        break;
        
        case eRenderMethod.ClearColor:
        {
            this.renderContext.clearColor(desc.params[0], desc.params[1], desc.params[2], desc.params[3]);
        }
        break;
        
        case eRenderMethod.CreateVertexBuffer:
        {
            return this.renderContext.createVertexBuffer(desc.params[0]);            
        }
        break;
        
        case eRenderMethod.CreateTextureObject:
        {
            this.renderContext.createTextureObject();    
        }
        break;
        
        case eRenderMethod.Disable:
        {
            this.renderContext.disable(desc.params[0]);
        }
        break;
        
        case eRenderMethod.Enable:
        {
            this.renderContext.enable(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.Enabled:
        {
            return this.renderContext.enabled(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.EnableLight:
        {
            this.renderContext.enableLight(desc.params[0], desc.params[1]);    
        }
        break;
        
        case eRenderMethod.EnableTextureStage:
        {
            this.renderContext.enableTextureStage(desc.params[0], desc.params[1]);    
        }
        break;
        
        case eRenderMethod.Finish:
        {
            this.renderContext.finish();        
        }
        break;
        
        case eRenderMethod.GetEnabledLights:
        {
            return this.renderContext.getEnabledLights();    
        }
        break;
        
        case eRenderMethod.GetGlobalIllumination:
        {
            return this.renderContext.getGlobalIllumination();    
        }
        break;
        
        case eRenderMethod.GetLight:
        {
            return this.renderContext.getLight(desc.params[0]);   
        }
        break;
            
        case eRenderMethod.GetMaxLightCount:
        {
            return this.renderContext.getMaxLightCount();   
        }
        break;
        
        case eRenderMethod.getMaxTextureStages:
        {
            return this.renderContext.getMaxTextureStages();
        }
        break;
        
        case eRenderMethod.PerspectiveMatrixLH:
        {
            this.renderContext.perspectiveMatrixLH(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);   
        }
        break;
        
        case eRenderMethod.OrthographicMatrixLH:
        {
            this.renderContext.orthographicMatrixLH(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);
        }
        break;
        
        case eRenderMethod.SetBlendFactor:
        {
            this.renderContext.setBlendFactor(desc.params[0], desc.params[1]);
        }
        break;

        case eRenderMethod.SetEnabledLights:
        {
            this.renderContext.setEnabledLights(desc.params[0]);
        }
        break;
        
        case eRenderMethod.SetFrontMaterial:
        {
            this.renderContext.setFrontMaterial(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetGlobalIllumination:
        {
            this.renderContext.setGlobalIllumination(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetLight:
        {
            this.renderContext.setLight(desc.params[0], desc.params[1]);    
        }
        break;
        
        case eRenderMethod.SetTextureBlendFactor:
        {
            this.renderContext.setTextureBlendFactor(desc.params[0]);   
        }
        break;
        
        case eRenderMethod.SetTextureBlendOp:
        {
            this.renderContext.setTextureBlendOp(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetViewport:
        {
            this.renderContext.setViewport(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3]);    
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
