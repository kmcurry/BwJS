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
    Bone                        :33,
    SnapConnector               :34,
    SnapConnectors              :35,
    SocketConnector             :36,
    PlugConnector               :37,
    SphereAttr                  :38,
    PhysicalPropertiesAttr      :39,
    
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
    Cube                        :1032,
    Bone                        :1033,
    Selector                    :1034,
    ScreenRect                  :1035,
    
    Evaluator                   :1100,
    SceneInspector              :1101,
    KeyframeInterpolator        :1102,
    BBoxLocator                 :1103,
    ArcballInspector            :1104,
    MapProjectionCalculator     :1105,
    ObjectInspector             :1106,
    MultiTargetObserver		:1107,
    ObjectMover	 		:1108,
    AnimalMover			:1109, 
    WalkSimulator               :1110,
    MorphEffector               :1111,
    BoneEffector                :1112,
    PhysicsSimulator            :1113,
    Evaluator_End               :1199, // all evaluator types must be given a type between Evaluator and Evaluator_End

    Node_End                    :1999,

    Directive                   :2000,
    UpdateDirective             :2001,
    RenderDirective             :2002,
    RayPickDirective            :2003,
    BBoxDirective               :2004,
    SerializeDirective          :2005,
    CollideDirective            :2006,
    HighlightDirective          :2007,
    Directive_End               :2999,
    
    Command                     :3000,
    CommandSequence             :3001,
    AppendNode                  :3002,
    AttributeTrigger            :3003,
    AutoInterpolate             :3004,
    Locate                      :3005,
    Play                        :3006,
    Pause                       :3007,
    Remove                      :3008,
    ScreenCapture               :3009,
    Serialize                   :3010,
    Set                         :3011,
    Stop                        :3012,
    ConnectAttributes           :3013,
    DisconnectAttributes        :3014,
    Export                      :3015,
    Morph                       :3016,
    SnapTo                      :3017,
    Command_End                 :3999,

    DeviceHandler               :4000,
    MouseHandler                :4001,
    KeyboardHandler             :4002,
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