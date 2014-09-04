var OBJECTMOTION_PAN_BIT		= 0x001;
var OBJECTMOTION_LINEAR_BIT     = 0x002;
var OBJECTMOTION_ANGULAR_BIT    = 0x004;
var OBJECTMOTION_SCALAR_BIT     = 0x008;
var OBJECTMOTION_ALL_BITS		= 0x00F;

function ObjectMotionDesc()
{
	this.validMembersMask = OBJECTMOTION_ALL_BITS;
	this.panVelocity = new Vector3D(0, 0, 0);
	this.linearVelocity = new Vector3D(0, 0, 0);
	this.angularVelocity = new Vector3D(0, 0, 0);
	this.scalarVelocity = new Vector3D(0, 0, 0);
	this.duration = 0; // seconds
	this.stopOnCollision = true;
}

ObjectMover.prototype = new Evaluator();
ObjectMover.prototype.constructor = ObjectMover;

function ObjectMover()
{
    Evaluator.call(this);
    this.className = "ObjectMover";
    this.attrType = eAttrType.ObjectMover;
    
    this.targetObject = null;
    this.motionQueue = new Queue();
    this.activeDuration = 0;
    
    this.target = new StringAttr("");
    this.timeIncrement = new NumberAttr(0);
    this.linearSpeed = new NumberAttr(0); // meters/sec
    this.angularSpeed = new NumberAttr(0); // degrees/sec
    this.panVelocity = new Vector3DAttr();
    this.linearVelocity = new Vector3DAttr();
    this.angularVelocity = new Vector3DAttr();
    this.scalarVelocity = new Vector3DAttr();
        
    this.target.addModifiedCB(ObjectMover_TargetModifiedCB, this);
    
    this.registerAttribute(this.target, "target");
    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.linearSpeed, "linearSpeed");
    this.registerAttribute(this.angularSpeed, "angularSpeed");
}

ObjectMover.prototype.evaluate = function()
{
	// time
    var timeIncrement = this.timeIncrement.getValueDirect();
    
    this.updateActiveMotion(timeIncrement);

	if (this.activeMotion.validMembersMask & OBJECTMOTION_PAN_BIT)
	{
	    this.panVelocity.setValueDirect(this.activeMotion.panVelocity.x, 
	   	   							    this.activeMotion.panVelocity.y, 
	    								this.activeMotion.panVelocity.z);
    }
    
    if (this.activeMotion.validMembersMask & OBJECTMOTION_LINEAR_BIT)
    {						
	    this.linearVelocity.setValueDirect(this.activeMotion.linearVelocity.x, 
	   								       this.activeMotion.linearVelocity.y, 
	   								       this.activeMotion.linearVelocity.z);
   	}
   		
   	if (this.activeMotion.validMembersMask & OBJECTMOTION_ANGULAR_BIT)
   	{						       
	    this.angularVelocity.setValueDirect(this.activeMotion.angularVelocity.x, 
	   								        this.activeMotion.angularVelocity.y, 
	   								        this.activeMotion.angularVelocity.z);
   	}
   		
   	if (this.activeMotion.validMembersMask & OBJECTMOTION_SCALAR_BIT)
   	{						        
	    this.scalarVelocity.setValueDirect(this.activeMotion.scalarVelocity.x, 
	   								       this.activeMotion.scalarVelocity.y, 
	   								       this.activeMotion.scalarVelocity.z);
    }
}

ObjectMover.prototype.updateActiveMotion = function(timeIncrement)
{
	if (!this.activeMotion ||
		 this.activeDuration >= this.activeMotion.duration)
    {
       	this.activeDuration = 0;
    	this.activeMotion = this.motionQueue.front() || new ObjectMotionDesc();
    	this.motionQueue.pop();
    }  
     
    this.activeDuration += timeIncrement;
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
		target.getAttribute("collisionDetected").addModifiedCB(ObjectMover_TargetCollisionDetectedModifiedCB, this);
	}
	
	this.targetObject = target;
}

ObjectMover.prototype.collisionDetected = function()
{
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

function ObjectMover_TargetCollisionDetectedModifiedCB(attribute, container)
{
    var collisionDetected = attribute.getValueDirect();
    if (collisionDetected)
    {
        container.collisionDetected(attribute.getContainer().getAttribute("collisionList"));
    }
}
