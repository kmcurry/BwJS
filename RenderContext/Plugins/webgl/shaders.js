var eShaderType =
{
    VertexLighting: 0,
    FragmentLighting: 1
};

function getShaders(gl, type)
{
    var source_vs = null;
    var source_fs = null;
    
    switch (type)
    {
        case eShaderType.VertexLighting:
            {
                source_vs = [
                    "#ifdef GL_ES",
                    "precision highp float;",
                    "#endif",
                    "",
                    "vec4 gAmbient;",
                    "vec4 gDiffuse;",
                    "vec4 gSpecular;",
                    "",
                    "attribute vec3 aVertexPosition;",
                    "attribute vec3 aVertexNormal;",
                    "attribute vec2 aTextureCoord0;",   // attributes cannot be arrays and must be specified
                    "attribute vec2 aTextureCoord1;",   // attributes cannot be arrays and must be specified      
                    "", 
                    "uniform mat4 uProjectionMatrix;",
                    "uniform mat4 uModelViewMatrix;",
                    "uniform mat4 uNormalMatrix;",
                    "",
                    "uniform vec4 uGlobalAmbientLight;",
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
                    "uniform vec4 uFrontMaterial_ambient;",
                    "uniform vec4 uFrontMaterial_diffuse;",
                    "uniform vec4 uFrontMaterial_specular;",
                    "uniform vec4 uFrontMaterial_emission;",
                    "uniform float uFrontMaterial_shininess;",
                    "",
                    "uniform int uLightingEnabled;",
                    "",
                    "varying vec4 vLightingFactor;",
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
                    "   vec4 vertexPosition;",
                    "   vec4 transformedNormal;",
                    "   vec4 viewPosition;",
                    "   vec4 viewDirection;",
                    "",
                    "   if (uLightingEnabled != 0)",
                    "   {",
                    "       vertexPosition = uModelViewMatrix * vec4(aVertexPosition, 1);",
                    "       transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 0));",
                    "       viewPosition = uModelViewMatrix * vec4(0, 0, 0, 1);",
                    "       viewDirection = normalize(-viewPosition);",
                    
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
                    "                       normalize(vec3(transformedNormal)),",
                    "                       normalize(vec3(viewDirection) + vec3(uLightSource_position[i])));",
                    "               }",
                    "               else if (uLightSource_spotCutoff[i] > 90.0)", // point light
                    "               {",
                    "                   pointLight(uLightSource_position[i], uLightSource_constantAttenuation[i],",
                    "                       uLightSource_linearAttenuation[i], uLightSource_quadraticAttenuation[i],",
                    "                       uLightSource_ambient[i], uLightSource_diffuse[i], uLightSource_specular[i],",
                    "                       normalize(vec3(transformedNormal)),",
                    "                       vec3(viewDirection), vec3(vertexPosition));",
                    "               }",
                    "               else", // spotlight
                    "               {",
                    "               }",   
                    "           }",
                    "       }",
                    "",
                    "       vLightingFactor  = uGlobalAmbientLight * uFrontMaterial_ambient;", // global ambient contribution
                    "       vLightingFactor += gAmbient + gDiffuse + gSpecular;", // light contribution(s)
                    "       vLightingFactor.a = uFrontMaterial_ambient.a / 3.0 + ",
                    "                           uFrontMaterial_diffuse.a / 3.0 + ",
                    "                           uFrontMaterial_specular.a / 3.0;",
                    "   }",
                    "   else", // uLightingEnabled == 0
                    "   {",
                    "",     // TODO: use vertex color
                    "       vLightingFactor = vec4(1, 1, 1, 1);",
                    "   }",
                    "",
                    "   vTextureCoord[0] = aTextureCoord0;",
                    "   vTextureCoord[1] = aTextureCoord1;",        
                    "   gl_Position = uProjectionMatrix * vertexPosition;",
                    "}"
                    ].join("\n");
                    
                source_fs = [
                    "#ifdef GL_ES",
                    "precision highp float;",
                    "#endif",
                    "",
                    "uniform int uTexturesEnabled;",
                    "uniform int uTextureStageEnabled[" + gl_MaxTextureStages + "];",       
                    "uniform sampler2D uTextureSamplerColor[" + gl_MaxTextureStages + "];",
                    "uniform sampler2D uTextureSamplerAlpha[" + gl_MaxTextureStages + "];",
                    "uniform int uTextureBlendOp;",
                    "",
                    "varying vec4 vLightingFactor;",
                    "varying vec2 vTextureCoord[" + gl_MaxTextureStages + "];",
                    "",
                    "void main()",
                    "{",
                    "   vec4 fragmentColor;",
                    "   vec4 fragmentColor1;",
                    "   vec4 fragmentColor2;",
                    "   if (uTexturesEnabled == 1 && uTextureStageEnabled[0] == 1 && uTextureStageEnabled[1] == 0)",
                    "   {",
                    "       fragmentColor = texture2D(uTextureSamplerColor[0], vec2(vTextureCoord[0].s, vTextureCoord[0].t));",
                    "       if (uTextureBlendOp == " + RC_MODULATE + ")",
                    "       {",
                    "           if (fragmentColor.a == 0.0) discard;",
                    "           else gl_FragColor = fragmentColor * vLightingFactor;",
                    "           gl_FragColor = vec4(gl_FragColor.r, gl_FragColor.g, gl_FragColor.b, fragmentColor.a);",
                    "       }",
                    "       else if (uTextureBlendOp == " + RC_REPLACE + ")",
                    "       {",
                    "           gl_FragColor = fragmentColor;",
                    "       }",
                    "       else",
                    "       {",
                    "           fragmentColor = vec4(1, 1, 1, 1);",
                    "           gl_FragColor = fragmentColor * vLightingFactor;",
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
                    "           else gl_FragColor = fragmentColor1 * vLightingFactor;",
                    "           gl_FragColor = vec4(gl_FragColor.r, gl_FragColor.g, gl_FragColor.b, fragmentColor1.a);",
                    "       }",
                    "       else if (uTextureBlendOp == " + RC_REPLACE + ")",
                    "       {",
                    "           gl_FragColor = fragmentColor1 * fragmentColor2;",
                    "       }",
                    "       else",
                    "       {",
                    "           fragmentColor = vec4(1, 1, 1, 1);",
                    "           gl_FragColor = fragmentColor * vLightingFactor;",
                    "       }",
                    "   }",
                    "   else", // uTexturesEnabled == 0
                    "   {",
                    "       fragmentColor = vec4(1, 1, 1, 1);",
                    "       gl_FragColor = fragmentColor * vLightingFactor;",
                    "   }",
                    "}"
                    ].join("\n");
            }
            break;
            
        case eShaderType.FragmentLighting:
            {
                source_vs = [
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
                
                source_fs = [
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
            }
            break;
        
        default:
            return { vertex: null, fragment: null };
            break;
    }
    
    var vs = gl.createShader(gl.VERTEX_SHADER); 
    if (vs)
    {
        gl.shaderSource(vs, source_vs);
        gl.compileShader(vs);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(vs));
        }
    }
    
    var fs = gl.createShader(gl.FRAGMENT_SHADER); 
    if (fs) 
    {
        gl.shaderSource(fs, source_fs);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(fs));
        }
    }
                    
    return { vertex: vs, fragment: fs };
}