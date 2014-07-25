Node.prototype = new AttributeContainer();
Node.prototype.constructor = Node;

function Node()
{
    AttributeContainer.call(this);
    this.className = "Node";
    this.attrType = eAttrType.Node;
    
    this.children = [];
    this.parents = [];
    this.modificationCount = 0;
    this.thisModified = false;
    this.childModified = false;
    this.childrenModified = [];
    
    this.name = new StringAttr("");
    this.enabled = new BooleanAttr(true);
    this.orphan = new BooleanAttr(false);
    
    this.registerAttribute(this.name, "name");
    this.registerAttribute(this.enabled, "enabled");
    this.registerAttribute(this.orphan, "orphan");
}

Node.prototype.copyNode = function(clone, cloneChildren, pathSrc, pathClone)
{
    var clonedByThis = false;
    if (!clone)
    {
        if (!(clone = new Node()))
        {
            return -1;
        }

        clonedByThis = true;
    }

    // synchronize attributes
    clone.synchronize(this, false);

    // add source to path
    //pathSrc.addNode(this);
    pathSrc.push(this);

    // add clone to path
   // pathClone.AddNode(clone);
    pathClone.push(this);

    // if requested, clone children
    if (cloneChildren)
    {
      //  m_graphAccessLock.Lock("CNode::Clone");//(CReadWriteLock::eRWLockMode_Read);

        var pos;
        for (var i in this.children)
        {
            //pos = it - m_children.begin();
            pos = i - this.children.start();

            var childClone = null;
            if(!(i.getCreatedByParent()))
            {
                if (i.copyNode(childClone, cloneChildren, pathSrc, pathClone)) {
                    if (clonedByThis) {
                    }
                    return -1;
                }

                if (clone.getChildCount() > pos) {
                    clone.insertChild(childClone, pos);
                }
                else {
                    clone.addChild(childClone);
                }

                i.postCloneChild(childClone, pathSrc, pathClone);
            }
        else // created by parent -- clone child's children without allocating child
            {
                //childClone = clone.getChild(i - m_children.begin());
                childClone = clone.getChild(i - this.children.start());

                if (i.copyNode(childClone, cloneChildren, pathSrc, pathClone))
                {
                    if (clonedByThis)
                    {
                    }
                    return -1;
                }
            }
        }

        //m_graphAccessLock.Unlock();//(CReadWriteLock::eRWLockMode_Read);
    }

    this.postClone(clone, pathSrc, pathClone);

}
Node.prototype.searchTree = function(name,type,searchName,searchType,searchPredecessors,skipChild,skipParent,stopAt,matches)
{
    var names = [];
    var types = [];

    if (!(names.push(name))) return;
    if (!(types.push(type))) return;

    this.searchesTree(names, types, searchName, searchType, searchPredecessors, skipChild, skipParent,
        stopAt, matches);
}

Node.prototype.searchesTree = function(names,types,searchNames,searchTypes,searchPredecessors,skipChild,skipParent,stopAt,matches)
{
    // if this node matches any of the names and/or types, add it to the list
    var match = false;
    var nameMatch = false;
    var typeMatch = false;
    if (searchNames)
    {
        for (var i=0; i < names.size(); i++)
        {
            if (!(this.name == names[i]))
            {
                nameMatch = true;
                break;
            }
        }
    }
    if (searchTypes)
    {
        for (var i=0; i < types.size(); i++)
        {
            if (this.attrType == types[i])
            {
                typeMatch = true;
                break;
            }
        }
    }
    if (searchNames && searchTypes)
    {
        match = nameMatch && typeMatch;
    }
    else if (searchNames)
    {
        match = nameMatch;
    }
    else // searchTypes
    {
        match = typeMatch;
    }
    if (match)
    {
        if (!(matches.push(this))) return;
    }

    if (this == stopAt)
    {
        return;
    }

    // recurse on parent(s) if requested (with this set to skipChild)
    if (searchPredecessors)
    {
        for (var i=0; i < this.parents.size(); i++)
        {
            if (this.parents[i] != skipParent)
            {
                this.parents[i].searchesTree(names, types, searchNames, searchTypes, searchPredecessors,
                    this, null, stopAt, matches);
            }
        }
    }

    // recurse on children (with searchPredecessors set to false)
    for (var i=0; i < this.children.size(); i++)
    {
        if (this.children[i] != skipChild)
        {
            this.children[i].searchesTree(names, types, searchNames, searchTypes, false,
                null, null, stopAt, matches);
        }
    }
}
Node.prototype.setCreatedByParent = function(createdByParent)
{
    this.createdByParent = createdByParent;
}
Node.prototype.getCreatedByParent = function()
{
    return this.createdByParent;
}

