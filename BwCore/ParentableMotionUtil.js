

var g_objPosMap = {};

function addInspectionGroup(node, factory)
{

    // ensure that rotation group has not already been added
    var rotGroup = getInspectionGroup(node);

    if (rotGroup)
        return;

    var pGrp = new Group();
    pGrp.setGraphMgr(factory.graphMgr);
    var pTranslate = new Translate();
    pTranslate.setGraphMgr(factory.graphMgr);
    var pScaleInv = new Scale();
    pScaleInv.setGraphMgr(factory.graphMgr);
    var pQuat = new QuaternionRotate();
    pQuat.setGraphMgr(factory.graphMgr);
    var pTransBack = new Translate();
    pTransBack.setGraphMgr(factory.graphMgr);
    var pScale = new Scale();
    pScale.setGraphMgr(factory.graphMgr);

    pQuat.addModifiedCB(Util_InspectionGroup_RotationQuatModifiedCB, node);

    pGrp.name.setValueDirect("InspectionGroup");
    pTranslate.name.setValueDirect("Translate");
    pScaleInv.name.setValueDirect("ScaleInverse");
    pQuat.name.setValueDirect("Quaternion");
    pTransBack.name.setValueDirect("TranslateBack");
    pScale.name.setValueDirect("Scale");

    pGrp.addChild(pTranslate); // child 0
    pGrp.addChild(pScaleInv);  // child 1
    pGrp.addChild(pQuat);      // child 2
    pGrp.addChild(pScale);     // child 3
    pGrp.addChild(pTransBack); // child 4

    var pChildZero = node.getChild(0);
    if (pChildZero)
    {
        pChildZero.insertChild(pGrp, 0);
    }

    node.registerAttribute(pTranslate.translation, "inspectionGroup_translate");
    node.registerAttribute(pScaleInv.scale, "inspectionGroup_scaleInverse");
    node.registerAttribute(pQuat.rotationQuat, "inspectionGroup_rotationQuat");
    node.registerAttribute(pQuat.enabled, "inspectionGroup_rotationEnabled");
    node.registerAttribute(pScale.scale, "inspectionGroup_scale");
    node.registerAttribute(pTransBack.translation, "inspectionGroup_translateBack");

    pTranslate.translation.setContainer(node);
    pScaleInv.scale.setContainer(node);
    pQuat.rotationQuat.setContainer(node);
    pQuat.enabled.setContainer(node);
    pScale.scale.setContainer(node);
    pTransBack.translation.setContainer(node);

    return;
}

function deleteInspectionGroup(node)
{
    var rotGroup = getInspectionGroup(node);
    if (rotGroup)
    {
        rotGroup.getChild(0).getAttribute("translation").setContainer(rotGroup.getChild(0));
        rotGroup.getChild(1).getAttribute("scale").setContainer(rotGroup.getChild(1));
        rotGroup.getChild(2).getAttribute("rotationQuat").setContainer(rotGroup.getChild(2));
        rotGroup.getChild(2).getAttribute("enabled").setContainer(rotGroup.getChild(2));
        rotGroup.getChild(3).getAttribute("scale").setContainer(rotGroup.getChild(3));
        rotGroup.getChild(4).getAttribute("translation").setContainer(rotGroup.getChild(4));

        node.unregisterAttribute(node.getAttribute("inspectionGroup_translate"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_scaleInverse"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_rotationQuat"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_rotationEnabled"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_scale"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_translateBack"));

        node.removeChild(rotGroup);

    }

    return;
}

function getInspectionGroup(moveableNode)
{
    var group = null;

    var childZero = moveableNode.getChild(0);
    if (childZero)
    {
        group = childZero.getNamedChild("InspectionGroup")
    }

    return group;
}

function setInspectionGroupActivationState(node, enable)
{
    var pRotGroup = getInspectionGroup(node);
    if (pRotGroup)
    {
        var pQuat = pRotGroup.getChild(2);
        if (pQuat)
        {
            pQuat.enabled.setValueDirect(enable);

            if (!enable)
            {
                var quat = new Quaternion();
                quat.loadIdentity();

                var quatAttr = pQuat.rotationQuat;
                quatAttr.setValueDirect(quat);
            }
        }

        var pPos = node.getAttribute("position");
        if (enable)
        {
            if (!(node in g_objPosMap))
            {
                g_objPosMap[node] = pPos.getValueDirect();
            }
        }
        else // !enable
        {
            var pos = g_objPosMap[node];
            pPos.setValueDirect(pos);
        }
    }

    return;
}

function setInspectionGroupContainer(node)
{
    var pRotGroup = getInspectionGroup(node);
    if (pRotGroup)
    {
        node.unregisterAttribute(node.getAttribute("inspectionGroup_translate"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_scaleInverse"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_rotationQuat"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_rotationEnabled"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_scale"));
        node.unregisterAttribute(node.getAttribute("inspectionGroup_translateBack"));

        node.registerAttribute(pRotGroup.getChild(0).getAttribute("translation"), "inspectionGroup_translate");
        node.registerAttribute(pRotGroup.getChild(1).getAttribute("scale"), "inspectionGroup_scaleInverse");
        node.registerAttribute(pRotGroup.getChild(2).getAttribute("rotationQuat"), "inspectionGroup_rotationQuat");
        node.registerAttribute(pRotGroup.getChild(2).getAttribute("enabled"), "inspectionGroup_rotationEnabled");
        node.registerAttribute(pRotGroup.getChild(3).getAttribute("scale"), "inspectionGroup_scale");
        node.registerAttribute(pRotGroup.getChild(4).getAttribute("translation"), "inspectionGroup_translateBack");

        pRotGroup.getChild(0).getAttribute("translation").setContainer(node);
        pRotGroup.getChild(1).getAttribute("scale").setContainer(node);
        pRotGroup.getChild(2).getAttribute("rotationQuat").setContainer(node);
        pRotGroup.getChild(2).getAttribute("enabled").setContainer(node);
        pRotGroup.getChild(3).getAttribute("scale").setContainer(node);
        pRotGroup.getChild(4).getAttribute("translation").setContainer(node);
    }

    return;
}

function zeroInspectionGroup(node)
{
    var pRotGroup = getInspectionGroup(node);
    if (pRotGroup)
    {
        var pQuat = pRotGroup.getChild(2);
        if (pQuat)
        {
            var quat = new Quaternion();
            quat.loadIdentity();

            var quatAttr = pQuat.rotationQuat;
            quatAttr.setValueDirect(quat);
        }
    }

    return;
}

function clearObjectPositionMap()
{
    g_objPosMap = {};

    return;
}

// notify node that the rotation quat rotates that it has been modified
function Util_InspectionGroup_RotationQuatModifiedCB(attribute, container)
{
    container.setModified();
}