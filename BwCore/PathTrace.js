PathTrace.prototype = new LineList();
PathTrace.prototype.constructor = PathTrace;


function PathTrace()
{

    LineList.call(this);
    this.className = "PathTrace";
    this.attrType = eAttrType.PathTrace;
    
    this.pathLength = 0;
    this.pathPosition = new Vector3DAttr();
    this.sampleRate = new FloatAttr();
    this.maxLength = new FloatAttr();
    this.color = new ColorAttr();
    this.trace = new BooleanAttr();
	this.sectorOrigin = new Vector3DAttr();
    
	this.sectorOrigin.AddModifiedCB(PathTrace_SectorOriginModifiedCB, this);

    this.sampleRate.setRange(0, FLT_MAX);
    this.maxLength.setRange(0, FLT_MAX);

    this.registerAttribute(this.pathPosition, "pathPosition");
    this.registerAttribute(this.sampleRate, "sampleRate");
    this.registerAttribute(this.maxLength, "maxLength");
    this.registerAttribute(this.color, "color");
    this.registerAttribute(this.trace, "trace");
	this.registerAttribute(this.sectorOrigin, "sectorOrigin");

	this.graphMgr.getAttribute("sectorOrigin").addTarget(this.sectorOrigin);
    this.graphMgr.getNodeRegistry().registerNode(this, eAttrType_Node_PathTrace);
}

PathTrace.prototype.reset = function()
{
    this.vertices.setValueDirect(0);
    this.vertexColors.setValueDirect(0);
    
    this.lastPosition.setValueDirect(0,0,0);
    this.pathLength = 0;
}

