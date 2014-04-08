TargetObserver.prototype = new Evaluator();
TargetObserver.prototype.constructor = TargetObserver;

function TargetObserver()
{
    this.attrType = eAttrType.TargetObserver;
    this.typeString = "TargetObserver";

    this.position = new Vector3DAttr(0, 0, 0);
    this.targetPosition = new Vector3DAttr(0, 0, 0);
	this.affectPitch = new BooleanAttr(true);
	this.affectHeading = new BooleanAttr(true);

    this.registerAttribute(this.position, "position");
    this.registerAttribute(this.targetPosition, "targetPosition");
	this.registerAttribute(this.affectPitch, "affectPitch");
	this.registerAttribute(this.affectHeading, "affectHeading");

    this.resultPitch = new AttributeVector();
    this.resultHeading = new AttributeVector();
    
    this.registerAttribute(resultPitch, "resultPitch");
    this.registerAttribute(resultHeading, "resultHeading");

}

TargetObserver.prototype.Evaluate()
{
    // get input values

    // position
    var position = this.position.getValueDirect();

    // target position
    var targetPosition = this.targetPosition.getValueDirect();

    // calculate target direction vector (vector from observer position to target position)
    var targetDirection = new CVector3D(targetPosition.x - position.x,
                                        targetPosition.y - position.y,
                                        targetPosition.z - position.z);

    // get heading and pitch angles from target direction vector
    var hp = XYZtoHP(targetDirection.x, targetDirection.y, targetDirection.z);

    var pitch = 0;
	if (this.affectPitch.getValueDirect() == true)
	{
		pitch = -(toDegrees(hp.pitch));
	}

    var heading = 0;
	if (this.affectHeading.getValueDirect() == true)
	{
		heading = toDegrees(hp.heading);
	}

    // output result
    this.resultPitch.setValueDirect(pitch);

    this.resultHeading.setValueDirect(heading);
}
