ObjectInspector.prototype = new ArcballInspector();
ObjectInspector.prototype.constructor = ObjectInspector;

function ObjectInspector()
{
    ArcballInspector.call(this);
    this.className = "ObjectInspector";
    this.attrType = eAttrType.ObjectInspector;
    
    this.camera = null;
    this.selectedObjects = [];
    this.pointView = new Vector3DAttr(1, 1, 1);
    this.translationDelta = new Vector3DAttr(0, 0, 0);
    this.rotationDelta = new Vector3DAttr(0, 0, 0);
    this.translationNow = new Vector3DAttr(0, 0, 0);
    this.rotationNow = new Vector3DAttr(0, 0, 0);
    this.selectionOccurred = new BooleanAttr(false);
    this.selectionCleared = new BooleanAttr(false);
    
    this.translationDelta.addModifiedCB(ObjectInspector_TranslationDeltaModifiedCB, this);
    this.rotationDelta.addModifiedCB(ObjectInspector_RotationDeltaModifiedCB, this);
    this.translationNow.addModifiedCB(ObjectInspector_TranslationNowModifiedCB, this);
    this.rotationNow.addModifiedCB(ObjectInspector_RotationNowModifiedCB, this);
    this.selectionOccurred.addModifiedCB(ObjectInspector_SelectionOccurredCB, this);
    this.selectionCleared.addModifiedCB(ObjectInspector_SelectionClearedCB, this);
    
    this.registerAttribute(this.pointView, "pointView");
    this.registerAttribute(this.translationDelta, "translationDelta");
    this.registerAttribute(this.rotationDelta, "rotationDelta");    
    this.registerAttribute(this.translationNow, "translationNow");    
    this.registerAttribute(this.rotationNow, "rotationNow");    
    this.registerAttribute(this.selectionOccurred, "selectionOccurred");
    this.registerAttribute(this.selectionCleared, "selectionCleared");
    
    // set orphan so that evaluator will not be added to scene graph
    this.orphan.setValueDirect(true);   
    
    this.enabled.addModifiedCB(ObjectInspector_EnabledModifiedCB, this)   
}

ObjectInspector.prototype.applyCameraRelativeRotation = function(selected)
{return;
    var i;
	
    // vectors
    var pivot  = null;
    var screen = null;
	
    // matrices
    var camXform  = null;
    var proj  = null;
    var world = null;
    
    // viewport
    var vp = this.viewport;

    // convenience
    var cam = this.camera;

    // sphere center (use world position of selected node)
    pivot = selected.worldCenter.getValueDirect();

    camXform = cam.getTransform();
    camXform.invert(); // put in view-space
    
    projection = cam.projectionMatrix;

    screen = toScreenSpace(pivot, camXform, projection, vp);
	
    this.sphereCenter.setValueDirect(screen.x, screen.y, 0);

    // sphere radius
    this.sphereRadius.setValueDirect(0.75);

    // world transform
    world = selected.getTransform();
    
    this.worldTransform.setValueDirect(world);

    // view transform
    camXform = cam.getTransform();
	
    this.viewTransform.setValueDirect(camXform);
    
    //var sPos = this.viewTransform.getValueDirect();
    //console.debug("ObjectInspector.viewTransform: " + sPos._11 + ", " + 
    //    sPos._12 + ", " + sPos._13);
}

