var EPSILON = 0.00000001;

function SIGN3(v) 
{
    (((v).x < 0 ) ? 4 : 0 | ((v).y < 0) ? 2 : 0 | ((v).z < 0) ? 1 : 0);
}

/**
 * Solve quadratic equation with term coefficients a (2nd degree term), 
 * b (1st degree term), and c (constant term); return number of real roots; 
 * if 1 root exists, it is set to root1, if 2 roots exist, they are set to 
 * root1 and root2.
 * @param a      - 2nd degree term coefficient.
 * @param b      - 1st degree term coefficient.
 * @param c      - constant term.
 * @return root1 - first real root.
 * @return root2 - second real root.
 * @return count - 0: no real roots exist
 *                 1: 1 real root exists
 *                 2: 2 real roots exist
 */
function solveQuadraticEquation(a, b, c)
{
   if (a == 0) 
   {
       return { count: 0 };
   }

   var sqrt_term = b * b - 4 * a * c;
   if (sqrt_term < 0) 
   {
       return { count: 0 };
   }

   if (sqrt_term == 0)
   {
      var root1 = -b / (2 * a);
      return { count: 1, root1: root1 };
   }

   sqrt_term = Math.sqrt(sqrt_term);

   var root1 = (-b + sqrt_term) / (2 * a);
   var root2 = (-b - sqrt_term) / (2 * a);

   return { count: 2, root1: root1, root2: root2 };
}

/** 
 * Determine if a ray intersects a triangle. 
 *
 * Given a ray defined by an origin and a direction, and a triangle,
 * determine if the ray intersects the triangle; if an intersection exists, 
 * determine the distance t from the ray origin to the point of intersection, and the 
 * barycentric coordinates (u, v) inside the triangle;
 *
 * Algorithm adapted from:
 *    Tomas Moller and Ben Trumbore, "Fast, Minimum Storage Ray/Triangle 
 *    Intersection", journal of graphics tool, vol. 2, no. 1, pp. 21-28, 1997.
 *    http://www.ce.chalmers.se/staff/tomasm
 *
 * @param rayOrig    - ray origination point.
 * @param rayDir     - ray direction.
 * @param v0         - first triangle vertex.
 * @param v1         - second triangle vertex.
 * @param v2         - third triangle vertex.
 * @param skipPosDet - if true, skip intersection test (return false) if the triangle's determinate 
 *                     is positive.
 * @param skipNegDet - if true, skip intersection test (return false) if the triangle's determinate 
 *                     is negative.
 * @return t         - distance from ray origin to intersection point (if ray intersects triangle).
 * @return u         - barycentric coordinate u of intersection point (if ray intersects triangle).
 * @return v         - barycentric coordinate v of intersection point (if ray intersects triangle).
 * @return result    - true if the ray intersects the triangle, false if not.
 */
