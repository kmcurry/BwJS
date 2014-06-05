// filter flags for GetFrameData() filterMask parameter
var FRAME_FILTER_SCALE_FRAME_BIT    = 0x001;    // scale frame to size of incoming buffer before copying
var FRAME_FILTER_INVERT_FRAME_BIT   = 0x002;    // invert frame
var FRAME_FILTER_NEGATE_COLOR_BIT   = 0x004;    // invert rgb pixel data (subtract from 255)
var FRAME_FILTER_NEGATE_ALPHA_BIT   = 0x008;    // invert alpha pixel data (subtract from 255)
var FRAME_FILTER_ALPHA_ONOFF_BIT    = 0x010;    // set alpha pixel to 0 or 255; alpha values in the range
                                                // [0, 127] are set to 0, [128, 255] are set to 255
                                                
function MediaPlayback(container, onload)
{
    this.container = container;
    this.onload = onload;

    this.url = null;
    this.video = false;
    this.ready = false;
    this.alphaPlayback = null;
    this.frameRetrieved = false;
    this.htmlImageElement = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.imagePitch = 0;
    this.imagePixels = null;
}

MediaPlayback.prototype.loadImage = function(url)
{
    this.ready = false;
    this.frameRetrieved = false;
    this.htmlImageElement = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.imagePitch = 0;
    this.imagePixels = null;

    var extension = getFileExtension(url);

    switch (extension)
    {
        case "avi":
        case "mpg":
        case "ogg":
            {

                this.htmlImageElement = document.createElement("video");
                this.htmlImageElement.container = this;
                this.htmlImageElement.controls = "controls";
                //this.htmlImageElement.preload = "auto";
                //this.htmlImageElement.autoplay = "autoplay";
                //this.htmlImageElement.setAttribute("controls", "controls");
                //this.htmlImageElement.setAttribute("preload", "preload");
                //this.htmlImageElement.setAttribute("autoplay", "autoplay");

                //this.htmlImageElement.canvas = document.createElement("canvas");
                //this.htmlImageElement.canvasContext = this.htmlImageElement.canvas.getContext("2d");

                //this.htmlImageElement.addEventListener("play", MediaTexture_OnVideoPlay, false);
                //this.htmlImageElement.onload = MediaTexture_OnVideoLoad;

                //this.onVideoPlay();
                this.htmlImageElement.src = "http://localhost/bwjs/BwContent/images/Bear.ogg"; //url;

                this.video = true;
                this.onVideoLoad();

                /*
                this.htmlImageElement = document.createElement("video"); //new Image();
                this.htmlImageElement.container = this;
                this.htmlImageElement.preload = "auto";
                this.htmlImageElement.autoplay = "autoplay";
                this.htmlImageElement.onload = MediaPlayback_OnVideoLoad;
                this.htmlImageElement.src = imageFilename;
                //this.imageSet = true;
                //this.video = true;
                */
                //var resource = loadBinaryResource(imageFilename);
                //alert(resource);
            }
            break;

        default:
            {
                this.htmlImageElement = new Image(); //document.createElement("img");
                this.htmlImageElement.container = this;
                this.htmlImageElement.onload = MediaPlayback_OnImageLoad;
                this.htmlImageElement.src = url;
            }
            break;
    }

    this.url = url;
}

MediaPlayback.prototype.onImageLoad = function()
{
    var image = this.htmlImageElement;
    this.imageWidth = image.width;
    this.imageHeight = image.height;
    this.imagePitch = image.width * 4; // rgba
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    canvasContext.drawImage(image, 0, 0);
    var imageData = canvasContext.getImageData(0, 0, image.width, image.height);
    this.imagePixels = imageData.data;

    this.ready = true;

    if (this.onload)
    {
        this.onload.call(this);
    }
}

MediaPlayback.prototype.onVideoLoad = function()
{
    this.ready = true;
}

MediaPlayback.prototype.getFrameDimensions = function()
{
    return { width: this.imageWidth, height: this.imageHeight, pitch: this.imagePitch };
}

