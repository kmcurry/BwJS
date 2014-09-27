function GameOfLife(bridgeworks, sgPointer)
{
    this.bridgeworks = bridgeworks;
    this.sgPointer = sgPointer;
    this.objCountX = 0;
    this.objCountY = 0;
    this.objCountZ = 0;
    this.currGen = null;
    this.nextGen = null
}

GameOfLife.prototype.init = function(objUrl, 
                                     objWidth, 
                                     objHeight, 
                                     objDepth,
                                     objCountX,
                                     objCountY,
                                     objCountZ)
{
    this.objCountX = objCountX;
    this.objCountY = objCountY;
    this.objCountZ = objCountZ;
    
    var xml = "<Update>";
    xml += "Set target='NodeMgr' sgPointer='" + this.sgPointer + "'/>";
    // add GoL Models
    for (var i=0, x=0; i < objCountX; i++, x+=objWidth/2)
    {
        for (var j=0, y=0; j < objCountY; j++, y+=objHeight/2)
        {
            for (var k=0, z=0; k < objCountZ; k++, z+=objDepth/2)
            {
                xml += "<Model name='GoL_'" + i + "_" + j + "_" + k + "' enableSharing='true' url='" + objUrl + "'>";
                xml += "<position x='" + x + "' y='" + y + "' z='" + z + "'/>";
                xml += "</Model>"
            }
        }
    }

    xml += "</Update>";
    
    this.bridgeworks.updateScene(xml);
}

GameOfLife.prototype.uninit = function()
{
    
}

GameOfLife.prototype.start = function(tickMs)
{
    
}

GameOfLife.prototype.stop = function()
{
    
}

GameOfLife.prototype.tick = function()
{
    
}

GameOfLife.prototype.reset = function()
{
    
}

