AttributeFactory.prototype = new AttributeContainer();
AttributeFactory.prototype.constructor = AttributeFactory;

function AttributeFactory()
{
    AttributeContainer.call(this);
    this.className = "AttributeFactory";
    this.attrType = eAttrType.AttributeFactory;
    
    this.newResourceProcs = [];
    this.configureProcs = [];
    this.finalizeProcs = [];
    this.registry = null;
    this.graphMgr = null;
    
    this.name = new StringAttr("AttributeFactory");
    
    this.registerAttribute(this.name, "name");
    
    this.initializeNewResourceMap();
    this.initializeConfigureMap();
    this.initializeFinalizeMap();
}

AttributeFactory.prototype.create = function(name)
{
    var resource = null;
    
    // invoke new resource proc
    var newResourceProc = this.newResourceProcs[name];
    if (newResourceProc)
    {
        resource = newResourceProc(name, this);
    }
    if (!resource) return null;
    
    // invoke configuration proc (if specified)
    var configureProc = this.configureProcs[name];
    if (configureProc)
    {
        configureProc(resource, this);
    }
    
    // if resource is a container, register name and userData if not already registered
	if (resource.isContainer())
	{
	    if (!resource.getAttribute("name")) resource.registerAttribute(new StringAttr(""), "name");
	    if (!resource.getAttribute("userData")) resource.registerAttribute(new StringAttr(""), "userData");
	}
	
	// register resource
	if (this.registry)
	{
	    this.registry.register(resource);
	    resource.setRegistry(this.registry);   
	}
	
	// invoke post-register proc (if specified)
	
	return resource;
}

AttributeFactory.prototype.finalize = function(name, attribute)
{
    // invoke finalize proc
    var finalizeProc = this.finalizeProcs[name];
    if (finalizeProc)
    {
        finalizeProc(attribute, this);
    }
}

AttributeFactory.prototype.initializeNewResourceMap = function()
{
    // attributes
    this.newResourceProcs["Styles"] = newAttribute;
    this.newResourceProcs["StyleMap"] = newAttribute;
    this.newResourceProcs["StylesMap"] = newAttribute;
    this.newResourceProcs["LabelStyle"] = newAttribute;
    this.newResourceProcs["IconStyle"] = newAttribute;
    this.newResourceProcs["FontStyle"] = newAttribute;
    this.newResourceProcs["HTMLLabelStyle"] = newAttribute;
    this.newResourceProcs["BalloonTipLabelStyle"] = newAttribute;
    this.newResourceProcs["RenderableElementStyle"] = newAttribute;
    this.newResourceProcs["Serializer"] = newAttribute;

    // nodes
    this.newResourceProcs["DirectionalLight"] = newSGNode;
    this.newResourceProcs["GlobalIllumination"] = newSGNode;
    this.newResourceProcs["Group"] = newSGNode;
    this.newResourceProcs["Isolator"] = newSGNode;
    this.newResourceProcs["Label"] = newSGNode;
    this.newResourceProcs["HTMLLabel"] = newSGNode;
    this.newResourceProcs["BalloonTipLabel"] = newSGNode;
    this.newResourceProcs["LineList"] = newSGNode;
    this.newResourceProcs["MediaTexture"] = newSGNode;
    this.newResourceProcs["Model"] = newModel;
    this.newResourceProcs["OrthographicCamera"] = newSGNode;
    this.newResourceProcs["PerspectiveCamera"] = newSGNode;
    this.newResourceProcs["PointLight"] = newSGNode;
    this.newResourceProcs["PointList"] = newSGNode;
    this.newResourceProcs["QuaternionRotate"] = newSGNode;
    this.newResourceProcs["Rotate"] = newSGNode;
    this.newResourceProcs["Scale"] = newSGNode;
    this.newResourceProcs["Surface"] = newSGNode;
    this.newResourceProcs["Translate"] = newSGNode;
    this.newResourceProcs["TriList"] = newSGNode;
    this.newResourceProcs["NullObject"] = newSGNode;
    this.newResourceProcs["Material"] = newSGNode;
    this.newResourceProcs["Cube"] = newSGNode;

    // directives
    this.newResourceProcs["BBoxDirective"] = newSGDirective;
    this.newResourceProcs["RayPickDirective"] = newSGDirective;
    this.newResourceProcs["RenderDirective"] = newSGDirective;
    this.newResourceProcs["SerializeDirective"] = newSGDirective;
    this.newResourceProcs["UpdateDirective"] = newSGDirective;
    this.newResourceProcs["CollideDirective"] = newSGDirective;

    // evaluators
    this.newResourceProcs["BBoxLocator"] = newBBoxLocator;
    this.newResourceProcs["KeyframeInterpolator"] = newKeyframeInterpolator;
    this.newResourceProcs["MapProjectionCalculator"] = newMapProjectionCalculator;
    this.newResourceProcs["ObjectInspector"] = newObjectInspector;
    this.newResourceProcs["SceneInspector"] = newSceneInspector;
    this.newResourceProcs["TargetObserver"] = newTargetObserver;
    this.newResourceProcs["AnimalMover"] = newAnimalMover;

    // commands
    this.newResourceProcs["AppendNode"] = newCommand;
    this.newResourceProcs["AutoInterpolate"] = newCommand;
    this.newResourceProcs["CommandSequence"] = newCommand;
    this.newResourceProcs["ConnectAttributes"] = newCommand;
    this.newResourceProcs["ConnectOutputs"] = newCommand;
    this.newResourceProcs["DisconnectAttributes"] = newCommand;
    this.newResourceProcs["DisconnectOutputs"] = newCommand;
    this.newResourceProcs["Locate"] = newCommand;
    this.newResourceProcs["MotionInterpolate"] = newCommand;
    this.newResourceProcs["Pause"] = newCommand;
    this.newResourceProcs["Play"] = newCommand;
    this.newResourceProcs["Remove"] = newCommand;
    this.newResourceProcs["ScreenCapture"] = newCommand;
    this.newResourceProcs["Serialize"] = newCommand;
    this.newResourceProcs["Set"] = newCommand;
    this.newResourceProcs["Stop"] = newCommand;

    // device handlers
    this.newResourceProcs["MouseHandler"] = newDeviceHandler;
}

