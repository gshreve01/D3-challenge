// Add event listener for resize of window
d3.select(window).on("resize", handleResize);

// Initialize possible data points collection
var censusDataPoints = [
    { 'id': 1, 'Name': 'smokes', 'Tooltip': 'Smokers', 'AxisTitle': 'People Who Smoke (%)', 'Format': '%' }
    ,
    { 'id': 2, 'Name': 'income', 'Tooltip': 'Income', 'AxisTitle': 'Avg Household Income', 'Format': '$' }
    ,
    { 'id': 3, 'Name': 'obesity', 'Tooltip': 'Obesity', 'AxisTitle': 'Obese (%)', 'Format': '%' }
    ,
    { 'id': 4, 'Name': 'poverty', 'Tooltip': 'In Poverty', 'AxisTitle': 'In Poverty (%)', 'Format': '%' }
    ,
    { 'id': 5, 'Name': 'healthcare', 'Tooltip': 'No Healthcare', 'AxisTitle': 'Without Healthcare (%)', 'Format': '%' }
];

var selectedXAxis = 1;
var selectedYAxis = 2;
var chartGroup = "";

function filterCensusDataPoint(data, id) {
    if (data.id == id)
        return true;
    else
        return false;
}

function getCensusDataPoint(id) {
    return censusDataPoints.filter((data) => filterCensusDataPoint(data, id))[0];
}

function init() {
    // Initialize event handling
    var xAxisSelect = d3.select("#x-axis-selection");
    xAxisSelect.on("change", function () {
        console.log("Entering X-Axis Change Event");
        selectedXAxis = xAxisSelect.property("value");
        console.log("selectedXAxis", selectedXAxis);
        loadChart();
    });

    var yAxisSelect = d3.select("#y-axis-selection");
    yAxisSelect.on("change", function () {
        console.log("Entering Y-Axis Change Event");
        selectedYAxis = yAxisSelect.property("value");
        console.log("selectedYAxis", selectedYAxis);
        loadChart();
    });

    // When the browser loads, loadChart() is called
    loadChart();
}

function setupSelections() {
    // Initialize Drop Down Selections
    var filterDataPoints = censusDataPoints.filter(function (data) {
        if (data.id != selectedYAxis)
            return true;
        else
            return false;
    });
    console.log("xAxisSelect filterDataPoints", filterDataPoints);
    var xAxisSelect = d3.select("#x-axis-selection");
    xAxisSelect.selectAll("option").remove();
    var xOptions = xAxisSelect.selectAll("option").data(filterDataPoints).enter().append("option")
        .text(function (d) { return d.AxisTitle; })
        .attr("value", function (d) { return d.id })
        .attr("id", function (d) { return `optionID${d.id}` });

    var xCensusDataPoint = getCensusDataPoint(selectedXAxis);
    var selectedXoption = xAxisSelect.select(`#optionID${selectedXAxis}`);
    selectedXoption.node().outerHTML = `<option value=${selectedXAxis} selected>${xCensusDataPoint.AxisTitle}</option>`;

    filterDataPoints = censusDataPoints.filter(function (data) {
        if (data.id != selectedXAxis)
            return true;
        else
            return false;
    });
    console.log("YAxisSelect filterDataPoints", filterDataPoints);
    var yAxisSelect = d3.select("#y-axis-selection");
    yAxisSelect.selectAll("option").remove();
    var yOptions = yAxisSelect.selectAll("option").data(filterDataPoints).enter().append("option")
        .text(function (d) { return d.AxisTitle; })
        .attr("value", function (d) { return d.id })
        .attr("id", function (d) { return `optionID${d.id}` });

    var yCensusDataPoint = getCensusDataPoint(selectedYAxis);
    var selectedYoption = yAxisSelect.select(`#optionID${selectedYAxis}`);
    selectedYoption.node().outerHTML = `<option value=${selectedYAxis} selected>${yCensusDataPoint.AxisTitle}</option>`;
}

function handleResize() {
    var svgArea = d3.select("svg");

    // If there is already an svg container on the page, remove it and reload the chart
    if (!svgArea.empty()) {
        svgArea.remove();
        loadChart();
    }
}

function xScale(censusData, selectedXAxis, width) {
    // create scales
    console.log("selectedXAxis", selectedXAxis);
    var dataPoints = censusData.map((d => d[selectedXAxis]));
    console.log("xScale dataPoints", dataPoints);
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(dataPoints, d => d) * 0.95,
        d3.max(dataPoints, d => d) * 1.05])
        .range([0, width]);

    return xLinearScale;
}

function yScale(censusData, selectedYAxis, height) {
    // create scales
    console.log("selectedYAxis", selectedYAxis);
    var dataPoints = censusData.map((d => d[selectedYAxis]));
    console.log("yScale dataPoints", dataPoints);
    var minValue = d3.min(dataPoints, d => d);
    console.log("yScale minValue", minValue);
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(dataPoints, d => d) * .95,
        d3.max(dataPoints, d => d) * 1.05])
        .range([height, 0]);

    return yLinearScale;
}

// Parses the data to force data to be numeric
function parseCensusData(data, selectedXDataPoint, selectedYDataPoint) {
    data.id = +data.id;
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.incomeMoe = + data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes = +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;

    data.selectedYAxis = selectedYAxis;
    data.selectedYAxis = selectedYAxis;
}

function TooltipNumberFormat(format, number) {
    var formatValue = number;
    switch (format) {
        case "%":
            formatValue += "%";
            break;
        case "$":
            formatValue = "$" + new Intl.NumberFormat().format(+number);
    }
    return formatValue;   
}

