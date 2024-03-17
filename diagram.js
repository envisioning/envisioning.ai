document.addEventListener("DOMContentLoaded", function() {
    var width = 960, height = 600;

    var tooltip = d3.select("#tooltip");

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            container.attr("transform", event.transform);
        }))
        .append("g");

    var container = svg.append("g");

    // Load the JSON data
    d3.json("transformed.data.json").then(function(graph) {
        var simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink(graph.links)
            .id(d => d.id)
            .distance(d => {
                // Assuming each link has `source` and `target` which are either indexes or references to the nodes
                const sourceLevel = graph.nodes.find(node => node.id === d.source.id).level;
                const targetLevel = graph.nodes.find(node => node.id === d.target.id).level;
                
                // Customize these conditions and distances as per your requirement
                if ((sourceLevel === 1 && targetLevel === 2) || (sourceLevel === 2 && targetLevel === 1)) {
                    return 0; // Shorter distance for levels 1 & 2
                } else if ((sourceLevel === 3 && targetLevel === 4) || (sourceLevel === 4 && targetLevel === 3)) {
                    return 300; // Larger distance for levels 3 & 4
                } else {
                    return 100; // Default distance for other combinations
                }
            })
            .strength(1))
            .force("charge", d3.forceManyBody().strength(-2500)) // Increase repulsion strength for larger spacing
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(0.1))
            .force("y", d3.forceY(height / 2).strength(0.1));


        var link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke", "#666") // Ensure lines have a stroke color.
            .attr("stroke-width", d => Math.sqrt(d.value));

        var node = container.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g");

            



            

        node.append("circle")
            .attr("r", 60) // Adjust radius as needed

            // Remove the fill attribute modification based on level
            .attr("stroke", "black") // Set the stroke color for all nodes
            .attr("stroke-width", d => {
                // Set stroke-width based on level
                switch(d.level) {
                    case 1: return "8px"; // Thickest for level 1
                    case 2: return "6px"; // Less thick for level 2
                    case 3: return "4px"; // Thinner for level 3
                    case 4: return "2px"; // Thinnest for level 4
                    default: return "2px"; // Default case
                }
            })
            .attr("fill", d => {
                // Define color shades for each chapter based on level
                const fallbackColors = {
                    1: "#CCCCCC", // Level 1 - Lightest Grey
                    2: "#BBBBBB", // Level 2
                    3: "#AAAAAA", // Level 3
                    4: "#999999"  // Level 4 - Darkest Grey
                };
                if (!d.chapter) return fallbackColors[d.level];

                const colors = {
                    1: { // Chapter 1 
                        2: "#824D74", // Level 2
                        3: "#BE7B72", // Level 3
                        4: "#FDAF7B"  // Level 4
                    },
                    2: { // Chapter 2 
                        2: "#496989", // Level 2
                        3: "#58A399", // Level 3
                        4: "#A8CD9F"  // Level 4
                    },
                    3: { // Chapter 3 
                        2: "#008DDA", // Level 2
                        3: "#41C9E2", // Level 3
                        4: "#ACE2E1"  // Level 4
                    },
                    4: { // Chapter 4 
                        2: "#FF204E", // Level 2
                        3: "#A0153E", // Level 3
                        4: "#5D0E41"  // Level 4
                    },
                    5: { // Chapter 5 
                        2: "#FDA403", // Level 2
                        3: "#E8751A", // Level 3
                        4: "#898121"  // Level 4
                    }
                };
                // Use chapter and level to determine color
                return colors[d.chapter][d.level];
            })
            .on("mouseover", function(event, d) {
                tooltip.html(d.description) // Assuming 'description' is the field name
                       .style("left", (event.pageX + 5) + "px")
                       .style("top", (event.pageY - 28) + "px")
                       .style("visibility", "visible");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });


        node.append("text")
            .text(d => d.title) // Assuming you want to use the 'title' as the label
            .attr("x", 0)
            .attr("y", 3) // Adjust y position based on your needs
            .attr("text-anchor", "middle")
            .style("fill", "black") // Set the text color
            .style("font-size", "12px"); // Set the text size

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Start zoomed in
        svg.call(d3.zoom().transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(2));
    });
});