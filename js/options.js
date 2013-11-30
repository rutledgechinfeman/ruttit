var settings = {
    'listthumbnail':  'check',
    'showscores':     'check',
    'allowjs':        'check',
    'hidensfw':       'check',
    'jswhitelist':    'input'
};

function restoreAll() {
  for (var setting in settings) {
    if (settings[setting] == 'input') {
      document.getElementById(setting).value = getSetting(setting);
    } else {
      document.getElementById(setting).checked = getSetting(setting) == 'true';
    }
  }
}

function saveAll() {
  for (var setting in settings) {
    if (settings[setting] == 'input') {
      localStorage[setting] = document.getElementById(setting).value;
    } else {
      localStorage[setting] = document.getElementById(setting).checked;
    }
  }
}

$('#submit').click(function() {
  saveAll();
  return false;
});

$('input').change(function() {
  saveAll();
});

restoreAll();
