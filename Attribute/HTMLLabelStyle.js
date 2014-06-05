HTMLLabelStyleAttr = new AttributeContainer(); 
HTMLLabelStyleAttr.prototype.constructor = HTMLLabelStyleAttr; 

function HTMLLabelStyleAttr()
{
	this.bgColor = null; 
	this.height = null; 
	this.html = null;
	this.left = null;
    //this.scrollBarLabelStyle(NULL),
	this.top = null;
	this.url = null;
	this.width = null;
}

{
	this.attrType = eAttrType_HTMLLabelStyle; 
	this.typeString = "HTMLLabelStyleAttr";

	if (!(this.bgColor = "FFFFFFFF")) return;		// white
	if (!(this.height = 0)) return;			// 0 (auto-calculate)
	if (!(this.html = "")) return;						// empty string
	if (!(this.left = 0)) return;
    //if (!(this.scrollBarLabelStyle = New<ScrollBarLabelStyleAttr>())) return;
	if (!(this.top = 0)) return;
	if (!(this.url = "")) return;						// empty string
	if (!(this.width = 0)) return;			// 0 (auto-calculate)

	registerAttribute(this.bgColor, "bgColor");
	registerAttribute(this.height, "height");
	registerAttribute(this.html, "html");
	registerAttribute(this.html, "userData");			// for CDATA
	registerAttribute(this.left, "left");
    //registerAttribute(this.scrollBarLabelStyle, "scrollBarLabelStyle");
	registerAttribute(this.top, "top");
	registerAttribute(this.url, "url");
	registerAttribute(this.width, "width");
}
