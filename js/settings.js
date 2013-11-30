var defaultSettings = {
    'likeslogin':     'true',
    'showscores':     'false',
    'subreddit':      '',
    'modhash':        '',
    'listthumbnail':  'false',
    'allowjs':        'false',
    'hidensfw':       'false',
    'jswhitelist':    '.*reddit\\.com.*\n' +
                      '.*youtube\\.com.*\n' +
                      '.*youtu\\.be.*\n' +
                      '.*google\\.com.*\n'
};

function getSetting(name) {
    return localStorage[name] == null ? defaultSettings[name] : localStorage[name];
}


// Check if this URL links to an image file, eg. asdf.com/jkl.jpg?a=b?c=d
function isImageUrl(url) {
  var regex = new RegExp("(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*\\.(?:jpg|jpeg|gif|png))(?:\\?([^#]*))?(?:#(.*))?", 'i');
  var m = regex.exec(url);
  if (m) {
    return true;
  }
  return false;
}

function isJsAllowed(url) {
  if (getSetting('allowjs') == 'true' ||
      isImageUrl(url) ||
      url == chrome.extension.getURL('../html/options.html')) {
   return true;
  }

  if (getSetting('jswhitelist') != null) {
    var regexes = getSetting('jswhitelist').split('\n');
    for (var i = 0; i < regexes.length; ++ i) {
      if (regexes[i].length == 0) {
        continue;
      }
      var re = new RegExp(regexes[i]);
      var m = re.exec(url);
      if (m != null && m.index == 0) {
        return true;
      }
    }
  }
  return false;
}

function SettingsCtrl($scope, $rootScope) {
  $scope.kbShortcuts = [
    createShortcut(
        'k',
        'icon-step-backward',
        'Go up one listing',
        'thingup'),
    createShortcut(
        'j',
        'icon-step-forward',
        'Go down one listing',
        'thingdown'),
    createShortcut(
        'n',
        'icon-forward',
        'Go to next unread listing',
        'thingnext'),
    createShortcut(
        'a',
        'icon-circle-arrow-up',
        'Upvote',
        'upvotecurrent'),
    createShortcut(
        'z',
        'icon-circle-arrow-down',
        'Downvote',
        'downvotecurrent'),
    createShortcut(
        'g',
        'icon-list-alt',
        'Toggle listing pane',
        'togglethings'),
    createShortcut(
        'i',
        'icon-comment',
        'Toggle comment view',
        'toggleComments'),
    createShortcut(
        'r',
        'icon-refresh',
        'Reload original page',
        'refresh'),
    createShortcut(
        '?',
        'icon-share-alt',
        'Show keyboard shortcuts',
        'showKbShorts'),
    createShortcut(
        '/',
        'icon-share-alt',
        'Focus the subreddit input box',
        'focusSearch')
  ];

  function createShortcut(key, icon, description, callback) {
    return {
      'key': key,
      'icon': icon,
      'description': description,
      'callback': callback
    };
  }

  $scope.ctor = function() {
    angular.forEach($scope.kbShortcuts, function(shortcut) {
      Mousetrap.bind(shortcut.key, function() {
        $rootScope.$broadcast(shortcut.callback);
      });
    });
  };

  $scope.ctor();
}

