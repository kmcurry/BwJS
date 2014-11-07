LocateCommand.prototype = new Command();
LocateCommand.prototype.constructor = LocateCommand;

function LocateCommand()
{
    Command.call(this);
    this.className = "LocateCommand";
    this.attrType = eAttrType.Locate;

    this.targetNode = null;
    this.directive = new BBoxDirective();
    this.locator = new BBoxLocator();
    this.inspector = null;

	this.duration = new NumberAttr(1);
	this.transition = new BooleanAttr(true);
	this.updateClipPlanes = new BooleanAttr(false);
	this.shape = new NumberAttr(eKeyframeShape.TCB);
	this.easeIn = new BooleanAttr(true);
	this.easeOut = new BooleanAttr(true);
	this.resultPosition = new Vector3DAttr();
	this.resultFarDistance = new NumberAttr();
	this.resultWidth = new NumberAttr();

    this.target.addModifiedCB(LocateCommand_TargetModifiedCB, this);

	this.registerAttribute(this.duration, "duration");
	this.registerAttribute(this.transition, "transition");
	this.registerAttribute(this.updateClipPlanes, "updateClipPlanes");
	this.registerAttribute(this.shape, "shape");
	this.registerAttribute(this.easeIn, "easeIn");
	this.registerAttribute(this.easeOut, "easeOut");
	this.registerAttribute(this.resultPosition, "resultPosition");
	this.registerAttribute(this.resultFarDistance, "resultFarDistance");
	this.registerAttribute(this.resultWidth, "resultWidth");

    this.registerAttribute(this.locator.getAttribute("closeness"), "closeness");
    this.registerAttribute(this.locator.getAttribute("resultPivotDistance"), "resultPivotDistance");
}

LocateCommand.prototype.execute = function()
{
    if (this.targetNode)
    {
        this.locate();
    }
}

