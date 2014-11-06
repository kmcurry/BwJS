/**
* Class: Plane
* Description: Represents a plane.
* Parameters:
*	a {number} the a component of plane equation
*	b {number} the b component of plane equation
*	c {number} the c component of plane equation
*	d {number} the d component of plane equation
*/
JSM.Plane = function (a, b, c, d)
{
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
};

/**
* Function: Plane.Set
* Description: Sets the plane.
* Parameters:
*	a {number} the a component of plane equation
*	b {number} the b component of plane equation
*	c {number} the c component of plane equation
*	d {number} the d component of plane equation
*/
JSM.Plane.prototype.Set = function (a, b, c, d)
{
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
};

/**
* Function: Plane.GetNormal
* Description: Calculates the normal vector of the plane.
* Returns:
*	{Vector} the result
*/
JSM.Plane.prototype.GetNormal = function ()
{
	return new JSM.Vector (this.a, this.b, this.c);
};

/**
* Function: Plane.Clone
* Description: Clones the plane.
* Returns:
*	{Plane} a cloned instance
*/
JSM.Plane.prototype.Clone = function ()
{
	return new JSM.Plane (this.a, this.b, this.c, this.d);
};
