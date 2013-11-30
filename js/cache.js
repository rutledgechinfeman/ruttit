function CacheCtrl($scope) {
    $scope.url = "";

    $scope.$on('cache', function($event, thing) {
        $scope.url = thing.url;
        console.log("Caching thing [" + thing.title + " | " + thing.url + "]");
    })
}
