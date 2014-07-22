MultiTargetObserver.prototype = new Evaluator();
MultiTargetObserver.prototype.constructor = MultiTargetObserver;

function MultiTargetObserver()
{
    Evaluator.call(this);
    this.className = "MultiTargetObserver";
    this.attrType = eAttrType.MultiTargetObserver;
    
    this.targetPosition = [];
    
    this.targets = new NumberAttr(0);
    this.position = new Vector3DAttr(0, 0, 0);
    this.distanceFromFirstTarget = new NumberAttr(0);
	this.affectPitch = new BooleanAttr(true);
	this.affectHeading = new BooleanAttr(true);
	this.resultPosition = new Vector3DAttr(0, 0, 0);
    this.resultPitch = new NumberAttr(0);
    this.resultHeading = new NumberAttr(0);

    this.registerAttribute(this.targets, "targets");
    this.registerAttribute(this.position, "position");
    this.registerAttribute(this.distanceFromFirstTarget, "distanceFromFirstTarget");
	this.registerAttribute(this.affectPitch, "affectPitch");
	this.registerAttribute(this.affectHeading, "affectHeading");
    this.registerAttribute(this.resultPosition, "resultPosition");
    this.registerAttribute(this.resultPitch, "resultPitch");
    this.registerAttribute(this.resultHeading, "resultHeading");
}

MultiTargetObserver.prototype.setNumberOfTargets = function(targets)
{
	// if targets are already registered, then unregister them
    var oldTargets = this.targets.getValueDirect();
	if (oldTargets > 0)
	{
		for (var i=0; i < oldTargets; i++)
        {
            this.unregisterAttribute(this.targetPosition[i]);
        }
	}

    this.targets.setValueDirect(targets);

    // allocate dynamic inputs
    if (targets > 0)
    {
        this.targetPosition.length = targets;
        
        for (var i=0; i < targets; i++)
        {
        	this.targetPosition[i] = new Vector3DAttr(0, 0, 0);
			this.registerAttribute(this.targetPosition[i], "targetPosition" + i);
        }
    }
}

MultiTargetObserver.prototype.evaluate = function()
{
    if (!(this.enabled.getValueDirect()))
	{
		return;
	}

    // if no targets, nothing to do
    if (this.targets.getValueDirect() == 0)
    {
        return;
    }

    // get input values

    // get observer and target positions
    var observerAndTarget = this.getObserverAndTargetPositions();
    var observer = observerAndTarget.observer;
    var target = observerAndTarget.target;

    // calculate target direction vector (vector from observer position to target position)
    var targetDirection = new Vector3D(target.x - observer.x,
                               		   target.y - observer.y,
                               		   target.z - observer.z);

    // get heading and pitch angles from target direction vector
    var targetDirHeading, targetDirPitch;
    var hp = XYZtoHP(targetDirection.x, targetDirection.y, targetDirection.z);
    var targetDirHeading = hp.heading;
    var targetDirPitch = hp.pitch;

    var pitch = 0;
	if (this.affectPitch.getValueDirect() == true)
	{
		pitch = -toDegrees(targetDirPitch);
	}

    var heading = 0;
	if (this.affectHeading.getValueDirect() == true)
	{
		heading = -toDegrees(targetDirHeading);
	}

    // output result
    var values = [observer.x, observer.y, observer.z];
    this.resultPosition.setValue(values);

    if (this.affectPitch.getValueDirect() == true)
    {
    	this.resultPitch.setValueDirect(pitch);
    }

    if (this.affectHeading.getValueDirect() == true)
    {
        this.resultHeading.setValueDirect(heading);
    }
}

MultiTargetObserver.prototype.getObserverAndTargetPositions = function()
{
	var observer, target;
	
    switch (this.targets.getValueDirect())
    {
    case 0:
        {
            observer = new Vector3D(0, 0, 0);
            target = new Vector3D(0, 0, 0);
        }
        break;

    case 1:
        {
            observer = this.position.getValueDirect();
            target = this.targetPosition[0].getValueDirect();
        }
        break;

    case 2:
        {
            var target1 = this.targetPosition[0].getValueDirect();
            var target2 = this.targetPosition[1].getValueDirect();

            var distance = this.distanceFromFirstTarget.getValueDirect();

            // get line direction from target2 to target1
            var lineDir = Normalize(target1 - target2);

            // calculate observer's position as target1's position + lineDir scaled by distance
            observer = lineDir * distance + target1;

            // if distance is 0, observer's position will equal target1's position,
            // so use target1 - lineDir as target's position
            if (distance == 0)
            {
                target = target1 - lineDir;
            }
            else
            {
                target = target1;
            }
        }
        break;

    default: // > 2 targets (currently unsupported)
        {
            observer = new Vector3D(0, 0, 0);
            target = Vector3D(0, 0, 0);
        }
        break;
    }
    
    return { observer: observer, target: target };
}