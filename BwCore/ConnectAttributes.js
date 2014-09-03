function ConnectionDesc()
{
    this.sourceContainer = null;
    this.targetContainer = null;
    this.sourceAttribute = null;
    this.targetAttribute = null;
    this.sourceAttributeName = "";
    this.targetAttributeName = "";
    this.sourceIndex = -1;
    this.targetIndex = -1;
}

var gConnectionHelpers = [];

function registerConnectionHelper(type, connect, disconnect)
{
    gConnectionHelpers[type] = new Pair(connect, disconnect);
}

ConnectAttributesCommand.prototype = new Command();
ConnectAttributesCommand.prototype.constructor = ConnectAttributesCommand;

function ConnectAttributesCommand()
{
    Command.call(this);
    this.className = "ConnectAttributes";
    this.attrType = eAttrType.ConnectAttributes;
    
    this.connections = new Stack();
    this.connectionHelper = new Pair(null, null);
    
    this.sourceContainer = new StringAttr("");
    this.targetContainer = new StringAttr("");
    this.sourceAttribute = new StringAttr("");
    this.targetAttribute = new StringAttr("");
    this.source = new StringAttr("");
    this.negate = new BooleanAttr(false);   // if true, disconnect
    this.persist = new BooleanAttr(true);
    this.connectionType = new StringAttr("");
    
    this.source.addTarget(this.sourceAttribute);
    this.target.addTarget(this.targetAttribute);
    
    this.sourceContainer.addModifiedCB(ConnectAttributesCommand_SourceContainerModifiedCB, this);
    this.targetContainer.addModifiedCB(ConnectAttributesCommand_TargetContainerModifiedCB, this);
    this.sourceAttribute.addModifiedCB(ConnectAttributesCommand_SourceAttributeModifiedCB, this);
    this.targetAttribute.addModifiedCB(ConnectAttributesCommand_TargetAttributeModifiedCB, this);
    this.connectionType.addModifiedCB(ConnectAttributesCommand_ConnectionTypeModifiedCB, this);
    this.negate.addModifiedCB(ConnectAttributesCommand_NegateModifiedCB, this);
    
    this.registerAttribute(this.sourceContainer, "sourceContainer");
	this.registerAttribute(this.sourceContainer, "sourceEvaluator");
	this.registerAttribute(this.targetContainer, "targetContainer");
	this.registerAttribute(this.sourceAttribute, "sourceAttribute");
	this.registerAttribute(this.sourceAttribute, "sourceOutput");
	this.registerAttribute(this.targetAttribute, "targetAttribute");
	this.registerAttribute(this.source, "source");
	this.registerAttribute(this.negate, "negate");
	this.registerAttribute(this.persist, "persist");
	this.registerAttribute(this.connectionType, "connectionType");
}

ConnectAttributesCommand.prototype.finalize = function()
{
    // for serialization; register each sourceAttribute/targetAttribute pair
    for (var i=0; i < this.connections.length()-2; i++)
    {
        var connection = this.connections.getAt(i);
        if (connection.sourceAttribute && connection.targetAttribute)
        {
            var sourceAttribute = new StringAttr(connection.sourceAttributeName);
            sourceAttribute.flagDeserializedFromXML();
            this.registerAttribute(sourceAttribute, "sourceAttribute");
            
            var targetAttribute = new StringAttr(connection.targetAttributeName);
            targetAttribute.flagDeserializedFromXML();
            this.registerAttribute(targetAttribute, "targetAttribute"); 
        }    
    }
    
    // call base-class implementation
    Command.prototype.finalize.call(this);
}

ConnectAttributesCommand.prototype.eventPerformed = function(event)
{
    // TEMPTEST
    // call base-class implementation
    Command.prototype.eventPerformed.call(this, event);
}

ConnectAttributesCommand.prototype.execute = function()
{
    var desc = this.connections.top();
    var persist = this.persist.getValueDirect();
    
    var sourceEvaluator = null;
    if (desc.sourceContainer &&
        desc.sourceContainer.attrType >= eAttrType.Evaluator &&
        desc.sourceContainer.attrType <= eAttrType.Evaluator_End)
    {
        sourceEvaluator = desc.sourceContainer;
    }
    
    if (this.negate.getValueDirect() == false)
    {
        if (this.connectionHelper.first)
        {
            this.connectionHelper.first(desc.sourceContainer, desc.targetContainer)
            if (!persist && this.connectionHelper.second)
            {
                // if source is evaluator, evaluate
                if (sourceEvaluator) sourceEvaluator.evalute();
                
                this.connectionHelper.second(desc.sourceContainer, desc.targetContainer);
            }
        }
        else
        {
            this.addOrRemoveTargets(true);
            
            if (!persist)
            {
                // if source is evaluator, evaluate
                if (sourceEvaluator) sourceEvaluator.evalute();
                
                this.addOrRemoveTargets(false);
            }
        }
    }
    else // negate - disconnect
    {
        if (this.connectionHelper.second)
        {
            var desc = this.connections.top();
            this.connectionHelper.second(desc.sourceContainer, desc.targetContainer);
            
            // if source is evaluator, evaluate
            if (sourceEvaluator) sourceEvaluator.evalute();
        }
        else
        {
            this.addOrRemoveTargets(false);
            
            // if source is evaluator, evaluate
            if (sourceEvaluator) sourceEvaluator.evalute();
        }
    }
}

