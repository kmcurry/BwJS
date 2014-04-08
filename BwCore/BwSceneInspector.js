BwSceneInspector.prototype = new SceneInspector();
BwSceneInspector.prototype.constructor = BwSceneInspector;

function BwSceneInspector()
{
    SceneInspector.call(this);
    this.className = "BwSceneInspector";
    this.attrType = eAttrType.SceneInspector;
    
    this.camera = null;
    this.viewport = new Viewport();
    this.worldUnitsPerPixel = new Vector2D();
    this.clickPosWorld = new Vector3D();
    this.last_d3 = 0;
    
    this.translationSensitivity = new Vector3DAttr(1, 1, 1);
    this.panSensitivity = new Vector3DAttr(1, 1, 1);
    this.trackSensitivity = new Vector3DAttr(1, 1, 1);
    this.rotationSensitivity = new Vector3DAttr(1, 1, 1);
    this.zoomSensitivity = new NumberAttr(1);
    this.invertedTranslationDelta = new Vector3DAttr(0, 0, 0);
    this.invertedPanDelta = new Vector3DAttr(0, 0, 0);
    this.invertedTrackDelta = new Vector3DAttr(0, 0, 0);
    this.invertedRotationDelta = new Vector3DAttr(0, 0, 0);
    this.zoomDelta = new NumberAttr(0);
    this.invertedZoomDelta = new NumberAttr(0);
    this.selectionOccurred = new BooleanAttr(false);
    this.viewRelativeTranslationDelta = new Vector3DAttr(0, 0, 0);
    
    this.translationDelta.addModifiedCB(BwSceneInspector_TranslationDeltaModifiedCB, this);
    this.panDelta.addModifiedCB(BwSceneInspector_PanDeltaModifiedCB, this);
    this.trackDelta.addModifiedCB(BwSceneInspector_TrackDeltaModifiedCB, this);
    this.rotationDelta.addModifiedCB(BwSceneInspector_RotationDeltaModifiedCB, this);
    this.invertedTranslationDelta.addModifiedCB(BwSceneInspector_InvertedTranslationDeltaModifiedCB, this);
    this.invertedPanDelta.addModifiedCB(BwSceneInspector_InvertedPanDeltaModifiedCB, this);
    this.invertedTrackDelta.addModifiedCB(BwSceneInspector_InvertedTrackDeltaModifiedCB, this);
    this.invertedRotationDelta.addModifiedCB(BwSceneInspector_InvertedRotationDeltaModifiedCB, this);
    this.zoomDelta.addModifiedCB(BwSceneInspector_ZoomDeltaModifiedCB, this);
    this.invertedZoomDelta.addModifiedCB(BwSceneInspector_InvertedZoomDeltaModifiedCB, this);
    this.selectionOccurred.addModifiedCB(BwSceneInspector_SelectionOccurredCB, this);
    this.viewRelativeTranslationDelta.addModifiedCB(BwSceneInspector_TrackDeltaModifiedCB, this);
    
    this.registerAttribute(this.translationSensitivity, "translationSensitivity");
    this.registerAttribute(this.panSensitivity, "panSensitivity");
    this.registerAttribute(this.trackSensitivity, "trackSensitivity");
    this.registerAttribute(this.rotationSensitivity, "rotationSensitivity");
    this.registerAttribute(this.zoomSensitivity, "zoomSensitivity");
    this.registerAttribute(this.invertedTranslationDelta, "invertedTranslationDelta");
    this.registerAttribute(this.invertedPanDelta, "invertedPanDelta");
    this.registerAttribute(this.invertedTrackDelta, "invertedTrackDelta");
    this.registerAttribute(this.invertedRotationDelta, "invertedRotationDelta");
    this.registerAttribute(this.zoomDelta, "zoomDelta");
    this.registerAttribute(this.invertedZoomDelta, "invertedZoomDelta");
    this.registerAttribute(this.selectionOccurred, "selectionOccurred");
    this.registerAttribute(this.viewRelativeTranslationDelta, "viewRelativeTranslationDelta");
    
    // set orphan so that evaluator will not be added to scene graph
	this.orphan.setValueDirect(true);
}

BwSceneInspector.prototype.evaluate = function()
{
    // call base-class implementation
    SceneInspector.prototype.evaluate.call(this);
}

