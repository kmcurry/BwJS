function Queue(element)
{
	this.queue = new Array();
    this.maxLength = 0;
    
    if (element)
    {
        this.queue.push(element);
    }
}

Queue.prototype.push = function(element)
{
	if (this.maxLength > 0 && this.queue.length >= this.maxLength)
	{
		this.pop();
	}
	
    this.queue.push(element);
}

Queue.prototype.pop = function()
{
    if (this.queue.length > 0)
    {
        this.queue.shift();
    }
}

Queue.prototype.load = function(element)
{
    this.pop(); // does nothing if empty
    this.push(element);
}

Queue.prototype.front = function()
{
    if (this.queue.length > 0)
    {
        return this.queue[0];
    }
    
    return null;
}

Queue.prototype.getAt = function(index)
{
    if (this.queue.length > index)
    {
        return this.queue[index];
    }
    
    return null;
}

Queue.prototype.length = function()
{
    return this.queue.length;
}

Queue.prototype.empty = function()
{
    return this.queue.length == 0;
}

Queue.prototype.clear = function()
{
    this.queue.length = 0;
}

Queue.prototype.copy = function()
{
    return this.queue.slice();
}
