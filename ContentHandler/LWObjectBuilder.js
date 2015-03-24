LWObjectBuilder.prototype = new ContentBuilder();
LWObjectBuilder.prototype.constructor = LWObjectBuilder;

function LWObjectBuilder()
{
    ContentBuilder.call(this);
    this.className = "LWObjectBuilder";
    
    this.graphMgr = null;
    
    this.indexGeometry = new BooleanAttr(true);
    
    this.registerAttribute(this.indexGeometry, "indexGeometry");
}

LWObjectBuilder.prototype.visitHandler = function(handler)
{
    handler.addObjectHandler(LWObjectBuilder_ObjectHandler, this);
}

LWObjectBuilder.prototype.finalize = function()
{
}

LWObjectBuilder.prototype.matchesType = function(type)
{
    return (type == "lwo");
}

LWObjectBuilder.prototype.allocateModel = function(data)
{
    var model = null;
    var layer = this.layer;
    if (layer == 0)
    {
        for (var i=0; i < data.layers.length; i++)
        {
            // allocate model if necessary (otherwise use the model passed to the builder)
            if (!this.models[0])
            {
                var factory = this.registry.find("AttributeFactory");
                model = factory.create("Model");
                this.models.push(model);
            }
            else model = this.models[0];

            // TODO: matching model/replace model surfaces

            // define model attributes
            this.describeModel(data, data.layers[i], model);
        }
    }
    else if (layer <= data.layers.length) // layer > 0
    {
        // allocate model if necessary (otherwise use the model passed to the builder)
        if (!this.models[0])
        {
            var factory = this.registry.find("AttributeFactory");
            model = factory.create("Model");
            this.models.push(model);
        }
        else model = this.models[0];
        
        // TODO: matching model/replace model surfaces

        // define model attributes
        this.describeModel(data, data.layers[layer-1], model);
    }
}

