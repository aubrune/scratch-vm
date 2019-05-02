const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const createRosaClient = require('./rosa_client');

const formatMessage = require('format-message');


class Scratch3RosaBlocks {
    static get DEFAULT_LANG () {
        return 'en';
    }

    static get EXTENSION_ID () {
        return 'rosa';
    }

    constructor (runtime) {
        this.runtime = runtime;
        this.runtime.registerPeripheralExtension(Scratch3RosaBlocks.EXTENSION_ID, this);

        this._connected = false;

        this.rosa = createRosaClient(this.runtime);
        this.rosa.onconnect = () => {
            this._connected = true;
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_CONNECTED);
        };
        this.rosa.ondisconnect = () => {
            this._connected = false;
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_DISCONNECTED);
        };

        this.runtime.on('PROJECT_STOP_ALL', this.rosa.stopAll);
    }

    isConnected () {
        return this._connected;
    }

    wheelSpeed (args) {
        const speed = Cast.toNumber(args.SPEED);
        this.rosa.setSpeed(args.WHEEL, speed);
    }

    groundSensor (args) {
        return this.rosa.isGround(args.GROUND_SENSOR);
    }

    distanceSensor (args) {
        return this.rosa.getDistance(args.DIST_SENSOR);
    }

    colorSensor () {
        return this.rosa.getColor();
    }

    buzz (args) {
        this.rosa.buzz(Cast.toNumber(args.T));
    }

    ledOn (args) {
        this.rosa.led(args.LED, true);
    }

    ledOff (args) {
        this.rosa.led(args.LED, false);
    }

    lineDetected () {
        const center = this.rosa.getBlackLineCenter();
        if (center) {
            return true;
        }
        return false;
    }

    blackLineCenter () {
        const center = this.rosa.getBlackLineCenter();
        if (center) {
            return center.x;
        }
    }

    getInfo () {
        const messages = this.getMessagesForLocale();

        return {
            id: Scratch3RosaBlocks.EXTENSION_ID,
            name: 'Rosa',
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'wheelSpeed',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.wheelSpeed,
                    arguments: {
                        WHEEL: {
                            type: ArgumentType.STRING,
                            menu: 'wheelSide',
                            defaultValue: 'left'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'groundSensor',
                    blockType: BlockType.BOOLEAN,
                    text: messages.blocks.groundSensor,
                    arguments: {
                        GROUND_SENSOR: {
                            type: ArgumentType.STRING,
                            menu: 'groundSensor',
                            defaultValue: 'ground-front-left'
                        }
                    }
                },
                {
                    opcode: 'distanceSensor',
                    blockType: BlockType.REPORTER,
                    text: messages.blocks.distanceSensor,
                    arguments: {
                        DIST_SENSOR: {
                            type: ArgumentType.STRING,
                            menu: 'distanceSensor',
                            defaultValue: 'front-center'
                        }
                    }
                },
                {
                    opcode: 'colorSensor',
                    blockType: BlockType.REPORTER,
                    text: messages.blocks.colorSensor
                },
                {
                    opcode: 'ledOn',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.ledOn,
                    arguments: {
                        LED: {
                            type: ArgumentType.STRING,
                            menu: 'led',
                            defaultValue: 'center'
                        }
                    }
                },
                {
                    opcode: 'ledOff',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.ledOff,
                    arguments: {
                        LED: {
                            type: ArgumentType.STRING,
                            menu: 'led',
                            defaultValue: 'center'
                        }
                    }
                },
                {
                    opcode: 'buzz',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.buzz,
                    arguments: {
                        T: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'lineDetected',
                    blockType: BlockType.BOOLEAN,
                    text: messages.blocks.lineDetected
                },
                {
                    opcode: 'blackLineCenter',
                    blockType: BlockType.REPORTER,
                    text: messages.blocks.blackLineCenter
                }
            ],
            menus: {
                wheelSide: [
                    {text: messages.menus.wheelSide.left, value: 'left'},
                    {text: messages.menus.wheelSide.right, value: 'right'},
                    {text: messages.menus.wheelSide.all, value: 'all'}
                ],
                distanceSensor: [
                    {text: messages.menus.distanceSensor.center, value: 'front-center'},
                    {text: messages.menus.distanceSensor.left, value: 'front-left'},
                    {text: messages.menus.distanceSensor.right, value: 'front-right'}
                ],
                led: [
                    {text: messages.menus.led.left, value: 'left'},
                    {text: messages.menus.led.center, value: 'center'},
                    {text: messages.menus.led.right, value: 'right'}
                ],
                groundSensor: [
                    {text: messages.menus.groundSensor.frontLeft, value: 'ground-front-left'},
                    {text: messages.menus.groundSensor.frontRight, value: 'ground-front-right'},
                    {text: messages.menus.groundSensor.rearLeft, value: 'ground-rear-left'},
                    {text: messages.menus.groundSensor.rearRight, value: 'ground-rear-right'}
                ]
            }
        };
    }
    getMessagesForLocale () {
        const locale = formatMessage.setup().locale;

        let messages;
        try {
            messages = require(`./lang/${locale}`);
        } catch (ex) {
            log.warn(`Locale "${locale}" is not supported.`);
            messages = require(`./lang/${Scratch3RosaBlocks.DEFAULT_LANG}`);
        }
        return messages;
    }
}


module.exports = Scratch3RosaBlocks;