LocateCommand.prototype.locate = function()
{
    var selector = this.registry.find("Selector");
    var viewportMgr = this.registry.find("ViewportMgr");

    // get camera at last select point (if no selection has been made, gets camera at (0, 0))
    var clickPoint = selector.getAttribute("clickPoint").getValueDirect();
    var vp = viewportMgr.getViewportAtScreenXY(clickPoint.x, clickPoint.y);
    var camera = vp.camera;
    var viewport = vp.viewport;

    // get world-space bbox
    this.directive.execute(this.targetNode);
    var bounds = this.directive.getBounds();
    this.locator.getAttribute("bbox").setValueDirect(bounds.min, bounds.max);

    // get view-space bbox
    var view = vp.camera.getTransform();
    view.invert();
    this.directive.getAttribute("viewTransform").setValueDirect(view);
    this.directive.getAttribute("viewSpace").setValueDirect(true);
    this.directive.execute(this.targetNode);
    bounds = this.directive.getBounds();
    this.locator.getAttribute("bboxView").setValueDirect(bounds.min, bounds.max);

    // copy current viewport to the locator's viewport attribute
    this.locator.getAttribute("viewport").setValueDirect(viewport.x, viewport.y, viewport.width, viewport.height);

    // inputs
    var locatorNear = this.locator.getAttribute("nearDistance");
    var locatorVolume = this.locator.getAttribute("viewVolume");
    var locatorViewPosition = this.locator.getAttribute("viewPosition");
    var locatorTransform = this.locator.getAttribute("viewTransform");

    // outputs
    var locatorResultPosition = this.locator.getAttribute("resultPosition");
    var locatorResultWidth = this.locator.getAttribute("resultWidth");
    var locatorResultFarDistance = this.locator.getAttribute("resultFarDistance");
    var resultPivotDistance = this.locator.getAttribute("resultPivotDistance");

    // output targets (others determined later)
    var targetPivotDistance = null;
    var updateClipPlanes = this.updateClipPlanes.getValueDirect();
    var transition = this.transition.getValueDirect();

    if (this.inspector)
    {
        targetPivotDistance = this.inspector.getAttribute("pivotDistance");
    }

    if (resultPivotDistance && targetPivotDistance)
    {
        resultPivotDistance.addTarget(targetPivotDistance);
    }

    cameraNear = camera.getAttribute("nearDistance");
    cameraFar = camera.getAttribute("farDistance");
    cameraWidth = camera.getAttribute("width");
    cameraVolume = camera.getAttribute("viewVolume");
    cameraPosition = camera.getAttribute("sectorPosition");
    cameraWorldPosition = camera.getAttribute("sectorWorldPosition");
    cameraWorldTransform = camera.getAttribute("sectorWorldTransform");

    cameraNear.addTarget(locatorNear);
    cameraVolume.addTarget(locatorVolume);
    cameraWorldPosition.addTarget(locatorViewPosition);
    cameraWorldTransform.addTarget(locatorTransform);

    // if NOT transitioning, apply the result directly back to the camera
    if (transition == false)
    {
        locatorResultPosition.addTarget(cameraPosition);
        locatorResultWidth.addTarget(cameraWidth);

        if (updateClipPlanes)
        {
            locatorResultFarDistance.addTarget(cameraFar);
        }

        this.locator.evaluate();

        locatorResultPosition.removeTarget(cameraPosition);

        // removing null or non-targets is harmless,
        // so no need to check, just call remove
        locatorResultWidth.removeTarget(cameraWidth);
        locatorResultFarDistance.removeTarget(cameraFar);
    }
    else
    {
        locatorResultPosition.addTarget(this.resultPosition);
        locatorResultWidth.addTarget(this.resultWidth);

        if (updateClipPlanes)
        {
            locatorResultFarDistance.addTarget(this.resultFarDistance);
        }

        this.locator.evaluate();

        locatorResultPosition.removeTarget(this.resultPosition);

        // removing null or non-targets is harmless,
        // so no need to check, just call remove
        locatorResultWidth.removeTarget(this.resultWidth);
        locatorResultFarDistance.removeTarget(this.resultFarDistance);

        // based upon shape value, create either a normal auto-interpolator (linear), or a
        // motion-interpolator (non-linear)
        switch (this.shape.getValueDirect())
        {
            case eKeyframeShape.Stepped:
            case eKeyframeShape.TCB:
            case eKeyframeShape.Bezier1D:
            case eKeyframeShape.Bezier2D:
                {
                    var factory = this.registry.find("AttributeFactory");
                    var autoInterpolate = factory.create("MotionInterpolate");

                    autoInterpolate.getAttribute("shape").copyValue(this.shape);
                    autoInterpolate.getAttribute("easeIn").copyValue(this.easeIn);
                    autoInterpolate.getAttribute("easeOut").copyValue(this.easeOut);
                    autoInterpolate.getAttribute("startPosition").copyValue(cameraPosition);
                    autoInterpolate.getAttribute("endPosition").copyValue(this.resultPosition);
                    autoInterpolate.getAttribute("resultPosition").addTarget(cameraPosition,
                        eAttrSetOp.Replace, null, false);

                    // get camera direction vectors
                    var dirs = camera.getDirectionVectors();

                    // set the inverse camera fwd vector to the interpolator's position control
                    autoInterpolate.getAttribute("positionControl").setValueDirect(-dirs.forward.x,
					    -dirs.forward.y, -dirs.forward.z);
                }
                break;

            case eKeyframeShape.Linear:
            default:
                {
                    var factory = this.registry.find("AttributeFactory");
                    var autoInterpolate = factory.create("AutoInterpolate");

                    autoInterpolate.attributeRefPairs.push(new Pair(this.resultPosition, cameraPosition));
                }
                break;
        }

        if (updateClipPlanes)
        {
            if (cameraWidth) autoInterpolate.attributeRefPairs.push(new Pair(this.resultWidth, cameraWidth));
            if (cameraFar) autoInterpolate.attributeRefPairs.push(new Pair(this.resultFarDistance, cameraFar));
        }

        autoInterpolate.target = camera;
        autoInterpolate.getAttribute("duration").copyValue(this.duration);
        autoInterpolate.execute();
        this.registry.unregister(autoInterpolate);
    }

    if (resultPivotDistance && targetPivotDistance)
    {
        resultPivotDistance.removeTarget(targetPivotDistance);
    }
}

function LocateCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
        container.targetNode = resource;

        // try and locate a scene inspector for updating pivotDistance
        container.inspector = container.registry.find("SceneInspector");
    }
    else
    {
        console.debug("TODO: " + arguments.callee.name);
        // TODO: target not found
        //_snprintf(msg, sizeof(msg), "LocateBBox: target=\"%s\" not found\n", name.c_str());
        // TODO: Locate a point on an object and/or in the world
    }
}
