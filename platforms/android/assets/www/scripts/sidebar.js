document.addEventListener('deviceready', function() {
    // --------------------------------------- NOTIFICATIONS SPECIFIC STARTS ------------------------------------------------------
    
    var notificationList = smartList.createList({element : '#notification-list'});
    var notificationSuccessHandler = function(data) {
        
        if(data.message.notifications.length == 0) {
            native5.Notifications.show( data.message.lol, {
                notificationType:'toast',
                title:'Information',
                position:'bottom',
                distance:'0px',
                timeout: 5000,
                persistent:false
            });
            
            return;
        }
        
        $.each(data.message.notifications, function(key, value) {
            
            var notificationDate = ~~(new Date(value.notificationDate).getTime()/1000);
            var today = ~~(new Date(Date.now()).getTime()/1000);
            
            var timeLeft = today - notificationDate;
            var days = Math.round(timeLeft/(3600*24));
            var hrs = Math.round(timeLeft / 3600);
            var mins = Math.round((timeLeft % 3600) / 60);
            var secs = Math.round(timeLeft % 60);
            
            var timeString = '';
            
            if(days > 0) {
                timeString += days;
                if(days == 1) timeString  += ' day ago';
                else timeString  += ' days ago';
            } else if (hrs > 0) {
                timeString += hrs;
                if(hrs == 1) timeString  += ' hour ago';
                else timeString  += ' hours ago';
            } else if (mins > 0) {
                timeString += mins;
                if(hrs == 1) timeString  += ' minute ago';
                else timeString  += ' minutes ago';
            } else if (secs > 0) {
                timeString += secs;
                if(hrs == 1) timeString  += ' second ago';
                else timeString  += ' seconds ago';
            } else {
                timeString += 'Just Now';
            }
            
            var list = '';
            list += '<li class="notification-link" id="' + value.notificationId +'" url="' + value.url + value.notificationSubjectId + '">';
            list += '<div class="content">';
            list += '<div class="content-header">';
            list += '<p class="small"><span class="from">' + value.notificationFromUser + '</span>, <span class="time">'; 
            list += timeString + '</span></p>';
            list += '</div>';
            list += '<p>' + value.notificationBody + '</p>';
            list += '</div>';
            list += '</li>';
            $('section#notification-list > ul').append(list);
            window.currentOffset++;
        });
        notificationList.activate();
        notificationList.emptyListCheck();
    };
    
    var notificationsLoader = app.construct({
        method : 'POST',
        url : 'notifications/search',
        successHandler : notificationSuccessHandler
    });
    
    // --------------------------------------- NOTIFICATIONS SPECIFIC ENDS ------------------------------------------------------
    
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
    var dataId = params['id'];
    
    // --------------------------------------- HEADER SPECIFIC STARTS -------------------------------------------------------------------
    
    var animation = false;
    
    function closeMenu(){
        $('#page-wrap').removeClass('active');
        $('#sidebar').removeClass('active');
        setTimeout(function(){ $('#sidebar').css('z-index','-100'); animation = false; },350);
    }
    
    function openMenu(){
        $('#sidebar').css('z-index','100');
        $('#page-wrap').addClass('active');
        $('#sidebar').addClass('active');
        setTimeout(function(){ animation = false; },350);
    }
    
    // --------------------------------------- HEADER SPECIFIC ENDS -------------------------------------------------------------------
    
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
            // load initial data
            notificationsLoader.serviceObject.invoke({default: true});
            notificationList.emptyListCheck();
            
            menu.push({
                icon: 'img/refresh.png',
                text: 'Refresh',
                click: function() {
                    notificationsLoader.serviceObject.invoke({offset: window.currentOffset});
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
                    window.location.href = 'createproject.html?id=' + dataId;
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
        if((data.message.header_menu.add_task == true && data.message.header_menu.timer == true) || (data.message.header_menu.add_task == true && data.message.header_menu.isAdmin != true)) {
            add_task = true;
            menu.push({
                icon: 'img/add.png',
                text: 'Add Task',
                click: function() {
                    if($('input#page').val() == 'timesheets/details') {
                        window.location.href = $('input#add-task-url').attr('task-details-path') + '?old_timesheet_id=' + $('input#timesheet_id').attr('value') + '&project_id=' + $('input#project_id').attr('value');
                    } else if ($('input#page').val() == 'timer') {
                        window.location.href = 'newtask.html?project_id=' + dataId;
                    }
                }
            });
            count++;
        } 
        
        if(data.message.header_menu.notification == true) {
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
        
        if(data.message.header_menu.inline_menu == true) {
            inline_menu = true;
            $.each(data.message.header_menu.menu, function(key, value) {
                menu.push({
                    icon: '',
                    text: key,
                    click: function() {
                        window.location.href = value;
                    }
                });
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
    
});

$(document).ready(function(){
    
    var animation = false;
    
    function closeMenu(){
        $('#page-wrap').removeClass('active');
        $('#sidebar').removeClass('active');
        setTimeout(function(){ $('#sidebar').css('z-index','-100'); animation = false; },350);
    }
    
    function openMenu(){
        $('#sidebar').css('z-index','100');
        $('#page-wrap').addClass('active');
        $('#sidebar').addClass('active');
        setTimeout(function(){ animation = false; },350);
    }
    
    // ------------------------------------------------------- AUTO CLOSE -------------------------------------------------------
    
    $(document).hammer().on('tap', '#page-wrap', function(event) {
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
    });
    
    // ------------------------------------------------------- BACK -------------------------------------------------------
    
    $('#back').click(function(e) {
        e.preventDefault();
        history.back();
    })

    
    // ------------------------------------------------------- LOGOUT -------------------------------------------------------
    
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