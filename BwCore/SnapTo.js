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

    this.target.addModifiedCB(SnapToCommand_TargetModifiedCB, this);
    this.socket.addModifiedCB(SnapToCommand_TargetModifiedCB, this);
    this.plug.addModifiedCB(SnapToCommand_PlugModifiedCB, this);

    this.registerAttribute(this.socket, "socket");
    this.registerAttribute(this.plug, "plug");
    this.registerAttribute(this.slot, "slot");
    this.registerAttribute(this.socketConnector, "socketConnector");
    this.registerAttribute(this.plugConnector, "plugConnector");

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
    // parent plug to socket; clear its position/rotation/scale and inspection group
    plug.setMotionParent(socket);
    plug.getAttribute("position").setValueDirect(0, 0, 0);
    plug.getAttribute("rotation").setValueDirect(0, 0, 0);
    plug.getAttribute("scale").setValueDirect(1, 1, 1);
    zeroInspectionGroup(plug);

    // set rotation
    var matrix = new Matrix4x4();
    
    // rotate so that normals are coincident; do this by rotating angle between
    // the normals degrees about the cross product of the normals
    var socketNormal = this.socketConnector.getAttribute("normal").getValueDirect();
    socketNormal = new Vector3D(socketNormal.x, socketNormal.y, socketNormal.z);
    socketNormal.normalize();

    var plugNormal = this.plugConnector.getAttribute("normal").getValueDirect();
    plugNormal = new Vector3D(plugNormal.x, plugNormal.y, plugNormal.z);
    plugNormal.normalize();

    var cross = crossProduct(socketNormal, plugNormal);
    var cosAngle = cosineAngleBetween(socketNormal, plugNormal);
    angleBetween = 180 - toDegrees(Math.acos(cosAngle));
    if (angleBetween > 0)
    {
        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadRotation(cross.x, cross.y, cross.z, angleBetween);

        matrix = rotationMatrix;
    }

    // line up the unconnected slot; do this by rotating the angle between the
    // remaining slot (socket unconnected - connected) and
    // (plug unconnected - connected) about the socket normal
    var pin1 = this.plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
    var slot1 = this.socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
    var pin2 = this.plugConnector.getAttribute("pin2").getAttribute("center").getValueDirect();
    var slot2 = this.socketConnector.getAttribute("slot2").getAttribute("center").getValueDirect();

    pin1 = matrix.transform(pin1.x, pin1.y, pin1.z, 1);
    pin2 = matrix.transform(pin2.x, pin2.y, pin2.z, 1);

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
        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadRotation(plugNormal.x, plugNormal.y, plugNormal.z, angleBetween);

        matrix = matrix.multiply(rotationMatrix);
    }

    var rotationAngles = matrix.getRotationAngles();
    plug.getAttribute("rotation").setValueDirect(rotationAngles.x, rotationAngles.y, rotationAngles.z);

    // set position

    // get positions of pin and slot to connect 
    var pin, slot;
    switch (this.slot.getValueDirect())
    {
        case 1:
            pin = this.plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
            slot = this.socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
            break;

        case 2:
            pin = this.plugConnector.getAttribute("pin2").getAttribute("center").getValueDirect();
            slot = this.socketConnector.getAttribute("slot2").getAttribute("center").getValueDirect();
            break;

        default:
            return;
    }
    pin = matrix.transform(pin.x, pin.y, pin.z, 1);

    plug.getAttribute("sectorPosition").setValueDirect(slot.x - pin.x, slot.y - pin.y, slot.z - pin.z);
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
