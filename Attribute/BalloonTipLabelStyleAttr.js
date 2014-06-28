BalloonTipLabelStyleAttr = new AttributeContainer(); 
BalloonTipLabelStyleAttr.prototype.constructor = BalloonTipLabelStyleAttr; 

function BalloonTipLabelStyleAttr()
{
    this.balloonOffset = new NumberAttr(100);
    this.bgColor = new ColorAttr(1, 1, 1, 1); // white
    this.displayMode = new StringAttr("default"); // can be either "default" or "hide"
    this.htmlLabelStyle = new HTMLLabelStyleAttr();
    this.text = new StringAttr();
    this.textColor = new ColorAttr(0, 0, 0, 1); // black
    
	this.registerAttribute(this.balloonOffset, "balloonOffset");
	this.registerAttribute(this.bgColor, "bgColor");
	this.registerAttribute(this.displayMode, "displayMode");
	this.registerAttribute(this.htmlLabelStyle, "htmlLabelStyle");			// for CDATA
	this.registerAttribute(this.text, "text");
	this.registerAttribute(this.textColor, "textColor");
}
