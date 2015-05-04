Texture.prototype = new ParentableMotionElement();
Texture.prototype.constructor = Texture;

function Texture()
{
    ParentableMotionElement.call(this);
    this.className = "Texture";
    this.attrType = eAttrType.Texture;
   
    this.updateImage = false;
    this.updateMipmappingEnabled = false;
    this.setImage = false;
    this.imageSet = false;
    this.textureObj = null;
    this.pitch = 0;
    
    this.image = new ImageAttr(); 
    this.opacity = new NumberAttr(1);
    this.textureType = new NumberAttr(eTextureType.Color);
    this.widthWrap = new NumberAttr(eTextureWrap.None);
    this.heightWrap = new NumberAttr(eTextureWrap.None);
    this.mipmappingEnabled = new BooleanAttr(false);
    this.blendOp = new NumberAttr(RC_MODULATE);
    
    this.image.setTransient(true); // don't serialize image data
    
    this.image.getAttribute("width").addModifiedCB(Texture_ImageModifiedCB, this);
    this.image.getAttribute("height").addModifiedCB(Texture_ImageModifiedCB, this);
    this.image.getAttribute("byteAlignment").addModifiedCB(Texture_ImageModifiedCB, this);
    this.image.getAttribute("pixelFormat").addModifiedCB(Texture_ImageModifiedCB, this);
    this.image.getAttribute("pixels").addModifiedCB(Texture_ImagePixelsModifiedCB, this);
    this.textureType.addModifiedCB(Texture_TextureTypeModifiedCB, this);
    this.opacity.addModifiedCB(Texture_OpacityModifiedCB, this);
    this.widthWrap.addModifiedCB(Texture_WrapModifiedCB, this);
    this.heightWrap.addModifiedCB(Texture_WrapModifiedCB, this);
    this.mipmappingEnabled.addModifiedCB(Texture_MipmappingEnabledModifiedCB, this);

    this.registerAttribute(this.image, "image");
    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.textureType, "textureType");
    this.registerAttribute(this.widthWrap, "widthWrap");
    this.registerAttribute(this.heightWrap, "heightWrap");
    this.registerAttribute(this.mipmappingEnabled, "mipmappingEnabled");
    this.registerAttribute(this.blendOp, "blendOp");
}

Texture.prototype.setGraphMgr = function(graphMgr)
{
    // create texture object
    this.textureObj = graphMgr.renderContext.createTextureObject();
    
    // call base-class implementation
    ParentableMotionElement.prototype.setGraphMgr.call(this, graphMgr);
}

Texture.prototype.update = function(params, visitChildren)
{
    if (this.updateImage)
    {
        this.updateImage = false;

        this.setImage = true;
    }

    if (this.updateMipmappingEnabled)
    {
        // only reset image to use/not use mipmaps if image has been specified
        if (this.imageSet)
        {
            this.setImage = true;
            this.updateMipmappingEnabled = false;
        }
    }

    if (this.setImage)
    {
        this.setImage = !(this.SetImage());
    }

    // only call direct-base class implementation if position, rotation, or scale has been modified
    // (avoids unnecessary calculations for textures)
    if (this.updatePosition || this.updateRotation || this.updateScale)
    {
        ParentableMotionElement.prototype.update.call(this, params, visitChildren);
    }
    else
    {
        SGNode.prototype.update.call(this, params, visitChildren);
    }
}

Texture.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled_)
    {
        // call base-class implementation
        ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
        case "render":
            {
                // if texture is ready, add to texture array
                if (this.imageSet)
                {
                    var drawTextures = params.drawTextures && this.graphMgr.getDrawTextures();
                    if (drawTextures)
                    {
                        // TODO: if current projector object, add texture to projection texture array
                        var textures = this.graphMgr.textureArrayStack.top().textures;
                        var i = this.textureType.getValueDirect();
                        // Added this error handling when several scenes
                        // where textures[i] is undefined but have no
                        // idea why textures[i] is undefined - KMC
                        if (textures[i])
                        {
                            textures[i].push(this);
                        }
                    }
                }
                
            }
            break;
    }

    // call base-class implementation
    ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
}

Texture.prototype.SetImage = function()
{
    var width = this.image.width.getValueDirect();
    var height = this.image.height.getValueDirect();
    var pixelFormat = this.image.pixelFormat.getValueDirect();
    var pixels = this.image.pixels.getValueDirect();

    if (width == 0 ||
        height == 0 ||
        pixelFormat == ePixelFormat.Unknown ||
        pixels == null)
    {
        return false;
    }
    
    var imageFormat;
    switch (this.textureType.getValueDirect())
    {
        case eTextureType.Diffuse:
        case eTextureType.Luminosity:
        case eTextureType.Specularity:
        case eTextureType.Transparency:
            imageFormat = eImageFormat.Alpha;
            break;

        case eTextureType.Color:
        default:
            imageFormat = eImageFormat.RGBA;
            break;
    }

    this.textureObj.setImageData(width, height, pixelFormat, imageFormat, pixels);

    this.imageSet = true;
    
    return true;
}

function Texture_ImageModifiedCB(attribute, container)
{
    container.updateImage = true;
    container.setModified();
}

function Texture_ImagePixelsModifiedCB(attribute, container)
{
    container.updateImage = true;
    container.setModified();
}

function Texture_OpacityModifiedCB(attribute, container)
{
    container.setModified();
}

function Texture_TextureTypeModifiedCB(attribute, container)
{
    // update blendOp based upon type
    switch (attribute.getValueDirect())
    {
        case eTextureType.Color:
            op = RC_MODULATE;
            break;

        case eTextureType.Diffuse:
        case eTextureType.Luminosity:
        case eTextureType.Specularity:
            op = RC_REPLACE;
            break;

        case eTextureType.Transparency:
            op = RC_MODULATE;//BLEND;
            break;

        default:
            return;
    }
    
    container.blendOp.setValueDirect(op);
    container.setModified();
}

function Texture_WrapModifiedCB(attribute, container)
{
    container.setModified();
}

function Texture_MipmappingEnabledModifiedCB(attribute, container)
{
    container.updateMipmappingEnabled = true;
    container.setModified();
}