Material.prototype = new SGNode();
Material.prototype.constructor = Material;

function Material()
{
    SGNode.call(this);
    this.className = "Material";
    this.attrType = eAttrType.Material;
    
    this.updateColor = false;
    this.updateAmbientLevel = false;
    this.updateDiffuseLevel = false;
    this.updateSpecularLevel = false;
    this.updateEmissiveLevel = false;
    this.updateAmbient = true;
    this.updateDiffuse = true;
    this.updateSpecular = true;
    this.updateEmissive = true;
    this.updateGlossiness = true;
    this.updateOpacity = true;
    this.lastOpacity = 0;
    this.lastDoubleSided = false;
    this.materialDesc = new MaterialDesc();
    this.materialDesc.validMembersMask = MATERIALDESC_ALL_BITS;
    
    this.color = new ColorAttr(1, 1, 1, 1);
    this.ambientLevel = new NumberAttr(1);
    this.diffuseLevel = new NumberAttr(1);
    this.specularLevel = new NumberAttr(1);
    this.emissiveLevel = new NumberAttr(0);
    this.ambient = new ColorAttr(0.2, 0.2, 0.2, 1);
    this.diffuse = new ColorAttr(0.8, 0.8, 0.8, 1);
    this.specular = new ColorAttr(0, 0, 0, 1);
    this.emissive = new ColorAttr(0, 0, 0, 1);
    this.glossiness = new NumberAttr(0);
    this.opacity = new NumberAttr(1);
    this.doubleSided = new BooleanAttr(false);
	
    this.color.addModifiedCB(Material_ColorModifiedCB, this);
    this.ambientLevel.addModifiedCB(Material_AmbientLevelModifiedCB, this);
    this.diffuseLevel.addModifiedCB(Material_DiffuseLevelModifiedCB, this);
    this.specularLevel.addModifiedCB(Material_SpecularLevelModifiedCB, this);
    this.emissiveLevel.addModifiedCB(Material_EmissiveLevelModifiedCB, this);
    this.ambient.addModifiedCB(Material_AmbientModifiedCB, this);
    this.diffuse.addModifiedCB(Material_DiffuseModifiedCB, this);
    this.specular.addModifiedCB(Material_SpecularModifiedCB, this);
    this.emissive.addModifiedCB(Material_EmissiveModifiedCB, this);
    this.glossiness.addModifiedCB(Material_GlossinessModifiedCB, this);
    this.opacity.addModifiedCB(Material_OpacityModifiedCB, this);
    this.doubleSided.addModifiedCB(Material_DoubleSidedModifiedCB, this);

    this.registerAttribute(this.color, "color");
    this.registerAttribute(this.ambientLevel, "ambientLevel");
    this.registerAttribute(this.diffuseLevel, "diffuseLevel");
    this.registerAttribute(this.specularLevel, "specularLevel");
    this.registerAttribute(this.emissiveLevel, "emissiveLevel");
    this.registerAttribute(this.ambient, "ambient");
    this.registerAttribute(this.diffuse, "diffuse");
    this.registerAttribute(this.specular, "specular");
    this.registerAttribute(this.emissive, "emissive");
    this.registerAttribute(this.glossiness, "glossiness");
    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.doubleSided, "doubleSided");
}

