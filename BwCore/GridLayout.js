GridLayout.prototype = new ViewportLayout();
GridLayout.prototype.constructor = GridLayout;

function GridLayout()
{
    ViewportLayout.call(this);
    this.className = "GridLayout";
    
    this.name.setValueDirect("GridLayout");
    
    this.rows = new NumberAttr(1);
    this.cols = new NumberAttr(1);
    
    this.registerAttribute(this.rows, "rows");
    this.registerAttribute(this.cols, "cols");
}

GridLayout.prototype.initialize = function()
{
    this.rows.setValueDirect(1);
    this.cols.setValueDirect(1);
    
    // call base-class implementation
    ViewportLayout.prototype.initialize.call(this);
}

GridLayout.prototype.layoutDirectives = function(directives)
{
	if (!directives)
	{
		return;
	}

    var width = this.width.getValueDirect();
    var height = this.height.getValueDirect();
    var rows = this.rows.getValueDirect();
    var cols = this.cols.getValueDirect();
    if (width <= 0 || height <= 0 || rows <= 0 || cols <= 0)
    {
        return;
    }
    
    var vpX = 0;
    var vpY = 0;
    var vpWidth = width / cols;
	var vpHeight = height / rows;
	var values = new Array(4);

	var nDirectives = directives.length;
	for (var i=0, n=0; i < rows && n < nDirectives; i++)
	{
		for (var j=0; j < cols && n < nDirectives; j++, n++)
		{
			values[0] = vpX;
			values[1] = vpY;
			values[2] = vpWidth;
			values[3] = vpHeight;

			directives[n].getAttribute("viewport").setValue(values);

			vpX += vpWidth;
		}

		vpX = 0;
		vpY += vpHeight;
	}
}