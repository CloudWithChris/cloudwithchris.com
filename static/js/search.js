summaryInclude=300;
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

var searchQuery = param("s");
if(searchQuery){
  $("#search-query").val(searchQuery);
  executeSearch(searchQuery);
}else {
  $('#search-results').append("<p>Please enter a word or phrase above</p>");
}

function executeSearch(searchQuery){
  $.getJSON( "/index.json", function( data ) {
    var pages = data;
    var fuse = new Fuse(pages, fuseOptions);
    console.log(fuse);
    var result = fuse.search(searchQuery);
    console.log({"matches":result});
    if(result.length > 0){
      populateResults(result);
    }else{
      $('#search-results').append("<p>No matches found</p>");
    }
  });
}

function populateResults(result){
  $.each(result,function(key,value){
    var contents= value.item.contents;
    var snippet = "";
    var snippetHighlights=[];
    var tags =[];
    if( fuseOptions.tokenize ){
      snippetHighlights.push(searchQuery);
    }else{
      $.each(value.matches,function(matchKey,mvalue){
        if(mvalue.key == "tags" || mvalue.key == "categories" ){
          snippetHighlights.push(mvalue.value);
        }else if(mvalue.key == "contents"){
          start = mvalue.indices[0][0]-summaryInclude>0?mvalue.indices[0][0]-summaryInclude:0;
          end = mvalue.indices[0][1]+summaryInclude<contents.length?mvalue.indices[0][1]+summaryInclude:contents.length;
          snippet += contents.substring(start,end);
          snippetHighlights.push(mvalue.value.substring(mvalue.indices[0][0],mvalue.indices[0][1]-mvalue.indices[0][0]+1));
        }
      });
    }

    if(snippet.length<1){
      snippet += contents.substring(0,summaryInclude*2);
    }
    //pull template from hugo templarte definition
    var templateDefinition = $('#search-result-template').html();
    //replace values
    var output = render(templateDefinition,{key:key,title:value.item.title,link:value.item.permalink,tags:value.item.tags,categories:value.item.categories,snippet:snippet, image:value.item.image,section:value.item.section,series:value.item.series,guests:value.item.guests,datePublished:value.item.datePublished,hosts:value.item.hosts});
    $('#search-results').append(output);

    $.each(snippetHighlights,function(snipkey,snipvalue){
      $("#summary-"+key).mark(snipvalue);
    });

  });
}

function param(name) {
    return decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
}

