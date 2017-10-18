var watch = document.getElementById("watch");

//initialize global variables used by functions
var time_started = null,
    time_stopped = null,
    timezone_offset = null,
    stopwatch = null,
    is_running = false;

//initialize history table from storage, if possible
if(localStorage.getItem(0)) {
    retrieve_storage();
}

//start/stop toggle button: if stop is clicked,
//reset all public variables and the stopwatch header field
function toggle() {
    if (!is_running) {
        is_running = true;
        document.getElementById("toggle").innerHTML = "Stop";
        document.getElementById("reset").innerHTML = "Cancel";
        time_started = new Date();
        stopwatch = setInterval(stopwatch_on, 1);
        localStorage.setItem("time", time_started.getTime());
        timezone_offset = get_timezone(time_started);
    }
    else {
        time_stopped = new Date();
        update_table(false, time_stopped);

        clearInterval(stopwatch);
        document.getElementById("toggle").innerHTML = "Start";
        document.getElementById("reset").innerHTML = "Reset";
        time_started = null;
        time_stopped = null;
        is_running = false;
        watch.innerHTML = "00:00:00.000"

    }
}

/* reset button: if clicked while stopwatch is running,
cancels current measurement and deletes entry from table;
if clicked while stopped, clears history table
and everything from storage */
function reset() {
    if(!is_running) {
        var history = document.getElementById("history");
        var new_history = document.createElement("tbody");
        new_history.setAttribute("id", "history");
        history.parentNode.replaceChild(new_history, history);
        localStorage.clear();
    }
    else {
        var history = document.getElementById("history");
        history.deleteRow(history.rows.length - 1);

        localStorage.clear();
        update_storage();
        clearInterval(stopwatch);
        document.getElementById("toggle").innerHTML = "Start";
        document.getElementById("reset").innerHTML = "Reset";
        time_started = null;
        time_stopped = null;
        is_running = false;
        watch.innerHTML = "00:00:00.000"
    }
}

//updates stopwatch by finding difference between
//current time and stop time
function stopwatch_on() {
    var current_time = new Date(),
        time_elapsed = new Date(current_time - time_started);

    watch.innerHTML = watch_repr(time_elapsed);
}

//calls all sub-functions to update history table
function update_table(start, time, position = null) {
    if(start) {
        update_time(0, time);
        update_coords(1, position);
    }
    else {
        update_time(2, time);
        update_coords(3);
        update_elapsed(4, time);
        update_storage();
    }
}

//fills cell at given index with time
function update_time(index, time) {
    var history = document.getElementById("history");
    var entry = history.rows[history.rows.length - 1];
    var time_cell = entry.insertCell(index);
    var time_text = document.createTextNode(time_repr(time));
    time_cell.appendChild(time_text);
}

/* fills cell at given index with position
if position is not provided, use geolocation api
to find current location */
function update_coords(index, position = null) {
    var history = document.getElementById("history");
    var entry = history.rows[history.rows.length - 1];
    var coords = entry.insertCell(index);
    if (position) {
        coords.appendChild(document.createTextNode(pos_repr(position)));
        update_storage();
    }
    else {
        coords.appendChild(document.createTextNode("Locating..."));
        navigator.geolocation.getCurrentPosition(function(position) {
            var coords_text = document.createTextNode(pos_repr(position));
            coords.removeChild(coords.childNodes[0]);
            coords.appendChild(coords_text);
            update_storage();
        }, function() {
            var coords_text = document.createTextNode("No geo data");
            coords.removeChild(coords.childNodes[0]);
            coords.appendChild(coords_text);
            update_storage();
        });
    }

}

//fills cell with given index with time elapsed
function update_elapsed(index, time) {
    var history = document.getElementById("history");
    var elapsed = history.rows[history.rows.length - 1].insertCell(4);
    var elapsed_time = new Date(time -  time_started);
    var elapsed_text = document.createTextNode(watch_repr(elapsed_time));
    elapsed.appendChild(elapsed_text);
}

//string representation of stopwatch time
function watch_repr(date) {
    var hrs = date.getUTCHours(),
        min = date.getUTCMinutes(),
        sec = date.getUTCSeconds(),
        msc = date.getUTCMilliseconds();

    return (hrs >= 10 ? hrs : "0" + hrs.toString()) + ":"
            + (min >= 10 ? min : "0" + min.toString()) + ":"
            + (sec >= 10 ? sec : "0" + sec.toString()) + "."
            + (msc >= 100 ? msc : (msc >= 10 ? "0" + msc.toString() : "00" + msc.toString()));
}

