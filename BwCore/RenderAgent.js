RenderAgent.prototype = new Agent();
RenderAgent.prototype.constructor = RenderAgent;

var ePlayState = {
    Unknown:    -1,
    
    Play:       0,
    Pause:      1,
    Stop:       2,
}

function RenderAgent(bridgeworks)
{
    Agent.call(this);
    this.className = "RenderAgent";
    
    this.bridgeworks = bridgeworks;
    
    this.name.setValueDirect("RenderAgent");
    this.timer = new Timer();
    
    this.frameRate = new NumberAttr(0);
    this.desiredFrameRate = new NumberAttr(30);
    this.timeIncrement = new NumberAttr(0);
    this.globalTimeInSecs = new NumberAttr(0);
    this.elapsedTimeInSecs = new NumberAttr(0);

    this.desiredFrameRate.addModifiedCB(RenderAgent_DesiredFrameRateModified, this);
    this.globalTimeInSecs.addModifiedCB(RenderAgent_GlobalTimeInSecsModified, this);
    
    this.registerAttribute(this.frameRate, "frameRate");
    this.registerAttribute(this.desiredFrameRate, "desiredFrameRate");
    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.globalTimeInSecs, "globalTimeInSecs");
    this.registerAttribute(this.elapsedTimeInSecs, "elapsedTimeInSecs");
}

RenderAgent.prototype.render = function()
{
    this.timer.stop();
    var increment = this.timer.getTime();
    this.timer.start();
    this.timeIncrement.setValueDirect(increment);
    
    var elapsedTime = this.elapsedTimeInSecs.getValueDirect() + increment;
    this.elapsedTimeInSecs.setValueDirect(elapsedTime);
    // update frame rate
    this.frameRate.setValueDirect(1.0 / increment);
    //alert(this.desiredFrameRate.getValueDirect());
    this.animateEvaluators(increment);
    this.executeRenderDirectives();
}

RenderAgent.prototype.animateEvaluators = function(timeIncrement)
{
    var evaluators = this.registry.getByType(eAttrType.Evaluator);
    for (var i=0; i < evaluators.length; i++)
    {
        this.animateEvaluator(evaluators[i], timeIncrement);
    }
}

RenderAgent.prototype.animateEvaluator = function(evaluator, timeIncrement)
{
    var enabled = evaluator.getAttribute("enabled").getValueDirect();
    var expired = evaluator.getAttribute("expired").getValueDirect();

    var orphan = evaluator.getAttribute("orphan").getValueDirect();

    if (enabled && !expired)
    {
        switch (evaluator.className)
        {
            case "KeyframeInterpolator":
            {
                var params = new AttributeSetParams(-1, -1, eAttrSetOp.Add, true, true);
                evaluator.getAttribute("time").setValue(timeIncrement, params);
            }
            break;
            
            case "ObjectMover":
            case "AnimalMover":
            case "PhysicsSimulator":
            case "GoblinPhysicsSimulator":
            case "CannonPhysicsSimulator":
            {
            	evaluator.getAttribute("timeIncrement").setValueDirect(timeIncrement);
            }
        }

        // don't evaluate scene/object inspection here, or any other evaluator not in the scene graph
        if (!orphan) evaluator.evaluate();
    }

    // if evaluator has expired, and it's set to "renderAndRelease", release it
    if (expired && evaluator.getAttribute("renderAndRelease").getValueDirect())
    {
        this.registry.unregister(evaluator);
    }
}

RenderAgent.prototype.executeRenderDirectives = function()
{
    var directives = this.registry.getByType(eAttrType.RenderDirective);
    if (directives)
    {
        this.bridgeworks.viewportMgr.layoutDirectives(directives);
        for (var i=0; i < directives.length; i++)
        {
        	directives[i].getAttribute("timeIncrement").setValueDirect(this.timeIncrement.getValueDirect());
            directives[i].execute();    
        }
    }   
}

// never executes
RenderAgent.prototype.globalTimeInSecsModified = function()
{
    var globalTime = this.globalTimeInSecs.getValueDirect();

    // synchronize elapsed time
    this.elapsedTimeInSecs.setValueDirect(globalTime);

    // get all evaluators and set their time to globalTimeInSecs
    if (this.registry)
    {
        var evaluators = this.registry.getByType(eAttrType.Evaluator);
        if (evaluators)
        {
            for (var i=0; i < evaluators.length; i++)
            {
                var evaluator = evaluators[i];
                if (evaluator)
                {
                    var time = evaluator.getAttribute("time");
                    if (time)
                    {
                        var globalTimeSyncEnabled = evaluator.getAttribute("globalTimeSyncEnabled");
                        if ((globalTimeSyncEnabled && globalTimeSyncEnabled.getValueDirect()) ||
                            !globalTimeSyncEnabled)
                        {
                            time.setValueDirect(globalTime);
                        }
                    }
                    
                    evaluator.evaluate(); // calling Evaluate() will reset "expired" flag based upon global time
                }
            }
        }

        // disable the rotation inspection group for the models in the scene;
        // this is required b/c user may have rotated models during
        // object inspection and Object Inspection uses transformation
        // nodes that will still be affecting the target
        var models = this.registry.getByType(eAttrType.Model);
        if (models)
        {
            for (var i=0; i < models.length; i++)
            {
                setInspectionGroupActivationState(models[i], false);
            }
        }
    }
}

RenderAgent.prototype.setEvaluatorPlayState = function(evaluator, state)
{
    if (!evaluator)
    {
        return this.setEvaluatorPlayState(state);
    }
    
    // perform state-specific processing
    var en = evaluator.getAttribute("enabled");
    switch (state)
    {
    case ePlayState.Play:
        {
            en.setValueDirect(true);
        }
        break;

    case ePlayState.Pause:
        {
            en.setValueDirect(false);
        }
        break;

    case ePlayState.Stop:
        {
            en.setValueDirect(false);

            // if kfi, set time to 0 and evaluate once to reset outputs to time 0
            switch (evaluator.className)
            {
            case "KeyframeInterpolator":
                {
                    evaluator.getAttribute("time").setValueDirect(0);
                    evaluator.evaluate();
                }
            }
        }
        break;
    }
    
    clearObjectPositionMap();
}

RenderAgent.prototype.setEvaluatorsPlayState = function(state)
{
    if (this.registry)
    {
        var evaluators = this.registry.getByType(eAttrType.Evaluator);
        if (evaluators)
        {
            for (i=0; i < evaluators.length; i++)
            {
                var evaluator = evaluators[i];
                
                var type = evaluator.attrType;

                // don't set play state for inspectors or any evaluators not in scenegraph
                var orphan = evaluator.getAttribute("orphan").getValueDirect();
                if (!orphan)
                {
                    this.setEvaluatorPlayState(evaluator, state)
                }

            }
        }
    }
}

RenderAgent.prototype.setDesiredFrameRate = function(rate)
{
    this.desiredFrameRate.setValueDirect(rate);
}

function RenderAgent_DesiredFrameRateModified(attribute, container)
{
}

function RenderAgent_GlobalTimeInSecsModified(attribute, container)
{
    var renderAgent = container.registry.find("RenderAgent");
    renderAgent.globalTimeInSecsModified();
}