DirectionalLight.prototype = new Light();
DirectionalLight.prototype.constructor = DirectionalLight;

function DirectionalLight()
{
    Light.call(this);
    this.className = "DirectionalLight";
    this.attrType = eAttrType.DirectionalLight;
    
    this.lightDesc.type = "directional";
}

DirectionalLight.prototype.update = function(params, visitChildren)
{
    this.validMembersMask = 0;
    
    // call base-class implementation
    Light.prototype.update.call(this, params, visitChildren);
}

DirectionalLight.prototype.apply = function(directive, params, visitChildren)
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
            var direction = this.sectorTransformCompound.transform(0, 0, 1, 0);
            this.lightDesc.direction.copy(direction);
            this.lightDesc.validMembersMask |= LIGHTDESC_DIRECTION_BIT; 
            
            // must re-update direction every frame because OpenGL transforms
            // light direction by the current modelView matrix
            this.setLightDesc = true;
        }
        break;
    }
    
    // call base-class implementation
    Light.prototype.apply.call(this, directive, params, visitChildren);
}