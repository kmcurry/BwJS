function TLWSCSceneData()
{
    var fps = 0;
    var backgroundColorR = 0;
    var backgroundColorG = 0;
    var backgroundColorB = 0;
    var backgroundImageFilename = "";
    var foregroundImageFilename = "";
    var foregroundAlphaFilename = "";
    var fadeForeground = false;
    var gridSize = 0;
    var nearClipDistance = 0.25;
}

function TLWSCv3LightDesc()
{
    this.name = "";
    this.type = 0;
    this.colorR = 0;
    this.colorG = 0;
    this.colorB = 0;
    this.intensity = 0;
    this.range = 0;
    this.coneAngle = 0; // for spot lights
    this.edgeAngle = 0; // for spot lights
    this.motion = null;
    this.parentItem = 0;
}

LWSceneBuilder.prototype = new ContentBuilder();
LWSceneBuilder.prototype.constructor = LWSceneBuilder;

function LWSceneBuilder()
{
    ContentBuilder.call(this);
    this.className = "LWSceneBuilder";

    this.root = null;
    this.sgRoot = null;
    this.evaluatorsGroup = null;
    this.camerasSelector = null;
    this.lightsGroup = null;
    this.modelsGroup = null;
    this.renderDirective = null;
    this.boneFalloffType = eBoneFalloffType.InverseDistance;
    this.parsingBgImage = false;
    this.parsingFgImage = false;
    this.parsingFgAlphaImage = false;
    this.imagePath = "";
    this.currElement = null;
    this.currChannel = 0;   // motions
    this.sceneData = new TLWSCSceneData();
    this.ambientLightDesc = new TLWSCv3LightDesc();
    this.globalLightDesc = new TLWSCv3LightDesc();
    this.lightDescs = [];
    this.parentItems = [];
    this.bones = [];
    this.objectBones = [];
    
    this.indexGeometry = new BooleanAttr(true);
    
    this.registerAttribute(this.indexGeometry, "indexGeometry");
    
    this.ambientLightDesc.colorR = 1;
    this.ambientLightDesc.colorG = 1;
    this.ambientLightDesc.colorB = 1;
    this.ambientLightDesc.intensity = 0.05;
    this.globalLightDesc.intensity = 1;
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

LWSceneBuilder.prototype.handleToken = function(token, params)
{
    switch (token)
    {
        case "LWSC":
            this.handleSceneToken(params);
            break;
            
        case "LWMO":
            this.handleMotionToken(params);
            break;
            
        default:
            this.handleCommandToken(token, params);
            break;
    }
}

LWSceneBuilder.prototype.handleSceneToken = function(params)
{
    this.allocateSceneGraph();
}

LWSceneBuilder.prototype.handleMotionToken = function(params)
{

}

LWSceneBuilder.prototype.handleCommandToken = function(token, params)
{
    this.allocateSceneElement(token, params);
}

LWSceneBuilder.prototype.allocateSceneGraph = function()
{
    // root
    this.root = this.factory.create("Isolator");
    this.root.name.setValueDirect("Root");
    this.root.isolateLights.setValueDirect(true);
    this.registry.rootPtr.setValueDirect(this.root);
    
    // evaluators group
    this.evaluatorsGroup = this.factory.create("Group");
    this.evaluatorsGroup.name.setValueDirect("Evaluators");
    this.root.addChild(this.evaluatorsGroup);
    
    // cameras group
    this.camerasSelector = this.factory.create("Selector");
    this.camerasSelector.name.setValueDirect("Cameras");
    this.camerasSelector.selectee.setValueDirect(0);
    this.root.addChild(this.camerasSelector);
    
    // lights group
    this.lightsGroup = this.factory.create("Group");
    this.lightsGroup.name.setValueDirect("Lights");
    this.root.addChild(this.lightsGroup);
    
    // models group
    this.modelsGroup = this.factory.create("Group");
    this.modelsGroup.name.setValueDirect("Models");
    this.root.addChild(this.modelsGroup);
    
    // render directive
    this.renderDirective = this.factory.create("RenderDirective");
    this.renderDirective.name.setValueDirect("RenderDirective");
    this.renderDirective.rootNode.setValueDirect(this.root);
   
    return true;
}

LWSceneBuilder.prototype.allocateSceneElement = function(token, params)
{
    switch (token)
    {
        case "LoadObjectLayer":
        {
            var model = this.factory.create("Model");            
            this.currElement = model;
            
            // layer
            var layer = params[0];
            model.layer.setValueDirect(layer);
            
            // combine tokens into one string (if filename has
            // spaces, multiple tokens will be present)
            var filename = params.slice(1).join();
            filename = addSlashAfterDriveSpecifier(filename);
            model.url.setValueDirect(filename);
            
            // don't allow disableOnDissolve, because this breaks label positioning when targeted to null-object models
            model.disableOnDissolve.setValueDirect(false);
            
            this.models.push(model);
            this.modelsGroup.addChild(model);
            
            // load model
            finalizeModel(model, this.factory);
            
            this.objectBones.push(new Array());
        }
        break;
        
        case "ObjectMotion":
        {
            var kfi = this.factory.create("KeyframeInterpolator");        
            kfi.name.setValueDirect("Motion");
            
            this.evaluators.push(kfi);
            this.evaluatorsGroup.addChild(kfi);
        }
        break;
        
        case "NumChannels":
        {            
            if (this.evaluators.length > 0)
            {
                var kfi = this.evaluators[this.evaluators.length-1];                
                var numChannels = parseInt(params[0]);
                
                this.initializeKeyframeInterpolator(kfi, numChannels);
                
                var element = this.currElement || this.registry.find(kfi.getAttribute("target").getValueDirect().join(""));
                if (element)
                {
                    switch (numChannels)
                    {
                        case 1:  this.attachDissolveInterpolator(kfi, element); break;
                        default: this.attachKeyframeInterpolator(kfi, element); break;
                    }
                }
            }
        }
        break;
        
        case "Channel":
        {
            this.currChannel = parseInt(params[0]);
        }
        break;
        
        case "Key":
        {
            if (this.evaluators.length > 0)
            {
                var kfi = this.evaluators[this.evaluators.length-1];
                var keyframes = kfi.channels.getAt(this.currChannel);
                var keyframe = new KeyframeAttr();
                
                for (var i=0; i < params.length; i++)
                {
                    switch (i)
                    {
                        case 0: // value
                        {
                            var f = parseFloat(params[i]);
                            
                            // if channel 3, 4, or 5, convert value to degrees
                            if (this.currChannel == 3 || this.currChannel == 4 || this.currChannel == 5)
                            {
                                f = toDegrees(f);
                            }
                            
                            keyframe.value.setValueDirect(f);
                        }
                        break;
                        
                        case 1: // time
                        {
                            keyframe.time.setValueDirect(parseFloat(params[i]));
                        }
                        break;
                        
                        case 2:
                        {
                            var shape = parseInt(params[i]);
                            switch (shape)
                            {
                                case 0: keyframe.shape.setValueDirect(eKeyframeShape.TCB); break;
                                case 1: keyframe.shape.setValueDirect(eKeyframeShape.Hermite); break;
                                case 2: keyframe.shape.setValueDirect(eKeyframeShape.Bezier1D); break;
                                case 3: keyframe.shape.setValueDirect(eKeyframeShape.Linear); break;
                                case 4: keyframe.shape.setValueDirect(eKeyframeShape.Stepped); break;
                                case 5: keyframe.shape.setValueDirect(eKeyframeShape.Bezier2D); break;
                                default: keyframe.shape.setValueDirect(eKeyframeShape.Linear); break;
                            }
                        }
                        break;
                        
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                            keyframe.params.getAt(i-3).setValueDirect(parseFloat(params[i]));
                            break;
                            
                        default:
                            break;
                    }   
                }
                
                keyframes.push_back(keyframe);
            }
        }
        break;
        
        case "Behaviors":
        {
            if (this.evaluators.length > 0)
            {
                var kfi = this.evaluators[this.evaluators.length-1];
                
                kfi.preBehaviors.getAt(this.currChannel).setValueDirect(parseInt(params[0]));
                kfi.postBehaviors.getAt(this.currChannel).setValueDirect(parseInt(params[1]));
            }       
        }
        break;
        
        case "ObjectDissolve":
        {
            if (params[0] == "(envelope)")
            {
                var kfi = this.factory.create("KeyframeInterpolator");
                kfi.name.setValueDirect("Dissolve");
                
                this.initializeKeyframeInterpolator(kfi, 1);
                this.attachDissolveInterpolator(kfi, this.models[this.models.length-1]);
                
                this.evaluators.push(kfi);
                this.evaluatorsGroup.addChild(kfi);
            }
            else // non-envelope dissolve
            {
                // set to last loaded model
                if (this.models.length > 0)
                {
                    this.models[this.models.length-1].dissolve.setValueDirect(parseFloat(params[0]));
                }
            }
        }
        break;
        
        case "AddCamera":
        {
            var camera = this.factory.create("PerspectiveCamera");
            this.currElement = camera;
            
            this.cameras.push(camera);
            this.camerasSelector.addChild(camera);
        }
        break;
        
        case "CameraName":
        {
            // set to last loaded camera
            if (this.cameras.length > 0)
            {
                this.cameras[this.cameras.length-1].name.setValueDirect(params[0]);
            }
        }
        break;
        
        case "CameraMotion":
        {
            var kfi = this.factory.create("KeyframeInterpolator");
            kfi.name.setValueDirect("Motion");
            
            this.evaluators.push(kfi);
            this.evaluatorsGroup.addChild(kfi);
        }
        break;
        
        case "ZoomFactor":
        {
            // set to last loaded camera
            if (this.cameras.length > 0)
            {
                this.cameras[this.cameras.length-1].zoom.setValueDirect(parseFloat(params[0]));
            }
        }
        break;
        
        case "AmbientColor":
        {
            this.ambientLightDesc.colorR = parseFloat(params[0]);
            this.ambientLightDesc.colorG = parseFloat(params[1]); 
            this.ambientLightDesc.colorB = parseFloat(params[2]); 
        }
        break;
        
        case "AmbientIntensity":
        {
            var globalIllumination = this.factory.create("GlobalIllumination");
            globalIllumination.name.setValueDirect("GLight");
            
            var intensity = parseFloat(params[0]);
            
            globalIllumination.ambient.setValueDirect(this.ambientLightDesc.colorR * intensity,
                                                      this.ambientLightDesc.colorG * intensity,
                                                      this.ambientLightDesc.colorB * intensity,
                                                      1);
                                                      
            this.lightsGroup.addChild(globalIllumination);
        }
        break;
        
        case "GlobalLightIntensity":
        {
            this.globalLightDesc.intensity = parseFloat(params[0]);
        }
        break;
        
        case "AddLight":
        {
            var lightDesc = new TLWSCv3LightDesc();
            
            // set default range (if unspecified in scene file)
            lightDesc.range = Math.sqrt(FLT_MAX);
            
            this.lightDescs.push(lightDesc);
            
            this.currElement = null;
        }
        break;
        
        case "LightName":
        {
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].name = params[0];
            }
        }
        break;
        
        case "LightMotion":
        {
            var kfi = this.factory.create("KeyframeInterpolator");
            kfi.name.setValueDirect("Motion");
            
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].motion = kfi;
            }
                
            this.evaluators.push(kfi);
            this.evaluatorsGroup.addChild(kfi);
        }
        break;
        
        case "LightColor":
        {
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].colorR = parseFloat(params[0]);
                this.lightDescs[this.lightDescs.length-1].colorG = parseFloat(params[1]);
                this.lightDescs[this.lightDescs.length-1].colorB = parseFloat(params[2]);
            }
        }
        break;
        
        case "LightIntensity":
        {
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].intensity = parseFloat(params[0]);
            }
        }
        break;
        
        case "LightRange":
        {
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].range = parseFloat(params[0]);
            }
        }
        break;
        
        case "LightConeAngle":
        {
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].coneAngle = parseFloat(params[0]);
            }
        }
        break;
        
        case "LightEdgeAngle":
        {
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].edgeAngle = parseFloat(params[0]);
            }
        }
        break;
        
        case "LightType":
        {
            // add to last light record
            if (this.lightDescs.length > 0)
            {
                this.lightDescs[this.lightDescs.length-1].type = parseInt(params[0]);
            }
        }
        break;
        
        case "AddNullObject":
        {
            var nullObject = this.factory.create("NullObject");
            this.currElement = nullObject;
            
            this.models.push(nullObject);
            this.modelsGroup.addChild(nullObject);
            
            if (params[0])
            {
                nullObject.name.setValueDirect(params[0]);
            }
        }
        break;
        
        case "PivotPosition":
        {
            if (this.currElement)
            {
                this.currElement.pivot.setValueDirect(parseFloat(params[0]), parseFloat(params[1]), parseFloat(params[2]));
            }
        }
        break;
        
        case "BoneFalloffType":
        {
            this.boneFalloffType = parseInt(params[0]);
        }
        break;
        
        case "AddBone":
        {
            var bone = this.factory.create("Bone");
            bone.falloffType.setValueDirect(this.boneFalloffType);
            this.currElement = bone;
            this.bones.push(bone);
            this.objectBones[this.objectBones.length-1].push(bone);
            
        }
        break;
        
        case "BoneName":
        {
            var bone = this.bones.length > 0 ? this.bones[this.bones.length-1] : null;
            if (bone)
            {
                // check if this bone name has already been specified; if it has, append " (n)" to the
                // bone name, where n is the number of occurrences of this bone name
                var numOccurrences = 0;
                var s = "";
                for (var i=0; i < this.bones.length; i++)
                {
                    if (params[0] == this.bones[i].name.getValueDirect().join(""))
                    {
                        numOccurrences++;
                    }
                }
                if (numOccurrences > 0)
                {
                    params[0] += "(" + numOccurrences+1 + ")";
                }

                bone.name.setValueDirect(params[0]);
            }    
        }
        break;
        
        case "BoneRestPosition":
        {
            var bone = this.bones.length > 0 ? this.bones[this.bones.length-1] : null;
            if (bone)
            {
                bone.restPosition.setValueDirect(parseFloat(params[0]), parseFloat(params[1]), parseFloat(params[2]));
            }
        }
        break;
        
        case "BoneRestDirection":
        {
            var bone = this.bones.length > 0 ? this.bones[this.bones.length-1] : null;
            if (bone)
            {
                bone.restRotation.setValueDirect(parseFloat(params[1]), parseFloat(params[0]), parseFloat(params[2]));
            }
        }
        break;
        
        case "BoneRestLength":
        {
            var bone = this.bones.length > 0 ? this.bones[this.bones.length-1] : null;
            if (bone)
            {
                bone.restLength.setValueDirect(parseFloat(params[0]));
            }
        }
        break;
        
        case "BoneStrength":
        {
            var bone = this.bones.length > 0 ? this.bones[this.bones.length-1] : null;
            if (bone)
            {
                bone.strength.setValueDirect(parseFloat(params[0]));
            }
        }
        break;
        
        case "BoneScaleBoneStrength":
        {
            var bone = this.bones.length > 0 ? this.bones[this.bones.length-1] : null;
            if (bone)
            {
                bone.scaleBoneStrength.setValueDirect(parseFloat(params[0]));
            }
        }
        break;
        
        case "BoneMotion":
        {
            var kfi = this.factory.create("KeyframeInterpolator");
            kfi.name.setValueDirect("Motion");
            
            // add to last light record
            if (this.bones.length > 0)
            {
                this.bones[this.bones.length-1].motion = kfi;
            }
                
            this.evaluators.push(kfi);
            this.evaluatorsGroup.addChild(kfi);
        }
        break;
        
        case "ParentItem":
        {
            if (this.currElement)
            {
                this.parentItems.push(new Pair(this.currElement, params[0]));
            }
            else // !this.currElement -- current element is a light (this.currElement is NULL because 
                 // light can't be allocated until later when type is known)
            {
                if (this.lightDescs.length > 0)
                {
                    this.lightDescs[this.lightDescs.length-1].parentItem = params[0];
                }
            }
        }
        
        case "GridSize":
        {
            this.sceneData.gridSize = parseFloat(params[0]);
        }
        
        case "NearClipDistance":
        {
            // set to last camera
            if (this.cameras.length > 0)
            {
                this.cameras[this.cameras.length-1].nearDistance.setValueDirect(parseFloat(params[0]));
            }
        }
        break;
        
        case "FramesPerSecond":
        {
            this.sceneData.fps = parseFloat(params[0]);
        }
        break;
        
        case "BackdropColor":
        {
            this.sceneData.backgroundColorR = parseFloat(params[0]);
            this.sceneData.backgroundColorG = parseFloat(params[1]);
            this.sceneData.backgroundColorB = parseFloat(params[2]);
        }
        break;
        
        case "}":
        {
            this.currChannel = 0;
            
            if (this.imagePath != "")
            {
                if (this.parsingBgImage)
                {
                    this.renderDirective.backgroundImageFilename.setValueDirect(this.imagePath);
                    this.parsingBgImage = false;
                }
                else if (this.parsingFgImage)
                {
                    this.renderDirective.foregroundImageFilename.setValueDirect(this.imagePath);
                    this.parsingFgImage = false;
                }
                else if (this.parsingFgAlphaImage)
                {
                    this.renderDirective.foregroundAlphaImageFilename.setValueDirect(this.imagePath);
                    this.parsingFgAlphaImage = false;
                }
                
                this.imagePath = "";
            }
        }
        break;
        
        case "String":
        {
            if (this.parsingBgImage ||
                this.parsingFgImage ||
                this.parsingFgAlphaImage)
            {
                this.imagePath = params[0];
            }
        }
        break;
        
        case "BGImage":
        {
            this.parsingBgImage = true;
        }
        break;
        
        case "FGImage":
        {
            this.parsingFgImage = true;
        }
        break;
        
        case "FGAlphaImage":
        {
            this.parsingFgAlphaImage = true;
        }
        break;
        
        case "EOF":
        {
            this.finalize();
        }
        break;
        
        default:
        {
            // unsupported tag
        }
        break;
    }
}

