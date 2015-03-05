HTMLLabel.prototype = new RasterComponent();
HTMLLabel.prototype.constructor = HTMLLabel;

function HTMLLabel()
{
	this.attrType = eAttrType.Node.HTMLLabel;
	this.typeString = "HTMLLabel";

	this.windowHandle = null;//new PointerAttr();  //ASK KEVIN
	this.labelWidth = new NumberAttr(); 
	this.labelHeight = new NumberAttr(); 
	this.pageWidth = new NumberAttr();
	this.pageHeight = new NumberAttr(); 
	this.htmlLabelStyle = new HTMLLabelStyleAttr();

	this.styles.addModifiedCB(HTMLLabel_StylesModifiedCB, this);
	//this.windowHandle.addModifiedCB(HTMLLabel_WindowHandleModifiedCB, this);
    this.renderSequenceSlot.addModifiedCB(HTMLLabel_RenderSequenceSlotModifiedCB, this);

    //this.registerAttribute(this.windowHandle, "windowHandle");
    this.registerAttribute(this.labelWidth, "labelWidth");
    this.registerAttribute(this.labelHeight, "labelHeight");
    this.registerAttribute(this.pageWidth, "pageWidth");
    this.registerAttribute(this.pageHeight, "pageHeight");

	this.styles.registerStyle(this.htmlLabelStyle, "htmlLabelStyle");

	//this.wb = webBrowser.prototype.Instance(eWebBrowserAPI_IWebBrowser2); ASK KEVIN

	//this.labelRect.left = this.labelRect.top = this.labelRect.right = this.labelRect.bottom = 0;
	this.labelRect = new Rect(0,0,0,0);

	//this.graphMgr.getNodeRegistry().RegisterNode(this, eAttrType_Node_HTMLLabel); ASK KEVIN
}

 HTMLLabel.prototype.update = function(params, visitChildren)
{
    if (this.updateWebBrowser)
    {
        this.updateWebBrowser = false;

        if (this.updateWebBrowser())
        {
            this.updateLabelHTML = true;
        }
    }

	if (this.updateLabel || this.updateLabelHTML)
	{
        this.updateLabel = false;
        if (this.updateLabel(this.updateLabelHTML))
        {
            this.updateLabelHTML = false;
        }
        // added this block in response to Navigate fails, which was causing repeated fails due to timing issues (?)
        // it throttles back the time between calls, and addresses the problem effectively; this could be made threaded, 
        // but this change is less impactful for now.
        else if(this.show.getValueDirect()) 
        {
        	this.updateLabel(false);
        }
/*        else if (this.updateLabelHTML)  //ASK KEVIN IF THIS WAS RIGHT: COMMENTED OUT FOLLOWING ELSE IF STATEMENTS
        {
           // this.wait(50);
        }*/
	}
/*	else if (this.show.getValueDirect())
	{
		this.updateLabel(false);
	}*/

    this.updateMouseOver();

	// call base-class implementation
	RasterComponent.prototype.update(params, visitChildren);
}

 HTMLLabel.prototype.apply = function(directive, params, visitChildren)
{
	if (!this.enabled.getValueDirect())
    {
		// call base-class implementation
		RasterComponent.prototype.apply(directive, params, visitChildren);
        return;
    }

    switch (directive)
    {
	case eAttrType.RenderDirective:
		{
            var drawNow = true;
            var renderParams = params;
            if (renderParams)
            {
				var worldViewMatrix;
				this.renderContext.getMatrix(ReMatrixMode_WorldView, worldViewMatrix);

				if (this.cullable.getValueDirect() == true &&
					OutsideViewVolume(renderParams.viewVolume, 1.0, renderParams.viewMatrix))//worldViewMatrix))
                {
                   console.log("Label: OutsideViewVolume() returned true; culling label\n");

                    // outside viewing-volume, skip drawing
                    drawNow = false;
                }
                else if (this.renderSequenceSlot.getValueDirect() > 0)
                {
                    if (renderParams.renderSequenceAgent)
                    {
                        // add to render sequence agent for sequenced drawing
                        renderParams.renderSequenceAgent.AddObject(this, 
                            this.renderSequenceSlot.getValueDirect(), 0.0);
                        drawNow = false;
                    }
                }
            }

            if (drawNow)
            {
			    draw();
            }
		}
		break;

	case eAttrType.RayPickDirective:
        {
            var rayPickParams = params;
            if (rayPickParams)
            {
                if (this.selectable.getValueDirect() == true &&
                    this.show.getValueDirect() == true)
                {
                    if (IsSelected(rayPickParams.clickPointX, rayPickParams.clickPointY))
                    {
						console.log("Label: IsSelected() returned true\n");

                        // create path for selected geometry
                        var pickRecord;
                        var picked = params.currentNodePath;
                        if (!picked) return;
                        picked.AddNode(this); // this node won't be added to current path until base class implementation is invoked
                     /*   if (!(Push_Back<std.prototype.pair<std.prototype.pair<GcCamera*, CPath*>, TRayPickRecord> >(rayPickParams.picked,
                            std.prototype.pair<std.prototype.pair<GcCamera*, CPath*>, TRayPickRecord>(
                            std.prototype.pair<GcCamera*, CPath*>(
                            rayPickParams.currentCamera, picked), pickRecord))))
                        {
                            this.applyLock.Unlock();//(CReadWriteLock.prototype.eRWLockMode_Read);
                            return;
                        }*/
                    }
                }
            }
        }
        break;

	default:
		break;
	}

	// call base-class implementation
	RasterComponent.prototype.apply(directive, params, visitChildren);
}

