var eAttrType = {
    Unknown                     :-1,
    
    Attribute                   :0,
    
    AttributeContainer          :1,
    
    AttributeVector             :2,
    
    AttributeFactory            :3,
    
    AttributeRegistry           :4,
    
    BalloonTipLabelStyleAttr    :5,
    BBoxAttr                    :6,
    BooleanAttr                 :7,
    ColorAttr                   :8,
    FontStyleAttr               :9,
    IconStyleAttr               :10,
    ImageAttr                   :11,
    KeyframeAttr                :12,
    KeyframesAttr               :13,
    LabelStyleAttr              :14,
    HTMLLabelStyleAttr          :15,
    NumberArrayAttr             :16,
    NumberAttr                  :17,
    Matrix4x4Attr               :18,
    PlaneAttr                   :19,
    PulseAttr                   :20,
    RectAttr                    :21,
    ReferenceAttr               :22,
    StringAttr                  :23,
    StyleAttr                   :24,
    StylesAttr                  :25,
    StyleMapAttr                :26,
    StylesMapAttr               :27,
    Vector3DAttr                :28,
    ViewportAttr                :29,
    ViewVolumeAttr              :30,
    RenderableElementStyleAttr  :31,
    
    Node                        :1000,
       
    ParentableMotionElement     :1001,
    Camera                      :1002,
    PerspectiveCamera           :1003,
    OrthographicCamera          :1004,
    Light                       :1005,
    DirectionalLight            :1006,
    PointLight                  :1007,
    SpotLight                   :1008, 
    GlobalIllumination          :1009,           
    Material                    :1010,
    Texture                     :1011, 
    RenderableElement           :1012,
    Geometry                    :1013,
    VertexGeoemtry              :1014,
    TriList                     :1015, 
    Group                       :1016,
    Isolator                    :1017,
    Dissolve                    :1018,  
    Transform                   :1019,   
    QuaternionRotate            :1020,
    Scale                       :1021,
    Rotate                      :1022,
    Translate                   :1023,   
    Model                       :1024,
    Surface                     :1025,
    MediaTexture                :1026,
    NullObject                  :1027,   
    Label                       :1028,
    HTMLLabel                   :1029,
    BalloonTipLabel             :1030, 
    PathTrace                   :1031,
    
    Directive                   :1100,
    UpdateDirective             :1101,
    RenderDirective             :1102,
    RayPickDirective            :1103,
    BBoxDirective               :1104,
    SerializeDirective          :1105,
    Directive_End               :1199,
    
    Evaluator                   :1200,
    SceneInspector              :1201,
    KeyframeInterpolator        :1202,
    BBoxLocator                 :1203,
    ArcballInspector            :1204,
    MapProjectionCalculator     :1205,
    ObjectInspector             :1206,
    MultiTargetObserver			:1207,   
    Evaluator_End               :1299, // all evaluator types must be given a type between Evaluator and Evaluator_End

    Node_End                    :1999,

    Command                     :4000,
    CommandSequence             :4001,
    AppendNode                  :4002,
    AttributeTrigger            :4003,
    AutoInterpolate             :4004,
    Locate                      :4005,
    Play                        :4006,
    Remove                      :4007,
    Serialize                   :4008,
    Set                         :4009,
    Stop                        :4010,
    Command_End                 :4999,

    DeviceHandler               :5000,
    MouseHandler                :5001,
    DeviceHandler_End           :5999,
    
    UserDefined                 :6000
};

var eAttrElemType = {
    // unknown
    Unknown                     :-1,

    // attribute
    Attribute                   :0,
    
    // standard C-types
    Int                         :1,
    UnsignedInt                 :2,
    Char                        :3,
    UnsignedChar                :4,
    Float                       :5,
    Double                      :6,

    // user-defined
    UserDefined                 :100
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

function enumerateAttributeElementTypes()
{
    var count = 0;
    for (var i in eAttrElemType)
    {
        if (eAttrElemType[i] == 0)
            eAttrElemType[i] = count++;
    }
}