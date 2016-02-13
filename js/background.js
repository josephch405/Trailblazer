chrome.app.runtime.onLaunched.addListener(
    function() {
        chrome.app.window.create('../html/main.html', {
            'state': "maximized",
            'id': 'main',
            'innerBounds': {
                'minWidth': 800,
                'minHeight': 600
            }
        });
    }
);
