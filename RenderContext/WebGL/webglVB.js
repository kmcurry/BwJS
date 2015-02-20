function webglVB_uvb(buffer, coords)
{
    this.buffer = buffer;
    this.coords = coords;
}

webglVB.prototype = new VertexBuffer();
webglVB.prototype.constructor = webglVB;

function webglVB(rc, gl, numVerticesPerPrimitive)
{
    //
    // initialization
    //

    VertexBuffer.call(this);

    this.numVerticesPerPrimitive = numVerticesPerPrimitive;

    var rc = rc;
    var gl = gl;
    var vb = gl.createBuffer();
    var nb = null;
    var cb = null;
    var cEmpty = gl.createBuffer(); // for VBs with no color coordinates (see below)
    var uvb = new Array(gl_MaxTextureStages);
    var uvEmpty = gl.createBuffer(); // for VBs with no texture coordinates (see below)
    var uvCoords = []; // indexed by texture
    var primitiveType = 0;

    //
    // methods
    //

    this.setPrimitiveType = function(type)
    {
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_SetPrimitiveType, [this, type]);

        switch (type)
        {
            case RC_POINTS:
                primitiveType = gl.POINTS;
                break;
            case RC_LINES:
                primitiveType = gl.LINES;
                break;
            case RC_LINE_LOOP:
                primitiveType = gl.LINE_LOOP;
                break;
            case RC_LINE_STRIP:
                primitiveType = gl.LINE_STRIP;
                break;
            case RC_TRIANGLES:
                primitiveType = gl.TRIANGLES;
                break;
            case RC_TRIANGLE_STRIP:
                primitiveType = gl.TRIANGLE_STRIP;
                break;
            case RC_TRIANGLE_FAN:
                primitiveType = gl.TRIANGLE_FAN;
                break;
        }
    }

    this.setVertices = function(vertices)
    {
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_SetVertices, [this, vertices]);

        if (vertices.length)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, vb);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            this.vertexCount = vertices.length / this.numVerticesPerPrimitive;

            // create empty color array for vb's with no colors specified (see below)
            gl.bindBuffer(gl.ARRAY_BUFFER, cEmpty);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexCount * 4), gl.STATIC_DRAW);

            // create empty texture coordinate arrays for vb's with no textures (see below)
            gl.bindBuffer(gl.ARRAY_BUFFER, uvEmpty);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(new Array(this.vertexCount * 2)), gl.STATIC_DRAW);
        }

        this.vertices = vertices;
    }

    this.setNormals = function(normals)
    {
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_SetNormals, [this, normals]);

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

    this.setColors = function(colors)
    {
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_SetColors, [this, colors]);

        if (colors.length)
        {
            if (cb == null)
            {
                cb = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, cb);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        }

        this.colors = colors;
    }

    this.setUVCoords = function(texture, coords)
    {
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_SetUVCoords, [this, texture, coords]);

        uvCoords[texture] = new webglVB_uvb(gl.createBuffer(), coords.slice());

        // flip y
        for (var i = 1; i < uvCoords[texture].coords.length; i += 2)
        {
            uvCoords[texture].coords[i] = 1 - uvCoords[texture].coords[i];
        }
    }

    this.setTextureStage = function(stage, textureObj, widthWrap, heightWrap, textureCoordSrc, planeCoefficients)
    {
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_SetTextureStage, [this, stage, textureObj, widthWrap, heightWrap, textureCoordSrc, planeCoefficients]);

        switch (stage)
        {
            case 0:
                {
                    gl.activeTexture(gl.TEXTURE0 + eTextureUnit.Color0);
                    gl.uniform1i(rc.getProgram().textureSamplerColor[stage], eTextureUnit.Color0);
                }
                break;

            case 1:
                {
                    gl.activeTexture(gl.TEXTURE0 + eTextureUnit.Color1);
                    gl.uniform1i(rc.getProgram().textureSamplerColor[stage], eTextureUnit.Color1);
                }
                break;
        }

        gl.bindTexture(gl.TEXTURE_2D, textureObj.texture);     
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
        if (rc.displayListObj)
            DL_ADD_METHOD_DESC(rc.displayListObj, eRenderContextMethod.VB_Draw, [this]);

        if (this.vertices.length)
        {
            // vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, vb);
            gl.vertexAttribPointer(rc.getProgram().vertexPositionAttribute, this.numVerticesPerPrimitive, gl.FLOAT, false, 0, 0);

            // normals
            if (nb)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, nb);
                gl.vertexAttribPointer(rc.getProgram().vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            }

            // colors
            if (cb)
                gl.bindBuffer(gl.ARRAY_BUFFER, cb);
            else
                gl.bindBuffer(gl.ARRAY_BUFFER, cEmpty);
            gl.vertexAttribPointer(rc.getProgram().vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

            // texture coords
            // NOTE: vertex shader silently fails if nothing is specified for a given rc.getProgram() attribute, so if 
            // no texture coords are specified, use the vertex uv buffer.
            for (var i = 0; i < gl_MaxTextureStages; i++)
            {
                if (uvb[i])
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvb[i]);
                else
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvEmpty);
                gl.vertexAttribPointer(rc.getProgram().textureCoordAttribute[i], 2, gl.FLOAT, false, 0, 0);
            }

            gl.drawArrays(primitiveType, 0, this.vertexCount);
        }
    }
}