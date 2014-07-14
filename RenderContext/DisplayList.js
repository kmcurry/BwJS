var eRenderContextMethod =
{
	Unknown									: 0,
	
	SetGlobalState							: 1,
    EnableRenderMode						: 2,
    IsRenderModeEnabled						: 3,
    SetViewport								: 4,
    //GetViewport							: 5,
    Clear									: 6,
    SetMatrixMode							: 7,
    PushMatrix								: 8,
    PopMatrix								: 9,
    LoadMatrix								: 10,
    MultMatrix								: 11,
    //GetMatrix								: 12,
    PerspectiveMatrixLH						: 13,
    PerspectiveMatrixRH						: 14,
    OrthographicMatrixLH					: 15,
    OrthographicMatrixRH					: 16,
    //GetMaxLightCount						: 17,
    SetLight								: 18,
    //GetLight								: 19,
    EnableLight								: 20,
    IsLightEnabled							: 21,
    SetEnabledLights						: 22,
    //GetEnabledLights						: 23,
    //GetMaxClipPlaneCount					: 24,
    //SetClipPlane							: 25,
    //GetClipPlane							: 26,
    //EnableClipPlane						: 27,
    //IsClipPlaneEnabled					: 28,
    //SetEnabledClipPlanes					: 29,
    //GetEnabledClipPlanes					: 30,
    SetGlobalIllumination					: 31,
    //GetGlobalIllumination					: 32,
    SetShadeModel							: 33,
    //GetShadeModel							: 34,
    SetColor								: 35,
    //GetColor								: 36,
    SetMaterial								: 37,
    //GetMaterial							: 38,
    SetBlendFactor							: 39,
    //GetMaxPrimitiveCount					: 40,
    //GetMaxVertexIndex						: 41,
    DrawPrimitives							: 42,
    CreateVertexBuffer						: 43,
    DeleteVertexBuffer						: 44,
    CreateIndexBuffer						: 45,
    DeleteIndexBuffer						: 46,
    CreateTexture							: 47,
    DeleteTexture							: 48,
    //GetMaxTextureStages					: 49,
    EnableTextureStage						: 50,
    SetTextureBlendOp						: 51,
    SetTextureBlendFactor					: 52,
    SetTextureWrap							: 53,
    SetTextureBorderColor					: 54,
    DrawSphere								: 55,
    DrawBox									: 56,
    //GetFrameBufferOrigin					: 57,
    ReadFrameBuffer							: 58,
    ReadAuxBuffer							: 59,
    WriteFrameBuffer						: 60,
    WriteAuxBuffer							: 61,
    SetPointSize							: 62,
    SetLineWidth							: 63,
    SupportsPixelFormat						: 64,
    SupportsAntialiasing					: 65,
    SetUserMaxTextureSize					: 66,
    //GetUserMaxTextureSize					: 67,
    SetFogParameters						: 68,
    //GetFogParameters						: 69,
    SetPolygonWindingOrder					: 70,
    //GetPolygonWindingOrder				: 71,
    ReversePolygonWindingOrder				: 72,
    SetDepthFunc							: 73,
    SetStencilFunc							: 74,
    SetStencilWriteMask						: 75,
    SetStencilOp							: 76,
    SetPolygonOffset						: 77,
    //GetPolygonOffset						: 78,
    //GetTransparentAlphaValue				: 79,
    CreateDisplayList						: 80,
    DeleteDisplayList						: 81,
    SetRenderTarget							: 82,

    /// VertexBufferObj
    VertexBufferObj_SetLength				: 83,
    VertexBufferObj_SetVertices				: 84,
    VertexBufferObj_SetVerticesVolatile		: 85,
    VertexBufferObj_SetColors				: 86,
    VertexBufferObj_SetColorsVolatile		: 87,
    VertexBufferObj_SetNormals				: 88,
    VertexBufferObj_SetNormalsVolatile		: 89,
    VertexBufferObj_SetUVCoords				: 90,
    VertexBufferObj_SetUVCoordsVolatile		: 91,
    VertexBufferObj_SetTextureStage			: 92,
    VertexBufferObj_Draw					: 93,
    VertexBufferObj_DrawIndexed				: 94,

    /// IndexBufferObj
    IndexBufferObj_SetLength				: 95,
    //IndexBufferObj_GetLength				: 96,
    IndexBufferObj_SetIndices				: 97,
    IndexBufferObj_SetIndicesVolatile		: 98,

    /// TextureObj
    //TextureObj_SetImage					: 99,
    //TextureObj_SetSubImage				: 100
}

function RenderContextMethodDesc(object, method, params)
{
	this.object = object;
	this.method = method;
	this.params = params;
}

function DisplayListObj()
{
    this.displayList = [];
    this.renderContext = null;	
}

DisplayListObj.prototype.record_begin = function()
{
    
}

DisplayListObj.prototype.record_end = function()
{
    
}

DisplayListObj.prototype.play = function()
{
    for (var i=0; i < this.displayList.length; i++)
    e{
        this.invokeMethod(this.displayList[i]);
    }    
}

