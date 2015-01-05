function RayIntersectRecord()
{
    this.distance = Infinity;
    this.pointModel = new Vector3D();
    this.pointWorld = new Vector3D();
    this.pointView = new Vector3D();
    this.triIndex = 0;
}

function RayIntersectParams(rayOrigin, 
                            rayDir,
                            nearDistance,
                            farDistance,
                            worldMatrix,
                            viewMatrix,
                            scale,
                            doubleSided,
                            clipPlanes)
{
    this.rayOrigin = rayOrigin || new Vector3D();
    this.rayDir = rayDir || new Vector3D();
    this.nearDistance = nearDistance || 0;
    this.farDistance = farDistance || 0;
    this.worldMatrix = worldMatrix || new Matrix4x4();
    this.viewMatrix = viewMatrix || new Matrix4x4();
    this.worldViewMatrix = this.worldMatrix.multiply(this.viewMatrix);
    this.scale = scale || 0;
    this.doubleSided = doubleSided || false;
    this.clipPlanes = clipPlanes || new Array();
    this.intersects = false;
    this.intersectRecord = new RayIntersectRecord();
}

function Triangle(x0, y0, z0, x1, y1, z1, x2, y2, z2)
{
    this.v0 = new Vector3D(x0, y0, z0);
    this.v1 = new Vector3D(x1, y1, z1);
    this.v2 = new Vector3D(x2, y2, z2);
}

function Sphere()
{
    this.center = new Vector3D();
    this.radius = 0;
    this.xcenter = new Vector3D(); // transformed center
    this.xradius = 0;              // transformed (scaled) radius
}

Sphere.prototype.intersects = function(sphere)
{
    // compare squared distances to keep from calling sqrt
    /*return (((this.xcenter.x - sphere.xcenter.x) * (this.xcenter.x - sphere.xcenter.x) + 
             (this.xcenter.y - sphere.xcenter.y) * (this.xcenter.y - sphere.xcenter.y) +
             (this.xcenter.z - sphere.xcenter.z) * (this.xcenter.z - sphere.xcenter.z)) < ((this.xradius + sphere.xradius) * (this.xradius + sphere.xradius)) ? true : false);
    */
    var distanceBetweenCenters = distanceBetween(this.xcenter, sphere.xcenter);
    var combinedRadii = this.xradius + sphere.xradius;
    
    if (distanceBetweenCenters < combinedRadii) return true;
    
    return false;
}

function Region(minX, minY, minZ, maxX, maxY, maxZ)
{
    this.min = new Vector3D(minX, minY, minZ);
    this.max = new Vector3D(maxX, maxY, maxZ);
    
    this.xpos = new Plane();
    this.xneg = new Plane();
    this.ypos = new Plane();
    this.yneg = new Plane();
    this.zpos = new Plane();
    this.zneg = new Plane();
    
    this.xpos_ypos_zpos = new Plane();
    this.xpos_ypos_zneg = new Plane();
    this.xpos_yneg_zpos = new Plane();
    this.xpos_yneg_zneg = new Plane();
    this.xneg_ypos_zpos = new Plane();
    this.xneg_ypos_zneg = new Plane();
    this.xneg_yneg_zpos = new Plane();
    this.xneg_yneg_zneg = new Plane();
    
    this.setPlanes();
}

