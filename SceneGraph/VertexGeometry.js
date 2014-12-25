VertexGeometry.prototype = new Geometry();
VertexGeometry.prototype.constructor = VertexGeometry;

function VertexGeometry()
{
    Geometry.call(this);
    this.className = "VertexGeometry";
    this.attrType = eAttrType.VertexGeometry;

    this.updateVertices = false;
    this.updateColors = false;
    this.updateUVCoords = [];
    this.uvCoords = [];
    this.vertexBuffer = null;
    
    this.vertices = new NumberArrayAttr();
    this.colors = new NumberArrayAttr();
    
    this.vertices.addModifiedCB(VertexGeometry_VerticesModifiedCB, this);
    this.colors.addModifiedCB(VertexGeometry_ColorsModifiedCB, this);
    
    this.registerAttribute(this.vertices, "vertices");
    this.registerAttribute(this.colors, "colors");
}

VertexGeometry.prototype.postCloneChild = function(childClone,pathSrc,pathClone)
{
    var i;
    var node;

    // setup uv-coords for cloned vertex geometry

    // find texture nodes affecting this node
    var textureNodes;
    for (i=0; i < pathSrc.length(); i++)
    {
        node = pathSrc.stack[i];
        if (node.getAttribute() == eAttrType.Texture)
        {
            if (!(textureNodes.push(node))) return;
        }
    }

    // find texture nodes affecting the clone
    var textureNodesClone;
    for (i=0; i < pathClone.length(); i++)
    {
        node = pathClone.stack[i];
        if (node.getAttribute() == eAttrType.Texture)
        {
            if (!(textureNodesClone.push(node))) return;
        }
    }

    // for each texture node, setup the uv-coords (textureNodes.size() and
    // textureNodesClone.size() should be the same, but check anyway)
   // CFloatArrayAttr* uvCoords = null;
    var uvCoords = new NumberArrayAttr();

    for (i=0; i < textureNodes.size() && i < textureNodesClone.size(); i++)
    {
        //uvCoords = FindUVCoords(dynamic_cast<GcTexture*>(textureNodes[i]));
        uvCoords = this.findUVCoords(textureNodes[i]);

        if (uvCoords)
        {
            var uvCoords2 = new NumberArrayAttr();
            uvCoords2 = childClone.getUVCoords(textureNodesClone[i]);
            uvCoords2.copyValue(uvCoords);
        }
    }

    // call base-class implementation
    //GcSGNode::Post_Clone_Child(childClone, pathSrc, pathClone); Not being used right now. Maybe used in the futrue.
}


VertexGeometry.prototype.getUVCoords = function(texture)
{
    for (var i=0; i < this.uvCoords.length; i++)
    {
        if (this.uvCoords[i].first == texture)
            return this.uvCoords[i].second;
    }       
    
    var uvCoords = new NumberArrayAttr();
    uvCoords.addModifiedCB(VertexGeometry_UVCoordsModifiedCB, this);
    this.uvCoords.push(new Pair(texture, uvCoords));
    
    return uvCoords;
}
VertexGeometry.prototype.findUVCoords = function(texture)
{
    if (!texture)
    {
        return null;
    }

    for (var i=0; i < this.uvCoords.length; i++)
    {
        if (this.uvCoords[i].first == texture)
            return this.uvCoords[i].second;
    }

    return null;
}

VertexGeometry.prototype.update = function(params, visitChildren)
{
    if (this.updateVertices)
    {
        this.updateVertices = false;
        
        this.vertexBuffer.setVertices(this.vertices.getValueDirect());
        
        this.updateBoundingTree = true;
        
        this.calculateBBox();
    }
    
    if (this.updateColors)
    {
        this.updateColors = false;
        
        this.vertexBuffer.setColors(this.colors.getValueDirect());    
    }
    
    if (this.updateUVCoords.length)
    {
        for (var i=0; i < this.updateUVCoords.length; i++)
        {
            for (var j=0; j < this.uvCoords.length; j++)
            {
                if (this.uvCoords[j].second == this.updateUVCoords[i])
                {
                    this.vertexBuffer.setUVCoords(this.uvCoords[j].first.textureObj, this.uvCoords[j].second.getValueDirect());
                    break;
                }
            }   
        }
        this.updateUVCoords.length = 0;
    }
    
    // call base-class implementation
    Geometry.prototype.update.call(this, params, visitChildren);
}

VertexGeometry.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        Geometry.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    switch (directive)
    {
        case "render":
            {
            }
            break;
    }
    
    // call base-class implementation
    Geometry.prototype.apply.call(this, directive, params, visitChildren);
}

