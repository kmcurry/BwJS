SnapConnector.prototype = new AttributeContainer();
SnapConnector.prototype.constructor = SnapConnector;

function SnapConnector()
{
    AttributeContainer.call(this);
    this.className = "SnapConnector";
    this.attrType = eAttrType.SnapConnector;

    this.type = new StringAttr("");
    this.normal = new Vector3DAttr(0, 0, 0);
    this.connected = new BooleanAttr(false);

    this.registerAttribute(this.type, "type");
    this.registerAttribute(this.normal, "normal");
    this.registerAttribute(this.connected, "connected");
}

SocketConnector.prototype = new SnapConnector();
SocketConnector.prototype.constructor = SocketConnector;

function SocketConnector()
{
    SnapConnector.call(this);
    this.className = "SocketConnector";
    this.attrType = eAttrType.SocketConnector;

    this.slot1 = new SphereAttr();
    this.slot2 = new SphereAttr();

    this.registerAttribute(this.slot1, "slot1");
    this.registerAttribute(this.slot2, "slot2");
}

PlugConnector.prototype = new SnapConnector();
PlugConnector.prototype.constructor = PlugConnector;

function PlugConnector()
{
    SnapConnector.call(this);
    this.className = "PlugConnector";
    this.attrType = eAttrType.PlugConnector;

    this.pin1 = new SphereAttr();
    this.pin2 = new SphereAttr();

    this.registerAttribute(this.pin1, "pin1");
    this.registerAttribute(this.pin2, "pin2");
}

PlugConnector.prototype.collides = function (socketConnector, plugWorldMatrix, socketWorldMatrix)
{
    // check pin1/socket1
    this.pin1.sphere.setTransform(plugWorldMatrix);
    socketConnector.slot1.sphere.setTransform(socketWorldMatrix);

    if (this.pin1.sphere.intersects(socketConnector.slot1.sphere))
    {
        return 1;
    }

    // check pin2/socket2
    this.pin2.sphere.setTransform(plugWorldMatrix);
    socketConnector.slot2.sphere.setTransform(socketWorldMatrix);

    if (this.pin2.sphere.intersects(socketConnector.slot2.sphere))
    {
        return 2;
    }

    // no collision detected
    return 0;
}

SocketConnectors.prototype = new AttributeVector();
SocketConnectors.prototype.constructor = SocketConnectors;

function SocketConnectors()
{
    AttributeVector.call(this, new SocketConnectorAllocator());
    this.className = "SocketConnectors";
    this.attrType = eAttrType.SocketConnectors;

    this.appendParsedElements.setValueDirect(true);
}

SocketConnectorAllocator.prototype = new Allocator();
SocketConnectorAllocator.prototype.constructor = SocketConnectorAllocator;

function SocketConnectorAllocator()
{
}

SocketConnectorAllocator.prototype.allocate = function ()
{
    return new SocketConnector();
}

PlugConnectors.prototype = new AttributeVector();
PlugConnectors.prototype.constructor = PlugConnectors;

function PlugConnectors()
{
    AttributeVector.call(this, new PlugConnectorAllocator());
    this.className = "PlugConnectors";
    this.attrType = eAttrType.PlugConnectors;

    this.appendParsedElements.setValueDirect(true);
}

PlugConnectorAllocator.prototype = new Allocator();
PlugConnectorAllocator.prototype.constructor = PlugConnectorAllocator;

function PlugConnectorAllocator()
{
}

PlugConnectorAllocator.prototype.allocate = function ()
{
    return new PlugConnector();
}


