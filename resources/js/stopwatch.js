var watch = document.getElementById("watch");

var time_started = null,
    time_stopped = null,
    time_elapsed_since_stop = 0,
    time_at_last_stop = null,
    stopwatch = null;

var is_running = false;

var position = null;

function toggle() {
    if (!is_running) {
          is_running = true;
          document.getElementById("toggle").innerHTML = "Stop";
          time_started = new Date();
          stopwatch = setInterval(stopwatch_on, 1);

          update_table(true, time_started);
    }
    else {
      time_stopped = new Date();

      update_table(false, time_stopped);

      clearInterval(stopwatch);
      document.getElementById("toggle").innerHTML = "Start";
      time_started = null;
      time_stopped = null;
      time_elapsed_since_stop = 0;
      is_running = false;
      is_stopped = false;
      watch.innerHTML = "00:00:00.000"

    }
}

function reset() {
    var history = document.getElementById("history");
    var new_history = document.createElement("tbody");
    new_history.setAttribute("id", "history");
    history.parentNode.replaceChild(new_history, history);
}

function stopwatch_on() {
    var current_time = new Date(),
        time_elapsed = new Date(current_time - time_started - time_elapsed_since_stop);

    watch.innerHTML = watch_repr(time_elapsed);
}

function update_table(start, time) {

    var history = document.getElementById("history");

    if(start) {
        var entry = history.insertRow(history.rows.length);

        var start_time = entry.insertCell(0);
        var time_text = document.createTextNode(time_repr(time));
        start_time.appendChild(time_text);

        var start_coords = entry.insertCell(1);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var coords_text = document.createTextNode(pos_repr(position));
              start_coords.appendChild(coords_text);
            });
        }
        else {
          var coords_text = document.createTextNode("No geo data");
          start_coords.appendChild(coords_text);
        }
    }
    else {

      var stop_time = history.rows[history.rows.length - 1].insertCell(2);
      var time_text = document.createTextNode(time_repr(time));
      stop_time.appendChild(time_text);

      var stop_coords = history.rows[history.rows.length - 1].insertCell(3);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var coords_text = document.createTextNode(pos_repr(position));
            stop_coords.appendChild(coords_text);
          });
      }
      else {
        var coords_text = document.createTextNode("No geo data");
        start_coords.appendChild(coords_text);
      }

      var elapsed = history.rows[history.rows.length - 1].insertCell(4);
      var elapsed_time = new Date(time - (time_at_last_stop ? time_at_last_stop : time_started));
      var elapsed_text = document.createTextNode(watch_repr(elapsed_time));
      elapsed.appendChild(elapsed_text);
    }
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

    var tz_parse = date.toString().split(" ")
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
