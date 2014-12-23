ExportCommand.prototype = new Command();
ExportCommand.prototype.constructor = ExportCommand;

function ExportCommand()
{
    Command.call(this);
    this.className = "Export";
    this.attrType = eAttrType.Export;

    this.targetNode = null;
    
    this.url = new StringAttr();
    
    this.target.addModifiedCB(ExportCommand_TargetModifiedCB, this);

    this.registerAttribute(this.url, "url");
}

ExportCommand.prototype.execute = function()
{
    if (!this.targetNode) return;
    
    var url = this.url.getValueDirect().join("");   
    switch (getFileExtension(url))
    {
        case "stl":
            this.exportSTL(this.targetNode, url);
            break;
            
        default:
            break;
    }
}

ExportCommand.prototype.exportSTL = function(model, url)
{
    // name
    var name = model.name.getValueDirect().join("");
    
    // vertices/normals
    var vertices = [];
    var normals = [];   
    for (var i=0; i < model.geometry.length; i++)
    {
        var geometry = model.geometry[i];
        switch (geometry.attrType)
        {
            case eAttrType.TriList:
                {
                    vertices = vertices.concat(geometry.vertices.getValueDirect());
                    normals = normals.concat(geometry.vertices.getValueDirect());
                }
                break;
        }
    }
    if (vertices.length == 0) return;
    
    // vertices cannot have negative values, so offset vertices if negative values are present
    var x = FLT_MAX, y = FLT_MAX, z = FLT_MAX;
    for (var i=0; i < vertices.length; i+=3)
    {
        x = Math.min(x, vertices[i  ]);
        y = Math.min(y, vertices[i+1]);
        z = Math.min(z, vertices[i+2]);
    }
    if (x < 0)
    {
        x = Math.abs(x);
        for (var i=0; i < vertices.length; i+=3)
        {
            vertices[i  ] += x;
        }
    }
    if (y < 0)
    {
        y = Math.abs(y);
        for (var i=0; i < vertices.length; i+=3)
        {
            vertices[i+1] += y;
        }
    }
    if (z < 0)
    {
        z = Math.abs(z);
        for (var i=0; i < vertices.length; i+=3)
        {
            vertices[i+2] += z;
        }
    }
    
    var stl = "";
    stl += "solid " + name + "\r\n";
    for (var v=0, n=0; v < vertices.length && n < normals.length; v+=9, n+=9) // one normal per face
    {
    stl += "   facet normal " + normals[n].toExponential() + " " + normals[n+1].toExponential() + " " + normals[n+2].toExponential() + "\r\n";
    stl += "      outer loop\r\n";
    stl += "         vertex " + vertices[v  ].toExponential() + " " + vertices[v+1].toExponential() + " " + vertices[v+2].toExponential() + "\r\n";
    stl += "         vertex " + vertices[v+3].toExponential() + " " + vertices[v+4].toExponential() + " " + vertices[v+5].toExponential() + "\r\n";
    stl += "         vertex " + vertices[v+6].toExponential() + " " + vertices[v+7].toExponential() + " " + vertices[v+8].toExponential() + "\r\n";
    stl += "      endloop\r\n";
    stl += "   end facet\r\n";    
    }
    stl += "endsolid " + name;
    
    var blob = new Blob([stl], {type: "text/plain"});
    saveAs(blob, url);
}

function ExportCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
        container.targetNode = resource;
    }
}

