const svg = d3.select("#chart");

const width = 1000;
const height = 600;

const previousButton = d3.select("#previous-button");
const nextButton = d3.select("#next-button");
const sceneIndicator = d3.select("#scene-indicator");
const sceneDescription = d3.select("#scene-description");

let currentScene = 0;

const scenes = [
  {
    title: "Scene 1: Economic Prosperity and Height",
    xField: "gdp_per_capita_2023",
    xLabel: "GDP per capita, 2023 (PPP)",
    description: "Wealthier countries generally tend to have taller populations.",
    annotation: "Higher-income countries tend to cluster at greater average heights."
  },
  {
    title: "Scene 2: Protein Supply and Height",
    xField: "protein_g_day_2023",
    xLabel: "Daily protein supply, 2023 (in grams per person)",
    description: "Countries with greater protein availability also tend to have taller populations.",
    annotation: "Protein availability shows a strong upward relationship with average height."
  },
  {
    title: "Scene 3: Meat Supply and Height",
    xField: "meat_kg_year_2023",
    xLabel: "Meat supply, 2023 (kg per person per year)",
    description: "Meat availability follows a similar pattern, but it is not the only factor connected to height.",
    annotation: "Meat supply follows the same broad pattern, but the relationship is less exact."
  }
];

const margin = {
  top: 150,
  right: 170,
  bottom: 70,
  left: 80
};

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

svg.attr("viewBox", "0 0 " + width + " " + height);
svg.attr("preserveAspectRatio", "xMidYMid meet");

const chartGroup = svg.append("g");

chartGroup.attr(
  "transform",
  "translate(" + margin.left + ", " + margin.top + ")"
);