LWObjectBuilder.prototype.describeModel = function(data, layer, model)
{
    var factory = this.registry.find("AttributeFactory");
    
    // set name if not already set by scene
    var name = model.getAttribute("name");
    if (name.modificationCount == 0)
    {
        var layerName = data.name;
        if (data.layers.length > 1)
        {
            layerName += ":Layer" + this.layer;
        }
        name.setValueDirect(layerName);
    }
    
    // set pivot if not already set by scene
    var pivot = model.getAttribute("pivot");
    if (pivot.modificationCount == 0)
    {
        pivot.setValue(layer.pivot.v());
    }

    // build list of tri, line, and point poly indices indexed by surface number
    var numSurfaces = layer.ptagsSURFMaxIndex + 1;
    var triPolys = new Array(numSurfaces);
    var linePolys = new Array(numSurfaces);
    var pointPolys = new Array(numSurfaces);
    var NPolys = new Array(numSurfaces);
    for (var i = 0; i < numSurfaces; i++)
    {
        triPolys[i] = [];
        linePolys[i] = [];
        pointPolys[i] = [];
        NPolys[i] = [];
    }

    var polyIndex, surfIndex;
    var numPtagsSURF = layer.ptagsSURF.length;
    for (var ptag = 0; ptag < numPtagsSURF; ptag++)
    {
        polyIndex = layer.ptagsSURF[ptag].poly;
        surfIndex = layer.ptagsSURF[ptag].tag;

        switch (layer.pols[polyIndex].length)
        {
            case 3: triPolys[surfIndex].push(polyIndex); break;
            case 2: linePolys[surfIndex].push(polyIndex); break;
            case 1: pointPolys[surfIndex].push(polyIndex); break;
            default: NPolys[surfIndex].push(polyIndex); break;
        }
    }

    // create surfaces for geometry
    var surfaces = new Array(numSurfaces);
    for (var surfIndex = 0; surfIndex < numSurfaces; surfIndex++)
    {
        surfaces[surfIndex] = this.allocateSurface(data, layer, surfIndex);

        // add surface to model (model will target surface and set its color to the surface)
        model.addSurface(surfaces[surfIndex]);
    }

    // set layer vertices to model
    var layerVertices = new Array(layer.pnts.length * 3);
    for (var layerVertex = 0; layerVertex < layer.pnts.length; layerVertex++)
    {
        layerVertices[layerVertex * 3] = layer.pnts[layerVertex].x;
        layerVertices[layerVertex * 3 + 1] = layer.pnts[layerVertex].y;
        layerVertices[layerVertex * 3 + 2] = layer.pnts[layerVertex].z;
    }
    model.getAttribute("vertices").setValue(layerVertices);

    // create geometry (calculate polygon normals for tris)
    var vertexPolyNormals = [];
    var vertexNormals = [];
    var vertexOrder = [];
    var vertexMinMax = [];
    var polyOrder = [];
    var triLists = [];
    var triVertices = [];
    var triPolyNormals = [];
    var leg1 = new Vector3D();
    var leg2 = new Vector3D();
        
    vertexPolyNormals.length = layer.pnts.length;
    for (var i = 0; i < vertexPolyNormals.length; i++)
    {
        vertexPolyNormals[i] = [];
    }
    vertexNormals.length = numSurfaces;
    vertexOrder.length = numSurfaces;
    vertexMinMax.length = numSurfaces;
    polyOrder.length = numSurfaces;
    triLists.length = numSurfaces;
    triVertices.length = numSurfaces;
    triPolyNormals.length = numSurfaces;

    for (var surfIndex = 0; surfIndex < surfaces.length; surfIndex++)
    {
        var vertices = [];
        var normals = [];
        var surfacePnts = []; // for setting surface's layer vertices to surface
        vertexNormals[surfIndex] = []
        vertexOrder[surfIndex] = [];
        vertexMinMax[surfIndex] = new Pair();
        vertexMinMax[surfIndex].first = vertexMinMax[surfIndex].second = 0;
        polyOrder[surfIndex] = [];
        triPolyNormals[surfIndex] = [];

        // N-polys (triangulate then add to tris list)
        var polys = NPolys[surfIndex];
        var numPolys = polys.length;
        for (var polyIndex = 0; polyIndex < numPolys; polyIndex++)
        {
            var jsmPolygon = new JSM.Polygon();
            var poly = layer.pols[polys[polyIndex]];
            for (var vertex = 0; vertex < poly.length; vertex++)
            {
                var point = layer.pnts[poly[vertex]];
                surfacePnts[poly[vertex]] = point;
                
                vertices.push([point.x, point.y, point.z]);

                jsmPolygon.AddVertex(point.x, point.y, point.z);
            }
           
            var triangles = JSM.PolygonTriangulate(jsmPolygon);
            for (var i=0; i < triangles.length; i++)
            {
                var triPoly = [];
                triPoly.push(poly[triangles[i][0]]);
                triPoly.push(poly[triangles[i][1]]);
                triPoly.push(poly[triangles[i][2]]);
                
                layer.pols.push(triPoly);
                triPolys[surfIndex].push(layer.pols.length-1);
            }
        }

        // tris   
        vertices = [];
        polys = triPolys[surfIndex];
        numPolys = polys.length;
        for (var polyIndex = 0; polyIndex < numPolys; polyIndex++)
        {
            var poly = layer.pols[polys[polyIndex]];
            for (var vertex = 0; vertex < 3; vertex++)
            {
                var point = layer.pnts[poly[vertex]];
                surfacePnts[poly[vertex]] = point;
                
                vertices.push(point.x);
                vertices.push(point.y);
                vertices.push(point.z);

                vertexOrder[surfIndex].push(poly[vertex]);
                vertexMinMax[surfIndex].first = Math.min(poly[vertex], vertexMinMax[surfIndex].first);
                vertexMinMax[surfIndex].second = Math.min(poly[vertex], vertexMinMax[surfIndex].second);
                polyOrder[surfIndex].push(polys[polyIndex]);
            }

            // get vertex indices
            var vertIndex0 = poly[0];
            var vertIndex1 = poly[1];
            var vertIndex2 = poly[2];

            // calculate polygon normal
            var point0 = layer.pnts[vertIndex0];
            var point1 = layer.pnts[vertIndex1];
            var point2 = layer.pnts[vertIndex2];

            leg1.load(point1.x - point0.x,
                      point1.y - point0.y,
                      point1.z - point0.z);

            leg2.load(point2.x - point0.x,
                      point2.y - point0.y,
                      point2.z - point0.z);

            var cross = crossProduct(leg1, leg2);
            cross.normalize();

            normals.push(cross.x)
            normals.push(cross.y);
            normals.push(cross.z);

            normals.push(cross.x)
            normals.push(cross.y);
            normals.push(cross.z);

            normals.push(cross.x)
            normals.push(cross.y);
            normals.push(cross.z);

            vertexNormals[surfIndex].push(new Pair(vertIndex0, cross));
            vertexNormals[surfIndex].push(new Pair(vertIndex1, cross));
            vertexNormals[surfIndex].push(new Pair(vertIndex2, cross));

            vertexPolyNormals[vertIndex0].push(cross);
            vertexPolyNormals[vertIndex1].push(cross);
            vertexPolyNormals[vertIndex2].push(cross);

            triPolyNormals[surfIndex].push(cross);
            triPolyNormals[surfIndex].push(cross);
            triPolyNormals[surfIndex].push(cross);
        }

        if (vertices.length)
        {
            var triList = factory.create("TriList");

            model.addGeometry(triList, vertexOrder[surfIndex], surfaces[surfIndex]);

            triList.getAttribute("vertices").setValue(vertices);
            triList.getAttribute("normals").setValue(normals);

            triLists[surfIndex] = triList;
            triVertices[surfIndex] = vertices;
        }

        // lines
        vertices = [];
        polys = linePolys[surfIndex];
        numPolys = polys.length;
        
        for (var polyIndex = 0; polyIndex < numPolys; polyIndex++)
        {
            var poly = layer.pols[polyIndex];
            if (poly.length < 2) continue;
            
            for (var vertex = 0; vertex < 2; vertex++)
            {
                var point = layer.pnts[poly[vertex]];
                surfacePnts[poly[vertex]] = point;
                
                vertices.push(point.x);
                vertices.push(point.y);
                vertices.push(point.z);
                
            }
        }
        
        if (vertices.length)
        {
            var lineList = factory.create("LineList");

            model.addGeometry(lineList, null, surfaces[surfIndex]);
            
            lineList.getAttribute("vertices").setValue(vertices);
        }
        
        // points
        vertices = [];
        polys = pointPolys[surfIndex];
        numPolys = polys.length;
        
        for (var polyIndex = 0; polyIndex < numPolys; polyIndex++)
        {
            var poly = layer.pols[polyIndex];
            
            var point = layer.pnts[poly[0]];
            surfacePnts[poly[0]] = point;
            
            vertices.push(point.x);
            vertices.push(point.y);
            vertices.push(point.z);
                
        }
        
        if (vertices.length)
        {
            var pointList = factory.create("PointList");

            model.addGeometry(pointList, null, surfaces[surfIndex]);
            
            pointList.getAttribute("vertices").setValue(vertices);
        }
        
        // set surface's layer vertices to surface
        var surfaceVertices = [];
        for (var surfacePnt in surfacePnts)
        {
            surfaceVertices.push(surfacePnts[surfacePnt].x);
            surfaceVertices.push(surfacePnts[surfacePnt].y);
            surfaceVertices.push(surfacePnts[surfacePnt].z);
        }
        surfaces[surfIndex].getAttribute("vertices").setValue(surfaceVertices);
    }

    // calculate smooth normals for tris
    var smoothNormals = [];
    for (var surfIndex = 0; surfIndex < surfaces.length; surfIndex++)
    {
        if (!triLists[surfIndex]) continue;

        var surface = data.getSurface(data.tags[surfIndex]);
        if (!surface) continue;
        
        var smoothingAngle = surface.smoothingAngle;
        if (smoothingAngle <= 0) continue;

        var cosSmoothingAngle = Math.cos(smoothingAngle);

        smoothNormals.length = vertexNormals[surfIndex].length;
        for (var i = 0; i < smoothNormals.length; i++)
        {
            smoothNormals[i] = new Vector3D();
        }

        // for each vertex normal...
        for (var vn = 0; vn < vertexNormals[surfIndex].length; vn++)
        {
            var vertexIndex = vertexNormals[surfIndex][vn].first;
            var vertexNormal = vertexNormals[surfIndex][vn].second;

            // for each polygon normal...
            for (var vpn = 0; vpn < vertexPolyNormals[vertexIndex].length; vpn++)
            {
                var polyNormal = vertexPolyNormals[vertexIndex][vpn];
                var angle = cosineAngleBetween(vertexNormal, polyNormal);
                if (Math.acos(angle) <= smoothingAngle)
                {
                    smoothNormals[vn].x += polyNormal.x;
                    smoothNormals[vn].y += polyNormal.y;
                    smoothNormals[vn].z += polyNormal.z;
                }
            }

            smoothNormals[vn].normalize();
        }

        // arrange smooth normals in array
        var smoothedNormals = [];
        for (var i = 0; i < smoothNormals.length; i++)
        {
            smoothedNormals.push(smoothNormals[i].x);
            smoothedNormals.push(smoothNormals[i].y);
            smoothedNormals.push(smoothNormals[i].z);
        }
        smoothNormals.length = 0;

        triLists[surfIndex].getAttribute("normals").setValue(smoothedNormals);
    }

    // load textures
    for (var surfIndex = 0; surfIndex < surfaces.length; surfIndex++)
    {
        var surfaceData = data.getSurface(surfaces[surfIndex].getAttribute("name").getValueDirect().join(""));
        if (surfaceData)
        {
            var textures = this.loadTextures(data, layer, surfaceData, surfaces[surfIndex]);

            // calculate texture coordinates
            for (var i = 0; i < textures.length; i++)
            {
                var uvCoords = this.calculateTextureCoords(data, layer, textures[i].second, triVertices[surfIndex],
                                                       triPolyNormals[surfIndex], vertexOrder[surfIndex],
                                                       polyOrder[surfIndex]);
                if (uvCoords)
                {
                    triLists[surfIndex].getUVCoords(textures[i].first).setValueDirect(uvCoords);
                }
            }
        }
    }

    // TODO: index vertices if requested
}