AttributeFactory.prototype.initializeConfigureMap = function()
{
    // nodes
    this.configureProcs["Model"] = configureModel;

    // directives
    this.configureProcs["BBoxDirective"] = configureDirective;
    this.configureProcs["RayPickDirective"] = configureDirective;
    this.configureProcs["RenderDirective"] = configureDirective;
    this.configureProcs["SerializeDirective"] = configureDirective;
    this.configureProcs["UpdateDirective"] = configureDirective;
    this.configureProcs["CollideDirective"] = configureDirective; 
}

AttributeFactory.prototype.initializeFinalizeMap = function()
{
    // nodes
    this.finalizeProcs["Model"] = finalizeModel;

    // directives
    this.finalizeProcs["BBoxDirective"] = finalizeDirective;
    this.finalizeProcs["RayPickDirective"] = finalizeDirective;
    this.finalizeProcs["RenderDirective"] = finalizeDirective;
    this.finalizeProcs["SerializeDirective"] = finalizeDirective;
    this.finalizeProcs["UpdateDirective"] = finalizeDirective;
    this.finalizeProcs["CollideDirective"] = finalizeDirective;

    // evaluators 
    this.finalizeProcs["KeyframeInterpolator"] = finalizeEvaluator;

    // commands
    this.finalizeProcs["AppendNode"] = finalizeCommand;
    this.finalizeProcs["AutoInterpolate"] = finalizeCommand;
    this.finalizeProcs["CommandSequence"] = finalizeCommand;
    this.finalizeProcs["ConnectAttributes"] = finalizeCommand;
    this.finalizeProcs["ConnectOutputs"] = finalizeCommand;
    this.finalizeProcs["DisconnectAttributes"] = finalizeCommand;
    this.finalizeProcs["DisconnectOutputs"] = finalizeCommand;
    this.finalizeProcs["Locate"] = finalizeCommand;
    this.finalizeProcs["MotionInterpolate"] = finalizeCommand;
    this.finalizeProcs["Pause"] = finalizeCommand;
    this.finalizeProcs["Play"] = finalizeCommand;
    this.finalizeProcs["Remove"] = finalizeCommand;
    this.finalizeProcs["ScreenCapture"] = finalizeCommand;
    this.finalizeProcs["Serialize"] = finalizeCommand;
    this.finalizeProcs["Set"] = finalizeCommand;
    this.finalizeProcs["Stop"] = finalizeCommand;

    // device handlers
    this.finalizeProcs["MouseHandler"] = finalizeDeviceHandler;
}