Node.prototype.isNode = function()
{
    return true;
}

Node.prototype.addChild = function(child)
{
    this.children.push(child);
    
    this.incrementModificationCount();
    
    child.addParent(this);
}

Node.prototype.insertChild = function(child, before)
{
    this.children.splice(before, 0, child);
    
    this.incrementModificationCount();
    
    child.addParent(this);
}

Node.prototype.removeChild = function(child)
{
    this.children.splice(this.children.indexOf(child), 1);
    
    this.incrementModificationCount();
    
    child.removeParent(this);
}

Node.prototype.replaceChild = function(replacement, replacee)
{
    this.children.splice(this.children.indexOf(replacement), 1, replacee);
    replacement.removeParent(this);
    replacee.addParent(this);
}

Node.prototype.getChild = function(n)
{
    if (this.children.length > n)
    {
        return this.children[n];
    }
    
    return null;
}

Node.prototype.getNamedChild = function(name)
{
    for (var i=0; i < this.children.length; i++)
    {
        if (this.children[i].name.getValueDirect().join("") == name)
        {
            return this.children[i];
        }
    }
    
    return null;
}

Node.prototype.getChildCount = function()
{
    return this.children.length;
}

Node.prototype.getParent = function(n)
{
    if (this.parents.length > n)
    {
        return this.parents[n];
    }
    
    return null;
}

Node.prototype.getParentCount = function()
{
    return this.parents.length;
}

Node.prototype.addParent = function(parent)
{
    this.parents.push(parent);
}

Node.prototype.removeParent = function(parent)
{
    this.parents.splice(this.parents.indexOf(parent), 1);
}

Node.prototype.update = function(params, visitChildren)
{
    // only update if this and/or child has been modified
    if (!this.thisModified && !this.childModified)
    {
        // no need to update; inform parent this node is unmodified
        this.setChildModified(false, false);
        params.visited.push(this);
        return;
    }
    
    params.visited.push(this);
    
    if (visitChildren)
    {
        // call for all children
        for (var i=0; i < this.children.length; i++)
        {
            this.children[i].update(params, visitChildren);
        }
    }
    
    this.childModified = this.isChildModified();
}

Node.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }

    switch (directive)
    {
        case "serialize":
        {          
            var context = new Context();
            context.attribute = this;

            var factory = this.registry.find("AttributeFactory");
            var serializer = factory.create("Serializer");
            var xmlSerializer = new XMLSerializer();
            
            // added required format setting - need to revisit to reduce number of required steps
            serializer.getAttribute("format").setValueDirect("xml");
            // set minimum flag so that only the minimum required for recreation is serialized
            serializer.getAttribute("serializeMinimum").setValueDirect(true);
            // set children flag so that child nodes are serialized
            serializer.getAttribute("serializeChildren").setValueDirect(true);
            // serialize
            serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
            params.serialized += xmlSerializer.serializeToString(serializer.DOM);

            // do not visit children, as they were serialized by this
            visitChildren = false;
        }
        break;
    }
    
    if (visitChildren)
    {
        if (params.path)
        {
            // call for next node in path if next node in path is a child of this node
            if (params.path.length > params.pathIndex)
            {
                for (var i=0; i < this.children.length; i++)
                {
                    var next = params.path[params.pathIndex];

                    if (this.children[i] == next)
                    {
                        params.pathIndex++;
                        this.children[i].apply(directive, params, visitChildren);
                    }
                }
            }
        }
        else
        {
            // call for all children
            for (var i=0; i < this.children.length; i++)
            {
                this.children[i].apply(directive, params, visitChildren);
            }
        }
    }
}

Node.prototype.applyNode = function(node, directive, params, visitChildren)
{
    node.apply(directive, params, visitChildren);
}

Node.prototype.setModified = function()
{
    this.thisModified = true;

    // notify parent(s) of modification so that display lists can be maintained
    this.setChildModified(true, true);
}

Node.prototype.incrementModificationCount = function()
{
    this.modificationCount++;
    
    this.setModified();
}

Node.prototype.setChildModified = function(modified, recurse)
{
    // set on parent(s) of this; recurse if specified
    var parent = null;
    for (var i=0; i < this.parents.length; i++)
    {
        parent = this.parents[i];
        if (parent)
        {
            parent.childrenModified[this] = modified;
            parent.childModified = modified ? true : parent.isChildModified();
            if (recurse) parent.setChildModified(modified, recurse);
        }
    }
}

Node.prototype.isChildModified = function()
{
    for (var i in this.childrenModified)
    {
        if (this.childrenModified[i] == true) return true;
    }

    return false;
}