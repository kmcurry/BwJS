var pcf_shadow_mapping_render_pass_vs = [
"attribute vec3 aVertexPosition;",
"attribute vec3 aVertexNormal;",
"attribute vec4 aVertexColor;",
"attribute vec2 aTextureCoord0;",   // attributes cannot be arrays and must be specified
"attribute vec2 aTextureCoord1;",   // attributes cannot be arrays and must be specified      
"", 
"uniform mat4 uProjectionMatrix;",
"uniform mat4 uViewMatrix;",
"uniform mat4 uWorldMatrix;",
"uniform mat4 uNormalMatrix;",
"",
"varying vec4 vVertexPosition;",
"varying vec4 vTransformedNormal;",
"varying vec4 vVertexColor;",
"varying vec4 vViewPosition;",
"varying vec4 vViewDirection;",
"varying vec2 vTextureCoord[" + gl_MaxTextureStages + "];",
"",
"void main()",
"{",
"   vVertexPosition = uWorldMatrix * vec4(aVertexPosition, 1);",
"   vTransformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 0));",
"   vVertexColor = aVertexColor;",
"   vViewPosition = uViewMatrix * vec4(0, 0, 0, 1);",
"   vViewDirection = normalize(-vViewPosition);",
"   vTextureCoord[0] = aTextureCoord0;",
"   vTextureCoord[1] = aTextureCoord1;",        
"   gl_Position = uProjectionMatrix * uViewMatrix * vVertexPosition;",
"}"
].join("\n");

