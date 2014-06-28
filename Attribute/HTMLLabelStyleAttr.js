HTMLLabelStyleAttr = new AttributeContainer(); 
HTMLLabelStyleAttr.prototype.constructor = HTMLLabelStyleAttr; 

function HTMLLabelStyleAttr()
{
	this.attrType = eAttrType_HTMLLabelStyle; 
	this.typeString = "HTMLLabelStyleAttr";

	this.bgColor = new ColorAttr(1, 1, 1, 1); // white
	this.height = new NumberAttr(0); // 0 (auto-calculate)
	this.html = new StringAttr(); // empty string
	this.left = new NumberAttr(0);
    //if (!(this.scrollBarLabelStyle = New<ScrollBarLabelStyleAttr>())) return;
	this.top = new NumberAttr(0);
	this.url = new StringAttr(); // empty string
	this.width = new NumberAttr(0);	// 0 (auto-calculate)

	this.registerAttribute(this.bgColor, "bgColor");
	this.registerAttribute(this.height, "height");
	this.registerAttribute(this.html, "html");
	this.registerAttribute(this.html, "userData");			// for CDATA
	this.registerAttribute(this.left, "left");
    //this.registerAttribute(this.scrollBarLabelStyle, "scrollBarLabelStyle");
	this.registerAttribute(this.top, "top");
	this.registerAttribute(this.url, "url");
	this.registerAttribute(this.width, "width");
}
