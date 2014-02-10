$(document).ready(function() {
    window.currentOffset = 0;
    
    $(document).hammer().on('tap', 'li.notification-link', function(e) {
        e.preventDefault();
        var url = $(this).attr('url');
        window.location.href = url;
    });
    
});