//string representation of date time
function time_repr(time) {
    var local_time = new Date(time.getTime() + timezone_offset);
    var hrs = local_time.getHours(),
        min = local_time.getMinutes(),
        sec = local_time.getSeconds(),
        converted_tz = timezone_offset / 36;

    if(converted_tz < 1000) {
        if(converted_tz < 0) {
          converted_tz = "-0" + converted_tz.toString().substring(1);
        }
        else {
          converted_tz = "0" + converted_tz.toString();
        }
    }

    return (hrs >= 10 ? hrs : "0" + hrs.toString()) + ":"
            + (min >= 10 ? min : "0" + min.toString()) + ":"
            + (sec >= 10 ? sec : "0" + sec.toString())
            + " UTC" + converted_tz;
}

//string representation of a position
function pos_repr(position) {
    return (position.coords.latitude > 0 ? "+" : "") + position.coords.latitude.toFixed(3) + "\xB0, "
          + (position.coords.longitude > 0 ? "+" : "") + position.coords.longitude.toFixed(3) + "\xB0";
}

//goes through every row of history table and updates storage
function update_storage() {

    var history = document.getElementById("history");
    for(var i = 0; i < history.rows.length; i++) {
        var entry_row = []
        for(var j = 0; j < history.rows[i].cells.length; j++) {
            entry_row.push(history.rows[i].cells[j].innerHTML);
        }
        localStorage.setItem(i, JSON.stringify(entry_row));
    }
}

//initializes history table from storage row by row
//if there is an incomplete row, stopwatch was closed while still running
//starts the stopwatch accounting for time elapsed while closed
function retrieve_storage() {
    var history = document.getElementById("history");

    for(var i = 0; i < localStorage.length; i++) {
        if(JSON.parse(localStorage.getItem(localStorage.key(i))).length == 2) {
          var saved_entry = JSON.parse(localStorage.getItem(localStorage.key(i)));
          var entry = history.insertRow(history.rows.length);

          var start_time = entry.insertCell(0);
          start_time.innerHTML = saved_entry[0];

          var start_coords = entry.insertCell(1);
          start_coords.innerHTML = saved_entry[1];

          time_started = localStorage.getItem("time");
          is_running = true;
          document.getElementById("toggle").innerHTML = "Stop";
          document.getElementById("reset").innerHTML = "Cancel";
          stopwatch = setInterval(stopwatch_on, 1);
          break;
        }

        var saved_entry = JSON.parse(localStorage.getItem(localStorage.key(i)));
        var entry = history.insertRow(history.rows.length);

        var start_time = entry.insertCell(0);
        start_time.innerHTML = saved_entry[0];

        var start_coords = entry.insertCell(1);
        start_coords.innerHTML = saved_entry[1];

        var stop_time = entry.insertCell(2);
        stop_time.innerHTML = saved_entry[2];

        var stop_coords = entry.insertCell(3);
        stop_coords.innerHTML = saved_entry[3];

        var elapsed_time = entry.insertCell(4);
        elapsed_time.innerHTML = saved_entry[4];
    }
}

//uses google timezone api to detect which time zone
//the stopwatch starts at
function get_timezone(time_started) {
    var xml_https = new XMLHttpRequest();
    var history = document.getElementById("history");

    var temp = history.insertRow(history.rows.length);
    var time_cell = temp.insertCell(0);
    time_cell.innerHTML = "Getting time zone...";

    navigator.geolocation.getCurrentPosition(function(position) {
        var start_location = position.coords.latitude + "," + position.coords.longitude;
        var timestamp = time_started.getTime() / 1000 + time_started.getTimezoneOffset() * 60;
        var api_key = "AIzaSyBUUENRDNUP-6xxWRYK96JafOxxVWNOI5g";
        var call_api = "https://maps.googleapis.com/maps/api/timezone/json?location=" + start_location + "&timestamp=" + timestamp + "&key=" + api_key;
        xml_https.open("Get", call_api, false);
        xml_https.onload = function () {
          if(xml_https.status === 200) {
            var output = JSON.parse(xml_https.responseText);
            timezone_offset = output.dstOffset + output.rawOffset;
          }
        }
        xml_https.send();
        history.rows[history.rows.length-1].deleteCell(0);
        update_table(true, time_started, position);
    });
}
