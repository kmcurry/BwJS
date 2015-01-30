QuaternionRotate.prototype = new Transform();
QuaternionRotate.prototype.constructor = QuaternionRotate;

function QuaternionRotate()
{
    Transform.call(this);
    this.className = "QuaternionRotate";
    this.attrType = eAttrType.QuaternionRotate;

    this.rotationQuat = new QuaternionAttr(1, 0, 0, 0);
    this.rotation = new Vector3DAttr(0, 0, 0);
    this.updateRotationQuat = true;

    this.rotationQuat.addModifiedCB(QuaternionRotate_RotationQuatModifiedCB, this);

    this.registerAttribute(this.rotationQuat, "rotationQuat");
    this.registerAttribute(this.rotation, "rotation");
}

QuaternionRotate.prototype.update = function(params, visitChildren)
{
    if (this.updateRotationQuat)
    {
        this.updateRotationQuat = false;

        var q = this.rotationQuat.getValueDirect();

        var matrix = q.getMatrix();
        this.matrix.setValueDirect(matrix);

        var rotation = matrix.getRotationAngles();
        this.rotation.setValueDirect(rotation.x, rotation.y, rotation.z);
        
        //console.debug("QuaternionRotate: rotation " + rotation.x + ", " + 
        //rotation.y + ", " + rotation.z);
    }

    // call base-class implementation
    Transform.prototype.update.call(this, params, visitChildren);
}

QuaternionRotate.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled.getValueDirect())
    {
        // call base-class implementation
        Transform.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    /*
    switch (directive)
    {
        case "render":
        {
        }
        break;
         
        case "rayPick":
        {
            
        }
        break;
        
        case "bbox":
        {
            
        }
        break;
        
        case "collide":
        {
        }
        break;
    }
    */
    // call base-class implementation
    Transform.prototype.apply.call(this, directive, params, visitChildren);
}

function QuaternionRotate_RotationQuatModifiedCB(attribute, container)
{
    container.updateRotationQuat = true;
    container.incrementModificationCount();
}