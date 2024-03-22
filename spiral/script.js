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

  const circles = svg
    .selectAll("circle")
    .data(positions)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 0)
    .attr("class", "circle")
    .attr("stroke", "none")
    .attr("fill", (d, i) => colorScheme[Math.floor(i / (numCircles / colorScheme.length)) % colorScheme.length])
    .on("mouseover", function(event, d) {
      if (!d) return; // Add this check
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      tooltip.text(d.description)
        .style("opacity", 1)
        .style("background-color", d3.select(this).attr("fill")) // Set the background color
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "none");

      tooltip.style("opacity", 0);
    });

  const circleTexts = svg
    .selectAll("text.circle-text")
    .data(positions)
    .join("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("class", "circle-title")
    .style("opacity", 0)
    .text(d => d.title)
    .on("mouseover", function(event, d) {
      const circle = selectCircleById(d.id); // Pass d.id to the helper function
      circle.attr("cursor", "pointer"); // Set the cursor style to pointer
      tooltip.text(d.description)
        .style("opacity", 1)
        .style("background-color", circle.attr("fill")) // Set the background color to the circle's fill color
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function(d) {
      const circle = selectCircleById(d.id); // Pass d.id to the helper function
      circle.attr("cursor", "default"); // Set the cursor style back to default
      tooltip.style("opacity", 0);
    });

  // Create a tooltip element
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);

  svg.call(zoom);

  function zoomed({ transform }) {
    circles.attr("transform", transform);
    circleTexts.attr("transform", transform);
  }

  const initialScale = 0.4;
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

  circles
    .transition()
    .duration(animationDuration)
    .delay((d, i) => i * animationDuration / numCircles)
    .attrTween("r", function(d) {
      const startRadius = 0;
      const endRadius = radius;
      const interpolator = bouncingInterpolator(startRadius, endRadius);
      return t => interpolator(t);
    });

  circleTexts
    .transition()
    .duration(animationDuration)
    .delay((d, i) => i * animationDuration / numCircles)
    .style("opacity", 1);

  // Helper function to select a circle by its id
  function selectCircleById(id) {
    return d3.select(`circle#${id}`);
  }
});