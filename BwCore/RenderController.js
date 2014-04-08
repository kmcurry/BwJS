var FRAME_RATE_DEFAULT = 30;
var FRAME_RATE_MAX = FRAME_RATE_DEFAULT * 32;
var FRAME_RATE_MIN = FRAME_RATE_DEFAULT * -32;

RenderController.prototype = new AttributeContainer();
RenderController.prototype.constructor = RenderController;

function RenderController(bridgeworks)
{
    AttributeContainer.call(this);
    this.className = "RenderController";
    
    this.playState = ePlayState.Pause;
    
    this.renderAgent = bridgeworks.renderAgent;
}

RenderController.prototype.fastForward = function()
{
    this.play();
    var rate = this.renderAgent.frameRate.getValueDirect();
    if (rate < 0)
    {
        this.renderAgent.desiredFrameRate.setValueDirect(FRAME_RATE_DEFAULT);
    }
    
    if (rate < FRAME_RATE_MAX)
	{
		this.renderAgent.desiredFrameRate.setValueDirect(Math.abs(this.renderAgent.frameRate) * 2);
	}
	else
	{
		// clamp to max fast forward speed
		this.renderAgent.desiredFrameRate.setValueDirect(FRAME_RATE_MAX);
	}
}

RenderController.prototype.pause = function()
{
    this.renderAgent.desiredFrameRate.setValueDirect(FRAME_RATE_DEFAULT);
    this.renderAgent.setEvaluatorsPlayState(ePlayState.Pause);
}

RenderController.prototype.play = function()
{
    this.renderAgent.desiredFrameRate.setValueDirect(FRAME_RATE_DEFAULT);
    this.renderAgent.setEvaluatorsPlayState(ePlayState.Play);    
}

RenderController.prototype.rewind = function()
{
    this.play();
    var rate = this.renderAgent.frameRate.getValueDirect();
    if (rate > 0)
    {
        this.renderAgent.desiredFrameRate.setValueDirect(FRAME_RATE_DEFAULT);
    }
    if (rate > FRAME_RATE_MIN)
    {
        this.renderAgent.desiredFrameRate.setValueDirect(Math.abs(this.renderAgent.frameRate) * -2);
    }
    else
    {
        this.renderAgent.desiredFrameRate.setValueDirect(FRAME_RATE_MIN);    
    }
}

RenderController.prototype.stop = function()
{
    this.renderAgent.setEvaluatorsPlayState(ePlayState.Stop);
    this.renderAgent.desiredFrameRate.setValueDirect(1);
}


/**
 *	Reverses the frame rate and updates a status label with the
 *	current playback speed.  Rewind is a negative frame rate
 *  that doubles with each push of the button until 
 *  BridgeworksObject.FRAME_RATE_MIN is reached
 *	
 *	@param void
 *	@return void
	
function DVD_Rewind()
{
    bridgeworks.updateScene("<Play/>");
    

    if (bridgeworks.renderAgent.frameRate > 0)
    {
        bridgeworks.renderAgent.setDesiredFrameRate(FRAME_RATE_DEFAULT);
    }
    
    if (bridgeworks.renderAgent.frameRate > FRAME_RATE_MIN)	// if fast forwarding or playing
	{
		bridgeworks.renderAgent.setDesiredFrameRate(Math.abs(bridgeworks.renderAgent.frameRate) * -2);
	}
	else	// max rewind value reached
	{
		// clamp to max rewind speed
		bridgeworks.renderAgent.setDesiredFrameRate(FRAME_RATE_MIN);
	}
    
    g_paused = false;

}
 */

/**
 *	Fast forwards the frame rate and updates a status label with the
 *	current playback speed.  Fast forward is a positive frame rate
 *  that doubles with each push of the button until
 *  BridgeworksObject.FRAME_RATE_MAX is reached
 *	
 *	@param void
 *	@return void

function DVD_FastForward()
{
    bridgeworks.updateScene("<Play/>");
    
    if (bridgeworks.renderAgent.frameRate < 0)
    {
        bridgeworks.renderAgent.setDesiredFrameRate(FRAME_RATE_DEFAULT);
    }
    
    if (bridgeworks.renderAgent.frameRate < FRAME_RATE_MAX)
	{
		bridgeworks.renderAgent.setDesiredFrameRate(Math.abs(bridgeworks.renderAgent.frameRate) * 2);
	}
	else
	{
		// clamp to max fast forward speed
		bridgeworks.renderAgent.setDesiredFrameRate(FRAME_RATE_MAX);
	}
    
    g_paused = false;

}
 */	
