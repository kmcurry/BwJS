Surface.prototype = new Isolator();
Surface.prototype.constructor = Surface;

function Surface()
{
    Isolator.call(this);
    this.className = "Surface";
    this.attrType = eAttrType.Surface;
    
    this.color = new ColorAttr(1, 1, 1, 1);
    this.ambientLevel = new NumberAttr(1);
    this.diffuseLevel = new NumberAttr(1);
    this.specularLevel = new NumberAttr(1);
    this.emissiveLevel = new NumberAttr(0);
    this.ambient = new ColorAttr(0.8, 0.8, 0.8, 1);
    this.diffuse = new ColorAttr(0.2, 0.2, 0.2, 1);
    this.specular = new ColorAttr(0, 0, 0, 1);
    this.emissive = new ColorAttr(0, 0, 0, 1);
    this.glossiness = new NumberAttr(0);
    this.opacity = new NumberAttr(1);
    this.doubleSided = new BooleanAttr(false);
    this.texturesEnabled = new BooleanAttr(true);
    this.colorTexturesPresent = new BooleanAttr(true);
    this.diffuseTexturesPresent = new BooleanAttr(true);
    this.luminosityTexturesPresent = new BooleanAttr(true);
    this.specularityTexturesPresent = new BooleanAttr(true);
    this.transparencyTexturesPresent = new BooleanAttr(true);
    this.numColorTextures = new NumberAttr(0);
    this.numDiffuseTextures = new NumberAttr(0);
    this.numLuminosityTextures = new NumberAttr(0);
    this.numSpecularityTextures = new NumberAttr(0);
    this.numTransparencyTextures = new NumberAttr(0);
    
    this.colorTexturesPresent.addModifiedCB(Surface_TexturesPresentModifiedCB, this);
    this.diffuseTexturesPresent.addModifiedCB(Surface_TexturesPresentModifiedCB, this);
    this.luminosityTexturesPresent.addModifiedCB(Surface_TexturesPresentModifiedCB, this);
    this.specularityTexturesPresent.addModifiedCB(Surface_TexturesPresentModifiedCB, this);
    this.transparencyTexturesPresent.addModifiedCB(Surface_TexturesPresentModifiedCB, this);

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
    this.registerAttribute(this.texturesEnabled, "texturesEnabled");
    this.registerAttribute(this.colorTexturesPresent, "colorTexturesPresent");
    this.registerAttribute(this.diffuseTexturesPresent, "diffuseTexturesPresent");
    this.registerAttribute(this.luminosityTexturesPresent, "luminosityTexturesPresent");
    this.registerAttribute(this.specularityTexturesPresent, "specularityTexturesPresent");
    this.registerAttribute(this.transparencyTexturesPresent, "transparencyTexturesPresent");
    this.registerAttribute(this.numColorTextures, "numColorTextures");
    this.registerAttribute(this.numDiffuseTextures, "numDiffuseTextures");
    this.registerAttribute(this.numLuminosityTextures, "numLuminosityTextures");
    this.registerAttribute(this.numSpecularityTextures, "numSpecularityTextures");
    this.registerAttribute(this.numTransparencyTextures, "numTransparencyTextures");

    this.isolateTextures.setValueDirect(true);

    this.materialNode = new Material();
    this.materialNode.getAttribute("name").setValueDirect("Material");
    this.addChild(this.materialNode);

    this.colorTexturesNode = new Group();
    this.colorTexturesNode.getAttribute("name").setValueDirect("Color Textures");
    this.addChild(this.colorTexturesNode);

    this.diffuseTexturesNode = new Group();
    this.diffuseTexturesNode.getAttribute("name").setValueDirect("Diffuse Textures");
    this.addChild(this.diffuseTexturesNode);

    this.luminosityTexturesNode = new Group();
    this.luminosityTexturesNode.getAttribute("name").setValueDirect("Luminosity Textures");
    this.addChild(this.luminosityTexturesNode);

    this.specularityTexturesNode = new Group();
    this.specularityTexturesNode.getAttribute("name").setValueDirect("Specularity Textures");
    this.addChild(this.specularityTexturesNode);

    this.transparencyTexturesNode = new Group();
    this.transparencyTexturesNode.getAttribute("name").setValueDirect("Transparency Textures");
    this.addChild(this.transparencyTexturesNode);

    this.connectMaterialAttributes(this.materialNode);
}

Surface.prototype.setGraphMgr = function(graphMgr)
{
    this.materialNode.setGraphMgr(graphMgr);
    this.colorTexturesNode.setGraphMgr(graphMgr);
    this.diffuseTexturesNode.setGraphMgr(graphMgr);
    this.luminosityTexturesNode.setGraphMgr(graphMgr);
    this.specularityTexturesNode.setGraphMgr(graphMgr);
    this.transparencyTexturesNode.setGraphMgr(graphMgr);
    
    // call base-class implementation
    Isolator.prototype.setGraphMgr.call(this, graphMgr);
}

Surface.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    Isolator.prototype.update.call(this, params, visitChildren);
}

Surface.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class implementation
    Isolator.prototype.apply.call(this, directive, params, visitChildren);
}

Surface.prototype.connectMaterialAttributes = function(material)
{
    this.connectMaterialAttribute(material, this.color, "color");
    this.connectMaterialAttribute(material, this.ambientLevel, "ambientLevel");
    this.connectMaterialAttribute(material, this.diffuseLevel, "diffuseLevel");
    this.connectMaterialAttribute(material, this.specularLevel, "specularLevel");
    this.connectMaterialAttribute(material, this.emissiveLevel, "emissiveLevel");
    this.connectMaterialAttribute(material, this.ambient, "ambient");
    this.connectMaterialAttribute(material, this.diffuse, "diffuse");
    this.connectMaterialAttribute(material, this.specular, "specular");
    this.connectMaterialAttribute(material, this.emissive, "emissive");
    this.connectMaterialAttribute(material, this.glossiness, "glossiness");
    this.connectMaterialAttribute(material, this.opacity, "opacity");
    this.connectMaterialAttribute(material, this.doubleSided, "doubleSided");
}

Surface.prototype.connectMaterialAttribute = function(material, attribute, name)
{
    var modified = this.getAttributeModificationCount(attribute) > 0 ? true : false;
    attribute.addTarget(material.getAttribute(name), eAttrSetOp.Replace, null, modified);
}

Surface.prototype.addTexture = function(texture)
{
    // TODO
    this.colorTexturesNode.addChild(texture);
}

function Surface_TexturesPresentModifiedCB(attribute, container)
{
}