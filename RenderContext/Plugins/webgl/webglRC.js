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

var gl_MaxLights = 8;

function gl_MaterialParameters()
{
    var ambient;
    var diffuse;
    var specular;
    var emission;
    var shininess; 
}

var gl_MaxTextureStages = 2;

webglRC.prototype = new RenderContext();
webglRC.prototype.constructor = webglRC;

function webglRC(canvas, background)
{
    //
    // initialization
    //
    
    RenderContext.call(this, canvas, background);
    
    var gl = getWebGLContext(canvas, false /*set to true for debug context*/);
    if (!gl) return;

    gl.clearColor(0, 0, 0, background ? 0 : 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.frontFace(gl.CW);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
   
    // create shaders
    var vShader = getVertexShader(gl);
    if (!vShader) return;
    var fShader = getFragmentShader(gl);
    if (!fShader) return;

    // create program
    var program = getProgram(gl, vShader, fShader);
    if (!program) return;

    // set valid flag
    this.valid = true;

    // misc private members
    var vLightDescs = [];
    var vLightMatrices = [];
    var vLightEnabledStates = [];
    
    //
    // methods
    //
    
    this.applyModelViewTransform = function()
    {
        gl.uniformMatrix4fv(program.modelViewMatrix, false, new Float32Array(this.modelViewMatrixStack.top().flatten()));

        var normalMatrix = new Matrix4x4();
        normalMatrix.loadMatrix(this.modelViewMatrixStack.top());
        normalMatrix.invert();
        normalMatrix.transpose();
        gl.uniformMatrix4fv(program.normalMatrix, false, new Float32Array(normalMatrix.flatten()));
    }
    
    this.applyProjectionTransform = function()
    {
        gl.uniformMatrix4fv(program.projectionMatrix, false, new Float32Array(this.projectionMatrixStack.top().flatten()));
    }
    
    this.clear = function()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// | gl.STENCIL_BUFFER_BIT);
    }

    this.clearColor = function(r, g, b, a)
    {
        gl.clearColor(r, g, b, a);
    }
    
    this.createVertexBuffer = function(numVerticesPerPrimitive)
    {
        return new webglVB(gl, program, numVerticesPerPrimitive);
    }
    
    this.createTextureObject = function()
    {
        return new webglTO(gl, program);
    }

    this.disable = function(cap)
    {
        switch (cap)
        {
            case eRenderMode.AlphaBlend:
                gl.disable(gl.BLEND);
                break;

            case eRenderMode.CullBackFace:
                gl.disable(gl.CULL_FACE);
                break;

            case eRenderMode.DepthBufferWrite:
                gl.depthMask(false);
                break;

            case eRenderMode.DepthTest:
                gl.disable(gl.DEPTH_TEST);
                break;

            case eRenderMode.Lighting:
                gl.uniform1i(program.lightingEnabled, false); 
                break;
        }
    }

    this.enable = function(cap)
    {
        switch (cap)
        {
            case eRenderMode.AlphaBlend:
                gl.enable(gl.BLEND);
                break;

            case eRenderMode.CullBackFace:
                gl.enable(gl.CULL_FACE);
                break;

            case eRenderMode.DepthBufferWrite:
                gl.depthMask(true);
                break;

            case eRenderMode.DepthTest:
                gl.enable(gl.DEPTH_TEST);
                break;

            case eRenderMode.Lighting:
                gl.uniform1i(program.lightingEnabled, true);
                break;
        }
    }

    this.enabled = function(cap)
    {
        var e = false;

        switch (cap)
        {
            case eRenderMode.AlphaBlend:
                e = gl.getParameter(gl.BLEND);
                break;

            case eRenderMode.CullBackFace:
                e = gl.getParameter(gl.CULL_FACE);
                break;
                
            case eRenderMode.DepthBufferWrite:
                e = gl.getParameter(gl.DEPTH_WRITEMASK);
                break;

            case eRenderMode.DepthTest:
                e = gl.getParameter(gl.DEPTH_TEST);
                break;

            case eRenderMode.Lighting:
                e = gl.getUniform(program, program.lightingEnabled);
                break;
        }

        return e;
    }

    this.enableLight = function(index, enable)
    {
        gl.uniform1i(program.lightSource[index].enabled, enable);

        vLightEnabledStates[index] = enable;
    }
    
    this.enableTextureStage = function(stage, enable)
    {
        gl.uniform1i(program.textureStageEnabled[stage], enable);
    }
    
    this.finish = function()
    {
        gl.finish();
    }

    this.getEnabledLights = function()
    {
        var indices = [];

        for (var i = 0; i < vLightEnabledStates.length; i++)
        {
            if (vLightEnabledStates[i])
            {
                indices.push(i);
            }
        }

        return indices;
    }

    this.getGlobalIllumination = function()
    {
        var values = gl.getUniform(program, program.globalAmbientLight);

        return { r: values[0], g: values[1], b: values[2], a: values[3] };
    }
    
    this.getLight = function(index)
    {
        return { desc: vLightDescs[index], matrix: vLightMatrices[index] };
    }
    
    this.getMaxLightCount = function()
    {
        return gl_MaxLights;
    }
    
    this.getMaxTextureStages = function()
    {
        return gl_MaxTextureStages;
    }
    
    this.perspectiveMatrixLH = function(left, right, top, bottom, near, far)
    {
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
        var p = new Matrix4x4();
        
        p._11 =  2 / (right - left);
        p._22 =  2 / (top - bottom);
        p._33 = -2 / (far - near);
        p._41 = -((right + left) / (right - left));
        p._42 = -((top + bottom) / (top - bottom));
        p._43 = -((far + near) / (far - near)) / 2;
              
        return p;
    }
    
    this.setBlendFactor = function(sfactor, dfactor)
    {
        var gl_SrcFactor;
        switch (sfactor)
        {
        case RC_ZERO:                   gl_SrcFactor = gl.ZERO; break;
        case RC_ONE:                    gl_SrcFactor = gl.ONE; break;
        case RC_SRC_COLOR:              gl_SrcFactor = gl.SRC_COLOR; break;
        case RC_SRC_ALPHA:              gl_SrcFactor = gl.SRC_ALPHA; break;        
        case RC_ONE_MINUS_SRC_COLOR:    gl_SrcFactor = gl.ONE_MINUS_SRC_COLOR; break;
        case RC_ONE_MINUS_SRC_ALPHA:    gl_SrcFactor = gl.ONE_MINUS_SRC_ALPHA; break;
        case RC_DEST_COLOR:             gl_SrcFactor = gl.DEST_COLOR; break;
        case RC_DEST_ALPHA:             gl_SrcFactor = gl.DEST_ALPHA; break;        
        case RC_ONE_MINUS_DEST_COLOR:   gl_SrcFactor = gl.ONE_MINUS_DEST_COLOR; break;
        case RC_ONE_MINUS_DEST_ALPHA:   gl_SrcFactor = gl.ONE_MINUS_DEST_ALPHA; break;
        }     
        
        var gl_DestFactor;
        switch (dfactor)
        {
        case RC_ZERO:                   gl_DestFactor = gl.ZERO; break;
        case RC_ONE:                    gl_DestFactor = gl.ONE; break;
        case RC_SRC_COLOR:              gl_DestFactor = gl.SRC_COLOR; break;
        case RC_SRC_ALPHA:              gl_DestFactor = gl.SRC_ALPHA; break;        
        case RC_ONE_MINUS_SRC_COLOR:    gl_DestFactor = gl.ONE_MINUS_SRC_COLOR; break;
        case RC_ONE_MINUS_SRC_ALPHA:    gl_DestFactor = gl.ONE_MINUS_SRC_ALPHA; break;
        case RC_DEST_COLOR:             gl_DestFactor = gl.DEST_COLOR; break;
        case RC_DEST_ALPHA:             gl_DestFactor = gl.DEST_ALPHA; break;        
        case RC_ONE_MINUS_DEST_COLOR:   gl_DestFactor = gl.ONE_MINUS_DEST_COLOR; break;
        case RC_ONE_MINUS_DEST_ALPHA:   gl_DestFactor = gl.ONE_MINUS_DEST_ALPHA; break;
        }
        
        gl.blendFunc(gl_SrcFactor, gl_DestFactor);  
    }

    this.setEnabledLights = function(indices)
    {
        // disable all previously enabled lights
        for (var i = 0; i < vLightEnabledStates.length; i++)
        {
            if (vLightEnabledStates[i])
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
        // ambient
        if (desc.validMembersMask & MATERIALDESC_AMBIENT_BIT)
        {
            gl.uniform4fv(program.frontMaterial.ambient, new Float32Array(desc.ambient.v()));
            
            this.frontMaterial.ambient = desc.ambient;
        }
        
        // diffuse
        if (desc.validMembersMask & MATERIALDESC_DIFFUSE_BIT)
        {
            gl.uniform4fv(program.frontMaterial.diffuse, new Float32Array(desc.diffuse.v()));
            
            this.frontMaterial.diffuse = desc.diffuse;
        }
        
        // specular
        if (desc.validMembersMask & MATERIALDESC_SPECULAR_BIT)
        {
            gl.uniform4fv(program.frontMaterial.specular, new Float32Array(desc.specular.v()));
            
            this.frontMaterial.specular = desc.specular;
        }
        
        // emissive
        if (desc.validMembersMask & MATERIALDESC_EMISSIVE_BIT)
        {
            // TODO
            //gl.uniform4fv(program.frontMaterial.emission, new Float32Array(desc.emissive.v()));
            
            this.frontMaterial.emissive = desc.emissive;
        }
        
        // glossiness
        if (desc.validMembersMask & MATERIALDESC_GLOSSINESS_BIT)
        {
            // glossiness - OpenGL accepts values in the range [0, 128].
            // use the range [5, 128], because values below 5 result in wash-out
            gl.uniform1f(program.frontMaterial.shininess, clamp(desc.glossiness * 128, 5, 128));
            
            this.frontMaterial.glossiness = desc.glossiness;
        }
        
        this.frontMaterial.validMembersMask |= desc.validMembersMask;
    }

    this.setGlobalIllumination = function(ambient)
    {
        var values = [ ambient.r, ambient.g, ambient.g, ambient.a ];

        gl.uniform4fv(program.globalAmbientLight, new Float32Array(values));
    }

    this.setLight = function(index, desc)
    {
        // get current modelView transform
        var modelViewMatrix = this.modelViewMatrixStack.top();

        // position
        if (desc.validMembersMask & LIGHTDESC_POSITION_BIT)
        {
            // transform to view space
            var position = modelViewMatrix.transformw(desc.position.x, desc.position.y, desc.position.z, 1);
            var values = [position.x, position.y, position.z, position.w];
            gl.uniform4fv(program.lightSource[index].position, new Float32Array(values));
        }

        // direction
        if (desc.validMembersMask & LIGHTDESC_DIRECTION_BIT)
        {
            // transform to view space
            var direction = modelViewMatrix.transform(desc.direction.x, desc.direction.y, desc.direction.z, 0);
            var values = [direction.x, direction.y, direction.z, 0];

            switch (desc.type)
            {
                case "directional":
                    {
                        values[0] *= -1;
                        values[1] *= -1;
                        values[2] *= -1;

                        // OpenGL gets a directional light's direction from position member                
                        gl.uniform4fv(program.lightSource[index].position, new Float32Array(values));
                    }
                    break;

                case "spot":
                    {
                        gl.uniform4fv(program.lightSource[index].spotDirection, new Float32Array(values));
                    }
                    break;
            }
        }

        // ambient
        if (desc.validMembersMask & LIGHTDESC_AMBIENT_BIT)
        {
            gl.uniform4fv(program.lightSource[index].ambient, new Float32Array(desc.ambient.v()));
        }

        // diffuse
        if (desc.validMembersMask & LIGHTDESC_DIFFUSE_BIT)
        {
            gl.uniform4fv(program.lightSource[index].diffuse, new Float32Array(desc.diffuse.v()));
        }

        // specular
        if (desc.validMembersMask & LIGHTDESC_SPECULAR_BIT)
        {
            gl.uniform4fv(program.lightSource[index].specular, new Float32Array(desc.specular.v()));
        }

        // constant attenuation
        if (desc.validMembersMask & LIGHTDESC_CONSTANT_ATT_BIT)
        {
            gl.uniform1f(program.lightSource[index].constantAttenuation, desc.constantAttenuation);
        }

        // linear attenuation
        if (desc.validMembersMask & LIGHTDESC_LINEAR_ATT_BIT)
        {
            gl.uniform1f(program.lightSource[index].linearAttenuation, desc.linearAttenuation);
        }

        // quadratic attenuation
        if (desc.validMembersMask & LIGHTDESC_QUADRATIC_ATT_BIT)
        {
            gl.uniform1f(program.lightSource[index].quadraticAttenuation, desc.quadraticAttenuation);
        }

        // range
        if (desc.validMembersMask & LIGHTDESC_RANGE_BIT)
        {
            // TODO
            //gl.uniform1f(program.lightSource[index].range, desc.range);
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

            gl.uniform1f(program.lightSource[index].spotCutoff, outerConeDegrees);

            gl.uniform1f(program.lightSource[index].spotExponent, 0);
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

        vLightDescs[index] = desc;
        vLightMatrices[index] = modelViewMatrix;
    }

    this.setTextureBlendFactor = function(factor)
    {
        // update material diffuse component alpha to blend factor
        var diffuse = [ this.frontMaterial.diffuse.r, this.frontMaterial.diffuse.g, this.frontMaterial.diffuse.b, factor ];
        gl.uniform4fv(program.frontMaterial.diffuse, new Float32Array(diffuse));
    }
    
    this.setTextureBlendOp = function(op)
    {
        gl.uniform1i(program.textureBlendOp, op);
    }

    this.setViewport = function(x, y, width, height)
    {
        gl.viewport(x, y, width, height);
    }
}

function getWebGLContext(canvas, debug) 
{
    var gl = null;
    try 
    {
        if (debug)
        {
            gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("experimental-webgl", {antialias : false}));
        }
        else // !debug
        {
            gl = canvas.getContext("experimental-webgl", {antialias : true});
        }
    }    
    catch (e) 
    {
    }
    if (!gl) 
    {
        var div = document.createElement("div");
        div.innerHTML = "This demo requires a WebGL-enabled browser.";
        var canvasParent = canvas.parentNode;
        canvasParent.replaceChild(div, canvas);
    }

    return gl;
}

function getVertexShader(gl)
{
    var shader = gl.createShader(gl.VERTEX_SHADER); 
    if (!shader) return null;

    var source = [
        "attribute vec3 aVertexPosition;",
        "attribute vec3 aVertexNormal;",
        "attribute vec2 aTextureCoord0;",   // attributes cannot be arrays and must be specified
        "attribute vec2 aTextureCoord1;",   // attributes cannot be arrays and must be specified      
        "", 
        "uniform mat4 uProjectionMatrix;",
        "uniform mat4 uModelViewMatrix;",
        "uniform mat4 uNormalMatrix;",
        "",
        "varying vec4 vVertexPosition;",
        "varying vec4 vTransformedNormal;",
        "varying vec4 vViewPosition;",
        "varying vec4 vViewDirection;",
        "varying vec2 vTextureCoord[" + gl_MaxTextureStages + "];",
        "",
        "void main()",
        "{",
        "   vVertexPosition = uModelViewMatrix * vec4(aVertexPosition, 1);",
        "   vTransformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 0));",
        "   vViewPosition = uModelViewMatrix * vec4(0, 0, 0, 1);",
        "   vViewDirection = normalize(-vViewPosition);",
        "   vTextureCoord[0] = aTextureCoord0;",
        "   vTextureCoord[1] = aTextureCoord1;",        
        "   gl_Position = uProjectionMatrix * vVertexPosition;",
        "}"
        ].join("\n");
        
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    
    return shader;
}

function getFragmentShader(gl)
{
    var shader = gl.createShader(gl.FRAGMENT_SHADER); 
    if (!shader) return null;

    var source = [
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "",
        "vec4 gAmbient;",
        "vec4 gDiffuse;",
        "vec4 gSpecular;",
        "",
        "uniform vec4 uGlobalAmbientLight;",
        "",
//        IE 11 doesn't currently support structs
//        "struct lightSourceParameters",
//        "{",
//        "   int enabled;",
//        "   vec4 ambient;",
//        "   vec4 diffuse;",
//        "   vec4 specular;",
//        "   vec4 position;",
//        "   vec4 halfVector;",
//        "   vec4 spotDirection;",
//        "   float spotExponent;",
//        "   float spotCutoff;",
//        "   float spotCosCutoff;",
//        "   float constantAttenuation;",
//        "   float linearAttenuation;",
//        "   float quadraticAttenuation;",
//        "};",
//        "",
//        "uniform lightSourceParameters uLightSource[" + gl_MaxLights + "];",
        "",
        "uniform int uLightSource_enabled[" + gl_MaxLights + "];",
        "uniform vec4 uLightSource_ambient["  + gl_MaxLights + "];",
        "uniform vec4 uLightSource_diffuse["  + gl_MaxLights + "];",
        "uniform vec4 uLightSource_specular["  + gl_MaxLights + "];",
        "uniform vec4 uLightSource_position["  + gl_MaxLights + "];",
        "uniform vec4 uLightSource_halfVector["  + gl_MaxLights + "];",
        "uniform vec4 uLightSource_spotDirection["  + gl_MaxLights + "];",
        "uniform float uLightSource_spotExponent["  + gl_MaxLights + "];",
        "uniform float uLightSource_spotCutoff["  + gl_MaxLights + "];",
        "uniform float uLightSource_spotCosCutoff["  + gl_MaxLights + "];",
        "uniform float uLightSource_constantAttenuation["  + gl_MaxLights + "];",
        "uniform float uLightSource_linearAttenuation["  + gl_MaxLights + "];",
        "uniform float uLightSource_quadraticAttenuation["  + gl_MaxLights + "];",
        "",
//        IE 11 doesn't currently support structs
//        "struct materialParameters",
//        "{",
//        "   vec4 ambient;",
//        "   vec4 diffuse;",
//        "   vec4 specular;",
//        "   vec4 emission;",
//        "   float shininess;",
//        "};",
//        "",
//        "uniform materialParameters uFrontMaterial;",
        "uniform vec4 uFrontMaterial_ambient;",
        "uniform vec4 uFrontMaterial_diffuse;",
        "uniform vec4 uFrontMaterial_specular;",
        "uniform vec4 uFrontMaterial_emission;",
        "uniform float uFrontMaterial_shininess;",
        "",
        "uniform int uLightingEnabled;",
        "uniform int uTexturesEnabled;",
        "uniform int uTextureStageEnabled[" + gl_MaxTextureStages + "];",       
        "uniform sampler2D uTextureSamplerColor[" + gl_MaxTextureStages + "];",
        "uniform sampler2D uTextureSamplerAlpha[" + gl_MaxTextureStages + "];",
        "uniform int uTextureBlendOp;",
        "",
        "varying vec4 vVertexPosition;",
        "varying vec4 vTransformedNormal;",
        "varying vec4 vViewPosition;",
        "varying vec4 vViewDirection;",
        "varying vec2 vTextureCoord[" + gl_MaxTextureStages + "];",
        "",
        "void directionalLight(vec4 position, vec4 ambient, vec4 diffuse, vec4 specular, vec3 normal, vec3 halfVector)",
        "{",
        "   vec3 lightDir;",
        "   float nDotL;",      // normal . light direction
        "   float nDotHV;",     // normal . half-vector
        "   float pf;",         // power factor
        "",
	"   lightDir = normalize(vec3(position));",
        "",	
	"   nDotL = max(dot(normal, lightDir), 0.0);",
	"   if (nDotL == 0.0)",
        "   {",
        "       pf = 0.0;",
        "   }",
        "   else",
        "   {",
        "       nDotHV = max(0.0, dot(normal, halfVector));",
        "       pf = pow(nDotHV, uFrontMaterial_shininess);",
        "   }",
        "",
        "   gAmbient  += ambient * uFrontMaterial_ambient;",
        "   gDiffuse  += diffuse * uFrontMaterial_diffuse * nDotL;",
        "   gSpecular += specular * uFrontMaterial_specular * pf;",
        "}",
        "",
        "void pointLight(vec4 position, float constantAttenuation, float linearAttenuation, float quadraticAttenuation,",
        "                vec4 ambient, vec4 diffuse, vec4 specular, vec3 normal, vec3 eye, vec3 vPosition)",
        "{",
        "   float nDotL;",      // normal . light direction
        "   float nDotHV;",     // normal . light half vector
        "   float pf;",         // power factor
        "   float attenuation;",// computed attenuation factor
        "   float d;",          // distance from surface to light source
        "   vec3  L;",          // direction from surface to light position
        "   vec3  halfVector;", //
        "",
        "", // Compute vector from surface to light position
        "   L = vec3(position) - vPosition;",
        "",
        "", // Compute distance between surface and light position
        "   d = length(L);",
        "",
        "", // Normalize the vector from surface to light position,
        "   L = normalize(L);",
        "",
        "", // Compute attenuation,
        "   attenuation = 1.0 / (constantAttenuation +",
        "      linearAttenuation * d +",
        "      quadraticAttenuation * d * d);",
        "",
        "   nDotL = max(0.0, dot(normal, L));",
        "   nDotHV = max(0.0, dot(normal, normalize(L + eye)));",
        "",
        "   if (nDotL == 0.0)",
        "   {",
        "       pf = 0.0;",
        "   }",
        "   else",
        "   {",
        "       pf = pow(nDotHV, uFrontMaterial_shininess);",
        "   }",
        "",    
        "   gAmbient  += ambient * uFrontMaterial_ambient * attenuation;",
        "   gDiffuse  += diffuse * uFrontMaterial_diffuse * nDotL * attenuation;",
        "   gSpecular += specular * uFrontMaterial_specular * pf * attenuation;",
        "}",
        "",
        "void main()",
        "{",
        "   vec4 lightingFactor;",
        "   if (uLightingEnabled != 0)",
        "   {",
        "       gAmbient = vec4(0, 0, 0, 0);",
        "       gDiffuse = vec4(0, 0, 0, 0);",
        "       gSpecular = vec4(0, 0, 0, 0);",
        "",
        "       for (int i=0; i < " + gl_MaxLights + "; i++)",
        "       {",
        "           if (uLightSource_enabled[i] != 0)",
        "           {",
        "               if (uLightSource_position[i][3] == 0.0)", // directional light
        "               {",
        "                   directionalLight(uLightSource_position[i], uLightSource_ambient[i],",
        "                       uLightSource_diffuse[i], uLightSource_specular[i],",
        "                       normalize(vec3(vTransformedNormal)),",
        "                       normalize(vec3(vViewDirection) + vec3(uLightSource_position[i])));",
        "               }",
        "               else if (uLightSource_spotCutoff[i] > 90.0)", // point light
        "               {",
        "                   pointLight(uLightSource_position[i], uLightSource_constantAttenuation[i],",
        "                       uLightSource_linearAttenuation[i], uLightSource_quadraticAttenuation[i],",
        "                       uLightSource_ambient[i], uLightSource_diffuse[i], uLightSource_specular[i],",
        "                       normalize(vec3(vTransformedNormal)),",
        "                       vec3(vViewDirection), vec3(vVertexPosition));",
        "               }",
        "               else", // spotlight
        "               {",
        "               }",   
        "           }",
        "       }",
        "",
        "       lightingFactor  = uGlobalAmbientLight * uFrontMaterial_ambient;", // global ambient contribution
        "       lightingFactor += gAmbient + gDiffuse + gSpecular;", // light contribution(s)
        "       lightingFactor.a  = uFrontMaterial_ambient.a / 3.0 + ",
        "                           uFrontMaterial_diffuse.a / 3.0 + ",
        "                           uFrontMaterial_specular.a / 3.0;",
        "   }",
        "   else", // uLightingEnabled == 0
        "   {",
        "",     // TODO: use vertex color
        "       lightingFactor = vec4(1, 1, 1, 1);",
        "   }",
        "",
        "   vec4 fragmentColor;",
        "   vec4 fragmentColor1;",
        "   vec4 fragmentColor2;",
        "   if (uTexturesEnabled == 1 && uTextureStageEnabled[0] == 1 && uTextureStageEnabled[1] == 0)",
        "   {",
        "       fragmentColor = texture2D(uTextureSamplerColor[0], vec2(vTextureCoord[0].s, vTextureCoord[0].t));",
        "       if (uTextureBlendOp == " + RC_MODULATE + ")",
        "       {",
        "           if (fragmentColor.a == 0.0) discard;",
        "           else gl_FragColor = fragmentColor * lightingFactor;",
        "           gl_FragColor = vec4(gl_FragColor.r, gl_FragColor.g, gl_FragColor.b, fragmentColor.a);",
        "       }",
        "       else if (uTextureBlendOp == " + RC_REPLACE + ")",
        "       {",
        "           gl_FragColor = fragmentColor;",
        "       }",
        "       else",
        "       {",
        "           fragmentColor = vec4(1, 1, 1, 1);",
        "           gl_FragColor = fragmentColor * lightingFactor;",
        "       }",
        "   }",
        "   else if (uTexturesEnabled == 1 && uTextureStageEnabled[0] == 1 && uTextureStageEnabled[1] == 1)",
        "   {",
        "       fragmentColor1 = texture2D(uTextureSamplerColor[0], vec2(vTextureCoord[0].s, vTextureCoord[0].t));",
        "       fragmentColor2 = texture2D(uTextureSamplerColor[1], vec2(vTextureCoord[1].s, vTextureCoord[1].t));",
        "       if (uTextureBlendOp == " + RC_MODULATE + ")",
        "       {",
        "           fragmentColor1.a = fragmentColor2.a;",
        "           if (fragmentColor1.a == 0.0) discard;",
        "           else gl_FragColor = fragmentColor1 * lightingFactor;",
        "           gl_FragColor = vec4(gl_FragColor.r, gl_FragColor.g, gl_FragColor.b, fragmentColor1.a);",
        "       }",
        "       else if (uTextureBlendOp == " + RC_REPLACE + ")",
        "       {",
        "           gl_FragColor = fragmentColor1 * fragmentColor2;",
        "       }",
        "       else",
        "       {",
        "           fragmentColor = vec4(1, 1, 1, 1);",
        "           gl_FragColor = fragmentColor * lightingFactor;",
        "       }",
        "   }",
        "   else", // uTexturesEnabled == 0
        "   {",
        "       fragmentColor = vec4(1, 1, 1, 1);",
        "       gl_FragColor = fragmentColor * lightingFactor;",
        "   }",
        "}"
        ].join("\n");
        
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    
    return shader;
}

function getProgram(gl, vShader, fShader)
{
    var program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        alert(gl.getProgramInfoLog(program));
        return null;
    }
    
    gl.useProgram(program);
    
    // get attributes
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
    program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);
    program.textureCoordAttribute = new Array(gl_MaxTextureStages);
    for (var i=0; i < gl_MaxTextureStages; i++)
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
    for (var i=0; i < gl_MaxLights; i++)
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
    for (var i=0; i < gl_MaxTextureStages; i++)
    {
        program.textureSamplerColor[i] = gl.getUniformLocation(program, "uTextureSamplerColor[" + i + "]");
        program.textureSamplerAlpha[i] = gl.getUniformLocation(program, "uTextureSamplerAlpha[" + i + "]");
        program.textureStageEnabled[i] = gl.getUniformLocation(program, "uTextureStageEnabled[" + i + "]");
    }
    program.textureBlendOp = gl.getUniformLocation(program, "uTextureBlendOp");
    
    // enabled
    program.lightingEnabled = gl.getUniformLocation(program, "uLightingEnabled");
    program.texturesEnabled = gl.getUniformLocation(program, "uTexturesEnabled");
    
    // set initially enabled/disabled
    gl.uniform1i(program.lightingEnabled, 1);
    gl.uniform1i(program.texturesEnabled, 1); 
    gl.uniform1i(program.textureStageEnabled[0], 0); 
    gl.uniform1i(program.textureStageEnabled[1], 0);
    
    return program;
}
