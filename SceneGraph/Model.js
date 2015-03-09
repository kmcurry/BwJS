Model.prototype = new ParentableMotionElement();
Model.prototype.constructor = Model;

function Model()
{
    ParentableMotionElement.call(this);
    this.className = "Model";
    this.attrType = eAttrType.Model;
    
    this.geometry = [];
    this.geometryIndices = [];
    this.geometryBBoxesMap = [];
    this.geometryAttrConnections = [];
    this.surfaceAttrConnections = [];
    this.boundingTree = new Octree();
    this.updateBoundingTree = false;
    this.bones = [];
    
    this.url = new StringAttr("");
    this.layer = new NumberAttr(0);//0xffffffff);
    this.selectable = new BooleanAttr(true);
    this.moveable = new BooleanAttr(true);
    this.cullable = new BooleanAttr(true);
    this.show = new BooleanAttr(true);
    this.approximationLevels = new NumberAttr(1);
    this.showApproximationLevel = new NumberAttr(-1);
    this.sortPolygons = new BooleanAttr(false);
    this.flipPolygons = new BooleanAttr(false);
    this.shadowCaster = new BooleanAttr(false);
    this.shadowTarget = new BooleanAttr(true);
    this.indexedGeometry = new BooleanAttr(true);
    this.enableSharing = new BooleanAttr(true);
    this.vertices = new NumberArrayAttr();
    this.dissolve = new NumberAttr(0);
    this.color = new ColorAttr(1, 1, 1, 1);
    this.ambientLevel = new NumberAttr(1);
    this.diffuseLevel = new NumberAttr(1);
    this.specularLevel = new NumberAttr(1);
    this.emissiveLevel = new NumberAttr(0);
    this.ambient = new ColorAttr(0.8, 0.8, 0.8, 1);
    this.diffuse = new ColorAttr(0.2, 0.2, 0.2, 1);
    this.specular = new ColorAttr(0, 0, 0, 1);
    this.emissive = new ColorAttr(0, 0, 0, 1);
    this.glossiness = new NumberAttr(0);
    this.opacity = new NumberAttr(1);
    this.textureOpacity = new NumberAttr(1);
    this.doubleSided = new BooleanAttr(false);
    this.texturesEnabled = new BooleanAttr(true);
    this.pivotAboutGeometricCenter = new BooleanAttr(true);
    this.screenScaleEnabled = new BooleanAttr(false);
    this.screenScalePixels = new Vector3DAttr(0, 0, 0);
    // TODO:
    //this.collider = new BooleanAttr(false);
    //this.collidee = new BooleanAttr(false);
    this.detectCollision = new BooleanAttr(false);
    this.collisionDetected = new BooleanAttr(false);
    this.collisionList = new AttributeVector();
    this.stopOnCollision = new BooleanAttr(false);
    this.detectObstruction = new BooleanAttr(false);
    this.obstructionDetected = new BooleanAttr(false);
    this.obstructionList = new AttributeVector(); // currently will only contain most threatening (closest) obstructor
    this.highlight = new BooleanAttr(false);
    this.highlightColor = new ColorAttr(1, 1, 0, 1);
    this.highlightWidth = new NumberAttr(5);
    this.disableOnDissolve = new BooleanAttr(true);
    this.socketConnectors = new SocketConnectors();
    this.plugConnectors = new PlugConnectors();
    this.physicalProperties = new PhysicalPropertiesAttr();
    
    this.show.addTarget(this.enabled);
    
    this.selectable.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.cullable.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.show.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.approximationLevels.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    //this.showApproximationLevel.addModifiedCB(Model_ShowApproximationLevelModifiedCB, this);
    this.sortPolygons.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.sortPolygons.addModifiedCB(Model_SortPolygonsModifiedCB, this);
    this.flipPolygons.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.shadowCaster.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.shadowTarget.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.renderSequenceSlot.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.renderSequenceSlot.addModifiedCB(Model_RenderSequenceSlotModifiedCB, this);
    this.dissolve.addModifiedCB(Model_DissolveModifiedCB, this);
    this.color.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.ambientLevel.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.diffuseLevel.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.specularLevel.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.emissiveLevel.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.ambient.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.diffuse.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.specular.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.emissive.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.glossiness.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.opacity.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.opacity.addModifiedCB(Model_OpacityModifiedCB, this);
    this.textureOpacity.addModifiedCB(Model_TextureOpacityModifiedCB, this);
    this.doubleSided.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.texturesEnabled.addModifiedCB(Model_SurfaceAttrModifiedCB, this);
    this.detectCollision.addModifiedCB(Model_DetectCollisionModifiedCB, this);
    this.collisionDetected.addModifiedCB(Model_CollisionDetectedModifiedCB, this);
    this.vertices.addModifiedCB(Model_VerticesModifiedCB, this);

    this.registerAttribute(this.url, "url");
    this.registerAttribute(this.layer, "layer");
    this.registerAttribute(this.selectable, "selectable");
    this.registerAttribute(this.moveable, "moveable");
    this.registerAttribute(this.cullable, "cullable");
    this.registerAttribute(this.show, "show");
    this.registerAttribute(this.approximationLevels, "approximationLevels");
    this.registerAttribute(this.showApproximationLevel, "showApproximationLevel");
    this.registerAttribute(this.sortPolygons, "sortPolygons");
    this.registerAttribute(this.flipPolygons, "flipPolygons");
    this.registerAttribute(this.shadowCaster, "shadowCaster");
    this.registerAttribute(this.shadowTarget, "shadowTarget");
    this.registerAttribute(this.indexedGeometry, "indexedGeometry");
    this.registerAttribute(this.enableSharing, "enableSharing");
    this.registerAttribute(this.vertices, "vertices");
    this.registerAttribute(this.dissolve, "dissolve");
    this.registerAttribute(this.color, "color");
    this.registerAttribute(this.ambientLevel, "ambientLevel");
    this.registerAttribute(this.diffuseLevel, "diffuseLevel");
    this.registerAttribute(this.specularLevel, "specularLevel");
    this.registerAttribute(this.emissiveLevel, "emissiveLevel");
    this.registerAttribute(this.ambient, "ambient");
    this.registerAttribute(this.diffuse, "diffuse");
    this.registerAttribute(this.specular, "specular");
    this.registerAttribute(this.emissive, "emissive");
    this.registerAttribute(this.glossiness, "glossiness");
    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.textureOpacity, "textureOpacity");
    this.registerAttribute(this.doubleSided, "doubleSided");
    this.registerAttribute(this.texturesEnabled, "texturesEnabled");
    this.registerAttribute(this.pivotAboutGeometricCenter, "pivotAboutGeometricCenter");
    this.registerAttribute(this.screenScaleEnabled, "screenScaleEnabled");
    this.registerAttribute(this.screenScalePixels, "screenScalePixels");
    this.registerAttribute(this.detectCollision, "detectCollision");
    this.registerAttribute(this.collisionDetected, "collisionDetected");
    this.registerAttribute(this.collisionList, "collisionList");
    this.registerAttribute(this.stopOnCollision, "stopOnCollision");
    this.registerAttribute(this.detectObstruction, "detectObstruction");
    this.registerAttribute(this.obstructionDetected, "obstructionDetected");
    this.registerAttribute(this.obstructionList, "obstructionList");
    this.registerAttribute(this.highlight, "highlight");
    this.registerAttribute(this.highlightColor, "highlightColor");
    this.registerAttribute(this.highlightWidth, "highlightWidth");
    this.registerAttribute(this.disableOnDissolve, "disableOnDissolve");
    this.registerAttribute(this.socketConnectors, "socketConnectors");
    this.registerAttribute(this.plugConnectors, "plugConnectors");
    this.registerAttribute(this.physicalProperties, "physicalProperties");
        
    this.isolatorNode = new Isolator();
    this.isolatorNode.getAttribute("name").setValueDirect("Isolator");
    this.isolatorNode.getAttribute("isolateDissolves").setValueDirect(true);
    //this.isolatorNode.setCreatedByParent(true);
    this.addChild(this.isolatorNode);

    this.dissolveNode = new Dissolve();
    this.dissolveNode.getAttribute("name").setValueDirect("Dissolve");
    this.addChild(this.dissolveNode);
    this.dissolve.addTarget(this.dissolveNode.getAttribute("dissolve"));
    //this.dissolve.setCreatedByParent(true);

    this.surfacesNode = new Group();
    this.surfacesNode.getAttribute("name").setValueDirect("Surfaces");
    this.addChild(this.surfacesNode);
    //this.surfacesNode.setCreatedByParent(true);
}

