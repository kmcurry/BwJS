AutoInterpolateCommand.prototype = new Command();
AutoInterpolateCommand.prototype.constructor = AutoInterpolateCommand;

function AutoInterpolateCommand()
{
    Command.call(this);
    this.className = "AutoInterpolate";
    this.attrType = eAttrType.AutoInterpolate;

    this.kfi = null;
    this.numValueChannels = 0;
    this.numReferenceChannels = 0;
    this.numChannels = 0;

    this.shape = new NumberAttr(eKeyframeShape.Linear);
    this.duration = new NumberAttr(1);
    this.preBehavior = new NumberAttr(eEndBehavior.Constant);
    this.postBehavior = new NumberAttr(eEndBehavior.Constant);
    this.renderAndRelease = new BooleanAttr(true);

    this.target.addModifiedCB(AutoInterpolateCommand_TargetModifiedCB, this);

    this.registerAttribute(this.shape, "shape");
    this.registerAttribute(this.duration, "duration");
    this.registerAttribute(this.preBehavior, "preBehavior");
    this.registerAttribute(this.postBehavior, "postBehavior");
    this.registerAttribute(this.renderAndRelease, "renderAndRelease");
}

AutoInterpolateCommand.prototype.execute = function()
{
    // TODO: enabled (?)

    this.buildMotion();
    if (this.kfi)
    {
        this.kfi.getAttribute("time").setValueDirect(0);
        this.kfi.getAttribute("enabled").setValueDirect(true);
    }
}

AutoInterpolateCommand.prototype.buildMotion = function()
{
    var factory = this.registry.find("AttributeFactory");
    this.kfi = factory.create("KeyframeInterpolator");
    if (!this.kfi)
    {
        return;
    }
    this.kfi.getAttribute("enabled").setValueDirect(false);
    this.kfi.getAttribute("renderAndRelease").copyValue(this.renderAndRelease);

    var name = this.name.getValueDirect().join("");
    name += "_AutoInterpolator";
    this.kfi.getAttribute("name").setValueDirect(name);

    for (var i = 0; i < this.attributeValuePairs.length; i++)
    {
        this.numValueChannels += this.attributeValuePairs[i].first.getLength();
    }
    for (var i = 0; i < this.attributeRefPairs.length; i++)
    {
        this.numReferenceChannels += this.attributeRefPairs[i].first.getLength();
    }
    this.numChannels = this.numValueChannels + this.numReferenceChannels;
    this.kfi.setNumChannels(this.numChannels);

    var pre = this.preBehavior.getValueDirect();
    var post = this.postBehavior.getValueDirect();
    for (var i = 0; i < this.numChannels; i++)
    {
        this.kfi.getAttribute("preBehaviors").getAt(i).setValueDirect(pre);
        this.kfi.getAttribute("postBehaviors").getAt(i).setValueDirect(post);
    }

    // apply the parsed values to the kfi
    this.applyAttributeValues();
    this.applyAttributeRefs();
}

AutoInterpolateCommand.prototype.applyAttributeValues = function()
{
    // i = channel counter, advanced by j elements each pass
    // j = element of an Attribute, always 0 for primitive Attrs or 0-length-1 for complex
    // k = index in attribute values map
    var i, j, k;
    for (i = 0, k = 0; k < this.attributeValuePairs.length; k++)
    {
        var attr = this.attributeValuePairs[k].first;
        var value = this.attributeValuePairs[k].second;

        // for each channel:
        // 1. create a starting keyframe from target's current value for each attribute
        // 2. create an ending keyframe from the value contained in the map for each attribute
        for (j = 0; j < attr.getLength(); j++)
        {
            var keyframes = this.kfi.getAttribute("channels").getAt(i + j);

            var start = new KeyframeAttr();
            var end = new KeyframeAttr();

            start.getAttribute("time").setValueDirect(0);
            end.getAttribute("time").setValueDirect(this.duration.getValueDirect());

            start.getAttribute("shape").setValueDirect(this.shape.getValueDirect());
            end.getAttribute("shape").setValueDirect(this.shape.getValueDirect());

            // ensure numerical value with parseFloat()
            var startVal = parseFloat(attr.getElement(j));
            var endVal = parseFloat(attr.getLength() > 1 ? value[j] : value);

            // if the attribute is rotational (determined by "rotation" or "angle" as the attribute name),
            // ensure motion will be the shortest path (eliminate the spin caused by 360's)
            if (this.isAttributeRotational(attr))
            {
                var shortestPath = this.shortestPath(startVal, endVal);
                startVal = shortestPath.start;
                endVal = shortestPath.end;
            }

            start.getAttribute("value").setValueDirect(startVal);
            end.getAttribute("value").setValueDirect(endVal);

            keyframes.push_back(start);
            keyframes.push_back(end);

            // connect the interpolator's output to the attribute
            this.kfi.getAttribute("resultValues").getAt(i + j).addElementTarget(attr, 0, j)
        }

        i += j;
    }
}

