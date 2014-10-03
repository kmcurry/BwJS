var ANIMALMOVER_MAX_QUEUE_LENGTH	= 2;

AnimalMover.prototype = new ObjectMover();
AnimalMover.prototype.constructor = AnimalMover;

function AnimalMover()
{
    ObjectMover.call(this);
    this.className = "AnimalMover";
    this.attrType = eAttrType.AnimalMover;
}

AnimalMover.prototype.evaluate = function()
{
	if (this.motionQueue.length() < ANIMALMOVER_MAX_QUEUE_LENGTH)
	{
		var motion = new ObjectMotionDesc();
		motion.duration = FLT_MAX;
		motion.panVelocity = new Vector3D(0, 0, this.linearSpeed.getValueDirect());
		
		this.motionQueue.push(motion);
	}
	
	// call base-class implementation
	ObjectMover.prototype.evaluate.call(this);
}

AnimalMover.prototype.collisionDetected = function(collisionList)
{   
    this.activeMotion = null;
    this.motionQueue.clear();
    
    var turn = new ObjectMotionDesc();
    turn.duration = 1 / this.angularSpeed.getValueDirect();
    turn.angularVelocity = new Vector3D(0, this.angularSpeed.getValueDirect(), 0);
        
    this.motionQueue.push(turn);
      
    var walk = new ObjectMotionDesc();
    walk.duration = 1 / this.linearSpeed.getValueDirect();
    walk.panVelocity = new Vector3D(0, 0, this.linearSpeed.getValueDirect());
        
    this.motionQueue.push(walk);
}
