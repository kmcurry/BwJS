NullObject.prototype = new ParentableMotionElement();
NullObject.prototype.constructor = NullObject;

function NullObject()
{
    ParentableMotionElement.call(this);
    this.className = "NullObject";
    this.attrType = eAttrType.NullObject;
}