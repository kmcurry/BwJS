SerializeParams.prototype = new DirectiveParams();
SerializeParams.prototype.constructor = SerializeParams();

function SerializeParams()
{
    DirectiveParams.call(this);
    
    this.serialized = "";
}

SerializeDirective.prototype = new SGDirective();
SerializeDirective.prototype.constructor = SerializeDirective;

function SerializeDirective()
{
    SGDirective.call(this);
    
    this.className = "SerializeDirective";
    this.attrType = eAttrType.SerializeDirective;

}

SerializeDirective.prototype.execute = function(root)
{
    if (!root)
    {
		return;
	}

    // clear serialize string
    this.serialized = "";

    // setup serialize params structure
    var serializeParams = new SerializeParams();
    serializeParams.serialized = this.serialized;
    serializeParams.userData = this.userData.getValueDirect();

    // apply serialize directive
    root.apply(eAttrType.DirectiveSerialize, serializeParams, true);

    return;
}

SerializeDirective.prototype.execute = function(path)
{
    if (!path)
    {
        return;
    }

    // clear serialize string
    this.serialized = "";

    // setup serialize params structure
    var serializeParams = new SerializeParams();
    serializeParams.serialized = this.serialized;
    serializeParams.userData = this.userData.getValueDirect();

	// apply serialize directive
    if (path.getNodeCount() > 0)
    {
	    path[0].apply(eAttrType.DirectiveSerialize, serializeParams, true);
    }

	return;
}
