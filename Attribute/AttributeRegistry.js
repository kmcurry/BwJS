AttributeRegistry.prototype = new AttributeContainer();
AttributeRegistry.prototype.constructor = AttributeRegistry;

function AttributeRegistry()
{
    AttributeContainer.call(this);
    this.className = "AttributeRegistry";
    this.attrType = eAttrType.AttributeRegistry;

    this.objectCount = 0;

    this.typeRegistry = [];
    this.nameRegistry = [];

    this.uniqueAttributes = [];
}

AttributeRegistry.prototype.addUnique = function(attribute)
{
    for (var i = 0; i < this.uniqueAttributes.length; i++)
    {
        if (this.uniqueAttributes[i] == attribute)
            return;
    }

    this.uniqueAttributes.push(attribute);
}

AttributeRegistry.prototype.removeUnique = function(attribute)
{
    for (var i = 0; i < this.uniqueAttributes.length; i++)
    {
        if (this.uniqueAttributes[i] == attribute)
        {
            this.uniqueAttributes.splice(i, 1);
            return;
        }
    }
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
        var name = attribute.getAttribute("name") || attribute.getAttribute("id");
        if (name)
        {
            this.registerByName(attribute, name.getValueDirect().join(""));
            name.addModifiedCB(AttributeRegistry_AttributeContainerNameModifiedCB, this);
        }
    }

    this.addUnique(attribute);
    this.objectCount++;

    attribute.onRegister(this);
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

    this.removeUnique(attribute);
    this.objectCount--;

    attribute.onUnregister(this);
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
                    for (var j = 0; j < perspectives.length; j++)
                    {
                        result.push(perspectives[j]);
                    }
                }
                var orthographics = this.getByType(eAttrType.OrthographicCamera);
                if (orthographics)
                {
                    for (var j = 0; j < orthographics.length; j++)
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
                for (var i = eAttrType.Evaluator + 1; i != eAttrType.Evaluator_End; i++)
                {
                    var evaluators = this.getByType(i);
                    if (evaluators)
                    {
                        for (var j = 0; j < evaluators.length; j++)
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
        for (var j = 0; j < this.nameRegistry[i].length; j++)
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
    for (var i in this.typeRegistry)
    {
        this.typeRegistry[i] = [];
    }
    this.typeRegistry = [];

    for (var i in this.nameRegistry)
    {
        this.nameRegistry[i] = [];
    }
    this.nameRegistry = [];

    this.uniqueAttributes = [];

    this.objectCount = 0;
}

AttributeRegistry.prototype.getObjectCount = function()
{
    return this.uniqueAttributes.length;
}

AttributeRegistry.prototype.getObject = function(num)
{
    if (num < this.uniqueAttributes.length)
    {
        return this.uniqueAttributes[num];
    }

    return null;
}

function AttributeRegistry_AttributeContainerNameModifiedCB(attribute, container)
{
    container.updateName(attribute.getContainer(), attribute.getValueDirect().join(""));
}