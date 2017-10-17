var watch = document.getElementById("watch");

var time_started = null,
    time_stopped = null,
    stopwatch = null;

var is_running = false;

var position = null;

if(localStorage.getItem(0)) {
    retrieve_storage();
}

function toggle() {
    if (!is_running) {
        is_running = true;
        document.getElementById("toggle").innerHTML = "Stop";
        document.getElementById("reset").innerHTML = "Cancel";
        time_started = new Date();
        stopwatch = setInterval(stopwatch_on, 1);

        update_table(true, time_started);
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

function reset() {
    if(!is_running) {
        var history = document.getElementById("history");
        var new_history = document.createElement("tbody");
        new_history.setAttribute("id", "history");
        history.parentNode.replaceChild(new_history, history);
        localStorage.clear();
        console.log("Cleared");
    }
    else {
        var history = document.getElementById("history");
        history.deleteRow(history.rows.length - 1);

        update_storage();
        clearInterval(stopwatch);
        document.getElementById("toggle").innerHTML = "Start";
        time_started = null;
        time_stopped = null;
        is_running = false;
        watch.innerHTML = "00:00:00.000"
    }
}

function stopwatch_on() {
    var current_time = new Date(),
        time_elapsed = new Date(current_time - time_started);

    watch.innerHTML = watch_repr(time_elapsed);
}

function update_table(start, time) {
    if(start) {
        update_time(0, time);
        update_coords(1);
    }
    else {
        update_time(2, time);
        update_coords(3);
        update_elapsed(4, time);
        update_storage();
    }
}

function update_time(index, time) {
    var history = document.getElementById("history");
    var entry = (index == 0 ? history.insertRow(history.rows.length)
                            : history.rows[history.rows.length - 1]);
    var start_time = entry.insertCell(index);
    var time_text = document.createTextNode(time_repr(time));
    start_time.appendChild(time_text);
}

function update_coords(index) {
    var history = document.getElementById("history");
    var entry = history.rows[history.rows.length - 1];
    var start_coords = entry.insertCell(index);
    start_coords.appendChild(document.createTextNode("Locating..."));
    navigator.geolocation.getCurrentPosition(function(position) {
        var coords_text = document.createTextNode(pos_repr(position));
        start_coords.removeChild(start_coords.childNodes[0]);
        start_coords.appendChild(coords_text);
        if(index == 3) {
          update_storage();
        }
    }, function() {
        var coords_text = document.createTextNode("No geo data");
        start_coords.removeChild(start_coords.childNodes[0]);
        start_coords.appendChild(coords_text);
        if(index == 3) {
          update_storage();
        }
    });
}

function update_elapsed(index, time) {
    var history = document.getElementById("history");
    var elapsed = history.rows[history.rows.length - 1].insertCell(4);
    var elapsed_time = new Date(time -  time_started);
    var elapsed_text = document.createTextNode(watch_repr(elapsed_time));
    elapsed.appendChild(elapsed_text);
}

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

function time_repr(date) {
    var hrs = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds(),
        msc = date.getMilliseconds();

    var tz_parse = date.toString().split(" "),
        timezone = tz_parse[tz_parse.length - 2];

    return (hrs >= 10 ? hrs : "0" + hrs.toString()) + ":"
            + (min >= 10 ? min : "0" + min.toString()) + ":"
            + (sec >= 10 ? sec : "0" + sec.toString())
            + " " + timezone;
}

function pos_repr(position) {
    return (position.coords.latitude > 0 ? "+" : "") + position.coords.latitude.toFixed(3) + "\xB0, "
          + (position.coords.longitude > 0 ? "+" : "") + position.coords.longitude.toFixed(3) + "\xB0";
}

function update_storage() {
    var history = document.getElementById("history");
    for(var i = 0; i < history.rows.length; i++) {
        var entry_row = []
        for(var j = 0; j < 5; j++) {
            entry_row.push(history.rows[i].cells[j].innerHTML);
        }
        localStorage.setItem(i, JSON.stringify(entry_row));
        console.log(JSON.stringify(entry_row));
    }
}

function retrieve_storage() {
    var history = document.getElementById("history");
    for(var i = 0; i < localStorage.length; i++) {
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
