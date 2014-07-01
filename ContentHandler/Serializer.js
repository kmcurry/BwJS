Serializer.prototype = new Command();
Serializer.prototype.constructor = Serializer;

function Serializer()
{
    Command.call(this);
    this.className = "Serializer";

    this.pbMixed = null;
    this.bMixed = false;
    this.DOM  = null;
    this.RootElement = null;
}

Serializer.prototype.serialize = function(attribute,item,attributeName,container,SerializedContext)
{
    //if(this.DOM)
    //{
        if(this.RootElement)
        {
            var oldChild =  null;
            this.DOM.removeChild(this.RootElement,oldchild);
            this.RootElement = null;

            this.mixedModifiedCB(attr,data);
        }
        if(attribute)
        {
            this.serializeAttribute(attribute,item,attributeName);
        }
        else
        {
            this.serializeAttribute(container,0,"");
        }
    //}
}

Serializer.prototype.serializeAttribute = function (attribute,item,attrName)
{
    if(attribute)
    {
        if(attribute.getAttribute() == eAttrType.Model)
        {
            var model = attribute;
            this.serializeModel(model);
        }
        if(attribute.getAttribute() == eAttrType.PerspectiveCamera)
        {
            var ctr = attribute;
            this.serializeAttributeContainer(ctr)
        }
//        if(attribute.getAttribute() == eAttrType.Node.CommandSequence) // NO COMMAND SEQUENCE IN ATTRIBUTE TYPE
//        {
//            var cmd = attribute;
//            this.serializeCommand(cmd);
//        }
        if(attribute.isContainer())
        {
            var ctr = attribute;
            this.serializeAttributeContainer(ctr);
        }
        else if(attrName && this.DOM)
        {
            var aType = attribute.attrType;
            var element = null;
            var itemElement = null;
            var itemAttr = null;
            var attrMap = null;
            var strItemAttr;
            var vecVal;
            var varVal;

            var len = attribute.length();
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
                    index = s.indexOf("(");
                    if (!(s.indexOf("("))) break;

                    /* Make the replacement. */
                    s.replace(index, 1, "_x0028");
                }
                while (true)
                {
                    /* Locate the substring to replace. */
                    index = s.indexOf(")");
                    if (!(s.indexOf("("))) break;

                    /* Make the replacement. */
                    s.replace(index, 1, "_x0029");
                }
                var bstr = s;
                if (bstr)
                {
                    this.DOM.createElement(bstr, element);
                    if (element)
                    {
                        var pOldChild = null;

                        var strValue;
                        this.getAttributeStringValue(attribute, item, strValue);

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

                                strValue = strValue.splice(nStartPos, strValue.length()-nStartPos-strCdataEnd.length);
                                var cdata = null;
                                bstr = strValue;
                                if (bstr)
                                {
                                    this.DOM.createCDATASection(bstr, cdata);
                                }
                                element.appendChild(cdata, pOldChild);
                            }
                            else
                            {
                                element.put_text(_bstr_t(strValue)); //ASK MICHAEL OR KEVIN
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

                                endNdx = (i == len-1) ? strValue.npos : strValue.indexOf(",", startNdx);
                                sv = strValue.splice(startNdx, endNdx-startNdx);

                                startNdx = endNdx+1;

                                if (this.bMixed)
                                {
                                    this.DOM.createElement(strItemAttr,itemElement);
                                    itemElement.put_text(_bstr_t(sv));
                                    element.appendChild(itemElement,pOldChild);
                                }
                                else
                                {
                                    element.get_attributes(attrMap);
                                    if (attrMap)
                                    {
                                        this.DOM.createAttribute(strItemAttr, itemAttr);

                                        if (itemAttr)
                                        {
                                            itemAttr.put_text(_bstr_t(sv));
                                            attrMap.setNamedItem(itemAttr, pOldChild);
                                        }
                                    }
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
Serializer.prototype.serializeAttributeReference = function(attribute,reference)
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
                this.DOM.createElement(bstr, element);
            }
        }
        if (element)
        {
            element.get_attributes(attrMap);
            if (attrMap)
            {
                this.DOM.createAttribute("ref", itemAttr);

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
                            tmpName = nameAttr.getValueDirect(s);
                            tmpName += "/";
                            tmpName += refName;
                            refName = tmpName;
                        }
                    }
                    itemAttr.put_text(refName);
                    attrMap.setNamedItem(itemAttr, pOldChild);
                }
            }

            this.pushElement(element);
            this.popElement();
        }
    }
}