DisplayListObj.prototype.addMethodDesc = function(desc)
{
    
}

DisplayListObj.prototype.clear = function()
{
    this.displayList = [];    
}

DisplayListObj.prototype.invokeMethod = function(desc)
{
    switch (desc.method)
    {
        case eRenderMethod.SetGlobalState:
        {
            this.renderContext.setGlobalState();    
        }   
        break;
        
        case eRenderMethod.enableRenderMode:
        {
            this.renderContext.enableRenderMode(desc.params[0], desc.params[1]);
        }   
        break;
        
        case eRenderMethod.IsRenderModeEnabled:
        {
            return this.renderContext.isRenderModeEnabled(desc.params[0]);
        }
        break;
        
        case eRenderMethod.SetViewport:
        {
            this.renderContext.setViewport(desc.params[0], desc.params[1], desc.params[2], desc.params[3]);
        }
        break;
    
        //GetViewport
        
        case eRenderMethod.Clear:
        {
            this.renderContext.clear(desc.params[0], desc.params[1], desc.params[2], desc.params[3],
                desc.params[4], desc.params[5], desc.params[6], desc.params[7], desc.params[8]);            
        }
        break;
        
        case eRenderMethod.SetMatrixMode:
        {
            this.renderContext.setMatrixMode(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.PushMatrix:
        {
            this.renderContext.pushMatrix();
        }
        break;
        
        case eRenderMethod.PopMatrix:
        {
            this.renderContext.popMatrix();    
        }
        break;
        
        case eRenderMethod.LoadMatrix:
        {
            this.renderContext.loadMatrix(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.MultMatrix:
        {
            this.renderContext.multMatrix(desc.params[0]);    
        }
        break;
        
        //GetMatrix
        
        case eRenderMethod.PerspectiveMatrixLH:
        {
            this.renderContext.perspectiveMatrixLH(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);    
        }
        break;
        
        case eRenderMethod.PerspectiveMatrixRH:
        {
            this.renderContext.perspectiveMatrixRH(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);        
        }
        break;
        
        case eRenderMethod.OrthographicMatrixLH:
        {
            this.renderContext.OrthographicMatrixLH(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);    
        }
        break;
        
        case eRenderMethod.OrthographicMatrixRH:
        {
            this.renderContext.OrthographicMatrixRH(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);    
        }
        break;
        
        //GetMaxLightCount
        
        case eRenderMethod.SetLight:
        {
            this.renderContext.setLight(desc.params[0], desc.params[1]);   
        }
        break;
        
        //GetLight
        
        case eRenderMethod.EnableLight:
        {
            this.renderContext.enableLight(desc.params[0], desc.params[1]);   
        }
        break;
        
        case eRenderMethod.IsLightEnabled:
        {
            return this.renderContext.isLightEnabled(desc.params[0]);   
        }
        break;
        
        case eRenderMethod.SetEnabledLights:
        {
            this.renderContext.setEnabledLights(desc.params[0]);   
        }
        break;
        
        //GetEnabledLights
        
        //GetMaxClipPlaneCount
        
        //SetClipPlane
        
        //GetClipPlane
        
        //EnableClipPlane
        
        //IsClipPlaneEnabled
        
        //SetEnabledClipPlanes
        
        //GetEnabledClipPlanes
        
        case eRenderMethod.SetGlobalIllumination:
        {
            this.renderContext.setGlobalIllumination(desc.params[0]);
        }
        break;
        
        //GetGlobalIllumination
        
        case eRenderMethod.SetShadeModel:
        {
            this.renderContext.setShadeModel(desc.params[0]);
        }
        break;
        
        //GetShadeModel
        
        case eRenderMethod.SetColor:
        {
            this.renderContext.setColor(desc.params[0]);
        }
        break;
        
        //GetColor
        
        case eRenderMethod.SetMaterial:
        {
            this.renderContext.setMaterial(desc.params[0]);    
        }
        break;
        
        //GetMaterial
        
        case eRenderMethod.SetBlendFactor:
        {
            this.renderContext.setBlendFactor(desc.params[0], desc.params[1]);    
        }
        break;
        
        //GetMaxPrimitiveCount
        
        //GetMaxVertexIndex
        
        case eRenderMethod.DrawPrimitives:
        {
            this.renderContext.drawPrimitives(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.CreateVertexBuffer:
        {
            return this.renderContext.createVertexBuffer(desc.params[0]);   
        }
        break;
        
        case eRenderMethod.DeleteVertexBuffer:
        {
            this.renderContext.deleteVertexBuffer(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.CreateIndexBuffer:
        {
            return this.renderContext.createIndexBuffer();    
        }
        break;
        
        case eRenderMethod.DeleteIndexBuffer:
        {
            this.renderContext.deleteIndexBuffer(desc.params[0]);   
        }
        break;
        
        case eRenderMethod.CreateTexture:
        {
            return this.renderContext.createTexture(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.DeleteTexture:
        {
            this.renderContext.deleteTexture(desc.params[0]);    
        }
        break;
        
        //GetMaxTextureStages
        
        case eRenderMethod.EnableTextureStage:
        {
            this.renderContext.enableTextureStage(desc.params[0], desc.params[1]);    
        }
        break;
        
        case eRenderMethod.SetTextureBlendOp:
        {
            this.renderContext.setTextureBlendOp(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetTextureBlendFactor:
        {
            this.renderContext.setTextureBlendFactor(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetTextureWrap:
        {
            this.renderContext.setTextureWrap(desc.params[0], desc.params[1], desc.params[2]);    
        }
        break;
        
        case eRenderMethod.SetTextureBorderColor:
        {
            this.renderContext.setTextureBorderColor(desc.params[0], desc.params[1]);    
        }
        break;
        
        case eRenderMethod.DrawSphere:
        {
            this.renderContext.drawSphere(desc.params[0], desc.params[1], desc.params[2]);    
        }
        break;
        
        case eRenderMethod.DrawBox:
        {
            this.renderContext.drawBox(desc.params[0], desc.params[1]);    
        }
        break;
        
        //GetFrameBufferOrigin
        
        case eRenderMethod.ReadFrameBuffer:
        {
            return this.renderContext.readFrameBuffer(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5]);    
        }
        break;
        
        case eRenderMethod.ReadAuxBuffer:
        {
            return this.renderContext.readAuxBuffer(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5], desc.params[6]);   
        }
        break;
        
        case eRenderMethod.WriteFrameBuffer:
        {
            this.renderContext.writeFrameBuffer(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5], desc.params[6], desc.params[7],
                desc.params[8]);    
        }
        break;
        
        case eRenderMethod.WriteAuxBuffer:
        {
            this.renderContext.writeAuxBuffer(desc.params[0], desc.params[1], desc.params[2],
                desc.params[3], desc.params[4], desc.params[5], desc.params[6], desc.params[7],
                desc.params[8], desc.params[9]);   
        }
        break;
        
        case eRenderMethod.SetPointSize:
        {
            this.renderContext.setPointSize(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetLineWidth:
        {
            this.renderContext.setLineWidth(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SupportsPixelFormat:
        {
            return this.renderContext.supportsPixelFormat(desc.params[0]);   
        }
        break;
        
        case eRenderMethod.SupportsAntialiasing:
        {
            return this.renderContext.supportsAntialising();    
        }
        break;
        
        case eRenderMethod.SetUserMaxTextureSize:
        {
            this.renderContext.setUserMaxTextureSize(desc.params[0]);    
        }
        break;
        
        //GetUserMaxTextureSize
        
        case eRenderMethod.SetFogParameters:
        {
            this.renderContext.setFogParameters(desc.params[0]);    
        }
        break;
        
        //GetFogParameters
        
        case eRenderMethod.SetPolygonWindingOrder:
        {
            this.renderContext.setPolygonWindingOrder(desc.params[0]);    
        }
        break;
        
        //GetPolygonWindingOrder
        
        case eRenderMethod.ReversePolygonWindingOrder:
        {
            this.renderContext.reversePolygonWindingOrder();    
        }
        break;
        
        case eRenderMethod.SetDepthFunc:
        {
            this.renderContext.setDepthFunc(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetStencilFunc:
        {
            this.renderContext.setStencilFunc(desc.params[0], desc.params[1], desc.params[2]);    
        }
        break;
        
        case eRenderMethod.SetStencilWriteMask:
        {
            this.renderContext.setStencilWriteMask(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetStencilOp:
        {
            this.renderContext.setStencilOp(desc.params[0], desc.params[1], desc.params[2]);    
        }
        break;
        
        case eRenderMethod.SetPolygonOffset:
        {
            this.renderContext.setPolygonOffset(desc.params[0], desc.params[1]);    
        }
        break;
        
        //GetPolygonOffset
        
        //GetTransparentAlphaValue
        
        case eRenderMethod.CreateDisplayList:
        {
            return this.renderContext.createDisplayList();    
        }
        break;
        
        case eRenderMethod.DeleteDisplayList:
        {
            this.renderContext.deleteDisplayList(desc.params[0]);    
        }
        break;
        
        case eRenderMethod.SetRenderTarget:
        {
            this.renderContext.setRenderTarget(desc.params[0]);    
        }
        break;

        case eRenderMethod.VertexBufferObj_SetLength:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetVertices:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetVerticesVolatile:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetColors:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetColorsVolatile:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetNormals:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetNormalsVolatile:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetUVCoords:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetUVCoordsVolatile:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_SetTextureStage:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_Draw:
        {
            
        }
        break;
        
        case eRenderMethod.VertexBufferObj_DrawIndexed:
        {
            
        }
        break;
            
        case eRenderMethod.IndexBufferObj_SetLength:
        {
            
        }
        break;
        
        //IndexBufferObj_GetLength
        
        case eRenderMethod.IndexBufferObj_SetIndices:
        {
            
        }
        break;
        
        case eRenderMethod.IndexBufferObj_SetIndicesVolatile:
        {
            
        }
        break;

        //TextureObj_SetImage
        
        //TextureObj_SetSubImage
    }
}