BwSceneInspector.prototype.translate = function(delta)
{
    if (delta.x == 0 && delta.y == 0 && delta.z == 0)
    {
        // no effect
        return;
    }
    
    // get sensitivity
    var sensitivity = this.translationSensitivity.getValueDirect();

    // calculate deltas (scale by sensitivity)
    delta.x *= sensitivity.x;
    delta.y *= sensitivity.y;
    delta.z *= sensitivity.z;

    // set deltas
    var values = [delta.x, delta.y, delta.z];
    var params = new AttributeSetParams(-1, -1, 0, true, false);
	this.translationDelta.setValue(values, params);
	
    // evaluate scene inspector
	this.evaluate();

    // clear deltas
    var zeroes = [0, 0, 0];
    this.translationDelta.setValue(zeroes, params);
    this.invertedTranslationDelta.setValue(zeroes, params);
}

BwSceneInspector.prototype.pan = function(delta)
{
    if (delta.x == 0 && delta.y == 0 && delta.z == 0)
    {
        // no effect
        return;
    }
    
    // if worldUnitsPerPixel hasn't been set, use pivot distance as default
    if (this.worldUnitsPerPixel.x == 0 && this.worldUnitsPerPixel.y == 0)
    {
        var wupp = this.getWorldUnitsPerPixel(this.pivotDistance.getValueDirect());
        this.worldUnitsPerPixel.x = wupp.x;
        this.worldUnitsPerPixel.y = wupp.y;
    }
    
    // get sensitivity
    var sensitivity = this.panSensitivity.getValueDirect();

    // calculate deltas (scale by sensitivity & worldUnitsPerPixel)
    delta.x *= sensitivity.x * this.worldUnitsPerPixel.x;
    delta.y *= sensitivity.y * this.worldUnitsPerPixel.y;
    delta.z *= sensitivity.z * this.worldUnitsPerPixel.y; // use y for z
    
    // set deltas
    var values = [delta.x, delta.y, delta.z];
    var params = new AttributeSetParams(-1, -1, 0, true, false);
	this.panDelta.setValue(values, params);
	
	// update pivot distance if panning in z-direction
	if (delta.z != 0)
	{
	    var pivotDistance = this.pivotDistance.getValueDirect();
	    pivotDistance -= delta.z;
	    this.pivotDistance.setValueDirect(pivotDistance);
	}
	
    // evaluate scene inspector
	this.evaluate();

    // clear deltas
    var zeroes = [0, 0, 0];
    this.panDelta.setValue(zeroes, params);
    this.invertedPanDelta.setValue(zeroes, params);
}