function render(templateString, data) {
  var conditionalMatches;
  var conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end isset\s*}/g;
  var guestMatches;
  var guestPattern = /\$\{\s*guest ([a-zA-Z]*) \s*\}(.*)\$\{\s*end guest\s*}/g;
  var dateMatches;
  var datePattern = /\$\{\s*date ([a-zA-Z]*) \s*\}(.*)\$\{\s*end date\s*}/g;
  var hostMatches;
  var hostPattern = /\$\{\s*host ([a-zA-Z]*) \s*\}(.*)\$\{\s*end host\s*}/g;
  var tagsMatches;
  var tagsPattern = /\$\{\s*tags ([a-zA-Z]*) \s*\}(.*)\$\{\s*end tags\s*}/g;
  var sectionMatches;
  var sectionPattern = /\$\{\s*section ([a-zA-Z]*) \s*\}(.*)\$\{\s*end section\s*}/g;
  var seriesMatches;
  var seriesPattern = /\$\{\s*series ([a-zA-Z]*) \s*\}(.*)\$\{\s*end series\s*}/g;
  var copy;

  //since loop below depends on re.lastInxdex, we use a copy to capture any manipulations whilst inside the loop
  copy = templateString;

  while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
    if(data[conditionalMatches[1]]){
      //valid key, remove conditionals, leave contents.
      copy = copy.replace(conditionalMatches[0],conditionalMatches[2]);
    } else {
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0],'');
    }
  }
  templateString = copy;

  // Next up, replace any tag sections with the appropriate tag items.
  while ((tagsMatches = tagsPattern.exec(templateString)) !== null) {

    copy = copy.replace(tagsMatches[0], convertToTagHtml(data.tags));
  }
  templateString = copy;

  // Next up, replace any tag sections with the appropriate tag items.
  while ((seriesMatches = seriesPattern.exec(templateString)) !== null) {

    copy = copy.replace(seriesMatches[0], convertToSeriesHtml(data.series));
  }
  templateString = copy;

  // Next up, replace any guest sections with the appropriate tag items.
  while ((hostMatches = hostPattern.exec(templateString)) !== null) {
    copy = copy.replace(hostMatches[0], convertToHostsHtml(data.hosts));  
  }
  templateString = copy;
  
  // Next up, replace any guest sections with the appropriate tag items.
  while ((guestMatches = guestPattern.exec(templateString)) !== null) {
    copy = copy.replace(guestMatches[0], convertToGuestsHtml(data.guests));  
  }
  templateString = copy;

  // Next up, replace any guest sections with the appropriate tag items.
  while ((sectionMatches = sectionPattern.exec(templateString)) !== null) {
    copy = copy.replace(sectionMatches[0], convertToSectionHtml(data.section));  
  }
  templateString = copy;

  // Next up, replace any tag sections with the appropriate tag items.
  while ((dateMatches = datePattern.exec(templateString)) !== null) {
    var now = new Date();
    var publishedDate = new Date(Date.parse(data.datePublished));
    if (publishedDate < now){
      copy = copy.replace(dateMatches[0], "<small class=\"text-muted\">Published on "+ publishedDate.toDateString() +"</small>");
    } else {      
      copy = copy.replace(dateMatches[0], "<small class=\"text-muted\">Scheduled for "+ publishedDate.toDateString() +"</small>");
    }
  
  }
  templateString = copy;

  // Now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = '\\$\\{\\s*' + key + '\\s*\\}';
    re = new RegExp(find, 'g');
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}


function convertToGuestsHtml(rawGuests){
  var guestsHTML = '';
  if (rawGuests != null){
    rawGuests.forEach(guest => {
      guestsHTML = guestsHTML + '<a href="/guest/'+ convertToUrl(guest) +'"><img src="/img/guests/'+ guest +'.jpg" width="50" class="rounded-circle z-depth-2" alt="' + guest +'" title="'+ guest +'" /></a> '
    });
    return guestsHTML;
  }
}

function convertToHostsHtml(rawHosts){
  var hostsHTML = '';
  if (rawHosts != null){
    rawHosts.forEach(host => {
      hostsHTML = hostsHTML + '<a href="/host/'+ convertToUrl(host) +'"><img src="/img/hosts/'+ host +'.jpg" width="50" class="rounded-circle z-depth-2" alt="' + host +'" title="'+ host +'" /></a> '
    });
    return hostsHTML;
  }
}

function convertToTagHtml(rawTags){
  var tagsHTML = '';
  if (rawTags != null){
    rawTags.forEach(tag => {
      tagsHTML = tagsHTML + '<a href="/tags/'+ convertToUrl(tag) +'"><span class="badge bg-info text-dark">' + tag + '</span></a> '
    });
    return tagsHTML;
  }
}

function convertToSeriesHtml(rawSeries){
  var seriesHTML = '';
  if (rawSeries != null){
    rawSeries.forEach(tag => {
      seriesHTML = seriesHTML + '<a href="/series/'+ convertToUrl(tag) +'"><span class="badge bg-secondary text-dark">' + tag + '</span></a> '
    });
    return seriesHTML;
  }
}

function convertToSectionHtml(section){
  return '<span class="badge bg-warning text-dark">' + jsUcFirst(section) + '</span></a>';
}

function convertToUrl(text){
  return text.replace(/ /g, '-').replace(/[,]/g,"").toLowerCase();
}

function jsUcFirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
