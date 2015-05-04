Plank.prototype = new Model();
Plank.prototype.constructor = Plank;

function Plank()
{
    Model.call(this);
    this.className = "Plank";
    this.attrType = eAttrType.Plank;
    
    this.url.setValueDirect("objects/Plank.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(3);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0.1);
}