Model.prototype.copyModel = function(clone,cloneChildren,pathSrc,pathClone)
{
    var clonedByThis = false;
    if(!clone)
    {
        if (!(clone = new Model()))
        {
            return -1;
        }

        clonedByThis = true;
    }

    // call base-class implementation
    if (this.copyNode(clone, cloneChildren, pathSrc, pathClone))
    {
        return -1;
    }
}

Model.prototype.initializeSurfaceAttrConnectionsMap = function()
{
    this.surfaceAttrConnections.push(new Pair(this.color, false));
    this.surfaceAttrConnections.push(new Pair(this.ambientLevel, false));
    this.surfaceAttrConnections.push(new Pair(this.diffuseLevel, false));
    this.surfaceAttrConnections.push(new Pair(this.specularLevel, false));
    this.surfaceAttrConnections.push(new Pair(this.emissiveLevel, false));
    this.surfaceAttrConnections.push(new Pair(this.ambient, false));
    this.surfaceAttrConnections.push(new Pair(this.diffuse, false));
    this.surfaceAttrConnections.push(new Pair(this.specular, false));
    this.surfaceAttrConnections.push(new Pair(this.emissive, false));
    this.surfaceAttrConnections.push(new Pair(this.glossiness, false));
    this.surfaceAttrConnections.push(new Pair(this.opacity, false));
    this.surfaceAttrConnections.push(new Pair(this.doubleSided, false));
    this.surfaceAttrConnections.push(new Pair(this.texturesEnabled, false));
    this.surfaceAttrConnections.push(new Pair(this.renderSequenceSlot, false));
}

