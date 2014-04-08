MotionInterpolateCommand.prototype = new AutoInterpolateCommand();
MotionInterpolateCommand.prototype.constructor = MotionInterpolateCommand;

function MotionInterpolateCommand()
{
    AutoInterpolateCommand.call(this);
    this.className = "MotionInterpolateCommand";

    this.startPosition = new Vector3DAttr();
    this.endPosition = new Vector3DAttr();
    this.resultPosition = new Vector3DAttr();
    this.positionControl = new Vector3DAttr();
    this.easeIn = new BooleanAttr(true);
    this.easeOut = new BooleanAttr(true);
    this.midPosition = new Vector3DAttr();

    //this.resultPosition.addModifiedCB(MotionInterpolateCommand_ResultPositionModifiedCB, this);
    
    this.registerAttribute(this.startPosition, "startPosition");
    this.registerAttribute(this.endPosition, "endPosition");
    this.registerAttribute(this.resultPosition, "resultPosition");
    this.registerAttribute(this.positionControl, "positionControl");
    this.registerAttribute(this.easeIn, "easeIn");
    this.registerAttribute(this.easeOut, "easeOut");
}

MotionInterpolateCommand.prototype.execute = function()
{
    // call base-class implementation
    AutoInterpolateCommand.prototype.execute.call(this);
}

MotionInterpolateCommand.prototype.buildMotion = function()
{
    var factory = this.registry.find("AttributeFactory");
    this.kfi = factory.create("KeyframeInterpolator");
    if (!this.kfi)
    {
        return;
    }
    this.kfi.getAttribute("enabled").setValueDirect(false);
    this.kfi.getAttribute("renderAndRelease").copyValue(this.renderAndRelease);

    this.numChannels = 3;
    this.kfi.setNumChannels(this.numChannels);

    var pre = this.preBehavior.getValueDirect();
    var post = this.postBehavior.getValueDirect();
    for (var i = 0; i < this.numChannels; i++)
    {
        this.kfi.getAttribute("preBehaviors").getAt(i).setValueDirect(pre);
        this.kfi.getAttribute("postBehaviors").getAt(i).setValueDirect(post);
    }

    // set the keyframes
    this.setKeyframes();
}

MotionInterpolateCommand.prototype.setKeyframes = function()
{
    // get start position
    var startPosition = this.startPosition.getValueDirect();

    // get end position
    var endPosition = this.endPosition.getValueDirect();

    // get distance between start/end
    var positionDelta = distanceBetween(startPosition, endPosition);

    // get position control vector
    var positionControl = new Vector3D(); 
    positionControl.copy(this.positionControl.getValueDirect());
    positionControl.normalize();

    // get mid position
    var midPosition = new Vector3D(
        ((startPosition.x + endPosition.x) / 2) + (positionControl.x * (positionDelta / 2)),
        ((startPosition.y + endPosition.y) / 2) + (positionControl.y * (positionDelta / 2)),
        ((startPosition.z + endPosition.z) / 2) + (positionControl.z * (positionDelta / 2)));
    this.midPosition.setValueDirect(midPosition.x, midPosition.y, midPosition.z);

    // get ease-in, ease-out settings
    var easeIn = this.easeIn.getValueDirect();
    var easeOut = this.easeOut.getValueDirect();

    // get shape
    var shape = this.shape.getValueDirect();

    // get duration
    var duration = this.duration.getValueDirect();

    // for each channel...
    for (var channel = 0; channel < this.numChannels; channel++)
    {
        var keyframes = this.kfi.getAttribute("channels").getAt(channel);

        var start = new KeyframeAttr();
        var mid = new KeyframeAttr();
        var end = new KeyframeAttr();

        start.getAttribute("time").setValueDirect(0);
        mid.getAttribute("time").setValueDirect(duration * 0.5);
        end.getAttribute("time").setValueDirect(duration);

        start.getAttribute("shape").setValueDirect(shape);
        mid.getAttribute("shape").setValueDirect(shape);
        end.getAttribute("shape").setValueDirect(shape);

        start.getAttribute("value").setValueDirect(this.startPosition.getElement(channel));
        mid.getAttribute("value").setValueDirect(this.midPosition.getElement(channel));
        end.getAttribute("value").setValueDirect(this.endPosition.getElement(channel));

        keyframes.push_back(start);
        keyframes.push_back(mid);
        keyframes.push_back(end);

        this.kfi.getAttribute("resultValues").getAt(channel).addElementTarget(this.resultPosition, 0, channel);
    }
}

function MotionInterpolateCommand_ResultPositionModifiedCB(attribute, container)
{
    var value = attribute.getValueDirect();

    OutputDebugMsg("x: " + value.x + " y: " + value.y + " z: " + value.z + "\n");
}