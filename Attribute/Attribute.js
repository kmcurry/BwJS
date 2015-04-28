var eAttrSetOp = {
    Replace     :0,  
    Add		:1,
    Subtract	:2,
    Multiply	:3,
    Divide	:4,
    Append	:5,
    AND		:6,
    OR		:7,
    XOR         :8,
    NAND	:9,
    NOR		:10
};

function AttributeTargetDesc(target, 
                             sourceElementIndex, 
                             targetElementIndex,
                             op,
                             converter)
{
    if (sourceElementIndex == undefined) sourceElementIndex = -1;
    if (targetElementIndex == undefined) targetElementIndex = -1;
    
    this.target = target || null;
    this.sourceElementIndex = sourceElementIndex;
    this.targetElementIndex = targetElementIndex;
    this.op = op || eAttrSetOp.Replace;
    this.converter = converter || null;
}

function AttributeSourceDesc(source,
                             sourceElementIndex,
                             targetElementIndex,
                             op,
                             converter)
{
    if (sourceElementIndex == undefined) sourceElementIndex = -1;
    if (targetElementIndex == undefined) targetElementIndex = -1;
    
    this.source = source || null;
    this.sourceElementIndex = sourceElementIndex;
    this.targetElementIndex = targetElementIndex;
    this.op = op || eAttrSetOp.Replace;
    this.converter = converter || null;
}

function AttributeGetParams(elementIndex,
                            valueElementIndex)
{
    if (elementIndex == undefined) elementIndex = -1;
    if (valueElementIndex == undefined) valueElementIndex = -1;
    
    this.elementIndex = elementIndex;
    this.valueElementIndex = valueElementIndex;
}

function AttributeSetParams(elementIndex,
                            valueElementIndex,
                            op,
                            updateTargets,
                            alertModifiedCBs,
                            caller)
{
    if (elementIndex == undefined) elementIndex = -1;
    if (valueElementIndex == undefined) valueElementIndex = -1;
    
    this.elementIndex = elementIndex;
    this.valueElementIndex = valueElementIndex;
    this.op = op || eAttrSetOp.Replace;
    this.updateTargets = updateTargets != undefined ? updateTargets : true;
    this.alertModifiedCBs = alertModifiedCBs != undefined ? alertModifiedCBs : true;
    this.caller = caller != undefined ? caller : null;
}
                            
Attribute.prototype = new Base();
Attribute.prototype.constructor = Attribute;

function Attribute() 
{
    Base.call(this);
    this.className = "Attribute";
    this.attrType = eAttrType.Attribute;
    this.attrElemType = eAttrElemType.Attribute;
    
    this.native = true;
    this.transient = false;
    this.persistent = false;
    this.deserialized = false;
    this.modificationCount = -1;
    
    this.values = [];
    this.lastValues = [];
    this.modifiedCBs = [];
    this.modifiedCBsData = [];
    this.targets = [];
    this.sources = [];
    this.container = null;
    this.registry = null;
}

Attribute.prototype.destroy = function()
{
    // remove all targeting associated with this
    this.removeAllSources();
    this.removeAllTargets();
    
    // call base-class implementation
    Base.prototype.destroy.call(this);
}

Attribute.prototype.clone = function()
{
    return null;
}

Attribute.prototype.getValue = function(values, params)
{
    var elementIndex = (params ? params.elementIndex : -1);
    
    if (elementIndex < 0)
    {
        if (this.values == null)
        {
            values[0] = null;
        }
        else if (this.values.length == undefined)
        {
            values[0] = this.values;
        }
        else // this.values.length > 0
        {
            for (var i=0; i < this.values.length; i++)
            {
                values[i] = this.values[i];
            }
        }
    }
    else // elementIndex >= 0
    {
        var valueElementIndex = Math.max(0, params ? params.valueElementIndex : 0);
            
        values[valueElementIndex] = this.values[elementIndex];
    }
}

Attribute.prototype.getLastValue = function(values, params)
{
    var elementIndex = (params ? params.elementIndex : -1);
    
    if (elementIndex < 0)
    {
        if (this.lastValues == null)
        {
            values[0] = null;
        }
        else if (this.lastValues.length == undefined)
        {
            values[0] = this.lastValues;
        }
        else // this.values.length > 0
        {
            for (var i=0; i < this.lastValues.length; i++)
            {
                values[i] = this.lastValues[i];
            }
        }
    }
    else // elementIndex >= 0
    {
        var valueElementIndex = Math.max(0, params ? params.valueElementIndex : 0);
            
        values[valueElementIndex] = this.lastValues[elementIndex];
    }
}

