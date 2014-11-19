ContentBuilder.prototype = new AttributeContainer();
ContentBuilder.prototype.constructor = ContentBuilder;

function ContentBuilder()
{
    AttributeContainer.call(this);
    this.className = "ContentBuilder";
    
    this.factory = null;
    
    this.cameras = [];
    this.lights = [];
    this.models = [];
    this.evaluators = [];
    
    this.layer = 0;
    this.invertAlpha = new BooleanAttr(false);
    
    this.registerAttribute(this.invertAlpha, "invertAlpha");
}

ContentBuilder.prototype.setRegistry = function(registry)
{
    AttributeContainer.prototype.setRegistry.call(this, registry); 
    
    this.factory = this.registry.find("AttributeFactory");   
}

ContentBuilder.prototype.visitHandler = function(handler)
{
}
/*
ContentBuilder.prototype.configure = function(models, evaluators)
{
    this.models = models;
    this.evaluators = evaluators;
}
*/
ContentBuilder.prototype.finalize = function()
{
}

ContentBuilder.prototype.matchesType = function(type)
{
}
