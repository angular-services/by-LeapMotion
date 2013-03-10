'use strict';

var app = angular.module('calibrateApp', [
    'byLeapMotion',
    'uiLeapMotion'
]);

function BlocksCtrl($scope) {
    $scope.blocks = [];
    for (var i = 0, l = 40; i < l; i++) {
        $scope.blocks.push(Math.random());
    }
}

function WindowPositionCtrl($scope, $timeout) {
    $scope.window = {x:0, y:0};

    $timeout(updateWindowPosition, 100);

    function updateWindowPosition() {
        $scope.window.x = window.screenX;
        $scope.window.y = window.screenY;
        $timeout(updateWindowPosition, 100);
    }
}

function LeapCursorCtrl($scope, LeapMotion) {
    LeapMotion.connect();
    $scope.leap = LeapMotion;
    $scope.cursorStyle = function() {
        var indexFinger = $scope.leap.indexFinger;
        return {
            display: (indexFinger.valid?'':'none'),
            position: 'fixed',
            marginLeft: indexFinger.screenStyledPosition.x,
            marginTop: indexFinger.screenStyledPosition.y
            //left: indexFinger.screenStyledPosition.x,
            //top: indexFinger.screenStyledPosition.y
        };
    }
}

function LeapPositionCtrl($scope, LeapMotion) {
    LeapMotion.connect();

    $scope.disconnect = function() {
        LeapMotion.disconnect();
    }

    $scope.connect = function() {
        LeapMotion.connect();
    }

    $scope.leap = LeapMotion;
}


function DynamicsGraphicCtrl($scope) {
    $scope.dynamics = {
        data : []
        /*data: {
            entries:[]
        }*/
    };

    $scope.filterByDate = function() {
        console.log('$scope.filterByDate', arguments);
    }

    var index = 1000;
    while(--index>=0) {
        $scope.dynamics.data.push(10*Math.random());
        //$scope.dynamics.data.entries.push(10*Math.random());
    }
}

/*

PieChart Directive from http://insight-dashboard.herokuapp.com

    insightDashboardApp.directive("pieChart", function () {
        var a = d3.scale.category20c();
        return{restrict:"E", scope:{data:"=", width:"=", height:"="}, link:function (c, d, e) {
            var f = +c.width || 400, g = +c.height || 400, h = Math.min(f, g) / 2, i = c.data, j = d3.svg.arc().outerRadius(h - 10).innerRadius(0), k = d3.svg.arc().outerRadius(j.outerRadius()), l = d3.layout.pie().sort(null).value(function (a) {
                return a[1]
            }), m = d3.select(d[0]).append("svg").attr("class", "pie-chart").attr("width", f).attr("height", g + 50).append("g").attr("transform", "translate(" + f / 2 + "," + (g / 2 + 25) + ")");
            c.$watch("data", function (b) {
                var c = m.selectAll(".arc").data(l(b)).enter().append("g").attr("class", "arc");
                c.append("path").attr("d", j).style("fill", function (b) {
                    return a(b.data[0])
                }), c.append("text").style("text-anchor", "middle").text(function (a) {
                    return a.data[0]
                }).attr("dy", ".35em").attr("transform", function (a) {
                        return a.innerRadius = h + 50, a.outerRadius = h, "translate(" + k.centroid(a) + ")"
                    })
            })
        }}
    });*/