
BalloonTipLabel.prototype = new RasterComponent(); 
BalloonTipLabel.prototype.constructor = BalloonTipLabel; 

function BalloonTipLabel(graphMgr) {
	 RasterComponent(graphMgr);

	var windowHandle = null;
	var labelWidth = null;
	var labelHeight = null;
	var balloonTipLabelStyle = null;
	var htmlLabel = null;
	var anchor = null;
	var updateLabel = false;
	var labelPlayback = null;
}


BalloonTipLabel.prototype.initialize = function()
{
	this.attrType = eAttrType.BalloonTipLabelStyleAttr;
	this.typeString = "BalloonTipLabel";

	if (!(this.windowHandle === 0)) return;
	if (!(this.labelWidth === 0)) return;
	if (!(this.labelHeight === 0)) return;
	if (!(this.balloonTipLabelStyle == new BalloonTipLabelStyleAttr())) return;

	this.windowHandle.addModifiedCB(BalloonTipLabel_windowHandleModifiedCB, this);
	this.balloonTipLabelStyle.bgColor().AddModifiedCB(BalloonTipLabel_balloonTipLabelStyleBgColorModifiedCB, this);
	this.balloonTipLabelStyle.HtmlLabelStyle().AddModifiedCB(BalloonTipLabel_BalloonTipLabelStyleHTMLLabelStyleModifiedCB, this);
	this.balloonTipLabelStyle.displayMode().AddModifiedCB(BalloonTipLabel_balloonTipLabelStyleDisplayModeModifiedCB, this);
	this.show.AddModifiedCB(BalloonTipLabel_showModifiedCB, this);
	this.renderSequenceSlot.AddModifiedCB(BalloonTipLabel_renderSequenceSlotModifiedCB, this);


	registerAttribute(this.windowHandle, "windowHandle");
	registerAttribute(this.labelWidth, "labelWidth");
	registerAttribute(this.labelHeight, "labelHeight");

	this.styles.registerStyle(this.balloonTipLabelStyle, "balloonTipLabelStyle");

	this.labelRect.left = this.labelRect.top = this.labelRect.right = this.labelRect.bottom = 0;

	if (!(this.labelPlayback = IMAGE_BITMAP)) return;

	this.graphMgr.getNodeRegistry().registerNode(this, eAttrType.BalloonTipLabelStyleAttr);

	loadImages();

	//this.renderSequenceSlot.setValueDirect(BALLOONTIPLABEL_RENDER_SEQ_SLOT);
}

 BalloonTipLabel.prototype.loadImages = function()
{
	var module = "BBBridgeworks";

	var hDC = null;
	var success = false;
	while (1) // avoid goto//
	{
		var hInstance = getModuleHandle(module.c_str());
		if (!hInstance)
		{
			break;
		}

		hDC = CreateCompatibleDC(null);
		if (!hDC)
		{
			break;
		}

		var cornerAlpha_topLeft, cornerAlpha_topRight, cornerAlpha_bottomLeft, cornerAlpha_bottomRight,
                   edgeAlpha_top, edgeAlpha_bottom, edgeAlpha_left, edgeAlpha_right;

        // corners
		if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_CORNER_TOPLEFT), this.bmpResources.corner.topLeft, 32))) break;
		if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_CORNER_TOPRIGHT), this.bmpResources.corner.topRight, 32))) break;
		if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_CORNER_BOTTOMLEFT), this.bmpResources.corner.bottomLeft, 32))) break;
		if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_CORNER_BOTTOMRIGHT), this.bmpResources.corner.bottomRight, 32))) break;
		if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_EDGE_TOP), this.bmpResources.edge.top, 32))) break;
        if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_EDGE_BOTTOM), this.bmpResources.edge.bottom, 32))) break;
        if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_EDGE_LEFT), this.bmpResources.edge.left, 32))) break;
        if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_EDGE_RIGHT), this.bmpResources.edge.right, 32))) break;
        // x
		if (_FAILED(LoadImage(hInstance, hDC, MAKEINTRESOURCE(IDB_BALLOONTIPLABEL_X), this.bmpResources.x))) break;			

		// invert images depending upon render engine's frame buffer origin
		switch (this.renderEngine.getFrameBufferOrigin())
		{
        case ReBufferOrigin_UpperLeft: // D3D
			{
				this.bmpResources.corner.topLeft.Invert();
                this.bmpResources.corner.topRight.Invert();
                this.bmpResources.corner.bottomLeft.Invert();
                this.bmpResources.corner.bottomRight.Invert();
				this.bmpResources.edge.top.Invert();
				this.bmpResources.edge.bottom.Invert();
				this.bmpResources.edge.left.Invert();
				this.bmpResources.edge.right.Invert();
				// x is symmetrical
			}
			break;
		}

		//if (_FAILED(rotateImages())) break;

		// all tasks completed successully
		success = true;
		break;
	}

	if (hDC) DeleteDC(hDC);

	return ;//success ? eNO_ERR : eERR_FAIL;
}

 BalloonTipLabel.prototype.loadImage = function(hInstance, hDC, name, imageDesc, desiredBitCount /*=24*/)
{
	var hBM = LoadImage(hInstance, MAKEINTRESOURCE(name), IMAGE_BITMAP, 0, 0, LR_CREATEDIBSECTION | LR_DEFAULTCOLOR);
	if (!hBM)
	{
		console.log("Error: FAILED");
	}

	if (!(this.labelPlayback.create(hDC, hBM, desiredBitCount)))
	{
		DeleteObject(hBM);
		console.log("Error: FAILED");
	}

	this.labelPlayback.getFrameDimensions(imageDesc.width, imageDesc.height, imageDesc.pitch);

	imageDesc.pixelFormat = this.labelPlayback.getPixelFormat();
	imageDesc.byteAlignment = this.labelPlayback.getPixelByteAlignment();

	// delete last pixel buffer
	SAFE_ARRAY_DELETE(imageDesc.pixels);
	imageDesc.pixels = [imageDesc.height][imageDesc.pitch];
	 //^^^ ASK KEVIN ^^^ | NewArray<unsigned char>(imageDesc.height * imageDesc.pitch);
	if (!imageDesc.pixels)
	{
		DeleteObject(hBM);
		console.log("Eror: Out of Memory");
	}
	imageDesc.managePixelBuffer = true;
	this.labelPlayback.getFrameData(imageDesc.width, imageDesc.height, imageDesc.pitch, imageDesc.pixelFormat, imageDesc.pixels, 0);	

	DeleteObject(hBM);

	return;
}

 BalloonTipLabel.prototype.rotateImages = function()
{
	// load other corners/edges by rotating originals

	// top right
	this.bmpResources.corner.topRight = this.bmpResources.corner.topLeft;
	this.bmpResources.corner.topRight.rotateCW_90();

	this.bmpResources.edge.right = this.bmpResources.edge.top;
	this.bmpResources.edge.right.rotateCW_90();

	// bottom right
	this.bmpResources.corner.bottomRight = this.bmpResources.corner.topRight;
	this.bmpResources.corner.bottomRight.rotateCW_90();

	this.bmpResources.edge.bottom = this.bmpResources.edge.right;
	this.bmpResources.edge.bottom.rotateCW_90();

	// bottom left
	this.bmpResources.corner.bottomLeft = this.bmpResources.corner.bottomRight;
	this.bmpResources.corner.bottomLeft.rotateCW_90();

	this.bmpResources.edge.left = this.bmpResources.edge.bottom;
	this.bmpResources.edge.left.rotateCW_90();

	return;
}

