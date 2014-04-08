/**
 *	Resets the navigation buttons to their default states
 *	
 *	@param void
 *	@return void
 */	
function resetNavButtons()
{
	document.images["button_pause"].src = "UI/images/button_pause.gif";
	document.images["button_ff"].src = "UI/images/button_ff.gif";
	document.images["button_rw"].src = "UI/images/button_rw.gif";
	document.images["button_stop"].src = "UI/images/button_stop.gif";
}

/**
 *	Stops the scene playback.  Also clears out the text of a status label.
 *	
 *	@param void
 *	@return void
 */	
function stopScene()
{
	resetNavButtons();
	BWorks.pause();
	BWorks.resetStop();
	currentSpeed = 0;
	setFrameRate(currentSpeed);

	document.images["button_pause"].src = "UI/images/button_play.gif";
	
	// Clear out FFD REW Label text
	BWorks.UpdateScene("<Set target='FFD REW Label' width='0' text=''/>");	
}

/**
 *	Pauses the scene playback.  Also clears out the text of a status label.
 *	
 *	@param void
 *	@return void
 */	
function pauseScene()
{
	resetNavButtons();
	currentSpeed = 30;
	setFrameRate(currentSpeed);

	if (BWorks.isPaused)
	{
		BWorks.play();
	}
	else
	{
		BWorks.pause();
	}
	
	// Clear out FFD REW Label text
	BWorks.UpdateScene("<Set target='FFD REW Label' width='0' text=''/>");	
}

/**
 *	Resumes the scene playback at normal speed.  Also clears out the text of a
 *	status label.
 *	
 *	@param void
 *	@return void
 */	
function playScene()
{
	resetNavButtons();
	BWorks.play();
	
	// Clear out FFD REW Label text
	BWorks.UpdateScene("<Set target='FFD REW Label' width='0' text=''/>");	
}

/**
 *	Rewinds the scene playback.  Also updates a status label with the
 *	current playback speed.
 *	
 *	@param void
 *	@return void
 */	
function rewindScene()
{
	resetNavButtons();

	if ((currentSpeed <= 15360) && (currentSpeed >= 0))	// if fast forwarding or playing
	{
		BWorks.play();
		currentSpeed = -60;
		setFrameRate(currentSpeed);
		BWorks.isPaused = false;
	}
	else if ((currentSpeed > -15360) && (currentSpeed < 0))	// if rewinding
	{
		currentSpeed *= 2;
		setFrameRate(currentSpeed);
	}
	else	// max rewind value reached
	{
		// clamp to max rewind speed
		BWorks.play();
		currentSpeed = -15360;
		setFrameRate(currentSpeed);
	}

	document.images["button_rw"].src = "UI/images/button_rw_on.gif";
	
	var speed = Math.abs(currentSpeed / 30);
	var labelText = "REW " + speed + " X";
	
	// Update FFD REW Label text
	BWorks.UpdateScene("<Set target='FFD REW Label' width='0' text='" + labelText + "'/>");
}

/**
 *	Fast forwards the scene playback.  Also updates a status label with the
 *	current playback speed.
 *	
 *	@param void
 *	@return void
 */	
function fastForwardScene()
{
	resetNavButtons();
	
	if (currentSpeed < 10000)
	{
		if (currentSpeed > 30)		// if currently fast forwarding
		{
			currentSpeed *= 2;
			setFrameRate(currentSpeed);
		}
		else
		{
			BWorks.play();
			currentSpeed = 60;
			setFrameRate(currentSpeed);
			BWorks.isPaused = false;
		}
	}
	else
	{
		// clamp to max fast forward speed
		BWorks.play();
		currentSpeed = 15360;
		setFrameRate(currentSpeed);
	}

	document.images["button_ff"].src = "UI/images/button_ff_on.gif";
	
	var speed = Math.abs(currentSpeed / 30);
	var labelText = "FFWD " + speed + " X";
	
	// Update FFD REW Label text
	BWorks.UpdateScene("<Set target='FFD REW Label' width='0' text='" + labelText + "'/>");
}

/**
 * Helper function that passes into Bridgeworks well-formed xml that sets the RenderAgent's desiredFrameRate attribute.
 * Setting the frame rate alters the speed of the scene's motions paths.  Increasing/decreasing the frame rate 
 * increases/decreases the speed.  Setting the frame rate to a negative value will reverse the scene's motion paths. 
 *
 * @param int iFrameRate Represents the new value for the desired frame rate
 * @return void
 */
function setFrameRate(iFrameRate)
{
	Bridgeworks.UpdateScene("<Set target=\"RenderAgent\" desiredFrameRate=\"" + iFrameRate + "\"/>");
}

