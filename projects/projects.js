import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

let colors = d3.scaleOrdinal(d3.schemeTableau10);
let query = '';
let searchInput = document.querySelector('.searchBar');
let year = '';
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));
  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  let newLegend = d3.select('.legend');
  newLegend.selectAll('li').remove();
  arcs.forEach((arc, i) => {
    svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
      svg
        .selectAll('path')
        .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
        ));
      newLegend
        .selectAll('li')
        .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
        ));
      if (selectedIndex === -1) {
        year = '';
        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
        renderProjects(filteredProjects, projectsContainer, 'h3');
      } else {
        year = newLegend.select('.selected').text().slice(0,5);
        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase()) && project.year == year;
        });
        renderProjects(filteredProjects, projectsContainer, 'h3');
      }
    });
  });
  data.forEach((d, idx) => {
    newLegend
    .append('li')
    .attr('style', `--color:${colors(idx)}`)
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
  });
  svg
    .selectAll('path')
    .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
    ));
  newLegend
    .selectAll('li')
    .attr('class', (_, idx) => (
        idx === selectedIndex ? 'selected' : ''
    ));
}

renderProjects(projects, projectsContainer, 'h3');
renderPieChart(projects);

searchInput.addEventListener('keydown', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    if (project.year == '') {
        return values.includes(query.toLowerCase());
    }
    else {
        return values.includes(query.toLowerCase()) && project.year == year;
    }
  });
  renderProjects(filteredProjects, projectsContainer, 'h3');
  if (query == '') {
    renderPieChart(projects);
  }
  else {
    renderPieChart(filteredProjects);
  }
});