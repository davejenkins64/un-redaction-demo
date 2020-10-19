// want to know the anchor point of the select4cion and
// the old rectangle we showed as a rubber band
var first_point = null;
var old_rec = null;
var marks = [
  { "x" : 0, "y": 0, "width": 1000, "height": 600 }
]; // the array of assigned de-redaction mark rectangles

// simple select4c area rectangle
var rubberband = document.getElementById('rubberband');
var canvas = document.getElementById('canvas');
var colors = [
 "#11111188",
 "#22222288",
 "#33333388",
 "#44444488",
 "#55555588",
 "#66666688",
 "#77777788",
 "#88888888",
 "#99999988",
 "#AAAAAA88",
 "#BBBBBB88",
 "#CCCCCC88",
 "#DDDDDD88",
 "#EEEEEE88",
];

// the upper left corner of the canvas isn't 0,0 on the page
function get_canvas_offset() {
  const rect = canvas.getBoundingClientRect();
  return {
    "x": rect.left + window.scrollX,
    "y": rect.top + window.scrollY
  };
}

function draw_rubberband(new_rec) {
  if (rubberband.getContext) {
    var ctx = rubberband.getContext('2d');

    // clear the old rubber band rectangle if we drew one
    if (null != old_rec) {
      // FIXME only if border is 1px
      ctx.clearRect(old_rec.x-1, old_rec.y-1, old_rec.width+2, old_rec.height+2);
      old_rec = null;
    }

    // draw the new rubber band rectangle
    if (null != new_rec) {
      // draw the new rectangle
      ctx.strokeRect(new_rec.x, new_rec.y, new_rec.width, new_rec.height);

      // but remember it so we can clear it later
      old_rec = new_rec;
    }
  }
}

function reset() {
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1000, 600);
  }
}

function draw(new_rec, color) {
  if (null == new_rec) {
    return;
  }
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    // draw the new rectangle
    ctx.fillStyle = color;
    ctx.fillRect(new_rec.x, new_rec.y, new_rec.width, new_rec.height);
  }
}

// Borrowed the mouse on callbacks from
// from https://stackoverflow.com/questions/23284429/select4c-area-rectangle-in-javascript

rubberband.onmousedown = function(e) {
    first_point = { 
        "x": e.clientX - get_canvas_offset().x,
        "y": e.clientY - get_canvas_offset().y
    };
};
rubberband.onmousemove = function(e) {
    var new_point = { 
        "x": e.clientX - get_canvas_offset().x,
        "y": e.clientY - get_canvas_offset().y
    };
    // race between down and move events?
    if (null == first_point) {
      return;
    }
    var new_rec = {
      "x": Math.min(first_point.x, new_point.x), 
      "y": Math.min(first_point.y, new_point.y), 
      "width": Math.abs(first_point.x - new_point.x), 
      "height": Math.abs(first_point.y - new_point.y)
    };
    draw_rubberband(new_rec);
};
rubberband.onmouseup = function(e) {
    var rect = old_rec;
    draw_rubberband(null);

    // FIXME but proces the select4cion in old_rec
    // rect is now our select4cion bounding box
    retile(rect)

    // get ready to start rubberbanding again
    first_point = null;
};

// Non scaffolding code

// Start of added functions
// clamp one value to range a if not in range
// where a has a l)eft and r)ight ordered value
function clamp(a, v) {
    if ((a.l <= v) && (a.r >= v)) {
        return v; // v in range of a, so use v
    }
    if (a.l > v) { 
        return a.l; // v to left so use a.l
    }
    return a.r; // v to right, use a.r
}

// return the intersection on the number line as a left/rigtht pair
// that is, each of the two arguments is a numeric range, return their intersection as an object
// with l)eft and r)irght values.  To be called twice, once for X and once for Y dimesion
function find_1d_intersection(a, b) {
    return {
        "l": clamp(a, b.l),
        "r": clamp(a, b.r)
    };
}

// given 2 4-corner objects
// return a new set of 4 corner points that is the intersection of the existing
// mark rectangle and the select4cion rectangle
function find_intersection(m, s) {
    // find the 1d intersections on the number line in x an y dimensions
    var x = find_1d_intersection({ "l" : m.tl.x, "r" : m.br.x }, { "l":  s.tl.x, "r": s.br.x });
    var y = find_1d_intersection({ "l" : m.tl.y, "r" : m.br.y }, { "l":  s.tl.y, "r": s.br.y });

    // return an object that knows its corners 
    // tl - top left, br - bottom right, etc.
    return {
        "tl": { "x" : x.l, "y" : y.l },
        "tr": { "x" : x.r, "y" : y.l },
        "bl": { "x" : x.l, "y" : y.r },
        "br": { "x" : x.r, "y" : y.r },
    };
}

// convert the 4 corner object back to a rectangls
function make_rect(tl, br) {
    return { 
        "x" : tl.x,
        "y" : tl.y,
        "width" : br.x - tl.x,
        "height" : br.y - tl.y,
    };
}
// End of added functions

// TEST insert the below in the right place

