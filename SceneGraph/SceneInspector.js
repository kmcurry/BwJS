SceneInspector.prototype = new Evaluator();
SceneInspector.prototype.constructor = SceneInspector;

function SceneInspector()
{
    Evaluator.call(this);
    this.className = "SceneInspector";
    this.attrType = eAttrType.SceneInspector;
    
    this.camera = null;
        
    this.viewPosition = new Vector3DAttr(0, 0, 0);
    this.viewRotation = new Vector3DAttr(0, 0, 0);
    this.translationDelta = new Vector3DAttr(0, 0, 0);
    this.panDelta = new Vector3DAttr(0, 0, 0);
    this.trackDelta = new Vector3DAttr(0, 0, 0);
    this.rotationDelta = new Vector3DAttr(0, 0, 0);
    this.viewRelativeXAxisRotation = new BooleanAttr(false);
    this.viewRelativeYAxisRotation = new BooleanAttr(false);
    this.viewRelativeZAxisRotation = new BooleanAttr(false);
    this.pivotDistance = new NumberAttr(0);
    this.pivotPointWorld = new Vector3DAttr(0, 0, 0);
    this.resultPosition = new Vector3DAttr(0, 0, 0);
    this.resultRotation = new Vector3DAttr(0, 0, 0);
    /// indicates the up/right/forward vectors to use for pan/track; if zero,
    /// camera up/right/forward vectors are used (default: zero)
    this.upVector = new Vector3DAttr(0, 0, 0);
    this.rightVector = new Vector3DAttr(0, 0, 0);
    this.forwardVector = new Vector3DAttr(0, 0, 0);
    /// indicate which components of resultPosition/resultRotation should be set; if true,
    /// the component is set, if false, it is not (default: true)
    this.affectPosition_X = new BooleanAttr(true);
    this.affectPosition_Y = new BooleanAttr(true);
    this.affectPosition_Z = new BooleanAttr(true);
    this.affectRotation_X = new BooleanAttr(true);
    this.affectRotation_Y = new BooleanAttr(true);
    this.affectRotation_Z = new BooleanAttr(true);
    
    this.registerAttribute(this.viewPosition, "viewPosition");
    this.registerAttribute(this.viewRotation, "viewRotation");
    this.registerAttribute(this.translationDelta, "translationDelta");
    this.registerAttribute(this.panDelta, "panDelta");
    this.registerAttribute(this.trackDelta, "trackDelta");
    this.registerAttribute(this.rotationDelta, "rotationDelta");
    this.registerAttribute(this.viewRelativeXAxisRotation, "viewRelativeXAxisRotation");
    this.registerAttribute(this.viewRelativeYAxisRotation, "viewRelativeYAxisRotation");
    this.registerAttribute(this.viewRelativeZAxisRotation, "viewRelativeZAxisRotation");
    this.registerAttribute(this.pivotDistance, "pivotDistance");
    this.registerAttribute(this.pivotPointWorld, "pivotPointWorld");
    this.registerAttribute(this.resultPosition, "resultPosition");
    this.registerAttribute(this.resultRotation, "resultRotation");
    this.registerAttribute(this.upVector, "upVector");
    this.registerAttribute(this.rightVector, "rightVector");
    this.registerAttribute(this.forwardVector, "forwardVector");
    this.registerAttribute(this.affectPosition_X, "affectPosition_X");
    this.registerAttribute(this.affectPosition_Y, "affectPosition_Y");
    this.registerAttribute(this.affectPosition_Z, "affectPosition_Z");
    this.registerAttribute(this.affectRotation_X, "affectRotation_X");
    this.registerAttribute(this.affectRotation_Y, "affectRotation_Y");
    this.registerAttribute(this.affectRotation_Z, "affectRotation_Z");
}

SceneInspector.prototype.setCamera = function(camera)
{
    this.camera = camera;
}

SceneInspector.prototype.getCamera = function()
{
    return this.camera;
}

