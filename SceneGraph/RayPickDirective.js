RayPickParams.prototype = new DirectiveParams();
RayPickParams.prototype.constructor = RayPickParams();

function RayPickParams()
{
    DirectiveParams.call(this);
    
    /// camera to perform selection testing with
    this.camera = null;
    /// current camera
    this.currentCamera = null;
    /// current viewport
    this.viewport = new Viewport();
    /// click point
    this.clickPoint = new Vector2D();
    /// origin of the ray
    this.rayOrigin = new Vector3D();
    /// direction of the ray
    this.rayDir = new Vector3D();
    /// camera near distance
    this.nearDistance = 0;
    /// camera far distance
    this.farDistance = 0;
    /// current view matrix
    this.viewMatrix = new Matrix4x4();
    /// current world matrix
    this.worldMatrix = new Matrix4x4();
    /// current sector origin
    this.sectorOrigin = new Vector3D();
    /// current material double-sided setting 
    this.doubleSided = false;
    /// current material opacity setting
    this.opacity = 0;
    /// current dissolve
    this.dissolve = 0;
    /// current clip plane(s)
    this.clipPlanes = [];
}

function RayPickRecord(path, intersectRecord, camera)
{
    /// the path of the picked geometry
    this.path = path.copy();
    /// intersection record
    this.intersectRecord = intersectRecord;
    /// the camera viewing the picked geometry
    this.camera = camera;
}

RayPickDirective.prototype = new SGDirective();
RayPickDirective.prototype.constructor = RayPickDirective;

function RayPickDirective()
{
    SGDirective.call(this);
    this.className = "RayPickDirective";
    this.attrType = eAttrType.RayPickDirective;
    
    this.name.setValueDirect("RayPickDirective");
    
    this.picked = [];
    
    this.viewport = new ViewportAttr();
    this.camera = new ReferenceAttr(null);
    this.clickPoint = new Vector2DAttr();
    
    this.registerAttribute(this.viewport, "viewport");
    this.registerAttribute(this.camera, "camera");
    this.registerAttribute(this.clickPoint, "clickPoint");
}

RayPickDirective.prototype.execute = function(root)
{
    root = root || this.rootNode.getValueDirect();
    
    // clear previous picks
    this.picked.length = 0;
    
    // pick
    var params = new RayPickParams();
    params.directive = this;
    params.camera = this.camera.getValueDirect();
    params.viewport.loadViewport(this.viewport.getValueDirect());
    params.clickPoint.copy(this.clickPoint.getValueDirect());

    root.apply("rayPick", params, true);
}

RayPickDirective.prototype.addPickRecord = function(record)
{
    // add to picked list according to distance
    for (var i=0; i < this.picked.length; i++)
    {
        if (this.picked[i].intersectRecord.distance > record.intersectRecord.distance)
        {
            break;
        }
    }
    this.picked.splice(i, 0, record);
}





