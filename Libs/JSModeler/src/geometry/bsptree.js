/**
* Class: BSPNode
* Description: Node of a BSP tree.
*/
JSM.BSPNode = function ()
{
	this.polygon = null;
	this.userData = null;
	this.plane = null;
	this.parent = null;
	this.inside = null;
	this.outside = null;
};

/**
* Function: BSPNode.IsLeaf
* Description: Returns if the node is leaf.
* Returns:
*	{boolean} the result
*/
JSM.BSPNode.prototype.IsLeaf = function ()
{
	return this.inside === null && this.outside === null;
};

/**
* Class: BSPTree
* Description: Defines a BSP tree.
*/
JSM.BSPTree = function ()
{
	this.root = null;
};

/**
* Function: BSPTree.AddPolygon
* Description: Adds a polygon to the tree.
* Parameters:
*	polygon {Polygon} the polygon
*	userData {anything} user data for polygon
* Returns:
*	{boolean} success
*/
JSM.BSPTree.prototype.AddPolygon = function (polygon, userData)
{
	if (this.root === null) {
		this.root = this.GetNewNode ();
	}
	
	return this.AddPolygonToNode (this.root, polygon, userData);
};

/**
* Function: BSPTree.Traverse
* Description: Traverses the tree and calls a function on node found.
* Parameters:
*	nodeFound {function} the callback function
*/
JSM.BSPTree.prototype.Traverse = function (nodeFound)
{
	this.TraverseNode (this.root, nodeFound);
};

/**
* Function: BSPTree.TraverseNode
* Description: Traverses a node and its children and calls a function on node found.
* Parameters:
*	node {BSPNode} the node
*	nodeFound {function} the callback function
*/
JSM.BSPTree.prototype.TraverseNode = function (node, nodeFound)
{
	if (node !== null) {
		nodeFound (node);
		this.TraverseNode (node.inside, nodeFound);
		this.TraverseNode (node.outside, nodeFound);
	}
};

/**
* Function: BSPTree.GetNodes
* Description: Returns the nodes as an array.
* Returns:
*	{BSPNode[*]} the result
*/
JSM.BSPTree.prototype.GetNodes = function ()
{
	var result = [];
	this.Traverse (function (node) {
		result.push (node);
	});
	return result;
};

/**
* Function: BSPTree.GetNodes
* Description: Count nodes.
* Returns:
*	{integer} the result
*/
JSM.BSPTree.prototype.NodeCount = function ()
{
	var count = 0;
	this.Traverse (function () {
		count = count + 1;
	});
	return count;
};

/**
* Function: BSPTree.AddPolygonToNode
* Description: Adds a polygon to a node.
* Parameters:
*	node {BSPNode} the node
*	polygon {Polygon} the polygon
*	userData {anything} user data for polygon
* Returns:
*	{boolean} success
*/
JSM.BSPTree.prototype.AddPolygonToNode = function (node, polygon, userData)
{
	if (polygon.VertexCount () < 3) {
		return false;
	}
	
	var normal;
	if (node.polygon === null) {
		normal = JSM.CalculateNormal (polygon.vertices);
		var plane = JSM.GetPlaneFromCoordAndDirection (polygon.GetVertex (0), normal);
		node.polygon = polygon;
		if (userData !== undefined) {
			node.userData = userData;
		}
		node.plane = plane;
	} else {
		var backPolygons = [];
		var frontPolygons = [];
		var planePolygons = [];
		var cutSucceeded = JSM.CutPolygonWithPlane (polygon, node.plane, frontPolygons, backPolygons, planePolygons);
		if (cutSucceeded) {
			if (backPolygons.length > 0) {
				this.AddInsidePolygonsToNode (node, backPolygons, userData);
			}
			if (frontPolygons.length > 0) {
				this.AddOutsidePolygonsToNode (node, frontPolygons, userData);
			}
			if (planePolygons.length > 0) {
				normal = JSM.CalculateNormal (polygon.vertices);
				if (JSM.VectorDot (normal, node.plane.GetNormal ()) > 0) {
					this.AddInsidePolygonsToNode (node, planePolygons, userData);
				} else {
					this.AddOutsidePolygonsToNode (node, planePolygons, userData);
				}
			}
		}
	}
	
	return true;
};

