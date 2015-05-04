MediaTexture.prototype = new Texture();
MediaTexture.prototype.constructor = MediaTexture;

function MediaTexture()
{
    Texture.call(this);
    this.className = "MediaTexture";
    this.attrType = eAttrType.MediaTexture;
    
    this.updateImageFilename = false;
    this.updateAlphaFilename = false;
    this.updateNegateImage = false;
    this.updateNegateAlpha = false;
    this.imagePlayback = null;
    this.alphaPlayback = null;
    this.pixelMap = ePixelMap.Default;
    this.forceImageUpdate = false;
    
    this.imageFilename = new StringAttr("");
    this.alphaFilename = new StringAttr("");
    this.negateImage = new BooleanAttr(false);
    this.negateAlpha = new BooleanAttr(false);
    this.frame = new NumberAttr(-1);
    this.frameRetrieved = new NumberAttr(-1);
    
    this.imageFilename.addModifiedCB(MediaTexture_ImageFilenameModifiedCB, this);
    this.alphaFilename.addModifiedCB(MediaTexture_AlphaFilenameModifiedCB, this);
    this.negateImage.addModifiedCB(MediaTexture_NegateImageModifiedCB, this);
    this.negateAlpha.addModifiedCB(MediaTexture_NegateAlphaModifiedCB, this);
   
    this.registerAttribute(this.imageFilename, "imageFilename");
    this.registerAttribute(this.alphaFilename, "alphaFilename");
    this.registerAttribute(this.negateImage, "negateImage");
    this.registerAttribute(this.negateAlpha, "negateAlpha");
    this.registerAttribute(this.frame, "frame");
    this.registerAttribute(this.frameRetrieved, "frameRetrieved");
}

MediaTexture.prototype.setGraphMgr = function(graphMgr)
{
    // call base-class implementation
    Texture.prototype.setGraphMgr.call(this, graphMgr);
}

MediaTexture.prototype.update = function(params, visitChildren)
{
    if (this.updateImageFilename ||
        this.updateAlphaFilename)
    {
        this.updateImageFilename = false;
        this.updateAlphaFilename = false;

        this.frame.setValueDirect(-1);

        this.loadMedia();
    }

    if (this.updateTextureType)
    {
        this.updateTextureType = false;

        this.setImageSize();

        this.forceImageUpdate = true;
    }

    if (this.updateNegateImage)
    {
        this.updateNegateImage = false;

        this.forceImageUpdate = true;
    }

    if (this.updateNegateAlpha)
    {
        this.updateNegateAlpha = false;

        this.forceImageUpdate = true;
    }

    // update texture image if enabled
    if (this.enabled.getValueDirect())
    {
        this.updateMediaTextureImage();
    }

    // call base-class implementation
    Texture.prototype.update.call(this, params, visitChildren);
}

MediaTexture.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled_)
    {
        // call base-class implementation
        Texture.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    // call base-class implementation
    Texture.prototype.apply.call(this, directive, params, visitChildren);
}

MediaTexture.prototype.loadMedia = function()
{
    var imageFilename = this.imageFilename.getValueDirect().join("");
    if (imageFilename &&
        imageFilename != "" &&
       !this.imagePlayback || (this.imagePlayback && this.imagePlayback.url != imageFilename))
    {
        this.imagePlayback = new MediaPlayback(this, MediaTexture_OnImageLoad);
        this.imagePlayback.container = this;
        this.imagePlayback.loadImage(imageFilename);
    }
    else if (imageFilename == "")
    {
        // TODO: remove texture
    }

    var alphaFilename = this.alphaFilename.getValueDirect().join("");
    if (alphaFilename &&
        alphaFilename != "" &&
       !this.alphaPlayback || (this.alphaPlayback && this.alphaPlayback.url != alphaFilename))
    {
        this.alphaPlayback = new MediaPlayback(this, MediaTexture_OnAlphaLoad);
        this.alphaPlayback.container = this;
        this.alphaPlayback.loadImage(alphaFilename);

        if (this.imagePlayback)
        {
            this.imagePlayback.setAlphaChannel(this.alphaPlayback);
        }
    }
    else if (alphaFilename == "")
    {
        // TODO: remove texture
    }
    
    // increment modification count
    this.setModified();
}