BalloonTipLabel.prototype.update = function(params, visitChildren)
{
    if (params.userData)
	{
		var updateParams = params.userData;
		if (this.show.getValueDirect())// && (this.updateLabel || isRenderStateModified(updateParams.viewport)))
		{
			this.updateLabel = false;

			updateLabel(updateParams.viewport);
		}
    }

	RasterComponent.prototype.update(params, visitChildren);
}

BalloonTipLabel.prototype.apply = function( directive, params, visitChildren)
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
				this.renderEngine.getMatrix(ReMatrixMode_WorldView, worldViewMatrix);

				if (this.cullable.getValueDirect() == true && 0)
					//OutsideViewVolume(renderParams.viewVolume, 1.0f, renderParams.viewMatrix))//worldViewMatrix))
                {
                    // outside viewing-volume, skip drawing
					if (this.graphMgr.getCurrentBalloonTipLabel() == this)
					{
						this.graphMgr.setCurrentBalloonTipLabel(null);
					}
                    drawNow = false;
                }
                else if (this.renderSequenceSlot.getValueDirect() > 0)
                {
                    if (renderParams.renderSequenceAgent)
                    {
                        // add to render sequence agent for sequenced drawing
                        //renderParams.renderSequenceAgent.addObject(this, renderSequenceSlot.getValueDirect(), 0.0f);
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

/*	case eAttrType_Directive_RayPick:
        {
        }
        break;*/

	default:
		break;
	}

	// call base-class implementation
	RasterComponent.prototype.apply(directive, params, visitChildren);
}

