Bone.prototype = new AttributeContainer();
Bone.prototype.constructor = Bone;

function Bone()
{
    AttributeContainer.call(this);
    this.className = "Bone";
    this.attrType = eAttrType.Bone;
    
    this.parent = null;
    this.children = [];
    this.falloffValues = [];
    this.translationMatrix = new Matrix4x4();
    this.rotationMatrix = new Matrix4x4();
    this.rotationQuat = new Quaternion();
    this.scaleMatrix = new Matrix4x4();
    this.pivotMatrix = new Matrix4x4();
    this.matrix = new Matrix4x4();
    this.restMatrix = new Matrix4x4();
    this.restMatrixInv = new Matrix4x4();
    this.parentMatrix = new Matrix4x4();
    this.boneMatrix = new Matrix4x4();
    this.updatePosition = false;
    this.updateRotation = false;
    this.updateScale = false;
    this.updatePivot = false;
    this.updateRestPosition = false;
    this.updateRestRotation = false;
    this.updateRestLength = false;
    this.updateFalloffType = false;
    this.updateParentTransform = false;
    this.updateParentRestTransform = false;
    
    this.name = new StringAttr("");
    this.position = new Vector3DAttr(0, 0, 0);
    this.rotation = new Vector3DAttr(0, 0, 0);
    this.scale = new Vector3DAttr(1, 1, 1);
    this.pivot = new Vector3DAttr(0, 0, 0);
    this.restPosition = new Vector3DAttr(0, 0, 0);
    this.restRotation = new Vector3DAttr(0, 0, 0);
    this.restLength = new NumberAttr(0);
    this.strength = new NumberAttr(0);
    this.falloffType = new NumberAttr(eBoneFalloffType.InverseDistance);
    this.scaleBoneStrength = new BooleanAttr(false);
    this.transform = new Matrix4x4Attr(1, 0, 0, 0,
                                       0, 1, 0, 0,
                                       0, 0, 1, 0,
                                       0, 0, 0, 1);
    this.parentTransform = new Matrix4x4Attr(1, 0, 0, 0,
                                             0, 1, 0, 0,
                                             0, 0, 1, 0,
                                             0, 0, 0, 1);
    this.restTransform = new Matrix4x4Attr(1, 0, 0, 0,
                                           0, 1, 0, 0,
                                           0, 0, 1, 0,
                                           0, 0, 0, 1);
    this.parentRestTransform = new Matrix4x4Attr(1, 0, 0, 0,
                                                 0, 1, 0, 0,
                                                 0, 0, 1, 0,
                                                 0, 0, 0, 1);
    
    this.position.addModifiedCB(Bone_PositionModifiedCB, this);
    this.rotation.addModifiedCB(Bone_RotationModifiedCB, this);
    this.scale.addModifiedCB(Bone_ScaleModifiedCB, this);
    this.pivot.addModifiedCB(Bone_PivotModifiedCB, this);
    this.restPosition.addModifiedCB(Bone_RestPositionModifiedCB, this);
    this.restRotation.addModifiedCB(Bone_RestRotationModifiedCB, this);
    this.restLength.addModifiedCB(Bone_RestLengthModifiedCB, this);
    this.falloffType.addModifiedCB(Bone_FalloffTypeModifiedCB, this);
    this.parentTransform.addModifiedCB(Bone_ParentTransformModifiedCB, this);
    this.parentRestTransform.addModifiedCB(Bone_ParentRestTransformModifiedCB, this);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.position, "position");
    this.registerAttribute(this.rotation, "rotation");
    this.registerAttribute(this.scale, "scale");
    this.registerAttribute(this.pivot, "pivot");
    this.registerAttribute(this.restPosition, "restPosition");
    this.registerAttribute(this.restRotation, "restRotation");
    this.registerAttribute(this.restLength, "restLength");
    this.registerAttribute(this.strength, "strength");
    this.registerAttribute(this.falloffType, "falloffType");
    this.registerAttribute(this.scaleBoneStrength, "scaleBoneStrength");
}

Bone.prototype.addChild = function(child)
{
    // child can only have one parent
    if (!child || child.parent)
    {
        return false;
    }

    // set child's parent to this
    child.parent = this;

    // set child's parent transform source to this transform
    this.transform.addTarget(child.parentTransform);

    // set child's parent rest tranform source to this rest transform
    this.restTransform.addTarget(child.parentRestTransform);

    this.children.push(child);

    return true;
}

Bone.prototype.removeChild = function(child)
{
    if (!child)
    {
        return false;
    }

    for (var i = 0; i < this.children.length; i++)
    {
        if (this.children[i] == child)
        {
            // clear child's parent
            child.parent = null;
            
            // clear child's parent transform source
            this.transform.removeTarget(child.parentTransform);
            
            // clear child's parent rest transform source
            this.restTransform.removeTarget(child.parentRestTransform);

            // set child's parent transform to identity
            var identity = new Matrix4x4();
            identity.loadIdentity();
            child.parentTransform.setValueDirect(identity);

            // set child's parent rest transform to identity
            child.parentRestTransform.setValueDirect(identity);

            this.children.splice(i, 1);
            
            return true;
        }
    }

    return false;
}

Bone.prototype.getChild = function(n)
{
    if (n >= this.children.length)
    {
        return null;
    }

    return this.children[n];
}
    
Bone.prototype.getChildCount = function()
{
    return this.children.length;
}

Bone.prototype.getParent = function()
{
    return this.parent;
}

Bone.prototype.getScaledStrength = function()
{
    var strength = this.strength.getValueDirect(); 
    if (this.scaleBoneStrength.getValueDirect())
    {
        strength *= this.restLength.getValueDirect();
    }

    return strength;
}