LWSceneBuilder.prototype.finalize = function()
{
    // place models into name bins
    var nameBins = [];
    for (var i=0; i < this.models.length; i++)
    {
        var name = this.models[i].name.getValueDirect().join("");
        if (nameBins[name] == undefined)
        {
            nameBins[name] = new Array();
        }
        
        nameBins[name].push(this.models[i]);
    }
    
    // any name bins that contain more than 1 entry are duplicates and need to be renamed with "(n)" appended
    for (var name in nameBins)
    {
        if (nameBins[name].length > 1)
        {
            for (var i=0; i < nameBins[name].length; i++)
            {
                nameBins[name][i].name.setValueDirect(name + " (" + (i+1) + ")")
            }
        }
    }
    
    // set camera(s) clip planes
    var nearDistance, farDistance;
    for (var i=0; i < this.cameras.length; i++)
    {
        var zoom = this.cameras[i].zoom.getValueDirect();

        nearDistance = this.sceneData.gridSize * 0.1 * zoom;
        farDistance = nearDistance * 100000;
        
        this.cameras[i].nearDistance.setValueDirect(nearDistance);
        this.cameras[i].farDistance.setValueDirect(farDistance);
    }

    // allocate lights
    for (var i=0; i < this.lightDescs.length; i++)
    {
        var light = this.allocateLight(this.lightDescs[i]);
        
        // if parented, add entry in parent items map
        if (this.lightDescs[i].parentItem)
        {
            this.parentItems.push(new Pair(light, this.lightDescs[i].parentItem));
        }
        
        this.lights.push(light);
        this.lightsGroup.addChild(light);
    }
    
    // assign parents
    for (var i=0; i < this.parentItems.length; i++)
    {
        this.setParentItem(this.parentItems[i].first, this.parentItems[i].second);    
    }
    
    // setup motion controllers
    // TODO
    
    // create bone effectors
    for (var i=0; i < this.models.length; i++)
    {
        var model = this.models[i];
        if (model.bones && 
            model.bones.length > 0)
        {
            this.attachBoneEffectors(model, model.bones);
        }
    }

    // create morph effectors
    // TODO
    
    // backdrop color
    
    // register evaluators; evaluate evaluators once so that their initial values 
    // are set to their targets (e.g., models that depend upon KFI's for position)
    for (var i=0; i < this.evaluators.length; i++)
    {
        this.evaluators[i].evaluate();
    }
}