Region.prototype.setPlanes = function()
{
    // generate axis planes
    this.xpos = new Plane(this.max, new Vector3D( 1,  0,  0));
    this.xneg = new Plane(this.min, new Vector3D(-1,  0,  0));
    this.ypos = new Plane(this.max, new Vector3D( 0,  1,  0));
    this.yneg = new Plane(this.min, new Vector3D( 0, -1,  0));
    this.zpos = new Plane(this.max, new Vector3D( 0,  0,  1));
    this.zneg = new Plane(this.min, new Vector3D( 0,  0, -1));

    // define corner points of region
    var xp_yp_zp = new Vector3D(this.max.x, this.max.y, this.max.z);
    var xp_yp_zn = new Vector3D(this.max.x, this.max.y, this.min.z);
    var xp_yn_zp = new Vector3D(this.max.x, this.min.y, this.max.z);
    var xp_yn_zn = new Vector3D(this.max.x, this.min.y, this.min.z);
    var xn_yp_zp = new Vector3D(this.min.x, this.max.y, this.max.z);
    var xn_yp_zn = new Vector3D(this.min.x, this.max.y, this.min.z);
    var xn_yn_zp = new Vector3D(this.min.x, this.min.y, this.max.z);
    var xn_yn_zn = new Vector3D(this.min.x, this.min.y, this.min.z);

    // generate corner planes
    this.xpos_ypos_zpos = new Plane(xp_yp_zp, xp_yp_zp - xn_yn_zn);
    this.xpos_ypos_zneg = new Plane(xp_yp_zn, xp_yp_zn - xn_yn_zp);
    this.xpos_yneg_zpos = new Plane(xp_yn_zp, xp_yn_zp - xn_yp_zn);
    this.xpos_yneg_zneg = new Plane(xp_yn_zn, xp_yn_zn - xn_yp_zp);
    this.xneg_ypos_zpos = new Plane(xn_yp_zp, xn_yp_zp - xp_yn_zn);
    this.xneg_ypos_zneg = new Plane(xn_yp_zn, xn_yp_zn - xp_yn_zp);
    this.xneg_yneg_zpos = new Plane(xn_yn_zp, xn_yn_zp - xp_yp_zn);
    this.xneg_yneg_zneg = new Plane(xn_yn_zn, xn_yn_zn - xp_yp_zp);   
}

Region.prototype.containsGeometry = function(tris, triIndices)
{
    var result = [];
    
    for (var i=0; i < triIndices.length; i++)
    {
        if (this.containsTriangle(tris[triIndices[i]]))
        {
            result.push(triIndices[i]);
        }
    }
    
    return result;
}

