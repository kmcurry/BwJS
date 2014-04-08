PointList.prototype = new VertexGeometry();
PointList.prototype.constructor = PointList;

function PointList()
{
    VertexGeometry.call(this);
    this.className = "PointList";
    this.attrType = eAttrType.PointList;
    this.width = 1;
}

PointList.prototype.update = function(params, visitChildren)
{
    if (!this.vertexBuffer)
    {
        this.vertexBuffer = this.graphMgr.renderContext.createVertexBuffer(3);
        this.vertexBuffer.setPrimitiveType(RC_POINTS);
    }
    
    // call base-class implementation
    VertexGeometry.prototype.update.call(this, params, visitChildren);
}

PointList.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class impementation
    VertexGeometry.prototype.apply.call(this, directive, params, visitChildren);
}

PointList.prototype.draw = function(dissolve)
{
    // TODO
    
    this.vertexBuffer.draw();
}

PointList.prototype.buildBoundingTree = function()
{
    
}