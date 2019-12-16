var url = "localhost:8888"

window.onload = function() {
    getSegments()
    getDevices()
    getGroups()
}

function getDevices() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + window.location.host + '/devices', true)
    xhr.send()

    xhr.onloadend = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
            console.log(xhr.responseText)
            for(device of JSON.parse(xhr.responseText)) {
                var li = document.createElement('li');
                // li.setAttribute('id', device.name)
                li.innerHTML = device.name + " on " + device.address + ":" + device.port;
                document.getElementById("deviceList").appendChild(li)
            }
        }
    }
}

function getGroups() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + window.location.host + '/groups', true)
    xhr.send()

    xhr.onloadend = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
            var list = document.getElementById("groupList") 
            for(group of JSON.parse(xhr.responseText)) {
                console.log(group)
                var li = document.createElement('li');
                li.setAttribute('id', "group-"+group.name)
                li.innerHTML = group.name;
                var ol = document.createElement('ol');
                for(segment of group.segments) {
                    var li2 = document.createElement('li');
                    li2.innerHTML = "    " + segment.name
                    ol.appendChild(li2)
                }
                list.appendChild(li)
                list.appendChild(ol)
            }
        }
    }
}

function getSegments() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + window.location.host + '/segments', true)
    xhr.send()

    xhr.onloadend = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
            var list = document.createElement('ul');
            for(segment of JSON.parse(xhr.responseText)) {
                var li = document.createElement('li');
                li.setAttribute('id', segment)
                li.innerHTML = segment
                list.appendChild(li)
            }
            document.getElementById("segmentList").appendChild(list)
        }
    }
}