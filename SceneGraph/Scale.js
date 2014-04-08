Scale.prototype = new Transform();
Scale.prototype.constructor = Scale;

function Scale()
{
    Transform.call(this);
    this.className = "Scale";
    this.attrType = eAttrType.Scale;
    
    this.scale = new Vector3DAttr(1, 1, 1);
    this.updateScale = true;
    
    this.scale.addModifiedCB(Scale_ScaleModifiedCB, this);
	
    this.registerAttribute(this.scale, "scale");
}

Scale.prototype.update = function(params, visitChildren)
{
    if (this.updateScale)
    {
        this.updateScale = false;

        var s = this.scale.getValueDirect();

        var matrix = new Matrix4x4();
        matrix.loadScale(s.x, s.y, s.z);
        this.matrix.setValueDirect(matrix);
    }

    // call base-class implementation
    Transform.prototype.update.call(this, params, visitChildren);
}

Scale.prototype.apply = function(directive, params, visitChildren)
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

function Scale_ScaleModifiedCB(attribute, container)
{
    container.updateScale = true;
    container.incrementModificationCount();
}