BwSceneInspector.prototype.track = function(delta)
{   
    if (delta.x == 0 && delta.y == 0 && delta.z == 0)
    {
        // no effect
        return;
    }

    // not supported for orthographic cameras
    if (this.camera == null || this.camera.attrType == eAttrType.OrthographicCamera)
    {
        return;
    }

	// check for valid viewport
	if (this.viewport.width <= 0 || this.viewport.height <= 0)
	{
		return;
	}

    // if worldUnitsPerPixel hasn't been set, use pivot distance as default
    if (this.worldUnitsPerPixel.x == 0 && this.worldUnitsPerPixel.y == 0)
    {
        var wupp = this.getWorldUnitsPerPixel(this.pivotDistance.getValueDirect());
        this.worldUnitsPerPixel.x = wupp.x;
        this.worldUnitsPerPixel.y = wupp.y;
    }

    // get sensitivity
    var sensitivity = this.trackSensitivity.getValueDirect();

    // calculate x and y deltas (scale by sensitivity & worldUnitsPerPixel)
    // calculate deltas (scale by sensitivity & worldUnitsPerPixel)
    delta.x *= sensitivity.x * this.worldUnitsPerPixel.x;
    delta.y *= sensitivity.y * this.worldUnitsPerPixel.y;
    
    // calculate z delta (scale by sensitivity)
    if (delta.z != 0)
    {
        // Let cameraPos be the sector position of the camera
		var cameraPos = this.camera.getAttribute("position").getValueDirect();

        // Let cameraRot be the world-space rotation of the camera
        var cameraRot = this.camera.getAttribute("rotation").getValueDirect();
    
        // Let cameraHeight be the delta between the clickPosWorld.y and cameraPos.y
        var cameraHeight = cameraPos.y - this.clickPosWorld.y;
        
        // STEP 2: define d1 as the distance between cameraPos and clickPosWorld
        var d1 = distanceBetween(cameraPos, this.clickPosWorld);

        // STEP 3: using the pythagorean theorem, a^2 + b^2 = c^2, where a = cameraHeight, 
        //         b = unknown, and c = d1, find the length b1 of side b
        var b1 = Math.sqrt((d1 * d1) - (cameraHeight * cameraHeight));

        // calculate distance between camera and new point
        var zoom = this.camera.getAttribute("zoom").getValueDirect();
        var fovy = 2 * Math.atan2(1, zoom);
        var radsPerPixel = fovy / this.viewport.height;
        var angleB_Radians = Math.acos(cameraHeight / d1);
        var angleA_Radians = angleB_Radians + (delta.z * radsPerPixel);
        var b2 = Math.tan(angleA_Radians) * cameraHeight;

        // STEP 7: define d3 as b2 - b1
        var d3 = b2 - b1;

        // as angle B approaches 90, use last calculated d3 (algorithm produces exponential results otherwise) 
        if (angleB_Radians >= toRadians(88) && angleB_Radians <= toRadians(92))
        {
            if (d3 < 0)
            {
                d3 = -(Math.abs(this.last_d3));
            }
            else
            {
                d3 = Math.abs(this.last_d3);
            }
        }

        var viewRotation = cameraRot;
        var fabs_bank = Math.abs(cameraRot.z);
        var flipIt = false;
        if (fabs_bank >= 90 && fabs_bank <= 270)
        {
            if (cameraRot.x > -45 && cameraRot.x < 45)
            {
                flipIt = true;
            }
        }
        if (flipIt)
        {
            d3 = -d3;
        }

        this.last_d3 = d3;

        // STEP 8: translate camera by d3 units
		delta.z = d3 * sensitivity.z * (cameraHeight < 0 ? -1 : 1);

        //var mat = new Matrix4x4();
        //mat.loadYAxisRotation(cameraRot.y);
        //var v = mat.transform(0, 0, 1, 0);
        //v.normalize();
        
        var directions = this.camera.getDirectionVectors();
        v = new Vector3D(directions.forward.x, directions.forward.y, directions.forward.z);
        v.y = 0;
        v.normalize();

        // method 1 for retrieval of angle C
        var camToClick = subtract3D(this.clickPosWorld, cameraPos);
        camToClick.y = 0;
        camToClick.normalize();
        var cosAngleBetweenCameraDirectionAndCamToClick = cosineAngleBetween(camToClick, v);
        var headingRads = Math.acos(cosAngleBetweenCameraDirectionAndCamToClick);
    
        // method 2 for retrieval of angle C
        var fovx = 2 * Math.atan(this.viewport.width / this.viewport.height * Math.tan(fovy / 2));
        var radsPerPixelX = fovx / this.viewport.width;
        var clickPoint;
        var selector = this.registry.find("Selector");
        if (selector)
        {
            clickPoint = selector.getAttribute("clickPoint").getValueDirect();
        }
        var angleC_Radians = Math.abs(this.viewport.width / 2 - clickPoint.x) * radsPerPixelX;
        headingRads = angleC_Radians;
    
        var xTrans = Math.tan(headingRads) * d3;

        var plane = new Plane(cameraPos, directions.right);
        if (pointOnNegativeSideOfPlane(this.clickPosWorld, plane))
        {
            xTrans *= -1;
        }
        if (flipIt)
        {
            xTrans *= -1;
        }

        delta.x += -xTrans;
    }
    
    // set deltas
    var values = [delta.x, delta.y, delta.z];
    var params = new AttributeSetParams(-1, -1, 0, true, false);
	this.trackDelta.setValue(values, params);
	
	// evaluate scene inspector
	this.evaluate();

    // clear deltas
    var zeroes = [0, 0, 0];
    this.trackDelta.setValue(zeroes, params);
    this.invertedTrackDelta.setValue(zeroes, params);
}

BwSceneInspector.prototype.rotate = function(delta)
{
    if (delta.x == 0 && delta.y == 0 && delta.z == 0)
    {
        // no effect
        return;
    }

    // get sensitivity
    var sensitivity = this.rotationSensitivity.getValueDirect();

    // calculate deltas (scale by sensitivity)
    delta.x *= sensitivity.x;
    delta.y *= sensitivity.y;
    delta.z *= sensitivity.z;

    // set deltas
    var values = [delta.x, delta.y, delta.z];
    var params = new AttributeSetParams(-1, -1, 0, true, false);
	this.rotationDelta.setValue(values, params);
	
    // evaluate scene inspector
	this.evaluate();

    // clear deltas
    var zeroes = [0, 0, 0];
    this.rotationDelta.setValue(zeroes, params);
    this.invertedRotationDelta.setValue(zeroes, params);
}