d3.csv("data/height_nutrition_2023.csv").then(function(data) {
  data.forEach(function(d) {
    d.height_cm = Number(d.height_cm);
    d.gdp_per_capita_2023 = Number(d.gdp_per_capita_2023);
    d.protein_g_day_2023 = Number(d.protein_g_day_2023);
    d.meat_kg_year_2023 = Number(d.meat_kg_year_2023);
    d.population_2023 = Number(d.population_2023);
  });

  const minGDP = d3.min(data, function(d) {
    return d.gdp_per_capita_2023;
  });

  const maxGDP = d3.max(data, function(d) {
    return d.gdp_per_capita_2023;
  });

  const initialXScale = d3.scaleLog()
    .domain([minGDP, maxGDP])
    .range([0, innerWidth])
    .nice();

  const minHeight = d3.min(data, function(d) {
    return d.height_cm;
  });

  const maxHeight = d3.max(data, function(d) {
    return d.height_cm;
  });

  const yScale = d3.scaleLinear()
    .domain([minHeight - 1, maxHeight + 1])
    .range([innerHeight, 0]);

  const minPopulation = d3.min(data, function(d) {
    return d.population_2023;
  });

  const maxPopulation = d3.max(data, function(d) {
    return d.population_2023;
  });

  const radiusScale = d3.scaleSqrt()
    .domain([minPopulation, maxPopulation])
    .range([4, 28]);

  const regions = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania"
  ];

  const colorScale = d3.scaleOrdinal()
    .domain(regions)
    .range(d3.schemeTableau10);

  const tooltip = d3.select("#tooltip");

  const sceneTitle = chartGroup.append("text");

  sceneTitle
    .attr("id", "scene-title")
    .attr("x", 0)
    .attr("y", -110)
    .attr("font-size", 22)
    .attr("font-weight", "bold")
    .text(scenes[currentScene].title);

  const annotationGroup = chartGroup
    .append("g")
    .attr("id", "annotation-group");

  const bubbles = chartGroup
    .selectAll(".country-bubble")
    .data(data)
    .enter()
    .append("circle");

  bubbles
    .attr("class", "country-bubble")
    .attr("cx", function(d) {
      return initialXScale(d.gdp_per_capita_2023);
    })
    .attr("cy", function(d) {
      return yScale(d.height_cm);
    })
    .attr("r", function(d) {
      return radiusScale(d.population_2023);
    })
    .attr("fill", function(d) {
      return colorScale(d.region);
    })
    .attr("fill-opacity", 0.65)
    .attr("stroke", "white")
    .attr("stroke-width", 1);

  bubbles.on("mouseover", function(event, d) {
    d3.select(this)
      .attr("stroke", "#1f2933")
      .attr("stroke-width", 2)
      .attr("fill-opacity", 0.9);

    const field = scenes[currentScene].xField;
    let xValueText = "";

    if (field === "gdp_per_capita_2023") {
      xValueText =
        "GDP per capita (PPP): $" +
        d.gdp_per_capita_2023.toLocaleString();
    }

    if (field === "protein_g_day_2023") {
      xValueText =
        "Protein supply: " +
        d.protein_g_day_2023.toFixed(1) +
        " g/day";
    }

    if (field === "meat_kg_year_2023") {
      xValueText =
        "Meat supply: " +
        d.meat_kg_year_2023.toFixed(1) +
        " kg/year";
    }

    const tooltipText =
      "<strong>" + d.country + "</strong><br>" +
      "Region: " + d.region + "<br>" +
      "Height: " + d.height_cm.toFixed(1) + " cm<br>" +
      xValueText + "<br>" +
      "Population: " + d.population_2023.toLocaleString();

    tooltip
      .style("display", "block")
      .html(tooltipText);
  });

  bubbles.on("mousemove", function(event) {
    tooltip
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 20 + "px");
  });

  bubbles.on("mouseout", function() {
    d3.select(this)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("fill-opacity", 0.65);

    tooltip.style("display", "none");
  });

  const legend = chartGroup.append("g");

  legend.attr(
    "transform",
    "translate(" + (innerWidth + 25) + ", 10)"
  );

  const legendCircles = legend
    .selectAll("circle")
    .data(regions)
    .enter()
    .append("circle");

  legendCircles
    .attr("cx", 0)
    .attr("cy", function(d, i) {
      return i * 24;
    })
    .attr("r", 6)
    .attr("fill", function(d) {
      return colorScale(d);
    });

  const legendLabels = legend
    .selectAll("text")
    .data(regions)
    .enter()
    .append("text");

  legendLabels
    .attr("x", 14)
    .attr("y", function(d, i) {
      return i * 24 + 5;
    })
    .attr("font-size", 13)
    .text(function(d) {
      return d;
    });

  const xAxisGroup = chartGroup
    .append("g")
    .attr("transform", "translate(0, " + innerHeight + ")");

  xAxisGroup.call(
    d3.axisBottom(initialXScale).ticks(8, "~s")
  );

  const yAxisGroup = chartGroup.append("g");
  yAxisGroup.call(d3.axisLeft(yScale));

  const xAxisLabel = chartGroup.append("text");

  xAxisLabel
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 55)
    .attr("text-anchor", "middle")
    .attr("font-size", 16)
    .text(scenes[currentScene].xLabel);

  const yAxisLabel = chartGroup.append("text");

  yAxisLabel
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -55)
    .attr("text-anchor", "middle")
    .attr("font-size", 16)
    .text("Average male height (cm)");

  function wrapText(textSelection, maxWidth) {
    textSelection.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/);

      const x = text.attr("x");
      const y = text.attr("y");

      let currentLine = [];
      let lineNumber = 0;
      let currentTspan;

      text.text("");

      currentTspan = text
        .append("tspan")
        .attr("x", x)
        .attr("y", y);

      for (let i = 0; i < words.length; i++) {
        currentLine.push(words[i]);
        currentTspan.text(currentLine.join(" "));

        if (currentTspan.node().getComputedTextLength() > maxWidth) {
          currentLine.pop();
          currentTspan.text(currentLine.join(" "));

          currentLine = [words[i]];
          lineNumber = lineNumber + 1;

          currentTspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", lineNumber * 1.2 + "em")
            .text(words[i]);
        }
      }
    });
  }

  function updateScene() {
    const scene = scenes[currentScene];

    sceneIndicator.text(
      "Scene " + (currentScene + 1) + " of " + scenes.length
    );

    sceneDescription.text(scene.description);

    if (currentScene === 0) {
      previousButton.property("disabled", true);
    } else {
      previousButton.property("disabled", false);
    }

    if (currentScene === scenes.length - 1) {
      nextButton.property("disabled", true);
    } else {
      nextButton.property("disabled", false);
    }

    sceneTitle.text(scene.title);

    let newXScale;

    if (scene.xField === "gdp_per_capita_2023") {
      const minimum = d3.min(data, function(d) {
        return d[scene.xField];
      });

      const maximum = d3.max(data, function(d) {
        return d[scene.xField];
      });

      newXScale = d3.scaleLog()
        .domain([minimum, maximum])
        .range([0, innerWidth])
        .nice();
    } else {
      const maximum = d3.max(data, function(d) {
        return d[scene.xField];
      });

      newXScale = d3.scaleLinear()
        .domain([0, maximum * 1.05])
        .range([0, innerWidth])
        .nice();
    }

    let newXAxis;

    if (scene.xField === "gdp_per_capita_2023") {
      newXAxis = d3.axisBottom(newXScale).ticks(8, "~s");
    } else {
      newXAxis = d3.axisBottom(newXScale);
    }

    xAxisGroup
      .transition()
      .duration(800)
      .call(newXAxis);

    xAxisLabel.text(scene.xLabel);

    bubbles
      .transition()
      .duration(800)
      .attr("cx", function(d) {
        return newXScale(d[scene.xField]);
      });

    annotationGroup.selectAll("*").remove();

    annotationGroup
      .append("rect")
      .attr("x", 15)
      .attr("y", -90)
      .attr("width", 310)
      .attr("height", 72)
      .attr("rx", 6)
      .attr("fill", "white")
      .attr("stroke", "#9fb3c8");

    annotationGroup
      .append("text")
      .attr("x", 30)
      .attr("y", -65)
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .text("Key observation");

    const annotationText = annotationGroup
      .append("text")
      .attr("x", 30)
      .attr("y", -43)
      .attr("font-size", 13)
      .text(scene.annotation);

    wrapText(annotationText, 280);
  }

  nextButton.on("click", function() {
    if (currentScene < scenes.length - 1) {
      currentScene = currentScene + 1;
      updateScene();
    }
  });

  previousButton.on("click", function() {
    if (currentScene > 0) {
      currentScene = currentScene - 1;
      updateScene();
    }
  });

  updateScene();
});