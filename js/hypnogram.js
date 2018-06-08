
'use strict'

var Hypnogram = function (element_id, annotations, self) {
  self = self || {};

  self.element_id = element_id;
  self.element = function () { return document.getElementById(self.element_id); };
  self.annotations = annotations;
  var window_start = 0.0;
  var sec2hour = 1/60/60;

  var config = {
    displayModeBar: false,
    staticPlot: true
  };

  var hash2label = ['N3', 'N2', 'N1', 'R', 'Wake'];
  var label2hash = {}
  for (let l in hash2label) {
    label2hash[hash2label[l]] = l;
  }

  var del = function () {
    self.element().innerHTML = '';
  }

  function create_drawing_area() {
    var txt = "<div class='hypnogramDrawingArea' id='hypnogramDrawingArea' style='height:150px;width:100%;'></div>";
    self.element().innerHTML = txt;
  }

  function labels2curve(labels) {
    var x = [], y = [];
    for (var l in labels) {
      x.push(l*self.annotations.dt*sec2hour);
      y.push(label2hash[labels[l]]);
    }
    return {x:x, y:y};
  }

  async function create_new_plot() {
    create_drawing_area();
    var traces = [];
    var layout = {
      plot_bgcolor: "rgb(0.94,0.99,0.75)",
      paper_bgcolor: "rgb(0.94,0.99,0.75)",
      showlegend: false,
      xaxis: {title: "relative time (hours)"},
      margin: { t: 0, b: 30, l: 40, r: 20 }
    };
    // data
    var traces = [];
    var trace = labels2curve(self.annotations.labels);
    var data = {
      x: trace.x, y: trace.y,
      mode: "lines",
      line: { color: "rgb(0.0, 0.0, 0.0)", width: 2.0 },
      yaxis: "y"
    };
    var vert = {
      x: [1, 1], y: [0, 4],
      mode: "lines", 
      line: { color: "rgb(1.0, 0.0, 0.0)", width: 3.0 },
    };
    traces = [data, vert];
    // layout
    layout['yaxis'] = {
      tickvals: [0, 1, 2, 3, 4],
      ticktext: hash2label,
      zeroline: false
    };
    await Plotly.newPlot("hypnogramDrawingArea", traces, layout, config);
  }

  function set_time(t0) {
    t0 = t0*sec2hour || window_start;
    window_start = t0;
    var drawingArea = document.getElementById("hypnogramDrawingArea");
    Plotly.restyle(drawingArea, {'x': [[window_start, window_start]]}, 1);
  }

  function slider_str(t0) {
    return "  Stage: "+self.annotations.labels[Math.floor(t0/30)];
  }

  function redraw() {
    var drawingArea = document.getElementById("hypnogramDrawingArea");
    Plotly.restyle(drawingArea, labels2curve(self.annotations.labels));
  }

  self.del = del;
  self.set_time = set_time;
  self.slider_str = slider_str;
  self.create_new_plot = create_new_plot;
  return self;
}