Model.prototype.initializeGeometryAttrConnectionsMap = function()
{
    this.geometryAttrConnections.push(new Pair(this.selectable, false));
    this.geometryAttrConnections.push(new Pair(this.cullable, false));
    this.geometryAttrConnections.push(new Pair(this.show, false));
    this.geometryAttrConnections.push(new Pair(this.approximationLevels, false));
    this.geometryAttrConnections.push(new Pair(this.showApproximationLevel, false));
    this.geometryAttrConnections.push(new Pair(this.sortPolygons, false));
    this.geometryAttrConnections.push(new Pair(this.flipPolygons, false));
    this.geometryAttrConnections.push(new Pair(this.intersector, false));
    this.geometryAttrConnections.push(new Pair(this.intersectee, false));
    this.geometryAttrConnections.push(new Pair(this.stationary, false));
    this.geometryAttrConnections.push(new Pair(this.shadowCaster, false));
    this.geometryAttrConnections.push(new Pair(this.shadowTarget, false));
}

Model.prototype.clearSurfaceAttrConnectionMap = function()
{
    this.surfaceAttrConnections = [];

    this.initializeSurfaceAttrConnectionsMap();
}

Model.prototype.clearGeometryAttrConnectionsMap = function()
{
    this.geometryAttrConnections = [];

    this.initializeGeometryAttrConnectionsMap();
}

Model.prototype.setGraphMgr = function(graphMgr)
{
    this.isolatorNode.setGraphMgr(graphMgr);
    this.dissolveNode.setGraphMgr(graphMgr);
    this.surfacesNode.setGraphMgr(graphMgr);
    
    // call base-class implementation
    ParentableMotionElement.prototype.setGraphMgr.call(this, graphMgr);
}

