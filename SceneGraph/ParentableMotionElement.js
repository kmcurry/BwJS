ParentableMotionElement.prototype = new RenderableElement();
ParentableMotionElement.prototype.constructor = ParentableMotionElement;

function ParentableMotionElement()
{
    RenderableElement.call(this);
    this.className = "ParentableMotionElement";
    this.attrType = eAttrType.ParentableMotionElement;

    this.translationMatrix = new Matrix4x4();           // matrix representing this element's position translation
    this.rotationMatrix = new Matrix4x4();              // matrix representing this element's rotation
    this.scaleMatrix = new Matrix4x4();                 // matrix representing this element's scale transformation
    this.pivotMatrix = new Matrix4x4();                 // matrix representing this element's pivot translation
    this.sectorTranslationMatrix = new Matrix4x4();	// matrix representing this element's sector position translation
    this.stackMatrix = new Matrix4x4();                 // current matrix from the scene graph matrix stack (GcTransform nodes)
    this.transformSimple = new Matrix4x4();             // after Update(), contains this element's transformations (translation/
    							// rotation/scale/pivot)
    this.transformCompound = new Matrix4x4();           // after Update(), contains this element's transformations combined with 
    							// parent's transformations (if any)
    this.sectorTransformSimple = new Matrix4x4();	// after Update(), contains this element's transformations (translation/
    							// rotation/scale/pivot) for the current sector
    this.sectorTransformCompound = new Matrix4x4();     // after Update(), contains this element's transformations combined with 
    							// parent's transformations (if any) for the current sector                                        
    this.updatePosition = false;
    this.updateRotation = false;
    this.updateQuaternion = false;
    this.updateScale = false;
    this.updatePivot = false;
    this.updateSectorPosition = false;
    this.updateInheritance = false;
    this.inheritsPosition = true;
    this.inheritsRotation = true;
    this.inheritsScale = true;
    this.inheritsPivot = true;
    this.nonZeroVelocity = false;
    this.motionParent = null;
    this.motionChildren = [];

    this.position = new Vector3DAttr(0, 0, 0);
    this.rotation = new Vector3DAttr(0, 0, 0);
    this.quaternion = new QuaternionAttr(1, 0, 0, 0);
    this.scale = new Vector3DAttr(1, 1, 1);
    this.pivot = new Vector3DAttr(0, 0, 0);
    this.center = new Vector3DAttr(0, 0, 0);
    this.worldCenter = new Vector3DAttr(0, 0, 0);
    this.worldPosition = new Vector3DAttr(0, 0, 0);
    this.worldRotation = new Vector3DAttr(0, 0, 0);
    this.worldScale = new Vector3DAttr(1, 1, 1);
    this.screenPosition = new Vector3DAttr(0, 0, 0);
    this.sectorOrigin = new Vector3DAttr(0, 0, 0);
    this.sectorPosition = new Vector3DAttr(0, 0, 0);
    this.sectorWorldCenter = new Vector3DAttr(0, 0, 0);
    this.sectorWorldPosition = new Vector3DAttr(0, 0, 0);
    this.panVelocity = new Vector3DAttr(0, 0, 0);          // linear velocity along direction vectors in world-units/second
    this.linearVelocity = new Vector3DAttr(0, 0, 0);       // linear velocity in world-units/second
    this.linearVelocity_affectPosition_Y = new BooleanAttr(true);
    this.angularVelocity = new Vector3DAttr(0, 0, 0);      // angular velocity in degrees/second
    this.scalarVelocity = new Vector3DAttr(0, 0, 0);       // scalar velocity in world-units/second
    this.worldTransform = new Matrix4x4Attr(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);
    this.sectorWorldTransform = new Matrix4x4Attr(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);
    this.parent = new StringAttr("");
    this.inheritPosition_X = new BooleanAttr(true);
    this.inheritPosition_Y = new BooleanAttr(true);
    this.inheritPosition_Z = new BooleanAttr(true);
    this.inheritRotation_X = new BooleanAttr(true);
    this.inheritRotation_Y = new BooleanAttr(true);
    this.inheritRotation_Z = new BooleanAttr(true);
    this.inheritScale_X = new BooleanAttr(true);
    this.inheritScale_Y = new BooleanAttr(true);
    this.inheritScale_Z = new BooleanAttr(true);
    this.inheritPivot_X = new BooleanAttr(true);
    this.inheritPivot_Y = new BooleanAttr(true);
    this.inheritPivot_Z = new BooleanAttr(true);
    this.transformModified = new PulseAttr();               // pulsed when transform has been modified

    this.position.addModifiedCB(ParentableMotionElement_PositionModifiedCB, this);
    this.rotation.addModifiedCB(ParentableMotionElement_RotationModifiedCB, this);
    this.quaternion.addModifiedCB(ParentableMotionElement_QuaternionModifiedCB, this);
    this.scale.addModifiedCB(ParentableMotionElement_ScaleModifiedCB, this);
    this.pivot.addModifiedCB(ParentableMotionElement_PivotModifiedCB, this);
    this.sectorOrigin.addModifiedCB(ParentableMotionElement_SectorOriginModifiedCB, this);
    this.sectorPosition.addModifiedCB(ParentableMotionElement_SectorPositionModifiedCB, this);
    this.parent.addModifiedCB(ParentableMotionElement_ParentModifiedCB, this);
    this.inheritPosition_X.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritPosition_Y.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritPosition_Z.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritRotation_X.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritRotation_Y.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritRotation_Z.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritScale_X.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritScale_Y.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritScale_Z.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritPivot_X.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritPivot_Y.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.inheritPivot_Z.addModifiedCB(ParentableMotionElement_InheritanceModifiedCB, this);
    this.panVelocity.addModifiedCB(ParentableMotionElement_VelocityModifiedCB, this);
    this.linearVelocity.addModifiedCB(ParentableMotionElement_VelocityModifiedCB, this);
    this.angularVelocity.addModifiedCB(ParentableMotionElement_VelocityModifiedCB, this);
    this.scalarVelocity.addModifiedCB(ParentableMotionElement_VelocityModifiedCB, this);

    this.registerAttribute(this.position, "position");
    this.registerAttribute(this.rotation, "rotation");
    this.registerAttribute(this.quaternion, "quaternion");
    this.registerAttribute(this.scale, "scale");
    this.registerAttribute(this.pivot, "pivot");
    this.registerAttribute(this.center, "center");
    this.registerAttribute(this.worldCenter, "worldCenter");
    this.registerAttribute(this.worldPosition, "worldPosition");
    this.registerAttribute(this.worldRotation, "worldRotation");
    this.registerAttribute(this.worldScale, "worldScale");
    this.registerAttribute(this.screenPosition, "screenPosition");
    this.registerAttribute(this.sectorOrigin, "sectorOrigin");
    this.registerAttribute(this.sectorPosition, "sectorPosition");
    this.registerAttribute(this.sectorWorldCenter, "sectorWorldCenter");
    this.registerAttribute(this.sectorWorldPosition, "sectorWorldPosition");
    this.registerAttribute(this.worldTransform, "worldTransform");
    this.registerAttribute(this.sectorWorldTransform, "sectorWorldTransform");
    this.registerAttribute(this.panVelocity, "panVelocity");
    this.registerAttribute(this.linearVelocity, "linearVelocity");
    this.registerAttribute(this.linearVelocity_affectPosition_Y, "linearVelocity_affectPosition_Y");
    this.registerAttribute(this.angularVelocity, "angularVelocity");
    this.registerAttribute(this.scalarVelocity, "scalarVelocity");
    this.registerAttribute(this.parent, "parent");
    this.registerAttribute(this.inheritPosition_X, "inheritPosition_X");
    this.registerAttribute(this.inheritPosition_Y, "inheritPosition_Y");
    this.registerAttribute(this.inheritPosition_Z, "inheritPosition_Z");
    this.registerAttribute(this.inheritRotation_X, "inheritRotation_X");
    this.registerAttribute(this.inheritRotation_Y, "inheritRotation_Y");
    this.registerAttribute(this.inheritRotation_Z, "inheritRotation_Z");
    this.registerAttribute(this.inheritScale_X, "inheritScale_X");
    this.registerAttribute(this.inheritScale_Y, "inheritScale_Y");
    this.registerAttribute(this.inheritScale_Z, "inheritScale_Z");
    this.registerAttribute(this.inheritPivot_X, "inheritPivot_X");
    this.registerAttribute(this.inheritPivot_X, "inheritPivot_Y");
    this.registerAttribute(this.inheritPivot_X, "inheritPivot_Z");
    this.registerAttribute(this.transformModified, "transformModified");
}