Region.prototype.containsTriangle = function(tri)
{
    var verts = new Array(3);
    verts[0] = tri.v0;
    verts[1] = tri.v1;
    verts[2] = tri.v2;
    
    // check if any vertices are within the region bounds (quick accept)
    for (var i=0; i < 3; i++)
    {
        if (verts[i].x >= this.min.x &&
            verts[i].y >= this.min.y &&
            verts[i].z >= this.min.z &&
            verts[i].x <= this.max.x &&
            verts[i].y <= this.max.y &&
            verts[i].z <= this.max.z)
        {
            return true;
        }
    }
    
    // check if all vertices are outside a region plane (quick reject)
    if (triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xpos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xneg) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.ypos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.yneg) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.zpos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.zneg) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xpos_ypos_zpos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xpos_ypos_zneg) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xpos_yneg_zpos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xpos_yneg_zneg) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xneg_ypos_zpos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xneg_ypos_zneg) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xneg_yneg_zpos) ||
        triangleOnPositiveSideOfPlane(verts[0], verts[1], verts[2], this.xneg_yneg_zneg))
    {
        return false;
    }
    
    // triangle has survived trivial acceptance/rejection tests...

    // test triangle line segments for cube face penetration
    // (only test segments if they span the face plane)
    var result;
    for (var i=0; i < 3; i++)
    {
        var a = verts[i];
        var b = verts[(i+1)%3];

        // +X face
        result = lineSegmentPlaneIntersection(a, b, this.xpos);
        if (result.count > 0) 
        {
            // if point lies within region face, triangle intersects region
            if (result.point.y >= this.min.y && result.point.y <= this.max.y &&
                result.point.z >= this.min.z && result.point.z <= this.max.z)
            {
                return true;
            }
        }

        // -X face
        result = lineSegmentPlaneIntersection(a, b, this.xneg);
        if (result.count > 0) 
        {
            if (result.point.y >= this.min.y && result.point.y <= this.max.y &&
                result.point.z >= this.min.z && result.point.z <= this.max.z)
            {
                return true;
            }
        }

        // +Y face
        result = lineSegmentPlaneIntersection(a, b, this.ypos);
        if (result.count > 0)
        {
            if (result.point.x >= this.min.x && result.point.x <= this.max.x &&
                result.point.z >= this.min.z && result.point.z <= this.max.z)
            {
                return true;
            }
        }

        // -Y face
        result = lineSegmentPlaneIntersection(a, b, this.yneg);
        if (result.count > 0)
        {
            if (result.point.x >= this.min.x && result.point.x <= this.max.x &&
                result.point.z >= this.min.z && result.point.z <= this.max.z)
            {
                return true;
            }
        }

        // +Z face
        result = lineSegmentPlaneIntersection(a, b, this.zpos);
        if (result.count > 0)
        {
            if (result.point.x >= this.min.x && result.point.x <= this.max.x &&
                result.point.y >= this.min.y && result.point.y <= this.max.y)
            {
                return true;
            }
        }

        // -Z face
        result = lineSegmentPlaneIntersection(a, b, this.zneg);
        if (result.count > 0)
        {
            if (result.point.x >= this.min.x && result.point.x <= this.max.x &&
                result.point.y >= this.min.y && result.point.y <= this.max.y)
            {
                return true;
            }
        }
    }
    
    // triangle and region may still intersect if a region corner is poking
    // through the interior of the triangle; check for this case by
    // determining if any of the four region diagonals intersect the triangle
    // 0
    result = lineSegmentTriangleIntersection(this.min, 
                                             this.max, 
                                             verts[0], verts[1], verts[2]);
    if (result.count > 0) return true;    
    // 1
    result = lineSegmentTriangleIntersection(new Vector3D(this.min.x, this.max.y, this.min.z), 
                                             new Vector3D(this.max.x, this.min.y, this.max.z),
                                             verts[0], verts[1], verts[2]);
    if (result.count > 0) return true;
    // 2
    result = lineSegmentTriangleIntersection(new Vector3D(this.max.x, this.min.y, this.min.z), 
                                             new Vector3D(this.min.x, this.max.y, this.max.z),
                                             verts[0], verts[1], verts[2]);
    if (result.count > 0) return true;
    // 3                                        
    result = lineSegmentTriangleIntersection(new Vector3D(this.min.x, this.min.y, this.max.z), 
                                             new Vector3D(this.max.x, this.max.y, this.min.z),
                                             verts[0], verts[1], verts[2]);
    if (result.count > 0) return true;

    // triangle and region do not intersect
    return false;
}

function SphereTreeNode()
{
    this.sphere = new Sphere();
    this.level = 0;
    this.parent = null;
    this.children = [];
    this.triIndices = [];    
}

SphereTreeNode.prototype.isLeaf = function()
{
    return this.children.length == 0 ? true : false;    
}

SphereTreeNode.prototype.addChild = function(child)
{
    this.children.push(child);
    child.parent = this;
}

SphereTreeNode.prototype.intersects = function(sphereTreeNode)
{
    return (this.sphere.intersects(sphereTreeNode.sphere));    
}

function SphereHitRec()
{
    this.target = null;
    this.testList = [];
};

function BoundingTree()
{
    this.root = null;
    this.min = new Vector3D();
    this.max = new Vector3D();
    this.tris = [];
    this.visited = [];    
}

BoundingTree.prototype.setTriangles = function(tris, min, max)
{
    this.tris = tris.slice();
    this.min.copy(min);
    this.max.copy(max);
}

BoundingTree.prototype.setTransform = function(matrix)
{
}

SphereTree.prototype = new BoundingTree();
SphereTree.prototype.constructor = SphereTree;

function SphereTree()
{
    BoundingTree.call(this);
}

SphereTree.prototype.setTransform = function(matrix)
{
    if (this.root) this.transformNode(matrix, this.root);
}

