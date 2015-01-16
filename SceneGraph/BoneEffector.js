BoneEffector.prototype = new Evaluator();
BoneEffector.prototype.constructor = BoneEffector;

function BoneEffector()
{
    Evaluator.call(this);
    this.className = "BoneEffector";
    this.attrType = eAttrType.BoneEffector;
    
    this.bones = [];
    this.verticesArray = [];
    this.normalsArray = [];
    this.resultVerticesArray = [];
    this.resultNormalsArray = [];
    this.boneFalloffValuesMap = [];
    this.falloffSums = [];
    this.updateVertices = false;
    this.updateNormals = false;
    
    this.vertices = new NumberArrayAttr();
    this.normals = new NumberArrayAttr();
    this.resultVertices = new NumberArrayAttr();
    this.resultNormals = new NumberArrayAttr();
    
    this.vertices.addModifiedCB(BoneEffector_VerticesModifiedCB, this);
    this.normals.addModifiedCB(BoneEffector_NormalsModifiedCB, this);
    
    this.registerAttribute(this.vertices, "vertices");
    this.registerAttribute(this.normals, "normals");
    this.registerAttribute(this.resultVertices, "resultVertices");
    this.registerAttribute(this.resultNormals, "resultNormals");
}

BoneEffector.prototype.evaluate = function()
{
    this.update();

    // update bones
    for (var i=0; i < this.bones.length; i++)
    {
        this.updateBones(this.bones[i]);
    }

    // evaluate bones
    for (var i=0; i < this.bones.length; i++)
    {
        // pass true for "initial" param, so that result arrays will be loaded instead of appended
        this.evaluateBones(this.bones[i], i == 0 ? true : false);
    }

    // output result
    this.resultVertices.setValueDirect(this.resultVerticesArray);
    this.resultNormals.setValueDirect(this.resultNormalsArray);
}

BoneEffector.prototype.addBoneHierarchy = function(root)
{
    if (!root)
    {
        return false;
    }

    this.bones.push(root);

    if (this.verticesArray.length > 0)
    {
        this.calculateFalloffValues();
    }

    return true;
}

BoneEffector.prototype.update = function()
{
    if (this.updateVertices)
    {
        this.updateVertices = false;

        this.verticesArray = this.vertices.getValueDirect();
        this.resultVerticesArray.length = this.verticesArray.length;
        
        this.calculateFalloffValues();
    }

    if (this.updateNormals)
    {
        this.updateNormals = false;

        this.normalsArray = this.normals.getValueDirect();
        this.resultNormalsArray.length = this.normalsArray.length;
    }
}

BoneEffector.prototype.calculateFalloffValues = function()
{
    this.boneFalloffValuesMap = [];
    for (var i=0; i < this.bones.length; i++)
    {
        this.updateBones(this.bones[i]);
        this.calculateBoneFalloffValues(this.bones[i]);
    }

    this.sumFalloffValues();
}

BoneEffector.prototype.calculateBoneFalloffValues = function(root)
{
    if (!root || this.verticesArray.length == 0)
    {
        return;
    }

    root.calculateFalloffValues(this.verticesArray);
    this.boneFalloffValuesMap.push(new Pair(root, root.falloffValues));

    // recurse on children
    for (var i=0; i < root.getChildCount(); i++)
    {
        var child = root.getChild(i);
        if (!child)
        {
            continue;
        }

        this.calculateBoneFalloffValues(child);
    }
}

BoneEffector.prototype.sumFalloffValues = function()
{
    if (this.verticesArray.length == 0)
    {
        return;
    }

    var numVertices = this.verticesArray.length / 3;

    // sum falloff values
    this.falloffSums.length = numVertices;
    for (var i=0; i < this.boneFalloffValuesMap.length; i++)
    {
        var boneFalloffValues = this.boneFalloffValuesMap[i].second;
        for (var j=0; j < numVertices; j++)
        {
            this.falloffSums[j] += boneFalloffValues[j];
        }
    }

    // divide falloff values by sum
    for (var i=0; i < this.boneFalloffValuesMap.length; i++)
    {
        var boneFalloffValues = this.boneFalloffValuesMap[i].second;

        for (var j=0; j < numVertices; j++)
        {
            if (this.falloffSums[j] != 0)
            {
                boneFalloffValues[j] /= m_falloffSums[j];
            }
            else // this.falloffSums[j] == 0
            {
                boneFalloffValues[j] = 0;
            }
        }
    }
}

