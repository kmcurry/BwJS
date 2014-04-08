Agent.prototype = new AttributeContainer();
Agent.prototype.constructor = Agent;

function Agent()
{
    AttributeContainer.call(this);
    this.className = "Agent";
    
    this.running = false;
    
    this.name = new StringAttr("");
    this.enabled = new BooleanAttr(true);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.enabled, "enabled");
}

Agent.prototype.start = function()
{
    this.running = true;
}

Agent.prototype.stop = function()
{
    this.running = false;
}

Agent.prototype.pause = function()
{
    this.running = false;
}


