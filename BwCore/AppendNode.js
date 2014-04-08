AppendNodeCommand.prototype = new Command();
AppendNodeCommand.prototype.constructor = AppendNodeCommand;

function AppendNodeCommand()
{
    Command.call(this);
    this.className = "AppendNodeCommand";

    this.parent = new StringAttr("");
    this.child = new StringAttr("");
    this.parentNode = null;
    this.childNode = null;
    
    this.parent.addModifiedCB(AppendNodeCommand_ParentModifiedCB, this);
    this.child.addModifiedCB(AppendNodeCommand_ChildModifiedCB, this);
    
    this.registerAttribute(this.parent, "parent");
    this.registerAttribute(this.child, "child");   
}

AppendNodeCommand.prototype.execute = function()
{
    if (this.parentNode && this.childNode)
    {
        this.parentNode.addChild(this.childNode);
    }
}

function AppendNodeCommand_ParentModifiedCB(attribute, container)
{
    var parent = attribute.getValueDirect().join("");
    container.parentNode = container.registry.find(parent);
}

function AppendNodeCommand_ChildModifiedCB(attribute, container)
{
    var child = attribute.getValueDirect().join("");
    container.childNode = container.registry.find(child);
}