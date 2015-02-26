function webglShadowFBO(rc, gl)
{
    var rc = rc;
    var gl = gl;
    var width = 1024;
    var height = 1024;
    
    // create frame buffer
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    
    // create depth texture
    var depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
   
    var floatExt = gl.getFloatExtension({
        require: ['renderable'],
        prefer:  ['filterable', 'half']
    });
    
    // create shadow map
    var shadowMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMap);
    for (var i = 0; i < 6; i++)
    {
        var target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        gl.texImage2D(target, 0, gl.RGBA, width, height, 0, gl.RGBA, floatExt.type, null);  
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    this.bindForWriting = function(face)
    {
        var glFace = 0;
        switch (face)
        {
            case eCubeMapFace.Positive_X: glFace = gl.TEXTURE_CUBE_MAP_POSITIVE_X; break;
            case eCubeMapFace.Negative_X: glFace = gl.TEXTURE_CUBE_MAP_NEGATIVE_X; break;
            case eCubeMapFace.Positive_Y: glFace = gl.TEXTURE_CUBE_MAP_POSITIVE_Y; break;
            case eCubeMapFace.Negative_Y: glFace = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y; break;
            case eCubeMapFace.Positive_Z: glFace = gl.TEXTURE_CUBE_MAP_POSITIVE_Z; break;
            case eCubeMapFace.Negative_Z: glFace = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z; break;
            default: return false;
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glFace, shadowMap, 0);
        
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE)
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return false;
        }
        
        gl.viewport(0, 0, width, height);
        gl.clearColor(FLT_MAX, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        return true;
    }
    
    this.bindForReading = function()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE0 + eTextureUnit.ShadowMap);
        gl.uniform1i(rc.getProgram().textureSamplerShadowMap, eTextureUnit.ShadowMap);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMap);
        //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
    }
}

