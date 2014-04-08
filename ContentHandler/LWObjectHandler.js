// TODO
var eLWObjectTokens = 
{
    COLR    : 1129270354,
    DIFF    : 1145652806,
    LUMI    : 1280658761,
    SPEC    : 1397769539,
    TRAN    : 1414676814
};

function LWO2BlockData()
{
    this.type = "";
    this.ordinal = "";
    this.channel = 0;
    this.enable = 1;
    this.opacityType = 7;
    this.opacity = 1;
    this.opacityEnvelope = 0;
    this.negative = 0;
    this.center = new Vector3D();
    this.size = new Vector3D();
    this.coordSys = 0;
    this.projMode = 0;
    this.axis = 0;
    this.imageIndex = 0;
    this.widthWrap = 1;
    this.heightWrap = 1;
    this.widthWrapAmt = 0;
    this.heightWrapAmt = 0;
    this.uvMapName = "";
}

function LWO2SurfaceData()
{
    this.name = "";
    this.source = "";
    this.color = new Vector3D();
    this.diffuseLevel = 1;
    this.specularLevel = 0;
    this.luminosityLevel = 0;
    this.transparencyLevel = 0;
    this.glossiness = 0.4;
    this.doubleSided = false;
    this.smoothingAngle = 0;  
    this.blocks = [];
    this.addBlock = function()
    {
        this.blocks.push(new LWO2BlockData());
    }
    this.currentBlock = function()
    {
        return this.blocks.length > 0 ? this.blocks[this.blocks.length-1] : null;
    }
}

function LWO2ClipData()
{
    this.type = 0;
    this.negative = 0;
    
    var filename = "";
    var platformNeutralFilename = "";
    this.setPlatformNeutralFilename = function(_filename)
    {
        platformNeutralFilename = _filename;
        filename = _filename;
        if (filename.indexOf(':') >= 0)
        {
            var split = new Array();
            split = filename.split(':');
            filename = split[0] + ':' + '/' + split[1];
        }
    }
    this.setFilename = function(_filename)
    {
        filename = _filename;
        platformNeutralFilename = _filename;
        // check that filename is not in platform neutral format
        var pos = filename.indexOf(':');
        if (pos >= 0)
        {
            if (filename.charAt(pos+1) != '/' && filename.charAt(pos+1) != '\\')
            {
                var split = new Array();
                split = filename.split(':');
                filename = split[0] + ':' + '/' + split[1];
            }
        }
        // check that platform neutral filename is in platform neutral format
        pos = platformNeutralFilename.indexOf(':');
        if (pos >= 0)
        {
            if (platformNeutralFilename.charAt(pos+1) == '/' || platformNeutralFilename.charAt(pos+1) == '\\')
            {
                var split = new Array();
                split = platformNeutralFilename.split(':');
                platformNeutralFilename = split[0] + ':' + split[1].substr(1, split[1].length);
            }
        }
        this.getPlatformNeutralFilename = function()
        {
            return platformNeutralFilename;
        }
        this.getFilename = function()
        {
            return filename;
        }
    }
}

function LWO2EnvelopeData()
{
    this.userFormat = 0;
    this.type = 0;
    this.preBehavior = 0;
    this.postBehavior = 0;
    this.keyframes = [];
    
    this.currentKyframe = function()
    {
        return this.keyframes.length > 0 ? this.keyframes[this.keyframes.length-1] : null;
    }
}

function LWO2VMAPData()
{
    this.vertex = 0;
    this.u = 0;
    this.v = 0;
}

function LWO2VMADData()
{
    this.poly = 0;
    this.vertex = 0;
    this.u = 0;
    this.v = 0;
}

function LWO2PTAGData()
{
    this.poly = 0;
    this.tag = 0;
}

