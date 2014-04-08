/**
 *
 */
var ePixelFormat =
{
    Unknown             :-1,
    R8G8B8              : 0,  // 24-bit RGB
    B8G8R8              : 1,  // 24-bit BGR
    X8X8X8              : 2,  // 24-bit RGB (unspecified component order)
    R8G8B8A8            : 3,  // 32-bit RGB Alpha
    B8G8R8A8            : 4,  // 32-bit BGR Alpha
    A8R8G8B8            : 5,  // 32-bit Alpha RGB
    A8B8G8R8            : 6,  // 32-bit Alpha BGR
    X8X8X8X8            : 7,  // 32-bit RGB Alpha (unspecified component order)
    A8                  : 8   //  8-bit Alpha
};

var ePixelMap =
{
    Default             : 0,  // default mapping -- R to R, G to G, B to B, Alpha to Alpha
    RGBToAlpha          : 1   // average RGB components and map to Alpha component
};

function BytesPerPixel(pixelFormat)
{
    switch (pixelFormat)
    {
    case ePixelFormat.R8G8B8:
    case ePixelFormat.B8G8R8:
    case ePixelFormat.X8X8X8:
        return 3;

    case ePixelFormat.R8G8B8A8:
    case ePixelFormat.B8G8R8A8:
    case ePixelFormat.A8R8G8B8:
    case ePixelFormat.A8B8G8R8:
    case ePixelFormat.X8X8X8X8:
        return 4;

    case ePixelFormat.A8:
        return 1;

    default:
        return 0;
    }
}

function TPixel(r, g, b, a)
{
    var red = r || 0;
    var green = g || 0;
    var blue = b || 0;
    var alpha = a || 0;
}

/**
 *
 */
var eImageFormat =
{
    Unknown             :-1,
    RGB                 : 0,
    RGBA                : 1,
    Alpha               : 2,
    Luminance           : 3,
    Luminance_Alpha     : 4
}