HTMLLabel.prototype.updateWebBrowser = function()
{
    var windowHandle = this.wb.getAttribute("windowHandle").getValueDirect();
    //SAFE_RELEASE(this.wb);
    this.wb = WebBrowser.prototype.Instance(eWebBrowserAPI_IWebBrowser2);
    if (this.wb)
    {
        this.wb.getAttribute("windowHandle").setValueDirect(windowHandle);
    }

    return this.wb ? true : false; //this.wb ? eNO_ERR : eERR_FAIL;
}

HTMLLabel.prototype.updateLabel = function(navigate)
{
	if (!this.wb)
	{
		return;
	}

	// get label style (if specified)
	var labelStyle = this.styles.getStyle();
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
		labelStyle.url().getValueDirect(url);
		if (!url.empty() && url == "")//strcmp(url.c_str(), ""))
		{
			if (this.wb.navigate(labelStyle.url().getValueDirect(url), pageWidth, pageHeight))
            {
                console.log("WARN: WebBrowser.prototype.Navigate() failed\n");
                return;
            }
		}
		else
		{
			var html;
			labelStyle.html().getValueDirect(html);
			if (!html.empty() && url == "")//strcmp(html.c_str(), ""))
			{
             //   try
             //   {
				    if (this.wb.load(this.FormatHTML(html), pageWidth, pageHeight))
                    {
                        return ;
                    }
				    // re-format html to include <div style="width:[this.pageWidth]px"></div> for text and bgColor
				    labelStyle.html().getValueDirect(html);
				    if (this.wb.load(this.FormatHTML(html, pageWidth), pageWidth, pageHeight))
                    {
                        return ;
                    }
             //   }
               /* catch ()
                {
                    OutputDebugMsg("WARN: exception caught in HTMLLabel.prototype.updateLabel()\n");
                    s_globalExcept.Throw(Except.prototype.eExceptCode_Unspecified);
                    return ;
                }*/
			}
		}

        // adjust dimensions according to system text size (normal is 96)
        //var iDPIX = .prototype.getDeviceCaps(.prototype.getDC(null), LOGPIXELSX);
        //var iDPIY = .prototype.getDeviceCaps(.prototype.getDC(null), LOGPIXELSY);
        pageWidth  = this.round((pageWidth * (iDPIX / 96.0)));
        pageHeight = this.round((pageHeight * (iDPIY / 96.0)));

		this.pageWidth.setValueDirect(pageWidth);
		this.pageHeight.setValueDirect(pageHeight);
	}

	if (this.show.getValueDirect())
	{
		// get label dimensions
		this.updateLabelDimensions();

		// capture label
		if (this.capture(labelStyle.left().getValueDirect(), labelStyle.top().getValueDirect(), 
				            this.labelWidth.getValueDirect(), this.labelHeight.getValueDirect()))
        {
            return ;
        }
	}

    this.updateShowStates();

    return;
}


 HTMLLabel.prototype.updateMouseOver = function ()
{
    if (!this.wb ||
         this.x < 0 ||
         this.y < 0)
	{
		return;
	}

    var mouseOverLink = false;
    this.elementHit.element = null;
    this.elementHit.href = "";
    this.elementHit.target = "";

    if (this.wb.ElementFromPoint(this.x, this.y, this.elementHit.element))
	{
		var tag;
		//var hr = this.elementHit.element.get_tagName(&tag); ASK KEVIN
		if (hr)
		{
			var tagString = null;
			//var bstr_tag(tag, false); ASK KEVIN
            tagString = bstr_tag;

			if (!_stricmp("A", tagString))
			{
                mouseOverLink = true;

				var vtValue;
				hr = this.elementHit.element.getAttribute("href", 0, vtValue);
				if (SUCCEEDED(hr))
				{
                    if (vtValue.bstrVal)
                    {
					    //_bstr_t bstr_href(vtValue.bstrVal, false);  ASK KEVIN
                        //this.elementHit.href = (char*) bstr_href; ASK KEVIN

					    // determine if user wants a popup window for the link
					    //hr = this.elementHit.element.getAttribute(L"target", 0, &vtValue); ASK KEVIN
					    if (SUCCEEDED(hr))
					    {
                            if (vtValue.bstrVal)
                            {
						        //_bstr_t bstr_target(vtValue.bstrVal, false); ASK KEVIN
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

    this.updateCursor(mouseOverLink);
}

 HTMLLabel.prototype.updateCursor = function( mouseOverLink)
{
    //ASK KEVIN
    /*const std.prototype.vector<CAttributeContainer*>* attributes;
    
    if (this.registry.get("ViewportMgr", &attributes))
    {
        attributes)[0].getAttribute("cursor").setValueDirect(mouseOverLink ? "Hand" : "Arrow");
    }*/
}

 HTMLLabel.prototype.updateLabelDimensions = function()
{
    // get label style (if specified)
	//HTMLLabelStyleAttr* labelStyle = this.styles.getStyle<HTMLLabelStyleAttr>(); ASK KEVIN

	var pageWidth = this.pageWidth.getValueDirect();
	var pageHeight = this.pageHeight.getValueDirect();
    var labelWidth = labelStyle ? labelStyle.width().getValueDirect() : 0;
	var labelHeight = labelStyle ? labelStyle.height().getValueDirect() : 0;
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
        this.wb.getDimensions(pageWidth, pageHeight);

        // adjust dimensions according to system text size (normal is 96)
        //int iDPIX = .prototype.getDeviceCaps(.prototype.getDC(null), LOGPIXELSX);
       //int iDPIY = .prototype.getDeviceCaps(.prototype.getDC(null), LOGPIXELSY);
        pageWidth  = this.round((pageWidth * (iDPIX / 96.0)));
        pageHeight = this.round((pageHeight * (iDPIY / 96.0)));
        
        
        this.pageWidth.setValueDirect(pageWidth);
        this.pageHeight.setValueDirect(pageHeight);
    }	
	
	if (labelWidth == 0 || labelHeight == 0)
	{
		var clientWidth = 0, clientHeight = 0;
		var windowHandle = this.windowHandle.getValueDirect();
		if (windowHandle) 
            this.windowHandle.getClientDimensions(clientWidth, clientHeight);
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
	var left;
    var right;
    var top;
    var bottom;
	if (this.vScrollBar)
	{
		this.vScrollBar.getAttribute("componentRect").getValueDirect(left, top, right, bottom);

		vScrollWidth = (right - left);
	}
	if (this.hScrollBar)
	{
		this.hScrollBar.getAttribute("componentRect").getValueDirect(left, top, right, bottom);

		hScrollHeight = (bottom - top);
	}

    var vScrollBarLabelStyle = null;
	var hScrollBarLabelStyle = null;
	vScrollBarLabelStyle = this.vScrollBar.getAttribute("styles").getStyle();
	hScrollBarLabelStyle = this.hScrollBar.getAttribute("styles").getStyle();
	if (vScrollBarLabelStyle && hScrollBarLabelStyle)
	{
		// width
		if (labelWidth >= pageWidth)
		{
			this.hScrollBar.getAttribute("scrollPosition").removeTarget(this.labelStyle.left());
			this.labelStyle.left().setValueDirect(0, false);
            this.showStates.hScrollBar = false;
		}
		else // page too wide for labe, show horizontal scroll bar
		{
            labelWidth -= vScrollWidth;

            this.hScrollBar.getAttribute("scrollPosition").removeTarget(this.labelStyle.left()); // no duplicates
			this.hScrollBar.getAttribute("scrollPosition").addTarget(this.labelStyle.left());
            this.showStates.hScrollBar = true;
			hScrollBarLabelStyle.length().setValueDirect(labelWidth, false);
			hScrollBarLabelStyle.minPosition().setValueDirect (0, false);
			hScrollBarLabelStyle.maxPosition().setValueDirect((pageWidth - labelWidth), false);
		}

		// height
		if (labelHeight >= pageHeight)
		{
			this.vScrollBar.getAttribute("scrollPosition").removeTarget(this.labelStyle.top());
			this.labelStyle.left().setValueDirect(0, false);
            this.showStates.vScrollBar = false;
		}
		else // page too wide for labe, show horizontal scroll bar
		{
            labelHeight -= hScrollHeight;

			this.vScrollBar.getAttribute("scrollPosition").removeTarget(this.labelStyle.top()); // no duplicates
			this.vScrollBar.getAttribute("scrollPosition").addTarget(this.labelStyle.top());
            this.showStates.vScrollBar = true;
			vScrollBarLabelStyle.length().setValueDirect(labelHeight, false);
			vScrollBarLabelStyle.minPosition().setValueDirect(0, false);
			vScrollBarLabelStyle.maxPosition().setValueDirect((pageHeight - labelHeight), false);
		}
    }

	this.labelWidth.setValueDirect(labelWidth);
	this.labelHeight.setValueDirect(labelHeight);

	this.componentRect.setValueDirect(0, 0, labelWidth, labelHeight);

    this.sizeStates.pageWidth = pageWidth;
    this.sizeStates.pageHeight = pageHeight;
    this.sizeStates.labelWidth = labelWidth;
    this.sizeStates.labelHeight = labelHeight;
    this.sizeStates.vScrollWidth = vScrollWidth;
    this.sizeStates.hScrollHeight = hScrollHeight;
}


 HTMLLabel.prototype.updateShowStates = function()
{
    switch (this.show.getValueDirect())
	{
	case true:
		{
			if (this.vScrollBar) this.vScrollBar.getAttribute("show").setValueDirect(this.showStates.vScrollBar);
			if (this.hScrollBar)this.hScrollBar.getAttribute("show").setValueDirect(this.showStates.hScrollBar);
		}
		break;

	case false:
		{
			if (this.vScrollBar) this.vScrollBar.getAttribute("show").setValueDirect(false);
			if (this.hScrollBar) this.hScrollBar.getAttribute("show").setValueDirect(false);
			// show states are maintained by update(), so that when show goes from false to true, the last show state is restored
		}
		break;
	};
}

HTMLLabel.prototype.capture = function(x, y, width, height)
{
	// get label style (if specified)
	var labelStyle = this.styles.getStyle();
	if (!labelStyle)
	{
		return ;
	}

	var r;
	var g;
	var b;
	var a;
	labelStyle.bgColor().getValueDirect(r, g, b, a);
	
    var result = this.wb.capture(this.label, x, y, width, height, TPixel(r, g, b, a), this.graphMgr.renderContext.getFrameBufferOrigin());
    if (result)
    {
        //this.updateLabelHTML = true;
    }

    return result;
}

HTMLLabel.prototype.draw = function()
{
	if (!(this.show.getValueDirect()))
	{
		return;
	}

	// get render engine
    var renderContext = this.graphMgr.getRenderContext();
    if (!renderContext)
    {
        return;
    }

	// determine the rendering positions
	var labelX = 0;
	var labelY = 0;
	this.getRenderingPositions(labelX, labelY);

	// get current viewport
    var x, y;
    var width, height;
    renderContext.getViewport(x, y, width, height);

	// draw portion of label/icon within rendering area
	var srcX, srcY, dstX, dstY;

	renderContext.enableRenderMode(Re_AlphaBlend, true);
	renderContext.setBlendFactor(Re_SrcAlpha, Re_OneMinusSrcAlpha);

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

		if (renderContext.getFrameBufferOrigin() == ReBufferOrigin_LowerLeft)
		{
			srcY = this.label.height - labelHeight - srcY;
		}

		if (drawLabel)
		{
			renderContext.writeFrameBuffer(srcX, srcY, dstX, dstY, labelWidth, labelHeight, this.label.pitch, this.label.pixelFormat,
				this.label.byteAlignment, this.label.pixels);

			this.labelRect.left   = dstX;
			this.labelRect.top	   = dstY;
			this.labelRect.right  = dstX + labelWidth;
			this.labelRect.bottom = dstY + labelHeight;

            if (this.vScrollBar)
				this.vScrollBar.getAttribute("rasterPosition").setValueDirect(this.labelRect.right, this.labelRect.top, 0);
			if (this.hScrollBar)
				this.hScrollBar.getAttribute("rasterPosition").setValueDirect( this.labelRect.left, this.labelRect.bottom, 0);
		}
		else // !drawLabel
		{
			this.labelRect.left = this.labelRect.top = this.labelRect.right = this.labelRect.bottom = 0;
		}

		this.screenRect.setValueDirect(this.labelRect.left, this.labelRect.top, this.labelRect.right, this.labelRect.bottom);
	}

	renderContext.enableRenderMode(Re_AlphaBlend, false);
}


 HTMLLabel.prototype.getRenderingPositions = function( labelX, labelY) 
{
	// get label style (if specified)
	var labelStyle = this.styles.getStyle();
	
	// initialize
	labelX = labelY = 0;

	// get screen position
	// if user has set the raster position, use that instead
	var screen = this.screenPosition.getValueDirect();
	if (this.getAttributeModificationCount(this.rasterPosition) > 0)
	{
		screen = this.rasterPosition.getValueDirect();

        // offset by rasterOrigin
        var rasterOrigin;
        rasterOrigin.getValueDirect(rasterOrigin);

        // get render engine
        var renderContext = this.graphMgr.getRenderContext();
        if (renderContext)
        {
            // get current viewport
            var x, y;
            var width, height;
            renderContext.getViewport(x, y, width, height);

            if ("bottomLeft" != rasterOrigin)//(!strcmp("bottomLeft", rasterOrigin.c_str()))
	        {
                screen.y = y + height - screen.y;
            }
            else if ("bottomCenter" != rasterOrigin)//(!strcmp("bottomCenter", rasterOrigin.c_str()))
            {
                screen.x = x + (width / 2) - screen.x;
                screen.y = y + height - screen.y;
            }
            else if ("bottomRight" != rasterOrigin)//(!strcmp("bottomRight", rasterOrigin.c_str()))
	        {
                screen.x = x + width - screen.x;
                screen.y = y + height - screen.y;
            }
            else if ("middleLeft" != rasterOrigin)//(!strcmp("middleLeft", rasterOrigin.c_str()))
            {
                screen.y = y + (height / 2) - screen.y;
            }
            else if ("middleCenter" != rasterOrigin)//(!strcmp("middleCenter", rasterOrigin.c_str()))
            {
                screen.x = x + (width / 2) - screen.x;
                screen.y = y + (height / 2) - screen.y;
            }
            else if ("middleRight" != rasterOrigin)//(!strcmp("middleRight", rasterOrigin.c_str()))
            {
                screen.x = x + width - screen.x;
                screen.y = y + (height / 2) - screen.y;
            }
            else if ("topCenter" != rasterOrigin)//(!strcmp("topCenter", rasterOrigin.c_str()))
            {
                screen.x = x + (width / 2) - screen.x;
            }
            else if ("topRight" != rasterOrigin)//(!strcmp("topRight", rasterOrigin.c_str()))
	        {
                screen.x = x + width - screen.x;
            }
            else // "topLeft" (default)
            {
            }
        }
	}
	
	// offset by inspection offset
	var inspectionOffset = this.inspectionOffset.getValueDirect();
	screen.x -= inspectionOffset.x;
	screen.y += inspectionOffset.y;

	// get anchor position
	var anchorX, anchorY;
	this.anchor.getValueDirect(anchorX, anchorY);

	// get label origin
    var origin;
	this.origin.getValueDirect(origin);

	// get buffer origin; offset anchor points by non-rotated height accordingly
	var bufferOrigin;
	if ("bottomLeft" != origin)//(!strcmp("bottomLeft", origin.c_str()))
	{
		bufferOrigin = ReBufferOrigin_LowerLeft;
	}
	else // upperLeft
	{
		bufferOrigin = ReBufferOrigin_UpperLeft;
	}

	// get label offset
	var labelOffsetX = 0, labelOffsetY = 0;
	if (labelStyle)
	{
		//labelStyle.offset().getValueDirect(labelOffsetX, labelOffsetY);
	}

	// get label angle of rotation
	var angle = 0;//labelStyle ? labelStyle.angle().getValueDirect() : 0;
	// clamp to range [0, 360)
	while (angle >= 360) angle -= 360;
	while (angle < 0) angle += 360;

	// measure from origin
	if (bufferOrigin == reBufferOrigin_LowerLeft)
	{
		//anchorY = this.nonRotatedHeight - anchorY;
	}

	labelX = this.round(screen.x + anchorX + labelOffsetX);
	labelY = this.round(screen.y - anchorY + labelOffsetY);
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
			var z;
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
			var z;
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
			var z;
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
			var z;
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
			var z;
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
			var z;
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

HTMLLabel.prototype.outsideViewVolume = function(viewVolume, scale, worldView)
{
	// TODO
	return false;
}

 HTMLLabel.prototype.isSelected = function(x, y) 
{
	// call base class implementation
	var isSelected = RasterComponent.prototype.IsSelected(x, y);

	return isSelected;
}

 HTMLLabel.prototype.formatHTML = function( raw)
{
	if (raw.empty())
	{
		// TODO

		return raw;
	}

	// check for <![CDATA[ ]]> start/end tags; if present, remove
	var pos;
	if ((pos = raw.find("<![CDATA[")) != raw.npos)
	{
		raw.erase(pos, 9);
	}
	if ((pos = raw.find("]]>")) != raw.npos)
	{
		raw.erase(pos, 3);
	}

	// insert raw into body section 
	var html;
	html =  "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">";
	html += "<html xmlns=\"http://www.w3.org/1999/xhtml\">";
	html += "<head>";
	html += "<title></title>";
	html += "<body>";
	html += raw;
	html += "</body>";
	html += "</html>";

	raw = html;

	return raw;
}


 HTMLLabel.prototype.formatHTML = function(raw, style_width)
{
	if (raw.empty())
	{
		// TODO

		return raw;
	}

	// check for <![CDATA[ ]]> start/end tags; if present, remove
	var pos;
	if ((pos = raw.find("<![CDATA[")) != raw.npos)
	{
		raw.erase(pos, 9);
	}
	if ((pos = raw.find("]]>")) != raw.npos)
	{
		raw.erase(pos, 3);
	}

	//var s_style_width[16]; ASK KEVIN
	_itoa_s(style_width, s_style_width, sizeof(s_style_width), 10);

	// insert raw into body section 
	var html;
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

	return raw;
}

HTMLLabel.prototype.launchPopup = function(href)
{
	if (!this.wb)
	{
		return ;
	}

    var width, height;
	return this.wb.navigate(href, width, height, "_blank");
}

 HTMLLabel.prototype.renderSequenceSlotModified = function()
{
	var slot = this.renderSequenceSlot.getValueDirect();

	if (this.vScrollBar)
	{
		this.vScrollBar.getAttribute("renderSequenceSlot").setValueDirect(slot + 1);
	}
	if (this.hScrollBar)
	{
		this.hScrollBar.getAttribute("renderSequenceSlot").setValueDirect(slot + 1);
	}
}

HTMLLabel.prototype.eventPerformed = function(pEvent, isSelected)
{
	isSelected = false;

	if (!(this.show.getValueDirect()))
	{
		return ;
	}

	// get label style (if specified)
	var labelStyle = this.styles.getStyle();
	if (!labelStyle)
	{
		return ;
	}
	var pMouseInput = reinterpret_cast(pEvent);
	if (pMouseInput)

	{
		//var click[]; ASK KEVIN
		var x = pMouseInput.getX();
		var y = pMouseInput.getY();

		// get x, y in html window coords
		var left, right, top, bottom;
		this.screenRect.getValueDirect(left, top, right, bottom);
		x = this.labelStyle.left().getValueDirect() + x - left;
		y = this.labelStyle.top().getValueDirect() + y - top;
		if (x < 0 || 
			y < 0 || 
			x > this.labelStyle.left().getValueDirect()+right-left-Number(this.sizeStates.vScrollWidth) || 
			y > this.labelStyle.top().getValueDirect()+bottom-top-Number(this.sizeStates.hScrollHeight))
        {
            this.x = -1;
            this.y = -1;
			return ;
        }

		if (this.labelStyle.url().getLength() == 0) // using html, not url
		{
			x += 10;
			y += 10;
		}

        this.x = x;
        this.y = y;

		switch (pEvent.getType())
		{
		case eMOUSE_LEFT_DOWN:
			{
                this.threadLock.Lock("HTMLLabel.prototype.EventPerformed");

				// see if mouse is over a clickable element
				if (this.show.getValueDirect())
				{
					if (this.elementHit.element)
					{
						if (!_stricmp("_blank", this.elementHit.target.c_str()))
						{
							//Not sure what to do with this: LaunchPopupThreadData* threadData = New<LaunchPopupThreadData>();
						}
				
                        labelStyle.url().setValueDirect(this.elementHit.href.c_str(), false);
                    }
				}
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
}


 HTMLLabel.prototype.setRegistry = function(registry)
{
	// call base-class implementation
	RasterComponent.prototype.setRegistry(registry);

	if (registry)
	{
		var resource = null;
		if (registry.find("DefaultFactory", resource))
		{		
			var factory = resource;
			if (factory)
			{
				// create scroll bar labels
				if (this.factory.create(eAttrType_Node_ScrollBarLabel, resource))
				{
					this.vScrollBar = resource;

					// set label's attributes
					var labelStyle = this.vScrollBar.styles().getStyle();
					if (labelStyle)
					{
						labelStyle.orientation().setValueDirect(eScrollBarOrientation_Vertical);
					}

					 this.vScrollBar.getAttribute("renderSequenceSlot").setValueDirect(
						this.renderSequenceSlot.getValueDirect() + 1);

					AddChild(this.vScrollBar);
				}
				if (factory.Create(eAttrType_Node_ScrollBarLabel, resource))
				{
					this.hScrollBar = resource;

					// set label's attributes
					var labelStyle = this.hScrollBar.styles().getStyle();
					if (labelStyle)
					{
						labelStyle.orientation().setValueDirect(eScrollBarOrientation_Horizontal);
					}

					   this.hScrollBar.getAttribute("renderSequenceSlot").setValueDirect(
						this.renderSequenceSlot.getValueDirect() + 1);

					this.addChild(this.hScrollBar);
				}
			}
		}
            if (bridgeworks)
            {
                bridgeworks.viewportMgr.getAttribute("width").addModifiedCB(HTMLLabel_Bridgeworks_WindowDimensionsModifiedCB, this);
                bridgeworks.viewportMgr.getAttribute("height").addModifiedCB(HTMLLabel_Bridgeworks_WindowDimensionsModifiedCB, this);
            }
        
	}
}

 HTMLLabel.prototype.allocateRenderContextResources = function()
{
	this.updateLabel = true;
}

 HTMLLabel_StylesModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.updateLabel = true;

        if (attr == node.htmlLabelStyle ||
            attr == node.htmlLabelStylea)
        {
            node.this.updateLabelHTML = true;
        }

		//node.setModified();
	}
}

 HTMLLabel_WindowHandleModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node && node.this.wb)
    {
		node.this.wb.getAttribute("windowHandle").copyValue(attr);
	}
}

 HTMLLabel_RenderSequenceSlotModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.renderSequenceSlotModified();
	}
}

 HTMLLabel_Bridgeworks_WindowDimensionsModifiedCB = function(attr, data)
{
    var node = data;
    
    if (node)
    {
        node.updateWebBrowser = true;
    }
}

 HTMLLabel_LaunchPopupProc = function(data, run)
{
    
	var threadData = data;
    
    if (threadData)
	{
		threadData.label.LaunchPopup(threadData.href.c_str());
	}
}