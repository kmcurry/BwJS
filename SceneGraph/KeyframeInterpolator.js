KeyframeInterpolator.prototype = new Evaluator();
KeyframeInterpolator.prototype.constructor = KeyframeInterpolator;

function EndState()
 {
    this.initialized = false;
    this.startKeyIts = []; // one for each channel
    this.endKeyIts = [];  // one for each channel
    this.startTime = -FLT_MAX;    // across all channels
    this.endTime = FLT_MAX;     // across all channels
 }
    
function KeyframeInterpolator()
{
    Evaluator.call(this);
    this.className = "KeyframeInterpolator";
    this.attrType = eAttrType.KeyframeInterpolator;

    this.lastTime = 0;
    this.evaluated = false;
    this.endState =  new EndState();
    
    this.time = new NumberAttr(0);
    this.channels = new AttributeVector();
    this.startKeys = new AttributeVector();
    this.endKeys = new AttributeVector();
    this.preBehaviors = new AttributeVector();
    this.postBehaviors = new AttributeVector();
    this.resultValues = new AttributeVector();

    this.time.addModifiedCB(KeyframeInterpolator_TimeModifiedCB, this);
    
    this.registerAttribute(this.time, "time");
    this.registerAttribute(this.channels, "channels");
    this.registerAttribute(this.startKeys, "startKeys");
    this.registerAttribute(this.endKeys, "endKeys");
    this.registerAttribute(this.preBehaviors, "preBehaviors");
    this.registerAttribute(this.postBehaviors, "postBehaviors");
    this.registerAttribute(this.resultValues, "resultValues");
}

KeyframeInterpolator.prototype.setNumChannels = function(numChannels)
{
    // clear
    this.channels.resize(0);
    this.startKeys.resize(0);
    this.endKeys.resize(0);
    this.preBehaviors.resize(0);
    this.postBehaviors.resize(0);
    this.resultValues.resize(0);
    
    for (var i=0; i < numChannels; i++)
    {
        this.channels.push_back(new KeyframesAttr());
        this.startKeys.push_back(new NumberAttr(-1));
        this.endKeys.push_back(new NumberAttr(-1));
        this.preBehaviors.push_back(new NumberAttr(eEndBehavior.Reset));
        this.postBehaviors.push_back(new NumberAttr(eEndBehavior.Reset));
        this.resultValues.push_back(new NumberAttr(0));
    }
}

KeyframeInterpolator.prototype.evaluate = function()
{
    // initialize end state if not already initialized
    if (!this.endState.initialized)
    {
        // initialize
        this.updateEndState();
        this.endState.initialized = true;
    }
    
    // get input values

    // time
    var time = this.time.getValueDirect();

    var first, last;
    var pre, post;

    // for each channel...
    for (var i = 0; i < this.channels.vector.length; i++)
    {
        var keyframes = this.channels.getAt(i);
        if (keyframes.vector.length == 0) continue;

        first = this.endState.startKeyIts[i];
        last = this.endState.endKeyIts[i];

        pre = this.preBehaviors.getAt(i).getValueDirect();
        post = this.postBehaviors.getAt(i).getValueDirect();

        // interpolate
        var value = interpolate(time, keyframes, first, last, pre, post);

        // output result
        this.resultValues.getAt(i).setValueDirect(value);
    }

    this.lastTime = time;
    this.evaluated = true;
}

KeyframeInterpolator.prototype.timeModified = function()
{
    this.updateExpired();
}

KeyframeInterpolator.prototype.updateExpired = function()
{
    // determine if kfi has "expired"
    this.expired.setValueDirect(false);

    // NOTE: this code moved from RenderAgent

    // an multi-channel Evaluator (i.e., KeyframeInterpolator) is considered
    // animating if any 1 of its channels meet the requirements for determining
    // whether or not Evaluate is called.  For KeyframeInterpolators, "at least
    // one channel is animating" if any one of the channels' keys has a time 
    // value greater than the current time.
    var bAtLeastOneChannelAnimating = false;

    // for each channel in the interpolator, compare current time
    // with both end behavior and stop time to determine whether or 
    // not this kfi should continue to be evaluated
    var fEvalTime = this.time.getValueDirect();
    var iPost = 0;
    var postBehavior = null;
    var numChannels = this.channels.vector.length;
    for (var i=0; i < numChannels; i++)
    {
        postBehavior = this.postBehaviors.getAt(i);
        if (postBehavior)
        {
            iPost = postBehavior.getValueDirect();
        }

        // if *expression* is TRUE then the end behavior is 
        // repeat, oscillate, or some other continuous behavior
        if (iPost != eEndBehavior.Constant)
        {
            bAtLeastOneChannelAnimating = true;
            break;
        }
    }

    // if the eval's current time either:
    // 1. has advanced passed its longest keyframe OR
    // 2. is not yet at its start time
    // then stop evaluating it.
    // NOTE: only check Constant end behaviors b/c Repeats and
    // Oscillators should keep running.  By definition, scenes w/
    // non-constant end behaviors will never AA
    if (!bAtLeastOneChannelAnimating &&
        (fEvalTime < this.endState.startTime || fEvalTime > this.endState.endTime))
    {
        // set expired flag
        this.expired.setValueDirect(true);
    }
}

KeyframeInterpolator.prototype.updateEndState = function()
{
    var fStartTime = -1;
    var fEndTime = -1;
    var fShortest = FLT_MAX;
    var fLongest = -FLT_MAX;
    var startKey = -1, endKey = -1;
    var keyframes = null;
    var numChannels = this.channels.vector.length;
    
    this.startKeys.resize(numChannels);
    this.endKeys.resize(numChannels);
    
    for (var i=0; i < numChannels; i++)
    {
        keyframes = this.channels.getAt(i);
        
        startKey = this.startKeys.vector.length > i ? this.startKeys.getAt(i).getValueDirect() : -1;
        endKey = this.endKeys.vector.length > i ? this.endKeys.getAt(i).getValueDirect() : -1;
        
        if (endKey < startKey)
        {
            endKey = startKey;
        }
        
        // set first/last keys to evaluate
        this.endState.startKeyIts[i] = keyframes.getAt(0);
        this.endState.endKeyIts[i] = keyframes.getAt(keyframes.vector.length - 1);

        if (startKey >= 0 && startKey < keyframes.vector.length)
        {
            this.endState.startKeyIts[i] = keyframes.getAt(startKey);
        }

        if (endKey >= 0 && endKey < keyframes.vector.length)
        {
            this.endState.endKeyIts[i] = keyframes.getAt(endKey);
        }

	fStartTime = this.endState.startKeyIts[i].getTime();
        fEndTime = this.endState.endKeyIts[i].getTime();

	// save the smallest start time for all channels
	fShortest = fStartTime < fShortest ? fStartTime : fShortest;

	// save the longest end time for all channels
	fLongest = fEndTime >= fLongest ? fEndTime : fLongest;
    }
    
    this.endState.startTime = fShortest;
    this.endState.endTime = fLongest;
}

function KeyframeInterpolator_TimeModifiedCB(attribute, container)
{
    container.timeModified();
}

function KeyframeInterpolator_EndStateModifiedCB(attribute, container)
{
    container.updateEndState();
}