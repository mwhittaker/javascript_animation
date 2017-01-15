function basic() {
  var s = Snap("#svg_basic");
  var w = 400;
  var h = 200;
  var cx = w / 2;
  var cy = h / 2;
  var cr = 20;

  var circ = s.circle(cx, cy, cr);
  var text = s.text(cx, cy - cr, "foo");
  var l = s.line(0, 0, w, h);
  circ.attr({stroke:"black", fill:"white"});
  text.attr({textAnchor:"middle", fontFamily:"monospace"});
  l.attr({stroke:"black"});
}

function animate() {
  var s = Snap("#svg_animate");

  var w = 400;
  var h = 200;
  var cx = w / 2;
  var cy = h / 2;
  var cr = 20;
  var circ = s.circle(cx, cy, cr);
  var text = s.text(cx, cy - cr, "foo");
  var node = s.group(circ, text);
  circ.attr({stroke:"black", fill:"white"});
  text.attr({textAnchor:"middle", fontFamily:"monospace"});
  node.animate({transform: "translate(50 50)"}, 1000, function() {
    node.animate({transform: "translate(0 50)"}, 1000, function() {
      node.animate({transform: "translate(0 0)"}, 1000, function() {
        s.clear();
        animate();
      });
    });
  });

  var l = s.line(0, 0, 0, 0);
  l.attr({stroke:"black"});
  l.animate({"x2": w, "y2": h}, 1000);
}

function time(distance, speed) {
  return (distance / speed) * 1000;
}

function line(s, speed, start, x, y, dx, attr) {
  window.setTimeout(function() {
    var line = s.line(x, y, x, y);
    line.attr(attr);
    line.animate({"x2": x + dx}, time(dx, speed));
  }, time(x - start, speed));
}

Colors = {
  RED: "#DD1E2F",
  BLUE: "#5AA8C5",
  GREEN: "#218559",
};

function lines() {
  var s = Snap("#svg_lines");

  var w = 400;
  var h = 200;
  var start = 10;
  var speed = 50;
  var ay = 2 * h / 6;
  var by = 3 * h / 6;
  var cy = 4 * h / 6;

  line(s, speed, start, start, ay, 100, {stroke: Colors.RED});
  line(s, speed, start, 130, ay, 50, {stroke: Colors.RED});
  line(s, speed, start, 200, ay, 75, {stroke: Colors.RED});

  line(s, speed, start, start, by, 75, {stroke: Colors.BLUE});
  line(s, speed, start, 105, by, 50, {stroke: Colors.BLUE});
  line(s, speed, start, 175, by, 100, {stroke: Colors.BLUE});

  line(s, speed, start, start, cy, 50, {stroke: Colors.GREEN});
  line(s, speed, start, 80, cy, 75, {stroke: Colors.GREEN});
  line(s, speed, start, 175, cy, 100, {stroke: Colors.GREEN});

  window.setTimeout(function() {
    var progress = s.line(start, 1 * h / 6, start, 5 * h / 6);
    progress.attr({stroke: "gray", strokeWidth: 1});
    progress.animate({"x1":310, "x2":310}, time(300, speed));
  }, 0);

  window.setTimeout(function() {
    s.clear();
    lines();
  }, 6000);
}

function grid(s, x0, y0, x1, y1) {
  var stroke = "gray";

  var strokeWidth = function(x) {
    if (x % 100 == 0) {
      return 1.5;
    } else if (x % 10 == 0) {
      return 0.75;
    } else {
      return 0.1;
    }
  }

  for (var x = x0; x <= x1; x += 5) {
    var line = s.line(x, 0, x, y1);
    line.attr({stroke:stroke, strokeWidth:strokeWidth(x)});
  }

  for (var y = y0; y <= y1; y += 5) {
    var line = s.line(0, y, x1, y);
    line.attr({stroke:stroke, strokeWidth:strokeWidth(y)});
  }
}

function assert(b, msg="Assertion Error.") {
  if (!b) {
    throw new Error(msg);
  }
}

function boxed(s, element, padding=0) {
  assert(padding >= 0, "Padding must be non-negative.");

  var bb = element.getBBox();
  var x = bb.x - padding;
  var y = bb.y - padding;
  var w = bb.w + (2 * padding);
  var h = bb.h + (2 * padding);
  return s.rect(x, y, w, h);
}

Direction = {
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom",
  LEFT: "left",
}

Path = {}
Path.M = function(x, y) { return "M" + x + " " + y; }
Path.l = function(dx, dy) { return "l" + dx + " " + dy; }
Path.h = function(dx) { return "h" + dx; }
Path.v = function(dy) { return "v" + dy; }

