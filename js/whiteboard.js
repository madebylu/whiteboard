$(function(){
  var can = $('#whiteboard')[0];
  var whiteboard = can.getContext('2d');
  var drawing = false;
  //starting position so that text doesn't appear behind the controls before
  //the board has been interacted with.
  var pos_x = 50;
  var pos_y = 100;
  var input_char = "";

  resizeCanvas();
  setBackground();

  //call the resizeCanvas funciton when the window is resized
  window.addEventListener('resize', resizeCanvas, false);

  $('#keyboard').hide();

  function setBackground(){
    whiteboard.fillStyle = "#eef";
    whiteboard.strokeStyle = "#112";
    whiteboard.font = "30px Arial";
    whiteboard.fillRect(0,0,can.width,can.height);
  }

  //note that resizing the window currently calls this and resets the canvas.
  function resizeCanvas(){
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    var offset_x = can.width - $('#keyboard').width();
    var offset_y = can.height - $('#keyboard').height();
    $('#keyboard').offset({top: offset_y, left: offset_x});
    setBackground();
  }

  // these funcions use pageX not offsetX because touch events don't
  //have an offset property and the canvas fills the browser.
  function startLine(e){
    drawing = true;
    whiteboard.strokeStyle = $('#color-picker').val();
    pos_x = e.pageX;
    pos_y = e.pageY;
  }
  function drawLine(e){
    whiteboard.beginPath();
    whiteboard.moveTo(pos_x, pos_y);
    whiteboard.lineTo(e.pageX, e.pageY);
    whiteboard.stroke();
    whiteboard.closePath();
    pos_x = e.pageX;
    pos_y = e.pageY;
  }

  //mouse handling
  $('#whiteboard').on('mousedown', function(e){
    e.preventDefault();
    startLine(e);
  });
  $('#whiteboard').on('mousemove', function(e){
    e.preventDefault();
    if(drawing){
      drawLine(e);
    }
  });

  //touch handling
  $('#whiteboard').on('touchstart', function(e){
    e.preventDefault();
    startLine(e.originalEvent.touches[0]);
  });
  $('#whiteboard').on('touchmove', function(e){
    e.preventDefault();
    if(drawing){
      drawLine(e.originalEvent.touches[0]);
    }
  });

  $('#whiteboard').on('mouseup touchend', function(e){
    e.preventDefault();
    drawing = false;
    input_char = '';
  });

  $('.key').on('click touch', function(e) {
    whiteboard.fillStyle = '#112';
    input_char = $(this).text();
    whiteboard.fillText(input_char, pos_x, pos_y);
    pos_x += whiteboard.measureText(input_char).width;
    console.log(input_char);
  });
  $('.command-return').on('click touch', function(e) {
    input_string = '';
    //this is a bodge, need to add a way to set a height based on text size rather than justa  value.
    //also should add a way to track where the last line of text started.
    pos_y += 40;
    pos_x = 50;
  });
  $('.command-space').on('click touch', function(e) {
    console.log("space");
    input_char = ' ';
    whiteboard.fillText(input_char, pos_x, pos_y);
    pos_x += whiteboard.measureText(input_char).width;
  });
  $('#clear_whiteboard').on('click', function(e){
    whiteboard.clearRect(0,0,can.width,can.height);
    whiteboard.fillStyle = "#eef";
    whiteboard.fillRect(0,0,can.width,can.height);
    input_string = '';
  });
  $('#toggle_keyboard').on('click', function(e){
    $('#keyboard').toggle();
  });
});

