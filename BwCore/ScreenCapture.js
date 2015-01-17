ScreenCaptureCommand.prototype = new Command();
ScreenCaptureCommand.prototype.constructor = ScreenCaptureCommand;

function ScreenCaptureCommand()
{
    Command.call(this);
    this.className = "ScreenCapture";
    this.attrType = eAttrType.ScreenCapture;

    this.canvasId = new StringAttr();

    this.registerAttribute(this.canvasId, "canvasId");

    this.numResponses.setValueDirect(0);
}

ScreenCaptureCommand.prototype.execute = function()
{
    var bworks = this.registry.find("Bridgeworks");
    bworks.eventMgr.addListener(eEventType.RenderBegin, this);
    bworks.eventMgr.addListener(eEventType.RenderEnd, this);
}

ScreenCaptureCommand.prototype.screenCapture = function(canvasId)
{
    var canvas = document.getElementById(canvasId);
    var imageData = canvas.toDataURL('image/png');

    // 3Scape-specific: decode the base64 data into 8bit array
    cimageData = imageData;
    var cnt = imageData.lastIndexOf(',') + 1;
    imageData = imageData.substr(cnt);
    imgeData = Base64Binary.decode(imageData);
        
    // for testing with Bug-60.htm
    //document.getElementById('imgCapture').src = imageData;

    // copy to clipboard
    // TODO: investigate method described at: https://forums.mozilla.org/addons/viewtopic.php?t=9736&p=21119

    // open in new window
    //window.open(imageData);
    
    // download
    //var imageDataStream = imageData.replace("image/png", "image/octet-stream");
    //window.location.href = imageDataStream;
}

ScreenCaptureCommand.prototype.get2DElementCanvas = function(canvas3D)
{
    // create 2D canvas for labels
    var canvas2D = document.createElement('canvas');
    canvas2D.id = "canvas2D";
    canvas2D.width = canvas3D.width;
    canvas2D.height = canvas3D.height;
    var ctx = canvas2D.getContext('2d');

    // get labels
    var labels = this.registry.getByType(eAttrType.Label);
    
    // calculate mask color which is different from all labels colors
    var maskColor = "black";
    
    // setup img src data for labels
    var data = "data:image/svg+xml," + 
               "<svg xmlns='http://www.w3.org/2000/svg' width='" + canvas2D.width + "' height='" + canvas2D.height + "'>" + 
               "<foreignObject width='100%' height='100%'>" + 
               "<div xmlns='http://www.w3.org/1999/xhtml' style='background:" + maskColor + ";'>";   
    for (var i=0; i < labels.length; i++)
    {
        var style = labels[i].htmlLabel.style;
        data += "<span style='position:absolute; " +
                "font-family:" + style.fontFamily + "; " +
                "font-size:" + style.fontSize + "; " +
                "font-weight:" + style.fontWeight + "; " +
                "color:" + style.color + "; " +
                "background-color:" + style.backgroundColor + "; " +
                "text-shadow:" + style.textShadow + "; " +
                "visibility:" + style.visibility + "; " +
                "left:" + style.left + "; " +
                "top:" + style.top + "; " +
                "padding-left:" + style.paddingLeft + "; " +
                "padding-right:" + style.paddingRight + "; " +
                "padding-top:" + style.paddingTop + "; " +
                "padding-bottom:" + style.paddingBottom + "; " +
                "'>" + labels[i].text.getValueDirect().join("") + 
                "</span>";                
    }   
    data += "</div>" +
            "</foreignObject>" + 
            "</svg>";
        
    // create Image and set data as its src
    var img = new Image();
    img.src = data;

    // fill 2D canvas with background color
    ctx.fillStyle = maskColor;
    ctx.fillRect(0, 0, canvas2D.width, canvas2D.height);
    
    // draw image to 2D canvas
    ctx.drawImage(img, 0, 0);

    return { canvas: canvas2D, maskColor: maskColor }
}

ScreenCaptureCommand.prototype.eventPerformed = function(event)
{
    // if mouse-move event, don't process if any other mouse button is pressed (this affects object inspection)
    switch (event.type)
    {
        case eEventType.RenderBegin:
            {
                var screenCaptureRect = this.registry.find("ScreenCaptureRect");                    // TODO: change name
                var screenCaptureTexture = this.registry.find("ScreenCaptureTexture")
                if (screenCaptureRect && screenCaptureTexture)
                {
                    // set 2D element canvas to screen capture texture
                    var canvas2D = this.get2DElementCanvas(document.getElementById(this.canvasId.getValueDirect().join("")));
                    screenCaptureTexture.textureObj.setImageWithCanvas(canvas2D.canvas);
                    screenCaptureTexture.imageSet = true;
                    // TODO: set blendOp/maskColor
                    //screenCaptureTexture.setTextureColorMask(0, 0, 0, 1);

                    // set screen capture texture to screen capture rect object
                    screenCaptureRect.setTexture(screenCaptureTexture);

                    // show screen capture rect object
                    screenCaptureRect.enabled.setValueDirect(true);
                }
            }
            break;

        case eEventType.RenderEnd:
            {
                this.screenCapture(this.canvasId.getValueDirect().join(""));
                // hide screen capture rect object
                var screenCaptureRect = this.registry.find("ScreenCaptureRect");
                if (screenCaptureRect)
                {
                    screenCaptureRect.enabled.setValueDirect(false);
                }
            }
            break;
    }
}
