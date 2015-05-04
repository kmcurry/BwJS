Camera.prototype = new ParentableMotionElement();
Camera.prototype.constructor = Camera;

function Camera()
{
    ParentableMotionElement.call(this);
    this.className = "Camera";
    this.attrType = eAttrType.Camera;
    
    this.projectionMatrix = new Matrix4x4();
    this.viewport = new Viewport();
    this.updateNearDistance = false;
    this.updateFarDistance = false;
    this.updateClipPlanes = true;
    this.near = 0;
    this.far = 0;
    
    this.nearDistance = new NumberAttr(0);
    this.farDistance = new NumberAttr(0);
    this.viewVolume = new ViewVolumeAttr();
    //this.viewports
    this.sectorOriginUpdatesEnabled = new BooleanAttr(false);
    //this.updateSectorOrigin
    
    this.nearDistance.addModifiedCB(Camera_NearDistanceModifiedCB, this);
    this.farDistance.addModifiedCB(Camera_FarDistanceModifiedCB, this);
    
    this.registerAttribute(this.nearDistance, "nearDistance");
    this.registerAttribute(this.farDistance, "farDistance");
    this.registerAttribute(this.viewVolume, "viewVolume");
}

Camera.prototype.update = function(params, visitChildren)
{
    if (this.updateNearDistance)
    {
        this.updateNearDistance = false;
        
        this.near = this.nearDistance.getValueDirect();
        
        this.updateClipPlanes = true;
    }
    
    if (this.updateFarDistance)
    {
        this.updateFarDistance = false;
        
        this.far = this.farDistance.getValueDirect();
        
        this.updateClipPlanes = true;
    }
    
    // call base-class implementation
    ParentableMotionElement.prototype.update.call(this, params, visitChildren);
}

Camera.prototype.apply = function(directive, params, visitChildren)
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
                this.applyTransform();

                params.projMatrix.loadMatrix(this.projectionMatrix);
                params.viewMatrix.loadMatrix(this.sectorTransformCompound);
                params.viewMatrix.invert(); // put in view-space
            }
            break;

        case "rayPick":
            {
                // if a specific camera is specified in the ray pick params,
                // make sure this is the specified camera
                if (!params.camera || params.camera == this)
                {
                    var ray = this.getViewSpaceRay(params.viewport, params.clickPoint);
                    params.rayOrigin = ray.origin;
                    params.rayDir = ray.direction;
                    params.currentCamera = this;
                    params.nearDistance = this.nearDistance.getValueDirect();
                    params.farDistance = this.farDistance.getValueDirect();
                    params.viewMatrix.loadMatrix(this.sectorTransformCompound);
                    params.viewMatrix.invert(); // put in view-space
                }
            }
            break;

        case "bbox":
            {
                // caller wants bbox in view space; set view matrix so that geometry nodes 
                // can multiply world matrix by view matrix to get worldView matrix
                params.viewMatrix.loadMatrix(this.sectorTransformCompound);
                params.viewMatrix.invert(); // put in view-space
            }
            break;
                       
        case "highlight":
            {
                params.projMatrix.loadMatrix(this.projectionMatrix); // TODO: using jittered allows for antialiasing
                params.viewMatrix.loadMatrix(this.transformCompound);
                params.viewMatrix.invert(); // put in view-space
                params.camera = this;
                params.viewport = this.viewport;
            }
            break;
    }

    // call base-class implementation
    ParentableMotionElement.prototype.apply.call(this, directive, params, visitChildren);
}

Camera.prototype.applyTransform = function()
{
    var matrix = new Matrix4x4();
    matrix.loadMatrix(this.sectorTransformCompound);
    matrix.invert();

    this.graphMgr.renderContext.setMatrixMode(RC_VIEW);
    this.graphMgr.renderContext.loadMatrix(matrix);
    this.graphMgr.renderContext.applyViewTransform();
}

function Camera_NearDistanceModifiedCB(attribute, container)
{
    container.updateNearDistance = true;
    container.setModified();
}

function Camera_FarDistanceModifiedCB(attribute, container)
{
    container.updateFarDistance = true;
    container.setModified();
}