BalloonTipLabel.prototype.updateLabel = function(viewport)
{
	// get label style (if specified)
	var labelStyle = this.styles.getStyle();
	if (!labelStyle)
	{
		return;
	}

	updateLabelDimensions(viewport);

	var labelWidth = this.labelWidth.getValueDirect();
	var labelHeight = this.labelHeight.getValueDirect();

	// construct label

	// background
	this.label.init(labelWidth, labelHeight, 4, PixelFormat_B8G8R8A8, TPixel(255, 255, 255, 255));
	
	// corners
	switch (this.renderEngine.getFrameBufferOrigin())
	{
	case ReBufferOrigin_LowerLeft:
        {
			this.label.overlay(0, 0, this.bmpResources.corner.bottomLeft);
			this.label.overlay(labelWidth - this.bmpResources.corner.bottomRight.width, 0, this.bmpResources.corner.bottomRight);
			this.label.overlay(0, labelHeight - this.bmpResources.corner.topLeft.height, this.bmpResources.corner.topLeft);
			this.label.overlay(labelWidth - this.bmpResources.corner.topRight.width,
							labelHeight - this.bmpResources.corner.topRight.height, this.bmpResources.corner.topRight);

			// edges
			var edge;

			edge = this.bmpResources.edge.bottom;
			edge.tile(labelWidth - this.bmpResources.corner.bottomLeft.width - this.bmpResources.corner.bottomRight.width, 1);
			this.label.overlay(this.bmpResources.corner.bottomLeft.width, 0, edge);

			edge = this.bmpResources.edge.right;
			edge.tile(1, labelHeight - this.bmpResources.corner.topRight.height - this.bmpResources.corner.bottomRight.height);
			this.label.overlay(labelWidth - edge.width, this.bmpResources.corner.bottomLeft.height, edge);

			edge = this.bmpResources.edge.top;
			edge.tile(labelWidth - this.bmpResources.corner.topLeft.width - this.bmpResources.corner.topRight.width, 1);
			this.label.overlay(this.bmpResources.corner.topLeft.width, labelHeight - edge.height, edge);

			edge = this.bmpResources.edge.left;
			edge.tile(1, labelHeight - this.bmpResources.corner.bottomRight.height - this.bmpResources.corner.topRight.height);
			this.label.overlay(0, this.bmpResources.corner.bottomLeft.height, edge);

			// x
			this.label.overlay(labelWidth - this.bmpResources.edge.right.width - this.bmpResources.x.width - 5, 
							labelHeight -  this.bmpResources.edge.top.height - this.bmpResources.x.height - 5, this.bmpResources.x);
		}
		break;

	case ReBufferOrigin_UpperLeft:
		{
			this.label.overlay(0, 0, this.bmpResources.corner.topLeft);
			this.label.overlay(labelWidth - this.bmpResources.corner.topRight.width, 0, this.bmpResources.corner.topRight);
			this.label.overlay(0, labelHeight - this.bmpResources.corner.bottomLeft.height, this.bmpResources.corner.bottomLeft);
			this.label.overlay(labelWidth - this.bmpResources.corner.bottomRight.width,
							labelHeight - this.bmpResources.corner.bottomRight.height, this.bmpResources.corner.bottomRight);

			// edges
			var edge;

			edge = this.bmpResources.edge.top;
			edge.tile(labelWidth - this.bmpResources.corner.topLeft.width - this.bmpResources.corner.topRight.width, 1);
			this.label.overlay(this.bmpResources.corner.topLeft.width, 0, edge);

			edge = this.bmpResources.edge.right;
			edge.tile(1, labelHeight - this.bmpResources.corner.topRight.height - this.bmpResources.corner.bottomRight.height);
			this.label.overlay(labelWidth - edge.width, this.bmpResources.corner.topLeft.height, edge);

			edge = this.bmpResources.edge.bottom;
			edge.tile(labelWidth - this.bmpResources.corner.topLeft.width - this.bmpResources.corner.topRight.width, 1);
			this.label.overlay(this.bmpResources.corner.bottomLeft.width, labelHeight - edge.height, edge);

			edge = this.bmpResources.edge.left;
			edge.tile(1, labelHeight - this.bmpResources.corner.topRight.height - this.bmpResources.corner.bottomRight.height);
			this.label.overlay(0, this.bmpResources.corner.topLeft.height, edge);

			// x
			this.label.overlay(labelWidth - this.bmpResources.edge.right.width - this.bmpResources.x.width - 5, this.bmpResources.edge.top.height + 5, this.bmpResources.x);
		}
		break;
	}
	// shade label
	var r, g, b, a;
	labelStyle.bgColor().getValueDirect(r, g, b, a);
	this.label.Shade(tPixel(r, g, b, a));
	
	updateShowStates();
}