Material.prototype.update = function(params, visitChildren)
{
    if (this.updateColor)
    {
        this.updateColor = false;

        this.updateAmbientLevel = true;
        this.updateDiffuseLevel = true;
        this.updateSpecularLevel = true;
        this.updateEmissiveLevel = true;
    }

    if (this.updateAmbientLevel || this.updateDiffuseLevel || this.updateSpecularLevel || this.updateEmissiveLevel)
    {
        var color = this.color.getValueDirect();

        if (this.updateAmbientLevel)
        {
            this.updateAmbientLevel = false;
            
            var level = this.ambientLevel.getValueDirect();
            this.ambient.setValueDirect(color.r * level, color.g * level, color.b * level, color.a);
        }

        if (this.updateDiffuseLevel)
        {
            this.updateDiffuseLevel = false;
            
            var level = this.diffuseLevel.getValueDirect();
            this.diffuse.setValueDirect(color.r * level, color.g * level, color.b * level, color.a);
        }

        if (this.updateSpecularLevel)
        {
            this.updateSpecularLevel = false;
            
            var level = this.specularLevel.getValueDirect();
            this.specular.setValueDirect(color.r * level, color.g * level, color.b * level, color.a);
        }

        if (this.updateEmissiveLevel)
        {
            this.updateEmissiveLevel = false;
            
            var level = this.emissiveLevel.getValueDirect();
            this.emissive.setValueDirect(color.r * level, color.g * level, color.b * level, color.a);
        }
    }

    var opacity = this.opacity.getValueDirect();

    var forceUpdate = false;

    if (this.updateOpacity)
    {
        this.updateOpacity = false;
        
        this.lastOpacity = opacity;

        // have to re-update all members
        forceUpdate = true;
    }

    if (this.updateAmbient || forceUpdate)
    {
        this.updateAmbient = false;
        
        this.materialDesc.ambient.copy(this.ambient.getValueDirect());
        this.materialDesc.ambient.a *= opacity;
    }

    if (this.updateDiffuse || forceUpdate)
    {
        this.updateDiffuse = false;
        
        this.materialDesc.diffuse.copy(this.diffuse.getValueDirect());
        this.materialDesc.diffuse.a *= opacity;
    }

    if (this.updateSpecular || forceUpdate)
    {
        this.updateSpecular = false;
        
        this.materialDesc.specular.copy(this.specular.getValueDirect());
        this.materialDesc.specular.a *= opacity;
    }

    if (this.updateEmissive || forceUpdate)
    {
        this.updateEmissive = false;
        
        this.materialDesc.emissive.copy(this.emissive.getValueDirect());
        this.materialDesc.emissive.a *= opacity;
    }

    if (this.updateGlossiness || forceUpdate)
    {
        this.updateGlossiness = false;
        
        this.materialDesc.glossiness = this.glossiness.getValueDirect();
    }
    
    // call base-class implementation
    SGNode.prototype.update.call(this, params, visitChildren);
}

Material.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        SGNode.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    this.graphMgr.setCurrentMaterial(this);
    
    switch (directive)
    {
        case "render":
        {
            params.opacity = this.lastOpacity; // set in update()
            
            this.applyMaterialDesc();
        }
        break;
        
        case "rayPick":
        {
            params.doubleSided = this.lastDoubleSided;
            params.opacity = this.lastOpacity;
        }
        break;
    }
    
    // call base-class implementation
    SGNode.prototype.apply.call(this, directive, params, visitChildren);
}

Material.prototype.applyMaterialDesc = function()
{
    // set material
    this.graphMgr.renderContext.setFrontMaterial(this.materialDesc);
    
    // enable/disable backface culling
    var doubleSided = this.doubleSided.getValueDirect();
    this.lastDoubleSided = doubleSided;
    if (doubleSided)
    {
        this.graphMgr.renderContext.disable(eRenderMode.CullBackFace);
    }
    else // !doubleSided
    {
        this.graphMgr.renderContext.enable(eRenderMode.CullBackFace);
    }
}

function Material_ColorModifiedCB(attribute, container)
{
    container.updateColor = true;
    container.incrementModificationCount();
}

function Material_AmbientLevelModifiedCB(attribute, container)
{
    container.updateAmbientLevel = true;
    container.incrementModificationCount();
}

function Material_DiffuseLevelModifiedCB(attribute, container)
{
    container.updateDiffuseLevel = true;
    container.incrementModificationCount();
}

function Material_SpecularLevelModifiedCB(attribute, container)
{
    container.updateSpecularLevel = true;
    container.incrementModificationCount();
}

function Material_EmissiveLevelModifiedCB(attribute, container)
{
    container.updateEmissiveLevel = true;
    container.incrementModificationCount();
}

function Material_AmbientModifiedCB(attribute, container)
{
    container.updateAmbient = true;
    container.incrementModificationCount();
}
    
function Material_DiffuseModifiedCB(attribute, container)
{
    container.updateDiffuse = true;
    container.incrementModificationCount();
}
    
function Material_SpecularModifiedCB(attribute, container)
{
    container.updateSpecular = true;
    container.incrementModificationCount();
}
    
function Material_EmissiveModifiedCB(attribute, container)
{
    container.updateEmissive = true;
    container.incrementModificationCount();
}
    
function Material_GlossinessModifiedCB(attribute, container)
{
    container.updateGlosiness = true;
    container.incrementModificationCount();
}
    
function Material_OpacityModifiedCB(attribute, container)
{
    container.updateOpacity = true;
    container.incrementModificationCount();
}

function Material_DoubleSidedModifiedCB(attribute, container)
{
    container.incrementModificationCount();
}