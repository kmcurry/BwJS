Gear.prototype = new Model();
Gear.prototype.constructor = Gear;

function Gear()
{
    Model.call(this);
    this.className = "Gear";
    this.attrType = eAttrType.Gear;
    
    this.url.setValueDirect("objects/Gear.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(5);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0.1);
}

