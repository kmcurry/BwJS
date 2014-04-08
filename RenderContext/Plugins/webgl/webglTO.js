webglTO.prototype = new TextureObject();
webglTO.prototype.constructor = webglTO;

function webglTO(gl, program)
{
    //
    // initialization
    //
    
    TextureObject.call(this);
    
    var gl = gl;
    var program = program;
    
    this.texture = gl.createTexture();
    
    //
    // methods
    //

    this.setImage = function(image, pixelFormat, imageFormat)
    {
        var intFormat;
        switch (pixelFormat)
        {
            case ePixelFormat.R8G8B8:
            case ePixelFormat.B8G8R8:
            case ePixelFormat.X8G8R8:
                intFormat = gl.RGB;
                break;

            case ePixelFormat.R8G8B8A8:
            case ePixelFormat.B8G8R8A8:
            case ePixelFormat.A8R8G8B8:
            case ePixelFormat.A8B8G8R8:
            case ePixelFormat.X8X8X8X8:
                intFormat = gl.RGBA;
                break;

            case ePixelFormat.A8:
                intFormat = gl.ALPHA;
                break;

            default: // unsupported format
                return;
                break;
        }

        var format;
        switch (imageFormat)
        {
            case eImageFormat.RGB:
                format = gl.RGB;
                break;

            case eImageFormat.RGBA:
                format = gl.RGBA;
                break;

            case eImageFormat.Alpha:
                format = gl.ALPHA;
                break;

            case eImageFormat.Luminance:
                format = gl.LUMINANCE;
                break;

            case eImageFormat.Luminance_Alpha:
                format = gl.LUMINANCE_ALPHA;
                break;

            default: // unsupported format
                return;
                break;
        }

        // following taken from:
        // http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences
        if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height))
        {
            // Scale up the texture to the next highest power of two dimensions.
            var canvas = document.createElement("canvas");
            canvas.width = nextHighestPowerOfTwo(image.width);
            canvas.height = nextHighestPowerOfTwo(image.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);
            image = canvas;
        }

        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, intFormat, format, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    this.setImageData = function(width, height, pixelFormat, imageFormat, pixels)
    {
        var intFormat;
        switch (pixelFormat)
        {
            case ePixelFormat.R8G8B8:
            case ePixelFormat.B8G8R8:
            case ePixelFormat.X8G8R8:
                intFormat = gl.RGB;
                break;

            case ePixelFormat.R8G8B8A8:
            case ePixelFormat.B8G8R8A8:
            case ePixelFormat.A8R8G8B8:
            case ePixelFormat.A8B8G8R8:
            case ePixelFormat.X8X8X8X8:
                intFormat = gl.RGBA;
                break;

            case ePixelFormat.A8:
                intFormat = gl.ALPHA;
                break;

            default: // unsupported format
                return;
                break;
        }

        var format;
        switch (imageFormat)
        {
            case eImageFormat.RGB:
                format = gl.RGB;
                break;

            case eImageFormat.RGBA:
                format = gl.RGBA;
                break;

            case eImageFormat.Alpha:
                format = gl.ALPHA;
                break;

            case eImageFormat.Luminance:
                format = gl.LUMINANCE;
                break;

            case eImageFormat.Luminance_Alpha:
                format = gl.LUMINANCE_ALPHA;
                break;

            default: // unsupported format
                return;
                break;
        }
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, intFormat, width, height, 0, format, gl.UNSIGNED_BYTE,
            new Uint8Array(pixels));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    this.setVideo = function(video)
    {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // different browsers require calls to different versions of texImage2D; possibly because 
        // complete webGL implementations are not yet available
        switch (getBrowserName())
        {
            case "Chrome":
            //gl.texImage2D(gl.TEXTURE_2D, 0, video, false);
            //break;

            case "Firefox":
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
                break;

            default:
                gl.texImage2D(gl.TEXTURE_2D, 0, video, false);
                break;
        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

function isPowerOfTwo(x)
{
    return (x & (x - 1)) == 0;
}

function nextHighestPowerOfTwo(x)
{
    --x;
    for (var i = 1; i < 32; i <<= 1)
    {
        x = x | x >> i;
    }
    return x + 1;
}