AutoInterpolateCommand.prototype.applyAttributeRefs = function()
{
    // i = channel counter, advanced by j elements each pass
    // j = element of an Attribute, always 0 for primitive Attrs or 0-length-1 for complex
    // k = index in attribute values map
    var i, j, k;
    for (i = 0, k = 0; k < this.attributeRefPairs.length; k++)
    {
        var ref = this.attributeRefPairs[k].first;
        var attr = this.attributeRefPairs[k].second;

        // for each channel:
        // 1. create a starting keyframe from target's current value for each attribute
        // 2. create an ending keyframe from the value contained in the map for each attribute
        for (j = 0; j < attr.getLength(); j++)
        {
            var keyframes = this.kfi.getAttribute("channels").getAt(i + j);

            var start = new KeyframeAttr();
            var end = new KeyframeAttr();

            start.getAttribute("time").setValueDirect(0);
            end.getAttribute("time").setValueDirect(this.duration.getValueDirect());

            start.getAttribute("shape").setValueDirect(this.shape.getValueDirect());
            end.getAttribute("shape").setValueDirect(this.shape.getValueDirect());

            // ensure numerical value with parseFloat()
            var startVal = parseFloat(attr.getElement(j));
            var endVal = parseFloat(ref.getElement(j));

            // if the attribute is rotational (determined by "rotation" or "angle" as the attribute name),
            // ensure motion will be the shortest path (eliminate the spin caused by 360's)
            if (this.isAttributeRotational(attr))
            {
                var shortestPath = this.shortestPath(startVal, endVal);
                startVal = shortestPath.start;
                endVal = shortestPath.end;
            }

            start.getAttribute("value").setValueDirect(startVal);
            end.getAttribute("value").setValueDirect(endVal);

            keyframes.push_back(start);
            keyframes.push_back(end);

            // connect the interpolator's output to the attribute
            this.kfi.getAttribute("resultValues").getAt(i + j).addElementTarget(attr, 0, j)
        }

        i += j;
    }
}

AutoInterpolateCommand.prototype.registerTargetAttributes = function(target, targetName)
{
    var sname;
    var myAttribute;
    var count = target.getAttributeCount();
    for (var i = 0; i < count; i++)
    {
        var attribute = target.getAttributeAt(i);
        var attributeName = target.getAttributeNameAt(i);

        // if the target has an attribute of the same name as the
        // Set, register that same attribute using a relative path
        // expression, e.g., "Container_target"
        if ((myAttribute = this.getAttribute(attributeName)) != null)
        {
            // insert relative path expression
            sName = targetName + "_";
            sName += attributeName;
        }
        else	// attribute is not already registered
        {
            sName = attributeName;
        }

        this.registerAttribute(attribute, sName);
        this.borrowedAttributes.push(attribute);
    }
}

AutoInterpolateCommand.prototype.isAttributeRotational = function(attr)
{
    var container = attr.getContainer();
    if (container)
    {
        var name = container.getAttributeName(attr);
        if (name)
        {
            if (name == "rotation" ||
                name == "angle")
            {
                return true;
            }
        }
    }

    return false;
}

AutoInterpolateCommand.prototype.shortestPath = function(start, end)
{
    // normalize start to [0, 360)
    var nstart = degreeNormalize(start);

    // normalize end to [0, 360]
    var nend = degreeNormalize(end);

    // calculate direct path
    var directPath = nend - nstart;
    if (directPath <= 180 && directPath >= -180)
    {
        return { start: start, end: end }; // direct path is shortest path, no changes necessary
    }

    // if direct path > 180 or < -180, a shorter path exists
    var shortestPath = 0;
    if (directPath > 180)
    {
        shortestPath = 360 - directPath;
    }
    else //if (directPath < -180)
    {
        shortestPath = 360 + directPath;
    }

    // update start/end so that shortest path is traversed
    start = nstart;
    if (nend > nstart)
    {
        end = nstart - shortestPath;
    }
    else
    {
        end = nstart + shortestPath;
    }

    return { start: start, end: end };
}

function AutoInterpolateCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var targets = target.split(",");

    container.targets.length = 0;
    for (var i = 0; i < targets.length; i++)
    {
        var resource = container.registry.find(targets[i]);
        if (resource)
        {
            container.registerTargetAttributes(resource, targets[i]);
        }
    }

    setAttributeBin(container.attributeValuePairs);
    setAttributePairs(container.attributeRefPairs);
}