function bubbled(s, element, direction, padding=0, point_w=10, point_h=5) {
  var bb = element.getBBox();

  assert(padding >= 0, "Padding must be non-negative.");
  assert(point_w >= 0, "Point width must be non-negative.");
  assert(point_h >= 0, "Point height must be non-negative.");

  var w = bb.w + (2 * padding);
  var h = bb.h + (2 * padding);

  if (direction == Direction.TOP || direction == Direction.BOTTOM) {
    assert(w >= point_w,  "Point width cannot exceed box width.");
  } else {
    assert(direction == Direction.LEFT || Direction.RIGHT);
    assert(h >= point_h,  "Point width cannot exceed box height.");
  }

  var start = Path.M(bb.x - padding, bb.y - padding);
  var top = Path.h(w);
  var right = Path.v(h);
  var bottom = Path.h(-w);
  var left = Path.v(-h);

  if (direction == Direction.TOP) {
    var top = [
      Path.h(w/2 - point_w/2),
      Path.l(point_w/2, -point_h),
      Path.l(point_w/2, point_h),
      Path.h(w/2 - point_w/2),
    ].join(" ");
  }

  if (direction == Direction.RIGHT) {
    var right = [
      Path.v(h/2 - point_w/2),
      Path.l(point_h, point_w/2),
      Path.l(-point_h, point_w/2),
      Path.v(h/2 - point_w/2),
    ].join(" ");
  }

  if (direction == Direction.BOTTOM) {
    var bottom = [
      Path.h(-(w/2 - point_w/2)),
      Path.l(-point_w/2, point_h),
      Path.l(-point_w/2, -point_h),
      Path.h(-(w/2 - point_w/2)),
    ].join(" ");
  }

  if (direction == Direction.LEFT) {
    var left = [
      Path.v(-(h/2 - point_w/2)),
      Path.l(-point_h, -point_w/2),
      Path.l(point_h, -point_w/2),
      Path.v(-(h/2 - point_w/2)),
    ].join(" ");
  }

  return s.path([start, top, right, bottom, left].join(" "));
}

function envelope(s, x, y, w, h) {
  var box = s.rect(x, y, w, h);
  var left_flap = s.line(x, y, x + w/2, y + h/2);
  var right_flap = s.line(x + w, y, x + w/2, y + h/2);
  var left_line = s.line(x, y + h, x + w/4, y + h/4);
  var right_line = s.line(x + w, y + h, x + 3*w/4, y + h/4);
  return s.group(box, left_flap, right_flap, left_line, right_line);
}

function lines_redux() {
  var s = Snap("#svg_lines_redux");
  var w = 400;
  var h = 200;
  // grid(s, 0, 0, w, h);

  var ay = 50;
  var by = 100;
  var cy = 150;

  var a1 = s.line(10,  ay, 110, ay);
  var a2 = s.line(130, ay, 180, ay);
  var a3 = s.line(200, ay, 220, ay);
  var b1 = s.line(10,  by, 60,  by);
  var b2 = s.line(80,  by, 100, by);
  var b3 = s.line(120, by, 220, by);
  var c1 = s.line(10,  cy, 30,  cy);
  var c2 = s.line(50,  cy, 150, cy);
  var c3 = s.line(170, cy, 220, cy);

  for (let e of [a1, a2, a3]) { e.addClass("aline"); }
  for (let e of [b1, b2, b3]) { e.addClass("bline"); }
  for (let e of [c1, c2, c3]) { e.addClass("cline"); }

  var yolo = s.text(10, 40, "set(x,4)");
  yolo.attr({fontSize:8, fontFamily:"monospace"});
  var b = bubbled(s, yolo, Direction.BOTTOM, 1);
  b.attr({fill:"transparent", stroke:"black"});

  var diagram = s.group(a1, a2, a3, b1, b2, b3, c1, c2, c3, yolo, b);
  var rect = s.rect(0, 0, 0, h);
  rect.attr({fill:"white"});
  diagram.attr({mask:rect});
  var progress = s.line(0, 0, 0, h);

  Snap.animate(0, 400, function(x) {
    rect.attr({width: x});
  progress.attr({x1:x, x2:x, stroke:"gray", strokeWidth:1});
  }, 5000, mina.linear, function() {s.clear(); lines_redux();});
}

