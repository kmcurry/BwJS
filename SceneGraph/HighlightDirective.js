function HighlightTarget()
{
    this.projMatrix = new Matrix4x4();
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.camera = null;
    this.viewport = new Viewport();
    this.geometries = new Array();
    this.center = new Vector3D();
    this.highlightColor_r = 0;
    this.highlightColor_g = 0;
    this.highlightColor_b = 0;
    this.highlightColor_a = 0;
    this.highlightWidth = 0;
};

HighlightParams.prototype = new DirectiveParams();
HighlightParams.prototype.constructor = HighlightParams();

function HighlightParams()
{
    DirectiveParams.call(this);

    this.projMatrix = new Matrix4x4();
    this.viewMatrix = new Matrix4x4();
    this.worldMatrix = new Matrix4x4();
    this.camera = null;
    this.viewport = new Viewport();
    this.targets = new Array();
}

HighlightDirective.prototype = new SGDirective();
HighlightDirective.prototype.constructor = HighlightDirective;

function HighlightDirective()
{
    SGDirective.call(this);
    this.className = "HighlightDirective";
    this.attrType = eAttrType.HighlightDirective;

    this.vertexBuffer = null;
    
    this.name.setValueDirect("HighlightDirective");
        
    this.highlightType = new NumberAttr(eHighlightType.None);
    this.highlightColor = new ColorAttr(1, 1, 0, 1);
    this.highlightWidth = new NumberAttr(5);
    
    this.highlightColor.addModifiedCB(HighlightDirective_HighlightColorModifiedCB, this);
    
    this.registerAttribute(this.highlightType, "highlightType");
    this.registerAttribute(this.highlightColor, "highlightColor");
    this.registerAttribute(this.highlightWidth, "highlightWidth");
}

HighlightDirective.prototype.setGraphMgr = function(graphMgr)
{
    // call base-class implementation
    SGDirective.prototype.setGraphMgr.call(this, graphMgr);
    
    this.initHighlightSquareVB();
}

HighlightDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();

    // setup collision Detect params structure
    var params = new HighlightParams();

    // get list of models for collision detection
    root.apply("highlight", params, true);
    
    // draw highlights
    this.drawHighlights(params);
}

HighlightDirective.prototype.drawHighlights = function(params)
{
    // if no targets, return
    if (params.targets.length == 0)
    {
        return;
    }

    // get render engine
    var renderContext = this.graphMgr.renderContext;
    if (!renderContext)
    {
        return;
    } 

    var highlightType = this.highlightType.getValueDirect();

    // for each target
    var up, right, forward;
    for (var i=0; i < params.targets.length; i++)
    {
        var target = params.targets[i];

        // get camera direction vectors
        var directions = target.camera.getDirectionVectors();
        up = directions.up;
        right = directions.right;
        forward = directions.forward;

        // get scaling factors from target's worldMatrix
        var scalingFactors = target.worldMatrix.getScalingFactors();
        var maxScalingFactor = max3(scalingFactors.x, scalingFactors.y, scalingFactors.z);
        
        var wupp = this.getWorldUnitsPerPixel(target.center, target.worldMatrix, target.viewMatrix, target.camera, target.viewport) / maxScalingFactor;
        var highlightWidth = target.highlightWidth * wupp;

        // clear stencil buffer
        renderContext.clearStencil(0);
        renderContext.clear(RC_STENCIL_BUFFER_BIT);

        // increment stencil for geometry in delta positions
        var worldViewMatrix;
        for (var j=0; j < target.geometries.length; j++)
        {
            switch (highlightType)
            {
            case eHighlightType.FourPass:
                {
                    for (var pass=0; pass < 4; pass++)
                    {
                        worldViewMatrix = this.getWorldViewMatrix(highlightType, highlightWidth, pass, up, right,
                            forward, target.worldMatrix, target.viewMatrix);
                        this.configureStencil_Target(renderContext, target.geometries[j], target.projMatrix, 
                            worldViewMatrix, eStencilOp.Increment);
                    }
                }
                break;

            case eHighlightType.EightPass:
                {
                    for (var pass=0; pass < 8; pass++)
                    {
                        worldViewMatrix = this.getWorldViewMatrix(highlightType, highlightWidth, pass, up, right,
                            forward, target.worldMatrix, target.viewMatrix);
                        this.configureStencil_Target(renderContext, target.geometries[j], target.projMatrix,
                            worldViewMatrix, eStencilOp.Increment);
                    }
                }
                break;
            }
        }

        // zero stencil for geometry in original position
        worldViewMatrix = target.worldMatrix.multiply(target.viewMatrix);
        for (var j=0; j < target.geometries.length; j++)
        {
            this.configureStencil_Target(renderContext, target.geometries[j], target.projMatrix, worldViewMatrix, eStencilOp.Zero);
        }

        // update highlight color
        this.highlightColor.setValueDirect(target.highlightColor_r, target.highlightColor_g, target.highlightColor_b, target.highlightColor_a);

        // render highlight square
        this.renderHighlightSquare(params, renderContext);
    } 
}