BoneEffector.prototype.updateBones = function(root)
{
    if (!root)
    {
        return;
    }

    root.update();

    // recurse on children
    for (var i=0; i < root.getChildCount(); i++)
    {
        var child = root.getChild(i);
        if (!child)
        {
            continue;
        }

        this.updateBones(child);
    }
}

BoneEffector.prototype.evaluateBones = function(root, initial)
{
    if (!root)
    {
        return;
    }

    // get bone falloff values
    var boneFalloffValues = root.falloffValues;

    // get bone transform
    var boneTransform = root.getTransform();

    // transform vertices
    var numVertices = m_verticesArray.length / 3;
    for (var i=0, j=0; i < numVertices; i++, j+=3)
    {
        if (boneFalloffValues[i] > 0)
        {
            var xformed = boneTransform.Transform(m_verticesArray[j], m_verticesArray[j+1], m_verticesArray[j+2], 1);

            if (initial)
            {
                this.resultVerticesArray[j  ] = xformed.x * boneFalloffValues[i];
                this.resultVerticesArray[j+1] = xformed.y * boneFalloffValues[i];
                this.resultVerticesArray[j+2] = xformed.z * boneFalloffValues[i];
            }
            else // !initial
            {
                this.resultVerticesArray[j  ] += xformed.x * boneFalloffValues[i];
                this.resultVerticesArray[j+1] += xformed.y * boneFalloffValues[i];
                this.resultVerticesArray[j+2] += xformed.z * boneFalloffValues[i];
            }
        }
        else // boneFalloffValues[i] == 0
        {
            // use untransformed vertex
            this.resultVerticesArray[j  ] = m_verticesArray[j  ];
            this.resultVerticesArray[j+1] = m_verticesArray[j+1];
            this.resultVerticesArray[j+2] = m_verticesArray[j+2];
        }
    }

    // transform normals
    var numNormals = this.normalsArray.length / 3;
    for (var i=0, j=0; i < numNormals; i++, j+=3)
    {
        if (boneFalloffValues[i] > 0)
        {
            var xformed = boneTransform.Transform(m_normalsArray[j], m_normalsArray[j+1], m_normalsArray[j+2], 0);

            if (initial)
            {
                this.resultNormalsArray[j  ] = xformed.x * boneFalloffValues[i];
                this.resultNormalsArray[j+1] = xformed.y * boneFalloffValues[i];
                this.resultNormalsArray[j+2] = xformed.z * boneFalloffValues[i];
            }
            else // !initial
            {
                this.resultNormalsArray[j  ] += xformed.x * boneFalloffValues[i];
                this.resultNormalsArray[j+1] += xformed.y * boneFalloffValues[i];
                this.resultNormalsArray[j+2] += xformed.z * boneFalloffValues[i];
            }
        }
        else // boneFalloffValues[i] == 0
        {
            // use untransformed normal
            this.resultNormalsArray[j  ] = this.normalsArray[j  ];
            this.resultNormalsArray[j+1] = this.normalsArray[j+1];
            this.resultNormalsArray[j+2] = this.normalsArray[j+2];
        }
    }

    // recurse on children
    for (var i=0; i < root.getChildCount(); i++)
    {
        var child = root.getChild(i);
        if (!child)
        {
            continue;
        }

        this.evaluateBones(child);
    }
}

function BoneEffector_VerticesModifiedCB(attribute, container)
{
    container.updateVertices = true;
}

function BoneEffector_NormalsModifiedCB(attribute, container)
{
    container.updateNormals = true;
}
