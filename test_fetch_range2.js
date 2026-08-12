const adminSheetId = "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=Penerima%20MBG&headers=1&range=A28:Z100`, {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(res => res.text()).then(text => console.log('rows:', text.split('\n').length, text.substring(0, 100)));
