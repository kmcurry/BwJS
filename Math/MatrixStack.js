MatrixStack.prototype = new Stack();
MatrixStack.prototype.constructor = MatrixStack;

function MatrixStack(element)
{
    Stack.call(this, element);
}

MatrixStack.prototype.push = function(element)
{
    if (element)
    {
        this.stack.push(element);
    }
    else
    {
        this.stack.push(this.top());
    }
}

MatrixStack.prototype.loadMatrix = function(matrix)
{
    this.load(matrix);
}

MatrixStack.prototype.leftMultiply = function(lhs)
{
    var result = lhs.multiply(this.top());
    this.pop();
    Stack.prototype.push.call(this, result);
}

MatrixStack.prototype.rightMultiply = function(rhs)
{
    var result = this.top().multiply(rhs);
    this.pop();
    Stack.prototype.push.call(this, result);
}
