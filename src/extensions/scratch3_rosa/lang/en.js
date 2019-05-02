module.exports = {
    blocks: {
        wheelSpeed: 'set [WHEEL] wheel speed to [SPEED]',
        groundSensor: '[GROUND_SENSOR] ground',
        distanceSensor: 'front [DIST_SENSOR] distance',
        colorSensor: 'get color',
        lineDetected: 'line detected?',
        blackLineCenter: 'line center x',
        buzz: 'buzz [T]s',
        ledOn: 'turn [LED] led on',
        ledOff: 'turn [LED] led off'
    },
    menus: {
        wheelSide: {
            left: 'left',
            right: 'right',
            all: 'all'
        },
        distanceSensor: {
            center: 'center',
            left: 'left',
            right: 'right'
        },
        led: {
            left: 'left',
            center: 'center',
            right: 'right'
        },
        groundSensor: {
            frontLeft: 'front left',
            frontRight: 'front right',
            rearLeft: 'rear left',
            rearRight: 'rear right'
        }
    }
};
