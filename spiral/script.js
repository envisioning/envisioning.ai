// Load the data from the external JSON file
d3.json("data.json").then(function(data) {
  const numCircles = data.length;
  const radius = 200;
  const scalingFactor = 0.75;
  const firstCircleOffset = radius * 0.5;
  const animationDuration = 2000;

  const colorScheme = [
    "#FF9800", // Orange
    "#F93822", // Red
    "#BD3742", // Dark Red
    "#7E2D40", // Maroon
    "#254A5D", // Dark Blue
    "#4A6D8C", // Blue
    "#7F9EB2"  // Light Blue
  ];

  const svg = d3
    .select("#sunflower-pattern")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%");

  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;

  const phi = (1 + Math.sqrt(5)) / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  const positions = data.map((entry, i) => {
    const theta = i * 2 * Math.PI * phi;
    const r = i === 0 ? firstCircleOffset : Math.sqrt(i) * radius * scalingFactor;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    return { x, y, ...entry, index: i + 1 };
  });

  const circleGroups = svg
    .selectAll("g.circle-group")
    .data(positions)
    .join("g")
    .attr("class", "circle-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`);

  circleGroups.append("circle")
    .attr("r", 0)
    .attr("class", "circle")
    .attr("stroke", "none")
    .attr("fill", (d, i) => colorScheme[Math.floor(i / (numCircles / colorScheme.length)) % colorScheme.length])
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "none");
    });

  circleGroups.append("text")
    .attr("class", "circle-text circle-title")
    .attr("dy", "-0.5em")
    .text(d => d.title);

  circleGroups.append("text")
    .attr("class", "circle-text circle-description")
    .attr("dy", "1em")
    .text(d => d.description);

  const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);

  svg.call(zoom);

  function zoomed({ transform }) {
    circleGroups.attr("transform", transform);
  }

  const initialScale = 0.6;
  const initialTranslate = [width / 2, height / 2];
  const initialTransform = d3.zoomIdentity.translate(initialTranslate[0], initialTranslate[1]).scale(initialScale);
  svg.call(zoom.transform, initialTransform);

  function bouncingInterpolator(start, end) {
    const overshootValue = 1.3;
    const maxOvershoot = Math.max(start / (end - start), (1 - end) / (end - start));
    const p = (1 + overshootValue) / (1 + overshootValue / maxOvershoot);

    return function(t) {
      return start + (end - start) * (t < 0.5 ? Math.pow(2 * t, p) / 2 : 1 - Math.pow(2 * (1 - t), p) / 2);
    };
  }

  circleGroups.selectAll("circle")
    .transition()
    .duration(animationDuration)
    .delay((d, i) => i * animationDuration / numCircles)
    .attrTween("r", function(d) {
      const startRadius = 0;
      const endRadius = radius;
      const interpolator = bouncingInterpolator(startRadius, endRadius);
      return t => interpolator(t);
    });

  circleGroups.selectAll(".circle-text")
    .transition()
    .duration(animationDuration)
    .delay((d, i) => i * animationDuration / numCircles)
    .style("opacity", 1);
});