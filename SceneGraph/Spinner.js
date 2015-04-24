Spinner.prototype = new Animator();
Spinner.prototype.constructor = Spinner;
    
function Spinner()
{
    Animator.call(this);
    this.className = "Spinner";
    this.attrType = eAttrType.Spinner;
    
    this.targetCenter = new Vector3D();
    
    this.axisEndpoint = new Vector3DAttr(0, 0, 0);
    this.angularVelocity = new NumberAttr(0);
    
    this.registerAttribute(this.axisEndpoint, "axisEndpoint");
    this.registerAttribute(this.angularVelocity, "angularVelocity");
}

Spinner.prototype.evaluate = function()
{
    if (!this.targetObject) return;
    
    var timeIncrement = this.timeIncrement.getValueDirect()
    var angularVelocity = this.targetObject.angularVelocity.getValueDirect();
    
    var axisEndpoint = this.axisEndpoint.getValueDirect();   
    var axis = new Vector3D(axisEndpoint.x - this.targetCenter.x,
        axisEndpoint.y - this.targetCenter.y, 
        axisEndpoint.z - this.targetCenter.z);
    
    var spinQuat = new Quaternion();
    spinQuat.loadXYZAxisRotation(axis.x, axis.y, axis.z, this.angularVelocity.getValueDirect() * timeIncrement);
    
    var quaternion = this.targetObject.quaternion.getValueDirect();
    quaternion = spinQuat.multiply(quaternion);
    
    this.targetObject.quaternion.setValueDirect(quaternion);
}

Spinner.prototype.targetModified = function(targetObject)
{
    this.targetObject = targetObject;
    if (targetObject)
    {    
        // get center
        this.targetCenter = targetObject.center.getValueDirect();
    }
}

