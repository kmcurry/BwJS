SnapModelDescriptor.prototype = new AttributeContainer();
SnapModelDescriptor.prototype.constructor = SnapModelDescriptor;

function SnapModelDescriptor()
{
    AttributeContainer.call(this);
    this.className = "SnapModelDescriptor";
    this.attrType = eAttrType.SnapModelDescriptor;
    
    this.name = new StringAttr();
    this.position = new Vector3DAttr();
    this.quaternion = new QuaternionAttr();

    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.position, "position");
    this.registerAttribute(this.quaternion, "quaternion");
}

SnapModelDescriptors.prototype = new AttributeVector();
SnapModelDescriptors.prototype.constructor = SnapModelDescriptors;

function SnapModelDescriptors()
{
    AttributeVector.call(this, new SnapModelDescriptorAllocator());
    this.className = "SnapModelDescriptors";
    this.attrType = eAttrType.SnapModelDescriptors;

    this.appendParsedElements.setValueDirect(true);
}

SnapModelDescriptorAllocator.prototype = new Allocator();
SnapModelDescriptorAllocator.prototype.constructor = SnapModelDescriptorAllocator;

function SnapModelDescriptorAllocator()
{
}

SnapModelDescriptorAllocator.prototype.allocate = function ()
{
    return new SnapModelDescriptor();
}

function SnapRec()
{
    this.model = null;
    this.matrix = null;
    this.surfaces = [];
    this.geometries = [];
    this.vertices_start = 0;
    this.vertices_count = 0;
    this.genericConnectors = [];
    this.plugConnectors = [];
    this.socketConnectors = [];
}

SnapModel.prototype = new Model();
SnapModel.prototype.constructor = SnapModel;

function SnapModel()
{
    Model.call(this);
    this.className = "SnapModel";
    this.attrType = eAttrType.SnapModel;
    
    this.snaps = [];
}

