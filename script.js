/*
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
    title: "Scene 1: Prosperity and Height",
    xField: "gdp_per_capita_2023",
    xLabel: "GDP per capita, 2023",
    description:
      "Wealthier countries generally tend to have taller populations.",
    annotation: "Higher-income countries tend to cluster at greater average heights."
  },
  {
    title: "Scene 2: Protein Supply and Height",
    xField: "protein_g_day_2023",
    xLabel: "Daily protein supply, 2023 (grams per person)",
    description:
      "Countries with greater protein availability also tend to have taller populations.",
    annotation: "Protein availability shows a strong upward relationship with average height."
  },
  {
    title: "Scene 3: Meat Supply and Height",
    xField: "meat_kg_year_2023",
    xLabel: "Meat supply, 2023 (kg per person per year)",
    description:
      "Meat availability follows a similar pattern, but it is not the only factor connected to height.",
    annotation: "Meat supply follows the same broad pattern, but the relationship is less exact."
  }
];

const margin = {
  top: 90,
  right: 170,
  bottom: 70,
  left: 80
};

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

svg
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data/height_nutrition_2023.csv").then(data => {
  data.forEach(d => {
    d.height_cm = +d.height_cm;
    d.gdp_per_capita_2023 = +d.gdp_per_capita_2023;
    d.protein_g_day_2023 = +d.protein_g_day_2023;
    d.meat_kg_year_2023 = +d.meat_kg_year_2023;
    d.population_2023 = +d.population_2023;
  });

  const xScale = d3.scaleLog()
  .domain([
    d3.min(data, d => d.gdp_per_capita_2023),
    d3.max(data, d => d.gdp_per_capita_2023)
  ])
  .range([0, innerWidth])
  .nice();

const yScale = d3.scaleLinear()
  .domain([
    d3.min(data, d => d.height_cm) - 1,
    d3.max(data, d => d.height_cm) + 1
  ])
  .range([innerHeight, 0]);

const radiusScale = d3.scaleSqrt()
  .domain([
    d3.min(data, d => d.population_2023),
    d3.max(data, d => d.population_2023)
  ])
  .range([4, 28]);

const colorScale = d3.scaleOrdinal()
  .domain([
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania"
  ])
  .range(d3.schemeTableau10);

const xAxis = d3.axisBottom(xScale)
.ticks(8, "~s");

const yAxis = d3.axisLeft(yScale);

const tooltip = d3.select("#tooltip");

chartGroup
  .append("text")
  .attr("x", 0)
  .attr("y", -50)
  .attr("font-size", 22)
  .attr("font-weight", "bold")
  .attr("id", "scene-title")
  .text(scenes[currentScene].title);

chartGroup
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d => xScale(d.gdp_per_capita_2023))
  .attr("cy", d => yScale(d.height_cm))
  .attr("r", d => radiusScale(d.population_2023))
  .attr("fill", d => colorScale(d.region))
  .attr("fill-opacity", 0.65)
  .attr("stroke", "white")
  .attr("stroke-width", 1)
  .on("mouseover", function(event, d) {
    d3.select(this)
      .attr("stroke", "#1f2933")
      .attr("stroke-width", 2)
      .attr("fill-opacity", 0.9);

    const scene = scenes[currentScene];

let xValueText;

if (scene.xField === "gdp_per_capita_2023") {
  xValueText =
    `GDP per capita: $${d.gdp_per_capita_2023.toLocaleString()}`;
} else if (scene.xField === "protein_g_day_2023") {
  xValueText =
    `Protein supply: ${d.protein_g_day_2023.toFixed(1)} g/day`;
} else {
  xValueText =
    `Meat supply: ${d.meat_kg_year_2023.toFixed(1)} kg/year`;
}

tooltip
  .style("display", "block")
  .html(`
    <strong>${d.country}</strong><br>
    Region: ${d.region}<br>
    Height: ${d.height_cm.toFixed(1)} cm<br>
    ${xValueText}<br>
    Population: ${d.population_2023.toLocaleString()}
  `);
  })
  .on("mousemove", function(event) {
    tooltip
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 20}px`);
  })
  .on("mouseout", function() {
    d3.select(this)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("fill-opacity", 0.65);

    tooltip.style("display", "none");
  });

const legendData = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania"
];

const legend = chartGroup
  .append("g")
  .attr("transform", `translate(${innerWidth - 130}, 10)`);

legend
  .selectAll("circle")
  .data(legendData)
  .enter()
  .append("circle")
  .attr("cx", 0)
  .attr("cy", (d, i) => i * 24)
  .attr("r", 6)
  .attr("fill", d => colorScale(d));

legend
  .selectAll("text")
  .data(legendData)
  .enter()
  .append("text")
  .attr("x", 14)
  .attr("y", (d, i) => i * 24 + 5)
  .attr("font-size", 13)
  .text(d => d);

const xAxisGroup = chartGroup
  .append("g")
  .attr("transform", `translate(0, ${innerHeight})`)
  .call(xAxis);

chartGroup
  .append("g")
  .call(yAxis);

const xAxisLabel = chartGroup
  .append("text")
  .attr("x", innerWidth / 2)
  .attr("y", innerHeight + 55)
  .attr("text-anchor", "middle")
  .attr("font-size", 16)
  .text(scenes[currentScene].xLabel);

chartGroup
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerHeight / 2)
  .attr("y", -55)
  .attr("text-anchor", "middle")
  .attr("font-size", 16)
  .text("Average male height (cm)");

const annotationGroup = chartGroup
  .append("g")
  .attr("id", "annotation-group");

function wrapText(textSelection, width) {
  textSelection.each(function() {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();

    let word;
    let line = [];
    let lineNumber = 0;

    const lineHeight = 1.2;
    const x = text.attr("x");
    const y = text.attr("y");

    text.text(null);

    let tspan = text
      .append("tspan")
      .attr("x", x)
      .attr("y", y);

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));

        line = [word];
        lineNumber++;

        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", `${lineNumber * lineHeight}em`)
          .text(word);
      }
    }
  });
}

function updateScene() {
  const scene = scenes[currentScene];

  sceneIndicator.text(`Scene ${currentScene + 1} of ${scenes.length}`);
  sceneDescription.text(scene.description);

  previousButton.property("disabled", currentScene === 0);
  nextButton.property("disabled", currentScene === scenes.length - 1);

  d3.select("#scene-title")
    .text(scene.title);

  let newXScale;

  if (scene.xField === "gdp_per_capita_2023") {
    newXScale = d3.scaleLog()
      .domain([
        d3.min(data, d => d[scene.xField]),
        d3.max(data, d => d[scene.xField])
      ])
      .range([0, innerWidth])
      .nice();
  } else {
    newXScale = d3.scaleLinear()
      .domain([
        0,
        d3.max(data, d => d[scene.xField]) * 1.05
      ])
      .range([0, innerWidth])
      .nice();
  }

  xAxisGroup
    .transition()
    .duration(800)
    .call(
      scene.xField === "gdp_per_capita_2023"
        ? d3.axisBottom(newXScale).ticks(8, "~s")
        : d3.axisBottom(newXScale)
    );

  xAxisLabel
    .text(scene.xLabel);

  chartGroup
    .selectAll("circle")
    .filter(d => typeof d === "object")
    .transition()
    .duration(800)
    .attr("cx", d => newXScale(d[scene.xField]));

    annotationGroup
  .selectAll("*")
  .remove();

annotationGroup
  .append("rect")
  .attr("x", 15)
  .attr("y", 5)
  .attr("width", 310)
  .attr("height", 82)
  .attr("rx", 6)
  .attr("fill", "white")
  .attr("stroke", "#9fb3c8");

annotationGroup
  .append("text")
  .attr("x", 30)
  .attr("y", 30)
  .attr("font-size", 14)
  .attr("font-weight", "bold")
  .text("Key observation");

const annotationText = annotationGroup
  .append("text")
  .attr("x", 30)
  .attr("y", 52)
  .attr("font-size", 13)
  .text(scene.annotation);

wrapText(annotationText, 280);
}



nextButton.on("click", function() {
  if (currentScene < scenes.length - 1) {
    currentScene++;
    updateScene();
  }
});

previousButton.on("click", function() {
  if (currentScene > 0) {
    currentScene--;
    updateScene();
  }
});

updateScene();

});
*/

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
    title: "Scene 1: Prosperity and Height",
    xField: "gdp_per_capita_2023",
    xLabel: "GDP per capita, 2023",
    description:
      "Wealthier countries generally tend to have taller populations.",
    annotation:
      "Higher-income countries tend to cluster at greater average heights."
  },
  {
    title: "Scene 2: Protein Supply and Height",
    xField: "protein_g_day_2023",
    xLabel: "Daily protein supply, 2023 (grams per person)",
    description:
      "Countries with greater protein availability also tend to have taller populations.",
    annotation:
      "Protein availability shows a strong upward relationship with average height."
  },
  {
    title: "Scene 3: Meat Supply and Height",
    xField: "meat_kg_year_2023",
    xLabel: "Meat supply, 2023 (kg per person per year)",
    description:
      "Meat availability follows a similar pattern, but it is not the only factor connected to height.",
    annotation:
      "Meat supply follows the same broad pattern, but the relationship is less exact."
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

svg
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data/height_nutrition_2023.csv").then(data => {
  data.forEach(d => {
    d.height_cm = +d.height_cm;
    d.gdp_per_capita_2023 = +d.gdp_per_capita_2023;
    d.protein_g_day_2023 = +d.protein_g_day_2023;
    d.meat_kg_year_2023 = +d.meat_kg_year_2023;
    d.population_2023 = +d.population_2023;
  });

  const initialXScale = d3.scaleLog()
    .domain([
      d3.min(data, d => d.gdp_per_capita_2023),
      d3.max(data, d => d.gdp_per_capita_2023)
    ])
    .range([0, innerWidth])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.height_cm) - 1,
      d3.max(data, d => d.height_cm) + 1
    ])
    .range([innerHeight, 0]);

  const radiusScale = d3.scaleSqrt()
    .domain([
      d3.min(data, d => d.population_2023),
      d3.max(data, d => d.population_2023)
    ])
    .range([4, 28]);

  const colorScale = d3.scaleOrdinal()
    .domain([
      "Africa",
      "Asia",
      "Europe",
      "North America",
      "South America",
      "Oceania"
    ])
    .range(d3.schemeTableau10);

  const tooltip = d3.select("#tooltip");

  const sceneTitle = chartGroup
    .append("text")
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
    .append("circle")
    .attr("class", "country-bubble")
    .attr("cx", d => initialXScale(d.gdp_per_capita_2023))
    .attr("cy", d => yScale(d.height_cm))
    .attr("r", d => radiusScale(d.population_2023))
    .attr("fill", d => colorScale(d.region))
    .attr("fill-opacity", 0.65)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "#1f2933")
        .attr("stroke-width", 2)
        .attr("fill-opacity", 0.9);

      const scene = scenes[currentScene];

      let xValueText;

      if (scene.xField === "gdp_per_capita_2023") {
        xValueText =
          `GDP per capita: $${d.gdp_per_capita_2023.toLocaleString()}`;
      } else if (scene.xField === "protein_g_day_2023") {
        xValueText =
          `Protein supply: ${d.protein_g_day_2023.toFixed(1)} g/day`;
      } else {
        xValueText =
          `Meat supply: ${d.meat_kg_year_2023.toFixed(1)} kg/year`;
      }

      tooltip
        .style("display", "block")
        .html(`
          <strong>${d.country}</strong><br>
          Region: ${d.region}<br>
          Height: ${d.height_cm.toFixed(1)} cm<br>
          ${xValueText}<br>
          Population: ${d.population_2023.toLocaleString()}
        `);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("fill-opacity", 0.65);

      tooltip.style("display", "none");
    });

  const legendData = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania"
  ];

  const legend = chartGroup
    .append("g")
    .attr("transform", `translate(${innerWidth + 25}, 10)`);

  legend
    .selectAll("circle")
    .data(legendData)
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", (d, i) => i * 24)
    .attr("r", 6)
    .attr("fill", d => colorScale(d));

  legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 14)
    .attr("y", (d, i) => i * 24 + 5)
    .attr("font-size", 13)
    .text(d => d);

  const xAxisGroup = chartGroup
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(initialXScale).ticks(8, "~s"));

  chartGroup
    .append("g")
    .call(d3.axisLeft(yScale));

  const xAxisLabel = chartGroup
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 55)
    .attr("text-anchor", "middle")
    .attr("font-size", 16)
    .text(scenes[currentScene].xLabel);

  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -55)
    .attr("text-anchor", "middle")
    .attr("font-size", 16)
    .text("Average male height (cm)");

  function wrapText(textSelection, width) {
    textSelection.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();

      let word;
      let line = [];
      let lineNumber = 0;

      const lineHeight = 1.2;
      const x = text.attr("x");
      const y = text.attr("y");

      text.text(null);

      let tspan = text
        .append("tspan")
        .attr("x", x)
        .attr("y", y);

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));

        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));

          line = [word];
          lineNumber++;

          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", `${lineNumber * lineHeight}em`)
            .text(word);
        }
      }
    });
  }

  function updateScene() {
    const scene = scenes[currentScene];

    sceneIndicator.text(`Scene ${currentScene + 1} of ${scenes.length}`);
    sceneDescription.text(scene.description);

    previousButton.property("disabled", currentScene === 0);
    nextButton.property("disabled", currentScene === scenes.length - 1);

    sceneTitle.text(scene.title);

    let newXScale;

    if (scene.xField === "gdp_per_capita_2023") {
      newXScale = d3.scaleLog()
        .domain([
          d3.min(data, d => d[scene.xField]),
          d3.max(data, d => d[scene.xField])
        ])
        .range([0, innerWidth])
        .nice();
    } else {
      newXScale = d3.scaleLinear()
        .domain([
          0,
          d3.max(data, d => d[scene.xField]) * 1.05
        ])
        .range([0, innerWidth])
        .nice();
    }

    xAxisGroup
      .transition()
      .duration(800)
      .call(
        scene.xField === "gdp_per_capita_2023"
          ? d3.axisBottom(newXScale).ticks(8, "~s")
          : d3.axisBottom(newXScale)
      );

    xAxisLabel.text(scene.xLabel);

    bubbles
      .transition()
      .duration(800)
      .attr("cx", d => newXScale(d[scene.xField]));

    annotationGroup
      .selectAll("*")
      .remove();

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
      currentScene++;
      updateScene();
    }
  });

  previousButton.on("click", function() {
    if (currentScene > 0) {
      currentScene--;
      updateScene();
    }
  });

  updateScene();
});