MediaPlayback.prototype.getPixelFormat = function()
{
    return ePixelFormat.R8G8B8A8;
}

MediaPlayback.prototype.getPixelByteAlignment = function()
{
    return 4;
}

MediaPlayback.prototype.getBytesPerPixel = function()
{
    return BytesPerPixel(this.getPixelFormat());
}

/**
 * Retrieve the pixels for the current frame.
 * @param buffer        - incoming buffer to receive pixel data.
 * @param frame         - optional parameter specifying the frame number to retrieve.
 * @return number       - the frame number retrieved, -1 for single-frame images, or undefined on failure.
 */
MediaPlayback.prototype.getFramePixels = function(buffer, frame)
{
    // verify validity of image data
    if (!this.ready ||
        this.imageWidth == 0 ||
        this.imageHeight == 0 ||
        !this.imagePixels)
    {
        return undefined;
    }

    buffer.length = this.imagePixels.length;
    for (var i = 0; i < this.imagePixels.length; i++)
    {
        buffer[i] = this.imagePixels[i];
    }

    return -1; // single-frame image
}

MediaPlayback.prototype.newFrameDataAvailable = function()
{
    return this.ready && !this.frameRetrieved;
}

/**
 * Retrieve the pixels for the current frame in the specified pixel format and dimensions.
 * @param width         - width of the incoming buffer in pixels.
 * @param height        - height of the incoming buffer in pixels.
 * @param pitch         - width of a scan line of pixels in bytes; may differ from width * bytes
 *                        per pixel if pixels are padded to 2- or 4-byte boundaries.
 * @param pixelFormat   - pixel format of the incoming buffer.
 * @param buffer        - incoming buffer to receive pixel data.
 * @param filterMask    - zero or more OR'd filtering flags controlling how the image is filtered:
 *
 *                        FRAME_FILTER_SCALE_FRAME_BIT  - the frame is first scaled to the size 
 *                                                        of the incoming buffer before copying
 *                        FRAME_FILTER_INVERT_FRAME_BIT - the frame is inverted before copying
 *                        FRAME_FILTER_NEGATE_COLOR_BIT - the rgb pixel data is inverted (subtracted from 255) 
 *                        FRAME_FILTER_NEGATE_ALPHA_BIT - the alpha pixel data is inverted (subtracted from 255)
 *                        FRAME_FILTER_ALPHA_ONOFF_BIT  - set alpha pixel to 0 or 255; alpha values in the range
 *                                                        [0, 127] are set to 0, [128, 255] are set to 255
 *
 * @param pixelMap      - pixel mapping to perform; default: PixelMap_Default.
 * @param frame         - optional parameter specifying the frame number to retrieve.
 * @return number       - the frame number retrieved, -1 for single-frame images, or undefined on failure.
 */