AttributeFactory.prototype.setRegistry = function(registry)
{
    this.registry = registry;
}

AttributeFactory.prototype.setGraphMgr = function(graphMgr)
{
    this.graphMgr = graphMgr;
}

function newAttribute(name, factory)
{
    var resource = null;
    
    switch (name)
    {
    case "BalloonTipLabelStyleAttr":    resource = new BalloonTipLabelStyleAttr(); break;
    case "BBoxAttr":                    resource = new BBoxAttr(); break;
    case "BooleanAttr":                 resource = new BooleanAttr(); break;
    case "ColorAttr":                   resource = new ColorAttr(); break;
    case "FontStyleAttr":               resource = new FontStyleAttr(); break;
    case "IconStyleAttr":               resource = new IconStyleAttr(); break;
    case "ImageAttr":                   resource = new ImageAttr(); break;
    case "KeyframeAttr":                resource = new KeyframeAttr(); break;
    case "KeyframesAttr":               resource = new KeyframesAttr(); break;
    case "LabelStyleAttr":              resource = new LabelStyleAttr(); break;
    case "HTMLLabelStyleAttr":          resource = new HTMLLabelStyleAttr(); break;
    case "NumberArrayAttr":             resource = new NumberArrayAttr(); break;
    case "NumberAttr":                  resource = new NumberAttr(); break;
    case "Matrix4x4Attr":               resource = new Matrix4x4Attr(); break;
    case "PlaneAttr":                   resource = new PlaneAttr(); break;
    case "PulseAttr":                   resource = new PulseAttr(); break;
    case "QuaternionAttr":              resource = new QuaternionAttr(); break;
    case "RectAttr":                    resource = new RectAttr(); break;
    case "ReferenceAttr":               resource = new ReferenceAttr(); break;
    case "StringAttr":                  resource = new StringAttr(); break;
    case "StyleAttr":                   resource = new StyleAttr(); break;
    case "StylesAttr":                  resource = new StylesAttr(); break;
    case "StyleMapAttr":                resource = new StyleMapAttr(); break;
    case "StylesMapAttr":               resource = new StylesMapAttr(); break;
    case "Vector2DAttr":                resource = new Vector2DAttr(); break;
    case "Vector3DAttr":                resource = new Vector3DAttr(); break;
    case "ViewportAttr":                resource = new ViewportAttr(); break;
    case "ViewVolumeAttr":              resource = new ViewVolumeAttr(); break;
    case "RenderableElementStyleAttr":  resource = new RenderableElementStyleAttr(); break;
    case "Serializer":                  resource = new Serializer(); break;
    }
    
    return resource;
}

function newSGNode(name, factory)
{
    var resource = null;
    
    switch (name)
    {
    case "DirectionalLight":    resource = new DirectionalLight(); registerParentableAttributes(resource, factory); break;
    case "GlobalIllumination":  resource = new GlobalIllumination(); break;
    case "Group":               resource = new Group(); break;
    case "Isolator":            resource = new Isolator(); break;
    case "Label":               resource = new Label(); break;
    case "HTMLLabel":           resource = new HTMLLabel(); break;
    case "BalloonTipLabel":     resource = new BalloonTipLabel(); break;
    case "LineList":            resource = new LineList(); break;
    case "MediaTexture":        resource = new MediaTexture(); break;
    case "OrthographicCamera":  resource = new OrthographicCamera(); registerParentableAttributes(resource, factory); break;
    case "PerspectiveCamera":   resource = new PerspectiveCamera(); registerParentableAttributes(resource, factory); break;
    case "PointLight":          resource = new PointLight(); registerParentableAttributes(resource, factory); break;
    case "PointList":           resource = new PointList(); break;
    case "QuaternionRotate":    resource = new QuaternionRotate(); break;
    case "Rotate":              resource = new Rotate(); break;
    case "Scale":               resource = new Scale(); break;
    case "Surface":             resource = new Surface(); break;
    case "Transform":           resource = new Transform(); break;
    case "Translate":           resource = new Translate(); break;
    case "TriList":             resource = new TriList(); break;
    case "NullObject":          resource = new NullObject(); registerParentableAttributes(resource, factory);  break;
    case "Cube":                resource = new Cube(); break;
    case "Material":            resource = new Material(); break;
    }
    
    if (resource)
    {
        resource.setGraphMgr(factory.graphMgr);
    }
    
    return resource;
}

