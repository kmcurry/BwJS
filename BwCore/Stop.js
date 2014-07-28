StopCommand.prototype = new Command();
StopCommand.prototype.constructor = StopCommand;

function StopCommand()
{
    Command.call(this);
    this.className = "Stop";
    this.attrType = eAttrType.Stop;

    this.evaluators = [];
    
    this.target.addModifiedCB(StopCommand_TargetModifiedCB, this);

}

StopCommand.prototype.execute = function()
{
    // TODO: enabled (?)
	var renderAgent = this.registry.find("RenderAgent");
	if (renderAgent)
	{
        // SetEvaluatorStopState not implemented by RenderAgent
        // eStopState_* is not implemented by RenderAgent
        if (this.evaluators.length < 1)
        {
			renderAgent.setEvaluatorsPlayState(ePlayState.Stop);
        }
        else
        {
            for (var i = 0; i < this.evaluators.length; i++)
            {
         
    			renderAgent.setEvaluatorPlayState(evaluators[i], ePlayState.Stop);
            }   
        }
	}
}

function StopCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var targets = target.split(",");

    // find one or more evaluator to play
    container.targets.length = 0;   // copied this from Set. What does it do?
    for (var i = 0; i < targets.length; i++)
    {
        var evaluator = container.registry.find(targets[i]);
        if (evaluator)
        {
            container.evaluators[i] = evaluator;
        }
    }
}