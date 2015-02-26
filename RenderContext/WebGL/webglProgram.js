function webglProgram(rc, gl, source_vs, source_fs)
{
    var rc = rc;
    var gl = gl;

    // create vertex shader
    var vs = gl.createShader(gl.VERTEX_SHADER);
    if (vs)
    {
        gl.shaderSource(vs, source_vs);
        gl.compileShader(vs);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(vs));
            return;
        }
    }

    // create fragment shader
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (fs)
    {
        gl.shaderSource(fs, source_fs);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(fs));
            return;
        }
    }

    // create program
    var program = gl.createProgram();
    if (!program)
        return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        alert(gl.getProgramInfoLog(program));
        return;
    }
    
    gl.useProgram(program);

    // get attributes
    var _attributeCount = 0;
    this.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    if (this.vertexPositionAttribute >= 0) _attributeCount++;
    this.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    if (this.vertexNormalAttribute >= 0) _attributeCount++;
    this.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
    if (this.vertexColorAttribute >= 0) _attributeCount++;
    this.textureCoordAttribute = new Array(gl_MaxTextureStages);
    for (var i = 0; i < gl_MaxTextureStages; i++)
    {
        this.textureCoordAttribute[i] = gl.getAttribLocation(program, "aTextureCoord" + i);
        if (this.textureCoordAttribute[i] >= 0) _attributeCount++;
    }

    // get uniforms

    // matrices
    this.projectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    this.viewMatrix = gl.getUniformLocation(program, "uViewMatrix");
    this.worldMatrix = gl.getUniformLocation(program, "uWorldMatrix");
    this.normalMatrix = gl.getUniformLocation(program, "uNormalMatrix");

    // lights
    this.globalAmbientLight = gl.getUniformLocation(program, "uGlobalAmbientLight");
    this.lightSource = new Array(gl_MaxLights);
    for (var i = 0; i < gl_MaxLights; i++)
    {
        this.lightSource[i] = new gl_LightSourceParameters();

        this.lightSource[i].enabled = gl.getUniformLocation(program, "uLightSource_enabled[" + i + "]");
        this.lightSource[i].ambient = gl.getUniformLocation(program, "uLightSource_ambient[" + i + "]");
        this.lightSource[i].diffuse = gl.getUniformLocation(program, "uLightSource_diffuse[" + i + "]");
        this.lightSource[i].specular = gl.getUniformLocation(program, "uLightSource_specular[" + i + "]");
        this.lightSource[i].position = gl.getUniformLocation(program, "uLightSource_position[" + i + "]");
        this.lightSource[i].spotDirection = gl.getUniformLocation(program, "uLightSource_spotDirection[" + i + "]");
        this.lightSource[i].spotExponent = gl.getUniformLocation(program, "uLightSource_spotExponent[" + i + "]");
        this.lightSource[i].spotCutoff = gl.getUniformLocation(program, "uLightSource_spotCutoff[" + i + "]");
        this.lightSource[i].constantAttenuation = gl.getUniformLocation(program, "uLightSource_constantAttenuation[" + i + "]");
        this.lightSource[i].linearAttenuation = gl.getUniformLocation(program, "uLightSource_linearAttenuation[" + i + "]");
        this.lightSource[i].quadraticAttenuation = gl.getUniformLocation(program, "uLightSource_quadraticAttenuation[" + i + "]");

        // set initially disabled
        gl.uniform1i(this.lightSource[i].enabled, 0);
    }

    // materials
    this.frontMaterial = new gl_MaterialParameters();
    this.frontMaterial.ambient = gl.getUniformLocation(program, "uFrontMaterial_ambient");
    this.frontMaterial.diffuse = gl.getUniformLocation(program, "uFrontMaterial_diffuse");
    this.frontMaterial.specular = gl.getUniformLocation(program, "uFrontMaterial_specular");
    this.frontMaterial.emission = gl.getUniformLocation(program, "uFrontMaterial_emission");
    this.frontMaterial.shininess = gl.getUniformLocation(program, "uFrontMaterial_shininess");

    // textures
    this.textureSamplerColor = new Array(gl_MaxTextureStages);
    this.textureSamplerAlpha = new Array(gl_MaxTextureStages);
    this.textureStageEnabled = new Array(gl_MaxTextureStages)
    for (var i = 0; i < gl_MaxTextureStages; i++)
    {
        this.textureSamplerColor[i] = gl.getUniformLocation(program, "uTextureSamplerColor[" + i + "]");
        this.textureSamplerAlpha[i] = gl.getUniformLocation(program, "uTextureSamplerAlpha[" + i + "]");
        this.textureStageEnabled[i] = gl.getUniformLocation(program, "uTextureStageEnabled[" + i + "]");
    }
    this.textureSamplerShadowMap = gl.getUniformLocation(program, "uTextureSamplerShadowMap");
    this.textureBlendOp = gl.getUniformLocation(program, "uTextureBlendOp");
    this.textureColorMask = gl.getUniformLocation(program, "uTextureColorMask");

    // clip planes
    this.clipPlane = new Array(gl_MaxClipPlanes);
    this.clipPlaneEnabled = new Array(gl_MaxClipPlanes);
    for (var i = 0; i < gl_MaxClipPlanes; i++)
    {
        this.clipPlane[i] = gl.getUniformLocation(program, "uClipPlane[" + i + "]");
        this.clipPlaneEnabled[i] = gl.getUniformLocation(program, "uClipPlaneEnabled[" + i + "]");
    }

    // enabled
    this.lightingEnabled = gl.getUniformLocation(program, "uLightingEnabled");
    this.texturesEnabled = gl.getUniformLocation(program, "uTexturesEnabled");

    // misc
    this.shadowCasterWorldPosition = gl.getUniformLocation(program, "uShadowCasterWorldPosition");
    
    // set initially enabled/disabled
    gl.uniform1i(this.lightingEnabled, 1);
    gl.uniform1i(this.texturesEnabled, 1);
    gl.uniform1i(this.textureStageEnabled[0], 0);
    gl.uniform1i(this.textureStageEnabled[1], 0);
    
    this.getGLProgram = function()
    {
        return program;
    }
    
    this.enableVertexAttribArrays = function()
    {
        for (var i = 0; i < _attributeCount; i++)
        {
            gl.enableVertexAttribArray(i);
        }
    }
    
    this.disableVertexAttribArrays = function()
    {
        for (var i = 0; i < _attributeCount; i++)
        {
            gl.disableVertexAttribArray(i);
        }
    }
    
    this.vertexAttribPointer = function(index, size, type, normalized, stride, offset)
    {
        if (index >= 0)
        {
            gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
        }
    }
}




