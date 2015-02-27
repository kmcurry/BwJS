Cube.prototype = new TriList();
Cube.prototype.constructor = Cube;

function Cube()
{
    TriList.call(this);
    this.className = "Cube";
    this.attrType = eAttrType.Cube;
    
    this.updateTriList = true; // update once
    
    this.transform = new Matrix4x4();
    this.updateTransform = false;
    
    this.materialNode = new Material();
    this.updateMaterial = false;
    
    this.color = new ColorAttr(1, 1, 1, 1);
    this.opacity = new NumberAttr(1);
    this.position = new Vector3DAttr(0, 0, 0);
    this.rotation = new Vector3DAttr(0, 0, 0);
    this.scale = new Vector3DAttr(1, 1, 1);
    
    this.color.addModifiedCB(Cube_MaterialModifiedCB, this);
    this.opacity.addModifiedCB(Cube_MaterialModifiedCB, this);
    this.position.addModifiedCB(Cube_PositionModifiedCB, this);
    this.rotation.addModifiedCB(Cube_RotationModifiedCB, this);
    this.scale.addModifiedCB(Cube_ScaleModifiedCB, this);
    
    this.registerAttribute(this.color, "color");
    this.registerAttribute(this.opacity, "opacity");
    this.registerAttribute(this.position, "position");
    this.registerAttribute(this.rotation, "rotation");
    this.registerAttribute(this.scale, "scale");
    
    var vertices = 
    [
        -0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25, 0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, 0.25, -0.25, 0.25, -0.25,
        0.25, -0.25, -0.25, 0.25, -0.25, 0.25, -0.25, -0.25, 0.25, -0.25, -0.25, -0.25, 0.25, -0.25, -0.25, -0.25, -0.25, 0.25,
        0.25, -0.25, -0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25, 0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, 0.25, -0.25,
        0.25, -0.25, 0.25, 0.25, 0.25, -0.25, 0.25, 0.25, 0.25, 0.25, -0.25, -0.25, 0.25, 0.25, -0.25, 0.25, -0.25, 0.25,
        0.25, 0.25, -0.25, -0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, -0.25, -0.25, 0.25, -0.25, -0.25, 0.25, 0.25,
        0.25, -0.25, 0.25, 0.25, 0.25, 0.25, -0.25, 0.25, 0.25, -0.25, -0.25, 0.25, 0.25, -0.25, 0.25, -0.25, 0.25, 0.25
    ];
    
    var normals =
    [
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
    ];
    
    this.vertices.setValue(vertices);
    this.normals.setValue(normals);
    
    this.color.addTarget(this.materialNode.getAttribute("color"));
    this.opacity.addTarget(this.materialNode.getAttribute("opacity"));
}

Cube.prototype.setGraphMgr = function(graphMgr)
{
    // call base-class implementation
    TriList.prototype.setGraphMgr.call(this, graphMgr);

    this.materialNode.setGraphMgr(graphMgr);
}
            
Cube.prototype.update = function(params, visitChildren)
{
    if (this.updateTransform)
    {
        this.updateTransform = false;
 
        var position = this.position.getValueDirect();
        var translationMatrix = new Matrix4x4();
        translationMatrix.loadTranslation(position.x, position.y, position.z);
        
        var rotation = this.rotation.getValueDirect();
        var rotationMatrix = new Matrix4x4();
        rotationMatrix.loadXYZAxisRotation(rotation.x, rotation.y, rotation.z);
        
        var scale = this.scale.getValueDirect();
        var scaleMatrix = new Matrix4x4();
        scaleMatrix.loadScale(scale.x, scale.y, scale.z);
        
        this.transform.loadMatrix(scaleMatrix.multiply(rotationMatrix.multiply(translationMatrix)));
    }
    
    if (this.updateMaterial)
    {
        this.updateMaterial = false;       
        this.materialNode.update(params, visitChildren);
    }

    if (this.updateTriList)
    {
        this.updateTriList = false;
        TriList.prototype.update.call(this, params, visitChildren);
    }
}

Cube.prototype.apply = function(directive, params, visitChildren)
{
    var show = this.show.getValueDirect();
    var enabled = this.enabled.getValueDirect();
    if (!show || !enabled)
    {
        return;
    }
    
    switch (directive)
    {
        case "render":
        case "shadow":
            {
                this.materialNode.apply(directive, params, visitChildren);
                this.draw(params.dissolve);
            }
            break;
    }
}

Cube.prototype.draw = function(dissolve)
{
    this.graphMgr.renderContext.setMatrixMode(RC_WORLD);
    this.graphMgr.renderContext.pushMatrix();

    this.graphMgr.renderContext.leftMultMatrix(this.transform);
    this.graphMgr.renderContext.applyWorldTransform();
    
    // draw primitives
    this.vertexBuffer.draw();
    
    this.graphMgr.renderContext.setMatrixMode(RC_WORLD);
    this.graphMgr.renderContext.popMatrix();
    this.graphMgr.renderContext.applyWorldTransform();
}

function Cube_PositionModifiedCB(attribute, container)
{
    container.updateTransform = true;
}

function Cube_RotationModifiedCB(attribute, container)
{
    container.updateTransform = true;
}

function Cube_ScaleModifiedCB(attribute, container)
{
    container.updateTransform = true;
}

function Cube_MaterialModifiedCB(attribute, container)
{
    container.updateMaterial = true;
}