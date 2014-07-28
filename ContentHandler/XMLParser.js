function XMLParser(factory, registry, contentDir)
{
    this.factory = factory;
    this.registry = registry;
    this.contentDir = contentDir;
    this.attributeStack = new Stack();
    this.collectionCountStack = new Stack();
}

XMLParser.prototype.parse = function(xml)
{
    parser = new SAXDriver();
   
    parser.setDocumentHandler(this);
    parser.setErrorHandler(this);
    parser.setLexicalHandler(this);

    parser.parse(xml);
}

XMLParser.prototype.processingInstruction = function(target, data)
{
    switch (target)
    {
        case "bw":
            {
                // TODO
                console.debug("TODO: " + target.toString());
            }
            break;

        case "bwinclude":
            {
                var dataString = new String(data);

                // url
                var url = this.parseTokenValue(dataString, "url=\"", "\"");
                if (url)
                {
                    console.debug("Processing Instruction for: " + url);
                    var ext = getFileExtension(url);
                    switch (ext) {
                    case "xml":
                        {
                            var xml = loadXMLResource(this.contentDir + "/" + url);
                            this.parse(xml);
                        }
                        break;
                        // TODO: abstract this dependency away from here
                    case "lws":
                        {
                            var pathInfo = formatPath(url);
                            console.debug("Include instruction for path: " + pathInfo[0]);
                            console.debug("Include content dir: " + pathInfo[1]);
            
                            var contentHandler = new LWSceneHandler();
                            contentHandler.getAttribute("contentDirectory").setValueDirect(pathInfo[1]);
            
                            var contentBuilder = new LWSceneBuilder(); 
                            contentBuilder.setRegistry(this.factory.registry);
                            contentBuilder.visitHandler(contentHandler);
            
                            contentHandler.parseFileStream(pathInfo[0]); 
                        }
                        break;
                    }
                }
            }
            break;
    }
}

XMLParser.prototype.startElement = function(name, atts) 
{
    // by convention, AttributeContainers start with capital letters, and 
    // complex attributes do not.
    if (isUpper(name[0]))
    {
        this.parseAttributeContainer(name, atts);
    }
    else 
    {
        this.parseComplexAttribute(name, atts);
    }
}

XMLParser.prototype.endElement = function(name) 
{
    // by convention, AttributeContainers start with capital letters, and 
    // complex attributes do not.
    if (isUpper(name[0]))
    {
        this.parseAttributeContainer(name);
    }
    else 
    {
        this.parseComplexAttribute(name);
    }
}

XMLParser.prototype.startCDATA = function()
{
}

XMLParser.prototype.endCDATA = function()
{
}

XMLParser.prototype.characters = function(data, start, length)
{
    var value = "";
    for (var i = 0; i < length; i++)
    {
        value += data[start + i];
    }
    if (value.length && !isSpace(value[0]))
    {
        var attribute = this.attributeStack.top();
        if (attribute)
        {
            // TODO: resolve reference
            deserializeAttribute(attribute, value);
        }
    }
}

XMLParser.prototype.error = function(exception) 
{
    alert('Error: ' + exception.getMessage());
}

XMLParser.prototype.fatalError = function(exception) 
{
    alert('Fatal Error: ' + exception.getMessage());
}

XMLParser.prototype.parseAttributeContainer = function(name, atts)
{
    if (atts) // element start
    {
        var attribute = this.factory.create(name);
        if (!attribute)
        {
            this.attributeStack.push(null); // for corresponding pop at closing tag
            return;
        }
        attribute.flagDeserializedFromXML();

        if (!resolveAttributeContainerReference(attribute, atts.m_parser.m_atts, this.registry))
        {
            deserializeAttributeContainer(attribute, atts.m_parser.m_atts);
        }

        this.registry.registerResource(attribute);
        
        // if a collection is at the top of the attribute stack which does not allocate its elements,
        // add the attribute it to the collection
        var container = this.attributeStack.top();
        if (container && container.isCollection())
        {
            if (!container.allocatesElements())
            {
                container.push_back(attribute);
                container.setElementName(attribute, name);

                var count = this.collectionCountStack.top();
                count++;
                this.collectionCountStack.pop();
                this.collectionCountStack.push(count);
            }
            else
            {
                container.setElementName(container.getAt(container.Size() - 1), name);
            }
        }

        this.attributeStack.push(attribute);

        if (attribute.isCollection())
        {
            this.collectionCountStack.push(0);
        }
    }
    else // element end
    {
        var attribute = this.attributeStack.top();

        this.attributeStack.pop();

        if (attribute && attribute.isCollection())
        {
            this.collectionCountStack.pop();
        }

        if (attribute)
        {
            this.factory.finalize(name, attribute);
            this.registry.finalizeResource(attribute);
        }
    }
}

XMLParser.prototype.parseComplexAttribute = function(name, atts)
{
    if (atts) // element start
    {
        var container = this.attributeStack.top();
        if (!container) return;

        var attribute = container.getAttribute(name);
        if (!attribute)
        {
            // check for collections here... if a collection is at the top of 
            // the attribute stack, resize the collection (if necessary) to accomodate
            // the current attribute being deserialized
            if (container.isCollection())
            {
                var count = this.collectionCountStack.top();
                count++;

                var size = container.Size();

                if (container.AppendParsedElements())
                {
                    container.resize(size + 1);
                    count = size;
                }
                else if (size <= count)
                {
                    container.resize(count + 1);
                }

                attribute = container.getAt(count);
            }
            else
            {
                this.attributeStack.push(container); // for corresponding pop at closing tag (push container so that child complex attributes can access)
                return;
            }
        }

        this.attributeStack.push(attribute);

        if (attribute && attribute.isContainer())
        {
            if (!resolveAttributeContainerReference(attribute, atts.m_parser.m_atts, this.registry))
            {
                deserializeAttributeContainer(attribute, atts.m_parser.m_atts);
            }

            if (attribute.isCollection())
            {
                this.collectionCountStack.push(0);
            }
        }
        else if (attribute)
        {
            if (!resolveComplexAttributeReference(attribute, atts.m_parser.m_atts))
            {
                deserializeComplexAttribute(attribute, atts.m_parser.m_atts);
            }
        }
    }
    else // element end
    {
        this.attributeStack.pop();

        if (container && container.isCollection())
        {
            this.collectionCountStack.pop();
        }
    }
}

XMLParser.prototype.parsePrimitiveAttribute = function()
{

}

XMLParser.prototype.parseTokenValue = function(string, delim_begin, delim_end)
{
    var begin = string.indexOf(delim_begin);
    if (begin == -1)
    {
        return undefined;
    }
    begin += delim_begin.length;

    var end = string.indexOf(delim_end, begin);
    if (end == -1)
    {
        return undefined;
    }

    return string.substring(begin, end);
}