LWSceneBuilder.prototype.allocateLight = function(lightDesc)
{
    var light = null;
    switch (lightDesc.type)
    {
        case 0: // distance (directional)
        case 3: // linear (use directional to approximate)
            light = this.factory.create("DirectionalLight");
            break;
            
        case 1: // point
            light = this.factory.create("PointLight");
            break;
            
        case 2: // spot
        case 4: // area (use spot to approximate)
            light = this.factory.create("SpotLight");
            break;
    }
    if (!light) return null;
    
    // attach motion object
    if (lightDesc.motion)
    {
        this.attachKeyframeInterpolator(lightDesc.motion, light);
    }
    
    // set common attributes
    
    // name
    light.name.setValueDirect(lightDesc.name);
    
    // light color
    var red = lightDesc.colorR * lightDesc.intensity * this.globalLightDesc.intensity;
    var green = lightDesc.colorR * lightDesc.intensity * this.globalLightDesc.intensity;
    var blue = lightDesc.colorR * lightDesc.intensity * this.globalLightDesc.intensity;
    var alpha = 1;
    
    // ambient color
    light.ambient.setValueDirect(this.ambientLightDesc.colorR * this.ambientLightDesc.intensity,
                                 this.ambientLightDesc.colorG * this.ambientLightDesc.intensity,
                                 this.ambientLightDesc.colorB * this.ambientLightDesc.intensity,
                                 1);
    
    // diffuse color
    light.diffuse.setValueDirect(red, green, blue, alpha);
    
    // specular color
    light.specular.setValueDirect(red, green, blue, alpha);
    
    // set type-specific attributes
    switch (lightDesc.type)
    {
        case 0: // distance (directional)
        case 3: // linear (use directional to approximate)
            break;
            
        case 1: // point
            // range
            light.range.setValueDirect(lightDesc.range);
            break;
            
        case 2: // spot
        case 4: // area (use spot to approximate)
            // range
            light.range.setValueDirect(lightDesc.range);
            // inner cone degrees
            light.innerConeDegrees.setValueDirect(lightDesc.coneAngle);
            // outer cone degrees
            light.outerConeDegrees.setValueDirect(lightDesc.edgeAngle);
            // cone falloff
            light.coneFalloff.setValueDirect(1);
            break;
    }
    
    return light;
}

