var eEventType = {
    Unknown                     :-1,
    
    Render_First                :0,
    RenderBegin                 :1,
    RenderEnd                   :2,
    Render_End                  :9,
    
    Mouse_First                 :100,
    MouseMove                   :101,
    MouseDown                   :102,
    MouseLeftDown               :103,
    MouseMiddleDown             :104,
    MouseRightDown              :105,
    MouseAllDown                :106,
    MouseBothDown               :107,
    MouseWheelDown              :108,
    MouseUp                     :109,
    MouseLeftUp                 :110,
    MouseRightUp                :111,
    MouseMiddleUp               :112,
	MouseWheelUp                :113,
	MouseLeftClick              :114,
	MouseMiddleClick            :115,
	MouseRightClick             :116,
    MouseLeftDblClick           :117,
	MouseMiddleDblClick         :118,
    MouseRightDblClick          :119,
    MouseDrag                   :120,
    MouseWheelForward           :121,
    MouseWheelBackward          :122,
	MouseHover                  :123,
	MouseLeave                  :124,	// fires when the mouse leaves the client area of the window
	MouseOver                   :125,	// fires when the mouse is moved onto an element
	MouseOut                    :126,	// fires when the mouse is moved off an element
    Mouse_Last                  :199,

    Key_First                   :200,
    Key_Down                    :201,
    Key_Up                      :202,
    Key_Last                    :299,
    
    Element_First               :700,
    ElementSelected             :701,
    ElementUnselected           :702,
    ElementFocus                :703,
    ElementBlur                 :704,
    Element_Last                :799,
    
    UserDefined                 :2000
};

var eEventNameMap = {
    "MButton1"                  : eEventType.MouseLeftDown,
    "MButton1.Down"             : eEventType.MouseLeftDown,
    "MButton2"                  : eEventType.MouseMiddleDown,
    "MButton2.Down"             : eEventType.MouseMiddleDown,
    "MButton3"                  : eEventType.MouseRightDown,
    "MButton3.Down"             : eEventType.MouseRightDown,
    "MButton1+MButton2.Down"    : eEventType.MouseBothDown,
	"MButton2+MButton3.Down"    : eEventType.MouseBothDown,
	"MButton1+MButton3.Down"    : eEventType.MouseBothDown,
    "MButton1.Click"            : eEventType.MouseLeftClick,
	"MButton1.DoubleClick"      : eEventType.MouseLeftDblClick,
	"MButton1.Up"               : eEventType.MouseLeftUp,
    "MButton2.Click"            : eEventType.MouseMiddleClick,
	"MButton2.DoubleClick"      : eEventType.MouseMiddleDblClick,
	"MButton2.Up"               : eEventType.MouseMiddleUp,
	"MButton3.Click"            : eEventType.MouseRightClick,
	"MButton3.DoubleClick"      : eEventType.MouseRightDblClick,
	"MButton3.Up"               : eEventType.MouseRightUp,
    "MWheel"                    : eEventType.MouseWheelDown,
	"MWheel.Down"               : eEventType.MouseWheelDown,
    "MWheel.Click"              : eEventType.MouseWheelUp,
	"MWheel.Up"                 : eEventType.MouseWheelUp,
	"Mouse.Move"                : eEventType.MouseMove,
	"Mouse.Hover"               : eEventType.MouseHover,
	"Mouse.Leave"               : eEventType.MouseLeave,
	"Mouse.Over"                : eEventType.MouseOver,
	"Mouse.Out"                 : eEventType.MouseOut,
	"Element.Selected"          : eEventType.ElementSelected,
	"Element.Unselected"        : eEventType.ElementUnselected,
	"Element.Focus"             : eEventType.ElementFocus,
	"Element.Blur"              : eEventType.ElementBlur
};

function getEventTypeByName(name)
{
    var type = eEventNameMap[name];
    
    if (type == undefined)
    {
        // TODO  
        type = eEventType.Unknown;      
    }   
    
    return type;
}