function boxes() {
  var s = Snap("#svg_boxed");

  var bar = s.text(50, 100, "bar");
  var bar_bubble = bubbled(s, bar, Direction.TOP, 5);
  bar_bubble.attr({fill:"transparent", stroke:"black"});

  var foo = s.text(100, 100, "foo");
  var foo_box = boxed(s, foo, 5);
  foo_box.attr({fill:"transparent", stroke:"black"});

  var baz = s.text(150, 100, "baz");
  var baz_bubble = bubbled(s, baz, Direction.RIGHT, 5);
  baz_bubble.attr({fill:"transparent", stroke:"black"});

  var moo = s.text(200, 100, "moo");
  var moo_bubble = bubbled(s, moo, Direction.BOTTOM, 5);
  moo_bubble.attr({fill:"transparent", stroke:"black"});

  var bub = s.text(250, 100, "bub");
  var bub_bubble = bubbled(s, bub, Direction.LEFT, 5);
  bub_bubble.attr({fill:"transparent", stroke:"black"});

  var scale = 1.61803398875;
  var w = 15;
  var env = envelope(s, 50, 150, w, w/scale);
  var blue = "#5aa8c5";
  env.attr({fill:blue, stroke:"black", strokeWidth:1, transform:"rotate(-15 50 150)"});
  env.animate({transform: "rotate(-15 50 150) translate(50 0)"}, 2000);
}

function nodes() {
  var s = Snap("#svg_nodes");
  var w = 400;
  var h = 200;
  grid(s, 0, 0, w, h);

  var server = s.circle(200, 100, 20);
  server.attr({fill:Colors.RED});

  var message = s.circle(200, 100, 3);
  message.attr({fill:"transparent", stroke:Colors.RED, strokeWidth:2});
  message.animate({cx:300, cy:50}, 2000, function() {
    message.animate({cx:200, cy:100}, 2000, function() {
      s.clear();
      nodes();
    });
  });
}

function rotated_text() {
  var s = Snap("#svg_rotated_text");
  var w = 400;
  var h = 200;
  // grid(s, 0, 0, w, h);

  var line = s.line(200, 100, 300, 100);
  line.attr({stroke:Colors.RED, strokeWidth:4, strokeLinecap:"round"});

  {
    let text = s.text(205, h/2 - 7, "set(x,4)");
    text.attr({fontFamily:"monospace", fontSize:12});
    text.attr({transform:"rotate(-30 200 100)"});
  }

  {
    let text = s.text(w/2 + 32, h/2 - 7, "abcd");
    text.attr({fontFamily:"monospace", fontSize:10});
    let box = boxed(s, text, 1);
    box.attr({fill:"transparent", stroke:"black"});
    let all = s.group(text, box);
    all.attr({transform:"rotate(-45 230 100)"});
  }
}

function system() {
  var s = Snap("#svg_system");

  var a = ds.node(s, 100, 20, "a", ds.Color.Red);
  var b = ds.node(s, 300, 20, "b", ds.Color.Green);
  var s1 = ds.node(s, 200, 20, "1", ds.Color.Blue);
  var bbox = s.group(a.element, b.element, s1.element).getBBox();

  var a_actions = ["a", [
    new ds.Message(2, "set(x,1)", "ok", "1"),
    new ds.Delay(1.5),
    new ds.Message(1, "get(x)", "1", "1"),
  ]];
  var b_actions = ["b", [
    new ds.Delay(1),
    new ds.Message(2, "set(y,2)", "err", "1"),
  ]];

  ds.animate(s, bbox, [a, b, s1], [a_actions, b_actions], 2000);
}

function event_handler() {
  var s = Snap("#event_handler");
  var svg = document.getElementById("event_handler");
  var pt = svg.createSVGPoint();
  function cursorPoint(evt){
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  var bar = s.line(100, 100, 300, 100);
  bar.attr({stroke: "red", strokeWidth: 4, strokeLinecap: "round"});

  var l = s.line(200, 90, 200, 110);
  var l_clicked = false;
  l.attr({stroke: "black", strokeWidth: 4});
  l.node.onmousedown = function() { l_clicked = true; };
  svg.onmouseup = function() { l_clicked = false; };
  svg.onmousemove = function(e) {
    if (e.which === 1 && l_clicked) {
      var loc = cursorPoint(e);
      var x = Math.max(Math.min(loc.x, 300), 100);
      l.attr({x1: x, x2: x});
    }
  };
}

function main() {
  basic();
  animate();
  lines();
  lines_redux();
  boxes();
  nodes();
  rotated_text();
  system();
  event_handler();
}

window.onload = main;
