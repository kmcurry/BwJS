function MatchingModelExists(model, registry)
{
    var match = null;
    var url = model.url.getValueDirect().join("");
    var layer = model.layer.getValueDirect();
    
    var models = registry.getByType(eAttrType.Model);
    if (models)
    {
        for (var i=0; i < models.length; i++)
        {
           if (models[i] == model || !models[i].loaded) continue;

           if (models[i].url.getValueDirect().join("") == url &&
               models[i].layer.getValueDirect() == layer)
            {
                match = models[i];
                break;
            }
        }
    }
    
    return match;
}

function ReplaceModelSurfaces(replacee, replacement)
{
    if (!replacee || !replacement)
    {
        return false;
    }

    // get "Isolator" node from replacee
    var replacee_isolator = replacee.getNamedChild("Isolator");
    if (!replacee_isolator)
    {
        return false;
    }

    // get "Surfaces" node from replacee's isolator
    var replacee_surfaces = replacee_isolator.getNamedChild("Surfaces");
    if (!replacee_surfaces)
    {
        return false;
    }

    // get "Isolator" node from replacement
    var replacement_isolator = replacement.getNamedChild("Isolator");
    if (!replacement_isolator)
    {
        return false;
    }

    // get "Surfaces" node from replacement's isolator
    var replacement_surfaces = replacement_isolator.getNamedChild("Surfaces");
    if (!replacement_surfaces)
    {
        return false;
    }

    // remove "Surfaces" node from replacee's isolator
    replacee_isolator.removeChild(replacee_surfaces);

    // add "Surfaces" node from replacement's isolator to replacee's isolator
    replacee_isolator.addChild(replacement_surfaces);

    // update bbox
    replacee.getAttribute("bbox").copyValue(replacement.getAttribute("bbox"));

    // notify models of sharing model
    //dynamic_cast<CAttributePointerAttr*>(replacee->GetAttribute("sharingModel"))->SetValueDirect(replacement);
    //dynamic_cast<CAttributePointerAttr*>(replacement->GetAttribute("sharingModel"))->SetValueDirect(replacee);

    return true;
}

function CopyModelSurface(replacee, replacement)
{
}
