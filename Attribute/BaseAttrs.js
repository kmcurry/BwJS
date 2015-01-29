BooleanAttr.prototype = new Attribute();
BooleanAttr.prototype.constructor = BooleanAttr;

function BooleanAttr(value)
{
    Attribute.call(this);
    this.className = "BooleanAttr";
    this.attrType = eAttrType.BooleanAttr;
    this.setValue(value || false);
}

BooleanAttr.prototype.clone = function()
{
    var attr = new BooleanAttr();
    attr.setValue(this.values);
    return attr;
}

BooleanAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return values[0];
}

BooleanAttr.prototype.setValueDirect = function(value, params)
{
    var values = [value];
    this.setValue(value, params);
}

ColorAttr.prototype = new Attribute();
ColorAttr.prototype.constructor = ColorAttr;

function ColorAttr(r, g, b, a)
{
    Attribute.call(this);
    this.className = "ColorAttr";
    this.attrType = eAttrType.ColorAttr;
    var values = [ r || 0, g || 0, b || 0, a || 0 ];
    this.setValue(values);
}

ColorAttr.prototype.clone = function()
{
    var attr = new ColorAttr();
    attr.setValue(this.values);
    return attr;
}

ColorAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return { r: values[0], g: values[1], b: values[2], a: values[3] };
}

ColorAttr.prototype.setValueDirect = function(r, g, b, a, params)
{
    var values = [ r, g, b, a ];
    this.setValue(values, params);
}

Matrix4x4Attr.prototype = new Attribute();
Matrix4x4Attr.prototype.constructor = Matrix4x4Attr;

function Matrix4x4Attr(_11, _12, _13, _14,
                       _21, _22, _23, _24,
                       _31, _32, _33, _34,
                       _41, _42, _43, _44)
{
    Attribute.call(this);
    this.className = "Matrix4x4Attr";
    this.attrType = eAttrType.Matrix4x4Attr;
    var values = [ _11 || 1, _12 || 0, _13 || 0, _14 || 0,
                   _21 || 0, _22 || 1, _23 || 0, _24 || 0,
                   _31 || 0, _32 || 0, _33 || 1, _34 || 0,
                   _41 || 0, _42 || 0, _43 || 0, _44 || 1 ];
    this.setValue(values);
}

Matrix4x4Attr.prototype.clone = function()
{
    var attr = new Matrix4x4Attr();
    attr.setValue(this.values);
    return attr;
}

Matrix4x4Attr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    var result = new Matrix4x4();
    result.loadArray(values);
    return result;
}

Matrix4x4Attr.prototype.setValueDirect = function(matrix, params)
{
    var values = [ matrix._11, matrix._12, matrix._13, matrix._14,
                   matrix._21, matrix._22, matrix._23, matrix._24,
                   matrix._31, matrix._32, matrix._33, matrix._34,
                   matrix._41, matrix._42, matrix._43, matrix._44 ];
    this.setValue(values, params);
}

NumberArrayAttr.prototype = new Attribute();
NumberArrayAttr.prototype.constructor = NumberArrayAttr;

function NumberArrayAttr()
{
    Attribute.call(this);
    this.className = "NumberArrayAttr";
    this.attrType = eAttrType.NumberArrayAttr;
}

NumberArrayAttr.prototype.clone = function()
{
    var attr = new NumberArrayAttr();
    attr.setValue(this.values);
    return attr;
}

NumberArrayAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return values;
}

NumberArrayAttr.prototype.setValueDirect = function(values, params)
{
    this.setValue(values, params);
}

NumberAttr.prototype = new Attribute();
NumberAttr.prototype.constructor = NumberAttr;

function NumberAttr(value)
{
    Attribute.call(this);
    this.className = "NumberAttr";
    this.attrType = eAttrType.NumberAttr;
    this.setValue(value || 0);
}

NumberAttr.prototype.clone = function()
{
    var attr = new NumberAttr();
    attr.setValue(this.values);
    return attr;
}

NumberAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return values[0];
}

NumberAttr.prototype.setValueDirect = function(value, params)
{
    var values = [value];
    this.setValue(values, params);
}

PulseAttr.prototype = new BooleanAttr();
PulseAttr.prototype.constructor = PulseAttr;

function PulseAttr()
{
    BooleanAttr.call(this);
    this.className = "PulseAttr";
    this.attrType = eAttrType.PulseAttr;
    
    this.setTransient(true); // don't serialize because by definition this attribute doesn't hold "true" (it pulses)
}

PulseAttr.prototype.clone = function()
{
    var attr = new PulseAttr();
    attr.setValue(this.values);
    return attr;
}

PulseAttr.prototype.pulse = function()
{
    this.setValueDirect(true);
    this.setValueDirect(false);
}

QuaternionAttr.prototype = new Attribute();
QuaternionAttr.prototype.constructor = QuaternionAttr;

function QuaternionAttr(w, x, y, z)
{
    Attribute.call(this);
    this.className = "QuaternionAttr";
    this.attrType = eAttrType.QuaternionAttr;
    var values = [ w || 1, x || 0, y || 0, z || 0 ];
    this.setValue(values);
}

