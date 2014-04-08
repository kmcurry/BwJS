<?php
try {
    if (isset($_FILES['upfile'])) {
        
        // Undefined | Multiple Files | $_FILES Corruption Attack
        // If this request falls under any of them, treat it invalid.
        if (
            !isset($_FILES['upfile']['error']) ||
            is_array($_FILES['upfile']['error'])
        ) {
            $message = 'Error uploading file';
            switch( $_FILES['upfile']['error'] ) {
                case UPLOAD_ERR_OK:
                    $message = '- No File error detected.';
                    break;
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $message .= ' - file too large (limit of '.get_max_upload().' bytes).';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $message .= ' - file upload was not completed.';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $message .= ' - zero-length file uploaded.';
                    break;
                default:
                    $message .= ' - internal error #'.$_FILES['upfile']['error'];
                    break;
            }
            throw new RuntimeException($message);
        }
        
        // Check $_FILES['upfile']['error'] value.
        switch ($_FILES['upfile']['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new RuntimeException('No file sent.');
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new RuntimeException('Exceeded filesize limit.');
            default:
                throw new RuntimeException('Unknown errors.');
        }
        
        // You should also check filesize here. 
        if ($_FILES['upfile']['size'] > 1000000) {
            throw new RuntimeException('Exceeded filesize limit.');
        }
    
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $t = $_FILES['upfile']['tmp_name'];
        if (false === $ext = array_search(
            $finfo->file($t),
            array(
                'jpg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
            ),
            true
        )) {
            $message = 'Error uploading file';
            switch( $_FILES['upfile']['error'] ) {
                case UPLOAD_ERR_OK:
                    $message = " - No error detected.";;
                    break;
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $message .= ' - file too large (limit of '.get_max_upload().' bytes).';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $message .= ' - file upload was not completed.';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $message .= ' - zero-length file uploaded.';
                    break;
                default:
                    $message .= ' - internal error #'.$_FILES['upfile']['error'];
                    break;
            }
            throw new RuntimeException('Invalid file format.' . $message);
        }
        
        $f = sprintf('./uploads/%s.%s',
                sha1_file($_FILES['upfile']['tmp_name']),
                $ext
            );
    
        if (!move_uploaded_file($_FILES['upfile']['tmp_name'], $f)) {
            throw new RuntimeException('Failed to move uploaded file.');
        }
        // unsure if its unsafe to return our file name
        // but we want people to be able to link to these assets.
        // we might need to store a key-value pair to retreive based
        // on the name they gave us or some other thing.
        echo $f;    
        exit;
    }
} catch (Exception $e) {
    echo $e->getMessage();
    exit;
}
?>

<html>
  <head>
    <title>BWJS Demo</title>
    <script type="text/javascript" src="../../Common/Base.js"></script>
    <script type="text/javascript" src="../../Common/Util.js"></script>
    <script type="text/javascript" src="../../Common/BaseTypes.js"></script>
    <script type="text/javascript" src="../../Common/Stack.js"></script> 
    <script type="text/javascript" src="../../Common/Serialization.js"></script>
    <script type="text/javascript" src="../../Common/xmlsax.js"></script>
    <script type="text/javascript" src="../../Common/Timer.js"></script>  
    <script type="text/javascript" src="../../Common/DomAbsPos.js"></script>   
    <script type="text/javascript" src="../../Common/Enums.js"></script>     
    <script type="text/javascript" src="../../Math/MathUtil.js"></script>
    <script type="text/javascript" src="../../Math/Vector2D.js"></script>
    <script type="text/javascript" src="../../Math/Vector3D.js"></script>
    <script type="text/javascript" src="../../Math/Vector4D.js"></script>
    <script type="text/javascript" src="../../Math/Matrix4x4.js"></script>
    <script type="text/javascript" src="../../Math/MatrixStack.js"></script>
    <script type="text/javascript" src="../../Math/Quaternion.js"></script>
    <script type="text/javascript" src="../../Math/Line.js"></script>
    <script type="text/javascript" src="../../Math/Plane.js"></script>    
    <script type="text/javascript" src="../../Math/ViewVolume.js"></script>    
    <script type="text/javascript" src="../../Math/CompGeom.js"></script>     
    <script type="text/javascript" src="../../Attribute/AttributeType.js"></script>
    <script type="text/javascript" src="../../Attribute/Attribute.js"></script>
    <script type="text/javascript" src="../../Attribute/AttributeContainer.js"></script>
    <script type="text/javascript" src="../../Attribute/AttributeRegistry.js"></script>
    <script type="text/javascript" src="../../Attribute/BaseAttrs.js"></script>
    <script type="text/javascript" src="../../Attribute/AttributeVector.js"></script>  
    <script type="text/javascript" src="../../Attribute/StyleAttr.js"></script>      
    <script type="text/javascript" src="../../Attribute/ContainerAttrs.js"></script>
    <script type="text/javascript" src="../../Attribute/AttributeUtil.js"></script>
    <script type="text/javascript" src="../../Common/Agent.js"></script>
    <script type="text/javascript" src="../../Common/Spatial.js"></script>    
    <script type="text/javascript" src="../../RenderContext/RenderContext.js"></script>
    <script type="text/javascript" src="../../RenderContext/RenderState.js"></script>
    <script type="text/javascript" src="../../RenderContext/VertexBuffer.js"></script> 
    <script type="text/javascript" src="../../RenderContext/TextureObject.js"></script>
    <script type="text/javascript" src="../../RenderContext/Plugins/webgl/webgl-debug.js"></script>
    <script type="text/javascript" src="../../RenderContext/Plugins/webgl/webglRC.js"></script>
    <script type="text/javascript" src="../../RenderContext/Plugins/webgl/webglVB.js"></script>
    <script type="text/javascript" src="../../RenderContext/Plugins/webgl/webglTO.js"></script>
    <script type="text/javascript" src="../../ContentHandler/ContentHandler.js"></script>
    <script type="text/javascript" src="../../ContentHandler/ContentBuilder.js"></script>
    <script type="text/javascript" src="../../ContentHandler/BinaryParser.js"></script> 
    <script type="text/javascript" src="../../ContentHandler/TextParser.js"></script>     
    <script type="text/javascript" src="../../ContentHandler/XMLParser.js"></script>
    <script type="text/javascript" src="../../Image/PixelFormat.js"></script>  
    <script type="text/javascript" src="../../Image/ImageManip.js"></script>  
    <script type="text/javascript" src="../../Image/MediaPlayback.js"></script>
    <script type="text/javascript" src="../../SceneGraph/SceneGraph.js"></script>
    <script type="text/javascript" src="../../SceneGraph/StyleMgr.js"></script> 
    <script type="text/javascript" src="../../SceneGraph/GraphMgr.js"></script>   
    <script type="text/javascript" src="../../SceneGraph/Node.js"></script>  
    <script type="text/javascript" src="../../SceneGraph/SGNode.js"></script>
    <script type="text/javascript" src="../../SceneGraph/RenderableElement.js"></script>
    <script type="text/javascript" src="../../SceneGraph/ParentableMotionElement.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Directive.js"></script>
    <script type="text/javascript" src="../../SceneGraph/SGDirective.js"></script>
    <script type="text/javascript" src="../../SceneGraph/UpdateDirective.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Camera.js"></script>
    <script type="text/javascript" src="../../SceneGraph/PerspectiveCamera.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Light.js"></script>
    <script type="text/javascript" src="../../SceneGraph/DirectionalLight.js"></script>
    <script type="text/javascript" src="../../SceneGraph/PointLight.js"></script>
    <script type="text/javascript" src="../../SceneGraph/GlobalIllumination.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Group.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Isolator.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Dissolve.js"></script>
    <script type="text/javascript" src="../../SceneGraph/RenderDirective.js"></script>
    <script type="text/javascript" src="../../SceneGraph/RayPickDirective.js"></script> 
    <script type="text/javascript" src="../../SceneGraph/BBoxDirective.js"></script>        
    <script type="text/javascript" src="../../SceneGraph/Geometry.js"></script>
    <script type="text/javascript" src="../../SceneGraph/VertexGeometry.js"></script>
    <script type="text/javascript" src="../../SceneGraph/TriList.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Material.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Surface.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Model.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Texture.js"></script>
    <script type="text/javascript" src="../../SceneGraph/MediaTexture.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Evaluator.js"></script>
    <script type="text/javascript" src="../../SceneGraph/SceneInspector.js"></script>
    <script type="text/javascript" src="../../SceneGraph/ArcballInspector.js"></script>    
    <script type="text/javascript" src="../../SceneGraph/KeyframeInterpolator.js"></script> 
    <script type="text/javascript" src="../../SceneGraph/BBoxLocator.js"></script>     
    <script type="text/javascript" src="../../SceneGraph/SceneGraphUtil.js"></script>
    <script type="text/javascript" src="../../SceneGraph/RasterComponent.js"></script>    
    <script type="text/javascript" src="../../SceneGraph/Label.js"></script>
    <script type="text/javascript" src="../../SceneGraph/LineList.js"></script>
    <script type="text/javascript" src="../../SceneGraph/PointList.js"></script>
    <script type="text/javascript" src="../../SceneGraph/Interpolate.js"></script>
    <script type="text/javascript" src="../../SceneGraph/State.js"></script>              
    <script type="text/javascript" src="../../SceneGraph/DistanceSortAgent.js"></script> 
    <script type="text/javascript" src="../../SceneGraph/MapProjectionCalculator.js"></script>
    <script type="text/javascript" src="../../SceneGraph/NullObject.js"></script>
    <script type="text/javascript" src="../../Event/EventType.js"></script>
    <script type="text/javascript" src="../../Event/Event.js"></script> 
    <script type="text/javascript" src="../../Event/InputEvent.js"></script>
    <script type="text/javascript" src="../../Event/MouseEvent.js"></script>
    <script type="text/javascript" src="../../Event/EventAdapter.js"></script>
    <script type="text/javascript" src="../../Event/EventListener.js"></script>
    <script type="text/javascript" src="../../Event/EventMgr.js"></script>
    <script type="text/javascript" src="../../Device/DeviceHandler.js"></script>
    <script type="text/javascript" src="../../Device/MouseHandler.js"></script>
    <script type="text/javascript" src="../../BwCore/Command.js"></script>
    <script type="text/javascript" src="../../BwCore/Set.js"></script>
    <script type="text/javascript" src="../../BwCore/ConnectAttributes.js"></script>
    <script type="text/javascript" src="../../BwCore/AutoInterpolate.js"></script>  
    <script type="text/javascript" src="../../BwCore/MotionInterpolate.js"></script>  
    <script type="text/javascript" src="../../BwCore/Locate.js"></script>  
    <script type="text/javascript" src="../../BwCore/Play.js"></script>  
    <script type="text/javascript" src="../../BwCore/Remove.js"></script>                  
    <script type="text/javascript" src="../../BwCore/Stop.js"></script>  
    <script type="text/javascript" src="../../BwCore/CommandSequence.js"></script>
    <script type="text/javascript" src="../../BwCore/CommandMgr.js"></script>
    <script type="text/javascript" src="../../BwCore/BwRegistry.js"></script>
    <script type="text/javascript" src="../../BwCore/BwSceneInspector.js"></script>
    <script type="text/javascript" src="../../BwCore/ConnectionMgr.js"></script>
    <script type="text/javascript" src="../../BwCore/RenderAgent.js"></script>
    <script type="text/javascript" src="../../BwCore/RenderController.js"></script>
    <script type="text/javascript" src="../../BwCore/SelectionListener.js"></script>    
    <script type="text/javascript" src="../../BwCore/ViewportLayout.js"></script>
    <script type="text/javascript" src="../../BwCore/GridLayout.js"></script>
    <script type="text/javascript" src="../../BwCore/ViewportMgr.js"></script>
    <script type="text/javascript" src="../../BwCore/RasterComponentEventListener.js"></script>
    <script type="text/javascript" src="../../ContentHandler/LWObjectHandler.js"></script>
    <script type="text/javascript" src="../../ContentHandler/LWObjectBuilder.js"></script>
    <script type="text/javascript" src="../../ContentHandler/LWSceneHandler.js"></script>
    <script type="text/javascript" src="../../ContentHandler/LWSceneBuilder.js"></script>
    <script type="text/javascript" src="../../Attribute/AttributeFactory.js"></script>
    <script type="text/javascript" src="../../BwCore/Bridgeworks.js"></script>
    <link type="text/css" rel="StyleSheet" href="../../Bridgeworks.css"/>
    <link href="UI/styles/StyleSheetResize.css" rel="stylesheet" type="text/css" />
    <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js"></script>
	<script src="../../Libs/jquery/jquery.hoverIntent.minified.js" type="text/javascript" charset="utf-8"></script> 
	<script src="../../Libs/jquery/jquery.bgiframe.min.js" type="text/javascript" charset="utf-8"></script> 
    <script src="../../Libs/jquery/bt/jquery.bt.min.js" type="text/javascript" ></script>  
    <script type="text/javascript" src="../BwHelper.js"></script>
    <script type="text/javascript" src="UI/scripts/crossbrowser.js"></script>  
  </head>
   

  <body onresize="resize();" onmousemove="handleDocMove(event);">
      <script type="text/javascript">

          var bridgeworks = null;
          
          var recordCount = 0;
          var count = "";
          var g_recordName = "";
          
          var capture = false;
          var adding = false;
          
          // This function makes it so that mouse interaction with the scene
          // continues when the cursor moves out of the Bridgeworks frame.
          function handleDocMove(event)
          {
              if (capture) bridgeworks.handleEvent(event);
          }

          function handleEvent(event)
          {
              bridgeworks.handleEvent(event);
              
              switch(event.type) {
                case "mousedown":
                    capture = true;
                    break;
                case "mouseup":
                    capture = false;
                    break;
                case "click": {
                    capture = false;
                  }
                  break;
              }
              
          }
          
          function createRecord()
          {
              $( "#dialog" ).dialog("open");
              
              adding = true;
              
              var pointWorld = bridgeworks.selector.pointWorld.getValueDirect();
                          
              recordCount = recordCount + 1;
              count = recordCount.toString();
              
              g_recordName = "R-" + count;
              
              var xml = loadXMLFile("bwcontent/record.xml");
              
              var name = xml.getElementsByTagName("Model")[0].attributes[0];
              name.value = g_recordName;
              
              var pos = xml.getElementsByTagName("position")[0];
              pos.attributes["x"].value = pointWorld.x.toString();
              pos.attributes["y"].value = pointWorld.y.toString();
              pos.attributes["z"].value = pointWorld.z.toString();
              
              var label = xml.getElementsByTagName("Label")[0];
              label.attributes["name"].value = "Label_" + name.value;
              label.attributes["parent"].value = name.value;
              
              name = xml.getElementsByTagName("Group")[0].attributes[0];
              name.value = "Group_" + g_recordName;
              
              bridgeworks.updateScene((new XMLSerializer()).serializeToString(xml));
          }
          
          function addRecord()
          {
              var f = $( '#upfile' )[0].files[0];
              if (f) {
                  sendFile(f);
              } else {
                  var title = $( "#title" ).val();
                  var date = $( "#datepicker" ).val();
                  addLink(title, g_recordName, date, null);
              }
              // This flag is checked on dialog close. If true on close
              // then there are some things to undo.
              // If we made it this far then there is nothing to undo.
              adding = false;
              $( "#dialog" ).dialog("close");
          }
          
          function addLink(title, recordName, date, url) 
          {
              // title is the minimum record
              if (title) {
                  bridgeworks.updateScene("\<Set target='Label_" + g_recordName + "' text='" + title + "'/>");
      
                  var text = "\<p class=\"records\">\<a onclick='showRecord(\"Label_" + recordName + "\"";
                  if (url) {
                      text += ", \"" + url + "\"";
                  }
                  text += ");'>";
                  text += title;
                  if (date) {
                      text += " (" + date + ")";
                  } 
                  text += "\</a>\</p>";
                  
                  $("#io").append(text);
                  
              }
          }
          
          function progressHandlingFunction(e){
              if(e.lengthComputable){
                  $('progress').attr({value:e.loaded,max:e.total});
              }
          }
          
          function sendFile(file) {
              var uri = "./default.php";
              var xhr = new XMLHttpRequest();
              var fd = new FormData();
              
              xhr.open("POST", uri, true);
              xhr.onreadystatechange = function() {
                  if (xhr.readyState == 4 && xhr.status == 200) {
                      // Handle response.
                      var title = $( "#title" ).val();
                      var date = $( "#datepicker" ).val();
                      addLink(title, g_recordName, date, xhr.responseText);
                  }
              };
              fd.append('upfile', file);
              // Initiate a multipart/form-data upload
              xhr.send(fd);
          }
          
          function showRecord(name, url)
          {
              bridgeworks.updateScene("\<Set target='" + name + "' show='true'/>");
              
              if (url) {
                  var thumb = document.getElementById("thumb");
                  thumb.src = url;
              }
          }
          
          function showFront()
          {
              bridgeworks.updateScene("\<AutoInterpolate duration='.5' target='Body_Male'>\<rotation x='0' y='0' z='0'/>\</AutoInterpolate>");
          }
          
          function showBack()
          {
              bridgeworks.updateScene("\<AutoInterpolate duration='.5' target='Body_Male'>\<rotation x='0' y='-180' z='0'/>\</AutoInterpolate>");
          }
          
          function showLeft()
          {
              bridgeworks.updateScene("\<AutoInterpolate duration='.5' target='Body_Male'>\<rotation x='0' y='90' z='0'/>\</AutoInterpolate>");
          }
          
          function showRight()
          {
              bridgeworks.updateScene("\<AutoInterpolate duration='.5' target='Body_Male'>\<rotation x='0' y='-90' z='0'/>\</AutoInterpolate>");
          }
          
          function showHome()
          {
              bridgeworks.updateScene("home.xml");
          }
          
          $(function() {
              $( "#datepicker" ).datepicker();
            });

      </script>
      <div id="logo">
      <img src="UI/images/logo.png">
      </div>
      <!-- TODO: move styles -->
      <div id="panel-left">
     
          
          <label class="rb" for="rb1">
                            <input id="rb1" type="radio" name="rb" value="" />
                            <img src="UI/images/prescriptions.png" width="75" height="71" title="Prescriptions" onClick="#">
                        </label><br>
                        <label class="rb" for="rb2">
                            <input id="rb2" type="radio" name="rb" value="" />
                            <img src="UI/images/exercise.png" width="75" height="71" title="Exercise" onClick="#">
                        </label><br>
                        <label class="rb" for="rb3">
                            <input id="rb3" type="radio" name="rb" value="" />
                            <img src="UI/images/nutrition.png" width="75" height="71" title="Nutrition" onClick="#">
                        </label><br>
                        <label class="rb" for="rb4">
                            <input id="rb4" type="radio" name="rb" value="" />
                            <img src="UI/images/conditions.png" width="75" height="71" title="Conditions" onClick="#">
                        </label><br>
                        <label class="rb" for="rb5">
                            <input id="rb5" type="radio" name="rb" value="" />
                            <img src="UI/images/date.png" width="75" height="71" title="Alerts" onClick="#">
                        </label><br>
                        <label class="rb" for="rb6">
                            <input id="rb6" type="radio" name="rb" value="" />
                            <img src="UI/images/group.png" width="75" height="71" title="Team" onClick="#">
                        </label><br>
          <div id="io">
          </div>
          <div id="thumbnail" style="max-width:100%;max-height:100%;">
              <img id="thumb" style="max-width:100%;max-height:100%;"/>
          </div>
      </div>
      <img id="BackgroundImage" style="position: absolute; visibility: hidden; z-index: 1;" src="bwcontent/images/white.png"/>
    <div id="BwContainer" onclick="handleEvent(event);" onmousedown="handleEvent(event);" onmouseup="handleEvent(event);" onmousemove="handleEvent(event);" oncontextmenu="createRecord()"; >

  
    </div>
    <div id="DVDControls">
        <button onclick="showHome();">Home</button>
        <button onclick="showFront();">Front</button>
        <button onclick="showBack();">Back</button>
        <button onclick="showLeft();">Left</button>
        <button onclick="showRight();">Right</button>
    </div>
    
    <div id="dialog" title="Add Med Info">
        <form id="my-form" enctype="multipart/form-data" method="post">
            <p>Title: <input type="text" id="title"></p>
            <p>Date: <input type="text" id="datepicker"></p>
            <p>Attach a file: <input type="file" name="upfile" id="upfile"></p>
            <p><input type="button" value="Submit" onclick="addRecord()" onenter="addRecord()"></p>
        </form>
    </div>    
    <script type="text/javascript">
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            bridgeworks = init("Body.xml", document.getElementById("BwContainer"));
            
            $( "#dialog" ).dialog({ autoOpen: false });
            
            $( "#dialog" ).dialog({ show: { effect: "blind", duration: 200 } });
            
            $( "#dialog" ).dialog({ hide: { effect: "blind", duration: 200 } });
          
            $( "#dialog" ).dialog({
              close: function( event, ui ) {
                  if (adding) {
                      // if in the middle of adding and closed w/o submitting
                      bridgeworks.updateScene("\<Remove target='" + "Group_R-" + count + "'/>");
                  }
                  adding = false;
              }
            });
        }
    }
    </script>
  </body>
</html>
