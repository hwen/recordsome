import Hammer from 'hammerjs';
import Vue from 'vue';

const gestures = ['tap', 'pan', 'pinch', 'press', 'rotate', 'swipe'];
const directions = ['up', 'down', 'left', 'right', 'horizontal', 'vertical', 'all'];

const VueHammer = {
  config: {},
  customEvents: {},
  install() {
    Vue.directive('hammer', {
      bind: (el, binding) => {
        if (!el.hammer) {
          el.hammer = new Hammer.Manager(el);
        }
        const mc = el.hammer;

        // determine event type
        const event = binding.arg;
        if (!event) {
          console.warn('[vue-hammer] event type argument is required.');
        }
        el.__hammerConfig = el.__hammerConfig || {};
        el.__hammerConfig[event] = {};

        const direction = binding.modifiers;
        if (Object.keys(direction).length) {
          Object.keys(direction)
            .filter(keyName => binding.modifiers[keyName])
            .forEach(keyName => {
              const elDirectionArray = el.__hammerConfig[event].direction || [];
              if (elDirectionArray.indexOf(keyName) === -1) {
                elDirectionArray.push(String(keyName));
              }
            });
        }

        let recognizerType, recognizer;

        if (this.customEvents[event]) {
          // custom event
          const custom = this.customEvents[event];
          recognizerType = custom.type;
          recognizer = new Hammer[(this.capitalize(recognizerType))](custom);
          recognizer.recognizeWith(mc.recognizers);
          mc.add(recognizer);
        } else {
          // built-in event
          recognizerType = gestures.find(gesture => gesture === event);
          if (!recognizerType) {
            console.warn('[vue-hammer] invalid event type: ' + event);
            return;
          }
          recognizer = mc.get(recognizerType);
          if (!recognizer) {
            // add recognizer
            recognizer = new Hammer[(this.capitalize(recognizerType))]();
            // make sure multiple recognizers work together...
            recognizer.recognizeWith(mc.recognizers);
            mc.add(recognizer);
          }
          // apply global options
          const globalOptions = this.config[recognizerType];
          if (globalOptions) {
            this.guardDirections(globalOptions);
            recognizer.set(globalOptions);
          }
          // apply local options
          const localOptions = el.hammerOptions && el.hammerOptions[recognizerType];
          if (localOptions) {
            this.guardDirections(localOptions);
            recognizer.set(localOptions);
          }
        }
      },
      inserted: (el, binding) => {
        const mc = el.hammer;
        const event = binding.arg;
        if (mc.handler) {
          mc.off(event, mc.handler);
        }
        if (typeof binding.value !== 'function') {
          mc.handler = null;
          console.warn('[vue-hammer] invalid handler function for v-hammer: ' + binding.arg);
        } else {
          mc.on(event, (mc.handler = binding.value));
        }
      },
      componentUpdated: (el, binding) => {
        const mc = el.hammer;
        const event = binding.arg;
        // teardown old handler
        if (mc.handler) {
          mc.off(event, mc.handler);
        }
        if (typeof binding.value !== 'function') {
          mc.handler = null;
          console.warn('[vue-hammer] invalid handler function for v-hammer: ' + binding.arg);
        } else {
          mc.on(event, (mc.handler = binding.value));
        }
      },
      unbind: (el, binding) => {
        const mc = el.hammer;
        if (mc.handler) {
          el.hammer.off(binding.arg, mc.handler);
        }
        if (!Object.keys(mc.handlers).length) {
          el.hammer.destroy();
          el.hammer = null;
        }
      }
    });
  },
  guardDirections(options) {
    var dir = options.direction;
    if (typeof dir === 'string') {
      var hammerDirection = 'DIRECTION_' + dir.toUpperCase();
      if (directions.indexOf(dir) > -1 && Hammer.hasOwnProperty(hammerDirection)) {
        options.direction = Hammer[hammerDirection];
      } else {
        console.warn('[vue-hammer] invalid direction: ' + dir);
      }
    }
  },
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

export default VueHammer;
