function Stack(element)
{
    this.stack = new Array();
    this.maxLength = 0;

    if (element)
    {
        this.stack.push(element);
    }
}

Stack.prototype.push = function(element)
{
    if (this.maxLength > 0 && this.stack.length >= this.maxLength)
    {
        this.pop();
    }

    this.stack.push(element);
}

Stack.prototype.pop = function()
{
    if (this.stack.length > 0)
    {
        this.stack.pop();
    }
}

Stack.prototype.load = function(element)
{
    this.pop(); // does nothing if empty
    this.push(element);
}

Stack.prototype.top = function()
{
    if (this.stack.length > 0)
    {
        return this.stack[this.stack.length - 1];
    }

    return null;
}

Stack.prototype.getAt = function(index)
{
    if (this.stack.length > index)
    {
        return this.stack[index];
    }

    return null;
}

Stack.prototype.length = function()
{
    return this.stack.length;
}

Stack.prototype.empty = function()
{
    return this.stack.length == 0;
}

Stack.prototype.clear = function()
{
    this.stack.length = 0;
}

Stack.prototype.copy = function()
{
    return this.stack.slice();
}