// Pretend that the section bounding box is called select4c
// Pretend the test harness is tracking an array of existing marks

// takes a rectangle object representing the sectionBoundingRectangle
// for TEST assumes a global array of existing marks
// deletes or retiles any marks that intersect the selection
function retile(select4cionBoundingRectangle) {
  //// Make a 4-corner object for this select4cionBoundingRectangle
  var select4c = {
    "tl": { "x" : select4cionBoundingRectangle.x, "y" : select4cionBoundingRectangle.y }, 
    "tr": { "x" : select4cionBoundingRectangle.x + select4cionBoundingRectangle.width, "y" : select4cionBoundingRectangle.y }, 
    "bl": { "x" : select4cionBoundingRectangle.x, "y" : select4cionBoundingRectangle.y + select4cionBoundingRectangle.height }, 
    "br": { "x" : select4cionBoundingRectangle.x + select4cionBoundingRectangle.width, "y" : select4cionBoundingRectangle.y + select4cionBoundingRectangle.height }
  };

  // TEST CODE - remember any marks we didn't delete
  // so we aren't deleting from the same array we are iterating over
  var new_marks = [];

  // TEST CODE iterate through all of the marks on the page
  // in reality, iterate through marks as normal
  for (mark_index in marks) {
    var mark = marks[mark_index];

    // Make a 4-corner object for this mark
    var mark4c = {
      "tl": { "x" : mark.x, "y" : mark.y }, 
      "tr": { "x" : mark.x + mark.width, "y" : mark.y }, 
      "bl": { "x" : mark.x, "y" : mark.y + mark.height }, 
      "br": { "x" : mark.x + mark.width, "y" : mark.y + mark.height }, 
    };

    intersection = find_intersection(mark4c, select4c)    

    // if the intersection is the whole mark, just delete it
    if ((intersection.tl.x == mark4c.tl.x) 
    && (intersection.br.x == mark4c.br.x)
    && (intersection.tl.y == mark4c.tl.y) 
    && (intersection.br.y == mark4c.br.y)) {
      continue;
    }

    // if no intersection, we are done with this mark
    // e.g. if intersection left is right of mark or intersection right is left of mark
    // and intersection top is bottom of mark or intersection bottom is top of mark?
    if (((intersection.tl.x == mark4c.tr.x) 
    || (intersection.tr.x == mark4c.tl.x))
    || ((intersection.tl.y == mark4c.bl.y) 
    || (intersection.bl.y == mark4c.tl.y))) {
      new_marks.push(mark);
      continue;
    }

    // the selection intersects witht he mark, so delete it and
    // re-tile the mark leaving the intersection out

    // picture 4 surrounding rectangles around the selection
    // 111122
    // 44  22
    // 443333
    // where some may wind up being zero width or height

    // 4 new marks around the intersection of the selection and the mark's rectangle.
    for (const pair of [
      // rect#1
      { "tl": { "x": mark4c.tl.x, "y": mark4c.tl.y }, "br" : { "x" : intersection.tr.x, "y": intersection.tr.y }},
      // rect#2
      { "tl": { "x": intersection.tr.x, "y": mark4c.tl.y }, "br" : { "x" : mark4c.tr.x, "y": intersection.br.y }},
      // rect#3
      { "tl": { "x": intersection.bl.x, "y": intersection.bl.y }, "br" : { "x" : mark4c.br.x, "y": mark4c.br.y }},
      // rect#4
      { "tl": { "x": mark4c.tl.x, "y": intersection.tl.y }, "br" : { "x" : intersection.bl.x, "y": mark4c.bl.y }},
    ]) {
      // TEST mocking second approach above, only create new mark 
      // if its planned new rectangle has eight and width
      new_rect = make_rect(pair.tl, pair.br);
      if ((0 < new_rect.height) && (0 < new_rect.width)) {
        new_marks.push(new_rect);
      }
    }

    // Note: perhaps rect#1 and #4 could span left the right
    // while #2 and #3 could be beside the intersection?
    // 111111
    // 22  33
    // 444444
    //    # rect#1
    //    { "tl": { "x": mark4c.tl.x, "y": mark4c.tl.y }, "br" : { "x" : mark4c.tr.x, "y": intersection.tr.y }},
    //    # rect#2
    //    { "tl": { "x": mark4c.tl.x, "y": intersection.tl.y }, "br" : { "x" : intersection.bl.x, "y": intersection.bl.y }},
    //    # rect#3
    //    { "tl": { "x": intersection.tr.x, "y": intersection.tr.y }, "br" : { "x" : mark4c.br.x, "y": intersection.br.y }},
    //    # rect#4
    //    { "tl": { "x": mark4c.bl.x, "y": intersection.bl.y }, "br" : { "x" : mark4c.br.x, "y": mark4c.br.y }},

  }

  // TEST only needed for test
  marks = new_marks;

  // TEST code redraw rects here?
  reset();
  for (mark_index in marks) {
    var mark = marks[mark_index];
    color = colors[mark_index % 14]; // took out end colors
    draw(mark, color);
  }

}
// vim: ts=4 sw=4 expandtab
