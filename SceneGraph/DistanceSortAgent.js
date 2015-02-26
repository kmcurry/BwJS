function DistanceSortRec(distance,
                         geometry,
                         dissolve)
{
    this.distance = distance || 0;
    this.geometry = geometry || null;
    this.dissolve = dissolve || 0;
    this.stateRec = null;
}

DistanceSortAgent.prototype = new Agent();
DistanceSortAgent.prototype.constructor = DistanceSortAgent;

function DistanceSortAgent()
{
    Agent.call(this);
    this.className = "DistanceSortAgent";

    this.graphMgr = null;
    this.sortRecs = [];
}

DistanceSortAgent.prototype.setGraphMgr = function(graphMgr)
{
    this.graphMgr = graphMgr;
}

DistanceSortAgent.prototype.isEmpty = function()
{
    return this.sortRecs.length == 0;
}

DistanceSortAgent.prototype.addGeometry = function(geometry, min, max, dissolve)
{
    var rec = new DistanceSortRec();

    rec.geometry = geometry;
    rec.dissolve = dissolve;
    rec.stateRec = GetCurrentState(this.graphMgr);

    // calculate distance from camera
    var worldViewMatrix = new Matrix4x4();
    worldViewMatrix.loadMatrix(this.graphMgr.renderContext.worldMatrixStack.top());

    // initialize
    rec.distance = FLT_MAX;

    // take smallest z of worldView-transformed endpoints of the geometry's bbox as distance from camera
    var p;
    for (var i = 0; i < 8; i++)
    {
        switch (i)
        {
            case 0: p = new Vector3D(max.x, max.y, max.z); break;
            case 1: p = new Vector3D(max.x, max.y, min.z); break;
            case 2: p = new Vector3D(max.x, min.y, max.z); break;
            case 3: p = new Vector3D(max.x, min.y, min.z); break;
            case 4: p = new Vector3D(min.x, max.y, max.z); break;
            case 5: p = new Vector3D(min.x, max.y, min.z); break;
            case 6: p = new Vector3D(min.x, min.y, max.z); break;
            case 7: p = new Vector3D(min.x, min.y, min.z); break;
        }

        p = worldViewMatrix.transform(p.x, p.y, p.z, 1);

        rec.distance = Math.min(p.z, rec.distance);
    }

    // add to list
    this.sortRecs.push(rec);
    
}

DistanceSortAgent.prototype.clear = function()
{
    this.sortRecs.length = 0;
}

DistanceSortAgent.prototype.sort = function()
{
    this.sortRecs.sort(DistanceSortAgent_CompareSortRecs);
}

DistanceSortAgent.prototype.draw = function()
{
    if (this.sortRecs.length == 0)
    {
        return;
    }

    // push state
    var saveState = GetCurrentState(this.graphMgr);

    // disable writing to the depth buffer
    // technique described in the OpenGL Programming Guide, 2nd edition, pp. 222-223
    //this.graphMgr.renderContext.disable(eRenderMode.DepthBufferWrite);

    for (var i = 0; i < this.sortRecs.length; i++)
    {
        // set state according to sort rec
        SetCurrentState(this.graphMgr, this.sortRecs[i].stateRec);

        // draw
        this.sortRecs[i].geometry.draw(this.sortRecs[i].dissolve);

        // pop clip plane state
        // NOTE: D3D is having issues with clip plane states when more than 1 sort rec was present
        this.graphMgr.renderState.setState(RENDERSTATE_CLIP_PLANE_BIT, saveState.renderStateRec);
    }

    // restore depth buffer write state
    this.graphMgr.renderContext.enable(eRenderMode.DepthBufferWrite);

    // pop state
    SetCurrentState(this.graphMgr, saveState);
}

function DistanceSortAgent_CompareSortRecs(rec1, rec2)
{
    return rec2.distance - rec1.distance;
}