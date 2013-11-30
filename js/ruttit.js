/**
 * Find out where a node is rendered in a page. Courtesy of StackOverflow...
 * @param el
 * @return {Object}
 */
function getPos(el) {
    for (var lx = 0, ly = 0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x:lx, y:ly};
}

/**
 * Custom directives
 */
angular.module('ruttit', [])
    .directive('whenScrolled', function () {
        return function (scope, elem, attr) {
            var raw = elem[0];

            elem.bind('scroll', function () {
                if (raw.clientHeight + raw.scrollTop + 300 > raw.scrollHeight) {
                    scope.$apply(attr.whenScrolled);
                }
            });
        };
    });

$(document).ready(function() {
    $('#login').on('shown', function() {
        localStorage.likeslogin = 'true';
        $('#loginusername').focus();
    });
    $('#post').on('shown', function() {
        $('#posttitle').focus();
    });
});

/**
 * Top level controller
 */
function RuttitCtrl($scope, $rootScope) {
    $scope.ctor = function () {
        $scope.loggedin = false;
        $scope.incognito = false;
        $scope.username = '';
        $scope.subreddit = getSetting('subreddit');

        chrome.tabs.getSelected(null, function(tab) {
            $scope.incognito = tab.incognito;
        });

        amILoggedIn(function(name) {
            if (name != null) {
                $scope.loggedin = true;
                $scope.username = name;
            }
            else {
                chrome.tabs.getSelected(null, function(tab) {
                    if (getSetting('likeslogin') != 'false' && !tab.incognito) {
                        $('#login').modal('show');
                    }
                });
            }
        });
    };

    $scope.srSubmit = function() {
      var val = $scope.subreddit;
      if (val == 'r/') {
          val = '';
      }
      if (val && val.length != 0 && val.indexOf('r/') != 0) {
        val = 'r/' + val;
      }
      localStorage.subreddit = val;
      window.location.reload();
    };

    $scope.logout = function() {
        logout();
    };

    $scope.menuAction = function(type) {
        switch (type) {
            case 'logout':
                $scope.logout();
                break;
            case 'upvote':
                $rootScope.$broadcast('upvotecurrent');
                break;
            case 'downvote':
                $rootScope.$broadcast('downvotecurrent');
                break;
            case 'togglejs':
                $rootScope.$broadcast('togglejs');
                break;
            case 'refresh':
                $rootScope.$broadcast('refresh');
                break;
            case 'bookmark':
                $rootScope.$broadcast('bookmarkcurrent');
                break;
            case 'togglethings':
                $rootScope.$broadcast('togglethings');
                break;
            case 'loadOptions':
              $rootScope.$broadcast('toggleComments', false);
            default:
                break;
        }
    };

    $scope.$on('showKbShorts', function($event) {
        $('#kbshort').modal('toggle');
    });

    $scope.$on('focusSearch', function($event) {
      var input = $('#srinput');
      input.val('r');
      input.focus();
    });

    $scope.ctor();
}

function LoginCtrl($scope) {
    $scope.ctor = function() {
        $scope.username = '';
        $scope.password = '';
        $scope.submitting = false;
        $scope.error = '';
    };

    $scope.lurk = function() {
        localStorage.likeslogin = 'false';
    };

    $scope.submit = function() {
        if ($scope.username.length == 0 || $scope.password.length == 0) {
            $scope.error = "you can do better than that!";
            return false;
        }

        $scope.error = '';
        $scope.submitting = true;
        login($scope.username, $scope.password, postResult, postError);
        return false;
    };

    function postResult(result) {
      localStorage['modhash'] = result;
      window.location.reload();
    }

    function postError(jqxhr, textStatus, errorThrown) {
      $scope.error = '' + textStatus;
      if (errorThrown && errorThrown.length) {
        $scope.error += ' - ' + errorThrown;
      }
      if (!$scope.error.length) {
        $scope.error = 'boo! no message';
      }
      $scope.submitting = false;
      $scope.$apply();
    }

    $scope.ctor();
}

function PostCtrl($scope, $rootScope) {
    $scope.ctor = function() {
        $scope.title = '';
        $scope.subreddit = '';
        $scope.url = '';
        $scope.text = '';
        $scope.isLink = true;
        $scope.submitting = false;
        $scope.error = '';
    };

    $scope.setIsLink = function(val) {
      $scope.isLink = val;
    };

    $scope.submit = function() {
      if ($scope.title.length == 0 || $scope.subreddit.length == 0 ||
          ($scope.isLink && $scope.url.length == 0)) {
        $scope.error = "you can do better than that!";
        return false;
      }

      $scope.error = '';
      $scope.submitting = true;
      submitPost($scope.isLink, $scope.title, $scope.subreddit,
          $scope.isLink ? $scope.url : $scope.text, postResults,
          postError);
      return false;
    };

    function postResults(results) {
      $rootScope.$broadcast('load', {
        'url': results.content,
        'permalink': results.comment
      });
      $scope.submitting = false;
      $scope.$apply();
      $('#post').hide();
    }

    function postError(jqxhr, textStatus, errorThrown) {
      $scope.error = '' + textStatus;
      if (errorThrown && errorThrown.length) {
        $scope.error += ' - ' + errorThrown;
      }
      if (!$scope.error.length) {
        $scope.error = 'boo! no message';
      }
      $scope.submitting = false;
      $scope.$apply();
    }

    $scope.ctor();
}