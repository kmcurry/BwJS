Elbow.prototype = new Model();
Elbow.prototype.constructor = Elbow;

function Elbow()
{
    Model.call(this);
    this.className = "Elbow";
    this.attrType = eAttrType.Elbow;
    
    this.url.setValueDirect("objects/Elbow.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(5);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0);
    
    // Snap Connectors
    
    // NegativeZ
    var connector = new GenericConnector();
    connector.name.setValueDirect("NegativeZ");
    connector.normal.setValueDirect(0, 0, -1);
    connector.point.center.setValueDirect(0, 0.42, -1.3);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
    // NegativeY
    connector = new GenericConnector();
    connector.name.setValueDirect("NegativeY");
    connector.normal.setValueDirect(0, -1, 0);
    connector.point.center.setValueDirect(0, -1.42, 0.3);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
}