function LWO2LayerData()
{
    this.number = 0;
    this.name = "";
    this.pnts = [];
    this.pols = [];
    this.ptagsSURF = [];
    this.vmapsTXUV = [];
    this.vmadsTXUV = [];
    this.ptagsSURFMaxIndex = 0;
    this.pivot = new Vector3D();
    
    this.getVmap = function(type, name)
    {
        switch (type)
        {
            case 'TXUV':
                return this.vmapsTXUV[name];
                break;
            
            default: 
                return null;
        }
    }
    
    this.putVmap = function(type, name, vmap)
    {
        switch (type)
        {
            case 'TXUV':
                if (this.vmapsTXUV[name] == undefined) 
                    this.vmapsTXUV[name] = []
                this.vmapsTXUV[name].push(vmap);
                break;
        }
    }
    
    this.getVmad = function(type, name)
    {
        switch (type)
        {
            case 'TXUV':
                return this.vmadsTXUV[name];
                break;
            
            default: 
                return null;
        }
    }
    
    this.putVmad = function(type, name, vmad)
    {
        switch (type)
        {
            case 'TXUV':
                if (this.vmadsTXUV[name] == undefined) 
                    this.vmadsTXUV[name] = []
                this.vmadsTXUV[name].push(vmad);
                break;
        }
    }
    
    this.putPtag = function(ptag)
    {
        this.ptagsSURF.push(ptag);
    }
}

function LWO2Data()
{
    this.name = "";
    this.contentDir = "";
    this.layers = [];
    this.tags = [];
    this.surfaces = [];
    this.clips = [];
    this.envelopes = [];
    this.subChunkContext = "";
    this.evaluators = [];
    
    var currentClip = null;
    var currentEnvelope = null;
    var currentLayer = null;
    this.addLayer = function(number)
    {
        var layer = new LWO2LayerData();
        layer.number = number;
        if (this.layers.length <= number)
        {
            this.layers.length = number + 1;
        }
        this.layers[number] = layer;
        currentLayer = layer;
    }
    this.currentLayer = function()
    {
        return currentLayer;
    }
    this.addSurface = function(name, source)
    {
        var surface = new LWO2SurfaceData();
        surface.name = name;
        surface.source = source;
        this.surfaces.push(surface);
    }
    this.currentSurface = function()
    {
        return this.surfaces.length > 0 ? this.surfaces[this.surfaces.length-1] : null;
    }
    this.getSurface = function(name)
    {
        for (var i=0; i < this.surfaces.length; i++)
        {
            if (this.surfaces[i].name == name)
            {
                return this.surfaces[i];
            }
        }
        return null;
    }
    this.addClip = function(index)
    {
        var clip = new LWO2ClipData();
        if (this.clips.length <= index)
        {
            this.clips.length = index + 1;
        }
        this.clips[index] = clip;
        currentClip = clip;
    }
    this.currentClip = function()
    {
        return currentClip;
    }
    this.addEnvelope = function(index)
    {
        var envelope = new LWO2EnvelopeData();
        this.envelopes[index] = envelope;
        currentEnvelope = envelope;
    }
    this.currentEnvelope = function()
    {
        return currentEnvelope;
    }
}

LWObjectHandler.prototype = new ContentHandler();
LWObjectHandler.prototype.constructor = LWObjectHandler;

function LWObjectHandler()
{
    ContentHandler.call(this);
    this.className = "LWObjectHandler";
    
    this.lwo2DataHandlers = [];
    this.lwo2DataHandlersData = [];
}

LWObjectHandler.prototype.addObjectHandler = function(handler, data)
{
    this.lwo2DataHandlers.push(handler);
    this.lwo2DataHandlersData.push(data);
}

LWObjectHandler.prototype.parseFileStream = function(url)
{
    var filename = formFullPath(url, this.contentDirectory.getValueDirect().join(""));
    var filestream = loadBinaryResource(filename);
    if (filestream == null)
    {
        return -2;
    }

    var parser = new BinaryParser(filestream, true);

    // read file tag (must be 'FORM')
    if (parser.readUInt8() != 70 || // 'F'
    parser.readUInt8() != 79 || // 'O'
    parser.readUInt8() != 82 || // 'R'
    parser.readUInt8() != 77)   // 'M'
    {
        return -1;
    }

    // read file size
    var fileSize = parser.readUInt32();

    // read file type (must be 'LWO2')
    if (parser.readUInt8() != 76 || // 'L'
    parser.readUInt8() != 87 || // 'W'
    parser.readUInt8() != 79 || // 'O'
    parser.readUInt8() != 50)   // '2'
    {
        return -1;
    }
    fileSize -= 4; // subtract these 4 bytes from the file size

    var data = new LWO2Data();
    data.contentDir = this.contentDirectory.getValueDirect().join("");

    // set the model name (filename w/o extension)
    // TODO

    // read file chunks into LWOData
    while (fileSize > 0)
    {
        fileSize -= this.parseChunk(parser, data);
    }

    // pass data to consumer(s)
    for (var i = 0; i < this.lwo2DataHandlers.length; i++)
    {
        this.lwo2DataHandlers[i](data, this.lwo2DataHandlersData[i]);
    }

    return 0;
}

