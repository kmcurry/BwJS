Model.prototype = new ParentableMotionElement();
Model.prototype.constructor = Model;

function Model()
{
    ParentableMotionElement.call(this);
    this.className = "Model";
    this.attrType = eAttrType.Model;
    
    this.geometryBBoxesMap = [];
    
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
    this.intersector = new BooleanAttr(true);
    this.intersectee = new BooleanAttr(true);
    this.stationary = new BooleanAttr(false);
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

    this.show.addTarget(this.enabled);
    
    this.selectable.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.cullable.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.show.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.approximationLevels.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.showApproximationLevel.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.sortPolygons.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.sortPolygons.addModifiedCB(Model_SortPolygonsModifiedCB, this);
    this.flipPolygons.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.intersector.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.intersectee.addModifiedCB(Model_GeometryAttrModifiedCB, this);
    this.stationary.addModifiedCB(Model_GeometryAttrModifiedCB, this);
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
    this.registerAttribute(this.intersector, "intersector");
    this.registerAttribute(this.intersectee, "intersectee");
    this.registerAttribute(this.stationary, "stationary");
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
    
    this.isolatorNode = new Isolator();
    this.isolatorNode.getAttribute("name").setValueDirect("Isolator");
    this.isolatorNode.getAttribute("isolateDissolves").setValueDirect(true);
    this.addChild(this.isolatorNode);

    this.dissolveNode = new Dissolve();
    this.dissolveNode.getAttribute("name").setValueDirect("Dissolve");
    this.addChild(this.dissolveNode);
    this.dissolve.addTarget(this.dissolveNode.getAttribute("dissolve"));

    this.surfacesNode = new Group();
    this.surfacesNode.getAttribute("name").setValueDirect("Surfaces");
    this.addChild(this.surfacesNode);
    
    // enable auto-display lists
    this.autoDisplayList.setValueDirect(true);
    this.autoDisplayList.addModifiedCB(Model_AutoDisplayListModifiedCB, this);
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
            {
                var show = this.show.getValueDirect();
                if (!show)
                {
                    // call base-class implementation
                    ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
                    return;
                }

                this.pushMatrix();

                this.applyTransform();

                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);

                this.popMatrix();
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

        default:
            {
                // call base-class implementation
                ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
            }
            break;
    }
}

Model.prototype.pushMatrix = function()
{
    this.graphMgr.renderContext.modelViewMatrixStack.push();
}

Model.prototype.popMatrix = function()
{
    this.graphMgr.renderContext.modelViewMatrixStack.pop();
    this.graphMgr.renderContext.applyModelViewTransform();    
}

Model.prototype.addSurface = function(surface)
{
    this.surfacesNode.addChild(surface);
    
    // register surface to this for accessiblity with Set
    this.registerAttribute(surface, surface.getAttribute("name").getValueDirect().join(""));
	
    this.connectSurfaceAttributes(surface);
}

Model.prototype.addGeometry = function(geometry, surface)
{
    surface.addChild(geometry);
    
    this.connectGeometryAttributes(geometry);
    this.addGeometryBBox(geometry);
}

Model.prototype.addIndexedGeometry = function(geometry, indices, surface)
{
    this.addGeometry(geometry, surface);
    
    // TODO: what to do with indices?
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
    var modified = this.getAttributeModificationCount(attribute) > 0 ? true : false;
    attribute.addTarget(surface.getAttribute(name), eAttrSetOp.Replace, null, modified);
}

Model.prototype.connectGeometryAttributes = function(geometry)
{
    this.connectGeometryAttribute(geometry, this.selectable, "selectable");
    this.connectGeometryAttribute(geometry, this.cullable, "cullable");
    this.connectGeometryAttribute(geometry, this.show, "show");
    this.connectGeometryAttribute(geometry, this.approximationLevels, "approximationLevels");
    this.connectGeometryAttribute(geometry, this.showApproximationLevel, "showApproximationLevel");
    this.connectGeometryAttribute(geometry, this.sortPolygons, "sortPolygons");
    this.connectGeometryAttribute(geometry, this.flipPolygons, "flipPolygons");
    this.connectGeometryAttribute(geometry, this.intersector, "intersector");
    this.connectGeometryAttribute(geometry, this.intersectee, "intersectee");
    this.connectGeometryAttribute(geometry, this.stationary, "stationary");
    this.connectGeometryAttribute(geometry, this.shadowCaster, "shadowCaster");
    this.connectGeometryAttribute(geometry, this.shadowTarget, "shadowTarget");
    this.connectGeometryAttribute(geometry, this.renderSequenceSlot, "renderSequenceSlot");
}

Model.prototype.connectGeometryAttribute = function(geometry, attribute, name)
{
    var modified = this.getAttributeModificationCount(attribute) > 0 ? true : false;
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
    
    this.geometryBBoxesMap[geometry] = new Pair(min, max);
    
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
}

Model.prototype.autoDisplayListModified = function()
{
    
}

function Model_AutoDisplayListModifiedCB(attribute, container)
{
    container.autoDisplayListModified();
}

function Model_SortPolygonsModifiedCB(attribute, container)
{
    // TODO
    //container.sortPolygonsModified();
}
    
function Model_RenderSequenceSlotModifiedCB(attribute, container)
{
    var slot = attribute.getValueDirect();

    // if render seqence slot is non-zero, cannot use display lists
    if (slot > 0)
    {
        container.autoDisplayList.setValueDirect(false);
        container.enableDisplayList.setValueDirect(false);
    }
}

function Model_DissolveModifiedCB(attribute, container)
{
    var dissolve = attribute.getValueDirect();

    if (dissolve > 0)
    {
        container.autoDisplayList.setValueDirect(false);
        container.enableDisplayList.setValueDirect(false);
    }

    //this.updateDisableOnDissolve(); // TODO
}

function Model_OpacityModifiedCB(attribute, container)
{
    var opacity = attribute.getValueDirect();
    
    // if opacity is less than 1, cannot use display lists
    if (opacity < 1)
    {
        container.autoDisplayList.setValueDirect(false);
        container.enableDisplayList.setValueDirect(false);
    }
}

function Model_TextureOpacityModifiedCB(attribute, container)
{
    //container.textureOpacityModified();
}

function Model_Surface_NumTransparencyTexturesModifiedCB(attribute, container)
{
    var numTransparencyTextures = attribute.getValueDirect();
    
    // if count is greater than 0, cannot use display lists
    if (numTransparencyTextures > 0)
    {
        container.autoDisplayList.setValueDirect(false);
        container.enableDisplayList.setValueDirect(false);
    }
}

function Model_GeometryBBoxModifiedCB(attribute, container)
{
    container.updateGeometryBBox(attribute.getContainer().getContainer());
}

function Model_SurfaceAttrModifiedCB(attribute, container)
{
    //container.incrementModificationCount();
}

function Model_GeometryAttrModifiedCB(attribute, container)
{
    //container.incremementModificationCount();
}