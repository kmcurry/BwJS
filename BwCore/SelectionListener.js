function Selections()
{
    this.viewports = [];
    this.cameras = [];
    this.lights = [];
    this.models = [];
    this.surfaces = [];
    this.labels = [];
    
    this.clear = function()
    {
        this.viewports = [];
        this.cameras = [];
        this.lights = [];
        this.models = [];
        this.surfaces = [];
        this.labels = [];
    }
}

SelectionListener.prototype = new EventListener();
SelectionListener.prototype.constructor = SelectionListener;

function SelectionListener()
{
    EventListener.call(this);
    this.className = "SelectionListener";

    this.name.setValueDirect("Selector");

    this.rayPick = null;
    this.selections = new Selections();
    this.selected = null;
    
    this.selectionOccurred = new PulseAttr();
    this.selectionCleared = new PulseAttr();
    this.pointView = new Vector3DAttr();
    this.pointWorld = new Vector3DAttr();
    this.pointObject = new Vector3DAttr();
    this.pointGeo = new Vector3DAttr();
    this.triIndex = new NumberAttr();
    this.distance = new NumberAttr();
    this.distanceFromScreenCenter = new NumberAttr();
    this.computePivotDistance = new BooleanAttr(true);
    this.selectedName = new StringAttr();
    this.selectedElement = new NumberAttr(-1);	// this.registered when the selection has a selected element
    this.lastSelectedName = new StringAttr();

    this.pointWorld.addModifiedCB(SelectionListener_PointWorldModifiedCB, this);

    this.registerAttribute(this.selectionOccurred, "selectionOccurred");
    this.registerAttribute(this.selectionCleared, "selectionCleared");
    this.registerAttribute(this.pointView, "pointView");
    this.registerAttribute(this.pointWorld, "pointWorld");
    this.registerAttribute(this.pointObject, "pointObject");
    this.registerAttribute(this.pointGeo, "pointGeo");
    this.registerAttribute(this.triIndex, "triIndex");
    this.registerAttribute(this.distance, "distance");
    this.registerAttribute(this.distanceFromScreenCenter, "distanceFromScreenCenter");
    this.registerAttribute(this.computePivotDistance, "computePivotDistance");
    this.registerAttribute(this.selectedName, "selectedName");
    this.registerAttribute(this.lastSelectedName, "lastSelectedName");
    
    this.numResponses.setValueDirect(-1);
}

SelectionListener.prototype.setRayPick = function(rayPick)
{
    this.rayPick = rayPick;
    
    var clickPoint = this.rayPick.getAttribute("clickPoint");
    this.registerAttribute(clickPoint, "clickPoint");
    clickPoint.addModifiedCB(SelectionListener_ClickPointModifiedCB, this);
}

SelectionListener.prototype.eventPerformed = function(event)
{
    // if mouse-move event, don't process if any other mouse button is pressed (this affects object inspection)
    switch (event.type)
    {
        case eEventType.MouseMove:
        {
            if (event.inputId & MOUSEEVENT_LEFT_BUTTON ||
                event.inputId & MOUSEEVENT_MIDDLE_BUTTON ||
                event.inputId & MOUSEEVENT_RIGHT_BUTTON)
                return;        
        }
        break;
    }
    
    // TODO: allow for multi-select (clear if Ctrl is not pressed)
    this.clearSelections();
    
    this.getAttribute("clickPoint").setValueDirect(event.x, event.y);
}

SelectionListener.prototype.registerSelection = function(node, element)
{
    // only register first item
    if (this.selected) return;
    
    this.selected = node;
    
    // registering an attribute that has a NULL container (Get/SetContainer()) will set
    // the calling object as the container; don't want this behavior here
    var lastContainer = this.selected.getContainer();
    this.registerAttribute(this.selected, "Selected");	// unregistered in clearSelections()
    this.selected.setContainer(lastContainer);
	
    var name = node.getAttribute("name").getValueDirect().join("");
    //OutputDebugMsg("Selected: " + name);

    this.selectedName.setValueDirect(name);
    
    if (element >= 0)
    {
        this.selectedElement.setValueDirect(element);
        this.selected.registerAttribute(this.selectedElement, "selectedElement");
    }
}

SelectionListener.prototype.clearSelections = function()
{
    this.selections.clear();
   
    this.selectedElement.setValueDirect(-1);
    if (this.selected && this.selected.getAttribute("selectedElement"))
    {
        this.selected.unregisterAttribute(this.selectedElement);
    }

    this.selectedName.setValueDirect("");
    this.unregisterAttribute(this.selected);
    this.selected = null;
    
    this.selectionCleared.pulse();
}

