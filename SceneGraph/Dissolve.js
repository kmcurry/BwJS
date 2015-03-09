Dissolve.prototype = new SGNode();
Dissolve.prototype.constructor = Dissolve;

function Dissolve()
{
    SGNode.call(this);
    this.className = "Dissolve";
    this.attrType = eAttrType.Dissolve;
    
    this.lastDissolve = 0;

    this.dissolve = new NumberAttr(0);

    this.dissolve.addModifiedCB(Dissolve_DissolveModifiedCB, this);

    this.registerAttribute(this.dissolve, "dissolve");
}

Dissolve.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    SGNode.prototype.update.call(this, params, visitChildren);
}

Dissolve.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        Group.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
        case "render":
        case "shadow":
            {
                var dissolve = this.dissolve.getValueDirect();
                this.lastDissolve = dissolve;
                
                params.dissolve = dissolve;
            }
            break;

        case "rayPick":
            {
                params.dissolve = this.lastDissolve;
            }
            break;
    }

    // call base-class implementation
    SGNode.prototype.apply.call(this, directive, params, visitChildren);
}

function Dissolve_DissolveModifiedCB(attribute, container)
{
    container.setModified();   
}