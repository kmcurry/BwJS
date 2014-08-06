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
    bworks.eventMgr.addListener(eEventType.RenderEnd, this);
}

ScreenCaptureCommand.prototype.screenCapture = function(canvasId)
{
    var canvas = document.getElementById(canvasId);  
    var imageData = canvas.toDataURL('image/png');
    
    // copy to clipboard
    // TODO: investigate method described at: https://forums.mozilla.org/addons/viewtopic.php?t=9736&p=21119
    
    // open in new window
    window.open(imageData);
    
    // download
    //var imageDataStream = imageData.replace("image/png", "image/octet-stream");
    //window.location.href = imageDataStream;
}

ScreenCaptureCommand.prototype.eventPerformed = function(event)
{
    // if mouse-move event, don't process if any other mouse button is pressed (this affects object inspection)
    switch (event.type)
    {
        case eEventType.RenderEnd:
        {
            this.screenCapture(this.canvasId.getValueDirect().join(""));
            return;        
        }
        break;
    }
}