VertexGeometry.prototype.drawTextured = function(dissolve)
{
    var texture0 = null;
    var texture1 = null;

    // enable blending
    this.graphMgr.renderContext.enable(eRenderMode.AlphaBlend);

    // set blend factors
    this.graphMgr.renderContext.setBlendFactor(RC_SRC_ALPHA, RC_ONE_MINUS_SRC_ALPHA);

    // get number of texture stages
    var maxStages = this.graphMgr.renderContext.getMaxTextureStages();

    // get texture array
    var textureArray = this.graphMgr.textureArrayStack.top();

    // get current material node component levels
    var ambientLevel = 1;
    var diffuseLevel = 1;
    var specularLevel = 1;
    var emissiveLevel = 1;
    var material = this.graphMgr.getCurrentMaterial();
    if (material)
    {
        ambientLevel = material.getAttribute("ambientLevel").getValueDirect();
        diffuseLevel = material.getAttribute("diffuseLevel").getValueDirect();
        specularLevel = material.getAttribute("specularLevel").getValueDirect();
        emissiveLevel = material.getAttribute("emissiveLevel").getValueDirect();
    }

    // get current material
    var currMatDesc = this.graphMgr.renderContext.getFrontMaterial();

    // push current material
    this.graphMgr.renderState.push(RENDERSTATE_MATERIAL_BIT);

    // if non-zero dissolve, set to material
    if (dissolve > 0)
    {
        currMatDesc.ambient.a *= (1 - dissolve);
        currMatDesc.diffuse.a *= (1 - dissolve);
        currMatDesc.specular.a *= (1 - dissolve);
        currMatDesc.emissive.a *= (1 - dissolve);
        this.graphMgr.renderContext.setFrontMaterial(currMatDesc);
    }

    // if transparency texture, set to stage 0
    if (textureArray.textures[eTextureType.Transparency].length)
    {
        var texture = textureArray.textures[eTextureType.Transparency][0];
        var uvCoords = this.getUVCoords(texture);

        if (uvCoords && uvCoords.getLength() > 0)
        {
            // lock texture (keep it from being modified)
            //texture->Lock();

            this.setTextureStage(0, eTextureType.Transparency, texture, texture.transformCompound);
            texture0 = texture;
        }

        // disable stage 1
        if (maxStages > 1)
        {
            this.graphMgr.renderContext.enableTextureStage(1, 0);
            texture1 = null;
        }
    }

    // if color texture, set material for blending
    if (textureArray.textures[eTextureType.Color].length)
    {
        this.setBlendingMaterial(textureArray.textures[eTextureType.Color][0].getAttribute("opacity").getValueDirect(),
        ambientLevel, diffuseLevel, specularLevel, emissiveLevel);
    }

    // set texture blend factor
    this.graphMgr.renderContext.setTextureBlendFactor(currMatDesc.diffuse.a * (1 - dissolve));

    // draw untextured if no color texture is present, or if color texture's opacity < 1
    if (textureArray.textures[eTextureType.Color].length == 0 ||
        textureArray.textures[eTextureType.Color][0].getAttribute("opacity").getValueDirect() < 1)
    {
        this.vertexBuffer.draw();
    }

    if (texture0)
    {
        this.graphMgr.renderContext.enableTextureStage(0, 0);
        //texture0->Unlock();
        texture0 = null;
    }
    if (texture1)
    {
        this.graphMgr.renderContext.enableTextureStage(1, 0);
        //texture1->Unlock();
        texture1 = null;
    }
    
    // draw color texture(s)
    for (var i = 0; i < textureArray.textures[eTextureType.Color].length; i++)
    {
        var texture = textureArray.textures[eTextureType.Color][i];
        var uvCoords = this.getUVCoords(texture);

        if (uvCoords && uvCoords.getLength() > 0)
        {
            // lock texture (keep it from being modified)
            //texture->Lock();

            this.setTextureStage(0, eTextureType.Color, texture, texture.transformCompound);
            texture0 = texture;

            // set material for blending
            this.setBlendingMaterial(texture.getAttribute("opacity").getValueDirect(),
            ambientLevel, diffuseLevel, specularLevel, emissiveLevel);

            // set texture blend factor
            this.graphMgr.renderContext.setTextureBlendFactor(currMatDesc.diffuse.a * (1 - dissolve) * texture.getAttribute("opacity").getValueDirect());
        }

        // if transparency texture, and maxStages > 1, set to stage 1
        if (maxStages > 1)
        {
            if (textureArray.textures[eTextureType.Transparency].length)
            {
                texture = textureArray.textures[eTextureType.Transparency][0];
                uvCoords = this.getUVCoords(texture);

                if (uvCoords && uvCoords.getLength() > 0)
                {
                    // lock texture (keep it from being modified)
                    //texture->Lock();

                    this.setTextureStage(1, eTextureType.Transparency, texture, texture.transformCompound);
                    texture1 = texture;
                }
            }
        }

        // draw primitives
        this.vertexBuffer.draw();

        if (texture0)
        {
            this.graphMgr.renderContext.enableTextureStage(0, 0);
            //texture0->Unlock();
            texture0 = null;
        }
        if (texture1)
        {
            this.graphMgr.renderContext.enableTextureStage(1, 0);
            //texture1->Unlock();
            texture1 = null;
        }
    }

    // TODO
    /*
    // if object doesn't contain any specularity textures,
    // make an additional pass to add specular highlights;
    // skip this step if fog is enabled (causes ultra-white surface artifacts)
    var numSpecularityTextures = textureArray.textures[eTextureType.Specularity].length;
    // TODO: + m_graphMgr->GetProjectionTextureStack().top().textures[GeTextureType_Color].size();

    if (numSpecularityTextures == 0 &&
        specularLevel > 0) // TODO: && !renderEngine->IsRenderModeEnabled(Re_Fog)
    {
        this.setSpecularMaterial(currMatDesc.specular, currMatDesc.glossiness);
        this.graphMgr.renderContext.setBlendFactor(RC_ONE, RC_ONE);
        
        // if transparency texture, set to stage 0
        if (textureArray.textures[eTextureType.Transparency].length)
        {
            var texture = textureArray.textures[eTextureType.Transparency][0];
            var uvCoords = this.getUVCoords(texture);

            if (uvCoords && uvCoords.getLength() > 0)
            {
                // lock texture (keep it from being modified)
                //texture->Lock();

                this.setTextureStage(0, eTextureType.Transparency, texture, texture.transformCompound);
                texture0 = texture;
            }

            // disable stage 1
            if (maxStages > 1)
            {
                this.graphMgr.renderContext.enableTextureStage(1, 0);
                texture1 = null;
            }
        }
        
        // draw primitives
        this.vertexBuffer.draw();
        
        if (texture0)
        {
            this.graphMgr.renderContext.enableTextureStage(0, 0);
            //texture0->Unlock();
            texture0 = null;
        }
    }
    */
    // disable texture stage 0, 1
    this.graphMgr.renderContext.enableTextureStage(0, 0);
    this.graphMgr.renderContext.enableTextureStage(1, 0);
    
    // disable blending
    this.graphMgr.renderContext.disable(eRenderMode.AlphaBlend);

    // pop current material
    this.graphMgr.renderState.pop(RENDERSTATE_MATERIAL_BIT);
}

