CommandSequence.prototype = new Command();
CommandSequence.prototype.constructor = CommandSequence;

function CommandSequence()
{
    Command.call(this);
    this.className = "CommandSequence";
    
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
}