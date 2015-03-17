SnapMgr.prototype = new AttributeContainer();
SnapMgr.prototype.constructor = SnapMgr;

function SnapMgr()
{
    AttributeContainer.call(this);
    this.className = "SnapMgr";

    this.name = new StringAttr("SnapMgr");

    this.registerAttribute(this.name, "name");
}

SnapMgr.prototype.snapGenericToGeneric = function(snapper, snappee, snapperConnector, snappeeConnector)
{
    // set rotation
    var matrix = new Matrix4x4();
    
    // rotate so that normals are coincident; do this by rotating angle between
    // the normals degrees about the cross product of the normals
    var snappeeNormal = snappeeConnector.getAttribute("normal").getValueDirect();
    snappeeNormal = new Vector3D(snappeeNormal.x, snappeeNormal.y, snappeeNormal.z);
    snappeeNormal.normalize();

    var snapperNormal = snapperConnector.getAttribute("normal").getValueDirect();
    snapperNormal = new Vector3D(snapperNormal.x, snapperNormal.y, snapperNormal.z);
    snapperNormal.normalize();

    var cross = crossProduct(snappeeNormal, snapperNormal);
    var cosAngle = cosineAngleBetween(snappeeNormal, snapperNormal);
    var angleBetween = 180 - toDegrees(Math.acos(cosAngle));
    if (angleBetween > 0)
    {
        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadRotation(cross.x, cross.y, cross.z, angleBetween);

        matrix = rotationMatrix;
    }

    // set position

    // get positions of points to connect 
    var point1, point2;
    point1 = snapperConnector.getAttribute("point").getAttribute("center").getValueDirect();
    point1 = matrix.transform(point1.x, point1.y, point1.z, 1);
    point2 = snappeeConnector.getAttribute("point").getAttribute("center").getValueDirect();
    
    var translationMatrix = new Matrix4x4();
    translationMatrix.loadTranslation(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
    matrix = matrix.multiply(translationMatrix);
    
    // perform snap
    this.snap(snapper, snappee, matrix);
}

SnapMgr.prototype.snapPlugToSocket = function(plug, socket, plugConnector, socketConnector, slot)
{
    // set rotation
    var matrix = new Matrix4x4();
    
    // rotate so that normals are coincident; do this by rotating angle between
    // the normals degrees about the cross product of the normals
    var socketNormal = socketConnector.getAttribute("normal").getValueDirect();
    socketNormal = new Vector3D(socketNormal.x, socketNormal.y, socketNormal.z);
    socketNormal.normalize();

    var plugNormal = plugConnector.getAttribute("normal").getValueDirect();
    plugNormal = new Vector3D(plugNormal.x, plugNormal.y, plugNormal.z);
    plugNormal.normalize();

    var cross = crossProduct(socketNormal, plugNormal);
    var cosAngle = cosineAngleBetween(socketNormal, plugNormal);
    var angleBetween = 180 - toDegrees(Math.acos(cosAngle));
    if (angleBetween > 0)
    {
        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadRotation(cross.x, cross.y, cross.z, angleBetween);

        matrix = rotationMatrix;
    }

    // line up the unconnected slot; do this by rotating the angle between the
    // remaining slot (socket unconnected - connected) and
    // (plug unconnected - connected) about the socket normal
    var pin1 = plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
    var slot1 = socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
    var pin2 = plugConnector.getAttribute("pin2").getAttribute("center").getValueDirect();
    var slot2 = socketConnector.getAttribute("slot2").getAttribute("center").getValueDirect();

    pin1 = matrix.transform(pin1.x, pin1.y, pin1.z, 1);
    pin2 = matrix.transform(pin2.x, pin2.y, pin2.z, 1);

    var pinToPin, slotToSlot;
    switch (slot)
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

    // set position

    // get positions of pin and slot to connect 
    var pin, slot;
    switch (slot)
    {
        case 1:
            pin = plugConnector.getAttribute("pin1").getAttribute("center").getValueDirect();
            slot = socketConnector.getAttribute("slot1").getAttribute("center").getValueDirect();
            break;

        case 2:
            pin = plugConnector.getAttribute("pin2").getAttribute("center").getValueDirect();
            slot = socketConnector.getAttribute("slot2").getAttribute("center").getValueDirect();
            break;

        default:
            return;
    }
    pin = matrix.transform(pin.x, pin.y, pin.z, 1);
    
    var translationMatrix = new Matrix4x4();
    translationMatrix.loadTranslation(slot.x - pin.x, slot.y - pin.y, slot.z - pin.z);
    matrix = matrix.multiply(translationMatrix);
    
    // perform snap
    this.snap(plug, socket, matrix);
}

SnapMgr.prototype.snap = function(snapper, snappee, matrix)
{
    var i, j, k;
    var vertices, xvertices, xvertex;
    var normals, xnormals, xnormal;
    var center, xcenter;

    // copy snapper surfaces to snappee
    var surfaces = snapper.surfaces;
    for (i = 0; i < surfaces.length; i++)
    {
        var surface = surfaces[i].clone();
        snappee.addSurface(surface);

        // copy geometry
        var geometries = surfaces[i].geometries;
        for (j = 0; j < geometries.length; j++)
        {
            var geometry = geometries[j].clone();

            // transform vertices/normals
            xvertices = [];
            vertices = geometry.getAttribute("vertices").getValueDirect();
            for (k = 0; k < vertices.length; k += 3)
            {
                xvertex = matrix.transform(vertices[k], vertices[k + 1], vertices[k + 2], 1);
                xvertices.push(xvertex.x);
                xvertices.push(xvertex.y);
                xvertices.push(xvertex.z);
            }
            geometry.getAttribute("vertices").setValueDirect(xvertices);

            xnormals = [];
            normals = geometry.getAttribute("normals").getValueDirect();
            for (k = 0; k < normals.length; k += 3)
            {
                xnormal = matrix.transform(normals[k], normals[k + 1], normals[k + 2], 0);
                xnormals.push(xnormal.x);
                xnormals.push(xnormal.y);
                xnormals.push(xnormal.z);
            }
            geometry.getAttribute("normals").setValueDirect(xnormals);

            snappee.addGeometry(geometry, null, surface);
        }
    }
    
    // append (transformed) snapper vertices to snappee
    xvertices = [];
    vertices = snapper.getAttribute("vertices").getValueDirect();
    for (i = 0; i < vertices.length; i += 3)
    {
        xvertex = matrix.transform(vertices[i], vertices[i + 1], vertices[i + 2], 1);
        xvertices.push(xvertex.x);
        xvertices.push(xvertex.y);
        xvertices.push(xvertex.z);
    }
    vertices = snappee.getAttribute("vertices").getValueDirect();   
    vertices = vertices.concat(xvertices);
    snappee.getAttribute("vertices").setValueDirect(vertices);
   
    // copy (transformed) snap connectors to snappee
    
    // generics
    var snappeeGenericConnectors = snappee.getAttribute("genericConnectors");  
    var snapperGenericConnectors = snapper.getAttribute("genericConnectors");
    for (i = 0; i < snapperGenericConnectors.Size(); i++)
    {
        var genericConnector = snapperGenericConnectors.getAt(i);
        var xgenericConnector = new GenericConnector();
        xgenericConnector.synchronize(genericConnector);
        
        center = xgenericConnector.point.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xgenericConnector.point.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        snappeeGenericConnectors.push_back(xgenericConnector);
    }
    
    // plugs
    var snappeePlugConnectors = snappee.getAttribute("plugConnectors");  
    var snapperPlugConnectors = snapper.getAttribute("plugConnectors");
    for (i = 0; i < snapperPlugConnectors.Size(); i++)
    {
        var plugConnector = snapperPlugConnectors.getAt(i);
        var xplugConnector = new PlugConnector();
        xplugConnector.synchronize(plugConnector);
        
        center = xplugConnector.pin1.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xplugConnector.pin1.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        center = xplugConnector.pin2.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xplugConnector.pin2.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        snappeePlugConnectors.push_back(xplugConnector);
    }
    
    // sockets
    var snappeeSocketConnectors = snappee.getAttribute("socketConnectors");
    var snapperSocketConnectors = snapper.getAttribute("socketConnectors");
    for (i = 0; i < snapperSocketConnectors.Size(); i++)
    {
        var socketConnector = snapperSocketConnectors.getAt(i);
        var xsocketConnector = new SocketConnector();
        xsocketConnector.synchronize(socketConnector);
        
        center = xsocketConnector.slot1.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xsocketConnector.slot1.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        center = xsocketConnector.slot2.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xsocketConnector.slot2.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        snappeeSocketConnectors.push_back(xsocketConnector);
    }
    
    // disable (hide) snapper
    snapper.getAttribute("enabled").setValueDirect(false);
    
    // TODO: track these updates for unsnap
}

SnapMgr.prototype.unsnap = function(snapper, snappee)
{
}