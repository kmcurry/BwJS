Beam.prototype = new Model();
Beam.prototype.constructor = Beam;

function Beam()
{
    Model.call(this);
    this.className = "Beam";
    this.attrType = eAttrType.Beam;
    
    this.url.setValueDirect("objects/Beam.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(35);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0.1);
}