MediaPlayback.prototype.getFrameData = function(width, height, pitch, pixelFormat, buffer, filterMask, pixelMap, frame)
{
    // verify validity of image data
    if (!this.ready ||
        this.imageWidth == 0 ||
        this.imageHeight == 0 ||
        !this.imagePixels)
    {
        return undefined;
    }

    // check params
    if (width == 0 ||
        height == 0 ||
        pitch < width ||
        pixelFormat == ePixelFormat.Unknown ||
        !buffer)
    {
        return undefined;
    }

    var frameRetrieved = -1;

    // get filter flags
    var scaleFrame = filterMask & FRAME_FILTER_SCALE_FRAME_BIT ? true : false;
    var invertFrame = filterMask & FRAME_FILTER_INVERT_FRAME_BIT ? true : false;
    var negateColor = filterMask & FRAME_FILTER_NEGATE_COLOR_BIT ? true : false;
    var negateAlpha = filterMask & FRAME_FILTER_NEGATE_ALPHA_BIT ? true : false;
    var alphaOnOff = filterMask & FRAME_FILTER_ALPHA_ONOFF_BIT ? true : false;

    // get image dimensions
    var dims = this.getFrameDimensions();
    var imageWidth = dims.width;
    var imageHeight = dims.height;
    var imagePitch = dims.pitch;

    // get image pixel format
    var imagePixelFormat = this.getPixelFormat();

    // currently supporting image pixel formats: RGBA
    if (imagePixelFormat != ePixelFormat.R8G8B8A8)
    {
        return undefined;
    }

    // get image pixels
    var pixels = [];
    var imageFrameRetrieved = this.getFramePixels(pixels, frame);
    if (imageFrameRetrieved == undefined)
    {
        return undefined;
    }

    // scale pixels if necessary
    if (scaleFrame && (width != imageWidth || height != imageHeight))
	{
		var imageBytesPerPixel = this.getBytesPerPixel();

		// calculate pitch (using byte aligment of "4")
		imagePitch = width * imageBytesPerPixel;
		imagePitch += (4 - imagePitch % 4) % 4;

		var scaledPixels = [];
		if (!ScaleImage(imagePixelFormat, imageWidth, imageHeight, this.getPixelByteAlignment(), pixels, 
			width, height, 4, scaledPixels))
		{
			return undefined;
		}

		pixels = scaledPixels;
		imageWidth = width;
		imageHeight = height;
	}

    // if no alpha channel, rgb pixel data is not to be negated, frame is not to be inverted,
    // and incoming buffer has same parameters as pixel buffer, copy bits
    if (!this.alphaPlayback &&
		!negateColor &&
		!invertFrame &&
		imagePitch == pitch &&
		imageHeight == height &&
		imagePixelFormat == pixelFormat)
    {
        for (var i = 0; i < buffer.length; i++)
        {
            buffer[i] = pixels[i];
        }
        
        this.frameRetrieved = true;
        return frameRetrieved;
    }

    // get alpha data
    var alphaWidth = 0;
	var alphaHeight = 0;
	var alphaPitch = 0;
	var alphaPixelFormat;
	var alphaPixels = null;
	if (this.alphaChannel)
	{
		// get alpha dimensions
		dims = this.alphaChannel.getFrameDimensions();
		alphaWidth = dims.width;
		alphaHeight = dims.height;
		alphaPitch = dims.pitch;

		// get alpha pixel format
		alphaPixelFormat = this.alphaChannel.getPixelFormat();
    
		// currently only supporting alpha pixel formats: RGBA
		if (alphaPixelFormat != ePixelFormat.R8G8B8A8)
		{
			return undefined;
		}

		// get alpha pixels
		var alphaFramePixels = [];
		var alphaFrameRetrieved = this.alphaChannel.getFramePixels(alphaFramePixels, imageFrameRetrieved);
		if (alphaFrameRetrieved != undefined)
		{
		    // scale alpha pixels to match frame data
		    if (alphaWidth != imageWidth ||
			    alphaHeight != imageHeight)
		    {
			    var alphaBytesPerPixel = this.alphaChannel.getBytesPerPixel();

			    // calculate pitch (using byte aligment of "4")
			    alphaPitch = imageWidth * alphaBytesPerPixel;
			    alphaPitch += (4 - alphaPitch % 4) % 4;

			    var scaledAlphaPixels = [];
			    if (ScaleImage(alphaPixelFormat, alphaWidth, alphaHeight, 
				    this.alphaChannel.getPixelByteAlignment(), alphaPixels, imageWidth, 
				    imageHeight, 4, scaledAlphaPixels))
			    {
			        alphaPixels = scaledAlphaPixels;
			        alphaWidth = imageWidth;
			        alphaHeight = imageHeight;
			    }
		    }
		    else
		    {
		        alphaPixels = alphaFramePixels;
		    }
		}
	}
	
    // determine dimensions to copy
    var copyWidth = Math.min(width, imageWidth);
    var copyHeight = Math.min(height, imageHeight);

    // set component positions for buffer pixel format
    var rPos = 0, gPos = 0, bPos = 0, aPos = 0;
    switch (pixelFormat)
    {
        case ePixelFormat.R8G8B8: rPos = 0; gPos = 1; bPos = 2; break;
        case ePixelFormat.B8G8R8: rPos = 2; gPos = 1; bPos = 0; break;
        case ePixelFormat.R8G8B8A8: rPos = 0; gPos = 1; bPos = 2; aPos = 3; break;
        case ePixelFormat.B8G8R8A8: rPos = 2; gPos = 1; bPos = 0; aPos = 3; break;
        case ePixelFormat.A8R8G8B8: rPos = 1; gPos = 2; bPos = 3; aPos = 0; break;
        case ePixelFormat.A8B8G8R8: rPos = 3; gPos = 2; bPos = 1; aPos = 0; break;
    }

    // if frame is to be inverted, start copying from last row of data
    var fromImage = 0, fromAlpha = 0, to = 0;
    if (invertFrame)
    {
        fromImage += imagePitch * (copyHeight - 1);

        if (alphaPixels)
        {
            fromAlpha += alphaPitch * (copyHeight - 1);
        }
    }

    // copy pixel data to buffer
    var pixel = new TPixel(0, 0, 0, 255);
    var alphaPixel = new TPixel(0, 0, 0, 255);
    for (var row = 0; row < copyHeight; row++)
    {
        for (var col = 0; col < copyWidth; col++)
        {
            // get image pixel
            /*
            switch (imagePixelFormat)
            {
            case ePixelFormat.R8G8B8:
            pixel.red = pixels[fromImage];
            pixel.green = pixels[fromImage + 1];
            pixel.blue = pixels[fromImage + 2];
            fromImage += 3;
            break;

                case ePixelFormat.B8G8R8:
            pixel.red = pixels[fromImage + 2];
            pixel.green = pixels[fromImage + 1];
            pixel.blue = pixels[fromImage];
            fromImage += 3;
            break;

                case ePixelFormat.R8G8B8A8:
            pixel.red = pixels[fromImage];
            pixel.green = pixels[fromImage + 1];
            pixel.blue = pixels[fromImage + 2];
            pixel.alpha = pixels[fromImage + 3];
            fromImage += 4;
            break;

                case ePixelFormat.B8G8R8A8:
            pixel.red = pixels[fromImage + 2];
            pixel.green = pixels[fromImage + 1];
            pixel.blue = pixels[fromImage];
            pixel.alpha = pixels[fromImage + 3];
            fromImage += 4;
            break;

                case ePixelFormat.A8B8G8R8:
            pixel.red = pixels[fromImage + 3];
            pixel.green = pixels[fromImage + 2];
            pixel.blue = pixels[fromImage + 1];
            pixel.alpha = pixels[fromImage];
            fromImage += 4;
            break;
            }
            */
            pixel.red = pixels[fromImage];
            pixel.green = pixels[fromImage + 1];
            pixel.blue = pixels[fromImage + 2];
            pixel.alpha = pixels[fromImage + 3];
            fromImage += 4;

            // negate rgb data if requested
            if (negateColor)
            {
                pixel.red = 255 - pixel.red;
                pixel.green = 255 - pixel.green;
                pixel.blue = 255 - pixel.blue;
                pixel.alpha = 255 - pixel.alpha;
            }

            // get alpha pixel
            if (alphaPixels)
            {
                /*
                switch (alphaPixelFormat)
                {
                case ePixelFormat.R8G8B8:
                alphaPixel.red = alphaPixels[fromAlpha];
                alphaPixel.green = alphaPixels[fromAlpha + 1];
                alphaPixel.blue = alphaPixels[fromAlpha + 2];
                fromAlpha += 3;
                break;

                    case ePixelFormat.B8G8R8:
                alphaPixel.red = alphaPixels[fromAlpha + 2];
                alphaPixel.green = alphaPixels[fromAlpha + 1];
                alphaPixel.blue = alphaPixels[fromAlpha];
                fromAlpha += 3;
                break;

                    case ePixelFormat.R8G8B8A8:
                alphaPixel.red = alphaPixels[fromAlpha];
                alphaPixel.green = alphaPixels[fromAlpha + 1];
                alphaPixel.blue = alphaPixels[fromAlpha + 2];
                alphaPixel.alpha = alphaPixels[fromAlpha + 3];
                fromAlpha += 4;
                break;

                    case ePixelFormat.B8G8R8A8:
                alphaPixel.red = alphaPixels[fromAlpha + 2];
                alphaPixel.green = alphaPixels[fromAlpha + 1];
                alphaPixel.blue = alphaPixels[fromAlpha];
                alphaPixel.alpha = alphaPixels[fromAlpha + 3];
                fromAlpha += 4;
                break;
                }
                */
                alphaPixel.red = alphaPixels[fromAlpha];
                alphaPixel.green = alphaPixels[fromAlpha + 1];
                alphaPixel.blue = alphaPixels[fromAlpha + 2];
                alphaPixel.alpha = alphaPixels[fromAlpha + 3];
                fromAlpha += 4;
            }

            // negate alpha data if requested
            if (negateAlpha)
            {
                alphaPixel.red = 255 - alphaPixel.red;
                alphaPixel.green = 255 - alphaPixel.green;
                alphaPixel.blue = 255 - alphaPixel.blue;
                alphaPixel.alpha = 255 - alphaPixel.alpha;
            }

            // copy to buffer
            switch (pixelFormat)
            {
                case ePixelFormat.R8G8B8:
                case ePixelFormat.B8G8R8:
                    buffer[to + rPos] = pixel.red;
                    buffer[to + gPos] = pixel.green;
                    buffer[to + bPos] = pixel.blue;
                    to += 3;
                    break;

                case ePixelFormat.R8G8B8A8:
                case ePixelFormat.B8G8R8A8:
                case ePixelFormat.A8R8G8B8:
                case ePixelFormat.A8B8G8R8:
                    switch (pixelMap)
                    {
                        case ePixelMap.RGBToAlpha:
                            buffer[to + rPos] = 0;
                            buffer[to + gPos] = 255;
                            buffer[to + bPos] = 0;
                            if (alphaPixels)
                            {
                                buffer[to + aPos] =
								((pixel.red + pixel.green + pixel.blue) / 3) &
								((alphaPixel.red + alphaPixel.green + alphaPixel.blue) / 3);
                            }
                            else
                            {
                                buffer[to + aPos] = (pixel.red + pixel.green + pixel.blue) / 3;
                            }
                            if (alphaOnOff)
                            {
                                buffer[to + aPos] = (buffer[to + aPos] <= 127 ? 0 : 255);
                            }
                            to += 4;
                            break;

                        case ePixelMap.Default:
                        default:
                            buffer[to + rPos] = pixel.red;
                            buffer[to + gPos] = pixel.green;
                            buffer[to + bPos] = pixel.blue;
                            if (alphaPixels)
                            {
                                buffer[to + aPos] = (alphaPixel.red + alphaPixel.green + alphaPixel.blue) / 3;
                            }
                            else
                            {
                                buffer[to + aPos] = pixel.alpha;
                            }
                            if (alphaOnOff)
                            {
                                buffer[to + aPos] = (buffer[to + aPos] <= 127 ? 0 : 255);
                            }
                            to += 4;
                            break;
                    }
                    break;

                case ePixelFormat.A8:
                    if (alphaPixels)
                    {
                        buffer[to] = (alphaPixel.red + alphaPixel.green + alphaPixel.blue) / 3;
                    }
                    else // !alphaPixels
                    {
                        buffer[to] = (pixel.red + pixel.green + pixel.blue) / 3;
                    }
                    if (alphaOnOff)
                    {
                        buffer[to] = (buffer[to] <= 127 ? 0 : 255);
                    }
                    to += 1;
                    break;
            }
        }

        if (invertFrame) fromImage -= (2 * imagePitch);
        if (alphaPixels)
        {
            if (invertFrame) fromAlpha -= (2 * alphaPitch);
        }
    }

    this.frameRetrieved = true;

    return frameRetrieved;
}

MediaPlayback.prototype.setAlphaChannel = function(playback)
{
    this.alphaPlayback = playback;
}

function MediaPlayback_OnImageLoad()
{
    this.container.onImageLoad();
}