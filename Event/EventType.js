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
    KeyDown_First               :201,
    KeyDown_Last                :500,
    KeyUp_First                 :501,
    KeyUp_Last                  :798,
    Key_Last                    :799,
    
    Element_First               :800,
    ElementSelected             :801,
    ElementUnselected           :802,
    ElementFocus                :803,
    ElementBlur                 :804,
    Element_Last                :899,
    
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

// map of VK_* strings to javascript key codes
var eKeyCodeMap = {
    "VK_BACK"                   : 8,
    "VK_TAB"                    : 9,
    "VK_ENTER"                  : 13,
    "VK_SHIFT"                  : 16,
    "VK_CONTROL"                : 17,
    "VK_ALT"                    : 18,
    "VK_PAUSE"                  : 19,
    "VK_CAPITAL"                : 20,
    "VK_ESCAPE"                 : 27,
    "VK_PAGEUP"                 : 33,
    "VK_PAGEDOWN"               : 34,
    "VK_END"                    : 35,
    "VK_HOME"                   : 36,
    "VK_LEFT"                   : 37,
    "VK_UP"                     : 38,
    "VK_RIGHT"                  : 39,
    "VK_DOWN"                   : 40,
    "VK_INSERT"                 : 45,
    "VK_DELETE"                 : 46,
    "VK_0"                      : 48,
    "VK_1"                      : 49,
    "VK_2"                      : 50,
    "VK_3"                      : 51,
    "VK_4"                      : 52,
    "VK_5"                      : 53,
    "VK_6"                      : 54,
    "VK_7"                      : 55,
    "VK_8"                      : 56,
    "VK_9"                      : 57,
    "VK_A"                      : 65,
    "VK_B"                      : 66,
    "VK_C"                      : 67,
    "VK_D"                      : 68,
    "VK_E"                      : 69,
    "VK_F"                      : 70,
    "VK_G"                      : 71,
    "VK_H"                      : 72,
    "VK_I"                      : 73,
    "VK_J"                      : 74,
    "VK_K"                      : 75,
    "VK_L"                      : 76,
    "VK_M"                      : 77,
    "VK_N"                      : 78,
    "VK_O"                      : 79,  
    "VK_P"                      : 80,
    "VK_Q"                      : 81,
    "VK_R"                      : 82,    
    "VK_S"                      : 83,
    "VK_T"                      : 84,
    "VK_U"                      : 85,
    "VK_V"                      : 86,
    "VK_W"                      : 87,
    "VK_X"                      : 88,
    "VK_Y"                      : 89,
    "VK_Z"                      : 90,
    "VK_COMMA"                  : 189,
    "VK_PERIOD"                 : 190,
    "VK_SLASH"                  : 191
};

function getEventTypeByName(name)
{
    var type = eEventNameMap[name];
    
    if (type == undefined)
    {
        // key
        if (name.indexOf("VK") != -1)
        {
            var key = name;
            var state = "";
            var dot = name.indexOf(".");
            if (dot != -1)
            {
                // key
                key = name.substring(0, dot);
                // state
                state = name.substring(dot+1);
            }
                
            var keyCode = eKeyCodeMap[key];
            if (keyCode)
            {
                switch (state)
                {
                    case "DOWN":
                        type = eEventType.KeyDown_First + keyCode;
                        break;
                        
                    case "UP":
                    default:
                        type = eEventType.KeyUp_First + keyCode;
                        break;
                }
            }
        }     
    }   
    
    return type;
}