LWObjectBuilder.prototype.allocateSurface = function(data, layer, surfaceNumber)
{
     var factory = this.registry.find("AttributeFactory");
     surface = factory.create("Surface");
     
     var name = data.tags[surfaceNumber];
     surface.getAttribute("name").setValueDirect(name);
     
     this.describeSurface(data.getSurface(name), surface);
     
     return surface;
}

LWObjectBuilder.prototype.describeSurface = function(data, surface)
{
    // TEMPTEST
    if (!data) return;
    
    // color
    var values = [];
    values.push(data.color.x);
    values.push(data.color.y);
    values.push(data.color.z);
    values.push(1);
    surface.getAttribute("color").setValue(values);
    
    // ambient level (use diffuse since ambient level is not specified
    surface.getAttribute("ambientLevel").setValueDirect(data.diffuseLevel);
    
    // diffuse level
    surface.getAttribute("diffuseLevel").setValueDirect(data.diffuseLevel);
    
    // specular level
    surface.getAttribute("specularLevel").setValueDirect(data.specularLevel);
    
    // emissive level
    surface.getAttribute("emissiveLevel").setValueDirect(data.luminosityLevel);
    
    // glossiness
    surface.getAttribute("glossiness").setValueDirect(data.glossiness);
    
    // opacity
    surface.getAttribute("opacity").setValueDirect(1 - data.transparencyLevel);
    
    // double-sidedness
    surface.getAttribute("doubleSided").setValueDirect(data.doubleSided ? true : false);
}

