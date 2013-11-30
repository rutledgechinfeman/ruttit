$('#download').click(function(event) {
  window.open('ruttit.crx');
});
var confused = false;
$('#confused').click(function(event) {
  window.open('img/instr.png');
});
$('#extensions').tooltip({
  title: 'For security reasons, you have to copy-paste this into the URL bar.',
  placement: 'bottom'
});

