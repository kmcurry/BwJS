NodeRegistry.prototype = new AttributeContainer();
NodeRegistry.prototype.constructor = NodeRegistry;

function NodeRegistry()
{
    AttributeContainer.call(this);
    this.className = "NodeRegistry";
    
    this.nodes = [];
}

NodeRegistry.prototype.register = function(node)
{
    this.nodes[node.__nodeId__] = node;
}

NodeRegistry.prototype.unregister = function(node)
{
    // TODO
}

NodeRegistry.prototype.clear = function()
{
    this.nodes = [];
}
