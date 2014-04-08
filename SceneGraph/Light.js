Light.prototype = new ParentableMotionElement();
Light.prototype.constructor = Light;

function Light()
{
    ParentableMotionElement.call(this);
    this.className = "Light";
    this.attrType = eAttrType.Light;
    
    this.updateAmbient = true;
    this.updateDiffuse = true;
    this.updateSpecular = true;
    this.updateConstantAttenuation = true;
    this.updateLinearAttenuation = true;
    this.updateQuadraticAttenuation = true;
    this.lightDesc = new LightDesc();
    this.lightDesc.validMembersMask = 0;
    this.lightIndex = 0;
    this.setLightDesc = false;
    
    this.ambient = new ColorAttr(0, 0, 0, 1);
	this.diffuse = new ColorAttr(1, 1, 1, 1);
	this.specular = new ColorAttr(1, 1, 1, 1);
	this.constantAttenuation = new NumberAttr(1);
	this.linearAttenuation = new NumberAttr(0);
	this.quadraticAttenuation = new NumberAttr(0);
    this.shadowCaster = new BooleanAttr(false);

    this.ambient.addModifiedCB(Light_AmbientModifiedCB, this);
    this.diffuse.addModifiedCB(Light_DiffuseModifiedCB, this);
    this.specular.addModifiedCB(Light_SpecularModifiedCB, this);
    this.constantAttenuation.addModifiedCB(Light_ConstantAttenuationModifiedCB, this);
    this.linearAttenuation.addModifiedCB(Light_LinearAttenuationModifiedCB, this);
    this.quadraticAttenuation.addModifiedCB(Light_QuadraticAttenuationModifiedCB, this);

    this.registerAttribute(this.ambient, "ambient");
    this.registerAttribute(this.diffuse, "diffuse");
    this.registerAttribute(this.specular, "specular");
    this.registerAttribute(this.constantAttenuation, "constantAttenuation");
    this.registerAttribute(this.linearAttenuation, "linearAttenuation");
    this.registerAttribute(this.quadraticAttenuation, "quadraticAttenuation");
    this.registerAttribute(this.shadowCaster, "shadowCaster");
}

Light.prototype.setGraphMgr = function(graphMgr)
{
    this.lightIndex = graphMgr.getAvailableLightIndex();
    
    // call base-class implementation
    ParentableMotionElement.prototype.setGraphMgr.call(this, graphMgr);
}

Light.prototype.update = function(params, visitChildren)
{
    if (this.updateAmbient)
    {
        this.updateAmbient = false;

        this.lightDesc.ambient.copy(this.ambient.getValueDirect());
        this.lightDesc.validMembersMask |= LIGHTDESC_AMBIENT_BIT;
    }

    if (this.updateDiffuse)
    {
        this.updateDiffuse = false;

        this.lightDesc.diffuse.copy(this.diffuse.getValueDirect());
        this.lightDesc.validMembersMask |= LIGHTDESC_DIFFUSE_BIT;
    }

    if (this.updateSpecular)
    {
        this.updateSpecular = false;

        this.lightDesc.specular.copy(this.specular.getValueDirect());
        this.lightDesc.validMembersMask |= LIGHTDESC_SPECULAR_BIT;
    }

    if (this.updateConstantAttenuation)
    {
        this.updateConstantAttenuation = false;

        this.lightDesc.constantAttenuation = this.constantAttenuation.getValueDirect();
        this.lightDesc.validMembersMask |= LIGHTDESC_CONSTANT_ATT_BIT;
    }

    if (this.updateLinearAttenuation)
    {
        this.updateLinearAttenuation = false;

        this.lightDesc.linearAttenuation = this.linearAttenuation.getValueDirect();
        this.lightDesc.validMembersMask |= LIGHTDESC_LINEAR_ATT_BIT;
    }

    if (this.updateQuadraticAttenuation)
    {
        this.updateQuadraticAttenuation = false;

        this.lightDesc.quadraticAttenuation = this.quadraticAttenuation.getValueDirect();
        this.lightDesc.validMembersMask |= LIGHTDESC_QUADRATIC_ATT_BIT;
    }

    if (this.lightDesc.validMembersMask)
    {
        this.setLightDesc = true;
    }
    
    // call base-class implementation
    ParentableMotionElement.prototype.update.call(this, params, visitChildren);
}

Light.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        switch (directive)
        {
        case "render":
            {
                this.setLightEnabled();
            }
            break;
        }
        
        // call base-class implementation
        ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    switch (directive)
    {
    case "render":
        {
            if (this.setLightDesc)
            {
                this.setLightDesc = false;
                
                this.applyLightDesc();
            }

            this.setLightEnabled();   
        }
        break;
    }
    
    // call base-class implementation
    ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
}

Light.prototype.applyLightDesc = function()
{
    this.graphMgr.renderContext.setLight(this.lightIndex, this.lightDesc);  
}

Light.prototype.setLightEnabled = function()
{
    this.graphMgr.renderContext.enableLight(this.lightIndex, this.enabled.getValueDirect() ? 1 : 0);
}

function Light_AmbientModifiedCB(attribute, container)
{
    container.updateAmbient = true;
    container.incrementModificationCount();
}

function Light_DiffuseModifiedCB(attribute, container)
{
    container.updateDiffuse = true;
    container.incrementModificationCount();
}

function Light_SpecularModifiedCB(attribute, container)
{
    container.updateSpecular = true;
    container.incrementModificationCount();
}

function Light_ConstantAttenuationModifiedCB(attribute, container)
{
    container.updateConstantAttenuation = true;
    container.incrementModificationCount();
}
    
function Light_LinearAttenuationModifiedCB(attribute, container)
{
    container.updateLinearAttenuation = true;
    container.incrementModificationCount();
}

function Light_QuadraticAttenuationModifiedCB(attribute, container)
{
    container.updateQuadraticAttenuation = true;
    container.incrementModificationCount();
}
