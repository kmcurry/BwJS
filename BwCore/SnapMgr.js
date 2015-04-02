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
    
    snapperConnector.getAttribute("connected").setValueDirect(true);
    snappeeConnector.getAttribute("connected").setValueDirect(true);
    
    // perform snap
    var snapped = this.snap(snapper, snappee, matrix);
    
    return snapped;
}

SnapMgr.prototype.snapPlugToSocket = function(plug, socket, plugConnector, socketConnector)
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
    switch (socketConnector.slot)
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
    switch (socketConnector.slot)
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
    
    plugConnector.getAttribute("connected").setValueDirect(true);
    socketConnector.getAttribute("connected").setValueDirect(true);
    
    // perform snap
    var snapped = this.snap(plug, socket, matrix);
    
    return snapped;
}

SnapMgr.prototype.snap = function(snapper, snappee, matrix)
{
    // if snappee is not a SnapModel, create one and snap snappee onto it first
    if (snappee.attrType != eAttrType.SnapModel)
    {
        var factory = this.registry.find("AttributeFactory");
        var snapModel = factory.create("SnapModel");
        snapModel.synchronize(snappee, true);
        // reset modification counts for surface attributes so they aren't set to snapped surfaces
        snapModel.color.modificationCount = 0;
        snapModel.ambientLevel.modificationCount = 0;
        snapModel.diffuseLevel.modificationCount = 0;
        snapModel.specularLevel.modificationCount = 0;
        snapModel.emissiveLevel.modificationCount = 0;
        snapModel.ambient.modificationCount = 0;
        snapModel.diffuse.modificationCount = 0;
        snapModel.specular.modificationCount = 0;
        snapModel.emissive.modificationCount = 0;
        snapModel.glossiness.modificationCount = 0;
        snapModel.opacity.modificationCount = 0;
        snapModel.doubleSided.modificationCount = 0;
        snapModel.texturesEnabled.modificationCount = 0;
        // don't copy vertices/snapConnectors
        snapModel.vertices.setValueDirect(new Array());
        snapModel.genericConnectors.clear();
        snapModel.plugConnectors.clear();
        snapModel.socketConnectors.clear();
        // set name
        var name = "CompoundModel_" + snapModel.__nodeId__;
        snapModel.name.setValueDirect(name);
        // enable physics
        snapModel.physicsEnabled.setValueDirect(true);
        // update transforms
        snapModel.updateSimpleTransform();
        snapModel.updateCompoundTransform();
        
        snapModel.snap(snappee, new Matrix4x4());
        snappee.getParent(0).addChild(snapModel);
        snappee = snapModel;
        
        // add to physics simulator
        var physicsSimulator = this.registry.find("PhysicsSimulator");
        physicsSimulator.createPhysicsBody(snappee);
        // Note: could also update the "bodies" vector to add the compound model 
        // to the physics simulator, and this would be necessary if bodies vector needs
        // to change during the lifetime of the compound model
    }
    
    if (snapper.attrType == eAttrType.SnapModel)
    {
        // snap snapper's snaps onto snappee
        var snaps = snapper.snaps;
        
        // remove snapper first
        snapper.getParent(0).removeChild(snapper);
        // invoke onRemove
        snapper.onRemove();
        // remove from registry
        this.registry.unregister(snapper);
        // delete
        snapper.destroy();
        
        // snap snapper's snaps
        for (var i in snaps)
        {
            if (snaps[i])
            {
                this.snap(snaps[i].model, snappee, snaps[i].matrix.multiply(matrix));
            }
        }
    }
    else // simple model (not a SnapModel)
    {
        snappee.snap(snapper, matrix);
    }
    
    return snappee;
}

SnapMgr.prototype.resnap = function(models)
{
    var i, j;
    var rootSnaps = [];
    
    var snapModels = [];
    for (i = 0; i < models.length; i++)
    {
        snapModels.push(null);
    }
    
    for (i = 0; i < models.length; i++)
    {
        if (snapModels[i] != null) continue; // already snapped
        var snapper = models[i];
        
        for (j = 0; j < models.length; j++)
        {
            if (i == j) continue; // don't test model against itself          
            var snappee = snapModels[j] ? snapModels[j] : models[j];
            
            var snapped = this.trySnap(snapper, snappee);
            if (snapped)
            {
                snapModels[i] = snapped;
                snapModels[j] = snapped;
                // if snappee is a snapModel, remove from root-level snapped shapes, because it
                // is now a part of snapped
                for (k = 0; k < rootSnaps.length; k++)
                {
                    if (rootSnaps[k] == snappee)
                    {
                        rootSnaps.splice(k, 1);
                        break;
                    }
                }
                rootSnaps.push(snapped);
                break;
            }
        }
    }
    
    // recurse on root-level snapped shapes
    if (rootSnaps.length > 1)
    {
        this.resnap(rootSnaps);
    }
}

SnapMgr.prototype.trySnap = function(snapper, snappee)
{
    var i, j;
    
    if (snapper.snapEnabled.getValueDirect() == false ||
        snappee.snapEnabled.getValueDirect() == false)
        return null;

    var snapperMatrix = snapper.sectorTransformCompound;
    var snappeeMatrix = snappee.sectorTransformCompound;
    
    // generics
    var snapperGenerics = snapper.genericConnectors;
    var snappeeGenerics = snappee.genericConnectors;
    for (i = 0; i < snapperGenerics.Size(); i++)
    {
        var snapperGeneric = snapperGenerics.getAt(i);
        if (snapperGeneric.connected.getValueDirect() == true) continue;
        
        for (j = 0; j < snappeeGenerics.Size(); j++)
        {
            var snappeeGeneric = snappeeGenerics.getAt(j);
            if (snappeeGeneric.connected.getValueDirect() == true) continue;
            if (snapperGeneric.type.getValueDirect().join("") != snappeeGeneric.type.getValueDirect().join("")) continue; // only test same types
            
            if (snapperGeneric.collides(snappeeGeneric, snapperMatrix, snappeeMatrix))
            {
                return this.snapGenericToGeneric(snapper, snappee, snapperGeneric, snappeeGeneric);
            }
        }
    }
    
    // plugs/sockets
    // TODO: might need to test snapper's sockets to snappee's plugs (?)
    var snapperPlugs = snapper.plugConnectors;
    var snappeeSockets = snappee.socketConnectors;
    for (i = 0; i < snapperPlugs.Size(); i++)
    {
        var snapperPlug = snapperPlugs.getAt(i);
        if (snapperPlug.connected.getValueDirect() == true) continue;
        
        for (j = 0; j < snappeeSockets.Size(); j++)
        {
            var snappeeSocket = snappeeSockets.getAt(j);
            if (snappeeSocket.connected.getValueDirect() == true) continue;
            if (snapperPlug.type.getValueDirect().join("") != snappeeSocket.type.getValueDirect().join("")) continue; // only test same types
            
            if ((snappeeSocket.slot = snapperPlug.collides(snappeeSocket, snapperMatrix, snappeeMatrix)) > 0)
            {
                return this.snapPlugToSocket(snapper, snappee, snapperPlug, snappeeSocket);
            }
        }
    }
    
    return null;
}