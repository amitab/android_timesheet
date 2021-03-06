$(document).ready(function(){
    
    var startTime = null;
    var endTime = null;
    var interval;
    
    // in seconds
    var pauseTime = 0;
    var workTime = 0;
    var seconds = 0;
            
    // LOAD USER DETAILS
    
    var user = JSON.parse(localStorage.getItem('user'));
    
    // LOAD SIDEBAR
    
    $('.headeremail').text(user.email);
    $('#headername').text(user.first_name + ' ' + user.last_name);
    $('#headerimage').attr({'src' : user.image});
    
    // LOAD COMPLETE
    
    var ua = navigator.userAgent,
    clickevent = (ua.match(/iPad/i) || ua.match(/iPhone/i) || ua.match(/Android/i)) ? "touchstart" : "click";
    
    function minuteUp() {
        var minute = parseInt($('#minute').text());
        var res;
        if(minute >= 59) hourUp();
        minute = (minute + 1) % 60;
        if(minute < 10) {
            res = '0' + minute
        } else res = minute;
        $('#minute').text(res);
    }
    
    function hourUp() {
        var hour = parseInt($('#hour').text());
        var res;
        hour++;
        if(hour < 10) {
            res = '0' + hour
        } else res = hour;
        $('#hour').text(res)
    }
    
    function startClock() {
        if(startTime == null) {
            startTime = new Date(Date.now());
        }
        interval = setInterval(function(){
            workTime = (workTime+1) % 60;
            if(workTime == 0)
                minuteUp();
        }, 1000);
    }
    
    function setStopDate() {
        if(endTime == null) {
            endTime = new Date(Date.now());
        }
    }
    
    function resultTime() {
        var elapsed = Math.round((endTime.getTime() - startTime.getTime()) / 1000); 
        var minute = parseInt($('#minute').text());
        var hour = parseInt($('#hour').text());
        var time = minute * 60 + hour * 3600 + workTime;
        
        var pauseTime = Math.round(elapsed - time);
    }
    
    function stopClock() {
        clearInterval(interval);
    }
    
    function getJsonFromUrl() {
        var query = location.search.substr(1);
        var data = query.split("&");
        var result = {};
        for(var i=0; i<data.length; i++) {
            var item = data[i].split("=");
            result[item[0]] = item[1];
        }
        return result;
    }
    
    var result = getJsonFromUrl();
    var projectId = result['id'];
    $('#project_id').val(projectId); // Insert project id to form
    
    function finish() {
        var minute = parseInt($('#minute').text());
        var hour = parseInt($('#hour').text());
        
        var time = minute * 60 + hour * 3600 + workTime;
        $('input#work_time').val(time);
        $('input#start_date').val(startTime.getFullYear() + '-' + ('0' + startTime.getMonth()).slice(-2) + '-' + ('0' + startTime.getDate()).slice(-2));
        $('input#start_time').val(startTime.getHours() + ':' + startTime.getMinutes() + ':' + startTime.getSeconds());
        $('input#end_date').val(endTime.getFullYear() + '-' + ('0' + endTime.getMonth()).slice(-2) + '-' + ('0' + endTime.getDate()).slice(-2));
        $('input#end_time').val(endTime.getHours() + ':' + endTime.getMinutes() + ':' + endTime.getSeconds());
        
        var formData = $('form#timer').serialize();
        var url = 'newtask.html?' + formData;
        window.location.href = url;
        
    }
    
    $(document).on(clickevent, '#start-button', function(e) {
        if($(this).hasClass('stopped')) {
            startClock();
            $(this).removeClass('stopped').addClass('started');
            $(this).parent().removeClass('secondary').addClass('danger');
            $(this).text("Stop");
            $('#pause-button').parent().removeClass('disabled');
        } else if($(this).hasClass('started')) {
            stopClock();
            setStopDate();
            resultTime();
            finish();
            $(this).removeClass('started').addClass('stopped');
            $(this).parent().removeClass('danger').addClass('secondary');
            $(this).text("Start");
            $('#pause-button').parent().addClass('disabled');
            
            $('#pause-button').text("Pause");
            $('#pause-button').parent().addClass('warning');
            $('#pause-button').removeClass('paused primary');
            
        }
        e.preventDefault();
    });
    
    $(document).on(clickevent, '#pause-button', function(e) {
        if($(this).parent().hasClass('disabled')) {
            e.preventDefault();
            return false;
        }
        if(!$(this).hasClass('paused')) {
            stopClock();
            $(this).text("Resume");
            $(this).parent().removeClass('warning');
            $(this).parent().addClass('primary');
            $(this).addClass('paused');
        } else {
            startClock();
            $(this).text("Pause");
            $(this).parent().addClass('warning');
            $(this).parent().removeClass('primary');
            $(this).removeClass('paused');
        }
    });
    
    /*$(document).hammer().on('tap', '#add-task', function(e) {
        e.preventDefault();
        var url = '/' + app.returnPath() + '/timesheets/new_task?rand_token=' + result['rand_token'] + '&project_id=' + projectId;
        window.location.href = url;
    });*/
    
});