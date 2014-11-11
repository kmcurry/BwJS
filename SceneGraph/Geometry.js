Geometry.prototype = new RenderableElement();
Geometry.prototype.constructor = Geometry;

function Geometry()
{
    RenderableElement.call(this);
    this.className = "Geometry";
    this.attrType = eAttrType.Geometry;

    this.boundingTree = new Octree();
    this.updateBoundingTree = false;

    this.selectable = new BooleanAttr(true);
    this.cullable = new BooleanAttr(true);
    this.show = new BooleanAttr(true);
    this.approximationLevels = new NumberAttr(1);
    this.sortPolygons = new BooleanAttr(false);
    this.flipPolygons = new BooleanAttr(false);
    this.shadowCaster = new BooleanAttr(false);
    this.shadowTarget = new BooleanAttr(true);
    this.highlight = new BooleanAttr(false);

    this.selectable.addModifiedCB(Geometry_SelectableModifiedCB, this);
    this.show.addModifiedCB(Geometry_ShowModifiedCB, this);
    this.approximationLevels.addModifiedCB(Geometry_ApproximationLevelsModifiedCB, this);

    this.registerAttribute(this.selectable, "selectable");
    this.registerAttribute(this.cullable, "cullable");
    this.registerAttribute(this.show, "show");
    this.registerAttribute(this.approximationLevels, "approximationLevels");
    this.registerAttribute(this.sortPolygons, "sortPolygons");
    this.registerAttribute(this.flipPolygons, "flipPolygons");
    this.registerAttribute(this.shadowCaster, "shadowCaster");
    this.registerAttribute(this.shadowTarget, "shadowTarget");
    this.registerAttribute(this.highlight, "highlight");
}

Geometry.prototype.update = function(params, visitChildren)
{
    if (this.updateBoundingTree)
    {
        this.updateBoundingTree = false;

        this.buildBoundingTree();
    }
    
    // call base-class implementation
    RenderableElement.prototype.update.call(this, params, visitChildren);
}

Geometry.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        RenderableElement.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
        case "render":
            {
                var drawNow = true;
                var dissolve = params.dissolve;
                var opacity = params.opacity;
                if (dissolve == 1)// || opacity == 0) // completely transparent objects can still reflect specularity
                {
                    // completely transparent, skip drawing
                    drawNow = false;
                }
                else if (dissolve > 0 ||
                         opacity < 1 ||
                         this.graphMgr.textureArrayStack.top().textures[eTextureType.Transparency].length > 0 ||
                         this.graphMgr.projectionTextureArrayStack.top().textures[eTextureType.Transparency].length > 0)
                {
                    // get bbox of geometry
                    var bounds = this.getBBox();

                    // add geometry to distance sort agent for sorted drawing
                    params.distanceSortAgent.addGeometry(this, bounds.min, bounds.max, dissolve);
                    drawNow = false;
                }

                if (drawNow)
                {
                    this.draw(dissolve);
                }
            }
            break;       

        case "rayPick":
            {
                if (this.selectable.getValueDirect() == true &&
                    params.opacity > 0 &&
                    params.dissolve < 1)
                {
                    var worldViewMatrix = params.worldMatrix.multiply(params.viewMatrix);
                    var scale = worldViewMatrix.getScalingFactors();

                    var intersectRecord = rayPick(this.boundingTree, params.rayOrigin, params.rayDir,
                                                  params.nearDistance, params.farDistance,
                                                  params.worldMatrix, params.viewMatrix,
                                                  max3(scale.x, scale.y, scale.z),
                                                  params.doubleSided, params.clipPlanes);
                    if (intersectRecord)
                    {
                        params.currentNodePath.push(this);
                        params.directive.addPickRecord(new RayPickRecord(params.currentNodePath, intersectRecord, params.camera));
                        params.currentNodePath.pop();
                    }
                }
            }
            break;

        case "bbox":
            {
                var bounds = this.getBBox();

                var matrix = new Matrix4x4();
                matrix.loadMatrix(params.worldMatrix);

                if (params.viewSpace)
                {
                    // user wants bbox in view space; multiply world matrix by view matrix
                    // to get worldView matrix
                    matrix.loadMatrix(matrix.multiply(params.viewMatrix));
                }

                var min = matrix.transform(bounds.min.x, bounds.min.y, bounds.min.z, 1);
                var max = matrix.transform(bounds.max.x, bounds.max.y, bounds.max.z, 1);

                if (params.minMaxSet)
                {
                    params.minPoint.x = Math.min(params.minPoint.x, Math.min(min.x, max.x));
                    params.minPoint.y = Math.min(params.minPoint.y, Math.min(min.y, max.y));
                    params.minPoint.z = Math.min(params.minPoint.z, Math.min(min.z, max.z));

                    params.maxPoint.x = Math.max(params.maxPoint.x, Math.max(min.x, max.x));
                    params.maxPoint.y = Math.max(params.maxPoint.y, Math.max(min.y, max.y));
                    params.maxPoint.z = Math.max(params.maxPoint.z, Math.max(min.z, max.z));
                }
                else // !params.minMaxSet
                {
                    params.minPoint.x = Math.min(min.x, max.x);
                    params.minPoint.y = Math.min(min.y, max.y);
                    params.minPoint.z = Math.min(min.z, max.z);

                    params.maxPoint.x = Math.max(min.x, max.x);
                    params.maxPoint.y = Math.max(min.y, max.y);
                    params.maxPoint.z = Math.max(min.z, max.z);

                    params.minMaxSet = true;
                }
            }
            break;
            
        case "highlight":
            {
                if (this.highlight.getValueDirect())
                {
                    if (params.targets.length > 0)
                    {
                        params.targets[params.targets.length-1].geometries.push(this);
                    }
                }
            }
            break;
    }

    // call base-class implementation
    RenderableElement.prototype.apply.call(this, directive, params, visitChildren);
}

Geometry.prototype.draw = function(dissolve)
{
}

Geometry.prototype.drawPrimitives = function()
{
}

Geometry.prototype.getBBox = function()
{
    return { min: this.bbox.min.getValueDirect(), max: this.bbox.max.getValueDirect() };
}

Geometry.prototype.getTriangles = function()
{
    return new Array();
}

function Geometry_SelectableModifiedCB(attribute, container)
{
}

function Geometry_ShowModifiedCB(attribute, container)
{
    container.incrementModificationCount();
}

function Geometry_ApproximationLevelsModifiedCB(attribute, container)
{
    container.updateBoundingTree = true;
    container.incrementModificationCount();
}