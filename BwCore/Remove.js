RemoveCommand.prototype = new Command();
RemoveCommand.prototype.constructor = RemoveCommand;

function RemoveCommand()
{
    Command.call(this);
    this.className = "RemoveCommand";
    this.attrType = eAttrType.Remove;

    this.targetAttribute = null;
    
    this.target.addModifiedCB(RemoveCommand_TargetModifiedCB, this);
}

RemoveCommand.prototype.execute = function()
{
    if (this.targetAttribute)
    {
        // if node, remove from tree, and remove/unregister all children
        if (this.targetAttribute.isNode())
        {
            var i = 0;
            var parent = null;
            while ((parent = this.targetAttribute.getParent(i++)))
            {
                parent.removeChild(this.targetAttribute);
            }

            this.removeChildren(this.targetAttribute);
            
            // invoke onRemove
            this.targetAttribute.onRemove();
        }

        // remove from registry
        this.registry.unregister(this.targetAttribute);
        
        // delete
        this.targetAttribute.destroy();
    }
}

RemoveCommand.prototype.removeChildren = function(root)
{
    var child = null;
	while ((child = root.getChild(0))) // get child 0 each time because we are removing the front child
	{
		// recurse on child
		this.removeChildren(child);

		// remove from registry
		this.registry.unregister(child);

		// remove from root node
		root.removeChild(child);
	}
}

function RemoveCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    container.targetAttribute = container.registry.find(target);
}