VertexGeometry.prototype.drawPrimitives = function()
{
    this.vertexBuffer.draw();
}

VertexGeometry.prototype.setTextureStage = function(stage, type, texture, textureTransform, 
                                                    textureCoordSrc, planeCoefficients)
{
    // get optional parameters
    textureTransform = textureTransform || new Matrix4x4();
    textureCoordSrc = textureCoordSrc || eTextureCoordSrc.VertexUVs;
    planeCoefficients = planeCoefficients ||  new Matrix4x4();   
    
    // enable texture stage
    this.graphMgr.renderContext.enableTextureStage(stage, 1);

    // get texture wrap
    var widthWrap = texture.getAttribute("widthWrap").getValueDirect();
    var heightWrap = texture.getAttribute("heightWrap").getValueDirect();
    var widthWrapType, heightWrapType;
    switch (widthWrap)
    {
        case eTextureWrap.Clamp:
            widthWrapType = RC_CLAMP_TO_EDGE;
            break;

        case eTextureWrap.Repeat:
        default:
            widthWrapType = RC_REPEAT;
            break;
    }
    switch (heightWrap)
    {
        case eTextureWrap.Clamp:
            heightWrapType = RC_CLAMP_TO_EDGE;
            break;

        case eTextureWrap.Repeat:
        default:
            heightWrapType = RC_REPEAT;
            break;
    }
    
    // set texture
    this.vertexBuffer.setTextureStage(stage, texture.textureObj, 
    widthWrapType, heightWrapType, textureCoordSrc, planeCoefficients);

    // set texture blend operation
    this.graphMgr.renderContext.setTextureBlendOp(texture.blendOp.getValueDirect());

    /* TODO
    // set texture matrix
    // TODO: only load texture transforms if they are enabled
    ReMatrixMode mode;
    switch (stage)
    {
    case 0: mode = ReMatrixMode_Texture0; break;
    case 1: mode = ReMatrixMode_Texture1; break;
    case 2: mode = ReMatrixMode_Texture2; break;
    case 3: mode = ReMatrixMode_Texture3; break;
    case 4: mode = ReMatrixMode_Texture4; break;
    case 5: mode = ReMatrixMode_Texture5; break;
    case 6: mode = ReMatrixMode_Texture6; break;
    case 7: mode = ReMatrixMode_Texture7; break;
    }
    this.graphMgr.renderContext.SetMatrixMode(mode);
    this.graphMgr.renderContext.LoadMatrix(textureTransform);
    
    this.graphMgr.renderContext.SetMatrixMode(ReMatrixMode_WorldView);
     */
}

