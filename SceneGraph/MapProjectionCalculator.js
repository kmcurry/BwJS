/// <b>Approximate</b> radius of Earth at the equator (in Km).
/// For a more precise value, use either the Ellipsoid corresponding to a
/// particular datum or calculate the radius for a given latitude using
/// Synder's Formula
/// @see
var EARTH_RADIUS_KM_EQ = 6378;

/// <b>Approximate</b> radius of Earth at the poles (in Km).
var EARTH_RADIUS_KM_P = 6377;

/// Maximum width of a UTM zone (taken to be at equator)
var UTM_ZONE_WIDTH_KM = 667.956; 

// EqualArc projection - Metric
var EQ_ARC_WIDTH_KM       = 40075.16;	// Earth circumference at Equator
var EQ_ARC_HEIGHT_KM      = 40008.0;    // Earth circumference from pole to pole
var EQ_ARC_ONE_DEG_LAT_KM = EQ_ARC_HEIGHT_KM / 360;
var EQ_ARC_ONE_DEG_LON_KM = EQ_ARC_WIDTH_KM / 360;

// EqualArc projection - English
var EQ_ARC_WIDTH_MI       = 24902.0;
var EQ_ARC_HEIGHT_MI      = 24900.0;
var EQ_ARC_ONE_DEG_LAT_MI = EQ_ARC_HEIGHT_MI / 360;
var EQ_ARC_ONE_DEG_LON_MI = EQ_ARC_WIDTH_MI / 360;

MapProjectionCalculator.prototype = new Evaluator();
MapProjectionCalculator.prototype.constructor = MapProjectionCalculator;

function MapProjectionCalculator()
{
    Evaluator.call(this);
    this.className = "MapProjectionCalculator";
    this.attrType = eAttrType.MapProjectionCalculator;

    this.unitsMultiplier = 1;
    this.positionCalculators = [];
    this.geoPositionCalculators = [];
    
    this.mapProjection = new StringAttr("equalArc");
    this.elevationModel = new StringAttr();
    this.center2D = new Vector2DAttr(0, 0);
    this.units = new StringAttr("kilometers");
    this.geoPosition = new Vector3DAttr(0, 0, 0);
    this.pointWorld = new Vector3DAttr();
    this.resultPosition = new Vector3DAttr();
    this.resultGeoPosition = new Vector3DAttr();

    this.units.addModifiedCB(MapProjectionCalculator_UnitsModifiedCB, this);
    this.pointWorld.addModifiedCB(MapProjectionCalculator_PointWorldModifiedCB, this);
    
    this.registerAttribute(this.mapProjection, "mapProjection");
    this.registerAttribute(this.elevationModel, "elevationModel");
    this.registerAttribute(this.center2D, "center2d");
    this.registerAttribute(this.units, "units");
    this.registerAttribute(this.geoPosition, "geoPosition");
    this.registerAttribute(this.geoPosition, "position"); // backward-compatibility
    this.registerAttribute(this.pointWorld, "pointWorld");
    this.registerAttribute(this.resultPosition, "resultPosition");
    this.registerAttribute(this.resultGeoPosition, "resultGeoPosition");
    this.registerAttribute(this.resultGeoPosition, "resultGeoLocation"); // backward-compatibility

    this.positionCalculators["equalArc"] = ComputeEqualArc3DPosition;
    this.geoPositionCalculators["equalArc"] = ComputeEqualArcGeoPosition;

    this.units.setValueDirect("meters"); // invoke modified cb
}

MapProjectionCalculator.prototype.evaluate = function()
{
    var geoPosition = this.geoPosition.getValueDirect();

    var resultPosition = this.computePosition(geoPosition.x, geoPosition.y, geoPosition.z);
    this.resultPosition.setValueDirect(resultPosition.x, resultPosition.y, resultPosition.z);

    var resultGeoPosition = this.computeGeoPosition(resultPosition.x, resultPosition.y, resultPosition.z);
    this.resultGeoPosition.setValueDirect(resultGeoPosition.x, resultGeoPosition.y, resultGeoPosition.z);
}

MapProjectionCalculator.prototype.computePosition = function(lon, alt, lat)
{
    var position = undefined;
    
    var mapProjection = this.mapProjection.getValueDirect().join("");
    var computeFunc = this.positionCalculators[mapProjection];
    if (computeFunc)
    {
        var center2D = this.center2D.getValueDirect();
        position = computeFunc(lon, alt, lat, center2D.x, center2D.y, this.unitsMultiplier);
    }

    return position;
}

MapProjectionCalculator.prototype.computeGeoPosition = function(x, y, z)
{
    var geoPosition = undefined;

    var mapProjection = this.mapProjection.getValueDirect().join("");
    var computeFunc = this.geoPositionCalculators[mapProjection];
    if (computeFunc)
    {
        var center2D = this.center2D.getValueDirect();
        geoPosition = computeFunc(x, y, z, center2D.x, center2D.y, this.unitsMultiplier);
    }

    return geoPosition;
}

function MapProjectionCalculator_UnitsModifiedCB(attribute, container)
{
    switch (attribute.getValueDirect().join(""))
    {
        case "kilometers":
            {
                container.unitsMultiplier = 1;
            }
            break;

        case "meters":
            {
                container.unitsMultiplier = 1000;
            }
            break;
    }
}

function MapProjectionCalculator_PointWorldModifiedCB(attribute, container)
{
    // TODO
}

function ComputeEqualArc3DPosition(lon, alt, lat, centerLon, centerLat, units)
{
    if (lat > 90  || lat < -90 ||
		lon > 180 || lon < -180)
	{
		return undefined;
	}
	
	var x = (lon - centerLon) * EQ_ARC_ONE_DEG_LON_KM * units;
	var y = alt;
	var z = (lat - centerLat) * EQ_ARC_ONE_DEG_LAT_KM * units;

	return { x: x, y: y, z: z }
}

function ComputeEqualArcGeoPosition(x, y, z, centerLon, centerLat, units)
{
	var lon = (x / units / EQ_ARC_ONE_DEG_LON_KM) + centerLon;
	var alt = y;
	var lat = (z / units / EQ_ARC_ONE_DEG_LAT_KM) + centerLat;   
    
    return { lon: lon, alt: alt, lat: lat }
}