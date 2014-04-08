function worldUnitsPerPixelPersp(viewport, zoom, viewSpace_Z)
{
    // get vertical field of view in radians
    var fovY = 2 * Math.atan2(1, zoom);

    // get horizontal field of view in radians
    var fovX = 2 * Math.atan(viewport.width / viewport.height * Math.tan(fovY / 2));

    // determine the width of the visible portion of the x axis on the 
    // clipping plane at viewSpace_Z
    var clipPlaneWidth  = Math.tan(fovX / 2) * viewSpace_Z * 2;

    // determine the height of the visible portion of the y axis on the
    // clipping plane at viewSpace_Z
    var clipPlaneHeight  = Math.tan(fovY / 2) * viewSpace_Z * 2;

    // determine the per-pixel clipPlaneWidth and clipPlaneHeight
    var x = clipPlaneWidth  / viewport.width;
    var y = clipPlaneHeight / viewport.height;
    
    return { x: x, y: y };
}

function worldUnitsPerPixelOrtho(viewport, width)
{
    // calculate height
    var height = width * (viewport.height / viewport.width);

    // determine the per-pixel width and height
    var x = width  / viewport.width;
    var y = height / viewport.height;
    
    return { x: x, y: y };
}

function toScreenSpace(world, view, proj, viewport)
{
    // transform to view space
    var screen = view.transformw(world.x, world.y, world.z, 1);

    // transform to projection space
	screen = proj.transformw(screen.x, screen.y, screen.z, screen.w);

    if (screen.w == 0)
    {
        return { x: -Infinity, y: -Infinity, z: -Infinity };
    }

    // normalize to [-1, 1]
    // (if x or y is outside the range (-w, w), the screen coordinate(s) will be 
    // outside the viewport
    screen.x /= screen.w;
    screen.y /= screen.w;
    //screen.z /= screen.w;

    // clip to viewport
    screen.x = viewport.x + viewport.width  - ((-screen.x + 1) * viewport.width  / 2);
    screen.y = viewport.y + viewport.height - (( screen.y + 1) * viewport.height / 2);
	screen.z = 0;
	
	return { x: screen.x, y: screen.y, z: screen.z };    
} 