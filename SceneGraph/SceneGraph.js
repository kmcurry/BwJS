// TODO: consider moving to a more appropriate file
function TextureArray(textureArray)
{
    this.textures = new Array(eTextureType.EnumCount);

    for (var i=0; i < this.textures.length; i++)
    {
        if (textureArray)
        {
            this.textures[i] = textureArray.textures[i].slice();
        }
        else
        {
            this.textures[i] = [];
        }
    }
}

