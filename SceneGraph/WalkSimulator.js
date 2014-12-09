WalkSimulator.prototype = new SceneInspector();
WalkSimulator.prototype.constructor = WalkSimulator;

function WalkSimulator()
{
    SceneInspector.call(this);
    this.className = "WalkSimulator";
    this.attrType = eAttrType.WalkSimulator;
    
    this.sceneInspector_pivotDistanceValue = 0;
    this.selector_computePivotDistanceValue = 0;
    
    this.groundPlane = new PlaneAttr();
    this.linearDelta = new Vector3DAttr(0, 0, 0);
    this.angularDelta = new Vector3DAttr(0, 0, 0);
    this.linearSensitivity = new Vector3DAttr(1, 1, 1);
    this.angularSensitivity = new Vector3DAttr(1, 1, 1);
    this.resultLinear = new Vector3DAttr();
    this.resultAngular = new Vector3DAttr();
    
    this.enabled.addModifiedCB(WalkSimulator_EnabledModifiedCB, this);
    this.linearDelta.addModifiedCB(WalkSimulator_LinearDeltaModifiedCB, this);
    this.angularDelta.addModifiedCB(WalkSimulator_AngularDeltaModifiedCB, this);
    
    this.registerAttribute(this.groundPlane, "groundPlane");
    this.registerAttribute(this.linearDelta, "linearDelta");
    this.registerAttribute(this.angularDelta, "angularDelta");
    this.registerAttribute(this.linearSensitivity, "linearSensitivity");
    this.registerAttribute(this.angularSensitivity, "angularSensitivity");
    this.registerAttribute(this.resultLinear, "resultLinear");
    this.registerAttribute(this.resultAngular, "resultAngular");
    
    this.viewRelativeXAxisRotation.setValueDirect(true);
    this.viewRelativeYAxisRotation.setValueDirect(true);
    this.viewRelativeZAxisRotation.setValueDirect(true);
    this.groundPlane.normal.setValueDirect(0, 1, 0);
}

WalkSimulator.prototype.evaluate = function()
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }
    
    // get inputs
    var linearDelta = this.linearDelta.getValueDirect();
    // reverse pan x
    linearDelta.x *= -1;
    var linearSensitivity = this.linearSensitivity.getValueDirect();
    var angularDelta = this.angularDelta.getValueDirect();
    var angularSensitivity = this.angularSensitivity.getValueDirect();

    var panDelta = new Vector3D(linearDelta.x, linearDelta.y, linearDelta.z);
    panDelta.multiplyVector(linearSensitivity);
    var rotationDelta = new Vector3D(angularDelta.x, angularDelta.y, angularDelta.z);
    rotationDelta.multiplyVector(angularSensitivity);

    // only evaluate if necessary
    if (panDelta.x != 0 || panDelta.y != 0 || panDelta.z != 0 || 
        rotationDelta.x != 0 || rotationDelta.y != 0 || rotationDelta.z != 0)
    {
        this.panDelta.setValueDirect(panDelta.x, panDelta.y, panDelta.z);
        this.rotationDelta.setValueDirect(rotationDelta.x, rotationDelta.y, rotationDelta.z);

        // set camera direction vectors based upon walkPlane
        //if (m_updateDirectionVectors) // uncomment to retain forward direction when inspecting with mouse
        {
            // view position
            var viewPosition = this.viewPosition.getValueDirect();

            // view rotation
            var viewRotation = this.viewRotation.getValueDirect();

            // ground plane
            var groundPlane = this.groundPlane.getValueDirect();

            // formulate view transform
            var viewTrans = new Matrix4x4();
            viewTrans.loadTranslation(-viewPosition.x, -viewPosition.y, -viewPosition.z);
            var viewRot = new Matrix4x4();
            viewRot.loadXYZAxisRotation(-viewRotation.x, -viewRotation.y, -viewRotation.z);
            var viewTransform = viewTrans.multiply(viewRot);

            // formulate direction vectors
            this.upVector.setValueDirect(groundPlane.normal.x, groundPlane.normal.y, groundPlane.normal.z);
            
            var xformedXYZ = this.transformDirectionVector(0, 0, 1, viewTransform);
            var projectedXYZ = planeProject(xformedXYZ, groundPlane);
            var vProjectedXYZ = new Vector3D(projectedXYZ.x, projectedXYZ.y, projectedXYZ.z);
            vProjectedXYZ.normalize();
            this.forwardVector.setValueDirect(vProjectedXYZ.x, vProjectedXYZ.y, vProjectedXYZ.z);

            var m = new Matrix4x4();
            m.loadYAxisRotation(90);
            xformedXYZ = m.transform(vProjectedXYZ.x, vProjectedXYZ.y, vProjectedXYZ.z, 0);
            this.rightVector.setValueDirect(xformedXYZ.x, xformedXYZ.y, xformedXYZ.z);
            
            //m_updateDirectionVectors = false;*/
        }

        // call base-class implementation
        SceneInspector.prototype.evaluate.call(this);
    }
}

WalkSimulator.prototype.enabledModified = function()
{
    var enabled = this.enabled.getValueDirect();
    if (enabled)
    {
        this.enableSceneInspectionState(); // ensure scene inspection is enabled
        //m_updateDirectionVectors = true;
        this.affectRotation_Z.setValueDirect(false); // suspend bank
    }
    else if (this.lastEnabled) // only do the following if previously enabled
    {
        this.restoreSceneInspectionState(); // restore previous scene inspector state
        //m_updateDirectionVectors = false;
        this.affectRotation_Z.setValueDirect(true); // restore bank
        this.upVector.setValueDirect(0, 0, 0, false);
        this.rightVector.setValueDirect(0, 0, 0, false);
        this.forwardVector.setValueDirect(0, 0, 0, false);
    }

    this.lastEnabled = enabled;
}

WalkSimulator.prototype.enableSceneInspectionState = function()
{
    var sceneInspector = this.registry.find("SceneInspector");
    if (sceneInspector)
    {
        sceneInspector.enabled.setValueDirect(true);
        this.sceneInspector_pivotDistanceValue = sceneInspector.pivotDistance.getValueDirect();
        sceneInspector.pivotDistance.setValueDirect(0);
    }
    
    var selector = this.registry.find("Selector");
    if (selector)
    {
        this.selector_computePivotDistanceValue = selector.computePivotDistance.getValueDirect();
        selector.computePivotDistance.setValueDirect(false);
    }
}

WalkSimulator.prototype.restoreSceneInspectionState = function()
{
    var sceneInspector = this.registry.find("SceneInspector");
    if (sceneInspector)
    {
        sceneInspector.pivotDistance.setValueDirect(this.sceneInspector_pivotDistanceValue);
    }
    
    var selector = this.registry.find("Selector");
    if (selector)
    {
        selector.computePivotDistance.setValueDirect(this.selector_computePivotDistanceValue);
    }
}

function WalkSimulator_EnabledModifiedCB(attribute, container)
{
    container.enabledModified();
}

function WalkSimulator_LinearDeltaModifiedCB(attribute, container)
{
    // if orphaned, evaluate (otherwise graph will invoke evaluation)
    //if (container.orphan.getValueDirect() == true)
    {
        container.evaluate();
    }
}

function WalkSimulator_AngularDeltaModifiedCB(attribute, container)
{
    // if orphaned, evaluate (otherwise graph will invoke evaluation)
    //if (container.orphan.getValueDirect() == true)
    {
        container.evaluate();
    }
}
