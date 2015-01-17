ScreenRect.prototype = new TriList();
ScreenRect.prototype.constructor = ScreenRect;

function ScreenRect()
{
    TriList.call(this);
    this.className = "ScreenRect";
    this.attrType = eAttrType.ScreenRect;
    
    this.primitiveType = RC_TRIANGLE_STRIP;
    
    this.textureColorMask = new ColorAttr(0, 0, 0, 1);
    
    this.registerAttribute(this.textureColorMask, "textureColorMask");
    
    var vertices = 
    [
        -1, -1,  1,
        -1,  1,  1,
         1, -1,  1,
         1,  1,  1
    ];
    
    var normals =
    [
        0,  0,  -1,
        0,  0,  -1,
        0,  0,  -1,
        0,  0,  -1
    ];
    
    var colors =
    [
        1,  1,  1,  1,
        1,  1,  1,  1,
        1,  1,  1,  1,
        1,  1,  1,  1
    ];
    
    this.vertices.setValueDirect(vertices);
    this.normals.setValueDirect(normals);
    this.colors.setValueDirect(colors);
}

ScreenRect.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    TriList.prototype.update.call(this, params, visitChildren);
}

ScreenRect.prototype.draw = function(dissolve)
{
    // set projection matrix
    var m = new Matrix4x4();
    this.graphMgr.renderContext.setMatrixMode(RC_MODELVIEW);
    this.graphMgr.renderContext.pushMatrix();
    this.graphMgr.renderContext.loadMatrix(m);
    this.graphMgr.renderContext.applyModelViewTransform();
    this.graphMgr.renderContext.setMatrixMode(RC_PROJECTION);
    this.graphMgr.renderContext.pushMatrix();
    this.graphMgr.renderContext.loadMatrix(m);
    this.graphMgr.renderContext.applyProjectionTransform();
    
    this.graphMgr.renderContext.disable(eRenderMode.DepthTest);
    this.graphMgr.renderContext.disable(eRenderMode.DepthBufferWrite);
    this.graphMgr.renderContext.disable(eRenderMode.Lighting);
    
    var textureColorMask = this.textureColorMask.getValueDirect();
    this.graphMgr.renderContext.setTextureColorMask(textureColorMask.r, textureColorMask.g, textureColorMask.b, textureColorMask.a);
    
    // call base-class implementation
    TriList.prototype.draw.call(this, dissolve);
    
    // restore projection matrix
    this.graphMgr.renderContext.popMatrix();
    this.graphMgr.renderContext.applyProjectionTransform();
    this.graphMgr.renderContext.setMatrixMode(RC_MODELVIEW);
    this.graphMgr.renderContext.popMatrix();
    this.graphMgr.renderContext.applyModelViewTransform();
    
    this.graphMgr.renderContext.enable(eRenderMode.DepthTest);
    this.graphMgr.renderContext.enable(eRenderMode.DepthBufferWrite);
    this.graphMgr.renderContext.enable(eRenderMode.Lighting);
    
    // reset color mask that won't affect rendering
    this.graphMgr.renderContext.setTextureColorMask(2, 2, 2, 2);
}

ScreenRect.prototype.setTexture = function(texture)
{
    var uvs =
    [
        0, 0,
        0, 1,
        1, 0,
        1, 1
    ];
    
    var uvCoords = this.getUVCoords(texture); 
    uvCoords.setValueDirect(uvs);
}
