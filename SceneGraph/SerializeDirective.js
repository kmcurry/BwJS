SerializeParams.prototype = new DirectiveParams();
SerializeParams.prototype.constructor = SerializeParams();

function SerializeParams()
{
    DirectiveParams.call(this);
    
    this.serialized = null;
}

SerializeDirective.prototype = new SGDirective();
SerializeDirective.prototype.constructor = SerializeDirective;

function SerializeDirective()
{
    SGDirective.call(this);
    
    this.className = "SerializeDirective";
    this.attrType = eAttrType.SerializeDirective;

    this.serialized = "";
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
    var params = new SerializeParams();
    params.serialized = this.serialized;

    // apply serialize directive
    root.apply("serialize", params, true);

    return;
}

