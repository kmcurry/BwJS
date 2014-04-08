Rotate.prototype = new Transform();
Rotate.prototype.constructor = Rotate;

function Rotate()
{
    Transform.call(this);
    this.className = "Rotate";
    this.attrType = eAttrType.Rotate;
    
    this.rotation = new Vector3DAttr(0, 0, 0);
    this.updateRotation = true;
    
    this.rotation.addModifiedCB(Rotate_RotationModifiedCB, this);
	
    this.registerAttribute(this.rotation, "rotation");
}

Rotate.prototype.update = function(params, visitChildren)
{
    if (this.updateRotation)
    {
        this.updateRotation = false;

        var r = this.rotation.getValueDirect();

        var matrix = new Matrix4x4()
        matrix.loadXYZAxisRotation(r.x, r.y, r.z);
        this.matrix.setValueDirect(matrix);
    }

    // call base-class implementation
    Transform.prototype.update.call(this, params, visitChildren);
}

Rotate.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled.getValueDirect())
    {
        // call base-class implementation
        Transform.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    // call base-class implementation
    Transform.prototype.apply.call(this, directive, params, visitChildren);
}

function Rotate_RotationModifiedCB(attribute, container)
{
    container.updateRotation = true;
    container.incrementModificationCount();
}