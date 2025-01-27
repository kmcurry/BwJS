JSM.SoftwareViewer = function ()
{
	this.canvas = null;
	this.camera = null;
	this.bodies = null;
	this.drawer = null;
	this.drawMode = null;
	this.navigation = null;
};

JSM.SoftwareViewer.prototype.Start = function (canvasName, camera)
{
	if (!this.InitCanvas (canvasName)) {
		return false;
	}

	if (!this.InitCamera (camera)) {
		return false;
	}

	return true;
};

JSM.SoftwareViewer.prototype.InitCanvas = function (canvasName)
{
	this.bodies = [];
	this.canvas = document.getElementById (canvasName);
	if (!this.canvas) {
		return false;
	}
	
	if (this.canvas instanceof (HTMLCanvasElement)) {
		this.drawer = new JSM.CanvasDrawer (this.canvas);
	} else if (this.canvas instanceof (SVGSVGElement)) {
		this.drawer = new JSM.SVGDrawer (this.canvas);
	}
	
	if (!this.drawer) {
		return false;
	}
	
	this.drawMode = 'Wireframe';
	return true;
};

JSM.SoftwareViewer.prototype.InitCamera = function (camera)
{
	this.camera = JSM.ValueOrDefault (camera, new JSM.Camera ());
	if (!this.camera) {
		return false;
	}

	this.navigation = new JSM.Navigation ();
	if (!this.navigation.Init (this.canvas, this.camera, this.Draw.bind (this), this.Resize.bind (this))) {
		return false;
	}

	return true;
};

JSM.SoftwareViewer.prototype.AddBody = function (body, materials)
{
	this.bodies.push ([body, materials]);
};

JSM.SoftwareViewer.prototype.RemoveBodies = function ()
{
	this.bodies = [];
};

JSM.SoftwareViewer.prototype.FitInWindow = function ()
{
	var center = this.GetCenter ();
	var radius = this.GetBoundingSphereRadius (center);
	this.navigation.FitInWindow (center, radius);
	this.Draw ();
};

JSM.SoftwareViewer.prototype.GetCenter = function ()
{
	var boundingBox = this.GetBoundingBox ();
	var center = JSM.MidCoord (boundingBox[0], boundingBox[1]);
	return center;
};

JSM.SoftwareViewer.prototype.GetBoundingBox = function ()
{
	var min = new JSM.Coord (JSM.Inf, JSM.Inf, JSM.Inf);
	var max = new JSM.Coord (-JSM.Inf, -JSM.Inf, -JSM.Inf);
	
	var i, j, body, vertex;
	for (i = 0; i < this.bodies.length; i++) {
		body = this.bodies[i][0];
		for (j = 0; j < body.VertexCount (); j++) {
			vertex = body.GetVertex (j);
			min.x = JSM.Minimum (min.x, vertex.position.x);
			min.y = JSM.Minimum (min.y, vertex.position.y);
			min.z = JSM.Minimum (min.z, vertex.position.z);
			max.x = JSM.Maximum (max.x, vertex.position.x);
			max.y = JSM.Maximum (max.y, vertex.position.y);
			max.z = JSM.Maximum (max.z, vertex.position.z);
		}
	}

	return [min, max];
};

JSM.SoftwareViewer.prototype.GetBoundingSphereRadius = function (center)
{
	if (center === undefined || center === null) {
		center = this.GetCenter ();
	}
	var radius = 0.0;

	var i, j, body, vertex, distance;
	for (i = 0; i < this.bodies.length; i++) {
		body = this.bodies[i][0];
		for (j = 0; j < body.VertexCount (); j++) {
			vertex = body.GetVertex (j);
			distance = JSM.CoordDistance (center, vertex.position);
			if (JSM.IsGreater (distance, radius)) {
				radius = distance;
			}
		}
	}

	return radius;
};

JSM.SoftwareViewer.prototype.Resize = function ()
{
	this.Draw ();
};

JSM.SoftwareViewer.prototype.Draw = function ()
{
	var i, bodyAndMaterials;
	this.drawer.Clear ();
	
	for (i = 0; i < this.bodies.length; i++) {
		bodyAndMaterials = this.bodies[i];
		JSM.DrawProjectedBody (bodyAndMaterials[0], bodyAndMaterials[1], this.camera, this.drawMode, false, this.drawer);
	}

	return true;
};
