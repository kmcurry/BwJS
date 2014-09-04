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
    // stop if colliding with more than one object
    if (collisionList.Size() > 1)
    {
        this.activeMotion = null;
        this.motionQueue.clear();
        var motion = new ObjectMotionDesc();
        this.motionQueue.push(motion);
        return;
    }
    
    // clear motions set to stopOnCollision
    if (this.activeMotion && this.activeMotion.stopOnCollision)
    {
        this.activeMotion = null;
    }   
    var motions = [];
    for (var i = 0; i < ANIMALMOVER_MAX_QUEUE_LENGTH; i++)
    {
        motions.push(this.motionQueue.getAt(i));
    }
    this.motionQueue.clear();
    for (var i = 0; i < ANIMALMOVER_MAX_QUEUE_LENGTH; i++)
    {
        if (motions[i] && motions[i].stopOnCollision == false)
        {
            this.motionQueue.push(motions[i]);
        }
    }
    
    // add motions attempting to move away from colliding object
    if (this.motionQueue.length() < 1)
    {
        /*var angle = 90;
        // calculate angle turning away from colliding object
        if (collisionList.Size() > 0)
        {
            var collider = collisionList.getAt(0);
            var colliderPos = collider.getAttribute("sectorPosition").getValueDirect();
            
            var targetPos = this.targetObject.getAttribute("sectorPosition").getValueDirect();
            var targetFwd = this.targetObject.getDirectionVectors().forward;
            
            var targetDir = new Vector3D(targetPos.x - colliderPos.x,
                                         targetPos.y - colliderPos.y,
                                         targetPos.z - colliderPos.z);
            
            var cosAngle = cosineAngleBetween(targetFwd, targetDir);
            var radians = Math.acos(cosAngle);
            angle = toDegrees(radians);
        }*/
        
        motion = new ObjectMotionDesc();
        // note: setting the duration to zero allows for a small movement which seems to be effective in moving away from collisions
        motion.duration = 0;//angle / this.angularSpeed.getValueDirect();
        motion.angularVelocity = new Vector3D(0, this.angularSpeed.getValueDirect(), 0);
        motion.stopOnCollision = false;
        this.motionQueue.push(motion);
        
        // note: setting the duration to zero allows for a small movement which seems to be effective in moving away from collisions
    }

    if (this.motionQueue.length() < 2)
    {
        var motion = new ObjectMotionDesc();
        // note: setting the duration to zero allows for a small movement which seems to be effective in moving away from collisions
        motion.duration = 0;
        motion.panVelocity = new Vector3D(0, 0, this.linearSpeed.getValueDirect());
        motion.stopOnCollision = false;
        this.motionQueue.push(motion);
    }
}
