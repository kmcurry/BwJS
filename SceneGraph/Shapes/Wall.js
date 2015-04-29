Wall.prototype = new Model();
Wall.prototype.constructor = Wall;

function Wall()
{
    Model.call(this);
    this.className = "Wall";
    this.attrType = eAttrType.Wall;
    
    this.url.setValueDirect("objects/Wall.lwo");
    
    // Physical Properties
    this.physicalProperties.mass.setValueDirect(15);
    this.physicalProperties.friction.setValueDirect(1.2);
    this.physicalProperties.restitution.setValueDirect(0);
    
    // Snap Connectors
    
    // PositiveX
    var connector = new GenericConnector();
    connector.name.setValueDirect("PositiveX");
    connector.normal.setValueDirect(1, 0, 0);
    connector.point.center.setValueDirect(1, 0, 0);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
    // PositiveY
    connector = new GenericConnector();
    connector.name.setValueDirect("PositiveY");
    connector.normal.setValueDirect(0, 1, 0);
    connector.point.center.setValueDirect(0, 1, 0);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
    // PositiveZ
    connector = new GenericConnector();
    connector.name.setValueDirect("PositiveZ");
    connector.normal.setValueDirect(0, 0, 1);
    connector.point.center.setValueDirect(0, 0, 1);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
    // NegativeX
    connector = new GenericConnector();
    connector.name.setValueDirect("NegativeX");
    connector.normal.setValueDirect(-1, 0, 0);
    connector.point.center.setValueDirect(-1, 0, 0);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
    // NegativeY
    connector = new GenericConnector();
    connector.name.setValueDirect("NegativeY");
    connector.normal.setValueDirect(0, -1, 0);
    connector.point.center.setValueDirect(0, -1, 0);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
    // NegativeZ
    connector = new GenericConnector();
    connector.name.setValueDirect("NegativeZ");
    connector.normal.setValueDirect(0, 0, -1);
    connector.point.center.setValueDirect(0, 0, -1);
    connector.point.radius.setValueDirect(0.25);   
    this.genericConnectors.push_back(connector);
}