SphereTree.prototype.transformNode = function(matrix, node)
{
    var result = matrix.transform(node.sphere.center.x, node.sphere.center.y, node.sphere.center.z, 1);
    node.sphere.xcenter.x = result.x;
    node.sphere.xcenter.y = result.y;
    node.sphere.xcenter.z = result.z;
    
    var scale = matrix.getScalingFactors();
    node.sphere.xradius = node.sphere.radius * max3(scale.x, scale.y, scale.z);
    
    // recurse on node children
    for (var i = 0; i < node.children.length; i++)
    {
        this.transformNode(matrix, node.children[i]);
    }
}

SphereTree.prototype.collides = function(tree)
{
    if (!this.root || !tree.root) // must be non-NULL
    {
        return false;
    }

    // check root nodes for collision
    if (this.nodesCollide(this.root, tree.root))
    {
        // if both root nodes are leaves, return true
        if (this.root.isLeaf() && tree.root.isLeaf())
        {
            return true;
        }

        // recursively check child nodes
        var sphereHit = new SphereHitRec();
        var sphereHits = [];
        if (tree.root.isLeaf())
        {
            sphereHit.target = tree.root;
            sphereHit.testList = this.root.children;
        }
        else
        {
            sphereHit.target = this.root;
            sphereHit.testList = tree.root.children;
        }       
        sphereHits.push(sphereHit);

        return this.testSphereHits(sphereHits);
    }
    
    // root nodes do not collide
    return false;
}

SphereTree.prototype.obstructs = function(tree, forward)
{
    if (!this.root || !tree.root) // must be non-NULL
    {
        return 0; // indicates no obstruction
    }
    
    // construct cylinder representing tree's root sphere extruded along the forward vector
    var cylA = tree.root.sphere.xcenter;
    var cylB = new Vector3D(cylA.x + forward.x, 
                            cylA.y + forward.y,
                            cylA.z + forward.z);
    var cylRadius = tree.root.sphere.xradius;
    
    // find distance between cylinder center segment and this' center
    var distance = distanceBetweenLineSegmentAndPoint(cylA, cylB, this.root.sphere.xcenter);   
 
    if (distance < (this.root.sphere.xradius + cylRadius))
    {
        return distance;         
    }
    
    return 0; // indicates no obstruction
}

SphereTree.prototype.nodesCollide = function(node1, node2)
{
    return (node1.intersects(node2));    
}

SphereTree.prototype.testSphereHits = function(sphereHits)
{
    while (sphereHits.length > 0)
    {
        if (this.testSphereHit(sphereHits[0], sphereHits))
        {
            return true;
        }
        
        sphereHits.splice(0, 1);
    }

    return false;
}

SphereTree.prototype.testSphereHit = function(sphereHit, sphereHits)
{
    for (var i = 0; i < sphereHit.testList.length; i++)
    {
        if (this.nodesCollide(sphereHit.target, sphereHit.testList[i]))
        {
            var nextSphereHit = new SphereHitRec();
            nextSphereHit.target = sphereHit.testList[i];
            if (sphereHit.target.isLeaf())
            {
                nextSphereHit.testList.push(sphereHit.target);
            }
            else
            {
                nextSphereHit.testList = sphereHit.target.children;
            }
            sphereHits.push(nextSphereHit);

            // check for leaf collision
            if (sphereHit.target.isLeaf() && sphereHit.testList[i].isLeaf())
            {
                return true;
            }
        }
    }

    // no leaf collisions
    return false;
}

SphereTree.prototype.rayIntersectsTree = function(params)
{
    if (this.root)
    {
        this.visited.length = this.tris.length;
        for (var i=0; i < this.visited.length; i++)
        {
            this.visited[i] = false;
        }

        return this.rayIntersectsTreeNode(this.root, params);
    }

    return false;
}

