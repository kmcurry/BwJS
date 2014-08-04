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
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href = image;
}
