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
    
    this.enableDisplayList = new BooleanAttr(true);
    this.autoDisplayList = new BooleanAttr(true);
    this.updateDisplayList = new PulseAttr();
    
    this.registerAttribute(this.enableDisplayList, "enableDisplayList");
    this.registerAttribute(this.autoDisplayList, "autoDisplayList");
    this.registerAttribute(this.updateDisplayList, "updateDisplayList");
}

SGNode.prototype.setGraphMgr = function(graphMgr)
{
    this.graphMgr = graphMgr;
    this.displayListObj = new DisplayListObj(this.graphMgr.renderContext);
}

SGNode.prototype.update = function(params, visitChildren)
{
    // don't update if not enabled and not modified
    if (!(this.enabled.getValueDirect()) && !this.thisModified)
    {
        return;
    }

    // only update if this and/or child has been modified
    if (!this.thisModified && !this.childModified)
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
    
    if (visitChildren)
    {
        // call for all children
        for (var i=0; i < this.children.length; i++)
        {
            this.children[i].update(params, visitChildren);
        }
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
    
    switch (directive)
    {
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
        case "rayPick":
            {
                params.currentNodePath.pop();
            }
            break;
    }
}

SGNode.prototype.isRecordingDisplayList = function()
{
    
}

SGNode.prototype.enableDisplayListModified = function()
{
    
}

function SGNode_EnableDisplayListModifiedCB(attribute, container)
{
    
}

function SGNode_AutoDisplayListModifiedCB(attribute, container)
{
    
}

function SGNode_UpdateDisplayListModifiedCB(attribute, container)
{
    
}
