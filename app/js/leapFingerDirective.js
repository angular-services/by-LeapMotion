'use strict';

var myLeapMotion = angular.module('uiLeapMotion', ['byLeapMotion']);

myLeapMotion.directive('leapFinger', function(LeapMotion) {
    // shim layer with setTimeout fallback
    var requestAnimationFrame = (function(){
        return  window.requestAnimationFrame   ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return {
        restrict: 'EACM',
        scope: {
            finger: '@leapFinger',
            zooming: '='
        },
        link: function(scope, elm, attrs, ctrl) {
            scope.leap = LeapMotion;

            requestAnimationFrame(refreshPosition);

            var style = elm[0].style;
            var leap = scope.leap;

            scope.$watch('finger', function() {
                if(scope.finger == null) {
                    getFinger = getIndexFinger;
                } else {
                    getFinger = function() {
                        return getFingerById(scope.finger);
                    }
                }
            });

            var getFinger = getIndexFinger;

            function getIndexFinger() {
                return leap.indexFinger;
            }

            function getFingerById(index) {
                return leap.getFinger(index);
            }

            function refreshPosition() {
                var finger = getFinger();
                style.display = (finger.valid?'':'none');
                if(finger.valid) {
                    style.position = 'fixed';
//                    style.marginLeft = finger.screenStyledPosition.x;
                    style.left = finger.screenStyledPosition.x;
//                    style.marginTop = finger.screenStyledPosition.y;
                    style.top = finger.screenStyledPosition.y;
                    if(scope.zooming) {
                        style.fontSize = Math.floor(30 - 0.1 * finger.z) + 'px';
                    }
                }
                requestAnimationFrame(refreshPosition);
            }
        }
    }
})