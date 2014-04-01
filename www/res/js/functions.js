// Use this function to debug complex objects instead of console.log
// This function is useful in the ADB Log window
var debug = function(o)
{
    var props = [];
    var found = false;
    for(var i in o)
    {
        found = false;
        for(var j in o.prototype)
        {
            if(j === i)
            {
                found = true;
                break;
            }
        }
        if(!found)
            props.push(i);
    }

    for(var i in props)
    {
        try
        {
            console.log("__" + props[i] + ": " + o[props[i]]);
        }
        catch(e)
        {

        }
    }
};