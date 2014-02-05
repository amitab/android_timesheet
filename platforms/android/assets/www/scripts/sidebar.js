
    
document.addEventListener('deviceready', function() {
    
    function urlData() {
        var query = location.search.substr(1);
        var data = query.split("&");
        var result = {};
        for(var i=0; i<data.length; i++) {
            var item = data[i].split("=");
            result[item[0]] = item[1];
        }
        return result;
    }
    
    var params = urlData();
    console.log(params);
    var dataId = params['id'];
    
    var animation = false;
    // HEADER
    
    function menuIcon() {
        if($('.trigger').children('h5').children('i').hasClass('fa-bars'))
            $('.trigger').children('h5').children('i').removeClass('fa-bars').addClass('fa-times');
        else
            $('.trigger').children('h5').children('i').removeClass('fa-times').addClass('fa-bars');
    }
    
    
    function closeMenu(){
        menuIcon();
        $('#page-wrap').removeClass('active');
        $('#sidebar').removeClass('active');
        setTimeout(function(){ $('#sidebar').css('z-index','-100'); animation = false; },350);
    }
    
    function openMenu(){
        menuIcon();
        $('#sidebar').css('z-index','100');
        $('#page-wrap').addClass('active');
        $('#sidebar').addClass('active');
        setTimeout(function(){ animation = false; },350);
    }
    
    var notification = false;
    var search = false;
    var refresh = false;
    var edit = false;
    var inline_menu = false;
    var form_save = false;
    var add_task = false;
    var count = 0;
    
    var menu = [];
    
    var headerHandler = function(data) {
        if(data.message.header_menu.search == true) {
            search = true;
            menu.push({
                icon: 'img/search.png',
                text: 'Search',
                click: function() {
                    alert('Search');
                }
            });
            count++;
        }
        if(data.message.header_menu.refresh == true) {
            refresh = true;
            menu.push({
                icon: 'img/refresh.png',
                text: 'Refresh',
                click: function() {
                    alert('Refresh');
                }
            });
            count++;
        }
        if(data.message.header_menu.edit == true) {
            edit = true;
            menu.push({
                icon: 'img/edit.png',
                text: 'Edit',
                click: function() {
                    alert('Edit');
                }
            });
            count++;
        }
        if(data.message.header_menu.inline_menu == true) {
            inline_menu = true;
            menu.push({
                icon: 'img/inline.png',
                text: 'Options',
                click: function() {
                    alert('Inline menu');
                }
            });
            count++;
        }
        if(data.message.header_menu.form_save == true) {
            form_save = true;
            menu.push({
                icon: 'img/save.png',
                text: 'Save',
                click: function() {
                    alert('Save');
                }
            });
            count++;
        }
        if(data.message.header_menu.add_task == true) {
            add_task = true;
            menu.push({
                icon: 'img/add.png',
                text: 'Add Task',
                click: function() {
                    alert('Add');
                }
            });
            count++;
        } else if(data.message.header_menu.notification == true) {
            notification = true;
            menu.push({
                icon: 'img/noti.png',
                text: 'Notifications',
                click: function() {
                    window.location.href = "notifications.html";
                }
            });
            count++;
        }
        
        if(count < 2) {
            menu.push({
                icon: 'img/menu-icon.png',
                text: 'Menu',
                click: function() {
                    if(!animation && Modernizr.csstransforms3d) {
                        animation = true;
                        if($('#page-wrap').hasClass('active')) {
                            closeMenu();
                        }
                        else openMenu();
                    } 
                }
            });
        }
        
        window.plugins.navBar.setLogo('images/timesheet-logo.png');
        window.plugins.navBar.setIcon('images/timesheet-logo.png');
        window.plugins.navBar.setTitle('TITLE');
        window.plugins.navBar.setMenu(menu);
        window.plugins.navBar.setDisplayHomeAsUpEnabled("true");
        window.plugins.navBar.setDisplayShowHomeEnabled("true");
        window.plugins.navBar.show();
        
    };
    
    var headerLoader = app.construct({
        path : 'timesheet',
        method : 'POST',
        url : 'headerdata',
        successHandler : headerHandler
    });
    
    headerLoader.serviceObject.invoke({for: $('input#page').val(), id: dataId });
    
    /*window.plugins.navBar.setLogo('images/timesheet-logo.png');
    window.plugins.navBar.setIcon('images/timesheet-logo.png');
    window.plugins.navBar.setTitle('');
    window.plugins.navBar.setMenu([
    {
        icon: 'img/menu-icon.png',
        text: 'Home',
        click: function() {
            if(!animation && Modernizr.csstransforms3d) {
                animation = true;
                if($('#page-wrap').hasClass('active')) {
                    closeMenu();
                }
                else openMenu();
            } 
        }
    }
    ]);
    window.plugins.navBar.setMenu(menu);
    window.plugins.navBar.setDisplayHomeAsUpEnabled("true");
    window.plugins.navBar.setDisplayShowHomeEnabled("true");
    window.plugins.navBar.show();*/
    
});

