function ShadowVolume()
{
    this.renderContext = null;
    this.lines = []; // used to calculate edges of geometry
}

ShadowVolume.prototype.setRenderContext = function(rc)
{
    this.renderContext = rc;
}

ShadowVolume.prototype.setVertices = function(vertices)
{
    this.lines = [];
     
    for (var i=0, vertex=0; vertex+8 < vertices.length; i++, vertex+=9)
    {
        var v1 = new Vector3D(vertices[vertex  ], vertices[vertex+1], vertices[vertex+2]);
        var v2 = new Vector3D(vertices[vertex+3], vertices[vertex+4], vertices[vertex+5]);
        var v3 = new Vector3D(vertices[vertex+6], vertices[vertex+7], vertices[vertex+8]);
        
        this.lines.push(new Pair(v1, v2));
        this.lines.push(new Pair(v2, v3));
        this.lines.push(new Pair(v3, v1));
    }
}


