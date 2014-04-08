SGDirective.prototype = new Directive();
SGDirective.prototype.constructor = SGDirective;

function SGDirective()
{
    Directive.call(this);
    this.className = "SGDirective";
    
    this.graphMgr = null;
}

SGDirective.prototype.setGraphMgr = function(graphMgr)
{
    this.graphMgr = graphMgr;
}