LWObjectBuilder.prototype.loadTextures = function(data, layer, surfaceData, surface)
{
    var textures = [];

    // arrange blocks into ordered lists indexed by channel
    var channelBlocks = [];
    for (var i = 0; i < surfaceData.blocks.length; i++)
    {
        var block = surfaceData.blocks[i];
        if (block.type != 'IMAP') continue;

        if (!channelBlocks[block.channel])
        {
            channelBlocks[block.channel] = []
        }
        channelBlocks[block.channel].push(block);
    }

    // allocate textures for supported channel types

    // color
    if (channelBlocks[eLWObjectTokens.COLR])
    {
        this.allocateTextures(eTextureType.Color, data, layer, channelBlocks[eLWObjectTokens.COLR], surface, textures);
    }

    // diffuse
    if (channelBlocks[eLWObjectTokens.DIFF])
    {
        this.allocateTextures(eTextureType.Diffuse, data, layer, channelBlocks[eLWObjectTokens.DIFF], surface, textures);
    }

    // luminosity
    if (channelBlocks[eLWObjectTokens.LUMI])
    {
        this.allocateTextures(eTextureType.Luminosity, data, layer, channelBlocks[eLWObjectTokens.LUMI], surface, textures);
    }

    // specular
    if (channelBlocks[eLWObjectTokens.SPEC])
    {
        this.allocateTextures(eTextureType.Specular, data, layer, channelBlocks[eLWObjectTokens.SPEC], surface, textures);
    }

    // transparency
    if (channelBlocks[eLWObjectTokens.TRAN])
    {
        this.allocateTextures(eTextureType.Transparency, data, layer, channelBlocks[eLWObjectTokens.TRAN], surface, textures);
    }

    return textures;
}

