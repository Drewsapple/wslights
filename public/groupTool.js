var url = "localhost:8888"

window.onload = function() {
    getSegments()
}

function getSegments(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + window.location.host + '/segments', true)
    xhr.send()

    xhr.onloadend = function() {
        console.log("HTTP request recieved");
        var segList = JSON.parse(xhr.responseText);
        console.log(segList);
        var segField = document.getElementById("segField");
        for(name of segList){
            var newTag = document.createElement("option");
            var text = document.createTextNode(name);
            newTag.setAttribute("value", name);
            newTag.appendChild(text);
            segField.appendChild(newTag);
    }
}}