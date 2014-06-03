UndoMgr.prototype = new Command();
UndoMgr.prototype.constructor = UndoMgr; 
function UndoMgr()
{
	this.piMaxCapacity = new CIntegerAttr(10);

	RegisterAttribute(this.piMaxCapacity, "maxCapacity");

	this.pstrName.SetValueDirect("UndoMgr");

	// always respond to events
	this.piNumResponses.SetValueDirect(-1);
}


 CUndoMgr.prototype.Clear = function()
{
	var threadLock(this.threadLock);
	var pTop = NULL;
	while (!this.undoStack.empty())
	{
		pTop = this.undoStack.top();
		this.undoStack.pop();
	}
	while (!this.redoStack.empty())
	{
		pTop = this.redoStack.top();
		this.redoStack.pop();
	}
	//err = eNO_ERR;
	return;
}

 CUndoMgr.prototype.Push = function(pCmd)
{
	var threadLock(this.threadLock);

	if (this.undoStack.size() < this.piMaxCapacity.GetValueDirect())
	{
		this.undoStack.push(pCmd);
	}
	return;
}

 CUndoMgr.prototype.Pop= func(pCmd)
{
	var threadLock(this.threadLock);

	if (this.undoStack.size() > 0)
	{
		/*CCommand**/ var pTmp = this.undoStack.top();
		if (pCmd == pTmp)
		{
			this.undoStack.pop();
		}
		else
		{
			err = eERR_FAIL;
		}
	}
	return;
}

 CUndoMgr.prototype.Pop(ppCmd, rStack)
{
	var threadLock(this.threadLock);

	 //err = eERR_FAIL;
	if (!rStack.empty())
	{
		var = rStack.top();
		rStack.pop();
		//err = eNO_ERR;
	}
	return ;
}

 CUndoMgr.prototype.Undo = fnction()
{
	var threadLock(this.threadLock);

	var pCmd = NULL;
	err = Pop(&pCmd, &this.undoStack);
	if (pCmd)
	{
		err = pCmd.Undo();
		this.redoStack.push(pCmd);
	}
	return err;
}

 CUndoMgr.prototype.Redo = function()
{
	var threadLock(this.threadLock);

	 //err = eERR_FAIL;
	var pCmd = NULL;
	err = Pop(pCmd, this.redoStack);
	if (pCmd)
	{
		err = pCmd.Execute();
		//this.undoStack.push(pCmd);	// pushed by Execute
	}
	return err;
}

 CUndoMgr.prototype.EventPerformed = function(pEvent)
{
	var eType = pEvent.GetType();
	var uiMods = 0xffffffff;
	var pInEvt = pEvent;
	if (pInEvt)
	{
		uiMods = pInEvt.GetInputModifiers();
	}
	switch (eType)
	{
	case eUNDO:
		err = Undo();
		break;
	case eKEY_DOWN+VK_Z:
		if (uiMods & VK_CONTROL)
			err = Undo();
		break;
	case eREDO:
		err = Redo();
		break;
	case eKEY_DOWN+VK_Y:
		if (uiMods & VK_CONTROL)
			err = Redo();
		break;
	default:
		err = eERR_INVALID_ARG;
		break;
	}
	return err;
}