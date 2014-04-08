KeyframeInterpolator.prototype = new Evaluator();
KeyframeInterpolator.prototype.constructor = KeyframeInterpolator;

function KeyframeInterpolator()
{
    Evaluator.call(this);
    this.className = "KeyframeInterpolator";
    this.attrType = eAttrType.KeyframeInterpolator;

    this.lastTime = 0;
    this.evaluated = false;
    
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
    // get input values

    // time
    var time = this.time.getValueDirect();
    /*
    std::vector<float> fvalues(1);

    // for each channel...
    CKeyframesAttr* keyframes = NULL;
    unsigned int numChannels = m_channels->GetSize()->GetValueDirect();
    unsigned int numKeyframes = 0;
    int key = 0, startKey = -1, endKey = -1;
    CKeyframesAttr::const_iterator first, last;
    eEndBehavior preBehavior = eEndBehavior_Reset;
    eEndBehavior postBehavior = eEndBehavior_Reset;
    for (unsigned int channel = 0; channel < numChannels; channel++)
    {
    keyframes = (*m_channels)[channel];
    if (!keyframes || !(numKeyframes = keyframes->GetSize()->GetValueDirect()))
    {
    continue;
    }

        startKey = m_startKeys->GetSize()->GetValueDirect() > channel ? 
    (*m_startKeys)[channel]->GetValueDirect() : -1;
    endKey = m_endKeys->GetSize()->GetValueDirect() > channel ?
    (*m_endKeys)[channel]->GetValueDirect() : -1;
    preBehavior = m_preBehaviors->GetSize()->GetValueDirect() > channel ?
    (eEndBehavior) (*m_preBehaviors)[channel]->GetValueDirect() : eEndBehavior_Reset;
    postBehavior = m_postBehaviors->GetSize()->GetValueDirect() > channel ?
    (eEndBehavior) (*m_postBehaviors)[channel]->GetValueDirect() : eEndBehavior_Reset;

        if (endKey < startKey)
    {
    endKey = startKey;
    }

        // set first/last keys to evaluate
    first = keyframes->begin();
    last = keyframes->end();
    last--;

        if (startKey >= 0 && startKey < (int) keyframes->size())
    {
    for (key=0; key < startKey; key++, first++)
    ;
    }

        if (endKey >= 0 && endKey < (int) keyframes->size())
    {
    last = keyframes->begin();
    for (key=0; key < endKey; key++, last++)
    ;
    }

        // interpolate
    fvalues[0] = Interpolate(time, *keyframes, first, last, preBehavior, postBehavior);

        // output result
    Output((*m_resultValues)[channel], fvalues);
    }

	m_lastTime = time;
    m_evaluated = true;
    */

    var first, last;
    var pre, post;

    // for each channel...
    for (var i = 0; i < this.channels.vector.length; i++)
    {
        var keyframes = this.channels.getAt(i);
        if (keyframes.vector.length == 0) continue;

        first = keyframes.getAt(0); // TODO
        last = keyframes.getAt(keyframes.vector.length - 1); // TODO

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

	// don't expire without evaluating at least once
	if (!this.evaluated)
	{
		return;
	}

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
	var fStartTime = -1;
	var fEndTime  = -1;
	var fShortest = FLT_MAX;
	var fLongest = -FLT_MAX;
	var iStartKey = 0;
	var iEndKey = 0;
	var iPost = 0;
	var keyframes = null;
	var keyframe = null;
	var startKey = null;
	var endKey = null;
	var postBehavior = null;
	var numChannels = this.channels.vector.length;
	for (var i = 0; i < numChannels; i++)
	{
		// Check for start and end times set for this eval
		// Use them if set.  Note:  the SG handles rendering
		// according to the set start and end time, but we also
		// need to manage it here in order to NOT call evaluate
		// when the time is out of range

		keyframes = this.channels.getAt(i);
		/*
		startKey = GetStartKey(i);
		if (startKey)
		{
			iStartKey = startKey->GetValueDirect();
		}

		if (iStartKey != -1)
		{
			keyframe = (*keyframes)[iStartKey];
		}
		else*/
		{
			keyframe = keyframes.getAt(0);
		}

		fStartTime = keyframe != null ? keyframe.getTime() : fStartTime;

		// save the smallest start time for all channels
		fShortest = fStartTime < fShortest ? fStartTime : fShortest;
		/*
		endKey = GetEndKey(i);
		if (endKey)
		{
			iEndKey = endKey->GetValueDirect();
		}

		// the end time for this animation is located either at the
		// user-specified location returned from GetEndKey OR it is
		// the last Keyframe (frame?) of the animation
		if (iEndKey != -1)
		{
			keyframe = (*keyframes)[iEndKey];
		}
		else*/
		{
			keyframe = keyframes.getAt(keyframes.vector.length - 1);
		}

		// whichever keyframe was retreived
		fEndTime = keyframe != null ? keyframe.getTime() : fEndTime;

		// save the longest end time for all channels
		fLongest = fEndTime >= fLongest ? fEndTime : fLongest;

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
		}
	}

	// if the eval's current time either:
	// 1. has advanced passed its longest keyframe OR
	// 2. is not yet at its start time
	// then stop evaluating it.
	// NOTE: only check Constant end behaviors b/c Repeats and
	// Oscillators should keep running.  By definition, scenes w/
	// non-constant end behaviors will never AA
	// NOTE: check against m_lastTime to make sure we have evaluated the end (or beginning)
	// of the KFI before expiring
	if (!bAtLeastOneChannelAnimating &&
	   ((fShortest > fEvalTime && this.lastTime <= fShortest) ||
	    (fLongest  < fEvalTime && this.lastTime >= fLongest)))
	{
		// set expired flag
		this.expired.setValueDirect(true);
	}
}

function KeyframeInterpolator_TimeModifiedCB(attribute, container)
{
    container.timeModified();
}