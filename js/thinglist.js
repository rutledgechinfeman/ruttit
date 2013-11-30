/**
 * Logic controller for the scrollable listing pane.
 */
function ThinglistCtrl($scope, $rootScope) {
    /**
     * Constructor
     */
    $scope.ctor = function() {
        $scope.thinglist = [];
        $scope.urlmap = {};
        $scope.loading = false;
        $scope.current = null;
        $scope.alert = false;
        $scope.filters = [];
        $scope.initFilters();
        $scope.hidden = false;
        $scope.filternsfw = getSetting('hidensfw');
        $scope.icons = getSetting('listthumbnail');
        $scope.scores = getSetting('showscores');

        // Fetch the initial thinglist
        $scope.load();
    };

    /**
     * Set the current thing in the thinglist
     */
    $scope.setCurrent = function(thing) {
        if ($scope.current) {
            $scope.current.active = false;
        }

        thing.active = true;
        $scope.current = thing;
        $scope.$apply();
    };

    /**
     * Return the current thing in the thinglist
     */
    $scope.getCurrent = function() {
        return $scope.current;
    };

    /**
     * Return the thing before the current thing in the thinglist
     */
    $scope.getPrevious = function () {
        if ($scope.current == null || $scope.current.idx == 0) {
            return null;
        }
        return $scope.thinglist[$scope.current.idx - 1];
    };

    /**
     * Return the thing after the current thing in the thinglist
     */
    $scope.getNext = function() {
        if ($scope.current == null) {
            return $scope.thinglist[0];
        }
        var idx = $scope.current.idx + 1;
        return idx < $scope.thinglist.length ? $scope.thinglist[idx] : null;
    };

    /**
     * Return the next unread item in the thinglist
     *
     * TODO: this sucks
     * TODO: the interface to this function sucks
     * TODO: the implementation of this function sucks
     */
    $scope.getNextUnread = function(start, callback) {
        // First time around
        if (start == null) {
            start = $scope.current == null ? 0 : $scope.current.idx + 1;
        }

        // We got to the end--if it's disallowed, roll back to the last good one
        if (start >= $scope.thinglist.length - 1) {
            var candidate = $scope.thinglist.length - 1;
            if ($scope.filternsfw == 'true') {
                var thing = $scope.thinglist[candidate];
                while (thing && thing.over_18) {
                    candidate --;
                    thing = $scope.thinglist[candidate];
                }
            }
            var thing = candidate < 0 ? null : $scope.thinglist[candidate];
            callback(thing);
            return;
        }

        // Check current and recur
        var current = $scope.thinglist[start];
        chrome.history.getVisits({'url': current.url}, function (visitItems) {
            if (visitItems && visitItems.length > 0) {
                $scope.getNextUnread(start + 1, callback);
            } else {
                // Don't return disallowed pages
                if ($scope.filternsfw == 'true' && current.over_18) {
                    $scope.getNextUnread(start + 1, callback);
                } else{
                    callback($scope.thinglist[start]);
                }
            }
        });
    };

    /**
     * Called by the user to retry loading if it failed previously
     */
    $scope.retryLoad = function() {
        $scope.loading = false;
        $scope.alert = false;
        $scope.load();
    };

    /**
     * Fetch more listings from the reddit servers.
     */
    $scope.load = function () {
        if ($scope.loading || $scope.alert) {
            console.log("Ignoring listing fetch request because not ready.");
            return;
        }
        $scope.loading = true;

        var tl = $scope.thinglist;
        var length = tl.length;
        var last = length ? tl[length - 1].id : null;
        fetchThings(last, function (data) {
            $scope.loading = false;

            angular.forEach(data.data.children, function (thing) {
                thing = thing.data;

                /* Add in any extra ruttit metadata */
                thing.active = false;
                thing.idx = $scope.thinglist.length;

                /* Filter/fixup things as they come in */
                thing = $scope.filter(thing);
                if (thing != null) {
                    $scope.append(thing);
                }
            });

            $scope.$apply();
            if (length == tl.length) {
                $scope.loadError(null, "No more listings!", null);
            }
        }, $scope.loadError);
    };

    /**
     * What happens when fetching fails
     */
    $scope.loadError = function(jqxhr, textStatus, errorThrown) {
        $scope.alert = true;
        $scope.loading = false;

        if (errorThrown != null && errorThrown.length > 0) {
            $scope.alertmsg = textStatus + ': ' + errorThrown;
        } else {
            $scope.alertmsg = textStatus;
        }
        $scope.$apply();
    };

    /**
     * Filter/fixup a thing listing
     */
    $scope.filter = function(thing) {
        angular.forEach($scope.filters, function(filter) {
            thing = filter(thing);
        });
        return thing;
    };

    /**
     * Add an item to the thinglist
     */
    $scope.append = function(thing) {
        $scope.thinglist.push(thing);
        $scope.urlmap[thing.url] = thing;
    };

    /**
     * Navigate to the given thing and set it as current
     */
    $scope.activate = function($event, thing) {
        /* Override the anchor tag's desire to load into the iframe */
        if ($event) {
            $event.preventDefault();
        }

        /* Don't respond to a click on the active listing */
        if (thing == null || thing.active) {
            return;
        }

        /* Write this visit to the history books */
        chrome.tabs.getSelected(null, function(tab) {
            if (!tab.incognito) {
                chrome.history.addUrl({'url': thing.url});
            }
        });

        /* Activate this listing and deactivate the current one */
        $scope.setCurrent(thing);

        /* Make sure the listing is showing */
        $('.active-true').get(0).scrollIntoViewIfNeeded();

        /* Signal the workspace to load this listing */
        $rootScope.$broadcast('load', thing);

        /* Signal the cache to update the next thing */
        $scope.getNextUnread(null, function(thing) {
            $rootScope.$broadcast('cache', thing);
        });
    };

    /**
     * A stupid hack to place the tooltip when you hover over a listing.
     */
    $scope.hovered = function($event, hovered) {
        var hovered = $event.currentTarget;
        var details = hovered.getElementsByClassName('details')[0];

        var pos = getPos(hovered);
        pos.x += hovered.offsetWidth - 15;
        pos.y += hovered.offsetHeight / 2 - $('#thinglist').scrollTop();

        var overflow = pos.y + details.offsetHeight - window.innerHeight;
        if (overflow > 0) {
            pos.y -= overflow;
        }

        details.style.setProperty('left', pos.x + 'px');
        details.style.setProperty('top', pos.y + 'px');
    };

    $scope.toggle = function(toggle) {
        $scope.hidden = toggle != null ? toggle : !$scope.hidden;
        $scope.$apply();
    };

    /**
     * Add filters to manipulate incoming posts from reddit
     */
    $scope.initFilters = function() {
        // Skip items we already have
        $scope.filters.push(function(thing) {
            if (thing == null || $scope.urlmap[thing.url] != null) {
                return null;
            }
            return thing;
        });

        // Remove broken thumbnails
        $scope.filters.push(function(thing) {
            if (thing == null) {
                return null;
            }
            if ($.inArray(thing.thumbnail, ['nsfw', 'default', 'self']) >= 0) {
                thing.thumbnail = null;
            }
            return thing;
        });

        // Fix-up YouTube URLs to embed properly
        $scope.filters.push(function(thing) {
            if (thing == null) {
                return null;
            }
            if (thing.domain == "youtube.com" || thing.domain == "youtu.be") {
                var re = thing.domain == "youtube.com" ?
                    { 'exp' : /v=[-a-zA-Z0-9_]+/     , 'len' : 2 } :
                    { 'exp' : /\.be\/[-a-zA-Z0-9_]+/ , 'len' : 4 };

                var idmatch = re.exp.exec(thing.url);
                if (idmatch) {
                    thing.url = "http://www.youtube.com/embed/" +
                        idmatch.toString().substring(re.len) +
                        "?wmode=transparent";
                }
            }
            return thing;
        });
    };

    $scope.detailClicked = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      window.open($event.currentTarget.href);
    };

    $scope.$on('thingdown', function($event) {
        $scope.activate(null, $scope.getNext());
    });

    $scope.$on('thingup', function($event) {
        $scope.activate(null, $scope.getPrevious());
    });

    $scope.$on('thingnext', function($event) {
        var thing = $scope.getNextUnread(null, function(thing) {
            $scope.activate(null, thing);
        });
    });

    $scope.$on('togglethings', function($event) {
        $scope.toggle(null);
    });

    $scope.$on('upvotecurrent', function($event) {
        var thing = $scope.current;
        if (thing != null) {
            vote(thing.id, 1, function(err) {
                if (err) {
                    /* TODO: make alerts more versatile */
                    alert('VOTE FAILED! sry');
                } else {
                    thing.likes = true;
                    $scope.$apply();
                }
            });
        }
    });

    $scope.$on('downvotecurrent', function($event) {
        var thing = $scope.current;
        if (thing != null) {
            vote(thing.id, -1, function(err) {
                if (err) {
                    /* TODO: make alerts more versatile */
                    alert('VOTE FAILED! sry');
                } else {
                    thing.likes = false;
                    $scope.$apply();
                }
            });
        }
    });

    $(window).on('storage', function($event) {
        $scope.icons = getSetting('listthumbnail');
        $scope.filternsfw = getSetting('hidensfw');
        $scope.scores = getSetting('showscores');
        $scope.$apply();
    });

    $scope.$on('bookmarkcurrent', function($event) {
        bookmark($scope.current);
    });

function findBookmark(name, callback) {
    chrome.bookmarks.getTree(function(nodes) {
        var q = nodes;
        while (q.length > 0) {
            cur = q[0];
            if (cur.title == name) {
                callback(cur.id);
                return;
            }

            for (var i = 0; cur.children != null && i < cur.children.length; ++ i) {
                q.push(cur.children[i]);
            }

            q.shift();
        }

        callback(null);
    });
}

function bookmark(thing) {
    if (thing == null) {
        return;
    }

    // Find the Ruttit Bookmarks folder
    findBookmark('Ruttit Bookmarks', function(id) {
        var mark = { 'title': thing.title, 'url': thing.url };
        // If it exists, add the bookmark to it
        if (id != null) {
            mark.parentId = id;
            chrome.bookmarks.create(mark);
        } else { // If it doesn't exist, create it, then add the bookmark to it
            chrome.bookmarks.create( {'parentId': '1', 'title': 'Ruttit Bookmarks'},
                function(folder) {
                    mark.parentId = folder.id;
                    chrome.bookmarks.create(mark);
                });
        }
    });
}

    $scope.ctor();
}