ConnectAttributesCommand.prototype.addOrRemoveTargets = function(add)
{
    for (var i=0; i < this.connections.length(); i++)
    {
        var desc = this.connections.getAt(i);
        if (desc.sourceAttribute && desc.targetAttribute)
        {
            // always remove first to ensure no duplicates
            desc.sourceAttribute.removeElementTarget(desc.targetAttribute, desc.sourceIndex, desc.targetIndex);
            if (add)
            {
                desc.sourceAttribute.addElementTarget(desc.targetAttribute, desc.sourceIndex, desc.targetIndex);
            }
            
            // detect connection of a screenPosition to anything and disable display lists
            var container = desc.sourceAttribute.getContainer();
            if (container)
            {   
                var screenPosition = container.getAttribute("screenPosition");
                if (screenPosition && screenPosition == desc.sourceAttribute)
                {
                    var autoDL = container.getAttribute("autoDisplayList");
                    if (autoDL)
                    {
                        autoDL.setValueDirect(false);    
                    }
                    
                    var enableDL = container.getAttribute("enableDisplayList");
                    if (enableDL)
                    {
                        enableDL.setValueDirect(false);    
                    }
                }
            }
        }
    }
}

function ConnectAttributesCommand_SourceContainerModifiedCB(attribute, container)
{
    if (container.connections.length() == 0)
    {
        container.connections.push(new ConnectionDesc());
    }
    var connection = container.connections.top();
    connection.sourceContainer = container.registry.find(attribute.getValueDirect().join(""));       
}

function ConnectAttributesCommand_TargetContainerModifiedCB(attribute, container)
{
    if (container.connections.length() == 0)
    {
        container.connections.push(new ConnectionDesc());
    }
    var connection = container.connections.top();     
    connection.targetContainer = container.registry.find(attribute.getValueDirect().join(""));       
}

function ConnectAttributesCommand_SourceAttributeModifiedCB(attribute, container)
{
    var source = null;
    var index = -1;
    
    if (container.connections.length() == 0)
    {
        container.connections.push(new ConnectionDesc());
    }

    var connection = container.connections.top();    
    if (connection.sourceContainer)
    {
        var sourceTokens = attribute.getValueDirect().join("").split(":");
        source = connection.sourceContainer.getAttribute(sourceTokens[0]);
        if (sourceTokens.length > 1)
        {
            index = sourceTokens[1];
        }              
    }
    else
    {
        source = container.registry.find(attribute.getValueDirect().join(""));
        if (source)
        {
            connection.sourceContainer = source.getContainer();
            if (!connection.sourceContainer) connection.sourceContainer = source;     
        }
    }
    
    connection.sourceAttribute = source;
    connection.sourceAttributeName = attribute.getValueDirect().join("");
    connection.sourceIndex = index;
    
    // if source and target attributes have both been set, push another connection desc for the next source/target pair
    if (connection.sourceAttribute && connection.targetAttribute)
    {
        container.connections.push(new ConnectionDesc());
        container.connections.top().sourceContainer = connection.sourceContainer;
        container.connections.top().targetContainer = connection.targetContainer;
    }
}

function ConnectAttributesCommand_TargetAttributeModifiedCB(attribute, container)
{
    var target = null;
    var index = -1;
    
    if (container.connections.length() == 0)
    {
        container.connections.push(new ConnectionDesc());
    }
    
    var connection = container.connections.top();    
    if (connection.targetContainer)
    {
        var targetTokens = attribute.getValueDirect().join("").split(":");
        target = connection.targetContainer.getAttribute(targetTokens[0]);
        if (targetTokens.length > 1)
        {
            index = targetTokens[1];
        }              
    }
    else
    {
        target = container.registry.find(attribute.getValueDirect().join(""));
        if (target)
        {
            connection.targetContainer = target.getContainer();
            if (!connection.targetContainer) connection.targetContainer = target;     
        }
    }
    
    connection.targetAttribute = target;
    connection.targetAttributeName = attribute.getValueDirect().join("");
    connection.targetIndex = index;
        
    // if source and target attributes have both been set, push another connection desc for the next source/target pair
    if (connection.sourceAttribute && connection.targetAttribute)
    {
        container.connections.push(new ConnectionDesc());
        container.connections.top().sourceContainer = connection.sourceContainer;
        container.connections.top().targetContainer = connection.targetContainer;
    }
}

function ConnectAttributesCommand_ConnectionTypeModifiedCB(attribute, container)
{
    var helpers = gConnectionHelpers[attribute.getValueDirect().join("")];
    if (helpers)
    {
        container.connectionHelper.first = helpers.first;
        container.connectionHelper.second = helpers.second;
    }
}

function ConnectAttributesCommand_NegateModifiedCB(attribute, container)
{
    var negate = attribute.getValueDirect();
    if (negate)
    {
        container.className = "DisconnectAttributes";
        container.attrType = eAttrType.DisconnectAttributes;
    }
    else // !negate
    {
        container.className = "ConnectAttributes";
        container.attrType = eAttrType.ConnectAttributes;       
    }
}