VertexGeometry.prototype.setBlendingMaterial = function(opacity, ambientLevel, diffuseLevel, 
specularLevel, emissiveLevel)
{
    var matDesc = this.graphMgr.renderContext.getFrontMaterial();
    
    // setup material for texture blending operations
    var ambientBlend  = opacity * ambientLevel;
    var diffuseBlend  = opacity * diffuseLevel;
    var specularBlend = opacity * specularLevel;
    var emissiveBlend = opacity * emissiveLevel;

    // ambient
    matDesc.ambient.r = ambientBlend + matDesc.ambient.r * (1-opacity);
    matDesc.ambient.g = ambientBlend + matDesc.ambient.g * (1-opacity);
    matDesc.ambient.b = ambientBlend + matDesc.ambient.b * (1-opacity);
    //matDesc.ambient.a *= opacity;
    
    // diffuse
    matDesc.diffuse.r = diffuseBlend + matDesc.diffuse.r * (1-opacity);
    matDesc.diffuse.g = diffuseBlend + matDesc.diffuse.g * (1-opacity);
    matDesc.diffuse.b = diffuseBlend + matDesc.diffuse.b * (1-opacity);
    //matDesc.diffuse.a *= opacity;

    // specular (turn off)
    matDesc.specular.r = 0;//specularBlend + matDesc.specular.r * (1-opacity);
    matDesc.specular.g = 0;//specularBlend + matDesc.specular.g * (1-opacity);
    matDesc.specular.b = 0;//specularBlend + matDesc.specular.b * (1-opacity);
    //matDesc.specular.a *= opacity;
    matDesc.glossiness = 1;//matDesc.glossiness;

    // emissive
    matDesc.emissive.r = emissiveBlend + matDesc.emissive.r * (1-opacity);
    matDesc.emissive.g = emissiveBlend + matDesc.emissive.g * (1-opacity);
    matDesc.emissive.b = emissiveBlend + matDesc.emissive.b * (1-opacity);
    //matDesc.emissive.a *= opacity;
    
    matDesc.validMembersMask = MATERIALDESC_ALL_BITS;

    this.graphMgr.renderContext.setFrontMaterial(matDesc);
}

VertexGeometry.prototype.setSpecularMaterial = function(specular, glossiness)
{
    var matDesc = new MaterialDesc();
    matDesc.validMembersMask = MATERIALDESC_ALL_BITS;
    matDesc.specular = specular;
    matDesc.glossiness = glossiness;

    this.graphMgr.renderContext.setFrontMaterial(matDesc);
    this.graphMgr.renderContext.setBlendFactor(RC_ONE_MINUS_SRC_ALPHA, RC_ONE);
}

VertexGeometry.prototype.calculateBBox = function()
{
    var vertices = this.vertices.getValueDirect();
    if (vertices.length < 3) return;
    
    var min = new Vector3D(vertices[0], vertices[1], vertices[2]);
    var max = new Vector3D(vertices[0], vertices[1], vertices[2]);
    
    for (var i=3; i < vertices.length; i+=3)
    {
        min.x = Math.min(min.x, vertices[i  ]);
        min.y = Math.min(min.y, vertices[i+1]);
        min.z = Math.min(min.z, vertices[i+2]);

        max.x = Math.max(max.x, vertices[i  ]);
        max.y = Math.max(max.y, vertices[i+1]);
        max.z = Math.max(max.z, vertices[i+2]);
    }

    this.bbox.getAttribute("min").setValueDirect(min.x, min.y, min.z);
    this.bbox.getAttribute("max").setValueDirect(max.x, max.y, max.z);
}

function VertexGeometry_VerticesModifiedCB(attribute, container)
{
    container.updateVertices = true;
    container.incrementModificationCount();
}

function VertexGeometry_ColorsModifiedCB(attribute, container)
{
    container.updateColors = true;
    container.incrementModificationCount();
}

function VertexGeometry_UVCoordsModifiedCB(attribute, container)
{
    container.updateUVCoords.push(attribute);
    container.incrementModificationCount();
}