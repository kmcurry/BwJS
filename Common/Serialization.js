var gAttributeBin = null;
var gAttributePairs = null;

function setAttributeBin(bin)
{
    gAttributeBin = bin;
}

function setAttributePairs(pairs)
{
    gAttributePairs = pairs;
}

function deserializeAttributeContainer(container, atts)
{
    for (var i=0; i < atts.length; i++)
    {
        var attribute = container.getAttribute(atts[i][0]);
        if (attribute)
        {
            deserializeAttribute(attribute, atts[i][1]);
        }
    }
    
    container.flagDeserializedFromXML();
}

function deserializeComplexAttribute(attribute, atts)
{
    var values = [];
    for (var i=0; i < atts.length; i++)
    {
        values.push(atts[i][1]);
    }
    if (values.length > 0) 
    {
        if (!gAttributeBin)
        {
            setAttributeValue(attribute, values);
        }
        else // gAttributeBin != null
        {
            gAttributeBin.push(new Pair(attribute, values));
        }
    }
    
    attribute.flagDeserializedFromXML();
}

function deserializeAttribute(attribute, value)
{
    // TODO: search value for operators
    
    if (!gAttributeBin)
    {
        setAttributeValue(attribute, value);
    }
    else // gAttributeBin != null
    {
        gAttributeBin.push(new Pair(attribute, value));
    }
    
    attribute.flagDeserializedFromXML();
}

function resolveAttributeContainerReference(container, atts, registry)
{
    if (atts.length > 0)
    {
        if (atts[0][0] == "ref")
        {
            var resource = registry.find(atts[0][1]);
            if (resource)
            {
                container.synchronize(resource, true);
                return true;
            } 
        }
    }
    
    return false;
}

function resolveComplexAttributeReference(attribute, atts)
{
    if (atts.length > 0)
    {
        if (atts[0][0] == "ref")
        {
            return resolvePrimitiveAttributeReference(attribute, atts[0][1]);
        }
    }

    return false;
}

function resolvePrimitiveAttributeReference(attribute, value)
{
    // TODO
    return false;
}

function resolveAttributeReference(source, target)
{
    if (!gAttributePairs)
    {
        target.copyValue(source);
    }
    else // gAttributePairs != null
    {
        gAttributePairs.push(new Pair(source, target));
    }
}