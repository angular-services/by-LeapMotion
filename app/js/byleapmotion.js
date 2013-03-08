'use strict';

angular.module('byLeapMotion', []).factory('LeapMotion', function() {
    var sx = 4;
    var sy = -4;
    var tx = window.innerHeight / 2;
    var ty = window.innerWidth / 2;

    /*

     var defaultCalibrationMatrix = [
     sx, 0,  tx,
     0,  sy, ty,
     0,  0,  1
     ];

     var positionMatrix = [
     1, 0, 0,
     0, 1, 0,
     0, 0, 1
     ];

     */

    var defaultCalibrationMatrix = $M([
        [sx, 0, tx],
        [0, sy, ty],
        [0,  0,  1]
    ]);

    var positionMatrix = $M([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]);

    var latencyCalibration = Number.NaN;

    return {
        connected : false,
        controller: null,

        valid: false,
        timestamp: 0,
        timestampDelta: 0,
        fps: 0,
        latency: 0,
        fingersCount: 0,
        fingers: [],
        frame: null,

        gesture : {
            valid: false,
            state: {}
        },

        indexFinger: {
            valid: false,
            tool: false,
            position: { x:0, y:0, z:0 },
            direction: { x:0, y:0, z:0 },
            screenPosition: { x:0, y:0, z:0 },
            screenStyledPosition: { x: '', y: '', z: '' },
            velocity: {
                length: 0,
                x:0, y:0, z:0
            },
            //use Aitken's delta-squared process for calculation acceleration
            acceleration: {
                length: 0,
                x:0, y:0, z:0
            }
        },

        getController: function() {
            if(this.controller == null) {
                this.controller = new Leap.Controller({
                    enableGestures: true
                });
                var self = this;

                var seriesAccelerationMethodForX = new SimpleAccelerationProcess();
                var seriesAccelerationMethodForY = new SimpleAccelerationProcess();
                var seriesAccelerationMethodForZ = new SimpleAccelerationProcess();

                this.controller.on('animationFrame', function() {
                    var frame = self.controller.frame();
                    self.frame = frame;
                    self.fingers = [];
                    self.fingersCount = frame.pointables.length;

                    if(self.fingersCount == 0 && frame.valid) {
                        latencyCalibration = Date.now() - 0.001 * frame.timestamp;
                    }

                    if (frame.gestures && frame.gestures.length > 0) {
                        var gestures = frame.gestures;
                        self.gesture.valid = true;
                        self.gesture.state = gestures[0];
                    } else {
                        self.gesture.valid = false;
                    }

                    //var pointable = getNearestPointable(frame);
                    var pointable = frame.pointables[0];
                    self.valid = frame.valid;
                    if (pointable) {

                        if(self.timestamp > 0) {
                            self.timestampDelta = frame.timestamp - self.timestamp;
                            self.fps = 1000000 / self.timestampDelta;
                            if(!isNaN(latencyCalibration)) {
                                self.latency = Date.now() - 0.001 * frame.timestamp - latencyCalibration;
                            }
                        }
                        self.timestamp = frame.timestamp;
                        self.indexFinger.valid = true;
                        self.indexFinger.tool = pointable.tool;

                        var x = pointable.tipPosition[0];
                        var y = pointable.tipPosition[1];
                        var z = pointable.tipPosition[2];

                        self.indexFinger.position.x = x;
                        self.indexFinger.position.y = y;
                        self.indexFinger.position.z = z;

                        //multiply on calibrationMatrix;
                        positionMatrix.elements[0][2] = x;
                        positionMatrix.elements[1][2] = y;
                        var screenPositionMatrix = defaultCalibrationMatrix.x(positionMatrix);

                        self.indexFinger.screenPosition.x = Math.round(screenPositionMatrix.elements[0][2]);
                        self.indexFinger.screenPosition.y = Math.round(screenPositionMatrix.elements[1][2]);
                        self.indexFinger.screenStyledPosition.x = self.indexFinger.screenPosition.x + 'px';
                        self.indexFinger.screenStyledPosition.y = self.indexFinger.screenPosition.y + 'px';
//                        self.indexFinger.screenStyledPosition.x = Math.round(x * 3) + 'px';
//                        self.indexFinger.screenStyledPosition.y = Math.round(600 - y * 3) + 'px';


                        self.indexFinger.velocity.x = pointable.tipVelocity[0];
                        self.indexFinger.velocity.y = pointable.tipVelocity[1];
                        self.indexFinger.velocity.z = pointable.tipVelocity[2];
                        self.indexFinger.velocity.length = vectorLength(pointable.tipVelocity[0], pointable.tipVelocity[1], pointable.tipVelocity[2]);

                        var accelX = seriesAccelerationMethodForX.forNewPosition(frame.timestamp, pointable.tipPosition[0], pointable.tipVelocity[0])
                        var accelY = seriesAccelerationMethodForY.forNewPosition(frame.timestamp, pointable.tipPosition[1], pointable.tipVelocity[1])
                        var accelZ = seriesAccelerationMethodForZ.forNewPosition(frame.timestamp, pointable.tipPosition[2], pointable.tipVelocity[2])
                        self.indexFinger.acceleration.x = accelX;
                        self.indexFinger.acceleration.y = accelY;
                        self.indexFinger.acceleration.z = accelZ;
                        self.indexFinger.acceleration.length = vectorLength(accelX, accelY, accelZ);
                    } else {
                        self.indexFinger.valid = false;
                        seriesAccelerationMethodForX.invalidate();
                    }
                });
            }
            return this.controller;
        },

        invalideFinger: {
            valid: false,
            screenStyledPosition: {x:'0px', y:'0px'}
        },

        getFinger: function(index) {
            if(this.frame == null) {
                return this.invalideFinger;
            }

            var pointables = this.frame.pointables;
            if(index >= pointables.length) {
                return this.invalideFinger;
            }

            var finger = this.fingers[index];
            if(!!finger) {
                return finger;
            }

            finger = {
                valid: true,
                screenPosition: {},
                screenStyledPosition: {}
            };

            var pointable = pointables[index];
            var x = pointable.tipPosition[0];
            var y = pointable.tipPosition[1];
            var z = pointable.tipPosition[2];

            //multiply on calibrationMatrix;
            positionMatrix.elements[0][2] = x;
            positionMatrix.elements[1][2] = y;

            var screenPositionMatrix = defaultCalibrationMatrix.x(positionMatrix);

            finger.x = x;
            finger.y = y;
            finger.z = z;

            finger.screenPosition.x = Math.round(screenPositionMatrix.elements[0][2]);
            finger.screenPosition.y = Math.round(screenPositionMatrix.elements[1][2]);
            finger.screenStyledPosition.x = finger.screenPosition.x + 'px';
            finger.screenStyledPosition.y = finger.screenPosition.y + 'px';

            this.fingers[index] = finger;
            return finger;
        },

        connect: function() {
            if (this.connected) {
                return;
            }
            this.connected = true;
            this.getController().connect();
        },

        disconnect: function() {
            this.connected = false;
            this.getController().disconnect();
        }
    }
});



