SerializeCommand.prototype = new Command();
SerializeCommand.prototype.constructor = SerializeCommand;

function SerializeCommand()
{
    Command.call(this);
    this.className = "Serialize";
    this.attrType = eAttrType.Serialize;

    this.targetAttribute = null;
    this.target.addModifiedCB(SerializeCommand_TargetModifiedCB, this);
    this.directive = null;
    this.serialized = "";
}

SerializeCommand.prototype.execute = function()
{
    if (this.directive)
    {
//        if (this.target && this.directive)
//        {
//            if (this.directive.execute(this.target === 0))
//            {
//                this.serialized = this.directive.getSerialized();
//            }
//        }
//        else // !this.target
//        {
            this.serializeScene();
//        }
    }
}

SerializeCommand.prototype.serializeScene = function()
{
    var i;
    var container = null;
    var node = null;
    var context = new Context();
    var xstr;

    // root element open tag
    this.serialized = "<Session broadcast='false'>";

    //var attrContainerRegistry = this.registry.getAttributeContainerRegistry();
    var attrContainerRegistry = bridgeworks.registry;
    if (attrContainerRegistry)
    {
        var factory = this.registry.find("AttributeFactory");
        var serializer = factory.create("Serializer");
        var xmlSerializer = new XMLSerializer(); 
        // set minimum flag so that only the minimum required for recreation is serialized
        //var serializeMinimum = serializer.getAttribute("serializeMinimum");
        //serializeMinimum.setValueDirect(true);

        var count = attrContainerRegistry.getObjectCount();

        // serialize device handlers
        var i;
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i);
            if (!container) continue;
            if (container.attrType > eAttrType.DeviceHandler && 
                container.attrType < eAttrType.DeviceHandler_End)
            {
                context.attribute = container;
                //context = document.createElement("Scene");
                //var inside = context.setAttribute("text",container);

                // serialize
                serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
                this.serialized += xmlSerializer.serializeToString(serializer.DOM);
            }
        }
return;
        // serialize root nodes (nodes without parents)
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i);
            if (!container) continue;
            if (container.attrType > eAttrType.Node && 
                container.attrType < eAttrType.Node_End &&
                container.getParentCount() == 0)
            {
                this.directive.execute(container);
                this.serialized += this.directive.serialized;
            }
        }

        // serialize non-device handlers, non-nodes, non-commands (commands need to be serialized last so that the objects
        // they affect will be declared first)
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i); 
            if (!container) continue;
            if (container.className == "SelectionListener")
            {
                var computePivotDistance = container.getAttribute("computePivotDistance").getValueDirect();

                this.serialized += "<Set target=\"Selector\" computePivotDistance=\"";
                this.serialized += (computePivotDistance ? "true" : "false");
                this.serialized += "\"/>";
            }
            else
            {
                context.attribute = container;

                // serialize
                serializer.Serialize(context, buffer);
                this.serialized += xmlSerializer.serializeToString(serializer.DOM);
            }
        }

        // serialize any DisconnectAttributes commands (must come before ConnectAttributes in DefaultPreferences.xml)
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i); 
            if (!container) continue;
            if (container.className == "DisconnectAttributes")
            {
                context.attribute = container;

                // serialize
                serializer.Serialize(context, buffer);
                this.serialized += xmlSerializer.serializeToString(serializer.DOM);
            }
        }

        // serialize remaining commands (DisconnectAttributes already serialized above)
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i); 
            if (!container) continue;
            if(container.className == "DisconnectAttributes")
            {
                context.attribute = container;

                // serialize
                serializer.Serialize(context, buffer);
                this.serialized += xmlSerializer.serializeToString(serializer.DOM);
            }
        }
        /*
         // updateSectorOrigin
         const char* substr = NULL;
         std.prototype.string name = "";
         if ((substr = strstr(this.serialized.c_str(), "PerspectiveCamera")) ||
         (substr = strstr(this.serialized.c_str(), "OrthographicCamera")))
         {
         if (substr = strstr(substr, "<name>"))
         {
         substr += 6; // skip "<name>"
         while (*substr != '<')
         {
         name += *substr++;
         }

         this.serialized += ".set target=\"";
         this.serialized += name;
         this.serialized += "\" updateSectorOrigin=\"true\"/>";
         }
         }
         */
        // TODO: pivotCone
    }

    // root element close tag
    this.serialized += "</Session>";

    return;
}

SerializeCommand.prototype.undo = function()
{

}

SerializeCommand.prototype.setRegistry = function(registry)
{
    // create serialize directive
    var factory = bridgeworks.registry.find("AttributeFactory");
    this.directive = factory.create("SerializeDirective");

    // call base-class implementation
    Command.prototype.setRegistry.call(this, registry);
}

SerializeCommand.prototype.getSerialized = function()
{
    return this.serialized;
}

function SerializeCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    container.targetAttribute = container.registry.find(target);
}