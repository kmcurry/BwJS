ScreenCaptureCommand.prototype = new Command();
ScreenCaptureCommand.prototype.constructor = ScreenCaptureCommand;

function ScreenCaptureCommand()
{
    Command.call(this);
    this.className = "ScreenCapture";
    this.attrType = eAttrType.ScreenCapture;

    this.canvasId = new StringAttr();
    
    this.registerAttribute(this.canvasId, "canvasId");
}

ScreenCaptureCommand.prototype.execute = function()
{
    this.screenCapture(this.canvasId.getValueDirect().join(""));
}

ScreenCaptureCommand.prototype.screenCapture = function(canvasId)
{
    var canvas = document.getElementById(canvasId);
    
    // copy to clipboard
    // TODO: investigate method described at: https://forums.mozilla.org/addons/viewtopic.php?t=9736&p=21119
    
    // open in new window
    window.open(canvas.toDataURL('image/png'));
    
    // download
    //var imageData = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    //window.location.href = imageData;
}