SnapModel.prototype.snap = function(model, matrix)
{
    var i, j, k;
    var vertices, xvertices, xvertex;
    var normals, xnormals, normal, xnormal;
    var center, xcenter;
    
    var snapRec = new SnapRec();
    snapRec.model = model;
    snapRec.matrix = matrix;
    
    // disable (hide) model
    model.enabled.setValueDirect(false);
    
    // copy model surfaces to this
    var surfaces = model.surfaces;
    for (i = 0; i < surfaces.length; i++)
    {
        var surface = surfaces[i].clone();
        this.addSurface(surface);
        surface.snappedModel = model;
        snapRec.surfaces.push(surface);

        // transform vertices
        xvertices = [];
        vertices = surface.getAttribute("vertices").getValueDirect();
        for (j = 0; j < vertices.length; j += 3)
        {
            xvertex = matrix.transform(vertices[j], vertices[j + 1], vertices[j + 2], 1);
            xvertices.push(xvertex.x);
            xvertices.push(xvertex.y);
            xvertices.push(xvertex.z);
        }
        surface.getAttribute("vertices").setValueDirect(xvertices);
    
        // copy geometry
        var geometries = surfaces[i].geometries;
        for (j = 0; j < geometries.length; j++)
        {
            var geometry = geometries[j].clone();
            geometry.surface = surface;

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

            this.addGeometry(geometry, null, surface);
            snapRec.geometries.push(geometry);
        }
    }
    
    // append (transformed) model vertices to snappee
    xvertices = [];
    vertices = model.vertices.getValueDirect();
    for (i = 0; i < vertices.length; i += 3)
    {
        xvertex = matrix.transform(vertices[i], vertices[i + 1], vertices[i + 2], 1);
        xvertices.push(xvertex.x);
        xvertices.push(xvertex.y);
        xvertices.push(xvertex.z);
    }
    vertices = this.vertices.getValueDirect();   
    snapRec.vertices_start = vertices.length;
    snapRec.vertices_count = xvertices.length;
    vertices = vertices.concat(xvertices);
    this.vertices.setValueDirect(vertices);
   
    // copy (transformed) snap connectors to snappee
    
    // generics
    var genericConnectors = model.genericConnectors;
    for (i = 0; i < genericConnectors.Size(); i++)
    {
        var genericConnector = genericConnectors.getAt(i);
        var xgenericConnector = new GenericConnector();
        xgenericConnector.synchronize(genericConnector);
        
        normal = xgenericConnector.normal.getValueDirect();
        xnormal = matrix.transform(normal.x, normal.y, normal.z, 0);
        xgenericConnector.normal.setValueDirect(xnormal.x, xnormal.y, xnormal.z);
        
        center = xgenericConnector.point.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xgenericConnector.point.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        this.genericConnectors.push_back(xgenericConnector);
        snapRec.genericConnectors.push(xgenericConnector);
    }
    
    // plugs  
    var plugConnectors = model.plugConnectors;
    for (i = 0; i < plugConnectors.Size(); i++)
    {
        var plugConnector = plugConnectors.getAt(i);
        var xplugConnector = new PlugConnector();
        xplugConnector.synchronize(plugConnector);
        
        normal = xgenericConnector.normal.getValueDirect();
        xnormal = matrix.transform(normal.x, normal.y, normal.z, 0);
        xgenericConnector.normal.setValueDirect(xnormal.x, xnormal.y, xnormal.z);
        
        center = xplugConnector.pin1.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xplugConnector.pin1.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        center = xplugConnector.pin2.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xplugConnector.pin2.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        this.plugConnectors.push_back(xplugConnector);
        snapRec.plugConnectors.push(xplugConnector);
    }
    
    // sockets
    var socketConnectors = model.socketConnectors;
    for (i = 0; i < socketConnectors.Size(); i++)
    {
        var socketConnector = socketConnectors.getAt(i);
        var xsocketConnector = new SocketConnector();
        xsocketConnector.synchronize(socketConnector);
        
        normal = xgenericConnector.normal.getValueDirect();
        xnormal = matrix.transform(normal.x, normal.y, normal.z, 0);
        xgenericConnector.normal.setValueDirect(xnormal.x, xnormal.y, xnormal.z);
        
        center = xsocketConnector.slot1.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xsocketConnector.slot1.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        center = xsocketConnector.slot2.center.getValueDirect();
        xcenter = matrix.transform(center.x, center.y, center.z, 1);
        xsocketConnector.slot2.center.setValueDirect(xcenter.x, xcenter.y, xcenter.z);
        
        this.socketConnectors.push_back(xsocketConnector);
        snapRec.socketConnectors.push(xsocketConnector);
    }
    
    // append name
    //var name = this.name.getValueDirect().join("");
    //name += "_" + model.name.getValueDirect().join("");
    //this.name.setValueDirect(name);
    
    // add snap entry
    this.snaps[model.__nodeId__] = snapRec;
}

