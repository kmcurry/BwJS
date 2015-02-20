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
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
    program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);
    program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);
    program.textureCoordAttribute = new Array(gl_MaxTextureStages);
    for (var i = 0; i < gl_MaxTextureStages; i++)
    {
        program.textureCoordAttribute[i] = gl.getAttribLocation(program, "aTextureCoord" + i);
        gl.enableVertexAttribArray(program.textureCoordAttribute[i]);
    }

    // get uniforms

    // matrices
    program.projectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    program.modelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    program.normalMatrix = gl.getUniformLocation(program, "uNormalMatrix");

    // lights
    program.globalAmbientLight = gl.getUniformLocation(program, "uGlobalAmbientLight");
    program.lightSource = new Array(gl_MaxLights);
    for (var i = 0; i < gl_MaxLights; i++)
    {
        program.lightSource[i] = new gl_LightSourceParameters();

        program.lightSource[i].enabled = gl.getUniformLocation(program, "uLightSource_enabled[" + i + "]");
        program.lightSource[i].ambient = gl.getUniformLocation(program, "uLightSource_ambient[" + i + "]");
        program.lightSource[i].diffuse = gl.getUniformLocation(program, "uLightSource_diffuse[" + i + "]");
        program.lightSource[i].specular = gl.getUniformLocation(program, "uLightSource_specular[" + i + "]");
        program.lightSource[i].position = gl.getUniformLocation(program, "uLightSource_position[" + i + "]");
        program.lightSource[i].spotDirection = gl.getUniformLocation(program, "uLightSource_spotDirection[" + i + "]");
        program.lightSource[i].spotExponent = gl.getUniformLocation(program, "uLightSource_spotExponent[" + i + "]");
        program.lightSource[i].spotCutoff = gl.getUniformLocation(program, "uLightSource_spotCutoff[" + i + "]");
        program.lightSource[i].constantAttenuation = gl.getUniformLocation(program, "uLightSource_constantAttenuation[" + i + "]");
        program.lightSource[i].linearAttenuation = gl.getUniformLocation(program, "uLightSource_linearAttenuation[" + i + "]");
        program.lightSource[i].quadraticAttenuation = gl.getUniformLocation(program, "uLightSource_quadraticAttenuation[" + i + "]");

        // set initially disabled
        gl.uniform1i(program.lightSource[i].enabled, 0);
    }

    // materials
    program.frontMaterial = new gl_MaterialParameters();
    program.frontMaterial.ambient = gl.getUniformLocation(program, "uFrontMaterial_ambient");
    program.frontMaterial.diffuse = gl.getUniformLocation(program, "uFrontMaterial_diffuse");
    program.frontMaterial.specular = gl.getUniformLocation(program, "uFrontMaterial_specular");
    program.frontMaterial.emission = gl.getUniformLocation(program, "uFrontMaterial_emission");
    program.frontMaterial.shininess = gl.getUniformLocation(program, "uFrontMaterial_shininess");

    // textures
    program.textureSamplerColor = new Array(gl_MaxTextureStages);
    program.textureSamplerAlpha = new Array(gl_MaxTextureStages);
    program.textureStageEnabled = new Array(gl_MaxTextureStages)
    for (var i = 0; i < gl_MaxTextureStages; i++)
    {
        program.textureSamplerColor[i] = gl.getUniformLocation(program, "uTextureSamplerColor[" + i + "]");
        program.textureSamplerAlpha[i] = gl.getUniformLocation(program, "uTextureSamplerAlpha[" + i + "]");
        program.textureStageEnabled[i] = gl.getUniformLocation(program, "uTextureStageEnabled[" + i + "]");
    }
    program.textureSamplerShadowMap = gl.getUniformLocation(program, "uTextureSamplerShadowMap");
    program.textureBlendOp = gl.getUniformLocation(program, "uTextureBlendOp");
    program.textureColorMask = gl.getUniformLocation(program, "uTextureColorMask");

    // clip planes
    program.clipPlane = new Array(gl_MaxClipPlanes);
    program.clipPlaneEnabled = new Array(gl_MaxClipPlanes);
    for (var i = 0; i < gl_MaxClipPlanes; i++)
    {
        program.clipPlane[i] = gl.getUniformLocation(program, "uClipPlane[" + i + "]");
        program.clipPlaneEnabled[i] = gl.getUniformLocation(program, "uClipPlaneEnabled[" + i + "]");
    }

    // enabled
    program.lightingEnabled = gl.getUniformLocation(program, "uLightingEnabled");
    program.texturesEnabled = gl.getUniformLocation(program, "uTexturesEnabled");

    // set initially enabled/disabled
    gl.uniform1i(program.lightingEnabled, 1);
    gl.uniform1i(program.texturesEnabled, 1);
    gl.uniform1i(program.textureStageEnabled[0], 0);
    gl.uniform1i(program.textureStageEnabled[1], 0);
    
    this.getGLProgram = function()
    {
        return program;
    }
}




