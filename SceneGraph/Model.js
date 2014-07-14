Model.prototype = new ParentableMotionElement();
Model.prototype.constructor = Model;

function Model()
{
    ParentableMotionElement.call(this);
    this.className = "Model";
    this.attrType = eAttrType.Model;
    
    this.geometryBBoxesMap = [];
    this.geometryAttrConnections = [];
    this.surfaceAttrConnections = [];

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

/*Model.prototype.postClone = function(clone,pathSrc,pathClone)
{
    var i;
    var j;
    var node;
    var type;
    // setup uv-coords for cloned vertex geometry

    // find vertex geometry nodes under this node
    var names = [];
    var types = [];
    if (!(types.push(eAttrType.TriList))) return;
    if (!(types.push(eAttrType.LineList))) return;
    if (!(types.push(eAttrType.PointList))) return;
    var vertexGeometryNodes = [];
    this.searchTree(names, types, false, true, false, null, null, null, vertexGeometryNodes);
    //if (!(types.push(eAttrType.IndexedTriList))) return;
    //if (!(Push_Back<eAttrType>(types, eAttrType_Node_IndexedLineList))) return;
    //if (!(Push_Back<eAttrType>(types, eAttrType_Node_IndexedPointList))) return;


    // find vertex geometry nodes under the clone
    var vertexGeometryNodesClone = [];
    for (i=0; i < pathClone.length(); i++)
    {
        node = pathClone.stack[i];
        type = node.getAttribute();
        if (type == eAttrType.TriList ||
            type == eAttrType.LineList ||
            type == eAttrType.PointList)
//            type == eAttrType_Node_IndexedTriList ||
//            type == eAttrType_Node_IndexedLineList ||
//            type == eAttrType_Node_IndexedPointList)
        {
            if (!(vertexGeometryNodesClone.push(node))) return;
        }
    }

    // find media texture nodes affecting this node
    var textureNodes = [];
    this.searchTree(null, eAttrType.MediaTexture, false, true, false, null, null, null, textureNodes);

    // find media texture nodes affecting the clone
    var textureNodesClone = [];
    for (i=0; i < pathClone.length(); i++)
    {
        node = pathClone.stack[i];
        if (node.getAttribute() == eAttrType.MediaTexture)
        {
            if (!(textureNodesClone.push(node))) return;
        }
    }

    // for each vertex geometry node
    for (i=0; i < vertexGeometryNodes.size(); i++)
    {
        // for each texture node, setup the uv-coords
        var uvCoords = new NumberArrayAttr();
        for (j=0; j < textureNodes.size() && j < textureNodesClone.size(); j++)
        {
            uvCoords = vertexGeometryNodes[i].findUVCoords(textureNodes[j]);
            if (uvCoords)
            {
                var uvCoords2 = new NumberArrayAttr();
                uvCoords2 = vertexGeometryNodesClone[i].getUVCoords(textureNodesClone[j]);
                if (uvCoords2) uvCoords2.copyValue(uvCoords);
            }
        }
    }

    // setup m_geometry, m_geometryIndicesMap, m_geometryBBoxesMap, and m_surfaceNameMap
    var modelClone = clone;

    // find geometry nodes under the clone
    var geometryNodesClone = [];
    clone.searchesTree(names, types, false, true, false, null, null, null, geometryNodesClone);

    // synchronize m_geometryAttrConnections using "OR" operation (this will ensure attributes set inline on the clone are not lost)
    //std::vector<std::pair<CAttribute*, bool> >::const_iterator it;
    //this.geometryAttrConnections[]
    //std::vector<std::pair<CAttribute*, bool> >::iterator clone_it;
    */
   /* for (it = m_geometryAttrConnections.begin(), clone_it = modelClone->m_geometryAttrConnections.begin();
         it != m_geometryAttrConnections.end(), clone_it != modelClone->m_geometryAttrConnections.end();
         it++, clone_it++)*/
    /*for(var i = 0;i<this.geometryAttrConnections.length;i++)
    {
        // if this node has had a geometry attribute set, and the clone has not, copy the value from this
        if (it->second && !clone_it->second)
        {
            clone_it->first->CopyValue(it->first);
        }

        clone_it->second = clone_it->second | it->second;
    }

    var geometry;
    var srcGeometry;
    var srcIndices = [];
    const std::pair<CVector3Df, CVector3Df>* srcBBox;
    for (i=0; i < geometryNodesClone.size(); i++)
    {
        geometry = geometryNodesClone[i];

        srcGeometry = GetGeometry(i);
        srcIndices = GetGeometryIndices(srcGeometry);
        srcBBox = GetGeometryBBox(srcGeometry);

        if (!(Push_Back<GcGeometry*>(modelClone->m_geometry, geometry))) return;
        if (srcIndices) modelClone.m_geometryIndicesMap[geometry] = *srcIndices;
        if (srcBBox) modelClone->m_geometryBBoxesMap[geometry] = *srcBBox;

        modelClone->UpdateGeometryAttrConnections(geometry, true);
        modelClone->AddGeometryBBox(geometry);
    }

    // find surface nodes under the clone
    var surfaceNodesClone = [];
    clone.searchTree(null, eAttrType.Surface, false, true, false, null, null, null, surfaceNodesClone);

    // synchronize m_surfaceAttrConnectionsMap using "OR" operation (this will ensure attributes set inline on the clone are not lost)
    for (it = m_surfaceAttrConnections.begin(), clone_it = modelClone->m_surfaceAttrConnections.begin();
         it != m_surfaceAttrConnections.end(), clone_it != modelClone->m_surfaceAttrConnections.end();
         it++, clone_it++)
    {
        // if this node has had a surface attribute set, and the clone has not, copy the value from this
        if (it->second && !clone_it->second)
        {
            clone_it->first->CopyValue(it->first);
        }

        clone_it->second = clone_it->second | it->second;
    }

    var surface;
    for (i=0; i < surfaceNodesClone.size(); i++)
    {
        surface = surfaceNodesClone[i];

        modelClone->m_surfaceNameMap[surface->GetName()->GetValueDirect(buffer, sizeof(buffer))] = surface;

        // register surface to this for accessiblity with Set
        modelClone->RegisterAttribute(surface, buffer);
        if (surface.getContainer() == modelClone)
        {
            // don't want modelClone to be the registered container for the surface otherwise it will be released
            // when unregistered
            surface.setContainer(null);
        }

        modelClone->UpdateSurfaceAttrConnections(surface, true);
    }

    // call base-class implementation
    this.postClone(clone, pathSrc, pathClone);
}
*/
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

function Model_SortPolygonsModifiedCB(attribute, container)
{
    // TODO
    //container.sortPolygonsModified();
}
    
function Model_RenderSequenceSlotModifiedCB(attribute, container)
{
    // TODO
    //container.renderSequenceSlotModified();
}

function Model_DissolveModifiedCB(attribute, container)
{
    // TODO
    //container.dissolveModified();
}

function Model_OpacityModifiedCB(attribute, container)
{
    // TODO
    //container.opacityModified(attribute);
}

function Model_TextureOpacityModifiedCB(attribute, container)
{
    //container.textureOpacityModified();
}

function Model_Surface_NumTransparencyTexturesModifiedCB(attribute, container)
{
    // TODO
    //container.surface_NumTransparencyTexturesModified(attribute);
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