ConnectionMgr.prototype = new AttributeContainer();
ConnectionMgr.prototype.constructor = ConnectionMgr;

function ConnectionMgr()
{
    AttributeContainer.call(this);
    this.className = "ConnectionMgr";
    
    this.name = new StringAttr("ConnectionMgr");
    
    this.registerAttribute(this.name, "name");
    
    // TODO: finish adding connection helpers
    //registerConnectionHelper("DisconnectAllSources", null, ConnectionMgr.prototype.disconnectAllSources);
    registerConnectionHelper("DisconnectAllTargets", null, ConnectionMgr.prototype.disconnectAllTargets);
    registerConnectionHelper("dissolve", ConnectionMgr.prototype.connectDissolve, ConnectionMgr.prototype.disconnectDissolve);
    registerConnectionHelper("walkSimulation", ConnectionMgr.prototype.connectWalkSimulation, ConnectionMgr.prototype.disconnectWalkSimulation);
}

ConnectionMgr.prototype.connectSceneInspection = function(inspector, camera)
{
    if (!inspector || !camera) return;
    
    var lastCamera = inspector.getCamera();
    if (lastCamera == camera)
    {
        // already connected
        return;
    }
    else if (lastCamera)
    {
        this.disconnectSceneInspection(inspector, lastCamera);
    }

    camera.getAttribute("sectorPosition").addTarget(inspector.getAttribute("viewPosition"), eAttrSetOp.Replace, null, true);
    camera.getAttribute("rotation").addTarget(inspector.getAttribute("viewRotation"), eAttrSetOp.Replace, null, true);

    inspector.getAttribute("resultPosition").addTarget(camera.getAttribute("sectorPosition"), eAttrSetOp.Replace, null, false);
    inspector.getAttribute("resultRotation").addTarget(camera.getAttribute("quaternionRotation"), eAttrSetOp.Replace, null, false);
    
    inspector.setCamera(camera);
}

ConnectionMgr.prototype.disconnectAllTargets = function(source, target)
{
    if (source)
    {
        var count = source.getAttributeCount();
        for (var i=0; i < count; i++)
        {
            var attribute = source.getAttributeAt(i);
            if (attribute)
            {
                attribute.removeAllTargets();
            }
        }
    }
}

ConnectionMgr.prototype.disconnectSceneInspection = function(inspector, camera)
{
    if (!inspector || !camera) return;
    
    camera.getAttribute("sectorPosition").removeTarget(inspector.getAttribute("viewPosition"));
    camera.getAttribute("rotation").removeTarget(inspector.getAttribute("viewRotation"));
    
    inspector.getAttribute("resultPosition").removeTarget(camera.getAttribute("sectorPosition"));
    inspector.getAttribute("resultRotation").removeTarget(camera.getAttribute("quaternionRotation"));
    
    inspector.setCamera(null);
}

ConnectionMgr.prototype.connectMapProjectionCalculator = function(mpc, pme)
{
    if (!mpc || !pme) return;

    mpc.getAttribute("resultPosition").addTarget(pme.getAttribute("position"));

    mpc.evaluate();
}

ConnectionMgr.prototype.disconnectMapProjectionCalculator = function(mpc, pme)
{
    if (!mpc || !pme) return;

    mpc.getAttribute("resultPosition").removeTarget(pme.getAttribute("position"));
}

ConnectionMgr.prototype.connectDissolve = function(evaluator, target)
{
    if (!evaluator || !target) return;
    
    var dissolve = target.getAttribute("dissolve");
    if (dissolve)
    {
        var resultValues = evaluator.getAttribute("resultValues");
        if (resultValues)
        {
            var resultValue = resultValues.getAt(0);
            if (resultValue)
            {
                resultValue.addTarget(dissolve);
            }
        }
    }
}

ConnectionMgr.prototype.disconnectDissolve = function(evaluator, target)
{
    if (!evaluator || !target) return;
    
    var dissolve = target.getAttribute("dissolve");
    if (dissolve)
    {
        var resultValues = evaluator.getAttribute("resultValues");
        if (resultValues)
        {
            var resultValue = resultValues.getAt(0);
            if (resultValue)
            {
                resultValue.removeTarget(dissolve);
            }
        }
    }
}

ConnectionMgr.prototype.connectWalkSimulation = function(simulator, target)
{
    ConnectionMgr.prototype.connectSceneInspection.call(null, simulator, target);
}

ConnectionMgr.prototype.disconnectWalkSimulation = function(simulator, target)
{
    ConnectionMgr.prototype.disconnectSceneInspection.call(null, simulator, target);
}

ConnectionMgr.prototype.connectModelsToMorph = function(source, target, morphIncr)
{
    if (!source || !target) return;
    
    var factory = this.registry.find("AttributeFactory");
    
    // get target vertices
    var targetVertices = target.getAttribute("vertices").getValueDirect();
    
    // for each geometry set in the source...
    for (var i = 0; i < source.geometry.length; i++)
    {
        // get indices
        var indices = source.geometryIndices[i];    
        if (!indices) continue;
        
        // create morph effector    
        var morpher = factory.create("MorphEffector");   
        morpher.getAttribute("renderAndRelease").setValueDirect(true);
        morpher.getAttribute("morphIncr").setValueDirect(morphIncr);
        
        // get source vertices from geometry and set to sourceVertices on morpher
        var sourceVertices = source.geometry[i].getAttribute("vertices").getValueDirect();
        morpher.getAttribute("sourceVertices").setValueDirect(sourceVertices);
        
        // set target vertices
        var morpher_targetVertices = [];
        for (var j = 0; j < indices.length; j++)
        {
            var index = indices[j];
            
            if (index * 3 + 2 < targetVertices.length)
            {
                morpher_targetVertices.push(targetVertices[index * 3    ]);
                morpher_targetVertices.push(targetVertices[index * 3 + 1]);
                morpher_targetVertices.push(targetVertices[index * 3 + 2]);
            }
            else // target deosn't contain enough points, use source
            {
                morpher_targetVertices.push(sourceVertices[j * 3    ]);
                morpher_targetVertices.push(sourceVertices[j * 3 + 1]);
                morpher_targetVertices.push(sourceVertices[j * 3 + 2]);
            }
        }
        morpher.getAttribute("targetVertices").setValueDirect(morpher_targetVertices);
        
        // connect result vertices to source vertices
        morpher.getAttribute("resultVertices").addTarget(source.geometry[i].getAttribute("vertices"));
    }
}

