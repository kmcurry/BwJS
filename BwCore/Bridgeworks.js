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
    
    // configure dependencies
    this.factory.setGraphMgr(this.graphMgr);
    this.selector.setRayPick(this.rayPick);
    this.rasterComponentEventListener.setStyleMgr(this.styleMgr);
    this.rasterComponents = null;
    
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

Bridgeworks.prototype.handleEvent = function(event)
{
    var bwEvent = null;

    switch (getObjectClassName(event))
    {
        case "MouseEvent":
            {
                var absPos = getElementAbsolutePos(this.canvas);            
                event.canvasX = event.clientX - absPos.x;
                event.canvasY = event.clientY - absPos.y;
                bwEvent = this.eventAdapter.createMouseEvent(event);
            }
            break;
        case "KeyboardEvent":
            {
                bwEvent = this.eventAdapter.createKeyboardEvent(event);
            }
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

    // backward compatibility
    this.registry.registerByName(this.renderAgent, "AnimationAgent");
}

Bridgeworks.prototype.initEventListeners = function()
{
    // selector
    this.eventMgr.addListener(eEventType.MouseLeftDown, this.selector);
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

    this.commandMgr.clearCommandSequence();
    this.eventMgr.clearEvents();
    $('#RasterComponents').empty();
    //this.resouceMgr.clear(); There is no resourceMgr in javascript version
    this.selector.clearSelections();
    this.selector.getAttribute("lastSelectedName").setValueDirect("");
    this.viewportMgr.initLayout();
/*    std::map<std::string, std::pair<CAttribute*, CAttribute*> >::const_iterator it;
 for (it = m_messageSinks.begin(); it != m_messageSinks.end(); it++)
 {
 it->second.first->AddRef();
 it->second.second->AddRef();
 }*/

    this.registry.clear();
    this.initEventListeners();
    this.initRegistry();

    /*	for (it = m_messageSinks.begin(); it != m_messageSinks.end(); it++)
     {
     std::string data_name(it->first.c_str());
     data_name += "_data";

     dynamic_cast<AttributeRegistry*>(registry)->Register(it->second.first, it->first.c_str());
     it->second.first->Release();
     dynamic_cast<AttributeRegistry*>(registry)->Register(it->second.second, data_name.c_str());
     it->second.second->Release();
     }*/

    this.renderAgent.getAttribute("globalTimeInSecs").setValueDirect(0);

    this.graphMgr.reset();

    this.renderAgent.start();
    //this.iscetAgent.start(); There is no isectAgent in javascript version
    this.selector.start();
    this.rasterComponentEventListener.start();


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