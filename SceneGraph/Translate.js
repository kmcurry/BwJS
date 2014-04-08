Translate.prototype = new Transform();
Translate.prototype.constructor = Translate;

function Translate()
{
    Transform.call(this);
    this.className = "Translate";
    this.attrType = eAttrType.Translate;
    
    this.translation = new Vector3DAttr(0, 0, 0);
    this.updateTranslation = true;
    
    this.translation.addModifiedCB(Translate_TranslationModifiedCB, this);
	
    this.registerAttribute(this.translation, "translation");
}

Translate.prototype.update = function(params, visitChildren)
{
    if (this.updateTranslation)
    {
        this.updateTranslation = false;

        var t = this.translation.getValueDirect();

        var matrix = new Matrix4x4();
        matrix.loadTranslation(t.x, t.y, t.z);
        this.matrix.setValueDirect(matrix);
    }

    // call base-class implementation
    Transform.prototype.update.call(this, params, visitChildren);
}

Translate.prototype.apply = function(directive, params, visitChildren)
{
    if (!this.enabled.getValueDirect())
    {
        // call base-class implementation
        Transform.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    // call base-class implementation
    Transform.prototype.apply.call(this, directive, params, visitChildren);
}

function Translate_TranslationModifiedCB(attribute, container)
{
    container.updateTranslation = true;
    container.incrementModificationCount();
}