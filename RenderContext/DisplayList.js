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
                
        }
        break;
        
        case eRenderMethod.SetViewport:
        {

        }
        break;
    
        //GetViewport
        
        case eRenderMethod.Clear:
        {
            
        }
        break;
        
        case eRenderMethod.SetMatrixMode:
        {
            
        }
        break;
        
        case eRenderMethod.PushMatrix:
        {
            
        }
        break;
        
        case eRenderMethod.PopMatrix:
        {
            
        }
        break;
        
        case eRenderMethod.LoadMatrix:
        {
            
        }
        break;
        
        case eRenderMethod.MultMatrix:
        {
            
        }
        break;
        
        //GetMatrix
        
        case eRenderMethod.PerspectiveMatrixLH:
        {
            
        }
        break;
        
        case eRenderMethod.PerspectiveMatrixRH:
        {
            
        }
        break;
        
        case eRenderMethod.OrthographicMatrixLH:
        {
            
        }
        break;
        
        case eRenderMethod.OrthographicMatrixRH:
        {
            
        }
        break;
        
        //GetMaxLightCount
        
        case eRenderMethod.SetLight:
        {
            
        }
        break;
        
        //GetLight
        
        case eRenderMethod.EnableLight:
        {
            
        }
        break;
        
        case eRenderMethod.IsLightEnabled:
        {
            
        }
        break;
        
        case eRenderMethod.SetEnabledLights:
        {
            
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
            
        }
        break;
        
        //GetGlobalIllumination
        
        case eRenderMethod.SetShadeModel:
        {
            
        }
        break;
        
        //GetShadeModel
        
        case eRenderMethod.SetColor:
        {
            
        }
        break;
        
        //GetColor
        
        case eRenderMethod.SetMaterial:
        {
            
        }
        break;
        
        //GetMaterial
        
        case eRenderMethod.SetBlendFactor:
        {
            
        }
        break;
        
        //GetMaxPrimitiveCount
        
        //GetMaxVertexIndex
        
        case eRenderMethod.DrawPrimitives:
        {
            
        }
        break;
        
        case eRenderMethod.CreateVertexBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.DeleteVertexBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.CreateIndexBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.DeleteIndexBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.CreateTexture:
        {
            
        }
        break;
        
        case eRenderMethod.DeleteTexture:
        {
            
        }
        break;
        
        //GetMaxTextureStages
        
        case eRenderMethod.EnableTextureStage:
        {
            
        }
        break;
        
        case eRenderMethod.SetTextureBlendOp:
        {
            
        }
        break;
        
        case eRenderMethod.SetTextureBlendFactor:
        {
            
        }
        break;
        
        case eRenderMethod.SetTextureWrap:
        {
            
        }
        break;
        
        case eRenderMethod.SetTextureBorderColor:
        {
            
        }
        break;
        
        case eRenderMethod.DrawSphere:
        {
            
        }
        break;
        
        case eRenderMethod.DrawBox:
        {
            
        }
        break;
        
        //GetFrameBufferOrigin
        
        case eRenderMethod.ReadFrameBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.ReadAuxBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.WriteFrameBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.WriteAuxBuffer:
        {
            
        }
        break;
        
        case eRenderMethod.SetPointSize:
        {
            
        }
        break;
        
        case eRenderMethod.SetLineWidth:
        {
            
        }
        break;
        
        case eRenderMethod.SupportsPixelFormat:
        {
            
        }
        break;
        
        case eRenderMethod.SupportsAntialiasing:
        {
            
        }
        break;
        
        case eRenderMethod.SetUserMaxTextureSize:
        {
            
        }
        break;
        
        //GetUserMaxTextureSize
        
        case eRenderMethod.SetFogParameters:
        {
            
        }
        break;
        
        //GetFogParameters
        
        case eRenderMethod.SetPolygonWindingOrder:
        {
            
        }
        break;
        
        //GetPolygonWindingOrder
        
        case eRenderMethod.ReversePolygonWindingOrder:
        {
            
        }
        break;
        
        case eRenderMethod.SetDepthFunc:
        {
            
        }
        break;
        
        case eRenderMethod.SetStencilFunc:
        {
            
        }
        break;
        
        case eRenderMethod.SetStencilWriteMask:
        {
            
        }
        break;
        
        case eRenderMethod.SetStencilOp:
        {
            
        }
        break;
        
        case eRenderMethod.SetPolygonOffset:
        {
            
        }
        break;
        
        //GetPolygonOffset
        
        //GetTransparentAlphaValue
        
        case eRenderMethod.CreateDisplayList:
        {
            
        }
        break;
        
        case eRenderMethod.DeleteDisplayList:
        {
            
        }
        break;
        
        case eRenderMethod.SetRenderTarget:
        {
            
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