HighlightDirective.prototype.getWorldUnitsPerPixel = function(point, worldMatrix, viewMatrix, camera, viewport)
{
    // get geometry's center in view space
    var worldViewMatrix = worldMatrix.multiply(viewMatrix);
    var centerPtCamSpace = worldViewMatrix.transform(point.x, point.y, point.z, 1);

    // determine the per-pixel width and height at geometry's center in view space
    var perPixel = new Vector2D();
    
    // get camera node type
    switch (camera.attrType)
    {
    case eAttrType.PerspectiveCamera:
        {
            // get zoom
            var zoom = camera.getAttribute("zoom").getValueDirect();
            perPixel = worldUnitsPerPixelPersp(viewport, zoom, centerPtCamSpace.z);
        }
        break;

    case eAttrType.OrthographicCamera:
        {
            // get width
            var width = camera.getAttribute("width").getValueDirect();
            perPixel = worldUnitsPerPixelOrtho(viewport, width);
        }
        break;
        
    default:
        break;
    }
    
    return Math.max(perPixel.x, perPixel.y); 
}

HighlightDirective.prototype.getWorldViewMatrix = function(highlightType, highlightWidth, pass,
                                                           cameraUp, cameraRight, cameraForward,
                                                           world, view)
{
    var degrees = 0;
    switch (highlightType)
    {
    case eHighlightType.FourPass:  degrees = 90; break;
    case eHighlightType.EightPass: degrees = 45; break;
    }

    var rotate = new Matrix4x4();
    rotate.loadZAxisRotation(degrees * pass);
    var delta = rotate.transform(1, 0, 0, 0);
    delta.x *= highlightWidth;
    delta.y *= highlightWidth;
    delta.z *= highlightWidth;

    var translate = new Matrix4x4();
    translate.loadTranslation(cameraRight.x * delta.x + cameraUp.x * delta.y,// + cameraForward.x * delta.z, 
                              cameraRight.y * delta.x + cameraUp.y * delta.y,// + cameraForward.y * delta.z,
                              cameraRight.z * delta.x + cameraUp.z * delta.y);// + cameraForward.z * delta.z);

    return translate.multiply(world.multiply(view));
}

HighlightDirective.prototype.configureStencil_Target = function(renderContext,
                                                               geometry,
                                                               projMatrix,
                                                               worldViewMatrix,
                                                               stencilOp)
{
    // get current render states
    var lastDepthBufferWrite = renderContext.enabled(eRenderMode.DepthBufferWrite);
    var lastStencilTest = renderContext.enabled(eRenderMode.StencilTest);
    var lastAlphaBlend = renderContext.enabled(eRenderMode.AlphaBlend);

    // disable z-buffer writes (note: z-testing still occurs), and enable the
    // stencil-buffer
    renderContext.setEnabled(eRenderMode.DepthBufferWrite, false);
    renderContext.setEnabled(eRenderMode.StencilTest, true);

    // set depth function
    renderContext.setDepthFunc(eDepthFunc.LessEqual);

    // disable smooth shading
    renderContext.setShadeModel(eShadeModel.Flat);

    // set up stencil compare fuction, reference value, and masks.
    // stencil test passes if ((ref & mask) cmpfn (stencil & mask)) is true.
    renderContext.setStencilFunc(eStencilFunc.Always, 0, 0xFF);
    renderContext.setStencilMask(0xFF);

    // if depth-test passes, increment stencil buffer value
    renderContext.setStencilOp(eStencilOp.Keep, stencilOp, stencilOp);

    // make sure that no pixels get drawn to the frame buffer
    renderContext.setEnabled(eRenderMode.AlphaBlend, true);
    renderContext.setBlendFactor(RC_ZERO, RC_ONE);

    // draw geometry in stencil only
    renderContext.setMatrixMode(RC_PROJECTION);
    renderContext.pushMatrix();
    renderContext.loadMatrix(projMatrix);
    renderContext.applyProjectionTransform();
    renderContext.setMatrixMode(RC_MODELVIEW);
    renderContext.pushMatrix();
    renderContext.loadMatrix(worldViewMatrix);
    renderContext.applyModelViewTransform();
    geometry.drawPrimitives();
    renderContext.setMatrixMode(RC_PROJECTION);
    renderContext.popMatrix();
    renderContext.setMatrixMode(RC_MODELVIEW);
    renderContext.popMatrix();

    // restore render states
    renderContext.setEnabled(eRenderMode.DepthBufferWrite, lastDepthBufferWrite);
    renderContext.setEnabled(eRenderMode.StencilTest, lastStencilTest);
    renderContext.setDepthFunc(eDepthFunc.LessEqual);
    renderContext.setShadeModel(eShadeModel.Gouraud);
    renderContext.setEnabled(eRenderMode.AlphaBlend, lastAlphaBlend);
}
     
