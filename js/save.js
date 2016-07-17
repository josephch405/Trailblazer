exportAll = function() {
    var output = JSONexport([mainNode, taskData, $('#nbarea').val()]);
    var textBlob = new Blob([output], { type: 'text/plain' });
    var link = document.createElement("a");

    link.download = "traiblazerExport.txt";
    link.innerHTML = "temp";
    window.URL = window.URL || window.webkitURL;
    link.href = window.URL.createObjectURL(textBlob);
    link.onclick = destroyLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
}

destroyLink = function(event) {
    document.body.removeChild(event.target);
}

importAll = function(){
    
}