Model.prototype.update = function(params, visitChildren)
{
    if (this.updateBoundingTree)
    {
        this.updateBoundingTree = false;

        this.buildBoundingTree();
    }
    
    // call base-class implementation
    ParentableMotionElement.prototype.update.call(this, params, visitChildren);
}

Model.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
        case "render":
        case "shadow":
            {
                var show = this.show.getValueDirect();
                if (!show)
                {
                    // call base-class implementation
                    ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
                    return;
                }

                var lastWorldMatrix = new Matrix4x4();
                lastWorldMatrix.loadMatrix(params.worldMatrix);              

                params.worldMatrix = params.worldMatrix.multiply(this.sectorTransformCompound);
                
                this.pushMatrix();

                this.applyTransform();

                this.graphMgr.renderContext.setModelID(params.modelID++);
                
                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
                
                this.popMatrix();
                
                params.worldMatrix.loadMatrix(lastWorldMatrix);
            }
            break;

        case "rayPick":
            {
                var lastWorldMatrix = new Matrix4x4();
                lastWorldMatrix.loadMatrix(params.worldMatrix);
                var lastSectorOrigin = new Vector3D(params.sectorOrigin.x, params.sectorOrigin.y, params.sectorOrigin.z);

                params.worldMatrix = params.worldMatrix.multiply(this.sectorTransformCompound);
                params.sectorOrigin.load(this.sectorOrigin.getValueDirect());

                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);

                params.worldMatrix.loadMatrix(lastWorldMatrix);
                params.sectorOrigin.copy(lastSectorOrigin);
            }
            break;

        case "bbox":
            {
                var lastWorldMatrix = new Matrix4x4();
                lastWorldMatrix.loadMatrix(params.worldMatrix);
                params.worldMatrix.loadMatrix(this.sectorTransformCompound.multiply(params.worldMatrix));

                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);

                params.worldMatrix.loadMatrix(lastWorldMatrix);
            }
            break;

        case "collide":
            {
                var lastWorldMatrix = new Matrix4x4();
                lastWorldMatrix.loadMatrix(params.worldMatrix);              

                params.worldMatrix = params.worldMatrix.multiply(this.sectorTransformCompound);
  
                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
                
                if (this.detectCollision.getValueDirect()) 
                {
                    this.boundingTree.setTransform(params.worldMatrix);
                    params.detectCollisions[this.name.getValueDirect().join("")] = new CollideRec(this, this.boundingTree, params.worldMatrix);
                }

                params.worldMatrix.loadMatrix(lastWorldMatrix);
            }
            break;
           
        case "highlight":
            {
                if (this.highlight.getValueDirect())
                {
                    var target = new HighlightTarget();
                    target.projMatrix = params.projMatrix;
                    target.viewMatrix = params.viewMatrix;
                    target.worldMatrix = this.sectorTransformCompound.multiply(params.worldMatrix);
                    target.camera = params.camera;
                    target.viewport = params.viewport;
                    target.center = this.center.getValueDirect();
                    var highlightColor = this.highlightColor.getValueDirect();
                    target.highlightColor_r = highlightColor.r;
                    target.highlightColor_g = highlightColor.g;
                    target.highlightColor_b = highlightColor.b;
                    target.highlightColor_a = highlightColor.a;
                    target.highlightWidth = this.highlightWidth.getValueDirect();
                    params.targets.push(target);

                    // call base-class implementation
                    ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
                }
            }
            break;  
         
        default:
            {
                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
            }
            break;
    }
}

Model.prototype.onRemove = function()
{
    var name = this.name.getValueDirect().join("");
    
    // remove from any physics simulators
    var physicsSimulators = this.registry.getByType(eAttrType.PhysicsSimulator);
    for (var i = 0; i < physicsSimulators.length; i++)
    {
        physicsSimulators[i].deleteModel(this);
    }
    
    // call base-class implementation
    ParentableMotionElement.prototype.onRemove.call(this);
}

