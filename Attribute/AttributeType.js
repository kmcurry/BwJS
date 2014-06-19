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
    
    Node                        :31,
    
    ParentableMotionElement     :32,
    Camera                      :33,
    PerspectiveCamera           :34,
    OrthographicCamera          :35,
    Light                       :36,
    DirectionalLight            :37,
    PointLight                  :38,
    SpotLight                   :39, 
    GlobalIllumination          :40,           
    
    Material                    :41,
    Texture                     :42,
    
    RenderableElement           :43,
    Geometry                    :44,
    VertexGeoemtry              :45,
    TriList                     :46,
    
    Group                       :47,
    Isolator                    :48,
    
    Dissolve                    :49,
    
    Transform                   :50,
    
    QuaternionRotate            :51,
    Scale                       :52,
    Rotate                      :53,
    Translate                   :54,
    
    Model                       :55,
    Surface                     :56,
    MediaTexture                :57,
    NullObject                  :58,
    
    Label                       :59,
    HTMLLabel                   :60,
    BalloonTipLabel             :61,
    
    PathTrace                   :62,
    
    Directive                   :63,
    UpdateDirective             :64,
    RenderDirective             :65,
    RayPickDirective            :66,
    BBoxDirective               :67,
    SerializeDirective          :68,
    
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

var eAttrElemType = {
    // unknown
    eAttrElemType_Unknown               :0,	///

    // standard C-types
    eAttrElemType_Int                   :1,							///
    eAttrElemType_UnsignedInt           :2,					///
    eAttrElemType_Char                  :3,							///
    eAttrElemType_UnsignedChar          :4,					///
    eAttrElemType_Float                 :5,						///
    eAttrElemType_Double                :6,						///

    // attribute
    eAttrElemType_Attribute             :7,					///

    // user-defined
    eAttrElemType_UserDefined           :0x000000FF,		///
    
    // force enumeration to 32-bits
    eAttrElemType_FORCE_DWORD           :0x7FFFFFFF		///
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