LWSceneBuilder.prototype.initializeKeyframeInterpolator = function(kfi, numChannels)
{
    kfi.setNumChannels(numChannels);
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

LWSceneBuilder.prototype.attachBoneEffectors = function(model, bones)
{
    // for each geometry set in model...
    for (var i=0; i < model.geometry.length; i++)
    {
        var geometry = model.geometry[i];
        
        // allocate bone effector
        var boneEffector = this.factory.create("BoneEffector");
        this.evaluators.push(boneEffector);
        this.evaluatorsGroup.addChild(boneEffector);
        
        // add bones to bone effector
        for (var j=0; j < bones.length; j++)
        {
            boneEffector.addBoneHierarchy(bones[j]);
        }

        // get vertices/normals from geometry
        var verticesAttr = geometry.getAttribute("vertices");
        var vertices = verticesAttr.getValueDirect();

        // points/lines will not have normals
        var normalsAttr = geometry.getAttribute("normals");
        var normals = normalsAttr.getValueDirect();

        // assign to bone effector inputs
        boneEffector.getAttribute("vertices").setValueDirect(vertices);
        boneEffector.getAttribute("normals").setValueDirect(normals);

        // route bone effector outputs back to geometry
        boneEffector.getAttribute("resultVertices").addTarget(verticesAttr);
        boneEffector.getAttribute("resultNormals").addTarget(normalsAttr);
    }
}

LWSceneBuilder.prototype.setParentItem = function(object, parentItem)
{
    var itemNum = hexStrToULong(parentItem.substring(1));
    var parent = null;
    switch (parentItem.charAt(0))
    {
        case "1": // model parent
            {
                parent = this.models[itemNum];
                if (object.attrType == eAttrType.Bone)
                {
                    parent.bones.push(object);
                }
            }
            break;
    
        case "2": // light parent
            {
                parent = this.lights[itemNum];
            }
            break;
    
        case "3": // camera parent
            {
                parent = this.cameras[itemNum];
            }
            break;
    
        case "4": // bone parent
            {
                var boneNum = hexStrToULong(parentItem.substring(1, 4));
                var objNum = hexStrToULong(parentItem.substring(4));

                if (this.bones.length > boneNum)
                {
                    var childBone = object;
                    var parentBone = null;
                    if (this.objectBones.length > objNum && this.objectBones[objNum].length > boneNum)
                    {
                        parentBone = this.objectBones[objNum][boneNum];
                    }

                    if (parentBone && childBone)
                    {
                        parentBone.addChild(childBone);
                    }
                }  
            }
            break;
        
        default:
            return;
    }
    
    // assign parent
    switch (object.attrType)
    {
        case eAttrType.Bone:
            break;
        
        default:
            object.setMotionParent(parent);
            break;
    }
}

function LWSceneBuilder_TokenHandler(tokens, builder)
{
    builder.handleToken(tokens[0], tokens.slice(1));
}