Attribute.prototype.setValue = function(values, params)
{
    this.lastValues = this.values.slice();
    
    var elementIndex = (params ? params.elementIndex : -1);
    var op = (params ? params.op : eAttrSetOp.Replace);

    if (elementIndex < 0)
    {
        if (values == null)
        {
            this.values[0] = null;
        }
        else if (values.length == undefined)
        {
            switch (op)
            {
                case eAttrSetOp.Add: this.values[0] += values; break;
                case eAttrSetOp.Replace: this.values[0] = values; break;
                case eAttrSetOp.AND: this.values[0] &= values; break;
                default: alert("unsupported operation passed to Attribute::setValue"); break; // TODO: add support
            }
        }
        else // values.length > 0
        {
            this.values.length = values.length;
            for (var i = 0; i < values.length; i++)
            {
                switch (op)
                {
                    case eAttrSetOp.Add: this.values[i] += values[i]; break;
                    case eAttrSetOp.Replace: this.values[i] = values[i]; break;
                    case eAttrSetOp.AND: this.values[i] &= values[i]; break;
                    default: alert("unsupported operation passed to Attribute::setValue"); break; // TODO: add support
                }
            }
        }
    }
    else // elementIndex >= 0
    {
        if (values == null)
        {
            this.values[elementIndex] = null;
        }
        else if (values.length == undefined)
        {
            this.values[elementIndex] = values;
        }
        else // values.length > 0
        {
            var valueElementIndex = Math.max(0, params ? params.valueElementIndex : 0);
            this.values[elementIndex] = values[valueElementIndex];
        }
    }

    // alert modified CBs
    var alertModifiedCBs = (params ? params.alertModifiedCBs : true);
    if (alertModifiedCBs)
    {
        for (var i = 0; i < this.modifiedCBs.length; i++)
        {
            this.modifiedCBs[i](this, this.modifiedCBsData[i]);
        }
    }

    // update targets
    var updateTargets = (params ? params.updateTargets : true);
    if (updateTargets)
    {
        var caller = (params ? params.caller : null);
        for (var i = 0; i < this.targets.length; i++)
        {
            var targetDesc = this.targets[i];
            if (caller == targetDesc.target) continue;
            var params = new AttributeSetParams(targetDesc.targetElementIndex, targetDesc.sourceElementIndex,
                                                targetDesc.op, true, true, this);
            targetDesc.target.setValue(this.values, params);
        }
    }
    
    this.modificationCount++;
}

Attribute.prototype.revertValues = function()
{
    this.setValue(this.lastValues, null);
}

Attribute.prototype.getElement = function(index)
{
    if (this.values.length > index)
    {
        return this.values[index];
    }

    return undefined;
}

Attribute.prototype.setElement = function(index, value, op, updateTargets)
{
    console.debug("TODO: " + arguments.callee.name);
}

Attribute.prototype.getLength = function()
{
    if (this.values.length == undefined)
    {
        return (this.values == undefined ? 0 : 1);
    }   
    
    return this.values.length; 
}

Attribute.prototype.setLength = function(length)
{
    this.values.length = length;
}

Attribute.prototype.addModifiedCB = function(callback, data)
{
    // don't add dups
    var indexCB = this.modifiedCBs.indexOf(callback);
    var indexData = this.modifiedCBsData.indexOf(data);
    if (indexCB >= 0 && indexCB == indexData) 
    {
        return;
    }
        
    this.modifiedCBs.push(callback);
    this.modifiedCBsData.push(data);
}

Attribute.prototype.removeModifiedCB = function(callback, data)
{   
    var index = this.modifiedCBsData.indexOf(data);
    if (index >= 0)
    {
        this.modifiedCBs.splice(index, 1);
        this.modifiedCBsData.splice(index, 1);
    }
}

Attribute.prototype.addTarget = function(target, op, converter, setValueOnTargeting)
{
    if (op == undefined) op = eAttrSetOp.Replace;
    if (converter == undefined) converter = null;
    if (setValueOnTargeting == undefined) setValueOnTargeting = true;
    
    this.addElementTarget(target, -1, -1, op, converter, setValueOnTargeting);
}

Attribute.prototype.addSource = function(source, op, converter, setValueOnTargeting)
{
    source.addTarget(this, op, converter, setValueOnTargeting);
}

Attribute.prototype.removeTarget = function(target)
{
    this.removeElementTarget(target, -1, -1);
}

Attribute.prototype.removeSource = function(source)
{
    source.removeTarget(this);
}

Attribute.prototype.removeAllTargets = function()
{
    while (this.targets.length > 0)
    {
        this.removeElementTarget(this.targets[0].target,
                                 this.targets[0].sourceElementIndex,
                                 this.targets[0].targetElementIndex);
    }
}