BwSceneInspector.prototype.zoom = function(delta)
{
    if (delta == 0)
    {
        // no effect
        return;
    }
    
    if (!this.camera)
    {
        return;
    }
    
    switch (this.camera.className)
    {
    case "PerspectiveCamera":
        {
            var zoom = this.camera.getAttribute("zoom").getValueDirect();
            zoom += delta * this.zoomSensitivity.getValueDirect();
            if (zoom < 0) zoom = 0.05; // don't go < 0
            this.camera.getAttribute("zoom").setValueDirect(zoom);
        }
        break;
        
    case "OrthographicCamera":
        {
            var width = this.camera.getAttribute("width").getValueDirect();
            width += delta * this.zoomSensitivity.getValueDirect();
            if (width < 0) width = 0; // don't go < 0
            this.camera.getAttribute("width").setValueDirect(width);
        }
        break;
    }
}

BwSceneInspector.prototype.setCamera = function(camera)
{
    this.camera = camera;
}

BwSceneInspector.prototype.getCamera = function()
{
    return this.camera;
}

BwSceneInspector.prototype.getWorldUnitsPerPixel = function(viewSpace_Z)
{
    var x = 0;
    var y = 0;
    
    // get current viewport
    var selector = this.registry.find("Selector");
    if (selector)
    {
        var vp = selector.selections.viewports[selector.selections.viewports.length-1];
        
        if (this.camera)
        {
            switch (this.camera.attrType)
            {
            case eAttrType.PerspectiveCamera:
                {
                    // get zoom
				    var zoom = this.camera.getAttribute("zoom").getValueDirect();

				    // determine the per-pixel width and height at viewSpace_Z
				    var result = worldUnitsPerPixelPersp(vp, zoom, viewSpace_Z);
				    x = result.x;
				    y = result.y;    
                }
                break;
                
            case eAttrType.OrthographicCamera:
                {
                    // get width
				    var width = this.camera.getAttribute("width").getValueDirect();

				    // determine the per-pixel width and height
				    var result = worldUnitsPerPixelOrtho(vp, width);
				    x = result.x;
				    y = result.y;
                }
                break;
            }
        }
    }
    
    return { x: x, y: y };
}

function BwSceneInspector_TranslationDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.translate(attribute.getValueDirect());
    }
}
    
function BwSceneInspector_PanDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.pan(attribute.getValueDirect());
    }
}

function BwSceneInspector_TrackDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.track(attribute.getValueDirect());
    }
}

function BwSceneInspector_RotationDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.rotate(attribute.getValueDirect());
    }
}

function BwSceneInspector_InvertedTranslationDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        var deltas = attribute.getValueDirect();
        deltas.x *= -1;
        deltas.y *= -1;
        deltas.z *= -1;
        container.translate(deltas);
        
        if (deltas.x != 0 || deltas.y != 0 || deltas.z != 0) alert("rotate");
    }
}
 
function BwSceneInspector_InvertedPanDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        var deltas = attribute.getValueDirect();
        deltas.x *= -1;
        deltas.y *= -1;
        deltas.z *= -1;
        container.pan(deltas);
    }
}

function BwSceneInspector_InvertedTrackDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        var deltas = attribute.getValueDirect();
        deltas.x *= -1;
        deltas.y *= -1;
        deltas.z *= -1;
        container.track(deltas);
    }
}

function BwSceneInspector_InvertedRotationDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        var deltas = attribute.getValueDirect();
        deltas.x *= -1;
        deltas.y *= -1;
        deltas.z *= -1;
        container.rotate(deltas);
    }
}

function BwSceneInspector_ZoomDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.zoom(attribute.getValueDirect());
    }
}

function BwSceneInspector_InvertedZoomDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.zoom(attribute.getValueDirect() * -1);
    }
}

function BwSceneInspector_SelectionOccurredCB(attribute, container)
{
    var selector = container.registry.find("Selector");
    if (selector)
    {
        // get viewport
        if (selector.selections.viewports.length > 0)
        {
            container.viewport.loadViewport(selector.selections.viewports[0]);
        }
        
        // get click point in world-space
        container.clickPosWorld.copy(selector.getAttribute("pointWorld").getValueDirect());
        
        // get click point in view-space
        var clickPosView = selector.getAttribute("pointView").getValueDirect();
        
        // get world units per-pixel at click point z
        container.getWorldUnitsPerPixel(clickPosView.z);
    }
}