Serializer.prototype.serializeModel = function (Model)
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
            this.DOM.createElement(bstr, element);
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
        if (getInspectionGroup(Model,RotGroup))
        {
            var container = Model;
            var attr = RotGroup.getChild(2).getAttribute("rotationQuat");

            var containerName;
            var containerNameAttr = container.getAttribute("name");
            containerNameAttr.getValueDirect(containerName);

            var command = null;
            var factory = this.registry.find("AttributeFactory");
            command = factory.create("SetCommand");
            if (command)
            {
                command.getAttribute("target").setValueDirect(containerName);
                command.getAttribute("target").flagDeserializedFromXML();

                command.registerTargetAttributes(container, containerName);

                var values;
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
            this.DOM.createElement(bstr, element);
            if (element) {
                this.pushElement(element);

                // 2. serialize the native attributes (except "sourceContainer", "sourceEvaluator",
                //    "sourceAttribute", "sourceOutput", "source", "targetContainer", "targetAttribute", "target")
                var i;
                var attribute = null;
                var pcszName = null;
                var uiAttrCount = command.getAttributeCount();
                for (i = 0; i < uiAttrCount; ++i) {
                    attribute = command.getAttribute(i);
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
                    var attr = command.getAttribute(i);
                    var attrName = command.getAttributeName(attr);
                    if (attrName != "sourceAttribute") {
                        sources.push(attr);
                       }
                        else if (attrName != "targetAttribute") {
                            targets.push(attr);
                                }
                        }
                        // source/target pairs must be serialized together
                        for (i = 0; i < sources.size() && i < targets.size(); i++) {
                            this.serializeAttribute(sources[i], -1, "sourceAttribute");
                            this.serializeAttribute(targets[i], -1, "targetAttribute");
                        }
                        // if "targetAttribute" specified, don't serialize "target"
                        if (targets.empty()) {
                            attribute = command.getAttributeName("target");
                            if (attribute) {
                                this.serializeAttribute(attribute, -1, "target");
                            }
                        }

                        // 5. serialize the borrowed attributes that were modified by the command
                        var vNewVal;
                        var pRef;
                        for (i = 0; i < uiAttrCount; ++i) {
                            attribute = command.getAttribute(i);
                            var attrName = command.getAttributeName(attribute);
                            if (command.isBorrowedAndValueModified(attrName, vNewVal)) { // FIND FUNCTION IN C++
                                // have to take the value that is imposed by the Set, not necessarily the current value
                                var pNewAttribute = newAttribute(attribute.attrType);
                                if (pNewAttribute) {
                                    this.setAttributeValue(pNewAttribute, vNewVal);
                                    pNewAttribute.flagDeserializedFromXML();
                                    this.serializeAttribute(pNewAttribute, -1, attrName);
                                }
                            }
                            else if (command.isBorrowedAndReferenceModified(attribute, pRef)) {
                                this.serializeAttributeReference(attribute, pRef);
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

    if (container) //this.DOM
    {
        var element = null;
        var pcszType = container.className;

        var bstr = pcszType;
        if (bstr)
        {
            this.DOM.createElement(bstr, element);
            if (element)
            {
                this.pushElement(element);

                var attribute = null;
                var pcszName = null;
                var uiAttrCount = container.getAttributeCount();

                // 0. serialize any native attributes first
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    attribute = container.getAttribute(i);
                    var attrName = container.getAttributeName(attribute);
                    if (attrName.isNative() == true) //FIND FUNCTION IN C++
                    {
                        this.serializeAttribute(attribute, -1, attrName);
                    }
                }

                // 1. if serialization of children is requested, serialize children
                if (this.serializeChildren.getValueDirect())
                {
                    this.serializeChildren(container);
                }

                // 2. serialize the non-native attributes
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    attribute = container.getAttribute(i);
                    var attrName = container.getAttributeName(attribute);
                    if (attrName.isNative() == false)
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
            this.DOM.createElement(bstr, element);
            if (element)
            {
                this.pushElement(element);

                // vector
                var attrVec = collection;
                {
                    var elementName;
                    var baseName = attrVec.baseName.getValueDirect();

                    var size = attrVec.size();
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

Serializer.prototype.serializeChildren = function(root)
{
    for (var i=0; i < root.getChildCount(); i++)
    {
        this.serializeAttribute(root.getChild(i), 0, null);
    }
}

Serializer.prototype.pushElement = function(element)
{
    if (this.RootElement)
    {
        var pOldChild = null;
        this.RootElement.appendChild(element, pOldChild);
    }
    else // !this.RootElement
    {
        this.DOM.putref_documentElement(element);
    }

    this.RootElement = element;
}

Serializer.prototype.popElement = function()
{
    this.elementStack.pop();

    if (this.elementStack.size() > 0)
    {
        this.RootElement = this.elementStack.top();
    }
}
Serializer.prototype.MatchesType = function(pcszType)
{
    var matches = false;
    if (pcszType && pcszType.length == 5)
    {
        matches = !(pcszType == "msxml") || !(pcszType ==  "msdom");
    }
    return matches;
}

Serializer.prototype.getAttributeStringValue = function(attr,item,strValue)
{
    strValue = 0;

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
            strValue = b == true ? "true" : "false";
        }
            break;
        case eAttrType.StringAttr:
        {
            var len = attr.length();
            var s;
            var c = attr.getValueDirect(s[0], len);
            strValue = c;
        }
            break;
        case eAttrType.ColorAttr:
        case eAttrType.Vector3DAttr:
        case eAttrType.Matrix4x4Attr:
        case eAttrType.QuaternionRotate:
        {
            var vecVal_F;
            attr.getValue(vecVal_F);
            if (item == -1)
            {
                for (var i = 0; i < vecVal_F.size(); ++i)
                {
                    strValue += vecVal_F[i].toString();
                    if (i < vecVal_F.size() - 1)
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
            var vecVal_I;
            attr.getValue(vecVal_I);
            if (item == -1)
            {
                for (var i = 0; i < vecVal_I.size(); ++i)
                {
                    strValue += vecVal_I[i].toString();
                    if (i < vecVal_I.size() - 1)
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
}

Serializer.prototype.mixedModifiedCB = function(attr,data)
{
    var v;
    attr.getValue(v);
    var pSerializer = data;
    if (pSerializer != 0xffffffff)
    {
        pSerializer.bMixed = v[0]; //ASK MICHAEL
    }
}

