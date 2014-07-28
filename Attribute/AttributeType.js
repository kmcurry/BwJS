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
    Vector2DAttr                :28,
    Vector3DAttr                :29,
    ViewportAttr                :30,
    ViewVolumeAttr              :31,
    RenderableElementStyleAttr  :32,
    
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
    
    Evaluator                   :1100,
    SceneInspector              :1101,
    KeyframeInterpolator        :1102,
    BBoxLocator                 :1103,
    ArcballInspector            :1104,
    MapProjectionCalculator     :1105,
    ObjectInspector             :1106,
    MultiTargetObserver			:1107,   
    Evaluator_End               :1199, // all evaluator types must be given a type between Evaluator and Evaluator_End

    Node_End                    :1999,

	Directive                   :2000,
    UpdateDirective             :2001,
    RenderDirective             :2002,
    RayPickDirective            :2003,
    BBoxDirective               :2004,
    SerializeDirective          :2005,
    Directive_End               :2999,
    
    Command                     :3000,
    CommandSequence             :3001,
    AppendNode                  :3002,
    AttributeTrigger            :3003,
    AutoInterpolate             :3004,
    Locate                      :3005,
    Play                        :3006,
    Remove                      :3007,
    Serialize                   :3008,
    Set                         :3009,
    Stop                        :3010,
    ConnectAttributes           :3011,
    Command_End                 :3999,

    DeviceHandler               :4000,
    MouseHandler                :4001,
    DeviceHandler_End           :4999,
    
    UserDefined                 :5000
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