function newSGDirective(name, factory)
{
    var resource = null;
    
    switch (name)
    {
    case "BBoxDirective":               resource = new BBoxDirective(); break;
    case "RayPickDirective":            resource = new RayPickDirective(); break;
    case "RenderDirective":             resource = new RenderDirective(); break;  
    case "SerializeDirective":          resource = new SerializeDirective(); break;
    case "UpdateDirective":             resource = new UpdateDirective(); break;
    case "CollideDirective":            resource = new CollideDirective(); break;
    }
    
    if (resource)
    {
        resource.setGraphMgr(factory.graphMgr);
    }
    
    return resource;
}

function newModel(name, factory)
{
    var resource = new Model();
    resource.setGraphMgr(factory.graphMgr);
    registerParentableAttributes(resource, factory);
    return resource;
}

function newBBoxLocator(name, factory)
{
    var resource = new BBoxLocator();

    registerEvaluatorAttributes(resource, factory);

    return resource;
}

function newKeyframeInterpolator(name, factory)
{
    var resource = new KeyframeInterpolator();
    
    registerEvaluatorAttributes(resource, factory);
    
    return resource;
}

function newMapProjectionCalculator(name, factory)
{
    var resource = new MapProjectionCalculator();

    registerEvaluatorAttributes(resource, factory);

    return resource;
}

function newObjectInspector(name, factory)
{
    var resource = new ObjectInspector();
    
    registerEvaluatorAttributes(resource, factory);
    
    // target the Inspector's selection flag with the selector's clickPoint
    var selector = factory.registry.find("Selector");
    if (selector)
    {
        selector.getAttribute("selectionOccurred").addTarget(
            resource.getAttribute("selectionOccurred"), eAttrSetOp.Replace, null, false);
            
        selector.getAttribute("selectionCleared").addTarget(
            resource.getAttribute("selectionCleared"), eAttrSetOp.Replace, null, false);
            
        selector.getAttribute("pointView").addTarget(
            resource.getAttribute("pointView"), eAttrSetOp.Replace, null, false);
    }
    
    return resource;
}

function newSceneInspector(name, factory)
{
    var resource = new BwSceneInspector();
    
    registerEvaluatorAttributes(resource, factory);
   
    // target the Inspector's selection flag with the selector's clickPoint
    // target the Inspector's pivotDistance with the selector's distanceFromScreenCenter
    var selector = factory.registry.find("Selector");
    if (selector)
    {
        selector.getAttribute("selectionOccurred").addTarget(
            resource.getAttribute("selectionOccurred"), eAttrSetOp.Replace, null, false);
            
        selector.getAttribute("distanceFromScreenCenter").addTarget(
            resource.getAttribute("pivotDistance"), eAttrSetOp.Replace, null, false);
    }
     
    return resource;
}

function newTargetObserver(name, factory)
{
	var resource = new BwTargetObserver();
    
    registerEvaluatorAttributes(resource, factory);
   
   	return resource;	
}

function newAnimalMover(name, factory)
{
	var resource = new AnimalMover();
	
	resource.setGraphMgr(factory.graphMgr);
	registerEvaluatorAttributes(resource, factory);
	
	return resource;	
}

