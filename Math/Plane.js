function Plane(point, normal)
{
    this.point = new Vector3D();
    this.normal = new Vector3D();
    this.dot = 0;
    
    if (point && normal)
    {
        this.point.copy(point);
        this.normal.copy(normal);
        this.dot = dotProduct(this.point, this.normal);
    }
}

Plane2.prototype = new Plane();
Plane2.prototype.constructor = Plane2;

function Plane2(v0, v1, v2)
{
    var normal;

    if (v0 && v1 && v2)
    {
        var leg1 = new Vector3D(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
        var leg2 = new Vector3D(v0.x - v1.x, v0.y - v1.y, v0.z - v1.z);
        normal = crossProduct(leg1, leg2);
        normal.normalize();
    }
    
    Plane.call(this, v0, normal);
}

/**
 * Determine if a point lies on the plane.
 * @param point     - the point.
 * @param plane     - the plane.
 * @param tolerance - tolerance amount.
 * @return bool     - true if the point lies on the plane, false if it does not.
 */
function pointOnPlane(point, plane, tolerance)
{
    return (Math.abs(dotProduct(point, plane.normal) - plane.dot) < tolerance ? true : false);
}

/**
 * Determine if a point lies on the positive side of the plane; i.e., determine if the 
 * point lies in the half-space on the side of the plane in the direction of the normal.
 * @param point     - the point.
 * @param plane     - the plane.
 * @return bool     - true if the point lies on the positive side of the plane, false if 
 *                    it does not.
 */
function pointOnPositiveSideOfPlane(point, plane)
{
    return (dotProduct(point, plane.normal) - plane.dot > 0 ? true : false);
}

/**
 * Determine if a point lies on the negative side of the plane; i.e., determine if the 
 * point lies in the half-space on the side of the plane in the opposite direction of the 
 * normal.
 * @param point     - the point.
 * @param plane     - the plane.
 * @return bool     - true if the point lies on the negative side of the plane, false if 
 *                    it does not.
 */
function pointOnNegativeSideOfPlane(point, plane)
{
    return (dotProduct(point, plane.normal) - plane.dot < 0 ? true : false);
}

/**
 * Determine if a line intersects the plane.  If it does, find the point of intersection.
 * @param line  - the line.
 * @param plane - the plane.
 * @param point - the point of intersection (if line intersects plane).
 * @return int  - returns:
 *                  0 if line does not intersect plane
 *                  1 if line intersects plane at one point
 *                  2 if line intersects plane at infinite points (line lies on plane)
 */
function lineIntersectsPlane(line, plane)
{
    var point = new Vector3D();
    var result;
    
    // solve for t in terms of plane equation Ax + By + Cz = D
    var lhs = plane.normal.x * line.dir.x + plane.normal.y * line.dir.y + plane.normal.z * line.dir.z;
    if (lhs == 0)  // plane and line are parallel
    {
        // if line point lies on the plane, consider this an intersection
        if (pointOnPlane(line.point, plane, FLT_EPSILON))
        {
            point.copy(line.point);
            result = 2;
        }

        result = 0;
    }
    else
    {
        var rhs = plane.dot - (plane.normal.x * line.point.x + plane.normal.y * line.point.y + plane.normal.z * line.point.z);
        var t = rhs / lhs;

        // calculate point of intersection
        point.x = t * line.dir.x + line.point.x;
        point.y = t * line.dir.y + line.point.y;
        point.z = t * line.dir.z + line.point.z;

        result = 1;
    }

    return { result: result, point: point };
}

/**
 * Determine if a line segment intersects the plane.  If it does, find the point of intersection.
 * @param a      - one endpoint of the line segment.
 * @param b      - other endpoint of the line segment.
 * @param plane  - the plane.
 * @return point - the point of intersection (if line segment intersects plane).
 * @return count - returns:
 *                  0 if line segment does not intersect plane
 *                  1 if line segment intersects plane at one point
 *                  2 if line segment intersects plane at infinite points (line segment lies on plane)
 */
function lineSegmentPlaneIntersection(a, b, plane)
{
    // represent line segment in parametric line equation form;
    // line through P0(x0, y0, z0) parallel to v = Ai + Bj + Ck =>
    // x = x0 + tA, y = y0 + tB, z = z0 + tC
    var ab = new Vector3D(b.x - a.x, b.y - a.y, b.z - a.z);
    var x0 = a.x;
    var y0 = a.y;
    var z0 = a.z;
    var tA = ab.x;
    var tB = ab.y;
    var tC = ab.z;

    // solve for t in terms of plane equation Ax + By + Cz = D
    var lhs = plane.normal.x * tA + plane.normal.y * tB + plane.normal.z * tC;
    if (lhs == 0)  // plane and line segment are parallel
    {
        // if a lies on the plane, consider this an intersection
        if (pointOnPlane(a, plane, FLT_EPSILON))
        {
            var point = new Vector3D(a);
            return { count: 2, point: point };
        }

        return { count: 0 };
    }

    var rhs = plane.dot - (plane.normal.x * x0 + plane.normal.y * y0 + plane.normal.z * z0);
    var t = rhs / lhs;

    // if t is not in range [0, 1], then point of intersection is not
    // within line segment
    if (t < 0 || t > 1) 
    {
        return { count: 0 };
    }

    // point of intersection is within line segment; calculate point
    var point = new Vector3D();
    point.x = t * tA + x0;
    point.y = t * tB + y0;
    point.z = t * tC + z0;

    return { count: 1, point: point };
}

/**
 * Determine if planes are coplanar.
 * @param plane1 - the first plane.
 * @param plane2 - the second plane.
 * @return bool  - true if the planes are coplanar, false if they are not.
 */
function coplanar(plane1, plane2)
{
    return (((plane1.normal == plane2.normal || plane1.normal == -plane2.normal) &&
              pointOnPlane(plane1.point, plane2)) ? true: false);
}

/**
 * Determine if planes intersect.
 * @param plane1 - the first plane.
 * @param plane2 - the second plane.
 * @return bool  - true if the planes intersect, false if they do not.
 */
function planesIntersect(plane1, plane2)
{
    // if planes are parallel (normal cross product == 0),
    // planes don't intersect (or they are coplanar)
    var zero = new Vector3D(0, 0, 0);
    if (crossProduct(plane1.normal, plane2.normal).equals(zero))
    {
        return false;
    }
 
    return true;
}

/**
 * Determine the distance between 2 parallel planes.  If planes are not parallel, 0 is returned.
 * @param plane1 - the first plane.
 * @param plane2 - the second plane.
 * @return float - the distance between the planes.
 */
function distanceBetweenPlanes(plane1, plane2)
{
    if (coplanar(plane1, plane2))
    {
        return 0;
    }

    if (!planesIntersect(plane1, plane2))
    {
        var intersection = lineIntersectsPlane(new Line(plane1.point, plane1.normal), plane2);
        if (intersection.result)
        {
            return distanceBetween(plane1.point, point);
        }
        else
        {
            return 0;
        }
    }

    // planes intersect
    return 0;
}