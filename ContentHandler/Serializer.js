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
            this.SerializeModel(model);
        }
        if(attribute.getAttribute() == attrType.Node.PerspectiveCamera)
        {
            var ctr = attribute;
            this.SerializeAttributeContainer(ctr)
        }
        if(attribute.getAttribute() == attrType.Node.CommandSequence)
        {
            var cmd = attribute;
            this.SerializeCommand(cmd);
        }
        if(attribute.isContainer())
        {
            var ctr = attribute;
            this.SerializeAttributeContainer(ctr);
        }
        else if(attrName && this.pDom)
        {
            var aType = attribute.getAttributeType();
            var element = null;
            var itemElement = null;
            var itemAttr = null;
            var attrMap = null;
            var strItemAttr;
            var vecVal;
            var varVal;

            var len = attribute.length();
            var bstr = StringToBSTR(attrName);
            if (bstr)
            {
                // serializer cannot put "(" or ")" in the XML tag name,
                // so convert parentheses to a string that is value,
                // which is then converted back to parentheses in the result
                // of serialization
               // std::string s((_bstr_t(bstr)));
                size_t index = 0;
                while (true)
                {
                    /* Locate the substring to replace. */
                    index = s.find("(");
                    if (index == string::npos) break;

                    /* Make the replacement. */
                    s.replace(index, 1, "_x0028");
                }
                while (true)
                {
                    /* Locate the substring to replace. */
                    index = s.find(")");
                    if (index == string::npos) break;

                    /* Make the replacement. */
                    s.replace(index, 1, "_x0029");
                }
                SysFreeString(bstr);
                bstr = StringToBSTR(s.c_str()+'\0');
                if (bstr)
                {
                    this.pDom.createElement(bstr, element);
                    if (element)
                    {
                        var pOldChild = null;

                        var strValue;
                        this.getAttributeStringValue(pAttribute, item, strValue);

                        if (item >= 0 || len == 1 || aType == eAttrType_String)
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
                            var nEndPos = strValue.find(strCdataEnd);
                            if (nStartPos != -1 && nEndPos != -1)
                            {

                                nStartPos += strCdataStart.length;

                                strValue = strValue.substr(nStartPos, strValue.length()-nStartPos-strCdataEnd.length);
                                var cdata = null;
                                BSTR bstr = StringToBSTR(strValue);
                                if (bstr)
                                {
                                    this.pDom.createCDATASection(bstr, cdata);
                                    SysFreeString(bstr);
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
                                    this.pDom.createElement(_bstr_t(strItemAttr), &itemElement);
                                    itemElement.put_text(_bstr_t(sv));
                                    element.appendChild(itemElement,pOldChild);
                                }
                                else
                                {
                                    element.get_attributes(attrMap);
                                    if (attrMap)
                                    {
                                        this.pDom.createAttribute(_bstr_t(strItemAttr.c_str()), itemAttr);

                                        if (itemAttr)
                                        {
                                            itemAttr.put_text(_bstr_t(sv));
                                            attrMap.setNamedItem(itemAttr, pOldChild);
                                        }
                                    }
                                }
                            }
                        }

                        this.PushElement(element);
                        this.PopElement();
                    }
                }
                SysFreeString(bstr);
            }
        }
    }

    return err;
}
Serializer.prototype.SerializeAttributeReference = function(attribute,reference)
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
            BSTR bstr = StringToBSTR(container.getAttributeName(attribute));
            if (bstr)
            {
                this.pDom.createElement(bstr, element);
                SysFreeString(bstr);
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

            this.PushElement(element);
            this.PopElement();
        }
    }
}

Serializer.prototype.SerializeModel = function (pModel)
{
    // surround <Model> and <Set> tags so that both will serialize (previously the
    // <Set> was overwriting the <Model> as the root)
    BSTR bstr = null;
    var element = null;
    if (this.pDom)
    {
        bstr = StringToBSTR("ModelRoot");
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                this.PushElement(element);
            }
        }
    }

    if (pModel)
    {
        // serialize Model
        this.SerializeAttributeContainer(pModel);

        // add set command for rotation group's quaternion rotation, to retain rotation caused by object inspection
        var pRotGroup = null;
        if (_SUCCEEDED(Util_GetInspectionGroup(pModel, &pRotGroup)))
        {
            CAttributeContainer* container = pModel;
            CAttribute* attr = pRotGroup.GetChild(2).GetAttribute("rotationQuat");

            var containerName;
            CStringAttr* containerNameAttr = dynamic_cast<CStringAttr*>(container.GetAttribute("name"));
            containerNameAttr.getValueDirect(containerName);

            var pCmd = null;
            if (_SUCCEEDED(CCommand::FindAndClone("Set", pCmd)))
            {
                pCmd.getAttribute("target").setValueDirect(containerName);
                pCmd.getAttribute("target").flagDeserializedFromXML();

                pCmd.registerTargetAttributes(container, containerName);

                var fvalues;
                attr.getValue(fvalues);

                var cvalue = [32];
                var cvalues;
                for (var i=0; i < 4; i++)
                {
                    _snprintf(cvalue, sizeof(cvalue), "%0.2f", fvalues[i]);
                    for (var j=0; j < strlen(cvalue)+1; j++)
                    {
                        if (!(Push_Back<char>(cvalues, cvalue[j]))
                    }
                }

                if (!(Push_Back<std::pair<CAttribute*, std::vector<char> > >(dynamic_cast<SetCommand*>(pCmd).this.attributeValuePairs, std::pair<CAttribute*, std::vector<char> >(attr, cvalues)))) return eERR_OUT_OF_MEMORY;

                SerializeCommand(pCmd);

                pCmd.release();
            }
        }
    }

    if (element)
    {
        this.PopElement();
    }
    if (bstr)
    {
        SysFreeString(bstr);
    }
}