ParentableMotionElement.prototype.getTransform = function()
{
    var matrix = new Matrix4x4();
    matrix.loadMatrix(this.transformCompound);
    return matrix;
}

ParentableMotionElement.prototype.getSectorTransform = function()
{
    var matrix = new Matrix4x4();
    matrix.loadMatrix(this.sectorTransformCompound);
    return matrix;
}

ParentableMotionElement.prototype.update = function(params, visitChildren)
{
    // update this element's position/rotation as affected by velocity
    if (this.nonZeroVelocity)
    {
        this.updateVelocityMotion(params.timeIncrement);
    }

    if (this.updateInheritance)
    {
        this.updateInheritance = false;

        this.inheritsPosition = this.inheritPosition_X.getValueDirect() &&
                this.inheritPosition_Y.getValueDirect() &&
                this.inheritPosition_Z.getValueDirect();

        this.inheritsRotation = this.inheritRotation_X.getValueDirect() &&
                this.inheritRotation_Y.getValueDirect() &&
                this.inheritRotation_Z.getValueDirect();

        this.inheritsScale = this.inheritScale_X.getValueDirect() &&
                this.inheritScale_Y.getValueDirect() &&
                this.inheritScale_Z.getValueDirect();

        this.inheritsPivot = this.inheritPivot_X.getValueDirect() &&
                this.inheritPivot_Y.getValueDirect() &&
                this.inheritPivot_Z.getValueDirect();
    }

    // update this element's transformations (translation/rotation/scale/pivot)
    this.updateSimpleTransform();
    if (this.motionParent)
    {
        this.motionParent.update(params, false);
    }
    this.updateCompoundTransform();
    this.updateWorldMotionInfo();

    // call base-class implementation
    RenderableElement.prototype.update.call(this, params, visitChildren);
}

