Geometry.prototype = new RenderableElement();
Geometry.prototype.constructor = Geometry;

function Geometry()
{
    RenderableElement.call(this);
    this.className = "Geometry";
    this.attrType = eAttrType.Geometry;

    this.cullable = new BooleanAttr(true);
    this.sortPolygons = new BooleanAttr(false);
    this.flipPolygons = new BooleanAttr(false);
    this.shadowCaster = new BooleanAttr(false);
    this.shadowTarget = new BooleanAttr(true);

    this.registerAttribute(this.cullable, "cullable");
    this.registerAttribute(this.sortPolygons, "sortPolygons");
    this.registerAttribute(this.flipPolygons, "flipPolygons");
    this.registerAttribute(this.shadowCaster, "shadowCaster");
    this.registerAttribute(this.shadowTarget, "shadowTarget");
}

Geometry.prototype.update = function(params, visitChildren)
{
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
    }

    // call base-class implementation
    RenderableElement.prototype.apply.call(this, directive, params, visitChildren);
}

Geometry.prototype.draw = function(dissolve)
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