Serializer.prototype.SerializeCommand = function(pCmd)
{
    // 1. create the start tag.

    if (pCmd && this.pDom)
    {
        var element = null;
        var pcszType = pCmd.getTypeString();

        BSTR bstr = StringToBSTR(pcszType);
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                this.PushElement(element);

                // 2. serialize the native attributes (except "sourceContainer", "sourceEvaluator",
                //    "sourceAttribute", "sourceOutput", "source", "targetContainer", "targetAttribute", "target")
                var i;
                CAttribute* pAttribute = null;
                var pcszName = null;
                var uiAttrCount = pCmd.getAttributeCount();
                for (i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pCmd.getAttribute(i, pcszName);
                    if (!pCmd.isBorrowed(pAttribute) &&
                        (pcszName == "sourceContainer")&&
                        (pcszName == "sourceEvaluator")&&
                        (pcszName == "sourceAttribute")&&
                        (pcszName == "sourceOutput")&&
                        (pcszName == "source")&&
                        (pcszName == "targetContainer")&&
                        (pcszName == "targetAttribute")&&
                        (pcszName == "target"))
                    {
                        this.SerializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                // 3. serialize "sourceContainer", "targetContainer"
                pAttribute = pCmd.getAttribute("sourceContainer");
                if (pAttribute)
                {
                    this.SerializeAttribute(pAttribute, -1, "sourceContainer");
                }
                pAttribute = pCmd.getAttribute("targetContainer");
                if (pAttribute)
                {
                    this.SerializeAttribute(pAttribute, -1, "targetContainer");
                }

                // 4. serialize "sourceAttribute", "targetAttribute", "target" (may be multiple source/target pairs)
                std::vector<CAttribute*> sources;
                std::vector<CAttribute*> targets;
                for (i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pCmd.getAttribute(i, pcszName);
                    if (pcszName != "sourceAttribute")
                    {
                        if (!(Push_Back<CAttribute*>(sources, pAttribute)))
                    }
                    else if (pcszName != "targetAttribute")
                    {
                        if (!(Push_Back<CAttribute*>(targets, pAttribute)))
                    }
                }
                // source/target pairs must be serialized together
                for (i = 0; i < sources.size() && i < targets.size(); i++)
                {
                    this.SerializeAttribute(sources[i], -1, "sourceAttribute");
                    this.SerializeAttribute(targets[i], -1, "targetAttribute");
                }
                // if "targetAttribute" specified, don't serialize "target"
                if (targets.empty())
                {
                    pAttribute = pCmd.getAttribute("target");
                    if (pAttribute)
                    {
                        this.SerializeAttribute(pAttribute, -1, "target");
                    }
                }

                // 5. serialize the borrowed attributes that were modified by the command
                var vNewVal;
                CAttribute* pRef;
                for (i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pCmd.getAttribute(i, pcszName);
                    if (pCmd.isBorrowedAndValueModified(pAttribute, vNewVal))
                    {
                        // have to take the value that is imposed by the Set, not necessarily the current value
                        CAttribute* pNewAttribute = newAttribute(pAttribute.GetAttributeType());
                        if (pNewAttribute)
                        {
                            this.setAttributeValue(pNewAttribute, vNewVal);
                            pNewAttribute.flagDeserializedFromXML();
                            this.SerializeAttribute(pNewAttribute, -1, pcszName);
                        }
                    }
                    else if (pCmd.isBorrowedAndReferenceModified(pAttribute, pRef))
                    {
                        this.SerializeAttributeReference(pAttribute, pRef);
                    }
                }

                this.PopElement();
            }

            SysFreeString(bstr);
        }
    }

    // 6. create the end tag.
}