ParentableMotionElement.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        RenderableElement.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
        case "render":
            {
                var screen = toScreenSpace(this.sectorWorldPosition.getValueDirect(),
                        params.viewMatrix, params.projMatrix, params.viewport);
                this.screenPosition.setValueDirect(screen.x, screen.y, screen.z);
            }
            break;
    }

    // call base-class implementation
    RenderableElement.prototype.apply.call(this, directive, params, visitChildren);
}

ParentableMotionElement.prototype.updateChildDisplayLists = function()
{
    /*for (var i=0; i < this.motionChildren.length; i++)
     {
     this.motionChildren[i].updateDisplayList.pulse();
     }*/
}

ParentableMotionElement.prototype.applyTransform = function()
{
    // TODO: if scaling factors are not 1, apply inverse scale before this transformation is
    // applied to avoid translation caused by scaling  

    // set transformation matrix
    this.graphMgr.renderContext.setMatrixMode(RC_WORLD);
    this.graphMgr.renderContext.leftMultMatrix(this.sectorTransformCompound);
    this.graphMgr.renderContext.applyWorldTransform();

    // TODO: if invsere scale was applied, re-apply scale
}

ParentableMotionElement.prototype.updateVelocityMotion = function(timeIncrement)
{
    // pan, linear velocity
    var panVelocity = this.panVelocity.getValueDirect();
    var linearVelocity = this.linearVelocity.getValueDirect();
    if (panVelocity.x != 0 || panVelocity.y != 0 || panVelocity.z != 0 ||
            linearVelocity.x != 0 || linearVelocity.y != 0 || linearVelocity.z != 0)
    {
        // position
        var position = this.position.getValueDirect();

        // get direction vectors for pan
        var directionVectors = this.getDirectionVectors();

        // get affect position flags
        var linearVelocity_affectPosition_Y = this.linearVelocity_affectPosition_Y.getValueDirect();

        // update position
        position.x = position.x + (directionVectors.right.x * panVelocity.x * timeIncrement) +
                (directionVectors.up.x * panVelocity.y * timeIncrement) +
                (directionVectors.forward.x * panVelocity.z * timeIncrement) +
                (linearVelocity.x * timeIncrement);
        if (linearVelocity_affectPosition_Y)
        {
            position.y = position.y + (directionVectors.right.y * panVelocity.x * timeIncrement) +
                    (directionVectors.up.y * panVelocity.y * timeIncrement) +
                    (directionVectors.forward.y * panVelocity.z * timeIncrement) +
                    (linearVelocity.y * timeIncrement);
        }
        position.z = position.z + (directionVectors.right.z * panVelocity.x * timeIncrement) +
                (directionVectors.up.z * panVelocity.y * timeIncrement) +
                (directionVectors.forward.z * panVelocity.z * timeIncrement) +
                (linearVelocity.z * timeIncrement);

        this.position.setValueDirect(position.x, position.y, position.z);
    }

    // angular velocity
    var angularVelocity = this.angularVelocity.getValueDirect();
    if (angularVelocity.x != 0 || angularVelocity.y != 0 || angularVelocity.z != 0)
    {
        // rotation
        var rotation = this.rotation.getValueDirect();

        // update rotation
        rotation.x = rotation.x + (angularVelocity.x * timeIncrement);
        rotation.y = rotation.y + (angularVelocity.y * timeIncrement);
        rotation.z = rotation.z + (angularVelocity.z * timeIncrement);

        this.rotation.setValueDirect(rotation.x, rotation.y, rotation.z);
    }

    // scalar velocity
    var scalarVelocity = this.scalarVelocity.getValueDirect();
    if (scalarVelocity.x != 0 || scalarVelocity.y != 0 || scalarVelocity.z != 0)
    {
        // rotation
        var scale = this.scale.getValueDirect();

        // update rotation
        scale.x = scale.x + (scalarVelocity.x * timeIncrement);
        scale.y = scale.y + (scalarVelocity.y * timeIncrement);
        scale.z = scale.z + (scalarVelocity.z * timeIncrement);

        this.scale.setValueDirect(scale.x, scale.y, scale.z);
    }
}

