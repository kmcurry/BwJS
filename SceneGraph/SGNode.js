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

    this.modified.addModifiedCB(SGNode_ModifiedModifiedCB, this);
    
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
    if (this.recordDisplayList)
    {
        this.createDisplayList();
    }

    Node.prototype.update.call(this, params, visitChildren);
}

SGNode.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled_)
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
                        this.displayListObj != null &&
                        params.displayListObj == null &&
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
                for (var i = 0; i < this.children.length; i++)
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
            for (var i = 0; i < this.children.length; i++)
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

SGNode.prototype.setModified = function()
{
    // call base-class implementation
    Node.prototype.setModified.call(this);

    this.recordDisplayList = true;
}

function SGNode_ModifiedModifiedCB(attribute, container)
{
    container.recordDisplayList = true;
}
