/**
 * [save_nb description]
 * @return {[type]} [description]
 */
save_nb = function() {
    chrome.storage.sync.set({ 'notebook': $('#nbarea').val() }, function() {});
}

/**
 * [load_nb description]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
load_nb = function(result) {
    $('#nbarea').val(result);
}

chrome.storage.sync.get('notebook', function(result) {
    load_nb(result.notebook);
});


$("#nbarea").keyup(function() {
    save_nb();
});