/**
* Function: BSPTree.AddInsidePolygonsToNode
* Description: Adds inside a polygons to a node.
* Parameters:
*	node {BSPNode} the node
*	polygon {Polygon[*]} the polygons
*	userData {anything} user data for polygons
*/
JSM.BSPTree.prototype.AddInsidePolygonsToNode = function (node, polygons, userData)
{
	if (node.inside === null) {
		node.inside = this.GetNewNode ();
		node.inside.parent = node;
	}
	var i;
	for (i = 0; i < polygons.length; i++) {
		this.AddPolygonToNode (node.inside, polygons[i], userData);
	}
};

/**
* Function: BSPTree.AddOutsidePolygonsToNode
* Description: Adds outside a polygons to a node.
* Parameters:
*	node {BSPNode} the node
*	polygon {Polygon[*]} the polygons
*	userData {anything} user data for polygons
*/
JSM.BSPTree.prototype.AddOutsidePolygonsToNode = function (node, polygons, userData)
{
	if (node.outside === null) {
		node.outside = this.GetNewNode ();
		node.outside.parent = node;
	}
	var i;
	for (i = 0; i < polygons.length; i++) {
		this.AddPolygonToNode (node.outside, polygons[i], userData);
	}
};

/**
* Function: BSPTree.GetNewNode
* Description: Creates a new node.
* Returns:
*	{BSPNode} the new node
*/
JSM.BSPTree.prototype.GetNewNode = function ()
{
	var node = new JSM.BSPNode ();
	return node;
};

/**
* Function: ClipPolygonWithBSPTree
* Description: Clips a polygon with a created BSP tree.
* Parameters:
*	polygon {Polygon} the polygon
*	bspTree {BSPTree} the BSP tree
*	frontPolygons {Polygon[*]} (out) polygons in front of the tree
*	backPolygons {Polygon[*]} (out) polygons at the back of the tree
*	planarFrontPolygons {Polygon[*]} (out) polygons on the tree looks front
*	planarBackPolygons {Polygon[*]} (out) polygons on the tree looks back
* Returns:
*	{boolean} success
*/
JSM.ClipPolygonWithBSPTree = function (polygon, bspTree, frontPolygons, backPolygons, planarFrontPolygons, planarBackPolygons)
{
	function CutPolygonWithNode (polygon, node, isPlanar)
	{
		if (node === null) {
			return;
		}
		
		var cutBackPolygons = [];
		var cutFrontPolygons = [];
		var cutPlanarPolygons = [];
		var cutSucceeded = JSM.CutPolygonWithPlane (polygon, node.plane, cutFrontPolygons, cutBackPolygons, cutPlanarPolygons);
		if (!cutSucceeded) {
			return;
		}

		if (cutBackPolygons.length > 0) {
			AddInsidePolygons (node, cutBackPolygons, isPlanar);
		}
		if (cutFrontPolygons.length > 0) {
			AddOutsidePolygons (node, cutFrontPolygons, isPlanar);
		}
		if (cutPlanarPolygons.length > 0) {
			var normal = JSM.CalculateNormal (polygon.vertices);
			if (JSM.VectorDot (normal, node.plane.GetNormal ()) > 0) {
				AddInsidePolygons (node, cutPlanarPolygons, true);
			} else {
				AddOutsidePolygons (node, cutPlanarPolygons, true);
			}
		}
	}

	function CutPolygonsWithNode (polygons, node, isPlanar)
	{
		var i;
		for (i = 0; i < polygons.length; i++) {
			CutPolygonWithNode (polygons[i], node, isPlanar);
		}
	}

	function AddPolygonsToArray (polygons, polygonArray)
	{
		var i;
		for (i = 0; i < polygons.length; i++) {
			polygonArray.push (polygons[i]);
		}
	}

	function AddInsidePolygons (node, polygons, isPlanar)
	{
		if (node.inside !== null) {
			CutPolygonsWithNode (polygons, node.inside, isPlanar);
		} else {
			AddPolygonsToArray (polygons, isPlanar ? planarBackPolygons : backPolygons);
		}
	}
	
	function AddOutsidePolygons (node, polygons, isPlanar)
	{
		if (node.outside !== null) {
			CutPolygonsWithNode (polygons, node.outside, isPlanar);
		} else {
			AddPolygonsToArray (polygons, isPlanar ? planarFrontPolygons : frontPolygons);
		}
	}

	CutPolygonWithNode (polygon, bspTree.root, false);
	return true;
};
