var watch = document.getElementById("watch");

var time_started = null,
    time_stopped = null,
    time_elapsed_since_stop = 0,
    stopwatch = null;

var is_running = false,
    is_stopped = false;

function start() {
    if (!is_running) {
          is_running = true
          time_started = new Date();
          stopwatch = setInterval(stopwatch_on, 1);
    }

    if (is_stopped) {
        time_elapsed_since_stop += new Date() - time_stopped;
        is_stopped = false;
        stopwatch = setInterval(stopwatch_on, 1);
    }
}

function stop() {
    if(!is_stopped) {
      time_stopped = new Date();
      clearInterval(stopwatch);
    }
    is_stopped = true;
}

function reset() {
    clearInterval(stopwatch);
    time_started = null;
    time_stopped = null;
    time_elapsed_since_stop = 0;
    is_running = false;
    is_stopped = false;
    watch.innerHTML = "00:00:00:000"
}

function stopwatch_on() {
    var current_time = new Date(),
        time_elapsed = new Date(current_time - time_started - time_elapsed_since_stop);

    var hrs = time_elapsed.getUTCHours(),
        min = time_elapsed.getUTCMinutes(),
        sec = time_elapsed.getUTCSeconds(),
        msc = time_elapsed.getUTCMilliseconds();

    watch.innerHTML = (hrs > 10 ? hrs : "0" + hrs.toString()) + ":"
                    + (min > 10 ? min : "0" + min.toString()) + ":"
                    + (sec > 10 ? sec : "0" + sec.toString()) + ":"
                    + (msc > 100 ? msc : (msc > 10 ? "0" + msc.toString() : "00" + msc.toString()));
}
