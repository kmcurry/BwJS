LineList.prototype = new VertexGeometry();
LineList.prototype.constructor = LineList;

function LineList()
{
    VertexGeometry.call(this);
    this.className = "LineList";
    this.attrType = eAttrType.LineList;
    this.width = 1;
}

LineList.prototype.update = function(params, visitChildren)
{
    if (!this.vertexBuffer)
    {
        this.vertexBuffer = this.graphMgr.renderContext.createVertexBuffer(3);
        this.vertexBuffer.setPrimitiveType(RC_LINES);
    }
    
    // call base-class implementation
    VertexGeometry.prototype.update.call(this, params, visitChildren);
}

LineList.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class impementation
    VertexGeometry.prototype.apply.call(this, directive, params, visitChildren);
}

LineList.prototype.draw = function(dissolve)
{
    // TODO
    
    this.vertexBuffer.draw();
}

LineList.prototype.buildBoundingTree = function()
{
    
}