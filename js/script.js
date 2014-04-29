var Bubbles, root, texts;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

Bubbles = function() {
  var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
  width = 1300;
  height = 510;
  data = [];
  node = null;
  label = null;
  margin = {
    top: 5,
    right: 0,
    bottom: 0,
    left: 0
  };
  maxRadius = 65;
  rScale = d3.scale.sqrt().range([0, maxRadius]);
  rValue = function(d) {
    return parseInt(d.count);
  };
  idValue = function(d) {
    return d.name;
  };
  textValue = function(d) {
    return d.name;
  };
  collisionPadding = 0;
  minCollisionRadius = 0;
  jitter = 0.5;
  transformData = function(rawData) {
    rawData.forEach(function(d) {
      d = parseInt(d);
      return rawData.sort(function() {
        return 0.5 - Math.random();
      });
    });
    return rawData;
  };
  tick = function(e) {
    var dampenedAlpha;
    dampenedAlpha = e.alpha * 0.1;
    node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    return label.style("left", function(d) {
      return ((margin.left + d.x) - d.dx / 2) + "px";
    }).style("top", function(d) {
      return ((margin.top + d.y) - d.dy / 2) + "px";
    });
  };
  force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
  chart = function(selection) {
    return selection.each(function(rawData) {
      var maxDomainValue, svg, svgEnter;
      data = transformData(rawData);
      maxDomainValue = d3.max(data, function(d) {
        return rValue(d);
      });
      rScale.domain([0, maxDomainValue]);
      svg = d3.select(this).selectAll("svg").data([data]);
      svgEnter = svg.enter().append("svg");
      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);
      node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
      label = d3.select(this).selectAll("#bubble-labels").data([data]).enter().append("div").attr("id", "bubble-labels");
      update();
      hashchange();
      return d3.select(window).on("hashchange", hashchange);
    });
  };
  update = function() {
    data.forEach(function(d, i) {
      return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
    });
    force.nodes(data).start();
    updateNodes();
    return updateLabels();
  };
  updateNodes = function() {
    node = node.selectAll(".bubble-node").data(data, function(d) {
      return idValue(d);
    });
    node.exit().remove();
    return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
      return rScale(rValue(d)-4);
    });
  };
  updateLabels = function() {
    var labelEnter;
    label = label.selectAll(".bubble-label").data(data, function(d) {
      return idValue(d);
    });
    label.exit().remove();
    labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents);
    labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
      return textValue(d);
    });
    labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
      return rValue(d);
    });
    label.style("font-size", function(d) {
      return Math.max(6, rScale(rValue(d) / 16)) + "px";
    }).style("width", function(d) {
      return 2.5 * rScale(rValue(d)) + "px";
    });
    label.append("span").text(function(d) {
      return textValue(d);
    }).each(function(d) {
      return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
    }).remove();
    label.style("width", function(d) {
      return d.dx + "px";
    });
    return label.each(function(d) {
      return d.dy = this.getBoundingClientRect().height;
    });
  };
  gravity = function(alpha) {
    var ax, ay, cx, cy;
    cx = width / 2;
    cy = height / 2;
    ax = alpha / 8;
    ay = alpha;
    return function(d) {
      d.x += (cx - d.x) * ax;
      return d.y += (cy - d.y) * ay;
    };
  };
  collide = function(jitter) {
    return function(d) {
      return data.forEach(function(d2) {
        var distance, minDistance, moveX, moveY, x, y;
        if (d !== d2) {
          x = d.x - d2.x;
          y = d.y - d2.y;
          distance = Math.sqrt(x * x + y * y);
          minDistance = d.forceR + d2.forceR + collisionPadding;
          if (distance < minDistance) {
            distance = (distance - minDistance) / distance * jitter;
            moveX = x * distance;
            moveY = y * distance;
            d.x -= moveX;
            d.y -= moveY;
            d2.x += moveX;
            return d2.y += moveY;
          }
        }
      });
    };
  };
  connectEvents = function(d) {
    d.on("click", click);
    d.on("mouseover", mouseover);
    return d.on("mouseout", mouseout);
  };
  clear = function() {
    return location.replace("#");
  };
  click = function(d) {
    location.replace("#" + encodeURIComponent(idValue(d)));
    return d3.event.preventDefault();
  };
  hashchange = function() {
    var id;
    id = decodeURIComponent(location.hash.substring(1)).trim();
    return updateActive(id);
  };
  updateActive = function(id) {
    node.classed("bubble-selected", function(d) {
      return id === idValue(d);
    });
    if (id.length > 0) {
      return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
    } else {
      return d3.select("#status").html("<h3>No word is active</h3>");
    }
  };
  mouseover = function(d) {
    return node.classed("bubble-hover", function(p) {
      return p === d;
    });
  };
  mouseout = function(d) {
    return node.classed("bubble-hover", false);
  };
  chart.jitter = function(_) {
    if (!arguments.length) {
      return jitter;
    }
    jitter = _;
    force.start();
    return chart;
  };
  chart.height = function(_) {
    if (!arguments.length) {
      return height;
    }
    height = _;
    return chart;
  };
  chart.width = function(_) {
    if (!arguments.length) {
      return width;
    }
    width = _;
    return chart;
  };
  chart.r = function(_) {
    if (!arguments.length) {
      return rValue;
    }
    rValue = _;
    return chart;
  };
  return chart;
};

