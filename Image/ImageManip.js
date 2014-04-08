function ScaleImage(pixelFormat, widthIn, heightIn, byteAlignmentIn, dataIn, widthOut, heightOut, byteAlignmentOut, dataOut)
{
    // currently supporting image pixel formats: RGBA
    if (pixelFormat != ePixelFormat.R8G8B8A8)
    {
        return false;
    }

    var canvasIn = document.createElement("canvas");
    canvasIn.width = widthIn;
    canvasIn.height = heightIn;
    
    var ctxIn = canvasIn.getContext("2d");
    var imageDataIn = ctxIn.createImageData(widthIn, heightIn);

    var i = 0;
    for (var row = 0; row < heightIn; row++)
    {
        for (var col = 0; col < widthIn; col++)
        {
            for (var component = 0; component < 4; component++, i++)
            {
                imageDataIn.data[i] = dataIn[i];
            }
        }
    }

    ctxIn.putImageData(imageDataIn, 0, 0);

    var canvasOut = document.createElement("canvas");
    canvasOut.width = widthOut;
    canvasOut.height = heightOut;

    var ctxOut = canvasOut.getContext("2d");
    
    ctxOut.drawImage(canvasIn,
                     0, 0, canvasIn.width, canvasIn.height,
                     0, 0, canvasOut.width, canvasOut.height);
               
    var imageDataOut = ctxOut.getImageData(0, 0, widthOut, heightOut);

    i = 0;
    for (var row = 0; row < heightOut; row++)
    {
        for (var col = 0; col < widthOut; col++)
        {
            for (var component = 0; component < 4; component++, i++)
            {
                dataOut[i] = imageDataOut.data[i];
            }
        }
    }

    return true;
}