WalkSimulator.prototype = new SceneInspector();
WalkSimulator.prototype.constructor = WalkSimulator;

function WalkSimulator()
{
    SceneInspector.call(this);
    this.className = "WalkSimulator";
    this.attrType = eAttrType.WalkSimulator;
}