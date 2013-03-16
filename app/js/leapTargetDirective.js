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
            classOnFingerOver: '@',  //mean index finger
            classOnFingersOut: '@',

            //delegate
            onAnyFingerOver: '&',
            onAllFingersOut: '&',
            onFingerOver: '&',  //mean index finger
            onFingerOut: '&'
        },
        link: function(scope, elm, attrs, ctrl) {
            scope.leap = LeapMotion;

            var leap = scope.leap;
            var domElement = elm[0];

            var fingerIsOver;
            setFingerIsOver(false);
            function setFingerIsOver(value) {
                if (fingerIsOver == value) return;
                fingerIsOver = value;
                if (value) {
                    if (scope.onFingerOver) scope.onFingerOver({value:elm});
                    if (scope.classOnAnyFingerOver) elm.addClass(scope.classOnAnyFingerOver);
                } else {
                    if (scope.onFingerOut) scope.onFingerOut({value:elm});
                    if (scope.classOnAnyFingerOver) elm.removeClass(scope.classOnAnyFingerOver);
                }
            }

            var anyFingerIsOver;
            setAnyFingerIsOver(false);
            function setAnyFingerIsOver(value) {
                if (anyFingerIsOver == value) return;
                anyFingerIsOver = value;
                if (value) {
                    if (scope.onAnyFingerOver) scope.onAnyFingerOver();
                    //if (scope.classOnFingerOver && !fingerIsOver) elm.addClass(scope.classOnFingerOver);
                    if (scope.classOnFingerOver) elm.addClass(scope.classOnFingerOver);
                    if (scope.classOnFingersOut) elm.removeClass(scope.classOnFingersOut);
                } else {
                    if (scope.onAllFingersOut) scope.onAllFingersOut();
                    if (scope.classOnFingerOver) elm.removeClass(scope.classOnFingerOver);
                    if (scope.classOnFingersOut) elm.addClass(scope.classOnFingersOut);
                }
            }

            (function refreshPosition() {
                var fingersIn = 0;
                var indexFingerIn = false;
                for (var index = 0, count = scope.leap.fingersCount; index < count; index++) {
                    var finger = leap.getFinger(index);
                    if (hitTest(finger.screenPosition.x, finger.screenPosition.y, domElement)) {
                        if (index == 0) {
                            indexFingerIn = true;
                        }
                        fingersIn++;
                    }
                }

                setFingerIsOver(indexFingerIn);
                setAnyFingerIsOver(fingersIn > 0);

                requestAnimationFrame(refreshPosition);
            })();

            function hitTest(x, y, domElement) {
                var rect = placement.getElementAbsolutePlacement(domElement);
                return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
            }
        }
    }
});