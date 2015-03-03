PerspectiveCamera.prototype = new Camera();
PerspectiveCamera.prototype.constructor = PerspectiveCamera;

function PerspectiveCamera()
{
    Camera.call(this);
    this.className = "PerspectiveCamera";
    this.attrType = eAttrType.PerspectiveCamera;
    
    this.updateZoom = false;
    this.fovyRadians = 0;
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.bottom = 0;
    
    this.zoom = new NumberAttr(0);
    
    this.zoom.addModifiedCB(PerspectiveCamera_ZoomModifiedCB, this);
    
    this.registerAttribute(this.zoom, "zoom");
}

PerspectiveCamera.prototype.update = function(params, visitChildren)
{
    if (this.updateZoom)
    {
        this.updateZoom = false;
        
        this.fovyRadians = 2 * Math.atan2(1, this.zoom.getValueDirect());

        this.updateClipPlanes = true;
    }
    
    // call base-class implementation
    Camera.prototype.update.call(this, params, visitChildren);
}

PerspectiveCamera.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
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
            
            this.applyPerspectiveTransform();
        }
        break;
    }
    
    // call base-class implementation
    Camera.prototype.apply.call(this, directive, params, visitChildren);
}

PerspectiveCamera.prototype.setClipPlanes = function()
{
    this.top = Math.tan(this.fovyRadians / 2) * this.near;
    this.bottom = -this.top;
    this.right = this.top * (this.viewport.width / this.viewport.height);
    this.left = -this.right;
    
    this.projectionMatrix.loadMatrix(this.graphMgr.renderContext.perspectiveMatrixLH(this.left, this.right,
        this.top, this.bottom, this.near, this.far));
        
    // update view-volume attribute
    var viewVolume = new ViewVolume();
    viewVolume.setPerspective(this.fovyRadians, this.viewport.width / this.viewport.height, this.near, this.far);
    this.viewVolume.setValueDirect(viewVolume.left, viewVolume.right, viewVolume.top, viewVolume.bottom,
        viewVolume.near, viewVolume.far);    
}

PerspectiveCamera.prototype.applyPerspectiveTransform = function()
{
    this.graphMgr.renderContext.setMatrixMode(RC_PROJECTION);
    this.graphMgr.renderContext.loadMatrix(this.projectionMatrix);
    this.graphMgr.renderContext.applyProjectionTransform();
}

PerspectiveCamera.prototype.getViewSpaceRay = function(viewport, clickPoint)
{
    // normalize click coordinates so they span [-1, 1] on each axis
    var normX =  ((clickPoint.x - viewport.x) / viewport.width  * 2 - 1);
    var normY = -((clickPoint.y - viewport.y) / viewport.height * 2 - 1);

    // get vertical field of view in radians
    var fovY = this.fovyRadians;

    // get horizontal field of view in radians
    var fovX = 2 * Math.atan(viewport.width / viewport.height * Math.tan(fovY / 2));

    // determine the width/2 of the visible portion of the x axis on the 
    // far clipping plane
    var farX  = Math.tan(fovX / 2) * this.far;

    // determine the height/2 of the visible portion of the y axis on the
    // far clipping plane
    var farY  = Math.tan(fovY / 2) * this.far;

    // set ray origin
    var origin = new Vector3D(0, 0, 0);

    // set ray direction as point within visible portion of x, y on the 
    // far clipping plane corresponding to the normalized screen coordinates
    var direction = new Vector3D(normX * farX, normY * farY, this.far);
    
    return { origin: origin, direction: direction };  
}

function PerspectiveCamera_ZoomModifiedCB(attribute, container)
{
    container.updateZoom = true;
    container.incrementModificationCount();
}