BalloonTipLabel.prototype.updateLabelDimensions = function(viewport)
{
	var width = 0;
	var height = 0;

	width += this.bmpResources.edge.left.width; // left edge
	width += BALLOONTIPLABEL_MARGIN_PADDING; // left margin
	width += this.bmpResources.edge.right.width;// right edge
	width += BALLOONTIPLABEL_MARGIN_PADDING; // right margin

	height += this.bmpResources.edge.top.height;	// top edge
	height += BALLOONTIPLABEL_MARGIN_PADDING;	// top margin
	height += this.bmpResources.edge.bottom.height;// bottom edge
	height += BALLOONTIPLABEL_MARGIN_PADDING;	// bottom margin
    
	// vieport must be of minimal bounds
	if (this.htmlLabel && 
	   (viewport.width > width + BALLOONTIPLABEL_WINDOW_PADDING + BALLOONTIPLABEL_WINDOW_PADDING + /*vScrollWidth +*/ 1) &&
	   (viewport.height > height + BALLOONTIPLABEL_WINDOW_PADDING + BALLOONTIPLABEL_WINDOW_PADDING + /*hScrollHeight +*/ 1))
	{
		var htmlLabelRect;
		var htmlLabelStyle = null;
		htmlLabelStyle = this.htmlLabel.getAttribute("styles").getStyle();
		if (htmlLabelStyle)
		{
			var labelWidth = this.htmlLabel.getAttribute("labelWidth").getValueDirect();
			var labelHeight = this.htmlLabel.getAttribute("labelHeight").getValueDirect();
            
			// width
			if (width + labelWidth + BALLOONTIPLABEL_WINDOW_PADDING + BALLOONTIPLABEL_WINDOW_PADDING <= viewport.width)
			{
				width += labelWidth;

				htmlLabelRect.left = this.bmpResources.edge.left.width + BALLOONTIPLABEL_MARGIN_PADDING;
				htmlLabelRect.right = htmlLabelRect.left + labelWidth;
			}
			else // html width too wide for viewport, show horizontal scroll bar
			{
				var captureWidth = viewport.width - (width + BALLOONTIPLABEL_WINDOW_PADDING + BALLOONTIPLABEL_WINDOW_PADDING);

				htmlLabelStyle.width().setValueDirect(captureWidth);
				
				width += captureWidth;

				htmlLabelRect.left = this.bmpResources.edge.left.width + BALLOONTIPLABEL_MARGIN_PADDING;
				htmlLabelRect.right = htmlLabelRect.left + captureWidth;
			}

			// height
			if (height + labelHeight + BALLOONTIPLABEL_WINDOW_PADDING + BALLOONTIPLABEL_WINDOW_PADDING <= viewport.height)
			{
				height += labelHeight;

				htmlLabelRect.top = this.bmpResources.edge.top.height + BALLOONTIPLABEL_MARGIN_PADDING;
				htmlLabelRect.bottom = htmlLabelRect.top + labelHeight;
			}
			else // html height too wide for viewport, show horizontal scroll bar
			{
				var captureHeight = viewport.height - (height + BALLOONTIPLABEL_WINDOW_PADDING + BALLOONTIPLABEL_WINDOW_PADDING);

				htmlLabelStyle.height().setValueDirect(captureHeight);

				height += captureHeight;

				htmlLabelRect.top = this.bmpResources.edge.top.height + BALLOONTIPLABEL_MARGIN_PADDING;
				htmlLabelRect.bottom = htmlLabelRect.top + captureHeight;
			}

			this.componentRects.htmlLabel = htmlLabelRect;

			this.showStates.htmlLabel = true;
		}
	}
	else 
	{
		this.showStates.htmlLabel = false;
	}

	this.componentRects.xButton.left = width - this.bmpResources.edge.right.width - this.bmpResources.x.width - 5;
	this.componentRects.xButton.top = this.bmpResources.edge.top.height + 5;
	this.componentRects.xButton.right = this.componentRects.xButton.left + this.bmpResources.x.width;
	this.componentRects.xButton.bottom = this.componentRects.xButton.top + this.bmpResources.x.height;

	this.labelWidth.setValueDirect(width);
	this.labelHeight.setValueDirect(height);
	this.componentRect.setValueDirect(0, 0, width, height);
}

BalloonTipLabel.prototype.updateShowStates = function()
{
	switch (this.show.getValueDirect())
	{
	case true:
		{
			if (this.anchor) this.anchor.getAttribute("show").setValueDirect(this.showStates.anchor);
			if (this.htmlLabel) this.htmlLabel.getAttribute("show").setValueDirect(this.showStates.htmlLabel);
		}
		break;

	case false:
		{
			if (this.anchor) this.anchor.getAttribute("show").setValueDirect(false);
			if (this.htmlLabel)this.htmlLabel.getAttribute("show").setValueDirect(false);
			// show states are mavarained by update(), so that when show goes from false to true, the last show state is restored
		}
		break;
	};
}

BalloonTipLabel.prototype.draw = function()
{
	if (!(this.show.getValueDirect()))
	{
		if (this.graphMgr.getCurrentBalloonTipLabel() == this)
		{
			this.graphMgr.setCurrentBalloonTipLabel(null);
		}
		return;
	}
	/*
	// only allow one balloon tip to display at a time (per Ted)
	BalloonTipLabel* currentBTL = this.graphMgr.getCurrentBalloonTipLabel();
	if (currentBTL && currentBTL != this)
	{
		this.show.setValueDirect(false, false);
		return;
	}
	*/
	this.graphMgr.setCurrentBalloonTipLabel(this);

	// get render engine
    var renderEngine = this.graphMgr.getRenderEngine();
    if (!renderEngine)
    {
        return;
    }

	// get current viewport
    var x, y;
    var width, height;
    renderEngine.getViewport(x, y, width, height);

	// determine the rendering positions
	var labelX = 0, labelY = 0;
	getRenderingPositions(GtViewport(x, y, width, height), labelX, labelY);

	// draw portion of label/icon within rendering area
	var srcX, srcY, dstX, dstY;

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

		if (this.renderEngine.getFrameBufferOrigin() == ReBufferOrigin_LowerLeft)
		{
			srcY = this.label.height - labelHeight - srcY;
		}

		if (drawLabel)
		{
			this.labelRect.left   = dstX;
			this.labelRect.top	   = dstY;
			this.labelRect.right  = dstX + labelWidth;
			this.labelRect.bottom = dstY + labelHeight;

			this.componentRectsWin = this.componentRects;
			this.componentRectsWin.Offset(dstX, dstY);

			if (this.htmlLabel)
			{
				this.htmlLabel.getAttribute("rasterPosition").setValueDirect(
					 this.labelRect.left + this.bmpResources.edge.left.width + BALLOONTIPLABEL_MARGIN_PADDING, 
					 this.labelRect.top + this.bmpResources.edge.top.height + BALLOONTIPLABEL_MARGIN_PADDING, 0);
            }

			renderEngine.EnableRenderMode(Re_AlphaBlend, true);
			renderEngine.setBlendFactor(Re_SrcAlpha, Re_OneMinusSrcAlpha);

			renderEngine.WriteFrameBuffer(srcX, srcY, dstX, dstY, labelWidth, labelHeight, this.label.pitch, this.label.pixelFormat,
				this.label.byteAlignment, this.label.pixels);

			renderEngine.EnableRenderMode(Re_AlphaBlend, false);

            // draw anchor polygon so that it will be after the label
			drawAnchorPolygon();
		}
		else // !drawLabel
		{
			this.labelRect.left = this.labelRect.top = this.labelRect.right = this.labelRect.bottom = 0;

			this.componentRectsWin.Clear();
		}

		this.screenRect.setValueDirect(this.labelRect.left, this.labelRect.top, this.labelRect.right, this.labelRect.bottom);
	}
}

