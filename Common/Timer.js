function Timer()
{
    this.startTime = null;
    this.stopTime = null;
}

Timer.prototype.start = function()
{
    var date = new Date();
    
    this.startTime = date.getTime();
}

Timer.prototype.stop = function()
{
    var date = new Date();
    
    this.stopTime = date.getTime();
}

Timer.prototype.getTime = function()
{
    if (this.startTime && this.stopTime)
    {
        return (this.stopTime - this.startTime) / 1000;
    }
        
    return 0;
}