SphereTree.prototype.rayIntersectsTreeNode = function(root, params)
{
    // if this sphere tree node has children, and it is intersected by the ray, 
    // recurse on all sphere tree nodes in the next level, saving the smallest positive 
    // t value; if ray does not intersect this sphere tree node, or if no intersections 
    // are found for the next level, return false
    if (root.children.length > 0)
    {
        // check if this sphere tree node is intersected by the ray
        if (this.rayIntersectsSphere(root, params) == false)
        {
            return false;
        }

        // sphere tree node is intersected by the ray, recurse on children nodes
        var childIntersects = false;
        for (var i=0; i < root.children.length; i++)
        {
            if (this.rayIntersectsTreeNode(root.children[i], params) == true)
            {
                childIntersects = true;
            }
        }

        if (childIntersects)
        {
            return true;
        }
        else // !childIntersects
        {
            return false;
        }
    }
    else // root.children.empty()
    {   
        // lowest sphere tree node level (no children); check against tris
        return this.rayIntersectsTriangleList(root.triIndices, params);
    }
}

SphereTree.prototype.rayIntersectsSphere = function(node, params)
{
    // transform sphere center by world-view transform
    var center = params.worldViewMatrix.transform(node.sphere.center.x, node.sphere.center.y, node.sphere.center.z, 1);

    // adjust sphere radius by scale factor
    var radius = node.sphere.radius * max3(params.scale.x, params.scale.y, params.scale.z);

    // test for ray-sphere intersection
    var roots = raySphereIntersection(params.rayOrigin, params.rayDir, center, radius);
    switch (roots.count)
    {
    case 2:
        // two intersection points; accept if one root is positive
        if (roots.root1 <= 0 && roots.root2 <= 0)
        {
            return false;
        }
        break;

    case 1:
        // one intersection point (ray grazes sphere); accept if root is positive
        if (roots.root1 <= 0)
        {
            return false;
        }
        break;

    case 0:
    default:
        // no intersection
        return false;
    }

    return true;
}

SphereTree.prototype.rayIntersectsTriangleList = function(triIndices, params)
{
    var distance, u, v;

    // determine closest triangle intersected by ray (closest to ray origin)
    for (var i=0; i < triIndices.length; i++)
    {
        var index = triIndices[i];

        // skip triangle if already tested
        if (this.visited[index] == true)
        {
            continue;
        }

        var tri = this.tris[index];

        // transform triangle vertices by world-view transform
        var v0 = params.worldViewMatrix.transform(tri.v0.x, tri.v0.y, tri.v0.z, 1);
        var v1 = params.worldViewMatrix.transform(tri.v1.x, tri.v1.y, tri.v1.z, 1);
        var v2 = params.worldViewMatrix.transform(tri.v2.x, tri.v2.y, tri.v2.z, 1);

        var result = rayTriangleIntersection(params.rayOrigin, params.rayDir, v0, v1, v2, false,
                                            (params.doubleSided ? false : true));
        if (result.result)
        {
            if (result.t >= params.nearDistance &&
                result.t <= params.farDistance && 
                result.t <  params.intersectRecord.distance)
            {
				var pointModel = new Vector3D(tri.v0.x * (1 - result.u - result.v) + tri.v1.x * result.u + tri.v2.x * result.v,
				                              tri.v0.y * (1 - result.u - result.v) + tri.v1.y * result.u + tri.v2.y * result.v,
				                              tri.v0.z * (1 - result.u - result.v) + tri.v1.z * result.u + tri.v2.z * result.v);				
				var pointWorld = params.worldMatrix.transform(pointModel.x, pointModel.y, pointModel.z, 1);
				var pointView = params.worldViewMatrix.transform(pointModel.x, pointModel.y, pointModel.z, 1);

				// test for intersection point on negative side of clip plane(s), if any (would hence be clipped)
				for (var c=0; c < params.clipPlanes.length; c++)
				{
					if (pointOnNegativeSideOfPlane(pointWorld, params.clipPlanes[c]))
					{
						// mark triangle as tested
						this.visited[index] = true;
						break;
					}
				}
				if (this.visited[index]) // clipped by clip plane(s)
				{
					continue;
				}

                params.intersectRecord.distance = result.t;
				params.intersectRecord.pointModel.copy(pointModel);
                params.intersectRecord.pointWorld.copy(pointWorld);
                params.intersectRecord.pointView.copy(pointView);
                params.intersectRecord.triIndex = index;
                params.intersects = true;
            }
        }

        // mark triangle as tested
        this.visited[index] = true;
    }
    
    return params.intersects;
}

