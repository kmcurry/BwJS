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
		motion.duration = Math.random() * 5;
		
		var rand = Math.random();
		if (rand < 0.25)
		{
			motion.validMembersMask = OBJECTMOTION_ANGULAR_BIT;
			
			var leftOrRight = Math.random();
			if (leftOrRight < 0.5) // turn left
			{
				motion.angularVelocity = new Vector3D(0, this.angularSpeed.getValueDirect(), 0);
			}
			else // (leftOrRight >= 0.5) // turn right
			{
				motion.angularVelocity = new Vector3D(0, -this.angularSpeed.getValueDirect(), 0);
			}
		}
		else if (rand < 0.75)
		{
			motion.validMembersMask = OBJECTMOTION_PAN_BIT;
			motion.panVelocity = new Vector3D(0, 0, this.linearSpeed.getValueDirect());
		}
		else // (rand >= 0.8) // rest
		{
			motion.validMembersMask = OBJECTMOTION_ALL_BITS;
		}
		
		this.motionQueue.push(motion);
	}
	
	// call base-class implementation
	ObjectMover.prototype.evaluate.call(this);
}

AnimalMover.prototype.collisionDetected = function()
{
    this.motionQueue.clear();
    this.activeMotion = null;
    
    var motion = new ObjectMotionDesc();
    motion.duration = 0.5;
    motion.panVelocity = new Vector3D(0, 0, -this.linearSpeed.getValueDirect());
    this.motionQueue.push(motion);
    
    motion = new ObjectMotionDesc();
    motion.duration = 90 / this.angularSpeed.getValueDirect();
    motion.angularVelocity = new Vector3D(0, this.angularSpeed.getValueDirect(), 0);
    this.motionQueue.push(motion);
}
