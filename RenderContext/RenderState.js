var RENDERSTATE_TRANSFORM_BIT      = 0x001;
var RENDERSTATE_LIGHTING_BIT       = 0x002;
var RENDERSTATE_MATERIAL_BIT       = 0x004;
var RENDERSTATE_FOG_BIT            = 0x008;
var RENDERSTATE_CLIP_PLANE_BIT     = 0x010;
var RENDERSTATE_ZBUFFER_BIT        = 0x020;
var RENDERSTATE_ALL_BITS           = 0x03F;

function RenderStateRec()
{
    this.projMatrix = new Matrix4x4();
    this.viewMatrix = new Matrix4x4();
    this.worldViewMatrix = new Matrix4x4();
    // TODO: textureMatrices
    this.lightIndices = [];
    this.lightStates = [];
    this.lightMatrices = [];
    this.lightingEnabled = false;
    this.materialDesc = new MaterialDesc();
    // TODO: fogParams
    this.fogEnabled = false;
    this.clipPlaneIndices = [];
    this.clipPlanes = [];
    this.clipPlaneMatrices = [];
    this.zBufferEnabled = false;
    this.zBufferWriteEnabled = false;
}

function RenderState(rc)
{
    this.renderContext = rc;

    this.stateStack = new Stack();
    
    this.push = function(mask)
    {
        var rec = this.getState(mask);
        this.stateStack.push(rec);
    }

    this.pop = function(mask)
    {
        if (this.stateStack.empty()) return;

        var rec = this.stateStack.top();
        this.setState(mask, rec);
        this.stateStack.pop();
    }

    this.getState = function(mask)
    {
        var rec = new RenderStateRec();

        if (mask & RENDERSTATE_TRANSFORM_BIT)
        {
            rec.projMatrix = this.renderContext.projectionMatrixStack.top();
            rec.viewMatrix = this.renderContext.viewMatrixStack.top();
            rec.worldViewMatrix = this.renderContext.worldMatrixStack.top();
        }

        if (mask & RENDERSTATE_LIGHTING_BIT)
        {
            rec.lightIndices = this.renderContext.getEnabledLights();
            for (var i = 0; i < rec.lightIndices.length; i++)
            {
                var light = this.renderContext.getLight(rec.lightIndices[i]);
                rec.lightStates[i] = light.desc;
                rec.lightMatrices[i] = light.matrix;
            }
            rec.lightingEnabled = this.renderContext.enabled(eRenderMode.Lighting);
        }

        if (mask & RENDERSTATE_MATERIAL_BIT)
        {
            rec.materialDesc = this.renderContext.getFrontMaterial();
        }

        if (mask & RENDERSTATE_FOG_BIT)
        {
        }

        if (mask & RENDERSTATE_CLIP_PLANE_BIT)
        {
        }

        if (mask & RENDERSTATE_ZBUFFER_BIT)
        {
            rec.zBufferEnabled = this.renderContext.enabled(eRenderMode.DepthTest);
            rec.zBufferWriteEnabled = this.renderContext.enabled(eRenderMode.DepthBufferWrite);
        }

        return rec;
    }

    this.setState = function(mask, rec)
    {
        if (mask & RENDERSTATE_TRANSFORM_BIT)
        {
            this.renderContext.projectionMatrixStack.loadMatrix(rec.projMatrix);
            this.renderContext.applyProjectionTransform();
            this.renderContext.viewMatrixStack.loadMatrix(rec.viewMatrix);
            this.renderContext.applyViewTransform();
            this.renderContext.worldMatrixStack.loadMatrix(rec.worldViewMatrix);
            this.renderContext.applyWorldTransform();
        }

        if (mask & RENDERSTATE_LIGHTING_BIT)
        {
            // set light state for each set light within this state block
            for (var i = 0; i < rec.lightIndices.length; i++)
            {
                this.renderContext.worldMatrixStack.push(rec.lightMatrices[i]);
                this.renderContext.setLight(rec.lightIndices[i], rec.lightStates[i]);
                this.renderContext.worldMatrixStack.pop();
            }

            // set light state to disabled for lights set outside this state block
            this.renderContext.setEnabledLights(rec.lightIndices);

            // set current lighting enabled
            if (rec.lightingEnabled)
            {
                this.renderContext.enable(eRenderMode.Lighting);
            }
            else
            {
                this.renderContext.disable(eRenderMode.Lighting);
            }
        }

        if (mask & RENDERSTATE_MATERIAL_BIT)
        {
            this.renderContext.setFrontMaterial(rec.materialDesc);
        }

        if (mask & RENDERSTATE_FOG_BIT)
        {
        }

        if (mask & RENDERSTATE_CLIP_PLANE_BIT)
        {
        }

        if (mask & RENDERSTATE_ZBUFFER_BIT)
        {
            if (rec.zBufferEnabled)
            {
                this.renderContext.enable(eRenderMode.DepthTest);
            }
            else
            {
                this.renderContext.disable(eRenderMode.depthTest);
            }

            if (rec.zBufferWriteEnabled)
            {
                this.renderContext.enable(eRenderMode.DepthBufferWrite);
            }
            else
            {
                this.renderContext.disable(eRenderMode.DepthBufferWrite);
            }
        }
    }
}