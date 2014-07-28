PlayCommand.prototype = new Command();
PlayCommand.prototype.constructor = PlayCommand;

function PlayCommand()
{
    Command.call(this);
    this.className = "Play";
    this.attrType = eAttrType.Play;

    this.evaluators = [];
    this.negate = new BooleanAttr(false);   // if true, Pause
    
    this.registerAttribute(this.negate, "negate");
    
    this.target.addModifiedCB(PlayCommand_TargetModifiedCB, this);

}

PlayCommand.prototype.execute = function()
{
    // TODO: enabled (?)
	var renderAgent = this.registry.find("RenderAgent");
	if (renderAgent)
	{
        // SetEvaluatorPlayState not implemented by RenderAgent
        // ePlayState_* is not implemented by RenderAgent
        if (this.evaluators.length < 1)
        {
			if (this.negate.getValueDirect() == false)
			{
				renderAgent.setEvaluatorsPlayState(ePlayState.Play);
			}
			else
			{
				renderAgent.setEvaluatorsPlayState(ePlayState.Pause);
			}
        }
        else
        {
            for (var i = 0; i < this.evaluators.length; i++)
            {
         
    			if (this.negate.getValueDirect() == false)
    			{
    				renderAgent.setEvaluatorPlayState(evaluators[i], ePlayState.Play);
    			}
    			else
    			{
    				renderAgent.setEvaluatorPlayState(evaluators[i], ePlayState.Pause);
    			}
            
            }   
        }
	}
}

function PlayCommand_TargetModifiedCB(attribute, container)
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