var pcf_shadow_mapping_render_pass_fs = [
"#ifdef GL_ES",
"precision highp float;",
"#endif",
"",
"#define EPSILON 0.1",
"",
"vec4 gAmbient;",
"vec4 gDiffuse;",
"vec4 gSpecular;",
"",
"uniform vec4 uGlobalAmbientLight;",                    
"",
"uniform struct",
"{",
"   int enabled;",
"   vec4 ambient;",
"   vec4 diffuse;",
"   vec4 specular;",
"   vec4 position;",
"   vec4 spotDirection;",
"   float spotExponent;",
"   float spotCutoff;",
"   float constantAttenuation;",
"   float linearAttenuation;",
"   float quadraticAttenuation;",
"   float range;",
"} uLightSource[" + gl_MaxLights + "];",
"",
"uniform struct",
"{",
"   vec4 ambient;",
"   vec4 diffuse;",
"   vec4 specular;",
"   vec4 emission;",
"   float shininess;",
"} uFrontMaterial;",
"",
"uniform int uLightingEnabled;",
"uniform int uTexturesEnabled;",
"uniform int uTextureStageEnabled[" + gl_MaxTextureStages + "];",       
"uniform sampler2D uTextureSamplerColor[" + gl_MaxTextureStages + "];",
"uniform sampler2D uTextureSamplerAlpha[" + gl_MaxTextureStages + "];",
"uniform samplerCube uTextureSamplerShadowMap;",
"uniform int uTextureBlendOp;",
"uniform vec4 uTextureColorMask;",
"uniform vec4 uClipPlane[" + gl_MaxClipPlanes + "];",
"uniform int uClipPlaneEnabled[" + gl_MaxClipPlanes + "];",
"uniform vec3 uShadowCasterWorldPosition;",
"uniform int uModelID;",
"",
"varying vec4 vVertexPosition;",
"varying vec4 vTransformedNormal;",
"varying vec4 vVertexColor;",
"varying vec4 vViewPosition;",
"varying vec4 vViewDirection;",
"varying vec2 vTextureCoord[" + gl_MaxTextureStages + "];",
"",
"float shadowFactor(vec3 lightDirection, float cosTheta)",
"{",
"   float distance = length(lightDirection);",
"   lightDirection.y = -lightDirection.y;",
"   vec2 moments = textureCube(uTextureSamplerShadowMap, lightDirection).rg;", 
//"   float moment = textureCube(uTextureSamplerShadowMap, lightDirection).r;",
"",
"   float bias = EPSILON * tan(acos(cosTheta));",
"   if (distance <= moments.x + bias)",
//"   if (distance <= moment + bias)",
"       return 1.0;",
"   else if (abs(float(uModelID) - moments.y) >= 1.0)",
"   {",
//"       float variance = moments.y - (moments.x * moments.x);",
//"       variance = max(variance, 0.07);",
//"",
//"       float d = distance - moments.x;",
//"       float p_max = variance / (variance + d * d);",
//"", 
"       return 0.25;//p_max;",
"   }",
"   else return 1.0;",
"}",
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
"       pf = pow(nDotHV, uFrontMaterial.shininess);",
"   }",
"",
"   gAmbient  += ambient * uFrontMaterial.ambient;",
"   gDiffuse  += diffuse * uFrontMaterial.diffuse * nDotL;",
"   gSpecular += specular * uFrontMaterial.specular * pf;",
"}",
"",
"void pointLight(vec4 position, float constantAttenuation, float linearAttenuation, float quadraticAttenuation, float range,",
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
"", // Compute distance between surface and light position; if greater than range, return
"   d = length(L); if (d > range) return;",
"",
"", // Normalize the vector from surface to light position,
"   L = normalize(L);",
"",
"", // Compute attenuation,
"   attenuation = 1.0 / (constantAttenuation +",
"      linearAttenuation * d +",
"      quadraticAttenuation * d * d) *",
"      shadowFactor(vPosition - uShadowCasterWorldPosition, max(0.0, dot(normal, L)));",
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
"       pf = pow(nDotHV, uFrontMaterial.shininess);",
"   }",
"",    
"   gAmbient  += ambient * uFrontMaterial.ambient * attenuation;",
"   gDiffuse  += diffuse * uFrontMaterial.diffuse * nDotL * attenuation;",
"   gSpecular += specular * uFrontMaterial.specular * pf * attenuation;",
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
"           if (uLightSource[i].enabled != 0)",
"           {",
"               if (uLightSource[i].position[3] == 0.0)", // directional light
"               {",
"                   directionalLight(uLightSource[i].position, uLightSource[i].ambient,",
"                       uLightSource[i].diffuse, uLightSource[i].specular,",
"                       normalize(vec3(vTransformedNormal)),",
"                       normalize(vec3(vViewDirection) + vec3(uLightSource[i].position)));",
"               }",
"               else if (uLightSource[i].spotCutoff > 90.0)", // point light
"               {",
"                   pointLight(uLightSource[i].position, uLightSource[i].constantAttenuation,",
"                       uLightSource[i].linearAttenuation, uLightSource[i].quadraticAttenuation, uLightSource[i].range,",
"                       uLightSource[i].ambient, uLightSource[i].diffuse, uLightSource[i].specular,",
"                       normalize(vec3(vTransformedNormal)),",
"                       vec3(vViewDirection), vec3(vVertexPosition));",
"               }",
"               else", // spotlight
"               {",
"               }",   
"           }",
"       }",
"",
"       lightingFactor  = uGlobalAmbientLight * uFrontMaterial.ambient;", // global ambient contribution
"       lightingFactor += gAmbient + gDiffuse + gSpecular;", // light contribution(s)
"       lightingFactor.a  = uFrontMaterial.ambient.a / 3.0 + ",
"                           uFrontMaterial.diffuse.a / 3.0 + ",
"                           uFrontMaterial.specular.a / 3.0;",
"   }",
"   else", // uLightingEnabled == 0
"   {",
"       lightingFactor = vVertexColor;",
"   }",
"",
"   vec4 fragmentColor;",
"   vec4 fragmentColor1;",
"   vec4 fragmentColor2;",
"",
"   for (int i=0; i < " + gl_MaxClipPlanes + "; i++)",
"   {",
"       if (uClipPlaneEnabled[i] != 0)",
"       {",
"           if (dot(vVertexPosition.xyz, uClipPlane[i].xyz) - uClipPlane[i].w >= 0.0) discard;",    
"       }",
"   }",
"",
"   if (uTexturesEnabled == 1 && uTextureStageEnabled[0] == 1 && uTextureStageEnabled[1] == 0)",
"   {",
"       fragmentColor = texture2D(uTextureSamplerColor[0], vec2(vTextureCoord[0].s, vTextureCoord[0].t));",
"       if (fragmentColor.r == uTextureColorMask.r && fragmentColor.g == uTextureColorMask.g && fragmentColor.b == uTextureColorMask.b && fragmentColor.a == uTextureColorMask.a) discard;",
"       if (uTextureBlendOp == " + RC_MODULATE + ")",
"       {",
"           if (fragmentColor.a == 0.0) discard;",
"           else gl_FragColor = fragmentColor * lightingFactor;",
"       }",
"       else if (uTextureBlendOp == " + RC_REPLACE + ")",
"       {",
"           gl_FragColor = fragmentColor;",
"       }",
"       else",
"       {",
"           gl_FragColor = lightingFactor;",
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
"       }",
"       else if (uTextureBlendOp == " + RC_REPLACE + ")",
"       {",
"           gl_FragColor = fragmentColor1 * fragmentColor2;",
"       }",
"       else",
"       {",
"           gl_FragColor = lightingFactor;",
"       }",
"   }",
"   else", // uTexturesEnabled == 0 || (uTextureStageEnabled[0] == 0 && uTextureStageEnabled[1] == 1)
"   {",
"       gl_FragColor = lightingFactor;",
"   }",
"}"
].join("\n");

