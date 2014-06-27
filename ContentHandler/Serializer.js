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
                        IXMLDOMNode* pOldChild = null;

                        var strValue;
                        err = GetAttributeStringValue(pAttribute, item, strValue);

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

                        PushElement(element);
                        PopElement();
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

            PushElement(element);
            PopElement();
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
                PushElement(element);
            }
        }
    }

    if (pModel)
    {
        // serialize Model
        SerializeAttributeContainer(pModel);

        // add set command for rotation group's quaternion rotation, to retain rotation caused by object inspection
        var pRotGroup = null;
        if (_SUCCEEDED(Util_GetInspectionGroup(pModel, &pRotGroup)))
        {
            CAttributeContainer* container = pModel;
            CAttribute* attr = pRotGroup.GetChild(2).GetAttribute("rotationQuat");

            var containerName;
            CStringAttr* containerNameAttr = dynamic_cast<CStringAttr*>(container.GetAttribute("name"));
            containerNameAttr.getValueDirect(containerName);

            CCommand* pCmd = null;
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
        PopElement();
    }
    if (bstr)
    {
        SysFreeString(bstr);
    }
}

Serializer.prototype.SerializeCommand(pCmd)
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
                PushElement(element);

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
                        CAttribute* pNewAttribute = NewAttribute(pAttribute.GetAttributeType());
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

                PopElement();
            }

            SysFreeString(bstr);
        }
    }

    // 6. create the end tag.
}

eERR_CODE MSXMLSerializer::SerializeAttributeContainer(CAttributeContainer* pContainer)
{
    eERR_CODE err = eERR_FAIL;
    // 1. create the start tag.

    if (pContainer && this.pDom)
    {
        IXMLDOMElement* element = null;
        const char* pcszType = pContainer.GetTypeString();

        BSTR bstr = StringToBSTR(pcszType);
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                PushElement(element);

                CAttribute* pAttribute = null;
                const char* pcszName = null;
                unsigned int uiAttrCount = pContainer.GetAttributeCount();

                // 0. serialize any native attributes first
                for (unsigned int i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pContainer.GetAttribute(i, pcszName);
                    if (pAttribute.IsNative() == true)
                    {
                        err = SerializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                // 1. if serialization of children is requested, serialize children
                if (this.serializeChildren.getValueDirect())
                {
                    SerializeChildren(dynamic_cast<CNode*>(pContainer));
                }

                // 2. serialize the non-native attributes
                for (unsigned int i = 0; i < uiAttrCount; ++i)
                {
                    pAttribute = pContainer.GetAttribute(i, pcszName);
                    if (pAttribute.IsNative() == false)
                    {
                        err = SerializeAttribute(pAttribute, -1, pcszName);
                    }
                }

                PopElement();
            }

            SysFreeString(bstr);
        }
    }

    // 3. create the end tag.
    return err;
}

eERR_CODE MSXMLSerializer::SerializeAttributeCollection(CAttributeContainer* pCollection)
{
    eERR_CODE err = eERR_FAIL;

    if (pCollection && this.pDom)
    {
        IXMLDOMElement* element = null;
        const char* pcszType = pCollection.GetTypeString();

        BSTR bstr = StringToBSTR(pcszType);
        if (bstr)
        {
            this.pDom.createElement(bstr, element);
            if (element)
            {
                PushElement(element);

                // vector
                CAttributeVector<CBase>* attrVec =
                reinterpret_cast<CAttributeVector<CBase>*>(pCollection);
                if (attrVec)
                {
                    std::string elementName;
                    std::vector<char> baseName;
                    if (!(Resize<char>(baseName, __max(attrVec.GetBaseName().GetLength(), 1), 0))) return eERR_OUT_OF_MEMORY;
                    attrVec.GetBaseName().getValueDirect(&baseName[0], baseName.size());

                    unsigned int size = attrVec.size();
                    for (unsigned int i=0; i < size; i++)
                    {
                        elementName = &baseName[0];
                        elementName += "[";
                        elementName += convertToString(i);
                        elementName += "]";

                        err = SerializeAttribute(reinterpret_cast<CAttribute*>((*attrVec)[i]), 0, elementName.c_str());
                    }
                }

                PopElement();
            }

            SysFreeString(bstr);
        }
    }

    return err;
}

eERR_CODE MSXMLSerializer::SerializeChildren(CNode* root)
{
    if (!root)
    {
        return eERR_null_PARAM;
    }

    for (unsigned int i=0; i < root.GetChildCount(); i++)
    {
        SerializeAttribute(root.GetChild(i), 0, null);
    }

    return eNO_ERR;
}