ParentableMotionElement.prototype.updateSimpleTransform = function()
{
    var modified = false;

    if (this.updatePosition || this.updateRotation || this.updateQuaternion || this.updateScale || this.updatePivot)
    {
        var values;

        if (this.updatePosition)
        {
            this.updatePosition = false;

            values = this.position.getValueDirect();
            this.translationMatrix.loadTranslation(values.x, values.y, values.z);

            modified = true;
        }

        if (this.updateRotation)
        {
            this.updateRotation = false;

            values = this.rotation.getValueDirect();
            var quat = new Quaternion();
            quat.loadXYZAxisRotation(values.x, values.y, values.z);
            this.quaternion.setValueDirect(quat);

            modified = true;
        }

        if (this.updateQuaternion)
        {
            this.updateQuaternion = false;
            
            var quat = this.quaternion.getValueDirect();
            this.rotationMatrix = quat.getMatrix();     

            modified = true;
        }
        
        if (this.updateScale)
        {
            this.updateScale = false;

            values = this.scale.getValueDirect();
            this.scaleMatrix.loadScale(values.x, values.y, values.z);

            modified = true;
        }

        if (this.updatePivot)
        {
            this.updatePivot = false;

            values = this.pivot.getValueDirect();
            this.pivotMatrix.loadTranslation(-values.x, -values.y, -values.z);

            modified = true;
        }

        if (this.updateSectorPosition)
        {
            this.updateSectorPosition = false;

            values = this.sectorPosition.getValueDirect();
            this.sectorTranslationMatrix.loadTranslation(values.x, values.y, values.z);

            modified = true;
        }

        if (modified)
        {
            this.transformModified.pulse();

            // pre-multiply pivot/scale/rotation since this is applied to both regular and sector transforms
            var psr = new Matrix4x4();
            psr.loadMatrix(this.pivotMatrix.multiply(this.scaleMatrix.multiply(this.rotationMatrix)));

            this.transformSimple.loadMatrix(psr.multiply(this.translationMatrix));
            this.sectorTransformSimple.loadMatrix(psr.multiply(this.sectorTranslationMatrix));

            // force any motion children to update their display lists
            this.updateChildDisplayLists();
        }
    }

    return modified;
}