BalloonTipLabel.prototype.drawAnchorPolygon = function()
{
	if (this.anchor)
	{
		// get screen position of parent
		if (this.motionParent)
		{
			// get render engine
			var renderEngine = this.graphMgr.getRenderEngine();
			if (!renderEngine)
			{
				return;
			}

			// get current viewport
			var x, y;
			var width, height;
			renderEngine.getViewport(x, y, width, height);

			var screenParent = this.motionParent.getScreenPosition(getValueDirect());

			// if parent is under balloon tip, don't show anchor polygon or
			// if parent is off the screen, don't show anchor polygon
			if (RectContainsPovar(screenParent.x, screenParent.y, this.labelRect.left, this.labelRect.top, 
								  this.labelRect.right - this.labelRect.left, this.labelRect.bottom - this.labelRect.top) ||
			   !RectContainsPovar(screenParent.x, screenParent.y, x, y, width, height))
			{
				this.anchor.getAttribute("show").setValueDirect(false);
				this.showStates.anchor = false;
				return;
			}

			// get center of balloon tip
			var balloonCenter = (this.labelRect.left + (this.labelRect.right - this.labelRect.left) / 2.0, 
				                     this.labelRect.top  + (this.labelRect.bottom - this.labelRect.top) / 2.0,
									 0);

			// get vector from screenParent to balloonCenter
			var parentToCenter = balloonCenter - screenParent;

			// rotate balloonCenter about screenCenter get the other 2 povars to form the anchor polygon
			// (screenParent, v1, v2)
			var v0 = screenParent;

			var angleRads   =  TO_RADIANS(BALLOONTIPLABEL_ANCHOR_HALFANGLE_DEG);
			var cosAngle	  =  cos(angleRads);
			var cosNegAngle =  cos(-angleRads);
			var sinAngle    =  sin(angleRads);
			var sinNegAngle =  sin(-angleRads);

			var v1 = CVector3Df(parentToCenter.x * cosAngle - parentToCenter.y * sinAngle,
									   parentToCenter.x * sinAngle + parentToCenter.y * cosAngle,
									   0);

			var v2 = CVector3Df(parentToCenter.x * cosNegAngle - parentToCenter.y * sinNegAngle,
									   parentToCenter.x * sinNegAngle + parentToCenter.y * cosNegAngle,
									   0);

			v1 += screenParent;
			v2 += screenParent;

			// normalize povars (start from 0, 0)
			var origin = (Math.min(v0.x, v1.x, v2.x), Math.min(v0.y, v1.y, v2.y), 0);
			v0 -= origin;
			v1 -= origin;
			v2 -= origin;

			// get anchor polygon bounding box
			var anchorPolyBBoxWidth  = Math.max(fabs(v2.x - v1.x), fabs(v2.x - v0.x), fabs(v1.x - v0.x));
			var anchorPolyBBoxHeight = Math.max(fabs(v2.y - v1.y), fabs(v2.y - v0.y), fabs(v1.y - v0.y));

			// get raster polygon style
			var polyStyle = this.anchor.getAttribute("styles").getStyle();
			if (polyStyle)
			{
				polyStyle.width().setValueDirect(Math.round(anchorPolyBBoxWidth), false);
				polyStyle.height().setValueDirect(Math.round(anchorPolyBBoxHeight), false);
				var povars = polyStyle.povars();
				if (povars)
				{
					povars.resize(3);
					povars[0].setValueDirect(v0, false);
					povars[1].setValueDirect(v1, false);
					povars[2].setValueDirect(v2, false);
				}
			}

			this.anchor.getAttribute("rasterPosition").setValueDirect(screenParent);
			this.anchor.getAttribute("anchor").setValueDirect(-v0.x, v0.y);
			this.anchor.getAttribute("show").setValueDirect(true);
			this.showStates.anchor = true;

			this.anchor.draw(0);
		}
		else //!this.motionParent
		{
			this.anchor.getAttribute("show").setValueDirect(false);
			this.showStates.anchor = false;
		}
	}
}

 BalloonTipLabel.prototype.eventPerformed = function(pEvent, isSelected)
{
	isSelected = false;
	
	if (!(this.show.getValueDirect()))
	{
		return ;
	}

	var pMouseInput = pEvent;
	if (pMouseInput)
	{
		var click;
		var x = pMouseInput.getX();
		var y = pMouseInput.getY();

		switch (pEvent.getType())
		{
		case eMOUSE_LEFT_DOWN:
			{
				isSelected = isSelected(x, y);
				if (isSelected && RectContainsPovar(x, y, this.componentRectsWin.xButton))
				{
					isSelected = false;
					this.show.setValueDirect(false);
					RestoreInspectionState();
				}
			}
			break;

		case eMOUSE_LEFT_UP:
		case eMOUSE_MIDDLE_UP:
		case eMOUSE_RIGHT_UP:
		case eMOUSE_WHEEL_UP:
			{
				isSelected = isSelected(x, y);
			}
			break;

		case eMOUSE_MOVE:
			{
				isSelected = isSelected(x, y);
				if (!isSelected)
				{
					//RestoreInspectionState();
				}
			}
			break;

		case eMOUSE_OVER:
			{
				isSelected = true;
				//DisableInspectionState();
			}
			break;

		case eMOUSE_OUT:
			{
				isSelected = false;
				if (pMouseInput.getInputState() == eKEY_UP)
				{
					//RestoreInspectionState();
				}
			}
			break;

		default:
			{
				isSelected = isSelected(x, y);
			}
			break;
		};		
	}

	return ;
}