function vectorLength(dx, dy, dz) {
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Z is point to user so, nearest pointable to screen with less Z.
 * @param frame
 * @return {*}
 */
function getNearestPointable(frame) {
    var nearestPoinable = null;
    var zDistance = -Number.MAX_VALUE;
    var pointables = frame.pointables;
    for(var index = pointables.length - 1; index >=0; index--){
        var pointable = pointables[index];
        if(pointable == null || !pointable.valid){
            continue;
        }

        var position = pointable.tipPosition;
        var newZDistance = position[2];
        if(zDistance < newZDistance){
            zDistance = newZDistance;
            nearestPoinable = pointable;
        }
    }

    return nearestPoinable;
}



/*
 Implement more accurate method
 http://en.wikipedia.org/wiki/Aitken%27s_delta-squared_process

 FIX : use timestamp for calculation
 */

var AitkensDeltaSquaredProcess = function(){
    var valid = false;
    var previous1 = {
        timestamp: 0,
        value: 0
    }

    var previous2 = {};

    this.forNewPosition = function(timestamp, value, deltaValue) {
        var result;
        if(valid) {
            result = (value * previous2.value - previous1.value * previous1.value ) / (value - 2 * previous1.value + previous2.value );
        } else {
            previous2.timestamp = previous1.timestamp;
            previous2.value = previous1.value;

            previous1.timestamp = timestamp;
            previous1.value = value;

            valid = previous2.timestamp != 0;

            result = 0;
        }

        return result;
    }

    this.invalidate = function() {
        valid = false;
        previous1.timestamp = 0;
    }
};

var SimpleAccelerationProcess = function() {
    var valid = false;
    var previous = {
        timestamp: 0,
        deltaValue: 0
    }

    this.forNewPosition = function(timestamp, value, deltaValue) {
        var result;
        if(valid) {
            result = (deltaValue - previous.deltaValue) / (timestamp - previous.timestamp);
        } else {
            result = 0;
            valid = true;
        }

        previous.timestamp = timestamp;
        previous.deltaValue = deltaValue;
        return result;
    }

    this.invalidate = function() {
        valid = false;
    }
}
