var ANIMALMOVER_MAX_QUEUE_LENGTH = 2;

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
        var rand = Math.random();
        var negateAngle = rand < 0.5 ? -1 : 1;
        var walk = new ObjectMotionDesc();
        walk.duration = 5 * rand; // 
        walk.angularVelocity = new Vector3D(0, this.angularSpeed.getValueDirect() * rand * negateAngle, 0);
        walk.panVelocity = new Vector3D(0, 0, this.linearSpeed.getValueDirect());

        this.motionQueue.push(walk);
    }

    // call base-class implementation
    ObjectMover.prototype.evaluate.call(this);
}

AnimalMover.prototype.collisionDetected = function(collisionList)
{
}

AnimalMover.prototype.obstructionDetected = function(obstructionList)
{
    if (obstructionList.Size() > 0) // obstructions(s) occurred
    {
        this.motionQueue.clear();
        this.activeMotion = null;

        // determine vector to avoid obstruction
        var directionVectors = this.targetObject.getDirectionVectors();
        var thisPos = this.targetObject.getAttribute("sectorPosition").getValueDirect();
        var linearDirection = new Vector3D(directionVectors.forward.x, directionVectors.forward.y, directionVectors.forward.z);
        var obstructorPos = obstructionList.getAt(0).getAttribute("sectorPosition").getValueDirect();
        var angleBetween = toDegrees(Math.acos(cosineAngleBetween(directionVectors.forward,
                new Vector3D(obstructorPos.x - thisPos.x,
                        obstructorPos.y - thisPos.y,
                        obstructorPos.z - thisPos.z))));
        // if angleBetween is 0, offset obstructorPos so that deltaPos is not (0, 0, 0)
        if (angleBetween == 0)
        {
            obstructorPos.x += 0.1;
            obstructorPos.z += 0.1;
        }
        var mag = distanceBetween(thisPos, obstructorPos);
        var deltaPos = new Vector3D(((directionVectors.forward.x * mag) - (obstructorPos.x)),
                ((directionVectors.forward.y * mag) - (obstructorPos.y)),
                ((directionVectors.forward.z * mag) - (obstructorPos.z)));
        deltaPos.normalize();
        //deltaPos.multiplyScalar(MAX_AVOID_FORCE);
        linearDirection.addVector(deltaPos);
        linearDirection.normalize();

        // scale by linear speed   
        linearDirection.multiplyScalar(this.linearSpeed.getValueDirect());
        this.linearDirection = linearDirection;

        // turn so this will travel in direction of this vector
        var cosAngle = cosineAngleBetween(directionVectors.forward, this.linearDirection);
        angleBetween = toDegrees(Math.acos(cosAngle));
        if (angleBetween > 0)
        {
            if (cosAngle < 0)
                angleBetween = -angleBetween;
            var rotation = this.targetObject.getAttribute("rotation").getValueDirect();
            this.targetObject.getAttribute("rotation").setValueDirect(rotation.x, angleBetween + rotation.y, rotation.z);
            
            // this code can result in endless turning
            /*var turn = new ObjectMotionDesc();
            turn.angularVelocity = new Vector3D(0, angleBetween, 0);
            turn.duration = angleBetween / this.angularSpeed.getValueDirect();
            this.motionQueue.push(turn);*/
        }
    }
    else // no obstruction(s)
    {
    }
}