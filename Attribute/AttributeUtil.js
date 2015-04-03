function setAttributeValue(attribute, value)
{
    switch (attribute.attrType)
    {
    case eAttrType.BooleanAttr:
        {
            if (value == "false" || value == "0")
                attribute.setValueDirect(false);
            else 
                attribute.setValueDirect(true);
        }
        break;

    case eAttrType.ColorAttr:
    case eAttrType.Matrix4x4Attr:
    case eAttrType.NumberArrayAttr:
    case eAttrType.QuaternionAttr:
    case eAttrType.Vector2DAttr:
    case eAttrType.Vector3DAttr:
    case eAttrType.ViewportAttr:
        {
            // convert from string to numeric
            for (var i = 0; i < value.length; i++)
            {
                value[i] = parseFloat(value[i]);
            }
            attribute.setValue(value);
        }
        break;   
    
    case eAttrType.NumberAttr:
        {
            // convert from string to numeric
            attribute.setValueDirect(parseFloat(value));
        }
        break;

    default:
        {
            attribute.setValue(value);
        }
        break;
    }
}