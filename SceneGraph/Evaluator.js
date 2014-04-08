Evaluator.prototype = new Node();
Evaluator.prototype.constructor = Evaluator;

function Evaluator()
{
    Node.call(this);
    this.className = "Evaluator";
    this.attrType = eAttrType.Evaluator;
    
    this.expired = new BooleanAttr(false);
    
    this.registerAttribute(this.expired, "expired");
}

Evaluator.prototype.evaluate = function()
{
}

Evaluator.prototype.update = function(params, visitChildren)
{
    // evaluate if evaluator is "enabled" and has not "expired"
    var enabled = this.enabled.getValueDirect();
    var expired = this.expired.getValueDirect();
    if (enabled && !expired)
    {
        this.evaluate();
    }
    
    // call base-class implementation
    Node.prototype.update.call(this, params, visitChildren);
}