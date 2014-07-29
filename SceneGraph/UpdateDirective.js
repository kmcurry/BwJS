UpdateParams.prototype = new DirectiveParams();
UpdateParams.prototype.constructor = UpdateParams();

function UpdateParams() // combined CUpdateParams & GtUpdateParams in this version
{
    DirectiveParams.call(this);
    
    this.pass = 0;
    this.timeIncrement = 0;
    this.visited = [];
    this.nextPass = [];
    this.displayListObj = null;
    this.disableDisplayLists = false;
}

UpdateDirective.prototype = new SGDirective();
UpdateDirective.prototype.constructor = UpdateDirective;

function UpdateDirective()
{
    SGDirective.call(this);
    this.className = "UpdateDirective";
    this.attrType = eAttrType.UpdateDirective;
    
    this.name.setValueDirect("UpdateDirective");
}

UpdateDirective.prototype.execute = function(root, params)
{
    root = root || this.rootNode.getValueDirect();
    
    // update (perform first pass)
    root.update(params, true);
    
    // update (perform subsequent passes while nextPass vector is not empty)
    while (params.nextPass.length > 0)
    {
        params.pass++;
        
        // get nodes to visit this pass
        var nodes = [];
        for (var i=0; i < params.nextPass.length; i++)
        {
            nodes[i] = params.nextPass[i];
        }
        params.nextPass.length = 0;
          
        for (var i=0; i < nodes.length; i++)
        {
            nodes[i].update(params, false);
        }
    }
    
    return params.visited;
}