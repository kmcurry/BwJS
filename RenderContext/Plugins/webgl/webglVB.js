function webglVB_uvb(buffer, coords)
{
    this.buffer = buffer;
    this.coords = coords;
}

webglVB.prototype = new VertexBuffer();
webglVB.prototype.constructor = webglVB;

function webglVB(gl, program, numVerticesPerPrimitive)
{
    //
    // initialization
    //
    
    VertexBuffer.call(this);
    
    this.numVerticesPerPrimitive = numVerticesPerPrimitive;
    
    var gl = gl;
    var program = program;
    var vb = gl.createBuffer();
    var nb = null;
    var uvb = new Array(gl_MaxTextureStages);
    var uvEmpty = gl.createBuffer(); // for VBs with no texture coordinates (see below)
    var uvCoords = []; // indexed by texture
    var primitiveType = 0;
    
    //
    // methods
    //
    
    this.setPrimitiveType = function(type)
    {
        switch (type)
        {
        case RC_POINTS:         primitiveType = gl.POINTS; break;
        case RC_LINES:          primitiveType = gl.LINES; break;
        case RC_LINE_LOOP:      primitiveType = gl.LINE_LOOP; break;
        case RC_LINE_STRIP:     primitiveType = gl.LINE_STRIP; break;
        case RC_TRIANGLES:      primitiveType = gl.TRIANGLES; break;
        case RC_TRIANGLE_STRIP: primitiveType = gl.TRIANGLE_STRIP; break;
        case RC_TRIANGLE_FAN:   primitiveType = gl.TRIANGLE_FAN; break;
        }
    }
    
    this.setVertices = function(vertices)
    {
        if (vertices.length)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, vb);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            
            this.vertexCount = vertices.length / this.numVerticesPerPrimitive;
            
            // create empty texture coordinate arrays for vb's with no textures (see below)
            gl.bindBuffer(gl.ARRAY_BUFFER, uvEmpty);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(new Array(this.vertexCount * 2)), gl.STATIC_DRAW);           
        }
        
        this.vertices = vertices;
    }
    
    this.setNormals = function(normals)
    {
        if (normals.length)
        {
            if (nb == null)
            {
                nb = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, nb);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        }
        
        this.normals = normals;
    }

    this.setUVCoords = function(texture, coords)
    {
        uvCoords[texture] = new webglVB_uvb(gl.createBuffer(), coords.slice());

        // flip y
        for (var i = 1; i < uvCoords[texture].coords.length; i += 2)
        {
            uvCoords[texture].coords[i] = 1 - uvCoords[texture].coords[i];
        }
    }
    
    this.setTextureStage = function(stage, textureObj, widthWrap, heightWrap, textureCoordSrc, planeCoefficients)
    {
        switch (stage)
        {
        case 0: gl.activeTexture(gl.TEXTURE0); break;       
        case 1: gl.activeTexture(gl.TEXTURE1); break;
        }

        gl.bindTexture(gl.TEXTURE_2D, textureObj.texture);
        gl.uniform1i(program.textureSamplerColor[stage], stage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, widthWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, heightWrap);
                
        if (uvCoords[textureObj])
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, uvCoords[textureObj].buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvCoords[textureObj].coords), gl.STATIC_DRAW);  
            uvb[stage] = uvCoords[textureObj].buffer;
        }            
    }
    
    this.draw = function()
    {
        if (this.vertices.length)
        {
            // vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, vb);
            gl.vertexAttribPointer(program.vertexPositionAttribute, this.numVerticesPerPrimitive, gl.FLOAT, false, 0, 0);

            // normals
            if (nb != null)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, nb);
                gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            }
            
            // texture coords
            // NOTE: vertex shader silently fails if nothing is specified for a given program attribute, so if 
            // no texture coords are specified, use the vertex uv buffer.
            for (var i=0; i < gl_MaxTextureStages; i++)
            {
                if (uvb[i]) 
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvb[i]);
                else 
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvEmpty);
                gl.vertexAttribPointer(program.textureCoordAttribute[i], 2, gl.FLOAT, false, 0, 0);
            }
  
            gl.drawArrays(primitiveType, 0, this.vertexCount);
        }
    }
}