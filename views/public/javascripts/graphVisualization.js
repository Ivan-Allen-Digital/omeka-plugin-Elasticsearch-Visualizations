'use strict';

var graphVisualization = (function() {
    var simulation = d3.forceSimulation()
    var svgID = 'connections-graph'

    var svg
    var svgWidth
    var svgHeight
    var color

    function initSimulation() {
        svg = d3.select("#" + svgID)
        svgWidth = +svg.attr('svgWidth')
        svgHeight = +svg.attr('svgHeight')
        color = d3.scaleOrdinal(d3.schemeCategory20);

        simulation
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2));
    }

    function renderGraphOnSVG(graphData) {
        function resetSVG() {
            simulation.nodes([])
                .on("tick", null);
            simulation.force("link").links([])
            svg.html("")
            simulation.restart()
        }

        resetSVG()

        var container = svg.append('g')
        var zoom = setupZoom(container)

        svg.call(zoom)

        var linkElement = setupLinkBehavior(container, graphData, color)

        var nodeElement = setupNodeBehavior(container, graphData, color)

        var tooltip = setupTooltipBehavior(container, graphData, color)

        simulation
            .nodes(graphData.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graphData.links);


        function ticked() {
            linkElement
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            nodeElement
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    }

    function setupZoom(svg) {
        var zoom = d3.zoom()
            .on("zoom", function() {
                svg.attr("transform", d3.event.transform);
            })
        return zoom
    }

    function setupNodeBehavior(svg, graph, color) {
        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", function(d) {return d.group === 1 ? 4 : 8})
            .attr("fill", function(d) { return color(d.group); })
            .attr("stroke", function(d) { return color(d.group); })
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded));

        node.append("title")
            .text(function(d) {
                var result = d.title || d.id;
                if (d.tags) {
                    for (var i = 0; i < d.tags.length; i++) {
                        result += "; " + d.tags[i];
                    }
                }
                return result;
            });

        node.on("click", function(d) {
            window.open("/items/show/" + d.id.split("_")[1]);
        });
        return node
    }

    function setupLinkBehavior(svg, graph, color) {
        var linkElement = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke", function(d) { return color(d.group); })
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
        return linkElement
    }

    function setupTooltipBehavior(svg, graph, color) {
        var tooltip = svg.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll("circle")
            .on("mouseover", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

                tooltip.html("fffffffffffffff" + "<br>")
                .style("left", d3.event.pageX + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                .style("opacity", 0);
            });

        return tooltip;
    }

    function dragStarted(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragEnded(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }

    return {
        renderGraphOnSVG,
        initSimulation
    }
}())

