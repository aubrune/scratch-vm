const log = require('../../util/log');
const MathUtil = require('../../util/math-util');

const WebSocket = require('isomorphic-ws');
const _ = require('lodash');

const createRosaClient = () => {
    const defaultHost = 'rosa.local';
    const defaultPort = 1234;
    const sendMaxRate = 60;
    const keepAliveTimeout = 5000;

    const url = `ws://${defaultHost}:${defaultPort}`;
    const ws = new WebSocket(url);

    const state = {};

    const send = data => {
        if (ws.readyState !== WebSocket.OPEN) {
            log.warn(`Try to send ${data} on a not ready ws (${ws.readyState}).`);
            return;
        }

        const msg = JSON.stringify(data);
        const date = Date.now();

        log.info(`${date}: Sending ${msg}`);
        ws.send(msg);
    };

    let cmd = {};
    const updateCommand = newCmd => {
        _.merge(cmd, newCmd);
    };

    const sender = () => {
        if (Object.entries(cmd).length !== 0) {
            send(cmd);
            cmd = {};
        }
    };

    // TODO: should we instead altern sending/receiving
    // so the robot can schedule the communication.
    const sendId = setInterval(sender, 1000 / sendMaxRate);

    const client = {
        stopAll: () => {
            updateCommand({wheels: {a: 0, b: 0}});
        },
        getDistance: sensor => {
            const dist = state.distance[sensor];
            log.info(`${sensor} dist: ${dist}`);
            return dist;
        },
        setSpeed: (wheel, speed) => {
            speed = MathUtil.clamp(speed, -1, 1);
            log.info(`Set ${wheel} wheel speed to ${speed}`);

            if (wheel === 'left') {
                updateCommand({wheels: {b: -speed}});

            } else if (wheel === 'right') {
                updateCommand({wheels: {a: speed}});

            } else if (wheel === 'all') {
                updateCommand({wheels: {a: speed, b: -speed}});
            }
        },
        isGround: sensor => {
            const dist = state.ground[sensor];
            log.info(`${sensor} ground dist: ${dist}`);
            return dist > 0.5;
        },
        getColor: sensor => {
            const color = state.color[sensor];
            log.info(`Get ${sensor} color: ${color}`);

            return color;
        },
        buzz: duration => {
            log.info(`Buz for ${duration}s`);

            updateCommand({buzz: duration});
        },
        getBlackLineCenter: () => {
            const center = state['line-center'];
            log.info(`Get black line center ${center}.`);

            if (center) {
                return {x: center[0], y: center[1]};
            }
        }
    };

    let alive = false;
    const keepAlive = () => {
        log.warn('Keep alive timeout!');

        if (alive) {
            alive = false;
            if (typeof client.ondisconnect === typeof Function) {
                client.ondisconnect();
            }
        }
    };
    let keepAliveId = setTimeout(keepAlive, keepAliveTimeout);

    ws.onopen = () => {
        log.info(`Connected!`);
    };

    ws.onmessage = msg => {
        _.merge(state, JSON.parse(msg.data));

        if (!alive) {
            alive = true;
            if (typeof client.onconnect === typeof Function) {
                client.onconnect();
            }
        }

        clearTimeout(keepAliveId);
        keepAliveId = setTimeout(keepAlive, keepAliveTimeout);
    };

    ws.onclose = () => {
        log.info('Ws connection closed.');

        clearInterval(sendId);
        clearInterval(keepAliveId);

        if (typeof client.ondisconnect === typeof Function) {
            client.ondisconnect();
        }
    };

    ws.onerror = e => {
        log.error(`Ws error: ${e}`);

        if (typeof client.ondisconnect === typeof Function) {
            client.ondisconnect();
        }
    };

    return client;
};

module.exports = createRosaClient;
