function ObjectMotionDesc()
{
	this.panVelocity = new Vector3D();
	this.linearVelocity = new Vector3D();
	this.angularVelocity = new Vector3D();
	this.scalarVelocity = new Vector3D();
	this.duration = 0;
	this.stopOnCollision = true;
}

ObjectMover.prototype = new Evaluator();
ObjectMover.prototype.constructor = ObjectMover;

function ObjectMover()
{
    Evaluator.call(this);
    this.className = "ObjectMover";
    this.attrType = eAttrType.ObjectMover;
    
    this.motionStack = new Stack();
    
    this.target = new StringAttr("");
    this.time = new NumberAttr(0);
    this.panVelocity = new Vector3DAttr();
    this.linearVelocity = new Vector3DAttr();
    this.angularVelocity = new Vector3DAttr();
    this.scalarVelocity = new Vector3DAttr();
        
    this.target.addModifiedCB(ObjectMover_TargetModifiedCB, this);
    
    this.registerAttribute(this.target, "target");
    this.registerAttribute(this.time, "time");
}

ObjectMover.prototype.evaluate = function()
{
	// time
    var time = this.time.getValueDirect();
    
    
}

ObjectMover.prototype.connectTarget = function(target)
{
	this.panVelocity.removeAllTargets();
	this.linearVelocity.removeAllTargets();
	this.angularVelocity.removeAllTargets();
	this.scalarVelocity.removeAllTargets();
	
	if (target)
	{
		this.panVelocity.addTarget(target.getAttribute("panVelocity"));
		this.linearVelocity.addTarget(target.getAttribute("linearVelocity"));
		this.angularVelocity.addTarget(target.getAttribute("angularVelocity"));
		this.scalarVelocity.addTarget(target.getAttribute("scalarVelocity"));	
	}
}

function ObjectMover_TargetModifiedCB(attribute, container)
{
	var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
    	container.connectTarget(resource);
    }
}
