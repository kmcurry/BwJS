Wedge.prototype = new Model();
Wedge.prototype.constructor = Wedge;

function Wedge()
{
    Model.call(this);
    this.className = "Wedge";
    this.attrType = eAttrType.Wedge;
    
    this.url.setValueDirect("objects/Wedge.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(25);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0.1);
}

