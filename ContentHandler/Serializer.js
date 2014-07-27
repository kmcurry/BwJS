Serializer.prototype = new AttributeContainer();
Serializer.prototype.constructor = Serializer;

function Serializer()
{
    AttributeContainer.call(this);
    this.className = "Serializer";

    this.pbMixed = null;
    this.bMixed = false;
    this.DOM  = null;
    this.RootElement = null;
    this.elementStack = new Stack();
    
    this.format = new StringAttr("xml");
    this.serializeMinimum = new BooleanAttr(false);
    this.serializeChildren = new BooleanAttr(false);
    
    this.registerAttribute(this.format, "format");
    this.registerAttribute(this.serializeMinimum, "serializeMinimum");
    this.registerAttribute(this.serializeChildren, "serializeChildren");
}

Serializer.prototype.serialize = function(attribute, item, attributeName, container)
{
	this.RootElement = null;
    this.DOM  = document.implementation.createDocument("", "__InitialRoot", null); 
    if (this.DOM)
    {
        if (this.RootElement)
        {
            this.DOM.removeChild(this.RootElement);
            this.RootElement = null;

            this.mixedModifiedCB(attr,data);
        }
        if (attribute)
        {
            this.serializeAttribute(attribute, item, attributeName);
        }
        else
        {
            this.serializeAttribute(container, 0, "");
        }
    }
}

Serializer.prototype.serializeAttribute = function(attribute, item, attrName)
{
    if (attribute)
    {
        if (attribute.isTransient()) // don't serialize transient attributes
        {
            return;
        }
        
        if (this.serializeMinimum.getValueDirect() == true &&
            !attribute.isDeserializedFromXML()) // if requested, don't serialize defaults
        {
            return;
        }
        
        if (attribute.attrType == eAttrType.Model)
        {
            var model = attribute;
            this.serializeModel(model);
        }
        else if (attribute.attrType == eAttrType.PerspectiveCamera)
        {
            var ctr = attribute;
            this.serializeAttributeContainer(ctr)
        }
        else if (attribute.attrType == eAttrType.CommandSequence)
        {
            var cmd = attribute;
            this.serializeCommand(cmd);
        }
        else if (attribute.isContainer())
        {
            var ctr = attribute;
            this.serializeAttributeContainer(ctr);
        }
        else if (attrName && this.DOM)
        {
            var aType = attribute.attrType;
            var element = null;
            var itemElement = null;
            var itemAttr = null;
            var attrMap = null;
            var strItemAttr;
            var vecVal;
            var varVal;

            var len = attribute.getLength();
            if (attrName)
            {
                // serializer cannot put "(" or ")" in the XML tag name,
                // so convert parentheses to a string that is value,
                // which is then converted back to parentheses in the result
                // of serialization
                
                var index = 0;
                while (true)
                {
                    /* Locate the substring to replace. */
                    index = attrName.indexOf("(");
                    if (index == -1) break;

                    /* Make the replacement. */
                    attrName.replace(index, 1, "_x0028");
                }
                while (true)
                {
                    /* Locate the substring to replace. */
                    index = attrName.indexOf(")");
                    if (index == -1) break;

                    /* Make the replacement. */
                    attrName.replace(index, 1, "_x0029");
                }
                var bstr = attrName;
                if (bstr)
                {
                    element = this.DOM.createElement(bstr);
                    if (element)
                    {
                        var pOldChild = null;

                        var strValue;
                        strValue = this.getAttributeStringValue(attribute, item);
                        if (strValue == "") return;

                        if (item >= 0 || len == 1 || aType == eAttrType.StringAttr)
                        {
                            // Check for a CDATA section:
                            // CDATA sections are used for CStringAttrs
                            // containing special characters, including XML.
                            // CDATA behaves as it does in SAX, i.e., it
                            // is not parsed.  It is instead passed directly
                            // to the Attribute as a string literal.

                            // TODO:  Move this "constant" to a shared location.
                            // It is also used by XMLTokenizer
                            var strCdataStart = "<![CDATA[";
                            var strCdataEnd = "]]>";

                            var nStartPos = 0;
                            var nEndPos = strValue.indexOf(strCdataEnd);
                            if (nStartPos != -1 && nEndPos != -1)
                            {

                                nStartPos += strCdataStart.length;

                                strValue = strValue.substr(nStartPos, strValue.length-nStartPos-strCdataEnd.length);
                                var cdata = null;
                                bstr = strValue;
                                if (bstr)
                                {
                                    cdata = this.DOM.createCDATASection(bstr);
                                }
                                element.appendChild(cdata, pOldChild);
                            }
                            else
                            {
                                element.textContent = strValue;
                            }
                        }
                        else
                        {
                            var sv;
                            var startNdx = 0;
                            var endNdx = 0;
                            for (var i = 0; i < len; ++i)	// len - 1 = # of commas
                            {
                                strItemAttr = "item" + i.toString();

                                endNdx = (i == len-1) ? strValue.length : strValue.indexOf(",", startNdx);
                                sv = strValue.substr(startNdx, endNdx-startNdx);

                                startNdx = endNdx+1;

                                if (this.bMixed)
                                {
                                    itemElement = this.DOM.createElement(strItemAttr);
                                    itemElement.textValue = sv;
                                    element.appendChild(itemElement);
                                }
                                else
                                {
                                    itemAttr = this.DOM.createAttribute(strItemAttr);
                                    itemAttr.value = sv;
                                    element.setAttributeNode(itemAttr);
                                }
                            }
                        }

                        this.pushElement(element);
                        this.popElement();
                    }
                }
            }
        }
    }
}
Serializer.prototype.serializeAttributeReference = function(attribute, reference)
{
    if (attribute && reference && this.DOM)
    {
        var container = null;
        var element = null;
        var itemAttr = null;
        var attrMap = null;
        var pOldChild = null;

        container = attribute.getContainer();
        if (container)
        {
            var bstr = container.getAttributeName(attribute);
            if (bstr)
            {
                element = this.DOM.createElement(bstr);
            }
        }
        if (element)
        {
            if (element.attributes.length > 0)
            {
                itemAttr = this.DOM.createAttribute("ref");

                if (itemAttr)
                {
                    var refName = "";
                    var tmpName = "";
                    var nameAttr = null;
                    container = reference.getContainer();
                    if (container)
                    {
                        refName = container.getAttributeName(reference);
                        if (nameAttr = container.getAttribute("name"))
                        {
                            var s;
                            tmpName = nameAttr.getValueDirect().join("");
                            tmpName += "/";
                            tmpName += refName;
                            refName = tmpName;
                        }
                    }
                    itemAttr.textContent = refName;
                    attrMap.setNamedItem(itemAttr, pOldChild);
                }
            }

            this.pushElement(element);
            this.popElement();
        }
    }
}

