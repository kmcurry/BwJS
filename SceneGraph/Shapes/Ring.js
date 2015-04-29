Ring.prototype = new Model();
Ring.prototype.constructor = Ring;

function Ring()
{
    Model.call(this);
    this.className = "Ring";
    this.attrType = eAttrType.Ring;
    
    this.url.setValueDirect("objects/Ring.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(5);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0);
}

