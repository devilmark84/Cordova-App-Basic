var App = new function()
{
    var ziz = this;
    
    var options = {
        "loading": undefined,       // loading callback (called after loaded configuration)
        "ajax": {
            "start": undefined,     // ajaxStart callback
            "stop": undefined,      // ajaxStop callback
            "timeout": 10000
        },
        "url": undefined            // url of the initial page to be loaded
    };
    
    var $current_page = $();      // Reference to the current page
    
    // DOM references
    var $body = $("body");
    var $wrapper = $("#cab-wrapper");
    var $pages_wrapper = $("#cab-pages-wrapper");
    var $pages = $("#cab-pages-container");
    var $loading = $("#cab-loading");
    
    // This function executes a call
    ziz.performCommand = function(url, data, options)
    {
        if(typeof data === "undefined")
            data = {};
        if(typeof options === "undefined")
            options = {};
        
        var local_options = options;
        var local_data = data;
        
        local_options.url = url;
        local_options.data = local_data;
        
        return $.ajax(local_options);
    };
    
    // Rock'n'roll!
    ziz.init = function(opts)
    {
        $.extend(options, opts);
        
        // AJAX setup
        initializeAJAX();
        
        // Load the CAB configuration file
        $.getScript("res/js/config.js").done(function()
        {
            // Call the loading callback
            if(typeof options.loading === "function")
                options.loading.call(ziz);
            
            // Bind events
            bindEvents();
            
        }).fail(function()
        {
            alert("CAB config.js missing or is not a well-formed js file");
        });
    };
    
    // Listen to app events
    var bindEvents = function()
    {
        document.addEventListener('deviceready', onDeviceReady, false);
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        document.addEventListener('online', onOnline, false);
        document.addEventListener('offline', onOffline, false);
        document.addEventListener('backbutton', onBackButton, false);
        document.addEventListener('menubutton', onMenuButton, false);
        document.addEventListener('searchbutton', onSearchButton, false);
        document.addEventListener('resize', onResize, false);
        document.addEventListener('showkeyboard', onShowKeyboard, false);
        document.addEventListener('hidekeyboard', onHideKeyboard, false);
        
        // Anchors handlers
        $(document).on("tapstart", "a, button", function()
        {
            $(this).addClass("cab-state-tapped");
        }).on("tapend", "a, button", function()
        {
            $(this).removeClass("cab-state-tapped");
        }).on("tap", "a", function(e)
        {
            e.preventDefault();
            
            var href = $(this).attr("href");
            var hasTarget = $(this).is("[target]");
            var role = $(this).attr("data-cab-role");
            var isBack = role === "back";
            
            // Prevent stupid links
            if(
                !isBack &&
                (
                    href === "#" ||
                    href.match(/javascript:/)
                )
            )
                return;
            
            // Execute the command
            if(isBack)
                ziz.goBack.call(this);
            else
                ziz.changePage.call(this, href);
        });
    };
    
    // AJAX setup
    var initializeAJAX = function()
    {
        $.ajaxSetup(
        {   
            "timeout": options.ajax.timeout,
            "async": true,
            "dataType": "html",
            "type": "get",
            "cache": false
        });
        
        $(document).ajaxStart(function()
        {
            // Call the ajaxStart callback
            if(typeof options.ajax.start === "function")
                options.ajax.start.call(ziz);
        }).ajaxStop(function()
        {
            // Call the ajaxStop callback
            if(typeof options.ajax.stop === "function")
                options.ajax.stop.call(ziz);
        });
    };
    
    var onDeviceReady = function()
    {
        // Load the initial page
        if(_.isString(options.url))
        {
            ziz.changePage(options.url);
        }
        else
            alert("CAB initial url has not been specified");
    };
    
    var onPause = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.pause");
    };
    
    var onResume = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.resume");
    };
    
    var onOnline = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.online");
    };
    
    var onOffline = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.offline");
    };
    
    var onBackButton = function()
    {
        // Page specific event
        var back_return = $current_page.triggerHandler("cab.backbutton");
        if(typeof back_return === "undefined")
            back_return = true;
        if(!back_return)
            return;
        
        // qui chiamare goBack
        ziz.goBack();
    };
    
    var onMenuButton = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.menubutton");
    };
    
    var onSearchButton = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.searchbutton");
    };
    
    var onResize = function()
    {
        // Page specific event
        var resize_return = $current_page.triggerHandler("cab.resize");
        if(typeof resize_return === "undefined")
            resize_return = true;
        
        if(!resize_return)
            return;
        
        // Do the standard page resize
        var $header = $(".cab-page-header", $current_page);
        var $main = $(".cab-page-main", $current_page);
        var $footer = $(".cab-page-footer", $current_page);
        
        $main.css({
            "top": $header.height(),
            "bottom": $footer.height()
        });
        
        console.log("resize");
    };
    
    var onShowKeyboard = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.showkeyboard");
        
        setTimeout(function()
        {
            onResize();
        }, 40);
    };
    
    var onHideKeyboard = function()
    {
        // Page specific event
        $current_page.triggerHandler("cab.hidekeyboard");
        
        setTimeout(function()
        {
            onResize();
        }, 40);
    };
    
    // Checks whether the app is online
    ziz.isOnline = function()
    {
        return navigator.network.connection.type !== Connection.NONE;
    };
    
    // Checks whether the app is offline
    ziz.isOffline = function()
    {
        return !ziz.isOnline();
    };
    
    // Check whether the app is running in an emulator
    ziz.isEmulated = function()
    {
        return typeof window.tinyHippos !== "undefined";
    };
    
    ziz.getActivePage = function()
    {
        return $current_page;
    }
    
    // Change the current page keeping the history
    ziz.changePage = function(url, custom_options)
    {
        if(!_.isObject(custom_options))
            custom_options = {};
        
        var change_options = {
            "clearHistory": false
        }
        $.extend(change_options, custom_options);
        
        ziz.performCommand(url, {}, {
            "success": function(data)
            {
                var $html = $(data);
                var $div = $html.filter("div:first");
                var $scripts = $html.filter("script");
                
                var $src = $div.wrapAll("<div />").parent().html();
                var template = Handlebars.compile($src);
                var $page = $(template({}));
                var $cnt = $("<div />", {
                    "class": "cab-page",
                    "url": url
                }).append($page).append($scripts);
                
                var $main = $(".cab-main", $cnt);
                
                storeCurrentPage();
                
                // Clear the forward history
                $current_page
                    .nextAll().remove();
                
                // Activate the page
                $current_page = $cnt;
                $cnt.addClass("cab-active-page").appendTo($pages);
                
                // Fix the body
                var page_class = $page.get(0).className.match(/page_.*/);
                $body.get(0).className = $body.get(0).className.replace(/\bcab-body_page_.*?\b/g, "");
                $body.addClass("cab-body_" + page_class[0]);
                
                // Page specific show event
                $cnt.triggerHandler("cab.show");
                
                // Force the page to be resized
                onResize();
                
                // Back to the top
                $main.scrollTop(0);
            }
        });
    };
    
    ziz.goBack = function()
    {
        // Previous page
        var $prev = $current_page.prev();
        if(!$prev.size())
            return;
        
        // Go back
        storeCurrentPage();
        
        var $page = $prev.children("div");
        var $main = $(".cab-main", $prev);
        var status = $prev.data("cab-status");
        
        $prev.addClass("cab-active-page");
        $current_page = $prev;
        
        // Fix the body
        var page_class = $page.get(0).className.match(/page_.*/);
        $body.get(0).className = $body.get(0).className.replace(/\bcab-body_page_.*?\b/g, "");
        $body.addClass("cab-body_" + page_class[0]);
        
        // Restore status
        $main
            .scrollTop(status.scrollTop);
    
        // Force the page to be resized
        onResize();
    };
    
    var storeCurrentPage = function()
    {
        var $main = $(".cab-main", $current_page);
        
        // Retrieve current status
        var status = {
            "scrollTop": $main.scrollTop()
        };
        
        // Store current status and deactivate it
        $current_page
            .data("cab-status", status)
            .removeClass("cab-active-page");
    };
};