function newCommand(name, factory)
{
    var resource = null;
    
    switch (name)
    {
    case "AppendNode":     	    resource = new AppendNodeCommand(); break;
    case "AutoInterpolate":     resource = new AutoInterpolateCommand(); break;
    case "CommandSequence":     resource = new CommandSequence(); break;
    case "ConnectAttributes":   resource = new ConnectAttributesCommand(); break;
    case "ConnectOutputs":      resource = new ConnectAttributesCommand(); break;    
    case "DisconnectAttributes":resource = new ConnectAttributesCommand(); resource.getAttribute("negate").setValueDirect(true); break;
    case "DisconnectOutputs":   resource = new ConnectAttributesCommand(); resource.getAttribute("negate").setValueDirect(true); break;
    case "Locate":              resource = new LocateCommand(); break;
    case "MotionInterpolate":   resource = new MotionInterpolateCommand(); break;
    case "Pause":               resource = new PlayCommand(); resource.getAttribute("negate").setValueDirect(true); break;
    case "Play":                resource = new PlayCommand(); break;
    case "Remove":              resource = new RemoveCommand(); break;
    case "ScreenCapture":       resource = new ScreenCaptureCommand(); break;
    case "Serialize":           resource = new SerializeCommand(); break;
    case "Set":                 resource = new SetCommand(); break;
    case "Stop":                resource = new StopCommand(); break;
    }

	// if command sequence, set to command mgr
	if (name == "CommandSequence")
	{
	    var commandMgr = factory.registry.find("CommandMgr");
	    if (commandMgr)
	    {
	        commandMgr.pushCommandSequence(resource);
	    }    
	}
	
	return resource;
}

function newDeviceHandler(name, factory)
{
    var resource = null;
    
    switch (name)
    {
    case "MouseHandler":        resource = new MouseHandler(); break;
    }
	
	return resource;
}

function configureModel(model, factory)
{
    // TODO
    console.debug("TODO: " + arguments.callee.name);
}

function configureDirective(directive, factory)
{
    var root = new StringAttr("");
    root.addModifiedCB(AttributeFactory_DirectiveRootModifiedCB, factory);
    directive.registerAttribute(root, "root");
    
    var rootNode = factory.registry.getAttribute("rootPtr").getValueDirect();
    if (rootNode)
    {
        root.setValueDirect(rootNode.getAttribute("name").getValueDirect().join(""));
    }
}

function finalizeModel(model, factory)
{
    // TODO
    console.debug("TODO: remove LWO assumption");
    
    var url = model.getAttribute("url").getValueDirect();
    if (url) {
        
        url = url.join("");
        
        var pathInfo = formatPath(url);
        console.debug("path: " + pathInfo[0]);
        console.debug("content dir: " + pathInfo[1]);
        
        var contentHandler = new LWObjectHandler();
        contentHandler.getAttribute("contentDirectory").setValueDirect(pathInfo[1]);

        var contentBuilder = new LWObjectBuilder(); 
        contentBuilder.setRegistry(factory.registry);
        contentBuilder.models.push(model);
        contentBuilder.layer = model.getAttribute("layer").getValueDirect();
        contentBuilder.visitHandler(contentHandler);
        
        contentHandler.parseFileStream(pathInfo[0]);  
    }
    
    addInspectionGroup(model, factory);
}

function finalizeDirective(directive, factory)
{
}

function finalizeCommand(command, factory)
{
    command.finalize();
    
    var commandMgr = factory.registry.find("CommandMgr");
    if (commandMgr)
    {
        // if command sequence, clear from command mgr
        if (command.className == "CommandSequence")
        {
            commandMgr.popCommandSequence();
        }
        
        commandMgr.addCommand(command);
    }
}

function finalizeDeviceHandler(handler, factory)
{
    var eventMgr = factory.registry.find("EventMgr");
    if (eventMgr)
    {
        var events = handler.getEventTypes();
        for (var i=0; i < events.length; i++)
        {
            eventMgr.addListener(events[i], handler);
        }
    }
}

function finalizeEvaluator(evaluator, factory)
{
    // TODO
    console.debug("TODO: " + arguments.callee.name);
    
    switch (evaluator.className)
    {
    case "KeyframeInterpolator":
        
        var url = evaluator.getAttribute("url").getValueDirect();
        if (url) {
        
            url = url.join("");
            
            var pathInfo = formatPath(url);
            
            var contentHandler = new LWSceneHandler();
            contentHandler.getAttribute("contentDirectory").setValueDirect(pathInfo[1]);
            
            var contentBuilder = new LWSceneBuilder(); 
            contentBuilder.setRegistry(factory.registry);
            contentBuilder.evaluators.push(evaluator);
            contentBuilder.visitHandler(contentHandler);
            
            contentHandler.parseFileStream(pathInfo[0]); 
        }
        AttributeFactory_EvaluatorTargetConnectionTypeModifiedCB(evaluator.getAttribute("targetConnectionType"), factory);
        break;
    }
}