Model.prototype.pushMatrix = function()
{
    this.graphMgr.renderContext.setMatrixMode(RC_WORLD);
    this.graphMgr.renderContext.pushMatrix();
}

Model.prototype.popMatrix = function()
{
    this.graphMgr.renderContext.setMatrixMode(RC_WORLD);
    this.graphMgr.renderContext.popMatrix();
    this.graphMgr.renderContext.applyWorldTransform();    
}

Model.prototype.addSurface = function(surface)
{
    this.surfacesNode.addChild(surface);
    
    // register surface to this for accessiblity with Set
    this.registerAttribute(surface, surface.getAttribute("name").getValueDirect().join(""));
	
    this.connectSurfaceAttributes(surface);
}

Model.prototype.addGeometry = function(geometry, indices, surface)
{
    surface.addChild(geometry);
    
    this.connectGeometryAttributes(geometry);
    this.addGeometryBBox(geometry);
    this.geometry.push(geometry);
    this.geometryIndices.push(indices);
        
    this.updateBoundingTree = true;
}

Model.prototype.connectSurfaceAttributes = function(surface)
{
    this.connectSurfaceAttribute(surface, this.color, "color");
    this.connectSurfaceAttribute(surface, this.ambientLevel, "ambientLevel");
    this.connectSurfaceAttribute(surface, this.diffuseLevel, "diffuseLevel");
    this.connectSurfaceAttribute(surface, this.specularLevel, "specularLevel");
    this.connectSurfaceAttribute(surface, this.emissiveLevel, "emissiveLevel");
    this.connectSurfaceAttribute(surface, this.ambient, "ambient");
    this.connectSurfaceAttribute(surface, this.diffuse, "diffuse");
    this.connectSurfaceAttribute(surface, this.specular, "specular");
    this.connectSurfaceAttribute(surface, this.emissive, "emissive");
    this.connectSurfaceAttribute(surface, this.glossiness, "glossiness");
    this.connectSurfaceAttribute(surface, this.opacity, "opacity");
    this.connectSurfaceAttribute(surface, this.doubleSided, "doubleSided");
    this.connectSurfaceAttribute(surface, this.texturesEnabled, "texturesEnabled");
    this.connectSurfaceAttribute(surface, this.enabled, "enabled");
}

Model.prototype.connectSurfaceAttribute = function(surface, attribute, name)
{
    var modified = attribute.modificationCount > 0 ? true : false;
    attribute.addTarget(surface.getAttribute(name), eAttrSetOp.Replace, null, modified);
}

Model.prototype.connectGeometryAttributes = function(geometry)
{
    this.connectGeometryAttribute(geometry, this.name, "name");
    this.connectGeometryAttribute(geometry, this.selectable, "selectable");
    this.connectGeometryAttribute(geometry, this.cullable, "cullable");
    this.connectGeometryAttribute(geometry, this.show, "show");
    this.connectGeometryAttribute(geometry, this.approximationLevels, "approximationLevels");
    this.connectGeometryAttribute(geometry, this.sortPolygons, "sortPolygons");
    this.connectGeometryAttribute(geometry, this.flipPolygons, "flipPolygons");
    this.connectGeometryAttribute(geometry, this.shadowCaster, "shadowCaster");
    this.connectGeometryAttribute(geometry, this.shadowTarget, "shadowTarget");
    this.connectGeometryAttribute(geometry, this.renderSequenceSlot, "renderSequenceSlot");
    this.connectGeometryAttribute(geometry, this.highlight, "highlight");
}

Model.prototype.connectGeometryAttribute = function(geometry, attribute, name)
{
    var modified = attribute.modificationCount > 0 ? true : false;
    attribute.addTarget(geometry.getAttribute(name), eAttrSetOp.Replace, null, modified);
}

Model.prototype.addGeometryBBox = function(geometry)
{
    if (geometry == null ||
        geometry == undefined)
        return;
    
    geometry.bbox.min.addModifiedCB(Model_GeometryBBoxModifiedCB, this);
    geometry.bbox.max.addModifiedCB(Model_GeometryBBoxModifiedCB, this);

    this.updateGeometryBBox(geometry);
}