Serializer.prototype.serializeModel = function(Model)
{
    // surround <Model> and <Set> tags so that both will serialize (previously the
    // <Set> was overwriting the <Model> as the root)
    var bstr = null;
    var element = null;
    if (this.DOM)
    {
        bstr = "ModelRoot";
        if (bstr)
        {
            element = this.DOM.createElement(bstr);
            if (element)
            {
                this.pushElement(element);
            }
        }
    }

    if (Model)
    {
        // serialize Model
        this.serializeAttributeContainer(Model);

        // add set command for rotation group's quaternion rotation, to retain rotation caused by object inspection
        var RotGroup = null;
        if (RotGroup = getInspectionGroup(Model))
        {
            var container = Model;
            var attr = RotGroup.getChild(2).getAttribute("rotationQuat");

            var containerName;
            var containerNameAttr = container.getAttribute("name");
            containerName = containerNameAttr.getValueDirect().join("");

            var command = null;
            var factory = this.registry.find("AttributeFactory");
            command = factory.create("SetCommand");
            if (command)
            {
                command.getAttribute("target").setValueDirect(containerName);
                command.getAttribute("target").flagDeserializedFromXML();

                command.registerTargetAttributes(container, containerName);

                var values = [];
                attr.getValue(values);

                command.attributeValuePairs.push(new Pair(attr, values));
                
                this.serializeCommand(command);
            }
        }
    }

    if (element)
    {
        this.popElement();
    }
}

