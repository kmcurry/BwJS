SnapToCommand.prototype = new Command();
SnapToCommand.prototype.constructor = SnapToCommand;

function SnapToCommand()
{
    Command.call(this);
    this.className = "SnapTo";
    this.attrType = eAttrType.SnapTo;

    this.plugModel = null;
    this.socketModel = null;

    this.socket = new StringAttr("");
    this.plug = new StringAttr("");
    this.slot = new NumberAttr(0);
    this.socketConnector = new SocketConnector();
    this.plugConnector = new PlugConnector();
    this.socketWorldMatrix = new Matrix4x4Attr(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);
    this.plugWorldMatrix = new Matrix4x4Attr(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);

    this.target.addModifiedCB(SnapToCommand_TargetModifiedCB, this);
    this.socket.addModifiedCB(SnapToCommand_TargetModifiedCB, this);
    this.plug.addModifiedCB(SnapToCommand_PlugModifiedCB, this);

    this.registerAttribute(this.socket, "socket");
    this.registerAttribute(this.plug, "plug");
    this.registerAttribute(this.slot, "slot");
    this.registerAttribute(this.socketConnector, "socketConnector");
    this.registerAttribute(this.plugConnector, "plugConnector");
    this.registerAttribute(this.socketWorldMatrix, "socketWorldMatrix");
    this.registerAttribute(this.plugWorldMatrix, "plugWorldMatrix");

    this.target.addTarget(this.socket, null, null, false);
}

SnapToCommand.prototype.execute = function()
{
    if (this.socketModel && this.plugModel)
    {
        this.snapTo(this.socketModel, this.plugModel);
    }
}

SnapToCommand.prototype.snapTo = function(socket, plug)
{
    var pin, slot;
    switch (this.slot.getValueDirect())
    {
        case 1:
            pin = this.plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
            slot = this.socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
            break;

        case 2:
            pin = this.plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
            slot = this.socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
            break;

        default:
            return;
    }

    var socketWorldMatrix = this.socketWorldMatrix.getValueDirect();
    var plugWorldMatrix = this.plugWorldMatrix.getValueDirect();

    // set rotation

    // rotate so that normals are coincident; do this by rotating angle between
    // the normals degrees about the cross product of the normals
    var socketNormal = this.socketConnector.getAttribute("normal").getValueDirect();
    socketNormal = new Vector3D(socketNormal.x, socketNormal.y, socketNormal.z);
    var plugNormal = this.plugConnector.getAttribute("normal").getValueDirect();
    plugNormal = new Vector3D(plugNormal.x, plugNormal.y, plugNormal.z);
    var cross = crossProduct(socketNormal, plugNormal);
    var cosAngle = cosineAngleBetween(socketNormal, plugNormal);
    angleBetween = toDegrees(Math.acos(cosAngle));
    if (angleBetween > 0)
    {
        if (cosAngle < 0)
            angleBetween = -angleBetween;

        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadRotation(cross.x, cross.y, cross.z, angleBetween);
        var rotationAngles = rotationMatrix.getRotationAngles();

        plugWorldMatrix = plugWorldMatrix.leftMultiply(rotationMatrix);

        var rotation = plug.getAttribute("rotation").getValueDirect();
        plug.getAttribute("rotation").setValueDirect(rotation.x + rotationAngles.x,
                rotation.y + rotationAngles.y, rotation.z + rotationAngles.z);
    }

    pin = plugWorldMatrix.transform(pin.x, pin.y, pin.z, 1);
    slot = socketWorldMatrix.transform(slot.x, slot.y, slot.z, 1);

    // set position
    var delta = new Vector3D(slot.x - pin.x, slot.y - pin.y, slot.z - pin.z);
    var plugPos = plug.getAttribute("sectorPosition").getValueDirect();
    plug.getAttribute("sectorPosition").setValueDirect(plugPos.x + delta.x,
            plugPos.y + delta.y,
            plugPos.z + delta.z);

    // line up the unconnected slot; do this by rotating the angle between the
    // remaining slot (socket unconnected - connected) and
    // (plug unconnected - connected) about the socket normal
    var pin1 = this.plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
    var slot1 = this.socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
    var pin2 = this.plugConnector.getAttribute("pin2").getAttribute("center").getValueDirect();
    var slot2 = this.socketConnector.getAttribute("slot2").getAttribute("center").getValueDirect();
    
    pin1 = plugWorldMatrix.transform(pin1.x, pin1.y, pin1.z, 1);
    slot1 = socketWorldMatrix.transform(slot1.x, slot1.y, slot1.z, 1);
    pin2 = plugWorldMatrix.transform(pin2.x, pin2.y, pin2.z, 1);
    slot2 = socketWorldMatrix.transform(slot2.x, slot2.y, slot2.z, 1);
    
    var pinToPin, slotToSlot;
    switch (this.slot.getValueDirect())
    {
        case 1:
            pinToPin = new Vector3D(pin2.x - pin1.x, pin2.y - pin1.y, pin2.z - pin1.z);
            slotToSlot = new Vector3D(slot2.x - slot1.x, slot2.y - slot1.y, slot2.z - slot1.z);
            break;

        case 2:
            pinToPin = new Vector3D(pin1.x - pin2.x, pin1.y - pin2.y, pin1.z - pin2.z);
            slotToSlot = new Vector3D(slot1.x - slot2.x, slot1.y - slot2.y, slot1.z - slot2.z);
            break;

        default:
            return;
    }
    
    cosAngle = cosineAngleBetween(pinToPin, slotToSlot);
    angleBetween = toDegrees(Math.acos(cosAngle));
    if (angleBetween > 0)
    {
        if (cosAngle < 0)
            angleBetween = -angleBetween;

        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadRotation(socketNormal.x, socketNormal.y, socketNormal.z, angleBetween);
        var rotationAngles = rotationMatrix.getRotationAngles();

        plugWorldMatrix = plugWorldMatrix.leftMultiply(rotationMatrix);

        var rotation = plug.getAttribute("rotation").getValueDirect();
        plug.getAttribute("rotation").setValueDirect(rotation.x + rotationAngles.x,
                rotation.y + rotationAngles.y, rotation.z + rotationAngles.z);
    }
}

function SnapToCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
        container.socketModel = resource;
    }
}

function SnapToCommand_PlugModifiedCB(attribute, container)
{
    var plug = attribute.getValueDirect().join("");
    var resource = container.registry.find(plug);
    if (resource)
    {
        container.plugModel = resource;
    }
}