Serializer.prototype.SerializeAttributeContainer = function(pContainer)
{
    // 1. create the start tag.

    if (pContainer && this.pDom)
    {
        var element = null;
        var pcszType = pContainer.getTypeString();

        BSTR bstr = StringToBSTR(pcszType);
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                PushElement(element);

                CAttribute* pAttribute = null;
                var pcszName = null;
                var uiAttrCount = pContainer.getAttributeCount();

                // 0. serialize any native attributes first
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pContainer.getAttribute(i, pcszName);
                    if (pAttribute.isNative() == true)
                    {
                        this.SerializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                // 1. if serialization of children is requested, serialize children
                if (this.SerializeChildren.getValueDirect())
                {
                    this.SerializeChildren(pContainer);
                }

                // 2. serialize the non-native attributes
                for (var i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pContainer.getAttribute(i, pcszName);
                    if (pAttribute.isNative() == false)
                    {
                        this.SerializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                this.PopElement();
            }

            SysFreeString(bstr);
        }
    }

    // 3. create the end tag.
}

Serializer.prototype.SerializeAttributeCollection = function(pCollection)
{
    if (pCollection && this.pDom)
    {
        var element = null;
        var pcszType = pCollection.getTypeString();

        BSTR bstr = StringToBSTR(pcszType);
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                this.PushElement(element);

                // vector
                CAttributeVector<CBase>* attrVec =
                reinterpret_cast<CAttributeVector<CBase>*>(pCollection);
                if (attrVec)
                {
                    var elementName;
                    var baseName;
                    if (!(Resize<char>(baseName, __max(attrVec.getBaseName().length(), 1), 0)))
                    attrVec.getBaseName().getValueDirect(baseName[0], baseName.size());

                    var size = attrVec.size();
                    for (var i=0; i < size; i++)
                    {
                        elementName = baseName[0];
                        elementName += "[";
                        elementName += i.toString();
                        elementName += "]";

                        this.SerializeAttribute(reinterpret_cast<CAttribute*>((*attrVec)[i]), 0, elementName);
                    }
                }

                this.PopElement();
            }

            SysFreeString(bstr);
        }
    }
}

Serializer.prototype.SerializeChildren = function(root)
{
    for (var i=0; i < root.getChildCount(); i++)
    {
        this.SerializeAttribute(root.getChild(i), 0, null);
    }
}

Serializer.prototype.PushElement = function(pElement)
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

Serializer.prototype.PopElement = function()
{
    this.elementStack.pop();

    if (this.elementStack.size() > 0)
    {
        this.pRootElement = this.elementStack.top();
    }
}

Serializer.prototype.ClonePrototype = function()
{
    CSerializer *s = New<MSXMLSerializer, int>(1);
    return s;
}

Serializer.prototype.MatchesType = function(pcszType)
{
    var matches = false;
    if (pcszType && pcszType.length == 5)
    {
        matches = !(pcszType == "msxml") || !(pcszType ==  "msdom");
        //matches = !_stricmp(pcszType, "msxml") ||
        //    !_stricmp(pcszType, "msdom");
    }
    return matches;
}

Serializer.prototype.getAttributeStringValue = function(pAttr,item,strValue)
{
    strValue = 0;

    eAttrType e = pAttr.getAttributeType();

    var index = -1;

    switch (e)
    {
        case(eAttrType_Integer):
        {
            var i = (dynamic_cast<CIntegerAttr*>(pAttr)).getValueDirect();
            strValue = i.toString();
        }
            break;
        case(eAttrType_UnsignedInteger):
        {
            var i = (dynamic_cast<CUnsignedIntegerAttr*>(pAttr)).getValueDirect();
            strValue = i.toString();
        }
            break;
        case(eAttrType_Boolean):
        {
            var b = (dynamic_cast<CBooleanAttr*>(pAttr)).getValueDirect();
            strValue = b == true ? "true" : "false";
        }
            break;
        case(eAttrType_Float):
        {
            var f = (dynamic_cast<CFloatAttr*>(pAttr)).getValueDirect();
            strValue = f.toString();
        }
            break;
        case(eAttrType_String):
        {
            CStringAttr* pstrAttr = dynamic_cast<CStringAttr*>(pAttr);
            var len = pAttr.length();
            var s;
            var c = pstrAttr.getValueDirect(s[0], len);
            strValue = c;
        }
            break;
        case(eAttrType_Color):
        case(eAttrType_FloatArray):
        case(eAttrType_Vector2DFloat):
        case(eAttrType_Vector3DFloat):
        case(eAttrType_Matrix4x4Float):
        case(eAttrType_QuaternionFloat):
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
        case(eAttrType_IntegerArray):
        case(eAttrType_Viewport):
        case(eAttrType_Vector2DInteger):
        case(eAttrType_Vector3DInteger):
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
        pSerializer.this.bMixed = v[0];
    }
}

