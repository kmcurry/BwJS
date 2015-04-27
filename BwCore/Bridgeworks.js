var bridgeworks = null;

Bridgeworks.prototype = new AttributeContainer();
Bridgeworks.prototype.constructor = Bridgeworks;

function Bridgeworks(canvas, bgImage, contentDir)
{
    AttributeContainer.call(this);
    this.className = "Bridgeworks";

    this.renderContext =  newRenderContext("webgl", canvas, bgImage);
    if (!this.renderContext) return;

    contentDir = contentDir == null? "BwContent" : contentDir;

    this.canvas = canvas;
    this.contentDir = contentDir;

    // allocate objects
    //this.renderContext = null;
    this.graphMgr = new GraphMgr();
    this.graphMgr.setRenderContext(this.renderContext)

    this.styleMgr = new StyleMgr();
    this.registry = new BwRegistry();
    this.factory = new AttributeFactory();
    this.parser = new XMLParser(this.factory, this.registry, this.contentDir);
    this.eventAdapter = new EventAdapter();
    this.eventMgr = new EventMgr();
    this.commandMgr = new CommandMgr();
    this.connectionMgr = new ConnectionMgr();
    this.viewportMgr = new ViewportMgr();
    this.selector = new SelectionListener();
    this.rayPick = new RayPickDirective();
    this.renderAgent = new RenderAgent(this);
    this.renderController = new RenderController(this);
    this.layout = new GridLayout();
    this.mapProjectionCalculator = new MapProjectionCalculator();
    this.rasterComponentEventListener = new RasterComponentEventListener();
    this.snapMgr = new SnapMgr();
    this.physicsSimulator = new PhysicsSimulator();

    // set registry to allocated objects
    this.graphMgr.setRegistry(this.registry);
    this.factory.setRegistry(this.registry);
    this.eventAdapter.setRegistry(this.registry);
    this.eventMgr.setRegistry(this.registry);
    this.commandMgr.setRegistry(this.registry);
    this.connectionMgr.setRegistry(this.registry);
    this.viewportMgr.setRegistry(this.registry);
    this.selector.setRegistry(this.registry);
    this.renderAgent.setRegistry(this.registry);
    this.layout.setRegistry(this.registry);
    this.mapProjectionCalculator.setRegistry(this.registry);
    this.rasterComponentEventListener.setRegistry(this.registry);
    this.snapMgr.setRegistry(this.registry);
    this.physicsSimulator.setRegistry(this.registry);

    // configure dependencies
    this.factory.setGraphMgr(this.graphMgr);
    this.selector.setRayPick(this.rayPick);
    this.rasterComponentEventListener.setStyleMgr(this.styleMgr);
    this.rasterComponents = null;
    //this.physicsSimulator.orphan.setValueDirect(true);

    this.name = new StringAttr("Bridgeworks");
    this.onLoad = new StringAttr();

    this.onLoad.addModifiedCB(Bridgeworks_OnLoadModifiedCB, this);

    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.onLoad, "onLoad");

    this.viewportMgr.getAttribute("width").setValueDirect(this.canvas.width);
    this.viewportMgr.getAttribute("height").setValueDirect(this.canvas.height);
    this.viewportMgr.getAttribute("layout").setValueDirect(this.layout);

    enumerateAttributeTypes();
    enumerateAttributeElementTypes();

    // TODO: remove the following when onLoadModified is defined
    console.debug("TODO: " + arguments.callee.name);
    this.initRegistry();
    this.initEventListeners();
    this.viewportMgr.initLayout();
}

Bridgeworks.prototype.get = function(name) {
  return this.registry.find(name);
}

Bridgeworks.prototype.handleEvent = function(event, eventType /* optional type override */)
{
    var bwEvent = null;

    switch (getObjectClassName(event))
    {
        case "MouseEvent":
        case "MouseEventConstructor": // Safari
        case "WheelEvent":
            {
                var absPos = getElementAbsolutePos(this.canvas);
                event.canvasX = event.clientX - absPos.x;
                event.canvasY = event.clientY - absPos.y;
                bwEvent = this.eventAdapter.createMouseEvent(event);
            }
            break;
        
        case "KeyboardEvent":
        case "KeyboardEventConstructor": // Safari
            {
                bwEvent = this.eventAdapter.createKeyboardEvent(event, eventType);
            }
            break;
            
        default:
            break;
    }

    if (bwEvent)
    {
        this.eventMgr.processEvent(bwEvent);
    }
}

