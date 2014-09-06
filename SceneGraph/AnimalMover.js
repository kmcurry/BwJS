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

AnimalMover.prototype.collisionDetected = function(collisionList)
{   
    if (this.activeMotion.stopOnCollision == false)
    {
        return;
    }
    else if (this.activeMotion.reverseOnCollision == true)
    {
        var reverse = this.activeMotion;
        reverse.angularVelocity.multiplyScalar(-1);
        reverse.linearVelocity.multiplyScalar(-1);
        reverse.panVelocity.multiplyScalar(-1);
        reverse.scalarVelocity.multiplyScalar(-1);
        this.motionQueue.push(reverse);
    }
    else
    {
        // clear current motions
        this.activeMotion = null;
        this.motionQueue.clear();
        this.setMotion(new ObjectMotionDesc()); // stops motion
        
        // turn 45 degrees
        var turn45 = new ObjectMotionDesc();
        turn45.stopOnCollision = false;
        turn45.reverseOnCollision = false;
        turn45.duration = (this.angularSpeed.getValueDirect() / 10) / this.angularSpeed.getValueDirect();
        turn45.angularVelocity = new Vector3D(0, this.angularSpeed.getValueDirect(), 0);
        this.motionQueue.push(turn45);
        
        // walk back
        var walkBack = new ObjectMotionDesc();
        walkBack.stopOnCollision = true;
        walkBack.reverseOnCollision = true;
        walkBack.duration = 0;
        walkBack.panVelocity = new Vector3D(0, 0, -this.linearSpeed.getValueDirect() / 10);
        this.motionQueue.push(walkBack); 
    }
}
