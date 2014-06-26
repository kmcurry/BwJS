Serializer.prototype = new Command();
Serializer.prototype.constructor = Serializer;

function Serializer()
{
    Command.call(this);
    this.className = "Serializer";

    this.pbMixed = null;
    this.bMixed = false;
    this.pDom  = null;
    this.pRootElement = null;
}

Serializer.prototype.SerializeToString = function(context,SerializedContext)
{
    if(this.pDom)
    {
        if(this.pRootElement)
        {
            var oldChild =  null;
            this.pDom.removeChild(this.pRootElement, oldchild);
            this.pRootElement.Release();
            this.pRootElement = null;
        }
        if(context)
        {
            SerializeAttribute(context,0,"");
        }
    }
}

Serializer.prototype.SerializeAttribute = function (attribute,item,attrName)
{
    if(attribute)
    {
        if(attribute.getAttribute() == attrType.Node.Model)
        {
            var model = attribute;
            SerializeModel(model);
        }
        if(attribute.getAttribute() == attrType.Node.PerspectiveCamera)
        {
            var ctr = attribute;
            SerializeAttributeContainer(ctr)
        }
        if(attribute.getAttribute() == attrType.Node.CommandSequence)
        {
            var cmd = attribute;
            SerializeCommand(cmd);
        }
        if(attribute.isContainer())
        {
            var ctr = attribute;
            SerializeAttributeContainer(ctr);
        }
        else if(attrName && this.pDom)
        {
            var aType = attribute.getAttributeType();
            var element = null;
            var itemElement = null;
            var itemAttr = null;
            var attrMap = null;
            var strItemAtrr;
            var vecVal;
            var varVal;

            var len = attribute.length();
        }
    }
}
