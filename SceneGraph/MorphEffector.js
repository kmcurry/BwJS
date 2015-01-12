MorphEffector.prototype = new Evaluator();
MorphEffector.prototype.constructor = MorphEffector;

function MorphEffector()
{
    Evaluator.call(this);
    this.className = "MorphEffector";
    this.attrType = eAttrType.MorphEffector;
    
    this.morphAmt = new NumberAttr(0);
    this.morphIncr = new NumberAttr(0);
    this.sourceVertices = new NumberArrayAttr();
    this.targetVertices = new NumberArrayAttr();
    this.resultVertices = new NumberArrayAttr();
    
    this.registerAttribute(this.morphAmt, "morphAmt");
    this.registerAttribute(this.morphIncr, "morphIncr");
    this.registerAttribute(this.sourceVertices, "sourceVertices");
    this.registerAttribute(this.targetVertices, "targetVertices");
    this.registerAttribute(this.resultVertices, "resultVertices");
}

MorphEffector.prototype.evaluate = function()
{
    // get input values

    // morph amount
    var morphAmt = this.morphAmt.getValueDirect();

    // morph increment
    var morphIncr = this.morphIncr.getValueDirect();

    // increment morph amount by morph increment
    morphAmt += morphIncr;

    // clamp morph amount to range [0, 1]
    morphAmt = clamp(morphAmt, 0, 1);

    // update morph amount attribute value
    this.morphAmt.setValueDirect(morphAmt);

    var sourceVertices = this.sourceVertices.getValueDirect();
    var targetVertices = this.targetVertices.getValueDirect();
    var resultVertices = [];
    
    var count = Math.min(sourceVertices.length, targetVertices.length);
    resultVertices.length = count;
    
    for (var i = 0; i < count; i++)
    {
        resultVertices[i] = (targetVertices[i] - sourceVertices[i]) * morphAmt + sourceVertices[i];
    }
    
    this.resultVertices.setValue(resultVertices);
}
