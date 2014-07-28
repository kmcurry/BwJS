CommandSequence.prototype = new Command();
CommandSequence.prototype.constructor = CommandSequence;

function CommandSequence()
{
    Command.call(this);
    this.className = "CommandSequence";
    this.attrType = eAttrType.CommandSequence;
    
    this.sequence = [];
}

CommandSequence.prototype.execute = function()
{
    for (var i=0; i < this.sequence.length; i++)
    {
        this.sequence[i].execute();
    }
}

CommandSequence.prototype.addCommand = function(command)
{
    this.sequence.push(command);
    
    // register command for serialization
    var num = this.sequence.length - 1;
    var name = "Command(" + num.toString() + ")";
    this.registerAttribute(command, name);
}