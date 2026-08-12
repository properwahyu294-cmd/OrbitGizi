const adminSheetId = "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/export?format=csv&id=${adminSheetId}&gid=1432247738`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
}).then(res => res.text()).then(text => console.log('export rows:', text.split('\n').length, text.substring(0, 100)));
