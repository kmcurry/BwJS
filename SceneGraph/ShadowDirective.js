ShadowParams.prototype = new DirectiveParams();
ShadowParams.prototype.constructor = ShadowParams();

function ShadowParams()
{
    DirectiveParams.call(this);
    
    this.worldMatrix = new Matrix4x4();
    this.dissolve = 0;
    this.opacity = 1;
    this.modelID = 0;
}

ShadowDirective.prototype = new SGDirective();
ShadowDirective.prototype.constructor = ShadowDirective;

function ShadowDirective()
{
    SGDirective.call(this);
    this.className = "ShadowDirective";
    this.attrType = eAttrType.ShadowDirective;

    this.program = null;
    this.shadowFBO = null;
    this.displayListObj = null;
    
    this.name.setValueDirect("ShadowDirective");
    
    this.casterWorldPosition = new Vector3DAttr(0, 0, 0);
    
    this.registerAttribute(this.casterWorldPosition, "casterWorldPosition");
}

ShadowDirective.prototype.setGraphMgr = function(graphMgr)
{
    this.program = graphMgr.renderContext.createProgram(pcf_shadow_mapping_depth_pass_vs, pcf_shadow_mapping_depth_pass_fs);
    this.shadowFBO = graphMgr.renderContext.createShadowFramebufferObject();
    this.displayListObj = new DisplayListObj(graphMgr.renderContext);
    
    // call base-class implementation
    SGDirective.prototype.setGraphMgr.call(this, graphMgr);
}

ShadowDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // get current shader program
    var program = this.graphMgr.renderContext.getProgram();

    // get current display list (if any)
    var lastDisplayListObj = this.graphMgr.renderContext.getDisplayList();
    
    // get current viewport and clear color
    var viewport = this.graphMgr.renderContext.getViewport();
    var clearColor = this.graphMgr.renderContext.getClearColor();

    // set shader program
    this.graphMgr.renderContext.useProgram(this.program);
    
    // set projection
    var fovyRadians = toRadians(90);
    var height = 1024;
    var width = 1024;
    var near = 1;
    var far = 100;
    
    var top = Math.tan(fovyRadians / 2) * near;
    var bottom = -top;
    var right = top * (width / height);
    var left = -right;
   
    var projectionMatrix = this.graphMgr.renderContext.perspectiveMatrixLH(left, right,
        top, bottom, near, far);
    
    this.graphMgr.renderContext.setMatrixMode(RC_PROJECTION);
    this.graphMgr.renderContext.pushMatrix();
    this.graphMgr.renderContext.loadMatrix(projectionMatrix);
    this.graphMgr.renderContext.applyProjectionTransform();
    
    // TODO: make configurable
    worldPos = this.casterWorldPosition.getValueDirect();
    this.graphMgr.renderContext.setShadowCasterWorldPosition(worldPos.x, worldPos.y, worldPos.z);
    
    // set view
    var translationMatrix = new Matrix4x4();
    translationMatrix.loadTranslation(worldPos.x, worldPos.y, worldPos.z); // TODO
    
    var rotationMatrix = new Matrix4x4();
    rotationMatrix.loadYAxisRotation(90);
    
    var viewMatrix = rotationMatrix.multiply(translationMatrix);
    viewMatrix.invert();
    
    this.graphMgr.renderContext.setMatrixMode(RC_VIEW);
    this.graphMgr.renderContext.pushMatrix();
    this.graphMgr.renderContext.loadMatrix(viewMatrix);
    this.graphMgr.renderContext.applyViewTransform();
    
    // bind the first face of the shadow fbo to the framebuffer
    this.shadowFBO.bindForWriting(eCubeMapFace.Positive_X);
    
    // set this display list to render context    
    this.graphMgr.renderContext.setDisplayList(this.displayListObj);
    
    // begin recording
    this.displayListObj.record_begin();
    
    // draw
    var params = new ShadowParams();
    root.apply("shadow", params, true);
    
    // stop recording
    this.displayListObj.record_end();
    
    // bind subsequent faces of the shadow fbo to the framebuffer and draw
    for (var i = 1; i < 6; i++)
    {
        // bind the face of the shadow fbo to the framebuffer
        this.shadowFBO.bindForWriting(eCubeMapFace.Positive_X + i);
        
        // set view
        switch (eCubeMapFace.Positive_X + i)
        {
            case eCubeMapFace.Negative_X: rotationMatrix.loadYAxisRotation(-90); break;
            case eCubeMapFace.Positive_Y: rotationMatrix.loadXAxisRotation(90); break;
            case eCubeMapFace.Negative_Y: rotationMatrix.loadXAxisRotation(-90); break;
            case eCubeMapFace.Positive_Z: rotationMatrix.loadYAxisRotation(0); break;
            case eCubeMapFace.Negative_Z: rotationMatrix.loadYAxisRotation(180); break;
        }
        viewMatrix = rotationMatrix.multiply(translationMatrix);
        viewMatrix.invert();
        this.graphMgr.renderContext.setMatrixMode(RC_VIEW);
        this.graphMgr.renderContext.loadMatrix(viewMatrix);
        this.graphMgr.renderContext.applyViewTransform();
        
        // draw
        this.displayListObj.play();
    }
    
    // restore previous projection
    this.graphMgr.renderContext.setMatrixMode(RC_PROJECTION);
    this.graphMgr.renderContext.popMatrix();
    this.graphMgr.renderContext.applyProjectionTransform();
    
    // restore previous view
    this.graphMgr.renderContext.setMatrixMode(RC_VIEW);
    this.graphMgr.renderContext.popMatrix();
    this.graphMgr.renderContext.applyViewTransform();
    
    // restore last display list (if any)
    this.graphMgr.renderContext.setDisplayList(lastDisplayListObj);
    
    // restore last viewport and clear color
    this.graphMgr.renderContext.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
    this.graphMgr.renderContext.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
    
    // restore last shader program
    this.graphMgr.renderContext.useProgram(program);
    
    this.graphMgr.renderContext.setShadowCasterWorldPosition(worldPos.x, worldPos.y, worldPos.z);
    
    // unbind the shadow fbo from the framebuffer and bind for reading by the render pass
    this.shadowFBO.bindForReading();
}