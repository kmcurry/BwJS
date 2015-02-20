function webglShadowFBO(rc, gl)
{
    var rc = rc;
    var gl = gl;
    var width = 256;
    var height = 256;
    
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
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    this.bindForWriting = function(face)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, face, shadowMap, 0);
        gl.drawBuffer(gl.COLOR_ATTACHMENT0);
    }
    
    this.bindForReading = function()
    {
        gl.activeTexture(gl.TEXTURE0 + eTextureUnit.ShadowMap);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMap);
        gl.uniform1i(rc.getProgram().textureSamplerShadowMap, eTextureUnit.ShadowMap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}

