StyleMgr.prototype = new AttributeContainer();
StyleMgr.prototype.constructor = StyleMgr;

function StyleMgr()
{
    AttributeContainer.call(this);
    this.className = "StyleMgr";
}

StyleMgr.prototype.eventPerformed = function(event, node)
{
    var result = node.stylesMap.getStyles(event.type);
    if (result.styles && result.enabled)
    {
        this.applyStyle(result.styles, result.target ? result.target : node);
    }
}

StyleMgr.prototype.applyStyle = function(style, node)
{
    node.styles.updateStyle(style);
}