Bridgeworks.prototype.initRegistry = function()
{
    // register allocated objects
    this.registry.register(this);
    this.registry.register(this.graphMgr);
    this.registry.register(this.factory);
    this.registry.register(this.eventAdapter);
    this.registry.register(this.eventMgr);
    this.registry.register(this.commandMgr);
    this.registry.register(this.connectionMgr);
    this.registry.register(this.viewportMgr);
    this.registry.register(this.selector);
    this.registry.register(this.renderAgent);
    this.registry.register(this.layout);
    this.registry.register(this.mapProjectionCalculator);
    this.registry.register(this.rasterComponentEventListener);
    this.registry.register(this.snapMgr);
    this.registry.register(this.physicsSimulator);

    // backward compatibility
    this.registry.registerByName(this.renderAgent, "AnimationAgent");
}

Bridgeworks.prototype.initEventListeners = function()
{
    // selector
    this.eventMgr.addListener(eEventType.MouseLeftDown, this.selector);
    this.eventMgr.addListener(eEventType.MouseLeftDblClick, this.selector);
    this.eventMgr.addListener(eEventType.MouseMiddleDown, this.selector);
    this.eventMgr.addListener(eEventType.MouseRightDown, this.selector);
    this.eventMgr.addListener(eEventType.MouseBothDown, this.selector);
    this.eventMgr.addListener(eEventType.MouseHover, this.selector);
    //this.eventMgr.addListener(eMOUSE_MOVE, this.selector);

    // raster component event listener
    this.eventMgr.addListener(eEventType.MouseLeftDown, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseLeftUp, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseLeftClick, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseLeftDblClick, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseMiddleDown, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseMiddleUp, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseMiddleClick, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseMiddleDblClick, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseRightDown, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseRightUp, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseRightClick, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseRightDblClick, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseWheelDown, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseWheelUp, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseBothDown, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseHover, this.rasterComponentEventListener);
    this.eventMgr.addListener(eEventType.MouseMove, this.rasterComponentEventListener);
}

Bridgeworks.prototype.onLoadModified = function()
{
    this.renderAgent.stop();
    //this.iscetAgent.stop(); There is no isectAgent in javascript version
    this.selector.stop();
    this.rasterComponentEventListener.stop();

    this.commandMgr.clearCommandSequenceStack();
    this.eventMgr.clearEvents();
    $('#RasterComponents').empty();
    //this.resouceMgr.clear(); There is no resourceMgr in javascript version
    this.selector.clearSelections();
    this.selector.getAttribute("lastSelectedName").setValueDirect("");
    this.viewportMgr.initLayout();

    this.registry.clear();
    g__nodeId__ = 0; // reset node ID counter
    
    this.initEventListeners();
    this.initRegistry();

    this.renderAgent.getAttribute("globalTimeInSecs").setValueDirect(0);

    this.graphMgr.reset();

    this.renderAgent.start();
    //this.iscetAgent.start(); There is no isectAgent in javascript version
    this.selector.start();
    this.rasterComponentEventListener.start();
    
    this.physicsSimulator.bodies.clear();
    this.physicsSimulator.deletePhysicsBodies();
    
    // TODO
    console.debug("TODO: " + arguments.callee.name);
}

Bridgeworks.prototype.resize = function(width, height)
{
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderContext.setViewport(this.canvas.offsetLeft, this.canvas.offsetTop, width, height);

    this.viewportMgr.getAttribute("width").setValueDirect(width);
    this.viewportMgr.getAttribute("height").setValueDirect(height);
}

Bridgeworks.prototype.render = function()
{
    this.eventMgr.processEvent(new Event(eEventType.RenderBegin));

    this.renderContext.clear();
    this.renderAgent.render();

    this.eventMgr.processEvent(new Event(eEventType.RenderEnd));
}

Bridgeworks.prototype.setRenderContext = function(rc)
{
    this.renderContext = rc;
    this.graphMgr.setRenderContext(rc);
}

Bridgeworks.prototype.updateScene = function(xml)
{
    var xmlString = new String(xml);
    var extension = xmlString.substr(xmlString.length - 3, 3);
    if (extension == "xml")
    {
        xml = loadXMLResource(this.contentDir + "/" + xml);
    }

    this.parser.parse(xml);
}

function Bridgeworks_OnLoadModifiedCB(attribute, container)
{
    container.onLoadModified();
}
