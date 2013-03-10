/**
 * Project: by-LeapMotion.
 * Copyright (c) 2013, Eugene-Krevenets
 */

'use strict';

myLeapMotion.directive('leapTarget', function(LeapMotion) {
    // shim layer with setTimeout fallback
    var requestAnimationFrame = (function() {
        return  window.requestAnimationFrame   ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return {
        restrict: 'EACM',
        scope: {
            classOnAnyFingerOver: '@',
            classOnFingerOver: '@'  //mean index finger
        },
        link: function(scope, elm, attrs, ctrl) {
            scope.leap = LeapMotion;

            var leap = scope.leap;
            var domElement = elm[0];

            (function refreshPosition() {
                var fingers = scope.leap.fingers;
                var fingersIn = 0;
                var indexFingerIn = false;
                for (var index = 0, count = fingers.length; index < count; index++) {
                    var finger = leap.getFinger(index);
                    if (hitTest(finger.screenPosition.x, finger.screenPosition.y, domElement)) {
                        if (index == 0) {
                            indexFingerIn = true;
                        }
                        fingersIn++;
                    }
                }

                if (scope.classOnAnyFingerOver) {
                    if (fingersIn > 0) {
                        elm.addClass(scope.classOnAnyFingerOver);
                    } else {
                        elm.removeClass(scope.classOnAnyFingerOver);
                    }
                }

                if (scope.classOnFingerOver) {
                    if (indexFingerIn) {
                        elm.addClass(scope.classOnFingerOver);
                    } else {
                        elm.removeClass(scope.classOnFingerOver);
                    }
                }

                requestAnimationFrame(refreshPosition);
            })();

            function hitTest(x, y, domElement) {
                var rect = placement.getElementAbsolutePlacement(domElement);
                return x >= rect.x && y >= rect.y && x <= rect.x + rect.width && y <= rect.y + rect.width;
            }
        }
    }
});