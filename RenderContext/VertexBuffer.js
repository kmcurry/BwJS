var RC_POINTS                       = 0x0000;
var RC_LINES                        = 0x0001;
var RC_LINE_LOOP                    = 0x0002;
var RC_LINE_STRIP                   = 0x0003;
var RC_TRIANGLES                    = 0x0004;
var RC_TRIANGLE_STRIP               = 0x0005;
var RC_TRIANGLE_FAN                 = 0x0006;
    
function VertexBuffer()
{
    this.vertices = new Array();
    this.normals = new Array();
    this.colors = new Array();
    this.vertexCount = 0;
    this.numVerticesPerPrimitive = 0;
}