BalloonTipLabel.prototype.setRegistry = function(registry)
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
				// create anchor poly
				if (factory.Create(eAttrType_Node_RasterPolygon, resource))
				{
					this.anchor = resource;

					// target this style to poly's attributes
					var rasterPolygonStyle = this.anchor.styles().getStyle();
					if (rasterPolygonStyle)
					{
						this.balloonTipLabelStyle.bgColor().addTarget(rasterPolygonStyle.borderColor());
						this.balloonTipLabelStyle.bgColor().addTarget(rasterPolygonStyle.fillColor());
					}
					///STOPPED HERE 6/05/2014
					this.anchor.getAttribute("synchronousupdate").setValueDirect(true);
					this.anchor.getAttribute("renderSequenceSlot").setValueDirect(Math.max(this.renderSequenceSlot.getValueDirect() - 1, 0));

					// don't add as a child because updates are synchronous and this needs to invoke the drawing
					//AddChild(this.anchor);
				}
				// create html label
				if (factory.Create(eAttrType_Node_HTMLLabel, resource))
				{
					this.htmlLabel = resource;

					// target this style to label's attributes
					this.balloonTipLabelStyle.htmlLabelStyle().addTarget(this.htmlLabel.styles().getStyle());

                    this.htmlLabel.getAttribute("pageWidth").addModifiedCB(BalloonTipLabel_HTMLLabel_PageDimensionsModifiedCB, this);
                    this.htmlLabel.getAttribute("pageHeight").addModifiedCB(BalloonTipLabel_HTMLLabel_PageDimensionsModifiedCB, this);

					this.htmlLabel.getAttribute("renderSequenceSlot").setValueDirect(
						this.renderSequenceSlot.getValueDirect() + 1);

					addChild(this.htmlLabel);
				}
			}
		}
	}

	if (this.rcEventListener)
	{
		this.rcEventListener.Listen(this, eMOUSE_OVER);
		this.rcEventListener.Listen(this, eMOUSE_OUT);
	}
}

 BalloonTipLabel.prototype.isSelected = function(screenX, screenY)
{
	// call base class implementation
	var isSelected = RasterComponent.prototype.isSelected(screenX, screenY);

	// check anchor for selection
	if (!isSelected && this.anchor)
	{
		isSelected = this.anchor.isSelected(screenX, screenY);
	}

	return isSelected;
}

BalloonTipLabel.prototype.setMotionParent = function(parent)
{
	/*
	if (parent)
	{
		parent.getAttribute("hasFocus").AddTarget(this.hasFocus);
	}
	else
	{
		this.hasFocus.RemoveAllSources();
	}
	*/
	// call base-class implementation
	RasterComponent.prototype.setMotionParent(parent);
}

