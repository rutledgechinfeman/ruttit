function WorkspaceCtrl($scope, $rootScope) {
    $scope.ctor = function() {
      $scope.showcomments = false;
    };

    $scope.toggleComments = function(toggle) {
        $scope.showcomments = toggle != null ? toggle : !$scope.showcomments;
        $scope.$apply();
    };

    $scope.$on('load', function($event, thing) {
        $scope.toggleComments(false);
    });

    $scope.$on('toggleComments', function($event, toggle) {
        $scope.toggleComments(toggle);
    });

    $scope.ctor();
}

function ContentFrameCtrl($scope, $rootScope) {
    $scope.ctor = function() {
        $scope.src = "splash.html";
        $scope.sandbox = false;
        $scope.thing = null;
    };

    $scope.$on('load', function($event, thing) {
      $scope.thing = thing;
      sendTo($scope, document.getElementById('content-frame'), thing.url, !isJsAllowed(thing.url));
    });

    $scope.$on('refresh', function($event) {
      sendTo($scope, document.getElementById('content-frame'), $scope.thing.url, !isJsAllowed($scope.thing.url));
    });

    $scope.$on('togglejs', function($event) {
      var frame = document.getElementById('content-frame');
      sendTo($scope, frame, $scope.thing.url, !frame.hasAttribute('sandbox'));
    });

    $scope.ctor();
}

function CommentFrameCtrl($scope, $rootScope) {
    $scope.ctor = function() {
        $scope.src = "http://www.reddit.com/r/ruttit";
        $scope.sandbox = false;
        $scope.thing = null;
    };

    $scope.$on('load', function($event, thing) {
      $scope.thing = thing;
      sendTo($scope, document.getElementById('comment-frame'), 
        getUrl(thing), false);
    });

    $scope.$on('refresh', function($event) {
      sendTo($scope, document.getElementById('comment-frame'), 
        getUrl($scope.thing), false);
    });

    function getUrl(thing) {
      return "http://www.reddit.com/" + thing.permalink;
    }

    $scope.ctor();
}

/*
 * Send an iframe to a loading interstitial and then to the desired url. This
 * way the frame isn't stuck on the previous page while the next one loads
 * (which is confusing to the user).
 *
 * TODO: Make this more angularized--don't access the dom directly
 */
function sendTo($scope, frame, url, sandbox) {
  frame.removeAttribute('sandbox');
  $scope.src = '../html/loading.html';
  frame.onload = function() {
    // Avoid infinite loop
    frame.onload = null;
    if (sandbox) {
      frame.setAttribute('sandbox');
    }
    $scope.src = url;
    $scope.$apply();
  };
  $scope.$apply();
}
