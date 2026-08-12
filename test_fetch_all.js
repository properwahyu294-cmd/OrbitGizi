const adminSheetId = "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
["Penerima MBG", "Ibu Hamil", "Ibu Menyusui", "Catatan Timbang", "Sheet1"].forEach(sheet => {
  fetch(`https://docs.google.com/spreadsheets/d/${adminSheetId}/gviz/tq?tqx=out:csv&sheet=${sheet}&headers=1`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  }).then(res => res.text()).then(text => console.log(sheet, 'rows:', text.split('\n').length));
});
