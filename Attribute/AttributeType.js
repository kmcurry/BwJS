var eAttrType = {
    Unknown                     :-1,
    
    Attribute                   :0,
    
    AttributeContainer          :0,
    
    AttributeVector             :0,
    
    AttributeFactory            :0,
    
    AttributeRegistry           :0,
    
    BalloonTipLabelStyleAttr    :0,
    BBoxAttr                    :0,
    BooleanAttr                 :0,
    ColorAttr                   :0,
    FontStyleAttr               :0,
    IconStyleAttr               :0,
    ImageAttr                   :0,
    KeyframeAttr                :0,
    KeyframesAttr               :0,
    LabelStyleAttr              :0,
    NumberArrayAttr             :0,
    NumberAttr                  :0,
    Matrix4x4Attr               :0,
    PlaneAttr                   :0,
    PulseAttr                   :0,
    RectAttr                    :0,
    ReferenceAttr               :0,
    StringAttr                  :0,
    StyleAttr                   :0,
    StylesAttr                  :0,
    StyleMapAttr                :0,
    StylesMapAttr               :0,
    Vector3DAttr                :0,
    ViewportAttr                :0,
    ViewVolumeAttr              :0,
    
    Node                        :0,
    
    ParentableMotionElement     :0,
    Camera                      :0,
    PerspectiveCamera           :0,
    OrthographicCamera          :0,
    Light                       :0,
    DirectionalLight            :0,
    PointLight                  :0,
    SpotLight                   :0, 
    GlobalIllumination          :0,           
    
    Material                    :0,
    Texture                     :0,
    
    RenderableElement           :0,
    Geometry                    :0,
    VertexGeoemtry              :0,
    TriList                     :0,
    
    Group                       :0,
    Isolator                    :0,
    
    Dissolve                    :0,
    
    Transform                   :0,
    
    QuaternionRotate            :0,
    Scale                       :0,
    Rotate                      :0,
    Translate                   :0,
    
    Model                       :0,
    Surface                     :0,
    MediaTexture                :0,
    NullObject                  :0,
    
    Label                       :0,
    
    PathTrace                   :0,
    
    Directive                   :0,
    UpdateDirective             :0,
    RenderDirective             :0,
    RayPickDirective            :0,
    BBoxDirective               :0,
    SerializeDirective          :0,
    
    Evaluator                   :1000,
    SceneInspector              :1001,
    KeyframeInterpolator        :1002,
    BBoxLocator                 :1003,
    ArcballInspector            :1004,
    MapProjectionCalculator     :1005,
    ObjectInspector             :1006,
    
    Evaluator_End               :1999, // all evaluator types must be given a type between Evaluator and Evaluator_End
    
    UserDefined                 :2000
};

function enumerateAttributeTypes()
{
    var count = 0; 
    for (var i in eAttrType)
    {
        if (eAttrType[i] == 0)
            eAttrType[i] = count++;
    }
}