ObjectInspector.prototype.applyCameraRelativeTranslation = function(selected)
{return;
    var cam = this.camera;

    // get translation delta values
    var delta = this.translationDelta.getValueDirect();
	
    if (delta.x == 0 && delta.y == 0 && delta.z == 0) 
    {
        return;
    }

    // get sector view matrix
    var camSectorXform = cam.getSectorTransform();
    camSectorXform.invert(); // put in view-space

    // get node, camera world positions
    var nodePos = selected.sectorWorldCenter.getValueDirect();
    var camPos  = cam.sectorWorldPosition.getValueDirect();

    // calculate forward vector as vector from camera world position to node world position
    var fwd = new Vector3D(nodePos.x - camPos.x, 
                           nodePos.y - camPos.y,
                           nodePos.z - camPos.z);
    fwd.normalize();

    // get viewport dimensions
    var vp = this.viewport;

    // get click point in camera space
    var v = this.pointView.getValueDirect();
    var clickPtCamSpace = new Vector3D(v.x, v.y, v.z);

    var transDelta = null;
    
    var xTransCamSpace = new Vector3D(1, 0, 0);
    var yTransCamSpace = new Vector3D(0, 1, 0);
    var zTransWorldSpace = new Vector3D(fwd.x, fwd.y, fwd.z);
    
    var destCamSpace = new Vector3D(v.x, v.y, v.z);
    
    var parent = selected.motionParent;
    var mParent = null;
    if (parent) 
    {
        mParent = parent.getTransform();
        mParent.invert();
    }
    
    var perPixelWidth = -1;
    var zoom_or_width = -1;
    
    switch (cam.attrType)
    {
        case eAttrType.PerspectiveCamera:
        {
            // get zoom
            zoom_or_width = cam.zoom.getValueDirect();

            // determine the per-pixel width and height at clickPtCamSpace.z
            perPixelWidth = worldUnitsPerPixelPersp(vp, zoom_or_width, clickPtCamSpace.z);
        }
        break;

        case eAttrType.OrthographicCamera:
        {
            // get width
            zoom_or_width = cam.width.getValueDirect();

            // determine the per-pixel width and height
            perPixelWidth = worldUnitsPerPixelOrtho(vp, zoom_or_width);

        }
        break;

        default:
            break;
    }
    
    // multiply the per-pixel width by delta.x and use this to scale the
    // camera-space vector (1, 0, 0)
    xTransCamSpace.multiplyScalar(perPixelWidth.x);
    xTransCamSpace.multiplyScalar(-delta.x);

    // multiply the per-pixel height by delta.y and use this to scale the
    // camera-space vector (0, 1, 0)
    yTransCamSpace.multiplyScalar(perPixelWidth.y);
    yTransCamSpace.multiplyScalar(delta.y);

    // multiply the per-pixel height by delta.z and use this to scale the
    // world-space forward vector
    zTransWorldSpace.multiplyScalar(perPixelWidth.y);
    zTransWorldSpace.multiplyScalar(delta.z);

    // calculate camera-space destination point as camera-space click point
    // plus xTransCamSpace and yTransCamSpace
    destCamSpace.addVector(xTransCamSpace);
    destCamSpace.addVector(yTransCamSpace);

    // convert clickPtCamSpace and destCamSpace to world space
    camSectorXform.invert();
    // if parented, multipy view with parent's inverse
    if (mParent)
    {
        camSectorXform = camSectorXform.multiply(mParent);
        zTransWorldSpace = mParent.transform(zTransWorldSpace.x, zTransWorldSpace.y, zTransWorldSpace.z, 0);
    }
    clickPtCamSpace = camSectorXform.transform(clickPtCamSpace.x, clickPtCamSpace.y, clickPtCamSpace.z, 1);
    destCamSpace = camSectorXform.transform(destCamSpace.x, destCamSpace.y, destCamSpace.z, 1);
    
    // calculate the translation delta as destCamSpace - clickPtCamSpace + zTransWorldSpace
    transDelta = new Vector3D(destCamSpace.x, destCamSpace.y, destCamSpace.z);
    transDelta.subtractVector(clickPtCamSpace);
    transDelta.addVector(zTransWorldSpace);

    // add scaled direction vectors to current node position
    var attrSetParams = new AttributeSetParams(-1, -1, eAttrSetOp.Add, true, true);
    var attrSetVals = [transDelta.x, transDelta.y, transDelta.z];
    selected.sectorPosition.setValue(attrSetVals, attrSetParams);

    var sPos = selected.sectorPosition.getValueDirect();
    console.debug("selected.sectorPosition: " + sPos.x + ", " + 
        sPos.y + ", " + sPos.z);
}

