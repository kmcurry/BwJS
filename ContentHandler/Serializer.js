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

Serializer.prototype.serialize = function(attribute,item,attributeName,container,SerializedContext)
{
    if(this.pDom)
    {
        if(this.pRootElement)
        {
            var oldChild =  null;
            this.pDom.removeChild(this.pRootElement,oldchild);
            this.pRootElement.release();
            this.pRootElement = null;

            this.mixedModifiedCB(pAttr,pData);
        }
        if(attribute)
        {
            this.serializeAttribute(attribute,item,attributeName);
        }
        else
        {
            this.serializeAttribute(container,0,"");
        }
    }
}

Serializer.prototype.serializeAttribute = function (attribute,item,attrName)
{
    if(attribute)
    {
        if(attribute.getAttribute() == attrType.Node.Model)
        {
            var model = attribute;
            this.serializeModel(model);
        }
        if(attribute.getAttribute() == attrType.Node.PerspectiveCamera)
        {
            var ctr = attribute;
            this.serializeAttributeContainer(ctr)
        }
        if(attribute.getAttribute() == attrType.Node.CommandSequence)
        {
            var cmd = attribute;
            this.serializeCommand(cmd);
        }
        if(attribute.isContainer())
        {
            var ctr = attribute;
            this.serializeAttributeContainer(ctr);
        }
        else if(attrName && this.pDom)
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
               // std::string s((_bstr_t(bstr)));
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
                    this.pDom.createElement(bstr, element);
                    if (element)
                    {
                        var pOldChild = null;

                        var strValue;
                        this.getAttributeStringValue(pAttribute, item, strValue);

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
                                    this.pDom.createCDATASection(bstr, cdata);
                                }
                                element.appendChild(cdata, pOldChild);
                            }
                            else
                            {
                                element.put_text(_bstr_t(strValue));
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

                                endNdx = (i == len-1) ? strValue.npos : strValue.find(",", startNdx);
                                sv = strValue.substr(startNdx, endNdx-startNdx);

                                startNdx = endNdx+1;

                                if (this.bMixed)
                                {
                                    this.pDom.createElement(_bstr_t(strItemAttr),itemElement);
                                    itemElement.put_text(_bstr_t(sv));
                                    element.appendChild(itemElement,pOldChild);
                                }
                                else
                                {
                                    element.get_attributes(attrMap);
                                    if (attrMap)
                                    {
                                        this.pDom.createAttribute(_bstr_t(strItemAttr), itemAttr);

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
    if (attribute && reference && this.pDom)
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
                this.pDom.createElement(bstr, element);
            }
        }
        if (element)
        {
            element.get_attributes(attrMap);
            if (attrMap)
            {
                this.pDom.createAttribute(_bstr_t("ref"), itemAttr);

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
                    itemAttr.put_text(_bstr_t(refName));
                    attrMap.setNamedItem(itemAttr, pOldChild);
                }
            }

            this.pushElement(element);
            this.popElement();
        }
    }
}

Serializer.prototype.serializeModel = function (pModel)
{
    // surround <Model> and <Set> tags so that both will serialize (previously the
    // <Set> was overwriting the <Model> as the root)
    var bstr = null;
    var element = null;
    if (this.pDom)
    {
        bstr = "ModelRoot";
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                this.pushElement(element);
            }
        }
    }

    if (pModel)
    {
        // serialize Model
        this.serializeAttributeContainer(pModel);

        // add set command for rotation group's quaternion rotation, to retain rotation caused by object inspection
        var pRotGroup = null;
        if (getInspectionGroup(pModel,pRotGroup))
        {
            var container = pModel;
            var attr = pRotGroup.getChild(2).getAttribute("rotationQuat");

            var containerName;
            var containerNameAttr = container.getAttribute("name");
            containerNameAttr.getValueDirect(containerName);

            var pCmd = null;
            var factory = this.registry.find("AttributeFactory");
            pCmd = factory.create("SetCommand");
            if (pCmd)
            {
                pCmd.getAttribute("target").setValueDirect(containerName);
                pCmd.getAttribute("target").flagDeserializedFromXML();

                pCmd.registerTargetAttributes(container, containerName);

                var values;
                attr.getValue(values);

                pCmd.attributeValuePairs.push(new Pair(attr, values));
                
                this.serializeCommand(pCmd);
            }
        }
    }

    if (element)
    {
        this.popElement();
    }
}

