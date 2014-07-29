SGNode.prototype = new Node();
SGNode.prototype.constructor = SGNode;

function SGNode()
{
    Node.call(this);
    this.className = "SGNode";
    
    this.graphMgr = null;
    this.recordDisplayList = false;
    this.disableDisplayLists = false;
    this.displayListObj = null;
    
    this.enableDisplayList = new BooleanAttr(false);
    this.autoDisplayList = new BooleanAttr(false);
    this.updateDisplayList = new PulseAttr();
    
    this.registerAttribute(this.enableDisplayList, "enableDisplayList");
    this.registerAttribute(this.autoDisplayList, "autoDisplayList");
    this.registerAttribute(this.updateDisplayList, "updateDisplayList");
}

SGNode.prototype.setGraphMgr = function(graphMgr)
{
    this.graphMgr = graphMgr;
}

SGNode.prototype.update = function(params, visitChildren)
{
    // don't update if not enabled and not modified
    if (!(this.enabled.getValueDirect()) && !this.thisModified)
    {
        return;
    }

    // only update if this and/or child has been modified, and
    // display lists are enabled
    if (!this.thisModified && !this.childModified &&
         this.enableDisplayList.getValueDirect() == false &&
         this.autoDisplayList.getValueDirect() == false)
    {
        // no need to update; inform parent this node is unmodified
        this.setChildModified(false, false);
        params.visited.push(this);
        return;
    }
    
    params.visited.push(this);
    
    var subtreeModified = false;

    if (this.thisModified)
    {
        subtreeModified = true;
        this.thisModified = false;
    }

    if (this.childModified)
    {
        subtreeModified = true;
    }
    
    if (this.disableDisplayLists)
    {
        params.disableDisplayLists = true;
        this.disableDisplayLists = false;
    }
    
    // if the subtree has been modified, disable display list for this node
    if (subtreeModified)
    {
        this.enableDisplayList.setValueDirect(false);
        this.recordDisplayList = true; // re-record when (and if) list is re-enabled
    }
    
    // if using auto-display lists...
    // if the subtree has not been modified, enable display list for this node
    if (this.autoDisplayList.getValueDirect() && !subtreeModified)
    {
        this.enableDisplayList.setValueDirect(true);
    }

    // if there is already a current display list, or the manual override flag for disabling display lists is set, disable display list for this node
    if (params.displayListObj || params.disableDisplayLists)
    {
        this.enableDisplayList.setValueDirect(false);
    }

    // if enable display list is true, create display list object if not yet created and set recording to true
    if (this.enableDisplayList.getValueDirect())
    {
        if (!this.displayListObj)
        {
            this.createDisplayList();

            this.recordDisplayList = true;
        }
        
        // if recording is set to false, do not visit children
        if (!this.recordDisplayList)
        {
            visitChildren = false;
        }

        params.displayListObj = this.displayListObj;
    }
    
    if (visitChildren)
    {
        // call for all children
        for (var i=0; i < this.children.length; i++)
        {
            this.children[i].update(params, visitChildren);
        }
    }
    
    // if display list object was set to the update params, clear it
    if (params.displayListObj == this.displayListObj)
    {
        params.displayListObj = null;
    }
    
    this.childModified = this.isChildModified();
}

SGNode.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }
    
    var useDisplayList = false;
    
    switch (directive)
    {
        case "render":
            {
                if (params.resetDisplayLists)
                {
                    this.recordDisplayList = true;
                }
                
                // determine if display list should be used; if a display list (from a parent node) is already operating, don't nest record or play...
                // this node's display list operations  will be recorded by the currently operating display list; also check manual override flag for disabling
                // display lists
                useDisplayList = this.enableDisplayList.getValueDirect() && 
                                 this.displayListObj &&
                                 !params.displayListObj && 
                                 !params.disableDisplayLists;
    
                if (useDisplayList)
                {
                    // set as current display list
                    params.displayListObj = this.displayListObj;
    
                    if (this.recordDisplayList)
                    {
                        // start recording render engine calls
                        this.displayListObj.record_begin();
                    }
                    else // !this.recordDisplayList
                    {
                        // playback render engine calls and do not visit children
                        this.displayListObj.play();
                        visitChildren = false;
                    }  
                }
            }
            break;
            
        case "rayPick":
            {
                params.currentNodePath.push(this);
            }
            break;
            
        default:
            {
                // call base-class implementation
                Node.prototype.apply.call(this, directive, params, visitChildren);
                return;
            }
            break;
    }
        
    if (visitChildren)
    {
        if (params.path)
        {
            // call for next node in path if next node in path is a child of this node
            if (params.path.length > params.pathIndex)
            {
                for (var i=0; i < this.children.length; i++)
                {
                    var next = params.path[params.pathIndex];

                    if (this.children[i] == next)
                    {
                        params.pathIndex++;
                        this.children[i].apply(directive, params, visitChildren);
                    }
                }
            }
        }
        else
        {
            // call for all children
            for (var i=0; i < this.children.length; i++)
            {
                this.children[i].apply(directive, params, visitChildren);
            }
        }
    }
    
    switch (directive)
    {
        case "render":
            {
                if (useDisplayList)
                {
                    if (this.recordDisplayList)
                    {
                        // stop recording render engine calls
                        this.displayListObj.record_end();
                        this.recordDisplayList = false;
                    }
    
                    // clear current display list
                    params.displayListObj = null;
                }
            }
            break;
            
        case "rayPick":
            {
                params.currentNodePath.pop();
            }
            break;
    }
}

SGNode.prototype.isRecordingDisplayList = function()
{
    if (this.graphMgr.renderContext.getDisplayList())
    {
        return true;
    }   
    
    return false; 
}

SGNode.prototype.createDisplayList = function()
{
    this.displayListObj = new DisplayListObj(this.graphMgr.renderContext);  
}

SGNode.prototype.deleteDisplayList = function()
{
    this.displayListObj = null;    
}

SGNode.prototype.enableDisplayListModified = function()
{   
}

function SGNode_EnableDisplayListModifiedCB(attribute, container)
{
    container.enableDisplayListModified();  
}

function SGNode_AutoDisplayListModifiedCB(attribute, container)
{    
}

function SGNode_UpdateDisplayListModifiedCB(attribute, container)
{
    container.disableDisplayLists = true;    
}
