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

function lines() {
  var s = Snap("#svg_lines");

  var red = "#DD1E2F";
  var blue = "#5aa8c5";
  var green = "#218559";

  var w = 400;
  var h = 200;
  var start = 10;
  var speed = 50;
  var ay = 2 * h / 6;
  var by = 3 * h / 6;
  var cy = 4 * h / 6;

  line(s, speed, start, start, ay, 100, {stroke: red});
  line(s, speed, start, 130, ay, 50, {stroke: red});
  line(s, speed, start, 200, ay, 75, {stroke: red});

  line(s, speed, start, start, by, 75, {stroke: blue});
  line(s, speed, start, 105, by, 50, {stroke: blue});
  line(s, speed, start, 175, by, 100, {stroke: blue});

  line(s, speed, start, start, cy, 50, {stroke: green});
  line(s, speed, start, 80, cy, 75, {stroke: green});
  line(s, speed, start, 175, cy, 100, {stroke: green});

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

function main() {
  basic();
  animate();
  lines();
  boxes();
}

window.onload = main;
