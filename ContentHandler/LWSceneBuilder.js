LWSceneBuilder.prototype = new ContentBuilder();
LWSceneBuilder.prototype.constructor = LWSceneBuilder;

function LWSceneBuilder()
{
    ContentBuilder.call(this);
    this.className = "LWSceneBuilder";
    
    this.graphMgr = null;
    this.currChannel = 0;   // motions
    
    this.indexGeometry = new BooleanAttr(true);
    
    this.registerAttribute(this.indexGeometry, "indexGeometry");
}

LWSceneBuilder.prototype.visitHandler = function(handler)
{
    handler.addTokenHandler(LWSceneBuilder_TokenHandler, this);
}

LWSceneBuilder.prototype.finalize = function()
{
    }

LWSceneBuilder.prototype.matchesType = function(type)
{
    return (type == "lws" ||
            type == "mot");
}

LWSceneBuilder.prototype.allocateSceneElement = function(tokens)
{
    
    
    switch (tokens[0])
    {
        case "LoadObjectLayer":
        {
            
        }
        break;
        case "NumChannels":
        {
            var numChannels = parseInt(tokens[1], 10);
            
            var eval = this.evaluators[this.evaluators.length-1];
            
            eval.setNumChannels(numChannels);
            
            // attach to target (if specified)
            switch (numChannels)
            {
                case 1:
                    this.attachDissolveInterpolator(this.evaluators[this.evaluators.length-1], 
                        this.registry.find(this.evaluators[this.evaluators.length-1].getAttribute("target").getValueDirect().join("")));
                    break;
                   
                default:
                    this.attachKeyframeInterpolator(this.evaluators[this.evaluators.length-1], 
                        this.registry.find(this.evaluators[this.evaluators.length-1].getAttribute("target").getValueDirect().join("")));
                    break;
            }
        }
        break;
        
        case "Channel":
        {
            this.currChannel = parseInt(tokens[1], 10);
        }
        break;
        
        case "Key":
        {
            if (this.evaluators.length <= 0) break;
            
            var keyframes = this.evaluators[this.evaluators.length-1].getAttribute("channels").getAt(this.currChannel);
            if (!keyframes) break;
            
            var keyframe = new KeyframeAttr();
            for (var i=1; i < tokens.length; i++)
            {
                switch (i)
                {
                    // value
                    case 1:
                    {
                        var f = parseFloat(tokens[i]);

                        // if channel 3, 4, or 5, convert value to degrees
                        if (this.currChannel == 3 || this.currChannel == 4 || this.currChannel == 5)
                        {
                            f = toDegrees(f);
                        }

                        keyframe.getAttribute("value").setValueDirect(f);
                    }
                    break;
                    // time
                    case 2:
                        keyframe.getAttribute("time").setValueDirect(parseFloat(tokens[i]));
                        break;
                    case 3:
                    {
                        var shape = parseInt(tokens[i]);
                        switch (shape)
                        {
                            case 0:
                                keyframe.getAttribute("shape").setValueDirect(eKeyframeShape.TCB);
                                break;
                            case 1:
                                //keyframe.getAttribute("shape").setValueDirect();	// TODO: Hermite Spline
                                break;
                            case 2:
                                keyframe.getAttribute("shape").setValueDirect(eKeyframeShape.Bezier1D);
                                break;
                            case 3:
                                keyframe.getAttribute("shape").setValueDirect(eKeyframeShape.Linear);
                                break;
                            case 4:
                                keyframe.getAttribute("shape").setValueDirect(eKeyframeShape.Stepped);
                                break;
                            case 5:
                                keyframe.getAttribute("shape").setValueDirect(eKeyframeShape.Bezier2D);
                                break;
                            default:
                                keyframe.getAttribute("shape").setValueDirect(eKeyframeShape.Linear);
                                break;
                        }
                    }
                    break;
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        keyframe.getAttribute("params").getAt(i-3-1).setValueDirect(parseFloat(tokens[i]));
                        break;
                    default:
                        break;
                }
            }
			
            // set to keyframe interpolator
            keyframes.push_back(keyframe);
        }
        break;
        
        case "Behaviors":
        {
            if (this.evaluators.length <= 0) break;
            
            var preBehaviors = this.evaluators[this.evaluators.length-1].getAttribute("preBehaviors").getAt(this.currChannel);
            var postBehaviors = this.evaluators[this.evaluators.length-1].getAttribute("postBehaviors").getAt(this.currChannel);
            if (!preBehaviors || !postBehaviors) break;
            
            var pre = parseInt(tokens[1], 10);
            var post = parseInt(tokens[2], 10);
            
            preBehaviors.setValueDirect(pre);
            postBehaviors.setValueDirect(post);            
        }
        break;
    }
}

LWSceneBuilder.prototype.attachKeyframeInterpolator = function(kfi, target)
{
    if (!kfi || !target) return;
    
    var numChannels = kfi.getAttribute("channels").vector.length;
    
    for (var channel=0; channel < numChannels; channel++)
    {
        var resultValue = kfi.getAttribute("resultValues").getAt(channel);
        
        switch (channel)
        {
            case 0: // x pos
                resultValue.addElementTarget(target.getAttribute("position"), 0, 0);
                break;

            case 1: // y pos
                resultValue.addElementTarget(target.getAttribute("position"), 0, 1);
                break;

            case 2: // z pos
                resultValue.addElementTarget(target.getAttribute("position"), 0, 2);
                break;

            case 3: // heading (y rot)
                resultValue.addElementTarget(target.getAttribute("rotation"), 0, 1);
                break;

            case 4: // pitch (x rot)
                resultValue.addElementTarget(target.getAttribute("rotation"), 0, 0);
                break;

            case 5: // bank (z rot)
                resultValue.addElementTarget(target.getAttribute("rotation"), 0, 2);
                break;

            case 6: // x scale
                resultValue.addElementTarget(target.getAttribute("scale"), 0, 0);
                break;

            case 7: // y scale
                resultValue.addElementTarget(target.getAttribute("scale"), 0, 1);
                break;

            case 8: // z scale
                resultValue.addElementTarget(target.getAttribute("scale"), 0, 2);
                break;
        }   
    }
    
    kfi.getAttribute("time").setValueDirect(0);
}

LWSceneBuilder.prototype.attachDissolveInterpolator = function(kfi, target)
{
    if (!kfi || !target) return;
    
    var resultValue = kfi.getAttribute("resultValues").getAt(0);
    
    resultValue.addElementTarget(target.getAttribute("dissolve"), 0, 0);
}

function LWSceneBuilder_TokenHandler(tokens, builder)
{
    builder.allocateSceneElement(tokens);
}