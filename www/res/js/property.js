var Property = new function()
{
    // Store a property
    this.set = function(name, value)
    {
        if(typeof name === "undefined")
            throw "The setProperty needs at least a property name to be set";
        
        if(typeof value === "undefined")
            window.localStorage.removeItem(name);
        else
            window.localStorage.setItem(name, JSON.stringify(value));
    };
    
    // Get a property
    this.get = function(name)
    {
        var value = window.localStorage.getItem(name);
        return (value === null) ? undefined : JSON.parse(value);
    };
};