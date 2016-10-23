$(function () {
    "use strict";
    var can = $('#whiteboard')[0];
    var whiteboard = can.getContext('2d');
    var drawing = false;
    var canvas_action = 'draw';
    var lines = []; //to be filled with an array of point_set s.
    //starting position so that text doesn't appear behind the controls before
    //the board has been interacted with.
    var line_x = 50;
    var line_y = 100;
    var char_x = line_x;
    var input_char = "";
    var curve_tightness = 0.1;

    resizeCanvas();
    setBackground();

    //a point on the canvas as co-ordinatets in pixels measured from top and left
    function point(x, y) {
        this.x = x;
        this.y = y;
        //assign control points as being on the point at creation.
        this.control_before_x = x;
        this.control_before_y = y;
        this.control_after_x = x;
        this.control_after_y = y;

        this.get_distance_from = function (other_point) {
            var distance = Math.sqrt(
                Math.pow((this.x - other_point.x), 2) + Math.pow((this.y - other_point.y), 2)
            );
            return distance;
        };

        this.set_control_points = function (point_before, point_after) {
            //do the maths and set the control points.
            var dist_from_prev = this.get_distance_from(point_before);
            var dist_from_next = this.get_distance_from(point_after);
            var scale_before = curve_tightness * dist_from_prev / (dist_from_next + dist_from_prev);
            var scale_after = curve_tightness * dist_from_next / (dist_from_next + dist_from_prev);
            this.control_before_x = this.x - scale_before * (point_after.x - point_before.x);
            this.control_before_y = this.y - scale_before * (point_after.y - point_before.y);
            this.control_after_x = this.x + scale_after * (point_after.x - point_before.x);
            this.control_after_y = this.y + scale_after * (point_after.y - point_before.y);
        };

    }

    // a set of points that can be processed into a line or curve.
    function point_set (colour) {
        this.points = [];
        this.colour = colour;
        this.add_point = function (point) {
            setTimeout(function(){}, 200);
            //if the array has elements already
            if(this.points.length != 0){
                if (this.points[this.points.length - 1].get_distance_from(point) > 10){
                    this.points.push(point);
                    if (this.points.length > 2) {
                        //calculate the control points for array item length - 1
                        var l = this.points.length;
                        this.points[l-2].set_control_points(this.points[l-3], this.points[l-1]);
                    }
                }
            //otherwise just write the first point.
            } else {
                this.points.push(point);
            }
        };
        this.add_last_point = function(point){
            this.points.push(point);
            if (this.points[0].get_distance_from(this.points[this.points.length - 1]) < 1){
                console.log("attampting to draw a point");
                whiteboard.strokeRect(point.x, point.y, 1, 1);
            }
        }
    }

    //call the resizeCanvas funciton when the window is resized
    window.addEventListener('resize', resizeCanvas, false);

    $('#keyboard').hide();

    function setBackground() {
        whiteboard.fillStyle = "#eef";
        whiteboard.strokeStyle = "#112";
        whiteboard.font = "30px Arial";
        whiteboard.fillRect(0,0,can.width,can.height);
    }

    //note that resizing the window currently calls this and resets the canvas.
    function resizeCanvas() {
        can.width = window.innerWidth;
        can.height = window.innerHeight;
        var offset_x = can.width - $('#keyboard').width();
        var offset_y = can.height - $('#keyboard').height();
        $('#keyboard').offset({top: offset_y, left: offset_x});
        setBackground();
    }

    // these funcions use pageX not offsetX because touch events don't
    //have an offset property and the canvas fills the browser.

    function startCurve(e) {
        drawing = true;
        whiteboard.strokeStyle = $('#color-picker').val();
        var start_point = new point(e.pageX, e.pageY);
        lines[lines.length] = new point_set($('#color-picker').val());
        lines[lines.length - 1].add_point(start_point);
        console.log(lines);
    }

    //takes a point set and draws curves between the last few points.
    function drawCurve(ps) {
        whiteboard.beginPath();
        console.log(ps);
        if(ps.points.length > 2){
            var l = ps.points.length;
            //console.log('attempting to draw a curve');
            whiteboard.moveTo(ps.points[l-3].x, ps.points[l-3].y);
            whiteboard.bezierCurveTo(
                ps.points[l-3].control_after_x,
                ps.points[l-3].control_after_y,
                ps.points[l-2].control_before_x,
                ps.points[l-2].control_before_y,
                ps.points[l-2].x,
                ps.points[l-2].y
            );
            whiteboard.lineWidth = 3;
            whiteboard.stroke();

        }
        whiteboard.closePath();
    }

    //mouse handling
    $('#whiteboard').on('mousedown', function(e) {
        switch(canvas_action){
            case('draw'):
                e.preventDefault();
                startCurve(e);
                break;
            case('type'):
                line_x = e.pageX;
                line_y = e.pageY;
                char_x = line_x;
                break;
        }
    });

    $('#whiteboard').on('mousemove', function(e) {
        e.preventDefault();
        if(drawing){
            var current_position = new point(e.pageX, e.pageY);
                lines[lines.length - 1].add_point(current_position);
                drawCurve(lines[lines.length - 1]);
        }
    });

    $('#whiteboard').on('mouseup', function(e) {
        e.preventDefault();
        switch(canvas_action){
            case('draw'):
                var current_position = new point(e.pageX, e.pageY);
                lines[lines.length - 1].add_last_point(current_position);
                drawCurve(lines[lines.length - 1]);
                drawing = false;
                input_char = '';
                break;
            case('type'):
                //do nothing.
                break;
        }
    });

    //touch handling
    $('#whiteboard').on('touchstart', function(e) {
        e.preventDefault();
        startCurve(e.originalEvent.touches[0]);
    });

    $('#whiteboard').on('touchmove', function(e) {
        e.preventDefault();
        if(drawing){
            console.log(e);
            drawCurve(e.originalEvent.touches[0]);
        }
    });

    $('#whiteboard').on('touchend', function(e) {
        e.preventDefault();
        var current_position = new point(e.pageX, e.pageY);
        lines[lines.length - 1].add_last_point(current_position);
        drawCurve(lines[lines.length - 1]);
        drawing = false;
        input_char = '';
    });

    $('.key').on('click touch', function(e) {
        whiteboard.fillStyle = '#112';
        input_char = $(this).text();
        whiteboard.fillText(input_char, char_x, line_y);
        char_x += whiteboard.measureText(input_char).width;
        console.log(input_char);
    });
    $('.command-return').on('click touch', function(e) {
        var input_string = '';
        //this is a bodge, need to add a way to set a height based on text size rather than justa    value.
        //also should add a way to track where the last line of text started.
        line_y += 40;
        char_x = line_x;
    });
    $('.command-space').on('click touch', function(e) {
        input_char = ' ';
        whiteboard.fillText(input_char, char_x, line_y);
        char_x += whiteboard.measureText(' ').width;
    });
    $('#clear_whiteboard').on('click', function(e) {
        whiteboard.clearRect(0,0,can.width,can.height);
        whiteboard.fillStyle = "#eef";
        whiteboard.fillRect(0,0,can.width,can.height);
        var input_string = '';
        lines = lines.splice(0, lines.length -1);
    });
    $('#show_keyboard').on('click', function(e) {
        $('#keyboard').show();
        $(this).addClass('btn-primary');
        $(this).siblings().removeClass('btn-primary');
        canvas_action = "type";
        //$(whiteboard).css()
    });
    $('#draw_lines').on('click', function(e) {
        $('#keyboard').hide();
        $(this).addClass('btn-primary');
        $(this).siblings().removeClass('btn-primary');
        canvas_action = "draw";
        //$(whiteboard).css()
    });
});