SnapModel.prototype.unsnap = function(model)
{
    var i;
    
    var snapRec = this.snaps[model.__nodeId__];
    if (!snapRec) return;
    
    // remove model's surfaces and synchronize original model's corresponding 
    // surface attributes to retain changes applied to this
    for (i = 0; i < snapRec.surfaces.length; i++)
    {
        model.surfaces[i].color.copyValue(snapRec.surfaces[i].color);
        model.surfaces[i].ambientLevel.copyValue(snapRec.surfaces[i].ambientLevel);
        model.surfaces[i].diffuseLevel.copyValue(snapRec.surfaces[i].diffuseLevel);
        model.surfaces[i].specularLevel.copyValue(snapRec.surfaces[i].specularLevel);
        model.surfaces[i].emissiveLevel.copyValue(snapRec.surfaces[i].emissiveLevel);
        model.surfaces[i].ambient.copyValue(snapRec.surfaces[i].ambient);
        model.surfaces[i].diffuse.copyValue(snapRec.surfaces[i].diffuse);
        model.surfaces[i].specular.copyValue(snapRec.surfaces[i].specular);
        model.surfaces[i].emissive.copyValue(snapRec.surfaces[i].emissive);
        model.surfaces[i].glossiness.copyValue(snapRec.surfaces[i].glossiness);
        model.surfaces[i].opacity.copyValue(snapRec.surfaces[i].opacity);
        model.surfaces[i].doubleSided.copyValue(snapRec.surfaces[i].doubleSided);
        model.surfaces[i].texturesEnabled.copyValue(snapRec.surfaces[i].texturesEnabled);
        
        this.removeSurface(snapRec.surfaces[i]);
    }
    
    // remove model's geometries
    for (i = 0; i < snapRec.geometries.length; i++)
    {
        this.removeGeometry(snapRec.geometries[i], null, snapRec.geometries[i].surface);
    }
    
    // remove model's vertices
    var vertices = this.vertices.getValueDirect();
    vertices.splice(snapRec.vertices_start, snapRec.vertices_count);
    this.vertices.setValueDirect(vertices);
    
    // remove model's snapConnectors
    for (i = 0; i < snapRec.genericConnectors.length; i++)
    {
        this.genericConnectors.erase(snapRec.genericConnectors[i]);
    }
    for (i = 0; i < snapRec.plugConnectors.length; i++)
    {
        this.plugConnectors.erase(snapRec.plugConnectors[i]);
    }
    for (i = 0; i < snapRec.socketConnectors.length; i++)
    {
        this.socketConnectors.erase(snapRec.socketConnectors[i]);
    }
    
    // clear snapConnector's connected flags
    var genericConnectors = model.genericConnectors;
    for (i = 0; i < genericConnectors.Size(); i++)
    {
        genericConnectors.getAt(i).getAttribute("connected").setValueDirect(false);
    }
    var plugConnectors = model.plugConnectors;
    for (i = 0; i < plugConnectors.Size(); i++)
    {
        plugConnectors.getAt(i).getAttribute("connected").setValueDirect(false);
    }
    var socketConnectors = model.socketConnectors;
    for (i = 0; i < socketConnectors.Size(); i++)
    {
        socketConnectors.getAt(i).getAttribute("connected").setValueDirect(false);
    }
        
    // set model's position
    var matrix = snapRec.matrix;
    
    var position = matrix.transform(0, 0, 0, 1);
    model.position.setValueDirect(position.x, position.y, position.z);

    var rotationAngles = matrix.getRotationAngles();
    model.rotation.setValueDirect(rotationAngles.x, rotationAngles.y, rotationAngles.z);

    model.setMotionParent(this);
    zeroInspectionGroup(model);
    model.updateSimpleTransform();
    model.updateCompoundTransform();
    model.setMotionParent(null);

    matrix = model.sectorTransformCompound;

    position = matrix.transform(0, 0, 0, 1);
    model.position.setValueDirect(position.x, position.y, position.z);

    var quaternion = matrix.getQuaternion();
    model.quaternion.setValueDirect(quaternion);
        
    // enable (show) model
    model.enabled.setValueDirect(true);
    
    // clear snap entry
    this.snaps[model.__nodeId__] = undefined;
}

SnapModel.prototype.unsnapAll = function()
{
    var unsnapped = [];
    
    var snaps = this.snaps.slice();
    for (var i in snaps)
    {
        this.unsnap(snaps[i].model);
        unsnapped.push(snaps[i].model);
    }
    
    // remove this
    this.getParent(0).removeChild(this);
    // remove from registry
    this.registry.unregister(this);
    // delete
    //this.destroy();
    
    return unsnapped;
}

SnapModel.prototype.getSnapped = function()
{
    var i;
    var descriptors = new SnapModelDescriptors();
    
    for (i in this.snaps)
    {
        var snapRec = this.snaps[i];
        var model = snapRec.model;
        
        // get model's position
        var matrix = snapRec.matrix;

        var position = matrix.transform(0, 0, 0, 1);
        model.position.setValueDirect(position.x, position.y, position.z);

        var rotationAngles = matrix.getRotationAngles();
        model.rotation.setValueDirect(rotationAngles.x, rotationAngles.y, rotationAngles.z);

        model.setMotionParent(this);
        zeroInspectionGroup(model);
        model.updateSimpleTransform();
        model.updateCompoundTransform();
        model.setMotionParent(null);

        matrix = model.sectorTransformCompound;

        position = matrix.transform(0, 0, 0, 1);
        var quaternion = matrix.getQuaternion();
        
        var descriptor = new SnapModelDescriptor();
        descriptor.name.copyValue(model.name);
        descriptor.position.setValueDirect(position.x, position.y, position.z);
        descriptor.quaternion.setValueDirect(quaternion);
        
        descriptors.push_back(descriptor);
    }
    
    return descriptors;
}
    
SnapModel.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class implementation
    Model.prototype.apply.call(this, directive, params, visitChildren);
}