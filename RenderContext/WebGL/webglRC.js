function gl_LightSourceParameters()
{
    var enabled;
    var ambient;
    var diffuse;
    var specular;
    var position;
    var spotDirection;
    var spotExponent;
    var spotCutoff;
    var constantAttenuation;
    var linearAttenuation;
    var quadraticAttenuation;
}

function gl_MaterialParameters()
{
    var ambient;
    var diffuse;
    var specular;
    var emissive;
    var shininess; 
}

var gl_MaxLights = 4;
var gl_MaxTextureStages = 2;
var gl_MaxClipPlanes = 4;

webglRC.prototype = new RenderContext();
webglRC.prototype.constructor = webglRC;

function webglRC(canvas, background)
{
    //
    // initialization
    //
    
    RenderContext.call(this, canvas, background);
    
    var _gl = getWebGLContext(canvas, false /*set to true for debug context*/);
    if (!_gl) return;

    _gl.clearColor(0, 0, 0, background ? 0 : 1);
    _gl.clearDepth(1);
    _gl.clearStencil(0);
    _gl.enable(_gl.DEPTH_TEST);
    _gl.depthFunc(_gl.LEQUAL);
    _gl.disable(_gl.STENCIL_TEST);
    _gl.frontFace(_gl.CW);
    _gl.viewport(0, 0, canvas.width, canvas.height);
    _gl.enable(_gl.CULL_FACE);
    _gl.cullFace(_gl.BACK);
    _gl.enable(_gl.BLEND);
    _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
   
    // extensions
    var OES_standard_derivatives_extension = _gl.getExtension('OES_standard_derivatives');
    var FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;
    _gl.hint(FRAGMENT_SHADER_DERIVATIVE_HINT_OES, _gl.NICEST);
    
    // set valid flag
    this.valid = true;

    // private members
    var _program = null;
    var _vLights = [];
    var _vLightMatrices = [];
    var _vLightEnabledStates = [];
    var _vClipPlanes = [];
    var _vClipPlaneMatrices = [];
    var _vClipPlaneEnabledStates = [];
    var _viewport = new Viewport(0, 0, canvas.width, canvas.height);
    var _clearColor = new Color(0, 0, 0, background ? 0 : 1);
    var _enabledCaps = new EnabledCaps();
    
    //
    // methods
    //
    
    this.applyProjectionTransform = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.ApplyProjectionTransform, null);
        
        _gl.uniformMatrix4fv(_program.projectionMatrix, false, new Float32Array(this.projectionMatrixStack.top().flatten()));
    }
    
    this.applyViewTransform = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.ApplyViewTransform, null);
        
        _gl.uniformMatrix4fv(_program.viewMatrix, false, new Float32Array(this.viewMatrixStack.top().flatten()));
    }
    
    this.applyWorldTransform = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.ApplyWorldTransform, null);
        
        _gl.uniformMatrix4fv(_program.worldMatrix, false, new Float32Array(this.worldMatrixStack.top().flatten()));

        var normalMatrix = new Matrix4x4();
        normalMatrix.loadMatrix(this.worldMatrixStack.top());
        normalMatrix.invert(true);
        _gl.uniformMatrix4fv(_program.normalMatrix, false, new Float32Array(normalMatrix.flatten()));
    }
    
    this.clear = function(mask)
    {
        mask = mask || (RC_COLOR_BUFFER_BIT | RC_DEPTH_BUFFER_BIT);
        
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.Clear, [mask]);
        
        _gl.clear((mask & RC_COLOR_BUFFER_BIT   ? _gl.COLOR_BUFFER_BIT   : 0) |
                  (mask & RC_DEPTH_BUFFER_BIT   ? _gl.DEPTH_BUFFER_BIT   : 0) |
                  (mask & RC_STENCIL_BUFFER_BIT ? _gl.STENCIL_BUFFER_BIT : 0));
    }

    this.clearColor = function(r, g, b, a)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.ClearColor, [r, g, b, a]);
        
        _gl.clearColor(r, g, b, a);
        _clearColor.load(r, g, b, a);
    }
    
    this.clearDepth = function(d)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.ClearDepth, [d]);
        
        _gl.clearDepth(d);
    }
    
    this.clearStencil = function(s)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.ClearStencil, [s]);
        
        _gl.clearStencil(s);  
    }
    
    this.createProgram = function(vs, fs)
    {
        //if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.createProgram, [vs, fs]);
        
        return new webglProgram(this, _gl, vs, fs);
    }
    
    this.createShadowFramebufferObject = function()
    {
        return new webglShadowFBO(this, _gl);
    }
    
    this.createTextureObject = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.CreateTextureObject, null);
        
        return new webglTO(this, _gl);
    }
    
    this.createVertexBuffer = function(numVerticesPerPrimitive)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.CreateVertexBuffer, [numVerticesPerPrimitive]);
        
        return new webglVB(this, _gl, numVerticesPerPrimitive);
    }
    
    this.cullFace = function(face)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.CullFace, [face]);
        
        switch (face)
        {
            case RC_FRONT:
                _gl.cullFace(_gl.FRONT);
                break;
                
            case RC_BACK:
                _gl.cullFace(_gl.BACK);
                break;
        }
    }
    
    this.disable = function(cap)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.Disable, [cap]);
        
        switch (cap)
        {
            case eRenderMode.AlphaBlend:
                _gl.disable(_gl.BLEND);
                _enabledCaps.alphaBlend = false;
                break;

            case eRenderMode.CullBackFace:
                _gl.disable(_gl.CULL_FACE);
                _enabledCaps.cullBackFace = false;
                break;

            case eRenderMode.DepthBufferWrite:
                _gl.depthMask(false);
                _enabledCaps.depthBufferWrite = false;
                break;

            case eRenderMode.DepthTest:
                _gl.disable(_gl.DEPTH_TEST);
                _enabledCaps.depthTest = false;
                break;

            case eRenderMode.Lighting:
                _gl.uniform1i(_program.lightingEnabled, false);
                _enabledCaps.lighting = false;
                break;
                
            case eRenderMode.StencilTest:
                _gl.disable(_gl.STENCIL_TEST);
                _enabledCaps.stencilTest = false;
                break;
        }
    }

    this.enable = function(cap)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.Enable, [cap]);
        
        switch (cap)
        {
            case eRenderMode.AlphaBlend:
                _gl.enable(_gl.BLEND);
                _enabledCaps.alphaBlend = true;
                break;

            case eRenderMode.CullBackFace:
                _gl.enable(_gl.CULL_FACE);
                _enabledCaps.cullBackFace = true;
                break;

            case eRenderMode.DepthBufferWrite:
                _gl.depthMask(true);
                _enabledCaps.depthBufferWrite = true;
                break;

            case eRenderMode.DepthTest:
                _gl.enable(_gl.DEPTH_TEST);
                _enabledCaps.depthTest = true;
                break;

            case eRenderMode.Lighting:
                _gl.uniform1i(_program.lightingEnabled, true);
                _enabledCaps.lighting = true;
                break;
                
            case eRenderMode.StencilTest:
                _gl.enable(_gl.STENCIL_TEST);
                _enabledCaps.stencilTest = true;
                break;
        }
    }
    
    this.enableClipPlane = function(index, enable)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.EnableClipPlane, [index, enable]);
        
        _gl.uniform1i(_program.clipPlaneEnabled[index], enable);

        _vClipPlaneEnabledStates[index] = enable;
    }

    this.enabled = function(cap)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.Enabled, [cap]);
        
        var e = false;

        switch (cap)
        {
            case eRenderMode.AlphaBlend:
                e = _enabledCaps.alphaBlend;
                break;

            case eRenderMode.CullBackFace:
                e = _enabledCaps.cullBackFace;
                break;
                
            case eRenderMode.DepthBufferWrite:
                e = _enabledCaps.depthBufferWrite;
                break;

            case eRenderMode.DepthTest:
                e = _enabledCaps.depthTest;
                break;

            case eRenderMode.Lighting:
                e = _enabledCaps.lighting;
                break;
                
            case eRenderMode.StencilTest:
                e = _enabledCaps.stencilTest;
                break;
        }

        return e;
    }
    
    this.enableLight = function(index, enable)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.EnableLight, [index, enable]);
        
        _gl.uniform1i(_program.lightSource[index].enabled, enable);

        _vLightEnabledStates[index] = enable;
    }
    
    this.enableTextureStage = function(stage, enable)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.EnableTextureStage, [stage, enable]);
        
        _gl.uniform1i(_program.textureStageEnabled[stage], enable);
    }
    
    this.finish = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.Finish, null);
        
        _gl.finish();
    }
    
    this.getClearColor = function()
    {
        return _clearColor;
    }
    
    this.getClipPlane = function(index)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetClipPlane, [index]);
        
        return { equation: _vClipPlanes[index], matrix: _vClipPlaneMatrices[index] };
    }
    
    this.getEnabledClipPlanes = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetEnabledClipPlanes, null);
        
        var indices = [];

        for (var i = 0; i < _vClipPlaneEnabledStates.length; i++)
        {
            if (_vClipPlaneEnabledStates[i])
            {
                indices.push(i);
            }
        }

        return indices;
    }
    
    this.getEnabledLights = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetEnabledLights, null);
        
        var indices = [];

        for (var i = 0; i < _vLightEnabledStates.length; i++)
        {
            if (_vLightEnabledStates[i])
            {
                indices.push(i);
            }
        }

        return indices;
    }

    this.getGlobalIllumination = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetGlobalIllumination, null);
        
        var values = this.globalIllumination.v();//_gl.getUniform(_program.getGLProgram(), _program.globalAmbientLight);

        return { r: values[0], g: values[1], b: values[2], a: values[3] };
    }
    
    this.getLight = function(index)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetLight, [index]);
        
        return { desc: _vLights[index], matrix: _vLightMatrices[index] };
    }
    
    this.getMaxLightCount = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetMaxLightCount, null);
        
        return gl_MaxLights;
    }
    
    this.getMaxTextureStages = function()
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetMaxTextureStages, null);
        
        return gl_MaxTextureStages;
    }
    
    this.getProgram = function()
    {
        //if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.GetProgram, null);
        
        return _program;
    }
    
    this.getViewport = function()
    {
        return _viewport;
    }
    
    this.perspectiveMatrixLH = function(left, right, top, bottom, near, far)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.PerspectiveMatrixLH, [left, right, top, bottom, near, far]);
        
        var p = new Matrix4x4();
        
        var a = (right + left) / (right - left);
        var b = (top + bottom) / (top - bottom);
        var c = (far + near) / (far - near);
        var d = (2 * far * near) / (far - near);
        
        p._11 = (2 * near) / (right - left);
        p._13 = a;
        p._22 = (2 * near) / (top - bottom);
        p._23 = b;
        p._33 = c;
        p._34 = 1;
        p._43 = -d;
        p._44 = 0;
        
        return p;
    }
    
    this.orthographicMatrixLH = function(left, right, top, bottom, near, far)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.OrthographicMatrixLH, [left, right, top, bottom, near, far]);
        
        var p = new Matrix4x4();
        
        p._11 =  2 / (right - left);
        p._22 =  2 / (top - bottom);
        p._33 = -2 / (far - near);
        p._41 = -((right + left) / (right - left));
        p._42 = -((top + bottom) / (top - bottom));
        p._43 = -((far + near) / (far - near)) / 2;
              
        return p;
    }
    
    this.readFrameBuffer = function(x, y, width, height)
    {
        var pixels = new Uint8Array(width * height * 4);
        
        _gl.readPixels(x, y, width, height, _gl.RGBA, _gl.UNSIGNED_BYTE, pixels);
        
        return pixels;
    }
    
    this.setBlendColor = function(r, g, b, a)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetBlendColor, [r, g, b, a]);
        
        _gl.blendColor(r, g, b, a);
    }
    
    this.setBlendFactor = function(sfactor, dfactor)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetBlendFactor, [sfactor, dfactor]);
        
        var gl_SrcFactor;
        switch (sfactor)
        {
        case RC_ZERO:                   gl_SrcFactor = _gl.ZERO; break;
        case RC_ONE:                    gl_SrcFactor = _gl.ONE; break;
        case RC_SRC_COLOR:              gl_SrcFactor = _gl.SRC_COLOR; break;
        case RC_SRC_ALPHA:              gl_SrcFactor = _gl.SRC_ALPHA; break;        
        case RC_ONE_MINUS_SRC_COLOR:    gl_SrcFactor = _gl.ONE_MINUS_SRC_COLOR; break;
        case RC_ONE_MINUS_SRC_ALPHA:    gl_SrcFactor = _gl.ONE_MINUS_SRC_ALPHA; break;
        case RC_DEST_COLOR:             gl_SrcFactor = _gl.DEST_COLOR; break;
        case RC_DEST_ALPHA:             gl_SrcFactor = _gl.DEST_ALPHA; break;        
        case RC_ONE_MINUS_DEST_COLOR:   gl_SrcFactor = _gl.ONE_MINUS_DEST_COLOR; break;
        case RC_ONE_MINUS_DEST_ALPHA:   gl_SrcFactor = _gl.ONE_MINUS_DEST_ALPHA; break;
        }     
        
        var gl_DestFactor;
        switch (dfactor)
        {
        case RC_ZERO:                   gl_DestFactor = _gl.ZERO; break;
        case RC_ONE:                    gl_DestFactor = _gl.ONE; break;
        case RC_SRC_COLOR:              gl_DestFactor = _gl.SRC_COLOR; break;
        case RC_SRC_ALPHA:              gl_DestFactor = _gl.SRC_ALPHA; break;        
        case RC_ONE_MINUS_SRC_COLOR:    gl_DestFactor = _gl.ONE_MINUS_SRC_COLOR; break;
        case RC_ONE_MINUS_SRC_ALPHA:    gl_DestFactor = _gl.ONE_MINUS_SRC_ALPHA; break;
        case RC_DEST_COLOR:             gl_DestFactor = _gl.DEST_COLOR; break;
        case RC_DEST_ALPHA:             gl_DestFactor = _gl.DEST_ALPHA; break;        
        case RC_ONE_MINUS_DEST_COLOR:   gl_DestFactor = _gl.ONE_MINUS_DEST_COLOR; break;
        case RC_ONE_MINUS_DEST_ALPHA:   gl_DestFactor = _gl.ONE_MINUS_DEST_ALPHA; break;
        }
        
        _gl.blendFunc(gl_SrcFactor, gl_DestFactor);  
    }

    this.setClipPlane = function(index, equation)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetClipPlane, [index, equation]);
        
        // get current world transform
        var worldMatrix = this.worldMatrixStack.top();

        var values = [ equation[0], equation[1], equation[2], equation[3] ];
        
        _gl.uniform4fv(_program.textureColorMask, new Float32Array(values));
        
        _vClipPlanes[index] = equation;
        _vClipPlaneMatrices[index] = worldMatrix;          
    }
    
    this.setDepthFunc = function(func)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetDepthFunc, [func]);
        
        var gl_DepthFunc;
        switch (func)
        {
        case eDepthFunc.Never:          gl_DepthFunc = _gl.NEVER; break;
        case eDepthFunc.Less:           gl_DepthFunc = _gl.LESS; break;
        case eDepthFunc.LessEqual:      gl_DepthFunc = _gl.LEQUAL; break;
        case eDepthFunc.Equal:          gl_DepthFunc = _gl.EQUAL; break;
        case eDepthFunc.NotEqual:       gl_DepthFunc = _gl.NOTEQUAL; break;
        case eDepthFunc.GreaterEqual:   gl_DepthFunc = _gl.GEQUAL; break;
        case eDepthFunc.Greater:        gl_DepthFunc = _gl.GREATER; break;
        case eDepthFunc.Always:         gl_DepthFunc = _gl.ALWAYS; break;
        }
        
        _gl.depthFunc(gl_DepthFunc);
           
    }
    
    this.setEnabledClipPlanes = function(indices)
    {
        if (this.displayListObj) if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetEnabledClipPlanes, [indices]);
        
        // disable all previously enabled clip planes
        for (var i = 0; i < _vClipPlaneEnabledStates.length; i++)
        {
            if (_vClipPlaneEnabledStates[i])
            {
                this.enableClipPlane(i, false);
            }
        }

        // enable specified clip planes
        for (var i = 0; i < indices.length; i++)
        {
            this.enableClipPlane(indices[i], true);
        }
    }
    
    this.setEnabledLights = function(indices)
    {
        if (this.displayListObj) if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetEnabledLights, [indices]);
        
        // disable all previously enabled lights
        for (var i = 0; i < _vLightEnabledStates.length; i++)
        {
            if (_vLightEnabledStates[i])
            {
                this.enableLight(i, false);
            }
        }

        // enable specified lights
        for (var i = 0; i < indices.length; i++)
        {
            this.enableLight(indices[i], true);
        }
    }
    
    this.setFrontMaterial = function(desc)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetFrontMaterial, [desc]);
        
        // ambient
        if (desc.validMembersMask & MATERIALDESC_AMBIENT_BIT)
        {
            _gl.uniform4fv(_program.frontMaterial.ambient, new Float32Array(desc.ambient.v()));
            
            this.frontMaterial.ambient = desc.ambient;
        }
        
        // diffuse
        if (desc.validMembersMask & MATERIALDESC_DIFFUSE_BIT)
        {
            _gl.uniform4fv(_program.frontMaterial.diffuse, new Float32Array(desc.diffuse.v()));
            
            this.frontMaterial.diffuse = desc.diffuse;
        }
        
        // specular
        if (desc.validMembersMask & MATERIALDESC_SPECULAR_BIT)
        {
            _gl.uniform4fv(_program.frontMaterial.specular, new Float32Array(desc.specular.v()));
            
            this.frontMaterial.specular = desc.specular;
        }
        
        // emissive
        if (desc.validMembersMask & MATERIALDESC_EMISSIVE_BIT)
        {
            // TODO
            _gl.uniform4fv(_program.frontMaterial.emissive, new Float32Array(desc.emissive.v()));
            
            this.frontMaterial.emissive = desc.emissive;
        }
        
        // glossiness
        if (desc.validMembersMask & MATERIALDESC_GLOSSINESS_BIT)
        {
            // glossiness - OpenGL accepts values in the range [0, 128].
            // use the range [5, 128], because values below 5 result in wash-out
            _gl.uniform1f(_program.frontMaterial.shininess, clamp(desc.glossiness * 128, 5, 128));
            
            this.frontMaterial.glossiness = desc.glossiness;
        }
        
        this.frontMaterial.validMembersMask |= desc.validMembersMask;
    }

    this.setGlobalIllumination = function(ambient)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetGlobalIllumination, [ambient]);
        
        var values = [ ambient.r, ambient.g, ambient.b, ambient.a ];

        _gl.uniform4fv(_program.globalAmbientLight, new Float32Array(values));
        
        this.globalIllumination.load(ambient.r, ambient.g, ambient.b, ambient.a);
    }

    this.setLight = function(index, desc)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetLight, [index, desc]);

        // position
        if (desc.validMembersMask & LIGHTDESC_POSITION_BIT)
        {
            var values = [desc.position.x, desc.position.y, desc.position.z, 1];
            _gl.uniform4fv(_program.lightSource[index].position, new Float32Array(values));
        }

        // direction
        if (desc.validMembersMask & LIGHTDESC_DIRECTION_BIT)
        {
            var values = [desc.direction.x, desc.direction.y, desc.direction.z, 0];

            switch (desc.type)
            {
                case "directional":
                    {
                        values[0] *= -1;
                        values[1] *= -1;
                        values[2] *= -1;

                        // OpenGL gets a directional light's direction from position member                
                        _gl.uniform4fv(_program.lightSource[index].position, new Float32Array(values));
                    }
                    break;

                case "spot":
                    {
                        _gl.uniform4fv(_program.lightSource[index].spotDirection, new Float32Array(values));
                    }
                    break;
            }
        }

        // ambient
        if (desc.validMembersMask & LIGHTDESC_AMBIENT_BIT)
        {
            _gl.uniform4fv(_program.lightSource[index].ambient, new Float32Array(desc.ambient.v()));
        }

        // diffuse
        if (desc.validMembersMask & LIGHTDESC_DIFFUSE_BIT)
        {
            _gl.uniform4fv(_program.lightSource[index].diffuse, new Float32Array(desc.diffuse.v()));
        }

        // specular
        if (desc.validMembersMask & LIGHTDESC_SPECULAR_BIT)
        {
            _gl.uniform4fv(_program.lightSource[index].specular, new Float32Array(desc.specular.v()));
        }

        // constant attenuation
        if (desc.validMembersMask & LIGHTDESC_CONSTANT_ATT_BIT)
        {
            _gl.uniform1f(_program.lightSource[index].constantAttenuation, desc.constantAttenuation);
        }

        // linear attenuation
        if (desc.validMembersMask & LIGHTDESC_LINEAR_ATT_BIT)
        {
            _gl.uniform1f(_program.lightSource[index].linearAttenuation, desc.linearAttenuation);
        }

        // quadratic attenuation
        if (desc.validMembersMask & LIGHTDESC_QUADRATIC_ATT_BIT)
        {
            _gl.uniform1f(_program.lightSource[index].quadraticAttenuation, desc.quadraticAttenuation);
        }

        // range
        if (desc.validMembersMask & LIGHTDESC_RANGE_BIT)
        {
            // TODO
            _gl.uniform1f(_program.lightSource[index].range, desc.range);
        }

        // outer cone angle
        if (desc.validMembersMask & LIGHTDESC_OUTER_CONE_DEG_BIT)
        {
            var outerConeDegrees = desc.outerConeDegrees;

            // OpenGL accepts cone degrees in the range [0, 90] or 180
            if (outerConeDegrees > 90)
            {
                outerConeDegrees = 180;
            }

            _gl.uniform1f(_program.lightSource[index].spotCutoff, outerConeDegrees);

            _gl.uniform1f(_program.lightSource[index].spotExponent, 0);
        }

        // inner cone angle
        if (desc.validMembersMask & LIGHTDESC_INNER_CONE_DEG_BIT)
        {
            // TODO
        }

        // cone falloff
        if (desc.validMembersMask & LIGHTDESC_CONE_FALLOFF_BIT)
        {
            // TODO
        }

        _vLights[index] = desc;
        _vLightMatrices[index] = worldMatrix;
    }

    this.setModelID = function(id)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetModelID, [id]);
        
        _gl.uniform1i(_program.modelID, id);
    }
    
    this.setShadeModel = function(model)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetShadeModel, [model]);
        
        // TODO
    }
    
    this.setShadowCasterWorldPosition = function(x, y, z)
    {
        _gl.uniform3fv(_program.shadowCasterWorldPosition, new Float32Array([x, y, z]));
    }
    
    this.setStencilFunc = function(func, ref, mask)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetStencilFunc, [func, ref, mask]);
        
        var gl_StencilFunc;
        switch (func)
        {
        case eDepthFunc.Never:          gl_StencilFunc = _gl.NEVER; break;
        case eDepthFunc.Less:           gl_StencilFunc = _gl.LESS; break;
        case eDepthFunc.LessEqual:      gl_StencilFunc = _gl.LEQUAL; break;
        case eDepthFunc.Equal:          gl_StencilFunc = _gl.EQUAL; break;
        case eDepthFunc.NotEqual:       gl_StencilFunc = _gl.NOTEQUAL; break;
        case eDepthFunc.GreaterEqual:   gl_StencilFunc = _gl.GEQUAL; break;
        case eDepthFunc.Greater:        gl_StencilFunc = _gl.GREATER; break;
        case eDepthFunc.Always:         gl_StencilFunc = _gl.ALWAYS; break;
        }
        
        _gl.stencilFunc(gl_StencilFunc, ref, mask);
    }
            
    this.setStencilMask = function(mask)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetStencilMask, [mask]);
        
        _gl.stencilMask(mask);
    } 
    
    this.setStencilOp = function(fail, zFail, zPass)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetStencilOp, [fail, zFail, zPass]);
       
        var gl_Fail;
        switch (fail)
        {
        case eStencilOp.Keep:           gl_Fail = _gl.KEEP; break;
        case eStencilOp.Replace:        gl_Fail = _gl.REPLACE; break;
        case eStencilOp.Increment:      gl_Fail = _gl.INCR; break;
        case eStencilOp.Decrement:      gl_Fail = _gl.DECR; break;
        case eStencilOp.Invert:         gl_Fail = _gl.INVERT; break;
        case eStencilOp.Zero:           gl_Fail = _gl.ZERO; break;
        }
        
        switch (zFail)
        {
        case eStencilOp.Keep:           gl_ZFail = _gl.KEEP; break;
        case eStencilOp.Replace:        gl_ZFail = _gl.REPLACE; break;
        case eStencilOp.Increment:      gl_ZFail = _gl.INCR; break;
        case eStencilOp.Decrement:      gl_ZFail = _gl.DECR; break;
        case eStencilOp.Invert:         gl_ZFail = _gl.INVERT; break;
        case eStencilOp.Zero:           gl_ZFail = _gl.ZERO; break;
        }
        
        switch (zPass)
        {
        case eStencilOp.Keep:           gl_ZPass = _gl.KEEP; break;
        case eStencilOp.Replace:        gl_ZPass = _gl.REPLACE; break;
        case eStencilOp.Increment:      gl_ZPass = _gl.INCR; break;
        case eStencilOp.Decrement:      gl_ZPass = _gl.DECR; break;
        case eStencilOp.Invert:         gl_ZPass = _gl.INVERT; break;
        case eStencilOp.Zero:           gl_ZPass = _gl.ZERO; break;
        }
        
        _gl.stencilOp(gl_Fail, gl_ZFail, gl_ZPass);
    }
    
    this.setTextureBlendFactor = function(factor)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetTextureBlendFactor, [factor]);
        
        // update material diffuse component alpha to blend factor
        var diffuse = [ this.frontMaterial.diffuse.r, this.frontMaterial.diffuse.g, this.frontMaterial.diffuse.b, factor ];
        _gl.uniform4fv(_program.frontMaterial.diffuse, new Float32Array(diffuse));
    }
    
    this.setTextureBlendOp = function(op)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetTextureBlendOp, [op]);
        
        _gl.uniform1i(_program.textureBlendOp, op);
    }
    
    this.setTextureColorMask = function(r, g, b, a)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetTextureColorMask, [r, g, b, a]);
        
        var values = [ r, g, b, a ];
        
        _gl.uniform4fv(_program.textureColorMask, new Float32Array(values));   
    }
    
    this.setViewport = function(x, y, width, height)
    {
        if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.SetViewport, [x, y, width, height]);
        
        _gl.viewport(x, y, width, height);
        _viewport.load(x, y, width, height);
    }
    
    this.useProgram = function(program)
    {
        //if (this.displayListObj) DL_ADD_METHOD_DESC(this.displayListObj, eRenderContextMethod.UseProgram, [_program]);
        
        if (_program != program)
        {
            if (_program)
            {
                _program.disableVertexAttribArrays();
            }
            
            _gl.useProgram(program.getGLProgram());
            _program = program;
            
            if (_program)
            {
                _program.enableVertexAttribArrays();
                
                // restore states that don't translate between program switches
                this.setGlobalIllumination(this.globalIllumination);
                
                // get enabled states
                _enabledCaps.alphaBlend = _gl.getParameter(_gl.BLEND);
                _enabledCaps.cullBackFace = _gl.getParameter(_gl.CULL_FACE);
                _enabledCaps.depthTest = _gl.getParameter(_gl.DEPTH_TEST);
                _enabledCaps.depthBufferWrite = _gl.getParameter(_gl.DEPTH_WRITEMASK);
                _enabledCaps.lighting = _gl.getUniform(_program.getGLProgram(), _program.lightingEnabled);
                _enabledCaps.stencilTest = _gl.getParameter(_gl.STENCIL_TEST);  
            }
        }
    }
}

function getWebGLContext(canvas, debug) 
{
    var _gl = null;
    try 
    {
        if (debug)
        {
            _gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("experimental-webgl", { stencil: true, antialias: false, preserveDrawingBuffer: true }));
        }
        else // !debug
        {
            _gl = (canvas.getContext("webgl", { stencil: true, antialias: true, preserveDrawingBuffer: true }) || 
                  canvas.getContext("experimental-webgl", { stencil: true, antialias: true, preserveDrawingBuffer: true }));
        }
    }    
    catch (e) 
    {
    }
    if (!_gl) 
    {
        var div = document.createElement("div");
        div.innerHTML = "This demo requires a WebGL-enabled browser.";
        var canvasParent = canvas.parentNode;
        canvasParent.replaceChild(div, canvas);
    }

    var stencilBits = _gl.getParameter(_gl.STENCIL_BITS);

    return _gl;
}