function UpdateToolTips(tooltipGroup) {
    // Step 1: Initialize Tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([45, -62])
        .html(function (d) {
            var xValue = d.xAxisValue;
            var yValue = d.yAxisValue;

            console.log("format", d.xAxisFormat);

            // Format values
            switch (d.xAxisFormat) {
                case "%":
                    xValue += "%";
                    break;
                case "$":
                    xValue = "$" + new Intl.NumberFormat().format(xValue);
            }
            return (`<strong>${d.state}</strong><br><div class="tooltipInfo">
                <strong>${d.xAxisValueName}</strong>: ${TooltipNumberFormat(d.xAxisFormat, d.xAxisValue)}<br>
                <strong>${d.yAxisValueName}</strong>: ${TooltipNumberFormat(d.yAxisFormat, d.yAxisValue)}</div>`);
        });

    // Step 2: Create the tooltip in chartGroup.
    chartGroup.call(toolTip);

    // Step 3: Create "mouseover" event listener to display tooltip
    tooltipGroup.on("mouseover", function (d) {
        console.log("d, this", d);

        // Get the Tooltip and value name
        var xAxisDataPoint = getCensusDataPoint(selectedXAxis)
        var yAxisDataPoint = getCensusDataPoint(selectedYAxis);

        var xTooltipName = xAxisDataPoint.Tooltip;
        var yTooltipName = yAxisDataPoint.Tooltip;
        var selectedXDataPoint = xAxisDataPoint.Name;
        var selectedYDataPoint = yAxisDataPoint.Name;

        var tooltipInfo = {
            "state": d.state
            , "xAxisValueName": xTooltipName
            , "xAxisValue": d[selectedXDataPoint]
            , "yAxisValueName": yTooltipName
            , "yAxisValue": d[selectedYDataPoint]
            , "xAxisFormat": xAxisDataPoint.Format
            , "yAxisFormat": yAxisDataPoint.Format
        };
        console.log("tooltipInfo", tooltipInfo);
        toolTip.show(tooltipInfo, this);
    })
        // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function (d) {
            toolTip.hide(d);
        })
        ;
}

// Generate the circles
function RenderCirclesAndLabels(censusData, xLinearScale, yLinearScale, selectedXDataPoint, selectedYDataPoint) {
    // Render data circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[selectedXDataPoint]))
        .attr("cy", d => yLinearScale(d[selectedYDataPoint]))
        .attr("r", 12)
        .classed("stateCircle active", true);

    // Render circle labels
    var textsGroup = chartGroup.selectAll("text")
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[selectedXDataPoint]))
        .attr("y", d => yLinearScale(d[selectedYDataPoint]) + 4)
        .classed("stateText", true)
        .attr("text-anchor", "middle")
        .text((d) => d.abbr);


    UpdateToolTips(textsGroup);
}

function RenderAxises(censusData, chartWidth, chartHeight, xLinearScale, yLinearScale, margin) {
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    chartGroup
        .append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        // .classed("x-axis", true)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // XAxis Title
    chartGroup.append("text")
        // Position the text
        // Center the text:
        // (https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor)
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 20})`)
        .attr("text-anchor", "middle")
        .classed("aText", true)
        .attr("fill", "black")
        .text(getCensusDataPoint(selectedXAxis).AxisTitle);

    // YAxis Title
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left))
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text(getCensusDataPoint(selectedYAxis).AxisTitle);
}


// Read in the data file
function loadChart() {
    console.clear();
    // Boiler plate initializations based on window size
    // This may actually be based on size of parent row or percentage
    // var svgWidth = window.innerWidth;
    // var svgHeight = window.innerHeight;
    var svgWidth = 960;
    var svgHeight = 750;

    console.log("svgWidth, svgHeight", svgWidth, svgHeight);

    var margin = {
        top: 30,
        right: 30,
        bottom: 80,
        left: 80
    };
    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    var selectedYDataPoint = getCensusDataPoint(selectedYAxis).Name;
    console.log("selectedYDataPoint", selectedYDataPoint);
    var selectedXDataPoint = getCensusDataPoint(selectedXAxis).Name;
    console.log("selectedXDataPoint", selectedXDataPoint);

    // Create the svg....it should have been removed if it existed
    var scatter = d3.select("#scatter");
    scatter.select("svg").remove();

    var svg = scatter.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 960 750")
        .classed("chart", true)
        // .attr("height", svgHeight)
        // .attr("width", svgWidth)
        ;

    // Append an SVG group
    chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // This will require running within a server
    d3.csv("assets/data/data.csv").then(function (censusData, err) {
        // if an error occured throw it
        if (err) throw err;

        // parse the data converting all columns to numerics in csv file 
        // (including id)
        censusData.forEach(item => parseCensusData(item, selectedXDataPoint, selectedYDataPoint));
        console.log("censusData", censusData);

        // Get the linear scales
        var xLinearScale = xScale(censusData, selectedXDataPoint, chartWidth);
        var yLinearScale = yScale(censusData, selectedYDataPoint, chartHeight);

        // Render the circles and the labels
        RenderCirclesAndLabels(censusData, xLinearScale, yLinearScale, selectedXDataPoint, selectedYDataPoint);

        // Render the Axises
        RenderAxises(censusData, chartWidth, chartHeight, xLinearScale, yLinearScale, margin);

        // Setup the selections which can change
        setupSelections();
    })
        .catch(function (error) {
            // log error to console
            console.log(error);
        });
}

init();