LWObjectBuilder.prototype.allocateTextures = function(type, data, layer, blocks, surface, textures)
{  
    // create a media texture object for each normal or additive texture layer; if subsequent
    // layer is alpha, add as texture alpha channel
    for (var i=0; i < blocks.length; i++)
    {
        var block = blocks[i];
        if (block.opacityType != 0 && 
            block.opacityType != 7)
            continue;
            
        var imageClip = data.clips[block.imageIndex];
        if (!imageClip)
            continue;
            
        var alphaClip = null;
        if (i+1 < blocks.length)
        {
            if (blocks[i+1].opacityType == 5)
            {
                alphaClip = data.clips[blocks[i+1].imageIndex];
            }    
        } 
        
        var widthWrap, heightWrap;
        switch (block.widthWrap)
        {
        case 0: widthWrap = eTextureWrap.None; break;
        case 1: widthWrap = eTextureWrap.Repeat; break; 
        case 2: widthWrap = eTextureWrap.Mirror; break;
        case 3: widthWrap = eTextureWrap.Clamp; break;
        } 
        switch (block.heightWrap)
        {
        case 0: heightWrap = eTextureWrap.None; break;
        case 1: heightWrap = eTextureWrap.Repeat; break; 
        case 2: heightWrap = eTextureWrap.Mirror; break;
        case 3: heightWrap = eTextureWrap.Clamp; break;
        }     
        
        var filename = imageClip.getFilename();
        
        // strip any local paths saved by the modeler
        var ndx = filename.lastIndexOf('/');
        
        filename = ndx === -1 ? filename : filename.substring(ndx+1);
         
        var clipFilename = data.contentDir + "images/" + filename;
        
        // setup negate image flag based upon whether or not the graphics card uses
        // inverted alpha values, and if this is a transparency, diffuse, luminosity,
        // or specularity texture
        var negateImage = block.negative ? true : false;
        if (this.invertAlpha && 
           (type == eTextureType.Transparency ||
            type == eTextureType.Diffuse ||
            type == eTextureType.Luminosity ||
            type == eTextureType.Specularity))
        {
            negateImage = !negateImage;
        }

        // setup negate alpha flag based upon existance of an alpha clip and 
        // whether or not the graphics card uses inverted alpha values
        var negateAlpha = false;
        if (alphaClip)
        {
            negateAlpha = blocks[i+1].negative ? true : false;
            if (this.invertAlpha)
            {
                negateAlpha = !negateAlpha;
            }
        }
        
        // TODO: check if texture with same attributes has already been created;
        // if not, or if an opacity envelope is being used, allocate new one
        var mediaTexture = null;
        
        var factory = this.registry.find("AttributeFactory");
        mediaTexture = factory.create("MediaTexture");
           
        mediaTexture.getAttribute("name").setValueDirect(""); // TODO
        mediaTexture.getAttribute("textureType").setValueDirect(type);
        mediaTexture.getAttribute("opacity").setValueDirect(block.opacity);
        mediaTexture.getAttribute("widthWrap").setValueDirect(widthWrap);
        mediaTexture.getAttribute("heightWrap").setValueDirect(heightWrap);
        mediaTexture.getAttribute("mipmappingEnabled").setValueDirect(false);
        mediaTexture.getAttribute("imageFilename").setValueDirect(clipFilename);
        mediaTexture.getAttribute("negateImage").setValueDirect(negateImage);
        mediaTexture.getAttribute("negateAlpha").setValueDirect(negateAlpha);
        if (alphaClip)
        {
            mediaTexture.getAttribute("alphaFilename").setValueDirect(data.contentDir + alphaClip.getFilename());
        }
        
        // TODO: if opacity is an envelope, create a KeyframeInterpolator and attach to texture opacity attr

        textures.push(new Pair(mediaTexture, block));
        surface.addTexture(mediaTexture);
    }       
}

