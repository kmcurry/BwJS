MorphCommand.prototype = new Command();
MorphCommand.prototype.constructor = MorphCommand;

function MorphCommand()
{
    Command.call(this);
    this.className = "Morph";
    this.attrType = eAttrType.Morph;

    this.sourceModel = null;
    this.targetModel = null;
    
    this.source = new StringAttr("");
    this.morphIncr = new NumberAttr(0.1);
    
    this.source.addModifiedCB(MorphCommand_SourceModifiedCB, this);
    this.target.addModifiedCB(MorphCommand_TargetModifiedCB, this);

    this.registerAttribute(this.source, "source");
    this.registerAttribute(this.morphIncr, "morphIncr");
}

MorphCommand.prototype.execute = function()
{
    if (this.sourceModel && this.targetModel)
    {
        var connectionMgr = this.registry.find("ConnectionMgr");
        if (connectionMgr)
        {
            connectionMgr.connectModelsToMorph(this.sourceModel, this.targetModel, this.morphIncr.getValueDirect());
        }    
    }
}

function MorphCommand_SourceModifiedCB(attribute, container)
{
    var source = attribute.getValueDirect().join("");
    var resource = container.registry.find(source);
    if (resource)
    {
        container.sourceModel = resource;
    }
}


function MorphCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
        container.targetModel = resource;
    }
}
