Selector.prototype = new Group();
Selector.prototype.constructor = Selector;

function Selector()
{
    Group.call(this);
    this.className = "Selector";
    this.attrType = eAttrType.Selector;
    
    this.selectee = new NumberAttr(0);
    
    this.registerAttribute(this.selectee, "selectee");
}

Selector.prototype.update = function(params, visitChildren)
{
    // call update for selected child    
    var selectee = this.selectee.getValueDirect();
    if (visitChildren && this.children.length > selectee)
    {
        this.children[selectee].update(params, visitChildren);
        return;
    }
    
    // call base-class implementation
    Group.prototype.update.call(this, params, visitChildren);
}

Selector.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        Group.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    // call apply for selected child
    var selectee = this.selectee.getValueDirect();
    if (visitChildren && this.children.length > selectee)
    {
        this.children[selectee].apply(directive, params, visitChildren);
        return;
    }
    
    // call base-class implementation
    Group.prototype.apply.call(this, directive, params, visitChildren);
}