LWObjectBuilder.prototype.calculateTextureCoords = function(data, layer, blockData, vertices, polyNormals,
                                                            vertIndices, polyIndices)
{
    if (!data ||
        !layer ||
        !blockData ||
        !vertices ||
        !polyNormals ||
        !vertIndices ||
        !polyIndices)
    {
        return null;
    }

    var uvCoords = []
    var numVertices = vertices.length / 3;

    switch (blockData.projMode)
    {
        case 0: // planar
        case 1: // cylindrical
        case 2: // spherical
            {
                var i, vertex, uv;
                for (i = 0, vertex = 0, uv = 0; i < numVertices; i++, vertex += 3, uv += 2)
                {
                    uv = this.mapXYZtoUV(vertices[vertex], vertices[vertex + 1], vertices[vertex + 2],
                                     blockData.center, blockData.size, blockData.projMode, blockData.axis,
                                     blockData.widthWrapAmt, blockData.heightWrapAmt);
                    uvCoords.push(uv.u);
                    uvCoords.push(uv.v);
                }
            }
            break;

        case 3: // cubic
            {
                var i, vertex, uv;
                for (i = 0, vertex = 0, uv = 0; i < numVertices; i++, vertex += 3, uv += 2)
                {
                    polyNormal = polyNormals[i];

                    if (Math.acos(cosineAngleBetween(polyNormal, new Vector3D(1, 0, 0))) <= QUARTERPI ||
                    Math.acos(cosineAngleBetween(polyNormal, new Vector3D(-1, 0, 0))) <= QUARTERPI)
                    {
                        axis = 0; // x
                    }
                    else if (Math.acos(cosineAngleBetween(polyNormal, new Vector3D(0, 1, 0))) <= QUARTERPI ||
                         Math.acos(cosineAngleBetween(polyNormal, new Vector3D(0, -1, 0))) <= QUARTERPI)
                    {
                        axis = 1; // y
                    }
                    else
                    {
                        axis = 2; // z
                    }

                    uv = this.mapXYZtoUV(vertices[vertex], vertices[vertex + 1], vertices[vertex + 2],
                                     blockData.center, blockData.size, 0, axis,
                                     blockData.widthWrapAmt, blockData.heightWrapAmt);
                    uvCoords.push(uv.u);
                    uvCoords.push(uv.v);
                }
            }
            break;

        case 5: // UV
            {
                var vmap = layer.getVmap('TXUV', blockData.uvMapName);
                //if (vmap) quick_sort(vmap, LWObjectBuilder_CompareVmapEntries);

                var vmad = layer.getVmad('TXUV', blockData.uvMapName);
                //if (vmad) quick_sort(vmad, LWObjectBuilder_CompareVmadEntries);

                var i, vertIndex, polyIndex, uv, uvSet;
                for (i = 0, uv = 0; i < numVertices; i++, uv += 2)
                {
                    vertIndex = vertIndices[i];
                    polyIndex = polyIndices[i];
                    uvSet = false;

                    // check for vmad entry (overrides vmap entry)
                    if (vmad && vmad.length)
                    {
                        for (var vmad_entries = 0; vmad_entries < vmad.length; vmad_entries++)
                        {
                            if (vmad[vmad_entries].poly > polyIndex)
                            {
                                break;
                            }

                            if (vmad[vmad_entries].poly == polyIndex)
                            {
                                if (vmad[vmad_entries].vertex == vertIndex)
                                {
                                    uvCoords[uv] = vmad[vmad_entries].u;
                                    uvCoords[uv + 1] = vmad[vmad_entries].v;
                                    uvSet = true;
                                    break;
                                }
                            }
                        }

                        if (uvSet)
                        {
                            // don't retrieve from vmap
                            continue;
                        }
                    }

                    // check for vmap entry
                    if (vmap && vmap.length)
                    {
                        for (var vmap_entries = 0; vmap_entries < vmap.length; vmap_entries++)
                        {
                            if (vmap[vmap_entries].vertex > vertIndex)
                            {
                                break;
                            }

                            if (vmap[vmap_entries].vertex == vertIndex)
                            {
                                uvCoords[uv] = vmap[vmap_entries].u;
                                uvCoords[uv + 1] = vmap[vmap_entries].v;
                                uvSet = true;
                                break;
                            }
                        }
                    }

                    if (!uvSet)
                    {
                        uvCoords[uv] = 0;
                        uvCoords[uv + 1] = 0;
                    }
                }
            }
            break;

        default:
            {
                //alert(blockData.projMode);
            }
            break;
    }

    return uvCoords;
}

