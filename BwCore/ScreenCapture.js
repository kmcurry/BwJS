ScreenCaptureCommand.prototype = new Command();
ScreenCaptureCommand.prototype.constructor = ScreenCaptureCommand;

function ScreenCaptureCommand()
{
    Command.call(this);
    this.className = "ScreenCapture";
    this.attrType = eAttrType.ScreenCapture;

    this.filename = new StringAttr();
    
    this.registerAttribute(this.filename, "filename");
}

ScreenCaptureCommand.prototype.execute = function()
{
    this.screenCapture(this.filename.getValueDirect().join(""));
}

ScreenCaptureCommand.prototype.screenCapture = function(filename)
{
}
