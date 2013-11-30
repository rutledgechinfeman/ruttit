var listingLimit = 50;

function fetchThings(after, callback, onerror) {
    var address = 'http://www.reddit.com/' + getSetting('subreddit') + '.json' + '?limit=' + listingLimit;
    if (after) {
        // t3 stands for "link"
        address = address + '&after=t3_' + after;
    }

    $.get(address)
        .done(function(data, textStatus, jqXHR) {
            callback(data);
        })
        .fail(onerror);
}

function amILoggedIn(callback) {
    $.get('http://www.reddit.com/api/me.json', function(data) {
            if (data.data != null) {
                localStorage['modhash'] = data.data.modhash;
                callback(data.data.name);
            } else {
                callback(null);
            }
        });
}

function login(user, pass, callback, error) {
  var postdata = {
    'user': user,
    'passwd': pass,
    'rem': true,
    'api_type': 'json'
  };
  $.post('https://ssl.reddit.com/api/login/', postdata,
      function(data) {
        if (data.json.errors.length == 0) {
          callback(data.json.data.modhash);
        } else {
          error(null, data.json.errors[0][1], null);
        }
      }).fail(error);
}

function logout() {
    $.post('http://www.reddit.com/logout',
            { 'uh': getSetting('modhash'),
              'top': 'off' },
              function() {
                localStorage.likeslogin = 'false';
                  window.location.reload();
              });
}

function vote(id, dir, callback) {
  var postdata = {
    'id': 't3_' + id,
    'dir': dir,
    'uh': getSetting('modhash')
  };
  $.post('http://www.reddit.com/api/vote', postdata,
      function(data) {
        var err = false;
        for (var i in data) {
          if (data.hasOwnProperty(i)) {
            err = true;
            break;
          }
        }
        callback(err);
      });
}

function submitPost(isLink, title, subreddit, data, callback, onerror) {
    var postdata = {
      'title': title,
      'sr': subreddit,
      'r': subreddit,
      'uh': getSetting('modhash'),
      'kind': isLink ? 'link' : 'self'
    };
    if (isLink) {
      postdata.url = data;
    } else {
      postdata.text = data;
    }

    $.post('http://www.reddit.com/api/submit', postdata, function(data) {
            var len = data.jquery.length;
            if (data.jquery[len - 1][3].length == 0) {
                // Error condition
                onerror(null, data.jquery[len - 3][3][0], null);
            } else {
                if (postdata.kind == 'link') {
                    callback({ 'content': data.jquery[12][3][1],
                               'comment': data.jquery[16][3][0]});
                } else {
                    callback({ 'content': data.jquery[10][3][0],
                               'comment': data.jquery[10][3][0]});
                }
            }
        })
        .fail(onerror);
}