SelectionListener.prototype.processPick = function(pick)
{
    for (var i=0; i < pick.path.length; i++)
    {
        var node = pick.path[i];
        
        // if selectable or show is false, or polygons are flipped, skip
        var selectable = node.getAttribute("selectable");
        var show = node.getAttribute("show");
        var flipPolygons = node.getAttribute("flipPolygons");
        if ((selectable && selectable.getValueDirect() == false) ||
            (show && show.getValueDirect() == false) ||
            (flipPolygons && flipPolygons.getValueDirect() == true))
            {
            continue;
        }      
        
        var element = -1;
        switch (node.attrType)
        {
            case eAttrType.PerspectiveCamera:
            case eAttrType.OrthographicCamera:
            {
                this.selections.cameras.push(node);
            }
            break;
		    
            case eAttrType.DirectionalLight:
            case eAttrType.PointLight:
            case eAttrType.SpotLight:
            {
                this.selections.lights.push(node);
            }
            break;
		    
            case eAttrType.Model:
            {
                this.selections.models.push(node);
                this.registerSelection(node, element);
            }
            break;
            
            case eAttrType.Surface:
            {
                this.selections.surfaces.push(node);
            }
            break;

            case eAttrType.Label:
            {
                this.selections.labels.push(node);
                this.registerRasterComponentSelection(node, element);
            }
        }
    }
    
    if (this.selected)
    {
        this.pointObject.setValueDirect(pick.intersectRecord.pointModel.x, pick.intersectRecord.pointModel.y, pick.intersectRecord.pointModel.z);
        this.pointWorld.setValueDirect(pick.intersectRecord.pointWorld.x, pick.intersectRecord.pointWorld.y, pick.intersectRecord.pointWorld.z);
        this.pointView.setValueDirect(pick.intersectRecord.pointView.x, pick.intersectRecord.pointView.y, pick.intersectRecord.pointView.z);
        this.triIndex.setValueDirect(pick.intersectRecord.triIndex);
        this.distance.setValueDirect(pick.intersectRecord.distance);
    }
    
    return (this.selected ? true : false);
}

SelectionListener.prototype.processPicks = function(picks)
{
    for (var i=0; i < picks.length; i++)
    {
        if (this.processPick(picks[i]) == true)
        {
            return true;
        }
    }   
    
    return false;
}

SelectionListener.prototype.registerRasterComponentSelection = function(rc,element)
{
    // if a GUI has already been selected, replace if node paramter has a greater renderedSlot value
    if (this.selected)
    {
        var selected = this.selected;
        if (selected)
        {
            var renderedSlotSelection = rc.renderedSlot.getValueDirect();
            var renderedSlotSelected = selected.renderedSlot.getValueDirect();

            if (renderedSlotSelection > renderedSlotSelected)
            {
                return this.registerSelection(rc, element, true);
            }
        }
    }
    else // no previous selection, register
    {
        this.registerSelection(rc, element);
    }

}
SelectionListener.prototype.clickPointModified = function()
{
    var point = this.getAttribute("clickPoint").getValueDirect();
    var vpMgr = this.registry.find("ViewportMgr");
    var vp = vpMgr.getViewportAtScreenXY(point.x, point.y);
    this.selections.viewports.push(vp.viewport);
    this.rayPick.getAttribute("viewport").setValueDirect(vp.viewport.x, vp.viewport.y, vp.viewport.width, vp.viewport.height);
    this.rayPick.getAttribute("camera").setValueDirect(vp.camera);
    var root = this.registry.getAttribute("rootPtr").getValueDirect();
    this.rayPick.execute(root);
    if (this.rayPick.picked.length > 0)
    {
        this.processPicks(this.rayPick.picked);
        this.selectionOccurred.pulse();
    }
    // update distance from screen center
    this.updateDistanceFromScreenCenter(root);
    // update scene inspector with selected camera
    this.updateSceneInspectionCamera(vp.camera);
}

SelectionListener.prototype.updateDistanceFromScreenCenter = function(root)
{
    if (this.computePivotDistance.getValueDirect() == false)
    {
        return;
    }

    // get window center and set to ray pick's click point
    var bworks = this.registry.find("Bridgeworks");
    if (!bworks) return;
    var x = bworks.canvas.width / 2;
    var y = bworks.canvas.height / 2;
    var lastClickPoint = this.rayPick.getAttribute("clickPoint").getValueDirect();
    var params = new AttributeSetParams(-1, -1, 0, false, false);   
    this.rayPick.getAttribute("clickPoint").setValueDirect(x, y, params);
    
    // execute
    this.rayPick.execute(root);
    
    // cycle through picked list and skip labels and poly lines
    // NOTE: we may eventually want the convenience of pivoting about a label because labels are sometimes easier 
    // to intersect (i.e., when the model is too small to intersect)
    var found = false;
    for (var i=0; i < this.rayPick.picked.length && !found; i++)
    {
        if (this.rayPick.picked[i].intersectRecord.distance != 0) // labels and poly lines have a distance of 0
        {
            // found selected geometry, update distance from screen center
            this.distanceFromScreenCenter.setValueDirect(this.rayPick.picked[i].intersectRecord.distance);
            found = true;
            break;
        }
    }

    // restore previous click point
    this.rayPick.getAttribute("clickPoint").setValueDirect(lastClickPoint.x, lastClickPoint.y, params);   
}

SelectionListener.prototype.updateSceneInspectionCamera = function(camera)
{
    var si = this.registry.find("SceneInspector");
    if (si)
    {
        if (si.getCamera() == camera) return; // already connected
        
        // disconnect old camera, connect new one
        var connectionMgr = this.registry.find("ConnectionMgr");
        if (connectionMgr)
        {
            connectionMgr.disconnectSceneInspection(si, si.getCamera());
            connectionMgr.connectSceneInspection(si, camera);
        }
    }
}

function SelectionListener_ClickPointModifiedCB(attribute, container)
{
    container.clickPointModified();
}

function SelectionListener_PointWorldModifiedCB(attribute, container)
{
}