Serializer.prototype.serializeCommand = function(command)
{
    // 1. create the start tag.

    if (command && this.DOM)
    {
        var element = null;
        var pcszType = command.className;

        var bstr = pcszType;
        if (bstr)
        {
            //this.DOM.createElement(bstr, element); Can only pass in a string value for this and only has 1 parameter
            element = this.DOM.createElement(bstr);
            if (element) {
                this.pushElement(element);

                // 2. serialize the native attributes (except "sourceContainer", "sourceEvaluator",
                //    "sourceAttribute", "sourceOutput", "source", "targetContainer", "targetAttribute", "target")
                var i;
                var attribute = null;
                var pcszName = null;
                var uiAttrCount = command.getAttributeCount();
                for (i = 0; i < uiAttrCount; ++i) {
                    attribute = command.getAttributeAt(i);
                    var attrName = command.getAttributeName(attribute);
                    if (!command.isBorrowed(attrName) && //FIND FUNCTION IN C++
                        (pcszName == "sourceContainer") &&
                        (pcszName == "sourceEvaluator") &&
                        (pcszName == "sourceAttribute") &&
                        (pcszName == "sourceOutput") &&
                        (pcszName == "source") &&
                        (pcszName == "targetContainer") &&
                        (pcszName == "targetAttribute") &&
                        (pcszName == "target")) {
                        this.serializeAttribute(attribute, -1, pcszName);
                    }
                }

                // 3. serialize "sourceContainer", "targetContainer"
                attribute = command.getAttributeName("sourceContainer");
                if (attribute) {
                    this.serializeAttribute(attribute, -1, "sourceContainer");
                }
                attribute = command.getAttributeName("targetContainer");
                if (attribute) {
                    this.serializeAttribute(attribute, -1, "targetContainer");
                }

                // 4. serialize "sourceAttribute", "targetAttribute", "target" (may be multiple source/target pairs)
                var sources = [];
                var targets = [];
                for (i = 0; i < uiAttrCount; ++i) {
                    //attribute = command.getAttribute(i, pcszName);
                    var attr = command.getAttributeAt(i);
                    var attrName = command.getAttributeName(attr);
                    if (attrName != "sourceAttribute") {
                        sources.push(attr);
                       }
                        else if (attrName != "targetAttribute") {
                            targets.push(attr);
                                }
                        }
                        // source/target pairs must be serialized together
                        for (i = 0; i < sources.length && i < targets.length; i++) {
                            this.serializeAttribute(sources[i], -1, "sourceAttribute");
                            this.serializeAttribute(targets[i], -1, "targetAttribute");
                        }
                        // if "targetAttribute" specified, don't serialize "target"
                        if (targets.length == 0) {
                            attribute = command.getAttributeName("target");
                            if (attribute) {
                                this.serializeAttribute(attribute, -1, "target");
                            }
                        }

                        // 5. serialize the borrowed attributes that were modified by the command
                        var vNewVal;
                        var pRef;
                        for (i = 0; i < uiAttrCount; ++i) {
                            attribute = command.getAttributeAt(i);
                            var attrName = command.getAttributeName(attribute);
                            var borrowed = command.isBorrowedAndValueModified(attrName);
                            if (borrowed.borrowed)
                            {
                                var pNewAttribute = newAttribute(attribute.attrType);
                                if (pNewAttribute) 
                                {
                                    this.setAttributeValue(pNewAttribute, borrowed.value);
                                    pNewAttribute.flagDeserializedFromXML();
                                    this.serializeAttribute(pNewAttribute, -1, attrName);
                                }
                            }
                            else 
                            {
                            	var borrowed = command.isBorrowedAndReferenceModified(attribute);
                            	if (borrowed.borrowed) 
                            	{
                                	this.serializeAttributeReference(attribute, borrowed.reference);
                                }
                            }
                        }

                        this.popElement();
                    }
        }
    }
}

Serializer.prototype.serializeAttributeContainer = function(container)
{
    // 1. create the start tag.

    if (container && this.DOM)
    {
        var element = null;
        var pcszType = container.className;
        if (pcszType == "BwSceneInspector")
        {
        	pcszType = "SceneInspector";
        }

        var bstr = pcszType;
        if (bstr)
        {
            element = this.DOM.createElement(bstr);
            if (element)
            {
                this.pushElement(element);

                var attribute = null;
                var pcszName = null;
                var uiAttrCount = container.getAttributeCount();

                // 0. serialize any native attributes first
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    attribute = container.getAttributeAt(i);
                    if (container.getAttributeModificationCount(attribute) == 0) continue;
                    var attrName = container.getAttributeName(attribute);
                    if (attribute.isNative() == true)
                    {
                        this.serializeAttribute(attribute, -1, attrName);
                    }
                }

                // 1. if serialization of children is requested, serialize children
                if (this.serializeChildren.getValueDirect())
                {
                    this.doSerializeChildren(container);
                }

                // 2. serialize the non-native attributes
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    attribute = container.getAttributeAt(i);
                    if (container.getAttributeModificationCount(attribute) == 0) continue;
                    var attrName = container.getAttributeName(attribute);
                    if (attribute.isNative() == false)
                    {
                        this.serializeAttribute(attribute, -1, attrName);
                    }
                }
                this.popElement();
            }
        }
    }

    // 3. create the end tag.
}

