// Define the configuration options for Fuse Search
var summaryInclude = 300;
var fuseOptions = {
  isCaseSensitive: false,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 3,
  shouldSort: true,
  findAllMatches: false,
  keys: [
    {
      "name": "title",
      weight: 0.6
    },
    {
      "name": "contents",
      weight: 0.2
    },
    {
      "name": "tags",
      weight: 0.2
    }
  ],
  location: 0,
  threshold: 0.2,
  distance: 200,
  ignoreFieldNorm: true
};

// Set searchQuery as the value in the Query String for
// the s parameter.
var searchQuery = findGetParameter("s");

// If there is a parameter from the above, execute the search.
if (searchQuery) {
  $("#search-query").append(searchQuery);
  executeSearch(searchQuery);
} else {
  $('#search-results').append("<p>Please enter a word or phrase above</p>");
}

// The Execute Search function loads the index.json file. It reads the data within, and
// passes it to FuseJS.
function executeSearch(searchQuery){
  $.getJSON( "/index.json", function( data ) {
    var fuse = new Fuse(data, fuseOptions);
    var result = fuse.search(searchQuery);

    // If there were results from the search, then display those to the user.
    if(result.length > 0){
      populateResults(result);
    } else {
      // Otherwise, let the user know that there were no matches found.
      $('#search-results').append("<p>No matches found</p>");
    }
  });
}

// This is the function that populates the results, once the 
// search itself has been executed.
function populateResults(result){
  // Loop through all of the results of the
  // search query
  $.each(result, function(key,value) {
    var contents= value.item.contents;

    // Load the #search-result-template file definition from the search layout template
    var templateDefinition = $('#search-result-template').html();

    // Initialise variables for this record's snippet
    var snippet = "";

    if (snippet.length < 1 ) {
      snippet += contents.substring(0, summaryInclude * 2);
    }

    // Build the HTML output using the render function. Pass
    // in the templateDefinition, and an object of the current
    // result in our loop.
    var output = render(templateDefinition,
      {
        key:key,
        snippet:snippet,
        title:value.item.title,
        link:value.item.permalink,
        tags:value.item.tags,
        image:value.item.image,
        section:value.item.section,
        series:value.item.series,
        datePublished:value.item.datePublished,
        people:value.item.people
      });
    $('#search-results').append(output);
  })
}

// The render function effectively calls a set of patternReplacement 
// methods to convert the HTML Template String into a target fragment
// of HTML, which renders the actual results.
function render(templateString, data) {
  templateString = patternReplacementForIsset(data, templateString);
  templateString = patternReplacement(/\$\{\s*people ([a-zA-Z]*) \s*\}(.*)\$\{\s*end people\s*}/g, data, "people", templateString, convertToPeopleOutput);
  templateString = patternReplacement(/\$\{\s*series ([a-zA-Z]*) \s*\}(.*)\$\{\s*end series\s*}/g, data, "series", templateString, convertToSeriesOutput);
  templateString = patternReplacement(/\$\{\s*tags ([a-zA-Z]*) \s*\}(.*)\$\{\s*end tags\s*}/g, data, "tags", templateString, convertToTagsOutput);
  templateString = patternReplacement(/\$\{\s*section ([a-zA-Z]*) \s*\}(.*)\$\{\s*end section\s*}/g, data, "section", templateString, convertToSectionOutput);
  templateString = patternReplacement(/\$\{\s*date ([a-zA-Z]*) \s*\}(.*)\$\{\s*end date\s*}/g, data, "datePublished", templateString, convertToDateOutput);

  // Now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = '\\$\\{\\s*' + key + '\\s*\\}';
    re = new RegExp(find, 'g');
    templateString = templateString.replace(re, data[key]);
  }

  return templateString;
}

function patternReplacementForIsset(data, templateString) {
  var matches;
  var tmp = templateString;
  var pattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end isset\s*}/g;
  while ((matches = pattern.exec(templateString)) !== null) {
    if (data[matches[1]]) {
      // If the data matches, then there is a valid key. That means
      // we want to leave the contents within the isset brackets.
      tmp = tmp.replace(matches[0],matches[2]);
    } else {
      // If not, it's not valid - so we want to leave the contents
      // empty (i.e. replicating that isset returned false)
      tmp = tmp.replace(matches[0],'');
    }
  }
  return tmp;
}

function patternReplacement(pattern, data, property, templateString, outputFormat) {
  var matches;
  var tmp = templateString;
  while ((matches = pattern.exec(templateString)) !== null) {
    if (outputFormat){
      tmp = tmp.replace(matches[0], outputFormat(data[property]));
    } else {
      tmp = tmp.replace(matches[0], data[property]);
    }
  }
  return tmp;
}

function convertToPeopleOutput(arrayOfPeople) {
  var htmlOutput = "";
  if (arrayOfPeople.length > 0) {
    arrayOfPeople.forEach(
      person => {
        htmlOutput = htmlOutput + '<a href="'+ person.url +'"><img src="' + person.image + '" width="50" class="rounded-circle z-depth-2 person-image" alt="' + person.person +'" title="'+ person.person +'" /></a> '
      }
    )
  }
  return htmlOutput;
}

function convertToSectionOutput(section) {
  return '<span class="badge bg-warning text-dark">' + jsUcFirst(section) + '</span></a>';
}

function jsUcFirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertToDateOutput(date) {
  var now = new Date();
  var publishedDate = new Date(Date.parse(date));
  if (publishedDate < now){
    return "<small class=\"text-muted\">Published on "+ publishedDate.toDateString() +"</small>";
  } else {      
    return "<small class=\"text-muted\">Scheduled for "+ publishedDate.toDateString() +"</small>";
  }
}

function convertToSeriesOutput(arrayOfSeries) {
  var seriesOutput = "";
  if (arrayOfSeries && arrayOfSeries.length > 0) {
    arrayOfSeries.forEach(series => {
      seriesOutput = seriesOutput + '<a href="/series/'+ convertToUrl(series) +'"><span class="badge bg-secondary">' + series + '</span></a> '
    });
    return seriesOutput;
  }
}

function convertToTagsOutput(arrayOfTags){
  var tagsOutput = "";
  if (arrayOfTags && arrayOfTags.length > 0) {
    arrayOfTags.forEach(tag => {
      tagsOutput = tagsOutput + '<a href="/tags/'+ convertToUrl(tag) +'"><span class="badge bg-info text-dark">' + tag + '</span></a> '
    });
    return tagsOutput;
  }
}

function convertToUrl(text){
  return text.replace(/ /g, '-').replace(/[,]/g,"").toLowerCase();
}

// The findGetParameter method finds the value associated
// with a given parameter in the URL.
function findGetParameter(parameterName) {
  var result = null,
      tmp = [];
  location.search
      .substr(1)
      .split("&")
      .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
      });
  return result;
}