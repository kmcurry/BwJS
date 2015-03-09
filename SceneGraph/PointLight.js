PointLight.prototype = new Light();
PointLight.prototype.constructor = PointLight;

function PointLight()
{
    Light.call(this);
    this.className = "PointLight";
    this.attrType = eAttrType.PointLight;
    
    this.lightDesc.type = "point";
    
    this.updateRange = false;
    
    this.range = new NumberAttr();
    
    this.range.addModifiedCB(PointLight_RangeModifiedCB, this);

    this.registerAttribute(this.range, "range");
}

PointLight.prototype.setGraphMgr = function(graphMgr)
{
    // call base-class implementation
    Light.prototype.setGraphMgr.call(this, graphMgr);
    
    this.range.setValueDirect(FLT_MAX); // invoke modified CB
}

PointLight.prototype.update = function(params, visitChildren)
{
    this.validMembersMask = 0;
    
    if (this.updateRange)
    {
        this.updateRange = false;

        this.lightDesc.range = this.range.getValueDirect();
        this.lightDesc.validMembersMask |= LIGHTDESC_RANGE_BIT;
    }
    
    // call base-class implementation
    Light.prototype.update.call(this, params, visitChildren);
}

PointLight.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        Light.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    switch (directive)
    {
    case "render":
        {      
            var position = this.sectorTransformCompound.transform(0, 0, 0, 1);
            this.lightDesc.position.copy(position);
            this.lightDesc.validMembersMask |= LIGHTDESC_POSITION_BIT;

            // signifies this is a point light (not a spot light)
            this.lightDesc.outerConeDegrees = 180;
            this.lightDesc.validMembersMask |= LIGHTDESC_OUTER_CONE_DEG_BIT;
            
            // must re-update position every frame because OpenGL transforms
            // light position by the current modelView matrix
            this.setLightDesc = true;
        }
        break;
    }
    
    // call base-class implementation
    Light.prototype.apply.call(this, directive, params, visitChildren);
}

function PointLight_RangeModifiedCB(attribute, container)
{
    container.updateRange = true;
    container.setModified();
}