HighlightDirective.prototype.renderHighlightSquare = function(params, renderContext)
{
    // get current render states
    var lastDepthTest = renderContext.enabled(eRenderMode.DepthTest);
    var lastStencilTest = renderContext.enabled(eRenderMode.StencilTest);
    var lastAlphaBlend = renderContext.enabled(eRenderMode.AlphaBlend);
    var lastLighting = renderContext.enabled(eRenderMode.Lighting);

    // set render states
    renderContext.setDepthFunc(eDepthFunc.LessEqual);
    renderContext.setEnabled(eRenderMode.DepthTest, false);
    renderContext.setEnabled(eRenderMode.StencilTest, true);
    renderContext.setEnabled(eRenderMode.AlphaBlend, true);
    renderContext.setEnabled(eRenderMode.Lighting, false);
    renderContext.setBlendFactor(RC_SRC_ALPHA, RC_ONE_MINUS_SRC_ALPHA);

    // only write where stencil val <= 1 (count indicates # of target fragments that
    // overlap that pixel)
    renderContext.setStencilFunc(eStencilFunc.LessEqual, 1, 0xFF);
    renderContext.setStencilOp(eStencilOp.Keep, eStencilOp.Keep, eStencilOp.Keep); 

    // draw the highlight square
    var m = new Matrix4x4();
    m.loadIdentity();
    renderContext.setMatrixMode(RC_PROJECTION);
    renderContext.pushMatrix();
    renderContext.loadMatrix(m);
    renderContext.applyProjectionTransform();
    renderContext.setMatrixMode(RC_MODELVIEW);
    renderContext.pushMatrix();
    renderContext.loadMatrix(m);
    renderContext.applyModelViewTransform();
    this.vertexBuffer.draw();
    renderContext.popMatrix();
    renderContext.setMatrixMode(RC_PROJECTION);
    renderContext.popMatrix();

    // restore render states
    renderContext.setDepthFunc(eDepthFunc.LessEqual);
    renderContext.setEnabled(eRenderMode.DepthTest, lastDepthTest);
    renderContext.setEnabled(eRenderMode.StencilTest, lastStencilTest);
    renderContext.setEnabled(eRenderMode.AlphaBlend, lastAlphaBlend);
    renderContext.setEnabled(eRenderMode.Lighting, lastLighting);
    renderContext.setMatrixMode(RC_MODELVIEW);
}
                                      
HighlightDirective.prototype.initHighlightSquareVB = function()
{
    this.vertexBuffer = this.graphMgr.renderContext.createVertexBuffer(3);
    this.vertexBuffer.setPrimitiveType(RC_TRIANGLE_STRIP);
    
    var vertices = [ -1, -1,  1,
                     -1,  1,  1,
                      1, -1,  1,
                      1,  1,  1 ];

    var normals = [ 0,  0, -1,
                    0,  0, -1,
                    0,  0, -1,
                    0,  0, -1 ];
             
    var color = this.highlightColor.getValueDirect();       
    var colors = [ color.r, color.g, color.b, color.a,
                   color.r, color.g, color.b, color.a,
                   color.r, color.g, color.b, color.a,
                   color.r, color.g, color.b, color.a ];
                    
    this.vertexBuffer.setVertices(vertices);
    this.vertexBuffer.setNormals(normals);
    this.vertexBuffer.setColors(colors);
}

HighlightDirective.prototype.highlightColorModified = function()
{
    if (this.vertexBuffer)
    {
        var color = this.highlightColor.getValueDirect();       
        var colors = [ color.r, color.g, color.b, color.a,
                       color.r, color.g, color.b, color.a,
                       color.r, color.g, color.b, color.a,
                       color.r, color.g, color.b, color.a ];

        this.vertexBuffer.setColors(colors);
    }
}

function HighlightDirective_HighlightColorModifiedCB(attribute, container)
{
    container.highlightColorModified();
}
