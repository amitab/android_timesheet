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
    var dataId = params['id'];
    
    
    var isVisible = window.plugins.navBar.isShowing(function(error, showing)
	{
		if(error) return null;
		
		if(showing) return true;
		else return false;
	});
    
    if(!isVisible) {
        window.plugins.navBar.show();
    }
    window.plugins.navBar.setHomeCallback(function() {
        history.back();
    });
    
    switch($('input#page').val()) {
            case 'profile':
                window.plugins.navBar.setTitle('Profile'); 
            break;
            
            case 'notifications':
                window.plugins.navBar.setTitle('Notifications'); 
            break;
            
            case 'project':
                window.plugins.navBar.setTitle('Projects'); 
            break;
            
            case 'project/timesheets':
                window.plugins.navBar.setTitle('Timesheets'); 
            break;
            
            case 'profile/edit_profile':
                window.plugins.navBar.setTitle('Edit Profile'); 
            break;
            
            case 'project/details':
                window.plugins.navBar.setTitle('Project Details'); 
            break;
            
            case 'project/create_new':
            if(typeof dataId === 'undefined')
                window.plugins.navBar.setTitle('New Project'); 
            else
                window.plugins.navBar.setTitle('Edit Project'); 
            break;
            
            case 'project/add_users':
                window.plugins.navBar.setTitle('Add Users'); 
            break;
            
            case 'timesheets':
                window.plugins.navBar.setTitle('Timesheets'); 
            break;
            
            case 'timesheets/details':
                window.plugins.navBar.setTitle('Timesheet Details'); 
            break;
            
            case 'timesheets/new_task':
                window.plugins.navBar.setTitle('New Task'); 
            break;
            
            case 'timesheets/task_details':
                window.plugins.navBar.setTitle('Task Details'); 
            break;
            
            case 'timer':
                window.plugins.navBar.setTitle('Timer'); 
            break;
    }
    
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
    
    // ----------------------------------------------------------------------------------------------------------------------------------
    
        
    var projectSuccessHandler = function(data) {
    var showMessage;
    if(projectId == 0) showMessage = "Project successfuly created.";
    else showMessage = "Project successfuly edited.";
        
        if(data.message.success == true) {
            native5.Notifications.show( showMessage, {
                notificationType:'toast',
                title:'Success',
                position:'bottom',
                distance:'0px',
                timeout: 5000,
                persistent:false
            });
            
            window.location.href = "projectdetails.html?id=" + data.message.project_id;
            
        } else if(data.message.success == false) {
            native5.Notifications.show( "Failed.", {
                notificationType:'toast',
                title:'Error',
                position:'bottom',
                distance:'0px',
                timeout: 5000,
                persistent:false
            });
            
            pressed = false;
            
        } else {
            $('#projectname').val(data.message.project.projectName);
            var res = data.message.project.projectTimeAlloted.split(" ");
            $('#deadlinedate').val(res[0]);
            $('#deadlinetime').val(res[1]);
            $('#salary').val(data.message.project.projectSalary);
            $('#description').text(data.message.project.projectDescription);
        }
        
    };
    
    var projectHandler = app.construct({
        path : 'timesheet',
        method : 'POST',
        url : 'project/create_new_data',
        successHandler : projectSuccessHandler
    });
    
    var pressed = false;
    var projectId;
    
    // ----------------------------------------------------------------------------------------------------------------------------------
    
    // ----------------------------------------------------------------------------------------------------------------------------------
    
     var taskHandler = function(data) {
       if(data.message.success == true) {
            native5.Notifications.show( "Task successfuly created.", {
                notificationType:'toast',
                title:'Success',
                position:'bottom',
                distance:'0px',
                timeout: 5000,
                persistent:false
            });
            
            window.location.href = "sheetdetails.html?id=" + data.message.timesheet_id;
            return;
        } else if (data.message.success == false) {
            native5.Notifications.show( "Task creation failed.", {
                notificationType:'toast',
                title:'Error',
                position:'bottom',
                distance:'0px',
                timeout: 5000,
                persistent:false
            });
            pressed = false;
            return;
        } else {
            $('#projectname').text(data.message.project_name);
        }
    };
    
    var taskCommunicator = app.construct({
        path : 'timesheet',
        method : 'POST',
        url : 'timesheets/create_new_task_data',
        successHandler : taskHandler
    });
    
    // ----------------------------------------------------------------------------------------------------------------------------------
    
    var notification = false;
    var search = false;
    var refresh = false;
    var edit = false;
    var inline_menu = false;
    var form_save = false;
    var add_task = false;
    var team_list = false;
    var count = 0;
    
    var menu = [];
    
    
    
    var headerHandler = function(data) {
        if(data.message.header_menu.search == true) {
            search = true;
            menu.push({
                icon: 'img/ic_action_search.png',
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
                icon: 'img/ic_action_refresh.png',
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
                icon: 'img/ic_action_edit.png',
                text: '',
                click: function() {
                    window.location.href = 'createproject.html?id=' + dataId;
                }
            });
            count++;
        }
        if(data.message.header_menu.form_save == true) {
            form_save = true
            
            if($('input#page').val() == 'timesheets/new_task') {
                var result = urlData();
                var timesheetId = result['old_timesheet_id']; // OLD TIMESHEET ID
                if(typeof timesheetId === 'undefined') {
                    timesheetId = null;
                }
                var projectId = result['project_id'];  // PROJECT ID
                
                var workTime = result['work_time'];  // WORK TIME
                if(typeof workTime === 'undefined') {
                    workTime = null;
                } else {
                    document.getElementById('startdate').readOnly = true;
                    document.getElementById('starttime').readOnly = true;
                    document.getElementById('enddate').readOnly = true;
                    document.getElementById('endtime').readOnly = true;
                }
                
                // ---------------------------- START TIME ----------------------------------------------------
                
                var startDate = decodeURIComponent(result['start_date']);
                if(typeof startDate === 'undefined') {
                    startDate = null;
                } else {
                    startDate = startDate.replace(/\+/g, ' ');
                    $('#startdate').val(startDate);
                }
                var startTime = decodeURIComponent(result['start_time']);
                if(typeof startTime === 'undefined') {
                    startTime = null;
                } else {
                    startTime = startTime.replace(/\+/g, ' ');
                    $('#starttime').val(startTime);
                }
                
                // ---------------------------- START TIME ----------------------------------------------------
                // ---------------------------- END TIME ----------------------------------------------------
                
                var endDate = decodeURIComponent(result['end_date']);
                if(typeof endDate === 'undefined') {
                    endDate = null;
                } else {
                    endDate = endDate.replace(/\+/g, ' ');
                    $('#enddate').val(endDate);
                }
                var endTime = decodeURIComponent(result['end_time']);
                if(typeof endTime === 'undefined') {
                    endTime = null;
                } else {
                    endTime = endTime.replace(/\+/g, ' ');
                    $('#endtime').val(endTime);
                }
                
                // ---------------------------- END TIME ----------------------------------------------------
                
                taskCommunicator.serviceObject.invoke({project_id: projectId});
                        
                var onSuccess = function(position) {
                    $('#location').val(position.coords.latitude + ', ' + position.coords.longitude);
                }
                //
                function onError(error) {
                    console.log('code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
                }
                
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
            }
            else if($('input#page').val() == 'project/create_new') {
                var result = urlData();
                projectId = result['id'];
                if(typeof projectId === 'undefined') {
                    projectId = 0;
                    // its a new project
                } else {
                    $('#project_id').val(projectId);
                    projectHandler.serviceObject.invoke({id: projectId});
                }
            }
            
            menu.push({
                icon: 'img/ic_action_accept.png',
                text: 'Save',
                click: function() {
                    if($('input#page').val() == 'project/create_new') {
                        if(!pressed) {
                            pressed = true;
                            var formData = {};
                            formData.project_name = $('#projectname').val();
                            formData.salary = $('#salary').val();
                            formData.description = $('#description').val();
                            formData.deadline = $('#deadlinedate').val() + ' ' + $('#deadlinetime').val();
                            if(projectId == 0)
                            formData.new = true;
                            else {
                                formData.edit = true;
                                formData.project_id = projectId;
                            }
                            projectHandler.serviceObject.invoke(formData);
                        } else {
                            alert("Please wait for the server to respond.");
                        }
                        
                    } 
                    else if ($('input#page').val() == 'timesheets/new_task') {
                        
                        if(!pressed) {
                            pressed = true;
                            var formData = {};
                            formData.task_name = $('input#taskname').val();
                            formData.start_time = $('input#startdate').val() + ' ' + $('input#starttime').val();
                            formData.end_time = $('input#enddate').val() + ' ' + $('input#endtime').val();
                            formData.notes = $('#notes').val();
                            formData.location = $('input#location').val();
                            
                            formData.project_id = projectId;
                            formData.timesheet_id = timesheetId;
                            formData.work_time = workTime;
                            formData.new = true;
                            taskCommunicator.serviceObject.invoke(formData);
                        } else {
                            alert("Please wait for the server to respond.");
                        }
                        
                    }
                }
            });
            count++;
        }
        if((data.message.header_menu.add_task == true && data.message.header_menu.timer == true) || (data.message.header_menu.add_task == true && data.message.header_menu.isAdmin != true)) {
            add_task = true;
            menu.push({
                icon: 'img/ic_action_new.png',
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
        
        if(data.message.header_menu.inline_menu == true) {
            inline_menu = true;
            $.each(data.message.header_menu.menu, function(key, value) {
                
                var image = 'img/';
                if(key == 'View Team') {
                    image += 'ic_action_group.png';
                } else if (key == 'View All Timesheets') {
                    image += 'ic_action_time.png';
                } else if (key == 'Back To Projects') {
                    image += 'ic_action_back.png';
                } else if (key == 'Start Working') {
                    image += 'ic_action_play.png';
                } else if (key == 'Add Users') {
                    image += 'ic_action_add_person.png';
                }
                
                menu.push({
                    icon: image,
                    text: key,
                    click: function() {
                        window.location.href = value;
                    }
                });
                count++;
            }); 
        }
        
        if(data.message.header_menu.notification == true) {
            notification = true;
            menu.push({
                icon: 'img/ic_action_new_event.png',
                text: 'Noti',
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
        
        window.plugins.navBar.clearMenu();
        window.plugins.navBar.setMenu(menu);
        
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
    });
    
    

    function onBackKeyDown() {
        history.back();
    }

    document.addEventListener("backbutton", onBackKeyDown, false);
    
    // ------------------------------------------------------- LOGOUT -------------------------------------------------------
    
    var logoutHandler = function(data) {
    	if(data.message.success == true) {
    		localStorage.removeItem('rand_token');
    		localStorage.removeItem('user');
            
    		window.location.href = "auth.html";
    	} else {
                    
            native5.Notifications.show( "An error occured.", {
                notificationType:'toast',
                title:'Error',
                position:'bottom',
                distance:'0px',
                timeout: 5000,
                persistent:false
            });
            
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