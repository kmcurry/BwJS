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
    
    this.timeIncrement = new NumberAttr(0);
    
    this.registerAttribute(this.timeIncrement, "timeIncrement");
    
    this.collideDirective = new CollideDirective();
}

UpdateDirective.prototype.setRegistry = function(registry)
{
    this.collideDirective.setRegistry(registry);
    
    // call base-class implementation
    SGDirective.prototype.setRegistry.call(this, registry);    
}

UpdateDirective.prototype.setGraphMgr = function(graphMgr)
{
    this.collideDirective.setGraphMgr(graphMgr);
    
    // call base-class implementation
    SGDirective.prototype.setGraphMgr.call(this, graphMgr);
}

UpdateDirective.prototype.execute = function(root, detectCollision)
{
    root = root || this.rootNode.getValueDirect();
    if (detectCollision == undefined) detectCollision = true;
    
    var params = new UpdateParams();
    params.directive = this.updateDirective;
    params.disableDisplayLists = this.resetDisplayLists; 
    params.timeIncrement = this.timeIncrement.getValueDirect();
    
    // update (perform first pass)
    root.update(params, true);

    if (detectCollision)
    {
        // detect collisions
        collideParams = new CollideParams();
        collideParams.directive = this.collideDirective;
        this.collideDirective.execute(root, collideParams);
        
        // update (second pass)
        root.update(params, true);
    }

    return params.visited;
}