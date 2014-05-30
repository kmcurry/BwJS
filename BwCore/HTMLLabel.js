
 HTMLLabel.prototype.Initialize = function()
{
	this.attrType = eAttrType_Node_HTMLLabel;
	this.typeString = "HTMLLabel";

	if (!(this.windowHandle) return;
	if (!(this.labelWidth) return;
	if (!(this.labelHeight) return;
	if (!(this.pageWidth) return;
	if (!(this.pageHeight) return;
	if (!(this.htmlLabelStyle) return;

	this.styles.AddModifiedCB(HTMLLabel_StylesModifiedCB, this);
	this.windowHandle.AddModifiedCB(HTMLLabel_WindowHandleModifiedCB, this);
    this.renderSequenceSlot.AddModifiedCB(HTMLLabel_RenderSequenceSlotModifiedCB, this);

	RegisterAttribute(this.windowHandle, "windowHandle");
	RegisterAttribute(this.labelWidth, "labelWidth");
	RegisterAttribute(this.labelHeight, "labelHeight");
	RegisterAttribute(this.pageWidth, "pageWidth");
	RegisterAttribute(this.pageHeight, "pageHeight");

	this.styles.RegisterStyle(this.htmlLabelStyle, "htmlLabelStyle");

	this.wb = WebBrowser.prototype.Instance(eWebBrowserAPI_IWebBrowser2);

	this.labelRect.left = this.labelRect.top = this.labelRect.right = this.labelRect.bottom = 0;

	this.graphMgr.GetNodeRegistry().RegisterNode(this, eAttrType_Node_HTMLLabel);

    // causes issues w/ load of HTML; too much idle processing
	//this.taskThread.Start();
}

 HTMLLabel.prototype.Update = function(params, visitChildren)
{
	this.applyLock.Lock("HTMLLabel.prototype.Update");//(CReadWriteLock.prototype.eRWLockMode_Write);

    if (this.updateWebBrowser)
    {
        this.updateWebBrowser = false;

        if (UpdateWebBrowser())
        {
            this.updateLabelHTML = true;
        }
    }

	if (this.updateLabel || this.updateLabelHTML)
	{
        this.updateLabel = false;
        if (UpdateLabel(this.updateLabelHTML))
        {
            this.updateLabelHTML = false;
        }
        // added this block in response to Navigate fails, which was causing repeated fails due to timing issues (?)
        // it throttles back the time between calls, and addresses the problem effectively; this could be made threaded, 
        // but this change is less impactful for now.
        else if (this.updateLabelHTML) 
        {
            Sleep(50);
        }
	}
	else if (this.show.GetValueDirect())
	{
		UpdateLabel(false);
	}

    UpdateMouseOver();

	this.applyLock.Unlock();//(CReadWriteLock.prototype.eRWLockMode_Write);

	// call base-class implementation
	RasterComponent.prototype.Update(params, visitChildren);
}

 HTMLLabel.prototype.Apply = function(directive, params, visitChildren)
{
	if (!this.enabled.GetValueDirect())
    {
		// call base-class implementation
		RasterComponent.prototype.Apply(directive, params, visitChildren);
        return;
    }

	this.applyLock.Lock("HTMLLabel.prototype.Apply");//(CReadWriteLock.prototype.eRWLockMode_Read);

    switch (directive)
    {
	case eAttrType_Directive_Render:
		{
            var drawNow = true;
            var renderParams = params;
            if (renderParams)
            {
				var worldViewMatrix;
				this.renderEngine.GetMatrix(ReMatrixMode_WorldView, worldViewMatrix);

				if (this.cullable.GetValueDirect() == true &&
					OutsideViewVolume(renderParams.viewVolume, 1.0f, renderParams.viewMatrix))//worldViewMatrix))
                {
//#ifdef _DEBUG
                    //OutputDebugMsg("Label: OutsideViewVolume() returned true; culling label\n");
//#endif //_DEBUG
                    // outside viewing-volume, skip drawing
                    drawNow = false;
                }
                else if (this.renderSequenceSlot.GetValueDirect() > 0)
                {
                    if (renderParams.renderSequenceAgent)
                    {
                        // add to render sequence agent for sequenced drawing
                        renderParams.renderSequenceAgent.AddObject(this, 
                            this.renderSequenceSlot.GetValueDirect(), 0.0f);
                        drawNow = false;
                    }
                }
            }

            if (drawNow)
            {
			    Draw();
            }
		}
		break;

	case eAttrType_Directive_RayPick:
        {
            var rayPickParams = params;
            if (rayPickParams)
            {
                if (this.selectable.GetValueDirect() == true &&
                    this.show.GetValueDirect() == true)
                {
                    if (IsSelected(rayPickParams.clickPointX, rayPickParams.clickPointY))
                    {
//#ifdef _DEBUG
						//OutputDebugMsg("Label: IsSelected() returned true\n");
//#endif //_DEBUG
                        // create path for selected geometry
                        var pickRecord;
                        var picked = params.currentNodePath);
                        if (!picked) return;
                        picked.AddNode(this); // this node won't be added to current path until base class implementation is invoked
                        if (!(Push_Back<std.prototype.pair<std.prototype.pair<GcCamera*, CPath*>, TRayPickRecord> >(rayPickParams.picked, 
                            std.prototype.pair<std.prototype.pair<GcCamera*, CPath*>, TRayPickRecord>(
                            std.prototype.pair<GcCamera*, CPath*>(
                            rayPickParams.currentCamera, picked), pickRecord)))) 
                        {
                            this.applyLock.Unlock();//(CReadWriteLock.prototype.eRWLockMode_Read);
                            return;
                        }
                    }
                }
            }
        }
        break;

	default:
		break;
	}

	this.applyLock.Unlock();//(CReadWriteLock.prototype.eRWLockMode_Read);

	// call base-class implementation
	RasterComponent.prototype.Apply(directive, params, visitChildren);
}

HTMLLabel.prototype.UpdateWebBrowser = function()
{
    var windowHandle = this.wb.GetAttribute("windowHandle").GetValueDirect();
    //SAFE_RELEASE(this.wb);
    this.wb = WebBrowser.prototype.Instance(eWebBrowserAPI_IWebBrowser2);
    if (this.wb)
    {
        this.wb.GetAttribute("windowHandle").SetValueDirect(windowHandle);
    }

    return ; //this.wb ? eNO_ERR : eERR_FAIL;
}

HTMLLabel.prototype.UpdateLabel = function(navigate)
{
	if (!this.wb)
	{
		return;
	}

	// get label style (if specified)
	var labelStyle = this.styles.GetStyle();
	if (!labelStyle)
	{
		return;
	}

	// navigate to page (or load html)
	if (navigate)
	{
        var pageWidth = 0;
		var pageHeight = 0;
 		var url;
		labelStyle.url().GetValueDirect(url);
		if (!url.empty() && strcmp(url.c_str(), ""))
		{
			if (this.wb.Navigate(labelStyle.url().GetValueDirect(url), pageWidth, pageHeight))
            {
                OutputDebugMsg("WARN: WebBrowser.prototype.Navigate() failed\n");
                return;
            }
		}
		else
		{
			var html;
			labelStyle.html().GetValueDirect(html);
			if (!html.empty() && strcmp(html.c_str(), ""))
			{
                try
                {
				    if (this.wb.Load(FormatHTML(html), pageWidth, pageHeight))
                    {
                        return ;
                    }
				    // re-format html to include <div style="width:[this.pageWidth]px"></div> for text and bgColor
				    labelStyle.html().GetValueDirect(html);
				    if (this.wb.Load(FormatHTML(html, pageWidth), pageWidth, pageHeight))
                    {
                        return ;
                    }
                }
                catch (...)
                {
                    OutputDebugMsg("WARN: exception caught in HTMLLabel.prototype.UpdateLabel()\n");
                    s_globalExcept.Throw(Except.prototype.eExceptCode_Unspecified);
                    return ;
                }
			}
		}

        // adjust dimensions according to system text size (normal is 96)
        int iDPIX = .prototype.GetDeviceCaps(.prototype.GetDC(NULL), LOGPIXELSX);
        int iDPIY = .prototype.GetDeviceCaps(.prototype.GetDC(NULL), LOGPIXELSY);
        pageWidth  = ROUND(pageWidth * (iDPIX / 96.0f));
        pageHeight = ROUND(pageHeight * (iDPIY / 96.0f));

		this.pageWidth.SetValueDirect(pageWidth);
		this.pageHeight.SetValueDirect(pageHeight);
	}

	if (this.show.GetValueDirect())
	{
		// get label dimensions
		UpdateLabelDimensions();

		// capture label
		if (Capture(labelStyle.left().GetValueDirect(), labelStyle.top().GetValueDirect(), 
				            this.labelWidth.GetValueDirect(), this.labelHeight.GetValueDirect()))
        {
            return ;
        }
	}

    UpdateShowStates();

    return;
}


 HTMLLabel.prototype.UpdateMouseOver()
{
    if (!this.wb ||
         this.x < 0 ||
         this.y < 0)
	{
		return;
	}

    this.threadLock.Lock("HTMLLabel.prototype.UpdateMouseOver");

    var mouseOverLink = false;
    this.elementHit.element = NULL;
    this.elementHit.href = "";
    this.elementHit.target = "";

    if (this.wb.ElementFromPoint(this.x, this.y, this.elementHit.element))
	{
		var tag;
		var hr = this.elementHit.element.get_tagName(&tag);
		if (hr)
		{
			var tagString = NULL;
			var bstr_tag(tag, false); tagString = bstr_tag;

			if (!_stricmp("A", tagString))
			{
                mouseOverLink = true;

				var vtValue;
				var = vtValue;
				hr = this.elementHit.element.getAttribute(L"href", 0, vtValue);
				if (SUCCEEDED(hr))
				{
                    if (vtValue.bstrVal)
                    {
					    _bstr_t bstr_href(vtValue.bstrVal, false); 
                        this.elementHit.href = (char*) bstr_href;

					    // determine if user wants a popup window for the link
					    hr = this.elementHit.element.getAttribute(L"target", 0, &vtValue);
					    if (SUCCEEDED(hr))
					    {
                            if (vtValue.bstrVal)
                            {
						        _bstr_t bstr_target(vtValue.bstrVal, false);
                                this.elementHit.target = bstr_target;
                            }
                            else // !vtValue.bstrVal
                            {
                                this.elementHit.target = "";
                            }
					    }
                    }
                    else // !vtValue.bstrVal
                    {
                        this.elementHit.href = "";
                    }
				}
            }
		}
	}

    this.threadLock.Unlock();

    UpdateCursor(mouseOverLink);
}

 HTMLLabel.prototype.UpdateCursor = function( mouseOverLink)
{
    const std.prototype.vector<CAttributeContainer*>* attributes;
    if (this.registry.Get("ViewportMgr", &attributes))
    {
        attributes)[0].GetAttribute("cursor").SetValueDirect(mouseOverLink ? "Hand" : "Arrow");
    }
}

 HTMLLabel.prototype.UpdateLabelDimensions = function()
{
    // get label style (if specified)
	HTMLLabelStyleAttr* labelStyle = this.styles.GetStyle<HTMLLabelStyleAttr>();

	var pageWidth = this.pageWidth.GetValueDirect();
	var pageHeight = this.pageHeight.GetValueDirect();
    var labelWidth = labelStyle ? labelStyle.width().GetValueDirect() : 0;
	var labelHeight = labelStyle ? labelStyle.height().GetValueDirect() : 0;
    if (this.sizeStates.pageWidth == pageWidth &&
        this.sizeStates.pageHeight == pageHeight &&
        this.sizeStates.labelWidth == labelWidth &&
        this.sizeStates.labelHeight == labelHeight)
    {
        // nothing to update
        return;
    }

    if (pageWidth == 0 || pageHeight == 0)
    {
        this.wb.GetDimensions(pageWidth, pageHeight);

        // adjust dimensions according to system text size (normal is 96)
        int iDPIX = .prototype.GetDeviceCaps(.prototype.GetDC(NULL), LOGPIXELSX);
        int iDPIY = .prototype.GetDeviceCaps(.prototype.GetDC(NULL), LOGPIXELSY);
        pageWidth  = ROUND(pageWidth * (iDPIX / 96.0f));
        pageHeight = ROUND(pageHeight * (iDPIY / 96.0f));

        this.pageWidth.SetValueDirect(pageWidth);
        this.pageHeight.SetValueDirect(pageHeight);
    }	
	
	if (labelWidth == 0 || labelHeight == 0)
	{
		var clientWidth = 0, clientHeight = 0;
		var windowHandle = this.windowHandle.GetValueDirect();
		if (windowHandle) windowHandle.GetClientDimensions(clientWidth, clientHeight);
		if (labelWidth == 0)
		{	
			if (this.labelRect.left + pageWidth <= clientWidth)
			{
				labelWidth = pageWidth;
			}
			else
			{
				labelWidth = clientWidth - this.labelRect.left;
			}
		}
		if (labelHeight == 0)
		{
			if (this.labelRect.top + pageHeight <= clientHeight)
			{
				labelHeight = pageHeight;
			}
			else
			{
				labelHeight = clientHeight - this.labelRect.top;
			}
		}
	}

    // get scrollbar dimensions
    var vScrollWidth = 0;
	var hScrollHeight = 0;
	int left, right, top, bottom;
	if (this.vScrollBar)
	{
		this.vScrollBar.GetAttribute("componentRect").GetValueDirect(left, top, right, bottom);

		vScrollWidth = (right - left);
	}
	if (this.hScrollBar)
	{
		this.hScrollBar.GetAttribute("componentRect").GetValueDirect(left, top, right, bottom);

		hScrollHeight = (bottom - top);
	}

    var vScrollBarLabelStyle = NULL;
	var hScrollBarLabelStyle = NULL;
	vScrollBarLabelStyle = this.vScrollBar.GetAttribute("styles").GetStyle();
	hScrollBarLabelStyle = this.hScrollBar.GetAttribute("styles").GetStyle();
	if (vScrollBarLabelStyle && hScrollBarLabelStyle)
	{
		// width
		if (labelWidth >= pageWidth)
		{
			this.hScrollBar.GetAttribute("scrollPosition").RemoveTarget(labelStyle.left());
			labelStyle.left().SetValueDirect(0, false);
            this.showStates.hScrollBar = false;
		}
		else // page too wide for labe, show horizontal scroll bar
		{
            labelWidth -= vScrollWidth;

            this.hScrollBar.GetAttribute("scrollPosition").RemoveTarget(labelStyle.left()); // no duplicates
			this.hScrollBar.GetAttribute("scrollPosition").AddTarget(labelStyle.left());
            this.showStates.hScrollBar = true;
			hScrollBarLabelStyle.length().SetValueDirect(labelWidth, false);
			hScrollBarLabelStyle.minPosition().SetValueDirect((float) 0, false);
			hScrollBarLabelStyle.maxPosition().SetValueDirect((float) (pageWidth - labelWidth), false);
		}

		// height
		if (labelHeight >= pageHeight)
		{
			this.vScrollBar.GetAttribute("scrollPosition").RemoveTarget(labelStyle.top());
			labelStyle.left().SetValueDirect(0, false);
            this.showStates.vScrollBar = false;
		}
		else // page too wide for labe, show horizontal scroll bar
		{
            labelHeight -= hScrollHeight;

			this.vScrollBar.GetAttribute("scrollPosition").RemoveTarget(labelStyle.top()); // no duplicates
			this.vScrollBar.GetAttribute("scrollPosition").AddTarget(labelStyle.top());
            this.showStates.vScrollBar = true;
			vScrollBarLabelStyle.length().SetValueDirect(labelHeight, false);
			vScrollBarLabelStyle.minPosition().SetValueDirect((float) 0, false);
			vScrollBarLabelStyle.maxPosition().SetValueDirect((float) (pageHeight - labelHeight), false);
		}
    }

	this.labelWidth.SetValueDirect(labelWidth);
	this.labelHeight.SetValueDirect(labelHeight);

	this.componentRect.SetValueDirect(0, 0, labelWidth, labelHeight);

    this.sizeStates.pageWidth = pageWidth;
    this.sizeStates.pageHeight = pageHeight;
    this.sizeStates.labelWidth = labelWidth;
    this.sizeStates.labelHeight = labelHeight;
    this.sizeStates.vScrollWidth = vScrollWidth;
    this.sizeStates.hScrollHeight = hScrollHeight;
}


 HTMLLabel.prototype.UpdateShowStates()
{
    switch (this.show.GetValueDirect())
	{
	case true:
		{
			if (this.vScrollBar) this.vScrollBar.GetAttribute("show").SetValueDirect(this.showStates.vScrollBar);
			if (this.hScrollBar)this.hScrollBar.GetAttribute("show").SetValueDirect(this.showStates.hScrollBar);
		}
		break;

	case false:
		{
			if (this.vScrollBar) this.vScrollBar.GetAttribute("show").SetValueDirect(false);
			if (this.hScrollBar) this.hScrollBar.GetAttribute("show").SetValueDirect(false);
			// show states are maintained by Update(), so that when show goes from false to true, the last show state is restored
		}
		break;
	};
}

HTMLLabel.prototype.Capture = function(x, y, width, height)
{
	// get label style (if specified)
	var labelStyle = this.styles.GetStyle();
	if (!labelStyle)
	{
		return ;
	}

	var r
	var g
	var b
	var a;
	labelStyle.bgColor().GetValueDirect(r, g, b, a);
	
    var result = this.wb.Capture(this.label, x, y, width, height, TPixel(r, g, b, a), this.renderEngine.GetFrameBufferOrigin());
    if (result)
    {
        //this.updateLabelHTML = true;
    }

    return result;
}

HTMLLabel.prototype.Draw = function()
{
	if (!(this.show.GetValueDirect()))
	{
		return;
	}

	// get render engine
    var renderEngine = this.graphMgr.GetRenderEngine();
    if (!renderEngine)
    {
        return;
    }

	// determine the rendering positions
	var labelX = 0;
	var labelY = 0;
	GetRenderingPositions(labelX, labelY);

	// get current viewport
    var x, y;
    var width, height;
    renderEngine.GetViewport(x, y, width, height);

	// draw portion of label/icon within rendering area
	var srcX, srcY, dstX, dstY;

	renderEngine.EnableRenderMode(Re_AlphaBlend, true);
	renderEngine.SetBlendFactor(Re_SrcAlpha, Re_OneMinusSrcAlpha);

	// draw label
	if (this.label.pixels)
	{
		var drawLabel = true;

		srcX = 0;
		dstX = labelX;
		var labelWidth = this.label.width;
		if (labelX < x) 
		{
			dstX = x;
			srcX = x - labelX;
			if (srcX <= labelWidth)
			{
				labelWidth -= srcX;
			}
			else // outside vp
			{
				drawLabel = false;
			}
		}
		if (dstX > x + width)
		{
			drawLabel = false;
		}
		else if (dstX + labelWidth > x + width)
		{
			labelWidth = x + width - dstX;
		}

		srcY = 0;
		dstY = labelY;
		var labelHeight = this.label.height;
		if (labelY < y) 
		{
			dstY = y;
			srcY = y - labelY;
			if (srcY <= labelHeight) 
			{
				labelHeight -= srcY;
			}
			else // outside vp
			{
				drawLabel = false;
			}
		}
		if (dstY > y +  height)
		{
			drawLabel = false;
		}
		else if (dstY + labelHeight > y + height)
		{
			labelHeight = y + height - dstY;
		}

		if (this.renderEngine.GetFrameBufferOrigin() == ReBufferOrigin_LowerLeft)
		{
			srcY = this.label.height - labelHeight - srcY;
		}

		if (drawLabel)
		{
			renderEngine.WriteFrameBuffer(srcX, srcY, dstX, dstY, labelWidth, labelHeight, this.label.pitch, this.label.pixelFormat,
				this.label.byteAlignment, this.label.pixels);

			this.labelRect.left   = dstX;
			this.labelRect.top	   = dstY;
			this.labelRect.right  = dstX + labelWidth;
			this.labelRect.bottom = dstY + labelHeight;

            if (this.vScrollBar)
				this.vScrollBar.GetAttribute("rasterPosition").SetValueDirect(this.labelRect.right, this.labelRect.top, 0);
			if (this.hScrollBar)
				this.hScrollBar.GetAttribute("rasterPosition").SetValueDirect( this.labelRect.left, this.labelRect.bottom, 0);
		}
		else // !drawLabel
		{
			this.labelRect.left = this.labelRect.top = this.labelRect.right = this.labelRect.bottom = 0;
		}

		this.screenRect.SetValueDirect(this.labelRect.left, this.labelRect.top, this.labelRect.right, this.labelRect.bottom);
	}

	renderEngine.EnableRenderMode(Re_AlphaBlend, false);
}


 HTMLLabel.prototype.GetRenderingPositions(int & labelX, int & labelY) const
{
	// get label style (if specified)
	HTMLLabelStyleAttr* labelStyle = this.styles.GetStyle<HTMLLabelStyleAttr>();
	
	// initialize
	labelX = labelY = 0;

	// get screen position
	// if user has set the raster position, use that instead
	CVector3Df screen = this.screenPosition.GetValueDirect();
	if (GetAttributeModificationCount(this.rasterPosition) > 0)
	{
		screen = this.rasterPosition.GetValueDirect();

        // offset by rasterOrigin
        std.prototype.string rasterOrigin;
        this.rasterOrigin.GetValueDirect(rasterOrigin);

        // get render engine
        RcRenderEngine* renderEngine = this.graphMgr.GetRenderEngine();
        if (renderEngine)
        {
            // get current viewport
            int x, y;
            var width, height;
            renderEngine.GetViewport(x, y, width, height);

            if (!strcmp("bottomLeft", rasterOrigin.c_str()))
	        {
                screen.y = y + height - screen.y;
            }
            else if (!strcmp("bottomCenter", rasterOrigin.c_str()))
            {
                screen.x = x + (width / 2) - screen.x;
                screen.y = y + height - screen.y;
            }
            else if (!strcmp("bottomRight", rasterOrigin.c_str()))
	        {
                screen.x = x + width - screen.x;
                screen.y = y + height - screen.y;
            }
            else if (!strcmp("middleLeft", rasterOrigin.c_str()))
            {
                screen.y = y + (height / 2) - screen.y;
            }
            else if (!strcmp("middleCenter", rasterOrigin.c_str()))
            {
                screen.x = x + (width / 2) - screen.x;
                screen.y = y + (height / 2) - screen.y;
            }
            else if (!strcmp("middleRight", rasterOrigin.c_str()))
            {
                screen.x = x + width - screen.x;
                screen.y = y + (height / 2) - screen.y;
            }
            else if (!strcmp("topCenter", rasterOrigin.c_str()))
            {
                screen.x = x + (width / 2) - screen.x;
            }
            else if (!strcmp("topRight", rasterOrigin.c_str()))
	        {
                screen.x = x + width - screen.x;
            }
            else // "topLeft" (default)
            {
            }
        }
	}
	
	// offset by inspection offset
	CVector3Df inspectionOffset = this.inspectionOffset.GetValueDirect();
	screen.x -= inspectionOffset.x;
	screen.y += inspectionOffset.y;

	// get anchor position
	int anchorX, anchorY;
	this.anchor.GetValueDirect(anchorX, anchorY);

	// get label origin
	std.prototype.string origin;
	this.origin.GetValueDirect(origin);

	// get buffer origin; offset anchor points by non-rotated height accordingly
	ReBufferOrigin bufferOrigin;
	if (!strcmp("bottomLeft", origin.c_str()))
	{
		bufferOrigin = ReBufferOrigin_LowerLeft;
	}
	else // upperLeft
	{
		bufferOrigin = ReBufferOrigin_UpperLeft;
	}

	// get label offset
	float labelOffsetX = 0, labelOffsetY = 0;
	if (labelStyle)
	{
		//labelStyle.offset().GetValueDirect(labelOffsetX, labelOffsetY);
	}

	// get label angle of rotation
	float angle = 0;//labelStyle ? labelStyle.angle().GetValueDirect() : 0;
	// clamp to range [0, 360)
	while (angle >= 360) angle -= 360;
	while (angle < 0) angle += 360;

	// measure from origin
	if (bufferOrigin == ReBufferOrigin_LowerLeft)
	{
		//anchorY = this.nonRotatedHeight - anchorY;
	}

	labelX = ROUND(screen.x + anchorX + labelOffsetX);
	labelY = ROUND(screen.y - anchorY + labelOffsetY);
	/*
	if (angle == 0)
	{
		if (!strcmp("topLeft", align.c_str()))
		{
			labelX -= this.label.width;
			labelY -= this.label.height;
		}
		else if (!strcmp("middleLeft", align.c_str()))
		{
			labelX -= this.label.width;
			labelY -= ROUND(this.label.height / 2.0f);	
		}
		else if (!strcmp("bottomLeft", align.c_str()))
		{
			labelX -= this.label.width;
		}
		else if (!strcmp("topCenter", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= this.label.height;
		}
		else if (!strcmp("middleCenter", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);
		}
		else if (!strcmp("bottomCenter", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
		}
		else if (!strcmp("topRight", align.c_str()))
		{
			labelY -= this.label.height;
		}
		else if (!strcmp("bottomRight", align.c_str()))
		{
		}
		else // "middleRight" (default)
		{
			labelY -= ROUND(this.label.height / 2.0f);
		}
	}
	else // angle != 0
	{
		if (!strcmp("topLeft", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			CVector2Df dir(1, 0);
			CMatrix4x4f m;
			float z;
			m.LoadZAxisRotation(angle);
			m.Transform(1, 0, 0, 0, dir.x, dir.y, z);

			dir *= max(this.label.width, this.label.height) / 2.0f;

			// subtract here for Left-side anchor (right side pivot)
			labelX -= ROUND(dir.x);
			labelY -= ROUND(dir.y);

			labelY -= ROUND(this.nonRotatedHeight / 2.0f);
		}
		else if (!strcmp("middleLeft", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			CVector2Df dir(1, 0);
			CMatrix4x4f m;
			float z;
			m.LoadZAxisRotation(angle);
			m.Transform(1, 0, 0, 0, dir.x, dir.y, z);

			dir *= max(this.label.width, this.label.height) / 2.0f;

			// subtract here for Left-side anchor (right side pivot)
			labelX -= ROUND(dir.x);
			labelY -= ROUND(dir.y);
		}
		else if (!strcmp("bottomLeft", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			CVector2Df dir(1, 0);
			CMatrix4x4f m;
			float z;
			m.LoadZAxisRotation(angle);
			m.Transform(1, 0, 0, 0, dir.x, dir.y, z);

			dir *= max(this.label.width, this.label.height) / 2.0f;

			// subtract here for Left-side anchor (right side pivot)
			labelX -= ROUND(dir.x);
			labelY -= ROUND(dir.y);

			labelY += ROUND(this.nonRotatedHeight / 2.0f);
		}
		else if (!strcmp("topCenter", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			labelY -= ROUND(this.nonRotatedHeight / 2.0f);
		}
		else if (!strcmp("middleCenter", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);
		}
		else if (!strcmp("bottomCenter", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			labelY += ROUND(this.nonRotatedHeight / 2.0f);
		}
		else if (!strcmp("topRight", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			CVector2Df dir(1, 0);
			CMatrix4x4f m;
			float z;
			m.LoadZAxisRotation(angle);
			m.Transform(1, 0, 0, 0, dir.x, dir.y, z);

			dir *= max(this.label.width, this.label.height) / 2.0f;

			// add here for Right-side anchor (left side pivot)
			labelX += ROUND(dir.x);
			labelY += ROUND(dir.y);

			labelY -= ROUND(this.nonRotatedHeight / 2.0f);
		}
		else if (!strcmp("bottomRight", align.c_str()))
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			CVector2Df dir(1, 0);
			CMatrix4x4f m;
			float z;
			m.LoadZAxisRotation(angle);
			m.Transform(1, 0, 0, 0, dir.x, dir.y, z);

			dir *= max(this.label.width, this.label.height) / 2.0f;

			// add here for Right-side anchor (left side pivot)
			labelX += ROUND(dir.x);
			labelY += ROUND(dir.y);

			labelY += ROUND(this.nonRotatedHeight / 2.0f);
		}
		else // "middleRight" (default)
		{
			labelX -= ROUND(this.label.width / 2.0f);
			labelY -= ROUND(this.label.height / 2.0f);

			CVector2Df dir(1, 0);
			CMatrix4x4f m;
			float z;
			m.LoadZAxisRotation(angle);
			m.Transform(1, 0, 0, 0, dir.x, dir.y, z);

			dir *= max(this.label.width, this.label.height) / 2.0f;

			// add here for Right-side anchor (left side pivot)
			labelX += ROUND(dir.x);
			labelY += ROUND(dir.y);
		}
	}
	*/
	// TODO: handle clampToViewport
}

var HTMLLabel.prototype.OutsideViewVolume(TViewVolume & viewVolume, float scale, CMatrix4x4f & worldView) const
{
	// TODO
	return false;
}

 HTMLLabel.prototype.IsSelected(int x, int y) const
{
	// call base class implementation
	var isSelected = RasterComponent.prototype.IsSelected(x, y);

	return isSelected;
}

const char* HTMLLabel.prototype.FormatHTML(std.prototype.string & raw) const
{
	if (raw.empty())
	{
		// TODO

		return raw.c_str();
	}

	// check for <![CDATA[ ]]> start/end tags; if present, remove
	std.prototype.string.prototype.size_type pos;
	if ((pos = raw.find("<![CDATA[")) != raw.npos)
	{
		raw.erase(pos, 9);
	}
	if ((pos = raw.find("]]>")) != raw.npos)
	{
		raw.erase(pos, 3);
	}

	// insert raw into body section 
	std.prototype.string html;
	html =  "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">";
	html += "<html xmlns=\"http://www.w3.org/1999/xhtml\">";
	html += "<head>";
	html += "<title></title>";
	html += "<body>";
	html += raw;
	html += "</body>";
	html += "</html>";

	raw = html;

	return raw.c_str();
}


const char* HTMLLabel.prototype.FormatHTML(std.prototype.string & raw, unsigned int style_width) const
{
	if (raw.empty())
	{
		// TODO

		return raw.c_str();
	}

	// check for <![CDATA[ ]]> start/end tags; if present, remove
	std.prototype.string.prototype.size_type pos;
	if ((pos = raw.find("<![CDATA[")) != raw.npos)
	{
		raw.erase(pos, 9);
	}
	if ((pos = raw.find("]]>")) != raw.npos)
	{
		raw.erase(pos, 3);
	}

	char s_style_width[16];
	_itoa_s(style_width, s_style_width, sizeof(s_style_width), 10);

	// insert raw into body section 
	std.prototype.string html;
	html =  "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">";
	html += "<html xmlns=\"http://www.w3.org/1999/xhtml\">";
	html += "<head>";
	html += "<title></title>";
	html += "<body>";
	html += "<div style=\"width:";
	html += s_style_width;
	html += "px\">";
	html += raw;
	html += "</div>";
	html += "</body>";
	html += "</html>";

	raw = html;

	return raw.c_str();
}

eERR_CODE HTMLLabel.prototype.LaunchPopup(const char* href) const
{
	if (!this.wb)
	{
		return ;
	}

    var width, height;
	return this.wb.Navigate(href, width, height, "_blank");
}

 HTMLLabel.prototype.RenderSequenceSlotModified()
{
	var slot = this.renderSequenceSlot.GetValueDirect();

	if (this.vScrollBar)
	{
		dynamic_cast<CUnsignedIntegerAttr*>(this.vScrollBar.GetAttribute("renderSequenceSlot")).SetValueDirect(slot + 1);
	}
	if (this.hScrollBar)
	{
		dynamic_cast<CUnsignedIntegerAttr*>(this.hScrollBar.GetAttribute("renderSequenceSlot")).SetValueDirect(slot + 1);
	}
}

eERR_CODE HTMLLabel.prototype.EventPerformed(CEvent* pEvent,  & isSelected)
{
	isSelected = false;

	if (!(this.show.GetValueDirect()))
	{
		return eERR_NO_OP;
	}

	// get label style (if specified)
	HTMLLabelStyleAttr* labelStyle = this.styles.GetStyle<HTMLLabelStyleAttr>();
	if (!labelStyle)
	{
		return eERR_NO_OP;
	}

	CMouseEvent* pMouseInput = reinterpret_cast<CMouseEvent*>(pEvent);
	if (pMouseInput)
	{
		std.prototype.vector<int> click;
		int x = pMouseInput.GetX();
		int y = pMouseInput.GetY();

		// get x, y in html window coords
		int left, right, top, bottom;
		this.screenRect.GetValueDirect(left, top, right, bottom);
		x = labelStyle.left().GetValueDirect() + x - left;
		y = labelStyle.top().GetValueDirect() + y - top;
		if (x < 0 || 
			y < 0 || 
			x > (int) labelStyle.left().GetValueDirect()+right-left-(int)this.sizeStates.vScrollWidth || 
			y > (int) labelStyle.top().GetValueDirect()+bottom-top-(int)this.sizeStates.hScrollHeight) 
        {
            this.x = -1;
            this.y = -1;
			return eERR_NO_OP;
        }

		if (labelStyle.url().GetLength() == 0) // using html, not url
		{
			x += 10;
			y += 10;
		}

        this.x = x;
        this.y = y;

		switch (pEvent.GetType())
		{
		case eMOUSE_LEFT_DOWN:
			{
                this.threadLock.Lock("HTMLLabel.prototype.EventPerformed");

				// see if mouse is over a clickable element
				if (this.show.GetValueDirect())
				{
					if (this.elementHit.element)
					{
						if (!_stricmp("_blank", this.elementHit.target.c_str()))
						{
							LaunchPopupThreadData* threadData = New<LaunchPopupThreadData>();
							if (threadData)
							{
								threadData.label = this;
								threadData.href = this.elementHit.href.c_str();
                                this.threadLock.Unlock();
								this.taskThread.AddTask(HTMLLabel_LaunchPopupProc, threadData, 0, true);
                                this.taskThread.Start();
                                this.taskThread.StopAsync();
                                return eNO_ERR;
							}
							else // !threadData
							{
                                this.threadLock.Unlock();
								return eERR_OUT_OF_MEMORY;
							}
							/*      
                            // [MCB] 01/03/11 - page navigation must be performed by the main thread
                            if (!(Push<std.prototype.string>(this.launchPopupQueue, this.elementHit.href))) return;
                            // get bridgeworks
                            CAttribute* resource = NULL;
		                    if (_SUCCEEDED(dynamic_cast<BwRegistry*>(this.registry).Find("Bridgeworks", resource)))
		                    {
                                dynamic_cast<Bridgeworks*>(resource).AddMainThreadTask(HTMLLabel_LaunchPopupProc, this);
                            }
                            this.threadLock.Unlock();
							return eNO_ERR;*/
						}
				
                        labelStyle.url().SetValueDirect(this.elementHit.href.c_str(), false);
                    }
				}

                this.threadLock.Unlock();
			}
			break;

		case eMOUSE_LEFT_UP:
			{
			}
			break;

		case eMOUSE_MOVE:
			{       
			}
			break;
		};		
	}

	return eNO_ERR;
}


 HTMLLabel.prototype.SetRegistry(AttributeRegistry* registry)
{
	// call base-class implementation
	RasterComponent.prototype.SetRegistry(registry);

	if (registry)
	{
		CAttribute* resource = NULL;
		if (_SUCCEEDED(dynamic_cast<BwRegistry*>(registry).Find("DefaultFactory", resource)))
		{		
			DefaultFactory* factory = dynamic_cast<DefaultFactory*>(resource);
			if (factory)
			{
				// create scroll bar labels
				if (_SUCCEEDED(factory.Create(eAttrType_Node_ScrollBarLabel, &resource)))
				{
					this.vScrollBar = dynamic_cast<ScrollBarLabel*>(resource);

					// set label's attributes
					ScrollBarLabelStyleAttr* labelStyle = this.vScrollBar.styles().GetStyle<ScrollBarLabelStyleAttr>();
					if (labelStyle)
					{
						labelStyle.orientation().SetValueDirect(eScrollBarOrientation_Vertical);
					}

					dynamic_cast<CUnsignedIntegerAttr*>(this.vScrollBar.GetAttribute("renderSequenceSlot")).SetValueDirect(
						this.renderSequenceSlot.GetValueDirect() + 1);

					AddChild(this.vScrollBar);
				}
				if (_SUCCEEDED(factory.Create(eAttrType_Node_ScrollBarLabel, &resource)))
				{
					this.hScrollBar = dynamic_cast<ScrollBarLabel*>(resource);

					// set label's attributes
					ScrollBarLabelStyleAttr* labelStyle = this.hScrollBar.styles().GetStyle<ScrollBarLabelStyleAttr>();
					if (labelStyle)
					{
						labelStyle.orientation().SetValueDirect(eScrollBarOrientation_Horizontal);
					}

					dynamic_cast<CUnsignedIntegerAttr*>(this.hScrollBar.GetAttribute("renderSequenceSlot")).SetValueDirect(
						this.renderSequenceSlot.GetValueDirect() + 1);

					AddChild(this.hScrollBar);
				}
			}
		}

        if (_SUCCEEDED(dynamic_cast<BwRegistry*>(this.registry).Find("Bridgeworks", resource)))
        {
            Bridgeworks* bridgeworks = dynamic_cast<Bridgeworks*>(resource);
            if (bridgeworks)
            {
                bridgeworks.GetAttribute("windowWidth").AddModifiedCB(HTMLLabel_Bridgeworks_WindowDimensionsModifiedCB, this);
                bridgeworks.GetAttribute("windowHeight").AddModifiedCB(HTMLLabel_Bridgeworks_WindowDimensionsModifiedCB, this);
            }
        }
	}
}

 HTMLLabel.prototype.AllocateRenderContextResources()
{
	this.updateLabel = true;
}

 HTMLLabel_StylesModifiedCB(CAttribute* attr, * data)
{
	HTMLLabel* node = (HTMLLabel*) data;
    
    if (node)
    {
		node.this.updateLabel = true;

        if (attr == node.this.htmlLabelStyle.html() ||
            attr == node.this.htmlLabelStyle.url())
        {
            node.this.updateLabelHTML = true;
        }

		node.IncrementModificationCount();
	}
}

 HTMLLabel_WindowHandleModifiedCB(CAttribute* attr, * data)
{
	HTMLLabel* node = (HTMLLabel*) data;
    
    if (node && node.this.wb)
    {
		node.this.wb.GetAttribute("windowHandle").CopyValue(attr);
	}
}

 HTMLLabel_RenderSequenceSlotModifiedCB(CAttribute* attr, * data)
{
	HTMLLabel* node = (HTMLLabel*) data;
    
    if (node)
    {
		node.RenderSequenceSlotModified();
	}
}

 HTMLLabel_Bridgeworks_WindowDimensionsModifiedCB(CAttribute* attr, * data)
{
    HTMLLabel* node = static_cast<HTMLLabel*>(data);
    
    if (node)
    {
        node.this.updateWebBrowser = true;
    }
}

 HTMLLabel_LaunchPopupProc(* data, const  & run)
{
    
	LaunchPopupThreadData* threadData = (LaunchPopupThreadData*) data;
    
    if (threadData)
	{
		threadData.label.LaunchPopup(threadData.href.c_str());
	}
    /*
    
    HTMLLabel* node = (HTMLLabel*) data;
    
    if (node)
    {
        std.prototype.string popup = "";
        node.this.threadLock.Lock("HTMLLabel_LaunchPopupProc");
        if (!node.this.launchPopupQueue.empty())
        {
            popup = node.this.launchPopupQueue.front();
            node.this.launchPopupQueue.pop();
        }
        node.this.threadLock.Unlock();
        if (!popup.empty())
        {
            node.LaunchPopup(popup.c_str());
        }
    }*/
}