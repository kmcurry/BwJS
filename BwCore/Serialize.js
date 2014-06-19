SerializeCommand.prototype = new Command();
SerializeCommand.prototype.constructor = SerializeCommand;

function SerializeCommand()
{
	Command.call(this);
	this.typeString = "Serialize";
	this.targetAttribute = null;
    this.target.addModifiedCB(SerializeCommand_TargetModifiedCB, this);
	this.directive = null; 
    this.serialized("");
}

SerializeCommand.prototype.Execute = function()
{
    if (this.directive)
    {
	    if (this.target && this.directive)
	    {
            if (this.directive.execute(this.target === 0))
            {
                this.serialized = this.directive.getSerialized();
            }
	    }
        else // !this.target
        {
            SerializeScene();
        }
    }

	return ;
}

SerializeCommand.prototype.SerializeScene = function()
{
    var i;
    var container = NULL;
    var node = NULL;
    var context;

    // root element open tag
    this.serialized = "<Session broadcast='false'>";

    var attrContainerRegistry = this.registry.find(attrContainerRegistry);
    if (attrContainerRegistry)
    {
        var serializer = new XMLSerializer();
        // set minimum flag so that only the minimum required for recreation is serialized
        //var serializeMinimum = serializer.getAttribute("serializeMinimum");
        //serializeMinimum.setValueDirect(true);

        var count = attrContainerRegistry.getObjectCount();

        // serialize device handlers
        for (i=0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i);
            if (container)
            {
                context.attribute = container;
                var buffer = "";

                // serialize
                serializer.Serialize(context, buffer);
                this.serialized += buffer;
            }
        }

        // serialize root nodes (nodes without parents)
        for (i=0; i < count; i++)
        {
            if (node = attrContainerRegistry.getObject(i) &&
                !node.getParent(0))
            {
                this.directive.Execute(node);
                this.serialized += this.directive.getSerialized();
            }
        }

        // serialize non-device handlers, non-nodes, non-commands (commands need to be serialized last so that the objects
        // they affect will be declared first)
        for (i=0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i); if (!container) continue;
            if (!container && !container && !container)
            {
                if (!strcmp(container.getTypeString(), "SelectionListener"))
                {
                    var computePivotDistance = container.getAttribute("computePivotDistance")
                       .getValueDirect();

                    this.serialized += "<Set target=\"Selector\" computePivotDistance=\"";
                    this.serialized += (computePivotDistance ? "true" : "false");
                    this.serialized += "\"/>";
                }
                else
                {
                    context.attribute = container;
                    var buffer = "";

                    // serialize
                    serializer.Serialize(context, buffer);
                    this.serialized += buffer;
                }
            }
        }

        // serialize any DisconnectAttributes commands (must come before ConnectAttributes in DefaultPreferences.xml)
        for (i=0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i); if (!container) continue;
            if (container && !strcmp(container.getTypeString(), "DisconnectAttributes"))
            {
                context.attribute = container;
                var buffer = "";

                // serialize
                serializer.Serialize(context, buffer);
                this.serialized += buffer;
            }
        }

        // serialize remaining commands (DisconnectAttributes already serialized above)
        for (i=0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i); if (!container) continue;
            if (container && strcmp(container.getTypeString(), "DisconnectAttributes"))
            {
                context.attribute = container;
                var buffer = "";

                // serialize
                serializer.Serialize(context, buffer);
                this.serialized += buffer;
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

SerializeCommand.prototype.Undo = function()
{
	return ;
}

SerializeCommand.prototype.setRegistr = function(registry)
{
    // create serialize directive
	var sg = NULL;
	var graphMgr = NULL;
    var resource = NULL;
	if (registry.Find("DefaultFactory", resource))
	{
		var defaultFactory = resource;
		if (defaultFactory && (sg = defaultFactory.getSceneGraph()) != NULL &&
		   (graphMgr = sg.getGraphMgr()) != NULL)
		{
			if (this.directive == graphMgr) //New<GcSerializeDirective, GcGraphMgr&>(*graphMgr))
            {
                this.directive.setRegistry(registry);
            }
		}
	}

    // call base-class implementation
	CCommand.prototype.setRegistry(registry);
}

SerializeCommand.prototype.SerializeCommand_TargetModifiedCB = function(attr, data)
{
	var target = attribute.getValueDirect().join("");
    container.targetAttribute = container.registry.find(target);
}