MediaTexture.prototype.setImageSize = function()
{
    // only perform this action if texture type is not color and/or an alpha channel is present
    if (this.textureType.getValueDirect() == eTextureType.Color &&
       !this.alphaPlayback)
    {
        return;
    }

    if (!this.imagePlayback)
    {
        return;
    }

    // get image playback dimensions
    var dims = this.imagePlayback.getFrameDimensions();
    var width = nextHighestPowerOfTwo(dims.width);
    var height = nextHighestPowerOfTwo(dims.height);

    // based on texture type, determine pixel format
    var pixelFormat;
    switch (this.textureType.getValueDirect())
    {
        case eTextureType.Diffuse:
        case eTextureType.Luminosity:
        case eTextureType.Specularity:
        case eTextureType.Transparency:
        case eTextureType.Clip:
            pixelFormat = ePixelFormat.A8;
            this.pixelMap = ePixelMap.RGBToAlpha;
            break;

        case eTextureType.Color:
        default:
            pixelFormat = this.imagePlayback.getPixelFormat();
            this.pixelMap = ePixelMap.Default;
            break;
    }

    // if alpha playback, ensure pixel format has an alpha channel
    if (this.alphaPlayback)
    {
        switch (pixelFormat)
        {
            case ePixelFormat.R8G8B8:
                pixelFormat = ePixelFormat.R8G8B8A8;
                break;

            case ePixelFormat.B8G8R8:
                pixelFormat = ePixelFormat.B8G8R8A8;
                break;
        }
    }

    // get image playback byte alignment
    var byteAlignment = this.imagePlayback.getPixelByteAlignment();

    // calculate pitch
    this.pitch = width * BytesPerPixel(pixelFormat);
    this.pitch += (byteAlignment - this.pitch % byteAlignment) % byteAlignment;

    // set image attributes
    this.image.width.setValueDirect(width);
    this.image.height.setValueDirect(height);
    this.image.pixelFormat.setValueDirect(pixelFormat);
    this.image.byteAlignment.setValueDirect(byteAlignment);

    // allocate pixel buffer
    this.image.pixels.setLength(height * this.pitch);
}

MediaTexture.prototype.updateMediaTextureImage = function()
{
    // only perform this action if texture type is not color and an alpha channel is present
    if (this.textureType.getValueDirect() == eTextureType.Color &&
       !this.alphaPlayback)
    {
        return;
    }
    
    if (this.imagePlayback &&
        this.imagePlayback.ready &&
       (this.imagePlayback.newFrameDataAvailable() ||
       (this.alphaPlayback && this.alphaPlayback.newFrameDataAvailable()) ||
        this.forceImageUpdate))
    {
        var width = this.image.width.getValueDirect();
        var height = this.image.height.getValueDirect();
        var pixelFormat = this.image.pixelFormat.getValueDirect();

        // set filter mask
        var filterMask = FRAME_FILTER_SCALE_FRAME_BIT;
        if (this.negateImage.getValueDirect())
        {
            filterMask |= FRAME_FILTER_NEGATE_COLOR_BIT;
        }
        if (this.negateAlpha.getValueDirect())
        {
            filterMask |= FRAME_FILTER_NEGATE_ALPHA_BIT;
        }

        // get image data
        var frameRetrieved = this.imagePlayback.getFrameData(width, height, this.pitch, pixelFormat, this.image.pixels.values, filterMask, this.pixelMap, this.frame.getValueDirect());
        this.frameRetrieved.setValueDirect(frameRetrieved);

        this.forceImageUpdate = false;
    }
    
    // increment modification count
    this.setModified();
}

MediaTexture.prototype.onImageLoad = function()
{
    // only perform this action if texture type is not color and/or an alpha channel is present
    if (this.textureType.getValueDirect() == eTextureType.Color &&
       !this.alphaPlayback)
    {
        this.textureObj.setImage(this.imagePlayback.htmlImageElement, ePixelFormat.R8G8B8A8, eImageFormat.RGBA);
        this.imageSet = true;
        this.setModified();
        return;
    }
    
    this.setImageSize();
}

MediaTexture.prototype.onAlphaLoad = function()
{
}

MediaTexture.prototype.onVideoLoad = function()
{   /*
    var image = this.htmlImageElement;
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");
    canvas.width = 200; //image.width;
    canvas.height = 200; //image.height;
    canvasContext.drawImage(image, 0, 0);
    var imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    this.textureObj.setImageData(imageData);
    this.imageSet = true;
    this.video = true;
    //alert(imageData.data[0]);
    //alert(imageData.data[1]);
    //alert(imageData.data[2]);
    //alert(imageData.data[3]);
    */
    this.textureObj.setVideo(this.htmlImageElement);
    this.textureObj.negate = this.negateImage.getValueDirect();
    this.imageSet = true;
}

function MediaTexture_OnImageLoad()
{
    this.container.onImageLoad();
}

function MediaTexture_OnAlphaLoad()
{
    this.container.onAlphaLoad();
}

function MediaTexture_OnVideoLoad()
{
    alert("MediaTexture_OnVideoLoad");
    this.container.onVideoLoad();
}

function MediaTexture_ImageFilenameModifiedCB(attribute, container)
{
    container.updateImageFilename = true;
    container.setModified();
}

function MediaTexture_AlphaFilenameModifiedCB(attribute, container)
{
    container.updateAlphaFilename = true;
    container.setModified();
}

function MediaTexture_NegateImageModifiedCB(attribute, container)
{
    container.updateNegateImage = true;
    container.setModified();
}

function MediaTexture_NegateAlphaModifiedCB(attribute, container)
{
    container.updateNegateAlpha = true;
    container.setModified();
}