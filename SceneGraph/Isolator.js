Isolator.prototype = new Group();
Isolator.prototype.constructor = Isolator;

function Isolator()
{
    Group.call(this);
    this.className = "Isolator";
    this.attrType = eAttrType.Isolator;
    
    this.updateIsolateTransforms = true;
    this.updateIsolateLights = true;
    this.updateIsolateMaterials = true;
    this.updateIsolateTextures = true;
    this.updateIsolateFog = true;
    this.updateIsolateClipPlanes = true;
    
    this.isolateTransforms = new BooleanAttr(false);
    this.isolateLights = new BooleanAttr(false);
    this.isolateMaterials = new BooleanAttr(false);
    this.isolateTextures = new BooleanAttr(false);
    this.isolateDissolves = new BooleanAttr(false);
    this.isolateGlobalIlluminations = new BooleanAttr(false);
    this.isolateLightModels = new BooleanAttr(false);
    this.isolateFog = new BooleanAttr(false);
    this.isolateClipPlanes = new BooleanAttr(false);
    this.isolateRenderModes = new BooleanAttr(false);

    this.isolateTransforms.addModifiedCB(Isolator_IsolateTransformsModifiedCB, this);
    this.isolateLights.addModifiedCB(Isolator_IsolateLightsModifiedCB, this);
    this.isolateMaterials.addModifiedCB(Isolator_IsolateMaterialsModifiedCB, this);
    this.isolateTextures.addModifiedCB(Isolator_IsolateTexturesModifiedCB, this);
    this.isolateFog.addModifiedCB(Isolator_IsolateFogModifiedCB, this);
    this.isolateClipPlanes.addModifiedCB(Isolator_IsolateClipPlanesModifiedCB, this);
    
    this.registerAttribute(this.isolateTransforms, "isolateTransforms");
    this.registerAttribute(this.isolateLights, "isolateLights");
    this.registerAttribute(this.isolateMaterials, "isolateMaterials");
    this.registerAttribute(this.isolateTextures, "isolateTextures");
    this.registerAttribute(this.isolateDissolves, "isolateDissolves");
    this.registerAttribute(this.isolateGlobalIlluminations, "isolateGlobalIlluminations");
    this.registerAttribute(this.isolateLightModels, "isolateLightModels");
    this.registerAttribute(this.isolateFog, "isolateFog");
    this.registerAttribute(this.isolateClipPlanes, "isolateClipPlanes");
    this.registerAttribute(this.isolateRenderModes, "isolateRenderModes");
}

Isolator.prototype.update = function(params, visitChildren)
{
    // call base-class implementation
    Group.prototype.update.call(this, params, visitChildren);
}

Isolator.prototype.apply = function(directive, params, visitChildren)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        // call base-class implementation
        Group.prototype.apply.call(this, directive, params, visitChildren);
        return;
    }

    var isolateTransforms = this.isolateTransforms.getValueDirect();
    var isolateTextures = this.isolateTextures.getValueDirect();
    var isolateDissolves = this.isolateDissolves.getValueDirect();
    var isolateClipPlanes = this.isolateClipPlanes.getValueDirect();

    var lastDissolve = 0;
    var dissolveNode = null;

    var lastProjMatrix = null;
    var lastViewMatrix = null;
    var lastWorldMatrix = null;
    
    switch (directive)
    {
        case "render":
            {
                this.pushIsolatedStates();

                // TODO

                // push transforms
                if (isolateTransforms)
                {
                    lastProjMatrix = params.projMatrix;
                    lastViewMatrix = params.viewMatrix;
                    lastWorldMatrix = params.worldMatrix;
                    
                    // TEMP -- move to pushIsolatedStates
                	this.graphMgr.renderContext.setMatrixMode(RC_PROJECTION);
                	this.graphMgr.renderContext.pushMatrix();
                	this.graphMgr.renderContext.setMatrixMode(RC_MODELVIEW);
                	this.graphMgr.renderContext.pushMatrix();
                }
                
                // push textures
                if (isolateTextures)
                {
                    this.graphMgr.textureArrayStack.push(new TextureArray(this.graphMgr.textureArrayStack.top()));

                    // TODO: projection stack 
                }
            }
            break;

        case "rayPick":
            {
                // push dissolve and dissolve node
                if (isolateDissolves)
                {
                    lastDissolve = params.dissolve;
                    dissolveNode = this.graphMgr.getCurrentDissolve();
                }

                // push transforms
                if (isolateTransforms)
                {
                    // TODO
                }

                // push clip planes
                if (isolateClipPlanes)
                {
                    // TODO
                }
            }
            break;

        case "bbox":
            {
                // push transforms
                if (isolateTransforms)
                {
                    lastWorldMatrix = params.worldMatrix;
                }
            }
            break;
    }

    // call base-class implementation
    Group.prototype.apply.call(this, directive, params, visitChildren);

    switch (directive)
    {
        case "render":
            {
                this.popIsolatedStates();

                // TODO

                // pop transforms
                if (isolateTransforms)
                {
                    params.projMatrix = lastProjMatrix;
                    params.viewMatrix = lastViewMatrix;
                    params.worldMatrix = lastWorldMatrix;
                    
                    // TEMP -- move to popIsolatedStates
                    this.graphMgr.renderContext.setMatrixMode(RC_PROJECTION);
                	this.graphMgr.renderContext.popMatrix();
                	this.graphMgr.renderContext.setMatrixMode(RC_MODELVIEW);
                	this.graphMgr.renderContext.popMatrix();
                }
                    
                // pop textures
                if (isolateTextures)
                {
                    this.graphMgr.textureArrayStack.pop();

                    // TODO: projection stack 
                }
            }
            break;

        case "rayPick":
            {
                // pop dissolve
                if (isolateDissolves)
                {
                    params.dissolve = lastDissolve;
                    this.graphMgr.setCurrentDissolve(dissolveNode);
                }

                // pop transforms
                if (isolateTransforms)
                {
                    // TODO
                }

                // pop clip planes
                if (isolateClipPlanes)
                {
                    // TODO
                }
            }
            break;

        case "bbox":
            {
                // pop transforms
                if (isolateTransforms)
                {
                    params.worldMatrix = lastWorldMatrix;
                }
            }
            break;
    }
}

Isolator.prototype.pushIsolatedStates = function()
{
    // TODO
    
    
}

Isolator.prototype.popIsolatedStates = function()
{
    // TODO
}

function Isolator_IsolateTransformsModifiedCB(attribute, container)
{
    container.updateIsolateTransforms = true;
    container.incrementModificationCount();
}

function Isolator_IsolateLightsModifiedCB(attribute, container)
{
    container.updateIsolateLights = true;
    container.incrementModificationCount();
}

function Isolator_IsolateMaterialsModifiedCB(attribute, container)
{
    container.updateIsolateMaterials = true;
    container.incrementModificationCount();
}
 
function Isolator_IsolateTexturesModifiedCB(attribute, container)
{
    container.updateIsolateTextures = true;
    container.incrementModificationCount();
}

function Isolator_IsolateFogModifiedCB(attribute, container)
{
    container.updateIsolateFog = true;
    container.incrementModificationCount();
}

function Isolator_IsolateClipPlanesModifiedCB(attribute, container)
{
    container.updateIsolateClipPlanes = true;
    container.incrementModificationCount();
}
