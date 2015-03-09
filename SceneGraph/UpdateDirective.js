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
    // call base-class implementation
    SGDirective.prototype.setGraphMgr.call(this, graphMgr);
    
    this.collideDirective.setGraphMgr(graphMgr);  
}

UpdateDirective.prototype.execute = function(root, detectCollision)
{
    root = root || this.rootNode.getValueDirect();
    if (detectCollision == undefined) detectCollision = true;
    
    this.update();
   
    if (detectCollision)
    {
        // detect collisions
        collideParams = new CollideParams();
        collideParams.directive = this.collideDirective;
        this.collideDirective.execute(root, collideParams);
        
        // update (second pass)
        this.update();
    }
}

UpdateDirective.prototype.update = function()
{
    var params = new UpdateParams();
    params.directive = this.updateDirective;
    params.disableDisplayLists = this.resetDisplayLists; 
    params.timeIncrement = this.timeIncrement.getValueDirect();
    
    for (var i in this.graphMgr.updateRegistry.nodes)
    {
        this.graphMgr.updateRegistry.nodes[i].update(params, false);
    }
    
    this.graphMgr.updateRegistry.clear();
}