LWObjectBuilder.prototype.mapXYZtoUV = function(x, y, z, textureCenter, textureSize, projMode, axis, widthWrapAmt, heightWrapAmt)
{
    var lon, lat;
    var integerPart;

    var u = 0;
    var v = 0;

    switch(projMode)
    {
    case 0: // planar
        switch(axis)
        {
        case 0: // x
            u = (z - textureCenter.z) / textureSize.z + 0.5;
            v = (y - textureCenter.y) / textureSize.y + 0.5;
            break;

        case 1: // y
            u = (x - textureCenter.x) / textureSize.x + 0.5;
            v = (z - textureCenter.z) / textureSize.z + 0.5;
            break;

        case 2: // z
        default:
            u = (x - textureCenter.x) / textureSize.x + 0.5;
            v = (y - textureCenter.y) / textureSize.y + 0.5;
            break;
        }
        break;

   case 1: // cylindrical
        x -= textureCenter.x;
        y -= textureCenter.y;
        z -= textureCenter.z;
        
        switch(axis)
        {
        case 0: // x
            lon = XYZtoH(z, x, y);
            u = lon / (TWOPI * widthWrapAmt);
            v = x / textureSize.x + 0.5;
            break;

        case 1: // y
            lon = XYZtoH(x, y, z);
            u = lon / (TWOPI * widthWrapAmt);
            v = y / textureSize.y + 0.5;
            break;

        case 2: // z
        default:
            lon = XYZtoH(-x, z, -y);
            u = lon / (TWOPI * widthWrapAmt);
            v = -z / textureSize.z + 0.5;
            break;
        }

        // clamp u coordinate to range [0, 1)
        u = modf(u).fractionalPart;
        if (u < 0) u += 1;
        break;

   case 2: // spherical
        x -= textureCenter.x;
        y -= textureCenter.y;
        z -= textureCenter.z;

        switch (axis)
        {
        case 0: // x
            var hp = XYZtoHP(z, x, -y);
            lon = hp.heading;
            lat = hp.pitch;
            break;

        case 1: // y
            var hp = XYZtoHP(-x, y, z);
            lon = hp.heading;
            lat = hp.pitch;
            break;

        case 2: // z
        default:
            var hp = XYZtoHP(-x, z, -y);
            lon = hp.heading;
            lat = hp.pitch;
            break;
        }

        u = modf(1 - (lon / TWOPI * widthWrapAmt)).fractionalPart;
        v = 1 - modf(0.5 - (lat / Math.PI * heightWrapAmt)).fractionalPart;

        break;
    }
 
    return { u: u, v: v };   
}

function LWObjectBuilder_ObjectHandler(data, builder)
{
    builder.allocateModel(data);
}

function LWObjectBuilder_CompareVmapEntries(elem1, elem2)
{
    if (elem1.vertex < elem2.vertex) return -1;
    if (elem1.vertex > elem2.vertex) return 1;
    return 0;
}

function LWObjectBuilder_CompareVmadEntries(elem1, elem2)
{
    if (elem1.poly < elem2.poly) return -1;
    if (elem1.poly > elem2.poly) return 1;
    return 0;
}