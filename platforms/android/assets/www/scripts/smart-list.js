

var app = (function (app, native5) {
    app.registry = new native5.core.ServiceRegistry(); 
    var dev = false;
    
    var createService = function(url, config, successHandler) {
        var service =  new native5.core.Service(url, config);
        service.configureHandlers(
        function(data) {
            $('#page-wrap').removeClass('fade');
            $('#loading-anim').remove();
            successHandler(data);
        }, function(){
            $('#page-wrap').removeClass('fade');
            $('#loading-anim').remove();

            console.log(this);
        });
        return service;
    };
    
    // http://apps.sandbox.native5.com/zbdGs8Z2U1389602848
    
    app.construct = function(args) {
        var path;
        if(dev) path = 'http://192.168.1.15/timesheet';
        else path = 'http://apps.sandbox.native5.com/zbdGs8Z2U1389602848';
        this.config = {
            path : path,
            method : args.method,
            mode : 'ui'
        };
        return {
            config : this.config,
            serviceObject : createService(args.url, this.config, args.successHandler),
        };
        
    };
    
    app.returnPath = function(args) {
        if(dev)
        return 'http://192.168.1.15/timesheet';  
        else 
        return 'http://apps.sandbox.native5.com/zbdGs8Z2U1389602848';
    };
    
    return app;
})(app || {}, native5 || {});

var smartList = (function(smartList) {
    var domElement;
    var randomColors = function() {
        var colour = ['#4CC2E4', '#FFCC5C', '#FF6F69', '#77C4D3', '#00A388', '#3085D6', '#404040', '#468966', '#FFF0A5'
                      , '#225378', '#1695A3', '#ACF0F2', '#CCCC9F', '#C9D787', '#263248', '#263248', '#FF6138' ,
                     '#FFFF9D', '#BEEB9F', '#BEEB9F', '#00A388'];
        return colour[Math.floor(Math.random() * colour.length)];
    };
    
    var emptyListCheck = function() {
        if(this.domElement.children('ul').children().length < 1) {
            this.domElement.children('ul').addClass('empty-list');
        } else {
            this.domElement.children('ul').removeClass('empty-list');
        }
    }
    
    var activate = function() {
        this.emptyListCheck();
        this.domElement.children('ul').children().each(function(index) {
            if(!$(this).hasClass('list-item')) {
                $(this).addClass('list-item');
            } else {
                console.log('list-item class already present');
            }
            
            var style = 'border-left: 4px solid ' + randomColors() + ';';
            $(this).attr({'style' : style});
            
            if($(this).has('div.wrapper').length > 0) {
                console.log('wrapper already present');
            } else {
                $(this).wrapInner('<div class="wrapper"></div>');
            }
            
            $(this).find('p.email').each(function(index) {
                if($( this ).has('i.fa.fa-envelope').length > 0) {
                    console.log('Email icon already present');
                } else {
                    $(this).append('&nbsp;&nbsp;<i class="fa fa-envelope"></i>');
                }
                
            });
            
            $(this).find('img').each(function(index) {
                $(this).addClass('image round').attr({'width' : '50'});
                $(this).wrap('<div class="display-picture"></div>');
            });
        });
    }
    
    smartList.createList = function(args) {
        domElement = $(args.element);
        domElement.addClass('list');
        
        return {
            domElement : domElement,
            activate : activate,
            emptyListCheck : emptyListCheck,
            randomColors : randomColors,
        };
        
    };
    
    return smartList;
    
}(smartList || {}));

// ----------------------------------------------------------------------------------------------------------------------- //

