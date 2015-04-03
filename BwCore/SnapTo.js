SnapToCommand.prototype = new Command();
SnapToCommand.prototype.constructor = SnapToCommand;

function SnapToCommand()
{
    Command.call(this);
    this.className = "SnapTo";
    this.attrType = eAttrType.SnapTo;

    this.models = new SnapModelDescriptors();

    this.registerAttribute(this.models, "models");
    
    this.numResponses.setValueDirect(0);
}

SnapToCommand.prototype.execute = function()
{
    var i;
    var models = [];
    
    for (i = 0; i < this.models.Size(); i++)
    {
        var modelDesc = this.models.getAt(i);
        var model = this.registry.find(modelDesc.name.getValueDirect().join(""));
        if (model)
        {
            var position = modelDesc.position.getValueDirect();
            model.position.setValueDirect(position.x, position.y, position.z);
            
            var quaternion = modelDesc.quaternion.getValueDirect();
            model.quaternion.setValueDirect(quaternion);
            
            model.updateSimpleTransform();
            model.updateCompoundTransform();
            
            models.push(model);
        }
    }
    
    var snapMgr = this.registry.find("SnapMgr");
    snapMgr.resnap(models);
}