LWObjectHandler.prototype.parseChunk = function(parser, data)
{
    var bytesRead = 0;
    
    // ASSUMPTION MADE:  file stream pointer is currently sitting at a tag
    // i.e., has been advanced past header.

    // read chunk tag
    var tag = parser.readUInt32(); // bytesRead accounted for at end of method
    //alert("tag: " + tag);
    
    // read chunk size
    var chunkSize = parser.readUInt32(); // bytesRead accounted for at end of method
    //alert("chunkSize: " + chunkSize);
    
    // read chunk size bytes
    switch (tag)
    {
        case 1279351122: // 'LAYR'
            {
                var number = parser.readUInt16(); bytesRead += 2;
            
                var flags = parser.readUInt16(); bytesRead += 2;

                var x = parser.readFloat32(); bytesRead += 4;
                var y = parser.readFloat32(); bytesRead += 4;
                var z = parser.readFloat32(); bytesRead += 4;
            
                var name = this.readString(parser); bytesRead += name.bytesRead;
            
                if (chunkSize > bytesRead)
                {
                    var parent = parser.readUInt16(); bytesRead += 2;
                }

                data.addLayer(number);
                data.currentLayer().name = name.string;
                data.currentLayer().pivot.x = x;
                data.currentLayer().pivot.y = y;
                data.currentLayer().pivot.z = z;
            }
            break;
    
        case 1347310675: // 'PNTS'
            {
                var numPnts = chunkSize / 12;

                for (var i=0; i < numPnts; i++)
                {
                    var x = parser.readFloat32(); bytesRead += 4;
                    var y = parser.readFloat32(); bytesRead += 4;
                    var z = parser.readFloat32(); bytesRead += 4; 
            
                    data.currentLayer().pnts[i] = new Vector3D();
                    data.currentLayer().pnts[i].x = x;
                    data.currentLayer().pnts[i].y = y; 
                    data.currentLayer().pnts[i].z = z;                
                }
            }
            break;
    
        case 1347374163: // 'POLS'
            {
                var type = parser.readUInt32(); bytesRead += 4;
            
                var flags, numVerts;
                while (chunkSize > bytesRead)
                {
                    var poly = [];
                
                    flags = parser.readUInt16(); bytesRead += 2;
                    numVerts = flags & 0x03ff;
                    for (var i=0; i < numVerts; i++)
                    {
                        var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                    
                        poly.push(index.index);
                    }
                
                    data.currentLayer().pols.push(poly);
                }
            }
            break;
        
        case 1413564243: // 'TAGS'
            {
                while (chunkSize > bytesRead)
                {
                    var tags = this.readString(parser); bytesRead += tags.bytesRead;
                    data.tags.push(tags.string);
                }
            }
            break;
      		
        case 1347699015: // 'PTAG'
            {
                var type = parser.readUInt32(); bytesRead += 4;
            
                while (chunkSize > bytesRead)
                {
                    var ptag = new LWO2PTAGData();
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                    ptag.poly = index.index;
                    ptag.tag = parser.readUInt16(); bytesRead += 2;
                
                    switch (type)
                    {
                        case 1398100550: // 'SURF'
                            {
                                data.currentLayer().putPtag(ptag);
                                data.currentLayer().ptagsSURFMaxIndex = Math.max(ptag.tag, data.currentLayer().ptagsSURFMaxIndex);
                            }
                            break;
                    }
                }
            }
            break;
    
        case 1447903568: // 'VMAP'
            {
                var type = parser.readUInt32(); bytesRead += 4;
                var dimension = parser.readUInt16(); bytesRead += 2;
                var name = this.readString(parser); bytesRead += name.bytesRead;
            
                var u, v, value;
                while (chunkSize > bytesRead)
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead; 
                
                    switch (type)
                    {
                        case 1415075158: // 'TXUV'
                            {
                                u = parser.readFloat32(); bytesRead += 4;
                                v = parser.readFloat32(); bytesRead += 4;
                        
                                var vmapData = new LWO2VMAPData();
                                vmapData.vertex = index.index;
                                vmapData.u = u;
                                vmapData.v = v;
                                data.currentLayer().putVmap('TXUV', name.string, vmapData);
                            }
                            break;
                    
                        default:
                            {
                                for (var i=0; i < dimension; i++)
                                {
                                    value = parser.readFloat32(); bytesRead += 4;       
                                }
                            }
                            break;    
                    }
                }
            }
            break;
        
        case 1447903556: // 'VMAD'
            {
                var type = parser.readUInt32(); bytesRead += 4;
                var dimension = parser.readUInt16(); bytesRead += 2;
                var name = this.readString(parser); bytesRead += name.bytesRead;
            
                var u, v, value;
                while (chunkSize > bytesRead)
                {
                    var vertIndex = this.readVariableLengthIndex(parser); bytesRead += vertIndex.bytesRead;
                    var polyIndex = this.readVariableLengthIndex(parser); bytesRead += polyIndex.bytesRead;
                
                    switch (type)
                    {
                        case 1415075158: // 'TXUV'
                            {
                                u = parser.readFloat32(); bytesRead += 4;
                                v = parser.readFloat32(); bytesRead += 4;
                        
                                var vmadData = new LWO2VMADData();
                                vmadData.vertex = vertIndex.index;
                                vmadData.poly = polyIndex.index;
                                vmadData.u = u;
                                vmadData.v = v;
                                data.currentLayer().putVmad('TXUV', name.string, vmadData);
                            }
                            break;
                    
                        default:
                            {
                                for (var i=0; i < dimension; i++)
                                {
                                    value = parser.readFloat32(); bytesRead += 4;       
                                }
                            }
                            break;    
                    }       
                }
            }
            break;
        
        case 1398100550: // 'SURF'
            {
                var name = this.readString(parser); bytesRead += name.bytesRead;
                var source = this.readString(parser); bytesRead += source.bytesRead;

                data.addSurface(name.string, source.string);
            
                // parse surface subchunks
                while (chunkSize > bytesRead)
                {
                    bytesRead += this.parseSubChunk(parser, data);
                }
            }
            break;
        
        case 1129072976: // 'CLIP'
            {
                var index = parser.readUInt32(); bytesRead += 4;
            
                data.addClip(index);
                data.subChunkContext = tag;
            
                // parse clip subchunks
                while (chunkSize > bytesRead)
                {
                    bytesRead += this.parseSubChunk(parser, data);
                }
            }
            break;
        
        case 1162761804: // 'ENVL'
            {
                var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
            
                data.addEnvelope(index.index);
            
                // parse envelope subchunks
                while (chunkSize > bytesRead)
                {
                    bytesRead += this.parseSubChunk(parser, data);
                }
            }
            break;
          
        default:
            {
                // unrecognized tag - seek to end of chunk
                while (chunkSize > bytesRead)
                {
                    parser.readUInt8(); bytesRead++;
                }
            }
            break;
    }
    
    // read pad byte if chunk size is odd
    if (chunkSize & 0x1)
    {
        parser.readUInt8(); bytesRead++;
    }
    
    // account for tag/chunk size (read at beginning of method)
    bytesRead += 8;
    //alert("bytesRead: " + bytesRead);
    
    return bytesRead;    
}

