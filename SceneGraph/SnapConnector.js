SnapConnector.prototype = new AttributeContainer();
SnapConnector.prototype.constructor = SnapConnector;

function SnapConnector()
{
    AttributeContainer.call(this);
    this.className = "SnapConnector";
    this.attrType = eAttrType.SnapConnector;

    this.name = new StringAttr();
    this.type = new StringAttr("default");
    this.normal = new Vector3DAttr(0, 0, 0);
    this.connected = new BooleanAttr(false);

    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.type, "type");
    this.registerAttribute(this.normal, "normal");
    this.registerAttribute(this.connected, "connected");
}

GenericConnector.prototype = new SnapConnector();
GenericConnector.prototype.constructor = GenericConnector;

function GenericConnector()
{
    SnapConnector.call(this);
    this.className = "GenericConnector";
    this.attrType = eAttrType.GenericConnector;

    this.point = new SphereAttr();

    this.registerAttribute(this.point, "point");
}

GenericConnector.prototype.collides = function(genericConnector, colliderWorldMatrix, collideeWorldMatrix)
{
    // check point/point
    this.point.sphere.setTransform(colliderWorldMatrix);
    genericConnector.point.sphere.setTransform(collideeWorldMatrix);

    if (this.point.sphere.intersects(genericConnector.point.sphere))
    {
        return 1;
    }

    // no collision detected
    return 0;
}

GenericConnectors.prototype = new AttributeVector();
GenericConnectors.prototype.constructor = GenericConnectors;

function GenericConnectors()
{
    AttributeVector.call(this, new GenericConnectorAllocator());
    this.className = "GenericConnectors";
    this.attrType = eAttrType.GenericConnectors;

    this.appendParsedElements.setValueDirect(true);
}

GenericConnectors.prototype.get = function(name)
{
    var length = this.Size();
    for (var i = 0; i < length; i++)
    {
        var connector = this.getAt(i);
        if (connector.getAttribute("name").getValueDirect().join("") == name)
        {
            return connector;
        }
    }
    
    return null;
}
    
GenericConnectorAllocator.prototype = new Allocator();
GenericConnectorAllocator.prototype.constructor = GenericConnectorAllocator;

function GenericConnectorAllocator()
{
}

GenericConnectorAllocator.prototype.allocate = function ()
{
    return new GenericConnector();
}

SocketConnector.prototype = new SnapConnector();
SocketConnector.prototype.constructor = SocketConnector;

function SocketConnector()
{
    SnapConnector.call(this);
    this.className = "SocketConnector";
    this.attrType = eAttrType.SocketConnector;

    this.slot = 0;
    
    this.slot1 = new SphereAttr();
    this.slot2 = new SphereAttr();

    this.registerAttribute(this.slot1, "slot1");
    this.registerAttribute(this.slot2, "slot2");
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

SocketConnectors.prototype.get = function(name)
{
    var length = this.Size();
    for (var i = 0; i < length; i++)
    {
        var connector = this.getAt(i);
        if (connector.getAttribute("name").getValueDirect().join("") == name)
        {
            return connector;
        }
    }
    
    return null;
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

PlugConnector.prototype.collides = function(socketConnector, plugWorldMatrix, socketWorldMatrix)
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

PlugConnectors.prototype = new AttributeVector();
PlugConnectors.prototype.constructor = PlugConnectors;

function PlugConnectors()
{
    AttributeVector.call(this, new PlugConnectorAllocator());
    this.className = "PlugConnectors";
    this.attrType = eAttrType.PlugConnectors;

    this.appendParsedElements.setValueDirect(true);
}

PlugConnectors.prototype.get = function(name)
{
    var length = this.Size();
    for (var i = 0; i < length; i++)
    {
        var connector = this.getAt(i);
        if (connector.getAttribute("name").getValueDirect().join("") == name)
        {
            return connector;
        }
    }
    
    return null;
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