Attribute.prototype.removeAllSources = function()
{
    while (this.sources.length > 0)
    {
        this.sources[0].source.removeElementTarget(this,
                                                   this.sources[0].sourceElementIndex,
                                                   this.sources[0].targetElementIndex);
    }
}

Attribute.prototype.addElementTarget = function(target, sourceElementIndex, targetElementIndex, op, converter, setValueOnTargeting)
{
    if (target)
    {
        if (sourceElementIndex == undefined) sourceElementIndex = -1;
        if (targetElementIndex == undefined) targetElementIndex = -1;
        if (op == undefined) op = eAttrSetOp.Replace;
        if (converter == undefined) converter = null;
        if (setValueOnTargeting == undefined) setValueOnTargeting = true;

        this.createTarget(new AttributeTargetDesc(target, sourceElementIndex, targetElementIndex, op, converter));

        // set this as a source of target
        target.createSource(new AttributeSourceDesc(this, sourceElementIndex, targetElementIndex, op, converter));

        if (setValueOnTargeting)
        {
            var params = new AttributeSetParams(targetElementIndex, sourceElementIndex, op, true, true);
            target.setValue(this.values, params);
        }
    }
}

Attribute.prototype.addElementSource = function(source, sourceElementIndex, targetElementIndex, op, converter, setValueOnTargeting)
{
    source.addElementTarget(this, sourceElementIndex, targetElementIndex, op, converter, setValueOnTargeting);
}

Attribute.prototype.removeElementTarget = function(target, sourceElementIndex, targetElementIndex)
{
    if (target)
    {
        this.deleteTarget(new AttributeTargetDesc(target, sourceElementIndex, targetElementIndex));

        // remove this as a source of target 
        target.deleteSource(new AttributeSourceDesc(this, sourceElementIndex, targetElementIndex));
    }
}

Attribute.prototype.removeElementSource = function(source, sourceElementIndex, targetElementIndex)
{
    source.removeElementTarget(this, sourceElementIndex, targetElementIndex);
}

Attribute.prototype.createTarget = function(targetDesc)
{
    this.targets.push(targetDesc);
}

Attribute.prototype.createSource = function(sourceDesc)
{
    this.sources.push(sourceDesc);
}

Attribute.prototype.deleteTarget = function(targetDesc)
{
    for (var i = 0; i < this.targets.length; i++)
    {
        var desc = this.targets[i];
        if (desc.target == targetDesc.target &&
            desc.sourceElementIndex == targetDesc.sourceElementIndex &&
            desc.targetElementIndex == targetDesc.targetElementIndex)
        {
            this.targets.splice(i, 1);
            break;
        }
    }
}

Attribute.prototype.deleteSource = function(sourceDesc)
{
    for (var i = 0; i < this.sources.length; i++)
    {
        var desc = this.sources[i];
        if (desc.source == sourceDesc.source &&
            desc.sourceElementIndex == sourceDesc.sourceElementIndex &&
            desc.targetElementIndex == sourceDesc.targetElementIndex)
        {
            this.sources.splice(i, 1);
            break;
        }
    }
}

Attribute.prototype.copyValue = function(source, op)
{
    source.addTarget(this, op);
    source.removeTarget(this);
}

Attribute.prototype.isContainer = function()
{
    return false;
}

Attribute.prototype.isCollection = function()
{
    return false;
}

Attribute.prototype.isNode = function()
{
    return false;
}

Attribute.prototype.getContainer = function()
{
    return this.container;
}

Attribute.prototype.setContainer = function(container)
{
    this.container = container;
}

Attribute.prototype.setNative = function(native)
{
    this.native = native;
}

Attribute.prototype.isNative = function()
{
    return this.native;    
}

Attribute.prototype.setTransient = function(transient)
{
    this.transient = transient;
}

Attribute.prototype.isTransient = function()
{
    return this.transient;    
}

Attribute.prototype.setPersistent = function(persistent)
{
    this.persistent = persistent;
}

Attribute.prototype.isPersistent = function()
{
    return this.persistent;    
}

Attribute.prototype.getRegistry = function()
{
    return this.registry;
}

Attribute.prototype.setRegistry = function(registry)
{
    this.registry = registry;
}

Attribute.prototype.onRegister = function(registry)
{
    
}

Attribute.prototype.onUnregister = function(registry)
{
    
}

Attribute.prototype.flagDeserializedFromXML = function()
{
    this.deserialized = true;

    if (this.attrContainer) // also flag container if present, otherwise serialization won't occur
    {
        this.attrContainer.flagDeserializedFromXML();
    }
}
Attribute.prototype.isDeserializedFromXML = function()
{
    return this.deserialized;
}