ObjectInspector.prototype.translationDeltaModified = function()
{
    var pme = null;
    for (var i=0; i < this.selectedObjects.length; i++)
    {
        pme = this.selectedObjects[i];
        if (!pme)
        {
            continue;
        }

        var moveable = pme.getAttribute("moveable").getValueDirect();
        if (!moveable)
        {
            continue;
        }

        this.applyCameraRelativeTranslation(pme);
    }

    var zeroes = [0, 0, 0];
    var params = new AttributeSetParams(0,0,0, true, false);

    this.translationDelta.setValue(zeroes, params);  
}

ObjectInspector.prototype.rotationDeltaModified = function()
{
    var pme = null;
    for (var i=0; i < this.selectedObjects.length; i++)
    {
        pme = this.selectedObjects[i];
        if (!pme)
        {
            continue;
        }

        var moveable = pme.moveable.getValueDirect();
        if (!moveable)
        {
            continue;
        }

        this.applyCameraRelativeRotation(pme);

        var mNow = this.mouseNow.getValueDirect();
        var rDelta = this.rotationDelta.getValueDirect();

        mNow.x -= rDelta.x;
        mNow.y -= rDelta.y;

        // mouse now (formulate so that mouse coords match windows standard
        // of (0, 0) at top-left, and (width, height) at bottom-right)
        this.mouseNow.setValueDirect(mNow.y, mNow.x);

        this.evaluate();
    }
}

ObjectInspector.prototype.rotationNowModified = function()
{
    if (this.selectedObjects == null ||
        this.selectedObjects == undefined)
        return;
    
    var pme = null;
    for (var i=0; i < this.selectedObjects.length; i++)
    {
        pme = this.selectedObjects[i];
		
        var moveable = pme.moveable.getValueDirect();
        if (moveable)
        {

            this.applyCameraRelativeRotation(pme);
            
            var rNow = this.rotationNow.getValueDirect();
            
            // mouse now (formulate so that mouse coords match windows standard
            // of (0, 0) at top-left, and (width, height) at bottom-right)
            this.mouseNow.setValueDirect(rNow.y, rNow.x);
            
            //console.debug("mouseNow: " + rNow.x + ", " + 
            //    rNow.y);
    
            this.evaluate();
        }
    }
}

