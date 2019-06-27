!function(exports, global) {
    function setTimeoutContext(fn, timeout, context) {
        return setTimeout(bindFn(fn, context), timeout);
    }
    function invokeArrayArg(arg, fn, context) {
        return !!Array.isArray(arg) && (each(arg, context[fn], context), !0);
    }
    function each(obj, iterator, context) {
        var i;
        if (obj) if (obj.forEach) obj.forEach(iterator, context); else if (void 0 !== obj.length) for (i = 0; i < obj.length; ) iterator.call(context, obj[i], i, obj), 
        i++; else for (i in obj) obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
    }
    function deprecate(method, name, message) {
        var deprecationMessage = "DEPRECATED METHOD: " + name + "\n" + message + " AT \n";
        return function() {
            var e = new Error("get-stack-trace"), stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@") : "Unknown Stack Trace", log = window.console && (window.console.warn || window.console.log);
            return log && log.call(window.console, deprecationMessage, stack), method.apply(this, arguments);
        };
    }
    function inherit(child, base, properties) {
        var childP, baseP = base.prototype;
        childP = child.prototype = Object.create(baseP), childP.constructor = child, childP._super = baseP, 
        properties && assign(childP, properties);
    }
    function bindFn(fn, context) {
        return function() {
            return fn.apply(context, arguments);
        };
    }
    function boolOrFn(val, args) {
        return typeof val == TYPE_FUNCTION ? val.apply(args ? args[0] || void 0 : void 0, args) : val;
    }
    function ifUndefined(val1, val2) {
        return void 0 === val1 ? val2 : val1;
    }
    function addEventListeners(target, types, handler) {
        each(splitStr(types), function(type) {
            target.addEventListener(type, handler, !1);
        });
    }
    function removeEventListeners(target, types, handler) {
        each(splitStr(types), function(type) {
            target.removeEventListener(type, handler, !1);
        });
    }
    function hasParent(node, parent) {
        for (;node; ) {
            if (node == parent) return !0;
            node = node.parentNode;
        }
        return !1;
    }
    function inStr(str, find) {
        return str.indexOf(find) > -1;
    }
    function splitStr(str) {
        return str.trim().split(/\s+/g);
    }
    function inArray(src, find, findByKey) {
        if (src.indexOf && !findByKey) return src.indexOf(find);
        for (var i = 0; i < src.length; ) {
            if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) return i;
            i++;
        }
        return -1;
    }
    function toArray(obj) {
        return Array.prototype.slice.call(obj, 0);
    }
    function uniqueArray(src, key, sort) {
        for (var results = [], values = [], i = 0; i < src.length; ) {
            var val = key ? src[i][key] : src[i];
            inArray(values, val) < 0 && results.push(src[i]), values[i] = val, i++;
        }
        return sort && (results = key ? results.sort(function(a, b) {
            return a[key] > b[key];
        }) : results.sort()), results;
    }
    function prefixed(obj, property) {
        for (var prefix, prop, camelProp = property[0].toUpperCase() + property.slice(1), i = 0; i < VENDOR_PREFIXES.length; ) {
            if (prefix = VENDOR_PREFIXES[i], (prop = prefix ? prefix + camelProp : property) in obj) return prop;
            i++;
        }
    }
    function uniqueId() {
        return _uniqueId++;
    }
    function getWindowForElement(element) {
        var doc = element.ownerDocument || element;
        return doc.defaultView || doc.parentWindow || window;
    }
    function Input(manager, callback) {
        var self = this;
        this.manager = manager, this.callback = callback, this.element = manager.element, 
        this.target = manager.options.inputTarget, this.domHandler = function(ev) {
            boolOrFn(manager.options.enable, [ manager ]) && self.handler(ev);
        }, this.init();
    }
    function createInputInstance(manager) {
        var inputClass = manager.options.inputClass;
        return new (inputClass || (SUPPORT_POINTER_EVENTS ? PointerEventInput : SUPPORT_ONLY_TOUCH ? TouchInput : SUPPORT_TOUCH ? TouchMouseInput : MouseInput))(manager, inputHandler);
    }
    function inputHandler(manager, eventType, input) {
        var pointersLen = input.pointers.length, changedPointersLen = input.changedPointers.length, isFirst = eventType & INPUT_START && pointersLen - changedPointersLen == 0, isFinal = eventType & (INPUT_END | INPUT_CANCEL) && pointersLen - changedPointersLen == 0;
        input.isFirst = !!isFirst, input.isFinal = !!isFinal, isFirst && (manager.session = {}), 
        input.eventType = eventType, computeInputData(manager, input), manager.emit("hammer.input", input), 
        manager.recognize(input), manager.session.prevInput = input;
    }
    function computeInputData(manager, input) {
        var session = manager.session, pointers = input.pointers, pointersLength = pointers.length;
        session.firstInput || (session.firstInput = simpleCloneInputData(input)), pointersLength > 1 && !session.firstMultiple ? session.firstMultiple = simpleCloneInputData(input) : 1 === pointersLength && (session.firstMultiple = !1);
        var firstInput = session.firstInput, firstMultiple = session.firstMultiple, offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center, center = input.center = getCenter(pointers);
        input.timeStamp = now(), input.deltaTime = input.timeStamp - firstInput.timeStamp, 
        input.angle = getAngle(offsetCenter, center), input.distance = getDistance(offsetCenter, center), 
        computeDeltaXY(session, input), input.offsetDirection = getDirection(input.deltaX, input.deltaY);
        var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
        input.overallVelocityX = overallVelocity.x, input.overallVelocityY = overallVelocity.y, 
        input.overallVelocity = abs(overallVelocity.x) > abs(overallVelocity.y) ? overallVelocity.x : overallVelocity.y, 
        input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1, input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0, 
        input.maxPointers = session.prevInput ? input.pointers.length > session.prevInput.maxPointers ? input.pointers.length : session.prevInput.maxPointers : input.pointers.length, 
        computeIntervalInputData(session, input);
        var target = manager.element;
        hasParent(input.srcEvent.target, target) && (target = input.srcEvent.target), input.target = target;
    }
    function computeDeltaXY(session, input) {
        var center = input.center, offset = session.offsetDelta || {}, prevDelta = session.prevDelta || {}, prevInput = session.prevInput || {};
        input.eventType !== INPUT_START && prevInput.eventType !== INPUT_END || (prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        }, offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        }), input.deltaX = prevDelta.x + (center.x - offset.x), input.deltaY = prevDelta.y + (center.y - offset.y);
    }
    function computeIntervalInputData(session, input) {
        var velocity, velocityX, velocityY, direction, last = session.lastInterval || input, deltaTime = input.timeStamp - last.timeStamp;
        if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || void 0 === last.velocity)) {
            var deltaX = input.deltaX - last.deltaX, deltaY = input.deltaY - last.deltaY, v = getVelocity(deltaTime, deltaX, deltaY);
            velocityX = v.x, velocityY = v.y, velocity = abs(v.x) > abs(v.y) ? v.x : v.y, direction = getDirection(deltaX, deltaY), 
            session.lastInterval = input;
        } else velocity = last.velocity, velocityX = last.velocityX, velocityY = last.velocityY, 
        direction = last.direction;
        input.velocity = velocity, input.velocityX = velocityX, input.velocityY = velocityY, 
        input.direction = direction;
    }
    function simpleCloneInputData(input) {
        for (var pointers = [], i = 0; i < input.pointers.length; ) pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        }, i++;
        return {
            timeStamp: now(),
            pointers: pointers,
            center: getCenter(pointers),
            deltaX: input.deltaX,
            deltaY: input.deltaY
        };
    }
    function getCenter(pointers) {
        var pointersLength = pointers.length;
        if (1 === pointersLength) return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
        for (var x = 0, y = 0, i = 0; i < pointersLength; ) x += pointers[i].clientX, y += pointers[i].clientY, 
        i++;
        return {
            x: round(x / pointersLength),
            y: round(y / pointersLength)
        };
    }
    function getVelocity(deltaTime, x, y) {
        return {
            x: x / deltaTime || 0,
            y: y / deltaTime || 0
        };
    }
    function getDirection(x, y) {
        return x === y ? DIRECTION_NONE : abs(x) >= abs(y) ? x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
    }
    function getDistance(p1, p2, props) {
        props || (props = PROPS_XY);
        var x = p2[props[0]] - p1[props[0]], y = p2[props[1]] - p1[props[1]];
        return Math.sqrt(x * x + y * y);
    }
    function getAngle(p1, p2, props) {
        props || (props = PROPS_XY);
        var x = p2[props[0]] - p1[props[0]], y = p2[props[1]] - p1[props[1]];
        return 180 * Math.atan2(y, x) / Math.PI;
    }
    function getRotation(start, end) {
        return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
    }
    function getScale(start, end) {
        return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
    }
    function MouseInput() {
        this.evEl = MOUSE_ELEMENT_EVENTS, this.evWin = MOUSE_WINDOW_EVENTS, this.pressed = !1, 
        Input.apply(this, arguments);
    }
    function PointerEventInput() {
        this.evEl = POINTER_ELEMENT_EVENTS, this.evWin = POINTER_WINDOW_EVENTS, Input.apply(this, arguments), 
        this.store = this.manager.session.pointerEvents = [];
    }
    function SingleTouchInput() {
        this.evTarget = SINGLE_TOUCH_TARGET_EVENTS, this.evWin = SINGLE_TOUCH_WINDOW_EVENTS, 
        this.started = !1, Input.apply(this, arguments);
    }
    function normalizeSingleTouches(ev, type) {
        var all = toArray(ev.touches), changed = toArray(ev.changedTouches);
        return type & (INPUT_END | INPUT_CANCEL) && (all = uniqueArray(all.concat(changed), "identifier", !0)), 
        [ all, changed ];
    }
    function TouchInput() {
        this.evTarget = TOUCH_TARGET_EVENTS, this.targetIds = {}, Input.apply(this, arguments);
    }
    function getTouches(ev, type) {
        var allTouches = toArray(ev.touches), targetIds = this.targetIds;
        if (type & (INPUT_START | INPUT_MOVE) && 1 === allTouches.length) return targetIds[allTouches[0].identifier] = !0, 
        [ allTouches, allTouches ];
        var i, targetTouches, changedTouches = toArray(ev.changedTouches), changedTargetTouches = [], target = this.target;
        if (targetTouches = allTouches.filter(function(touch) {
            return hasParent(touch.target, target);
        }), type === INPUT_START) for (i = 0; i < targetTouches.length; ) targetIds[targetTouches[i].identifier] = !0, 
        i++;
        for (i = 0; i < changedTouches.length; ) targetIds[changedTouches[i].identifier] && changedTargetTouches.push(changedTouches[i]), 
        type & (INPUT_END | INPUT_CANCEL) && delete targetIds[changedTouches[i].identifier], 
        i++;
        return changedTargetTouches.length ? [ uniqueArray(targetTouches.concat(changedTargetTouches), "identifier", !0), changedTargetTouches ] : void 0;
    }
    function TouchMouseInput() {
        Input.apply(this, arguments);
        var handler = bindFn(this.handler, this);
        this.touch = new TouchInput(this.manager, handler), this.mouse = new MouseInput(this.manager, handler), 
        this.primaryTouch = null, this.lastTouches = [];
    }
    function recordTouches(eventType, eventData) {
        eventType & INPUT_START ? (this.primaryTouch = eventData.changedPointers[0].identifier, 
        setLastTouch.call(this, eventData)) : eventType & (INPUT_END | INPUT_CANCEL) && setLastTouch.call(this, eventData);
    }
    function setLastTouch(eventData) {
        var touch = eventData.changedPointers[0];
        if (touch.identifier === this.primaryTouch) {
            var lastTouch = {
                x: touch.clientX,
                y: touch.clientY
            };
            this.lastTouches.push(lastTouch);
            var lts = this.lastTouches, removeLastTouch = function() {
                var i = lts.indexOf(lastTouch);
                i > -1 && lts.splice(i, 1);
            };
            setTimeout(removeLastTouch, DEDUP_TIMEOUT);
        }
    }
    function isSyntheticEvent(eventData) {
        for (var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY, i = 0; i < this.lastTouches.length; i++) {
            var t = this.lastTouches[i], dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
            if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) return !0;
        }
        return !1;
    }
    function TouchAction(manager, value) {
        this.manager = manager, this.set(value);
    }
    function cleanTouchActions(actions) {
        if (inStr(actions, TOUCH_ACTION_NONE)) return TOUCH_ACTION_NONE;
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X), hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        return hasPanX && hasPanY ? TOUCH_ACTION_NONE : hasPanX || hasPanY ? hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y : inStr(actions, TOUCH_ACTION_MANIPULATION) ? TOUCH_ACTION_MANIPULATION : TOUCH_ACTION_AUTO;
    }
    function getTouchActionProps() {
        if (!NATIVE_TOUCH_ACTION) return !1;
        var touchMap = {}, cssSupports = window.CSS && window.CSS.supports;
        return [ "auto", "manipulation", "pan-y", "pan-x", "pan-x pan-y", "none" ].forEach(function(val) {
            touchMap[val] = !cssSupports || window.CSS.supports("touch-action", val);
        }), touchMap;
    }
    function Recognizer(options) {
        this.options = assign({}, this.defaults, options || {}), this.id = uniqueId(), this.manager = null, 
        this.options.enable = ifUndefined(this.options.enable, !0), this.state = STATE_POSSIBLE, 
        this.simultaneous = {}, this.requireFail = [];
    }
    function stateStr(state) {
        return state & STATE_CANCELLED ? "cancel" : state & STATE_ENDED ? "end" : state & STATE_CHANGED ? "move" : state & STATE_BEGAN ? "start" : "";
    }
    function directionStr(direction) {
        return direction == DIRECTION_DOWN ? "down" : direction == DIRECTION_UP ? "up" : direction == DIRECTION_LEFT ? "left" : direction == DIRECTION_RIGHT ? "right" : "";
    }
    function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
        var manager = recognizer.manager;
        return manager ? manager.get(otherRecognizer) : otherRecognizer;
    }
    function AttrRecognizer() {
        Recognizer.apply(this, arguments);
    }
    function PanRecognizer() {
        AttrRecognizer.apply(this, arguments), this.pX = null, this.pY = null;
    }
    function PinchRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }
    function PressRecognizer() {
        Recognizer.apply(this, arguments), this._timer = null, this._input = null;
    }
    function RotateRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }
    function SwipeRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }
    function TapRecognizer() {
        Recognizer.apply(this, arguments), this.pTime = !1, this.pCenter = !1, this._timer = null, 
        this._input = null, this.count = 0;
    }
    function Hammer(element, options) {
        return options = options || {}, options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset), 
        new Manager(element, options);
    }
    function Manager(element, options) {
        this.options = assign({}, Hammer.defaults, options || {}), this.options.inputTarget = this.options.inputTarget || element, 
        this.handlers = {}, this.session = {}, this.recognizers = [], this.oldCssProps = {}, 
        this.element = element, this.input = createInputInstance(this), this.touchAction = new TouchAction(this, this.options.touchAction), 
        toggleCssProps(this, !0), each(this.options.recognizers, function(item) {
            var recognizer = this.add(new item[0](item[1]));
            item[2] && recognizer.recognizeWith(item[2]), item[3] && recognizer.requireFailure(item[3]);
        }, this);
    }
    function toggleCssProps(manager, add) {
        var element = manager.element;
        if (element.style) {
            var prop;
            each(manager.options.cssProps, function(value, name) {
                prop = prefixed(element.style, name), add ? (manager.oldCssProps[prop] = element.style[prop], 
                element.style[prop] = value) : element.style[prop] = manager.oldCssProps[prop] || "";
            }), add || (manager.oldCssProps = {});
        }
    }
    function triggerDomEvent(event, data) {
        var gestureEvent = document.createEvent("Event");
        gestureEvent.initEvent(event, !0, !0), gestureEvent.gesture = data, data.target.dispatchEvent(gestureEvent);
    }
    var assign, VENDOR_PREFIXES = [ "", "webkit", "Moz", "MS", "ms", "o" ], TEST_ELEMENT = document.createElement("div"), TYPE_FUNCTION = "function", round = Math.round, abs = Math.abs, now = Date.now;
    assign = "function" != typeof Object.assign ? function(target) {
        if (void 0 === target || null === target) throw new TypeError("Cannot convert undefined or null to object");
        for (var output = Object(target), index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (void 0 !== source && null !== source) for (var nextKey in source) source.hasOwnProperty(nextKey) && (output[nextKey] = source[nextKey]);
        }
        return output;
    } : Object.assign;
    var extend = deprecate(function(dest, src, merge) {
        for (var keys = Object.keys(src), i = 0; i < keys.length; ) (!merge || merge && void 0 === dest[keys[i]]) && (dest[keys[i]] = src[keys[i]]), 
        i++;
        return dest;
    }, "extend", "Use `assign`."), merge = deprecate(function(dest, src) {
        return extend(dest, src, !0);
    }, "merge", "Use `assign`."), _uniqueId = 1, MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i, SUPPORT_TOUCH = "ontouchstart" in window, SUPPORT_POINTER_EVENTS = void 0 !== prefixed(window, "PointerEvent"), SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent), INPUT_TYPE_TOUCH = "touch", INPUT_TYPE_PEN = "pen", INPUT_TYPE_MOUSE = "mouse", INPUT_TYPE_KINECT = "kinect", COMPUTE_INTERVAL = 25, INPUT_START = 1, INPUT_MOVE = 2, INPUT_END = 4, INPUT_CANCEL = 8, DIRECTION_NONE = 1, DIRECTION_LEFT = 2, DIRECTION_RIGHT = 4, DIRECTION_UP = 8, DIRECTION_DOWN = 16, DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT, DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN, DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL, PROPS_XY = [ "x", "y" ], PROPS_CLIENT_XY = [ "clientX", "clientY" ];
    Input.prototype = {
        handler: function() {},
        init: function() {
            this.evEl && addEventListeners(this.element, this.evEl, this.domHandler), this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler), 
            this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
        },
        destroy: function() {
            this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler), this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler), 
            this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
        }
    };
    var MOUSE_INPUT_MAP = {
        mousedown: INPUT_START,
        mousemove: INPUT_MOVE,
        mouseup: INPUT_END
    }, MOUSE_ELEMENT_EVENTS = "mousedown", MOUSE_WINDOW_EVENTS = "mousemove mouseup";
    inherit(MouseInput, Input, {
        handler: function(ev) {
            var eventType = MOUSE_INPUT_MAP[ev.type];
            eventType & INPUT_START && 0 === ev.button && (this.pressed = !0), eventType & INPUT_MOVE && 1 !== ev.which && (eventType = INPUT_END), 
            this.pressed && (eventType & INPUT_END && (this.pressed = !1), this.callback(this.manager, eventType, {
                pointers: [ ev ],
                changedPointers: [ ev ],
                pointerType: INPUT_TYPE_MOUSE,
                srcEvent: ev
            }));
        }
    });
    var POINTER_INPUT_MAP = {
        pointerdown: INPUT_START,
        pointermove: INPUT_MOVE,
        pointerup: INPUT_END,
        pointercancel: INPUT_CANCEL,
        pointerout: INPUT_CANCEL
    }, IE10_POINTER_TYPE_ENUM = {
        2: INPUT_TYPE_TOUCH,
        3: INPUT_TYPE_PEN,
        4: INPUT_TYPE_MOUSE,
        5: INPUT_TYPE_KINECT
    }, POINTER_ELEMENT_EVENTS = "pointerdown", POINTER_WINDOW_EVENTS = "pointermove pointerup pointercancel";
    window.MSPointerEvent && !window.PointerEvent && (POINTER_ELEMENT_EVENTS = "MSPointerDown", 
    POINTER_WINDOW_EVENTS = "MSPointerMove MSPointerUp MSPointerCancel"), inherit(PointerEventInput, Input, {
        handler: function(ev) {
            var store = this.store, removePointer = !1, eventTypeNormalized = ev.type.toLowerCase().replace("ms", ""), eventType = POINTER_INPUT_MAP[eventTypeNormalized], pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType, isTouch = pointerType == INPUT_TYPE_TOUCH, storeIndex = inArray(store, ev.pointerId, "pointerId");
            eventType & INPUT_START && (0 === ev.button || isTouch) ? storeIndex < 0 && (store.push(ev), 
            storeIndex = store.length - 1) : eventType & (INPUT_END | INPUT_CANCEL) && (removePointer = !0), 
            storeIndex < 0 || (store[storeIndex] = ev, this.callback(this.manager, eventType, {
                pointers: store,
                changedPointers: [ ev ],
                pointerType: pointerType,
                srcEvent: ev
            }), removePointer && store.splice(storeIndex, 1));
        }
    });
    var SINGLE_TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    }, SINGLE_TOUCH_TARGET_EVENTS = "touchstart", SINGLE_TOUCH_WINDOW_EVENTS = "touchstart touchmove touchend touchcancel";
    inherit(SingleTouchInput, Input, {
        handler: function(ev) {
            var type = SINGLE_TOUCH_INPUT_MAP[ev.type];
            if (type === INPUT_START && (this.started = !0), this.started) {
                var touches = normalizeSingleTouches.call(this, ev, type);
                type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length == 0 && (this.started = !1), 
                this.callback(this.manager, type, {
                    pointers: touches[0],
                    changedPointers: touches[1],
                    pointerType: INPUT_TYPE_TOUCH,
                    srcEvent: ev
                });
            }
        }
    });
    var TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    }, TOUCH_TARGET_EVENTS = "touchstart touchmove touchend touchcancel";
    inherit(TouchInput, Input, {
        handler: function(ev) {
            var type = TOUCH_INPUT_MAP[ev.type], touches = getTouches.call(this, ev, type);
            touches && this.callback(this.manager, type, {
                pointers: touches[0],
                changedPointers: touches[1],
                pointerType: INPUT_TYPE_TOUCH,
                srcEvent: ev
            });
        }
    });
    var DEDUP_TIMEOUT = 2500, DEDUP_DISTANCE = 25;
    inherit(TouchMouseInput, Input, {
        handler: function(manager, inputEvent, inputData) {
            var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH, isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;
            if (!(isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents)) {
                if (isTouch) recordTouches.call(this, inputEvent, inputData); else if (isMouse && isSyntheticEvent.call(this, inputData)) return;
                this.callback(manager, inputEvent, inputData);
            }
        },
        destroy: function() {
            this.touch.destroy(), this.mouse.destroy();
        }
    });
    var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, "touchAction"), NATIVE_TOUCH_ACTION = void 0 !== PREFIXED_TOUCH_ACTION, TOUCH_ACTION_COMPUTE = "compute", TOUCH_ACTION_AUTO = "auto", TOUCH_ACTION_MANIPULATION = "manipulation", TOUCH_ACTION_NONE = "none", TOUCH_ACTION_PAN_X = "pan-x", TOUCH_ACTION_PAN_Y = "pan-y", TOUCH_ACTION_MAP = getTouchActionProps();
    TouchAction.prototype = {
        set: function(value) {
            value == TOUCH_ACTION_COMPUTE && (value = this.compute()), NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value] && (this.manager.element.style[PREFIXED_TOUCH_ACTION] = value), 
            this.actions = value.toLowerCase().trim();
        },
        update: function() {
            this.set(this.manager.options.touchAction);
        },
        compute: function() {
            var actions = [];
            return each(this.manager.recognizers, function(recognizer) {
                boolOrFn(recognizer.options.enable, [ recognizer ]) && (actions = actions.concat(recognizer.getTouchAction()));
            }), cleanTouchActions(actions.join(" "));
        },
        preventDefaults: function(input) {
            var srcEvent = input.srcEvent, direction = input.offsetDirection;
            if (this.manager.session.prevented) return void srcEvent.preventDefault();
            var actions = this.actions, hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE], hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y], hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];
            if (hasNone) {
                var isTapPointer = 1 === input.pointers.length, isTapMovement = input.distance < 2, isTapTouchTime = input.deltaTime < 250;
                if (isTapPointer && isTapMovement && isTapTouchTime) return;
            }
            return hasPanX && hasPanY ? void 0 : hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL ? this.preventSrc(srcEvent) : void 0;
        },
        preventSrc: function(srcEvent) {
            this.manager.session.prevented = !0, srcEvent.preventDefault();
        }
    };
    var STATE_POSSIBLE = 1, STATE_BEGAN = 2, STATE_CHANGED = 4, STATE_ENDED = 8, STATE_RECOGNIZED = STATE_ENDED, STATE_CANCELLED = 16, STATE_FAILED = 32;
    Recognizer.prototype = {
        defaults: {},
        set: function(options) {
            return assign(this.options, options), this.manager && this.manager.touchAction.update(), 
            this;
        },
        recognizeWith: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, "recognizeWith", this)) return this;
            var simultaneous = this.simultaneous;
            return otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this), simultaneous[otherRecognizer.id] || (simultaneous[otherRecognizer.id] = otherRecognizer, 
            otherRecognizer.recognizeWith(this)), this;
        },
        dropRecognizeWith: function(otherRecognizer) {
            return invokeArrayArg(otherRecognizer, "dropRecognizeWith", this) ? this : (otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this), 
            delete this.simultaneous[otherRecognizer.id], this);
        },
        requireFailure: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, "requireFailure", this)) return this;
            var requireFail = this.requireFail;
            return otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this), -1 === inArray(requireFail, otherRecognizer) && (requireFail.push(otherRecognizer), 
            otherRecognizer.requireFailure(this)), this;
        },
        dropRequireFailure: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, "dropRequireFailure", this)) return this;
            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
            var index = inArray(this.requireFail, otherRecognizer);
            return index > -1 && this.requireFail.splice(index, 1), this;
        },
        hasRequireFailures: function() {
            return this.requireFail.length > 0;
        },
        canRecognizeWith: function(otherRecognizer) {
            return !!this.simultaneous[otherRecognizer.id];
        },
        emit: function(input) {
            function emit(event) {
                self.manager.emit(event, input);
            }
            var self = this, state = this.state;
            state < STATE_ENDED && emit(self.options.event + stateStr(state)), emit(self.options.event), 
            input.additionalEvent && emit(input.additionalEvent), state >= STATE_ENDED && emit(self.options.event + stateStr(state));
        },
        tryEmit: function(input) {
            if (this.canEmit()) return this.emit(input);
            this.state = STATE_FAILED;
        },
        canEmit: function() {
            for (var i = 0; i < this.requireFail.length; ) {
                if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) return !1;
                i++;
            }
            return !0;
        },
        recognize: function(inputData) {
            var inputDataClone = assign({}, inputData);
            if (!boolOrFn(this.options.enable, [ this, inputDataClone ])) return this.reset(), 
            void (this.state = STATE_FAILED);
            this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED) && (this.state = STATE_POSSIBLE), 
            this.state = this.process(inputDataClone), this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED) && this.tryEmit(inputDataClone);
        },
        process: function(inputData) {},
        getTouchAction: function() {},
        reset: function() {}
    }, inherit(AttrRecognizer, Recognizer, {
        defaults: {
            pointers: 1
        },
        attrTest: function(input) {
            var optionPointers = this.options.pointers;
            return 0 === optionPointers || input.pointers.length === optionPointers;
        },
        process: function(input) {
            var state = this.state, eventType = input.eventType, isRecognized = state & (STATE_BEGAN | STATE_CHANGED), isValid = this.attrTest(input);
            return isRecognized && (eventType & INPUT_CANCEL || !isValid) ? state | STATE_CANCELLED : isRecognized || isValid ? eventType & INPUT_END ? state | STATE_ENDED : state & STATE_BEGAN ? state | STATE_CHANGED : STATE_BEGAN : STATE_FAILED;
        }
    }), inherit(PanRecognizer, AttrRecognizer, {
        defaults: {
            event: "pan",
            threshold: 10,
            pointers: 1,
            direction: DIRECTION_ALL
        },
        getTouchAction: function() {
            var direction = this.options.direction, actions = [];
            return direction & DIRECTION_HORIZONTAL && actions.push(TOUCH_ACTION_PAN_Y), direction & DIRECTION_VERTICAL && actions.push(TOUCH_ACTION_PAN_X), 
            actions;
        },
        directionTest: function(input) {
            var options = this.options, hasMoved = !0, distance = input.distance, direction = input.direction, x = input.deltaX, y = input.deltaY;
            return direction & options.direction || (options.direction & DIRECTION_HORIZONTAL ? (direction = 0 === x ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT, 
            hasMoved = x != this.pX, distance = Math.abs(input.deltaX)) : (direction = 0 === y ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN, 
            hasMoved = y != this.pY, distance = Math.abs(input.deltaY))), input.direction = direction, 
            hasMoved && distance > options.threshold && direction & options.direction;
        },
        attrTest: function(input) {
            return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input));
        },
        emit: function(input) {
            this.pX = input.deltaX, this.pY = input.deltaY;
            var direction = directionStr(input.direction);
            direction && (input.additionalEvent = this.options.event + direction), this._super.emit.call(this, input);
        }
    }), inherit(PinchRecognizer, AttrRecognizer, {
        defaults: {
            event: "pinch",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function() {
            return [ TOUCH_ACTION_NONE ];
        },
        attrTest: function(input) {
            return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
        },
        emit: function(input) {
            if (1 !== input.scale) {
                var inOut = input.scale < 1 ? "in" : "out";
                input.additionalEvent = this.options.event + inOut;
            }
            this._super.emit.call(this, input);
        }
    }), inherit(PressRecognizer, Recognizer, {
        defaults: {
            event: "press",
            pointers: 1,
            time: 251,
            threshold: 9
        },
        getTouchAction: function() {
            return [ TOUCH_ACTION_AUTO ];
        },
        process: function(input) {
            var options = this.options, validPointers = input.pointers.length === options.pointers, validMovement = input.distance < options.threshold, validTime = input.deltaTime > options.time;
            if (this._input = input, !validMovement || !validPointers || input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime) this.reset(); else if (input.eventType & INPUT_START) this.reset(), 
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED, this.tryEmit();
            }, options.time, this); else if (input.eventType & INPUT_END) return STATE_RECOGNIZED;
            return STATE_FAILED;
        },
        reset: function() {
            clearTimeout(this._timer);
        },
        emit: function(input) {
            this.state === STATE_RECOGNIZED && (input && input.eventType & INPUT_END ? this.manager.emit(this.options.event + "up", input) : (this._input.timeStamp = now(), 
            this.manager.emit(this.options.event, this._input)));
        }
    }), inherit(RotateRecognizer, AttrRecognizer, {
        defaults: {
            event: "rotate",
            threshold: 0,
            pointers: 2
        },
        getTouchAction: function() {
            return [ TOUCH_ACTION_NONE ];
        },
        attrTest: function(input) {
            return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
        }
    }), inherit(SwipeRecognizer, AttrRecognizer, {
        defaults: {
            event: "swipe",
            threshold: 10,
            velocity: .3,
            direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
            pointers: 1
        },
        getTouchAction: function() {
            return PanRecognizer.prototype.getTouchAction.call(this);
        },
        attrTest: function(input) {
            var velocity, direction = this.options.direction;
            return direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL) ? velocity = input.overallVelocity : direction & DIRECTION_HORIZONTAL ? velocity = input.overallVelocityX : direction & DIRECTION_VERTICAL && (velocity = input.overallVelocityY), 
            this._super.attrTest.call(this, input) && direction & input.offsetDirection && input.distance > this.options.threshold && input.maxPointers == this.options.pointers && abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
        },
        emit: function(input) {
            var direction = directionStr(input.offsetDirection);
            direction && this.manager.emit(this.options.event + direction, input), this.manager.emit(this.options.event, input);
        }
    }), inherit(TapRecognizer, Recognizer, {
        defaults: {
            event: "tap",
            pointers: 1,
            taps: 1,
            interval: 300,
            time: 250,
            threshold: 9,
            posThreshold: 10
        },
        getTouchAction: function() {
            return [ TOUCH_ACTION_MANIPULATION ];
        },
        process: function(input) {
            var options = this.options, validPointers = input.pointers.length === options.pointers, validMovement = input.distance < options.threshold, validTouchTime = input.deltaTime < options.time;
            if (this.reset(), input.eventType & INPUT_START && 0 === this.count) return this.failTimeout();
            if (validMovement && validTouchTime && validPointers) {
                if (input.eventType != INPUT_END) return this.failTimeout();
                var validInterval = !this.pTime || input.timeStamp - this.pTime < options.interval, validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
                this.pTime = input.timeStamp, this.pCenter = input.center, validMultiTap && validInterval ? this.count += 1 : this.count = 1, 
                this._input = input;
                if (0 === this.count % options.taps) return this.hasRequireFailures() ? (this._timer = setTimeoutContext(function() {
                    this.state = STATE_RECOGNIZED, this.tryEmit();
                }, options.interval, this), STATE_BEGAN) : STATE_RECOGNIZED;
            }
            return STATE_FAILED;
        },
        failTimeout: function() {
            return this._timer = setTimeoutContext(function() {
                this.state = STATE_FAILED;
            }, this.options.interval, this), STATE_FAILED;
        },
        reset: function() {
            clearTimeout(this._timer);
        },
        emit: function() {
            this.state == STATE_RECOGNIZED && (this._input.tapCount = this.count, this.manager.emit(this.options.event, this._input));
        }
    }), Hammer.VERSION = "{{PKG_VERSION}}", Hammer.defaults = {
        domEvents: !1,
        touchAction: TOUCH_ACTION_COMPUTE,
        enable: !0,
        inputTarget: null,
        inputClass: null,
        preset: [ [ RotateRecognizer, {
            enable: !1
        } ], [ PinchRecognizer, {
            enable: !1
        }, [ "rotate" ] ], [ SwipeRecognizer, {
            direction: DIRECTION_HORIZONTAL
        } ], [ PanRecognizer, {
            direction: DIRECTION_HORIZONTAL
        }, [ "swipe" ] ], [ TapRecognizer ], [ TapRecognizer, {
            event: "doubletap",
            taps: 2
        }, [ "tap" ] ], [ PressRecognizer ] ],
        cssProps: {
            userSelect: "none",
            touchSelect: "none",
            touchCallout: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    };
    var STOP = 1, FORCED_STOP = 2;
    Manager.prototype = {
        set: function(options) {
            return assign(this.options, options), options.touchAction && this.touchAction.update(), 
            options.inputTarget && (this.input.destroy(), this.input.target = options.inputTarget, 
            this.input.init()), this;
        },
        stop: function(force) {
            this.session.stopped = force ? FORCED_STOP : STOP;
        },
        recognize: function(inputData) {
            var session = this.session;
            if (!session.stopped) {
                this.touchAction.preventDefaults(inputData);
                var recognizer, recognizers = this.recognizers, curRecognizer = session.curRecognizer;
                (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) && (curRecognizer = session.curRecognizer = null);
                for (var i = 0; i < recognizers.length; ) recognizer = recognizers[i], session.stopped === FORCED_STOP || curRecognizer && recognizer != curRecognizer && !recognizer.canRecognizeWith(curRecognizer) ? recognizer.reset() : recognizer.recognize(inputData), 
                !curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED) && (curRecognizer = session.curRecognizer = recognizer), 
                i++;
            }
        },
        get: function(recognizer) {
            if (recognizer instanceof Recognizer) return recognizer;
            for (var recognizers = this.recognizers, i = 0; i < recognizers.length; i++) if (recognizers[i].options.event == recognizer) return recognizers[i];
            return null;
        },
        add: function(recognizer) {
            if (invokeArrayArg(recognizer, "add", this)) return this;
            var existing = this.get(recognizer.options.event);
            return existing && this.remove(existing), this.recognizers.push(recognizer), recognizer.manager = this, 
            this.touchAction.update(), recognizer;
        },
        remove: function(recognizer) {
            if (invokeArrayArg(recognizer, "remove", this)) return this;
            if (recognizer = this.get(recognizer)) {
                var recognizers = this.recognizers, index = inArray(recognizers, recognizer);
                -1 !== index && (recognizers.splice(index, 1), this.touchAction.update());
            }
            return this;
        },
        on: function(events, handler) {
            if (void 0 !== events && void 0 !== handler) {
                var handlers = this.handlers;
                return each(splitStr(events), function(event) {
                    handlers[event] = handlers[event] || [], handlers[event].push(handler);
                }), this;
            }
        },
        off: function(events, handler) {
            if (void 0 !== events) {
                var handlers = this.handlers;
                return each(splitStr(events), function(event) {
                    handler ? handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1) : delete handlers[event];
                }), this;
            }
        },
        emit: function(event, data) {
            this.options.domEvents && triggerDomEvent(event, data);
            var handlers = this.handlers[event] && this.handlers[event].slice();
            if (handlers && handlers.length) {
                data.type = event, data.preventDefault = function() {
                    data.srcEvent.preventDefault();
                };
                for (var i = 0; i < handlers.length; ) handlers[i](data), i++;
            }
        },
        destroy: function() {
            this.element && toggleCssProps(this, !1), this.handlers = {}, this.session = {}, 
            this.input.destroy(), this.element = null;
        }
    }, assign(Hammer, {
        INPUT_START: INPUT_START,
        INPUT_MOVE: INPUT_MOVE,
        INPUT_END: INPUT_END,
        INPUT_CANCEL: INPUT_CANCEL,
        STATE_POSSIBLE: STATE_POSSIBLE,
        STATE_BEGAN: STATE_BEGAN,
        STATE_CHANGED: STATE_CHANGED,
        STATE_ENDED: STATE_ENDED,
        STATE_RECOGNIZED: STATE_RECOGNIZED,
        STATE_CANCELLED: STATE_CANCELLED,
        STATE_FAILED: STATE_FAILED,
        DIRECTION_NONE: DIRECTION_NONE,
        DIRECTION_LEFT: DIRECTION_LEFT,
        DIRECTION_RIGHT: DIRECTION_RIGHT,
        DIRECTION_UP: DIRECTION_UP,
        DIRECTION_DOWN: DIRECTION_DOWN,
        DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
        DIRECTION_VERTICAL: DIRECTION_VERTICAL,
        DIRECTION_ALL: DIRECTION_ALL,
        Manager: Manager,
        Input: Input,
        TouchAction: TouchAction,
        TouchInput: TouchInput,
        MouseInput: MouseInput,
        PointerEventInput: PointerEventInput,
        TouchMouseInput: TouchMouseInput,
        SingleTouchInput: SingleTouchInput,
        Recognizer: Recognizer,
        AttrRecognizer: AttrRecognizer,
        Tap: TapRecognizer,
        Pan: PanRecognizer,
        Swipe: SwipeRecognizer,
        Pinch: PinchRecognizer,
        Rotate: RotateRecognizer,
        Press: PressRecognizer,
        on: addEventListeners,
        off: removeEventListeners,
        each: each,
        merge: merge,
        extend: extend,
        assign: assign,
        inherit: inherit,
        bindFn: bindFn,
        prefixed: prefixed
    });
    var freeGlobal = "undefined" != typeof window ? window : "undefined" != typeof self ? self : {};
    freeGlobal.Hammer = Hammer, "function" == typeof define && define.amd ? define(function() {
        return Hammer;
    }) : "undefined" != typeof module && module.exports ? module.exports = Hammer : window.Hammer = Hammer, 
    exports.VENDOR_PREFIXES = VENDOR_PREFIXES, exports.TEST_ELEMENT = TEST_ELEMENT, 
    exports.TYPE_FUNCTION = TYPE_FUNCTION, exports.round = round, exports.abs = abs, 
    exports.now = now, exports.setTimeoutContext = setTimeoutContext, exports.invokeArrayArg = invokeArrayArg, 
    exports.each = each, exports.deprecate = deprecate, exports.assign = assign, exports.extend = extend, 
    exports.merge = merge, exports.inherit = inherit, exports.bindFn = bindFn, exports.boolOrFn = boolOrFn, 
    exports.ifUndefined = ifUndefined, exports.addEventListeners = addEventListeners, 
    exports.removeEventListeners = removeEventListeners, exports.hasParent = hasParent, 
    exports.inStr = inStr, exports.splitStr = splitStr, exports.inArray = inArray, exports.toArray = toArray, 
    exports.uniqueArray = uniqueArray, exports.prefixed = prefixed, exports._uniqueId = _uniqueId, 
    exports.uniqueId = uniqueId, exports.getWindowForElement = getWindowForElement, 
    exports.MOBILE_REGEX = MOBILE_REGEX, exports.SUPPORT_TOUCH = SUPPORT_TOUCH, exports.SUPPORT_POINTER_EVENTS = SUPPORT_POINTER_EVENTS, 
    exports.SUPPORT_ONLY_TOUCH = SUPPORT_ONLY_TOUCH, exports.INPUT_TYPE_TOUCH = INPUT_TYPE_TOUCH, 
    exports.INPUT_TYPE_PEN = INPUT_TYPE_PEN, exports.INPUT_TYPE_MOUSE = INPUT_TYPE_MOUSE, 
    exports.INPUT_TYPE_KINECT = INPUT_TYPE_KINECT, exports.COMPUTE_INTERVAL = COMPUTE_INTERVAL, 
    exports.INPUT_START = INPUT_START, exports.INPUT_MOVE = INPUT_MOVE, exports.INPUT_END = INPUT_END, 
    exports.INPUT_CANCEL = INPUT_CANCEL, exports.DIRECTION_NONE = DIRECTION_NONE, exports.DIRECTION_LEFT = DIRECTION_LEFT, 
    exports.DIRECTION_RIGHT = DIRECTION_RIGHT, exports.DIRECTION_UP = DIRECTION_UP, 
    exports.DIRECTION_DOWN = DIRECTION_DOWN, exports.DIRECTION_HORIZONTAL = DIRECTION_HORIZONTAL, 
    exports.DIRECTION_VERTICAL = DIRECTION_VERTICAL, exports.DIRECTION_ALL = DIRECTION_ALL, 
    exports.PROPS_XY = PROPS_XY, exports.PROPS_CLIENT_XY = PROPS_CLIENT_XY, exports.Input = Input, 
    exports.createInputInstance = createInputInstance, exports.inputHandler = inputHandler, 
    exports.computeInputData = computeInputData, exports.computeDeltaXY = computeDeltaXY, 
    exports.computeIntervalInputData = computeIntervalInputData, exports.simpleCloneInputData = simpleCloneInputData, 
    exports.getCenter = getCenter, exports.getVelocity = getVelocity, exports.getDirection = getDirection, 
    exports.getDistance = getDistance, exports.getAngle = getAngle, exports.getRotation = getRotation, 
    exports.getScale = getScale, exports.MOUSE_INPUT_MAP = MOUSE_INPUT_MAP, exports.MOUSE_ELEMENT_EVENTS = MOUSE_ELEMENT_EVENTS, 
    exports.MOUSE_WINDOW_EVENTS = MOUSE_WINDOW_EVENTS, exports.MouseInput = MouseInput, 
    exports.POINTER_INPUT_MAP = POINTER_INPUT_MAP, exports.IE10_POINTER_TYPE_ENUM = IE10_POINTER_TYPE_ENUM, 
    exports.POINTER_ELEMENT_EVENTS = POINTER_ELEMENT_EVENTS, exports.POINTER_WINDOW_EVENTS = POINTER_WINDOW_EVENTS, 
    exports.PointerEventInput = PointerEventInput, exports.SINGLE_TOUCH_INPUT_MAP = SINGLE_TOUCH_INPUT_MAP, 
    exports.SINGLE_TOUCH_TARGET_EVENTS = SINGLE_TOUCH_TARGET_EVENTS, exports.SINGLE_TOUCH_WINDOW_EVENTS = SINGLE_TOUCH_WINDOW_EVENTS, 
    exports.SingleTouchInput = SingleTouchInput, exports.normalizeSingleTouches = normalizeSingleTouches, 
    exports.TOUCH_INPUT_MAP = TOUCH_INPUT_MAP, exports.TOUCH_TARGET_EVENTS = TOUCH_TARGET_EVENTS, 
    exports.TouchInput = TouchInput, exports.getTouches = getTouches, exports.DEDUP_TIMEOUT = DEDUP_TIMEOUT, 
    exports.DEDUP_DISTANCE = DEDUP_DISTANCE, exports.TouchMouseInput = TouchMouseInput, 
    exports.recordTouches = recordTouches, exports.setLastTouch = setLastTouch, exports.isSyntheticEvent = isSyntheticEvent, 
    exports.PREFIXED_TOUCH_ACTION = PREFIXED_TOUCH_ACTION, exports.NATIVE_TOUCH_ACTION = NATIVE_TOUCH_ACTION, 
    exports.TOUCH_ACTION_COMPUTE = TOUCH_ACTION_COMPUTE, exports.TOUCH_ACTION_AUTO = TOUCH_ACTION_AUTO, 
    exports.TOUCH_ACTION_MANIPULATION = TOUCH_ACTION_MANIPULATION, exports.TOUCH_ACTION_NONE = TOUCH_ACTION_NONE, 
    exports.TOUCH_ACTION_PAN_X = TOUCH_ACTION_PAN_X, exports.TOUCH_ACTION_PAN_Y = TOUCH_ACTION_PAN_Y, 
    exports.TOUCH_ACTION_MAP = TOUCH_ACTION_MAP, exports.TouchAction = TouchAction, 
    exports.cleanTouchActions = cleanTouchActions, exports.getTouchActionProps = getTouchActionProps, 
    exports.STATE_POSSIBLE = STATE_POSSIBLE, exports.STATE_BEGAN = STATE_BEGAN, exports.STATE_CHANGED = STATE_CHANGED, 
    exports.STATE_ENDED = STATE_ENDED, exports.STATE_RECOGNIZED = STATE_RECOGNIZED, 
    exports.STATE_CANCELLED = STATE_CANCELLED, exports.STATE_FAILED = STATE_FAILED, 
    exports.Recognizer = Recognizer, exports.stateStr = stateStr, exports.directionStr = directionStr, 
    exports.getRecognizerByNameIfManager = getRecognizerByNameIfManager, exports.AttrRecognizer = AttrRecognizer, 
    exports.PanRecognizer = PanRecognizer, exports.PinchRecognizer = PinchRecognizer, 
    exports.PressRecognizer = PressRecognizer, exports.RotateRecognizer = RotateRecognizer, 
    exports.SwipeRecognizer = SwipeRecognizer, exports.TapRecognizer = TapRecognizer, 
    exports.Hammer = Hammer, exports.STOP = STOP, exports.FORCED_STOP = FORCED_STOP, 
    exports.Manager = Manager, exports.toggleCssProps = toggleCssProps, exports.triggerDomEvent = triggerDomEvent, 
    exports.freeGlobal = freeGlobal, global.$H = exports;
}({}, function() {
    return this;
}());