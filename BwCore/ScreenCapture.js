ScreenCapture.prototype  = new Command();
ScreenCapture.prototype.constructor = ScreenCapture;

ScreenCapture.prototype.ScreenCapture = function()
{
    Command.call(this);
    this.className = "ScreenCapture";
    this.attrType = eAttrType.ScreenCapture;
 
    this.filename = new StringAttr();
    
    this.registerAttribute(this.filename, "filename");   
}


ScreenCapture.prototype.execute = function()
{
    this.screenCapture();
}

ScreenCapture.prototype.screenCapture = function()
{
    
}
/*
ScreenCapture.prototype.ScreenCapture = function()
{
    // get render context
    var resource = null;
    var renderAgent = null;
    var renderContext = null;
    var registry = this.registry;
    if (registry) {
        if (registry.find("RenderAgent", resource)) {
            var renderAgent = resource;
            if (renderAgent) {
                renderContext = renderAgent.getRenderContext();
            }
        }
    }
    if (!renderContext) {
        console.log("Failed at finding render context");
        return;
    }

    // get render engine
    var renderEngine = renderContext.getRenderEngine();
    if (!renderEngine) {
        console.log("Failed at getting render engine");
        return;
    }

    // get window handle
    var windowHandle = renderContext.getWindowHandle();
    if (!windowHandle) {
        console.log("Failed to get window handle");
        return;
    }

    var clientWidth, clientHeight;
    windowHandle.getClientDimensions(clientWidth, clientHeight);

    // allocate buffer
    var pixels = [clientWidth * clientHeight * 3];
    if (!pixels) {
        console.log("Error: Out of Memory");
        return;
    }

    renderContext.SetCurrentThread(CURRENTTHREAD_MAIN_BIT);

    // read frame buffer
    renderEngine.ReadFrameBuffer(0, 0, clientWidth, clientHeight, PixelFormat_B8G8R8, 1, pixels);

    // get frame buffer origin
    var bufferOrigin = renderEngine.getFrameBufferOrigin();

    //renderContext.clearCurrentThread(CURRENTTHREAD_MAIN_BIT);

    // if frame buffer origin is upper-left, invert image
    switch (bufferOrigin) {
        case ReBufferOrigin_UpperLeft:
        {
            // invert image
            var invertedPixels = [clientWidth * clientHeight * 3];
            if (!invertedPixels) {
                console.log("Error: Out of Memory");
                delete pixels[];
                return;
            }

            var pixelPos = 0;
            var invPixelPos = 0;
            for (var i = clientHeight - 1; i >= 0; i--) {
                for (var j = 0, k = 0; j < clientWidth; j++, k += 3) {
                    pixelPos = i * clientWidth * 3;

                    invertedPixels[invPixelPos++] = pixels[pixelPos + k  ];
                    invertedPixels[invPixelPos++] = pixels[pixelPos + k + 1];
                    invertedPixels[invPixelPos++] = pixels[pixelPos + k + 2];
                }
            }

            pixels = [];

            pixels = invertedPixels;
        }
            break;
    }

    // get filename
    var filename[256];
    this.filename.getValueDirect(filename, sizeof(filename));

    // capture
    var result;
    if (this.filename.getLength() == 0 || !(filename == "")) // capture to clipboard
    {
        result = copyToClipboard(clientWidth, clientHeight, clientWidth * 3, PixelFormat_B8G8R8, pixels);
    }
    else // capture to file
    {
        result = CMediaDepot.prototype.Instance().Save(filename, clientWidth, clientHeight, clientWidth * 3, PixelFormat_B8G8R8, pixels);
    }

    // deallocate buffer
    pixels = [];
}
*/