Serializer.prototype.serializeCommand = function(pCmd)
{
    // 1. create the start tag.

    if (pCmd && this.pDom)
    {
        var element = null;
        var pcszType = pCmd.className;

        var bstr = pcszType;
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element) {
                this.pushElement(element);

                // 2. serialize the native attributes (except "sourceContainer", "sourceEvaluator",
                //    "sourceAttribute", "sourceOutput", "source", "targetContainer", "targetAttribute", "target")
                var i;
                var pAttribute = null;
                var pcszName = null;
                var uiAttrCount = pCmd.getAttributeCount();
                for (i = 0; i < uiAttrCount; ++i) {
                    pAttribute = pCmd.getAttribute(i, pcszName);
                    if (!pCmd.isBorrowed(pAttribute) && //FIND FUNCTION IN C++
                        (pcszName == "sourceContainer") &&
                        (pcszName == "sourceEvaluator") &&
                        (pcszName == "sourceAttribute") &&
                        (pcszName == "sourceOutput") &&
                        (pcszName == "source") &&
                        (pcszName == "targetContainer") &&
                        (pcszName == "targetAttribute") &&
                        (pcszName == "target")) {
                        this.serializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                // 3. serialize "sourceContainer", "targetContainer"
                pAttribute = pCmd.getAttribute("sourceContainer");
                if (pAttribute) {
                    this.serializeAttribute(pAttribute, -1, "sourceContainer");
                }
                pAttribute = pCmd.getAttribute("targetContainer");
                if (pAttribute) {
                    this.serializeAttribute(pAttribute, -1, "targetContainer");
                }

                // 4. serialize "sourceAttribute", "targetAttribute", "target" (may be multiple source/target pairs)
                var sources = [];
                var targets = [];
                for (i = 0; i < uiAttrCount; ++i) {
                    //pAttribute = pCmd.getAttribute(i, pcszName);
                    var attr = pCmd.getAttribute(i);
                    var attrName = pCmd.getAttributeName(attr);
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
                            pAttribute = pCmd.getAttribute("target");
                            if (pAttribute) {
                                this.serializeAttribute(pAttribute, -1, "target");
                            }
                        }

                        // 5. serialize the borrowed attributes that were modified by the command
                        var vNewVal;
                        var pRef;
                        for (i = 0; i < uiAttrCount; ++i) {
                            pAttribute = pCmd.getAttribute(i, pcszName);
                            if (pCmd.isBorrowedAndValueModified(pAttribute, vNewVal)) { // FIND FUNCTION IN C++
                                // have to take the value that is imposed by the Set, not necessarily the current value
                                var pNewAttribute = newAttribute(pAttribute.attrType);
                                if (pNewAttribute) {
                                    this.setAttributeValue(pNewAttribute, vNewVal);
                                    pNewAttribute.flagDeserializedFromXML();
                                    this.serializeAttribute(pNewAttribute, -1, pcszName);
                                }
                            }
                            else if (pCmd.isBorrowedAndReferenceModified(pAttribute, pRef)) {
                                this.serializeAttributeReference(pAttribute, pRef);
                            }
                        }

                        this.popElement();
                    }
        }
    }
}

Serializer.prototype.serializeAttributeContainer = function(pContainer)
{
    // 1. create the start tag.

    if (pContainer && this.pDom)
    {
        var element = null;
        var pcszType = pContainer.className;

        var bstr = pcszType;
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                this.pushElement(element);

                var pAttribute = null;
                var pcszName = null;
                var uiAttrCount = pContainer.getAttributeCount();

                // 0. serialize any native attributes first
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pContainer.getAttribute(i, pcszName);
                    if (pAttribute.isNative() == true) //FIND FUNCTION IN C++
                    {
                        this.serializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                // 1. if serialization of children is requested, serialize children
                if (this.serializeChildren.getValueDirect())
                {
                    this.serializeChildren(pContainer);
                }

                // 2. serialize the non-native attributes
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pContainer.getAttribute(i, pcszName);
                    if (pAttribute.isNative() == false)
                    {
                        this.serializeAttribute(pAttribute, -1, pcszName);
                    }
                }
                this.popElement();
            }
        }
    }

    // 3. create the end tag.
}

Serializer.prototype.serializeAttributeCollection = function(pCollection)
{
    if (pCollection && this.pDom)
    {
        var element = null;
        var pcszType = pCollection.className;

        var bstr = pcszType;
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                this.pushElement(element);

                // vector
                var attrVec = pCollection;
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

Serializer.prototype.pushElement = function(pElement)
{
    if (this.pRootElement)
    {
        var pOldChild = null;
        this.pRootElement.appendChild(pElement, pOldChild);
    }
    else // !this.pRootElement
    {
        this.pDom.putref_documentElement(pElement);
    }

    this.pRootElement = pElement;
}

Serializer.prototype.popElement = function()
{
    this.elementStack.pop();

    if (this.elementStack.size() > 0)
    {
        this.pRootElement = this.elementStack.top();
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

Serializer.prototype.getAttributeStringValue = function(pAttr,item,strValue)
{
    strValue = 0;

    var e = pAttr.attrType;

    var index = -1;

    switch (e)
    {
        case eAttrType.NumberAttr:
        {
            var i = pAttr.getValueDirect();
            strValue = i.toString();
        }
            break;
        case eAttrType.BooleanAttr:
        {
            var b = pAttr.getValueDirect();
            strValue = b == true ? "true" : "false";
        }
            break;
        case eAttrType.StringAttr:
        {
            var len = pAttr.length();
            var s;
            var c = pAttr.getValueDirect(s[0], len);
            strValue = c;
        }
            break;
        case eAttrType.ColorAttr:
        case eAttrType.Vector3DAttr:
        case eAttrType.Matrix4x4Attr:
        case eAttrType.QuaternionRotate:
        {
            var vecVal_F;
            pAttr.getValue(vecVal_F);
            if (item == -1)
            {
                for (var i = 0; i < vecVal_F.size(); ++i)
                {
                    strValue += vecVal_F[i].toString());
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
            pAttr.getValue(vecVal_I);
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

Serializer.prototype.mixedModifiedCB = function(pAttr,pData)
{
    var v;
    pAttr.getValue(v);
    var pSerializer = pData;
    if (pSerializer != 0xffffffff)
    {
        pSerializer.bMixed = v[0]; //ASK MICHAEL
    }
}