QuaternionAttr.prototype.clone = function()
{
    var attr = new QuaternionAttr();
    attr.setValue(this.values);
    return attr;
}

QuaternionAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    var result = new Quaternion();
    result.loadArray(values);
    return result;
}

QuaternionAttr.prototype.setValueDirect = function(quaternion, params)
{
    var values = [ quaternion.w, quaternion.x, quaternion.y, quaternion.z ];
    this.setValue(values, params);
}

ReferenceAttr.prototype = new Attribute();
ReferenceAttr.prototype.constructor = ReferenceAttr;

function ReferenceAttr(value)
{
    Attribute.call(this);
    this.className = "ReferenceAttr";
    this.attrType = eAttrType.ReferenceAttr;
    this.setValue(value || null);
}

ReferenceAttr.prototype.clone = function()
{
    var attr = new ReferenceAttr();
    attr.setValue(this.values);
    return attr;
}

ReferenceAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return values[0];
}

ReferenceAttr.prototype.setValueDirect = function(value, params)
{
    var values = [value];
    this.setValue(value, params);
}

StringAttr.prototype = new Attribute();
StringAttr.prototype.constructor = StringAttr;

function StringAttr(value)
{
    Attribute.call(this);
    this.className = "StringAttr";
    this.attrType = eAttrType.StringAttr;
    this.setValue(value || "");
}

StringAttr.prototype.clone = function()
{
    var attr = new StringAttr();
    attr.setValue(this.values);
    return attr;
}

StringAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return values;
}

StringAttr.prototype.setValueDirect = function(value, params)
{
    this.setValue(value, params);
}

StringAttr.prototype.setValue = function(values, params)
{
    this.values = [];
    
    // call base-class implementation
    Attribute.prototype.setValue.call(this, values, params);
}

StringAttrAllocator.prototype = new Allocator();
StringAttrAllocator.prototype.constructor = StringAttrAllocator;

function StringAttrAllocator()
{
}

StringAttrAllocator.prototype.allocate = function()
{
    return new StringAttr();
}

TernaryAttr.prototype = new NumberAttr();
TernaryAttr.prototype.constructor = TernaryAttr;

function TernaryAttr(value)
{
    NumberAttr.call(this, value);
    this.className = "TernaryAttr";
    this.attrType = eAttrType.TernaryAttr;
    
    // TODO: this.setRange(-1, 1);
}

TernaryAttr.prototype.clone = function()
{
    var attr = new TernaryAttr();
    attr.setValue(this.values);
    return attr;
}

Vector2DAttr.prototype = new Attribute();
Vector2DAttr.prototype.constructor = Vector2DAttr;

function Vector2DAttr(x, y)
{
    Attribute.call(this);
    this.className = "Vector2DAttr";
    this.attrType = eAttrType.Vector2DAttr;
    var values = [ x || 0, y || 0 ];
    this.setValue(values);
}

Vector2DAttr.prototype.clone = function()
{
    var attr = new Vector2DAttr();
    attr.setValue(this.values);
    return attr;
}

Vector2DAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return { x: values[0], y: values[1] };
}

Vector2DAttr.prototype.setValueDirect = function(x, y, params)
{
    var values = [ x, y ];
    this.setValue(values, params);
}

Vector3DAttr.prototype = new Attribute();
Vector3DAttr.prototype.constructor = Vector3DAttr;

function Vector3DAttr(x, y, z)
{
    Attribute.call(this);
    this.className = "Vector3DAttr";
    this.attrType = eAttrType.Vector3DAttr;
    var values = [ x || 0, y || 0, z || 0 ];
    this.setValue(values);
}

Vector3DAttr.prototype.clone = function()
{
    var attr = new Vector3DAttr();
    attr.setValue(this.values);
    return attr;
}

Vector3DAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return { x: values[0], y: values[1], z: values[2] };
}

Vector3DAttr.prototype.setValueDirect = function(x, y, z, params)
{
    var values = [ x, y, z ];
    this.setValue(values, params);
}

Vector3DAttr.prototype.isZero = function()
{
	var values = [];
    this.getValue(values);
    return (values[0] == 0 && values[1] == 0 && values[2] == 0) ? true : false;
}

ViewportAttr.prototype = new Attribute();
ViewportAttr.prototype.constructor = ViewportAttr;

function ViewportAttr(x, y, width, height)
{
    Attribute.call(this);
    this.className = "ViewportAttr";
    this.attrType = eAttrType.ViewportAttr;
    var values = [ x || 0, y || 0, width || 0, height || 0 ];
    this.setValue(values);
}

ViewportAttr.prototype.clone = function()
{
    var attr = new ViewportAttr();
    attr.setValue(this.values);
    return attr;
}

ViewportAttr.prototype.getValueDirect = function()
{
    var values = [];
    this.getValue(values);
    return { x: values[0], y: values[1], width: values[2], height: values[3] };
}

ViewportAttr.prototype.setValueDirect = function(x, y, width, height, params)
{
    var values = [ x, y, width, height ];
    this.setValue(values, params);
}
