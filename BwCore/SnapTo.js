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
        this.snapTo(this.socketModel, this.plugModel);//
        //this.socketWorldMatrix.getValueDirect(),
        //this.plugWorldMatrix.getValueDirect());
    }
}

SnapToCommand.prototype.snapTo = function(socket, plug)//, socketWorldMatrix, plugWorldMatrix)
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
    
    pin = plugWorldMatrix.transform(pin.x, pin.y, pin.z, 1);
    slot = socketWorldMatrix.transform(slot.x, slot.y, slot.z, 1);
    
    var delta = new Vector3D(slot.x - pin.x, slot.y - pin.y, slot.z - pin.z);
    var plugPos = plug.getAttribute("sectorPosition").getValueDirect();
    plug.getAttribute("sectorPosition").setValueDirect(plugPos.x + delta.x,
            plugPos.y + delta.y,
            plugPos.z + delta.z);
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