function rayTriangleIntersection(rayOrig, rayDir, v0, v1, v2, skipPosDet, skipNegDet)
{
    // normalize ray direction vector
    var dir = new Vector3D(rayDir.x, rayDir.y, rayDir.z);
    dir.normalize();

    // find vectors for two edges sharing v0
    var edge1 = new Vector3D(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
    var edge2 = new Vector3D(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
   
    // calculate determinant
    var pvec = crossProduct(dir, edge2);
    var det = dotProduct(edge1, pvec);

    // if determinant is near zero, ray lies in plane of triangle
    if (-EPSILON < det && det < EPSILON) 
    {
        return { result: false };
    }

    // if requested, skip triangles with negative/positive determinates
    if (skipPosDet && det > 0) 
    {
        return { result: false };
    }
    if (skipNegDet && det < 0) 
    {
        return { result: false };
    }

    var inv_det = 1 / det;

    // calculate distance from v0 to ray origin
    var tvec = new Vector3D(rayOrig.x - v0.x, rayOrig.y - v0.y, rayOrig.z - v0.z);

    // calculate u parameter and test bounds
    var u = dotProduct(tvec, pvec) * inv_det;
    if (u < 0 || u > 1)
    {
        return { result: false };
    }

    var qvec = crossProduct(tvec, edge1);

    // calculate v parameter and test bounds
    var v = dotProduct(dir, qvec) * inv_det;
    if (v < 0 || u + v > 1) 
    {
        return { result: false };
    }

    // ray intersects triangle, calculate t
    var t = dotProduct(edge2, qvec) * inv_det;

    return { result: true, t: t, u: u, v: v };
}

/**
 * Determine if a ray intersects a sphere.
 *
 * Given a ray defined by an origination point (x0, y0, z0), and
 * destination point (x1, y1, z1), and represented by the parametric equations: 
 * x = x0 + t(x1 - x0), y = y0 + t(y1 - y0), z = z0 + t(z1 - z0),
 * determine if the ray intersects the sphere defined by center (a, b, c) and
 * radius r, and represented by the equation (x - a)² + (y - b)² + (z - c)² = r²;
 *
 * For convenience, define dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
 *
 * The intersection is found by substituting x, y, and z from the ray equations
 * into the sphere equation, and solving for t (after term collection):
 * 
 * (dx² + dy² + dz²)t² + 2[dx(x0 - a) + dy(y0 - b) + dz(z0 - c)]t
 *    + (x0 - a)² + (y0 - b)² + (z0 - c)² - r² = 0
 *
 * Algorithm adapted from:
 *    Computer Graphics: Principles and Practice, 2nd Edition, Foley, et al., pp. 702-703
 *
 * @param rayOrig - ray origination point.
 * @param rayDir  - ray direction.
 * @param center  - sphere center point.
 * @param radius  - sphere radius.
 * @return root1  - root 1 from solving quadratic equation (if ray intersects sphere).
 * @return root2  - root 2 from solving quadratic equation (if ray intersects sphere).
 * @return count  - 0: ray does not intersect sphere
 *                  1: ray grazes sphere - root1 will contain the one real root
 *                  2: ray intersects sphere - root1 and root2 will contain both real roots
 */
function raySphereIntersection(rayOrig, rayDir, center, radius)
{
    // normalize ray direction vector
    var dir = new Vector3D(rayDir.x, rayDir.y, rayDir.z);
    dir.normalize();
    
    var rayDest = new Vector3D(rayOrig.x + dir.x, rayOrig.y + dir.y, rayOrig.z + dir.z);

    var dx = rayDest.x - rayOrig.x;
    var dy = rayDest.y - rayOrig.y;
    var dz = rayDest.z - rayOrig.z;

    // a = dx * dx + dy * dy + dz * dz == 1
    // because distance from rayOrig to rayDest is 1

    var b = 2 * (dx * (rayOrig.x - center.x) + 
                 dy * (rayOrig.y - center.y) + 
                 dz * (rayOrig.z - center.z));

    var c = (rayOrig.x - center.x) * (rayOrig.x - center.x) +
            (rayOrig.y - center.y) * (rayOrig.x - center.y) +
            (rayOrig.z - center.z) * (rayOrig.z - center.z) -
            radius * radius;

    return solveQuadraticEquation(1, b, c);
}

/**
 * Determine if the triangle contains a point which is known to lie in the plane of the triangle.  
 * Adapted from "Triangle-Cube Intersection", Graphics Gems III, pp.236-239.
 * @param v0      - first triangle vertex.
 * @param v1      - second triangle vertex.
 * @param v2      - third triangle vertex.
 * @param point   - the point.
 * @return result - true if the triangle contains the point, false if not. 
 */
function triangleContainsPoint(v0, v1, v2, point)
{
    // for each triangle side, make a vector out of it by subtracting vertices; 
    // make another vector from one vertex to the point; the cross-product of these 
    // two vectors is orthogonal to both and the signs of its components indicate 
    // whether the point was on the inside or on the outside of this triangle side
    var sign12 = SIGN3(crossProduct(subtract3D(v0, v1), subtract3D(v0, point))); 
    var sign23 = SIGN3(crossProduct(subtract3D(v1, v2), subtract3D(v1, point))); 
    var sign31 = SIGN3(crossProduct(subtract3D(v2, v0), subtract3D(v2, point))); 

    // if all three cross-product vectors agree in their component signs,
    // then the point must be inside all three; the point cannot be outside all 
    // three sides simultaneously.
    if ((sign12 == sign23) && (sign23 == sign31))
    {
        return true;
    }

    return false;
}

/**
 * Determine if a triangle lies on the positive side of the plane (the side in the direction of
 * the plane normal).
 * @param v0    - first vertex of triangle.
 * @param v1    - second vertex of triangle.
 * @param v2    - third vertex of triangle.
 * @return bool - true if the triangle lies on the positive side of the plane, false if not.
 */
function triangleOnPositiveSideOfPlane(v0, v1, v2, plane)
{
    return pointOnPositiveSideOfPlane(v0, plane) &&
           pointOnPositiveSideOfPlane(v1, plane) &&
           pointOnPositiveSideOfPlane(v2, plane);
}

/**
 * Determine if a triangle lies on the positive side of the plane (the side in the direction of
 * the plane normal).
 * @param v0    - first vertex of triangle.
 * @param v1    - second vertex of triangle.
 * @param v2    - third vertex of triangle.
 * @return bool - true if the triangle lies on the positive side of the plane, false if not.
 */
function triangleOnNegativeSideOfPlane(v0, v1, v2, plane)
{
    return pointOnNegativeSideOfPlane(v0, plane) &&
           pointOnNegativeSideOfPlane(v1, plane) &&
           pointOnNegativeSideOfPlane(v2, plane);
}

/**
 * Determine if a triangle spans the plane.
 * @param v0    - first vertex of triangle.
 * @param v1    - second vertex of triangle.
 * @param v2    - third vertex of triangle.
 * @return bool - true if the triangle spans the plane, false if not.
 */
function triangleSpansPlane(v0, v1, v2, plane)
{
    return !triangleOnPositiveSideOfPlane(v0, v1, v2, plane) &&
           !triangleOnNegativeSideOfPlane(v0, v1, v2, plane);
}

/**
 * Determine if the line segment intersects the triangle.  If so, find the point
 * of intersection.
 * @param a       - one endpoint of the line segment.
 * @param b       - other endpoint of the line segment.
 * @param v0      - first triangle vertex. 
 * @param v1      - second triangle vertex.
 * @param v2      - third triangle vertex.
 * @return point  - the point of intersection (if line segment intersects triangle). 
 * @return result - true if the line segment intersects the triangle, false if not.
 */
function lineSegmentTriangleIntersection(a, b, v0, v1, v2)
{
    // first check that line segment intersects plane of triangle
    var result = lineSegmentPlaneIntersection(a, b, new Plane2(v0, v1, v2));
    if (result.count == 0)
    {
        return { result: false, point: null };
    }

    // check that point is within triangle bounding box
    if (result.point.x < min3(v0.x, v1.x, v2.x) ||
        result.point.y < min3(v0.y, v1.y, v2.y) ||
        result.point.z < min3(v0.z, v1.z, v2.z) ||
        result.point.x > max3(v0.x, v1.x, v2.x) ||
        result.point.y > max3(v0.y, v1.y, v2.y) ||
        result.point.z > max3(v0.z, v1.z, v2.z))
    {
        return { result: false, point: null };
    }

    // check that point is within triangle
    if (triangleContainsPoint(v0, v1, v2, result.point))
    {
        return { result: true, point: result.point };
    }
    
    return { result: false, point: null };
}

/**
 * Determine if two triangles intersect.
 * @param t1v0  - first triangle's first vertex. 
 * @param t1v1  - first triangle's second vertex.
 * @param t1v2  - first triangle's third vertex.
 * @param t2v0  - second triangle's first vertex. 
 * @param t2v1  - second triangle's second vertex.
 * @param t2v2  - second triangle's third vertex.
 * @return bool - true if the triangles intersect, false if not.
 */
function triangleTriangleIntersection(t1v0, t1v1, t1v2,
                                      t2v0, t2v1, t2v2)
{
    if (!triangleSpansPlane(t1v0, t1v1, t1v2, new Plane(t2v0, t2v1, t2v2)) ||
        !triangleSpansPlane(t2v0, t2v1, t2v2, new Plane(t1v0, t1v1, t1v2)))
    {
        return false;
    }
 
    if (lineSegmentTriangleIntersection(t1v0, t1v1, t2v0, t2v1, t2v2).result ||
        lineSegmentTriangleIntersection(t1v1, t1v2, t2v0, t2v1, t2v2).result ||
        lineSegmentTriangleIntersection(t1v2, t1v0, t2v0, t2v1, t2v2).result ||

        lineSegmentTriangleIntersection(t2v0, t2v1, t1v0, t1v1, t1v2).result ||
        lineSegmentTriangleIntersection(t2v1, t2v2, t1v0, t1v1, t1v2).result ||
        lineSegmentTriangleIntersection(t2v2, t2v0, t1v0, t1v1, t1v2).result)
    {
        return true;
    }

    return false;
}

function planeProject(v, plane)
{
    return crossProduct(plane.normal, crossProduct(v, plane.normal));
}

function distanceBetweenLineSegmentAndPoint(a, b, point)
{
    // if segment points are coincident, return
    if (a.equals(b))
    {
        return distanceBetween(a, point);
    }

    var mag = magnitude(b.x - a.x, 
                        b.y - a.y, 
                        b.z - a.z);

    var u = (((point.x - a.x) * (b.x - a.x)) +
             ((point.y - a.y) * (b.y - a.y)) +
             ((point.z - a.z) * (b.z - a.z))) / (mag * mag);

    // if u is not in range [0, 1], shortest distance lies on line outside of segment -- chose closest endpoint
    if (u < 0)
    {
        return distanceBetween(a, point);
    }
    else if (u > 1)
    {
        return distanceBetween(b, point);
    }
    else // u E [0, 1]
    {
        return distanceBetween(new Vector3D(a.x + (b.x - a.x) * u,
                                            a.y + (b.y - a.y) * u,
                                            a.z + (b.z - a.z) * u), point);
    }
}