BalloonTipLabel.prototype.getRenderingPositions = function(iewport, labelX, labelY)
{
	// initialize
	var labelX = labelY = 0;

	if (this.motionParent)
	{
		// get motion parent's screen position
		// if user has set the raster position, use that instead
		var screen = this.motionParent.getScreenPosition().getValueDirect();
		if (getAttributeModificationCount(this.rasterPosition) > 0)
		{
			screen = this.rasterPosition.getValueDirect();

            // offset by rasterOrigin
            var rasterOrigin;
            this.rasterOrigin.getValueDirect(rasterOrigin);

            // get render engine
            var renderEngine = this.graphMgr.getRenderEngine();
            if (renderEngine)
            {
                // get current viewport
                var x, y;
                var width, height;
                renderEngine.getViewport(x, y, width, height);

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

		var labelOffsetX = 0, labelOffsetY = 0;
		getAnchorOffset(viewport, screen, labelOffsetX, labelOffsetY);

		labelX = Math.max(Math.round(screen.x + labelOffsetX), 0);
		labelY = Math.max(Math.round(screen.y + labelOffsetY), 0);
	}
}

BalloonTipLabel.prototype.getAnchorOffset = function(viewport, anchor, offsetX, offsetY)
{
	// initialize
	offsetX = offsetY = 0;

	// get label style (if specified)
	var labelStyle = this.styles.getStyle();
	// get balloonOffset
	var balloonOffset = labelStyle ? labelStyle.balloonOffset().getValueDirect() : 0;

	// get client dimensions
	var clientWidth = viewport.width;
	var clientHeight = viewport.height;

	// get label dimensions
	var labelWidth = this.labelWidth.getValueDirect();
	var labelHeight = this.labelHeight.getValueDirect();

	// divide client rectangle varo 9 regions, and determine within which region the anchor povar lies
	var topLeft      = (viewport.x, viewport.y, Math.round(clientWidth * 0.3), Math.round(clientHeight * 0.3));
	var middleLeft   = (viewport.x, Math.round(clientHeight * 0.3), Math.round(clientWidth * 0.3), Math.round(clientHeight * 0.6));
	var bottomLeft   = (viewport.x, Math.round(clientHeight * 0.6), Math.round(clientWidth * 0.3), clientHeight);

	var topCenter    = (Math.round(clientWidth * 0.3), viewport.y, Math.round(clientWidth * 0.6), Math.round(clientHeight * 0.3));
	var middleCenter = (Math.round(clientWidth * 0.3), Math.round(clientHeight * 0.3), Math.round(clientWidth * 0.6), Math.round(clientHeight * 0.6));
	var bottomCenter = (Math.round(clientWidth * 0.3), Math.round(clientHeight * 0.6), Math.round(clientWidth * 0.6), clientHeight);

	var topRight     = (Math.round(clientWidth * 0.6), viewport.y, clientWidth, Math.round(clientHeight * 0.3));
	var middleRight  = (Math.round(clientWidth * 0.6), Math.round(clientHeight * 0.3), clientWidth, Math.round(clientHeight * 0.6));
	var bottomRight  = (Math.round(clientWidth * 0.6), Math.round(clientHeight * 0.6), clientWidth, clientHeight);
	
	if (topLeft.left <= anchor.x && topLeft.right >= anchor.x && topLeft.top <= anchor.y && topLeft.bottom >= anchor.y)
	{
		offsetX = Math.round(balloonOffset * Math.sin(45));
		offsetY = Math.round(balloonOffset * Math.sin(45));
	}
	else if (middleLeft.left <= anchor.x && middleLeft.right >= anchor.x && middleLeft.top <= anchor.y && middleLeft.bottom >= anchor.y)
	{
		offsetX = balloonOffset;
		offsetY = -(Math.round(labelHeight / 2.0));
	}
	else if (bottomLeft.left <= anchor.x && bottomLeft.right >= anchor.x && bottomLeft.top <= anchor.y && bottomLeft.bottom >= anchor.y)
	{
		offsetX = Math.round(balloonOffset * Math.sin(45));
		offsetY = -(labelHeight) - Math.round(balloonOffset * Math.sin(45));
	}
	else if (topCenter.left <= anchor.x && topCenter.right >= anchor.x && topCenter.top <= anchor.y && topCenter.bottom >= anchor.y)
	{
		if (labelHeight > labelWidth)
		{
			// don't display in the middle...
			offsetX = Math.round(balloonOffset * Math.sin(45));
			offsetY = Math.round(balloonOffset * Math.sin(45));
		}
		else
		{
			offsetX = -(Math.round(labelWidth / 2.0));
			offsetY = balloonOffset;
		}
	}
	else if (middleCenter.left <= anchor.x && middleCenter.right >= anchor.x && middleCenter.top <= anchor.y && middleCenter.bottom >= anchor.y)
	{
		// don't display in the middle...
		//offsetX = -(Math.round(labelWidth / 2.0f));
		//offsetY = -(Math.round(labelHeight / 2.0f));
		offsetX = balloonOffset;
		offsetY = -(Math.round(labelHeight / 2.0));
	}
	else if (bottomCenter.left <= anchor.x && bottomCenter.right >= anchor.x && bottomCenter.top <= anchor.y && bottomCenter.bottom >= anchor.y)
	{
		if (labelHeight > labelWidth)
		{
			// don't display in the middle...
			offsetX = Math.round(balloonOffset * Math.sin(45));
			offsetY = -(labelHeight) - Math.round(balloonOffset * Math.sin(45));
		}
		else
		{
			offsetX = -(Math.round(labelWidth / 2.0));
			offsetY = -(labelHeight - balloonOffset);
		}
	}
	else if (topRight.left <= anchor.x && topRight.right >= anchor.x && topRight.top <= anchor.y && topRight.bottom >= anchor.y)
	{
		offsetX = -(labelWidth - Math.round(balloonOffset * Math.sin(45)));
		offsetY = Math.round(balloonOffset * Math.sin(45));
	}
	else if (middleRight.left <= anchor.x && middleRight.right >= anchor.x && middleRight.top <= anchor.y && middleRight.bottom >= anchor.y)
	{
		offsetX = -(labelWidth - balloonOffset);
		offsetY = -(Math.round(labelHeight / 2.0));
	}
	else // bottomRight
	{
		offsetX = -(labelWidth - Math.round(balloonOffset * Math.sin(45)));
		offsetY = -(labelHeight - Math.round(balloonOffset * Math.sin(45)));
	}

	// determine if viewport dimensions contain offset label, if not, adjust
	var labelX = Math.round(anchor.x + offsetX);
	var labelY = Math.round(anchor.y + offsetY);
	if (labelX + labelWidth > viewport.x + viewport.width)
	{
		offsetX -= (labelX + labelWidth - viewport.x + viewport.width);
	}
	if (labelY + labelHeight > viewport.y + viewport.height)
	{
		offsetY -= (labelY + labelHeight - viewport.y + viewport.height);
	}
}

BalloonTipLabel.prototype.isRenderStateModified = function(viewport)
{
	var modified = false;

	var screenPos = this.screenPosition.getValueDirect();
	if (this.prevRenderState.screenPos != screenPos)
	{
		this.prevRenderState.screenPos = screenPos;
		modified = true;
	}

	if (this.prevRenderState.viewport != viewport)
	{
		this.prevRenderState.viewport = viewport;
		modified = true;
	}

	return modified;
}

BalloonTipLabel.prototype.balloonTipLabelStyleModified = function(update)
{
	var labelStyle = this.styles.getStyle();
	if (labelStyle)
	{
		// displayMode
		var displayMode;
		labelStyle.displayMode().getValueDirect(displayMode);
		if (!displayMode.empty())
		{
			if (!strcmp("default", displayMode[0]))
			{
				this.show.setValueDirect(true, false);
			}
			else if (!strcmp("hide", displayMode[0]))
			{
				// don't hide if parent has focus
				if (this.motionParent && this.motionParent.getAttribute("hasFocus").getValueDirect() > 0)
				{
					// a bit kludgy for this programmer, but this is nessary to get the "Google Earth"-like behavior [MCB]
					this.hasFocus.setValueDirect(1);
					//DisableInspectionState();
				}
				else
				{
					this.show.setValueDirect(false, false);
				}
			}
		}
	}

	this.updateLabel = update;
	incrementModificationCount();
}

BalloonTipLabel.prototype.balloonTipLabelStyleBgColorModified = function()
{
	var labelStyle = this.styles.getStyle();
	if (labelStyle)
	{
		if (this.htmlLabel)
		{
			var htmlLabelStyle = this.htmlLabel.styles().getStyle();
			if (htmlLabelStyle)
			{
				var r, g, b, a;
				labelStyle.bgColor().getValueDirect(r, g, b, a);
				htmlLabelStyle.bgColor().setValueDirect(r, g, b, a);
			}
		}
	}
}

BalloonTipLabel.prototype.balloonTipLabelStyleDisplayModeModifiedCB = function(mode)
{
    if (!strncmp(mode, "default", sizeof("default")))
    {
        disableInspectionState();
    }
    else if (!strncmp(mode, "hide", sizeof("hide")))
    {
		restoreInspectionState();
	}
}

BalloonTipLabel.prototype.renderSequenceSlotModified = function()
{
	var slot = this.renderSequenceSlot.getValueDirect();

	if (this.anchor)
	{
		this.anchor.getAttribute("renderSequenceSlot").setValueDirect(Math.max(slot - 1, 0));
	}

	if (this.htmlLabel)
	{
		this.htmlLabel.getAttribute("renderSequenceSlot").setValueDirect(slot + 1);
	}
}

BalloonTipLabel.prototype.windowHandleModified = function()
{
	if (this.htmlLabel)
	{
		this.htmlLabel.getAttribute("windowHandle").CopyValue(this.windowHandle);
	}
}

BalloonTipLabel.prototype.showModified = function(show)
{
	updateShowStates();

	// reset selection/focus state to unknown (for RC event listener event processing)
	this.selected.setValueDirect(0, false);
	this.hasFocus.setValueDirect(0, false);
}

BalloonTipLabel.prototype.allocateRenderContextResources = function()
{
    // call base-class implementation
    RasterComponent.prototype.allocateRenderContextResources();

    // reload images in case frame buffer origin has changed due to render context update
    loadImages();

	this.updateLabel = true;

    RestoreInspectionState();
}

BalloonTipLabel_balloonTipLabelStyleModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.balloonTipLabelStyleModified(true);
	}
}

BalloonTipLabel_balloonTipLabelStyleBgColorModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.balloonTipLabelStyleBgColorModified();
	}
}

BalloonTipLabel_balloonTipLabelStyleDisplayModeModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
        var mode;
        node.balloonTipLabelStyleDisplayModeModifiedCB(attr.getValueDirect(mode));
		node.balloonTipLabelStyleModified(false);
	}
}

BalloonTipLabel_BalloonTipLabelStyleHTMLLabelStyleModifiedCB = function(attr, data)
{
	var node = data;
   
    if (node)
    {
		node.this.updateLabel = true;

        node.IncrementModificationCount();
	}
}

BalloonTipLabel_HTMLLabel_PageDimensionsModifiedCB = function(attr, data)
{
    var node = data;
    
    if (node)
    {
		node.this.updateLabel = true;

        node.incrementModificationCount();
	}
}

BalloonTipLabel_windowHandleModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.windowHandleModified();
	}
}

BalloonTipLabel_showModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.showModified(attr.getValueDirect());
	}
}

BalloonTipLabel_renderSequenceSlotModifiedCB = function(attr, data)
{
	var node = data;
    
    if (node)
    {
		node.renderSequenceSlotModified();
	}
}