ParentableMotionElement.prototype.updateCompoundTransform = function()
{
    this.transformCompound.loadMatrix(this.transformSimple);
    this.sectorTransformCompound.loadMatrix(this.sectorTransformSimple);

    if (this.motionParent)
    {
        // account for parent's object-inspected rotation
        var inspectionRotationMatrix = new Matrix4x4();
        var inspectionGroup = getInspectionGroup(this.motionParent);
        if (inspectionGroup)
        {
            var translate = inspectionGroup.getChild(0);
            var translationMatrix = translate.getAttribute("matrix").getValueDirect();
            
            var scaleInverse = inspectionGroup.getChild(1);
            var scaleInverseMatrix = scaleInverse.getAttribute("matrix").getValueDirect();
            
            var quaternionRotate = inspectionGroup.getChild(2);
            var rotationMatrix = quaternionRotate.getAttribute("matrix").getValueDirect();
            
            var scale = inspectionGroup.getChild(3);
            var scaleMatrix = scale.getAttribute("matrix").getValueDirect();
            
            var translateBack = inspectionGroup.getChild(4);
            var translationBackMatrix = translateBack.getAttribute("matrix").getValueDirect();
            
            inspectionRotationMatrix = translationBackMatrix.multiply(scaleMatrix.multiply(
                    rotationMatrix.multiply(scaleInverseMatrix.multiply(translationMatrix))));
        }
        
        if (this.inheritsPosition && this.inheritsRotation && this.inheritsScale && this.inheritsPivot)
        {
            this.transformCompound.loadMatrix(this.transformCompound.multiply(inspectionRotationMatrix.multiply(this.motionParent.transformCompound)));
            this.sectorTransformCompound.loadMatrix(this.sectorTransformCompound.multiply(inspectionRotationMatrix.multiply(this.motionParent.sectorTransformCompound)));
        }
        else // !m_inheritsPosition || !m_inheritsRotation || !m_inheritsScale || !m_inheritsPivot
        {
            // TODO
        }
    }
}

ParentableMotionElement.prototype.updateWorldMotionInfo = function()
{
    this.worldTransform.setValueDirect(this.transformCompound);
    this.sectorWorldTransform.setValueDirect(this.sectorTransformCompound);

    this.updateWorldCenter();
    this.updateWorldPosition();
    this.updateWorldRotation();
    this.updateWorldScale();
}

ParentableMotionElement.prototype.updateWorldCenter = function()
{
    var center = this.center.getValueDirect();
    center = this.transformCompound.transform(center.x, center.y, center.z, 1);
    this.worldCenter.setValueDirect(center.x, center.y, center.z);

    center = this.center.getValueDirect();
    center = this.sectorTransformCompound.transform(center.x, center.y, center.z, 1);
    this.sectorWorldCenter.setValueDirect(center.x, center.y, center.z);
}

ParentableMotionElement.prototype.updateWorldPosition = function()
{
    var position = this.transformCompound.transform(0, 0, 0, 1);
    this.worldPosition.setValueDirect(position.x, position.y, position.z);

    position = this.sectorTransformCompound.transform(0, 0, 0, 1);
    this.sectorWorldPosition.setValueDirect(position.x, position.y, position.z);
}

ParentableMotionElement.prototype.updateWorldRotation = function()
{
    var rotation = this.transformCompound.getRotationAngles();
    this.worldRotation.setValueDirect(rotation.x, rotation.y, rotation.z);
}

ParentableMotionElement.prototype.updateWorldScale = function()
{
    var scale = this.transformCompound.getScalingFactors();
    this.worldScale.setValueDirect(scale.x, scale.y, scale.z);
}

ParentableMotionElement.prototype.synchronizePosition = function()
{
    // synchronize position with sector position if necessary (don't sync if not necessary to avoid 
    // the circular dependency between position & sector position

    // get sector origin (use [0, 0, 0] for parented objects)
    var sectorOrigin = new Vector3D();
    if (this.motionParent)
    {
        sectorOrigin.x = 0;
        sectorOrigin.y = 0;
        sectorOrigin.z = 0;
    }
    else // !motionParent
    {
        sectorOrigin = this.sectorOrigin.getValueDirect();
    }

    // get sector position
    var sectorPosition = this.sectorPosition.getValueDirect();

    // get world position
    var position = new Vector3D();
    position.x = sectorOrigin.x + sectorPosition.x;
    position.y = sectorOrigin.y + sectorPosition.y;
    position.z = sectorOrigin.z + sectorPosition.z;

    // update position
    this.position.removeModifiedCB(ParentableMotionElement_PositionModifiedCB, this);
    this.position.setValueDirect(position.x, position.y, position.z);
    this.position.addModifiedCB(ParentableMotionElement_PositionModifiedCB, this);

    // flag a position update
    this.updatePosition = true;
}