$(document).ready(function(){
    
    var animation = false;
				
    var ua = navigator.userAgent,
    clickevent = (ua.match(/iPad/i) || ua.match(/iPhone/i) || ua.match(/Android/i)) ? "touchstart" : "click";
    
    function menuIcon() {
        if($('.trigger').children('h5').children('i').hasClass('fa-bars'))
            $('.trigger').children('h5').children('i').removeClass('fa-bars').addClass('fa-times');
        else
            $('.trigger').children('h5').children('i').removeClass('fa-times').addClass('fa-bars');
    }
    
    
    function closeMenu(){
        menuIcon();
        $('#page-wrap').removeClass('active');
        $('#sidebar').removeClass('active');
        setTimeout(function(){ $('#sidebar').css('z-index','-100'); animation = false; },350);
    }
    
    function openMenu(){
        menuIcon();
        $('#sidebar').css('z-index','100');
        $('#page-wrap').addClass('active');
        $('#sidebar').addClass('active');
        setTimeout(function(){ animation = false; },350);
    }
    
    function openInlineMenu(inlineMenu) {
        animation = true;
        inlineMenu.removeClass('hidden').addClass('moving-in');
        setTimeout(function(){ inlineMenu.removeClass('moving-in'); animation = false; },350);
    }
    
    function closeInlineMenu(inlineMenu) {
        animation = true;
        inlineMenu.addClass('moving-out');
        setTimeout(function(){ inlineMenu.addClass('hidden').removeClass('moving-out'); animation = false; },350);
    }
    
    $(document).on(clickevent, '#page-wrap', function(event) {
        //event.preventDefault();
        
        var target = $(event.target);
        if(target.is('a.page-link.small')) {
            window.location.href = target.attr('href');
        }
        if(!target.is('div.inline-menu a')) {
            if(!$('div.inline-menu').hasClass('hidden')) {
                closeInlineMenu($('div.inline-menu'));
            }
        }
        
        if($('#page-wrap').hasClass('active')) {
            event.preventDefault();
            if(!animation && Modernizr.csstransforms3d) {
                animation = true;
                closeMenu();
            } 
        } 
        /*if(!$('#search-box').hasClass('closed')) {
            $('#search-box').addClass('closed');
            $('#search-box').val('');
            $('div.header-item:first').removeClass('fade-out');
        }*/
    });
    
    $(document).on(clickevent, '.trigger', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(!animation && Modernizr.csstransforms3d) {
            animation = true;
            if($('#page-wrap').hasClass('active')) {
                closeMenu();
            }
            else openMenu();
        } 
    });
    
    $(document).on(clickevent, '.inline-menu-trigger', function(e) {
        e.preventDefault();
        if(animation) return false;
        var inlineMenu = $($(this).attr('menu'));
        if(inlineMenu.hasClass('hidden')) {
            openInlineMenu(inlineMenu);
        } else {
            closeInlineMenu(inlineMenu);
        }
    });
    
    $(document).on(clickevent, '.remove-section', function(e) {
        e.preventDefault();
        var section = $(this).closest('section');
        section.addClass('moving-out');
        setTimeout(function(){ section.remove(); },400);
    });
    
    /*$('.warnings').bind('DOMNodeInserted', function(e) {
        $('.warnings').removeClass('hide').addClass('waah');
        setTimeout(function(){ 
            $('.warnings').removeClass('waah'); 
            setTimeout(function(){ $('.warnings').addClass('hide'); },400);
        },4000);
    }); */
    
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = [37, 38, 39, 40];
    var pos;
    
    function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
          e.preventDefault();
        e.returnValue = false;  
    }
    
    function keydown(e) {
        for (var i = keys.length; i--;) {
            if (e.keyCode === keys[i]) {
                preventDefault(e);
                return;
            }
        }
    }
    
    function wheel(e) {
        preventDefault(e);
    }
    
    function disable_scroll() {
        if (window.addEventListener) {
          window.addEventListener('DOMMouseScroll', wheel, false);
        }
        window.onmousewheel = document.onmousewheel = wheel;
        document.onkeydown = keydown;
        $('#page-wrap').bind('touchmove', function(e){e.preventDefault(); return false;});
        
        pos = $(document).scrollTop();
        $('#page-wrap').css({'overflow' : 'hidden', 'height' : '100%'});
        $('#page-wrap').scrollTop(pos);
        
    }
    
    function enable_scroll() {
        if (window.removeEventListener) {
            window.removeEventListener('DOMMouseScroll', wheel, false);
        }
        window.onmousewheel = document.onmousewheel = document.onkeydown = null;  
        $('#page-wrap').unbind('touchmove');
        $('#page-wrap').removeAttr( 'style' );
        $(document).scrollTop(pos);
    }
    
    
    $('#back').click(function(e) {
        e.preventDefault();
        history.back();
    })

    
    $('#submit').click(function(){
        $(this).closest('form').submit();
    });
    
    $(document).on(clickevent, '#save-form', function(e) {
        e.preventDefault();
        var form = $($(this).attr('target'));
        form.submit();
    });
    
    var logoutHandler = function(data) {
    	if(data.message.success == true) {
    		alert("Logout Successful");
    		localStorage.removeItem('rand_token');
    		localStorage.removeItem('user');
            
    		window.location.href = "auth.html";
    	} else {
    		alert("Logout Unsucessful");
    	}
    };
    
    var disconnector = app.construct({
    	method: 'POST',
    	url: 'logout',
    	successHandler: logoutHandler
    });
    
    $(document).hammer().on('tap', '#logout', function(e) {
    	e.preventDefault();
    	disconnector.serviceObject.invoke();
    });
    
});