Octree.prototype = new SphereTree();
Octree.prototype.constructor = Octree;

function Octree()
{
    SphereTree.call(this);
}

Octree.prototype.buildTree = function(levels)
{
    if (levels < 0) return;
    
    // define root sphere
    var root = new SphereTreeNode();
    
    // sphere center is the midpoint of min/max extents
    root.sphere.center.copy(midpoint(this.min, this.max));
    root.sphere.xcenter.copy(root.sphere.center);

    // sphere radius is the distance between the midpoint of min/max extents and min/max extent
    root.sphere.radius = distanceBetween(root.sphere.center, this.max);
    root.sphere.xradius = root.sphere.radius;
    
    // set triIndices
    root.triIndices.length = this.tris.length;
    for (var i=0; i < this.tris.length; i++)
    {
        root.triIndices[i] = i;
    }

    // build subsequent levels (if requested) 
    if (levels > 0)
    {
        this.buildTreeLevels(levels, this.min, this.max, root, root.triIndices);
    }

    this.root = root;    
}

Octree.prototype.buildTreeLevels = function(levels, min, max, root, triIndices)
{
    if (root.level == levels)
    {
        // requested levels have been generated
        return;
    }
    
    // define 8 equal sub-regions occupying the span from min to max
    var mid = new Vector3D(min.x + ((max.x - min.x) / 2), 
                           min.y + ((max.y - min.y) / 2),
                           min.z + ((max.z - min.z) / 2));
                           
    var regions = new Array(8);
    regions[0] = new Region(min.x, min.y, min.z, mid.x, mid.y, mid.z);
    regions[1] = new Region(mid.x, min.y, min.z, max.x, mid.y, mid.z);
    regions[2] = new Region(min.x, min.y, mid.z, mid.x, mid.y, max.z);
    regions[3] = new Region(mid.x, min.y, mid.z, max.x, mid.y, max.z);
    regions[4] = new Region(min.x, mid.y, min.z, mid.x, max.y, mid.z);
    regions[5] = new Region(mid.x, mid.y, min.z, max.x, max.y, mid.z);
    regions[6] = new Region(min.x, mid.y, mid.z, mid.x, max.y, max.z);
    regions[7] = new Region(mid.x, mid.y, mid.z, max.x, max.y, max.z);
    
    // for each sub-region containing geometry, create a bounding sphere for the sub-region, 
    // add to the list of the root sphere node's children, and recursively call for the child 
    // sub-region
    for (var i=0; i < 8; i++)
    {
        var triIndicesContainedByRegion = regions[i].containsGeometry(this.tris, triIndices);
        if (triIndicesContainedByRegion.length > 0)
        {
            // create sphere node
            var node = new SphereTreeNode();
          
            // set level
            node.level = root.level + 1;

            // set center
            node.sphere.center.copy(midpoint(regions[i].min, regions[i].max));
            node.sphere.xcenter.copy(node.sphere.center);

            // set radius
            node.sphere.radius = distanceBetween(node.sphere.center, regions[i].max);
            node.sphere.xradius = node.sphere.radius;
            
            // set triIndices
            node.triIndices = triIndicesContainedByRegion.slice();

            // add to root sphere node
            root.addChild(node);

            // recurse on sub-region
            this.buildTreeLevels(levels, regions[i].min, regions[i].max, node, node.triIndices);
        }
    }
}

function rayPick(tree,
                 rayOrigin, 
                 rayDir,
                 nearDistance,
                 farDistance,
                 worldMatrix,
                 viewMatrix,
                 scale,
                 doubleSided,
			     clipPlanes)
{
	var params = new RayIntersectParams(rayOrigin, rayDir, nearDistance, farDistance, worldMatrix, viewMatrix, scale, doubleSided, clipPlanes);
    tree.rayIntersectsTree(params);
    if (params.intersects == true)
    {
        return params.intersectRecord;
    }
    
    return null;
}