ParentableMotionElement.prototype.synchronizeSectorPosition = function()
{
    // synchronize sector position with position if necessary (don't sync if not necessary to avoid 
    // the circular dependency between position & sector position

    // get sector origin (use [0, 0, 0] for parented objects)
    var sectorOrigin = new Vector3D;
    if (this.motionParent)
    {
        sectorOrigin.x = 0;
        sectorOrigin.y = 0;
        sectorOrigin.z = 0;
    }
    else // !motionParent
    {
        sectorOrigin = this.sectorOrigin.getValueDirect();
    }

    // get world position
    var position = this.position.getValueDirect();

    // get sector position
    var sectorPosition = new Vector3D;
    sectorPosition.x = position.x - sectorOrigin.x;
    sectorPosition.y = position.y - sectorOrigin.y;
    sectorPosition.z = position.z - sectorOrigin.z;

    // update sector position
    this.sectorPosition.removeModifiedCB(ParentableMotionElement_SectorPositionModifiedCB, this);
    this.sectorPosition.setValueDirect(sectorPosition.x, sectorPosition.y, sectorPosition.z);
    this.sectorPosition.addModifiedCB(ParentableMotionElement_SectorPositionModifiedCB, this);

    // flag a sector position update
    this.updateSectorPosition = true;
}

ParentableMotionElement.prototype.getDirectionVectors = function()
{
    var up = this.sectorTransformCompound.transform(0, 1, 0, 0);
    var right = this.sectorTransformCompound.transform(1, 0, 0, 0);
    var forward = this.sectorTransformCompound.transform(0, 0, 1, 0);

    return {
        up: up,
        right: right,
        forward: forward
    };
}

ParentableMotionElement.prototype.setMotionParent = function(parent)
{
    if (parent == this)
        return;

    if (this.motionParent)
    {
        for (var i = 0; i < this.motionParent.motionChildren.length; i++)
        {
            if (this.motionParent.motionChildren[i] == this)
            {
                
                this.motionParent.motionChildren.splice(i, 1);
                break;
            }
        }
    }
    
    this.motionParent = parent;
    
    if (parent)
    {
        parent.motionChildren.push(this);
        // make sure this' parent attribute is updated (would not be if this method is called directly); don't invoke modified CB
        this.parent.removeModifiedCB(ParentableMotionElement_ParentModifiedCB, this);
        this.parent.copyValue(parent.name);
        this.parent.addModifiedCB(ParentableMotionElement_ParentModifiedCB, this);
    }

    // set sector position to account for parenting
    this.synchronizeSectorPosition();
    
    this.setModified();
}

ParentableMotionElement.prototype.isMotionAncestor = function(pme)
{
    if (!pme || !this.motionParent) 
        return false;
    
    if (this.motionParent == pme)
        return true;
    
    return this.motionParent.isMotionAncestor(pme);
}
    
ParentableMotionElement.prototype.velocityModified = function()
{
    if (this.panVelocity.isZero() &&
            this.linearVelocity.isZero() &&
            this.angularVelocity.isZero() &&
            this.scalarVelocity.isZero())
    {
        this.nonZeroVelocity = false;
    }
    else
    {
        this.nonZeroVelocity = true;
    }
}

ParentableMotionElement.prototype.setModified = function()
{
    // call base-class implementation
    RenderableElement.prototype.setModified.call(this);
    
    // call for motion children
    for (var i = 0; i < this.motionChildren.length; i++)
    {
        this.motionChildren[i].setModified();
    }
}

function ParentableMotionElement_PositionModifiedCB(attribute, container)
{
    container.updatePosition = true;
    container.synchronizeSectorPosition();
    container.setModified();
}

function ParentableMotionElement_RotationModifiedCB(attribute, container)
{
    container.updateRotation = true;
    container.setModified();
}

function ParentableMotionElement_QuaternionModifiedCB(attribute, container)
{
    container.updateQuaternion = true;
    container.setModified();
}

function ParentableMotionElement_ScaleModifiedCB(attribute, container)
{
    container.updateScale = true;
    container.setModified();
}

function ParentableMotionElement_PivotModifiedCB(attribute, container)
{
    container.updatePivot = true;
    container.setModified();
}

function ParentableMotionElement_SectorOriginModifiedCB(attribute, container)
{
    container.synchronizeSectorPosition();
    container.setModified();
}

function ParentableMotionElement_SectorPositionModifiedCB(attribute, container)
{
    container.updateSectorPosition = true;
    container.synchronizePosition();
    container.setModified();
}

function ParentableMotionElement_ParentModifiedCB(attribute, container)
{
    container.setMotionParent(container.registry.find(attribute.getValueDirect().join("")));
}

function ParentableMotionElement_VelocityModifiedCB(attribute, container)
{
    container.velocityModified();
    container.setModified();
}

function ParentableMotionElement_InheritanceModifiedCB(attribute, container)
{
    container.updateInheritance = true;
    container.setModified();
}