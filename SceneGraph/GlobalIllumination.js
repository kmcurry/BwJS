GlobalIllumination.prototype = new SGNode();
GlobalIllumination.prototype.constructor = GlobalIllumination;

function GlobalIllumination()
{
    SGNode.call(this);
    this.className = "GlobalIllumination";
    this.attrType = eAttrType.GlobalIllumination;
    
    this.updateAmbient = true;
    this.setGlobalIllumination = false;
    
    this.ambient = new ColorAttr(0, 0, 0, 1);
    
    this.ambient.addModifiedCB(GlobalIllumination_AmbientModifiedCB, this);
    
    this.registerAttribute(this.ambient, "ambient");
}

GlobalIllumination.prototype.update = function(params, visitChildren)
{
    if (this.updateAmbient)
    {
        this.updateAmbient = false;
        
        this.setGlobalIllumination = true;
    }
    
    // call base-class implementation
    SGNode.prototype.update.call(this, params, visitChildren);
}

GlobalIllumination.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    switch (directive)
    {
    case "render":
        {
            if (this.setGlobalIllumination)
            {
                this.setGlobalIllumination = false;
                
                this.applyGlobalIllumination();
            }
        }
        break;
    }
    
    // call base-class implementation
    SGNode.prototype.apply.call(this, directive, params, visitChildren);
}

GlobalIllumination.prototype.applyGlobalIllumination = function()
{
    this.graphMgr.renderContext.setGlobalIllumination(this.ambient.getValueDirect());
}

function GlobalIllumination_AmbientModifiedCB(attribute, container)
{
    container.updateAmbient = true;
    container.incrementModificationCount();
}