LWObjectHandler.prototype.parseSubChunk = function(parser, data)
{
    var bytesRead = 0;

    // read subchunk tag
    var tag = parser.readUInt32(); bytesRead += 4;

    // read subchunk size
    var subChunkSize = parser.readUInt16(); bytesRead += 2;

    // read subchunk size bytes
    switch (tag)
    {
        case 1129270354: // 'COLR'
            {
                data.currentSurface().color.x = parser.readFloat32(); bytesRead += 4;
                data.currentSurface().color.y = parser.readFloat32(); bytesRead += 4;
                data.currentSurface().color.z = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }    
            }
            break;
        
        case 1145652806: // 'DIFF'
            {
                data.currentSurface().diffuseLevel = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                } 
            }
            break;
    
        case 1280658761: // 'LUMI'  
            {
                data.currentSurface().luminosityLevel = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1397769539: // 'SPEC'
            {
                data.currentSurface().specularLevel = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1414676814: // 'TRAN'
            {
                data.currentSurface().transparencyLevel = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1196183379: // 'GLOS'
            {
                data.currentSurface().glossiness = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1397310533: // 'SIDE'
            {
                data.currentSurface().doubleSided = (parser.readUInt16() == 3 ? true : false); bytesRead += 2;            
            }
            break;
        
        case 1397571918: // 'SMAN'
            {
                data.currentSurface().smoothingAngle = parser.readFloat32(); bytesRead += 4;
            }
            break;
        
        case 1398032716: // 'STIL'
        case 1095649613: // 'ANIM'
        case 1230194001: // 'ISEQ'
            {
                var filename = this.readString(parser); bytesRead += filename.bytesRead;
            
                // skip subsequent chunk data
                while (subChunkSize > (bytesRead - 6))
                {
                    parser.readUInt8(); bytesRead += 1;
                }
            
                data.currentClip().type = tag;
                data.currentClip().setFilename(filename.string);
            }
            break;
        
        case 1313163073: // 'NEGA'
            {
                var negative = parser.readUInt16(); bytesRead += 2;
            
                if (data.subChunkContext == 'IMAP')
                {
                    data.currentSurface().currentBlock().negative = negative;
                }
                else if (data.subChunkContext == 'CLIP')
                {
                    data.currentClip().negative = negative;
                }
            }
            break;
        
        case 1112297291: // 'BLOK'
            {
                data.currentSurface().addBlock();
            }
            break;
        
        case 1229799760: // 'IMAP'
            {
                var ordinal = this.readString(parser); bytesRead += ordinal.bytesRead;
            
                data.currentSurface().currentBlock().type = 'IMAP';
                data.currentSurface().currentBlock().ordinal = ordinal.string;
                data.subChunkContext = 'IMAP';
            }
            break;
        
        case 1128808782: // 'CHAN'
            {
                var channel = parser.readUInt32(); bytesRead += 4;
            
                if (data.subChunkContext == 'IMAP')
                {
                    data.currentSurface().currentBlock().channel = channel;
                }
            }
            break;
        
        case 1162756418: // 'ENAB'
            {
                data.currentSurface().currentBlock().enable = parser.readUInt16(); bytesRead += 2;
            }
            break;
        
        case 1330659651: // 'OPAC'
            {
                data.currentSurface().currentBlock().opacityType = parser.readUInt16(); bytesRead += 2;
                data.currentSurface().currentBlock().opacity = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var envelope = this.readVariableLengthIndex(parser); bytesRead += envelope.bytesRead;
                
                    data.currentSurface().currentBlock().opacityEnvelope = envelope.index;
                }
            }
            break;
        
        case 1414349136: // 'TMAP'
            {
            }
            break;
         
        case 1129206866: // 'CNTR'
            {
                data.currentSurface().currentBlock().center.x = parser.readFloat32(); bytesRead += 4;
                data.currentSurface().currentBlock().center.y = parser.readFloat32(); bytesRead += 4;
                data.currentSurface().currentBlock().center.z = parser.readFloat32(); bytesRead += 4;
            
                while (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1397316165: // 'SIZE'
            {
                data.currentSurface().currentBlock().size.x = parser.readFloat32(); bytesRead += 4;
                data.currentSurface().currentBlock().size.y = parser.readFloat32(); bytesRead += 4;
                data.currentSurface().currentBlock().size.z = parser.readFloat32(); bytesRead += 4;
            
                while (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1129535827: // 'CSYS'
            {
                data.currentSurface().currentBlock().coordSys = parser.readUInt16(); bytesRead += 2;
            }
            break;
        
        case 1347571530: // 'PROJ'
            {
                data.currentSurface().currentBlock().projMode = parser.readUInt16(); bytesRead += 2;
            }
            break;
        
        case 1096304979: // 'AXIS'
            {
                var axis = parser.readUInt16(); bytesRead += 2;
            
                if (data.subChunkContext == 'IMAP')
                {
                    data.currentSurface().currentBlock().axis = axis;
                }
            }
            break;
        
        case 1229799751: // 'IMAG'
            {
                var image = this.readVariableLengthIndex(parser); bytesRead += image.bytesRead;
            
                data.currentSurface().currentBlock().imageIndex = image.index;
            }
            break;
        
        case 1465008464: // 'WRAP'
            {
                data.currentSurface().currentBlock().widthWrap = parser.readUInt16(); bytesRead += 2;
                data.currentSurface().currentBlock().heightWrap = parser.readUInt16(); bytesRead += 2;
            }
            break;
        
        case 1465012311: // 'WRPW'
            {
                data.currentSurface().currentBlock().widthWrapAmt = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1465012296: // 'WRPH'
            {
                data.currentSurface().currentBlock().heightWrapAmt = parser.readFloat32(); bytesRead += 4;
            
                if (subChunkSize > (bytesRead - 6))
                {
                    var index = this.readVariableLengthIndex(parser); bytesRead += index.bytesRead;
                }
            }
            break;
        
        case 1447903568: // 'VMAP'
            {
                var name = this.readString(parser); bytesRead += name.bytesRead;
            
                data.currentSurface().currentBlock().uvMapName = name.string; 
            }
            break;
        
        case 1415139397: // 'TYPE'
            {
                data.currentEnvelope().userFormat = parser.readUInt8(); bytesRead += 1;
                data.currentEnvelope().type = parser.readUInt8(); bytesRead += 1;
            }
            break;
        
        case 1347568928: // 'PRE '
            {
                data.currentEnvelope().preBehavior = parser.readUInt16(); bytesRead += 2;
            }
            break;
        
            //case 1262836000: // 'KEY '
            {
                // TODO        
            }
            break;
       
            //case 1397768526: // 'SPAN'
            {
                // TODO
                //case 1413693984: // 'TCB '
                //case 1212502605: // 'HERM'
                //case 1111841353: // 'BEZI'
                //case 1111841330: // 'BEZ2'
                //case 1398031696: // 'STEP'
                //case 1279872581: // 'LINE'
            }
            break;
        
        case 1347375956: // 'POST'
            {
                data.currentEnvelope().postBehavior = parser.readUInt16(); bytesRead += 2;
            }
            break;

        default:
            {
                // unrecognized tag - seek to end of chunk
                while (subChunkSize > (bytesRead - 6))
                {
                    parser.readUInt8(); bytesRead += 1;
                }
            }
            break;
    }
    
    // read pad byte if subchunk size is odd
    if (subChunkSize & 0x1)
    {
        parser.readUInt8(); bytesRead += 1;
    }
    
    return bytesRead;
}

LWObjectHandler.prototype.readString = function(parser)
{
    var s = "";
    var c = 0;
    var count = 0;
    do
    {
        c = parser.readUInt8(); count++;
        s += String.fromCharCode(c);
        
    } while (c);
    
    // read pad byte if length is odd
    if (count & 0x1)
    {
        parser.readUInt8(); count++;   
    }
    
    return { string: s, bytesRead: count };
}

LWObjectHandler.prototype.readVariableLengthIndex = function(parser)
{
    var i = 0;
    var c = new Array(4);
    var count = 0;
    
    c[0] = parser.readUInt8(); count++;
    c[1] = parser.readUInt8(); count++;
    
    if (c[0] < 0xff00) // 2-byte form
    {
        i = c[0] << 8 | c[1];
    }
    else // 4-byte form
    {
        c[2] = parser.readUInt8(); count++;
        c[3] = parser.readUInt8(); count++;
        
        i = c[1] << 16 | c[2] << 8 | c[3];
    }

    return { index: i, bytesRead: count };
}

LWObjectHandler.prototype.matchesType = function(type)
{
    return (type == "lwo");
}