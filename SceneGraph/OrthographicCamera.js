OrthographicCamera.prototype = new Camera();
OrthographicCamera.prototype.constructor = OrthographicCamera;

function OrthographicCamera()
{
    Camera.call(this);
    this.className = "OrthographicCamera";
    this.attrType = eAttrType.OrthographicCamera;
    
    this.updateWidth = false;
    
    this.width = new NumberAttr(2);
    
    this.width.addModifiedCB(OrthographicCamera_WidthModifiedCB, this);
    
    this.registerAttribute(this.width, "width");
}

OrthographicCamera.prototype.update = function(params, visitChildren)
{
    if (this.updateWidth)
    {
        this.updateWidth = false;

        this.updateClipPlanes = true;
    }
    
    // call base-class implementation
    Camera.prototype.update.call(this, params, visitChildren);
}

OrthographicCamera.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled_)
    {
        // call base-class implementation
        Camera.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    switch (directive)
    {
    case "render":
        {
            if (!this.viewport.equals(params.viewport))
            {
                this.viewport = params.viewport;
                this.updateClipPlanes = true;  
            }
            
            if (this.updateClipPlanes)
            {
                this.updateClipPlanes = false;
                
                this.setClipPlanes();
            }
            
            params.viewVolume.setOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
            
            this.applyOrthographicTransform();
        }
        break;
    }
    
    // call base-class implementation
    Camera.prototype.apply.call(this, directive, params, visitChildren);
}

OrthographicCamera.prototype.setClipPlanes = function()
{
    var width = this.width.getValueDirect();
    var height = width * this.viewport.height / this.viewport.width;
    
    this.top = height / 2;
    this.bottom = -this.top;
    this.right = width / 2;
    this.left = -this.right;
    
    this.projectionMatrix.loadMatrix(this.graphMgr.renderContext.orthographicMatrixLH(this.left, this.right,
        this.top, this.bottom, this.near, this.far));
        
    // update view-volume attribute
    var viewVolume = new ViewVolume();
    viewVolume.setOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
    this.viewVolume.setValueDirect(viewVolume.left, viewVolume.right, viewVolume.top, viewVolume.bottom,
        viewVolume.near, viewVolume.far);    
}

OrthographicCamera.prototype.applyOrthographicTransform = function()
{
    this.graphMgr.renderContext.projectionMatrixStack.top().loadMatrix(this.projectionMatrix);
    this.graphMgr.renderContext.applyProjectionTransform();
}

OrthographicCamera.prototype.getViewSpaceRay = function(viewport, clickPoint)
{
    // normalize click coordinates so they span [-1, 1] on each axis
    var normX =  ((clickPoint.x - viewport.x) / viewport.width  * 2 - 1);
    var normY = -((clickPoint.y - viewport.y) / viewport.height * 2 - 1);

    // determine the width/2 of the visible portion of the x axis on the 
    // far clipping plane
    var farX  = (this.right - this.left) / 2;

    // determine the height/2 of the visible portion of the y axis on the
    // far clipping plane
    var farY  = (this.top - this.bottom) / 2;

    // set ray origin as point within visible portion of x, y on the 
    // near clipping plane corresponding to the normalized screen coordinates
    var origin = new Vector3D(normX * farX, normY * farY, this.near);

    // set ray direction as point within visible portion of x, y on the 
    // far clipping plane corresponding to the normalized screen coordinates
    //rayDir = CVector3Df(normX * farX, normY * farY, m_far);
    var direction = new Vector3D(0, 0, 1);
    
    return { origin: origin, direction: direction };  
}

function OrthographicCamera_WidthModifiedCB(attribute, container)
{
    container.updateWidth = true;
    container.setModified();
}