root.plotData = function(selector, data, plot) {
  return d3.select(selector).datum(data).call(plot);
};

texts = [
  {
    key: "Sunshine",
    file: "sunshine.csv",
    name: "Sunshine"
  }, {
    key: "Academics",
    file: "academics.csv",
    name: "Academics"
  }, {
    key: "Happiness",
    file: "happiness.csv",
    name: "Happiness"
  }, {
    key: "Athletics",
    file: "athletics.csv",
    name: "Athletics"
  }, {
    key: "Atmosphere",
    file: "atmostphere.csv",
    name: "Local Atmosphere"
  }, {
    key: "Computers",
    file: "computers.csv",
    name: "Computers"
  }, {
    key: "Dining",
    file: "dining.csv",
    name: "On Campus Dining"
  }, {
    key: "Diversity",
    file: "diversity.csv",
    name: "Diversity"
  }, {
    key: "Facilities",
    file: "facilities.csv",
    name: "Facilities"
  }, {
    key: "Girls",
    file: "girls.csv",
    name: "Girls"
  }, {
    key: "Greek Life",
    file: "greek.csv",
    name: "Greek Life"
  }, {
    key: "Guys",
    file: "guys.csv",
    name: "Guys "
  }, {
    key: "Health",
    file: "health.csv",
    name: "Health and Safety"
  }, {
    key: "Housing",
    file: "housing.csv",
    name: "Housing"
  }, {
    key: "Likes",
    file: "likes.csv",
    name: "# of Facebook Likes"
  }, {
    key: "Nightlife",
    file: "nightlife.csv",
    name: "Nightlife"
  }, {
    key: "Off Campus Dining",
    file: "offcampus-dining.csv",
    name: "Off Campus Dining"
  }, {
    key: "Off Campus Housing",
    file: "offcampus-housing.csv",
    name: "Off Campus Housing"
  }, {
    key: "Parking",
    file: "parking.csv",
    name: "Parking"
  }, {
    key: "Safety",
    file: "safety.csv",
    name: "Drug Safety"
  }, {
    key: "Strictness",
    file: "strictness.csv",
    name: "Strictness"
  }, {
    key: "Sunshine",
    file: "sunshine.csv",
    name: "Avg Hours of Sunshine"
  }, {
    key: "Transportation",
    file: "transportations.csv",
    name: "Transportation"
  }, {
    key: "Twitter",
    file: "twitter.csv",
    name: "Twitter Activity"
  }, {
    key: "Weather",
    file: "weather.csv",
    name: "Weather"
  }
];

$(function() {
  var display, key, plot, text;
  plot = Bubbles();
  display = function(data) {
    return plotData("#vis", data, plot);
  };
  key = decodeURIComponent(location.search).replace("?", "");
  text = texts.filter(function(t) {
    return t.key === key;
  })[0];
  if (!text) {
    text = texts[0];
  }

  var xAxisOptions = ["Sunshine", "Academics", "Happiness", "Athletics", "Atmosphere", "Computers", "Dining", "Diversity", "Facilities", "Girls", "Greek", "Guys", "Health", "Housing", "Likes", "Nightlife", "Off Campus Dining", "Off Campus Housing", "Parking", "Safety", "Strictness", "Sunshine", "Transportation", "Twitter", "Weather"]

   d3.select('#text-select')
    .selectAll('li')
    .data(xAxisOptions)
    .enter()
    .append('li')
    .text(function(d) {return d;})
    .classed('selected', function(d) {

      return d === key;
    })
    .on('click', function(d) {
      key=d;
      updateMenus();
    });


  function updateMenus() {
    d3.select('#text-select')
      .selectAll('li')
      .classed('selected', function(d) {
        d === key;
          location.replace("#");
    return location.search = encodeURIComponent(key);

      });
  }
  // $("#text-select").val(key);
  // d3.select("#jitter").on("input", function() {
  //   return plot.jitter(parseFloat(this.output.value));
  // });
  // d3.select("#text-select").on("change", function(e) {
  //   key = $(this).val();
  //   location.replace("#");
  //   return location.search = encodeURIComponent(key);
  // });
  d3.select("#college-title").html(text.name);
  return d3.csv("data/" + text.file, display);
});