PathTrace.prototype.update = function(params, visitChildren)
{
	this.sectorOriginLock.Lock("PathTrace::Update");

    // get current position
    var currPosition = this.pathPosition.getValueDirect(currPosition);
	// offset by sector origin
	// "lock" sector origin to obtain value, to ensure the value will be synchronized
	// with ::SectorOriginModified()
	//var sectorOrigin = this.sectorOrigin.lock();
	currPosition.x -= sectorOrigin[0];
	currPosition.y -= sectorOrigin[1];
	currPosition.z -= sectorOrigin[2];
	//this.sectorOrigin.unlock(false);

    // get current trace value
    var trace = this.trace.getValueDirect();

    // if trace value has changed since last update, add a vertex
    if (trace != this.lastTrace)
    {
        // add current position to vertices array
        var length = this.vertices.length;
        this.vertices.setLength(length + 3);
        this.vertices.setElement(length  , currPosition.x);
        this.vertices.setElement(length+1, currPosition.y); 
        this.vertices.setElement(length+2, currPosition.z); 

        // add color to vertex color array
        var color = this.color.getValueDirect();
        length = this.vertexColors.getLength();
        this.vertexColors.setLength(length + 4);
        this.vertexColors.setElement(length  , color.r);
        this.vertexColors.setElement(length+1, color.g);
        this.vertexColors.setElement(length+2, color.b);
        this.vertexColors.setElement(length+3, color.a);

        if (trace == false)
        {
            // reset path length to 0
            this.pathLength = 0;
        }

        this.lastTrace = trace;
    }

    if (trace)
    {
        // if this is the first time we are tracing, sample the current position,
        // and set as the line list's first point
        if (this.verticesArray.length == 0)
        {
            this.lastPosition = this.pathPosition.getValueDirect();
			// offset by sector origin
			// "lock" sector origin to obtain value, to ensure the value will be synchronized
			// with ::SectorOriginModified()
			var sectorOrigin = this.sectorOrigin;//.lock();
			this.lastPosition.x -= sectorOrigin[0];
			this.lastPosition.y -= sectorOrigin[1];
			this.lastPosition.z -= sectorOrigin[2];
			//this.sectorOrigin.unlock(false);

            this.vertices.setValueDirect(this.lastPosition.x, this.lastPosition.y, this.lastPosition.z);

            var r, g, b, a;
            var color = this.color.getValueDirect(r);
            /*
            Resize<float>(values, 4))) 
            {
                this.sectorOriginLock.unlock();
                return;
            }
            */
            this.vertexColors.setValueDirect(color.r, color.g, color.b, color.a);
        }

        // if current position - last position >= sample rate, add a line segment
        var distance = distanceBetween(currPosition, this.lastPosition);
        if (distance >= this.sampleRate.getValueDirect())
        {
            // add current position to vertices array
            var length = this.vertices.length;
            this.vertices.setLength(length + 6);
            this.vertices.setElement(length  , currPosition.x);
            this.vertices.setElement(length+1, currPosition.y); 
            this.vertices.setElement(length+2, currPosition.z); 

            this.vertices.setElement(length+3, currPosition.x);
            this.vertices.setElement(length+4, currPosition.y); 
            this.vertices.setElement(length+5, currPosition.z); 

            // add color to vertex color array
            var color = this.color.getValueDirect();
            length = this.vertexColors.length;
            this.vertexColors.setLength(length + 8);
            this.vertexColors.setElement(length  , color.r);
            this.vertexColors.setElement(length+1, color.g);
            this.vertexColors.setElement(length+2, color.b);
            this.vertexColors.setElement(length+3, color.a);

            this.vertexColors.setElement(length+4, color.r);
            this.vertexColors.setElement(length+5, color.g);
            this.vertexColors.setElement(length+6, color.b);
            this.vertexColors.setElement(length+7, color.a);

            // save last position
            this.lastPosition = currPosition;

            // increment path length
            this.pathLength += distance;
        }

        // check that length of path hasn't exceeded maxLength; if so, remove line segments
        // until pathLength <= maxLength
        var maxLength = this.maxLength.getValueDirect();
        if (this.pathLength > maxLength)
        {
            /*
            std::vector<float> vertices(this.vertices.getLength());
            this.vertices.getValue(vertices);
            
            std::vector<float> vertexColors(this.vertexColors.getLength());
            this.vertexColors.getValue(vertexColors);

			var i, j;
            var numSegments = vertices.length / 6;
            for (i=1, j=0; i <= numSegments; i++, j+=6)
            {
                this.pathLength -= distanceBetween(CVector3Df(vertices[j  ], vertices[j+1], vertices[j+2]),
                                                CVector3Df(vertices[j+3], vertices[j+4], vertices[j+5]));

                if (this.pathLength <= maxLength)
                {
                    break;
                }
            }

            std::vector<float>::iterator it = vertices.begin(), it2 = it + (i * 6);
            vertices.erase(it, it2);

            it = vertexColors.begin();
            it2 = it + (i * 8);
            vertexColors.erase(it, it2);

            this.vertices.setValue(vertices);
            this.vertexColors.setValue(vertexColors);
            */
        }
    }

	//this.sectorOriginLock.unlock();

    // call base class implementation
    //LineList::update(params, visitChildren);
}

PathTrace.prototype.sectorOriginModified = function()
{
	//this.sectorOriginLock.Lock("PathTrace::SectorOriginModified");
	/*

	// get new sector origin
	var sectorOrigin = this.sectorOrigin.getValueDirect();

	// update all vertices already in vertex list by adding old sector origin, and subtracting
	// new sector origin
	std::vector<float> vertices;
	this.vertices.getValue(vertices);
	for (unsigned int i=0; i < vertices.size(); i+=3)
	{
		vertices[i  ] = vertices[i  ] + this.lastSectorOrigin.x - sectorOrigin.x;
		vertices[i+1] = vertices[i+1] + this.lastSectorOrigin.y - sectorOrigin.y;
		vertices[i+2] = vertices[i+2] + this.lastSectorOrigin.z - sectorOrigin.z;
	}
	this.vertices.setValue(vertices);

	// update last position by adding old sector origin, and subtracting new sector origin
	this.lastPosition = this.lastPosition + this.lastSectorOrigin - sectorOrigin;

	// update last sector origin to new sector origin
	this.lastSectorOrigin = sectorOrigin;
	*/

	//this.sectorOriginLock.unlock();
}

function PathTrace_SectorOriginModifiedCB(attribute, container)
{
	container.sectorOriginModified();
}