Model.prototype.updateGeometryBBox = function(geometry)
{
    if (geometry == null ||
        geometry == undefined)
        return;
    
    var min = geometry.bbox.min.getValueDirect();
    var max = geometry.bbox.max.getValueDirect();
    
    this.geometryBBoxesMap.push(new Pair(min, max));
    
    this.updateBBox();
}

Model.prototype.updateBBox = function()
{
    var min = new Vector3D();
    var max = new Vector3D();
    var first = true;
    for (var i in this.geometryBBoxesMap)
    {
        if (first)
        {
            min.x = this.geometryBBoxesMap[i].first.x;
            min.y = this.geometryBBoxesMap[i].first.y;
            min.z = this.geometryBBoxesMap[i].first.z;
            
            max.x = this.geometryBBoxesMap[i].second.x;
            max.y = this.geometryBBoxesMap[i].second.y;
            max.z = this.geometryBBoxesMap[i].second.z;
            
            first = false;
            continue;
        }
        
        min.x = Math.min(min.x, this.geometryBBoxesMap[i].first.x);
        min.y = Math.min(min.y, this.geometryBBoxesMap[i].first.y);
        min.z = Math.min(min.z, this.geometryBBoxesMap[i].first.z);
        
        max.x = Math.max(max.x, this.geometryBBoxesMap[i].second.x);
        max.y = Math.max(max.y, this.geometryBBoxesMap[i].second.y);
        max.z = Math.max(max.z, this.geometryBBoxesMap[i].second.z);
    }
    
    this.bbox.min.setValueDirect(min.x, min.y, min.z);
    this.bbox.max.setValueDirect(max.x, max.y, max.z);
    
    var center = new Vector3D((min.x + max.x) / 2.0,
                              (min.y + max.y) / 2.0,
                              (min.z + max.z) / 2.0);
                              
    this.center.setValueDirect(center.x, center.y, center.z);
    
    this.updateBoundingTree = true;
}

Model.prototype.buildBoundingTree = function()
{
    var tris = [];
    for (var i = 0; i < this.geometry.length; i++)
    {
        tris = tris.concat(this.geometry[i].getTriangles());
    }
    
    this.boundingTree = new Octree();
    this.boundingTree.setTriangles(tris, this.bbox.min.getValueDirect(), this.bbox.max.getValueDirect());
    this.boundingTree.buildTree(this.approximationLevels.getValueDirect());
}

Model.prototype.collisionDetectedModified = function()
{
}

function Model_SortPolygonsModifiedCB(attribute, container)
{
    // TODO
    //container.sortPolygonsModified();
}
    
function Model_RenderSequenceSlotModifiedCB(attribute, container)
{
    var slot = attribute.getValueDirect();
}

function Model_DissolveModifiedCB(attribute, container)
{
    var dissolve = attribute.getValueDirect();
}

function Model_OpacityModifiedCB(attribute, container)
{
    var opacity = attribute.getValueDirect();
}

function Model_TextureOpacityModifiedCB(attribute, container)
{
    //container.textureOpacityModified();
}

function Model_Surface_NumTransparencyTexturesModifiedCB(attribute, container)
{
    var numTransparencyTextures = attribute.getValueDirect();
}

function Model_GeometryBBoxModifiedCB(attribute, container)
{
    container.updateGeometryBBox(attribute.getContainer().getContainer());
}

function Model_SurfaceAttrModifiedCB(attribute, container)
{
    //container.setModified();
}

function Model_GeometryAttrModifiedCB(attribute, container)
{
    //container.incremementModificationCount();
}

function Model_DetectCollisionModifiedCB(attribute, container)
{
    var detectCollision = attribute.getValueDirect();
}

function Model_CollisionDetectedModifiedCB(attribute, container)
{
    container.collisionDetectedModified();
}

function Model_VerticesModifiedCB(attribute, container)
{
}
