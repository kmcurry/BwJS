BwTargetObserver.prototype = new MultiTargetObserver();
BwTargetObserver.prototype.constructor = BwTargetObserver;

function BwTargetObserver()
{
    MultiTargetObserver.call(this);
    this.className = "BwTargetObserver";
    this.attrType = eAttrType.TargetObserver;
    
    this.targetsAdded = 0;
    this.targetsVector = [];
    this.observersVector = [];
    
	this.observer = new StringAttr();
	this.numTargets = new NumberAttr();
	
	this.registerAttribute(this.observer, "observer");
    this.registerAttribute(this.numTargets, "numTargets");
	
	this.observer.addModifiedCB(BwTargetObserver_ObserverNameModifiedCB, this);
	this.numTargets.addModifiedCB(BwTargetObserver_NumTargetsModifiedCB, this);
	
	this.numTargets.setValueDirect(1);
}

BwTargetObserver.prototype.updateAddTarget = function(target)
{
	// pTarget's worldPosition Attribute is input for the TargetObserver
	if (target)
    {
		// Get the TargetObservers's input
		var targetPosition = this.getAttribute("targetPosition" + this.targetsAdded++);
		if (!targetPosition)
		{
			// TODO:  Error
			return;
		}

		// Add the TargetObserver's input as a target of pTarget's
		// world position (the PME being observed).
		var targetWorldPosition = target.getAttribute("worldCenter");
		targetWorldPosition.addTarget(targetPosition);

        this.targetsVector.push(target);
	}
}

BwTargetObserver.prototype.updateChangeTarget = function(target)
{
	if (target)
    {
		var targetPositionZero = this.getAttribute("targetPosition0");
		if (!targetPositionZero)
		{
			// TODO:  Error
			return;
		}

		// if there is already a target, removed the modified sink
		if (!(this.targetsVector.length == 0))
		{
			var target0WorldPosition = this.targetsVector[0].getAttribute("position");
			target0WorldPosition.removeTarget(targetPositionZero);
		}
		else
		{
			this.targetsVector.length++;
		}

        var targetWorldPosition = target.getAttribute("worldCenter");

		targetWorldPosition.addTarget(targetPositionZero);

		this.targetsVector[0] = target;
    }
}

BwTargetObserver.prototype.updateAddObserver = function(observer)
{
	// pObserver's position Attribute is input for the TargetObserver.
	// pObserver's position also receives the output from the TargetObserver
	// (as a target of the TargetObserver's resultPosition),
	if (observer)
	{
		// Connect observer's position to position input on MultiTargetObserver
		observer.getAttribute("worldCenter").addTarget(this.position);

		// Connect the observer's transform attributes to the outputs of
		// the TargetObserver
		if (this.targets.getValueDirect() > 1)
		{
			this.resultPosition.addTarget(observer.getAttribute("position"));
		}
		this.resultPitch.addTarget(observer.getAttribute("rotation"), 0, 0);   
		this.resultHeading.addTarget(observer.getAttribute("rotation"), 0, 1);

		this.observersVector.push(observer);
	}
}

function BwTargetObserver_TargetNameModifiedCB(attribute, container)
{
	var targetName = attribute.getValueDirect().join("");
	
	var target = container.registry.find(attribute.getValueDirect().join(""));
    if (target)
	{	
		if (container.targets.getValueDirect() == 1)
		{
			container.updateChangeTarget(target);
		}
		else
		{
			container.updateAddTarget(target);
		}
	}
}

function BwTargetObserver_NumTargetsModifiedCB(attribute, container)
{
	var numTargets = attribute.getValueDirect();
	container.setNumberOfTargets(numTargets);

	for (var i = 0; i < numTargets; ++i)
    {
		// remove prev.
		container.unregisterAttribute("target" + i);
		
		// add new
		var target = new StringAttr();
        container.registerAttribute(target, "target" + i);
		target.addModifiedCB(BwTargetObserver_TargetNameModifiedCB, container);
    }
}

function BwTargetObserver_ObserverNameModifiedCB(attribute, container)
{
	var observer = container.registry.find(attribute.getValueDirect().join(""));
    if (observer)
	{
		container.updateAddObserver(observer);
	}
}
