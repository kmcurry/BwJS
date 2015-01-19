/**
*	The end behavior enumeration
*/
var eEndBehavior =
{
    Reset: 0,
    Constant: 1,
    Repeat: 2,
    Oscillate: 3,
    OffsetRepeat: 4,
    Linear: 5
};

var eImageAntialiasOp =
{
    None: 0,
    TwoPass: 1,
    FourPass: 2,
    EightPass: 3,
    EnumCount: 4
};

/**
 * The key frame shape enumeration
 */
var eKeyframeShape =
{
    Linear: 0,
    Stepped: 1,
    TCB: 2,
    Bezier1D: 3,
    Bezier2D: 4,
    Hermite: 5
};

var eTextureType =
{
    // color textures
    Color: 0,
    // diffuse textures
    Diffuse: 1,
    // luminosity (emissive) textures
    Luminosity: 2,
    // reflection textures
    Reflection: 3,
    // specularity textures
    Specularity: 4,
    // transparency textures
    Transparency: 5,
    // clip textures
    Clip: 6,
    // bump textures
    Bump: 7,
    // number of texture types
    EnumCount: 8
};

var eTextureWrap =
{
    // no texture wrapping
    None: 0,
    // clamp texture wrapping
    Clamp: 1,
    // repeat texture wrapping
    Repeat: 2,
    // mirror texture wrapping
    Mirror: 3,
    // number of texture wraps
    EnumCount: 4
};

var eHighlightType =
{
    // disable highlights
    None: 0,
    // 4-pass
    FourPass: 1,
    // 8-pass
    EightPass: 2  
};

var eBoneFalloffType =
{
    InverseDistance: 0,
    // inverse distance / 2
    InverseDistance_2: 1,
    // inverse distance / 4
    InverseDistance_4: 2,
    // inverse distance / 8
    InverseDistance_8: 3,
    // inverse distance / 16
    InverseDistance_16: 4  
};