Serializer.prototype.serializeAttributeCollection = function(collection)
{
    if (collection && this.DOM)
    {
        var element = null;
        var pcszType = collection.className;

        var bstr = pcszType;
        if (bstr)
        {
            element = this.DOM.createElement(bstr);
            if (element)
            {
                this.pushElement(element);

                // vector
                var attrVec = collection;
                {
                    var elementName;
                    var baseName = attrVec.baseName.getValueDirect().join("");

                    var size = attrVec.length;
                    for (var i=0; i < size; i++)
                    {
                        elementName = baseName[0];
                        elementName += "[";
                        elementName += i.toString();
                        elementName += "]";

                        this.serializeAttribute(attrVec[i], 0, elementName);
                    }
                }

                this.popElement();
            }
        }
    }
}

Serializer.prototype.doSerializeChildren = function(root)
{
    if (root.attrType < eAttrType.Node ||
        root.attrType > eAttrType.Node_End)
    {
        return;
    }
    
    for (var i=0; i < root.getChildCount(); i++)
    {
        this.serializeAttribute(root.getChild(i), 0, null);
    }
}

Serializer.prototype.pushElement = function(element)
{
	this.elementStack.push(element);
	    
    if (this.RootElement)
    {
        this.RootElement.appendChild(element);
    }
    else // !this.RootElement
    {
        this.DOM.replaceChild(element, this.DOM.documentElement);
    }

    this.RootElement = element;
}

Serializer.prototype.popElement = function()
{
    this.elementStack.pop();

    if (this.elementStack.length() > 0)
    {
        this.RootElement = this.elementStack.top();
    }
}

Serializer.prototype.getAttributeStringValue = function(attr, item)
{
    strValue = "";

    var e = attr.attrType;

    var index = -1;

    switch (e)
    {
        case eAttrType.NumberAttr:
        {
            var i = attr.getValueDirect();
            strValue = i.toString();
        }
            break;
        case eAttrType.BooleanAttr:
        {
            var b = attr.getValueDirect();
            if (b == true)
            {
            	strValue = "true";
            }
            else
            {
            	strValue = "false";
            }
        }
            break;
        case eAttrType.StringAttr:
        {
            var len = attr.getLength();
            strValue = attr.getValueDirect().join("");
        }
            break;
        case eAttrType.ColorAttr:
        case eAttrType.Vector2DAttr:
        case eAttrType.Vector3DAttr:
        case eAttrType.Matrix4x4Attr:
        case eAttrType.QuaternionRotate:
        {
            var vecVal_F = [];
            attr.getValue(vecVal_F);
            if (item == -1)
            {
                for (var i = 0; i < vecVal_F.length; ++i)
                {
                    strValue += vecVal_F[i].toString();
                    if (i < vecVal_F.length - 1)
                    {
                        strValue += ",";
                    }
                }
            }
            else
            {
                strValue += vecVal_F[item].toString();
            }
        }
            break;
        case eAttrType.NumberArrayAttr:
        case eAttrType.ViewportAttr:
        {
            var vecVal_I = [];
            attr.getValue(vecVal_I);
            if (item == -1)
            {
                for (var i = 0; i < vecVal_I.length; ++i)
                {
                    strValue += vecVal_I[i].toString();
                    if (i < vecVal_I.length - 1)
                    {
                        strValue += ",";
                    }
                }
            }
            else
            {
                strValue += vecVal_I[item].toString();
            }
        }
            break;
        default:
        {
        }
            break;
    }
    
    return strValue;
}

Serializer.prototype.mixedModifiedCB = function(attr,data)
{
    var v = [];
    attr.getValue(v);
    var pSerializer = data;
    if (pSerializer != 0xffffffff)
    {
        pSerializer.bMixed = v[0]; //ASK MICHAEL
    }
}

