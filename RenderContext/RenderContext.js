/* 
 * enable caps 
 */
var eRenderMode =
{
    AlphaBlend              : 1,
    CullBackFace            : 2,
    DepthTest               : 3,
    DepthBufferWrite        : 4,
    Lighting                : 5,
    NormalizeNormals        : 6,
    Fog                     : 7,
    StencilTest             : 8,
    PolygonOffset_Fill      : 9,
    PolygonOffset_Line      : 10,
    PolygonOffset_Point     : 11
}
 
var RC_BLEND            = 0x0001;
var RC_CULL_FACE        = 0x0B44;

/*
 * light desc
 */
var LIGHTDESC_POSITION_BIT          = 0x001;
var LIGHTDESC_DIRECTION_BIT         = 0x002;
var LIGHTDESC_AMBIENT_BIT           = 0x004;
var LIGHTDESC_DIFFUSE_BIT           = 0x008;
var LIGHTDESC_SPECULAR_BIT          = 0x010;
var LIGHTDESC_CONSTANT_ATT_BIT      = 0x020;
var LIGHTDESC_LINEAR_ATT_BIT        = 0x040;
var LIGHTDESC_QUADRATIC_ATT_BIT     = 0x080;
var LIGHTDESC_RANGE_BIT             = 0x100;
var LIGHTDESC_OUTER_CONE_DEG_BIT    = 0x200;
var LIGHTDESC_INNER_CONE_DEG_BIT    = 0x400;
var LIGHTDESC_CONE_FALLOFF_BIT      = 0x800;

function LightDesc()
{
    this.type = "";                     // required: "directional", "point", "spot"
    this.validMembersMask = 0;
    this.position = new Vector3D();     // point, spot
    this.direction = new Vector3D();    // directional, spot
    this.ambient = new Color();         // all types
    this.diffuse = new Color();         // all types
    this.specular = new Color();        // all types
    this.constantAttenuation = 0;       // all types
    this.linearAttenuation = 0;         // all types
    this.quadraticAttenuation = 0;      // all types
    this.range = 0;                     // point, spot
    this.outerConeDegrees = 0;          // spot
    this.innerConeDegrees = 0;          // spot
    this.coneFalloff = 0;               // spot
}

/* 
 * material desc 
 */
var MATERIALDESC_AMBIENT_BIT        = 0x001;
var MATERIALDESC_DIFFUSE_BIT        = 0x002;
var MATERIALDESC_SPECULAR_BIT       = 0x004;
var MATERIALDESC_EMISSIVE_BIT       = 0x008;
var MATERIALDESC_GLOSSINESS_BIT     = 0x010;
var MATERIALDESC_ALL_BITS           = 0x01F;

function MaterialDesc()
{
    this.validMembersMask = 0;
    this.ambient = new Color();
    this.diffuse = new Color();
    this.specular = new Color();
    this.emissive = new Color();
    this.glossiness = 0;

    this.copy = function(materialDesc)
    {
        if (materialDesc)
        {
            this.validMembersMask = materialDesc.validMembersMask;
            this.ambient.copy(materialDesc.ambient);
            this.diffuse.copy(materialDesc.diffuse);
            this.specular.copy(materialDesc.specular);
            this.emissive.copy(materialDesc.emissive);
            this.glossiness = materialDesc.glossiness;
        }
    }
}

/*
 * blend factor
 */
var RC_ZERO                         = 0x001;    
var RC_ONE                          = 0x002;
var RC_SRC_COLOR                    = 0x004;
var RC_SRC_ALPHA                    = 0x008;
var RC_ONE_MINUS_SRC_COLOR          = 0x010;
var RC_ONE_MINUS_SRC_ALPHA          = 0x020;
var RC_DEST_COLOR                   = 0x040;
var RC_DEST_ALPHA                   = 0x080;
var RC_ONE_MINUS_DEST_COLOR         = 0x100;
var RC_ONE_MINUS_DEST_ALPHA         = 0x200;

/*
 * blend op
 */
var RC_MODULATE                     = 0x001;
var RC_REPLACE                      = 0x002;
var RC_BLEND                        = 0x004;
var RC_DECAL                        = 0x008;

/*
 * texture coordinate source
 */
var eTextureCoordSrc = 
{
    VertexUVs                       : 1,
    ViewSpaceVertexPosition         : 2,
    ViewSpaceReflectionVector       : 3
}
 
/*
 * texture wrap
 */
var RC_REPEAT                      = 0x2901;
var RC_CLAMP_TO_EDGE               = 0x812F;
var RC_MIRRORED_REPEAT             = 0x8370;
  
/*
 * render context
 */
function RenderContext(canvas, background)
{
    this.valid = false;
    
    this.canvas = canvas;
    this.background = background;
    
    this.projectionMatrixStack = new MatrixStack(new Matrix4x4());
    this.modelViewMatrixStack = new MatrixStack(new Matrix4x4());
    
    this.frontMaterial = new MaterialDesc();
    
    this.displayListObj = null;
    
    this.getDisplayList = function()
    {
        return this.displayListObj;    
    }
    
    this.setDisplayList = function(displayListObj)
    {
        this.displayListObj = displayListObj;
    }
    
    this.getFrontMaterial = function()
    {
        var material = new MaterialDesc();
        material.copy(this.frontMaterial); 
        return material;             
    }

    this.setBackgroundImage = function(url, width, height)
    {
        if (this.background)
        {
            this.background.src = url;
            this.background.width = width;
            this.background.height = height;
        }
    }
}

function newRenderContext(api, canvas, background)
{
    var rc = null;
    
    switch (api)
    {
    case "webgl":
        {
            rc = new webglRC(canvas, background);
        }
        break;
    }

    // return rc if valid    
    return rc.valid ? rc : null;
}
