var ANIMALMOVER_MAX_QUEUE_LENGTH	= 2;

AnimalMover.prototype = new ObjectMover();
AnimalMover.prototype.constructor = AnimalMover;

function AnimalMover()
{
    ObjectMover.call(this);
    this.className = "AnimalMover";
    this.attrType = eAttrType.AnimalMover;
    
    this.linearDirection = null;
}

AnimalMover.prototype.evaluate = function()
{
	if (this.motionQueue.length() == 0)
	{
	    var walk = new ObjectMotionDesc();
		walk.duration = FLT_MAX;
		walk.panVelocity = new Vector3D(0, 0, this.linearSpeed.getValueDirect());
		
		this.motionQueue.push(walk);
	}
	
	// call base-class implementation
	ObjectMover.prototype.evaluate.call(this);
}

AnimalMover.prototype.collisionDetected = function(collisionList)
{   
    if (collisionList.Size() > 0) // collision(s) occurred
    {
       this.motionQueue.clear();
       this.activeMotion = null;

       // determine vector to reverse collision by subtracting collider position(s) from this position
       var thisPos = this.targetObject.getAttribute("sectorPosition").getValueDirect();
       var linearDirection = new Vector3D(0, 0, 0);
       for (var i=0; i < collisionList.Size(); i++)
       {
           var colliderPos = collisionList.getAt(i).getAttribute("sectorPosition").getValueDirect();
           var deltaPos = new Vector3D(thisPos.x - colliderPos.x, /*thisPos.y - colliderPos.y*/0, thisPos.z - colliderPos.z);
           linearDirection.addVector(deltaPos);
       }
       linearDirection.normalize();
       
       // scale by linear speed   
       linearDirection.multiplyScalar(this.linearSpeed.getValueDirect());
       this.linearDirection = linearDirection;
       
       // push linear velocity
       var linear = new ObjectMotionDesc();
       linear.linearVelocity = linearDirection;
       linear.duration = FLT_MAX;
       this.motionQueue.push(linear);
       
       // turn so this will travel in direction of this vector
       var directionVectors = this.targetObject.getDirectionVectors();
       var angleBetween = toDegrees(Math.acos(cosineAngleBetween(directionVectors.forward, this.linearDirection)));
       if (angleBetween > 0)
       {
           var rotation = this.targetObject.getAttribute("rotation").getValueDirect();
           this.targetObject.getAttribute("rotation").setValueDirect(rotation.x, 360 - angleBetween + rotation.y, rotation.z);
       }
    }
    else // no collision(s)
    {
    }
}
