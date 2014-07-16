AttributeTrigger.prototype = new Command();
AttributeTrigger.prototype.constructor = AttributeTrigger;


function AttributeTrigger(input, trigger, target, item, _not, _executionCount)
{
    this.input = input;
    this.trigger = trigger;
    this.target = target;

    this.lastValues = [];

	this.input.getValue(this.lastValues);
    this.attrType = eAttrType.AttributeTrigger;
	
    this.item = item;
    
    this.not = _not;


    this.executionCount = _executionCount;

	this.input.addModifiedCB(AttributeTrigger_InputModifiedCB, this);

	var len = this.input.getLength();

	if (len == 1)
	{
		this.item = 0;
	}
}


AttributeTrigger.prototype.execute = function()
{
	if (this.target)
	{
        var type = this.trigger.attrType;

        switch (type)
        {

        case eAttrType.StringAttr:
            {
                var vIn = [];
                var vTrig = [];
            
                this.input.getValue(vIn);
                this.trigger.getValue(vTrig);

                var pass = vIn[0] == vTrig[0] ? true : false;
                pass = this.not ? !pass : pass;
                if (pass)
                {
                    var count = this.executionCount.getValueDirect() - 1;
                    this.executionCount.setValueDirect(count);
                }

                if (this.executionCount == 0)
		        {
			        this.target = null;
		        }
            }
            break;

        default:
            {
                var vIn = [];
                var vTrig = [];

		        this.input.getValue(vIn);
		        this.trigger.getValue(vTrig);

		        // match single-item Attribute OR single item of a multi-item Attribute
		        if (this.item != -1)
		        {
			        // if equal OR descending past OR ascending past
                    var pass = ((vIn[this.item] == vTrig[0]) ||
			                     (this.lastValues[this.item] > vIn[this.item] && vIn[this.item] < vTrig[0]) ||
			                     (this.lastValues[this.item] < vIn[this.item] && vIn[this.item] > vTrig[0]));
                    pass = this.not ? !pass : pass;
                    if (pass)
			        {
						this.target.execute();
                        var count = this.executionCount.getValueDirect() - 1;
				        this.executionCount.setValueDirect(count);
			        }
		        }
		        else	// match every item in a multi-item Attribute
		        {
			        var len = this.input.getLength();
			        var matches = 0;
			        for (var i = 0; i < len; ++i)
			        {
				        // if equal OR descending past OR ascending past
				        var pass = ((vIn[i] == vTrig[i]) ||
				                     (this.lastValues[i] > vIn[i] && vIn[i] < vTrig[i]) ||
				                     (this.lastValues[i] < vIn[i] && vIn[i] > vTrig[i]));
                        pass = this.not ? !pass : pass;
                        if (pass)
				        {
					        ++matches;
				        }
			        }

			        // if every item matches simultaneously
			        if (matches = len)
			        {
						err = this.target.execute();
						this.executionCount.setValueDirect(--this.executionCount);
			        }
		        }

		        if (this.executionCount.getValueDirect() == 0)
		        {
			        this.target = null;
                    this.input.removeModifiedCB(AttributeTrigger_InputModifiedCB,this);
		        }
		        else
		        {
			        this.lastValues = vIn;
		        }
            }
            break;
        }
	}

	return;
}

function AttributeTrigger_InputModifiedCB(attribute, container)
{
	container.execute();

	// TODO:  Expand to also support EventListener::EventPerformed
}
/*
void AttributeTrigger_InputModifiedTaskProc(void* data, const bool & run)
{
	TAttributeTrigger* pTrigger = static_cast<TAttributeTrigger*>(data);
	pTrigger.Execute();
}
*/