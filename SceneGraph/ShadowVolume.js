function ShadowVolume()
{
    this.renderContext = null;
    this.vertices             = [];   // List of unique vertices of the object
    this.verticesHash         = {};   // Hash list of vertices
    this.lines                = [];   // List of lines in both directions...
    this.linesUnique          = [];   // A list of unique lines
    this.lineSides            = [];
    this.triangles            = [];   // Triangles in the object
}

ShadowVolume.prototype.setRenderContext = function(rc)
{
    this.renderContext = rc;
}

ShadowVolume.prototype.setVertices = function(vertices)
{
    this.lines = [];
    this.triangles = [];

    for (var i = 0, vertex = 0; vertex + 8 < vertices.length; i++, vertex += 9)
    {
        this.addTriangle(vertices[vertex  ], vertices[vertex + 1], vertices[vertex + 2],
                         vertices[vertex + 3], vertices[vertex + 4], vertices[vertex + 5],
                         vertices[vertex + 6], vertices[vertex + 7], vertices[vertex + 8]);
    }
}

ShadowVolume.prototype.addTriangle = function(x1, y1, z1,
                                              x2, y2, z2,
                                              x3, y3, z3)
{
    // Add the vertices...
    var vertex1 = this.addVertex(x1, y1, z1);
    var vertex2 = this.addVertex(x2, y2, z2);
    var vertex3 = this.addVertex(x3, y3, z3);

    // Add the lines, these are used to calculate the edge of the object...
    // Each line is associated with the new triangle...
    var line1   = this.addLine(vertex1, vertex2);
    var line2   = this.addLine(vertex2, vertex3);
    var line3   = this.addLine(vertex3, vertex1);
    
    // normal
    var leg1 = new Vector3D(x2 - x1, y2 - y1, z2 - z1);
    var leg2 = new Vector3D(x3 - x1, y3 - y1, z3 - z1);
    var normal = crossProduct(leg1, leg2);
    normal.normalize();

    // center
    var center = new Vector3D((x1 + x2 + x3) / 3,
                              (y1 + y2 + y3) / 3,
                              (z1 + z2 + z3) / 3);

    this.triangles.push({vertices : [vertex1, vertex2, vertex3],
                         lines    : [line1, line2, line3],
                         normal   : normal,
                         center   : center,
                         visible  : false});
}

ShadowVolume.prototype.addVertex = function(x, y, z) 
{
    var hash  = ~~(x * 1000) + '_' + ~~(y * 1000) + '_' + ~~(z * 1000),
        index = this.verticesHash[hash]; // Check if the value was added before...

    if (index === undefined) { // A new vertex...
        index                   = this.vertices.length;
        this.verticesHash[hash] = index;
        vertex                  = [x, y, z];
        this.vertices.push(vertex);
    }

    return index;
}

ShadowVolume.prototype.addLine = function(v1, v2)
{
    this.lines.push({v1:v1, v2:v2});

    return this.lines.length - 1;
}
    
ShadowVolume.prototype.update = function(lights, worldMatrix)
{return;
    var thisPosition = worldMatrix.transform(0, 0, 0, 1);

    for (var i = 0; i < lights.length; i++)
    {
        var light = lights[i];
        if (light.getAttribute("shadowCaster").getValueDirect())
        {
            var lightPosition = light.getAttribute("sectorPosition").getValueDirect();

            // Get the position of the light from the matrix
            var vector = new Vector3D(
                    lightPosition.x - thisPosition.x,
                    lightPosition.y - thisPosition.y,
                    lightPosition.z - thisPosition.z);

            // Instead of rotating the object to face the light at the
            // right angle it's a lot faster to rotate the light in the 
            // reverse direction...
            vector = worldMatrix.transform(vector.x, vector.y, vector.z, 0);
            
            this.checkDirection(vector);
            this.findEdge();
        }
    }
}

ShadowVolume.prototype.checkDirection = function(lightLocation)
{
    for (var i = 0; i < this.triangles.length; i++)
    {
        var triangle = this.triangles[i];
        
        // Create a normalized vector based on the vector from
        // the center of the triangle to the lights position
        var vector = new Vector3D(triangle.center.x - lightLocation.x,
                                  triangle.center.y - lightLocation.y,
                                  triangle.center.z - lightLocation.z);
        vector.normalize();
        
        triangle.visible = dotProduct(vector, triangle.normal) < 0 ? true : false;
    }
}

ShadowVolume.prototype.findEdge = function()
{
    var i, j, k;
    var line;
    var a, b;
    var lineSidesHash = {};
    
    this.lineSides = [];
    
    for (var i = 0; i < this.triangles.length; i++)
    {
        var triangle = this.triangles[i];
        if (triangle.visible)
        {
            for (var j = 0; j < 3; j++)
            {
                k    = triangle.lines[j];
                line = this.lines[k];
                a    = line.v1 + '_' + line.v2;
                b    = line.v1 + '_' + line.v2;

                if (lineSidesHash[a] !== undefined) 
                { // Check the v1 -> v2 direction...
                    // The side already exists, remove it...
                    delete(lineSidesHash[a]);
                }
                else if (lineSidesHash[b] !== undefined)
                { // Check the v2 -> v1 direction...
                    // The side already exists, remove it...
                    delete(lineSidesHash[b]);
                }
                else
                {
                    // It's a new side, add it to the list...
                    lineSidesHash[a] = k;
                }
            }
        }
    }
    
    for (var i in lineSidesHash) 
    {
        this.lineSides.push(this.lines[lineSidesHash[i]]);
    }
}
