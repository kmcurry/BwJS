TriList.prototype = new VertexGeometry();
TriList.prototype.constructor = TriList;

function TriList()
{
    VertexGeometry.call(this);
    this.className = "TriList";
    this.attrType = eAttrType.TriList;
    
    this.updateNormals = false;
    
    this.normals = new NumberArrayAttr();
    
    this.vertices.addModifiedCB(TriList_NormalsModifiedCB, this);
    this.normals.addModifiedCB(TriList_NormalsModifiedCB, this);
    
    this.registerAttribute(this.normals, "normals");
}

TriList.prototype.update = function(params, visitChildren)
{
    if (!this.vertexBuffer)
    {
        this.vertexBuffer = this.graphMgr.renderContext.createVertexBuffer(3);
        this.vertexBuffer.setPrimitiveType(RC_TRIANGLES);
    }
       
    if (this.updateNormals)
    {
        this.updateNormals = false;
        
        this.vertexBuffer.setNormals(this.normals.getValueDirect());
    }
    
    // call base-class implementation
    VertexGeometry.prototype.update.call(this, params, visitChildren);
}

TriList.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class impementation
    VertexGeometry.prototype.apply.call(this, directive, params, visitChildren);
}

TriList.prototype.draw = function(dissolve)
{
    // TODO
    
    // draw with textures
    this.drawTextured(dissolve);
}

TriList.prototype.buildBoundingTree = function()
{
    var min = this.bbox.getAttribute("min").getValueDirect();
    var max = this.bbox.getAttribute("max").getValueDirect();
    
    this.boundingTree.setTriangles(this.getTriangles(), min, max);
    this.boundingTree.buildTree(this.approximationLevels.getValueDirect());
}

TriList.prototype.getTriangles = function()
{
    var vertices = this.vertices.getValueDirect();
    
    var tris = [];
    for (var i=0, vertex=0; vertex+8 < vertices.length; i++, vertex+=9)
    {
        tris.push(new Triangle(vertices[vertex  ],  // v0
                               vertices[vertex+1],
                               vertices[vertex+2],
                               
                               vertices[vertex+3],  // v1
                               vertices[vertex+4],
                               vertices[vertex+5],
                               
                               vertices[vertex+6],  // v2
                               vertices[vertex+7],
                               vertices[vertex+8]));
    }
    
    return tris;
}

function TriList_NormalsModifiedCB(attribute, container)
{
    container.updateNormals = true;
    container.incrementModificationCount();
}