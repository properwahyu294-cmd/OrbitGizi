const adminSheetId = "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1&headers=1`, {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(res => res.text()).then(text => console.log(text.substring(0, 500)));
