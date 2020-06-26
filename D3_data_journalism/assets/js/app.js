// Add event listener for resize of window
d3.select(window).on("resize", handleResize);

// Initialize possible data points collection
var censusDataPoints = [
    { 'id': 1, 'Name': 'smokes', 'Tooltip': 'Smokers' }
    ,
    { 'id': 2, 'Name': 'age', 'Tooltip': 'Age' }
];

var selectedYDataPoint = 'age';
var selectedXDataPoint = 'smokes';

// When the browser loads, loadChart() is called
loadChart();

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
function parseCensusData(data) {
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
}

// Read in the data file
function loadChart() {
    // Boiler plate initializations based on window size
    // This may actually be based on size of parent row or percentage
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    };
    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Create the svg....it should have been removed if it existed
    var svg = d3.select("#scatter").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // This will require running within a server
    d3.csv("assets/data/data.csv").then(function (censusData, err) {
        // if an error occured throw it
        if (err) throw err;


        // parse the data converting all columns to numerics in csv file 
        // (including id)
        censusData.forEach(parseCensusData);

        console.log("censusData", censusData);

        // Get the linear scales
        var xLinearScale = xScale(censusData, selectedXDataPoint, chartWidth);
        var yLinearScale = yScale(censusData, selectedYDataPoint, chartHeight);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            // .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[selectedXDataPoint]))
            .attr("cy", d => yLinearScale(d[selectedYDataPoint]))
            .attr("r", 10)
            .attr("fill", "blue")
            .attr("opacity", ".4");

    })
        .catch(function (error) {
            // log error to console
            console.log(error);
        });
}