ObjectInspector.prototype.runSelectionOccurred = function()
{
    var selector =  this.registry.find("Selector");
    var vpMgr = this.registry.find("ViewportMgr");

    //this.registryThreadLock.Unlock();
    if (!selector || !vpMgr)
    {
        return;
    }

    // get selector click point
    // must use getAttribute here b/c it's not a native attribute to Selector
    var clickPoint = selector.getAttribute("clickPoint").getValueDirect();

    // get viewport and camera into view object
    var view = vpMgr.getViewportAtScreenXY(clickPoint.x, clickPoint.y);
    this.viewport = view.viewport;
    this.camera = view.camera;
	
    // get selected movable objects
    // TODO: don't assume models?
    this.selectedObjects = selector.selections.models.slice();

    var pResultQuat = this.resultQuat;
    var pQuatAtMouseDown = this.quatAtMouseDown;
    var pMouseDown = this.mouseDown;
    var pMouseNow = this.mouseNow;
    
    var pSelected = null;
    var pIso = null;	// TODO: support more than just Isolators
    var pChildZero = null;
    var pRotGroup = null;
    var pQuat = null;
    var pTransOut = null;
    var pTransBack = null;
    var pRotQuatAttr = null;
    var pBox = null;
    var center = 0;
    var centerNeg = 0;
	
    for (var i=0; i < this.selectedObjects.length; i++)
    {
        pResultQuat.removeAllTargets();

        pMouseDown.setValueDirect(clickPoint.x, clickPoint.y);
        pMouseNow.setValueDirect(clickPoint.x, clickPoint.y);

        // for each selected moveable, attach it's Quat to the Inspector
        for (var j=0; j < this.selectedObjects.length; j++)
        {
            pSelected = this.selectedObjects[j];

            pRotGroup = getInspectionGroup(pSelected);
            //setInspectionGroupActivationState(pSelected, this.enabled.getValueDirect())
            if (pRotGroup && (pQuat = pRotGroup.getChild(2)))
            {
                // see notes in BwObjectInspector.cpp
                var values = [true];
                var params = new AttributeSetParams(-1, -1, eAttrSetOp.Replace, true, true);
                // it would seem easier to setValueDirect(true) here given params are
                // created with all default values but params are reused throughout this
                // function and setting the intended params values, per the notes in .cpp,
                // triggers a bug elsewhere. 
                pQuat.enabled.setValue(values, params);

                pRotQuatAttr = pQuat.rotationQuat;

                pResultQuat.addTarget(pRotQuatAttr);
				
                var prq = pRotQuatAttr.getValueDirect();
                pQuatAtMouseDown.setValueDirect(prq);

                var box = pSelected.bbox;
                var min = box.min.getValueDirect();
                var max = box.max.getValueDirect();
                center = new Vector3D(min.x, min.y, min.z);
                center.addVector(max);
                center.multiplyScalar(0.5);
	
                var pivot = pSelected.pivot.getValueDirect();
                if (pSelected.pivotAboutGeometricCenter.getValueDirect())
                {
                    pivot = center;
                }				
                var pivotNeg = new Vector3D(pivot.x, pivot.y, pivot.z);
                pivotNeg.multiplyScalar(-1);

                // translate to pivot before applying quaternion rotation
                // don't alert modified sinks here because this will cause antialiasing to reset
                values = [pivot.x, pivot.y, pivot.z];
                pRotGroup.getChild(0).translation.setValue(values, params);

                // don't alert modified sinks here because this will cause antialiasing to reset
                var scale = pSelected.worldScale.getValueDirect();
                var scaleInv = new Vector3D(1 / scale.x,
                    1 / scale.y,
                    1 / scale.z);
                values[0] = scaleInv.x;
                values[1] = scaleInv.y;
                values[2] = scaleInv.z;
                pRotGroup.getChild(1).scale.setValue(values, params);
                
                values[0] = scale.x;
                values[1] = scale.y;
                values[2] = scale.z;
                pRotGroup.getChild(3).scale.setValue(values, params);
            
                // translate back from pivot after applying quaternion rotation
                // don't alert modified sinks here because this will cause antialiasing to reset
                values[0] = pivotNeg.x;
                values[1] = pivotNeg.y;
                values[2] = pivotNeg.z;
                pRotGroup.getChild(4).translation.setValue(values, params);
            }
        }
    }   
}

ObjectInspector.prototype.runSelectionCleared = function()
{
    this.selectedObjects = [];
}

function ObjectInspector_TranslationDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.translationDeltaModified();
    }
}

function ObjectInspector_RotationDeltaModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.rotationDeltaModified();
    }
}

function ObjectInspector_TranslationNowModifiedCB(attribute, container)
{
// deprecated
}

function ObjectInspector_RotationNowModifiedCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.rotationNowModified();
    }
}

function ObjectInspector_SelectionOccurredCB(attribute, container)
{
    var enabled = container.enabled.getValueDirect();
    if (enabled)
    {
        container.runSelectionOccurred();
    }
}

function ObjectInspector_SelectionClearedCB(attribute, container)
{
    container.runSelectionCleared();
}

function ObjectInspector_EnabledModifiedCB(attribute, container)
{
    console.debug("ObjectInspector.enable modified: " + container.enabled.getValueDirect().toString())
}

