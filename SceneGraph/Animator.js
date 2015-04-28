Animator.prototype = new Evaluator();
Animator.prototype.constructor = Animator;
    
function Animator()
{
    Evaluator.call(this);
    this.className = "Animator";
    this.attrType = eAttrType.Animator;
    
    this.targetObject = null;
    
    this.timeIncrement = new NumberAttr();
    this.target = new StringAttr("");
    
    this.target.addModifiedCB(Animator_TargetModifiedCB, this);
    
    this.registerAttribute(this.timeIncrement, "timeIncrement");
    this.registerAttribute(this.target, "target");
}

Animator.prototype.evaluate = function()
{    
}

Animator.prototype.targetModified = function(targetObject)
{
    this.targetObject = targetObject;
}

function Animator_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
        container.targetModified(resource);
    }
}

