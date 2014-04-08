SGNode.prototype = new Node();
SGNode.prototype.constructor = SGNode;

function SGNode()
{
    Node.call(this);
    this.className = "SGNode";
    
    this.graphMgr = null;
    this.modificationCount = 0;
}

SGNode.prototype.setGraphMgr = function(graphMgr)
{
    this.graphMgr = graphMgr;
}

SGNode.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    Node.prototype.update.call(this, params, visitChildren);
}

SGNode.prototype.apply = function(directive, params, visitChildren)
{
    // call base-class implementation
    Node.prototype.apply.call(this, directive, params, visitChildren);
}

SGNode.prototype.incrementModificationCount = function()
{
    this.modificationCount++;
}
