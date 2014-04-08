AttributeRegistry.prototype = new AttributeContainer();
AttributeRegistry.prototype.constructor = AttributeRegistry;

function AttributeRegistry()
{
    AttributeContainer.call(this);
    this.className = "AttributeRegistry";
    this.attrType = eAttrType.AttributeRegistry;
    
    this.typeRegistry = [];
    this.nameRegistry = [];
}

AttributeRegistry.prototype.registerByType = function(attribute, type)
{
    if (this.typeRegistry[type] == undefined)
    {
        this.typeRegistry[type] = new Array();
    }
    
    this.typeRegistry[type].push(attribute);
}

AttributeRegistry.prototype.registerByName = function(attribute, name)
{
    if (name.length == 0)
    {
        name = "unnamed";
    }
    
    if (this.nameRegistry[name] == undefined)
    {
        this.nameRegistry[name] = new Array();
    }

    this.nameRegistry[name].push(attribute);
}

AttributeRegistry.prototype.register = function(attribute)
{
    // register using type
    this.registerByType(attribute, attribute.attrType);
    
    // register using name attribute if container
    if (attribute.isContainer())
    {
        var name = attribute.getAttribute("name") ||
                   attribute.getAttribute("id");
        if (name)
        {
            this.registerByName(attribute, name.getValueDirect().join(""));
            name.addModifiedCB(AttributeRegistry_AttributeContainerNameModifiedCB, this); 
        }
    }
}

AttributeRegistry.prototype.unregisterByType = function(attribute, type)
{
    if (this.typeRegistry[type])
    {
        this.typeRegistry[type].splice(this.typeRegistry[type].indexOf(attribute), 1);
    }
}

AttributeRegistry.prototype.unregisterByName = function(attribute, name)
{
    if (name.length == 0)
    {
        name = "unnamed";
    }
    
    if (this.nameRegistry[name])
    {
        this.nameRegistry[name].splice(this.nameRegistry[name].indexOf(attribute), 1);
    }
}

AttributeRegistry.prototype.unregister = function(attribute)
{
    // register using type
    this.unregisterByType(attribute, attribute.attrType);
    
    // register using name attribute if container
    if (attribute.isContainer())
    {
        var name = attribute.getAttribute("name") ||
                   attribute.getAttribute("id");
        if (name)
        {
            this.unregisterByName(attribute, name.getValueDirect().join(""));
            name.removeModifiedCB(AttributeRegistry_AttributeContainerNameModifiedCB, this); 
        }
    }
}

AttributeRegistry.prototype.getByType = function(type)
{
    switch (type)
    {
    case eAttrType.Camera:
        {
            var result = [];
            var perspectives = this.getByType(eAttrType.PerspectiveCamera);
            if (perspectives)
            {
                for (var j=0; j < perspectives.length; j++)
                {
                    result.push(perspectives[j]);
                }
            }
            var orthographics = this.getByType(eAttrType.OrthographicCamera);
            if (orthographics)
            {
                for (var j=0; j < orthographics.length; j++)
                {
                    result.push(orthographics[j]);
                }
            }
            return result;
        }
        break;
        
    case eAttrType.Evaluator:
        {
            var result = [];
            for (var i=eAttrType.Evaluator+1; i != eAttrType.Evaluator_End; i++)
            {
                var evaluators = this.getByType(i);
                if (evaluators)
                {
                    for (var j=0; j < evaluators.length; j++)
                    {
                        result.push(evaluators[j]);
                    }
                }    
            }   
            return result;
        }
        break;
        
    default:
        {
            return this.typeRegistry[type];
        }
        break;    
    }
}

AttributeRegistry.prototype.getByName = function(name)
{
    return this.nameRegistry[name];
}

AttributeRegistry.prototype.updateName = function(container, name)
{
    for (var i in this.nameRegistry)
    {
        for (var j=0; j < this.nameRegistry[i].length; j++)
        {
            if (this.nameRegistry[i][j] == container)
            {
                this.nameRegistry[i].splice(j, 1);
                this.registerByName(container, name);
                return;
            }
        }
    }
}

AttributeRegistry.prototype.clear = function()
{
    this.typeRegistry.length = 0;
    this.nameRegistry.length = 0;
}

function AttributeRegistry_AttributeContainerNameModifiedCB(attribute, container)
{
    container.updateName(attribute.getContainer(), attribute.getValueDirect().join(""));
}