Bone.prototype.calculateFalloffValues = function(vertices)
{
    var bonePos = this.restMatrix.transform(0, 0, 0, 1);

    var boneDir = this.restMatrix.transform(0, 0, 1, 0);

    var restLength = m_restLength.getValueDirect();

    var boneSegment_a = bonePos;
    var boneSegment_b = new Vector3D(bonePos.x + boneDir.x * restLength,
                                     bonePos.y + boneDir.y * restLength,
                                     bonePos.z + boneDir.z * restLength);
                                     
    var numVertices = vertices.length / 3;

    var falloffType = this.falloffType.getValueDirect();

    this.falloffValues.length = numVertices;
    for (var i=0, j=0; i < numVertices; i++, j+=3)
    {
        var distance = distanceBetweenLineSegmentAndPoint(boneSegment_a, boneSegment_b, new Vector3D(vertices[j], vertices[j+1], vertices[j+2]));

        switch (falloffType)
        {
        case eBoneFalloffType.InverseDistance:
            this.falloffValues[i] = 1 / distance;
            break;

        case eBoneFalloffType.InverseDistance_2:
            this.falloffValues[i] = 1 / (distance * distance);
            break;

        case eBoneFalloffType.InverseDistance_4:
            this.falloffValues[i] = 1 / (distance * distance * distance * distance);
            break;

        case eBoneFalloffType.InverseDistance_8:
            this.falloffValues[i] = 1 / (distance * distance * distance * distance *
                                         distance * distance * distance * distance);
            break;

        case eBoneFalloffType.InverseDistance_16:
            this.falloffValues[i] = 1 / (distance * distance * distance * distance *
                                         distance * distance * distance * distance *
                                         distance * distance * distance * distance *
                                         distance * distance * distance * distance);  
            break;
        }

        this.falloffValues[i] *= this.getScaledStrength();
    }
}

Bone.prototype.update = function()
{
    var updateBoneMatrix = false;
    
    if (this.updatePosition || this.updateRotation || this.updateScale || this.updatePivot || this.updateParentTransform)
    {
        if (this.updatePosition)
        {
            this.updatePosition = false;

            var position = this.position.getValueDirect();
            this.translationMatrix.loadTranslation(position.x, position.y, position.z);
        }

        if (this.updateRotation)
        {
            this.updateRotation = false;

            var rotation = this.rotation.getValueDirect();
            this.rotationQuat.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);
            this.rotationMatrix = this.rotationQuat.getMatrix();
        }

        if (this.updateScale)
        {
            this.updateScale = false;

            var scale = this.scale.getValueDirect();
            this.scaleMatrix.loadScale(scale.x, scale.y, scale.z);
        }

        if (this.updatePivot)
        {
            this.updatePivot = false;

            var pivot = this.pivot.getValueDirect();
            this.pivotMatrix.loadTranslation(-pivot.x, -pivot.y, -pivot.z);
        }

        if (this.updateParentTransform)
        {
            this.updateParentTransform = false;

            this.parentMatrix = this.parentTransform.getValueDirect();
        }

        this.matrix = this.pivotMatrix.multiply(this.scaleMatrix.multiply(this.rotationMatrix.multiply(this.translationMatrix.multiply(this.parentMatrix))));

        // set matrix to transform attribute so children will be notified of modification
        this.transform.setValueDirect(this.matrix);

        updateBoneMatrix = true;
    }

    if (this.updateRestPosition || this.updateRestRotation || this.updateParentRestTransform)
    {
        this.updateRestPosition = false;
        this.updateRestRotation = false;
        this.updateParentRestTransform = false;

        var restPosition = this.restPosition.getValueDirect();

        var restPositionMatrix = new Matrix4x4();
        restPositionMatrix.loadTranslation(restPosition.x, restPosition.y, restPosition.z);

        var restRotation = this.restRotation.getValueDirect();

        var restRotationQuat = new Quaternion();
        restRotationQuat.loadXYZAxisRotation(restRotation.x, restRotation.y, restRotation.z);
        var restRotationMatrix = restRotationQuat.getMatrix();

        var parentRestMatrix = this.parentRestTransform.getValueDirect();

        this.restMatrix = restRotationMatrix.multiply(restPositionMatrix.multiply(parentRestMatrix));

        this.restMatrixInv = this.restMatrix;
        this.restMatrixInv.invert();

        // set rest matrix to rest transform attribute so children will be notified of modification
        this.restTransform.setValueDirect(this.restMatrix);

        updateBoneMatrix = true;
    }

    if (this.updateRestLength)
    {
        this.updateRestLength = false;
    }

    if (updateBoneMatrix)
    {
        this.boneMatrix = this.restMatrixInv.multiply(this.matrix);
    }
}

function Bone_PositionModifiedCB(attribute, container)
{
    container.updatePosition = true;
}

function Bone_RotationModifiedCB(attribute, container)
{
    container.updateRotation = true;
}

function Bone_ScaleModifiedCB(attribute, container)
{
    container.updateScale = true;
}

function Bone_PivotModifiedCB(attribute, container)
{
    container.updatePivot = true;
}

function Bone_RestPositionModifiedCB(attribute, container)
{
    container.updateRestPosition = true;
}

function Bone_RestRotationModifiedCB(attribute, container)
{
    container.updateRestRotation = true;
}

function Bone_RestLengthModifiedCB(attribute, container)
{
    container.updateRestLength = true;
}

function Bone_FalloffTypeModifiedCB(attribute, container)
{
    container.updateFalloffType = true;
}

function Bone_ParentTransformModifiedCB(attribute, container)
{
    container.updateParentTransform = true;
}

function Bone_ParentRestTransformModifiedCB(attribute, container)
{
    container.updateParentRestTransform = true;
}