eERR_CODE MSXMLSerializer::PushElement(IXMLDOMElement* pElement)
{
    if (!pElement)
    {
        return eERR_null_PARAM;
    }

    if (!this.pDom)
    {
        return eERR_FAIL;
    }

    if (!(Push<IXMLDOMElement*>(this.elementStack, pElement))) return eERR_OUT_OF_MEMORY;

    if (this.pRootElement)
    {
        IXMLDOMNode* pOldChild = null;
        this.pRootElement.appendChild(pElement, pOldChild);
    }
    else // !this.pRootElement
    {
        this.pDom.putref_documentElement(pElement);
    }

    this.pRootElement = pElement;

    return eNO_ERR;
}

eERR_CODE MSXMLSerializer::PopElement()
{
    if (this.elementStack.empty())
    {
        return eERR_FAIL;
    }

    this.elementStack.pop();

    if (this.elementStack.size() > 0)
    {
        this.pRootElement = this.elementStack.top();
    }

    return eNO_ERR;
}

CSerializer* MSXMLSerializer::ClonePrototype()
{
    CSerializer *s = New<MSXMLSerializer, int>(1);
    return s;
}

bool MSXMLSerializer::MatchesType(const char* pcszType)
{
    bool matches = false;
    if (pcszType && strlen(pcszType) == 5)
    {
        matches = !_stricmp(pcszType, "msxml") ||
            !_stricmp(pcszType, "msdom");
    }
    return matches;
}

eERR_CODE GetAttributeStringValue(CAttribute* pAttr, int item, string &strValue)
{
    eERR_CODE err = eERR_FAIL;

    strValue.erase();

    eAttrType e = pAttr.GetAttributeType();

    int index = -1;

    switch (e)
    {
        case(eAttrType_Integer):
        {
            int i = (dynamic_cast<CIntegerAttr*>(pAttr)).getValueDirect();
            strValue = convertToString(i);
        }
            break;
        case(eAttrType_UnsignedInteger):
        {
            unsigned int i = (dynamic_cast<CUnsignedIntegerAttr*>(pAttr)).getValueDirect();
            strValue = convertToString(i);
        }
            break;
        case(eAttrType_Boolean):
        {
            bool b = (dynamic_cast<CBooleanAttr*>(pAttr)).getValueDirect();
            strValue = b == true ? "true" : "false";
        }
            break;
        case(eAttrType_Float):
        {
            float f = (dynamic_cast<CFloatAttr*>(pAttr)).getValueDirect();
            strValue = convertToString(f);
        }
            break;
        case(eAttrType_String):
        {
            CStringAttr* pstrAttr = dynamic_cast<CStringAttr*>(pAttr);
            int len = pAttr.GetLength();
            string s;
            if (!(Resize(s, len))) return eERR_OUT_OF_MEMORY;
            const char* c = pstrAttr.getValueDirect(&s[0], len);
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
            std::vector<float> vecVal_F;
            pAttr.getValue(vecVal_F);
            if (item == -1)
            {
                for (unsigned int i = 0; i < vecVal_F.size(); ++i)
                {
                    strValue += convertToString(vecVal_F[i]);
                    if (i < vecVal_F.size() - 1)
                    {
                        strValue += ",";
                    }
                }
            }
            else
            {
                strValue += convertToString(vecVal_F[item]);
            }
        }
            break;
        case(eAttrType_IntegerArray):
        case(eAttrType_Viewport):
        case(eAttrType_Vector2DInteger):
        case(eAttrType_Vector3DInteger):
        {
            std::vector<int> vecVal_I;
            pAttr.getValue(vecVal_I);
            if (item == -1)
            {
                for (unsigned int i = 0; i < vecVal_I.size(); ++i)
                {
                    strValue += convertToString(vecVal_I[i]);
                    if (i < vecVal_I.size() - 1)
                    {
                        strValue += ",";
                    }
                }
            }
            else
            {
                strValue += convertToString(vecVal_I[item]);
            }
        }
            break;
        default:
        {
        }
            break;
    }

    //strValue += '\0';

    if (!strValue.empty())
    {
        err = eNO_ERR;
    }
    return err;
}

void MSXML_MixedModifiedCB(CAttribute* pAttr, void* pData)
{
    vector<int> v;
    pAttr.getValue(v);
    MSXMLSerializer* pSerializer = static_cast<MSXMLSerializer*>(pData);
    if ((unsigned int)pSerializer != 0xffffffff)
    {
        pSerializer.this.bMixed = (bool)v[0];
    }
}