SceneInspector.prototype.evaluate = function()
{
    if (!this.enabled_)
    {
        return;
    }
    
    // get input values
    
    // view position
    var viewPosition = this.viewPosition.getValueDirect();
    
    // view rotation
    var viewRotation = this.viewRotation.getValueDirect();
    
    // translation delta
    var translationDelta = this.translationDelta.getValueDirect();
    
    // pan delta
    var panDelta = this.panDelta.getValueDirect();
    
    // track delta
    var trackDelta = this.trackDelta.getValueDirect();
    
    // rotation delta
    var rotationDelta = this.rotationDelta.getValueDirect();
    
    // view-relative rotation flags
    var viewRelativeXAxisRotation = this.viewRelativeXAxisRotation.getValueDirect();
    var viewRelativeYAxisRotation = this.viewRelativeYAxisRotation.getValueDirect();
    var viewRelativeZAxisRotation = this.viewRelativeZAxisRotation.getValueDirect();
    
    // pivot distance
    var pivotDistance = this.pivotDistance.getValueDirect();
    
    // formulate view transform
    var viewTrans = new Matrix4x4();
    viewTrans.loadTranslation(-viewPosition.x, -viewPosition.y, -viewPosition.z);
    var viewRot = new Matrix4x4();
    viewRot.loadXYZAxisRotation(-viewRotation.x, -viewRotation.y, -viewRotation.z);
    var viewTransform = viewTrans.multiply(viewRot);

    // calculate camera direction vectors
    var cameraUp = this.transformDirectionVector(0, 1, 0, viewTransform);
    var cameraRight = this.transformDirectionVector(1, 0, 0, viewTransform);
    var cameraForward = this.transformDirectionVector(0, 0, 1, viewTransform);
    
    // set rotation matrix
    var sceneRotX = new Matrix4x4();
    var sceneRotY = new Matrix4x4();
    var sceneRotZ = new Matrix4x4();
    // x
    if (viewRelativeXAxisRotation)
    {
        sceneRotX.loadRotation(cameraRight.x, cameraRight.y, cameraRight.z, -rotationDelta.x);
    }
    else
    {
        sceneRotX.loadXAxisRotation(-rotationDelta.x);
    }
    // y
    if (viewRelativeYAxisRotation)
    {
        sceneRotY.loadRotation(cameraUp.x, cameraUp.y, cameraUp.z, -rotationDelta.y);
    }
    else
    {
        sceneRotY.loadYAxisRotation(-rotationDelta.y);
    }
    // z
    if (viewRelativeZAxisRotation)
    {
        sceneRotZ.loadRotation(cameraForward.x, cameraForward.y, cameraForward.z, -rotationDelta.z);
    }
    else
    {
        sceneRotZ.loadXAxisRotation(-rotationDelta.z);
    }
    var sceneRot = sceneRotY.multiply(sceneRotX.multiply(sceneRotZ)); // this multiplication order eliminates roll when x- and y-axis rotations are combined
    
    // set translation matrix
    var sceneTrans = new Matrix4x4();
    sceneTrans.loadTranslation(translationDelta.x, -translationDelta.y, -translationDelta.z);
    
    // set pan/track
    if (panDelta.x != 0 || panDelta.y != 0 || panDelta.z != 0 ||
        trackDelta.x != 0 || trackDelta.y != 0 || trackDelta.z != 0)
    {
        // pan up/right/forward vectors
        var up = this.upVector.getValueDirect();
        var right = this.rightVector.getValueDirect();
        var forward = this.forwardVector.getValueDirect();
        if (up.x == 0 && up.y == 0 && up.z == 0) up = cameraUp;
        if (right.x == 0 && right.y == 0 && right.z == 0) right = cameraRight;
        if (forward.x == 0 && forward.y == 0 && forward.z == 0) forward = cameraForward;
        
        // calculate direction vectors after scene rotation matrix is applied
        var cameraUpRot = up;
        var cameraRightRot = right;    
        var cameraForwardRot = forward;    
            
        var scenePan = new Matrix4x4();
        scenePan.loadTranslation(
            cameraRightRot.x * panDelta.x + cameraUpRot.x * -panDelta.y + cameraForwardRot.x * -panDelta.z, 
            cameraRightRot.y * panDelta.x + cameraUpRot.y * -panDelta.y + cameraForwardRot.y * -panDelta.z, 
            cameraRightRot.z * panDelta.x + cameraUpRot.z * -panDelta.y + cameraForwardRot.z * -panDelta.z);
            
        sceneTrans = sceneTrans.multiply(scenePan);
        
        // formulate "track" or "dolly" vectors:
        // track forward = cameraForwardRot (calculated above) rotated about cameraRightRot 
        // (calculated above) viewRotation.x (camera pitch) degrees;
        // track up = track forward rotated about the camera right vector 90 degrees;
        // track right = cameraRightRot (calculated above)
        var sceneTrack = new Matrix4x4();
        var cameraVectorRot = new Matrix4x4();
        
        var flipIt = false;
        var abs_heading = Math.abs(viewRotation.y);
        var abs_pitch = Math.abs(viewRotation.x);
        var abs_bank = Math.abs(viewRotation.z);
        if (viewRotation.z >= 90 && viewRotation.z <= 270)
        {
            flipIt = true;
        }
        else if (viewRotation.z <= -90 && viewRotation.z >= -270)
        {
            flipIt = true
        }
        else
        {
            if (viewRotation.x <= -45 || (viewRotation.x >= 45 && viewRotation.x <= 90))
            {
                flipIt = true;
            }
        }
        
        var lastCameraForwardRot = cameraForwardRot;

        cameraVectorRot.loadRotation(cameraRightRot.x, cameraRightRot.y, cameraRightRot.z, viewRotation.x);
        cameraForwardRot = this.transformDirectionVector(cameraForwardRot.x, cameraForwardRot.y, cameraForwardRot.z, cameraVectorRot);

        var angle = toDegrees(Math.acos(cosineAngleBetween(lastCameraForwardRot, cameraForwardRot)));

        cameraVectorRot.loadRotation(cameraRightRot.x, cameraRightRot.y, cameraRightRot.z, 90);
        cameraUpRot = this.transformDirectionVector(cameraUpRot.x, cameraUpRot.y, cameraUpRot.z, cameraVectorRot);
        sceneTrack.loadTranslation(
            cameraRightRot.x * trackDelta.x + cameraUpRot.x * -trackDelta.y + cameraForwardRot.x * -trackDelta.z, 
            cameraRightRot.y * trackDelta.x + cameraUpRot.y * -trackDelta.y + 0, /*cameraForwardRot.y * -trackDelta.z,*/ // don't set y-component when z-tracking
            cameraRightRot.z * trackDelta.x + cameraUpRot.z * -trackDelta.y + cameraForwardRot.z * -trackDelta.z);

        sceneTrans = sceneTrans.multiply(sceneTrack);
    }
    
    // set pivot distance transforms

    // get camera position in world coordinates
    var viewTransformWorld = new Matrix4x4();
    viewTransformWorld.loadMatrix(viewTransform);
    viewTransformWorld.invert();
    var cameraPos = new Vector3D();
    cameraPos.load(viewTransformWorld._41, viewTransformWorld._42, viewTransformWorld._43);

    var pivotTrans = new Vector3D();
    pivotTrans.load(
        cameraPos.x + cameraForward.x * pivotDistance,
        cameraPos.y + cameraForward.y * pivotDistance,
        cameraPos.z + cameraForward.z * pivotDistance);                
	this.pivotPointWorld.setValueDirect(pivotTrans.x, pivotTrans.y, pivotTrans.z);

    var scenePivot = new Matrix4x4();
    var scenePivotInv = new Matrix4x4();
    scenePivot.loadTranslation(-pivotTrans.x, -pivotTrans.y, -pivotTrans.z);
    scenePivotInv.loadTranslation(pivotTrans.x, pivotTrans.y, pivotTrans.z);
    
    // set overall transform
    var resultTransform = sceneTrans.multiply(scenePivot.multiply(sceneRot.multiply(scenePivotInv.multiply(viewTransform))));

    var resultRotation = resultTransform.getRotationAngles();

    var resultPosition = new Vector3D();
    resultPosition.load(resultTransform._41, resultTransform._42, resultTransform._43);
    resultTransform.transpose(); // invert rotation
    resultPosition = resultTransform.transform(resultPosition.x, resultPosition.y, resultPosition.z, 0);

    // output results
    this.resultPosition.setValueDirect(this.affectPosition_X.getValueDirect() ? -resultPosition.x : viewPosition.x, 
                                       this.affectPosition_Y.getValueDirect() ? -resultPosition.y : viewPosition.y,
                                       this.affectPosition_Z.getValueDirect() ? -resultPosition.z : viewPosition.z);
    this.resultRotation.setValueDirect(this.affectRotation_X.getValueDirect() ? -resultRotation.x : viewRotation.x, 
                                       this.affectRotation_Y.getValueDirect() ? -resultRotation.y : viewRotation.y, 
                                       this.affectRotation_Z.getValueDirect() ? -resultRotation.z : viewRotation.z);
}

SceneInspector.prototype.transformDirectionVector = function(x, y, z, matrix)
{
    var m = new Matrix4x4();
    m.loadMatrix(matrix);
    m.transpose(); // invert rotation
    
    return m.transform(x, y, z, 0);
}

/*
SceneInspector.prototype.zoomIn = function()
{
   var x = bridgeworks.registry.find("SceneInspector");
   x.panDelta.z+=30;
    x.panDelta.setValueDirect(this.panDelta.x, this.panDelta.y, this.panDelta.z, this.viewTransform);
    x.updateScene();
}

SceneInspector.prototype.zoomOut = function()
{
    this.panDelta.z-=30;
    this.panDelta.setValueDirect(this.panDelta.x, this.panDelta.y, this.panDelta.z,this.viewTransform);
    this.updateScene();
}
*/

