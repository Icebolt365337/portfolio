import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/Icebolt365337/portfolio/commits/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
        // They already default to False, I think that's what the lab wants?
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
  // Add total commits
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);

  let longest_file = '';
  let longest_file_length = 0;
  let max_depth = 0;

  data.forEach(element => {
    if (element.line > longest_file_length) {
        longest_file = element.file;
        longest_file_length = element.line;
    }
    if (element.depth > max_depth) {
        max_depth = element.depth;
    }
  });

  dl.append('dt').text('Files:');
  dl.append('dd').text(d3.group(data, d => d.file).size);
  
  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>:');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Longest File:');
  dl.append('dd').text(longest_file);

  dl.append('dt').text('Longest File Length:');
  dl.append('dd').text(longest_file_length);

  dl.append('dt').text('Max Depth:');
  dl.append('dd').text(max_depth);
}

let data = await loadData();
let commits = processCommits(data);
console.log(commits)

renderCommitInfo(data, commits);