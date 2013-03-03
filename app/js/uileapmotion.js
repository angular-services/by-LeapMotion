angular.module('uiLeapMotion', ['byLeapMotion']).directive('leapMotionCursor', function(LeapMotion) {
    return {
        link: function(scope, elm, attrs, ctrl) {
            scope.leap = LeapMotion;

            /*
            elm.style = {
                display: (indexFinger.valid?'':'none'),
                position: 'fixed',
                left: indexFinger.screenStyledPosition.x,
                top: indexFinger.screenStyledPosition.y
            }
            */
        }
    }
})