Transform.prototype = new SGNode();
Transform.prototype.constructor = Transform;

/**
 * Defines a generic matrix transformation.
 *
 * @see GcSGNode
 */
function Transform()
{
    SGNode.call(this);
    this.className = "Transform";
    this.attrType = eAttrType.Transform;
    
    this.matrix = new Matrix4x4Attr
       (1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
        
    this.matrixTransform = this.matrix.getValueDirect();
    this.updateMatrix = true;

    this.matrix.addModifiedCB(Transform_MatrixModifiedCB, this);

    this.registerAttribute(this.matrix, "matrix");
}

Transform.prototype.clone = function(src)
{
    this.matrix = src.matrix.clone();
    this.updateMatrix = src.updateMatrix;
}

Transform.prototype.update = function(params, visitChildren)
{
    if (this.updateMatrix)
    {
        this.updateMatrix = false;

        this.matrixTransform = this.matrix.getValueDirect();
    }
    
    // call base-class implementation
    SGNode.prototype.update.call(this, params, visitChildren);
}

Transform.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled.getValueDirect())
    {
        // call base class implementation
        SGNode.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }
    
    //params.worldMatrix = params.worldMatrix.leftMultiply(this.matrixTransform);
            
    switch (directive)
    {
        case "render":
        {
            params.worldMatrix = this.matrixTransform.multiply(params.worldMatrix);
            this.applyTransform();
        }
        break;
         
        case "rayPick":
        case "bbox":
        case "collide":
        {
            params.worldMatrix = this.matrixTransform.multiply(params.worldMatrix);
        }
        break;
        
        case "highlight":
        {
            params.worldMatrix = this.matrixTransform.multiply(params.worldMatrix);
            
            // apply to last target as well (covers object-inspection)
            if (params.targets.length > 0)
            {
                params.targets[params.targets.length-1].worldMatrix = 
                    this.matrixTransform.multiply(params.targets[params.targets.length-1].worldMatrix);
            }
        }
        break;
        
        default:
            break;
    }

    // call base class implementation
    SGNode.prototype.apply.call(this, directive, params, visitChildren);
}

Transform.prototype.applyTransform = function()
{
    // set transformation matrix
    this.graphMgr.renderContext.setMatrixMode(RC_MODELVIEW);
    this.graphMgr.renderContext.leftMultMatrix(this.matrixTransform);
    this.graphMgr.renderContext.applyModelViewTransform();
}

function Transform_MatrixModifiedCB(attribute, container)
{
    container.updateMatrix = true;
    container.incrementModificationCount();
}