function registerEvaluatorAttributes(evaluator, factory)
{
    // url
    if (!evaluator.getAttribute("url"))
    {
    	var url = new StringAttr("");
    	evaluator.registerAttribute(url, "url");
	}
	
    // target
    if (!evaluator.getAttribute("target"))
    {
    	var target = new StringAttr("");
    	evaluator.registerAttribute(target, "target");
	}
	
    // renderAndRelease
    if (!evaluator.getAttribute("renderAndRelease"))
    {
    	var renderAndRelease = new BooleanAttr(false);
    	evaluator.registerAttribute(renderAndRelease, "renderAndRelease");
	}
	
    // targetConnectionType
    if (!evaluator.getAttribute("targetConnectionType"))
    {
    	var targetConnectionType = new StringAttr("transform");
    	targetConnectionType.addModifiedCB(AttributeFactory_EvaluatorTargetConnectionTypeModifiedCB, factory);
    	evaluator.registerAttribute(targetConnectionType, "targetConnectionType");
    }
}

function registerParentableAttributes(pme, factory)
{
    // label
    if (!pme.getAttribute("label"))
    {
		var label = new StringAttr("");
		pme.registerAttribute(label, "label");
		label.addModifiedCB(AttributeFactory_ParentableLabelModifiedCB, factory);
	}
	
	// geoPosition
	if (!pme.getAttribute("geoPosition"))
	{
		var geoPosition = new Vector3DAttr();
		pme.registerAttribute(geoPosition, "geoPosition");
		geoPosition.addModifiedCB(AttributeFactory_ParentableGeoPositionModifiedCB, factory);
	}

	// altitude
	if (!pme.getAttribute("altitude"))
	{
		var altitude = new NumberAttr();
		pme.registerAttribute(altitude, "altitude");
	}
	
	// latitude
	if (!pme.getAttribute("latitude"))
	{
		var latitude = new NumberAttr();
		pme.registerAttribute(latitude, "latitude");
	}
	
	// longitude
	if (!pme.getAttribute("longitude"))
	{
		var longitude = new NumberAttr();
		pme.registerAttribute(longitude, "longitude");
	}
	
	// misc modified callbacks
	pme.getAttribute("worldCenter").addModifiedCB(AttributeFactory_ParentableWorldPositionModifiedCB, factory);
}

function getSceneGraph()
{
    return this.sceneGraph;
}

function AttributeFactory_DirectiveRootModifiedCB(root, factory)
{
    var directive = root.getContainer();
    var resources = factory.registry.getByName(root.getValueDirect().join(""));
    if (resources)
    {
        directive.getAttribute("rootNode").setValueDirect(resources[0]);
    }
}

function AttributeFactory_ParentableLabelModifiedCB(attribute, container)
{
    console.debug("TODO: " + arguments.callee.name);
}

function AttributeFactory_ParentableGeoPositionModifiedCB(attribute, container)
{
    var pme = attribute.getContainer();
    if (pme)
    {
        var cms = container.registry.getByName("ConnectionMgr");
        if (cms && cms.length)
        {
            var cm = cms[0];
            
            var mpcs = container.registry.getByType(eAttrType.MapProjectionCalculator);
            if (mpcs && mpcs.length)
            {
                var mpc = mpcs[0];

                mpc.getAttribute("geoPosition").copyValue(attribute);

                cm.connectMapProjectionCalculator(mpc, pme);
                cm.disconnectMapProjectionCalculator(mpc, pme);
            }
        }
    }
}

function AttributeFactory_ParentableWorldPositionModifiedCB(attribute, container)
{
    // TODO
    //console.debug("TODO: " + arguments.callee.name);
}

function AttributeFactory_EvaluatorTargetConnectionTypeModifiedCB(attribute, container)
{  
    var evaluator = attribute.getContainer();
    if (evaluator)
    {
        var connect = new ConnectAttributesCommand();
        connect.setRegistry(container.registry);
        connect.getAttribute("sourceContainer").copyValue(evaluator.getAttribute("name"));
        connect.getAttribute("targetContainer").copyValue(evaluator.getAttribute("target"));
        connect.getAttribute("connectionType").copyValue(attribute);
        connect.execute();
    }
}