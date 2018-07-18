/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/

(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());
/*!
 * jQuery blockUI plugin
 * Version 2.70.0-2014.11.23
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */


;(function() {
/*jshint eqeqeq:false curly:false latedef:false */
"use strict";

	function setup($) {
		$.fn._fadeIn = $.fn.fadeIn;

		var noOp = $.noop || function() {};

		// this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
		// confusing userAgent strings on Vista)
		var msie = /MSIE/.test(navigator.userAgent);
		var ie6  = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
		var mode = document.documentMode || 0;
		var setExpr = $.isFunction( document.createElement('div').style.setExpression );

		// global $ methods for blocking/unblocking the entire page
		$.blockUI   = function(opts) { install(window, opts); };
		$.unblockUI = function(opts) { remove(window, opts); };

		// convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
		$.growlUI = function(title, message, timeout, onClose) {
			var $m = $('<div class="growlUI"></div>');
			if (title) $m.append('<h1>'+title+'</h1>');
			if (message) $m.append('<h2>'+message+'</h2>');
			if (timeout === undefined) timeout = 3000;

			// Added by konapun: Set timeout to 30 seconds if this growl is moused over, like normal toast notifications
			var callBlock = function(opts) {
				opts = opts || {};

				$.blockUI({
					message: $m,
					fadeIn : typeof opts.fadeIn  !== 'undefined' ? opts.fadeIn  : 700,
					fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
					timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
					centerY: false,
					showOverlay: false,
					onUnblock: onClose,
					css: $.blockUI.defaults.growlCSS
				});
			};

			callBlock();
			var nonmousedOpacity = $m.css('opacity');
			$m.mouseover(function() {
				callBlock({
					fadeIn: 0,
					timeout: 30000
				});

				var displayBlock = $('.blockMsg');
				displayBlock.stop(); // cancel fadeout if it has started
				displayBlock.fadeTo(300, 1); // make it easier to read the message by removing transparency
			}).mouseout(function() {
				$('.blockMsg').fadeOut(1000);
			});
			// End konapun additions
		};

		// plugin method for blocking element content
		$.fn.block = function(opts) {
			if ( this[0] === window ) {
				$.blockUI( opts );
				return this;
			}
			var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
			this.each(function() {
				var $el = $(this);
				if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
					return;
				$el.unblock({ fadeOut: 0 });
			});

			return this.each(function() {
				if ($.css(this,'position') == 'static') {
					this.style.position = 'relative';
					$(this).data('blockUI.static', true);
				}
				this.style.zoom = 1; // force 'hasLayout' in ie
				install(this, opts);
			});
		};

		// plugin method for unblocking element content
		$.fn.unblock = function(opts) {
			if ( this[0] === window ) {
				$.unblockUI( opts );
				return this;
			}
			return this.each(function() {
				remove(this, opts);
			});
		};

		$.blockUI.version = 2.70; // 2nd generation blocking at no extra cost!

		// override these in your code to change the default behavior and style
		$.blockUI.defaults = {
			// message displayed when blocking (use null for no message)
			message:  '<h1>Please wait...</h1>',

			title: null,		// title string; only used when theme == true
			draggable: true,	// only used when theme == true (requires jquery-ui.js to be loaded)

			theme: false, // set to true to use with jQuery UI themes

			// styles for the message when blocking; if you wish to disable
			// these and use an external stylesheet then do this in your code:
			// $.blockUI.defaults.css = {};
			css: {
				padding:	0,
				margin:		0,
				width:		'30%',
				top:		'40%',
				left:		'35%',
				textAlign:	'center',
				color:		'#000',
				border:		'3px solid #aaa',
				backgroundColor:'#fff',
				cursor:		'wait'
			},

			// minimal style set used when themes are used
			themedCSS: {
				width:	'30%',
				top:	'40%',
				left:	'35%'
			},

			// styles for the overlay
			overlayCSS:  {
				backgroundColor:	'#000',
				opacity:			0.6,
				cursor:				'wait'
			},

			// style to replace wait cursor before unblocking to correct issue
			// of lingering wait cursor
			cursorReset: 'default',

			// styles applied when using $.growlUI
			growlCSS: {
				width:		'350px',
				top:		'10px',
				left:		'',
				right:		'10px',
				border:		'none',
				padding:	'5px',
				opacity:	0.6,
				cursor:		'default',
				color:		'#fff',
				backgroundColor: '#000',
				'-webkit-border-radius':'10px',
				'-moz-border-radius':	'10px',
				'border-radius':		'10px'
			},

			// IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
			// (hat tip to Jorge H. N. de Vasconcelos)
			/*jshint scripturl:true */
			iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

			// force usage of iframe in non-IE browsers (handy for blocking applets)
			forceIframe: false,

			// z-index for the blocking overlay
			baseZ: 1000,

			// set these to true to have the message automatically centered
			centerX: true, // <-- only effects element blocking (page block controlled via css above)
			centerY: true,

			// allow body element to be stetched in ie6; this makes blocking look better
			// on "short" pages.  disable if you wish to prevent changes to the body height
			allowBodyStretch: true,

			// enable if you want key and mouse events to be disabled for content that is blocked
			bindEvents: true,

			// be default blockUI will supress tab navigation from leaving blocking content
			// (if bindEvents is true)
			constrainTabKey: true,

			// fadeIn time in millis; set to 0 to disable fadeIn on block
			fadeIn:  200,

			// fadeOut time in millis; set to 0 to disable fadeOut on unblock
			fadeOut:  400,

			// time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
			timeout: 0,

			// disable if you don't want to show the overlay
			showOverlay: true,

			// if true, focus will be placed in the first available input field when
			// page blocking
			focusInput: true,

            // elements that can receive focus
            focusableElements: ':input:enabled:visible',

			// suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
			// no longer needed in 2012
			// applyPlatformOpacityRules: true,

			// callback method invoked when fadeIn has completed and blocking message is visible
			onBlock: null,

			// callback method invoked when unblocking has completed; the callback is
			// passed the element that has been unblocked (which is the window object for page
			// blocks) and the options that were passed to the unblock call:
			//	onUnblock(element, options)
			onUnblock: null,

			// callback method invoked when the overlay area is clicked.
			// setting this will turn the cursor to a pointer, otherwise cursor defined in overlayCss will be used.
			onOverlayClick: null,

			// don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
			quirksmodeOffsetHack: 4,

			// class name of the message block
			blockMsgClass: 'blockMsg',

			// if it is already blocked, then ignore it (don't unblock and reblock)
			ignoreIfBlocked: false
		};

		// private data and functions follow...

		var pageBlock = null;
		var pageBlockEls = [];

		function install(el, opts) {
			var css, themedCSS;
			var full = (el == window);
			var msg = (opts && opts.message !== undefined ? opts.message : undefined);
			opts = $.extend({}, $.blockUI.defaults, opts || {});

			if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
				return;

			opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
			css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
			if (opts.onOverlayClick)
				opts.overlayCSS.cursor = 'pointer';

			themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
			msg = msg === undefined ? opts.message : msg;

			// remove the current block (if there is one)
			if (full && pageBlock)
				remove(window, {fadeOut:0});

			// if an existing element is being used as the blocking content then we capture
			// its current place in the DOM (and current display style) so we can restore
			// it when we unblock
			if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
				var node = msg.jquery ? msg[0] : msg;
				var data = {};
				$(el).data('blockUI.history', data);
				data.el = node;
				data.parent = node.parentNode;
				data.display = node.style.display;
				data.position = node.style.position;
				if (data.parent)
					data.parent.removeChild(node);
			}

			$(el).data('blockUI.onUnblock', opts.onUnblock);
			var z = opts.baseZ;

			// blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
			// layer1 is the iframe layer which is used to supress bleed through of underlying content
			// layer2 is the overlay layer which has opacity and a wait cursor (by default)
			// layer3 is the message content that is displayed while blocking
			var lyr1, lyr2, lyr3, s;
			if (msie || opts.forceIframe)
				lyr1 = $('<iframe class="blockUI" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>');
			else
				lyr1 = $('<div class="blockUI" style="display:none"></div>');

			if (opts.theme)
				lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+ (z++) +';display:none"></div>');
			else
				lyr2 = $('<div class="blockUI blockOverlay" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

			if (opts.theme && full) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:fixed">';
				if ( opts.title ) {
					s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
				}
				s += '<div class="ui-widget-content ui-dialog-content"></div>';
				s += '</div>';
			}
			else if (opts.theme) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:absolute">';
				if ( opts.title ) {
					s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
				}
				s += '<div class="ui-widget-content ui-dialog-content"></div>';
				s += '</div>';
			}
			else if (full) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:'+(z+10)+';display:none;position:fixed"></div>';
			}
			else {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:'+(z+10)+';display:none;position:absolute"></div>';
			}
			lyr3 = $(s);

			// if we have a message, style it
			if (msg) {
				if (opts.theme) {
					lyr3.css(themedCSS);
					lyr3.addClass('ui-widget-content');
				}
				else
					lyr3.css(css);
			}

			// style the overlay
			if (!opts.theme /*&& (!opts.applyPlatformOpacityRules)*/)
				lyr2.css(opts.overlayCSS);
			lyr2.css('position', full ? 'fixed' : 'absolute');

			// make iframe layer transparent in IE
			if (msie || opts.forceIframe)
				lyr1.css('opacity',0.0);

			//$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
			var layers = [lyr1,lyr2,lyr3], $par = full ? $('body') : $(el);
			$.each(layers, function() {
				this.appendTo($par);
			});

			if (opts.theme && opts.draggable && $.fn.draggable) {
				lyr3.draggable({
					handle: '.ui-dialog-titlebar',
					cancel: 'li'
				});
			}

			// ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
			var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
			if (ie6 || expr) {
				// give body 100% height
				if (full && opts.allowBodyStretch && $.support.boxModel)
					$('html,body').css('height','100%');

				// fix ie6 issue when blocked element has a border width
				if ((ie6 || !$.support.boxModel) && !full) {
					var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
					var fixT = t ? '(0 - '+t+')' : 0;
					var fixL = l ? '(0 - '+l+')' : 0;
				}

				// simulate fixed position
				$.each(layers, function(i,o) {
					var s = o[0].style;
					s.position = 'absolute';
					if (i < 2) {
						if (full)
							s.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"');
						else
							s.setExpression('height','this.parentNode.offsetHeight + "px"');
						if (full)
							s.setExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
						else
							s.setExpression('width','this.parentNode.offsetWidth + "px"');
						if (fixL) s.setExpression('left', fixL);
						if (fixT) s.setExpression('top', fixT);
					}
					else if (opts.centerY) {
						if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
						s.marginTop = 0;
					}
					else if (!opts.centerY && full) {
						var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
						var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
						s.setExpression('top',expression);
					}
				});
			}

			// show the message
			if (msg) {
				if (opts.theme)
					lyr3.find('.ui-widget-content').append(msg);
				else
					lyr3.append(msg);
				if (msg.jquery || msg.nodeType)
					$(msg).show();
			}

			if ((msie || opts.forceIframe) && opts.showOverlay)
				lyr1.show(); // opacity is zero
			if (opts.fadeIn) {
				var cb = opts.onBlock ? opts.onBlock : noOp;
				var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
				var cb2 = msg ? cb : noOp;
				if (opts.showOverlay)
					lyr2._fadeIn(opts.fadeIn, cb1);
				if (msg)
					lyr3._fadeIn(opts.fadeIn, cb2);
			}
			else {
				if (opts.showOverlay)
					lyr2.show();
				if (msg)
					lyr3.show();
				if (opts.onBlock)
					opts.onBlock.bind(lyr3)();
			}

			// bind key and mouse events
			bind(1, el, opts);

			if (full) {
				pageBlock = lyr3[0];
				pageBlockEls = $(opts.focusableElements,pageBlock);
				if (opts.focusInput)
					setTimeout(focus, 20);
			}
			else
				center(lyr3[0], opts.centerX, opts.centerY);

			if (opts.timeout) {
				// auto-unblock
				var to = setTimeout(function() {
					if (full)
						$.unblockUI(opts);
					else
						$(el).unblock(opts);
				}, opts.timeout);
				$(el).data('blockUI.timeout', to);
			}
		}

		// remove the block
		function remove(el, opts) {
			var count;
			var full = (el == window);
			var $el = $(el);
			var data = $el.data('blockUI.history');
			var to = $el.data('blockUI.timeout');
			if (to) {
				clearTimeout(to);
				$el.removeData('blockUI.timeout');
			}
			opts = $.extend({}, $.blockUI.defaults, opts || {});
			bind(0, el, opts); // unbind events

			if (opts.onUnblock === null) {
				opts.onUnblock = $el.data('blockUI.onUnblock');
				$el.removeData('blockUI.onUnblock');
			}

			var els;
			if (full) // crazy selector to handle odd field errors in ie6/7
				els = $('body').children().filter('.blockUI').add('body > .blockUI');
			else
				els = $el.find('>.blockUI');

			// fix cursor issue
			if ( opts.cursorReset ) {
				if ( els.length > 1 )
					els[1].style.cursor = opts.cursorReset;
				if ( els.length > 2 )
					els[2].style.cursor = opts.cursorReset;
			}

			if (full)
				pageBlock = pageBlockEls = null;

			if (opts.fadeOut) {
				count = els.length;
				els.stop().fadeOut(opts.fadeOut, function() {
					if ( --count === 0)
						reset(els,data,opts,el);
				});
			}
			else
				reset(els, data, opts, el);
		}

		// move blocking element back into the DOM where it started
		function reset(els,data,opts,el) {
			var $el = $(el);
			if ( $el.data('blockUI.isBlocked') )
				return;

			els.each(function(i,o) {
				// remove via DOM calls so we don't lose event handlers
				if (this.parentNode)
					this.parentNode.removeChild(this);
			});

			if (data && data.el) {
				data.el.style.display = data.display;
				data.el.style.position = data.position;
				data.el.style.cursor = 'default'; // #59
				if (data.parent)
					data.parent.appendChild(data.el);
				$el.removeData('blockUI.history');
			}

			if ($el.data('blockUI.static')) {
				$el.css('position', 'static'); // #22
			}

			if (typeof opts.onUnblock == 'function')
				opts.onUnblock(el,opts);

			// fix issue in Safari 6 where block artifacts remain until reflow
			var body = $(document.body), w = body.width(), cssW = body[0].style.width;
			body.width(w-1).width(w);
			body[0].style.width = cssW;
		}

		// bind/unbind the handler
		function bind(b, el, opts) {
			var full = el == window, $el = $(el);

			// don't bother unbinding if there is nothing to unbind
			if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
				return;

			$el.data('blockUI.isBlocked', b);

			// don't bind events when overlay is not in use or if bindEvents is false
			if (!full || !opts.bindEvents || (b && !opts.showOverlay))
				return;

			// bind anchors and inputs for mouse and key events
			var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
			if (b)
				$(document).bind(events, opts, handler);
			else
				$(document).unbind(events, handler);

		// former impl...
		//		var $e = $('a,:input');
		//		b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
		}

		// event handler to suppress keyboard/mouse events when blocking
		function handler(e) {
			// allow tab navigation (conditionally)
			if (e.type === 'keydown' && e.keyCode && e.keyCode == 9) {
				if (pageBlock && e.data.constrainTabKey) {
					var els = pageBlockEls;
					var fwd = !e.shiftKey && e.target === els[els.length-1];
					var back = e.shiftKey && e.target === els[0];
					if (fwd || back) {
						setTimeout(function(){focus(back);},10);
						return false;
					}
				}
			}
			var opts = e.data;
			var target = $(e.target);
			if (target.hasClass('blockOverlay') && opts.onOverlayClick)
				opts.onOverlayClick(e);

			// allow events within the message content
			if (target.parents('div.' + opts.blockMsgClass).length > 0)
				return true;

			// allow events for content that is not being blocked
			return target.parents().children().filter('div.blockUI').length === 0;
		}

		function focus(back) {
			if (!pageBlockEls)
				return;
			var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
			if (e)
				e.focus();
		}

		function center(el, x, y) {
			var p = el.parentNode, s = el.style;
			var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
			var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
			if (x) s.left = l > 0 ? (l+'px') : '0';
			if (y) s.top  = t > 0 ? (t+'px') : '0';
		}

		function sz(el, p) {
			return parseInt($.css(el,p),10)||0;
		}

	}


	/*global define:true */
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['jquery'], setup);
	} else {
		setup(jQuery);
	}

})();


;(function(window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem, win,
            box = {top: 0, left: 0},
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function(e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = offset(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var scale       = 'scale('+((el.clientWidth / 100) * 10)+')';

            // Support for touch devices
            if ('touches' in e) {
              relativeY   = (e.touches[0].pageY - pos.top);
              relativeX   = (e.touches[0].pageX - pos.left);
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };

            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.className = ripple.className.replace('waves-notransition', '');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale;
            rippleStyle['-moz-transform'] = scale;
            rippleStyle['-ms-transform'] = scale;
            rippleStyle['-o-transform'] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity   = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-moz-transition-timing-function']    = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-o-transition-timing-function']      = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['transition-timing-function']         = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function(e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName('waves-ripple');
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');
            var scale       = ripple.getAttribute('data-scale');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {
                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                    '-webkit-transform': scale,
                    '-moz-transform': scale,
                    '-ms-transform': scale,
                    '-o-transform': scale,
                    'transform': scale,
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {
                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', elementStyle);

                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function(e) {
            var allow = true;

            if (e.type === 'touchstart') {
                TouchHandler.touches += 1; //push
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                setTimeout(function() {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function(e) {
            TouchHandler.allowEvent(e);
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentElement !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
                element = target;
                break;
            } else if (target.classList.contains('waves-effect')) {
                element = target;
                break;
            }
            target = target.parentElement;
        }

        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ('ontouchstart' in window) {
                element.addEventListener('touchend', Effect.hide, false);
                element.addEventListener('touchcancel', Effect.hide, false);
            }

            element.addEventListener('mouseup', Effect.hide, false);
            element.addEventListener('mouseleave', Effect.hide, false);
        }
    }

    Waves.displayEffect = function(options) {
        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        if ('ontouchstart' in window) {
            document.body.addEventListener('touchstart', showEffect, false);
        }

        document.body.addEventListener('mousedown', showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function(element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === 'input') {
            Effect.wrapInput([element]);
            element = element.parentElement;
        }

        if ('ontouchstart' in window) {
            element.addEventListener('touchstart', showEffect, false);
        }

        element.addEventListener('mousedown', showEffect, false);
    };

    window.Waves = Waves;

    document.addEventListener('DOMContentLoaded', function() {
        Waves.displayEffect();
    }, false);

})(window);

/*
Tabs
*/
/*! VelocityJS.org (1.2.2). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */
!function(e){function t(e){var t=e.length,r=$.type(e);return"function"===r||$.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===r||0===t||"number"==typeof t&&t>0&&t-1 in e}if(!e.jQuery){var $=function(e,t){return new $.fn.init(e,t)};$.isWindow=function(e){return null!=e&&e==e.window},$.type=function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?a[o.call(e)]||"object":typeof e},$.isArray=Array.isArray||function(e){return"array"===$.type(e)},$.isPlainObject=function(e){var t;if(!e||"object"!==$.type(e)||e.nodeType||$.isWindow(e))return!1;try{if(e.constructor&&!n.call(e,"constructor")&&!n.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(r){return!1}for(t in e);return void 0===t||n.call(e,t)},$.each=function(e,r,a){var n,o=0,i=e.length,s=t(e);if(a){if(s)for(;i>o&&(n=r.apply(e[o],a),n!==!1);o++);else for(o in e)if(n=r.apply(e[o],a),n===!1)break}else if(s)for(;i>o&&(n=r.call(e[o],o,e[o]),n!==!1);o++);else for(o in e)if(n=r.call(e[o],o,e[o]),n===!1)break;return e},$.data=function(e,t,a){if(void 0===a){var n=e[$.expando],o=n&&r[n];if(void 0===t)return o;if(o&&t in o)return o[t]}else if(void 0!==t){var n=e[$.expando]||(e[$.expando]=++$.uuid);return r[n]=r[n]||{},r[n][t]=a,a}},$.removeData=function(e,t){var a=e[$.expando],n=a&&r[a];n&&$.each(t,function(e,t){delete n[t]})},$.extend=function(){var e,t,r,a,n,o,i=arguments[0]||{},s=1,l=arguments.length,u=!1;for("boolean"==typeof i&&(u=i,i=arguments[s]||{},s++),"object"!=typeof i&&"function"!==$.type(i)&&(i={}),s===l&&(i=this,s--);l>s;s++)if(null!=(n=arguments[s]))for(a in n)e=i[a],r=n[a],i!==r&&(u&&r&&($.isPlainObject(r)||(t=$.isArray(r)))?(t?(t=!1,o=e&&$.isArray(e)?e:[]):o=e&&$.isPlainObject(e)?e:{},i[a]=$.extend(u,o,r)):void 0!==r&&(i[a]=r));return i},$.queue=function(e,r,a){function n(e,r){var a=r||[];return null!=e&&(t(Object(e))?!function(e,t){for(var r=+t.length,a=0,n=e.length;r>a;)e[n++]=t[a++];if(r!==r)for(;void 0!==t[a];)e[n++]=t[a++];return e.length=n,e}(a,"string"==typeof e?[e]:e):[].push.call(a,e)),a}if(e){r=(r||"fx")+"queue";var o=$.data(e,r);return a?(!o||$.isArray(a)?o=$.data(e,r,n(a)):o.push(a),o):o||[]}},$.dequeue=function(e,t){$.each(e.nodeType?[e]:e,function(e,r){t=t||"fx";var a=$.queue(r,t),n=a.shift();"inprogress"===n&&(n=a.shift()),n&&("fx"===t&&a.unshift("inprogress"),n.call(r,function(){$.dequeue(r,t)}))})},$.fn=$.prototype={init:function(e){if(e.nodeType)return this[0]=e,this;throw new Error("Not a DOM node.")},offset:function(){var t=this[0].getBoundingClientRect?this[0].getBoundingClientRect():{top:0,left:0};return{top:t.top+(e.pageYOffset||document.scrollTop||0)-(document.clientTop||0),left:t.left+(e.pageXOffset||document.scrollLeft||0)-(document.clientLeft||0)}},position:function(){function e(){for(var e=this.offsetParent||document;e&&"html"===!e.nodeType.toLowerCase&&"static"===e.style.position;)e=e.offsetParent;return e||document}var t=this[0],e=e.apply(t),r=this.offset(),a=/^(?:body|html)$/i.test(e.nodeName)?{top:0,left:0}:$(e).offset();return r.top-=parseFloat(t.style.marginTop)||0,r.left-=parseFloat(t.style.marginLeft)||0,e.style&&(a.top+=parseFloat(e.style.borderTopWidth)||0,a.left+=parseFloat(e.style.borderLeftWidth)||0),{top:r.top-a.top,left:r.left-a.left}}};var r={};$.expando="velocity"+(new Date).getTime(),$.uuid=0;for(var a={},n=a.hasOwnProperty,o=a.toString,i="Boolean Number String Function Array Date RegExp Object Error".split(" "),s=0;s<i.length;s++)a["[object "+i[s]+"]"]=i[s].toLowerCase();$.fn.init.prototype=$.fn,e.Velocity={Utilities:$}}}(window),function(e){"object"==typeof module&&"object"==typeof module.exports?module.exports=e():"function"==typeof define&&define.amd?define(e):e()}(function(){return function(e,t,r,a){function n(e){for(var t=-1,r=e?e.length:0,a=[];++t<r;){var n=e[t];n&&a.push(n)}return a}function o(e){return g.isWrapped(e)?e=[].slice.call(e):g.isNode(e)&&(e=[e]),e}function i(e){var t=$.data(e,"velocity");return null===t?a:t}function s(e){return function(t){return Math.round(t*e)*(1/e)}}function l(e,r,a,n){function o(e,t){return 1-3*t+3*e}function i(e,t){return 3*t-6*e}function s(e){return 3*e}function l(e,t,r){return((o(t,r)*e+i(t,r))*e+s(t))*e}function u(e,t,r){return 3*o(t,r)*e*e+2*i(t,r)*e+s(t)}function c(t,r){for(var n=0;m>n;++n){var o=u(r,e,a);if(0===o)return r;var i=l(r,e,a)-t;r-=i/o}return r}function p(){for(var t=0;b>t;++t)w[t]=l(t*x,e,a)}function f(t,r,n){var o,i,s=0;do i=r+(n-r)/2,o=l(i,e,a)-t,o>0?n=i:r=i;while(Math.abs(o)>h&&++s<v);return i}function d(t){for(var r=0,n=1,o=b-1;n!=o&&w[n]<=t;++n)r+=x;--n;var i=(t-w[n])/(w[n+1]-w[n]),s=r+i*x,l=u(s,e,a);return l>=y?c(t,s):0==l?s:f(t,r,r+x)}function g(){V=!0,(e!=r||a!=n)&&p()}var m=4,y=.001,h=1e-7,v=10,b=11,x=1/(b-1),S="Float32Array"in t;if(4!==arguments.length)return!1;for(var P=0;4>P;++P)if("number"!=typeof arguments[P]||isNaN(arguments[P])||!isFinite(arguments[P]))return!1;e=Math.min(e,1),a=Math.min(a,1),e=Math.max(e,0),a=Math.max(a,0);var w=S?new Float32Array(b):new Array(b),V=!1,C=function(t){return V||g(),e===r&&a===n?t:0===t?0:1===t?1:l(d(t),r,n)};C.getControlPoints=function(){return[{x:e,y:r},{x:a,y:n}]};var T="generateBezier("+[e,r,a,n]+")";return C.toString=function(){return T},C}function u(e,t){var r=e;return g.isString(e)?v.Easings[e]||(r=!1):r=g.isArray(e)&&1===e.length?s.apply(null,e):g.isArray(e)&&2===e.length?b.apply(null,e.concat([t])):g.isArray(e)&&4===e.length?l.apply(null,e):!1,r===!1&&(r=v.Easings[v.defaults.easing]?v.defaults.easing:h),r}function c(e){if(e){var t=(new Date).getTime(),r=v.State.calls.length;r>1e4&&(v.State.calls=n(v.State.calls));for(var o=0;r>o;o++)if(v.State.calls[o]){var s=v.State.calls[o],l=s[0],u=s[2],f=s[3],d=!!f,m=null;f||(f=v.State.calls[o][3]=t-16);for(var y=Math.min((t-f)/u.duration,1),h=0,b=l.length;b>h;h++){var S=l[h],w=S.element;if(i(w)){var V=!1;if(u.display!==a&&null!==u.display&&"none"!==u.display){if("flex"===u.display){var C=["-webkit-box","-moz-box","-ms-flexbox","-webkit-flex"];$.each(C,function(e,t){x.setPropertyValue(w,"display",t)})}x.setPropertyValue(w,"display",u.display)}u.visibility!==a&&"hidden"!==u.visibility&&x.setPropertyValue(w,"visibility",u.visibility);for(var T in S)if("element"!==T){var k=S[T],A,F=g.isString(k.easing)?v.Easings[k.easing]:k.easing;if(1===y)A=k.endValue;else{var E=k.endValue-k.startValue;if(A=k.startValue+E*F(y,u,E),!d&&A===k.currentValue)continue}if(k.currentValue=A,"tween"===T)m=A;else{if(x.Hooks.registered[T]){var j=x.Hooks.getRoot(T),H=i(w).rootPropertyValueCache[j];H&&(k.rootPropertyValue=H)}var N=x.setPropertyValue(w,T,k.currentValue+(0===parseFloat(A)?"":k.unitType),k.rootPropertyValue,k.scrollData);x.Hooks.registered[T]&&(i(w).rootPropertyValueCache[j]=x.Normalizations.registered[j]?x.Normalizations.registered[j]("extract",null,N[1]):N[1]),"transform"===N[0]&&(V=!0)}}u.mobileHA&&i(w).transformCache.translate3d===a&&(i(w).transformCache.translate3d="(0px, 0px, 0px)",V=!0),V&&x.flushTransformCache(w)}}u.display!==a&&"none"!==u.display&&(v.State.calls[o][2].display=!1),u.visibility!==a&&"hidden"!==u.visibility&&(v.State.calls[o][2].visibility=!1),u.progress&&u.progress.call(s[1],s[1],y,Math.max(0,f+u.duration-t),f,m),1===y&&p(o)}}v.State.isTicking&&P(c)}function p(e,t){if(!v.State.calls[e])return!1;for(var r=v.State.calls[e][0],n=v.State.calls[e][1],o=v.State.calls[e][2],s=v.State.calls[e][4],l=!1,u=0,c=r.length;c>u;u++){var p=r[u].element;if(t||o.loop||("none"===o.display&&x.setPropertyValue(p,"display",o.display),"hidden"===o.visibility&&x.setPropertyValue(p,"visibility",o.visibility)),o.loop!==!0&&($.queue(p)[1]===a||!/\.velocityQueueEntryFlag/i.test($.queue(p)[1]))&&i(p)){i(p).isAnimating=!1,i(p).rootPropertyValueCache={};var f=!1;$.each(x.Lists.transforms3D,function(e,t){var r=/^scale/.test(t)?1:0,n=i(p).transformCache[t];i(p).transformCache[t]!==a&&new RegExp("^\\("+r+"[^.]").test(n)&&(f=!0,delete i(p).transformCache[t])}),o.mobileHA&&(f=!0,delete i(p).transformCache.translate3d),f&&x.flushTransformCache(p),x.Values.removeClass(p,"velocity-animating")}if(!t&&o.complete&&!o.loop&&u===c-1)try{o.complete.call(n,n)}catch(d){setTimeout(function(){throw d},1)}s&&o.loop!==!0&&s(n),i(p)&&o.loop===!0&&!t&&($.each(i(p).tweensContainer,function(e,t){/^rotate/.test(e)&&360===parseFloat(t.endValue)&&(t.endValue=0,t.startValue=360),/^backgroundPosition/.test(e)&&100===parseFloat(t.endValue)&&"%"===t.unitType&&(t.endValue=0,t.startValue=100)}),v(p,"reverse",{loop:!0,delay:o.delay})),o.queue!==!1&&$.dequeue(p,o.queue)}v.State.calls[e]=!1;for(var g=0,m=v.State.calls.length;m>g;g++)if(v.State.calls[g]!==!1){l=!0;break}l===!1&&(v.State.isTicking=!1,delete v.State.calls,v.State.calls=[])}var f=function(){if(r.documentMode)return r.documentMode;for(var e=7;e>4;e--){var t=r.createElement("div");if(t.innerHTML="<!--[if IE "+e+"]><span></span><![endif]-->",t.getElementsByTagName("span").length)return t=null,e}return a}(),d=function(){var e=0;return t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||function(t){var r=(new Date).getTime(),a;return a=Math.max(0,16-(r-e)),e=r+a,setTimeout(function(){t(r+a)},a)}}(),g={isString:function(e){return"string"==typeof e},isArray:Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)},isNode:function(e){return e&&e.nodeType},isNodeList:function(e){return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e))&&e.length!==a&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)},isWrapped:function(e){return e&&(e.jquery||t.Zepto&&t.Zepto.zepto.isZ(e))},isSVG:function(e){return t.SVGElement&&e instanceof t.SVGElement},isEmptyObject:function(e){for(var t in e)return!1;return!0}},$,m=!1;if(e.fn&&e.fn.jquery?($=e,m=!0):$=t.Velocity.Utilities,8>=f&&!m)throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");if(7>=f)return void(jQuery.fn.velocity=jQuery.fn.animate);var y=400,h="swing",v={State:{isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),isAndroid:/Android/i.test(navigator.userAgent),isGingerbread:/Android 2\.3\.[3-7]/i.test(navigator.userAgent),isChrome:t.chrome,isFirefox:/Firefox/i.test(navigator.userAgent),prefixElement:r.createElement("div"),prefixMatches:{},scrollAnchor:null,scrollPropertyLeft:null,scrollPropertyTop:null,isTicking:!1,calls:[]},CSS:{},Utilities:$,Redirects:{},Easings:{},Promise:t.Promise,defaults:{queue:"",duration:y,easing:h,begin:a,complete:a,progress:a,display:a,visibility:a,loop:!1,delay:!1,mobileHA:!0,_cacheValues:!0},init:function(e){$.data(e,"velocity",{isSVG:g.isSVG(e),isAnimating:!1,computedStyle:null,tweensContainer:null,rootPropertyValueCache:{},transformCache:{}})},hook:null,mock:!1,version:{major:1,minor:2,patch:2},debug:!1};t.pageYOffset!==a?(v.State.scrollAnchor=t,v.State.scrollPropertyLeft="pageXOffset",v.State.scrollPropertyTop="pageYOffset"):(v.State.scrollAnchor=r.documentElement||r.body.parentNode||r.body,v.State.scrollPropertyLeft="scrollLeft",v.State.scrollPropertyTop="scrollTop");var b=function(){function e(e){return-e.tension*e.x-e.friction*e.v}function t(t,r,a){var n={x:t.x+a.dx*r,v:t.v+a.dv*r,tension:t.tension,friction:t.friction};return{dx:n.v,dv:e(n)}}function r(r,a){var n={dx:r.v,dv:e(r)},o=t(r,.5*a,n),i=t(r,.5*a,o),s=t(r,a,i),l=1/6*(n.dx+2*(o.dx+i.dx)+s.dx),u=1/6*(n.dv+2*(o.dv+i.dv)+s.dv);return r.x=r.x+l*a,r.v=r.v+u*a,r}return function a(e,t,n){var o={x:-1,v:0,tension:null,friction:null},i=[0],s=0,l=1e-4,u=.016,c,p,f;for(e=parseFloat(e)||500,t=parseFloat(t)||20,n=n||null,o.tension=e,o.friction=t,c=null!==n,c?(s=a(e,t),p=s/n*u):p=u;;)if(f=r(f||o,p),i.push(1+f.x),s+=16,!(Math.abs(f.x)>l&&Math.abs(f.v)>l))break;return c?function(e){return i[e*(i.length-1)|0]}:s}}();v.Easings={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},spring:function(e){return 1-Math.cos(4.5*e*Math.PI)*Math.exp(6*-e)}},$.each([["ease",[.25,.1,.25,1]],["ease-in",[.42,0,1,1]],["ease-out",[0,0,.58,1]],["ease-in-out",[.42,0,.58,1]],["easeInSine",[.47,0,.745,.715]],["easeOutSine",[.39,.575,.565,1]],["easeInOutSine",[.445,.05,.55,.95]],["easeInQuad",[.55,.085,.68,.53]],["easeOutQuad",[.25,.46,.45,.94]],["easeInOutQuad",[.455,.03,.515,.955]],["easeInCubic",[.55,.055,.675,.19]],["easeOutCubic",[.215,.61,.355,1]],["easeInOutCubic",[.645,.045,.355,1]],["easeInQuart",[.895,.03,.685,.22]],["easeOutQuart",[.165,.84,.44,1]],["easeInOutQuart",[.77,0,.175,1]],["easeInQuint",[.755,.05,.855,.06]],["easeOutQuint",[.23,1,.32,1]],["easeInOutQuint",[.86,0,.07,1]],["easeInExpo",[.95,.05,.795,.035]],["easeOutExpo",[.19,1,.22,1]],["easeInOutExpo",[1,0,0,1]],["easeInCirc",[.6,.04,.98,.335]],["easeOutCirc",[.075,.82,.165,1]],["easeInOutCirc",[.785,.135,.15,.86]]],function(e,t){v.Easings[t[0]]=l.apply(null,t[1])});var x=v.CSS={RegEx:{isHex:/^#([A-f\d]{3}){1,2}$/i,valueUnwrap:/^[A-z]+\((.*)\)$/i,wrappedValueAlreadyExtracted:/[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,valueSplit:/([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi},Lists:{colors:["fill","stroke","stopColor","color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor"],transformsBase:["translateX","translateY","scale","scaleX","scaleY","skewX","skewY","rotateZ"],transforms3D:["transformPerspective","translateZ","scaleZ","rotateX","rotateY"]},Hooks:{templates:{textShadow:["Color X Y Blur","black 0px 0px 0px"],boxShadow:["Color X Y Blur Spread","black 0px 0px 0px 0px"],clip:["Top Right Bottom Left","0px 0px 0px 0px"],backgroundPosition:["X Y","0% 0%"],transformOrigin:["X Y Z","50% 50% 0px"],perspectiveOrigin:["X Y","50% 50%"]},registered:{},register:function(){for(var e=0;e<x.Lists.colors.length;e++){var t="color"===x.Lists.colors[e]?"0 0 0 1":"255 255 255 1";x.Hooks.templates[x.Lists.colors[e]]=["Red Green Blue Alpha",t]}var r,a,n;if(f)for(r in x.Hooks.templates){a=x.Hooks.templates[r],n=a[0].split(" ");var o=a[1].match(x.RegEx.valueSplit);"Color"===n[0]&&(n.push(n.shift()),o.push(o.shift()),x.Hooks.templates[r]=[n.join(" "),o.join(" ")])}for(r in x.Hooks.templates){a=x.Hooks.templates[r],n=a[0].split(" ");for(var e in n){var i=r+n[e],s=e;x.Hooks.registered[i]=[r,s]}}},getRoot:function(e){var t=x.Hooks.registered[e];return t?t[0]:e},cleanRootPropertyValue:function(e,t){return x.RegEx.valueUnwrap.test(t)&&(t=t.match(x.RegEx.valueUnwrap)[1]),x.Values.isCSSNullValue(t)&&(t=x.Hooks.templates[e][1]),t},extractValue:function(e,t){var r=x.Hooks.registered[e];if(r){var a=r[0],n=r[1];return t=x.Hooks.cleanRootPropertyValue(a,t),t.toString().match(x.RegEx.valueSplit)[n]}return t},injectValue:function(e,t,r){var a=x.Hooks.registered[e];if(a){var n=a[0],o=a[1],i,s;return r=x.Hooks.cleanRootPropertyValue(n,r),i=r.toString().match(x.RegEx.valueSplit),i[o]=t,s=i.join(" ")}return r}},Normalizations:{registered:{clip:function(e,t,r){switch(e){case"name":return"clip";case"extract":var a;return x.RegEx.wrappedValueAlreadyExtracted.test(r)?a=r:(a=r.toString().match(x.RegEx.valueUnwrap),a=a?a[1].replace(/,(\s+)?/g," "):r),a;case"inject":return"rect("+r+")"}},blur:function(e,t,r){switch(e){case"name":return v.State.isFirefox?"filter":"-webkit-filter";case"extract":var a=parseFloat(r);if(!a&&0!==a){var n=r.toString().match(/blur\(([0-9]+[A-z]+)\)/i);a=n?n[1]:0}return a;case"inject":return parseFloat(r)?"blur("+r+")":"none"}},opacity:function(e,t,r){if(8>=f)switch(e){case"name":return"filter";case"extract":var a=r.toString().match(/alpha\(opacity=(.*)\)/i);return r=a?a[1]/100:1;case"inject":return t.style.zoom=1,parseFloat(r)>=1?"":"alpha(opacity="+parseInt(100*parseFloat(r),10)+")"}else switch(e){case"name":return"opacity";case"extract":return r;case"inject":return r}}},register:function(){9>=f||v.State.isGingerbread||(x.Lists.transformsBase=x.Lists.transformsBase.concat(x.Lists.transforms3D));for(var e=0;e<x.Lists.transformsBase.length;e++)!function(){var t=x.Lists.transformsBase[e];x.Normalizations.registered[t]=function(e,r,n){switch(e){case"name":return"transform";case"extract":return i(r)===a||i(r).transformCache[t]===a?/^scale/i.test(t)?1:0:i(r).transformCache[t].replace(/[()]/g,"");case"inject":var o=!1;switch(t.substr(0,t.length-1)){case"translate":o=!/(%|px|em|rem|vw|vh|\d)$/i.test(n);break;case"scal":case"scale":v.State.isAndroid&&i(r).transformCache[t]===a&&1>n&&(n=1),o=!/(\d)$/i.test(n);break;case"skew":o=!/(deg|\d)$/i.test(n);break;case"rotate":o=!/(deg|\d)$/i.test(n)}return o||(i(r).transformCache[t]="("+n+")"),i(r).transformCache[t]}}}();for(var e=0;e<x.Lists.colors.length;e++)!function(){var t=x.Lists.colors[e];x.Normalizations.registered[t]=function(e,r,n){switch(e){case"name":return t;case"extract":var o;if(x.RegEx.wrappedValueAlreadyExtracted.test(n))o=n;else{var i,s={black:"rgb(0, 0, 0)",blue:"rgb(0, 0, 255)",gray:"rgb(128, 128, 128)",green:"rgb(0, 128, 0)",red:"rgb(255, 0, 0)",white:"rgb(255, 255, 255)"};/^[A-z]+$/i.test(n)?i=s[n]!==a?s[n]:s.black:x.RegEx.isHex.test(n)?i="rgb("+x.Values.hexToRgb(n).join(" ")+")":/^rgba?\(/i.test(n)||(i=s.black),o=(i||n).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g," ")}return 8>=f||3!==o.split(" ").length||(o+=" 1"),o;case"inject":return 8>=f?4===n.split(" ").length&&(n=n.split(/\s+/).slice(0,3).join(" ")):3===n.split(" ").length&&(n+=" 1"),(8>=f?"rgb":"rgba")+"("+n.replace(/\s+/g,",").replace(/\.(\d)+(?=,)/g,"")+")"}}}()}},Names:{camelCase:function(e){return e.replace(/-(\w)/g,function(e,t){return t.toUpperCase()})},SVGAttribute:function(e){var t="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";return(f||v.State.isAndroid&&!v.State.isChrome)&&(t+="|transform"),new RegExp("^("+t+")$","i").test(e)},prefixCheck:function(e){if(v.State.prefixMatches[e])return[v.State.prefixMatches[e],!0];for(var t=["","Webkit","Moz","ms","O"],r=0,a=t.length;a>r;r++){var n;if(n=0===r?e:t[r]+e.replace(/^\w/,function(e){return e.toUpperCase()}),g.isString(v.State.prefixElement.style[n]))return v.State.prefixMatches[e]=n,[n,!0]}return[e,!1]}},Values:{hexToRgb:function(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,a;return e=e.replace(t,function(e,t,r,a){return t+t+r+r+a+a}),a=r.exec(e),a?[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]:[0,0,0]},isCSSNullValue:function(e){return 0==e||/^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)},getUnitType:function(e){return/^(rotate|skew)/i.test(e)?"deg":/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e)?"":"px"},getDisplayType:function(e){var t=e&&e.tagName.toString().toLowerCase();return/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t)?"inline":/^(li)$/i.test(t)?"list-item":/^(tr)$/i.test(t)?"table-row":/^(table)$/i.test(t)?"table":/^(tbody)$/i.test(t)?"table-row-group":"block"},addClass:function(e,t){e.classList?e.classList.add(t):e.className+=(e.className.length?" ":"")+t},removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.toString().replace(new RegExp("(^|\\s)"+t.split(" ").join("|")+"(\\s|$)","gi")," ")}},getPropertyValue:function(e,r,n,o){function s(e,r){function n(){u&&x.setPropertyValue(e,"display","none")}var l=0;if(8>=f)l=$.css(e,r);else{var u=!1;if(/^(width|height)$/.test(r)&&0===x.getPropertyValue(e,"display")&&(u=!0,x.setPropertyValue(e,"display",x.Values.getDisplayType(e))),!o){if("height"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var c=e.offsetHeight-(parseFloat(x.getPropertyValue(e,"borderTopWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderBottomWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingTop"))||0)-(parseFloat(x.getPropertyValue(e,"paddingBottom"))||0);return n(),c}if("width"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var p=e.offsetWidth-(parseFloat(x.getPropertyValue(e,"borderLeftWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderRightWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingLeft"))||0)-(parseFloat(x.getPropertyValue(e,"paddingRight"))||0);return n(),p}}var d;d=i(e)===a?t.getComputedStyle(e,null):i(e).computedStyle?i(e).computedStyle:i(e).computedStyle=t.getComputedStyle(e,null),"borderColor"===r&&(r="borderTopColor"),l=9===f&&"filter"===r?d.getPropertyValue(r):d[r],(""===l||null===l)&&(l=e.style[r]),n()}if("auto"===l&&/^(top|right|bottom|left)$/i.test(r)){var g=s(e,"position");("fixed"===g||"absolute"===g&&/top|left/i.test(r))&&(l=$(e).position()[r]+"px")}return l}var l;if(x.Hooks.registered[r]){var u=r,c=x.Hooks.getRoot(u);n===a&&(n=x.getPropertyValue(e,x.Names.prefixCheck(c)[0])),x.Normalizations.registered[c]&&(n=x.Normalizations.registered[c]("extract",e,n)),l=x.Hooks.extractValue(u,n)}else if(x.Normalizations.registered[r]){var p,d;p=x.Normalizations.registered[r]("name",e),"transform"!==p&&(d=s(e,x.Names.prefixCheck(p)[0]),x.Values.isCSSNullValue(d)&&x.Hooks.templates[r]&&(d=x.Hooks.templates[r][1])),l=x.Normalizations.registered[r]("extract",e,d)}if(!/^[\d-]/.test(l))if(i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r))if(/^(height|width)$/i.test(r))try{l=e.getBBox()[r]}catch(g){l=0}else l=e.getAttribute(r);else l=s(e,x.Names.prefixCheck(r)[0]);return x.Values.isCSSNullValue(l)&&(l=0),v.debug>=2&&console.log("Get "+r+": "+l),l},setPropertyValue:function(e,r,a,n,o){var s=r;if("scroll"===r)o.container?o.container["scroll"+o.direction]=a:"Left"===o.direction?t.scrollTo(a,o.alternateValue):t.scrollTo(o.alternateValue,a);else if(x.Normalizations.registered[r]&&"transform"===x.Normalizations.registered[r]("name",e))x.Normalizations.registered[r]("inject",e,a),s="transform",a=i(e).transformCache[r];else{if(x.Hooks.registered[r]){var l=r,u=x.Hooks.getRoot(r);n=n||x.getPropertyValue(e,u),a=x.Hooks.injectValue(l,a,n),r=u}if(x.Normalizations.registered[r]&&(a=x.Normalizations.registered[r]("inject",e,a),r=x.Normalizations.registered[r]("name",e)),s=x.Names.prefixCheck(r)[0],8>=f)try{e.style[s]=a}catch(c){v.debug&&console.log("Browser does not support ["+a+"] for ["+s+"]")}else i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r)?e.setAttribute(r,a):e.style[s]=a;v.debug>=2&&console.log("Set "+r+" ("+s+"): "+a)}return[s,a]},flushTransformCache:function(e){function t(t){return parseFloat(x.getPropertyValue(e,t))}var r="";if((f||v.State.isAndroid&&!v.State.isChrome)&&i(e).isSVG){var a={translate:[t("translateX"),t("translateY")],skewX:[t("skewX")],skewY:[t("skewY")],scale:1!==t("scale")?[t("scale"),t("scale")]:[t("scaleX"),t("scaleY")],rotate:[t("rotateZ"),0,0]};$.each(i(e).transformCache,function(e){/^translate/i.test(e)?e="translate":/^scale/i.test(e)?e="scale":/^rotate/i.test(e)&&(e="rotate"),a[e]&&(r+=e+"("+a[e].join(" ")+") ",delete a[e])})}else{var n,o;$.each(i(e).transformCache,function(t){return n=i(e).transformCache[t],"transformPerspective"===t?(o=n,!0):(9===f&&"rotateZ"===t&&(t="rotate"),void(r+=t+n+" "))}),o&&(r="perspective"+o+" "+r)}x.setPropertyValue(e,"transform",r)}};x.Hooks.register(),x.Normalizations.register(),v.hook=function(e,t,r){var n=a;return e=o(e),$.each(e,function(e,o){if(i(o)===a&&v.init(o),r===a)n===a&&(n=v.CSS.getPropertyValue(o,t));else{var s=v.CSS.setPropertyValue(o,t,r);"transform"===s[0]&&v.CSS.flushTransformCache(o),n=s}}),n};var S=function(){function e(){return l?T.promise||null:f}function n(){function e(e){function p(e,t){var r=a,i=a,s=a;return g.isArray(e)?(r=e[0],!g.isArray(e[1])&&/^[\d-]/.test(e[1])||g.isFunction(e[1])||x.RegEx.isHex.test(e[1])?s=e[1]:(g.isString(e[1])&&!x.RegEx.isHex.test(e[1])||g.isArray(e[1]))&&(i=t?e[1]:u(e[1],o.duration),e[2]!==a&&(s=e[2]))):r=e,t||(i=i||o.easing),g.isFunction(r)&&(r=r.call(n,w,P)),g.isFunction(s)&&(s=s.call(n,w,P)),[r||0,i,s]}function f(e,t){var r,a;return a=(t||"0").toString().toLowerCase().replace(/[%A-z]+$/,function(e){return r=e,""}),r||(r=x.Values.getUnitType(e)),[a,r]}function d(){var e={myParent:n.parentNode||r.body,position:x.getPropertyValue(n,"position"),fontSize:x.getPropertyValue(n,"fontSize")},a=e.position===N.lastPosition&&e.myParent===N.lastParent,o=e.fontSize===N.lastFontSize;N.lastParent=e.myParent,N.lastPosition=e.position,N.lastFontSize=e.fontSize;var s=100,l={};if(o&&a)l.emToPx=N.lastEmToPx,l.percentToPxWidth=N.lastPercentToPxWidth,l.percentToPxHeight=N.lastPercentToPxHeight;else{var u=i(n).isSVG?r.createElementNS("http://www.w3.org/2000/svg","rect"):r.createElement("div");v.init(u),e.myParent.appendChild(u),$.each(["overflow","overflowX","overflowY"],function(e,t){v.CSS.setPropertyValue(u,t,"hidden")}),v.CSS.setPropertyValue(u,"position",e.position),v.CSS.setPropertyValue(u,"fontSize",e.fontSize),v.CSS.setPropertyValue(u,"boxSizing","content-box"),$.each(["minWidth","maxWidth","width","minHeight","maxHeight","height"],function(e,t){v.CSS.setPropertyValue(u,t,s+"%")}),v.CSS.setPropertyValue(u,"paddingLeft",s+"em"),l.percentToPxWidth=N.lastPercentToPxWidth=(parseFloat(x.getPropertyValue(u,"width",null,!0))||1)/s,l.percentToPxHeight=N.lastPercentToPxHeight=(parseFloat(x.getPropertyValue(u,"height",null,!0))||1)/s,l.emToPx=N.lastEmToPx=(parseFloat(x.getPropertyValue(u,"paddingLeft"))||1)/s,e.myParent.removeChild(u)}return null===N.remToPx&&(N.remToPx=parseFloat(x.getPropertyValue(r.body,"fontSize"))||16),null===N.vwToPx&&(N.vwToPx=parseFloat(t.innerWidth)/100,N.vhToPx=parseFloat(t.innerHeight)/100),l.remToPx=N.remToPx,l.vwToPx=N.vwToPx,l.vhToPx=N.vhToPx,v.debug>=1&&console.log("Unit ratios: "+JSON.stringify(l),n),l}if(o.begin&&0===w)try{o.begin.call(m,m)}catch(y){setTimeout(function(){throw y},1)}if("scroll"===k){var S=/^x$/i.test(o.axis)?"Left":"Top",V=parseFloat(o.offset)||0,C,A,F;o.container?g.isWrapped(o.container)||g.isNode(o.container)?(o.container=o.container[0]||o.container,C=o.container["scroll"+S],F=C+$(n).position()[S.toLowerCase()]+V):o.container=null:(C=v.State.scrollAnchor[v.State["scrollProperty"+S]],A=v.State.scrollAnchor[v.State["scrollProperty"+("Left"===S?"Top":"Left")]],F=$(n).offset()[S.toLowerCase()]+V),s={scroll:{rootPropertyValue:!1,startValue:C,currentValue:C,endValue:F,unitType:"",easing:o.easing,scrollData:{container:o.container,direction:S,alternateValue:A}},element:n},v.debug&&console.log("tweensContainer (scroll): ",s.scroll,n)}else if("reverse"===k){if(!i(n).tweensContainer)return void $.dequeue(n,o.queue);"none"===i(n).opts.display&&(i(n).opts.display="auto"),"hidden"===i(n).opts.visibility&&(i(n).opts.visibility="visible"),i(n).opts.loop=!1,i(n).opts.begin=null,i(n).opts.complete=null,b.easing||delete o.easing,b.duration||delete o.duration,o=$.extend({},i(n).opts,o);var E=$.extend(!0,{},i(n).tweensContainer);for(var j in E)if("element"!==j){var H=E[j].startValue;E[j].startValue=E[j].currentValue=E[j].endValue,E[j].endValue=H,g.isEmptyObject(b)||(E[j].easing=o.easing),v.debug&&console.log("reverse tweensContainer ("+j+"): "+JSON.stringify(E[j]),n)}s=E}else if("start"===k){var E;i(n).tweensContainer&&i(n).isAnimating===!0&&(E=i(n).tweensContainer),$.each(h,function(e,t){if(RegExp("^"+x.Lists.colors.join("$|^")+"$").test(e)){var r=p(t,!0),n=r[0],o=r[1],i=r[2];if(x.RegEx.isHex.test(n)){for(var s=["Red","Green","Blue"],l=x.Values.hexToRgb(n),u=i?x.Values.hexToRgb(i):a,c=0;c<s.length;c++){var f=[l[c]];o&&f.push(o),u!==a&&f.push(u[c]),h[e+s[c]]=f}delete h[e]}}});for(var R in h){var O=p(h[R]),z=O[0],q=O[1],M=O[2];R=x.Names.camelCase(R);var I=x.Hooks.getRoot(R),B=!1;if(i(n).isSVG||"tween"===I||x.Names.prefixCheck(I)[1]!==!1||x.Normalizations.registered[I]!==a){(o.display!==a&&null!==o.display&&"none"!==o.display||o.visibility!==a&&"hidden"!==o.visibility)&&/opacity|filter/.test(R)&&!M&&0!==z&&(M=0),o._cacheValues&&E&&E[R]?(M===a&&(M=E[R].endValue+E[R].unitType),B=i(n).rootPropertyValueCache[I]):x.Hooks.registered[R]?M===a?(B=x.getPropertyValue(n,I),M=x.getPropertyValue(n,R,B)):B=x.Hooks.templates[I][1]:M===a&&(M=x.getPropertyValue(n,R));var W,G,D,X=!1;if(W=f(R,M),M=W[0],D=W[1],W=f(R,z),z=W[0].replace(/^([+-\/*])=/,function(e,t){return X=t,""}),G=W[1],M=parseFloat(M)||0,z=parseFloat(z)||0,"%"===G&&(/^(fontSize|lineHeight)$/.test(R)?(z/=100,G="em"):/^scale/.test(R)?(z/=100,G=""):/(Red|Green|Blue)$/i.test(R)&&(z=z/100*255,G="")),/[\/*]/.test(X))G=D;else if(D!==G&&0!==M)if(0===z)G=D;else{l=l||d();var Y=/margin|padding|left|right|width|text|word|letter/i.test(R)||/X$/.test(R)||"x"===R?"x":"y";switch(D){case"%":M*="x"===Y?l.percentToPxWidth:l.percentToPxHeight;break;case"px":break;default:M*=l[D+"ToPx"]}switch(G){case"%":M*=1/("x"===Y?l.percentToPxWidth:l.percentToPxHeight);break;case"px":break;default:M*=1/l[G+"ToPx"]}}switch(X){case"+":z=M+z;break;case"-":z=M-z;break;case"*":z=M*z;break;case"/":z=M/z}s[R]={rootPropertyValue:B,startValue:M,currentValue:M,endValue:z,unitType:G,easing:q},v.debug&&console.log("tweensContainer ("+R+"): "+JSON.stringify(s[R]),n)}else v.debug&&console.log("Skipping ["+I+"] due to a lack of browser support.")}s.element=n}s.element&&(x.Values.addClass(n,"velocity-animating"),L.push(s),""===o.queue&&(i(n).tweensContainer=s,i(n).opts=o),i(n).isAnimating=!0,w===P-1?(v.State.calls.push([L,m,o,null,T.resolver]),v.State.isTicking===!1&&(v.State.isTicking=!0,c())):w++)}var n=this,o=$.extend({},v.defaults,b),s={},l;switch(i(n)===a&&v.init(n),parseFloat(o.delay)&&o.queue!==!1&&$.queue(n,o.queue,function(e){v.velocityQueueEntryFlag=!0,i(n).delayTimer={setTimeout:setTimeout(e,parseFloat(o.delay)),next:e}}),o.duration.toString().toLowerCase()){case"fast":o.duration=200;break;case"normal":o.duration=y;break;case"slow":o.duration=600;break;default:o.duration=parseFloat(o.duration)||1}v.mock!==!1&&(v.mock===!0?o.duration=o.delay=1:(o.duration*=parseFloat(v.mock)||1,o.delay*=parseFloat(v.mock)||1)),o.easing=u(o.easing,o.duration),o.begin&&!g.isFunction(o.begin)&&(o.begin=null),o.progress&&!g.isFunction(o.progress)&&(o.progress=null),o.complete&&!g.isFunction(o.complete)&&(o.complete=null),o.display!==a&&null!==o.display&&(o.display=o.display.toString().toLowerCase(),"auto"===o.display&&(o.display=v.CSS.Values.getDisplayType(n))),o.visibility!==a&&null!==o.visibility&&(o.visibility=o.visibility.toString().toLowerCase()),o.mobileHA=o.mobileHA&&v.State.isMobile&&!v.State.isGingerbread,o.queue===!1?o.delay?setTimeout(e,o.delay):e():$.queue(n,o.queue,function(t,r){return r===!0?(T.promise&&T.resolver(m),!0):(v.velocityQueueEntryFlag=!0,void e(t))}),""!==o.queue&&"fx"!==o.queue||"inprogress"===$.queue(n)[0]||$.dequeue(n)}var s=arguments[0]&&(arguments[0].p||$.isPlainObject(arguments[0].properties)&&!arguments[0].properties.names||g.isString(arguments[0].properties)),l,f,d,m,h,b;if(g.isWrapped(this)?(l=!1,d=0,m=this,f=this):(l=!0,d=1,m=s?arguments[0].elements||arguments[0].e:arguments[0]),m=o(m)){s?(h=arguments[0].properties||arguments[0].p,b=arguments[0].options||arguments[0].o):(h=arguments[d],b=arguments[d+1]);var P=m.length,w=0;if(!/^(stop|finish)$/i.test(h)&&!$.isPlainObject(b)){var V=d+1;b={};for(var C=V;C<arguments.length;C++)g.isArray(arguments[C])||!/^(fast|normal|slow)$/i.test(arguments[C])&&!/^\d/.test(arguments[C])?g.isString(arguments[C])||g.isArray(arguments[C])?b.easing=arguments[C]:g.isFunction(arguments[C])&&(b.complete=arguments[C]):b.duration=arguments[C]}var T={promise:null,resolver:null,rejecter:null};l&&v.Promise&&(T.promise=new v.Promise(function(e,t){T.resolver=e,T.rejecter=t}));var k;switch(h){case"scroll":k="scroll";break;case"reverse":k="reverse";break;case"finish":case"stop":$.each(m,function(e,t){i(t)&&i(t).delayTimer&&(clearTimeout(i(t).delayTimer.setTimeout),i(t).delayTimer.next&&i(t).delayTimer.next(),delete i(t).delayTimer)});var A=[];return $.each(v.State.calls,function(e,t){t&&$.each(t[1],function(r,n){var o=b===a?"":b;return o===!0||t[2].queue===o||b===a&&t[2].queue===!1?void $.each(m,function(r,a){a===n&&((b===!0||g.isString(b))&&($.each($.queue(a,g.isString(b)?b:""),function(e,t){g.isFunction(t)&&t(null,!0)}),$.queue(a,g.isString(b)?b:"",[])),"stop"===h?(i(a)&&i(a).tweensContainer&&o!==!1&&$.each(i(a).tweensContainer,function(e,t){t.endValue=t.currentValue
}),A.push(e)):"finish"===h&&(t[2].duration=1))}):!0})}),"stop"===h&&($.each(A,function(e,t){p(t,!0)}),T.promise&&T.resolver(m)),e();default:if(!$.isPlainObject(h)||g.isEmptyObject(h)){if(g.isString(h)&&v.Redirects[h]){var F=$.extend({},b),E=F.duration,j=F.delay||0;return F.backwards===!0&&(m=$.extend(!0,[],m).reverse()),$.each(m,function(e,t){parseFloat(F.stagger)?F.delay=j+parseFloat(F.stagger)*e:g.isFunction(F.stagger)&&(F.delay=j+F.stagger.call(t,e,P)),F.drag&&(F.duration=parseFloat(E)||(/^(callout|transition)/.test(h)?1e3:y),F.duration=Math.max(F.duration*(F.backwards?1-e/P:(e+1)/P),.75*F.duration,200)),v.Redirects[h].call(t,t,F||{},e,P,m,T.promise?T:a)}),e()}var H="Velocity: First argument ("+h+") was not a property map, a known action, or a registered redirect. Aborting.";return T.promise?T.rejecter(new Error(H)):console.log(H),e()}k="start"}var N={lastParent:null,lastPosition:null,lastFontSize:null,lastPercentToPxWidth:null,lastPercentToPxHeight:null,lastEmToPx:null,remToPx:null,vwToPx:null,vhToPx:null},L=[];$.each(m,function(e,t){g.isNode(t)&&n.call(t)});var F=$.extend({},v.defaults,b),R;if(F.loop=parseInt(F.loop),R=2*F.loop-1,F.loop)for(var O=0;R>O;O++){var z={delay:F.delay,progress:F.progress};O===R-1&&(z.display=F.display,z.visibility=F.visibility,z.complete=F.complete),S(m,"reverse",z)}return e()}};v=$.extend(S,v),v.animate=S;var P=t.requestAnimationFrame||d;return v.State.isMobile||r.hidden===a||r.addEventListener("visibilitychange",function(){r.hidden?(P=function(e){return setTimeout(function(){e(!0)},16)},c()):P=t.requestAnimationFrame||d}),e.Velocity=v,e!==t&&(e.fn.velocity=S,e.fn.velocity.defaults=v.defaults),$.each(["Down","Up"],function(e,t){v.Redirects["slide"+t]=function(e,r,n,o,i,s){var l=$.extend({},r),u=l.begin,c=l.complete,p={height:"",marginTop:"",marginBottom:"",paddingTop:"",paddingBottom:""},f={};l.display===a&&(l.display="Down"===t?"inline"===v.CSS.Values.getDisplayType(e)?"inline-block":"block":"none"),l.begin=function(){u&&u.call(i,i);for(var r in p){f[r]=e.style[r];var a=v.CSS.getPropertyValue(e,r);p[r]="Down"===t?[a,0]:[0,a]}f.overflow=e.style.overflow,e.style.overflow="hidden"},l.complete=function(){for(var t in f)e.style[t]=f[t];c&&c.call(i,i),s&&s.resolver(i)},v(e,p,l)}}),$.each(["In","Out"],function(e,t){v.Redirects["fade"+t]=function(e,r,n,o,i,s){var l=$.extend({},r),u={opacity:"In"===t?1:0},c=l.complete;l.complete=n!==o-1?l.begin=null:function(){c&&c.call(i,i),s&&s.resolver(i)},l.display===a&&(l.display="In"===t?"auto":"none"),v(this,u,l)}}),v}(window.jQuery||window.Zepto||window,window,document)});;!function(a,b,c,d){"use strict";function k(a,b,c){return setTimeout(q(a,c),b)}function l(a,b,c){return Array.isArray(a)?(m(a,c[b],c),!0):!1}function m(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function n(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a}function o(a,b){return n(a,b,!0)}function p(a,b,c){var e,d=b.prototype;e=a.prototype=Object.create(d),e.constructor=a,e._super=d,c&&n(e,c)}function q(a,b){return function(){return a.apply(b,arguments)}}function r(a,b){return typeof a==g?a.apply(b?b[0]||d:d,b):a}function s(a,b){return a===d?b:a}function t(a,b,c){m(x(b),function(b){a.addEventListener(b,c,!1)})}function u(a,b,c){m(x(b),function(b){a.removeEventListener(b,c,!1)})}function v(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function w(a,b){return a.indexOf(b)>-1}function x(a){return a.trim().split(/\s+/g)}function y(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function z(a){return Array.prototype.slice.call(a,0)}function A(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];y(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function B(a,b){for(var c,f,g=b[0].toUpperCase()+b.slice(1),h=0;h<e.length;){if(c=e[h],f=c?c+g:b,f in a)return f;h++}return d}function D(){return C++}function E(a){var b=a.ownerDocument;return b.defaultView||b.parentWindow}function ab(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){r(a.options.enable,[a])&&c.handler(b)},this.init()}function bb(a){var b,c=a.options.inputClass;return b=c?c:H?wb:I?Eb:G?Gb:rb,new b(a,cb)}function cb(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&O&&0===d-e,g=b&(Q|R)&&0===d-e;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,db(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function db(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=gb(b)),e>1&&!c.firstMultiple?c.firstMultiple=gb(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=hb(d);b.timeStamp=j(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=lb(h,i),b.distance=kb(h,i),eb(c,b),b.offsetDirection=jb(b.deltaX,b.deltaY),b.scale=g?nb(g.pointers,d):1,b.rotation=g?mb(g.pointers,d):0,fb(c,b);var k=a.element;v(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function eb(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};(b.eventType===O||f.eventType===Q)&&(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function fb(a,b){var f,g,h,j,c=a.lastInterval||b,e=b.timeStamp-c.timeStamp;if(b.eventType!=R&&(e>N||c.velocity===d)){var k=c.deltaX-b.deltaX,l=c.deltaY-b.deltaY,m=ib(e,k,l);g=m.x,h=m.y,f=i(m.x)>i(m.y)?m.x:m.y,j=jb(k,l),a.lastInterval=b}else f=c.velocity,g=c.velocityX,h=c.velocityY,j=c.direction;b.velocity=f,b.velocityX=g,b.velocityY=h,b.direction=j}function gb(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:h(a.pointers[c].clientX),clientY:h(a.pointers[c].clientY)},c++;return{timeStamp:j(),pointers:b,center:hb(b),deltaX:a.deltaX,deltaY:a.deltaY}}function hb(a){var b=a.length;if(1===b)return{x:h(a[0].clientX),y:h(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:h(c/b),y:h(d/b)}}function ib(a,b,c){return{x:b/a||0,y:c/a||0}}function jb(a,b){return a===b?S:i(a)>=i(b)?a>0?T:U:b>0?V:W}function kb(a,b,c){c||(c=$);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function lb(a,b,c){c||(c=$);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function mb(a,b){return lb(b[1],b[0],_)-lb(a[1],a[0],_)}function nb(a,b){return kb(b[0],b[1],_)/kb(a[0],a[1],_)}function rb(){this.evEl=pb,this.evWin=qb,this.allow=!0,this.pressed=!1,ab.apply(this,arguments)}function wb(){this.evEl=ub,this.evWin=vb,ab.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function Ab(){this.evTarget=yb,this.evWin=zb,this.started=!1,ab.apply(this,arguments)}function Bb(a,b){var c=z(a.touches),d=z(a.changedTouches);return b&(Q|R)&&(c=A(c.concat(d),"identifier",!0)),[c,d]}function Eb(){this.evTarget=Db,this.targetIds={},ab.apply(this,arguments)}function Fb(a,b){var c=z(a.touches),d=this.targetIds;if(b&(O|P)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=z(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return v(a.target,i)}),b===O)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Q|R)&&delete d[g[e].identifier],e++;return h.length?[A(f.concat(h),"identifier",!0),h]:void 0}function Gb(){ab.apply(this,arguments);var a=q(this.handler,this);this.touch=new Eb(this.manager,a),this.mouse=new rb(this.manager,a)}function Pb(a,b){this.manager=a,this.set(b)}function Qb(a){if(w(a,Mb))return Mb;var b=w(a,Nb),c=w(a,Ob);return b&&c?Nb+" "+Ob:b||c?b?Nb:Ob:w(a,Lb)?Lb:Kb}function Yb(a){this.id=D(),this.manager=null,this.options=o(a||{},this.defaults),this.options.enable=s(this.options.enable,!0),this.state=Rb,this.simultaneous={},this.requireFail=[]}function Zb(a){return a&Wb?"cancel":a&Ub?"end":a&Tb?"move":a&Sb?"start":""}function $b(a){return a==W?"down":a==V?"up":a==T?"left":a==U?"right":""}function _b(a,b){var c=b.manager;return c?c.get(a):a}function ac(){Yb.apply(this,arguments)}function bc(){ac.apply(this,arguments),this.pX=null,this.pY=null}function cc(){ac.apply(this,arguments)}function dc(){Yb.apply(this,arguments),this._timer=null,this._input=null}function ec(){ac.apply(this,arguments)}function fc(){ac.apply(this,arguments)}function gc(){Yb.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function hc(a,b){return b=b||{},b.recognizers=s(b.recognizers,hc.defaults.preset),new kc(a,b)}function kc(a,b){b=b||{},this.options=o(b,hc.defaults),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.element=a,this.input=bb(this),this.touchAction=new Pb(this,this.options.touchAction),lc(this,!0),m(b.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function lc(a,b){var c=a.element;m(a.options.cssProps,function(a,d){c.style[B(c.style,d)]=b?a:""})}function mc(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var e=["","webkit","moz","MS","ms","o"],f=b.createElement("div"),g="function",h=Math.round,i=Math.abs,j=Date.now,C=1,F=/mobile|tablet|ip(ad|hone|od)|android/i,G="ontouchstart"in a,H=B(a,"PointerEvent")!==d,I=G&&F.test(navigator.userAgent),J="touch",K="pen",L="mouse",M="kinect",N=25,O=1,P=2,Q=4,R=8,S=1,T=2,U=4,V=8,W=16,X=T|U,Y=V|W,Z=X|Y,$=["x","y"],_=["clientX","clientY"];ab.prototype={handler:function(){},init:function(){this.evEl&&t(this.element,this.evEl,this.domHandler),this.evTarget&&t(this.target,this.evTarget,this.domHandler),this.evWin&&t(E(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&u(this.element,this.evEl,this.domHandler),this.evTarget&&u(this.target,this.evTarget,this.domHandler),this.evWin&&u(E(this.element),this.evWin,this.domHandler)}};var ob={mousedown:O,mousemove:P,mouseup:Q},pb="mousedown",qb="mousemove mouseup";p(rb,ab,{handler:function(a){var b=ob[a.type];b&O&&0===a.button&&(this.pressed=!0),b&P&&1!==a.which&&(b=Q),this.pressed&&this.allow&&(b&Q&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:L,srcEvent:a}))}});var sb={pointerdown:O,pointermove:P,pointerup:Q,pointercancel:R,pointerout:R},tb={2:J,3:K,4:L,5:M},ub="pointerdown",vb="pointermove pointerup pointercancel";a.MSPointerEvent&&(ub="MSPointerDown",vb="MSPointerMove MSPointerUp MSPointerCancel"),p(wb,ab,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=sb[d],f=tb[a.pointerType]||a.pointerType,g=f==J,h=y(b,a.pointerId,"pointerId");e&O&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Q|R)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var xb={touchstart:O,touchmove:P,touchend:Q,touchcancel:R},yb="touchstart",zb="touchstart touchmove touchend touchcancel";p(Ab,ab,{handler:function(a){var b=xb[a.type];if(b===O&&(this.started=!0),this.started){var c=Bb.call(this,a,b);b&(Q|R)&&0===c[0].length-c[1].length&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:J,srcEvent:a})}}});var Cb={touchstart:O,touchmove:P,touchend:Q,touchcancel:R},Db="touchstart touchmove touchend touchcancel";p(Eb,ab,{handler:function(a){var b=Cb[a.type],c=Fb.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:J,srcEvent:a})}}),p(Gb,ab,{handler:function(a,b,c){var d=c.pointerType==J,e=c.pointerType==L;if(d)this.mouse.allow=!1;else if(e&&!this.mouse.allow)return;b&(Q|R)&&(this.mouse.allow=!0),this.callback(a,b,c)},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var Hb=B(f.style,"touchAction"),Ib=Hb!==d,Jb="compute",Kb="auto",Lb="manipulation",Mb="none",Nb="pan-x",Ob="pan-y";Pb.prototype={set:function(a){a==Jb&&(a=this.compute()),Ib&&(this.manager.element.style[Hb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return m(this.manager.recognizers,function(b){r(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),Qb(a.join(" "))},preventDefaults:function(a){if(!Ib){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return b.preventDefault(),void 0;var d=this.actions,e=w(d,Mb),f=w(d,Ob),g=w(d,Nb);return e||f&&c&X||g&&c&Y?this.preventSrc(b):void 0}},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var Rb=1,Sb=2,Tb=4,Ub=8,Vb=Ub,Wb=16,Xb=32;Yb.prototype={defaults:{},set:function(a){return n(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(l(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=_b(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return l(a,"dropRecognizeWith",this)?this:(a=_b(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(l(a,"requireFailure",this))return this;var b=this.requireFail;return a=_b(a,this),-1===y(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(l(a,"dropRequireFailure",this))return this;a=_b(a,this);var b=y(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function d(d){b.manager.emit(b.options.event+(d?Zb(c):""),a)}var b=this,c=this.state;Ub>c&&d(!0),d(),c>=Ub&&d(!0)},tryEmit:function(a){return this.canEmit()?this.emit(a):(this.state=Xb,void 0)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(Xb|Rb)))return!1;a++}return!0},recognize:function(a){var b=n({},a);return r(this.options.enable,[this,b])?(this.state&(Vb|Wb|Xb)&&(this.state=Rb),this.state=this.process(b),this.state&(Sb|Tb|Ub|Wb)&&this.tryEmit(b),void 0):(this.reset(),this.state=Xb,void 0)},process:function(){},getTouchAction:function(){},reset:function(){}},p(ac,Yb,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(Sb|Tb),e=this.attrTest(a);return d&&(c&R||!e)?b|Wb:d||e?c&Q?b|Ub:b&Sb?b|Tb:Sb:Xb}}),p(bc,ac,{defaults:{event:"pan",threshold:10,pointers:1,direction:Z},getTouchAction:function(){var a=this.options.direction,b=[];return a&X&&b.push(Ob),a&Y&&b.push(Nb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&X?(e=0===f?S:0>f?T:U,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?S:0>g?V:W,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return ac.prototype.attrTest.call(this,a)&&(this.state&Sb||!(this.state&Sb)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$b(a.direction);b&&this.manager.emit(this.options.event+b,a),this._super.emit.call(this,a)}}),p(cc,ac,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[Mb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&Sb)},emit:function(a){if(this._super.emit.call(this,a),1!==a.scale){var b=a.scale<1?"in":"out";this.manager.emit(this.options.event+b,a)}}}),p(dc,Yb,{defaults:{event:"press",pointers:1,time:500,threshold:5},getTouchAction:function(){return[Kb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,e=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Q|R)&&!e)this.reset();else if(a.eventType&O)this.reset(),this._timer=k(function(){this.state=Vb,this.tryEmit()},b.time,this);else if(a.eventType&Q)return Vb;return Xb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===Vb&&(a&&a.eventType&Q?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=j(),this.manager.emit(this.options.event,this._input)))}}),p(ec,ac,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[Mb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&Sb)}}),p(fc,ac,{defaults:{event:"swipe",threshold:10,velocity:.65,direction:X|Y,pointers:1},getTouchAction:function(){return bc.prototype.getTouchAction.call(this)},attrTest:function(a){var c,b=this.options.direction;return b&(X|Y)?c=a.velocity:b&X?c=a.velocityX:b&Y&&(c=a.velocityY),this._super.attrTest.call(this,a)&&b&a.direction&&a.distance>this.options.threshold&&i(c)>this.options.velocity&&a.eventType&Q},emit:function(a){var b=$b(a.direction);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),p(gc,Yb,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:2,posThreshold:10},getTouchAction:function(){return[Lb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,e=a.deltaTime<b.time;if(this.reset(),a.eventType&O&&0===this.count)return this.failTimeout();if(d&&e&&c){if(a.eventType!=Q)return this.failTimeout();var f=this.pTime?a.timeStamp-this.pTime<b.interval:!0,g=!this.pCenter||kb(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,g&&f?this.count+=1:this.count=1,this._input=a;var h=this.count%b.taps;if(0===h)return this.hasRequireFailures()?(this._timer=k(function(){this.state=Vb,this.tryEmit()},b.interval,this),Sb):Vb}return Xb},failTimeout:function(){return this._timer=k(function(){this.state=Xb},this.options.interval,this),Xb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==Vb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),hc.VERSION="2.0.4",hc.defaults={domEvents:!1,touchAction:Jb,enable:!0,inputTarget:null,inputClass:null,preset:[[ec,{enable:!1}],[cc,{enable:!1},["rotate"]],[fc,{direction:X}],[bc,{direction:X},["swipe"]],[gc],[gc,{event:"doubletap",taps:2},["tap"]],[dc]],cssProps:{userSelect:"default",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var ic=1,jc=2;kc.prototype={set:function(a){return n(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?jc:ic},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&Vb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===jc||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(Sb|Tb|Ub)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof Yb)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(l(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(l(a,"remove",this))return this;var b=this.recognizers;return a=this.get(a),b.splice(y(b,a),1),this.touchAction.update(),this},on:function(a,b){var c=this.handlers;return m(x(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this},off:function(a,b){var c=this.handlers;return m(x(a),function(a){b?c[a].splice(y(c[a],b),1):delete c[a]}),this},emit:function(a,b){this.options.domEvents&&mc(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&lc(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},n(hc,{INPUT_START:O,INPUT_MOVE:P,INPUT_END:Q,INPUT_CANCEL:R,STATE_POSSIBLE:Rb,STATE_BEGAN:Sb,STATE_CHANGED:Tb,STATE_ENDED:Ub,STATE_RECOGNIZED:Vb,STATE_CANCELLED:Wb,STATE_FAILED:Xb,DIRECTION_NONE:S,DIRECTION_LEFT:T,DIRECTION_RIGHT:U,DIRECTION_UP:V,DIRECTION_DOWN:W,DIRECTION_HORIZONTAL:X,DIRECTION_VERTICAL:Y,DIRECTION_ALL:Z,Manager:kc,Input:ab,TouchAction:Pb,TouchInput:Eb,MouseInput:rb,PointerEventInput:wb,TouchMouseInput:Gb,SingleTouchInput:Ab,Recognizer:Yb,AttrRecognizer:ac,Tap:gc,Pan:bc,Swipe:fc,Pinch:cc,Rotate:ec,Press:dc,on:t,off:u,each:m,merge:o,extend:n,inherit:p,bindFn:q,prefixed:B}),typeof define==g&&define.amd?define(function(){return hc}):"undefined"!=typeof module&&module.exports?module.exports=hc:a[c]=hc}(window,document,"Hammer");;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'hammerjs'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('hammerjs'));
    } else {
        factory(jQuery, Hammer);
    }
}(function($, Hammer) {
    function hammerify(el, options) {
        var $el = $(el);
        if(!$el.data("hammer")) {
            $el.data("hammer", new Hammer($el[0], options));
        }
    }

    $.fn.hammer = function(options) {
        return this.each(function() {
            hammerify(this, options);
        });
    };

    // extend the emit method to also trigger jQuery events
    Hammer.Manager.prototype.emit = (function(originalEmit) {
        return function(type, data) {
            originalEmit.call(this, type, data);
            $(this.element).trigger({
                type: type,
                gesture: data
            });
        };
    })(Hammer.Manager.prototype.emit);
}));

  var methods = {
    init : function() {
      return this.each(function() {

      // For each set of tabs, we want to keep track of
      // which tab is active and its associated content
      var $this = $(this),
          window_width = $(window).width();

      $this.width('100%');
      // Set Tab Width for each tab
      var $num_tabs = $(this).children('li').length;
      $this.children('li').each(function() {
        $(this).width((100/$num_tabs)+'%');
      });
      var $active, $content, $links = $this.find('li.tab a'),
          $tabs_width = $this.width(),
          $tab_width = $this.find('li').first().outerWidth(),
          $index = 0;

      // If the location.hash matches one of the links, use that as the active tab.
      $active = $($links.filter('[href="'+location.hash+'"]'));

      // If no match is found, use the first link or any with class 'active' as the initial active tab.
      if ($active.length === 0) {
          $active = $(this).find('li.tab a.active').first();
      }
      if ($active.length === 0) {
        $active = $(this).find('li.tab a').first();
      }

      $active.addClass('active');
      $index = $links.index($active);
      if ($index < 0) {
        $index = 0;
      }

      $content = $($active[0].hash);

      // append indicator then set indicator width to tab width
      $this.append('<div class="indicator"></div>');
      var $indicator = $this.find('.indicator');
      if ($this.is(":visible")) {
        $indicator.css({"right": $tabs_width - (($index + 1) * $tab_width)});
        $indicator.css({"left": $index * $tab_width});
      }
      $(window).resize(function () {
        $tabs_width = $this.width();
        $tab_width = $this.find('li').first().outerWidth();
        if ($index < 0) {
          $index = 0;
        }
        if ($tab_width !== 0 && $tabs_width !== 0) {
          $indicator.css({"right": $tabs_width - (($index + 1) * $tab_width)});
          $indicator.css({"left": $index * $tab_width});
        }
      });

      // Hide the remaining content
      $links.not($active).each(function () {
        $(this.hash).hide();
      });


      // Bind the click event handler
      $this.on('click', 'a', function(e){
        $tabs_width = $this.width();
        $tab_width = $this.find('li').first().outerWidth();

        // Make the old tab inactive.
        $active.removeClass('active');
        $content.hide();

        // Update the variables with the new link and content
        $active = $(this);
        $content = $(this.hash);
        $links = $this.find('li.tab a');

        // Make the tab active.
        $active.addClass('active');
        var $prev_index = $index;
        $index = $links.index($(this));
        if ($index < 0) {
          $index = 0;
        }
        // Change url to current tab
        // window.location.hash = $active.attr('href');

        $content.show();

        // Update indicator
        if (($index - $prev_index) >= 0) {
          $indicator.velocity({"right": $tabs_width - (($index + 1) * $tab_width)}, { duration: 300, queue: false, easing: 'easeOutQuad'});
          $indicator.velocity({"left": $index * $tab_width}, {duration: 300, queue: false, easing: 'easeOutQuad', delay: 90});

        }
        else {
          $indicator.velocity({"left": $index * $tab_width}, { duration: 300, queue: false, easing: 'easeOutQuad'});
          $indicator.velocity({"right": $tabs_width - (($index + 1) * $tab_width)}, {duration: 300, queue: false, easing: 'easeOutQuad', delay: 90});
        }

        // Prevent the anchor's default click action
        e.preventDefault();
      });
    });

    },
    select_tab : function( id ) {
      this.find('a[href="#' + id + '"]').trigger('click');
    }
  };

  $.fn.tabs = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
      return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      // Default to "init"
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
    }
  };

  $(document).ready(function(){
    $('ul.tabs').tabs();
  });
/* jquery.nicescroll 3.5.0 InuYaksa*2013 MIT http://areaaperta.com/nicescroll */
(function(e){var z=!1,E=!1,L=5E3,M=2E3,y=0,N=function(){var e=document.getElementsByTagName("script"),e=e[e.length-1].src.split("?")[0];return 0<e.split("/").length?e.split("/").slice(0,-1).join("/")+"/":""}(),H=["ms","moz","webkit","o"],v=window.requestAnimationFrame||!1,w=window.cancelAnimationFrame||!1;if(!v)for(var O in H){var F=H[O];v||(v=window[F+"RequestAnimationFrame"]);w||(w=window[F+"CancelAnimationFrame"]||window[F+"CancelRequestAnimationFrame"])}var A=window.MutationObserver||window.WebKitMutationObserver||
    !1,I={zindex:"auto",cursoropacitymin:0,cursoropacitymax:1,cursorcolor:"#424242",cursorwidth:"5px",cursorborder:"1px solid #fff",cursorborderradius:"5px",scrollspeed:60,mousescrollstep:24,touchbehavior:!1,hwacceleration:!0,usetransition:!0,boxzoom:!1,dblclickzoom:!0,gesturezoom:!0,grabcursorenabled:!0,autohidemode:!0,background:"",iframeautoresize:!0,cursorminheight:32,preservenativescrolling:!0,railoffset:!1,bouncescroll:!0,spacebarenabled:!0,railpadding:{top:0,right:0,left:0,bottom:0},disableoutline:!0,
    horizrailenabled:!0,railalign:"right",railvalign:"bottom",enabletranslate3d:!0,enablemousewheel:!0,enablekeyboard:!0,smoothscroll:!0,sensitiverail:!0,enablemouselockapi:!0,cursorfixedheight:!1,directionlockdeadzone:6,hidecursordelay:400,nativeparentscrolling:!0,enablescrollonselection:!0,overflowx:!0,overflowy:!0,cursordragspeed:0.3,rtlmode:!1,cursordragontouch:!1,oneaxismousemode:"auto"},G=!1,P=function(){if(G)return G;var e=document.createElement("DIV"),c={haspointerlock:"pointerLockElement"in document||
    "mozPointerLockElement"in document||"webkitPointerLockElement"in document};c.isopera="opera"in window;c.isopera12=c.isopera&&"getUserMedia"in navigator;c.isoperamini="[object OperaMini]"===Object.prototype.toString.call(window.operamini);c.isie="all"in document&&"attachEvent"in e&&!c.isopera;c.isieold=c.isie&&!("msInterpolationMode"in e.style);c.isie7=c.isie&&!c.isieold&&(!("documentMode"in document)||7==document.documentMode);c.isie8=c.isie&&"documentMode"in document&&8==document.documentMode;c.isie9=
    c.isie&&"performance"in window&&9<=document.documentMode;c.isie10=c.isie&&"performance"in window&&10<=document.documentMode;c.isie9mobile=/iemobile.9/i.test(navigator.userAgent);c.isie9mobile&&(c.isie9=!1);c.isie7mobile=!c.isie9mobile&&c.isie7&&/iemobile/i.test(navigator.userAgent);c.ismozilla="MozAppearance"in e.style;c.iswebkit="WebkitAppearance"in e.style;c.ischrome="chrome"in window;c.ischrome22=c.ischrome&&c.haspointerlock;c.ischrome26=c.ischrome&&"transition"in e.style;c.cantouch="ontouchstart"in
    document.documentElement||"ontouchstart"in window;c.hasmstouch=window.navigator.msPointerEnabled||!1;c.ismac=/^mac$/i.test(navigator.platform);c.isios=c.cantouch&&/iphone|ipad|ipod/i.test(navigator.platform);c.isios4=c.isios&&!("seal"in Object);c.isandroid=/android/i.test(navigator.userAgent);c.trstyle=!1;c.hastransform=!1;c.hastranslate3d=!1;c.transitionstyle=!1;c.hastransition=!1;c.transitionend=!1;for(var k=["transform","msTransform","webkitTransform","MozTransform","OTransform"],l=0;l<k.length;l++)if("undefined"!=
    typeof e.style[k[l]]){c.trstyle=k[l];break}c.hastransform=!1!=c.trstyle;c.hastransform&&(e.style[c.trstyle]="translate3d(1px,2px,3px)",c.hastranslate3d=/translate3d/.test(e.style[c.trstyle]));c.transitionstyle=!1;c.prefixstyle="";c.transitionend=!1;for(var k="transition webkitTransition MozTransition OTransition OTransition msTransition KhtmlTransition".split(" "),q=" -webkit- -moz- -o- -o -ms- -khtml-".split(" "),t="transitionend webkitTransitionEnd transitionend otransitionend oTransitionEnd msTransitionEnd KhtmlTransitionEnd".split(" "),
                                                                                                                                                                                                                                                                     l=0;l<k.length;l++)if(k[l]in e.style){c.transitionstyle=k[l];c.prefixstyle=q[l];c.transitionend=t[l];break}c.ischrome26&&(c.prefixstyle=q[1]);c.hastransition=c.transitionstyle;a:{k=["-moz-grab","-webkit-grab","grab"];if(c.ischrome&&!c.ischrome22||c.isie)k=[];for(l=0;l<k.length;l++)if(q=k[l],e.style.cursor=q,e.style.cursor==q){k=q;break a}k="url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize"}c.cursorgrabvalue=k;c.hasmousecapture="setCapture"in e;c.hasMutationObserver=!1!==A;return G=
    c},Q=function(h,c){function k(){var d=b.win;if("zIndex"in d)return d.zIndex();for(;0<d.length&&9!=d[0].nodeType;){var c=d.css("zIndex");if(!isNaN(c)&&0!=c)return parseInt(c);d=d.parent()}return!1}function l(d,c,f){c=d.css(c);d=parseFloat(c);return isNaN(d)?(d=u[c]||0,f=3==d?f?b.win.outerHeight()-b.win.innerHeight():b.win.outerWidth()-b.win.innerWidth():1,b.isie8&&d&&(d+=1),f?d:0):d}function q(d,c,f,g){b._bind(d,c,function(b){b=b?b:window.event;var g={original:b,target:b.target||b.srcElement,type:"wheel",
    deltaMode:"MozMousePixelScroll"==b.type?0:1,deltaX:0,deltaZ:0,preventDefault:function(){b.preventDefault?b.preventDefault():b.returnValue=!1;return!1},stopImmediatePropagation:function(){b.stopImmediatePropagation?b.stopImmediatePropagation():b.cancelBubble=!0}};"mousewheel"==c?(g.deltaY=-0.025*b.wheelDelta,b.wheelDeltaX&&(g.deltaX=-0.025*b.wheelDeltaX)):g.deltaY=b.detail;return f.call(d,g)},g)}function t(d,c,f){var g,e;0==d.deltaMode?(g=-Math.floor(d.deltaX*(b.opt.mousescrollstep/54)),e=-Math.floor(d.deltaY*
    (b.opt.mousescrollstep/54))):1==d.deltaMode&&(g=-Math.floor(d.deltaX*b.opt.mousescrollstep),e=-Math.floor(d.deltaY*b.opt.mousescrollstep));c&&(b.opt.oneaxismousemode&&0==g&&e)&&(g=e,e=0);g&&(b.scrollmom&&b.scrollmom.stop(),b.lastdeltax+=g,b.debounced("mousewheelx",function(){var d=b.lastdeltax;b.lastdeltax=0;b.rail.drag||b.doScrollLeftBy(d)},120));if(e){if(b.opt.nativeparentscrolling&&f&&!b.ispage&&!b.zoomactive)if(0>e){if(b.getScrollTop()>=b.page.maxh)return!0}else if(0>=b.getScrollTop())return!0;
    b.scrollmom&&b.scrollmom.stop();b.lastdeltay+=e;b.debounced("mousewheely",function(){var d=b.lastdeltay;b.lastdeltay=0;b.rail.drag||b.doScrollBy(d)},120)}d.stopImmediatePropagation();return d.preventDefault()}var b=this;this.version="3.5.0";this.name="nicescroll";this.me=c;this.opt={doc:e("body"),win:!1};e.extend(this.opt,I);this.opt.snapbackspeed=80;if(h)for(var p in b.opt)"undefined"!=typeof h[p]&&(b.opt[p]=h[p]);this.iddoc=(this.doc=b.opt.doc)&&this.doc[0]?this.doc[0].id||"":"";this.ispage=/BODY|HTML/.test(b.opt.win?
    b.opt.win[0].nodeName:this.doc[0].nodeName);this.haswrapper=!1!==b.opt.win;this.win=b.opt.win||(this.ispage?e(window):this.doc);this.docscroll=this.ispage&&!this.haswrapper?e(window):this.win;this.body=e("body");this.iframe=this.isfixed=this.viewport=!1;this.isiframe="IFRAME"==this.doc[0].nodeName&&"IFRAME"==this.win[0].nodeName;this.istextarea="TEXTAREA"==this.win[0].nodeName;this.forcescreen=!1;this.canshowonmouseevent="scroll"!=b.opt.autohidemode;this.page=this.view=this.onzoomout=this.onzoomin=
    this.onscrollcancel=this.onscrollend=this.onscrollstart=this.onclick=this.ongesturezoom=this.onkeypress=this.onmousewheel=this.onmousemove=this.onmouseup=this.onmousedown=!1;this.scroll={x:0,y:0};this.scrollratio={x:0,y:0};this.cursorheight=20;this.scrollvaluemax=0;this.observerremover=this.observer=this.scrollmom=this.scrollrunning=this.checkrtlmode=!1;do this.id="ascrail"+M++;while(document.getElementById(this.id));this.hasmousefocus=this.hasfocus=this.zoomactive=this.zoom=this.selectiondrag=this.cursorfreezed=
    this.cursor=this.rail=!1;this.visibility=!0;this.hidden=this.locked=!1;this.cursoractive=!0;this.overflowx=b.opt.overflowx;this.overflowy=b.opt.overflowy;this.nativescrollingarea=!1;this.checkarea=0;this.events=[];this.saved={};this.delaylist={};this.synclist={};this.lastdeltay=this.lastdeltax=0;this.detected=P();var g=e.extend({},this.detected);this.ishwscroll=(this.canhwscroll=g.hastransform&&b.opt.hwacceleration)&&b.haswrapper;this.istouchcapable=!1;g.cantouch&&(g.ischrome&&!g.isios&&!g.isandroid)&&
(this.istouchcapable=!0,g.cantouch=!1);g.cantouch&&(g.ismozilla&&!g.isios&&!g.isandroid)&&(this.istouchcapable=!0,g.cantouch=!1);b.opt.enablemouselockapi||(g.hasmousecapture=!1,g.haspointerlock=!1);this.delayed=function(d,c,f,g){var e=b.delaylist[d],k=(new Date).getTime();if(!g&&e&&e.tt)return!1;e&&e.tt&&clearTimeout(e.tt);if(e&&e.last+f>k&&!e.tt)b.delaylist[d]={last:k+f,tt:setTimeout(function(){b.delaylist[d].tt=0;c.call()},f)};else if(!e||!e.tt)b.delaylist[d]={last:k,tt:0},setTimeout(function(){c.call()},
    0)};this.debounced=function(d,c,f){var g=b.delaylist[d];(new Date).getTime();b.delaylist[d]=c;g||setTimeout(function(){var c=b.delaylist[d];b.delaylist[d]=!1;c.call()},f)};this.synched=function(d,c){b.synclist[d]=c;(function(){b.onsync||(v(function(){b.onsync=!1;for(d in b.synclist){var c=b.synclist[d];c&&c.call(b);b.synclist[d]=!1}}),b.onsync=!0)})();return d};this.unsynched=function(d){b.synclist[d]&&(b.synclist[d]=!1)};this.css=function(d,c){for(var f in c)b.saved.css.push([d,f,d.css(f)]),d.css(f,
    c[f])};this.scrollTop=function(d){return"undefined"==typeof d?b.getScrollTop():b.setScrollTop(d)};this.scrollLeft=function(d){return"undefined"==typeof d?b.getScrollLeft():b.setScrollLeft(d)};BezierClass=function(b,c,f,g,e,k,l){this.st=b;this.ed=c;this.spd=f;this.p1=g||0;this.p2=e||1;this.p3=k||0;this.p4=l||1;this.ts=(new Date).getTime();this.df=this.ed-this.st};BezierClass.prototype={B2:function(b){return 3*b*b*(1-b)},B3:function(b){return 3*b*(1-b)*(1-b)},B4:function(b){return(1-b)*(1-b)*(1-b)},
    getNow:function(){var b=1-((new Date).getTime()-this.ts)/this.spd,c=this.B2(b)+this.B3(b)+this.B4(b);return 0>b?this.ed:this.st+Math.round(this.df*c)},update:function(b,c){this.st=this.getNow();this.ed=b;this.spd=c;this.ts=(new Date).getTime();this.df=this.ed-this.st;return this}};if(this.ishwscroll){this.doc.translate={x:0,y:0,tx:"0px",ty:"0px"};g.hastranslate3d&&g.isios&&this.doc.css("-webkit-backface-visibility","hidden");var s=function(){var d=b.doc.css(g.trstyle);return d&&"matrix"==d.substr(0,
    6)?d.replace(/^.*\((.*)\)$/g,"$1").replace(/px/g,"").split(/, +/):!1};this.getScrollTop=function(d){if(!d){if(d=s())return 16==d.length?-d[13]:-d[5];if(b.timerscroll&&b.timerscroll.bz)return b.timerscroll.bz.getNow()}return b.doc.translate.y};this.getScrollLeft=function(d){if(!d){if(d=s())return 16==d.length?-d[12]:-d[4];if(b.timerscroll&&b.timerscroll.bh)return b.timerscroll.bh.getNow()}return b.doc.translate.x};this.notifyScrollEvent=document.createEvent?function(b){var c=document.createEvent("UIEvents");
    c.initUIEvent("scroll",!1,!0,window,1);b.dispatchEvent(c)}:document.fireEvent?function(b){var c=document.createEventObject();b.fireEvent("onscroll");c.cancelBubble=!0}:function(b,c){};g.hastranslate3d&&b.opt.enabletranslate3d?(this.setScrollTop=function(d,c){b.doc.translate.y=d;b.doc.translate.ty=-1*d+"px";b.doc.css(g.trstyle,"translate3d("+b.doc.translate.tx+","+b.doc.translate.ty+",0px)");c||b.notifyScrollEvent(b.win[0])},this.setScrollLeft=function(d,c){b.doc.translate.x=d;b.doc.translate.tx=-1*
    d+"px";b.doc.css(g.trstyle,"translate3d("+b.doc.translate.tx+","+b.doc.translate.ty+",0px)");c||b.notifyScrollEvent(b.win[0])}):(this.setScrollTop=function(d,c){b.doc.translate.y=d;b.doc.translate.ty=-1*d+"px";b.doc.css(g.trstyle,"translate("+b.doc.translate.tx+","+b.doc.translate.ty+")");c||b.notifyScrollEvent(b.win[0])},this.setScrollLeft=function(d,c){b.doc.translate.x=d;b.doc.translate.tx=-1*d+"px";b.doc.css(g.trstyle,"translate("+b.doc.translate.tx+","+b.doc.translate.ty+")");c||b.notifyScrollEvent(b.win[0])})}else this.getScrollTop=
    function(){return b.docscroll.scrollTop()},this.setScrollTop=function(d){return b.docscroll.scrollTop(d)},this.getScrollLeft=function(){return b.docscroll.scrollLeft()},this.setScrollLeft=function(d){return b.docscroll.scrollLeft(d)};this.getTarget=function(b){return!b?!1:b.target?b.target:b.srcElement?b.srcElement:!1};this.hasParent=function(b,c){if(!b)return!1;for(var f=b.target||b.srcElement||b||!1;f&&f.id!=c;)f=f.parentNode||!1;return!1!==f};var u={thin:1,medium:3,thick:5};this.getOffset=function(){if(b.isfixed)return{top:parseFloat(b.win.css("top")),
    left:parseFloat(b.win.css("left"))};if(!b.viewport)return b.win.offset();var d=b.win.offset(),c=b.viewport.offset();return{top:d.top-c.top+b.viewport.scrollTop(),left:d.left-c.left+b.viewport.scrollLeft()}};this.updateScrollBar=function(d){if(b.ishwscroll)b.rail.css({height:b.win.innerHeight()}),b.railh&&b.railh.css({width:b.win.innerWidth()});else{var c=b.getOffset(),f=c.top,g=c.left,f=f+l(b.win,"border-top-width",!0);b.win.outerWidth();b.win.innerWidth();var g=g+(b.rail.align?b.win.outerWidth()-
    l(b.win,"border-right-width")-b.rail.width:l(b.win,"border-left-width")),e=b.opt.railoffset;e&&(e.top&&(f+=e.top),b.rail.align&&e.left&&(g+=e.left));b.locked||b.rail.css({top:f,left:g,height:d?d.h:b.win.innerHeight()});b.zoom&&b.zoom.css({top:f+1,left:1==b.rail.align?g-20:g+b.rail.width+4});b.railh&&!b.locked&&(f=c.top,g=c.left,d=b.railh.align?f+l(b.win,"border-top-width",!0)+b.win.innerHeight()-b.railh.height:f+l(b.win,"border-top-width",!0),g+=l(b.win,"border-left-width"),b.railh.css({top:d,left:g,
    width:b.railh.width}))}};this.doRailClick=function(d,c,f){var g;b.locked||(b.cancelEvent(d),c?(c=f?b.doScrollLeft:b.doScrollTop,g=f?(d.pageX-b.railh.offset().left-b.cursorwidth/2)*b.scrollratio.x:(d.pageY-b.rail.offset().top-b.cursorheight/2)*b.scrollratio.y,c(g)):(c=f?b.doScrollLeftBy:b.doScrollBy,g=f?b.scroll.x:b.scroll.y,d=f?d.pageX-b.railh.offset().left:d.pageY-b.rail.offset().top,f=f?b.view.w:b.view.h,g>=d?c(f):c(-f)))};b.hasanimationframe=v;b.hascancelanimationframe=w;b.hasanimationframe?b.hascancelanimationframe||
    (w=function(){b.cancelAnimationFrame=!0}):(v=function(b){return setTimeout(b,15-Math.floor(+new Date/1E3)%16)},w=clearInterval);this.init=function(){b.saved.css=[];if(g.isie7mobile||g.isoperamini)return!0;g.hasmstouch&&b.css(b.ispage?e("html"):b.win,{"-ms-touch-action":"none"});b.zindex="auto";b.zindex=!b.ispage&&"auto"==b.opt.zindex?k()||"auto":b.opt.zindex;!b.ispage&&"auto"!=b.zindex&&b.zindex>y&&(y=b.zindex);b.isie&&(0==b.zindex&&"auto"==b.opt.zindex)&&(b.zindex="auto");if(!b.ispage||!g.cantouch&&
    !g.isieold&&!g.isie9mobile){var d=b.docscroll;b.ispage&&(d=b.haswrapper?b.win:b.doc);g.isie9mobile||b.css(d,{"overflow-y":"hidden"});b.ispage&&g.isie7&&("BODY"==b.doc[0].nodeName?b.css(e("html"),{"overflow-y":"hidden"}):"HTML"==b.doc[0].nodeName&&b.css(e("body"),{"overflow-y":"hidden"}));g.isios&&(!b.ispage&&!b.haswrapper)&&b.css(e("body"),{"-webkit-overflow-scrolling":"touch"});var c=e(document.createElement("div"));c.css({position:"relative",top:0,"float":"right",width:b.opt.cursorwidth,height:"0px",
    "background-color":b.opt.cursorcolor,border:b.opt.cursorborder,"background-clip":"padding-box","-webkit-border-radius":b.opt.cursorborderradius,"-moz-border-radius":b.opt.cursorborderradius,"border-radius":b.opt.cursorborderradius});c.hborder=parseFloat(c.outerHeight()-c.innerHeight());b.cursor=c;var f=e(document.createElement("div"));f.attr("id",b.id);f.addClass("nicescroll-rails");var l,h,x=["left","right"],q;for(q in x)h=x[q],(l=b.opt.railpadding[h])?f.css("padding-"+h,l+"px"):b.opt.railpadding[h]=
    0;f.append(c);f.width=Math.max(parseFloat(b.opt.cursorwidth),c.outerWidth())+b.opt.railpadding.left+b.opt.railpadding.right;f.css({width:f.width+"px",zIndex:b.zindex,background:b.opt.background,cursor:"default"});f.visibility=!0;f.scrollable=!0;f.align="left"==b.opt.railalign?0:1;b.rail=f;c=b.rail.drag=!1;b.opt.boxzoom&&(!b.ispage&&!g.isieold)&&(c=document.createElement("div"),b.bind(c,"click",b.doZoom),b.zoom=e(c),b.zoom.css({cursor:"pointer","z-index":b.zindex,backgroundImage:"url("+N+"zoomico.png)",
    height:18,width:18,backgroundPosition:"0px 0px"}),b.opt.dblclickzoom&&b.bind(b.win,"dblclick",b.doZoom),g.cantouch&&b.opt.gesturezoom&&(b.ongesturezoom=function(d){1.5<d.scale&&b.doZoomIn(d);0.8>d.scale&&b.doZoomOut(d);return b.cancelEvent(d)},b.bind(b.win,"gestureend",b.ongesturezoom)));b.railh=!1;if(b.opt.horizrailenabled){b.css(d,{"overflow-x":"hidden"});c=e(document.createElement("div"));c.css({position:"relative",top:0,height:b.opt.cursorwidth,width:"0px","background-color":b.opt.cursorcolor,
    border:b.opt.cursorborder,"background-clip":"padding-box","-webkit-border-radius":b.opt.cursorborderradius,"-moz-border-radius":b.opt.cursorborderradius,"border-radius":b.opt.cursorborderradius});c.wborder=parseFloat(c.outerWidth()-c.innerWidth());b.cursorh=c;var m=e(document.createElement("div"));m.attr("id",b.id+"-hr");m.addClass("nicescroll-rails");m.height=Math.max(parseFloat(b.opt.cursorwidth),c.outerHeight());m.css({height:m.height+"px",zIndex:b.zindex,background:b.opt.background});m.append(c);
    m.visibility=!0;m.scrollable=!0;m.align="top"==b.opt.railvalign?0:1;b.railh=m;b.railh.drag=!1}b.ispage?(f.css({position:"fixed",top:"0px",height:"100%"}),f.align?f.css({right:"0px"}):f.css({left:"0px"}),b.body.append(f),b.railh&&(m.css({position:"fixed",left:"0px",width:"100%"}),m.align?m.css({bottom:"0px"}):m.css({top:"0px"}),b.body.append(m))):(b.ishwscroll?("static"==b.win.css("position")&&b.css(b.win,{position:"relative"}),d="HTML"==b.win[0].nodeName?b.body:b.win,b.zoom&&(b.zoom.css({position:"absolute",
    top:1,right:0,"margin-right":f.width+4}),d.append(b.zoom)),f.css({position:"absolute",top:0}),f.align?f.css({right:0}):f.css({left:0}),d.append(f),m&&(m.css({position:"absolute",left:0,bottom:0}),m.align?m.css({bottom:0}):m.css({top:0}),d.append(m))):(b.isfixed="fixed"==b.win.css("position"),d=b.isfixed?"fixed":"absolute",b.isfixed||(b.viewport=b.getViewport(b.win[0])),b.viewport&&(b.body=b.viewport,!1==/fixed|relative|absolute/.test(b.viewport.css("position"))&&b.css(b.viewport,{position:"relative"})),
    f.css({position:d}),b.zoom&&b.zoom.css({position:d}),b.updateScrollBar(),b.body.append(f),b.zoom&&b.body.append(b.zoom),b.railh&&(m.css({position:d}),b.body.append(m))),g.isios&&b.css(b.win,{"-webkit-tap-highlight-color":"rgba(0,0,0,0)","-webkit-touch-callout":"none"}),g.isie&&b.opt.disableoutline&&b.win.attr("hideFocus","true"),g.iswebkit&&b.opt.disableoutline&&b.win.css({outline:"none"}));!1===b.opt.autohidemode?(b.autohidedom=!1,b.rail.css({opacity:b.opt.cursoropacitymax}),b.railh&&b.railh.css({opacity:b.opt.cursoropacitymax})):
    !0===b.opt.autohidemode||"leave"===b.opt.autohidemode?(b.autohidedom=e().add(b.rail),g.isie8&&(b.autohidedom=b.autohidedom.add(b.cursor)),b.railh&&(b.autohidedom=b.autohidedom.add(b.railh)),b.railh&&g.isie8&&(b.autohidedom=b.autohidedom.add(b.cursorh))):"scroll"==b.opt.autohidemode?(b.autohidedom=e().add(b.rail),b.railh&&(b.autohidedom=b.autohidedom.add(b.railh))):"cursor"==b.opt.autohidemode?(b.autohidedom=e().add(b.cursor),b.railh&&(b.autohidedom=b.autohidedom.add(b.cursorh))):"hidden"==b.opt.autohidemode&&
        (b.autohidedom=!1,b.hide(),b.locked=!1);if(g.isie9mobile)b.scrollmom=new J(b),b.onmangotouch=function(d){d=b.getScrollTop();var c=b.getScrollLeft();if(d==b.scrollmom.lastscrolly&&c==b.scrollmom.lastscrollx)return!0;var f=d-b.mangotouch.sy,g=c-b.mangotouch.sx;if(0!=Math.round(Math.sqrt(Math.pow(g,2)+Math.pow(f,2)))){var n=0>f?-1:1,e=0>g?-1:1,k=+new Date;b.mangotouch.lazy&&clearTimeout(b.mangotouch.lazy);80<k-b.mangotouch.tm||b.mangotouch.dry!=n||b.mangotouch.drx!=e?(b.scrollmom.stop(),b.scrollmom.reset(c,
    d),b.mangotouch.sy=d,b.mangotouch.ly=d,b.mangotouch.sx=c,b.mangotouch.lx=c,b.mangotouch.dry=n,b.mangotouch.drx=e,b.mangotouch.tm=k):(b.scrollmom.stop(),b.scrollmom.update(b.mangotouch.sx-g,b.mangotouch.sy-f),b.mangotouch.tm=k,f=Math.max(Math.abs(b.mangotouch.ly-d),Math.abs(b.mangotouch.lx-c)),b.mangotouch.ly=d,b.mangotouch.lx=c,2<f&&(b.mangotouch.lazy=setTimeout(function(){b.mangotouch.lazy=!1;b.mangotouch.dry=0;b.mangotouch.drx=0;b.mangotouch.tm=0;b.scrollmom.doMomentum(30)},100)))}},f=b.getScrollTop(),
    m=b.getScrollLeft(),b.mangotouch={sy:f,ly:f,dry:0,sx:m,lx:m,drx:0,lazy:!1,tm:0},b.bind(b.docscroll,"scroll",b.onmangotouch);else{if(g.cantouch||b.istouchcapable||b.opt.touchbehavior||g.hasmstouch){b.scrollmom=new J(b);b.ontouchstart=function(d){if(d.pointerType&&2!=d.pointerType)return!1;if(!b.locked){if(g.hasmstouch)for(var c=d.target?d.target:!1;c;){var f=e(c).getNiceScroll();if(0<f.length&&f[0].me==b.me)break;if(0<f.length)return!1;if("DIV"==c.nodeName&&c.id==b.id)break;c=c.parentNode?c.parentNode:
    !1}b.cancelScroll();if((c=b.getTarget(d))&&/INPUT/i.test(c.nodeName)&&/range/i.test(c.type))return b.stopPropagation(d);!("clientX"in d)&&"changedTouches"in d&&(d.clientX=d.changedTouches[0].clientX,d.clientY=d.changedTouches[0].clientY);b.forcescreen&&(f=d,d={original:d.original?d.original:d},d.clientX=f.screenX,d.clientY=f.screenY);b.rail.drag={x:d.clientX,y:d.clientY,sx:b.scroll.x,sy:b.scroll.y,st:b.getScrollTop(),sl:b.getScrollLeft(),pt:2,dl:!1};if(b.ispage||!b.opt.directionlockdeadzone)b.rail.drag.dl=
    "f";else{var f=e(window).width(),n=e(window).height(),k=Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),l=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),n=Math.max(0,l-n),f=Math.max(0,k-f);b.rail.drag.ck=!b.rail.scrollable&&b.railh.scrollable?0<n?"v":!1:b.rail.scrollable&&!b.railh.scrollable?0<f?"h":!1:!1;b.rail.drag.ck||(b.rail.drag.dl="f")}b.opt.touchbehavior&&(b.isiframe&&g.isie)&&(f=b.win.position(),b.rail.drag.x+=f.left,b.rail.drag.y+=f.top);
    b.hasmoving=!1;b.lastmouseup=!1;b.scrollmom.reset(d.clientX,d.clientY);if(!g.cantouch&&!this.istouchcapable&&!g.hasmstouch){if(!c||!/INPUT|SELECT|TEXTAREA/i.test(c.nodeName))return!b.ispage&&g.hasmousecapture&&c.setCapture(),b.opt.touchbehavior?b.cancelEvent(d):b.stopPropagation(d);/SUBMIT|CANCEL|BUTTON/i.test(e(c).attr("type"))&&(pc={tg:c,click:!1},b.preventclick=pc)}}};b.ontouchend=function(d){if(d.pointerType&&2!=d.pointerType)return!1;if(b.rail.drag&&2==b.rail.drag.pt&&(b.scrollmom.doMomentum(),
    b.rail.drag=!1,b.hasmoving&&(b.hasmoving=!1,b.lastmouseup=!0,b.hideCursor(),g.hasmousecapture&&document.releaseCapture(),!g.cantouch)))return b.cancelEvent(d)};var t=b.opt.touchbehavior&&b.isiframe&&!g.hasmousecapture;b.ontouchmove=function(d,c){if(d.pointerType&&2!=d.pointerType)return!1;if(b.rail.drag&&2==b.rail.drag.pt){if(g.cantouch&&"undefined"==typeof d.original)return!0;b.hasmoving=!0;b.preventclick&&!b.preventclick.click&&(b.preventclick.click=b.preventclick.tg.onclick||!1,b.preventclick.tg.onclick=
    b.onpreventclick);d=e.extend({original:d},d);"changedTouches"in d&&(d.clientX=d.changedTouches[0].clientX,d.clientY=d.changedTouches[0].clientY);if(b.forcescreen){var f=d;d={original:d.original?d.original:d};d.clientX=f.screenX;d.clientY=f.screenY}f=ofy=0;if(t&&!c){var n=b.win.position(),f=-n.left;ofy=-n.top}var k=d.clientY+ofy,n=k-b.rail.drag.y,l=d.clientX+f,h=l-b.rail.drag.x,r=b.rail.drag.st-n;b.ishwscroll&&b.opt.bouncescroll?0>r?r=Math.round(r/2):r>b.page.maxh&&(r=b.page.maxh+Math.round((r-b.page.maxh)/
    2)):(0>r&&(k=r=0),r>b.page.maxh&&(r=b.page.maxh,k=0));if(b.railh&&b.railh.scrollable){var m=b.rail.drag.sl-h;b.ishwscroll&&b.opt.bouncescroll?0>m?m=Math.round(m/2):m>b.page.maxw&&(m=b.page.maxw+Math.round((m-b.page.maxw)/2)):(0>m&&(l=m=0),m>b.page.maxw&&(m=b.page.maxw,l=0))}f=!1;if(b.rail.drag.dl)f=!0,"v"==b.rail.drag.dl?m=b.rail.drag.sl:"h"==b.rail.drag.dl&&(r=b.rail.drag.st);else{var n=Math.abs(n),h=Math.abs(h),x=b.opt.directionlockdeadzone;if("v"==b.rail.drag.ck){if(n>x&&h<=0.3*n)return b.rail.drag=
    !1,!0;h>x&&(b.rail.drag.dl="f",e("body").scrollTop(e("body").scrollTop()))}else if("h"==b.rail.drag.ck){if(h>x&&n<=0.3*h)return b.rail.drag=!1,!0;n>x&&(b.rail.drag.dl="f",e("body").scrollLeft(e("body").scrollLeft()))}}b.synched("touchmove",function(){b.rail.drag&&2==b.rail.drag.pt&&(b.prepareTransition&&b.prepareTransition(0),b.rail.scrollable&&b.setScrollTop(r),b.scrollmom.update(l,k),b.railh&&b.railh.scrollable?(b.setScrollLeft(m),b.showCursor(r,m)):b.showCursor(r),g.isie10&&document.selection.clear())});
    g.ischrome&&b.istouchcapable&&(f=!1);if(f)return b.cancelEvent(d)}}}b.onmousedown=function(d,c){if(!(b.rail.drag&&1!=b.rail.drag.pt)){if(b.locked)return b.cancelEvent(d);b.cancelScroll();b.rail.drag={x:d.clientX,y:d.clientY,sx:b.scroll.x,sy:b.scroll.y,pt:1,hr:!!c};var f=b.getTarget(d);!b.ispage&&g.hasmousecapture&&f.setCapture();b.isiframe&&!g.hasmousecapture&&(b.saved.csspointerevents=b.doc.css("pointer-events"),b.css(b.doc,{"pointer-events":"none"}));return b.cancelEvent(d)}};b.onmouseup=function(d){if(b.rail.drag&&
    (g.hasmousecapture&&document.releaseCapture(),b.isiframe&&!g.hasmousecapture&&b.doc.css("pointer-events",b.saved.csspointerevents),1==b.rail.drag.pt))return b.rail.drag=!1,b.cancelEvent(d)};b.onmousemove=function(d){if(b.rail.drag&&1==b.rail.drag.pt){if(g.ischrome&&0==d.which)return b.onmouseup(d);b.cursorfreezed=!0;if(b.rail.drag.hr){b.scroll.x=b.rail.drag.sx+(d.clientX-b.rail.drag.x);0>b.scroll.x&&(b.scroll.x=0);var c=b.scrollvaluemaxw;b.scroll.x>c&&(b.scroll.x=c)}else b.scroll.y=b.rail.drag.sy+
    (d.clientY-b.rail.drag.y),0>b.scroll.y&&(b.scroll.y=0),c=b.scrollvaluemax,b.scroll.y>c&&(b.scroll.y=c);b.synched("mousemove",function(){b.rail.drag&&1==b.rail.drag.pt&&(b.showCursor(),b.rail.drag.hr?b.doScrollLeft(Math.round(b.scroll.x*b.scrollratio.x),b.opt.cursordragspeed):b.doScrollTop(Math.round(b.scroll.y*b.scrollratio.y),b.opt.cursordragspeed))});return b.cancelEvent(d)}};if(g.cantouch||b.opt.touchbehavior)b.onpreventclick=function(d){if(b.preventclick)return b.preventclick.tg.onclick=b.preventclick.click,
    b.preventclick=!1,b.cancelEvent(d)},b.bind(b.win,"mousedown",b.ontouchstart),b.onclick=g.isios?!1:function(d){return b.lastmouseup?(b.lastmouseup=!1,b.cancelEvent(d)):!0},b.opt.grabcursorenabled&&g.cursorgrabvalue&&(b.css(b.ispage?b.doc:b.win,{cursor:g.cursorgrabvalue}),b.css(b.rail,{cursor:g.cursorgrabvalue}));else{var p=function(d){if(b.selectiondrag){if(d){var c=b.win.outerHeight();d=d.pageY-b.selectiondrag.top;0<d&&d<c&&(d=0);d>=c&&(d-=c);b.selectiondrag.df=d}0!=b.selectiondrag.df&&(b.doScrollBy(2*
    -Math.floor(b.selectiondrag.df/6)),b.debounced("doselectionscroll",function(){p()},50))}};b.hasTextSelected="getSelection"in document?function(){return 0<document.getSelection().rangeCount}:"selection"in document?function(){return"None"!=document.selection.type}:function(){return!1};b.onselectionstart=function(d){b.ispage||(b.selectiondrag=b.win.offset())};b.onselectionend=function(d){b.selectiondrag=!1};b.onselectiondrag=function(d){b.selectiondrag&&b.hasTextSelected()&&b.debounced("selectionscroll",
    function(){p(d)},250)}}g.hasmstouch&&(b.css(b.rail,{"-ms-touch-action":"none"}),b.css(b.cursor,{"-ms-touch-action":"none"}),b.bind(b.win,"MSPointerDown",b.ontouchstart),b.bind(document,"MSPointerUp",b.ontouchend),b.bind(document,"MSPointerMove",b.ontouchmove),b.bind(b.cursor,"MSGestureHold",function(b){b.preventDefault()}),b.bind(b.cursor,"contextmenu",function(b){b.preventDefault()}));this.istouchcapable&&(b.bind(b.win,"touchstart",b.ontouchstart),b.bind(document,"touchend",b.ontouchend),b.bind(document,
    "touchcancel",b.ontouchend),b.bind(document,"touchmove",b.ontouchmove));b.bind(b.cursor,"mousedown",b.onmousedown);b.bind(b.cursor,"mouseup",b.onmouseup);b.railh&&(b.bind(b.cursorh,"mousedown",function(d){b.onmousedown(d,!0)}),b.bind(b.cursorh,"mouseup",function(d){if(!(b.rail.drag&&2==b.rail.drag.pt))return b.rail.drag=!1,b.hasmoving=!1,b.hideCursor(),g.hasmousecapture&&document.releaseCapture(),b.cancelEvent(d)}));if(b.opt.cursordragontouch||!g.cantouch&&!b.opt.touchbehavior)b.rail.css({cursor:"default"}),
    b.railh&&b.railh.css({cursor:"default"}),b.jqbind(b.rail,"mouseenter",function(){b.canshowonmouseevent&&b.showCursor();b.rail.active=!0}),b.jqbind(b.rail,"mouseleave",function(){b.rail.active=!1;b.rail.drag||b.hideCursor()}),b.opt.sensitiverail&&(b.bind(b.rail,"click",function(d){b.doRailClick(d,!1,!1)}),b.bind(b.rail,"dblclick",function(d){b.doRailClick(d,!0,!1)}),b.bind(b.cursor,"click",function(d){b.cancelEvent(d)}),b.bind(b.cursor,"dblclick",function(d){b.cancelEvent(d)})),b.railh&&(b.jqbind(b.railh,
    "mouseenter",function(){b.canshowonmouseevent&&b.showCursor();b.rail.active=!0}),b.jqbind(b.railh,"mouseleave",function(){b.rail.active=!1;b.rail.drag||b.hideCursor()}),b.opt.sensitiverail&&(b.bind(b.railh,"click",function(d){b.doRailClick(d,!1,!0)}),b.bind(b.railh,"dblclick",function(d){b.doRailClick(d,!0,!0)}),b.bind(b.cursorh,"click",function(d){b.cancelEvent(d)}),b.bind(b.cursorh,"dblclick",function(d){b.cancelEvent(d)})));!g.cantouch&&!b.opt.touchbehavior?(b.bind(g.hasmousecapture?b.win:document,
    "mouseup",b.onmouseup),b.bind(document,"mousemove",b.onmousemove),b.onclick&&b.bind(document,"click",b.onclick),!b.ispage&&b.opt.enablescrollonselection&&(b.bind(b.win[0],"mousedown",b.onselectionstart),b.bind(document,"mouseup",b.onselectionend),b.bind(b.cursor,"mouseup",b.onselectionend),b.cursorh&&b.bind(b.cursorh,"mouseup",b.onselectionend),b.bind(document,"mousemove",b.onselectiondrag)),b.zoom&&(b.jqbind(b.zoom,"mouseenter",function(){b.canshowonmouseevent&&b.showCursor();b.rail.active=!0}),
    b.jqbind(b.zoom,"mouseleave",function(){b.rail.active=!1;b.rail.drag||b.hideCursor()}))):(b.bind(g.hasmousecapture?b.win:document,"mouseup",b.ontouchend),b.bind(document,"mousemove",b.ontouchmove),b.onclick&&b.bind(document,"click",b.onclick),b.opt.cursordragontouch&&(b.bind(b.cursor,"mousedown",b.onmousedown),b.bind(b.cursor,"mousemove",b.onmousemove),b.cursorh&&b.bind(b.cursorh,"mousedown",function(d){b.onmousedown(d,!0)}),b.cursorh&&b.bind(b.cursorh,"mousemove",b.onmousemove)));b.opt.enablemousewheel&&
(b.isiframe||b.bind(g.isie&&b.ispage?document:b.win,"mousewheel",b.onmousewheel),b.bind(b.rail,"mousewheel",b.onmousewheel),b.railh&&b.bind(b.railh,"mousewheel",b.onmousewheelhr));!b.ispage&&(!g.cantouch&&!/HTML|BODY/.test(b.win[0].nodeName))&&(b.win.attr("tabindex")||b.win.attr({tabindex:L++}),b.jqbind(b.win,"focus",function(d){z=b.getTarget(d).id||!0;b.hasfocus=!0;b.canshowonmouseevent&&b.noticeCursor()}),b.jqbind(b.win,"blur",function(d){z=!1;b.hasfocus=!1}),b.jqbind(b.win,"mouseenter",function(d){E=
    b.getTarget(d).id||!0;b.hasmousefocus=!0;b.canshowonmouseevent&&b.noticeCursor()}),b.jqbind(b.win,"mouseleave",function(){E=!1;b.hasmousefocus=!1;b.rail.drag||b.hideCursor()}))}b.onkeypress=function(d){if(b.locked&&0==b.page.maxh)return!0;d=d?d:window.e;var c=b.getTarget(d);if(c&&/INPUT|TEXTAREA|SELECT|OPTION/.test(c.nodeName)&&(!c.getAttribute("type")&&!c.type||!/submit|button|cancel/i.tp))return!0;if(b.hasfocus||b.hasmousefocus&&!z||b.ispage&&!z&&!E){c=d.keyCode;if(b.locked&&27!=c)return b.cancelEvent(d);
    var f=d.ctrlKey||!1,n=d.shiftKey||!1,g=!1;switch(c){case 38:case 63233:b.doScrollBy(72);g=!0;break;case 40:case 63235:b.doScrollBy(-72);g=!0;break;case 37:case 63232:b.railh&&(f?b.doScrollLeft(0):b.doScrollLeftBy(72),g=!0);break;case 39:case 63234:b.railh&&(f?b.doScrollLeft(b.page.maxw):b.doScrollLeftBy(-72),g=!0);break;case 33:case 63276:b.doScrollBy(b.view.h);g=!0;break;case 34:case 63277:b.doScrollBy(-b.view.h);g=!0;break;case 36:case 63273:b.railh&&f?b.doScrollPos(0,0):b.doScrollTo(0);g=!0;break;
        case 35:case 63275:b.railh&&f?b.doScrollPos(b.page.maxw,b.page.maxh):b.doScrollTo(b.page.maxh);g=!0;break;case 32:b.opt.spacebarenabled&&(n?b.doScrollBy(b.view.h):b.doScrollBy(-b.view.h),g=!0);break;case 27:b.zoomactive&&(b.doZoom(),g=!0)}if(g)return b.cancelEvent(d)}};b.opt.enablekeyboard&&b.bind(document,g.isopera&&!g.isopera12?"keypress":"keydown",b.onkeypress);b.bind(window,"resize",b.lazyResize);b.bind(window,"orientationchange",b.lazyResize);b.bind(window,"load",b.lazyResize);if(g.ischrome&&
    !b.ispage&&!b.haswrapper){var s=b.win.attr("style"),f=parseFloat(b.win.css("width"))+1;b.win.css("width",f);b.synched("chromefix",function(){b.win.attr("style",s)})}b.onAttributeChange=function(d){b.lazyResize(250)};!b.ispage&&!b.haswrapper&&(!1!==A?(b.observer=new A(function(d){d.forEach(b.onAttributeChange)}),b.observer.observe(b.win[0],{childList:!0,characterData:!1,attributes:!0,subtree:!1}),b.observerremover=new A(function(d){d.forEach(function(d){if(0<d.removedNodes.length)for(var c in d.removedNodes)if(d.removedNodes[c]==
    b.win[0])return b.remove()})}),b.observerremover.observe(b.win[0].parentNode,{childList:!0,characterData:!1,attributes:!1,subtree:!1})):(b.bind(b.win,g.isie&&!g.isie9?"propertychange":"DOMAttrModified",b.onAttributeChange),g.isie9&&b.win[0].attachEvent("onpropertychange",b.onAttributeChange),b.bind(b.win,"DOMNodeRemoved",function(d){d.target==b.win[0]&&b.remove()})));!b.ispage&&b.opt.boxzoom&&b.bind(window,"resize",b.resizeZoom);b.istextarea&&b.bind(b.win,"mouseup",b.lazyResize);b.checkrtlmode=!0;
    b.lazyResize(30)}if("IFRAME"==this.doc[0].nodeName){var K=function(d){b.iframexd=!1;try{var c="contentDocument"in this?this.contentDocument:this.contentWindow.document}catch(f){b.iframexd=!0,c=!1}if(b.iframexd)return"console"in window&&console.log("NiceScroll error: policy restriced iframe"),!0;b.forcescreen=!0;b.isiframe&&(b.iframe={doc:e(c),html:b.doc.contents().find("html")[0],body:b.doc.contents().find("body")[0]},b.getContentSize=function(){return{w:Math.max(b.iframe.html.scrollWidth,b.iframe.body.scrollWidth),
    h:Math.max(b.iframe.html.scrollHeight,b.iframe.body.scrollHeight)}},b.docscroll=e(b.iframe.body));!g.isios&&(b.opt.iframeautoresize&&!b.isiframe)&&(b.win.scrollTop(0),b.doc.height(""),d=Math.max(c.getElementsByTagName("html")[0].scrollHeight,c.body.scrollHeight),b.doc.height(d));b.lazyResize(30);g.isie7&&b.css(e(b.iframe.html),{"overflow-y":"hidden"});b.css(e(b.iframe.body),{"overflow-y":"hidden"});g.isios&&b.haswrapper&&b.css(e(c.body),{"-webkit-transform":"translate3d(0,0,0)"});"contentWindow"in
    this?b.bind(this.contentWindow,"scroll",b.onscroll):b.bind(c,"scroll",b.onscroll);b.opt.enablemousewheel&&b.bind(c,"mousewheel",b.onmousewheel);b.opt.enablekeyboard&&b.bind(c,g.isopera?"keypress":"keydown",b.onkeypress);if(g.cantouch||b.opt.touchbehavior)b.bind(c,"mousedown",b.ontouchstart),b.bind(c,"mousemove",function(d){b.ontouchmove(d,!0)}),b.opt.grabcursorenabled&&g.cursorgrabvalue&&b.css(e(c.body),{cursor:g.cursorgrabvalue});b.bind(c,"mouseup",b.ontouchend);b.zoom&&(b.opt.dblclickzoom&&b.bind(c,
    "dblclick",b.doZoom),b.ongesturezoom&&b.bind(c,"gestureend",b.ongesturezoom))};this.doc[0].readyState&&"complete"==this.doc[0].readyState&&setTimeout(function(){K.call(b.doc[0],!1)},500);b.bind(this.doc,"load",K)}};this.showCursor=function(d,c){b.cursortimeout&&(clearTimeout(b.cursortimeout),b.cursortimeout=0);if(b.rail){b.autohidedom&&(b.autohidedom.stop().css({opacity:b.opt.cursoropacitymax}),b.cursoractive=!0);if(!b.rail.drag||1!=b.rail.drag.pt)"undefined"!=typeof d&&!1!==d&&(b.scroll.y=Math.round(1*
    d/b.scrollratio.y)),"undefined"!=typeof c&&(b.scroll.x=Math.round(1*c/b.scrollratio.x));b.cursor.css({height:b.cursorheight,top:b.scroll.y});b.cursorh&&(!b.rail.align&&b.rail.visibility?b.cursorh.css({width:b.cursorwidth,left:b.scroll.x+b.rail.width}):b.cursorh.css({width:b.cursorwidth,left:b.scroll.x}),b.cursoractive=!0);b.zoom&&b.zoom.stop().css({opacity:b.opt.cursoropacitymax})}};this.hideCursor=function(d){!b.cursortimeout&&(b.rail&&b.autohidedom&&!(b.hasmousefocus&&"leave"==b.opt.autohidemode))&&
(b.cursortimeout=setTimeout(function(){if(!b.rail.active||!b.showonmouseevent)b.autohidedom.stop().animate({opacity:b.opt.cursoropacitymin}),b.zoom&&b.zoom.stop().animate({opacity:b.opt.cursoropacitymin}),b.cursoractive=!1;b.cursortimeout=0},d||b.opt.hidecursordelay))};this.noticeCursor=function(d,c,f){b.showCursor(c,f);b.rail.active||b.hideCursor(d)};this.getContentSize=b.ispage?function(){return{w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),h:Math.max(document.body.scrollHeight,
    document.documentElement.scrollHeight)}}:b.haswrapper?function(){return{w:b.doc.outerWidth()+parseInt(b.win.css("paddingLeft"))+parseInt(b.win.css("paddingRight")),h:b.doc.outerHeight()+parseInt(b.win.css("paddingTop"))+parseInt(b.win.css("paddingBottom"))}}:function(){return{w:b.docscroll[0].scrollWidth,h:b.docscroll[0].scrollHeight}};this.onResize=function(d,c){if(!b.win)return!1;if(!b.haswrapper&&!b.ispage){if("none"==b.win.css("display"))return b.visibility&&b.hideRail().hideRailHr(),!1;!b.hidden&&
    !b.visibility&&b.showRail().showRailHr()}var f=b.page.maxh,g=b.page.maxw,e=b.view.w;b.view={w:b.ispage?b.win.width():parseInt(b.win[0].clientWidth),h:b.ispage?b.win.height():parseInt(b.win[0].clientHeight)};b.page=c?c:b.getContentSize();b.page.maxh=Math.max(0,b.page.h-b.view.h);b.page.maxw=Math.max(0,b.page.w-b.view.w);if(b.page.maxh==f&&b.page.maxw==g&&b.view.w==e){if(b.ispage)return b;f=b.win.offset();if(b.lastposition&&(g=b.lastposition,g.top==f.top&&g.left==f.left))return b;b.lastposition=f}0==
    b.page.maxh?(b.hideRail(),b.scrollvaluemax=0,b.scroll.y=0,b.scrollratio.y=0,b.cursorheight=0,b.setScrollTop(0),b.rail.scrollable=!1):b.rail.scrollable=!0;0==b.page.maxw?(b.hideRailHr(),b.scrollvaluemaxw=0,b.scroll.x=0,b.scrollratio.x=0,b.cursorwidth=0,b.setScrollLeft(0),b.railh.scrollable=!1):b.railh.scrollable=!0;b.locked=0==b.page.maxh&&0==b.page.maxw;if(b.locked)return b.ispage||b.updateScrollBar(b.view),!1;!b.hidden&&!b.visibility?b.showRail().showRailHr():!b.hidden&&!b.railh.visibility&&b.showRailHr();
    b.istextarea&&(b.win.css("resize")&&"none"!=b.win.css("resize"))&&(b.view.h-=20);b.cursorheight=Math.min(b.view.h,Math.round(b.view.h*(b.view.h/b.page.h)));b.cursorheight=b.opt.cursorfixedheight?b.opt.cursorfixedheight:Math.max(b.opt.cursorminheight,b.cursorheight);b.cursorwidth=Math.min(b.view.w,Math.round(b.view.w*(b.view.w/b.page.w)));b.cursorwidth=b.opt.cursorfixedheight?b.opt.cursorfixedheight:Math.max(b.opt.cursorminheight,b.cursorwidth);b.scrollvaluemax=b.view.h-b.cursorheight-b.cursor.hborder;
    b.railh&&(b.railh.width=0<b.page.maxh?b.view.w-b.rail.width:b.view.w,b.scrollvaluemaxw=b.railh.width-b.cursorwidth-b.cursorh.wborder);b.checkrtlmode&&b.railh&&(b.checkrtlmode=!1,b.opt.rtlmode&&0==b.scroll.x&&b.setScrollLeft(b.page.maxw));b.ispage||b.updateScrollBar(b.view);b.scrollratio={x:b.page.maxw/b.scrollvaluemaxw,y:b.page.maxh/b.scrollvaluemax};b.getScrollTop()>b.page.maxh?b.doScrollTop(b.page.maxh):(b.scroll.y=Math.round(b.getScrollTop()*(1/b.scrollratio.y)),b.scroll.x=Math.round(b.getScrollLeft()*
        (1/b.scrollratio.x)),b.cursoractive&&b.noticeCursor());b.scroll.y&&0==b.getScrollTop()&&b.doScrollTo(Math.floor(b.scroll.y*b.scrollratio.y));return b};this.resize=b.onResize;this.lazyResize=function(d){d=isNaN(d)?30:d;b.delayed("resize",b.resize,d);return b};this._bind=function(d,c,f,g){b.events.push({e:d,n:c,f:f,b:g,q:!1});d.addEventListener?d.addEventListener(c,f,g||!1):d.attachEvent?d.attachEvent("on"+c,f):d["on"+c]=f};this.jqbind=function(d,c,f){b.events.push({e:d,n:c,f:f,q:!0});e(d).bind(c,f)};
    this.bind=function(d,c,f,e){var k="jquery"in d?d[0]:d;"mousewheel"==c?"onwheel"in b.win?b._bind(k,"wheel",f,e||!1):(d="undefined"!=typeof document.onmousewheel?"mousewheel":"DOMMouseScroll",q(k,d,f,e||!1),"DOMMouseScroll"==d&&q(k,"MozMousePixelScroll",f,e||!1)):k.addEventListener?(g.cantouch&&/mouseup|mousedown|mousemove/.test(c)&&b._bind(k,"mousedown"==c?"touchstart":"mouseup"==c?"touchend":"touchmove",function(b){if(b.touches){if(2>b.touches.length){var d=b.touches.length?b.touches[0]:b;d.original=
        b;f.call(this,d)}}else b.changedTouches&&(d=b.changedTouches[0],d.original=b,f.call(this,d))},e||!1),b._bind(k,c,f,e||!1),g.cantouch&&"mouseup"==c&&b._bind(k,"touchcancel",f,e||!1)):b._bind(k,c,function(d){if((d=d||window.event||!1)&&d.srcElement)d.target=d.srcElement;"pageY"in d||(d.pageX=d.clientX+document.documentElement.scrollLeft,d.pageY=d.clientY+document.documentElement.scrollTop);return!1===f.call(k,d)||!1===e?b.cancelEvent(d):!0})};this._unbind=function(b,c,f,g){b.removeEventListener?b.removeEventListener(c,
        f,g):b.detachEvent?b.detachEvent("on"+c,f):b["on"+c]=!1};this.unbindAll=function(){for(var d=0;d<b.events.length;d++){var c=b.events[d];c.q?c.e.unbind(c.n,c.f):b._unbind(c.e,c.n,c.f,c.b)}};this.cancelEvent=function(b){b=b.original?b.original:b?b:window.event||!1;if(!b)return!1;b.preventDefault&&b.preventDefault();b.stopPropagation&&b.stopPropagation();b.preventManipulation&&b.preventManipulation();b.cancelBubble=!0;b.cancel=!0;return b.returnValue=!1};this.stopPropagation=function(b){b=b.original?
        b.original:b?b:window.event||!1;if(!b)return!1;if(b.stopPropagation)return b.stopPropagation();b.cancelBubble&&(b.cancelBubble=!0);return!1};this.showRail=function(){if(0!=b.page.maxh&&(b.ispage||"none"!=b.win.css("display")))b.visibility=!0,b.rail.visibility=!0,b.rail.css("display","block");return b};this.showRailHr=function(){if(!b.railh)return b;if(0!=b.page.maxw&&(b.ispage||"none"!=b.win.css("display")))b.railh.visibility=!0,b.railh.css("display","block");return b};this.hideRail=function(){b.visibility=
        !1;b.rail.visibility=!1;b.rail.css("display","none");return b};this.hideRailHr=function(){if(!b.railh)return b;b.railh.visibility=!1;b.railh.css("display","none");return b};this.show=function(){b.hidden=!1;b.locked=!1;return b.showRail().showRailHr()};this.hide=function(){b.hidden=!0;b.locked=!0;return b.hideRail().hideRailHr()};this.toggle=function(){return b.hidden?b.show():b.hide()};this.remove=function(){b.stop();b.cursortimeout&&clearTimeout(b.cursortimeout);b.doZoomOut();b.unbindAll();g.isie9&&
    b.win[0].detachEvent("onpropertychange",b.onAttributeChange);!1!==b.observer&&b.observer.disconnect();!1!==b.observerremover&&b.observerremover.disconnect();b.events=null;b.cursor&&b.cursor.remove();b.cursorh&&b.cursorh.remove();b.rail&&b.rail.remove();b.railh&&b.railh.remove();b.zoom&&b.zoom.remove();for(var d=0;d<b.saved.css.length;d++){var c=b.saved.css[d];c[0].css(c[1],"undefined"==typeof c[2]?"":c[2])}b.saved=!1;b.me.data("__nicescroll","");var f=e.nicescroll;f.each(function(d){if(this&&this.id===
        b.id){delete f[d];for(var c=++d;c<f.length;c++,d++)f[d]=f[c];f.length--;f.length&&delete f[f.length]}});for(var k in b)b[k]=null,delete b[k];b=null};this.scrollstart=function(d){this.onscrollstart=d;return b};this.scrollend=function(d){this.onscrollend=d;return b};this.scrollcancel=function(d){this.onscrollcancel=d;return b};this.zoomin=function(d){this.onzoomin=d;return b};this.zoomout=function(d){this.onzoomout=d;return b};this.isScrollable=function(b){b=b.target?b.target:b;if("OPTION"==b.nodeName)return!0;
        for(;b&&1==b.nodeType&&!/BODY|HTML/.test(b.nodeName);){var c=e(b),c=c.css("overflowY")||c.css("overflowX")||c.css("overflow")||"";if(/scroll|auto/.test(c))return b.clientHeight!=b.scrollHeight;b=b.parentNode?b.parentNode:!1}return!1};this.getViewport=function(b){for(b=b&&b.parentNode?b.parentNode:!1;b&&1==b.nodeType&&!/BODY|HTML/.test(b.nodeName);){var c=e(b);if(/fixed|absolute/.test(c.css("position")))return c;var f=c.css("overflowY")||c.css("overflowX")||c.css("overflow")||"";if(/scroll|auto/.test(f)&&
        b.clientHeight!=b.scrollHeight||0<c.getNiceScroll().length)return c;b=b.parentNode?b.parentNode:!1}return!1};this.onmousewheel=function(d){if(b.locked)return b.debounced("checkunlock",b.resize,250),!0;if(b.rail.drag)return b.cancelEvent(d);"auto"==b.opt.oneaxismousemode&&0!=d.deltaX&&(b.opt.oneaxismousemode=!1);if(b.opt.oneaxismousemode&&0==d.deltaX&&!b.rail.scrollable)return b.railh&&b.railh.scrollable?b.onmousewheelhr(d):!0;var c=+new Date,f=!1;b.opt.preservenativescrolling&&b.checkarea+600<c&&
    (b.nativescrollingarea=b.isScrollable(d),f=!0);b.checkarea=c;if(b.nativescrollingarea)return!0;if(d=t(d,!1,f))b.checkarea=0;return d};this.onmousewheelhr=function(d){if(b.locked||!b.railh.scrollable)return!0;if(b.rail.drag)return b.cancelEvent(d);var c=+new Date,f=!1;b.opt.preservenativescrolling&&b.checkarea+600<c&&(b.nativescrollingarea=b.isScrollable(d),f=!0);b.checkarea=c;return b.nativescrollingarea?!0:b.locked?b.cancelEvent(d):t(d,!0,f)};this.stop=function(){b.cancelScroll();b.scrollmon&&b.scrollmon.stop();
        b.cursorfreezed=!1;b.scroll.y=Math.round(b.getScrollTop()*(1/b.scrollratio.y));b.noticeCursor();return b};this.getTransitionSpeed=function(d){var c=Math.round(10*b.opt.scrollspeed);d=Math.min(c,Math.round(d/20*b.opt.scrollspeed));return 20<d?d:0};b.opt.smoothscroll?b.ishwscroll&&g.hastransition&&b.opt.usetransition?(this.prepareTransition=function(d,c){var f=c?20<d?d:0:b.getTransitionSpeed(d),e=f?g.prefixstyle+"transform "+f+"ms ease-out":"";if(!b.lasttransitionstyle||b.lasttransitionstyle!=e)b.lasttransitionstyle=
        e,b.doc.css(g.transitionstyle,e);return f},this.doScrollLeft=function(c,g){var f=b.scrollrunning?b.newscrolly:b.getScrollTop();b.doScrollPos(c,f,g)},this.doScrollTop=function(c,g){var f=b.scrollrunning?b.newscrollx:b.getScrollLeft();b.doScrollPos(f,c,g)},this.doScrollPos=function(c,e,f){var k=b.getScrollTop(),l=b.getScrollLeft();(0>(b.newscrolly-k)*(e-k)||0>(b.newscrollx-l)*(c-l))&&b.cancelScroll();!1==b.opt.bouncescroll&&(0>e?e=0:e>b.page.maxh&&(e=b.page.maxh),0>c?c=0:c>b.page.maxw&&(c=b.page.maxw));
        if(b.scrollrunning&&c==b.newscrollx&&e==b.newscrolly)return!1;b.newscrolly=e;b.newscrollx=c;b.newscrollspeed=f||!1;if(b.timer)return!1;b.timer=setTimeout(function(){var f=b.getScrollTop(),k=b.getScrollLeft(),l,h;l=c-k;h=e-f;l=Math.round(Math.sqrt(Math.pow(l,2)+Math.pow(h,2)));l=b.newscrollspeed&&1<b.newscrollspeed?b.newscrollspeed:b.getTransitionSpeed(l);b.newscrollspeed&&1>=b.newscrollspeed&&(l*=b.newscrollspeed);b.prepareTransition(l,!0);b.timerscroll&&b.timerscroll.tm&&clearInterval(b.timerscroll.tm);
            0<l&&(!b.scrollrunning&&b.onscrollstart&&b.onscrollstart.call(b,{type:"scrollstart",current:{x:k,y:f},request:{x:c,y:e},end:{x:b.newscrollx,y:b.newscrolly},speed:l}),g.transitionend?b.scrollendtrapped||(b.scrollendtrapped=!0,b.bind(b.doc,g.transitionend,b.onScrollEnd,!1)):(b.scrollendtrapped&&clearTimeout(b.scrollendtrapped),b.scrollendtrapped=setTimeout(b.onScrollEnd,l)),b.timerscroll={bz:new BezierClass(f,b.newscrolly,l,0,0,0.58,1),bh:new BezierClass(k,b.newscrollx,l,0,0,0.58,1)},b.cursorfreezed||
                (b.timerscroll.tm=setInterval(function(){b.showCursor(b.getScrollTop(),b.getScrollLeft())},60)));b.synched("doScroll-set",function(){b.timer=0;b.scrollendtrapped&&(b.scrollrunning=!0);b.setScrollTop(b.newscrolly);b.setScrollLeft(b.newscrollx);if(!b.scrollendtrapped)b.onScrollEnd()})},50)},this.cancelScroll=function(){if(!b.scrollendtrapped)return!0;var c=b.getScrollTop(),e=b.getScrollLeft();b.scrollrunning=!1;g.transitionend||clearTimeout(g.transitionend);b.scrollendtrapped=!1;b._unbind(b.doc,g.transitionend,
        b.onScrollEnd);b.prepareTransition(0);b.setScrollTop(c);b.railh&&b.setScrollLeft(e);b.timerscroll&&b.timerscroll.tm&&clearInterval(b.timerscroll.tm);b.timerscroll=!1;b.cursorfreezed=!1;b.showCursor(c,e);return b},this.onScrollEnd=function(){b.scrollendtrapped&&b._unbind(b.doc,g.transitionend,b.onScrollEnd);b.scrollendtrapped=!1;b.prepareTransition(0);b.timerscroll&&b.timerscroll.tm&&clearInterval(b.timerscroll.tm);b.timerscroll=!1;var c=b.getScrollTop(),e=b.getScrollLeft();b.setScrollTop(c);b.railh&&
    b.setScrollLeft(e);b.noticeCursor(!1,c,e);b.cursorfreezed=!1;0>c?c=0:c>b.page.maxh&&(c=b.page.maxh);0>e?e=0:e>b.page.maxw&&(e=b.page.maxw);if(c!=b.newscrolly||e!=b.newscrollx)return b.doScrollPos(e,c,b.opt.snapbackspeed);b.onscrollend&&b.scrollrunning&&b.onscrollend.call(b,{type:"scrollend",current:{x:e,y:c},end:{x:b.newscrollx,y:b.newscrolly}});b.scrollrunning=!1}):(this.doScrollLeft=function(c,g){var f=b.scrollrunning?b.newscrolly:b.getScrollTop();b.doScrollPos(c,f,g)},this.doScrollTop=function(c,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          g){var f=b.scrollrunning?b.newscrollx:b.getScrollLeft();b.doScrollPos(f,c,g)},this.doScrollPos=function(c,g,f){function e(){if(b.cancelAnimationFrame)return!0;b.scrollrunning=!0;if(p=1-p)return b.timer=v(e)||1;var c=0,d=sy=b.getScrollTop();if(b.dst.ay){var d=b.bzscroll?b.dst.py+b.bzscroll.getNow()*b.dst.ay:b.newscrolly,f=d-sy;if(0>f&&d<b.newscrolly||0<f&&d>b.newscrolly)d=b.newscrolly;b.setScrollTop(d);d==b.newscrolly&&(c=1)}else c=1;var g=sx=b.getScrollLeft();if(b.dst.ax){g=b.bzscroll?b.dst.px+b.bzscroll.getNow()*
        b.dst.ax:b.newscrollx;f=g-sx;if(0>f&&g<b.newscrollx||0<f&&g>b.newscrollx)g=b.newscrollx;b.setScrollLeft(g);g==b.newscrollx&&(c+=1)}else c+=1;2==c?(b.timer=0,b.cursorfreezed=!1,b.bzscroll=!1,b.scrollrunning=!1,0>d?d=0:d>b.page.maxh&&(d=b.page.maxh),0>g?g=0:g>b.page.maxw&&(g=b.page.maxw),g!=b.newscrollx||d!=b.newscrolly?b.doScrollPos(g,d):b.onscrollend&&b.onscrollend.call(b,{type:"scrollend",current:{x:sx,y:sy},end:{x:b.newscrollx,y:b.newscrolly}})):b.timer=v(e)||1}g="undefined"==typeof g||!1===g?b.getScrollTop(!0):
        g;if(b.timer&&b.newscrolly==g&&b.newscrollx==c)return!0;b.timer&&w(b.timer);b.timer=0;var k=b.getScrollTop(),l=b.getScrollLeft();(0>(b.newscrolly-k)*(g-k)||0>(b.newscrollx-l)*(c-l))&&b.cancelScroll();b.newscrolly=g;b.newscrollx=c;if(!b.bouncescroll||!b.rail.visibility)0>b.newscrolly?b.newscrolly=0:b.newscrolly>b.page.maxh&&(b.newscrolly=b.page.maxh);if(!b.bouncescroll||!b.railh.visibility)0>b.newscrollx?b.newscrollx=0:b.newscrollx>b.page.maxw&&(b.newscrollx=b.page.maxw);b.dst={};b.dst.x=c-l;b.dst.y=
        g-k;b.dst.px=l;b.dst.py=k;var h=Math.round(Math.sqrt(Math.pow(b.dst.x,2)+Math.pow(b.dst.y,2)));b.dst.ax=b.dst.x/h;b.dst.ay=b.dst.y/h;var m=0,q=h;0==b.dst.x?(m=k,q=g,b.dst.ay=1,b.dst.py=0):0==b.dst.y&&(m=l,q=c,b.dst.ax=1,b.dst.px=0);h=b.getTransitionSpeed(h);f&&1>=f&&(h*=f);b.bzscroll=0<h?b.bzscroll?b.bzscroll.update(q,h):new BezierClass(m,q,h,0,1,0,1):!1;if(!b.timer){(k==b.page.maxh&&g>=b.page.maxh||l==b.page.maxw&&c>=b.page.maxw)&&b.checkContentSize();var p=1;b.cancelAnimationFrame=!1;b.timer=1;
        b.onscrollstart&&!b.scrollrunning&&b.onscrollstart.call(b,{type:"scrollstart",current:{x:l,y:k},request:{x:c,y:g},end:{x:b.newscrollx,y:b.newscrolly},speed:h});e();(k==b.page.maxh&&g>=k||l==b.page.maxw&&c>=l)&&b.checkContentSize();b.noticeCursor()}},this.cancelScroll=function(){b.timer&&w(b.timer);b.timer=0;b.bzscroll=!1;b.scrollrunning=!1;return b}):(this.doScrollLeft=function(c,g){var f=b.getScrollTop();b.doScrollPos(c,f,g)},this.doScrollTop=function(c,g){var f=b.getScrollLeft();b.doScrollPos(f,
        c,g)},this.doScrollPos=function(c,g,f){var e=c>b.page.maxw?b.page.maxw:c;0>e&&(e=0);var k=g>b.page.maxh?b.page.maxh:g;0>k&&(k=0);b.synched("scroll",function(){b.setScrollTop(k);b.setScrollLeft(e)})},this.cancelScroll=function(){});this.doScrollBy=function(c,g){var f=0,f=g?Math.floor((b.scroll.y-c)*b.scrollratio.y):(b.timer?b.newscrolly:b.getScrollTop(!0))-c;if(b.bouncescroll){var e=Math.round(b.view.h/2);f<-e?f=-e:f>b.page.maxh+e&&(f=b.page.maxh+e)}b.cursorfreezed=!1;py=b.getScrollTop(!0);if(0>f&&
        0>=py)return b.noticeCursor();if(f>b.page.maxh&&py>=b.page.maxh)return b.checkContentSize(),b.noticeCursor();b.doScrollTop(f)};this.doScrollLeftBy=function(c,g){var f=0,f=g?Math.floor((b.scroll.x-c)*b.scrollratio.x):(b.timer?b.newscrollx:b.getScrollLeft(!0))-c;if(b.bouncescroll){var e=Math.round(b.view.w/2);f<-e?f=-e:f>b.page.maxw+e&&(f=b.page.maxw+e)}b.cursorfreezed=!1;px=b.getScrollLeft(!0);if(0>f&&0>=px||f>b.page.maxw&&px>=b.page.maxw)return b.noticeCursor();b.doScrollLeft(f)};this.doScrollTo=
        function(c,g){g&&Math.round(c*b.scrollratio.y);b.cursorfreezed=!1;b.doScrollTop(c)};this.checkContentSize=function(){var c=b.getContentSize();(c.h!=b.page.h||c.w!=b.page.w)&&b.resize(!1,c)};b.onscroll=function(c){b.rail.drag||b.cursorfreezed||b.synched("scroll",function(){b.scroll.y=Math.round(b.getScrollTop()*(1/b.scrollratio.y));b.railh&&(b.scroll.x=Math.round(b.getScrollLeft()*(1/b.scrollratio.x)));b.noticeCursor()})};b.bind(b.docscroll,"scroll",b.onscroll);this.doZoomIn=function(c){if(!b.zoomactive){b.zoomactive=
        !0;b.zoomrestore={style:{}};var k="position top left zIndex backgroundColor marginTop marginBottom marginLeft marginRight".split(" "),f=b.win[0].style,l;for(l in k){var h=k[l];b.zoomrestore.style[h]="undefined"!=typeof f[h]?f[h]:""}b.zoomrestore.style.width=b.win.css("width");b.zoomrestore.style.height=b.win.css("height");b.zoomrestore.padding={w:b.win.outerWidth()-b.win.width(),h:b.win.outerHeight()-b.win.height()};g.isios4&&(b.zoomrestore.scrollTop=e(window).scrollTop(),e(window).scrollTop(0));
        b.win.css({position:g.isios4?"absolute":"fixed",top:0,left:0,"z-index":y+100,margin:"0px"});k=b.win.css("backgroundColor");(""==k||/transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(k))&&b.win.css("backgroundColor","#fff");b.rail.css({"z-index":y+101});b.zoom.css({"z-index":y+102});b.zoom.css("backgroundPosition","0px -18px");b.resizeZoom();b.onzoomin&&b.onzoomin.call(b);return b.cancelEvent(c)}};this.doZoomOut=function(c){if(b.zoomactive)return b.zoomactive=!1,b.win.css("margin",""),b.win.css(b.zoomrestore.style),
        g.isios4&&e(window).scrollTop(b.zoomrestore.scrollTop),b.rail.css({"z-index":b.zindex}),b.zoom.css({"z-index":b.zindex}),b.zoomrestore=!1,b.zoom.css("backgroundPosition","0px 0px"),b.onResize(),b.onzoomout&&b.onzoomout.call(b),b.cancelEvent(c)};this.doZoom=function(c){return b.zoomactive?b.doZoomOut(c):b.doZoomIn(c)};this.resizeZoom=function(){if(b.zoomactive){var c=b.getScrollTop();b.win.css({width:e(window).width()-b.zoomrestore.padding.w+"px",height:e(window).height()-b.zoomrestore.padding.h+"px"});
        b.onResize();b.setScrollTop(Math.min(b.page.maxh,c))}};this.init();e.nicescroll.push(this)},J=function(e){var c=this;this.nc=e;this.steptime=this.lasttime=this.speedy=this.speedx=this.lasty=this.lastx=0;this.snapy=this.snapx=!1;this.demuly=this.demulx=0;this.lastscrolly=this.lastscrollx=-1;this.timer=this.chky=this.chkx=0;this.time=function(){return+new Date};this.reset=function(e,l){c.stop();var h=c.time();c.steptime=0;c.lasttime=h;c.speedx=0;c.speedy=0;c.lastx=e;c.lasty=l;c.lastscrollx=-1;c.lastscrolly=
    -1};this.update=function(e,l){var h=c.time();c.steptime=h-c.lasttime;c.lasttime=h;var h=l-c.lasty,t=e-c.lastx,b=c.nc.getScrollTop(),p=c.nc.getScrollLeft(),b=b+h,p=p+t;c.snapx=0>p||p>c.nc.page.maxw;c.snapy=0>b||b>c.nc.page.maxh;c.speedx=t;c.speedy=h;c.lastx=e;c.lasty=l};this.stop=function(){c.nc.unsynched("domomentum2d");c.timer&&clearTimeout(c.timer);c.timer=0;c.lastscrollx=-1;c.lastscrolly=-1};this.doSnapy=function(e,l){var h=!1;0>l?(l=0,h=!0):l>c.nc.page.maxh&&(l=c.nc.page.maxh,h=!0);0>e?(e=0,h=
    !0):e>c.nc.page.maxw&&(e=c.nc.page.maxw,h=!0);h&&c.nc.doScrollPos(e,l,c.nc.opt.snapbackspeed)};this.doMomentum=function(e){var l=c.time(),h=e?l+e:c.lasttime;e=c.nc.getScrollLeft();var t=c.nc.getScrollTop(),b=c.nc.page.maxh,p=c.nc.page.maxw;c.speedx=0<p?Math.min(60,c.speedx):0;c.speedy=0<b?Math.min(60,c.speedy):0;h=h&&60>=l-h;if(0>t||t>b||0>e||e>p)h=!1;e=c.speedx&&h?c.speedx:!1;if(c.speedy&&h&&c.speedy||e){var g=Math.max(16,c.steptime);50<g&&(e=g/50,c.speedx*=e,c.speedy*=e,g=50);c.demulxy=0;c.lastscrollx=
    c.nc.getScrollLeft();c.chkx=c.lastscrollx;c.lastscrolly=c.nc.getScrollTop();c.chky=c.lastscrolly;var s=c.lastscrollx,u=c.lastscrolly,d=function(){var e=600<c.time()-l?0.04:0.02;if(c.speedx&&(s=Math.floor(c.lastscrollx-c.speedx*(1-c.demulxy)),c.lastscrollx=s,0>s||s>p))e=0.1;if(c.speedy&&(u=Math.floor(c.lastscrolly-c.speedy*(1-c.demulxy)),c.lastscrolly=u,0>u||u>b))e=0.1;c.demulxy=Math.min(1,c.demulxy+e);c.nc.synched("domomentum2d",function(){c.speedx&&(c.nc.getScrollLeft()!=c.chkx&&c.stop(),c.chkx=
    s,c.nc.setScrollLeft(s));c.speedy&&(c.nc.getScrollTop()!=c.chky&&c.stop(),c.chky=u,c.nc.setScrollTop(u));c.timer||(c.nc.hideCursor(),c.doSnapy(s,u))});1>c.demulxy?c.timer=setTimeout(d,g):(c.stop(),c.nc.hideCursor(),c.doSnapy(s,u))};d()}else c.doSnapy(c.nc.getScrollLeft(),c.nc.getScrollTop())}},B=e.fn.scrollTop;e.cssHooks.pageYOffset={get:function(h,c,k){return(c=e.data(h,"__nicescroll")||!1)&&c.ishwscroll?c.getScrollTop():B.call(h)},set:function(h,c){var k=e.data(h,"__nicescroll")||!1;k&&k.ishwscroll?
    k.setScrollTop(parseInt(c)):B.call(h,c);return this}};e.fn.scrollTop=function(h){if("undefined"==typeof h){var c=this[0]?e.data(this[0],"__nicescroll")||!1:!1;return c&&c.ishwscroll?c.getScrollTop():B.call(this)}return this.each(function(){var c=e.data(this,"__nicescroll")||!1;c&&c.ishwscroll?c.setScrollTop(parseInt(h)):B.call(e(this),h)})};var C=e.fn.scrollLeft;e.cssHooks.pageXOffset={get:function(h,c,k){return(c=e.data(h,"__nicescroll")||!1)&&c.ishwscroll?c.getScrollLeft():C.call(h)},set:function(h,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            c){var k=e.data(h,"__nicescroll")||!1;k&&k.ishwscroll?k.setScrollLeft(parseInt(c)):C.call(h,c);return this}};e.fn.scrollLeft=function(h){if("undefined"==typeof h){var c=this[0]?e.data(this[0],"__nicescroll")||!1:!1;return c&&c.ishwscroll?c.getScrollLeft():C.call(this)}return this.each(function(){var c=e.data(this,"__nicescroll")||!1;c&&c.ishwscroll?c.setScrollLeft(parseInt(h)):C.call(e(this),h)})};var D=function(h){var c=this;this.length=0;this.name="nicescrollarray";this.each=function(e){for(var h=
    0,k=0;h<c.length;h++)e.call(c[h],k++);return c};this.push=function(e){c[c.length]=e;c.length++};this.eq=function(e){return c[e]};if(h)for(a=0;a<h.length;a++){var k=e.data(h[a],"__nicescroll")||!1;k&&(this[this.length]=k,this.length++)}return this};(function(e,c,k){for(var l=0;l<c.length;l++)k(e,c[l])})(D.prototype,"show hide toggle onResize resize remove stop doScrollPos".split(" "),function(e,c){e[c]=function(){var e=arguments;return this.each(function(){this[c].apply(this,e)})}});e.fn.getNiceScroll=
    function(h){return"undefined"==typeof h?new D(this):this[h]&&e.data(this[h],"__nicescroll")||!1};e.extend(e.expr[":"],{nicescroll:function(h){return e.data(h,"__nicescroll")?!0:!1}});e.fn.niceScroll=function(h,c){"undefined"==typeof c&&("object"==typeof h&&!("jquery"in h))&&(c=h,h=!1);var k=new D;"undefined"==typeof c&&(c={});h&&(c.doc=e(h),c.win=e(this));var l=!("doc"in c);!l&&!("win"in c)&&(c.win=e(this));this.each(function(){var h=e(this).data("__nicescroll")||!1;h||(c.doc=l?e(this):c.doc,h=new Q(c,
    e(this)),e(this).data("__nicescroll",h));k.push(h)});return 1==k.length?k[0]:k};window.NiceScroll={getjQuery:function(){return e}};e.nicescroll||(e.nicescroll=new D,e.nicescroll.options=I)})(jQuery);
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.6
 *
 */

(function($) {

  $.fn.extend({
    slimScroll: function(options) {

      var defaults = {

        // width in pixels of the visible scroll area
        width : 'auto',

        // height in pixels of the visible scroll area
        height : '250px',

        // width in pixels of the scrollbar and rail
        size : '7px',

        // scrollbar color, accepts any hex/color value
        color: '#000',

        // scrollbar position - left/right
        position : 'right',

        // distance in pixels between the side edge and the scrollbar
        distance : '1px',

        // default scroll position on load - top / bottom / $('selector')
        start : 'top',

        // sets scrollbar opacity
        opacity : .4,

        // enables always-on mode for the scrollbar
        alwaysVisible : false,

        // check if we should hide the scrollbar when user is hovering over
        disableFadeOut : false,

        // sets visibility of the rail
        railVisible : false,

        // sets rail color
        railColor : '#333',

        // sets rail opacity
        railOpacity : .2,

        // whether  we should use jQuery UI Draggable to enable bar dragging
        railDraggable : true,

        // defautlt CSS class of the slimscroll rail
        railClass : 'slimScrollRail',

        // defautlt CSS class of the slimscroll bar
        barClass : 'slimScrollBar',

        // defautlt CSS class of the slimscroll wrapper
        wrapperClass : 'slimScrollDiv',

        // check if mousewheel should scroll the window if we reach top/bottom
        allowPageScroll : false,

        // scroll amount applied to each mouse wheel step
        wheelStep : 20,

        // scroll amount applied when user is using gestures
        touchScrollStep : 200,

        // sets border radius
        borderRadius: '7px',

        // sets border radius of the rail
        railBorderRadius : '7px'
      };

      var o = $.extend(defaults, options);

      // do it for every element that matches selector
      this.each(function(){

      var isOverPanel, isOverBar, isDragg, queueHide, touchDif,
        barHeight, percentScroll, lastScroll,
        divS = '<div></div>',
        minBarHeight = 30,
        releaseScroll = false;

        // used in event handlers and for better minification
        var me = $(this);

        // ensure we are not binding it again
        if (me.parent().hasClass(o.wrapperClass))
        {
            // start from last bar position
            var offset = me.scrollTop();

            // find bar and rail
            bar = me.closest('.' + o.barClass);
            rail = me.closest('.' + o.railClass);

            getBarHeight();

            // check if we should scroll existing instance
            if ($.isPlainObject(options))
            {
              // Pass height: auto to an existing slimscroll object to force a resize after contents have changed
              if ( 'height' in options && options.height == 'auto' ) {
                me.parent().css('height', 'auto');
                me.css('height', 'auto');
                var height = me.parent().parent().height();
                me.parent().css('height', height);
                me.css('height', height);
              }

              if ('scrollTo' in options)
              {
                // jump to a static point
                offset = parseInt(o.scrollTo);
              }
              else if ('scrollBy' in options)
              {
                // jump by value pixels
                offset += parseInt(o.scrollBy);
              }
              else if ('destroy' in options)
              {
                // remove slimscroll elements
                bar.remove();
                rail.remove();
                me.unwrap();
                return;
              }

              // scroll content by the given offset
              scrollContent(offset, false, true);
            }

            return;
        }
        else if ($.isPlainObject(options))
        {
            if ('destroy' in options)
            {
            	return;
            }
        }

        // optionally set height to the parent's height
        o.height = (o.height == 'auto') ? me.parent().height() : o.height;

        // wrap content
        var wrapper = $(divS)
          .addClass(o.wrapperClass)
          .css({
            position: 'relative',
            overflow: 'hidden',
            width: o.width,
            height: o.height
          });

        // update style for the div
        me.css({
          overflow: 'hidden',
          width: o.width,
          height: o.height
        });

        // create scrollbar rail
        var rail = $(divS)
          .addClass(o.railClass)
          .css({
            width: o.size,
            height: '100%',
            position: 'absolute',
            top: 0,
            display: (o.alwaysVisible && o.railVisible) ? 'block' : 'none',
            'border-radius': o.railBorderRadius,
            background: o.railColor,
            opacity: o.railOpacity,
            zIndex: 90
          });

        // create scrollbar
        var bar = $(divS)
          .addClass(o.barClass)
          .css({
            background: o.color,
            width: o.size,
            position: 'absolute',
            top: 0,
            opacity: o.opacity,
            display: o.alwaysVisible ? 'block' : 'none',
            'border-radius' : o.borderRadius,
            BorderRadius: o.borderRadius,
            MozBorderRadius: o.borderRadius,
            WebkitBorderRadius: o.borderRadius,
            zIndex: 99
          });

        // set position
        var posCss = (o.position == 'right') ? { right: o.distance } : { left: o.distance };
        rail.css(posCss);
        bar.css(posCss);

        // wrap it
        me.wrap(wrapper);

        // append to parent div
        me.parent().append(bar);
        me.parent().append(rail);

        // make it draggable and no longer dependent on the jqueryUI
        if (o.railDraggable){
          bar.bind("mousedown", function(e) {
            var $doc = $(document);
            isDragg = true;
            t = parseFloat(bar.css('top'));
            pageY = e.pageY;

            $doc.bind("mousemove.slimscroll", function(e){
              currTop = t + e.pageY - pageY;
              bar.css('top', currTop);
              scrollContent(0, bar.position().top, false);// scroll content
            });

            $doc.bind("mouseup.slimscroll", function(e) {
              isDragg = false;hideBar();
              $doc.unbind('.slimscroll');
            });
            return false;
          }).bind("selectstart.slimscroll", function(e){
            e.stopPropagation();
            e.preventDefault();
            return false;
          });
        }

        // on rail over
        rail.hover(function(){
          showBar();
        }, function(){
          hideBar();
        });

        // on bar over
        bar.hover(function(){
          isOverBar = true;
        }, function(){
          isOverBar = false;
        });

        // show on parent mouseover
        me.hover(function(){
          isOverPanel = true;
          showBar();
          hideBar();
        }, function(){
          isOverPanel = false;
          hideBar();
        });

        // support for mobile
        me.bind('touchstart', function(e,b){
          if (e.originalEvent.touches.length)
          {
            // record where touch started
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        me.bind('touchmove', function(e){
          // prevent scrolling the page if necessary
          if(!releaseScroll)
          {
  		      e.originalEvent.preventDefault();
		      }
          if (e.originalEvent.touches.length)
          {
            // see how far user swiped
            var diff = (touchDif - e.originalEvent.touches[0].pageY) / o.touchScrollStep;
            // scroll content
            scrollContent(diff, true);
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        // set up initial height
        getBarHeight();

        // check start position
        if (o.start === 'bottom')
        {
          // scroll content to bottom
          bar.css({ top: me.outerHeight() - bar.outerHeight() });
          scrollContent(0, true);
        }
        else if (o.start !== 'top')
        {
          // assume jQuery selector
          scrollContent($(o.start).position().top, null, true);

          // make sure bar stays hidden
          if (!o.alwaysVisible) { bar.hide(); }
        }

        // attach scroll events
        attachWheel(this);

        function _onWheel(e)
        {
          // use mouse wheel only when mouse is over
          if (!isOverPanel) { return; }

          var e = e || window.event;

          var delta = 0;
          if (e.wheelDelta) { delta = -e.wheelDelta/120; }
          if (e.detail) { delta = e.detail / 3; }

          var target = e.target || e.srcTarget || e.srcElement;
          if ($(target).closest('.' + o.wrapperClass).is(me.parent())) {
            // scroll content
            scrollContent(delta, true);
          }

          // stop window scroll
          if (e.preventDefault && !releaseScroll) { e.preventDefault(); }
          if (!releaseScroll) { e.returnValue = false; }
        }

        function scrollContent(y, isWheel, isJump)
        {
          releaseScroll = false;
          var delta = y;
          var maxTop = me.outerHeight() - bar.outerHeight();

          if (isWheel)
          {
            // move bar with mouse wheel
            delta = parseInt(bar.css('top')) + y * parseInt(o.wheelStep) / 100 * bar.outerHeight();

            // move bar, make sure it doesn't go out
            delta = Math.min(Math.max(delta, 0), maxTop);

            // if scrolling down, make sure a fractional change to the
            // scroll position isn't rounded away when the scrollbar's CSS is set
            // this flooring of delta would happened automatically when
            // bar.css is set below, but we floor here for clarity
            delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);

            // scroll the scrollbar
            bar.css({ top: delta + 'px' });
          }

          // calculate actual scroll amount
          percentScroll = parseInt(bar.css('top')) / (me.outerHeight() - bar.outerHeight());
          delta = percentScroll * (me[0].scrollHeight - me.outerHeight());

          if (isJump)
          {
            delta = y;
            var offsetTop = delta / me[0].scrollHeight * me.outerHeight();
            offsetTop = Math.min(Math.max(offsetTop, 0), maxTop);
            bar.css({ top: offsetTop + 'px' });
          }

          // scroll content
          me.scrollTop(delta);

          // fire scrolling event
          me.trigger('slimscrolling', ~~delta);

          // ensure bar is visible
          showBar();

          // trigger hide when scroll is stopped
          hideBar();
        }

        function attachWheel(target)
        {
          if (window.addEventListener)
          {
            target.addEventListener('DOMMouseScroll', _onWheel, false );
            target.addEventListener('mousewheel', _onWheel, false );
          }
          else
          {
            document.attachEvent("onmousewheel", _onWheel)
          }
        }

        function getBarHeight()
        {
          // calculate scrollbar height and make sure it is not too small
          barHeight = Math.max((me.outerHeight() / me[0].scrollHeight) * me.outerHeight(), minBarHeight);
          bar.css({ height: barHeight + 'px' });

          // hide scrollbar if content is not long enough
          var display = barHeight == me.outerHeight() ? 'none' : 'block';
          bar.css({ display: display });
        }

        function showBar()
        {
          // recalculate bar height
          getBarHeight();
          clearTimeout(queueHide);

          // when bar reached top or bottom
          if (percentScroll == ~~percentScroll)
          {
            //release wheel
            releaseScroll = o.allowPageScroll;

            // publish approporiate event
            if (lastScroll != percentScroll)
            {
                var msg = (~~percentScroll == 0) ? 'top' : 'bottom';
                me.trigger('slimscroll', msg);
            }
          }
          else
          {
            releaseScroll = false;
          }
          lastScroll = percentScroll;

          // show only when required
          if(barHeight >= me.outerHeight()) {
            //allow window scroll
            releaseScroll = true;
            return;
          }
          bar.stop(true,true).fadeIn('fast');
          if (o.railVisible) { rail.stop(true,true).fadeIn('fast'); }
        }

        function hideBar()
        {
          // only hide when options allow it
          if (!o.alwaysVisible)
          {
            queueHide = setTimeout(function(){
              if (!(o.disableFadeOut && isOverPanel) && !isOverBar && !isDragg)
              {
                bar.fadeOut('slow');
                rail.fadeOut('slow');
              }
            }, 1000);
          }
        }

      });

      // maintain chainability
      return this;
    }
  });

  $.fn.extend({
    slimscroll: $.fn.slimScroll
  });

})(jQuery);
/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.6
 */

;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,targ,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.Sweetalert2=t()}(this,function(){"use strict";var e={title:"",titleText:"",text:"",html:"",type:null,customClass:"",target:"body",animation:!0,allowOutsideClick:!0,allowEscapeKey:!0,allowEnterKey:!0,showConfirmButton:!0,showCancelButton:!1,preConfirm:null,confirmButtonText:"OK",confirmButtonAriaLabel:"",confirmButtonColor:"#3085d6",confirmButtonClass:null,cancelButtonText:"Cancel",cancelButtonAriaLabel:"",cancelButtonColor:"#aaa",cancelButtonClass:null,buttonsStyling:!0,reverseButtons:!1,focusConfirm:!0,focusCancel:!1,showCloseButton:!1,closeButtonAriaLabel:"Close this dialog",showLoaderOnConfirm:!1,imageUrl:null,imageWidth:null,imageHeight:null,imageAlt:"",imageClass:null,timer:null,width:500,padding:20,background:"#fff",input:null,inputPlaceholder:"",inputValue:"",inputOptions:{},inputAutoTrim:!0,inputClass:null,inputAttributes:{},inputValidator:null,progressSteps:[],currentProgressStep:null,progressStepsDistance:"40px",onOpen:null,onClose:null,useRejections:!0},t=function(e){var t={};for(var n in e)t[e[n]]="swal2-"+e[n];return t},n=t(["container","shown","iosfix","modal","overlay","fade","show","hide","noanimation","close","title","content","buttonswrapper","confirm","cancel","icon","image","input","file","range","select","radio","checkbox","textarea","inputerror","validationerror","progresssteps","activeprogressstep","progresscircle","progressline","loading","styled"]),o=t(["success","warning","info","question","error"]),r=function(e,t){(e=String(e).replace(/[^0-9a-f]/gi,"")).length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),t=t||0;for(var n="#",o=0;o<3;o++){var r=parseInt(e.substr(2*o,2),16);n+=("00"+(r=Math.round(Math.min(Math.max(0,r+r*t),255)).toString(16))).substr(r.length)}return n},i=function(e){var t=[];for(var n in e)-1===t.indexOf(e[n])&&t.push(e[n]);return t},a=function(e){console.warn("SweetAlert2: "+e)},l=function(e){console.error("SweetAlert2: "+e)},s={previousWindowKeyDown:null,previousActiveElement:null,previousBodyPadding:null},u=function(e){var t=d();t&&t.parentNode.removeChild(t);{if("undefined"!=typeof document){var o=document.createElement("div");o.className=n.container,o.innerHTML=c,("string"==typeof e.target?document.querySelector(e.target):e.target).appendChild(o);var r=p(),i=L(r,n.input),a=L(r,n.file),s=r.querySelector("."+n.range+" input"),u=r.querySelector("."+n.range+" output"),f=L(r,n.select),m=r.querySelector("."+n.checkbox+" input"),v=L(r,n.textarea);return i.oninput=function(){J.resetValidationError()},a.onchange=function(){J.resetValidationError()},s.oninput=function(){J.resetValidationError(),u.value=s.value},s.onchange=function(){J.resetValidationError(),s.previousSibling.value=s.value},f.onchange=function(){J.resetValidationError()},m.onchange=function(){J.resetValidationError()},v.oninput=function(){J.resetValidationError()},r}l("SweetAlert2 requires document to initialize")}},c=('\n <div role="dialog" aria-labelledby="'+n.title+'" aria-describedby="'+n.content+'" class="'+n.modal+'" tabindex="-1">\n   <ul class="'+n.progresssteps+'"></ul>\n   <div class="'+n.icon+" "+o.error+'">\n     <span class="swal2-x-mark"><span class="swal2-x-mark-line-left"></span><span class="swal2-x-mark-line-right"></span></span>\n   </div>\n   <div class="'+n.icon+" "+o.question+'">?</div>\n   <div class="'+n.icon+" "+o.warning+'">!</div>\n   <div class="'+n.icon+" "+o.info+'">i</div>\n   <div class="'+n.icon+" "+o.success+'">\n     <div class="swal2-success-circular-line-left"></div>\n     <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>\n     <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>\n     <div class="swal2-success-circular-line-right"></div>\n   </div>\n   <img class="'+n.image+'" />\n   <h2 class="'+n.title+'" id="'+n.title+'"></h2>\n   <div id="'+n.content+'" class="'+n.content+'"></div>\n   <input class="'+n.input+'" />\n   <input type="file" class="'+n.file+'" />\n   <div class="'+n.range+'">\n     <output></output>\n     <input type="range" />\n   </div>\n   <select class="'+n.select+'"></select>\n   <div class="'+n.radio+'"></div>\n   <label for="'+n.checkbox+'" class="'+n.checkbox+'">\n     <input type="checkbox" />\n   </label>\n   <textarea class="'+n.textarea+'"></textarea>\n   <div class="'+n.validationerror+'" id="'+n.validationerror+'"></div>\n   <div class="'+n.buttonswrapper+'">\n     <button type="button" class="'+n.confirm+'">OK</button>\n     <button type="button" class="'+n.cancel+'">Cancel</button>\n   </div>\n   <button type="button" class="'+n.close+'">×</button>\n </div>\n').replace(/(^|\n)\s*/g,""),d=function(){return document.body.querySelector("."+n.container)},p=function(){return d()?d().querySelector("."+n.modal):null},f=function(){return p().querySelectorAll("."+n.icon)},m=function(e){return d()?d().querySelector("."+e):null},v=function(){return m(n.title)},h=function(){return m(n.content)},b=function(){return m(n.image)},g=function(){return m(n.progresssteps)},y=function(){return m(n.validationerror)},w=function(){return m(n.confirm)},C=function(){return m(n.cancel)},k=function(){return m(n.buttonswrapper)},x=function(){return m(n.close)},S=function(){var e=Array.from(p().querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')).sort(function(e,t){return e=parseInt(e.getAttribute("tabindex")),t=parseInt(t.getAttribute("tabindex")),e>t?1:e<t?-1:0}),t=Array.prototype.slice.call(p().querySelectorAll('button, input:not([type=hidden]), textarea, select, a, [tabindex="0"]'));return i(e.concat(t))},A=function(e,t){return!!e.classList&&e.classList.contains(t)},B=function(e){if(e.focus(),"file"!==e.type){var t=e.value;e.value="",e.value=t}},E=function(e,t){e&&t&&t.split(/\s+/).filter(Boolean).forEach(function(t){e.classList.add(t)})},P=function(e,t){e&&t&&t.split(/\s+/).filter(Boolean).forEach(function(t){e.classList.remove(t)})},L=function(e,t){for(var n=0;n<e.childNodes.length;n++)if(A(e.childNodes[n],t))return e.childNodes[n]},T=function(e,t){t||(t="block"),e.style.opacity="",e.style.display=t},q=function(e){e.style.opacity="",e.style.display="none"},V=function(e){for(;e.firstChild;)e.removeChild(e.firstChild)},M=function(e){return e.offsetWidth||e.offsetHeight||e.getClientRects().length},O=function(e,t){e.style.removeProperty?e.style.removeProperty(t):e.style.removeAttribute(t)},H=function(){var e=document.createElement("div"),t={WebkitAnimation:"webkitAnimationEnd",OAnimation:"oAnimationEnd oanimationend",animation:"animationend"};for(var n in t)if(t.hasOwnProperty(n)&&void 0!==e.style[n])return t[n];return!1}(),N=function(){if(window.onkeydown=s.previousWindowKeyDown,s.previousActiveElement&&s.previousActiveElement.focus){var e=window.scrollX,t=window.scrollY;s.previousActiveElement.focus(),e&&t&&window.scrollTo(e,t)}},j=function(){if("ontouchstart"in window||navigator.msMaxTouchPoints)return 0;var e=document.createElement("div");e.style.width="50px",e.style.height="50px",e.style.overflow="scroll",document.body.appendChild(e);var t=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),t},I=function(e,t){var n=void 0;return function(){clearTimeout(n),n=setTimeout(function(){n=null,e()},t)}},R="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},D=(function(){function e(e){this.value=e}function t(t){function n(r,i){try{var a=t[r](i),l=a.value;l instanceof e?Promise.resolve(l.value).then(function(e){n("next",e)},function(e){n("throw",e)}):o(a.done?"return":"normal",a.value)}catch(e){o("throw",e)}}function o(e,t){switch(e){case"return":r.resolve({value:t,done:!0});break;case"throw":r.reject(t);break;default:r.resolve({value:t,done:!1})}(r=r.next)?n(r.key,r.arg):i=null}var r,i;this._invoke=function(e,t){return new Promise(function(o,a){var l={key:e,arg:t,resolve:o,reject:a,next:null};i?i=i.next=l:(r=i=l,n(e,t))})},"function"!=typeof t.return&&(this.return=void 0)}"function"==typeof Symbol&&Symbol.asyncIterator&&(t.prototype[Symbol.asyncIterator]=function(){return this}),t.prototype.next=function(e){return this._invoke("next",e)},t.prototype.throw=function(e){return this._invoke("throw",e)},t.prototype.return=function(e){return this._invoke("return",e)}}(),Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e}),U=D({},e),W=[],K=void 0;"undefined"==typeof Promise&&l("This package requires a Promise library, please include a shim to enable it in this browser (See: https://github.com/limonte/sweetalert2/wiki/Migration-from-SweetAlert-to-SweetAlert2#1-ie-support)");var z=function(e){("string"==typeof e.target&&!document.querySelector(e.target)||"string"!=typeof e.target&&!e.target.appendChild)&&(a('Target parameter is not valid, defaulting to "body"'),e.target="body");var t=void 0,r=p(),i="string"==typeof e.target?document.querySelector(e.target):e.target;t=r&&i&&r.parentNode!==i.parentNode?u(e):r||u(e);for(var s in e)J.isValidParameter(s)||a('Unknown parameter "'+s+'"');t.style.width="number"==typeof e.width?e.width+"px":e.width,t.style.padding=e.padding+"px",t.style.background=e.background;for(var c=t.querySelectorAll("[class^=swal2-success-circular-line], .swal2-success-fix"),d=0;d<c.length;d++)c[d].style.background=e.background;var m=v(),y=h(),S=k(),A=w(),B=C(),L=x();if(e.titleText?m.innerText=e.titleText:m.innerHTML=e.title.split("\n").join("<br />"),e.text||e.html){if("object"===R(e.html))if(y.innerHTML="",0 in e.html)for(var M=0;M in e.html;M++)y.appendChild(e.html[M].cloneNode(!0));else y.appendChild(e.html.cloneNode(!0));else e.html?y.innerHTML=e.html:e.text&&(y.textContent=e.text);T(y)}else q(y);e.showCloseButton?(L.setAttribute("aria-label",e.closeButtonAriaLabel),T(L)):q(L),t.className=n.modal,e.customClass&&E(t,e.customClass);var H=g(),N=parseInt(null===e.currentProgressStep?J.getQueueStep():e.currentProgressStep,10);e.progressSteps.length?(T(H),V(H),N>=e.progressSteps.length&&a("Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"),e.progressSteps.forEach(function(t,o){var r=document.createElement("li");if(E(r,n.progresscircle),r.innerHTML=t,o===N&&E(r,n.activeprogressstep),H.appendChild(r),o!==e.progressSteps.length-1){var i=document.createElement("li");E(i,n.progressline),i.style.width=e.progressStepsDistance,H.appendChild(i)}})):q(H);for(var j=f(),I=0;I<j.length;I++)q(j[I]);if(e.type){var D=!1;for(var U in o)if(e.type===U){D=!0;break}if(!D)return l("Unknown alert type: "+e.type),!1;var W=t.querySelector("."+n.icon+"."+o[e.type]);if(T(W),e.animation)switch(e.type){case"success":E(W,"swal2-animate-success-icon"),E(W.querySelector(".swal2-success-line-tip"),"swal2-animate-success-line-tip"),E(W.querySelector(".swal2-success-line-long"),"swal2-animate-success-line-long");break;case"error":E(W,"swal2-animate-error-icon"),E(W.querySelector(".swal2-x-mark"),"swal2-animate-x-mark")}}var K=b();e.imageUrl?(K.setAttribute("src",e.imageUrl),K.setAttribute("alt",e.imageAlt),T(K),e.imageWidth?K.setAttribute("width",e.imageWidth):K.removeAttribute("width"),e.imageHeight?K.setAttribute("height",e.imageHeight):K.removeAttribute("height"),K.className=n.image,e.imageClass&&E(K,e.imageClass)):q(K),e.showCancelButton?B.style.display="inline-block":q(B),e.showConfirmButton?O(A,"display"):q(A),e.showConfirmButton||e.showCancelButton?T(S):q(S),A.innerHTML=e.confirmButtonText,B.innerHTML=e.cancelButtonText,A.setAttribute("aria-label",e.confirmButtonAriaLabel),B.setAttribute("aria-label",e.cancelButtonAriaLabel),e.buttonsStyling&&(A.style.backgroundColor=e.confirmButtonColor,B.style.backgroundColor=e.cancelButtonColor),A.className=n.confirm,E(A,e.confirmButtonClass),B.className=n.cancel,E(B,e.cancelButtonClass),e.buttonsStyling?(E(A,n.styled),E(B,n.styled)):(P(A,n.styled),P(B,n.styled),A.style.backgroundColor=A.style.borderLeftColor=A.style.borderRightColor="",B.style.backgroundColor=B.style.borderLeftColor=B.style.borderRightColor=""),!0===e.animation?P(t,n.noanimation):E(t,n.noanimation),e.showLoaderOnConfirm&&!e.preConfirm&&a("showLoaderOnConfirm is set to true, but preConfirm is not defined.\nshowLoaderOnConfirm should be used together with preConfirm, see usage example:\nhttps://limonte.github.io/sweetalert2/#ajax-request")},_=function(e,t){var o=d(),r=p();e?(E(r,n.show),E(o,n.fade),P(r,n.hide)):P(r,n.fade),T(r),o.style.overflowY="hidden",H&&!A(r,n.noanimation)?r.addEventListener(H,function e(){r.removeEventListener(H,e),o.style.overflowY="auto"}):o.style.overflowY="auto",E(document.documentElement,n.shown),E(document.body,n.shown),E(o,n.shown),Z(),Y(),s.previousActiveElement=document.activeElement,null!==t&&"function"==typeof t&&setTimeout(function(){t(r)})},Z=function(){null===s.previousBodyPadding&&document.body.scrollHeight>window.innerHeight&&(s.previousBodyPadding=document.body.style.paddingRight,document.body.style.paddingRight=j()+"px")},Q=function(){null!==s.previousBodyPadding&&(document.body.style.paddingRight=s.previousBodyPadding,s.previousBodyPadding=null)},Y=function(){if(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream&&!A(document.body,n.iosfix)){var e=document.body.scrollTop;document.body.style.top=-1*e+"px",E(document.body,n.iosfix)}},$=function(){if(A(document.body,n.iosfix)){var e=parseInt(document.body.style.top,10);P(document.body,n.iosfix),document.body.style.top="",document.body.scrollTop=-1*e}},J=function e(){for(var t=arguments.length,o=Array(t),i=0;i<t;i++)o[i]=arguments[i];if(void 0===o[0])return l("SweetAlert2 expects at least 1 attribute!"),!1;var a=D({},U);switch(R(o[0])){case"string":a.title=o[0],a.html=o[1],a.type=o[2];break;case"object":D(a,o[0]),a.extraParams=o[0].extraParams,"email"===a.input&&null===a.inputValidator&&(a.inputValidator=function(e){return new Promise(function(t,n){/^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(e)?t():n("Invalid email address")})}),"url"===a.input&&null===a.inputValidator&&(a.inputValidator=function(e){return new Promise(function(t,n){/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(e)?t():n("Invalid URL")})});break;default:return l('Unexpected type of argument! Expected "string" or "object", got '+R(o[0])),!1}z(a);var u=d(),c=p();return new Promise(function(t,o){a.timer&&(c.timeout=setTimeout(function(){e.closeModal(a.onClose),a.useRejections?o("timer"):t({dismiss:"timer"})},a.timer));var i=function(e){if(!(e=e||a.input))return null;switch(e){case"select":case"textarea":case"file":return L(c,n[e]);case"checkbox":return c.querySelector("."+n.checkbox+" input");case"radio":return c.querySelector("."+n.radio+" input:checked")||c.querySelector("."+n.radio+" input:first-child");case"range":return c.querySelector("."+n.range+" input");default:return L(c,n.input)}},f=function(){var e=i();if(!e)return null;switch(a.input){case"checkbox":return e.checked?1:0;case"radio":return e.checked?e.value:null;case"file":return e.files.length?e.files[0]:null;default:return a.inputAutoTrim?e.value.trim():e.value}};a.input&&setTimeout(function(){var e=i();e&&B(e)},0);for(var m=function(n){a.showLoaderOnConfirm&&e.showLoading(),a.preConfirm?a.preConfirm(n,a.extraParams).then(function(o){e.closeModal(a.onClose),t(o||n)},function(t){e.hideLoading(),t&&e.showValidationError(t)}):(e.closeModal(a.onClose),t(a.useRejections?n:{value:n}))},A=function(n){var i=n||window.event,l=i.target||i.srcElement,s=w(),u=C(),c=s&&(s===l||s.contains(l)),d=u&&(u===l||u.contains(l));switch(i.type){case"mouseover":case"mouseup":a.buttonsStyling&&(c?s.style.backgroundColor=r(a.confirmButtonColor,-.1):d&&(u.style.backgroundColor=r(a.cancelButtonColor,-.1)));break;case"mouseout":a.buttonsStyling&&(c?s.style.backgroundColor=a.confirmButtonColor:d&&(u.style.backgroundColor=a.cancelButtonColor));break;case"mousedown":a.buttonsStyling&&(c?s.style.backgroundColor=r(a.confirmButtonColor,-.2):d&&(u.style.backgroundColor=r(a.cancelButtonColor,-.2)));break;case"click":if(c&&e.isVisible())if(e.disableButtons(),a.input){var p=f();a.inputValidator?(e.disableInput(),a.inputValidator(p,a.extraParams).then(function(){e.enableButtons(),e.enableInput(),m(p)},function(t){e.enableButtons(),e.enableInput(),t&&e.showValidationError(t)})):m(p)}else m(!0);else d&&e.isVisible()&&(e.disableButtons(),e.closeModal(a.onClose),a.useRejections?o("cancel"):t({dismiss:"cancel"}))}},V=c.querySelectorAll("button"),O=0;O<V.length;O++)V[O].onclick=A,V[O].onmouseover=A,V[O].onmouseout=A,V[O].onmousedown=A;x().onclick=function(){e.closeModal(a.onClose),a.useRejections?o("close"):t({dismiss:"close"})},u.onclick=function(n){n.target===u&&a.allowOutsideClick&&(e.closeModal(a.onClose),a.useRejections?o("overlay"):t({dismiss:"overlay"}))};var H=k(),N=w(),j=C();a.reverseButtons?N.parentNode.insertBefore(j,N):N.parentNode.insertBefore(N,j);var D=function(e,t){for(var n=S(a.focusCancel),o=0;o<n.length;o++){(e+=t)===n.length?e=0:-1===e&&(e=n.length-1);var r=n[e];if(M(r))return r.focus()}},U=function(n){var r=n||window.event;if("Enter"===r.key)r.target===i()&&(e.clickConfirm(),r.preventDefault());else if("Tab"===r.key){for(var l=r.target||r.srcElement,s=S(a.focusCancel),u=-1,c=0;c<s.length;c++)if(l===s[c]){u=c;break}r.shiftKey?D(u,-1):D(u,1),r.stopPropagation(),r.preventDefault()}else["ArrowLeft","ArrowRight","ArrowUp","Arrowdown"].includes(r.key)?document.activeElement===N&&M(j)?j.focus():document.activeElement===j&&M(N)&&N.focus():"Escape"===r.key&&!0===a.allowEscapeKey&&(e.closeModal(a.onClose),a.useRejections?o("esc"):t({dismiss:"esc"}))};window.onkeydown&&window.onkeydown.toString()===U.toString()||(s.previousWindowKeyDown=window.onkeydown,window.onkeydown=U),a.buttonsStyling&&(N.style.borderLeftColor=a.confirmButtonColor,N.style.borderRightColor=a.confirmButtonColor),e.hideLoading=e.disableLoading=function(){a.showConfirmButton||(q(N),a.showCancelButton||q(k())),P(H,n.loading),P(c,n.loading),c.removeAttribute("aria-busy"),N.disabled=!1,j.disabled=!1},e.getTitle=function(){return v()},e.getContent=function(){return h()},e.getInput=function(){return i()},e.getImage=function(){return b()},e.getButtonsWrapper=function(){return k()},e.getConfirmButton=function(){return w()},e.getCancelButton=function(){return C()},e.enableButtons=function(){N.disabled=!1,j.disabled=!1},e.disableButtons=function(){N.disabled=!0,j.disabled=!0},e.enableConfirmButton=function(){N.disabled=!1},e.disableConfirmButton=function(){N.disabled=!0},e.enableInput=function(){var e=i();if(!e)return!1;if("radio"===e.type)for(var t=e.parentNode.parentNode.querySelectorAll("input"),n=0;n<t.length;n++)t[n].disabled=!1;else e.disabled=!1},e.disableInput=function(){var e=i();if(!e)return!1;if(e&&"radio"===e.type)for(var t=e.parentNode.parentNode.querySelectorAll("input"),n=0;n<t.length;n++)t[n].disabled=!0;else e.disabled=!0},e.recalculateHeight=I(function(){var e=p();if(e){var t=e.style.display;e.style.minHeight="",T(e),e.style.minHeight=e.scrollHeight+1+"px",e.style.display=t}},50),e.showValidationError=function(e){var t=y();t.innerHTML=e,T(t);var o=i();o&&(o.setAttribute("aria-invalid",!0),o.setAttribute("aria-describedBy",n.validationerror),B(o),E(o,n.inputerror))},e.resetValidationError=function(){var t=y();q(t),e.recalculateHeight();var o=i();o&&(o.removeAttribute("aria-invalid"),o.removeAttribute("aria-describedBy"),P(o,n.inputerror))},e.getProgressSteps=function(){return a.progressSteps},e.setProgressSteps=function(e){a.progressSteps=e,z(a)},e.showProgressSteps=function(){T(g())},e.hideProgressSteps=function(){q(g())},e.enableButtons(),e.hideLoading(),e.resetValidationError();for(var W=["input","file","range","select","radio","checkbox","textarea"],Z=void 0,Q=0;Q<W.length;Q++){var Y=n[W[Q]],$=L(c,Y);if(Z=i(W[Q])){for(var J in Z.attributes)if(Z.attributes.hasOwnProperty(J)){var X=Z.attributes[J].name;"type"!==X&&"value"!==X&&Z.removeAttribute(X)}for(var F in a.inputAttributes)Z.setAttribute(F,a.inputAttributes[F])}$.className=Y,a.inputClass&&E($,a.inputClass),q($)}var G=void 0;switch(a.input){case"text":case"email":case"password":case"number":case"tel":case"url":(Z=L(c,n.input)).value=a.inputValue,Z.placeholder=a.inputPlaceholder,Z.type=a.input,T(Z);break;case"file":(Z=L(c,n.file)).placeholder=a.inputPlaceholder,Z.type=a.input,T(Z);break;case"range":var ee=L(c,n.range),te=ee.querySelector("input"),ne=ee.querySelector("output");te.value=a.inputValue,te.type=a.input,ne.value=a.inputValue,T(ee);break;case"select":var oe=L(c,n.select);if(oe.innerHTML="",a.inputPlaceholder){var re=document.createElement("option");re.innerHTML=a.inputPlaceholder,re.value="",re.disabled=!0,re.selected=!0,oe.appendChild(re)}G=function(e){for(var t in e){var n=document.createElement("option");n.value=t,n.innerHTML=e[t],a.inputValue===t&&(n.selected=!0),oe.appendChild(n)}T(oe),oe.focus()};break;case"radio":var ie=L(c,n.radio);ie.innerHTML="",G=function(e){for(var t in e){var o=document.createElement("input"),r=document.createElement("label"),i=document.createElement("span");o.type="radio",o.name=n.radio,o.value=t,a.inputValue===t&&(o.checked=!0),i.innerHTML=e[t],r.appendChild(o),r.appendChild(i),r.for=o.id,ie.appendChild(r)}T(ie);var l=ie.querySelectorAll("input");l.length&&l[0].focus()};break;case"checkbox":var ae=L(c,n.checkbox),le=i("checkbox");le.type="checkbox",le.value=1,le.id=n.checkbox,le.checked=Boolean(a.inputValue);var se=ae.getElementsByTagName("span");se.length&&ae.removeChild(se[0]),(se=document.createElement("span")).innerHTML=a.inputPlaceholder,ae.appendChild(se),T(ae);break;case"textarea":var ue=L(c,n.textarea);ue.value=a.inputValue,ue.placeholder=a.inputPlaceholder,T(ue);break;case null:break;default:l('Unexpected type of input! Expected "text", "email", "password", "number", "tel", "select", "radio", "checkbox", "textarea", "file" or "url", got "'+a.input+'"')}"select"!==a.input&&"radio"!==a.input||(a.inputOptions instanceof Promise?(e.showLoading(),a.inputOptions.then(function(t){e.hideLoading(),G(t)})):"object"===R(a.inputOptions)?G(a.inputOptions):l("Unexpected type of inputOptions! Expected object or Promise, got "+R(a.inputOptions))),_(a.animation,a.onOpen),a.allowEnterKey?a.focusCancel&&M(j)?j.focus():a.focusConfirm&&M(N)?N.focus():D(-1,1):document.activeElement&&document.activeElement.blur(),d().scrollTop=0,"undefined"==typeof MutationObserver||K||(K=new MutationObserver(e.recalculateHeight)).observe(c,{childList:!0,characterData:!0,subtree:!0})})};return J.isVisible=function(){return!!p()},J.queue=function(e){W=e;var t=function(){W=[],document.body.removeAttribute("data-swal2-queue-step")},n=[];return new Promise(function(e,o){!function r(i,a){i<W.length?(document.body.setAttribute("data-swal2-queue-step",i),J(W[i]).then(function(e){n.push(e),r(i+1,a)},function(e){t(),o(e)})):(t(),e(n))}(0)})},J.getQueueStep=function(){return document.body.getAttribute("data-swal2-queue-step")},J.insertQueueStep=function(e,t){return t&&t<W.length?W.splice(t,0,e):W.push(e)},J.deleteQueueStep=function(e){void 0!==W[e]&&W.splice(e,1)},J.close=J.closeModal=function(e){var t=d(),o=p();if(o){P(o,n.show),E(o,n.hide),clearTimeout(o.timeout),N();var r=function(){t.parentNode&&t.parentNode.removeChild(t),P(document.documentElement,n.shown),P(document.body,n.shown),Q(),$()};H&&!A(o,n.noanimation)?o.addEventListener(H,function e(){o.removeEventListener(H,e),A(o,n.hide)&&r()}):r(),null!==e&&"function"==typeof e&&setTimeout(function(){e(o)})}},J.clickConfirm=function(){return w().click()},J.clickCancel=function(){return C().click()},J.showLoading=J.enableLoading=function(){var e=p();e||J(""),e=p();var t=k(),o=w(),r=C();T(t),T(o,"inline-block"),E(t,n.loading),E(e,n.loading),o.disabled=!0,r.disabled=!0,e.setAttribute("aria-busy",!0),e.focus()},J.isValidParameter=function(t){return e.hasOwnProperty(t)||"extraParams"===t},J.setDefaults=function(e){if(!e||"object"!==(void 0===e?"undefined":R(e)))return l("the argument for setDefaults() is required and has to be a object");for(var t in e)J.isValidParameter(t)||(a('Unknown parameter "'+t+'"'),delete e[t]);D(U,e)},J.resetDefaults=function(){U=D({},e)},J.noop=function(){},J.version="6.10.2",J.default=J,J}),window.Sweetalert2&&(window.sweetAlert=window.swal=window.Sweetalert2);

/**
 * Theme: Adminto - Admin Dashboard
 * Author: Coderthemes
 * SweetAlert
 */


!function ($) {
    "use strict";

    var SweetAlert = function () {
    };

    //examples
    SweetAlert.prototype.init = function () {

        //Basic
        $('#sa-basic').on('click', function () {
            swal('Any fool can use a computer').catch(swal.noop)
        });

        //A title with a text under
        $('#sa-title').click(function () {
            swal(
                'The Internet?',
                'That thing is still around?',
                'question'
            )
        });

        //Success Message
        $('#sa-success').click(function () {
            swal(
                {
                    title: 'Good job!',
                    text: 'You clicked the button!',
                    type: 'success',
                    confirmButtonColor: '#4fa7f3'
                }
            )
        });

        //Warning Message
        $('#sa-warning').click(function () {
            swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#4fa7f3',
                cancelButtonColor: '#d57171',
                confirmButtonText: 'Yes, delete it!'
            }).then(function () {
                swal(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                )
            })
        });

        //Parameter
        $('#sa-params').click(function () {
            swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger m-l-10',
                buttonsStyling: false
            }).then(function () {
                swal(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                )
            }, function (dismiss) {
                // dismiss can be 'cancel', 'overlay',
                // 'close', and 'timer'
                if (dismiss === 'cancel') {
                    swal(
                        'Cancelled',
                        'Your imaginary file is safe :)',
                        'error'
                    )
                }
            })
        });

        //Custom Image
        $('#sa-image').click(function () {
            swal({
                title: 'Sweet!',
                text: 'Modal with a custom image.',
                imageUrl: 'assets/images/mail_confirm.png',
                imageHeight: 50,
                animation: false
            })
        });

        //Auto Close Timer
        $('#sa-close').click(function () {
            swal({
                title: 'Auto close alert!',
                text: 'I will close in 2 seconds.',
                timer: 2000
            }).then(
                function () {
                },
                // handling the promise rejection
                function (dismiss) {
                    if (dismiss === 'timer') {
                        console.log('I was closed by the timer')
                    }
                }
            )
        });

        //custom html alert
        $('#custom-html-alert').click(function () {
            swal({
                title: '<i>HTML</i> <u>example</u>',
                type: 'info',
                html: 'You can use <b>bold text</b>, ' +
                '<a href="//coderthemes.com/">links</a> ' +
                'and other HTML tags',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger m-l-10',
                confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
                cancelButtonText: '<i class="fa fa-thumbs-down"></i>'
            })
        });

        //Custom width padding
        $('#custom-padding-width-alert').click(function () {
            swal({
                title: 'Custom width, padding, background.',
                width: 600,
                padding: 100,
                background: '#fff url(//subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/geometry.png)'
            })
        });

        //Ajax
        $('#ajax-alert').click(function () {
            swal({
                title: 'Submit email to run ajax request',
                input: 'email',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger m-l-10',
                preConfirm: function (email) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            if (email === 'taken@example.com') {
                                reject('This email is already taken.')
                            } else {
                                resolve()
                            }
                        }, 2000)
                    })
                },
                allowOutsideClick: false
            }).then(function (email) {
                swal({
                    type: 'success',
                    title: 'Ajax request finished!',
                    html: 'Submitted email: ' + email
                })
            })
        });

        //chaining modal alert
        $('#chaining-alert').click(function () {
            swal.setDefaults({
                input: 'text',
                confirmButtonText: 'Next &rarr;',
                showCancelButton: true,
                animation: false,
                progressSteps: ['1', '2', '3']
            })

            var steps = [
                {
                    title: 'Question 1',
                    text: 'Chaining swal2 modals is easy'
                },
                'Question 2',
                'Question 3'
            ]

            swal.queue(steps).then(function (result) {
                swal.resetDefaults()
                swal({
                    title: 'All done!',
                    html: 'Your answers: <pre>' +
                    JSON.stringify(result) +
                    '</pre>',
                    confirmButtonText: 'Lovely!',
                    showCancelButton: false
                })
            }, function () {
                swal.resetDefaults()
            })
        });

        //Danger
        $('#dynamic-alert').click(function () {
            swal.queue([{
                title: 'Your public IP',
                confirmButtonText: 'Show my public IP',
                text: 'Your public IP will be received ' +
                'via AJAX request',
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        $.get('https://api.ipify.org?format=json')
                            .done(function (data) {
                                swal.insertQueueStep(data.ip)
                                resolve()
                            })
                    })
                }
            }])
        });


    },
        //init
        $.SweetAlert = new SweetAlert, $.SweetAlert.Constructor = SweetAlert
}(window.jQuery),

//initializing
    function ($) {
        "use strict";
        $.SweetAlert.init()
    }(window.jQuery);
// 4.2.6 (2015-09-28)
!function(e,t){"use strict";function n(e,t){for(var n,r=[],i=0;i<e.length;++i){if(n=s[e[i]]||o(e[i]),!n)throw"module definition dependecy not found: "+e[i];r.push(n)}t.apply(null,r)}function r(e,r,i){if("string"!=typeof e)throw"invalid module definition, module id must be defined and be a string";if(r===t)throw"invalid module definition, dependencies must be specified";if(i===t)throw"invalid module definition, definition function must be specified";n(r,function(){s[e]=i.apply(null,arguments)})}function i(e){return!!s[e]}function o(t){for(var n=e,r=t.split(/[.\/]/),i=0;i<r.length;++i){if(!n[r[i]])return;n=n[r[i]]}return n}function a(n){var r,i,o,a,l;for(r=0;r<n.length;r++){i=e,o=n[r],a=o.split(/[.\/]/);for(var c=0;c<a.length-1;++c)i[a[c]]===t&&(i[a[c]]={}),i=i[a[c]];i[a[a.length-1]]=s[o]}if(e.AMDLC_TESTS){l=e.privateModules||{};for(o in s)l[o]=s[o];for(r=0;r<n.length;r++)delete l[n[r]];e.privateModules=l}}var s={},l="tinymce/dom/EventUtils",c="tinymce/dom/Sizzle",u="tinymce/Env",d="tinymce/util/Arr",f="tinymce/util/Tools",h="tinymce/dom/DomQuery",p="tinymce/html/Styles",m="tinymce/dom/TreeWalker",g="tinymce/dom/Range",v="tinymce/html/Entities",y="tinymce/dom/StyleSheetLoader",b="tinymce/dom/DOMUtils",x="tinymce/dom/ScriptLoader",C="tinymce/AddOnManager",w="tinymce/dom/RangeUtils",_="tinymce/NodeChange",E="tinymce/html/Node",N="tinymce/html/Schema",k="tinymce/html/SaxParser",S="tinymce/html/DomParser",T="tinymce/html/Writer",R="tinymce/html/Serializer",A="tinymce/dom/Serializer",B="tinymce/dom/TridentSelection",D="tinymce/util/VK",M="tinymce/dom/ControlSelection",H="tinymce/dom/BookmarkManager",L="tinymce/dom/Selection",P="tinymce/dom/ElementUtils",O="tinymce/fmt/Preview",I="tinymce/Formatter",F="tinymce/UndoManager",z="tinymce/EnterKey",W="tinymce/ForceBlocks",V="tinymce/EditorCommands",U="tinymce/util/URI",$="tinymce/util/Class",q="tinymce/util/EventDispatcher",j="tinymce/data/Binding",K="tinymce/util/Observable",Y="tinymce/data/ObservableObject",G="tinymce/ui/Selector",X="tinymce/ui/Collection",J="tinymce/ui/DomUtils",Q="tinymce/ui/BoxUtils",Z="tinymce/ui/ClassList",ee="tinymce/ui/ReflowQueue",te="tinymce/ui/Control",ne="tinymce/ui/Factory",re="tinymce/ui/KeyboardNavigation",ie="tinymce/ui/Container",oe="tinymce/ui/DragHelper",ae="tinymce/ui/Scrollable",se="tinymce/ui/Panel",le="tinymce/ui/Movable",ce="tinymce/ui/Resizable",ue="tinymce/ui/FloatPanel",de="tinymce/ui/Window",fe="tinymce/ui/MessageBox",he="tinymce/WindowManager",pe="tinymce/util/Quirks",me="tinymce/EditorObservable",ge="tinymce/Shortcuts",ve="tinymce/util/Promise",ye="tinymce/util/Fun",be="tinymce/file/Uploader",xe="tinymce/file/Conversions",Ce="tinymce/file/ImageScanner",we="tinymce/file/BlobCache",_e="tinymce/EditorUpload",Ee="tinymce/Editor",Ne="tinymce/util/I18n",ke="tinymce/FocusManager",Se="tinymce/EditorManager",Te="tinymce/LegacyInput",Re="tinymce/util/XHR",Ae="tinymce/util/JSON",Be="tinymce/util/JSONRequest",De="tinymce/util/JSONP",Me="tinymce/util/LocalStorage",He="tinymce/Compat",Le="tinymce/ui/Layout",Pe="tinymce/ui/AbsoluteLayout",Oe="tinymce/ui/Tooltip",Ie="tinymce/ui/Widget",Fe="tinymce/ui/Button",ze="tinymce/ui/ButtonGroup",We="tinymce/ui/Checkbox",Ve="tinymce/ui/ComboBox",Ue="tinymce/ui/ColorBox",$e="tinymce/ui/PanelButton",qe="tinymce/ui/ColorButton",je="tinymce/util/Color",Ke="tinymce/ui/ColorPicker",Ye="tinymce/ui/Path",Ge="tinymce/ui/ElementPath",Xe="tinymce/ui/FormItem",Je="tinymce/ui/Form",Qe="tinymce/ui/FieldSet",Ze="tinymce/ui/FilePicker",et="tinymce/ui/FitLayout",tt="tinymce/ui/FlexLayout",nt="tinymce/ui/FlowLayout",rt="tinymce/ui/FormatControls",it="tinymce/ui/GridLayout",ot="tinymce/ui/Iframe",at="tinymce/ui/Label",st="tinymce/ui/Toolbar",lt="tinymce/ui/MenuBar",ct="tinymce/ui/MenuButton",ut="tinymce/ui/MenuItem",dt="tinymce/ui/Menu",ft="tinymce/ui/ListBox",ht="tinymce/ui/Radio",pt="tinymce/ui/Rect",mt="tinymce/ui/ResizeHandle",gt="tinymce/ui/Slider",vt="tinymce/ui/Spacer",yt="tinymce/ui/SplitButton",bt="tinymce/ui/StackLayout",xt="tinymce/ui/TabPanel",Ct="tinymce/ui/TextBox",wt="tinymce/ui/Throbber";r(l,[],function(){function e(e,t,n,r){e.addEventListener?e.addEventListener(t,n,r||!1):e.attachEvent&&e.attachEvent("on"+t,n)}function t(e,t,n,r){e.removeEventListener?e.removeEventListener(t,n,r||!1):e.detachEvent&&e.detachEvent("on"+t,n)}function n(e,t){function n(){return!1}function r(){return!0}var i,o=t||{},l;for(i in e)s[i]||(o[i]=e[i]);if(o.target||(o.target=o.srcElement||document),e&&a.test(e.type)&&e.pageX===l&&e.clientX!==l){var c=o.target.ownerDocument||document,u=c.documentElement,d=c.body;o.pageX=e.clientX+(u&&u.scrollLeft||d&&d.scrollLeft||0)-(u&&u.clientLeft||d&&d.clientLeft||0),o.pageY=e.clientY+(u&&u.scrollTop||d&&d.scrollTop||0)-(u&&u.clientTop||d&&d.clientTop||0)}return o.preventDefault=function(){o.isDefaultPrevented=r,e&&(e.preventDefault?e.preventDefault():e.returnValue=!1)},o.stopPropagation=function(){o.isPropagationStopped=r,e&&(e.stopPropagation?e.stopPropagation():e.cancelBubble=!0)},o.stopImmediatePropagation=function(){o.isImmediatePropagationStopped=r,o.stopPropagation()},o.isDefaultPrevented||(o.isDefaultPrevented=n,o.isPropagationStopped=n,o.isImmediatePropagationStopped=n),"undefined"==typeof o.metaKey&&(o.metaKey=!1),o}function r(n,r,i){function o(){i.domLoaded||(i.domLoaded=!0,r(c))}function a(){("complete"===l.readyState||"interactive"===l.readyState&&l.body)&&(t(l,"readystatechange",a),o())}function s(){try{l.documentElement.doScroll("left")}catch(e){return void setTimeout(s,0)}o()}var l=n.document,c={type:"ready"};return i.domLoaded?void r(c):(l.addEventListener?"complete"===l.readyState?o():e(n,"DOMContentLoaded",o):(e(l,"readystatechange",a),l.documentElement.doScroll&&n.self===n.top&&s()),void e(n,"load",o))}function i(){function i(e,t){var n,r,i,o,a=s[t];if(n=a&&a[e.type])for(r=0,i=n.length;i>r;r++)if(o=n[r],o&&o.func.call(o.scope,e)===!1&&e.preventDefault(),e.isImmediatePropagationStopped())return}var a=this,s={},l,c,u,d,f;c=o+(+new Date).toString(32),d="onmouseenter"in document.documentElement,u="onfocusin"in document.documentElement,f={mouseenter:"mouseover",mouseleave:"mouseout"},l=1,a.domLoaded=!1,a.events=s,a.bind=function(t,o,h,p){function m(e){i(n(e||_.event),g)}var g,v,y,b,x,C,w,_=window;if(t&&3!==t.nodeType&&8!==t.nodeType){for(t[c]?g=t[c]:(g=l++,t[c]=g,s[g]={}),p=p||t,o=o.split(" "),y=o.length;y--;)b=o[y],C=m,x=w=!1,"DOMContentLoaded"===b&&(b="ready"),a.domLoaded&&"ready"===b&&"complete"==t.readyState?h.call(p,n({type:b})):(d||(x=f[b],x&&(C=function(e){var t,r;if(t=e.currentTarget,r=e.relatedTarget,r&&t.contains)r=t.contains(r);else for(;r&&r!==t;)r=r.parentNode;r||(e=n(e||_.event),e.type="mouseout"===e.type?"mouseleave":"mouseenter",e.target=t,i(e,g))})),u||"focusin"!==b&&"focusout"!==b||(w=!0,x="focusin"===b?"focus":"blur",C=function(e){e=n(e||_.event),e.type="focus"===e.type?"focusin":"focusout",i(e,g)}),v=s[g][b],v?"ready"===b&&a.domLoaded?h({type:b}):v.push({func:h,scope:p}):(s[g][b]=v=[{func:h,scope:p}],v.fakeName=x,v.capture=w,v.nativeHandler=C,"ready"===b?r(t,C,a):e(t,x||b,C,w)));return t=v=0,h}},a.unbind=function(e,n,r){var i,o,l,u,d,f;if(!e||3===e.nodeType||8===e.nodeType)return a;if(i=e[c]){if(f=s[i],n){for(n=n.split(" "),l=n.length;l--;)if(d=n[l],o=f[d]){if(r)for(u=o.length;u--;)if(o[u].func===r){var h=o.nativeHandler,p=o.fakeName,m=o.capture;o=o.slice(0,u).concat(o.slice(u+1)),o.nativeHandler=h,o.fakeName=p,o.capture=m,f[d]=o}r&&0!==o.length||(delete f[d],t(e,o.fakeName||d,o.nativeHandler,o.capture))}}else{for(d in f)o=f[d],t(e,o.fakeName||d,o.nativeHandler,o.capture);f={}}for(d in f)return a;delete s[i];try{delete e[c]}catch(g){e[c]=null}}return a},a.fire=function(e,t,r){var o;if(!e||3===e.nodeType||8===e.nodeType)return a;r=n(null,r),r.type=t,r.target=e;do o=e[c],o&&i(r,o),e=e.parentNode||e.ownerDocument||e.defaultView||e.parentWindow;while(e&&!r.isPropagationStopped());return a},a.clean=function(e){var t,n,r=a.unbind;if(!e||3===e.nodeType||8===e.nodeType)return a;if(e[c]&&r(e),e.getElementsByTagName||(e=e.document),e&&e.getElementsByTagName)for(r(e),n=e.getElementsByTagName("*"),t=n.length;t--;)e=n[t],e[c]&&r(e);return a},a.destroy=function(){s={}},a.cancel=function(e){return e&&(e.preventDefault(),e.stopImmediatePropagation()),!1}}var o="mce-data-",a=/^(?:mouse|contextmenu)|click/,s={keyLocation:1,layerX:1,layerY:1,returnValue:1,webkitMovementX:1,webkitMovementY:1};return i.Event=new i,i.Event.bind(window,"ready",function(){}),i}),r(c,[],function(){if(!window.jQuery)throw new Error("Load jQuery first");return jQuery.find}),r(u,[],function(){var e=navigator,t=e.userAgent,n,r,i,o,a,s,l,c,u,d;n=window.opera&&window.opera.buildNumber,u=/Android/.test(t),r=/WebKit/.test(t),i=!r&&!n&&/MSIE/gi.test(t)&&/Explorer/gi.test(e.appName),i=i&&/MSIE (\w+)\./.exec(t)[1],o=-1==t.indexOf("Trident/")||-1==t.indexOf("rv:")&&-1==e.appName.indexOf("Netscape")?!1:11,a=-1==t.indexOf("Edge/")||i||o?!1:12,i=i||o||a,s=!r&&!o&&/Gecko/.test(t),l=-1!=t.indexOf("Mac"),c=/(iPad|iPhone)/.test(t),d="FormData"in window&&"FileReader"in window&&"URL"in window&&!!URL.createObjectURL,a&&(r=!1);var f=!c||d||t.match(/AppleWebKit\/(\d*)/)[1]>=534;return{opera:n,webkit:r,ie:i,gecko:s,mac:l,iOS:c,android:u,contentEditable:f,transparentSrc:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",caretAfter:8!=i,range:window.getSelection&&"Range"in window,documentMode:i&&!a?document.documentMode||7:10,fileApi:d}}),r(d,[],function(){function e(e){var t=e,n,r;if(!s(e))for(t=[],n=0,r=e.length;r>n;n++)t[n]=e[n];return t}function n(e,n,r){var i,o;if(!e)return 0;if(r=r||e,e.length!==t){for(i=0,o=e.length;o>i;i++)if(n.call(r,e[i],i,e)===!1)return 0}else for(i in e)if(e.hasOwnProperty(i)&&n.call(r,e[i],i,e)===!1)return 0;return 1}function r(e,t){var r=[];return n(e,function(n,i){r.push(t(n,i,e))}),r}function i(e,t){var r=[];return n(e,function(e){(!t||t(e))&&r.push(e)}),r}function o(e,t){var n,r;if(e)for(n=0,r=e.length;r>n;n++)if(e[n]===t)return n;return-1}function a(e,t,n,r){var i=0;for(arguments.length<3&&(n=e[0],i=1);i<e.length;i++)n=t.call(r,n,e[i],i);return n}var s=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};return{isArray:s,toArray:e,each:n,map:r,filter:i,indexOf:o,reduce:a}}),r(f,[u,d],function(e,n){function r(e){return null===e||e===t?"":(""+e).replace(h,"")}function i(e,r){return r?"array"==r&&n.isArray(e)?!0:typeof e==r:e!==t}function o(e,t,n){var r;for(e=e||[],t=t||",","string"==typeof e&&(e=e.split(t)),n=n||{},r=e.length;r--;)n[e[r]]={};return n}function a(e,t,n){var r=this,i,o,a,s,l,c=0;if(e=/^((static) )?([\w.]+)(:([\w.]+))?/.exec(e),a=e[3].match(/(^|\.)(\w+)$/i)[2],o=r.createNS(e[3].replace(/\.\w+$/,""),n),!o[a]){if("static"==e[2])return o[a]=t,void(this.onCreate&&this.onCreate(e[2],e[3],o[a]));t[a]||(t[a]=function(){},c=1),o[a]=t[a],r.extend(o[a].prototype,t),e[5]&&(i=r.resolve(e[5]).prototype,s=e[5].match(/\.(\w+)$/i)[1],l=o[a],c?o[a]=function(){return i[s].apply(this,arguments)}:o[a]=function(){return this.parent=i[s],l.apply(this,arguments)},o[a].prototype[a]=o[a],r.each(i,function(e,t){o[a].prototype[t]=i[t]}),r.each(t,function(e,t){i[t]?o[a].prototype[t]=function(){return this.parent=i[t],e.apply(this,arguments)}:t!=a&&(o[a].prototype[t]=e)})),r.each(t["static"],function(e,t){o[a][t]=e})}}function s(e,n){var r,i,o,a=arguments,s;for(r=1,i=a.length;i>r;r++){n=a[r];for(o in n)n.hasOwnProperty(o)&&(s=n[o],s!==t&&(e[o]=s))}return e}function l(e,t,r,i){i=i||this,e&&(r&&(e=e[r]),n.each(e,function(e,n){return t.call(i,e,n,r)===!1?!1:void l(e,t,r,i)}))}function c(e,t){var n,r;for(t=t||window,e=e.split("."),n=0;n<e.length;n++)r=e[n],t[r]||(t[r]={}),t=t[r];return t}function u(e,t){var n,r;for(t=t||window,e=e.split("."),n=0,r=e.length;r>n&&(t=t[e[n]],t);n++);return t}function d(e,t){return!e||i(e,"array")?e:n.map(e.split(t||","),r)}function f(t){var n=e.cacheSuffix;return n&&(t+=(-1===t.indexOf("?")?"?":"&")+n),t}var h=/^\s*|\s*$/g;return{trim:r,isArray:n.isArray,is:i,toArray:n.toArray,makeMap:o,each:n.each,map:n.map,grep:n.filter,inArray:n.indexOf,extend:s,create:a,walk:l,createNS:c,resolve:u,explode:d,_addCacheSuffix:f}}),r(h,[l,c,f,u],function(e,n,r,i){function o(e){return"undefined"!=typeof e}function a(e){return"string"==typeof e}function s(e){return e&&e==e.window}function l(e,t){var n,r,i;for(t=t||w,i=t.createElement("div"),n=t.createDocumentFragment(),i.innerHTML=e;r=i.firstChild;)n.appendChild(r);return n}function c(e,t,n,r){var i;if(a(t))t=l(t,v(e[0]));else if(t.length&&!t.nodeType){if(t=f.makeArray(t),r)for(i=t.length-1;i>=0;i--)c(e,t[i],n,r);else for(i=0;i<t.length;i++)c(e,t[i],n,r);return e}if(t.nodeType)for(i=e.length;i--;)n.call(e[i],t);return e}function u(e,t){return e&&t&&-1!==(" "+e.className+" ").indexOf(" "+t+" ")}function d(e,t,n){var r,i;return t=f(t)[0],e.each(function(){var e=this;n&&r==e.parentNode?i.appendChild(e):(r=e.parentNode,i=t.cloneNode(!1),e.parentNode.insertBefore(i,e),i.appendChild(e))}),e}function f(e,t){return new f.fn.init(e,t)}function h(e,t){var n;if(t.indexOf)return t.indexOf(e);for(n=t.length;n--;)if(t[n]===e)return n;return-1}function p(e){return null===e||e===S?"":(""+e).replace(L,"")}function m(e,t){var n,r,i,o,a;if(e)if(n=e.length,n===o){for(r in e)if(e.hasOwnProperty(r)&&(a=e[r],t.call(a,r,a)===!1))break}else for(i=0;n>i&&(a=e[i],t.call(a,i,a)!==!1);i++);return e}function g(e,t){var n=[];return m(e,function(e,r){t(r,e)&&n.push(r)}),n}function v(e){return e?9==e.nodeType?e:e.ownerDocument:w}function y(e,n,r){var i=[],o=e[n];for("string"!=typeof r&&r instanceof f&&(r=r[0]);o&&9!==o.nodeType;){if(r!==t){if(o===r)break;if("string"==typeof r&&f(o).is(r))break}1===o.nodeType&&i.push(o),o=o[n]}return i}function b(e,n,r,i){var o=[];for(i instanceof f&&(i=i[0]);e;e=e[n])if(!r||e.nodeType===r){if(i!==t){if(e===i)break;if("string"==typeof i&&f(e).is(i))break}o.push(e)}return o}function x(e,t,n){for(e=e[t];e;e=e[t])if(e.nodeType==n)return e;return null}function C(e,t,n){m(n,function(n,r){e[n]=e[n]||{},e[n][t]=r})}var w=document,_=Array.prototype.push,E=Array.prototype.slice,N=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,k=e.Event,S,T=r.makeMap("children,contents,next,prev"),R=r.makeMap("fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom"," "),A=r.makeMap("checked compact declare defer disabled ismap multiple nohref noshade nowrap readonly selected"," "),B={"for":"htmlFor","class":"className",readonly:"readOnly"},D={"float":"cssFloat"},M={},H={},L=/^\s*|\s*$/g;return f.fn=f.prototype={constructor:f,selector:"",context:null,length:0,init:function(e,t){var n=this,r,i;if(!e)return n;if(e.nodeType)return n.context=n[0]=e,n.length=1,n;if(t&&t.nodeType)n.context=t;else{if(t)return f(e).attr(t);n.context=t=document}if(a(e)){if(n.selector=e,r="<"===e.charAt(0)&&">"===e.charAt(e.length-1)&&e.length>=3?[null,e,null]:N.exec(e),!r)return f(t).find(e);if(r[1])for(i=l(e,v(t)).firstChild;i;)_.call(n,i),i=i.nextSibling;else{if(i=v(t).getElementById(r[2]),!i)return n;if(i.id!==r[2])return n.find(e);n.length=1,n[0]=i}}else this.add(e,!1);return n},toArray:function(){return r.toArray(this)},add:function(e,t){var n=this,r,i;if(a(e))return n.add(f(e));if(t!==!1)for(r=f.unique(n.toArray().concat(f.makeArray(e))),n.length=r.length,i=0;i<r.length;i++)n[i]=r[i];else _.apply(n,f.makeArray(e));return n},attr:function(e,t){var n=this,r;if("object"==typeof e)m(e,function(e,t){n.attr(e,t)});else{if(!o(t)){if(n[0]&&1===n[0].nodeType){if(r=M[e],r&&r.get)return r.get(n[0],e);if(A[e])return n.prop(e)?e:S;t=n[0].getAttribute(e,2),null===t&&(t=S)}return t}this.each(function(){var n;if(1===this.nodeType){if(n=M[e],n&&n.set)return void n.set(this,t);null===t?this.removeAttribute(e,2):this.setAttribute(e,t,2)}})}return n},removeAttr:function(e){return this.attr(e,null)},prop:function(e,t){var n=this;if(e=B[e]||e,"object"==typeof e)m(e,function(e,t){n.prop(e,t)});else{if(!o(t))return n[0]&&n[0].nodeType&&e in n[0]?n[0][e]:t;this.each(function(){1==this.nodeType&&(this[e]=t)})}return n},css:function(e,t){function n(e){return e.replace(/-(\D)/g,function(e,t){return t.toUpperCase()})}function r(e){return e.replace(/[A-Z]/g,function(e){return"-"+e})}var i=this,a,s;if("object"==typeof e)m(e,function(e,t){i.css(e,t)});else if(o(t))e=n(e),"number"!=typeof t||R[e]||(t+="px"),i.each(function(){var n=this.style;if(s=H[e],s&&s.set)return void s.set(this,t);try{this.style[D[e]||e]=t}catch(i){}(null===t||""===t)&&(n.removeProperty?n.removeProperty(r(e)):n.removeAttribute(e))});else{if(a=i[0],s=H[e],s&&s.get)return s.get(a);if(a.ownerDocument.defaultView)try{return a.ownerDocument.defaultView.getComputedStyle(a,null).getPropertyValue(r(e))}catch(l){return S}else if(a.currentStyle)return a.currentStyle[n(e)]}return i},remove:function(){for(var e=this,t,n=this.length;n--;)t=e[n],k.clean(t),t.parentNode&&t.parentNode.removeChild(t);return this},empty:function(){for(var e=this,t,n=this.length;n--;)for(t=e[n];t.firstChild;)t.removeChild(t.firstChild);return this},html:function(e){var t=this,n;if(o(e)){n=t.length;try{for(;n--;)t[n].innerHTML=e}catch(r){f(t[n]).empty().append(e)}return t}return t[0]?t[0].innerHTML:""},text:function(e){var t=this,n;if(o(e)){for(n=t.length;n--;)"innerText"in t[n]?t[n].innerText=e:t[0].textContent=e;return t}return t[0]?t[0].innerText||t[0].textContent:""},append:function(){return c(this,arguments,function(e){1===this.nodeType&&this.appendChild(e)})},prepend:function(){return c(this,arguments,function(e){1===this.nodeType&&this.insertBefore(e,this.firstChild)},!0)},before:function(){var e=this;return e[0]&&e[0].parentNode?c(e,arguments,function(e){this.parentNode.insertBefore(e,this)}):e},after:function(){var e=this;return e[0]&&e[0].parentNode?c(e,arguments,function(e){this.parentNode.insertBefore(e,this.nextSibling)},!0):e},appendTo:function(e){return f(e).append(this),this},prependTo:function(e){return f(e).prepend(this),this},replaceWith:function(e){return this.before(e).remove()},wrap:function(e){return d(this,e)},wrapAll:function(e){return d(this,e,!0)},wrapInner:function(e){return this.each(function(){f(this).contents().wrapAll(e)}),this},unwrap:function(){return this.parent().each(function(){f(this).replaceWith(this.childNodes)})},clone:function(){var e=[];return this.each(function(){e.push(this.cloneNode(!0))}),f(e)},addClass:function(e){return this.toggleClass(e,!0)},removeClass:function(e){return this.toggleClass(e,!1)},toggleClass:function(e,t){var n=this;return"string"!=typeof e?n:(-1!==e.indexOf(" ")?m(e.split(" "),function(){n.toggleClass(this,t)}):n.each(function(n,r){var i,o;o=u(r,e),o!==t&&(i=r.className,o?r.className=p((" "+i+" ").replace(" "+e+" "," ")):r.className+=i?" "+e:e)}),n)},hasClass:function(e){return u(this[0],e)},each:function(e){return m(this,e)},on:function(e,t){return this.each(function(){k.bind(this,e,t)})},off:function(e,t){return this.each(function(){k.unbind(this,e,t)})},trigger:function(e){return this.each(function(){"object"==typeof e?k.fire(this,e.type,e):k.fire(this,e)})},show:function(){return this.css("display","")},hide:function(){return this.css("display","none")},slice:function(){return new f(E.apply(this,arguments))},eq:function(e){return-1===e?this.slice(e):this.slice(e,+e+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},find:function(e){var t,n,r=[];for(t=0,n=this.length;n>t;t++)f.find(e,this[t],r);return f(r)},filter:function(e){return f("function"==typeof e?g(this.toArray(),function(t,n){return e(n,t)}):f.filter(e,this.toArray()))},closest:function(e){var t=[];return e instanceof f&&(e=e[0]),this.each(function(n,r){for(;r;){if("string"==typeof e&&f(r).is(e)){t.push(r);break}if(r==e){t.push(r);break}r=r.parentNode}}),f(t)},offset:function(e){var t,n,r,i=0,o=0,a;return e?this.css(e):(t=this[0],t&&(n=t.ownerDocument,r=n.documentElement,t.getBoundingClientRect&&(a=t.getBoundingClientRect(),i=a.left+(r.scrollLeft||n.body.scrollLeft)-r.clientLeft,o=a.top+(r.scrollTop||n.body.scrollTop)-r.clientTop)),{left:i,top:o})},push:_,sort:[].sort,splice:[].splice},r.extend(f,{extend:r.extend,makeArray:function(e){return s(e)||e.nodeType?[e]:r.toArray(e)},inArray:h,isArray:r.isArray,each:m,trim:p,grep:g,find:n,expr:n.selectors,unique:n.uniqueSort,text:n.getText,contains:n.contains,filter:function(e,t,n){var r=t.length;for(n&&(e=":not("+e+")");r--;)1!=t[r].nodeType&&t.splice(r,1);return t=1===t.length?f.find.matchesSelector(t[0],e)?[t[0]]:[]:f.find.matches(e,t)}}),m({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return y(e,"parentNode")},next:function(e){return x(e,"nextSibling",1)},prev:function(e){return x(e,"previousSibling",1)},children:function(e){return b(e.firstChild,"nextSibling",1)},contents:function(e){return r.toArray(("iframe"===e.nodeName?e.contentDocument||e.contentWindow.document:e).childNodes)}},function(e,t){f.fn[e]=function(n){var r=this,i=[];return r.each(function(){var e=t.call(i,this,n,i);e&&(f.isArray(e)?i.push.apply(i,e):i.push(e))}),this.length>1&&(T[e]||(i=f.unique(i)),0===e.indexOf("parents")&&(i=i.reverse())),i=f(i),n?i.filter(n):i}}),m({parentsUntil:function(e,t){return y(e,"parentNode",t)},nextUntil:function(e,t){return b(e,"nextSibling",1,t).slice(1)},prevUntil:function(e,t){return b(e,"previousSibling",1,t).slice(1)}},function(e,t){f.fn[e]=function(n,r){var i=this,o=[];return i.each(function(){var e=t.call(o,this,n,o);e&&(f.isArray(e)?o.push.apply(o,e):o.push(e))}),this.length>1&&(o=f.unique(o),(0===e.indexOf("parents")||"prevUntil"===e)&&(o=o.reverse())),o=f(o),r?o.filter(r):o}}),f.fn.is=function(e){return!!e&&this.filter(e).length>0},f.fn.init.prototype=f.fn,f.overrideDefaults=function(e){function t(r,i){return n=n||e(),0===arguments.length&&(r=n.element),i||(i=n.context),new t.fn.init(r,i)}var n;return f.extend(t,this),t},i.ie&&i.ie<8&&(C(M,"get",{maxlength:function(e){var t=e.maxLength;return 2147483647===t?S:t},size:function(e){var t=e.size;return 20===t?S:t},"class":function(e){return e.className},style:function(e){var t=e.style.cssText;return 0===t.length?S:t}}),C(M,"set",{"class":function(e,t){e.className=t},style:function(e,t){e.style.cssText=t}})),i.ie&&i.ie<9&&(D["float"]="styleFloat",C(H,"set",{opacity:function(e,t){var n=e.style;null===t||""===t?n.removeAttribute("filter"):(n.zoom=1,n.filter="alpha(opacity="+100*t+")")}})),f.attrHooks=M,f.cssHooks=H,f}),r(p,[],function(){return function(e,t){function n(e,t,n,r){function i(e){return e=parseInt(e,10).toString(16),e.length>1?e:"0"+e}return"#"+i(t)+i(n)+i(r)}var r=/rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,i=/(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,o=/\s*([^:]+):\s*([^;]+);?/g,a=/\s+$/,s,l,c={},u,d,f,h="\ufeff";for(e=e||{},t&&(d=t.getValidStyles(),f=t.getInvalidStyles()),u=("\\\" \\' \\; \\: ; : "+h).split(" "),l=0;l<u.length;l++)c[u[l]]=h+l,c[h+l]=u[l];return{toHex:function(e){return e.replace(r,n)},parse:function(t){function s(e,t,n){var r,i,o,a;if(r=m[e+"-top"+t],r&&(i=m[e+"-right"+t],i&&(o=m[e+"-bottom"+t],o&&(a=m[e+"-left"+t])))){var s=[r,i,o,a];for(l=s.length-1;l--&&s[l]===s[l+1];);l>-1&&n||(m[e+t]=-1==l?s[0]:s.join(" "),delete m[e+"-top"+t],delete m[e+"-right"+t],delete m[e+"-bottom"+t],delete m[e+"-left"+t])}}function u(e){var t=m[e],n;if(t){for(t=t.split(" "),n=t.length;n--;)if(t[n]!==t[0])return!1;return m[e]=t[0],!0}}function d(e,t,n,r){u(t)&&u(n)&&u(r)&&(m[e]=m[t]+" "+m[n]+" "+m[r],delete m[t],delete m[n],delete m[r])}function f(e){return b=!0,c[e]}function h(e,t){return b&&(e=e.replace(/\uFEFF[0-9]/g,function(e){return c[e]})),t||(e=e.replace(/\\([\'\";:])/g,"$1")),e}function p(t,n,r,i,o,a){if(o=o||a)return o=h(o),"'"+o.replace(/\'/g,"\\'")+"'";if(n=h(n||r||i),!e.allow_script_urls){var s=n.replace(/[\s\r\n]+/,"");if(/(java|vb)script:/i.test(s))return"";if(!e.allow_svg_data_urls&&/^data:image\/svg/i.test(s))return""}return x&&(n=x.call(C,n,"style")),"url('"+n.replace(/\'/g,"\\'")+"')"}var m={},g,v,y,b,x=e.url_converter,C=e.url_converter_scope||this;if(t){for(t=t.replace(/[\u0000-\u001F]/g,""),t=t.replace(/\\[\"\';:\uFEFF]/g,f).replace(/\"[^\"]+\"|\'[^\']+\'/g,function(e){return e.replace(/[;:]/g,f)});g=o.exec(t);){if(v=g[1].replace(a,"").toLowerCase(),y=g[2].replace(a,""),y=y.replace(/\\[0-9a-f]+/g,function(e){return String.fromCharCode(parseInt(e.substr(1),16))}),v&&y.length>0){if(!e.allow_script_urls&&("behavior"==v||/expression\s*\(|\/\*|\*\//.test(y)))continue;"font-weight"===v&&"700"===y?y="bold":("color"===v||"background-color"===v)&&(y=y.toLowerCase()),y=y.replace(r,n),y=y.replace(i,p),m[v]=b?h(y,!0):y}o.lastIndex=g.index+g[0].length}s("border","",!0),s("border","-width"),s("border","-color"),s("border","-style"),s("padding",""),s("margin",""),d("border","border-width","border-style","border-color"),"medium none"===m.border&&delete m.border,"none"===m["border-image"]&&delete m["border-image"]}return m},serialize:function(e,t){function n(t){var n,r,o,a;if(n=d[t])for(r=0,o=n.length;o>r;r++)t=n[r],a=e[t],a!==s&&a.length>0&&(i+=(i.length>0?" ":"")+t+": "+a+";")}function r(e,t){var n;return n=f["*"],n&&n[e]?!1:(n=f[t],n&&n[e]?!1:!0)}var i="",o,a;if(t&&d)n("*"),n(t);else for(o in e)a=e[o],a!==s&&a.length>0&&(!f||r(o,t))&&(i+=(i.length>0?" ":"")+o+": "+a+";");return i}}}}),r(m,[],function(){return function(e,t){function n(e,n,r,i){var o,a;if(e){if(!i&&e[n])return e[n];if(e!=t){if(o=e[r])return o;for(a=e.parentNode;a&&a!=t;a=a.parentNode)if(o=a[r])return o}}}var r=e;this.current=function(){return r},this.next=function(e){return r=n(r,"firstChild","nextSibling",e)},this.prev=function(e){return r=n(r,"lastChild","previousSibling",e)}}}),r(g,[f],function(e){function t(n){function r(){return L.createDocumentFragment()}function i(e,t){_(F,e,t)}function o(e,t){_(z,e,t)}function a(e){i(e.parentNode,j(e))}function s(e){i(e.parentNode,j(e)+1)}function l(e){o(e.parentNode,j(e))}function c(e){o(e.parentNode,j(e)+1)}function u(e){e?(H[U]=H[V],H[$]=H[W]):(H[V]=H[U],H[W]=H[$]),H.collapsed=F}function d(e){a(e),c(e)}function f(e){i(e,0),o(e,1===e.nodeType?e.childNodes.length:e.nodeValue.length)}function h(e,t){var n=H[V],r=H[W],i=H[U],o=H[$],a=t.startContainer,s=t.startOffset,l=t.endContainer,c=t.endOffset;return 0===e?w(n,r,a,s):1===e?w(i,o,a,s):2===e?w(i,o,l,c):3===e?w(n,r,l,c):void 0}function p(){E(I)}function m(){return E(P)}function g(){return E(O)}function v(e){var t=this[V],r=this[W],i,o;3!==t.nodeType&&4!==t.nodeType||!t.nodeValue?(t.childNodes.length>0&&(o=t.childNodes[r]),o?t.insertBefore(e,o):3==t.nodeType?n.insertAfter(e,t):t.appendChild(e)):r?r>=t.nodeValue.length?n.insertAfter(e,t):(i=t.splitText(r),t.parentNode.insertBefore(e,i)):t.parentNode.insertBefore(e,t)}function y(e){var t=H.extractContents();H.insertNode(e),e.appendChild(t),H.selectNode(e)}function b(){return q(new t(n),{startContainer:H[V],startOffset:H[W],endContainer:H[U],endOffset:H[$],collapsed:H.collapsed,commonAncestorContainer:H.commonAncestorContainer})}function x(e,t){var n;if(3==e.nodeType)return e;if(0>t)return e;for(n=e.firstChild;n&&t>0;)--t,n=n.nextSibling;return n?n:e}function C(){return H[V]==H[U]&&H[W]==H[$]}function w(e,t,r,i){var o,a,s,l,c,u;if(e==r)return t==i?0:i>t?-1:1;for(o=r;o&&o.parentNode!=e;)o=o.parentNode;if(o){for(a=0,s=e.firstChild;s!=o&&t>a;)a++,s=s.nextSibling;return a>=t?-1:1}for(o=e;o&&o.parentNode!=r;)o=o.parentNode;if(o){for(a=0,s=r.firstChild;s!=o&&i>a;)a++,s=s.nextSibling;return i>a?-1:1}for(l=n.findCommonAncestor(e,r),c=e;c&&c.parentNode!=l;)c=c.parentNode;for(c||(c=l),u=r;u&&u.parentNode!=l;)u=u.parentNode;if(u||(u=l),c==u)return 0;for(s=l.firstChild;s;){if(s==c)return-1;if(s==u)return 1;s=s.nextSibling}}function _(e,t,r){var i,o;for(e?(H[V]=t,H[W]=r):(H[U]=t,H[$]=r),i=H[U];i.parentNode;)i=i.parentNode;for(o=H[V];o.parentNode;)o=o.parentNode;o==i?w(H[V],H[W],H[U],H[$])>0&&H.collapse(e):H.collapse(e),H.collapsed=C(),H.commonAncestorContainer=n.findCommonAncestor(H[V],H[U])}function E(e){var t,n=0,r=0,i,o,a,s,l,c;if(H[V]==H[U])return N(e);for(t=H[U],i=t.parentNode;i;t=i,i=i.parentNode){if(i==H[V])return k(t,e);++n}for(t=H[V],i=t.parentNode;i;t=i,i=i.parentNode){if(i==H[U])return S(t,e);++r}for(o=r-n,a=H[V];o>0;)a=a.parentNode,o--;for(s=H[U];0>o;)s=s.parentNode,o++;for(l=a.parentNode,c=s.parentNode;l!=c;l=l.parentNode,c=c.parentNode)a=l,s=c;return T(a,s,e)}function N(e){var t,n,i,o,a,s,l,c,u;if(e!=I&&(t=r()),H[W]==H[$])return t;if(3==H[V].nodeType){if(n=H[V].nodeValue,i=n.substring(H[W],H[$]),e!=O&&(o=H[V],c=H[W],u=H[$]-H[W],0===c&&u>=o.nodeValue.length-1?o.parentNode.removeChild(o):o.deleteData(c,u),H.collapse(F)),e==I)return;return i.length>0&&t.appendChild(L.createTextNode(i)),t}for(o=x(H[V],H[W]),a=H[$]-H[W];o&&a>0;)s=o.nextSibling,l=D(o,e),t&&t.appendChild(l),--a,o=s;return e!=O&&H.collapse(F),t}function k(e,t){var n,i,o,a,s,l;if(t!=I&&(n=r()),i=R(e,t),n&&n.appendChild(i),o=j(e),a=o-H[W],0>=a)return t!=O&&(H.setEndBefore(e),H.collapse(z)),n;for(i=e.previousSibling;a>0;)s=i.previousSibling,l=D(i,t),n&&n.insertBefore(l,n.firstChild),--a,i=s;return t!=O&&(H.setEndBefore(e),H.collapse(z)),n}function S(e,t){var n,i,o,a,s,l;for(t!=I&&(n=r()),o=A(e,t),n&&n.appendChild(o),i=j(e),++i,a=H[$]-i,o=e.nextSibling;o&&a>0;)s=o.nextSibling,l=D(o,t),n&&n.appendChild(l),--a,o=s;return t!=O&&(H.setStartAfter(e),H.collapse(F)),n}function T(e,t,n){var i,o,a,s,l,c,u;for(n!=I&&(o=r()),i=A(e,n),o&&o.appendChild(i),a=j(e),s=j(t),++a,l=s-a,c=e.nextSibling;l>0;)u=c.nextSibling,i=D(c,n),o&&o.appendChild(i),c=u,--l;return i=R(t,n),o&&o.appendChild(i),n!=O&&(H.setStartAfter(e),H.collapse(F)),o}function R(e,t){var n=x(H[U],H[$]-1),r,i,o,a,s,l=n!=H[U];if(n==e)return B(n,l,z,t);for(r=n.parentNode,i=B(r,z,z,t);r;){for(;n;)o=n.previousSibling,a=B(n,l,z,t),t!=I&&i.insertBefore(a,i.firstChild),l=F,n=o;if(r==e)return i;n=r.previousSibling,r=r.parentNode,s=B(r,z,z,t),t!=I&&s.appendChild(i),i=s}}function A(e,t){var n=x(H[V],H[W]),r=n!=H[V],i,o,a,s,l;if(n==e)return B(n,r,F,t);for(i=n.parentNode,o=B(i,z,F,t);i;){for(;n;)a=n.nextSibling,s=B(n,r,F,t),t!=I&&o.appendChild(s),r=F,n=a;if(i==e)return o;n=i.nextSibling,i=i.parentNode,l=B(i,z,F,t),t!=I&&l.appendChild(o),o=l}}function B(e,t,r,i){var o,a,s,l,c;if(t)return D(e,i);if(3==e.nodeType){if(o=e.nodeValue,r?(l=H[W],a=o.substring(l),s=o.substring(0,l)):(l=H[$],a=o.substring(0,l),s=o.substring(l)),i!=O&&(e.nodeValue=s),i==I)return;return c=n.clone(e,z),c.nodeValue=a,c}if(i!=I)return n.clone(e,z)}function D(e,t){return t!=I?t==O?n.clone(e,F):e:void e.parentNode.removeChild(e)}function M(){return n.create("body",null,g()).outerText}var H=this,L=n.doc,P=0,O=1,I=2,F=!0,z=!1,W="startOffset",V="startContainer",U="endContainer",$="endOffset",q=e.extend,j=n.nodeIndex;return q(H,{startContainer:L,startOffset:0,endContainer:L,endOffset:0,collapsed:F,commonAncestorContainer:L,START_TO_START:0,START_TO_END:1,END_TO_END:2,END_TO_START:3,setStart:i,setEnd:o,setStartBefore:a,setStartAfter:s,setEndBefore:l,setEndAfter:c,collapse:u,selectNode:d,selectNodeContents:f,compareBoundaryPoints:h,deleteContents:p,extractContents:m,cloneContents:g,insertNode:v,surroundContents:y,cloneRange:b,toStringIE:M}),H}return t.prototype.toString=function(){return this.toStringIE()},t}),r(v,[f],function(e){function t(e){var t;return t=document.createElement("div"),t.innerHTML=e,t.textContent||t.innerText||e}function n(e,t){var n,r,i,a={};if(e){for(e=e.split(","),t=t||10,n=0;n<e.length;n+=2)r=String.fromCharCode(parseInt(e[n],t)),o[r]||(i="&"+e[n+1]+";",a[r]=i,a[i]=r);return a}}var r=e.makeMap,i,o,a,s=/[&<>\"\u0060\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,l=/[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,c=/[<>&\"\']/g,u=/&#([a-z0-9]+);?|&([a-z0-9]+);/gi,d={128:"\u20ac",130:"\u201a",131:"\u0192",132:"\u201e",133:"\u2026",134:"\u2020",135:"\u2021",136:"\u02c6",137:"\u2030",138:"\u0160",139:"\u2039",140:"\u0152",142:"\u017d",145:"\u2018",146:"\u2019",147:"\u201c",148:"\u201d",149:"\u2022",150:"\u2013",151:"\u2014",152:"\u02dc",153:"\u2122",154:"\u0161",155:"\u203a",156:"\u0153",
158:"\u017e",159:"\u0178"};o={'"':"&quot;","'":"&#39;","<":"&lt;",">":"&gt;","&":"&amp;","`":"&#96;"},a={"&lt;":"<","&gt;":">","&amp;":"&","&quot;":'"',"&apos;":"'"},i=n("50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,t9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro",32);var f={encodeRaw:function(e,t){return e.replace(t?s:l,function(e){return o[e]||e})},encodeAllRaw:function(e){return(""+e).replace(c,function(e){return o[e]||e})},encodeNumeric:function(e,t){return e.replace(t?s:l,function(e){return e.length>1?"&#"+(1024*(e.charCodeAt(0)-55296)+(e.charCodeAt(1)-56320)+65536)+";":o[e]||"&#"+e.charCodeAt(0)+";"})},encodeNamed:function(e,t,n){return n=n||i,e.replace(t?s:l,function(e){return o[e]||n[e]||e})},getEncodeFunc:function(e,t){function a(e,n){return e.replace(n?s:l,function(e){return o[e]||t[e]||"&#"+e.charCodeAt(0)+";"||e})}function c(e,n){return f.encodeNamed(e,n,t)}return t=n(t)||i,e=r(e.replace(/\+/g,",")),e.named&&e.numeric?a:e.named?t?c:f.encodeNamed:e.numeric?f.encodeNumeric:f.encodeRaw},decode:function(e){return e.replace(u,function(e,n){return n?(n="x"===n.charAt(0).toLowerCase()?parseInt(n.substr(1),16):parseInt(n,10),n>65535?(n-=65536,String.fromCharCode(55296+(n>>10),56320+(1023&n))):d[n]||String.fromCharCode(n)):a[e]||i[e]||t(e)})}};return f}),r(y,[f],function(e){return function(t,n){function r(e){t.getElementsByTagName("head")[0].appendChild(e)}function i(n,i,l){function c(){for(var e=y.passed,t=e.length;t--;)e[t]();y.status=2,y.passed=[],y.failed=[]}function u(){for(var e=y.failed,t=e.length;t--;)e[t]();y.status=3,y.passed=[],y.failed=[]}function d(){var e=navigator.userAgent.match(/WebKit\/(\d*)/);return!!(e&&e[1]<536)}function f(e,t){e()||((new Date).getTime()-v<s?window.setTimeout(t,0):u())}function h(){f(function(){for(var e=t.styleSheets,n,r=e.length,i;r--;)if(n=e[r],i=n.ownerNode?n.ownerNode:n.owningElement,i&&i.id===m.id)return c(),!0},h)}function p(){f(function(){try{var e=g.sheet.cssRules;return c(),!!e}catch(t){}},p)}var m,g,v,y;if(n=e._addCacheSuffix(n),a[n]?y=a[n]:(y={passed:[],failed:[]},a[n]=y),i&&y.passed.push(i),l&&y.failed.push(l),1!=y.status){if(2==y.status)return void c();if(3==y.status)return void u();if(y.status=1,m=t.createElement("link"),m.rel="stylesheet",m.type="text/css",m.id="u"+o++,m.async=!1,m.defer=!1,v=(new Date).getTime(),"onload"in m&&!d())m.onload=h,m.onerror=u;else{if(navigator.userAgent.indexOf("Firefox")>0)return g=t.createElement("style"),g.textContent='@import "'+n+'"',p(),void r(g);h()}r(m),m.href=n}}var o=0,a={},s;n=n||{},s=n.maxLoadTime||5e3,this.load=i}}),r(b,[c,h,p,l,m,g,v,u,f,y],function(e,n,r,i,o,a,s,l,c,u){function d(e,t){var n={},r=t.keep_values,i;return i={set:function(n,r,i){t.url_converter&&(r=t.url_converter.call(t.url_converter_scope||e,r,i,n[0])),n.attr("data-mce-"+i,r).attr(i,r)},get:function(e,t){return e.attr("data-mce-"+t)||e.attr(t)}},n={style:{set:function(e,t){return null!==t&&"object"==typeof t?void e.css(t):(r&&e.attr("data-mce-style",t),void e.attr("style",t))},get:function(t){var n=t.attr("data-mce-style")||t.attr("style");return n=e.serializeStyle(e.parseStyle(n),t[0].nodeName)}}},r&&(n.href=n.src=i),n}function f(e,t){var n=t.attr("style");n=e.serializeStyle(e.parseStyle(n),t[0].nodeName),n||(n=null),t.attr("data-mce-style",n)}function h(e,t){var o=this,a;o.doc=e,o.win=window,o.files={},o.counter=0,o.stdMode=!y||e.documentMode>=8,o.boxModel=!y||"CSS1Compat"==e.compatMode||o.stdMode,o.styleSheetLoader=new u(e),o.boundEvents=[],o.settings=t=t||{},o.schema=t.schema,o.styles=new r({url_converter:t.url_converter,url_converter_scope:t.url_converter_scope},t.schema),o.fixDoc(e),o.events=t.ownEvents?new i(t.proxy):i.Event,o.attrHooks=d(o,t),a=t.schema?t.schema.getBlockElements():{},o.$=n.overrideDefaults(function(){return{context:e,element:o.getRoot()}}),o.isBlock=function(e){if(!e)return!1;var t=e.nodeType;return t?!(1!==t||!a[e.nodeName]):!!a[e]}}var p=c.each,m=c.is,g=c.grep,v=c.trim,y=l.ie,b=/^([a-z0-9],?)+$/i,x=/^[ \t\r\n]*$/;return h.prototype={$$:function(e){return"string"==typeof e&&(e=this.get(e)),this.$(e)},root:null,fixDoc:function(e){var t=this.settings,n;if(y&&t.schema){"abbr article aside audio canvas details figcaption figure footer header hgroup mark menu meter nav output progress section summary time video".replace(/\w+/g,function(t){e.createElement(t)});for(n in t.schema.getCustomElements())e.createElement(n)}},clone:function(e,t){var n=this,r,i;return!y||1!==e.nodeType||t?e.cloneNode(t):(i=n.doc,t?r.firstChild:(r=i.createElement(e.nodeName),p(n.getAttribs(e),function(t){n.setAttrib(r,t.nodeName,n.getAttrib(e,t.nodeName))}),r))},getRoot:function(){var e=this;return e.settings.root_element||e.doc.body},getViewPort:function(e){var t,n;return e=e?e:this.win,t=e.document,n=this.boxModel?t.documentElement:t.body,{x:e.pageXOffset||n.scrollLeft,y:e.pageYOffset||n.scrollTop,w:e.innerWidth||n.clientWidth,h:e.innerHeight||n.clientHeight}},getRect:function(e){var t=this,n,r;return e=t.get(e),n=t.getPos(e),r=t.getSize(e),{x:n.x,y:n.y,w:r.w,h:r.h}},getSize:function(e){var t=this,n,r;return e=t.get(e),n=t.getStyle(e,"width"),r=t.getStyle(e,"height"),-1===n.indexOf("px")&&(n=0),-1===r.indexOf("px")&&(r=0),{w:parseInt(n,10)||e.offsetWidth||e.clientWidth,h:parseInt(r,10)||e.offsetHeight||e.clientHeight}},getParent:function(e,t,n){return this.getParents(e,t,n,!1)},getParents:function(e,n,r,i){var o=this,a,s=[];for(e=o.get(e),i=i===t,r=r||("BODY"!=o.getRoot().nodeName?o.getRoot().parentNode:null),m(n,"string")&&(a=n,n="*"===n?function(e){return 1==e.nodeType}:function(e){return o.is(e,a)});e&&e!=r&&e.nodeType&&9!==e.nodeType;){if(!n||n(e)){if(!i)return e;s.push(e)}e=e.parentNode}return i?s:null},get:function(e){var t;return e&&this.doc&&"string"==typeof e&&(t=e,e=this.doc.getElementById(e),e&&e.id!==t)?this.doc.getElementsByName(t)[1]:e},getNext:function(e,t){return this._findSib(e,t,"nextSibling")},getPrev:function(e,t){return this._findSib(e,t,"previousSibling")},select:function(t,n){var r=this;return e(t,r.get(n)||r.settings.root_element||r.doc,[])},is:function(n,r){var i;if(n.length===t){if("*"===r)return 1==n.nodeType;if(b.test(r)){for(r=r.toLowerCase().split(/,/),n=n.nodeName.toLowerCase(),i=r.length-1;i>=0;i--)if(r[i]==n)return!0;return!1}}if(n.nodeType&&1!=n.nodeType)return!1;var o=n.nodeType?[n]:n;return e(r,o[0].ownerDocument||o[0],null,o).length>0},add:function(e,t,n,r,i){var o=this;return this.run(e,function(e){var a;return a=m(t,"string")?o.doc.createElement(t):t,o.setAttribs(a,n),r&&(r.nodeType?a.appendChild(r):o.setHTML(a,r)),i?a:e.appendChild(a)})},create:function(e,t,n){return this.add(this.doc.createElement(e),e,t,n,1)},createHTML:function(e,t,n){var r="",i;r+="<"+e;for(i in t)t.hasOwnProperty(i)&&null!==t[i]&&"undefined"!=typeof t[i]&&(r+=" "+i+'="'+this.encode(t[i])+'"');return"undefined"!=typeof n?r+">"+n+"</"+e+">":r+" />"},createFragment:function(e){var t,n,r=this.doc,i;for(i=r.createElement("div"),t=r.createDocumentFragment(),e&&(i.innerHTML=e);n=i.firstChild;)t.appendChild(n);return t},remove:function(e,t){return e=this.$$(e),t?e.each(function(){for(var e;e=this.firstChild;)3==e.nodeType&&0===e.data.length?this.removeChild(e):this.parentNode.insertBefore(e,this)}).remove():e.remove(),e.length>1?e.toArray():e[0]},setStyle:function(e,t,n){e=this.$$(e).css(t,n),this.settings.update_styles&&f(this,e)},getStyle:function(e,n,r){return e=this.$$(e),r?e.css(n):(n=n.replace(/-(\D)/g,function(e,t){return t.toUpperCase()}),"float"==n&&(n=l.ie&&l.ie<12?"styleFloat":"cssFloat"),e[0]&&e[0].style?e[0].style[n]:t)},setStyles:function(e,t){e=this.$$(e).css(t),this.settings.update_styles&&f(this,e)},removeAllAttribs:function(e){return this.run(e,function(e){var t,n=e.attributes;for(t=n.length-1;t>=0;t--)e.removeAttributeNode(n.item(t))})},setAttrib:function(e,t,n){var r=this,i,o,a=r.settings;""===n&&(n=null),e=r.$$(e),i=e.attr(t),e.length&&(o=r.attrHooks[t],o&&o.set?o.set(e,n,t):e.attr(t,n),i!=n&&a.onSetAttrib&&a.onSetAttrib({attrElm:e,attrName:t,attrValue:n}))},setAttribs:function(e,t){var n=this;n.$$(e).each(function(e,r){p(t,function(e,t){n.setAttrib(r,t,e)})})},getAttrib:function(e,t,n){var r=this,i,o;return e=r.$$(e),e.length&&(i=r.attrHooks[t],o=i&&i.get?i.get(e,t):e.attr(t)),"undefined"==typeof o&&(o=n||""),o},getPos:function(e,t){var r=this,i=0,o=0,a,s=r.doc,l=s.body,c;if(e=r.get(e),t=t||l,e){if(t===l&&e.getBoundingClientRect&&"static"===n(l).css("position"))return c=e.getBoundingClientRect(),t=r.boxModel?s.documentElement:l,i=c.left+(s.documentElement.scrollLeft||l.scrollLeft)-t.clientLeft,o=c.top+(s.documentElement.scrollTop||l.scrollTop)-t.clientTop,{x:i,y:o};for(a=e;a&&a!=t&&a.nodeType;)i+=a.offsetLeft||0,o+=a.offsetTop||0,a=a.offsetParent;for(a=e.parentNode;a&&a!=t&&a.nodeType;)i-=a.scrollLeft||0,o-=a.scrollTop||0,a=a.parentNode}return{x:i,y:o}},parseStyle:function(e){return this.styles.parse(e)},serializeStyle:function(e,t){return this.styles.serialize(e,t)},addStyle:function(e){var t=this,n=t.doc,r,i;if(t!==h.DOM&&n===document){var o=h.DOM.addedStyles;if(o=o||[],o[e])return;o[e]=!0,h.DOM.addedStyles=o}i=n.getElementById("mceDefaultStyles"),i||(i=n.createElement("style"),i.id="mceDefaultStyles",i.type="text/css",r=n.getElementsByTagName("head")[0],r.firstChild?r.insertBefore(i,r.firstChild):r.appendChild(i)),i.styleSheet?i.styleSheet.cssText+=e:i.appendChild(n.createTextNode(e))},loadCSS:function(e){var t=this,n=t.doc,r;return t!==h.DOM&&n===document?void h.DOM.loadCSS(e):(e||(e=""),r=n.getElementsByTagName("head")[0],void p(e.split(","),function(e){var i;e=c._addCacheSuffix(e),t.files[e]||(t.files[e]=!0,i=t.create("link",{rel:"stylesheet",href:e}),y&&n.documentMode&&n.recalc&&(i.onload=function(){n.recalc&&n.recalc(),i.onload=null}),r.appendChild(i))}))},addClass:function(e,t){this.$$(e).addClass(t)},removeClass:function(e,t){this.toggleClass(e,t,!1)},hasClass:function(e,t){return this.$$(e).hasClass(t)},toggleClass:function(e,t,r){this.$$(e).toggleClass(t,r).each(function(){""===this.className&&n(this).attr("class",null)})},show:function(e){this.$$(e).show()},hide:function(e){this.$$(e).hide()},isHidden:function(e){return"none"==this.$$(e).css("display")},uniqueId:function(e){return(e?e:"mce_")+this.counter++},setHTML:function(e,t){e=this.$$(e),y?e.each(function(e,r){if(r.canHaveHTML!==!1){for(;r.firstChild;)r.removeChild(r.firstChild);try{r.innerHTML="<br>"+t,r.removeChild(r.firstChild)}catch(i){n("<div>").html("<br>"+t).contents().slice(1).appendTo(r)}return t}}):e.html(t)},getOuterHTML:function(e){return e=this.get(e),1==e.nodeType&&"outerHTML"in e?e.outerHTML:n("<div>").append(n(e).clone()).html()},setOuterHTML:function(e,t){var r=this;r.$$(e).each(function(){try{if("outerHTML"in this)return void(this.outerHTML=t)}catch(e){}r.remove(n(this).html(t),!0)})},decode:s.decode,encode:s.encodeAllRaw,insertAfter:function(e,t){return t=this.get(t),this.run(e,function(e){var n,r;return n=t.parentNode,r=t.nextSibling,r?n.insertBefore(e,r):n.appendChild(e),e})},replace:function(e,t,n){var r=this;return r.run(t,function(t){return m(t,"array")&&(e=e.cloneNode(!0)),n&&p(g(t.childNodes),function(t){e.appendChild(t)}),t.parentNode.replaceChild(e,t)})},rename:function(e,t){var n=this,r;return e.nodeName!=t.toUpperCase()&&(r=n.create(t),p(n.getAttribs(e),function(t){n.setAttrib(r,t.nodeName,n.getAttrib(e,t.nodeName))}),n.replace(r,e,1)),r||e},findCommonAncestor:function(e,t){for(var n=e,r;n;){for(r=t;r&&n!=r;)r=r.parentNode;if(n==r)break;n=n.parentNode}return!n&&e.ownerDocument?e.ownerDocument.documentElement:n},toHex:function(e){return this.styles.toHex(c.trim(e))},run:function(e,t,n){var r=this,i;return"string"==typeof e&&(e=r.get(e)),e?(n=n||this,e.nodeType||!e.length&&0!==e.length?t.call(n,e):(i=[],p(e,function(e,o){e&&("string"==typeof e&&(e=r.get(e)),i.push(t.call(n,e,o)))}),i)):!1},getAttribs:function(e){var t;if(e=this.get(e),!e)return[];if(y){if(t=[],"OBJECT"==e.nodeName)return e.attributes;"OPTION"===e.nodeName&&this.getAttrib(e,"selected")&&t.push({specified:1,nodeName:"selected"});var n=/<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi;return e.cloneNode(!1).outerHTML.replace(n,"").replace(/[\w:\-]+/gi,function(e){t.push({specified:1,nodeName:e})}),t}return e.attributes},isEmpty:function(e,t){var n=this,r,i,a,s,l,c=0;if(e=e.firstChild){s=new o(e,e.parentNode),t=t||(n.schema?n.schema.getNonEmptyElements():null);do{if(a=e.nodeType,1===a){if(e.getAttribute("data-mce-bogus"))continue;if(l=e.nodeName.toLowerCase(),t&&t[l]){if("br"===l){c++;continue}return!1}for(i=n.getAttribs(e),r=i.length;r--;)if(l=i[r].nodeName,"name"===l||"data-mce-bookmark"===l)return!1}if(8==a)return!1;if(3===a&&!x.test(e.nodeValue))return!1}while(e=s.next())}return 1>=c},createRng:function(){var e=this.doc;return e.createRange?e.createRange():new a(this)},nodeIndex:function(e,t){var n=0,r,i;if(e)for(r=e.nodeType,e=e.previousSibling;e;e=e.previousSibling)i=e.nodeType,(!t||3!=i||i!=r&&e.nodeValue.length)&&(n++,r=i);return n},split:function(e,t,n){function r(e){function t(e){var t=e.previousSibling&&"SPAN"==e.previousSibling.nodeName,n=e.nextSibling&&"SPAN"==e.nextSibling.nodeName;return t&&n}var n,o=e.childNodes,a=e.nodeType;if(1!=a||"bookmark"!=e.getAttribute("data-mce-type")){for(n=o.length-1;n>=0;n--)r(o[n]);if(9!=a){if(3==a&&e.nodeValue.length>0){var s=v(e.nodeValue).length;if(!i.isBlock(e.parentNode)||s>0||0===s&&t(e))return}else if(1==a&&(o=e.childNodes,1==o.length&&o[0]&&1==o[0].nodeType&&"bookmark"==o[0].getAttribute("data-mce-type")&&e.parentNode.insertBefore(o[0],e),o.length||/^(br|hr|input|img)$/i.test(e.nodeName)))return;i.remove(e)}return e}}var i=this,o=i.createRng(),a,s,l;return e&&t?(o.setStart(e.parentNode,i.nodeIndex(e)),o.setEnd(t.parentNode,i.nodeIndex(t)),a=o.extractContents(),o=i.createRng(),o.setStart(t.parentNode,i.nodeIndex(t)+1),o.setEnd(e.parentNode,i.nodeIndex(e)+1),s=o.extractContents(),l=e.parentNode,l.insertBefore(r(a),e),n?l.replaceChild(n,t):l.insertBefore(t,e),l.insertBefore(r(s),e),i.remove(e),n||t):void 0},bind:function(e,t,n,r){var i=this;if(c.isArray(e)){for(var o=e.length;o--;)e[o]=i.bind(e[o],t,n,r);return e}return!i.settings.collect||e!==i.doc&&e!==i.win||i.boundEvents.push([e,t,n,r]),i.events.bind(e,t,n,r||i)},unbind:function(e,t,n){var r=this,i;if(c.isArray(e)){for(i=e.length;i--;)e[i]=r.unbind(e[i],t,n);return e}if(r.boundEvents&&(e===r.doc||e===r.win))for(i=r.boundEvents.length;i--;){var o=r.boundEvents[i];e!=o[0]||t&&t!=o[1]||n&&n!=o[2]||this.events.unbind(o[0],o[1],o[2])}return this.events.unbind(e,t,n)},fire:function(e,t,n){return this.events.fire(e,t,n)},getContentEditable:function(e){var t;return e&&1==e.nodeType?(t=e.getAttribute("data-mce-contenteditable"),t&&"inherit"!==t?t:"inherit"!==e.contentEditable?e.contentEditable:null):null},getContentEditableParent:function(e){for(var t=this.getRoot(),n=null;e&&e!==t&&(n=this.getContentEditable(e),null===n);e=e.parentNode);return n},destroy:function(){var t=this;if(t.boundEvents){for(var n=t.boundEvents.length;n--;){var r=t.boundEvents[n];this.events.unbind(r[0],r[1],r[2])}t.boundEvents=null}e.setDocument&&e.setDocument(),t.win=t.doc=t.root=t.events=t.frag=null},isChildOf:function(e,t){for(;e;){if(t===e)return!0;e=e.parentNode}return!1},dumpRng:function(e){return"startContainer: "+e.startContainer.nodeName+", startOffset: "+e.startOffset+", endContainer: "+e.endContainer.nodeName+", endOffset: "+e.endOffset},_findSib:function(e,t,n){var r=this,i=t;if(e)for("string"==typeof i&&(i=function(e){return r.is(e,t)}),e=e[n];e;e=e[n])if(i(e))return e;return null}},h.DOM=new h(document),h}),r(x,[b,f],function(e,t){function n(){function e(e,n){function i(){a.remove(l),s&&(s.onreadystatechange=s.onload=s=null),n()}function o(){"undefined"!=typeof console&&console.log&&console.log("Failed to load: "+e)}var a=r,s,l;l=a.uniqueId(),s=document.createElement("script"),s.id=l,s.type="text/javascript",s.src=t._addCacheSuffix(e),"onreadystatechange"in s?s.onreadystatechange=function(){/loaded|complete/.test(s.readyState)&&i()}:s.onload=i,s.onerror=o,(document.getElementsByTagName("head")[0]||document.body).appendChild(s)}var n=0,a=1,s=2,l={},c=[],u={},d=[],f=0,h;this.isDone=function(e){return l[e]==s},this.markDone=function(e){l[e]=s},this.add=this.load=function(e,t,r){var i=l[e];i==h&&(c.push(e),l[e]=n),t&&(u[e]||(u[e]=[]),u[e].push({func:t,scope:r||this}))},this.loadQueue=function(e,t){this.loadScripts(c,e,t)},this.loadScripts=function(t,n,r){function c(e){i(u[e],function(e){e.func.call(e.scope)}),u[e]=h}var p;d.push({func:n,scope:r||this}),(p=function(){var n=o(t);t.length=0,i(n,function(t){return l[t]==s?void c(t):void(l[t]!=a&&(l[t]=a,f++,e(t,function(){l[t]=s,f--,c(t),p()})))}),f||(i(d,function(e){e.func.call(e.scope)}),d.length=0)})()}}var r=e.DOM,i=t.each,o=t.grep;return n.ScriptLoader=new n,n}),r(C,[x,f],function(e,n){function r(){var e=this;e.items=[],e.urls={},e.lookup={}}var i=n.each;return r.prototype={get:function(e){return this.lookup[e]?this.lookup[e].instance:t},dependencies:function(e){var t;return this.lookup[e]&&(t=this.lookup[e].dependencies),t||[]},requireLangPack:function(t,n){var i=r.language;if(i&&r.languageLoad!==!1){if(n)if(n=","+n+",",-1!=n.indexOf(","+i.substr(0,2)+","))i=i.substr(0,2);else if(-1==n.indexOf(","+i+","))return;e.ScriptLoader.add(this.urls[t]+"/langs/"+i+".js")}},add:function(e,t,n){return this.items.push(t),this.lookup[e]={instance:t,dependencies:n},t},createUrl:function(e,t){return"object"==typeof t?t:{prefix:e.prefix,resource:t,suffix:e.suffix}},addComponents:function(t,n){var r=this.urls[t];i(n,function(t){e.ScriptLoader.add(r+"/"+t)})},load:function(n,o,a,s){function l(){var r=c.dependencies(n);i(r,function(e){var n=c.createUrl(o,e);c.load(n.resource,n,t,t)}),a&&(s?a.call(s):a.call(e))}var c=this,u=o;c.urls[n]||("object"==typeof o&&(u=o.prefix+o.resource+o.suffix),0!==u.indexOf("/")&&-1==u.indexOf("://")&&(u=r.baseURL+"/"+u),c.urls[n]=u.substring(0,u.lastIndexOf("/")),c.lookup[n]?l():e.ScriptLoader.add(u,l,s))}},r.PluginManager=new r,r.ThemeManager=new r,r}),r(w,[f,m],function(e,t){function n(e,t){var n=e.childNodes;return t--,t>n.length-1?t=n.length-1:0>t&&(t=0),n[t]||e}function r(e){this.walk=function(t,r){function o(e){var t;return t=e[0],3===t.nodeType&&t===c&&u>=t.nodeValue.length&&e.splice(0,1),t=e[e.length-1],0===f&&e.length>0&&t===d&&3===t.nodeType&&e.splice(e.length-1,1),e}function a(e,t,n){for(var r=[];e&&e!=n;e=e[t])r.push(e);return r}function s(e,t){do{if(e.parentNode==t)return e;e=e.parentNode}while(e)}function l(e,t,n){var i=n?"nextSibling":"previousSibling";for(g=e,v=g.parentNode;g&&g!=t;g=v)v=g.parentNode,y=a(g==e?g:g[i],i),y.length&&(n||y.reverse(),r(o(y)))}var c=t.startContainer,u=t.startOffset,d=t.endContainer,f=t.endOffset,h,p,m,g,v,y,b;if(b=e.select("td.mce-item-selected,th.mce-item-selected"),b.length>0)return void i(b,function(e){r([e])});if(1==c.nodeType&&c.hasChildNodes()&&(c=c.childNodes[u]),1==d.nodeType&&d.hasChildNodes()&&(d=n(d,f)),c==d)return r(o([c]));for(h=e.findCommonAncestor(c,d),g=c;g;g=g.parentNode){if(g===d)return l(c,h,!0);if(g===h)break}for(g=d;g;g=g.parentNode){if(g===c)return l(d,h);if(g===h)break}p=s(c,h)||c,m=s(d,h)||d,l(c,p,!0),y=a(p==c?p:p.nextSibling,"nextSibling",m==d?m.nextSibling:m),y.length&&r(o(y)),l(d,m)},this.split=function(e){function t(e,t){return e.splitText(t)}var n=e.startContainer,r=e.startOffset,i=e.endContainer,o=e.endOffset;return n==i&&3==n.nodeType?r>0&&r<n.nodeValue.length&&(i=t(n,r),n=i.previousSibling,o>r?(o-=r,n=i=t(i,o).previousSibling,o=i.nodeValue.length,r=0):o=0):(3==n.nodeType&&r>0&&r<n.nodeValue.length&&(n=t(n,r),r=0),3==i.nodeType&&o>0&&o<i.nodeValue.length&&(i=t(i,o).previousSibling,o=i.nodeValue.length)),{startContainer:n,startOffset:r,endContainer:i,endOffset:o}},this.normalize=function(n){function r(r){function a(n,r){for(var i=new t(n,e.getParent(n.parentNode,e.isBlock)||f);n=i[r?"prev":"next"]();)if("BR"===n.nodeName)return!0}function s(e,t){return e.previousSibling&&e.previousSibling.nodeName==t}function l(n,r){var a,s,l;if(r=r||c,l=e.getParent(r.parentNode,e.isBlock)||f,n&&"BR"==r.nodeName&&g&&e.isEmpty(l))return c=r.parentNode,u=e.nodeIndex(r),void(i=!0);for(a=new t(r,l);h=a[n?"prev":"next"]();){if("false"===e.getContentEditableParent(h))return;if(3===h.nodeType&&h.nodeValue.length>0)return c=h,u=n?h.nodeValue.length:0,void(i=!0);if(e.isBlock(h)||p[h.nodeName.toLowerCase()])return;s=h}o&&s&&(c=s,i=!0,u=0)}var c,u,d,f=e.getRoot(),h,p,m,g;if(c=n[(r?"start":"end")+"Container"],u=n[(r?"start":"end")+"Offset"],g=1==c.nodeType&&u===c.childNodes.length,p=e.schema.getNonEmptyElements(),m=r,1==c.nodeType&&u>c.childNodes.length-1&&(m=!1),9===c.nodeType&&(c=e.getRoot(),u=0),c===f){if(m&&(h=c.childNodes[u>0?u-1:0],h&&(p[h.nodeName]||"TABLE"==h.nodeName)))return;if(c.hasChildNodes()&&(u=Math.min(!m&&u>0?u-1:u,c.childNodes.length-1),c=c.childNodes[u],u=0,c.hasChildNodes()&&!/TABLE/.test(c.nodeName))){h=c,d=new t(c,f);do{if(3===h.nodeType&&h.nodeValue.length>0){u=m?0:h.nodeValue.length,c=h,i=!0;break}if(p[h.nodeName.toLowerCase()]){u=e.nodeIndex(h),c=h.parentNode,"IMG"!=h.nodeName||m||u++,i=!0;break}}while(h=m?d.next():d.prev())}}o&&(3===c.nodeType&&0===u&&l(!0),1===c.nodeType&&(h=c.childNodes[u],h||(h=c.childNodes[u-1]),!h||"BR"!==h.nodeName||s(h,"A")||a(h)||a(h,!0)||l(!0,h))),m&&!o&&3===c.nodeType&&u===c.nodeValue.length&&l(!1),i&&n["set"+(r?"Start":"End")](c,u)}var i,o;return o=n.collapsed,r(!0),o||r(),i&&o&&n.collapse(!0),i}}var i=e.each;return r.compareRanges=function(e,t){if(e&&t){if(!e.item&&!e.duplicate)return e.startContainer==t.startContainer&&e.startOffset==t.startOffset;if(e.item&&t.item&&e.item(0)===t.item(0))return!0;if(e.isEqual&&t.isEqual&&t.isEqual(e))return!0}return!1},r.getCaretRangeFromPoint=function(e,t,n){var r,i;if(n.caretPositionFromPoint)i=n.caretPositionFromPoint(e,t),r=n.createRange(),r.setStart(i.offsetNode,i.offset),r.collapse(!0);else if(n.caretRangeFromPoint)r=n.caretRangeFromPoint(e,t);else if(n.body.createTextRange){r=n.body.createTextRange();try{r.moveToPoint(e,t),r.collapse(!0)}catch(o){r.collapse(t<n.body.clientHeight)}}return r},r.getNode=function(e,t){return 1==e.nodeType&&e.hasChildNodes()&&(t>=e.childNodes.length&&(t=e.childNodes.length-1),e=e.childNodes[t]),e},r}),r(_,[w,u],function(e,t){return function(n){function r(e){var t,r;if(r=n.$(e).parentsUntil(n.getBody()).add(e),r.length===o.length){for(t=r.length;t>=0&&r[t]===o[t];t--);if(-1===t)return o=r,!0}return o=r,!1}var i,o=[];"onselectionchange"in n.getDoc()||n.on("NodeChange Click MouseUp KeyUp Focus",function(t){var r,o;r=n.selection.getRng(),o={startContainer:r.startContainer,startOffset:r.startOffset,endContainer:r.endContainer,endOffset:r.endOffset},"nodechange"!=t.type&&e.compareRanges(o,i)||n.fire("SelectionChange"),i=o}),n.on("contextmenu",function(){n.fire("SelectionChange")}),n.on("SelectionChange",function(){var e=n.selection.getStart(!0);(t.range||!n.selection.isCollapsed())&&!r(e)&&n.dom.isChildOf(e,n.getBody())&&n.nodeChanged({selectionChange:!0})}),n.on("MouseUp",function(e){e.isDefaultPrevented()||("IMG"==n.selection.getNode().nodeName?setTimeout(function(){n.nodeChanged()},0):n.nodeChanged())}),this.nodeChanged=function(e){var t=n.selection,r,i,o;n.initialized&&t&&!n.settings.disable_nodechange&&!n.settings.readonly&&(o=n.getBody(),r=t.getStart()||o,r=r.ownerDocument!=n.getDoc()?n.getBody():r,"IMG"==r.nodeName&&t.isCollapsed()&&(r=r.parentNode),i=[],n.dom.getParent(r,function(e){return e===o?!0:void i.push(e)}),e=e||{},e.element=r,e.parents=i,n.fire("NodeChange",e))}}}),r(E,[],function(){function e(e,t,n){var r,i,o=n?"lastChild":"firstChild",a=n?"prev":"next";if(e[o])return e[o];if(e!==t){if(r=e[a])return r;for(i=e.parent;i&&i!==t;i=i.parent)if(r=i[a])return r}}function t(e,t){this.name=e,this.type=t,1===t&&(this.attributes=[],this.attributes.map={})}var n=/^[ \t\r\n]*$/,r={"#text":3,"#comment":8,"#cdata":4,"#pi":7,"#doctype":10,"#document-fragment":11};return t.prototype={replace:function(e){var t=this;return e.parent&&e.remove(),t.insert(e,t),t.remove(),t},attr:function(e,t){var n=this,r,i,o;if("string"!=typeof e){for(i in e)n.attr(i,e[i]);return n}if(r=n.attributes){if(t!==o){if(null===t){if(e in r.map)for(delete r.map[e],i=r.length;i--;)if(r[i].name===e)return r=r.splice(i,1),n;return n}if(e in r.map){for(i=r.length;i--;)if(r[i].name===e){r[i].value=t;break}}else r.push({name:e,value:t});return r.map[e]=t,n}return r.map[e]}},clone:function(){var e=this,n=new t(e.name,e.type),r,i,o,a,s;if(o=e.attributes){for(s=[],s.map={},r=0,i=o.length;i>r;r++)a=o[r],"id"!==a.name&&(s[s.length]={name:a.name,value:a.value},s.map[a.name]=a.value);n.attributes=s}return n.value=e.value,n.shortEnded=e.shortEnded,n},wrap:function(e){var t=this;return t.parent.insert(e,t),e.append(t),t},unwrap:function(){var e=this,t,n;for(t=e.firstChild;t;)n=t.next,e.insert(t,e,!0),t=n;e.remove()},remove:function(){var e=this,t=e.parent,n=e.next,r=e.prev;return t&&(t.firstChild===e?(t.firstChild=n,n&&(n.prev=null)):r.next=n,t.lastChild===e?(t.lastChild=r,r&&(r.next=null)):n.prev=r,e.parent=e.next=e.prev=null),e},append:function(e){var t=this,n;return e.parent&&e.remove(),n=t.lastChild,n?(n.next=e,e.prev=n,t.lastChild=e):t.lastChild=t.firstChild=e,e.parent=t,e},insert:function(e,t,n){var r;return e.parent&&e.remove(),r=t.parent||this,n?(t===r.firstChild?r.firstChild=e:t.prev.next=e,e.prev=t.prev,e.next=t,t.prev=e):(t===r.lastChild?r.lastChild=e:t.next.prev=e,e.next=t.next,e.prev=t,t.next=e),e.parent=r,e},getAll:function(t){var n=this,r,i=[];for(r=n.firstChild;r;r=e(r,n))r.name===t&&i.push(r);return i},empty:function(){var t=this,n,r,i;if(t.firstChild){for(n=[],i=t.firstChild;i;i=e(i,t))n.push(i);for(r=n.length;r--;)i=n[r],i.parent=i.firstChild=i.lastChild=i.next=i.prev=null}return t.firstChild=t.lastChild=null,t},isEmpty:function(t){var r=this,i=r.firstChild,o,a;if(i)do{if(1===i.type){if(i.attributes.map["data-mce-bogus"])continue;if(t[i.name])return!1;for(o=i.attributes.length;o--;)if(a=i.attributes[o].name,"name"===a||0===a.indexOf("data-mce-bookmark"))return!1}if(8===i.type)return!1;if(3===i.type&&!n.test(i.value))return!1}while(i=e(i,r));return!0},walk:function(t){return e(this,null,t)}},t.create=function(e,n){var i,o;if(i=new t(e,r[e]||1),n)for(o in n)i.attr(o,n[o]);return i},t}),r(N,[f],function(e){function t(e,t){return e?e.split(t||" "):[]}function n(e){function n(e,n,r){function i(e,t){var n={},r,i;for(r=0,i=e.length;i>r;r++)n[e[r]]=t||{};return n}var s,c,u,d=arguments;for(r=r||[],n=n||"","string"==typeof r&&(r=t(r)),c=3;c<d.length;c++)"string"==typeof d[c]&&(d[c]=t(d[c])),r.push.apply(r,d[c]);for(e=t(e),s=e.length;s--;)u=[].concat(l,t(n)),a[e[s]]={attributes:i(u),attributesOrder:u,children:i(r,o)}}function r(e,n){var r,i,o,s;for(e=t(e),r=e.length,n=t(n);r--;)for(i=a[e[r]],o=0,s=n.length;s>o;o++)i.attributes[n[o]]={},i.attributesOrder.push(n[o])}var a={},l,c,u,d,f,h;return i[e]?i[e]:(l=t("id accesskey class dir lang style tabindex title"),c=t("address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul"),u=t("a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd label map noscript object q s samp script select small span strong sub sup textarea u var #text #comment"),"html4"!=e&&(l.push.apply(l,t("contenteditable contextmenu draggable dropzone hidden spellcheck translate")),c.push.apply(c,t("article aside details dialog figure header footer hgroup section nav")),u.push.apply(u,t("audio canvas command datalist mark meter output picture progress time wbr video ruby bdi keygen"))),"html5-strict"!=e&&(l.push("xml:lang"),h=t("acronym applet basefont big font strike tt"),u.push.apply(u,h),s(h,function(e){n(e,"",u)}),f=t("center dir isindex noframes"),c.push.apply(c,f),d=[].concat(c,u),s(f,function(e){n(e,"",d)})),d=d||[].concat(c,u),n("html","manifest","head body"),n("head","","base command link meta noscript script style title"),n("title hr noscript br"),n("base","href target"),n("link","href rel media hreflang type sizes hreflang"),n("meta","name http-equiv content charset"),n("style","media type scoped"),n("script","src async defer type charset"),n("body","onafterprint onbeforeprint onbeforeunload onblur onerror onfocus onhashchange onload onmessage onoffline ononline onpagehide onpageshow onpopstate onresize onscroll onstorage onunload",d),n("address dt dd div caption","",d),n("h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn","",u),n("blockquote","cite",d),n("ol","reversed start type","li"),n("ul","","li"),n("li","value",d),n("dl","","dt dd"),n("a","href target rel media hreflang type",u),n("q","cite",u),n("ins del","cite datetime",d),n("img","src sizes srcset alt usemap ismap width height"),n("iframe","src name width height",d),n("embed","src type width height"),n("object","data type typemustmatch name usemap form width height",d,"param"),n("param","name value"),n("map","name",d,"area"),n("area","alt coords shape href target rel media hreflang type"),n("table","border","caption colgroup thead tfoot tbody tr"+("html4"==e?" col":"")),n("colgroup","span","col"),n("col","span"),n("tbody thead tfoot","","tr"),n("tr","","td th"),n("td","colspan rowspan headers",d),n("th","colspan rowspan headers scope abbr",d),n("form","accept-charset action autocomplete enctype method name novalidate target",d),n("fieldset","disabled form name",d,"legend"),n("label","form for",u),n("input","accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate formtarget height list max maxlength min multiple name pattern readonly required size src step type value width"),n("button","disabled form formaction formenctype formmethod formnovalidate formtarget name type value","html4"==e?d:u),n("select","disabled form multiple name required size","option optgroup"),n("optgroup","disabled label","option"),n("option","disabled label selected value"),
n("textarea","cols dirname disabled form maxlength name readonly required rows wrap"),n("menu","type label",d,"li"),n("noscript","",d),"html4"!=e&&(n("wbr"),n("ruby","",u,"rt rp"),n("figcaption","",d),n("mark rt rp summary bdi","",u),n("canvas","width height",d),n("video","src crossorigin poster preload autoplay mediagroup loop muted controls width height buffered",d,"track source"),n("audio","src crossorigin preload autoplay mediagroup loop muted controls buffered volume",d,"track source"),n("picture","","img source"),n("source","src srcset type media sizes"),n("track","kind src srclang label default"),n("datalist","",u,"option"),n("article section nav aside header footer","",d),n("hgroup","","h1 h2 h3 h4 h5 h6"),n("figure","",d,"figcaption"),n("time","datetime",u),n("dialog","open",d),n("command","type label icon disabled checked radiogroup command"),n("output","for form name",u),n("progress","value max",u),n("meter","value min max low high optimum",u),n("details","open",d,"summary"),n("keygen","autofocus challenge disabled form keytype name")),"html5-strict"!=e&&(r("script","language xml:space"),r("style","xml:space"),r("object","declare classid code codebase codetype archive standby align border hspace vspace"),r("embed","align name hspace vspace"),r("param","valuetype type"),r("a","charset name rev shape coords"),r("br","clear"),r("applet","codebase archive code object alt name width height align hspace vspace"),r("img","name longdesc align border hspace vspace"),r("iframe","longdesc frameborder marginwidth marginheight scrolling align"),r("font basefont","size color face"),r("input","usemap align"),r("select","onchange"),r("textarea"),r("h1 h2 h3 h4 h5 h6 div p legend caption","align"),r("ul","type compact"),r("li","type"),r("ol dl menu dir","compact"),r("pre","width xml:space"),r("hr","align noshade size width"),r("isindex","prompt"),r("table","summary width frame rules cellspacing cellpadding align bgcolor"),r("col","width align char charoff valign"),r("colgroup","width align char charoff valign"),r("thead","align char charoff valign"),r("tr","align char charoff valign bgcolor"),r("th","axis align char charoff valign nowrap bgcolor width height"),r("form","accept"),r("td","abbr axis scope align char charoff valign nowrap bgcolor width height"),r("tfoot","align char charoff valign"),r("tbody","align char charoff valign"),r("area","nohref"),r("body","background bgcolor text link vlink alink")),"html4"!=e&&(r("input button select textarea","autofocus"),r("input textarea","placeholder"),r("a","download"),r("link script img","crossorigin"),r("iframe","sandbox seamless allowfullscreen")),s(t("a form meter progress dfn"),function(e){a[e]&&delete a[e].children[e]}),delete a.caption.children.table,delete a.script,i[e]=a,a)}function r(e,t){var n;return e&&(n={},"string"==typeof e&&(e={"*":e}),s(e,function(e,r){n[r]=n[r.toUpperCase()]="map"==t?a(e,/[, ]/):c(e,/[, ]/)})),n}var i={},o={},a=e.makeMap,s=e.each,l=e.extend,c=e.explode,u=e.inArray;return function(e){function o(t,n,r){var o=e[t];return o?o=a(o,/[, ]/,a(o.toUpperCase(),/[, ]/)):(o=i[t],o||(o=a(n," ",a(n.toUpperCase()," ")),o=l(o,r),i[t]=o)),o}function d(e){return new RegExp("^"+e.replace(/([?+*])/g,".$1")+"$")}function f(e){var n,r,i,o,s,l,c,f,h,p,m,g,v,b,C,w,_,E,N,k=/^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)\])?$/,S=/^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,T=/[*?+]/;if(e)for(e=t(e,","),y["@"]&&(w=y["@"].attributes,_=y["@"].attributesOrder),n=0,r=e.length;r>n;n++)if(s=k.exec(e[n])){if(b=s[1],h=s[2],C=s[3],f=s[5],g={},v=[],l={attributes:g,attributesOrder:v},"#"===b&&(l.paddEmpty=!0),"-"===b&&(l.removeEmpty=!0),"!"===s[4]&&(l.removeEmptyAttrs=!0),w){for(E in w)g[E]=w[E];v.push.apply(v,_)}if(f)for(f=t(f,"|"),i=0,o=f.length;o>i;i++)if(s=S.exec(f[i])){if(c={},m=s[1],p=s[2].replace(/::/g,":"),b=s[3],N=s[4],"!"===m&&(l.attributesRequired=l.attributesRequired||[],l.attributesRequired.push(p),c.required=!0),"-"===m){delete g[p],v.splice(u(v,p),1);continue}b&&("="===b&&(l.attributesDefault=l.attributesDefault||[],l.attributesDefault.push({name:p,value:N}),c.defaultValue=N),":"===b&&(l.attributesForced=l.attributesForced||[],l.attributesForced.push({name:p,value:N}),c.forcedValue=N),"<"===b&&(c.validValues=a(N,"?"))),T.test(p)?(l.attributePatterns=l.attributePatterns||[],c.pattern=d(p),l.attributePatterns.push(c)):(g[p]||v.push(p),g[p]=c)}w||"@"!=h||(w=g,_=v),C&&(l.outputName=h,y[C]=l),T.test(h)?(l.pattern=d(h),x.push(l)):y[h]=l}}function h(e){y={},x=[],f(e),s(_,function(e,t){b[t]=e.children})}function p(e){var n=/^(~)?(.+)$/;e&&(i.text_block_elements=i.block_elements=null,s(t(e,","),function(e){var t=n.exec(e),r="~"===t[1],i=r?"span":"div",o=t[2];if(b[o]=b[i],H[o]=i,r||(R[o.toUpperCase()]={},R[o]={}),!y[o]){var a=y[i];a=l({},a),delete a.removeEmptyAttrs,delete a.removeEmpty,y[o]=a}s(b,function(e,t){e[i]&&(b[t]=e=l({},b[t]),e[o]=e[i])})}))}function m(n){var r=/^([+\-]?)(\w+)\[([^\]]+)\]$/;i[e.schema]=null,n&&s(t(n,","),function(e){var n=r.exec(e),i,o;n&&(o=n[1],i=o?b[n[2]]:b[n[2]]={"#comment":{}},i=b[n[2]],s(t(n[3],"|"),function(e){"-"===o?delete i[e]:i[e]={}}))})}function g(e){var t=y[e],n;if(t)return t;for(n=x.length;n--;)if(t=x[n],t.pattern.test(e))return t}var v=this,y={},b={},x=[],C,w,_,E,N,k,S,T,R,A,B,D,M,H={},L={};e=e||{},_=n(e.schema),e.verify_html===!1&&(e.valid_elements="*[*]"),C=r(e.valid_styles),w=r(e.invalid_styles,"map"),T=r(e.valid_classes,"map"),E=o("whitespace_elements","pre script noscript style textarea video audio iframe object"),N=o("self_closing_elements","colgroup dd dt li option p td tfoot th thead tr"),k=o("short_ended_elements","area base basefont br col frame hr img input isindex link meta param embed source wbr track"),S=o("boolean_attributes","checked compact declare defer disabled ismap multiple nohref noresize noshade nowrap readonly selected autoplay loop controls"),A=o("non_empty_elements","td th iframe video audio object script",k),B=o("move_caret_before_on_enter_elements","table",A),D=o("text_block_elements","h1 h2 h3 h4 h5 h6 p div address pre form blockquote center dir fieldset header footer article section hgroup aside nav figure"),R=o("block_elements","hr table tbody thead tfoot th tr td li ol ul caption dl dt dd noscript menu isindex option datalist select optgroup",D),M=o("text_inline_elements","span strong b em i font strike u var cite dfn code mark q sup sub samp"),s((e.special||"script noscript style textarea").split(" "),function(e){L[e]=new RegExp("</"+e+"[^>]*>","gi")}),e.valid_elements?h(e.valid_elements):(s(_,function(e,t){y[t]={attributes:e.attributes,attributesOrder:e.attributesOrder},b[t]=e.children}),"html5"!=e.schema&&s(t("strong/b em/i"),function(e){e=t(e,"/"),y[e[1]].outputName=e[0]}),y.img.attributesDefault=[{name:"alt",value:""}],s(t("ol ul sub sup blockquote span font a table tbody tr strong em b i"),function(e){y[e]&&(y[e].removeEmpty=!0)}),s(t("p h1 h2 h3 h4 h5 h6 th td pre div address caption"),function(e){y[e].paddEmpty=!0}),s(t("span"),function(e){y[e].removeEmptyAttrs=!0})),p(e.custom_elements),m(e.valid_children),f(e.extended_valid_elements),m("+ol[ul|ol],+ul[ul|ol]"),e.invalid_elements&&s(c(e.invalid_elements),function(e){y[e]&&delete y[e]}),g("span")||f("span[!data-mce-type|*]"),v.children=b,v.getValidStyles=function(){return C},v.getInvalidStyles=function(){return w},v.getValidClasses=function(){return T},v.getBoolAttrs=function(){return S},v.getBlockElements=function(){return R},v.getTextBlockElements=function(){return D},v.getTextInlineElements=function(){return M},v.getShortEndedElements=function(){return k},v.getSelfClosingElements=function(){return N},v.getNonEmptyElements=function(){return A},v.getMoveCaretBeforeOnEnterElements=function(){return B},v.getWhiteSpaceElements=function(){return E},v.getSpecialElements=function(){return L},v.isValidChild=function(e,t){var n=b[e];return!(!n||!n[t])},v.isValid=function(e,t){var n,r,i=g(e);if(i){if(!t)return!0;if(i.attributes[t])return!0;if(n=i.attributePatterns)for(r=n.length;r--;)if(n[r].pattern.test(e))return!0}return!1},v.getElementRule=g,v.getCustomElements=function(){return H},v.addValidElements=f,v.setValidElements=h,v.addCustomElements=p,v.addValidChildren=m,v.elements=y}}),r(k,[N,v,f],function(e,t,n){function r(e,t,n){var r=1,i,o,a,s;for(s=e.getShortEndedElements(),a=/<([!?\/])?([A-Za-z0-9\-_\:\.]+)((?:\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\/|\s+)>/g,a.lastIndex=i=n;o=a.exec(t);){if(i=a.lastIndex,"/"===o[1])r--;else if(!o[1]){if(o[2]in s)continue;r++}if(0===r)break}return i}function i(i,a){function s(){}var l=this;i=i||{},l.schema=a=a||new e,i.fix_self_closing!==!1&&(i.fix_self_closing=!0),o("comment cdata text start end pi doctype".split(" "),function(e){e&&(l[e]=i[e]||s)}),l.parse=function(e){function o(e){var t,n;for(t=h.length;t--&&h[t].name!==e;);if(t>=0){for(n=h.length-1;n>=t;n--)e=h[n],e.valid&&l.end(e.name);h.length=t}}function s(e,t,n,r,o){var a,s,l=/[\s\u0000-\u001F]+/g;if(t=t.toLowerCase(),n=t in C?t:z(n||r||o||""),_&&!y&&0!==t.indexOf("data-")){if(a=T[t],!a&&R){for(s=R.length;s--&&(a=R[s],!a.pattern.test(t)););-1===s&&(a=null)}if(!a)return;if(a.validValues&&!(n in a.validValues))return}if(V[t]&&!i.allow_script_urls){var c=n.replace(l,"");try{c=decodeURIComponent(c)}catch(u){c=unescape(c)}if(U.test(c))return;if(!i.allow_html_data_urls&&$.test(c)&&!/^data:image\//i.test(c))return}p.map[t]=n,p.push({name:t,value:n})}var l=this,c,u=0,d,f,h=[],p,m,g,v,y,b,x,C,w,_,E,N,k,S,T,R,A,B,D,M,H,L,P,O,I,F=0,z=t.decode,W,V=n.makeMap("src,href,data,background,formaction,poster"),U=/((java|vb)script|mhtml):/i,$=/^data:/i;for(L=new RegExp("<(?:(?:!--([\\w\\W]*?)-->)|(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|(?:!DOCTYPE([\\w\\W]*?)>)|(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|(?:\\/([^>]+)>)|(?:([A-Za-z0-9\\-_\\:\\.]+)((?:\\s+[^\"'>]+(?:(?:\"[^\"]*\")|(?:'[^']*')|[^>]*))*|\\/|\\s+)>))","g"),P=/([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g,x=a.getShortEndedElements(),H=i.self_closing_elements||a.getSelfClosingElements(),C=a.getBoolAttrs(),_=i.validate,b=i.remove_internals,W=i.fix_self_closing,O=a.getSpecialElements();c=L.exec(e);){if(u<c.index&&l.text(z(e.substr(u,c.index-u))),d=c[6])d=d.toLowerCase(),":"===d.charAt(0)&&(d=d.substr(1)),o(d);else if(d=c[7]){if(d=d.toLowerCase(),":"===d.charAt(0)&&(d=d.substr(1)),w=d in x,W&&H[d]&&h.length>0&&h[h.length-1].name===d&&o(d),!_||(E=a.getElementRule(d))){if(N=!0,_&&(T=E.attributes,R=E.attributePatterns),(S=c[8])?(y=-1!==S.indexOf("data-mce-type"),y&&b&&(N=!1),p=[],p.map={},S.replace(P,s)):(p=[],p.map={}),_&&!y){if(A=E.attributesRequired,B=E.attributesDefault,D=E.attributesForced,M=E.removeEmptyAttrs,M&&!p.length&&(N=!1),D)for(m=D.length;m--;)k=D[m],v=k.name,I=k.value,"{$uid}"===I&&(I="mce_"+F++),p.map[v]=I,p.push({name:v,value:I});if(B)for(m=B.length;m--;)k=B[m],v=k.name,v in p.map||(I=k.value,"{$uid}"===I&&(I="mce_"+F++),p.map[v]=I,p.push({name:v,value:I}));if(A){for(m=A.length;m--&&!(A[m]in p.map););-1===m&&(N=!1)}if(k=p.map["data-mce-bogus"]){if("all"===k){u=r(a,e,L.lastIndex),L.lastIndex=u;continue}N=!1}}N&&l.start(d,p,w)}else N=!1;if(f=O[d]){f.lastIndex=u=c.index+c[0].length,(c=f.exec(e))?(N&&(g=e.substr(u,c.index-u)),u=c.index+c[0].length):(g=e.substr(u),u=e.length),N&&(g.length>0&&l.text(g,!0),l.end(d)),L.lastIndex=u;continue}w||(S&&S.indexOf("/")==S.length-1?N&&l.end(d):h.push({name:d,valid:N}))}else(d=c[1])?(">"===d.charAt(0)&&(d=" "+d),i.allow_conditional_comments||"[if"!==d.substr(0,3)||(d=" "+d),l.comment(d)):(d=c[2])?l.cdata(d):(d=c[3])?l.doctype(d):(d=c[4])&&l.pi(d,c[5]);u=c.index+c[0].length}for(u<e.length&&l.text(z(e.substr(u))),m=h.length-1;m>=0;m--)d=h[m],d.valid&&l.end(d.name)}}var o=n.each;return i.findEndTag=r,i}),r(S,[E,N,k,f],function(e,t,n,r){var i=r.makeMap,o=r.each,a=r.explode,s=r.extend;return function(r,l){function c(t){var n,r,o,a,s,c,d,f,h,p,m,g,v,y,b;for(m=i("tr,td,th,tbody,thead,tfoot,table"),p=l.getNonEmptyElements(),g=l.getTextBlockElements(),v=l.getSpecialElements(),n=0;n<t.length;n++)if(r=t[n],r.parent&&!r.fixed)if(g[r.name]&&"li"==r.parent.name){for(y=r.next;y&&g[y.name];)y.name="li",y.fixed=!0,r.parent.insert(y,r.parent),y=y.next;r.unwrap(r)}else{for(a=[r],o=r.parent;o&&!l.isValidChild(o.name,r.name)&&!m[o.name];o=o.parent)a.push(o);if(o&&a.length>1){for(a.reverse(),s=c=u.filterNode(a[0].clone()),h=0;h<a.length-1;h++){for(l.isValidChild(c.name,a[h].name)?(d=u.filterNode(a[h].clone()),c.append(d)):d=c,f=a[h].firstChild;f&&f!=a[h+1];)b=f.next,d.append(f),f=b;c=d}s.isEmpty(p)?o.insert(r,a[0],!0):(o.insert(s,a[0],!0),o.insert(r,s)),o=a[0],(o.isEmpty(p)||o.firstChild===o.lastChild&&"br"===o.firstChild.name)&&o.empty().remove()}else if(r.parent){if("li"===r.name){if(y=r.prev,y&&("ul"===y.name||"ul"===y.name)){y.append(r);continue}if(y=r.next,y&&("ul"===y.name||"ul"===y.name)){y.insert(r,y.firstChild,!0);continue}r.wrap(u.filterNode(new e("ul",1)));continue}l.isValidChild(r.parent.name,"div")&&l.isValidChild("div",r.name)?r.wrap(u.filterNode(new e("div",1))):v[r.name]?r.empty().remove():r.unwrap()}}}var u=this,d={},f=[],h={},p={};r=r||{},r.validate="validate"in r?r.validate:!0,r.root_name=r.root_name||"body",u.schema=l=l||new t,u.filterNode=function(e){var t,n,r;n in d&&(r=h[n],r?r.push(e):h[n]=[e]),t=f.length;for(;t--;)n=f[t].name,n in e.attributes.map&&(r=p[n],r?r.push(e):p[n]=[e]);return e},u.addNodeFilter=function(e,t){o(a(e),function(e){var n=d[e];n||(d[e]=n=[]),n.push(t)})},u.addAttributeFilter=function(e,t){o(a(e),function(e){var n;for(n=0;n<f.length;n++)if(f[n].name===e)return void f[n].callbacks.push(t);f.push({name:e,callbacks:[t]})})},u.parse=function(t,o){function a(){function e(e){e&&(t=e.firstChild,t&&3==t.type&&(t.value=t.value.replace(R,"")),t=e.lastChild,t&&3==t.type&&(t.value=t.value.replace(D,"")))}var t=y.firstChild,n,i;if(l.isValidChild(y.name,I.toLowerCase())){for(;t;)n=t.next,3==t.type||1==t.type&&"p"!==t.name&&!T[t.name]&&!t.attr("data-mce-type")?i?i.append(t):(i=u(I,1),i.attr(r.forced_root_block_attrs),y.insert(i,t),i.append(t)):(e(i),i=null),t=n;e(i)}}function u(t,n){var r=new e(t,n),i;return t in d&&(i=h[t],i?i.push(r):h[t]=[r]),r}function m(e){var t,n,r,i,o=l.getBlockElements();for(t=e.prev;t&&3===t.type;){if(r=t.value.replace(D,""),r.length>0)return void(t.value=r);if(n=t.next){if(3==n.type&&n.value.length){t=t.prev;continue}if(!o[n.name]&&"script"!=n.name&&"style"!=n.name){t=t.prev;continue}}i=t.prev,t.remove(),t=i}}function g(e){var t,n={};for(t in e)"li"!==t&&"p"!=t&&(n[t]=e[t]);return n}var v,y,b,x,C,w,_,E,N,k,S,T,R,A=[],B,D,M,H,L,P,O,I;if(o=o||{},h={},p={},T=s(i("script,style,head,html,body,title,meta,param"),l.getBlockElements()),O=l.getNonEmptyElements(),P=l.children,S=r.validate,I="forced_root_block"in o?o.forced_root_block:r.forced_root_block,L=l.getWhiteSpaceElements(),R=/^[ \t\r\n]+/,D=/[ \t\r\n]+$/,M=/[ \t\r\n]+/g,H=/^[ \t\r\n]+$/,v=new n({validate:S,allow_script_urls:r.allow_script_urls,allow_conditional_comments:r.allow_conditional_comments,self_closing_elements:g(l.getSelfClosingElements()),cdata:function(e){b.append(u("#cdata",4)).value=e},text:function(e,t){var n;B||(e=e.replace(M," "),b.lastChild&&T[b.lastChild.name]&&(e=e.replace(R,""))),0!==e.length&&(n=u("#text",3),n.raw=!!t,b.append(n).value=e)},comment:function(e){b.append(u("#comment",8)).value=e},pi:function(e,t){b.append(u(e,7)).value=t,m(b)},doctype:function(e){var t;t=b.append(u("#doctype",10)),t.value=e,m(b)},start:function(e,t,n){var r,i,o,a,s;if(o=S?l.getElementRule(e):{}){for(r=u(o.outputName||e,1),r.attributes=t,r.shortEnded=n,b.append(r),s=P[b.name],s&&P[r.name]&&!s[r.name]&&A.push(r),i=f.length;i--;)a=f[i].name,a in t.map&&(N=p[a],N?N.push(r):p[a]=[r]);T[e]&&m(r),n||(b=r),!B&&L[e]&&(B=!0)}},end:function(t){var n,r,i,o,a;if(r=S?l.getElementRule(t):{}){if(T[t]&&!B){if(n=b.firstChild,n&&3===n.type)if(i=n.value.replace(R,""),i.length>0)n.value=i,n=n.next;else for(o=n.next,n.remove(),n=o;n&&3===n.type;)i=n.value,o=n.next,(0===i.length||H.test(i))&&(n.remove(),n=o),n=o;if(n=b.lastChild,n&&3===n.type)if(i=n.value.replace(D,""),i.length>0)n.value=i,n=n.prev;else for(o=n.prev,n.remove(),n=o;n&&3===n.type;)i=n.value,o=n.prev,(0===i.length||H.test(i))&&(n.remove(),n=o),n=o}if(B&&L[t]&&(B=!1),(r.removeEmpty||r.paddEmpty)&&b.isEmpty(O))if(r.paddEmpty)b.empty().append(new e("#text","3")).value="\xa0";else if(!b.attributes.map.name&&!b.attributes.map.id)return a=b.parent,T[b.name]?b.empty().remove():b.unwrap(),void(b=a);b=b.parent}}},l),y=b=new e(o.context||r.root_name,11),v.parse(t),S&&A.length&&(o.context?o.invalid=!0:c(A)),I&&("body"==y.name||o.isRootContent)&&a(),!o.invalid){for(k in h){for(N=d[k],x=h[k],_=x.length;_--;)x[_].parent||x.splice(_,1);for(C=0,w=N.length;w>C;C++)N[C](x,k,o)}for(C=0,w=f.length;w>C;C++)if(N=f[C],N.name in p){for(x=p[N.name],_=x.length;_--;)x[_].parent||x.splice(_,1);for(_=0,E=N.callbacks.length;E>_;_++)N.callbacks[_](x,N.name,o)}}return y},r.remove_trailing_brs&&u.addNodeFilter("br",function(t){var n,r=t.length,i,o=s({},l.getBlockElements()),a=l.getNonEmptyElements(),c,u,d,f,h,p;for(o.body=1,n=0;r>n;n++)if(i=t[n],c=i.parent,o[i.parent.name]&&i===c.lastChild){for(d=i.prev;d;){if(f=d.name,"span"!==f||"bookmark"!==d.attr("data-mce-type")){if("br"!==f)break;if("br"===f){i=null;break}}d=d.prev}i&&(i.remove(),c.isEmpty(a)&&(h=l.getElementRule(c.name),h&&(h.removeEmpty?c.remove():h.paddEmpty&&(c.empty().append(new e("#text",3)).value="\xa0"))))}else{for(u=i;c&&c.firstChild===u&&c.lastChild===u&&(u=c,!o[c.name]);)c=c.parent;u===c&&(p=new e("#text",3),p.value="\xa0",i.replace(p))}}),r.allow_html_in_named_anchor||u.addAttributeFilter("id,name",function(e){for(var t=e.length,n,r,i,o;t--;)if(o=e[t],"a"===o.name&&o.firstChild&&!o.attr("href")){i=o.parent,n=o.lastChild;do r=n.prev,i.insert(n,o),n=r;while(n)}}),r.validate&&l.getValidClasses()&&u.addAttributeFilter("class",function(e){for(var t=e.length,n,r,i,o,a,s=l.getValidClasses(),c,u;t--;){for(n=e[t],r=n.attr("class").split(" "),a="",i=0;i<r.length;i++)o=r[i],u=!1,c=s["*"],c&&c[o]&&(u=!0),c=s[n.name],!u&&c&&c[o]&&(u=!0),u&&(a&&(a+=" "),a+=o);a.length||(a=null),n.attr("class",a)}})}}),r(T,[v,f],function(e,t){var n=t.makeMap;return function(t){var r=[],i,o,a,s,l;return t=t||{},i=t.indent,o=n(t.indent_before||""),a=n(t.indent_after||""),s=e.getEncodeFunc(t.entity_encoding||"raw",t.entities),l="html"==t.element_format,{start:function(e,t,n){var c,u,d,f;if(i&&o[e]&&r.length>0&&(f=r[r.length-1],f.length>0&&"\n"!==f&&r.push("\n")),r.push("<",e),t)for(c=0,u=t.length;u>c;c++)d=t[c],r.push(" ",d.name,'="',s(d.value,!0),'"');!n||l?r[r.length]=">":r[r.length]=" />",n&&i&&a[e]&&r.length>0&&(f=r[r.length-1],f.length>0&&"\n"!==f&&r.push("\n"))},end:function(e){var t;r.push("</",e,">"),i&&a[e]&&r.length>0&&(t=r[r.length-1],t.length>0&&"\n"!==t&&r.push("\n"))},text:function(e,t){e.length>0&&(r[r.length]=t?e:s(e))},cdata:function(e){r.push("<![CDATA[",e,"]]>")},comment:function(e){r.push("<!--",e,"-->")},pi:function(e,t){t?r.push("<?",e," ",s(t),"?>"):r.push("<?",e,"?>"),i&&r.push("\n")},doctype:function(e){r.push("<!DOCTYPE",e,">",i?"\n":"")},reset:function(){r.length=0},getContent:function(){return r.join("").replace(/\n$/,"")}}}}),r(R,[T,N],function(e,t){return function(n,r){var i=this,o=new e(n);n=n||{},n.validate="validate"in n?n.validate:!0,i.schema=r=r||new t,i.writer=o,i.serialize=function(e){function t(e){var n=i[e.type],s,l,c,u,d,f,h,p,m;if(n)n(e);else{if(s=e.name,l=e.shortEnded,c=e.attributes,a&&c&&c.length>1){for(f=[],f.map={},m=r.getElementRule(e.name),h=0,p=m.attributesOrder.length;p>h;h++)u=m.attributesOrder[h],u in c.map&&(d=c.map[u],f.map[u]=d,f.push({name:u,value:d}));for(h=0,p=c.length;p>h;h++)u=c[h].name,u in f.map||(d=c.map[u],f.map[u]=d,f.push({name:u,value:d}));c=f}if(o.start(e.name,c,l),!l){if(e=e.firstChild)do t(e);while(e=e.next);o.end(s)}}}var i,a;return a=n.validate,i={3:function(e){o.text(e.value,e.raw)},8:function(e){o.comment(e.value)},7:function(e){o.pi(e.name,e.value)},10:function(e){o.doctype(e.value)},4:function(e){o.cdata(e.value)},11:function(e){if(e=e.firstChild)do t(e);while(e=e.next)}},o.reset(),1!=e.type||n.inner?i[11](e):t(e),o.getContent()}}}),r(A,[b,S,v,R,E,N,u,f],function(e,t,n,r,i,o,a,s){function l(e){function t(e){return e&&"br"===e.name}var n,r;n=e.lastChild,t(n)&&(r=n.prev,t(r)&&(n.remove(),r.remove()))}var c=s.each,u=s.trim,d=e.DOM;return function(e,i){var s,f,h;return i&&(s=i.dom,f=i.schema),s=s||d,f=f||new o(e),e.entity_encoding=e.entity_encoding||"named",e.remove_trailing_brs="remove_trailing_brs"in e?e.remove_trailing_brs:!0,h=new t(e,f),h.addAttributeFilter("data-mce-tabindex",function(e,t){for(var n=e.length,r;n--;)r=e[n],r.attr("tabindex",r.attributes.map["data-mce-tabindex"]),r.attr(t,null)}),h.addAttributeFilter("src,href,style",function(t,n){for(var r=t.length,i,o,a="data-mce-"+n,l=e.url_converter,c=e.url_converter_scope,u;r--;)i=t[r],o=i.attributes.map[a],o!==u?(i.attr(n,o.length>0?o:null),i.attr(a,null)):(o=i.attributes.map[n],"style"===n?o=s.serializeStyle(s.parseStyle(o),i.name):l&&(o=l.call(c,o,n,i.name)),i.attr(n,o.length>0?o:null))}),h.addAttributeFilter("class",function(e){for(var t=e.length,n,r;t--;)n=e[t],r=n.attr("class"),r&&(r=n.attr("class").replace(/(?:^|\s)mce-item-\w+(?!\S)/g,""),n.attr("class",r.length>0?r:null))}),h.addAttributeFilter("data-mce-type",function(e,t,n){for(var r=e.length,i;r--;)i=e[r],"bookmark"!==i.attributes.map["data-mce-type"]||n.cleanup||i.remove()}),h.addNodeFilter("noscript",function(e){for(var t=e.length,r;t--;)r=e[t].firstChild,r&&(r.value=n.decode(r.value))}),h.addNodeFilter("script,style",function(e,t){function n(e){return e.replace(/(<!--\[CDATA\[|\]\]-->)/g,"\n").replace(/^[\r\n]*|[\r\n]*$/g,"").replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi,"").replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g,"")}for(var r=e.length,i,o,a;r--;)i=e[r],o=i.firstChild?i.firstChild.value:"","script"===t?(a=i.attr("type"),a&&i.attr("type","mce-no/type"==a?null:a.replace(/^mce\-/,"")),o.length>0&&(i.firstChild.value="// <![CDATA[\n"+n(o)+"\n// ]]>")):o.length>0&&(i.firstChild.value="<!--\n"+n(o)+"\n-->")}),h.addNodeFilter("#comment",function(e){for(var t=e.length,n;t--;)n=e[t],0===n.value.indexOf("[CDATA[")?(n.name="#cdata",n.type=4,n.value=n.value.replace(/^\[CDATA\[|\]\]$/g,"")):0===n.value.indexOf("mce:protected ")&&(n.name="#text",n.type=3,n.raw=!0,n.value=unescape(n.value).substr(14))}),h.addNodeFilter("xml:namespace,input",function(e,t){for(var n=e.length,r;n--;)r=e[n],7===r.type?r.remove():1===r.type&&("input"!==t||"type"in r.attributes.map||r.attr("type","text"))}),e.fix_list_elements&&h.addNodeFilter("ul,ol",function(e){for(var t=e.length,n,r;t--;)n=e[t],r=n.parent,("ul"===r.name||"ol"===r.name)&&n.prev&&"li"===n.prev.name&&n.prev.append(n)}),h.addAttributeFilter("data-mce-src,data-mce-href,data-mce-style,data-mce-selected,data-mce-expando,data-mce-type,data-mce-resize",function(e,t){for(var n=e.length;n--;)e[n].attr(t,null)}),{schema:f,addNodeFilter:h.addNodeFilter,addAttributeFilter:h.addAttributeFilter,serialize:function(t,n){var i=this,o,d,p,m,g,v;return a.ie&&s.select("script,style,select,map").length>0?(g=t.innerHTML,t=t.cloneNode(!1),s.setHTML(t,g)):t=t.cloneNode(!0),o=t.ownerDocument.implementation,o.createHTMLDocument&&(d=o.createHTMLDocument(""),c("BODY"==t.nodeName?t.childNodes:[t],function(e){d.body.appendChild(d.importNode(e,!0))}),t="BODY"!=t.nodeName?d.body.firstChild:d.body,p=s.doc,s.doc=d),n=n||{},n.format=n.format||"html",n.selection&&(n.forced_root_block=""),n.no_events||(n.node=t,i.onPreProcess(n)),v=h.parse(u(n.getInner?t.innerHTML:s.getOuterHTML(t)),n),l(v),m=new r(e,f),n.content=m.serialize(v),n.cleanup||(n.content=n.content.replace(/\uFEFF/g,"")),n.no_events||i.onPostProcess(n),p&&(s.doc=p),n.node=null,n.content},addRules:function(e){f.addValidElements(e)},setRules:function(e){f.setValidElements(e)},onPreProcess:function(e){i&&i.fire("PreProcess",e)},onPostProcess:function(e){i&&i.fire("PostProcess",e)}}}}),r(B,[],function(){function e(e){function t(t,n){var r,i=0,o,a,s,l,c,u,d=-1,f;if(r=t.duplicate(),r.collapse(n),f=r.parentElement(),f.ownerDocument===e.dom.doc){for(;"false"===f.contentEditable;)f=f.parentNode;if(!f.hasChildNodes())return{node:f,inside:1};for(s=f.children,o=s.length-1;o>=i;)if(u=Math.floor((i+o)/2),l=s[u],r.moveToElementText(l),d=r.compareEndPoints(n?"StartToStart":"EndToEnd",t),d>0)o=u-1;else{if(!(0>d))return{node:l};i=u+1}if(0>d)for(l?r.collapse(!1):(r.moveToElementText(f),r.collapse(!0),l=f,a=!0),c=0;0!==r.compareEndPoints(n?"StartToStart":"StartToEnd",t)&&0!==r.move("character",1)&&f==r.parentElement();)c++;else for(r.collapse(!0),c=0;0!==r.compareEndPoints(n?"StartToStart":"StartToEnd",t)&&0!==r.move("character",-1)&&f==r.parentElement();)c++;return{node:l,position:d,offset:c,inside:a}}}function n(){function n(e){var n=t(o,e),r,i,s=0,l,c,u;if(r=n.node,i=n.offset,n.inside&&!r.hasChildNodes())return void a[e?"setStart":"setEnd"](r,0);if(i===c)return void a[e?"setStartBefore":"setEndAfter"](r);if(n.position<0){if(l=n.inside?r.firstChild:r.nextSibling,!l)return void a[e?"setStartAfter":"setEndAfter"](r);if(!i)return void(3==l.nodeType?a[e?"setStart":"setEnd"](l,0):a[e?"setStartBefore":"setEndBefore"](l));for(;l;){if(3==l.nodeType&&(u=l.nodeValue,s+=u.length,s>=i)){r=l,s-=i,s=u.length-s;break}l=l.nextSibling}}else{if(l=r.previousSibling,!l)return a[e?"setStartBefore":"setEndBefore"](r);if(!i)return void(3==r.nodeType?a[e?"setStart":"setEnd"](l,r.nodeValue.length):a[e?"setStartAfter":"setEndAfter"](l));for(;l;){if(3==l.nodeType&&(s+=l.nodeValue.length,s>=i)){r=l,s-=i;break}l=l.previousSibling}}a[e?"setStart":"setEnd"](r,s)}var o=e.getRng(),a=i.createRng(),s,l,c,u,d;if(s=o.item?o.item(0):o.parentElement(),s.ownerDocument!=i.doc)return a;if(l=e.isCollapsed(),o.item)return a.setStart(s.parentNode,i.nodeIndex(s)),a.setEnd(a.startContainer,a.startOffset+1),a;try{n(!0),l||n()}catch(f){if(-2147024809!=f.number)throw f;d=r.getBookmark(2),c=o.duplicate(),c.collapse(!0),s=c.parentElement(),l||(c=o.duplicate(),c.collapse(!1),u=c.parentElement(),u.innerHTML=u.innerHTML),s.innerHTML=s.innerHTML,r.moveToBookmark(d),o=e.getRng(),n(!0),l||n()}return a}var r=this,i=e.dom,o=!1;this.getBookmark=function(n){function r(e){var t,n,r,o,a=[];for(t=e.parentNode,n=i.getRoot().parentNode;t!=n&&9!==t.nodeType;){for(r=t.children,o=r.length;o--;)if(e===r[o]){a.push(o);break}e=t,t=t.parentNode}return a}function o(e){var n;return n=t(a,e),n?{position:n.position,offset:n.offset,indexes:r(n.node),inside:n.inside}:void 0}var a=e.getRng(),s={};return 2===n&&(a.item?s.start={ctrl:!0,indexes:r(a.item(0))}:(s.start=o(!0),e.isCollapsed()||(s.end=o()))),s},this.moveToBookmark=function(e){function t(e){var t,n,r,o;for(t=i.getRoot(),n=e.length-1;n>=0;n--)o=t.children,r=e[n],r<=o.length-1&&(t=o[r]);return t}function n(n){var i=e[n?"start":"end"],a,s,l,c;i&&(a=i.position>0,s=o.createTextRange(),s.moveToElementText(t(i.indexes)),c=i.offset,c!==l?(s.collapse(i.inside||a),s.moveStart("character",a?-c:c)):s.collapse(n),r.setEndPoint(n?"StartToStart":"EndToStart",s),n&&r.collapse(!0))}var r,o=i.doc.body;e.start&&(e.start.ctrl?(r=o.createControlRange(),r.addElement(t(e.start.indexes)),r.select()):(r=o.createTextRange(),n(!0),n(),r.select()))},this.addRange=function(t){function n(e){var t,n,a,d,p;a=i.create("a"),t=e?s:c,n=e?l:u,d=r.duplicate(),(t==f||t==f.documentElement)&&(t=h,n=0),3==t.nodeType?(t.parentNode.insertBefore(a,t),d.moveToElementText(a),d.moveStart("character",n),i.remove(a),r.setEndPoint(e?"StartToStart":"EndToEnd",d)):(p=t.childNodes,p.length?(n>=p.length?i.insertAfter(a,p[p.length-1]):t.insertBefore(a,p[n]),d.moveToElementText(a)):t.canHaveHTML&&(t.innerHTML="<span>&#xFEFF;</span>",a=t.firstChild,d.moveToElementText(a),d.collapse(o)),r.setEndPoint(e?"StartToStart":"EndToEnd",d),i.remove(a))}var r,a,s,l,c,u,d,f=e.dom.doc,h=f.body,p,m;if(s=t.startContainer,l=t.startOffset,c=t.endContainer,u=t.endOffset,r=h.createTextRange(),s==c&&1==s.nodeType){if(l==u&&!s.hasChildNodes()){if(s.canHaveHTML)return d=s.previousSibling,d&&!d.hasChildNodes()&&i.isBlock(d)?d.innerHTML="&#xFEFF;":d=null,s.innerHTML="<span>&#xFEFF;</span><span>&#xFEFF;</span>",r.moveToElementText(s.lastChild),r.select(),i.doc.selection.clear(),s.innerHTML="",void(d&&(d.innerHTML=""));l=i.nodeIndex(s),s=s.parentNode}if(l==u-1)try{if(m=s.childNodes[l],a=h.createControlRange(),a.addElement(m),a.select(),p=e.getRng(),p.item&&m===p.item(0))return}catch(g){}}n(!0),n(),r.select()},this.getRangeAt=n}return e}),r(D,[u],function(e){return{BACKSPACE:8,DELETE:46,DOWN:40,ENTER:13,LEFT:37,RIGHT:39,SPACEBAR:32,TAB:9,UP:38,modifierPressed:function(e){return e.shiftKey||e.ctrlKey||e.altKey||this.metaKeyPressed(e)},metaKeyPressed:function(t){return e.mac?t.metaKey:t.ctrlKey&&!t.altKey}}}),r(M,[D,f,u],function(e,t,n){return function(r,i){function o(e){var t=i.settings.object_resizing;return t===!1||n.iOS?!1:("string"!=typeof t&&(t="table,img,div"),"false"===e.getAttribute("data-mce-resize")?!1:i.dom.is(e,t))}function a(t){var n,r,o,a,s;n=t.screenX-T,r=t.screenY-R,P=n*k[2]+D,O=r*k[3]+M,P=5>P?5:P,O=5>O?5:O,o="IMG"==w.nodeName&&i.settings.resize_img_proportional!==!1?!e.modifierPressed(t):e.modifierPressed(t)||"IMG"==w.nodeName&&k[2]*k[3]!==0,o&&(W(n)>W(r)?(O=V(P*H),P=V(O/H)):(P=V(O/H),O=V(P*H))),x.setStyles(_,{width:P,height:O}),a=k.startPos.x+n,s=k.startPos.y+r,a=a>0?a:0,s=s>0?s:0,x.setStyles(E,{left:a,top:s,display:"block"}),E.innerHTML=P+" &times; "+O,k[2]<0&&_.clientWidth<=P&&x.setStyle(_,"left",A+(D-P)),k[3]<0&&_.clientHeight<=O&&x.setStyle(_,"top",B+(M-O)),n=U.scrollWidth-$,r=U.scrollHeight-q,n+r!==0&&x.setStyles(E,{left:a-n,top:s-r}),L||(i.fire("ObjectResizeStart",{target:w,width:D,height:M}),L=!0)}function s(){function e(e,t){t&&(w.style[e]||!i.schema.isValid(w.nodeName.toLowerCase(),e)?x.setStyle(w,e,t):x.setAttrib(w,e,t))}L=!1,e("width",P),e("height",O),x.unbind(I,"mousemove",a),x.unbind(I,"mouseup",s),F!=I&&(x.unbind(F,"mousemove",a),x.unbind(F,"mouseup",s)),x.remove(_),x.remove(E),z&&"TABLE"!=w.nodeName||l(w),i.fire("ObjectResized",{target:w,width:P,height:O}),x.setAttrib(w,"style",x.getAttrib(w,"style")),i.nodeChanged()}function l(e,t,r){var l,u,d,f,h;g(),l=x.getPos(e,U),A=l.x,B=l.y,h=e.getBoundingClientRect(),u=h.width||h.right-h.left,d=h.height||h.bottom-h.top,w!=e&&(m(),w=e,P=O=0),f=i.fire("ObjectSelected",{target:e}),o(e)&&!f.isDefaultPrevented()?C(N,function(e,i){function o(t){T=t.screenX,R=t.screenY,D=w.clientWidth,M=w.clientHeight,H=M/D,k=e,e.startPos={x:u*e[0]+A,y:d*e[1]+B},$=U.scrollWidth,q=U.scrollHeight,_=w.cloneNode(!0),x.addClass(_,"mce-clonedresizable"),x.setAttrib(_,"data-mce-bogus","all"),_.contentEditable=!1,_.unSelectabe=!0,x.setStyles(_,{left:A,top:B,margin:0}),_.removeAttribute("data-mce-selected"),U.appendChild(_),x.bind(I,"mousemove",a),x.bind(I,"mouseup",s),F!=I&&(x.bind(F,"mousemove",a),x.bind(F,"mouseup",s)),E=x.add(U,"div",{"class":"mce-resize-helper","data-mce-bogus":"all"},D+" &times; "+M)}var l;return t?void(i==t&&o(r)):(l=x.get("mceResizeHandle"+i),l&&x.remove(l),l=x.add(U,"div",{id:"mceResizeHandle"+i,"data-mce-bogus":"all","class":"mce-resizehandle",unselectable:!0,style:"cursor:"+i+"-resize; margin:0; padding:0"}),n.ie&&(l.contentEditable=!1),x.bind(l,"mousedown",function(e){e.stopImmediatePropagation(),e.preventDefault(),o(e)}),e.elm=l,void x.setStyles(l,{left:u*e[0]+A-l.offsetWidth/2,top:d*e[1]+B-l.offsetHeight/2}))}):c(),w.setAttribute("data-mce-selected","1")}function c(){var e,t;g(),w&&w.removeAttribute("data-mce-selected");for(e in N)t=x.get("mceResizeHandle"+e),t&&(x.unbind(t),x.remove(t))}function u(e){function t(e,t){if(e)do if(e===t)return!0;while(e=e.parentNode)}var n,o;if(!L&&!i.removed)return C(x.select("img[data-mce-selected],hr[data-mce-selected]"),function(e){e.removeAttribute("data-mce-selected")}),o="mousedown"==e.type?e.target:r.getNode(),o=x.$(o).closest(z?"table":"table,img,hr")[0],t(o,U)&&(v(),n=r.getStart(!0),
t(n,o)&&t(r.getEnd(!0),o)&&(!z||o!=n&&"IMG"!==n.nodeName))?void l(o):void c()}function d(e,t,n){e&&e.attachEvent&&e.attachEvent("on"+t,n)}function f(e,t,n){e&&e.detachEvent&&e.detachEvent("on"+t,n)}function h(e){var t=e.srcElement,n,r,o,a,s,c,u;n=t.getBoundingClientRect(),c=S.clientX-n.left,u=S.clientY-n.top;for(r in N)if(o=N[r],a=t.offsetWidth*o[0],s=t.offsetHeight*o[1],W(a-c)<8&&W(s-u)<8){k=o;break}L=!0,i.fire("ObjectResizeStart",{target:w,width:w.clientWidth,height:w.clientHeight}),i.getDoc().selection.empty(),l(t,r,S)}function p(e){var t=e.srcElement;if(t!=w){if(i.fire("ObjectSelected",{target:t}),m(),0===t.id.indexOf("mceResizeHandle"))return void(e.returnValue=!1);("IMG"==t.nodeName||"TABLE"==t.nodeName)&&(c(),w=t,d(t,"resizestart",h))}}function m(){f(w,"resizestart",h)}function g(){for(var e in N){var t=N[e];t.elm&&(x.unbind(t.elm),delete t.elm)}}function v(){try{i.getDoc().execCommand("enableObjectResizing",!1,!1)}catch(e){}}function y(e){var t;if(z){t=I.body.createControlRange();try{return t.addElement(e),t.select(),!0}catch(n){}}}function b(){w=_=null,z&&(m(),f(U,"controlselect",p))}var x=i.dom,C=t.each,w,_,E,N,k,S,T,R,A,B,D,M,H,L,P,O,I=i.getDoc(),F=document,z=n.ie&&n.ie<11,W=Math.abs,V=Math.round,U=i.getBody(),$,q;N={nw:[0,0,-1,-1],ne:[1,0,1,-1],se:[1,1,1,1],sw:[0,1,-1,1]};var j=".mce-content-body";return i.contentStyles.push(j+" div.mce-resizehandle {position: absolute;border: 1px solid black;background: #FFF;width: 7px;height: 7px;z-index: 10000}"+j+" .mce-resizehandle:hover {background: #000}"+j+" img[data-mce-selected], hr[data-mce-selected] {outline: 1px solid black;resize: none}"+j+" .mce-clonedresizable {position: absolute;"+(n.gecko?"":"outline: 1px dashed black;")+"opacity: .5;filter: alpha(opacity=50);z-index: 10000}"+j+" .mce-resize-helper {background: #555;background: rgba(0,0,0,0.75);border-radius: 3px;border: 1px;color: white;display: none;font-family: sans-serif;font-size: 12px;white-space: nowrap;line-height: 14px;margin: 5px 10px;padding: 5px;position: absolute;z-index: 10001}"),i.on("init",function(){z?(i.on("ObjectResized",function(e){"TABLE"!=e.target.nodeName&&(c(),y(e.target))}),d(U,"controlselect",p),i.on("mousedown",function(e){S=e})):(v(),n.ie>=11&&(i.on("mousedown click",function(e){var t=e.target.nodeName;!L&&/^(TABLE|IMG|HR)$/.test(t)&&(i.selection.select(e.target,"TABLE"==t),"mousedown"==e.type&&i.nodeChanged())}),i.dom.bind(U,"mscontrolselect",function(e){/^(TABLE|IMG|HR)$/.test(e.target.nodeName)&&(e.preventDefault(),"IMG"==e.target.tagName&&window.setTimeout(function(){i.selection.select(e.target)},0))}))),i.on("nodechange ResizeEditor ResizeWindow drop",function(e){window.requestAnimationFrame?window.requestAnimationFrame(function(){u(e)}):u(e)}),i.on("keydown keyup",function(e){w&&"TABLE"==w.nodeName&&u(e)}),i.on("hide blur",c)}),i.on("remove",g),{isResizable:o,showResizeRect:l,hideResizeRect:c,updateResizeRect:u,controlSelect:y,destroy:b}}}),r(H,[u,f],function(e,t){function n(n){var r=n.dom;this.getBookmark=function(e,i){function o(e,n){var i=0;return t.each(r.select(e),function(e,t){e==n&&(i=t)}),i}function a(e){function t(t){var n,r,i,o=t?"start":"end";n=e[o+"Container"],r=e[o+"Offset"],1==n.nodeType&&"TR"==n.nodeName&&(i=n.childNodes,n=i[Math.min(t?r:r-1,i.length-1)],n&&(r=t?0:n.childNodes.length,e["set"+(t?"Start":"End")](n,r)))}return t(!0),t(),e}function s(){function e(e,t){var n=e[t?"startContainer":"endContainer"],a=e[t?"startOffset":"endOffset"],s=[],l,c,u=0;if(3==n.nodeType){if(i)for(l=n.previousSibling;l&&3==l.nodeType;l=l.previousSibling)a+=l.nodeValue.length;s.push(a)}else c=n.childNodes,a>=c.length&&c.length&&(u=1,a=Math.max(0,c.length-1)),s.push(r.nodeIndex(c[a],i)+u);for(;n&&n!=o;n=n.parentNode)s.push(r.nodeIndex(n,i));return s}var t=n.getRng(!0),o=r.getRoot(),a={};return a.start=e(t,!0),n.isCollapsed()||(a.end=e(t)),a}var l,c,u,d,f,h,p="&#xFEFF;",m;if(2==e)return h=n.getNode(),f=h?h.nodeName:null,"IMG"==f?{name:f,index:o(f,h)}:n.tridentSel?n.tridentSel.getBookmark(e):s();if(e)return{rng:n.getRng()};if(l=n.getRng(),u=r.uniqueId(),d=n.isCollapsed(),m="overflow:hidden;line-height:0px",l.duplicate||l.item){if(l.item)return h=l.item(0),f=h.nodeName,{name:f,index:o(f,h)};c=l.duplicate();try{l.collapse(),l.pasteHTML('<span data-mce-type="bookmark" id="'+u+'_start" style="'+m+'">'+p+"</span>"),d||(c.collapse(!1),l.moveToElementText(c.parentElement()),0===l.compareEndPoints("StartToEnd",c)&&c.move("character",-1),c.pasteHTML('<span data-mce-type="bookmark" id="'+u+'_end" style="'+m+'">'+p+"</span>"))}catch(g){return null}}else{if(h=n.getNode(),f=h.nodeName,"IMG"==f)return{name:f,index:o(f,h)};c=a(l.cloneRange()),d||(c.collapse(!1),c.insertNode(r.create("span",{"data-mce-type":"bookmark",id:u+"_end",style:m},p))),l=a(l),l.collapse(!0),l.insertNode(r.create("span",{"data-mce-type":"bookmark",id:u+"_start",style:m},p))}return n.moveToBookmark({id:u,keep:1}),{id:u}},this.moveToBookmark=function(i){function o(e){var t=i[e?"start":"end"],n,r,o,a;if(t){for(o=t[0],r=c,n=t.length-1;n>=1;n--){if(a=r.childNodes,t[n]>a.length-1)return;r=a[t[n]]}3===r.nodeType&&(o=Math.min(t[0],r.nodeValue.length)),1===r.nodeType&&(o=Math.min(t[0],r.childNodes.length)),e?l.setStart(r,o):l.setEnd(r,o)}return!0}function a(n){var o=r.get(i.id+"_"+n),a,s,l,c,p=i.keep;if(o&&(a=o.parentNode,"start"==n?(p?(a=o.firstChild,s=1):s=r.nodeIndex(o),u=d=a,f=h=s):(p?(a=o.firstChild,s=1):s=r.nodeIndex(o),d=a,h=s),!p)){for(c=o.previousSibling,l=o.nextSibling,t.each(t.grep(o.childNodes),function(e){3==e.nodeType&&(e.nodeValue=e.nodeValue.replace(/\uFEFF/g,""))});o=r.get(i.id+"_"+n);)r.remove(o,1);c&&l&&c.nodeType==l.nodeType&&3==c.nodeType&&!e.opera&&(s=c.nodeValue.length,c.appendData(l.nodeValue),r.remove(l),"start"==n?(u=d=c,f=h=s):(d=c,h=s))}}function s(t){return!r.isBlock(t)||t.innerHTML||e.ie||(t.innerHTML='<br data-mce-bogus="1" />'),t}var l,c,u,d,f,h;if(i)if(i.start){if(l=r.createRng(),c=r.getRoot(),n.tridentSel)return n.tridentSel.moveToBookmark(i);o(!0)&&o()&&n.setRng(l)}else i.id?(a("start"),a("end"),u&&(l=r.createRng(),l.setStart(s(u),f),l.setEnd(s(d),h),n.setRng(l))):i.name?n.select(r.select(i.name)[i.index]):i.rng&&n.setRng(i.rng)}}return n.isBookmarkNode=function(e){return e&&"SPAN"===e.tagName&&"bookmark"===e.getAttribute("data-mce-type")},n}),r(L,[m,B,M,w,H,u,f],function(e,n,r,i,o,a,s){function l(e,t,i,a){var s=this;s.dom=e,s.win=t,s.serializer=i,s.editor=a,s.bookmarkManager=new o(s),s.controlSelection=new r(s,a),s.win.getSelection||(s.tridentSel=new n(s))}var c=s.each,u=s.trim,d=a.ie;return l.prototype={setCursorLocation:function(e,t){var n=this,r=n.dom.createRng();e?(r.setStart(e,t),r.setEnd(e,t),n.setRng(r),n.collapse(!1)):(n._moveEndPoint(r,n.editor.getBody(),!0),n.setRng(r))},getContent:function(e){var n=this,r=n.getRng(),i=n.dom.create("body"),o=n.getSel(),a,s,l;return e=e||{},a=s="",e.get=!0,e.format=e.format||"html",e.selection=!0,n.editor.fire("BeforeGetContent",e),"text"==e.format?n.isCollapsed()?"":r.text||(o.toString?o.toString():""):(r.cloneContents?(l=r.cloneContents(),l&&i.appendChild(l)):r.item!==t||r.htmlText!==t?(i.innerHTML="<br>"+(r.item?r.item(0).outerHTML:r.htmlText),i.removeChild(i.firstChild)):i.innerHTML=r.toString(),/^\s/.test(i.innerHTML)&&(a=" "),/\s+$/.test(i.innerHTML)&&(s=" "),e.getInner=!0,e.content=n.isCollapsed()?"":a+n.serializer.serialize(i,e)+s,n.editor.fire("GetContent",e),e.content)},setContent:function(e,t){var n=this,r=n.getRng(),i,o=n.win.document,a,s;if(t=t||{format:"html"},t.set=!0,t.selection=!0,e=t.content=e,t.no_events||n.editor.fire("BeforeSetContent",t),e=t.content,r.insertNode){e+='<span id="__caret">_</span>',r.startContainer==o&&r.endContainer==o?o.body.innerHTML=e:(r.deleteContents(),0===o.body.childNodes.length?o.body.innerHTML=e:r.createContextualFragment?r.insertNode(r.createContextualFragment(e)):(a=o.createDocumentFragment(),s=o.createElement("div"),a.appendChild(s),s.outerHTML=e,r.insertNode(a))),i=n.dom.get("__caret"),r=o.createRange(),r.setStartBefore(i),r.setEndBefore(i),n.setRng(r),n.dom.remove("__caret");try{n.setRng(r)}catch(l){}}else r.item&&(o.execCommand("Delete",!1,null),r=n.getRng()),/^\s+/.test(e)?(r.pasteHTML('<span id="__mce_tmp">_</span>'+e),n.dom.remove("__mce_tmp")):r.pasteHTML(e);t.no_events||n.editor.fire("SetContent",t)},getStart:function(e){var t=this,n=t.getRng(),r,i,o,a;if(n.duplicate||n.item){if(n.item)return n.item(0);for(o=n.duplicate(),o.collapse(1),r=o.parentElement(),r.ownerDocument!==t.dom.doc&&(r=t.dom.getRoot()),i=a=n.parentElement();a=a.parentNode;)if(a==r){r=i;break}return r}return r=n.startContainer,1==r.nodeType&&r.hasChildNodes()&&(e&&n.collapsed||(r=r.childNodes[Math.min(r.childNodes.length-1,n.startOffset)])),r&&3==r.nodeType?r.parentNode:r},getEnd:function(e){var t=this,n=t.getRng(),r,i;return n.duplicate||n.item?n.item?n.item(0):(n=n.duplicate(),n.collapse(0),r=n.parentElement(),r.ownerDocument!==t.dom.doc&&(r=t.dom.getRoot()),r&&"BODY"==r.nodeName?r.lastChild||r:r):(r=n.endContainer,i=n.endOffset,1==r.nodeType&&r.hasChildNodes()&&(e&&n.collapsed||(r=r.childNodes[i>0?i-1:i])),r&&3==r.nodeType?r.parentNode:r)},getBookmark:function(e,t){return this.bookmarkManager.getBookmark(e,t)},moveToBookmark:function(e){return this.bookmarkManager.moveToBookmark(e)},select:function(e,t){var n=this,r=n.dom,i=r.createRng(),o;if(n.lastFocusBookmark=null,e){if(!t&&n.controlSelection.controlSelect(e))return;o=r.nodeIndex(e),i.setStart(e.parentNode,o),i.setEnd(e.parentNode,o+1),t&&(n._moveEndPoint(i,e,!0),n._moveEndPoint(i,e)),n.setRng(i)}return e},isCollapsed:function(){var e=this,t=e.getRng(),n=e.getSel();return!t||t.item?!1:t.compareEndPoints?0===t.compareEndPoints("StartToEnd",t):!n||t.collapsed},collapse:function(e){var t=this,n=t.getRng(),r;n.item&&(r=n.item(0),n=t.win.document.body.createTextRange(),n.moveToElementText(r)),n.collapse(!!e),t.setRng(n)},getSel:function(){var e=this.win;return e.getSelection?e.getSelection():e.document.selection},getRng:function(e){function t(e,t,n){try{return t.compareBoundaryPoints(e,n)}catch(r){return-1}}var n=this,r,i,o,a=n.win.document,s;if(!e&&n.lastFocusBookmark){var l=n.lastFocusBookmark;return l.startContainer?(i=a.createRange(),i.setStart(l.startContainer,l.startOffset),i.setEnd(l.endContainer,l.endOffset)):i=l,i}if(e&&n.tridentSel)return n.tridentSel.getRangeAt(0);try{(r=n.getSel())&&(i=r.rangeCount>0?r.getRangeAt(0):r.createRange?r.createRange():a.createRange())}catch(c){}if(d&&i&&i.setStart&&a.selection){try{s=a.selection.createRange()}catch(c){}s&&s.item&&(o=s.item(0),i=a.createRange(),i.setStartBefore(o),i.setEndAfter(o))}return i||(i=a.createRange?a.createRange():a.body.createTextRange()),i.setStart&&9===i.startContainer.nodeType&&i.collapsed&&(o=n.dom.getRoot(),i.setStart(o,0),i.setEnd(o,0)),n.selectedRange&&n.explicitRange&&(0===t(i.START_TO_START,i,n.selectedRange)&&0===t(i.END_TO_END,i,n.selectedRange)?i=n.explicitRange:(n.selectedRange=null,n.explicitRange=null)),i},setRng:function(e,t){var n=this,r,i;if(e)if(e.select)try{e.select()}catch(o){}else if(n.tridentSel){if(e.cloneRange)try{return void n.tridentSel.addRange(e)}catch(o){}}else{if(r=n.getSel()){n.explicitRange=e;try{r.removeAllRanges(),r.addRange(e)}catch(o){}t===!1&&r.extend&&(r.collapse(e.endContainer,e.endOffset),r.extend(e.startContainer,e.startOffset)),n.selectedRange=r.rangeCount>0?r.getRangeAt(0):null}e.collapsed||e.startContainer!=e.endContainer||!r.setBaseAndExtent||a.ie||e.endOffset-e.startOffset<2&&e.startContainer.hasChildNodes()&&(i=e.startContainer.childNodes[e.startOffset],i&&"IMG"==i.tagName&&n.getSel().setBaseAndExtent(i,0,i,1))}},setNode:function(e){var t=this;return t.setContent(t.dom.getOuterHTML(e)),e},getNode:function(){function e(e,t){for(var n=e;e&&3===e.nodeType&&0===e.length;)e=t?e.nextSibling:e.previousSibling;return e||n}var t=this,n=t.getRng(),r,i=n.startContainer,o=n.endContainer,a=n.startOffset,s=n.endOffset,l=t.dom.getRoot();return n?n.setStart?(r=n.commonAncestorContainer,!n.collapsed&&(i==o&&2>s-a&&i.hasChildNodes()&&(r=i.childNodes[a]),3===i.nodeType&&3===o.nodeType&&(i=i.length===a?e(i.nextSibling,!0):i.parentNode,o=0===s?e(o.previousSibling,!1):o.parentNode,i&&i===o))?i:r&&3==r.nodeType?r.parentNode:r):(r=n.item?n.item(0):n.parentElement(),r.ownerDocument!==t.win.document&&(r=l),r):l},getSelectedBlocks:function(t,n){var r=this,i=r.dom,o,a,s=[];if(a=i.getRoot(),t=i.getParent(t||r.getStart(),i.isBlock),n=i.getParent(n||r.getEnd(),i.isBlock),t&&t!=a&&s.push(t),t&&n&&t!=n){o=t;for(var l=new e(t,a);(o=l.next())&&o!=n;)i.isBlock(o)&&s.push(o)}return n&&t!=n&&n!=a&&s.push(n),s},isForward:function(){var e=this.dom,t=this.getSel(),n,r;return t&&t.anchorNode&&t.focusNode?(n=e.createRng(),n.setStart(t.anchorNode,t.anchorOffset),n.collapse(!0),r=e.createRng(),r.setStart(t.focusNode,t.focusOffset),r.collapse(!0),n.compareBoundaryPoints(n.START_TO_START,r)<=0):!0},normalize:function(){var e=this,t=e.getRng();return a.range&&new i(e.dom).normalize(t)&&e.setRng(t,e.isForward()),t},selectorChanged:function(e,t){var n=this,r;return n.selectorChangedData||(n.selectorChangedData={},r={},n.editor.on("NodeChange",function(e){var t=e.element,i=n.dom,o=i.getParents(t,null,i.getRoot()),a={};c(n.selectorChangedData,function(e,t){c(o,function(n){return i.is(n,t)?(r[t]||(c(e,function(e){e(!0,{node:n,selector:t,parents:o})}),r[t]=e),a[t]=e,!1):void 0})}),c(r,function(e,n){a[n]||(delete r[n],c(e,function(e){e(!1,{node:t,selector:n,parents:o})}))})})),n.selectorChangedData[e]||(n.selectorChangedData[e]=[]),n.selectorChangedData[e].push(t),n},getScrollContainer:function(){for(var e,t=this.dom.getRoot();t&&"BODY"!=t.nodeName;){if(t.scrollHeight>t.clientHeight){e=t;break}t=t.parentNode}return e},scrollIntoView:function(e){function t(e){for(var t=0,n=0,r=e;r&&r.nodeType;)t+=r.offsetLeft||0,n+=r.offsetTop||0,r=r.offsetParent;return{x:t,y:n}}var n,r,i=this,o=i.dom,a=o.getRoot(),s,l;if("BODY"!=a.nodeName){var c=i.getScrollContainer();if(c)return n=t(e).y-t(c).y,l=c.clientHeight,s=c.scrollTop,void((s>n||n+25>s+l)&&(c.scrollTop=s>n?n:n-l+25))}r=o.getViewPort(i.editor.getWin()),n=o.getPos(e).y,s=r.y,l=r.h,(n<r.y||n+25>s+l)&&i.editor.getWin().scrollTo(0,s>n?n:n-l+25)},placeCaretAt:function(e,t){var n=this.editor.getDoc(),r,i;if(n.caretPositionFromPoint)i=n.caretPositionFromPoint(e,t),r=n.createRange(),r.setStart(i.offsetNode,i.offset),r.collapse(!0);else if(n.caretRangeFromPoint)r=n.caretRangeFromPoint(e,t);else if(n.body.createTextRange){r=n.body.createTextRange();try{r.moveToPoint(e,t),r.collapse(!0)}catch(o){r.collapse(t<n.body.clientHeight)}}this.setRng(r)},_moveEndPoint:function(t,n,r){var i=n,o=new e(n,i),s=this.dom.schema.getNonEmptyElements();do{if(3==n.nodeType&&0!==u(n.nodeValue).length)return void(r?t.setStart(n,0):t.setEnd(n,n.nodeValue.length));if(s[n.nodeName]&&!/^(TD|TH)$/.test(n.nodeName))return void(r?t.setStartBefore(n):"BR"==n.nodeName?t.setEndBefore(n):t.setEndAfter(n));if(a.ie&&a.ie<11&&this.dom.isBlock(n)&&this.dom.isEmpty(n))return void(r?t.setStart(n,0):t.setEnd(n,0))}while(n=r?o.next():o.prev());"BODY"==i.nodeName&&(r?t.setStart(i,0):t.setEnd(i,i.childNodes.length))},destroy:function(){this.win=null,this.controlSelection.destroy()}},l}),r(P,[H,f],function(e,t){function n(t){this.compare=function(n,i){function o(e){var n={};return r(t.getAttribs(e),function(r){var i=r.nodeName.toLowerCase();0!==i.indexOf("_")&&"style"!==i&&"data-mce-style"!==i&&(n[i]=t.getAttrib(e,i))}),n}function a(e,t){var n,r;for(r in e)if(e.hasOwnProperty(r)){if(n=t[r],"undefined"==typeof n)return!1;if(e[r]!=n)return!1;delete t[r]}for(r in t)if(t.hasOwnProperty(r))return!1;return!0}return n.nodeName!=i.nodeName?!1:a(o(n),o(i))&&a(t.parseStyle(t.getAttrib(n,"style")),t.parseStyle(t.getAttrib(i,"style")))?!e.isBookmarkNode(n)&&!e.isBookmarkNode(i):!1}}var r=t.each;return n}),r(O,[f],function(e){function t(e,t){function r(e){return e.replace(/%(\w+)/g,"")}var i,o,a=e.dom,s="",l,c;if(c=e.settings.preview_styles,c===!1)return"";if(c||(c="font-family font-size font-weight font-style text-decoration text-transform color background-color border border-radius outline text-shadow"),"string"==typeof t){if(t=e.formatter.get(t),!t)return;t=t[0]}return i=t.block||t.inline||"span",o=a.create(i),n(t.styles,function(e,t){e=r(e),e&&a.setStyle(o,t,e)}),n(t.attributes,function(e,t){e=r(e),e&&a.setAttrib(o,t,e)}),n(t.classes,function(e){e=r(e),a.hasClass(o,e)||a.addClass(o,e)}),e.fire("PreviewFormats"),a.setStyles(o,{position:"absolute",left:-65535}),e.getBody().appendChild(o),l=a.getStyle(e.getBody(),"fontSize",!0),l=/px$/.test(l)?parseInt(l,10):0,n(c.split(" "),function(t){var n=a.getStyle(o,t,!0);if(!("background-color"==t&&/transparent|rgba\s*\([^)]+,\s*0\)/.test(n)&&(n=a.getStyle(e.getBody(),t,!0),"#ffffff"==a.toHex(n).toLowerCase())||"color"==t&&"#000000"==a.toHex(n).toLowerCase())){if("font-size"==t&&/em|%$/.test(n)){if(0===l)return;n=parseFloat(n,10)/(/%$/.test(n)?100:1),n=n*l+"px"}"border"==t&&n&&(s+="padding:0 2px;"),s+=t+":"+n+";"}}),e.fire("AfterPreviewFormats"),a.remove(o),s}var n=e.each;return{getCssText:t}}),r(I,[m,w,H,P,f,O],function(e,t,n,r,i,o){return function(a){function s(e){return e.nodeType&&(e=e.nodeName),!!a.schema.getTextBlockElements()[e.toLowerCase()]}function l(e){return/^(TH|TD)$/.test(e.nodeName)}function c(e){return e&&/^(IMG)$/.test(e.nodeName)}function u(e,t){return q.getParents(e,t,q.getRoot())}function d(e){return 1===e.nodeType&&"_mce_caret"===e.id}function f(){m({valigntop:[{selector:"td,th",styles:{verticalAlign:"top"}}],valignmiddle:[{selector:"td,th",styles:{verticalAlign:"middle"}}],valignbottom:[{selector:"td,th",styles:{verticalAlign:"bottom"}}],alignleft:[{selector:"figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li",styles:{textAlign:"left"},defaultBlock:"div"},{selector:"img,table",collapsed:!1,styles:{"float":"left"}}],aligncenter:[{selector:"figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li",styles:{textAlign:"center"},defaultBlock:"div"},{selector:"img",collapsed:!1,styles:{display:"block",marginLeft:"auto",marginRight:"auto"}},{selector:"table",collapsed:!1,styles:{marginLeft:"auto",marginRight:"auto"}}],alignright:[{selector:"figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li",styles:{textAlign:"right"},defaultBlock:"div"},{selector:"img,table",collapsed:!1,styles:{"float":"right"}}],alignjustify:[{selector:"figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li",styles:{textAlign:"justify"},defaultBlock:"div"}],bold:[{inline:"strong",remove:"all"},{inline:"span",styles:{fontWeight:"bold"}},{inline:"b",remove:"all"}],italic:[{inline:"em",remove:"all"},{inline:"span",styles:{fontStyle:"italic"}},{inline:"i",remove:"all"}],underline:[{inline:"span",styles:{textDecoration:"underline"},exact:!0},{inline:"u",remove:"all"}],strikethrough:[{inline:"span",styles:{textDecoration:"line-through"},exact:!0},{inline:"strike",remove:"all"}],forecolor:{inline:"span",styles:{color:"%value"},links:!0,remove_similar:!0},hilitecolor:{inline:"span",styles:{backgroundColor:"%value"},links:!0,remove_similar:!0},fontname:{inline:"span",styles:{fontFamily:"%value"}},fontsize:{inline:"span",styles:{fontSize:"%value"}},fontsize_class:{inline:"span",attributes:{"class":"%value"}},blockquote:{block:"blockquote",wrapper:1,remove:"all"},subscript:{inline:"sub"},superscript:{inline:"sup"},code:{inline:"code"},link:{inline:"a",selector:"a",remove:"all",split:!0,deep:!0,onmatch:function(){return!0},onformat:function(e,t,n){le(n,function(t,n){q.setAttrib(e,n,t)})}},removeformat:[{selector:"b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins",remove:"all",split:!0,expand:!1,block_expand:!0,deep:!0},{selector:"span",attributes:["style","class"],remove:"empty",split:!0,expand:!1,deep:!0},{selector:"*",attributes:["style","class"],split:!1,expand:!1,deep:!0}]}),le("p h1 h2 h3 h4 h5 h6 div address pre div dt dd samp".split(/\s/),function(e){m(e,{block:e,remove:"all"})}),m(a.settings.formats)}function h(){a.addShortcut("meta+b","bold_desc","Bold"),a.addShortcut("meta+i","italic_desc","Italic"),a.addShortcut("meta+u","underline_desc","Underline");for(var e=1;6>=e;e++)a.addShortcut("access+"+e,"",["FormatBlock",!1,"h"+e]);a.addShortcut("access+7","",["FormatBlock",!1,"p"]),a.addShortcut("access+8","",["FormatBlock",!1,"div"]),a.addShortcut("access+9","",["FormatBlock",!1,"address"])}function p(e){return e?$[e]:$}function m(e,t){e&&("string"!=typeof e?le(e,function(e,t){m(t,e)}):(t=t.length?t:[t],le(t,function(e){e.deep===re&&(e.deep=!e.selector),e.split===re&&(e.split=!e.selector||e.inline),e.remove===re&&e.selector&&!e.inline&&(e.remove="none"),e.selector&&e.inline&&(e.mixed=!0,e.block_expand=!0),"string"==typeof e.classes&&(e.classes=e.classes.split(/\s+/))}),$[e]=t))}function g(e){return e&&$[e]&&delete $[e],$}function v(e){var t;return a.dom.getParent(e,function(e){return t=a.dom.getStyle(e,"text-decoration"),t&&"none"!==t}),t}function y(e){var t;1===e.nodeType&&e.parentNode&&1===e.parentNode.nodeType&&(t=v(e.parentNode),a.dom.getStyle(e,"color")&&t?a.dom.setStyle(e,"text-decoration",t):a.dom.getStyle(e,"text-decoration")===t&&a.dom.setStyle(e,"text-decoration",null))}function b(t,n,r){function i(e,t){if(t=t||u,e){if(t.onformat&&t.onformat(e,t,n,r),le(t.styles,function(t,r){q.setStyle(e,r,D(t,n))}),t.styles){var i=q.getAttrib(e,"style");i&&e.setAttribute("data-mce-style",i)}le(t.attributes,function(t,r){q.setAttrib(e,r,D(t,n))}),le(t.classes,function(t){t=D(t,n),q.hasClass(e,t)||q.addClass(e,t)})}}function o(){function t(t,n){var i=new e(n);for(r=i.current();r;r=i.prev())if(r.childNodes.length>1||r==t||"BR"==r.tagName)return r}var n=a.selection.getRng(),i=n.startContainer,o=n.endContainer;if(i!=o&&0===n.endOffset){var s=t(i,o),l=3==s.nodeType?s.length:s.childNodes.length;n.setEnd(s,l)}return n}function l(e,r,o){var a=[],l,f,h=!0;l=u.inline||u.block,f=q.create(l),i(f),K.walk(e,function(e){function r(e){var g,v,y,b,x;return x=h,g=e.nodeName.toLowerCase(),v=e.parentNode.nodeName.toLowerCase(),1===e.nodeType&&ie(e)&&(x=h,h="true"===ie(e),b=!0),R(g,"br")?(p=0,void(u.block&&q.remove(e))):u.wrapper&&w(e,t,n)?void(p=0):h&&!b&&u.block&&!u.wrapper&&s(g)&&Y(v,l)?(e=q.rename(e,l),i(e),a.push(e),void(p=0)):u.selector&&(le(c,function(t){"collapsed"in t&&t.collapsed!==m||q.is(e,t.selector)&&!d(e)&&(i(e,t),y=!0)}),!u.inline||y)?void(p=0):void(!h||b||!Y(l,g)||!Y(v,l)||!o&&3===e.nodeType&&1===e.nodeValue.length&&65279===e.nodeValue.charCodeAt(0)||d(e)||u.inline&&G(e)?(p=0,le(ce(e.childNodes),r),b&&(h=x),p=0):(p||(p=q.clone(f,ee),e.parentNode.insertBefore(p,e),a.push(p)),p.appendChild(e)))}var p;le(e,r)}),u.links===!0&&le(a,function(e){function t(e){"A"===e.nodeName&&i(e,u),le(ce(e.childNodes),t)}t(e)}),le(a,function(e){function r(e){var t=0;return le(e.childNodes,function(e){M(e)||se(e)||t++}),t}function o(e){var t,n;return le(e.childNodes,function(e){return 1!=e.nodeType||se(e)||d(e)?void 0:(t=e,ee)}),t&&!se(t)&&T(t,u)&&(n=q.clone(t,ee),i(n),q.replace(n,e,te),q.remove(t,1)),n||e}var s;if(s=r(e),(a.length>1||!G(e))&&0===s)return void q.remove(e,1);if(u.inline||u.wrapper){if(u.exact||1!==s||(e=o(e)),le(c,function(t){le(q.select(t.inline,e),function(e){se(e)||O(t,n,e,t.exact?e:null)})}),w(e.parentNode,t,n))return q.remove(e,1),e=0,te;u.merge_with_parents&&q.getParent(e.parentNode,function(r){return w(r,t,n)?(q.remove(e,1),e=0,te):void 0}),e&&u.merge_siblings!==!1&&(e=z(F(e),e),e=z(e,F(e,te)))}})}var c=p(t),u=c[0],f,h,m=!r&&j.isCollapsed();if(u)if(r)r.nodeType?(h=q.createRng(),h.setStartBefore(r),h.setEndAfter(r),l(L(h,c),null,!0)):l(r,null,!0);else if(m&&u.inline&&!q.select("td.mce-item-selected,th.mce-item-selected").length)V("apply",t,n);else{var g=a.selection.getNode();X||!c[0].defaultBlock||q.getParent(g,q.isBlock)||b(c[0].defaultBlock),a.selection.setRng(o()),f=j.getBookmark(),l(L(j.getRng(te),c),f),u.styles&&(u.styles.color||u.styles.textDecoration)&&(ue(g,y,"childNodes"),y(g)),j.moveToBookmark(f),U(j.getRng(te)),a.nodeChanged()}}function x(e,t,n,r){function i(e){var n,r,o,a,s;if(1===e.nodeType&&ie(e)&&(a=b,b="true"===ie(e),s=!0),n=ce(e.childNodes),b&&!s)for(r=0,o=h.length;o>r&&!O(h[r],t,e,e);r++);if(m.deep&&n.length){for(r=0,o=n.length;o>r;r++)i(n[r]);s&&(b=a)}}function o(n){var i;return le(u(n.parentNode).reverse(),function(n){var o;i||"_start"==n.id||"_end"==n.id||(o=w(n,e,t,r),o&&o.split!==!1&&(i=n))}),i}function s(e,n,r,i){var o,a,s,l,c,u;if(e){for(u=e.parentNode,o=n.parentNode;o&&o!=u;o=o.parentNode){for(a=q.clone(o,ee),c=0;c<h.length;c++)if(O(h[c],t,a,a)){a=0;break}a&&(s&&a.appendChild(s),l||(l=a),s=a)}!i||m.mixed&&G(e)||(n=q.split(e,n)),s&&(r.parentNode.insertBefore(s,r),l.appendChild(r))}return n}function c(e){return s(o(e),e,e,!0)}function d(e){var t=q.get(e?"_start":"_end"),n=t[e?"firstChild":"lastChild"];return se(n)&&(n=n[e?"firstChild":"lastChild"]),3==n.nodeType&&0===n.data.length&&(n=e?t.previousSibling||t.nextSibling:t.nextSibling||t.previousSibling),q.remove(t,!0),n}function f(e){var t,n,r=e.commonAncestorContainer;if(e=L(e,h,te),m.split){if(t=W(e,te),n=W(e),t!=n){if(/^(TR|TH|TD)$/.test(t.nodeName)&&t.firstChild&&(t="TR"==t.nodeName?t.firstChild.firstChild||t:t.firstChild||t),r&&/^T(HEAD|BODY|FOOT|R)$/.test(r.nodeName)&&l(n)&&n.firstChild&&(n=n.firstChild||n),q.isChildOf(t,n)&&!G(n)&&!l(t)&&!l(n))return t=H(t,"span",{id:"_start","data-mce-type":"bookmark"}),c(t),void(t=d(te));t=H(t,"span",{id:"_start","data-mce-type":"bookmark"}),n=H(n,"span",{id:"_end","data-mce-type":"bookmark"}),c(t),c(n),t=d(te),n=d()}else t=n=c(t);e.startContainer=t.parentNode?t.parentNode:t,e.startOffset=J(t),e.endContainer=n.parentNode?n.parentNode:n,e.endOffset=J(n)+1}K.walk(e,function(e){le(e,function(e){i(e),1===e.nodeType&&"underline"===a.dom.getStyle(e,"text-decoration")&&e.parentNode&&"underline"===v(e.parentNode)&&O({deep:!1,exact:!0,inline:"span",styles:{textDecoration:"underline"}},null,e)})})}var h=p(e),m=h[0],g,y,b=!0;return n?void(n.nodeType?(y=q.createRng(),y.setStartBefore(n),y.setEndAfter(n),f(y)):f(n)):void(j.isCollapsed()&&m.inline&&!q.select("td.mce-item-selected,th.mce-item-selected").length?V("remove",e,t,r):(g=j.getBookmark(),f(j.getRng(te)),j.moveToBookmark(g),m.inline&&_(e,t,j.getStart())&&U(j.getRng(!0)),a.nodeChanged()))}function C(e,t,n){var r=p(e);!_(e,t,n)||"toggle"in r[0]&&!r[0].toggle?b(e,t,n):x(e,t,n)}function w(e,t,n,r){function i(e,t,i){var o,a,s=t[i],l;if(t.onmatch)return t.onmatch(e,t,i);if(s)if(s.length===re){for(o in s)if(s.hasOwnProperty(o)){if(a="attributes"===i?q.getAttrib(e,o):A(e,o),r&&!a&&!t.exact)return;if((!r||t.exact)&&!R(a,B(D(s[o],n),o)))return}}else for(l=0;l<s.length;l++)if("attributes"===i?q.getAttrib(e,s[l]):A(e,s[l]))return t;return t}var o=p(t),a,s,l;if(o&&e)for(s=0;s<o.length;s++)if(a=o[s],T(e,a)&&i(e,a,"attributes")&&i(e,a,"styles")){if(l=a.classes)for(s=0;s<l.length;s++)if(!q.hasClass(e,l[s]))return;return a}}function _(e,t,n){function r(n){var r=q.getRoot();return n===r?!1:(n=q.getParent(n,function(n){return n.parentNode===r||!!w(n,e,t,!0)}),w(n,e,t))}var i;return n?r(n):(n=j.getNode(),r(n)?te:(i=j.getStart(),i!=n&&r(i)?te:ee))}function E(e,t){var n,r=[],i={};return n=j.getStart(),q.getParent(n,function(n){var o,a;for(o=0;o<e.length;o++)a=e[o],!i[a]&&w(n,a,t)&&(i[a]=!0,r.push(a))},q.getRoot()),r}function N(e){var t=p(e),n,r,i,o,a;if(t)for(n=j.getStart(),r=u(n),o=t.length-1;o>=0;o--){if(a=t[o].selector,!a||t[o].defaultBlock)return te;for(i=r.length-1;i>=0;i--)if(q.is(r[i],a))return te}return ee}function k(e,t,n){var r;return ne||(ne={},r={},a.on("NodeChange",function(e){var t=u(e.element),n={};t=i.grep(t,function(e){return 1==e.nodeType&&!e.getAttribute("data-mce-bogus")}),le(ne,function(e,i){le(t,function(o){return w(o,i,{},e.similar)?(r[i]||(le(e,function(e){e(!0,{node:o,format:i,parents:t})}),r[i]=e),n[i]=e,!1):void 0})}),le(r,function(i,o){n[o]||(delete r[o],le(i,function(n){n(!1,{node:e.element,format:o,parents:t})}))})})),le(e.split(","),function(e){ne[e]||(ne[e]=[],ne[e].similar=n),ne[e].push(t)}),this}function S(e){return o.getCssText(a,e)}function T(e,t){return R(e,t.inline)?te:R(e,t.block)?te:t.selector?1==e.nodeType&&q.is(e,t.selector):void 0}function R(e,t){return e=e||"",t=t||"",e=""+(e.nodeName||e),t=""+(t.nodeName||t),e.toLowerCase()==t.toLowerCase()}function A(e,t){return B(q.getStyle(e,t),t)}function B(e,t){return("color"==t||"backgroundColor"==t)&&(e=q.toHex(e)),"fontWeight"==t&&700==e&&(e="bold"),"fontFamily"==t&&(e=e.replace(/[\'\"]/g,"").replace(/,\s+/g,",")),""+e}function D(e,t){return"string"!=typeof e?e=e(t):t&&(e=e.replace(/%(\w+)/g,function(e,n){return t[n]||e})),e}function M(e){return e&&3===e.nodeType&&/^([\t \r\n]+|)$/.test(e.nodeValue)}function H(e,t,n){var r=q.create(t,n);return e.parentNode.insertBefore(r,e),r.appendChild(e),r}function L(t,n,r){function i(e){function t(e){return"BR"==e.nodeName&&e.getAttribute("data-mce-bogus")&&!e.nextSibling}var r,i,o,a,s;if(r=i=e?g:y,a=e?"previousSibling":"nextSibling",s=q.getRoot(),3==r.nodeType&&!M(r)&&(e?v>0:b<r.nodeValue.length))return r;for(;;){if(!n[0].block_expand&&G(i))return i;for(o=i[a];o;o=o[a])if(!se(o)&&!M(o)&&!t(o))return i;if(i.parentNode==s){r=i;break}i=i.parentNode}return r}function o(e,t){for(t===re&&(t=3===e.nodeType?e.length:e.childNodes.length);e&&e.hasChildNodes();)e=e.childNodes[t],e&&(t=3===e.nodeType?e.length:e.childNodes.length);return{node:e,offset:t}}function l(e){for(var t=e;t;){if(1===t.nodeType&&ie(t))return"false"===ie(t)?t:e;t=t.parentNode}return e}function c(t,n,i){function o(e,t){var n,o,a=e.nodeValue;return"undefined"==typeof t&&(t=i?a.length:0),i?(n=a.lastIndexOf(" ",t),o=a.lastIndexOf("\xa0",t),n=n>o?n:o,-1===n||r||n++):(n=a.indexOf(" ",t),o=a.indexOf("\xa0",t),n=-1!==n&&(-1===o||o>n)?n:o),n}var s,l,c,u;if(3===t.nodeType){if(c=o(t,n),-1!==c)return{container:t,offset:c};u=t}for(s=new e(t,q.getParent(t,G)||a.getBody());l=s[i?"prev":"next"]();)if(3===l.nodeType){if(u=l,c=o(l),-1!==c)return{container:l,offset:c}}else if(G(l))break;return u?(n=i?0:u.length,{container:u,offset:n}):void 0}function d(e,r){var i,o,a,s;for(3==e.nodeType&&0===e.nodeValue.length&&e[r]&&(e=e[r]),i=u(e),o=0;o<i.length;o++)for(a=0;a<n.length;a++)if(s=n[a],!("collapsed"in s&&s.collapsed!==t.collapsed)&&q.is(i[o],s.selector))return i[o];return e}function f(e,t){var r,i=q.getRoot();if(n[0].wrapper||(r=q.getParent(e,n[0].block,i)),r||(r=q.getParent(3==e.nodeType?e.parentNode:e,function(e){return e!=i&&s(e)})),r&&n[0].wrapper&&(r=u(r,"ul,ol").reverse()[0]||r),!r)for(r=e;r[t]&&!G(r[t])&&(r=r[t],!R(r,"br")););return r||e}var h,p,m,g=t.startContainer,v=t.startOffset,y=t.endContainer,b=t.endOffset;if(1==g.nodeType&&g.hasChildNodes()&&(h=g.childNodes.length-1,g=g.childNodes[v>h?h:v],3==g.nodeType&&(v=0)),1==y.nodeType&&y.hasChildNodes()&&(h=y.childNodes.length-1,y=y.childNodes[b>h?h:b-1],3==y.nodeType&&(b=y.nodeValue.length)),g=l(g),y=l(y),(se(g.parentNode)||se(g))&&(g=se(g)?g:g.parentNode,g=g.nextSibling||g,3==g.nodeType&&(v=0)),(se(y.parentNode)||se(y))&&(y=se(y)?y:y.parentNode,y=y.previousSibling||y,3==y.nodeType&&(b=y.length)),n[0].inline&&(t.collapsed&&(m=c(g,v,!0),m&&(g=m.container,v=m.offset),m=c(y,b),m&&(y=m.container,b=m.offset)),p=o(y,b),p.node)){for(;p.node&&0===p.offset&&p.node.previousSibling;)p=o(p.node.previousSibling);p.node&&p.offset>0&&3===p.node.nodeType&&" "===p.node.nodeValue.charAt(p.offset-1)&&p.offset>1&&(y=p.node,y.splitText(p.offset-1))}return(n[0].inline||n[0].block_expand)&&(n[0].inline&&3==g.nodeType&&0!==v||(g=i(!0)),n[0].inline&&3==y.nodeType&&b!==y.nodeValue.length||(y=i())),n[0].selector&&n[0].expand!==ee&&!n[0].inline&&(g=d(g,"previousSibling"),y=d(y,"nextSibling")),(n[0].block||n[0].selector)&&(g=f(g,"previousSibling"),y=f(y,"nextSibling"),n[0].block&&(G(g)||(g=i(!0)),G(y)||(y=i()))),1==g.nodeType&&(v=J(g),g=g.parentNode),1==y.nodeType&&(b=J(y)+1,y=y.parentNode),{startContainer:g,startOffset:v,endContainer:y,endOffset:b}}function P(e,t){return t.links&&"A"==e.tagName}function O(e,t,n,r){var i,o,a;if(!T(n,e)&&!P(n,e))return ee;if("all"!=e.remove)for(le(e.styles,function(i,o){i=B(D(i,t),o),"number"==typeof o&&(o=i,r=0),(e.remove_similar||!r||R(A(r,o),i))&&q.setStyle(n,o,""),
a=1}),a&&""===q.getAttrib(n,"style")&&(n.removeAttribute("style"),n.removeAttribute("data-mce-style")),le(e.attributes,function(e,i){var o;if(e=D(e,t),"number"==typeof i&&(i=e,r=0),!r||R(q.getAttrib(r,i),e)){if("class"==i&&(e=q.getAttrib(n,i),e&&(o="",le(e.split(/\s+/),function(e){/mce\-\w+/.test(e)&&(o+=(o?" ":"")+e)}),o)))return void q.setAttrib(n,i,o);"class"==i&&n.removeAttribute("className"),Z.test(i)&&n.removeAttribute("data-mce-"+i),n.removeAttribute(i)}}),le(e.classes,function(e){e=D(e,t),(!r||q.hasClass(r,e))&&q.removeClass(n,e)}),o=q.getAttribs(n),i=0;i<o.length;i++)if(0!==o[i].nodeName.indexOf("_"))return ee;return"none"!=e.remove?(I(n,e),te):void 0}function I(e,t){function n(e,t,n){return e=F(e,t,n),!e||"BR"==e.nodeName||G(e)}var r=e.parentNode,i;t.block&&(X?r==q.getRoot()&&(t.list_block&&R(e,t.list_block)||le(ce(e.childNodes),function(e){Y(X,e.nodeName.toLowerCase())?i?i.appendChild(e):(i=H(e,X),q.setAttribs(i,a.settings.forced_root_block_attrs)):i=0})):G(e)&&!G(r)&&(n(e,ee)||n(e.firstChild,te,1)||e.insertBefore(q.create("br"),e.firstChild),n(e,te)||n(e.lastChild,ee,1)||e.appendChild(q.create("br")))),t.selector&&t.inline&&!R(t.inline,e)||q.remove(e,1)}function F(e,t,n){if(e)for(t=t?"nextSibling":"previousSibling",e=n?e:e[t];e;e=e[t])if(1==e.nodeType||!M(e))return e}function z(e,t){function n(e,t){for(i=e;i;i=i[t]){if(3==i.nodeType&&0!==i.nodeValue.length)return e;if(1==i.nodeType&&!se(i))return i}return e}var i,o,a=new r(q);if(e&&t&&(e=n(e,"previousSibling"),t=n(t,"nextSibling"),a.compare(e,t))){for(i=e.nextSibling;i&&i!=t;)o=i,i=i.nextSibling,e.appendChild(o);return q.remove(t),le(ce(t.childNodes),function(t){e.appendChild(t)}),e}return t}function W(t,n){var r,i,o;return r=t[n?"startContainer":"endContainer"],i=t[n?"startOffset":"endOffset"],1==r.nodeType&&(o=r.childNodes.length-1,!n&&i&&i--,r=r.childNodes[i>o?o:i]),3===r.nodeType&&n&&i>=r.nodeValue.length&&(r=new e(r,a.getBody()).next()||r),3!==r.nodeType||n||0!==i||(r=new e(r,a.getBody()).prev()||r),r}function V(t,n,r,i){function o(e){var t=q.create("span",{id:g,"data-mce-bogus":!0,style:v?"color:red":""});return e&&t.appendChild(a.getDoc().createTextNode(Q)),t}function l(e,t){for(;e;){if(3===e.nodeType&&e.nodeValue!==Q||e.childNodes.length>1)return!1;t&&1===e.nodeType&&t.push(e),e=e.firstChild}return!0}function c(e){for(;e;){if(e.id===g)return e;e=e.parentNode}}function u(t){var n;if(t)for(n=new e(t,t),t=n.current();t;t=n.next())if(3===t.nodeType)return t}function d(e,t){var n,r;if(e)r=j.getRng(!0),l(e)?(t!==!1&&(r.setStartBefore(e),r.setEndBefore(e)),q.remove(e)):(n=u(e),n.nodeValue.charAt(0)===Q&&(n.deleteData(0,1),r.startContainer==n&&r.startOffset>0&&r.setStart(n,r.startOffset-1),r.endContainer==n&&r.endOffset>0&&r.setEnd(n,r.endOffset-1)),q.remove(e,1)),j.setRng(r);else if(e=c(j.getStart()),!e)for(;e=q.get(g);)d(e,!1)}function f(){var e,t,i,a,s,l,d;e=j.getRng(!0),a=e.startOffset,l=e.startContainer,d=l.nodeValue,t=c(j.getStart()),t&&(i=u(t)),d&&a>0&&a<d.length&&/\w/.test(d.charAt(a))&&/\w/.test(d.charAt(a-1))?(s=j.getBookmark(),e.collapse(!0),e=L(e,p(n)),e=K.split(e),b(n,r,e),j.moveToBookmark(s)):(t&&i.nodeValue===Q?b(n,r,t):(t=o(!0),i=t.firstChild,e.insertNode(t),a=1,b(n,r,t)),j.setCursorLocation(i,a))}function h(){var e=j.getRng(!0),t,a,l,c,u,d,f=[],h,m;for(t=e.startContainer,a=e.startOffset,u=t,3==t.nodeType&&(a!=t.nodeValue.length&&(c=!0),u=u.parentNode);u;){if(w(u,n,r,i)){d=u;break}u.nextSibling&&(c=!0),f.push(u),u=u.parentNode}if(d)if(c)l=j.getBookmark(),e.collapse(!0),e=L(e,p(n),!0),e=K.split(e),x(n,r,e),j.moveToBookmark(l);else{for(m=o(),u=m,h=f.length-1;h>=0;h--)u.appendChild(q.clone(f[h],!1)),u=u.firstChild;u.appendChild(q.doc.createTextNode(Q)),u=u.firstChild;var g=q.getParent(d,s);g&&q.isEmpty(g)?d.parentNode.replaceChild(m,d):q.insertAfter(m,d),j.setCursorLocation(u,1),q.isEmpty(d)&&q.remove(d)}}function m(){var e;e=c(j.getStart()),e&&!q.isEmpty(e)&&ue(e,function(e){1!=e.nodeType||e.id===g||q.isEmpty(e)||q.setAttrib(e,"data-mce-bogus",null)},"childNodes")}var g="_mce_caret",v=a.settings.caret_debug;a._hasCaretEvents||(ae=function(){var e=[],t;if(l(c(j.getStart()),e))for(t=e.length;t--;)q.setAttrib(e[t],"data-mce-bogus","1")},oe=function(e){var t=e.keyCode;d(),(8==t&&j.isCollapsed()||37==t||39==t)&&d(c(j.getStart())),m()},a.on("SetContent",function(e){e.selection&&m()}),a._hasCaretEvents=!0),"apply"==t?f():h()}function U(t){var n=t.startContainer,r=t.startOffset,i,o,a,s,l;if((t.startContainer!=t.endContainer||!c(t.startContainer.childNodes[t.startOffset]))&&(3==n.nodeType&&r>=n.nodeValue.length&&(r=J(n),n=n.parentNode,i=!0),1==n.nodeType))for(s=n.childNodes,n=s[Math.min(r,s.length-1)],o=new e(n,q.getParent(n,q.isBlock)),(r>s.length-1||i)&&o.next(),a=o.current();a;a=o.next())if(3==a.nodeType&&!M(a))return l=q.create("a",{"data-mce-bogus":"all"},Q),a.parentNode.insertBefore(l,a),t.setStart(a,0),j.setRng(t),void q.remove(l)}var $={},q=a.dom,j=a.selection,K=new t(q),Y=a.schema.isValidChild,G=q.isBlock,X=a.settings.forced_root_block,J=q.nodeIndex,Q="\ufeff",Z=/^(src|href|style)$/,ee=!1,te=!0,ne,re,ie=q.getContentEditable,oe,ae,se=n.isBookmarkNode,le=i.each,ce=i.grep,ue=i.walk,de=i.extend;de(this,{get:p,register:m,unregister:g,apply:b,remove:x,toggle:C,match:_,matchAll:E,matchNode:w,canApply:N,formatChanged:k,getCssText:S}),f(),h(),a.on("BeforeGetContent",function(e){ae&&"raw"!=e.format&&ae()}),a.on("mouseup keydown",function(e){oe&&oe(e)})}}),r(F,[D,u,f,k],function(e,t,n,r){var i=n.trim,o;return o=new RegExp(["<span[^>]+data-mce-bogus[^>]+>[\u200b\ufeff]+<\\/span>",'\\s?data-mce-selected="[^"]+"'].join("|"),"gi"),function(e){function n(){var t=e.getContent({format:"raw",no_events:1}),n=/<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g,a,s,l,c,u,d=e.schema;for(t=t.replace(o,""),u=d.getShortEndedElements();c=n.exec(t);)s=n.lastIndex,l=c[0].length,a=u[c[1]]?s:r.findEndTag(d,t,s),t=t.substring(0,s-l)+t.substring(a),n.lastIndex=s-l;return i(t)}function a(t){e.isNotDirty=!t}function s(e){l.typing=!1,l.add({},e)}var l=this,c=0,u=[],d,f,h=0;return e.on("init",function(){l.add()}),e.on("BeforeExecCommand",function(e){var t=e.command;"Undo"!=t&&"Redo"!=t&&"mceRepaint"!=t&&l.beforeChange()}),e.on("ExecCommand",function(e){var t=e.command;"Undo"!=t&&"Redo"!=t&&"mceRepaint"!=t&&s(e)}),e.on("ObjectResizeStart Cut",function(){l.beforeChange()}),e.on("SaveContent ObjectResized blur",s),e.on("DragEnd",s),e.on("KeyUp",function(r){var i=r.keyCode;r.isDefaultPrevented()||((i>=33&&36>=i||i>=37&&40>=i||45==i||13==i||r.ctrlKey)&&(s(),e.nodeChanged()),(46==i||8==i||t.mac&&(91==i||93==i))&&e.nodeChanged(),f&&l.typing&&(e.isDirty()||(a(u[0]&&n()!=u[0].content),e.isNotDirty||e.fire("change",{level:u[0],lastLevel:null})),e.fire("TypingUndo"),f=!1,e.nodeChanged()))}),e.on("KeyDown",function(e){var t=e.keyCode;if(!e.isDefaultPrevented()){if(t>=33&&36>=t||t>=37&&40>=t||45==t)return void(l.typing&&s(e));var n=e.ctrlKey&&!e.altKey||e.metaKey;!(16>t||t>20)||224==t||91==t||l.typing||n||(l.beforeChange(),l.typing=!0,l.add({},e),f=!0)}}),e.on("MouseDown",function(e){l.typing&&s(e)}),e.addShortcut("meta+z","","Undo"),e.addShortcut("meta+y,meta+shift+z","","Redo"),e.on("AddUndo Undo Redo ClearUndos",function(t){t.isDefaultPrevented()||e.nodeChanged()}),l={data:u,typing:!1,beforeChange:function(){h||(d=e.selection.getBookmark(2,!0))},add:function(t,r){var i,o=e.settings,s;if(t=t||{},t.content=n(),h||e.removed)return null;if(s=u[c],e.fire("BeforeAddUndo",{level:t,lastLevel:s,originalEvent:r}).isDefaultPrevented())return null;if(s&&s.content==t.content)return null;if(u[c]&&(u[c].beforeBookmark=d),o.custom_undo_redo_levels&&u.length>o.custom_undo_redo_levels){for(i=0;i<u.length-1;i++)u[i]=u[i+1];u.length--,c=u.length}t.bookmark=e.selection.getBookmark(2,!0),c<u.length-1&&(u.length=c+1),u.push(t),c=u.length-1;var l={level:t,lastLevel:s,originalEvent:r};return e.fire("AddUndo",l),c>0&&(a(!0),e.fire("change",l)),t},undo:function(){var t;return l.typing&&(l.add(),l.typing=!1),c>0&&(t=u[--c],0===c&&a(!1),e.setContent(t.content,{format:"raw"}),e.selection.moveToBookmark(t.beforeBookmark),e.fire("undo",{level:t})),t},redo:function(){var t;return c<u.length-1&&(t=u[++c],e.setContent(t.content,{format:"raw"}),e.selection.moveToBookmark(t.bookmark),a(!0),e.fire("redo",{level:t})),t},clear:function(){u=[],c=0,l.typing=!1,e.fire("ClearUndos")},hasUndo:function(){return c>0||l.typing&&u[0]&&n()!=u[0].content},hasRedo:function(){return c<u.length-1&&!this.typing},transact:function(e){l.beforeChange();try{h++,e()}finally{h--}l.add()}}}}),r(z,[m,w,u],function(e,t,n){var r=n.ie&&n.ie<11;return function(i){function o(o){function h(e){return e&&a.isBlock(e)&&!/^(TD|TH|CAPTION|FORM)$/.test(e.nodeName)&&!/^(fixed|absolute)/i.test(e.style.position)&&"true"!==a.getContentEditable(e)}function p(e){var t;a.isBlock(e)&&(t=s.getRng(),e.appendChild(a.create("span",null,"\xa0")),s.select(e),e.lastChild.outerHTML="",s.setRng(t))}function m(e){var t=e,n=[],r;if(t){for(;t=t.firstChild;){if(a.isBlock(t))return;1!=t.nodeType||d[t.nodeName.toLowerCase()]||n.push(t)}for(r=n.length;r--;)t=n[r],!t.hasChildNodes()||t.firstChild==t.lastChild&&""===t.firstChild.nodeValue?a.remove(t):"A"==t.nodeName&&" "===(t.innerText||t.textContent)&&a.remove(t)}}function g(t){function r(e){for(;e;){if(1==e.nodeType||3==e.nodeType&&e.data&&/[\r\n\s]/.test(e.data))return e;e=e.nextSibling}}var i,o,l,c=t,u;if(t){if(n.ie&&n.ie<9&&M&&M.firstChild&&M.firstChild==M.lastChild&&"BR"==M.firstChild.tagName&&a.remove(M.firstChild),/^(LI|DT|DD)$/.test(t.nodeName)){var d=r(t.firstChild);d&&/^(UL|OL|DL)$/.test(d.nodeName)&&t.insertBefore(a.doc.createTextNode("\xa0"),t.firstChild)}if(l=a.createRng(),n.ie||t.normalize(),t.hasChildNodes()){for(i=new e(t,t);o=i.current();){if(3==o.nodeType){l.setStart(o,0),l.setEnd(o,0);break}if(f[o.nodeName.toLowerCase()]){l.setStartBefore(o),l.setEndBefore(o);break}c=o,o=i.next()}o||(l.setStart(c,0),l.setEnd(c,0))}else"BR"==t.nodeName?t.nextSibling&&a.isBlock(t.nextSibling)?((!H||9>H)&&(u=a.create("br"),t.parentNode.insertBefore(u,t)),l.setStartBefore(t),l.setEndBefore(t)):(l.setStartAfter(t),l.setEndAfter(t)):(l.setStart(t,0),l.setEnd(t,0));s.setRng(l),a.remove(u),s.scrollIntoView(t)}}function v(e){var t=l.forced_root_block;t&&t.toLowerCase()===e.tagName.toLowerCase()&&a.setAttribs(e,l.forced_root_block_attrs)}function y(e){e.innerHTML=r?"":'<br data-mce-bogus="1">'}function b(e){var t=B,n,i,o,s=u.getTextInlineElements();if(e||"TABLE"==F?(n=a.create(e||W),v(n)):n=M.cloneNode(!1),o=n,l.keep_styles!==!1)do if(s[t.nodeName]){if("_mce_caret"==t.id)continue;i=t.cloneNode(!1),a.setAttrib(i,"id",""),n.hasChildNodes()?(i.appendChild(n.firstChild),n.appendChild(i)):(o=i,n.appendChild(i))}while(t=t.parentNode);return r||(o.innerHTML='<br data-mce-bogus="1">'),n}function x(t){var n,r,i;if(3==B.nodeType&&(t?D>0:D<B.nodeValue.length))return!1;if(B.parentNode==M&&V&&!t)return!0;if(t&&1==B.nodeType&&B==M.firstChild)return!0;if("TABLE"===B.nodeName||B.previousSibling&&"TABLE"==B.previousSibling.nodeName)return V&&!t||!V&&t;for(n=new e(B,M),3==B.nodeType&&(t&&0===D?n.prev():t||D!=B.nodeValue.length||n.next());r=n.current();){if(1===r.nodeType){if(!r.getAttribute("data-mce-bogus")&&(i=r.nodeName.toLowerCase(),d[i]&&"br"!==i))return!1}else if(3===r.nodeType&&!/^[ \t\r\n]*$/.test(r.nodeValue))return!1;t?n.prev():n.next()}return!0}function C(e,t){var n,r,o,s,l,c,d=W||"P";if(r=a.getParent(e,a.isBlock),c=i.getBody().nodeName.toLowerCase(),!r||!h(r)){if(r=r||A,!r.hasChildNodes())return n=a.create(d),v(n),r.appendChild(n),T.setStart(n,0),T.setEnd(n,0),n;for(s=e;s.parentNode!=r;)s=s.parentNode;for(;s&&!a.isBlock(s);)o=s,s=s.previousSibling;if(o&&u.isValidChild(c,d.toLowerCase())){for(n=a.create(d),v(n),o.parentNode.insertBefore(n,o),s=o;s&&!a.isBlock(s);)l=s.nextSibling,n.appendChild(s),s=l;T.setStart(e,t),T.setEnd(e,t)}}return e}function w(){function e(e){for(var t=I[e?"firstChild":"lastChild"];t&&1!=t.nodeType;)t=t[e?"nextSibling":"previousSibling"];return t===M}function t(){var e=I.parentNode;return/^(LI|DT|DD)$/.test(e.nodeName)?e:I}var n=I.parentNode.nodeName;/^(OL|UL|LI)$/.test(n)&&(W="LI"),P=W?b(W):a.create("BR"),e(!0)&&e()?"LI"==n?a.insertAfter(P,t()):a.replace(P,I):e(!0)?"LI"==n?(a.insertAfter(P,t()),P.appendChild(a.doc.createTextNode(" ")),P.appendChild(I)):I.parentNode.insertBefore(P,I):e()?(a.insertAfter(P,t()),p(P)):(I=t(),R=T.cloneRange(),R.setStartAfter(M),R.setEndAfter(I),O=R.extractContents(),"LI"==W&&"LI"==O.firstChild.nodeName?(P=O.firstChild,a.insertAfter(O,I)):(a.insertAfter(O,I),a.insertAfter(P,I))),a.remove(M),g(P),c.add()}function _(){i.execCommand("InsertLineBreak",!1,o)}function E(e){do 3===e.nodeType&&(e.nodeValue=e.nodeValue.replace(/^[\r\n]+/,"")),e=e.firstChild;while(e)}function N(e){var t=a.getRoot(),n,r;for(n=e;n!==t&&"false"!==a.getContentEditable(n);)"true"===a.getContentEditable(n)&&(r=n),n=n.parentNode;return n!==t?r:t}function k(e){var t;r||(e.normalize(),t=e.lastChild,(!t||/^(left|right)$/gi.test(a.getStyle(t,"float",!0)))&&a.add(e,"br"))}function S(){P=/^(H[1-6]|PRE|FIGURE)$/.test(F)&&"HGROUP"!=z?b(W):b(),l.end_container_on_empty_block&&h(I)&&a.isEmpty(M)?P=a.split(I,M):a.insertAfter(P,M),g(P)}var T,R,A,B,D,M,H,L,P,O,I,F,z,W,V;if(T=s.getRng(!0),!o.isDefaultPrevented()){if(!T.collapsed)return void i.execCommand("Delete");if(new t(a).normalize(T),B=T.startContainer,D=T.startOffset,W=(l.force_p_newlines?"p":"")||l.forced_root_block,W=W?W.toUpperCase():"",H=a.doc.documentMode,L=o.shiftKey,1==B.nodeType&&B.hasChildNodes()&&(V=D>B.childNodes.length-1,B=B.childNodes[Math.min(D,B.childNodes.length-1)]||B,D=V&&3==B.nodeType?B.nodeValue.length:0),A=N(B)){if(c.beforeChange(),!a.isBlock(A)&&A!=a.getRoot())return void((!W||L)&&_());if((W&&!L||!W&&L)&&(B=C(B,D)),M=a.getParent(B,a.isBlock),I=M?a.getParent(M.parentNode,a.isBlock):null,F=M?M.nodeName.toUpperCase():"",z=I?I.nodeName.toUpperCase():"","LI"!=z||o.ctrlKey||(M=I,F=z),/^(LI|DT|DD)$/.test(F)){if(!W&&L)return void _();if(a.isEmpty(M))return void w()}if("PRE"==F&&l.br_in_pre!==!1){if(!L)return void _()}else if(!W&&!L&&"LI"!=F||W&&L)return void _();W&&M===i.getBody()||(W=W||"P",x()?S():x(!0)?(P=M.parentNode.insertBefore(b(),M),p(P),g(M)):(R=T.cloneRange(),R.setEndAfter(M),O=R.extractContents(),E(O),P=O.firstChild,a.insertAfter(O,M),m(P),k(M),a.isEmpty(M)&&y(M),a.isEmpty(P)?(a.remove(P),S()):g(P)),a.setAttrib(P,"id",""),i.fire("NewBlock",{newBlock:P}),c.add())}}}var a=i.dom,s=i.selection,l=i.settings,c=i.undoManager,u=i.schema,d=u.getNonEmptyElements(),f=u.getMoveCaretBeforeOnEnterElements();i.on("keydown",function(e){13==e.keyCode&&o(e)!==!1&&e.preventDefault()})}}),r(W,[],function(){return function(e){function t(){var t=i.getStart(),s=e.getBody(),l,c,u,d,f,h,p,m=-16777215,g,v,y,b,x;if(x=n.forced_root_block,t&&1===t.nodeType&&x){for(;t&&t!=s;){if(a[t.nodeName])return;t=t.parentNode}if(l=i.getRng(),l.setStart){c=l.startContainer,u=l.startOffset,d=l.endContainer,f=l.endOffset;try{v=e.getDoc().activeElement===s}catch(C){}}else l.item&&(t=l.item(0),l=e.getDoc().body.createTextRange(),l.moveToElementText(t)),v=l.parentElement().ownerDocument===e.getDoc(),y=l.duplicate(),y.collapse(!0),u=-1*y.move("character",m),y.collapsed||(y=l.duplicate(),y.collapse(!1),f=-1*y.move("character",m)-u);for(t=s.firstChild,b=s.nodeName.toLowerCase();t;)if((3===t.nodeType||1==t.nodeType&&!a[t.nodeName])&&o.isValidChild(b,x.toLowerCase())){if(3===t.nodeType&&0===t.nodeValue.length){p=t,t=t.nextSibling,r.remove(p);continue}h||(h=r.create(x,e.settings.forced_root_block_attrs),t.parentNode.insertBefore(h,t),g=!0),p=t,t=t.nextSibling,h.appendChild(p)}else h=null,t=t.nextSibling;if(g&&v){if(l.setStart)l.setStart(c,u),l.setEnd(d,f),i.setRng(l);else try{l=e.getDoc().body.createTextRange(),l.moveToElementText(s),l.collapse(!0),l.moveStart("character",u),f>0&&l.moveEnd("character",f),l.select()}catch(C){}e.nodeChanged()}}}var n=e.settings,r=e.dom,i=e.selection,o=e.schema,a=o.getBlockElements();n.forced_root_block&&e.on("NodeChange",t)}}),r(V,[R,u,f,P,w,m],function(e,n,r,i,o,a){var s=r.each,l=r.extend,c=r.map,u=r.inArray,d=r.explode,f=n.gecko,h=n.ie,p=n.ie&&n.ie<11,m=!0,g=!1;return function(r){function v(e,t,n,i){var o,a,c=0;if(/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(e)||i&&i.skip_focus||r.focus(),i=l({},i),i=r.fire("BeforeExecCommand",{command:e,ui:t,value:n}),i.isDefaultPrevented())return!1;if(a=e.toLowerCase(),o=H.exec[a])return o(a,t,n),r.fire("ExecCommand",{command:e,ui:t,value:n}),!0;if(s(r.plugins,function(i){return i.execCommand&&i.execCommand(e,t,n)?(r.fire("ExecCommand",{command:e,ui:t,value:n}),c=!0,!1):void 0}),c)return c;if(r.theme&&r.theme.execCommand&&r.theme.execCommand(e,t,n))return r.fire("ExecCommand",{command:e,ui:t,value:n}),!0;try{c=r.getDoc().execCommand(e,t,n)}catch(u){}return c?(r.fire("ExecCommand",{command:e,ui:t,value:n}),!0):!1}function y(e){var t;if(!r._isHidden()){if(e=e.toLowerCase(),t=H.state[e])return t(e);try{return r.getDoc().queryCommandState(e)}catch(n){}return!1}}function b(e){var t;if(!r._isHidden()){if(e=e.toLowerCase(),t=H.value[e])return t(e);try{return r.getDoc().queryCommandValue(e)}catch(n){}}}function x(e,t){t=t||"exec",s(e,function(e,n){s(n.toLowerCase().split(","),function(n){H[t][n]=e})})}function C(e,t,n){e=e.toLowerCase(),H.exec[e]=function(e,i,o,a){return t.call(n||r,i,o,a)}}function w(e){if(e=e.toLowerCase(),H.exec[e])return!0;try{return r.getDoc().queryCommandSupported(e)}catch(t){}return!1}function _(e,t,n){e=e.toLowerCase(),H.state[e]=function(){return t.call(n||r)}}function E(e,t,n){e=e.toLowerCase(),H.value[e]=function(){return t.call(n||r)}}function N(e){return e=e.toLowerCase(),!!H.exec[e]}function k(e,n,i){return n===t&&(n=g),i===t&&(i=null),r.getDoc().execCommand(e,n,i)}function S(e){return M.match(e)}function T(e,n){M.toggle(e,n?{value:n}:t),r.nodeChanged()}function R(e){P=D.getBookmark(e)}function A(){D.moveToBookmark(P)}var B,D,M,H={state:{},exec:{},value:{}},L=r.settings,P;r.on("PreInit",function(){B=r.dom,D=r.selection,L=r.settings,M=r.formatter}),l(this,{execCommand:v,queryCommandState:y,queryCommandValue:b,queryCommandSupported:w,addCommands:x,addCommand:C,addQueryStateHandler:_,addQueryValueHandler:E,hasCustomCommand:N}),x({"mceResetDesignMode,mceBeginUndoLevel":function(){},"mceEndUndoLevel,mceAddUndoLevel":function(){r.undoManager.add()},"Cut,Copy,Paste":function(e){var t=r.getDoc(),i;try{k(e)}catch(o){i=m}if(i||!t.queryCommandSupported(e)){var a=r.translate("Your browser doesn't support direct access to the clipboard. Please use the Ctrl+X/C/V keyboard shortcuts instead.");n.mac&&(a=a.replace(/Ctrl\+/g,"\u2318+")),r.windowManager.alert(a)}},unlink:function(){if(D.isCollapsed()){var e=D.getNode();return void("A"==e.tagName&&r.dom.remove(e,!0))}M.remove("link")},"JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone":function(e){var t=e.substring(7);"full"==t&&(t="justify"),s("left,center,right,justify".split(","),function(e){t!=e&&M.remove("align"+e)}),"none"!=t&&(T("align"+t),v("mceRepaint"))},"InsertUnorderedList,InsertOrderedList":function(e){var t,n;k(e),t=B.getParent(D.getNode(),"ol,ul"),t&&(n=t.parentNode,/^(H[1-6]|P|ADDRESS|PRE)$/.test(n.nodeName)&&(R(),B.split(n,t),A()))},"Bold,Italic,Underline,Strikethrough,Superscript,Subscript":function(e){T(e)},"ForeColor,HiliteColor,FontName":function(e,t,n){T(e,n)},FontSize:function(e,t,n){var r,i;n>=1&&7>=n&&(i=d(L.font_size_style_values),r=d(L.font_size_classes),n=r?r[n-1]||n:i[n-1]||n),T(e,n)},RemoveFormat:function(e){M.remove(e)},mceBlockQuote:function(){T("blockquote")},FormatBlock:function(e,t,n){return T(n||"p")},mceCleanup:function(){var e=D.getBookmark();r.setContent(r.getContent({cleanup:m}),{cleanup:m}),D.moveToBookmark(e)},mceRemoveNode:function(e,t,n){var i=n||D.getNode();i!=r.getBody()&&(R(),r.dom.remove(i,m),A())},mceSelectNodeDepth:function(e,t,n){var i=0;B.getParent(D.getNode(),function(e){return 1==e.nodeType&&i++==n?(D.select(e),g):void 0},r.getBody())},mceSelectNode:function(e,t,n){D.select(n)},mceInsertContent:function(t,n,o){function a(e){function t(e){return r[e]&&3==r[e].nodeType}var n,r,i;return n=D.getRng(!0),r=n.startContainer,i=n.startOffset,3==r.nodeType&&(i>0?e=e.replace(/^&nbsp;/," "):t("previousSibling")||(e=e.replace(/^ /,"&nbsp;")),i<r.length?e=e.replace(/&nbsp;(<br>|)$/," "):t("nextSibling")||(e=e.replace(/(&nbsp;| )(<br>|)$/,"&nbsp;"))),e}function l(){var e,t,n;e=D.getRng(!0),t=e.startContainer,n=e.startOffset,3==t.nodeType&&e.collapsed&&("\xa0"===t.data[n]?(t.deleteData(n,1),/[\u00a0| ]$/.test(o)||(o+=" ")):"\xa0"===t.data[n-1]&&(t.deleteData(n-1,1),/[\u00a0| ]$/.test(o)||(o=" "+o)))}function c(e){if(_)for(x=e.firstChild;x;x=x.walk(!0))N[x.name]&&x.attr("data-mce-new","true")}function u(){if(_){var e=r.getBody(),t=new i(B);s(B.select("*[data-mce-new]"),function(n){n.removeAttribute("data-mce-new");for(var r=n.parentNode;r&&r!=e;r=r.parentNode)t.compare(r,n)&&B.remove(n,!0)})}}var d,f,p,m,g,v,y,b,x,C,w,_,E,N=r.schema.getTextInlineElements();"string"!=typeof o&&(_=o.merge,E=o.data,o=o.content),/^ | $/.test(o)&&(o=a(o)),d=r.parser,f=new e({},r.schema),w='<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#x200B;</span>',v={content:o,format:"html",selection:!0},r.fire("BeforeSetContent",v),o=v.content,-1==o.indexOf("{$caret}")&&(o+="{$caret}"),o=o.replace(/\{\$caret\}/,w),b=D.getRng();var k=b.startContainer||(b.parentElement?b.parentElement():null),S=r.getBody();k===S&&D.isCollapsed()&&B.isBlock(S.firstChild)&&B.isEmpty(S.firstChild)&&(b=B.createRng(),b.setStart(S.firstChild,0),b.setEnd(S.firstChild,0),D.setRng(b)),D.isCollapsed()||(r.getDoc().execCommand("Delete",!1,null),l()),p=D.getNode();var T={context:p.nodeName.toLowerCase(),data:E};if(g=d.parse(o,T),c(g),x=g.lastChild,"mce_marker"==x.attr("id"))for(y=x,x=x.prev;x;x=x.walk(!0))if(3==x.type||!B.isBlock(x.name)){r.schema.isValidChild(x.parent.name,"span")&&x.parent.insert(y,x,"br"===x.name);break}if(T.invalid){for(D.setContent(w),p=D.getNode(),m=r.getBody(),9==p.nodeType?p=x=m:x=p;x!==m;)p=x,x=x.parentNode;o=p==m?m.innerHTML:B.getOuterHTML(p),o=f.serialize(d.parse(o.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i,function(){return f.serialize(g)}))),p==m?B.setHTML(m,o):B.setOuterHTML(p,o)}else o=f.serialize(g),x=p.firstChild,C=p.lastChild,!x||x===C&&"BR"===x.nodeName?B.setHTML(p,o):D.setContent(o);u(),y=B.get("mce_marker"),D.scrollIntoView(y),b=B.createRng(),x=y.previousSibling,x&&3==x.nodeType?(b.setStart(x,x.nodeValue.length),h||(C=y.nextSibling,C&&3==C.nodeType&&(x.appendData(C.data),C.parentNode.removeChild(C)))):(b.setStartBefore(y),b.setEndBefore(y)),B.remove(y),D.setRng(b),r.fire("SetContent",v),r.addVisual()},mceInsertRawHTML:function(e,t,n){D.setContent("tiny_mce_marker"),r.setContent(r.getContent().replace(/tiny_mce_marker/g,function(){return n}))},mceToggleFormat:function(e,t,n){T(n)},mceSetContent:function(e,t,n){r.setContent(n)},"Indent,Outdent":function(e){var t,n,i;t=L.indentation,n=/[a-z%]+$/i.exec(t),t=parseInt(t,10),y("InsertUnorderedList")||y("InsertOrderedList")?k(e):(L.forced_root_block||B.getParent(D.getNode(),B.isBlock)||M.apply("div"),s(D.getSelectedBlocks(),function(o){if("LI"!=o.nodeName){var a=r.getParam("indent_use_margin",!1)?"margin":"padding";a+="rtl"==B.getStyle(o,"direction",!0)?"Right":"Left","outdent"==e?(i=Math.max(0,parseInt(o.style[a]||0,10)-t),B.setStyle(o,a,i?i+n:"")):(i=parseInt(o.style[a]||0,10)+t+n,B.setStyle(o,a,i))}}))},mceRepaint:function(){if(f)try{R(m),D.getSel()&&D.getSel().selectAllChildren(r.getBody()),D.collapse(m),A()}catch(e){}},InsertHorizontalRule:function(){r.execCommand("mceInsertContent",!1,"<hr />")},mceToggleVisualAid:function(){r.hasVisual=!r.hasVisual,r.addVisual()},mceReplaceContent:function(e,t,n){r.execCommand("mceInsertContent",!1,n.replace(/\{\$selection\}/g,D.getContent({format:"text"})))},mceInsertLink:function(e,t,n){var r;"string"==typeof n&&(n={href:n}),r=B.getParent(D.getNode(),"a"),n.href=n.href.replace(" ","%20"),r&&n.href||M.remove("link"),n.href&&M.apply("link",n,r)},selectAll:function(){var e=B.getRoot(),t;D.getRng().setStart?(t=B.createRng(),t.setStart(e,0),t.setEnd(e,e.childNodes.length),D.setRng(t)):(t=D.getRng(),t.item||(t.moveToElementText(e),t.select()))},"delete":function(){k("Delete");var e=r.getBody();B.isEmpty(e)&&(r.setContent(""),e.firstChild&&B.isBlock(e.firstChild)?r.selection.setCursorLocation(e.firstChild,0):r.selection.setCursorLocation(e,0))},mceNewDocument:function(){r.setContent("")},InsertLineBreak:function(e,t,n){function i(){for(var e=new a(h,v),t,n=r.schema.getNonEmptyElements();t=e.next();)if(n[t.nodeName.toLowerCase()]||t.length>0)return!0}var s=n,l,c,u,d=D.getRng(!0);new o(B).normalize(d);var f=d.startOffset,h=d.startContainer;if(1==h.nodeType&&h.hasChildNodes()){var g=f>h.childNodes.length-1;h=h.childNodes[Math.min(f,h.childNodes.length-1)]||h,f=g&&3==h.nodeType?h.nodeValue.length:0}var v=B.getParent(h,B.isBlock),y=v?v.nodeName.toUpperCase():"",b=v?B.getParent(v.parentNode,B.isBlock):null,x=b?b.nodeName.toUpperCase():"",C=s&&s.ctrlKey;"LI"!=x||C||(v=b,y=x),h&&3==h.nodeType&&f>=h.nodeValue.length&&(p||i()||(l=B.create("br"),d.insertNode(l),d.setStartAfter(l),d.setEndAfter(l),c=!0)),l=B.create("br"),d.insertNode(l);var w=B.doc.documentMode;return p&&"PRE"==y&&(!w||8>w)&&l.parentNode.insertBefore(B.doc.createTextNode("\r"),l),u=B.create("span",{},"&nbsp;"),l.parentNode.insertBefore(u,l),D.scrollIntoView(u),B.remove(u),c?(d.setStartBefore(l),d.setEndBefore(l)):(d.setStartAfter(l),d.setEndAfter(l)),D.setRng(d),r.undoManager.add(),m}}),x({"JustifyLeft,JustifyCenter,JustifyRight,JustifyFull":function(e){var t="align"+e.substring(7),n=D.isCollapsed()?[B.getParent(D.getNode(),B.isBlock)]:D.getSelectedBlocks(),r=c(n,function(e){return!!M.matchNode(e,t)});return-1!==u(r,m)},"Bold,Italic,Underline,Strikethrough,Superscript,Subscript":function(e){return S(e)},mceBlockQuote:function(){return S("blockquote")},Outdent:function(){var e;if(L.inline_styles){if((e=B.getParent(D.getStart(),B.isBlock))&&parseInt(e.style.paddingLeft,10)>0)return m;if((e=B.getParent(D.getEnd(),B.isBlock))&&parseInt(e.style.paddingLeft,10)>0)return m}return y("InsertUnorderedList")||y("InsertOrderedList")||!L.inline_styles&&!!B.getParent(D.getNode(),"BLOCKQUOTE")},"InsertUnorderedList,InsertOrderedList":function(e){var t=B.getParent(D.getNode(),"ul,ol");return t&&("insertunorderedlist"===e&&"UL"===t.tagName||"insertorderedlist"===e&&"OL"===t.tagName)}},"state"),x({"FontSize,FontName":function(e){var t=0,n;return(n=B.getParent(D.getNode(),"span"))&&(t="fontsize"==e?n.style.fontSize:n.style.fontFamily.replace(/, /g,",").replace(/[\'\"]/g,"").toLowerCase()),t}},"value"),x({Undo:function(){r.undoManager.undo()},Redo:function(){r.undoManager.redo()}})}}),r(U,[f],function(e){function t(e,o){var a=this,s,l;if(e=r(e),o=a.settings=o||{},s=o.base_uri,/^([\w\-]+):([^\/]{2})/i.test(e)||/^\s*#/.test(e))return void(a.source=e);var c=0===e.indexOf("//");0!==e.indexOf("/")||c||(e=(s?s.protocol||"http":"http")+"://mce_host"+e),/^[\w\-]*:?\/\//.test(e)||(l=o.base_uri?o.base_uri.path:new t(location.href).directory,""===o.base_uri.protocol?e="//mce_host"+a.toAbsPath(l,e):(e=/([^#?]*)([#?]?.*)/.exec(e),e=(s&&s.protocol||"http")+"://mce_host"+a.toAbsPath(l,e[1])+e[2])),e=e.replace(/@@/g,"(mce_at)"),e=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(e),n(i,function(t,n){var r=e[n];r&&(r=r.replace(/\(mce_at\)/g,"@@")),a[t]=r}),s&&(a.protocol||(a.protocol=s.protocol),a.userInfo||(a.userInfo=s.userInfo),a.port||"mce_host"!==a.host||(a.port=s.port),a.host&&"mce_host"!==a.host||(a.host=s.host),a.source=""),c&&(a.protocol="")}var n=e.each,r=e.trim,i="source protocol authority userInfo user password host port relative path directory file query anchor".split(" "),o={ftp:21,http:80,https:443,mailto:25};return t.prototype={setPath:function(e){var t=this;e=/^(.*?)\/?(\w+)?$/.exec(e),t.path=e[0],t.directory=e[1],t.file=e[2],t.source="",t.getURI()},toRelative:function(e){var n=this,r;if("./"===e)return e;if(e=new t(e,{base_uri:n}),"mce_host"!=e.host&&n.host!=e.host&&e.host||n.port!=e.port||n.protocol!=e.protocol&&""!==e.protocol)return e.getURI();var i=n.getURI(),o=e.getURI();return i==o||"/"==i.charAt(i.length-1)&&i.substr(0,i.length-1)==o?i:(r=n.toRelPath(n.path,e.path),e.query&&(r+="?"+e.query),e.anchor&&(r+="#"+e.anchor),r)},toAbsolute:function(e,n){return e=new t(e,{base_uri:this}),e.getURI(n&&this.isSameOrigin(e))},isSameOrigin:function(e){if(this.host==e.host&&this.protocol==e.protocol){if(this.port==e.port)return!0;var t=o[this.protocol];if(t&&(this.port||t)==(e.port||t))return!0}return!1},toRelPath:function(e,t){var n,r=0,i="",o,a;if(e=e.substring(0,e.lastIndexOf("/")),e=e.split("/"),n=t.split("/"),e.length>=n.length)for(o=0,a=e.length;a>o;o++)if(o>=n.length||e[o]!=n[o]){r=o+1;break}if(e.length<n.length)for(o=0,a=n.length;a>o;o++)if(o>=e.length||e[o]!=n[o]){r=o+1;break}if(1===r)return t;for(o=0,a=e.length-(r-1);a>o;o++)i+="../";for(o=r-1,a=n.length;a>o;o++)i+=o!=r-1?"/"+n[o]:n[o];return i},toAbsPath:function(e,t){var r,i=0,o=[],a,s;for(a=/\/$/.test(t)?"/":"",e=e.split("/"),t=t.split("/"),n(e,function(e){e&&o.push(e)}),e=o,r=t.length-1,o=[];r>=0;r--)0!==t[r].length&&"."!==t[r]&&(".."!==t[r]?i>0?i--:o.push(t[r]):i++);return r=e.length-i,s=0>=r?o.reverse().join("/"):e.slice(0,r).join("/")+"/"+o.reverse().join("/"),0!==s.indexOf("/")&&(s="/"+s),a&&s.lastIndexOf("/")!==s.length-1&&(s+=a),s},getURI:function(e){var t,n=this;return(!n.source||e)&&(t="",e||(t+=n.protocol?n.protocol+"://":"//",n.userInfo&&(t+=n.userInfo+"@"),n.host&&(t+=n.host),n.port&&(t+=":"+n.port)),n.path&&(t+=n.path),n.query&&(t+="?"+n.query),n.anchor&&(t+="#"+n.anchor),n.source=t),n.source}},t.parseDataUri=function(e){var t,n;return e=decodeURIComponent(e).split(","),n=/data:([^;]+)/.exec(e[0]),n&&(t=n[1]),{type:t,data:e[1]}},t}),r($,[f],function(e){function t(){}var n=e.each,r=e.extend,i,o;return t.extend=i=function(e){function t(){var e,t,n,r=this;if(!o&&(r.init&&r.init.apply(r,arguments),t=r.Mixins))for(e=t.length;e--;)n=t[e],n.init&&n.init.apply(r,arguments)}function a(){return this}function s(e,t){return function(){var n=this,r=n._super,i;return n._super=c[e],i=t.apply(n,arguments),n._super=r,i}}var l=this,c=l.prototype,u,d,f;o=!0,u=new l,o=!1,e.Mixins&&(n(e.Mixins,function(t){t=t;for(var n in t)"init"!==n&&(e[n]=t[n])}),c.Mixins&&(e.Mixins=c.Mixins.concat(e.Mixins))),e.Methods&&n(e.Methods.split(","),function(t){e[t]=a}),e.Properties&&n(e.Properties.split(","),function(t){var n="_"+t;e[t]=function(e){var t=this,r;return e!==r?(t[n]=e,t):t[n]}}),e.Statics&&n(e.Statics,function(e,n){t[n]=e}),e.Defaults&&c.Defaults&&(e.Defaults=r({},c.Defaults,e.Defaults));for(d in e)f=e[d],"function"==typeof f&&c[d]?u[d]=s(d,f):u[d]=f;return t.prototype=u,t.constructor=t,t.extend=i,t},t}),r(q,[f],function(e){function t(t){function n(){return!1}function r(){return!0}function i(e,i){var o,s,l,c;if(e=e.toLowerCase(),i=i||{},i.type=e,i.target||(i.target=u),i.preventDefault||(i.preventDefault=function(){i.isDefaultPrevented=r},i.stopPropagation=function(){i.isPropagationStopped=r},i.stopImmediatePropagation=function(){i.isImmediatePropagationStopped=r},i.isDefaultPrevented=n,i.isPropagationStopped=n,i.isImmediatePropagationStopped=n),t.beforeFire&&t.beforeFire(i),o=d[e])for(s=0,l=o.length;l>s;s++){if(c=o[s],c.once&&a(e,c.func),i.isImmediatePropagationStopped())return i.stopPropagation(),i;if(c.func.call(u,i)===!1)return i.preventDefault(),i}return i}function o(t,r,i,o){var a,s,l;if(r===!1&&(r=n),r)for(r={func:r},o&&e.extend(r,o),s=t.toLowerCase().split(" "),l=s.length;l--;)t=s[l],a=d[t],a||(a=d[t]=[],f(t,!0)),i?a.unshift(r):a.push(r);return c}function a(e,t){var n,r,i,o,a;if(e)for(o=e.toLowerCase().split(" "),n=o.length;n--;){if(e=o[n],r=d[e],!e){for(i in d)f(i,!1),delete d[i];return c}if(r){if(t)for(a=r.length;a--;)r[a].func===t&&(r=r.slice(0,a).concat(r.slice(a+1)),d[e]=r);else r.length=0;
r.length||(f(e,!1),delete d[e])}}else{for(e in d)f(e,!1);d={}}return c}function s(e,t,n){return o(e,t,n,{once:!0})}function l(e){return e=e.toLowerCase(),!(!d[e]||0===d[e].length)}var c=this,u,d={},f;t=t||{},u=t.scope||c,f=t.toggleEvent||n,c.fire=i,c.on=o,c.off=a,c.once=s,c.has=l}var n=e.makeMap("focus blur focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange mouseout mouseenter mouseleave wheel keydown keypress keyup input contextmenu dragstart dragend dragover draggesture dragdrop drop drag submit compositionstart compositionend compositionupdate touchstart touchend"," ");return t.isNative=function(e){return!!n[e.toLowerCase()]},t}),r(j,[],function(){function e(e){this.create=e.create}return e.create=function(t,n){return new e({create:function(e,r){function i(t){e.set(r,t.value)}function o(e){t.set(n,e.value)}var a;return e.on("change:"+r,o),t.on("change:"+n,i),a=e._bindings,a||(a=e._bindings=[],e.on("destroy",function(){for(var e=a.length;e--;)a[e]()})),a.push(function(){t.off("change:"+n,i)}),t.get(n)}})},e}),r(K,[q],function(e){function t(t){return t._eventDispatcher||(t._eventDispatcher=new e({scope:t,toggleEvent:function(n,r){e.isNative(n)&&t.toggleNativeEvent&&t.toggleNativeEvent(n,r)}})),t._eventDispatcher}return{fire:function(e,n,r){var i=this;if(i.removed&&"remove"!==e)return n;if(n=t(i).fire(e,n,r),r!==!1&&i.parent)for(var o=i.parent();o&&!n.isPropagationStopped();)o.fire(e,n,!1),o=o.parent();return n},on:function(e,n,r){return t(this).on(e,n,r)},off:function(e,n){return t(this).off(e,n)},once:function(e,n){return t(this).once(e,n)},hasEventListeners:function(e){return t(this).has(e)}}}),r(Y,[j,K,$,f],function(e,t,n,r){function i(e){return e.nodeType>0}function o(e,t){var n,a;if(e===t)return!0;if(null===e||null===t)return e===t;if("object"!=typeof e||"object"!=typeof t)return e===t;if(r.isArray(t)){if(e.length!==t.length)return!1;for(n=e.length;n--;)if(!o(e[n],t[n]))return!1}if(i(e)||i(t))return e===t;a={};for(n in t){if(!o(e[n],t[n]))return!1;a[n]=!0}for(n in e)if(!a[n]&&!o(e[n],t[n]))return!1;return!0}return n.extend({Mixins:[t],init:function(t){var n,r;t=t||{};for(n in t)r=t[n],r instanceof e&&(t[n]=r.create(this,n));this.data=t},set:function(t,n){var r,i,a=this.data[t];if(n instanceof e&&(n=n.create(this,t)),"object"==typeof t){for(r in t)this.set(r,t[r]);return this}return o(a,n)||(this.data[t]=n,i={target:this,name:t,value:n,oldValue:a},this.fire("change:"+t,i),this.fire("change",i)),this},get:function(e){return this.data[e]},has:function(e){return e in this.data},bind:function(t){return e.create(this,t)},destroy:function(){this.fire("destroy")}})}),r(G,[$],function(e){function t(e){for(var t=[],n=e.length,r;n--;)r=e[n],r.__checked||(t.push(r),r.__checked=1);for(n=t.length;n--;)delete t[n].__checked;return t}var n=/^([\w\\*]+)?(?:#([\w\\]+))?(?:\.([\w\\\.]+))?(?:\[\@?([\w\\]+)([\^\$\*!~]?=)([\w\\]+)\])?(?:\:(.+))?/i,r=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,i=/^\s*|\s*$/g,o,a=e.extend({init:function(e){function t(e){return e?(e=e.toLowerCase(),function(t){return"*"===e||t.type===e}):void 0}function o(e){return e?function(t){return t._name===e}:void 0}function a(e){return e?(e=e.split("."),function(t){for(var n=e.length;n--;)if(!t.classes.contains(e[n]))return!1;return!0}):void 0}function s(e,t,n){return e?function(r){var i=r[e]?r[e]():"";return t?"="===t?i===n:"*="===t?i.indexOf(n)>=0:"~="===t?(" "+i+" ").indexOf(" "+n+" ")>=0:"!="===t?i!=n:"^="===t?0===i.indexOf(n):"$="===t?i.substr(i.length-n.length)===n:!1:!!n}:void 0}function l(e){var t;return e?(e=/(?:not\((.+)\))|(.+)/i.exec(e),e[1]?(t=u(e[1],[]),function(e){return!d(e,t)}):(e=e[2],function(t,n,r){return"first"===e?0===n:"last"===e?n===r-1:"even"===e?n%2===0:"odd"===e?n%2===1:t[e]?t[e]():!1})):void 0}function c(e,r,c){function u(e){e&&r.push(e)}var d;return d=n.exec(e.replace(i,"")),u(t(d[1])),u(o(d[2])),u(a(d[3])),u(s(d[4],d[5],d[6])),u(l(d[7])),r.psuedo=!!d[7],r.direct=c,r}function u(e,t){var n=[],i,o,a;do if(r.exec(""),o=r.exec(e),o&&(e=o[3],n.push(o[1]),o[2])){i=o[3];break}while(o);for(i&&u(i,t),e=[],a=0;a<n.length;a++)">"!=n[a]&&e.push(c(n[a],[],">"===n[a-1]));return t.push(e),t}var d=this.match;this._selectors=u(e,[])},match:function(e,t){var n,r,i,o,a,s,l,c,u,d,f,h,p;for(t=t||this._selectors,n=0,r=t.length;r>n;n++){for(a=t[n],o=a.length,p=e,h=0,i=o-1;i>=0;i--)for(c=a[i];p;){if(c.psuedo)for(f=p.parent().items(),u=d=f.length;u--&&f[u]!==p;);for(s=0,l=c.length;l>s;s++)if(!c[s](p,u,d)){s=l+1;break}if(s===l){h++;break}if(i===o-1)break;p=p.parent()}if(h===o)return!0}return!1},find:function(e){function n(e,t,i){var o,a,s,l,c,u=t[i];for(o=0,a=e.length;a>o;o++){for(c=e[o],s=0,l=u.length;l>s;s++)if(!u[s](c,o,a)){s=l+1;break}if(s===l)i==t.length-1?r.push(c):c.items&&n(c.items(),t,i+1);else if(u.direct)return;c.items&&n(c.items(),t,i)}}var r=[],i,s,l=this._selectors;if(e.items){for(i=0,s=l.length;s>i;i++)n(e.items(),l[i],0);s>1&&(r=t(r))}return o||(o=a.Collection),new o(r)}});return a}),r(X,[f,G,$],function(e,t,n){var r,i,o=Array.prototype.push,a=Array.prototype.slice;return i={length:0,init:function(e){e&&this.add(e)},add:function(t){var n=this;return e.isArray(t)?o.apply(n,t):t instanceof r?n.add(t.toArray()):o.call(n,t),n},set:function(e){var t=this,n=t.length,r;for(t.length=0,t.add(e),r=t.length;n>r;r++)delete t[r];return t},filter:function(e){var n=this,i,o,a=[],s,l;for("string"==typeof e?(e=new t(e),l=function(t){return e.match(t)}):l=e,i=0,o=n.length;o>i;i++)s=n[i],l(s)&&a.push(s);return new r(a)},slice:function(){return new r(a.apply(this,arguments))},eq:function(e){return-1===e?this.slice(e):this.slice(e,+e+1)},each:function(t){return e.each(this,t),this},toArray:function(){return e.toArray(this)},indexOf:function(e){for(var t=this,n=t.length;n--&&t[n]!==e;);return n},reverse:function(){return new r(e.toArray(this).reverse())},hasClass:function(e){return this[0]?this[0].classes.contains(e):!1},prop:function(e,t){var n=this,r,i;return t!==r?(n.each(function(n){n[e]&&n[e](t)}),n):(i=n[0],i&&i[e]?i[e]():void 0)},exec:function(t){var n=this,r=e.toArray(arguments).slice(1);return n.each(function(e){e[t]&&e[t].apply(e,r)}),n},remove:function(){for(var e=this.length;e--;)this[e].remove();return this},addClass:function(e){return this.each(function(t){t.classes.add(e)})},removeClass:function(e){return this.each(function(t){t.classes.remove(e)})}},e.each("fire on off show hide append prepend before after reflow".split(" "),function(t){i[t]=function(){var n=e.toArray(arguments);return this.each(function(e){t in e&&e[t].apply(e,n)}),this}}),e.each("text name disabled active selected checked visible parent value data".split(" "),function(e){i[e]=function(t){return this.prop(e,t)}}),r=n.extend(i),t.Collection=r,r}),r(J,[f,b],function(e,t){var n=0;return{id:function(){return"mceu_"+n++},createFragment:function(e){return t.DOM.createFragment(e)},getWindowSize:function(){return t.DOM.getViewPort()},getSize:function(e){var t,n;if(e.getBoundingClientRect){var r=e.getBoundingClientRect();t=Math.max(r.width||r.right-r.left,e.offsetWidth),n=Math.max(r.height||r.bottom-r.bottom,e.offsetHeight)}else t=e.offsetWidth,n=e.offsetHeight;return{width:t,height:n}},getPos:function(e,n){return t.DOM.getPos(e,n)},getViewPort:function(e){return t.DOM.getViewPort(e)},get:function(e){return document.getElementById(e)},addClass:function(e,n){return t.DOM.addClass(e,n)},removeClass:function(e,n){return t.DOM.removeClass(e,n)},hasClass:function(e,n){return t.DOM.hasClass(e,n)},toggleClass:function(e,n,r){return t.DOM.toggleClass(e,n,r)},css:function(e,n,r){return t.DOM.setStyle(e,n,r)},getRuntimeStyle:function(e,n){return t.DOM.getStyle(e,n,!0)},on:function(e,n,r,i){return t.DOM.bind(e,n,r,i)},off:function(e,n,r){return t.DOM.unbind(e,n,r)},fire:function(e,n,r){return t.DOM.fire(e,n,r)},innerHtml:function(e,n){t.DOM.setHTML(e,n)}}}),r(Q,[],function(){return{parseBox:function(e){var t,n=10;if(e)return"number"==typeof e?(e=e||0,{top:e,left:e,bottom:e,right:e}):(e=e.split(" "),t=e.length,1===t?e[1]=e[2]=e[3]=e[0]:2===t?(e[2]=e[0],e[3]=e[1]):3===t&&(e[3]=e[1]),{top:parseInt(e[0],n)||0,right:parseInt(e[1],n)||0,bottom:parseInt(e[2],n)||0,left:parseInt(e[3],n)||0})},measureBox:function(e,t){function n(t){var n=document.defaultView;return n?(t=t.replace(/[A-Z]/g,function(e){return"-"+e}),n.getComputedStyle(e,null).getPropertyValue(t)):e.currentStyle[t]}function r(e){var t=parseFloat(n(e),10);return isNaN(t)?0:t}return{top:r(t+"TopWidth"),right:r(t+"RightWidth"),bottom:r(t+"BottomWidth"),left:r(t+"LeftWidth")}}}}),r(Z,[f],function(e){function t(){}function n(e){this.cls=[],this.cls._map={},this.onchange=e||t,this.prefix=""}return e.extend(n.prototype,{add:function(e){return e&&!this.contains(e)&&(this.cls._map[e]=!0,this.cls.push(e),this._change()),this},remove:function(e){if(this.contains(e)){for(var t=0;t<this.cls.length&&this.cls[t]!==e;t++);this.cls.splice(t,1),delete this.cls._map[e],this._change()}return this},toggle:function(e,t){var n=this.contains(e);return n!==t&&(n?this.remove(e):this.add(e),this._change()),this},contains:function(e){return!!this.cls._map[e]},_change:function(){delete this.clsValue,this.onchange.call(this)}}),n.prototype.toString=function(){var e;if(this.clsValue)return this.clsValue;e="";for(var t=0;t<this.cls.length;t++)t>0&&(e+=" "),e+=this.prefix+this.cls[t];return e},n}),r(ee,[],function(){function e(e,t){function n(e){window.setTimeout(e,0)}var r,i=window.requestAnimationFrame,o=["ms","moz","webkit"];for(r=0;r<o.length&&!i;r++)i=window[o[r]+"RequestAnimationFrame"];i||(i=n),i(e,t)}var t={},n;return{add:function(r){var i=r.parent();if(i){if(!i._layout||i._layout.isNative())return;t[i._id]||(t[i._id]=i),n||(n=!0,e(function(){var e,r;n=!1;for(e in t)r=t[e],r.state.get("rendered")&&r.reflow();t={}},document.body))}},remove:function(e){t[e._id]&&delete t[e._id]}}}),r(te,[$,f,q,Y,X,J,h,Q,Z,ee],function(e,t,n,r,i,o,a,s,l,c){function u(e){return e._eventDispatcher||(e._eventDispatcher=new n({scope:e,toggleEvent:function(t,r){r&&n.isNative(t)&&(e._nativeEvents||(e._nativeEvents={}),e._nativeEvents[t]=!0,e.state.get("rendered")&&d(e))}})),e._eventDispatcher}function d(e){function t(t){var n=e.getParentCtrl(t.target);n&&n.fire(t.type,t)}function n(){var e=c._lastHoverCtrl;e&&(e.fire("mouseleave",{target:e.getEl()}),e.parents().each(function(e){e.fire("mouseleave",{target:e.getEl()})}),c._lastHoverCtrl=null)}function r(t){var n=e.getParentCtrl(t.target),r=c._lastHoverCtrl,i=0,o,a,s;if(n!==r){if(c._lastHoverCtrl=n,a=n.parents().toArray().reverse(),a.push(n),r){for(s=r.parents().toArray().reverse(),s.push(r),i=0;i<s.length&&a[i]===s[i];i++);for(o=s.length-1;o>=i;o--)r=s[o],r.fire("mouseleave",{target:r.getEl()})}for(o=i;o<a.length;o++)n=a[o],n.fire("mouseenter",{target:n.getEl()})}}function i(t){t.preventDefault(),"mousewheel"==t.type?(t.deltaY=-1/40*t.wheelDelta,t.wheelDeltaX&&(t.deltaX=-1/40*t.wheelDeltaX)):(t.deltaX=0,t.deltaY=t.detail),t=e.fire("wheel",t)}var o,s,l,c,u,d;if(u=e._nativeEvents){for(l=e.parents().toArray(),l.unshift(e),o=0,s=l.length;!c&&s>o;o++)c=l[o]._eventsRoot;for(c||(c=l[l.length-1]||e),e._eventsRoot=c,s=o,o=0;s>o;o++)l[o]._eventsRoot=c;var p=c._delegates;p||(p=c._delegates={});for(d in u){if(!u)return!1;"wheel"!==d||h?("mouseenter"===d||"mouseleave"===d?c._hasMouseEnter||(a(c.getEl()).on("mouseleave",n).on("mouseover",r),c._hasMouseEnter=1):p[d]||(a(c.getEl()).on(d,t),p[d]=!0),u[d]=!1):f?a(e.getEl()).on("mousewheel",i):a(e.getEl()).on("DOMMouseScroll",i)}}}var f="onmousewheel"in document,h=!1,p="mce-",m,g=0,v={Statics:{classPrefix:p},isRtl:function(){return m.rtl},classPrefix:p,init:function(e){function n(e){var t;for(e=e.split(" "),t=0;t<e.length;t++)i.classes.add(e[t])}var i=this,o,c;i.settings=e=t.extend({},i.Defaults,e),i._id=e.id||"mceu_"+g++,i._aria={role:e.role},i._elmCache={},i.$=a,i.state=new r({visible:!0,active:!1,disabled:!1,value:""}),i.data=new r(e.data),i.classes=new l(function(){i.state.get("rendered")&&(i.getEl().className=this.toString())}),i.classes.prefix=i.classPrefix,o=e.classes,o&&(i.Defaults&&(c=i.Defaults.classes,c&&o!=c&&n(c)),n(o)),t.each("title text name visible disabled active value".split(" "),function(t){t in e&&i[t](e[t])}),i.on("click",function(){return i.disabled()?!1:void 0}),i.settings=e,i.borderBox=s.parseBox(e.border),i.paddingBox=s.parseBox(e.padding),i.marginBox=s.parseBox(e.margin),e.hidden&&i.hide()},Properties:"parent,name",getContainerElm:function(){return document.body},getParentCtrl:function(e){for(var t,n=this.getRoot().controlIdLookup;e&&n&&!(t=n[e.id]);)e=e.parentNode;return t},initLayoutRect:function(){var e=this,t=e.settings,n,r,i=e.getEl(),a,l,c,u,d,f,h,p;n=e.borderBox=e.borderBox||s.measureBox(i,"border"),e.paddingBox=e.paddingBox||s.measureBox(i,"padding"),e.marginBox=e.marginBox||s.measureBox(i,"margin"),p=o.getSize(i),f=t.minWidth,h=t.minHeight,c=f||p.width,u=h||p.height,a=t.width,l=t.height,d=t.autoResize,d="undefined"!=typeof d?d:!a&&!l,a=a||c,l=l||u;var m=n.left+n.right,g=n.top+n.bottom,v=t.maxWidth||65535,y=t.maxHeight||65535;return e._layoutRect=r={x:t.x||0,y:t.y||0,w:a,h:l,deltaW:m,deltaH:g,contentW:a-m,contentH:l-g,innerW:a-m,innerH:l-g,startMinWidth:f||0,startMinHeight:h||0,minW:Math.min(c,v),minH:Math.min(u,y),maxW:v,maxH:y,autoResize:d,scrollW:0},e._lastLayoutRect={},r},layoutRect:function(e){var t=this,n=t._layoutRect,r,i,o,a,s,l;return n||(n=t.initLayoutRect()),e?(o=n.deltaW,a=n.deltaH,e.x!==s&&(n.x=e.x),e.y!==s&&(n.y=e.y),e.minW!==s&&(n.minW=e.minW),e.minH!==s&&(n.minH=e.minH),i=e.w,i!==s&&(i=i<n.minW?n.minW:i,i=i>n.maxW?n.maxW:i,n.w=i,n.innerW=i-o),i=e.h,i!==s&&(i=i<n.minH?n.minH:i,i=i>n.maxH?n.maxH:i,n.h=i,n.innerH=i-a),i=e.innerW,i!==s&&(i=i<n.minW-o?n.minW-o:i,i=i>n.maxW-o?n.maxW-o:i,n.innerW=i,n.w=i+o),i=e.innerH,i!==s&&(i=i<n.minH-a?n.minH-a:i,i=i>n.maxH-a?n.maxH-a:i,n.innerH=i,n.h=i+a),e.contentW!==s&&(n.contentW=e.contentW),e.contentH!==s&&(n.contentH=e.contentH),r=t._lastLayoutRect,(r.x!==n.x||r.y!==n.y||r.w!==n.w||r.h!==n.h)&&(l=m.repaintControls,l&&l.map&&!l.map[t._id]&&(l.push(t),l.map[t._id]=!0),r.x=n.x,r.y=n.y,r.w=n.w,r.h=n.h),t):n},repaint:function(){var e=this,t,n,r,i,o,a=0,s=0,l,c,u;c=document.createRange?function(e){return e}:Math.round,t=e.getEl().style,i=e._layoutRect,l=e._lastRepaintRect||{},o=e.borderBox,a=o.left+o.right,s=o.top+o.bottom,i.x!==l.x&&(t.left=c(i.x)+"px",l.x=i.x),i.y!==l.y&&(t.top=c(i.y)+"px",l.y=i.y),i.w!==l.w&&(u=c(i.w-a),t.width=(u>=0?u:0)+"px",l.w=i.w),i.h!==l.h&&(u=c(i.h-s),t.height=(u>=0?u:0)+"px",l.h=i.h),e._hasBody&&i.innerW!==l.innerW&&(u=c(i.innerW),r=e.getEl("body"),r&&(n=r.style,n.width=(u>=0?u:0)+"px"),l.innerW=i.innerW),e._hasBody&&i.innerH!==l.innerH&&(u=c(i.innerH),r=r||e.getEl("body"),r&&(n=n||r.style,n.height=(u>=0?u:0)+"px"),l.innerH=i.innerH),e._lastRepaintRect=l,e.fire("repaint",{},!1)},on:function(e,t){function n(e){var t,n;return"string"!=typeof e?e:function(i){return t||r.parentsAndSelf().each(function(r){var i=r.settings.callbacks;return i&&(t=i[e])?(n=r,!1):void 0}),t?t.call(n,i):(i.action=e,void this.fire("execute",i))}}var r=this;return u(r).on(e,n(t)),r},off:function(e,t){return u(this).off(e,t),this},fire:function(e,t,n){var r=this;if(t=t||{},t.control||(t.control=r),t=u(r).fire(e,t),n!==!1&&r.parent)for(var i=r.parent();i&&!t.isPropagationStopped();)i.fire(e,t,!1),i=i.parent();return t},hasEventListeners:function(e){return u(this).has(e)},parents:function(e){var t=this,n,r=new i;for(n=t.parent();n;n=n.parent())r.add(n);return e&&(r=r.filter(e)),r},parentsAndSelf:function(e){return new i(this).add(this.parents(e))},next:function(){var e=this.parent().items();return e[e.indexOf(this)+1]},prev:function(){var e=this.parent().items();return e[e.indexOf(this)-1]},innerHtml:function(e){return this.$el.html(e),this},getEl:function(e){var t=e?this._id+"-"+e:this._id;return this._elmCache[t]||(this._elmCache[t]=a("#"+t)[0]),this._elmCache[t]},show:function(){return this.visible(!0)},hide:function(){return this.visible(!1)},focus:function(){try{this.getEl().focus()}catch(e){}return this},blur:function(){return this.getEl().blur(),this},aria:function(e,t){var n=this,r=n.getEl(n.ariaTarget);return"undefined"==typeof t?n._aria[e]:(n._aria[e]=t,n.state.get("rendered")&&r.setAttribute("role"==e?e:"aria-"+e,t),n)},encode:function(e,t){return t!==!1&&(e=this.translate(e)),(e||"").replace(/[&<>"]/g,function(e){return"&#"+e.charCodeAt(0)+";"})},translate:function(e){return m.translate?m.translate(e):e},before:function(e){var t=this,n=t.parent();return n&&n.insert(e,n.items().indexOf(t),!0),t},after:function(e){var t=this,n=t.parent();return n&&n.insert(e,n.items().indexOf(t)),t},remove:function(){var e=this,t=e.getEl(),n=e.parent(),r,i;if(e.items){var o=e.items().toArray();for(i=o.length;i--;)o[i].remove()}n&&n.items&&(r=[],n.items().each(function(t){t!==e&&r.push(t)}),n.items().set(r),n._lastRect=null),e._eventsRoot&&e._eventsRoot==e&&a(t).off();var s=e.getRoot().controlIdLookup;return s&&delete s[e._id],t&&t.parentNode&&t.parentNode.removeChild(t),e.state.set("rendered",!1),e.state.destroy(),e.fire("remove"),e},renderBefore:function(e){return a(e).before(this.renderHtml()),this.postRender(),this},renderTo:function(e){return a(e||this.getContainerElm()).append(this.renderHtml()),this.postRender(),this},preRender:function(){},render:function(){},renderHtml:function(){return'<div id="'+this._id+'" class="'+this.classes+'"></div>'},postRender:function(){var e=this,t=e.settings,n,r,i,o,s;e.$el=a(e.getEl()),e.state.set("rendered",!0);for(o in t)0===o.indexOf("on")&&e.on(o.substr(2),t[o]);if(e._eventsRoot){for(i=e.parent();!s&&i;i=i.parent())s=i._eventsRoot;if(s)for(o in s._nativeEvents)e._nativeEvents[o]=!0}d(e),t.style&&(n=e.getEl(),n&&(n.setAttribute("style",t.style),n.style.cssText=t.style)),e.settings.border&&(r=e.borderBox,e.$el.css({"border-top-width":r.top,"border-right-width":r.right,"border-bottom-width":r.bottom,"border-left-width":r.left}));var l=e.getRoot();l.controlIdLookup||(l.controlIdLookup={}),l.controlIdLookup[e._id]=e;for(var u in e._aria)e.aria(u,e._aria[u]);e.state.get("visible")===!1&&(e.getEl().style.display="none"),e.bindStates(),e.state.on("change:visible",function(t){var n=t.value,r;e.state.get("rendered")&&(e.getEl().style.display=n===!1?"none":"",e.getEl().getBoundingClientRect()),r=e.parent(),r&&(r._lastRect=null),e.fire(n?"show":"hide"),c.add(e)}),e.fire("postrender",{},!1)},bindStates:function(){},scrollIntoView:function(e){function t(e,t){var n,r,i=e;for(n=r=0;i&&i!=t&&i.nodeType;)n+=i.offsetLeft||0,r+=i.offsetTop||0,i=i.offsetParent;return{x:n,y:r}}var n=this.getEl(),r=n.parentNode,i,o,a,s,l,c,u=t(n,r);return i=u.x,o=u.y,a=n.offsetWidth,s=n.offsetHeight,l=r.clientWidth,c=r.clientHeight,"end"==e?(i-=l-a,o-=c-s):"center"==e&&(i-=l/2-a/2,o-=c/2-s/2),r.scrollLeft=i,r.scrollTop=o,this},getRoot:function(){for(var e=this,t,n=[];e;){if(e.rootControl){t=e.rootControl;break}n.push(e),t=e,e=e.parent()}t||(t=this);for(var r=n.length;r--;)n[r].rootControl=t;return t},reflow:function(){c.remove(this);var e=this.parent();return e._layout&&!e._layout.isNative()&&e.reflow(),this}};return t.each("text title visible disabled active value".split(" "),function(e){v[e]=function(t){return 0===arguments.length?this.state.get(e):("undefined"!=typeof t&&this.state.set(e,t),this)}}),m=e.extend(v)}),r(ne,[],function(){var e={},t;return{add:function(t,n){e[t.toLowerCase()]=n},has:function(t){return!!e[t.toLowerCase()]},create:function(n,r){var i,o,a;if(!t){a=tinymce.ui;for(o in a)e[o.toLowerCase()]=a[o];t=!0}if("string"==typeof n?(r=r||{},r.type=n):(r=n,n=r.type),n=n.toLowerCase(),i=e[n],!i)throw new Error("Could not find control by type: "+n);return i=new i(r),i.type=n,i}}}),r(re,[],function(){return function(e){function t(e){return e&&1===e.nodeType}function n(e){return e=e||x,t(e)?e.getAttribute("role"):null}function r(e){for(var t,r=e||x;r=r.parentNode;)if(t=n(r))return t}function i(e){var n=x;return t(n)?n.getAttribute("aria-"+e):void 0}function o(e){var t=e.tagName.toUpperCase();return"INPUT"==t||"TEXTAREA"==t}function a(e){return o(e)&&!e.hidden?!0:/^(button|menuitem|checkbox|tab|menuitemcheckbox|option|gridcell)$/.test(n(e))?!0:!1}function s(e){function t(e){if(1==e.nodeType&&"none"!=e.style.display){a(e)&&n.push(e);for(var r=0;r<e.childNodes.length;r++)t(e.childNodes[r])}}var n=[];return t(e||b.getEl()),n}function l(e){var t,n;e=e||C,n=e.parents().toArray(),n.unshift(e);for(var r=0;r<n.length&&(t=n[r],!t.settings.ariaRoot);r++);return t}function c(e){var t=l(e),n=s(t.getEl());t.settings.ariaRemember&&"lastAriaIndex"in t?u(t.lastAriaIndex,n):u(0,n)}function u(e,t){return 0>e?e=t.length-1:e>=t.length&&(e=0),t[e]&&t[e].focus(),e}function d(e,t){var n=-1,r=l();t=t||s(r.getEl());for(var i=0;i<t.length;i++)t[i]===x&&(n=i);n+=e,r.lastAriaIndex=u(n,t)}function f(){var e=r();"tablist"==e?d(-1,s(x.parentNode)):C.parent().submenu?v():d(-1)}function h(){var e=n(),t=r();"tablist"==t?d(1,s(x.parentNode)):"menuitem"==e&&"menu"==t&&i("haspopup")?y():d(1)}function p(){d(-1)}function m(){var e=n(),t=r();"menuitem"==e&&"menubar"==t?y():"button"==e&&i("haspopup")?y({key:"down"}):d(1)}function g(e){var t=r();if("tablist"==t){var n=s(C.getEl("body"))[0];n&&n.focus()}else d(e.shiftKey?-1:1)}function v(){C.fire("cancel")}function y(e){e=e||{},C.fire("click",{target:x,aria:e})}var b=e.root,x,C;try{x=document.activeElement}catch(w){x=document.body}return C=b.getParentCtrl(x),b.on("keydown",function(e){function t(e,t){o(x)||t(e)!==!1&&e.preventDefault()}if(!e.isDefaultPrevented())switch(e.keyCode){case 37:t(e,f);break;case 39:t(e,h);break;case 38:t(e,p);break;case 40:t(e,m);break;case 27:v();break;case 14:case 13:case 32:t(e,y);break;case 9:g(e)!==!1&&e.preventDefault()}}),b.on("focusin",function(e){x=e.target,C=e.control}),{focusFirst:c}}}),r(ie,[te,X,G,ne,re,f,h,Z,ee],function(e,t,n,r,i,o,a,s,l){var c={};return e.extend({init:function(e){var n=this;n._super(e),e=n.settings,e.fixed&&n.state.set("fixed",!0),n._items=new t,n.isRtl()&&n.classes.add("rtl"),n.bodyClasses=new s(function(){n.state.get("rendered")&&(n.getEl("body").className=this.toString())}),n.bodyClasses.prefix=n.classPrefix,n.classes.add("container"),n.bodyClasses.add("container-body"),e.containerCls&&n.classes.add(e.containerCls),n._layout=r.create((e.layout||"")+"layout"),n.settings.items?n.add(n.settings.items):n.add(n.render()),n._hasBody=!0},items:function(){return this._items},find:function(e){return e=c[e]=c[e]||new n(e),e.find(this)},add:function(e){var t=this;return t.items().add(t.create(e)).parent(t),t},focus:function(e){var t=this,n,r,i;return e&&(r=t.keyboardNav||t.parents().eq(-1)[0].keyboardNav)?void r.focusFirst(t):(i=t.find("*"),t.statusbar&&i.add(t.statusbar.items()),i.each(function(e){return e.settings.autofocus?(n=null,!1):void(e.canFocus&&(n=n||e))}),n&&n.focus(),t)},replace:function(e,t){for(var n,r=this.items(),i=r.length;i--;)if(r[i]===e){r[i]=t;break}i>=0&&(n=t.getEl(),n&&n.parentNode.removeChild(n),n=e.getEl(),n&&n.parentNode.removeChild(n)),t.parent(this)},create:function(t){var n=this,i,a=[];return o.isArray(t)||(t=[t]),o.each(t,function(t){t&&(t instanceof e||("string"==typeof t&&(t={type:t}),i=o.extend({},n.settings.defaults,t),t.type=i.type=i.type||t.type||n.settings.defaultType||(i.defaults?i.defaults.type:null),t=r.create(i)),a.push(t))}),a},renderNew:function(){var e=this;return e.items().each(function(t,n){var r;t.parent(e),t.state.get("rendered")||(r=e.getEl("body"),r.hasChildNodes()&&n<=r.childNodes.length-1?a(r.childNodes[n]).before(t.renderHtml()):a(r).append(t.renderHtml()),t.postRender(),l.add(t))}),e._layout.applyClasses(e.items().filter(":visible")),e._lastRect=null,e},append:function(e){return this.add(e).renderNew()},prepend:function(e){var t=this;return t.items().set(t.create(e).concat(t.items().toArray())),t.renderNew()},insert:function(e,t,n){var r=this,i,o,a;return e=r.create(e),i=r.items(),!n&&t<i.length-1&&(t+=1),t>=0&&t<i.length&&(o=i.slice(0,t).toArray(),a=i.slice(t).toArray(),i.set(o.concat(e,a))),r.renderNew()},fromJSON:function(e){var t=this;for(var n in e)t.find("#"+n).value(e[n]);return t},toJSON:function(){var e=this,t={};return e.find("*").each(function(e){var n=e.name(),r=e.value();n&&"undefined"!=typeof r&&(t[n]=r)}),t},renderHtml:function(){var e=this,t=e._layout,n=this.settings.role;return e.preRender(),t.preRender(e),'<div id="'+e._id+'" class="'+e.classes+'"'+(n?' role="'+this.settings.role+'"':"")+'><div id="'+e._id+'-body" class="'+e.bodyClasses+'">'+(e.settings.html||"")+t.renderHtml(e)+"</div></div>"},postRender:function(){var e=this,t;return e.items().exec("postRender"),e._super(),e._layout.postRender(e),e.state.set("rendered",!0),e.settings.style&&e.$el.css(e.settings.style),e.settings.border&&(t=e.borderBox,e.$el.css({"border-top-width":t.top,"border-right-width":t.right,"border-bottom-width":t.bottom,"border-left-width":t.left})),e.parent()||(e.keyboardNav=new i({root:e})),e},initLayoutRect:function(){var e=this,t=e._super();return e._layout.recalc(e),t},recalc:function(){var e=this,t=e._layoutRect,n=e._lastRect;return n&&n.w==t.w&&n.h==t.h?void 0:(e._layout.recalc(e),t=e.layoutRect(),e._lastRect={x:t.x,y:t.y,w:t.w,h:t.h},!0)},reflow:function(){var t;if(l.remove(this),this.visible()){for(e.repaintControls=[],e.repaintControls.map={},this.recalc(),t=e.repaintControls.length;t--;)e.repaintControls[t].repaint();"flow"!==this.settings.layout&&"stack"!==this.settings.layout&&this.repaint(),e.repaintControls=[]}return this}})}),r(oe,[h],function(e){function t(e){var t,n,r,i,o,a,s,l,c=Math.max;return t=e.documentElement,n=e.body,r=c(t.scrollWidth,n.scrollWidth),i=c(t.clientWidth,n.clientWidth),o=c(t.offsetWidth,n.offsetWidth),a=c(t.scrollHeight,n.scrollHeight),s=c(t.clientHeight,n.clientHeight),l=c(t.offsetHeight,n.offsetHeight),{width:o>r?i:r,height:l>a?s:a}}function n(e){var t,n;if(e.changedTouches)for(t="screenX screenY pageX pageY clientX clientY".split(" "),n=0;n<t.length;n++)e[t[n]]=e.changedTouches[0][t[n]]}return function(r,i){function o(){return s.getElementById(i.handle||r)}var a,s=i.document||document,l,c,u,d,f,h;i=i||{},c=function(r){var c=t(s),p,m;n(r),r.preventDefault(),l=r.button,p=o(),f=r.screenX,h=r.screenY,m=window.getComputedStyle?window.getComputedStyle(p,null).getPropertyValue("cursor"):p.runtimeStyle.cursor,a=e("<div>").css({position:"absolute",top:0,left:0,width:c.width,height:c.height,zIndex:2147483647,opacity:1e-4,cursor:m}).appendTo(s.body),e(s).on("mousemove touchmove",d).on("mouseup touchend",u),i.start(r)},d=function(e){return n(e),e.button!==l?u(e):(e.deltaX=e.screenX-f,e.deltaY=e.screenY-h,e.preventDefault(),void i.drag(e))},u=function(t){n(t),e(s).off("mousemove touchmove",d).off("mouseup touchend",u),a.remove(),i.stop&&i.stop(t)},this.destroy=function(){e(o()).off()},e(o()).on("mousedown touchstart",c)}}),r(ae,[h,oe],function(e,t){return{init:function(){var e=this;e.on("repaint",e.renderScroll)},renderScroll:function(){function n(){function t(t,a,s,l,c,u){var d,f,h,p,m,g,v,y,b;if(f=i.getEl("scroll"+t)){if(y=a.toLowerCase(),b=s.toLowerCase(),e(i.getEl("absend")).css(y,i.layoutRect()[l]-1),!c)return void e(f).css("display","none");e(f).css("display","block"),d=i.getEl("body"),h=i.getEl("scroll"+t+"t"),p=d["client"+s]-2*o,p-=n&&r?f["client"+u]:0,m=d["scroll"+s],g=p/m,v={},v[y]=d["offset"+a]+o,v[b]=p,e(f).css(v),v={},v[y]=d["scroll"+a]*g,v[b]=p*g,e(h).css(v)}}var n,r,a;a=i.getEl("body"),n=a.scrollWidth>a.clientWidth,r=a.scrollHeight>a.clientHeight,t("h","Left","Width","contentW",n,"Height"),t("v","Top","Height","contentH",r,"Width")}function r(){function n(n,r,a,s,l){var c,u=i._id+"-scroll"+n,d=i.classPrefix;e(i.getEl()).append('<div id="'+u+'" class="'+d+"scrollbar "+d+"scrollbar-"+n+'"><div id="'+u+'t" class="'+d+'scrollbar-thumb"></div></div>'),i.draghelper=new t(u+"t",{start:function(){c=i.getEl("body")["scroll"+r],e("#"+u).addClass(d+"active")},drag:function(e){var t,u,d,f,h=i.layoutRect();u=h.contentW>h.innerW,d=h.contentH>h.innerH,f=i.getEl("body")["client"+a]-2*o,f-=u&&d?i.getEl("scroll"+n)["client"+l]:0,t=f/i.getEl("body")["scroll"+a],i.getEl("body")["scroll"+r]=c+e["delta"+s]/t},stop:function(){e("#"+u).removeClass(d+"active")}})}i.classes.add("scroll"),n("v","Top","Height","Y","Width"),n("h","Left","Width","X","Height")}var i=this,o=2;i.settings.autoScroll&&(i._hasScroll||(i._hasScroll=!0,r(),i.on("wheel",function(e){var t=i.getEl("body");t.scrollLeft+=10*(e.deltaX||0),t.scrollTop+=10*e.deltaY,n()}),e(i.getEl("body")).on("scroll",n)),n())}}}),r(se,[ie,ae],function(e,t){return e.extend({Defaults:{layout:"fit",containerCls:"panel"},Mixins:[t],renderHtml:function(){var e=this,t=e._layout,n=e.settings.html;return e.preRender(),t.preRender(e),"undefined"==typeof n?n='<div id="'+e._id+'-body" class="'+e.bodyClasses+'">'+t.renderHtml(e)+"</div>":("function"==typeof n&&(n=n.call(e)),e._hasBody=!1),'<div id="'+e._id+'" class="'+e.classes+'" hidefocus="1" tabindex="-1" role="group">'+(e._preBodyHtml||"")+n+"</div>"}})}),r(le,[J],function(e){function t(t,n,r){var i,o,a,s,l,c,u,d,f,h;return f=e.getViewPort(),o=e.getPos(n),a=o.x,s=o.y,t.state.get("fixed")&&"static"==e.getRuntimeStyle(document.body,"position")&&(a-=f.x,s-=f.y),i=t.getEl(),h=e.getSize(i),l=h.width,c=h.height,h=e.getSize(n),u=h.width,d=h.height,r=(r||"").split(""),"b"===r[0]&&(s+=d),"r"===r[1]&&(a+=u),"c"===r[0]&&(s+=Math.round(d/2)),"c"===r[1]&&(a+=Math.round(u/2)),"b"===r[3]&&(s-=c),"r"===r[4]&&(a-=l),"c"===r[3]&&(s-=Math.round(c/2)),"c"===r[4]&&(a-=Math.round(l/2)),{x:a,y:s,w:l,h:c}}return{testMoveRel:function(n,r){for(var i=e.getViewPort(),o=0;o<r.length;o++){var a=t(this,n,r[o]);if(this.state.get("fixed")){if(a.x>0&&a.x+a.w<i.w&&a.y>0&&a.y+a.h<i.h)return r[o]}else if(a.x>i.x&&a.x+a.w<i.w+i.x&&a.y>i.y&&a.y+a.h<i.h+i.y)return r[o]}return r[0]},moveRel:function(e,n){"string"!=typeof n&&(n=this.testMoveRel(e,n));var r=t(this,e,n);return this.moveTo(r.x,r.y)},moveBy:function(e,t){var n=this,r=n.layoutRect();return n.moveTo(r.x+e,r.y+t),n},moveTo:function(t,n){function r(e,t,n){return 0>e?0:e+n>t?(e=t-n,0>e?0:e):e}var i=this;if(i.settings.constrainToViewport){var o=e.getViewPort(window),a=i.layoutRect();t=r(t,o.w+o.x,a.w),n=r(n,o.h+o.y,a.h)}return i.state.get("rendered")?i.layoutRect({x:t,y:n}).repaint():(i.settings.x=t,i.settings.y=n),i.fire("move",{x:t,y:n}),i}}}),r(ce,[J],function(e){return{resizeToContent:function(){this._layoutRect.autoResize=!0,this._lastRect=null,this.reflow()},resizeTo:function(t,n){if(1>=t||1>=n){var r=e.getWindowSize();t=1>=t?t*r.w:t,n=1>=n?n*r.h:n}return this._layoutRect.autoResize=!1,this.layoutRect({minW:t,minH:n,w:t,h:n}).reflow()},resizeBy:function(e,t){var n=this,r=n.layoutRect();return n.resizeTo(r.w+e,r.h+t)}}}),r(ue,[se,le,ce,J,h],function(e,t,n,r,i){function o(e,t){for(;e;){if(e==t)return!0;e=e.parent()}}function a(e){for(var t=g.length;t--;){var n=g[t],r=n.getParentCtrl(e.target);if(n.settings.autohide){if(r&&(o(r,n)||n.parent()===r))continue;e=n.fire("autohide",{target:e.target}),e.isDefaultPrevented()||n.hide()}}}function s(){h||(h=function(e){2!=e.button&&a(e)},i(document).on("click touchstart",h))}function l(){p||(p=function(){var e;for(e=g.length;e--;)u(g[e])},i(window).on("scroll",p))}function c(){if(!m){var e=document.documentElement,t=e.clientWidth,n=e.clientHeight;m=function(){document.all&&t==e.clientWidth&&n==e.clientHeight||(t=e.clientWidth,n=e.clientHeight,b.hideAll())},i(window).on("resize",m)}}function u(e){function t(t,n){for(var r,i=0;i<g.length;i++)if(g[i]!=e)for(r=g[i].parent();r&&(r=r.parent());)r==e&&g[i].fixed(t).moveBy(0,n).repaint()}var n=r.getViewPort().y;e.settings.autofix&&(e.state.get("fixed")?e._autoFixY>n&&(e.fixed(!1).layoutRect({y:e._autoFixY}).repaint(),t(!1,e._autoFixY-n)):(e._autoFixY=e.layoutRect().y,e._autoFixY<n&&(e.fixed(!0).layoutRect({y:0}).repaint(),t(!0,n-e._autoFixY))))}function d(e,t){var n,r=b.zIndex||65535,o;if(e)v.push(t);else for(n=v.length;n--;)v[n]===t&&v.splice(n,1);
if(v.length)for(n=0;n<v.length;n++)v[n].modal&&(r++,o=v[n]),v[n].getEl().style.zIndex=r,v[n].zIndex=r,r++;var a=document.getElementById(t.classPrefix+"modal-block");o?i(a).css("z-index",o.zIndex-1):a&&(a.parentNode.removeChild(a),y=!1),b.currentZIndex=r}function f(e){var t;for(t=g.length;t--;)g[t]===e&&g.splice(t,1);for(t=v.length;t--;)v[t]===e&&v.splice(t,1)}var h,p,m,g=[],v=[],y,b=e.extend({Mixins:[t,n],init:function(e){var t=this;t._super(e),t._eventsRoot=t,t.classes.add("floatpanel"),e.autohide&&(s(),c(),g.push(t)),e.autofix&&(l(),t.on("move",function(){u(this)})),t.on("postrender show",function(e){if(e.control==t){var n,r=t.classPrefix;t.modal&&!y&&(n=i("#"+r+"modal-block"),n[0]||(n=i('<div id="'+r+'modal-block" class="'+r+"reset "+r+'fade"></div>').appendTo(t.getContainerElm())),setTimeout(function(){n.addClass(r+"in"),i(t.getEl()).addClass(r+"in")},0),y=!0),d(!0,t)}}),t.on("show",function(){t.parents().each(function(e){return e.state.get("fixed")?(t.fixed(!0),!1):void 0})}),e.popover&&(t._preBodyHtml='<div class="'+t.classPrefix+'arrow"></div>',t.classes.add("popover").add("bottom").add(t.isRtl()?"end":"start"))},fixed:function(e){var t=this;if(t.state.get("fixed")!=e){if(t.state.get("rendered")){var n=r.getViewPort();e?t.layoutRect().y-=n.y:t.layoutRect().y+=n.y}t.classes.toggle("fixed",e),t.state.set("fixed",e)}return t},show:function(){var e=this,t,n=e._super();for(t=g.length;t--&&g[t]!==e;);return-1===t&&g.push(e),n},hide:function(){return f(this),d(!1,this),this._super()},hideAll:function(){b.hideAll()},close:function(){var e=this;return e.fire("close").isDefaultPrevented()||(e.remove(),d(!1,e)),e},remove:function(){f(this),this._super()},postRender:function(){var e=this;return e.settings.bodyRole&&this.getEl("body").setAttribute("role",e.settings.bodyRole),e._super()}});return b.hideAll=function(){for(var e=g.length;e--;){var t=g[e];t&&t.settings.autohide&&(t.hide(),g.splice(e,1))}},b}),r(de,[ue,se,J,h,oe,Q,u],function(e,t,n,r,i,o,a){function s(e){var t="width=device-width,initial-scale=1.0,user-scalable=0,minimum-scale=1.0,maximum-scale=1.0",n=r("meta[name=viewport]")[0],i;a.overrideViewPort!==!1&&(n||(n=document.createElement("meta"),n.setAttribute("name","viewport"),document.getElementsByTagName("head")[0].appendChild(n)),i=n.getAttribute("content"),i&&"undefined"!=typeof d&&(d=i),n.setAttribute("content",e?t:d))}function l(e){for(var t=0;t<u.length;t++)if(u[t]._fullscreen)return;r([document.documentElement,document.body]).removeClass(e+"fullscreen")}function c(){function e(){var e,t=n.getWindowSize(),r;for(e=0;e<u.length;e++)r=u[e].layoutRect(),u[e].moveTo(u[e].settings.x||Math.max(0,t.w/2-r.w/2),u[e].settings.y||Math.max(0,t.h/2-r.h/2))}var t={w:window.innerWidth,h:window.innerHeight};window.setInterval(function(){var e=window.innerWidth,n=window.innerHeight;(t.w!=e||t.h!=n)&&(t={w:e,h:n},r(window).trigger("resize"))},0),r(window).on("resize",e)}var u=[],d="",f=e.extend({modal:!0,Defaults:{border:1,layout:"flex",containerCls:"panel",role:"dialog",callbacks:{submit:function(){this.fire("submit",{data:this.toJSON()})},close:function(){this.close()}}},init:function(e){var n=this;n._super(e),n.isRtl()&&n.classes.add("rtl"),n.classes.add("window"),n.bodyClasses.add("window-body"),n.state.set("fixed",!0),e.buttons&&(n.statusbar=new t({layout:"flex",border:"1 0 0 0",spacing:3,padding:10,align:"center",pack:n.isRtl()?"start":"end",defaults:{type:"button"},items:e.buttons}),n.statusbar.classes.add("foot"),n.statusbar.parent(n)),n.on("click",function(e){-1!=e.target.className.indexOf(n.classPrefix+"close")&&n.close()}),n.on("cancel",function(){n.close()}),n.aria("describedby",n.describedBy||n._id+"-none"),n.aria("label",e.title),n._fullscreen=!1},recalc:function(){var e=this,t=e.statusbar,r,i,o,a;e._fullscreen&&(e.layoutRect(n.getWindowSize()),e.layoutRect().contentH=e.layoutRect().innerH),e._super(),r=e.layoutRect(),e.settings.title&&!e._fullscreen&&(i=r.headerW,i>r.w&&(o=r.x-Math.max(0,i/2),e.layoutRect({w:i,x:o}),a=!0)),t&&(t.layoutRect({w:e.layoutRect().innerW}).recalc(),i=t.layoutRect().minW+r.deltaW,i>r.w&&(o=r.x-Math.max(0,i-r.w),e.layoutRect({w:i,x:o}),a=!0)),a&&e.recalc()},initLayoutRect:function(){var e=this,t=e._super(),r=0,i;if(e.settings.title&&!e._fullscreen){i=e.getEl("head");var o=n.getSize(i);t.headerW=o.width,t.headerH=o.height,r+=t.headerH}e.statusbar&&(r+=e.statusbar.layoutRect().h),t.deltaH+=r,t.minH+=r,t.h+=r;var a=n.getWindowSize();return t.x=e.settings.x||Math.max(0,a.w/2-t.w/2),t.y=e.settings.y||Math.max(0,a.h/2-t.h/2),t},renderHtml:function(){var e=this,t=e._layout,n=e._id,r=e.classPrefix,i=e.settings,o="",a="",s=i.html;return e.preRender(),t.preRender(e),i.title&&(o='<div id="'+n+'-head" class="'+r+'window-head"><div id="'+n+'-title" class="'+r+'title">'+e.encode(i.title)+'</div><button type="button" class="'+r+'close" aria-hidden="true">\xd7</button><div id="'+n+'-dragh" class="'+r+'dragh"></div></div>'),i.url&&(s='<iframe src="'+i.url+'" tabindex="-1"></iframe>'),"undefined"==typeof s&&(s=t.renderHtml(e)),e.statusbar&&(a=e.statusbar.renderHtml()),'<div id="'+n+'" class="'+e.classes+'" hidefocus="1"><div class="'+e.classPrefix+'reset" role="application">'+o+'<div id="'+n+'-body" class="'+e.bodyClasses+'">'+s+"</div>"+a+"</div></div>"},fullscreen:function(e){var t=this,i=document.documentElement,a,s=t.classPrefix,l;if(e!=t._fullscreen)if(r(window).on("resize",function(){var e;if(t._fullscreen)if(a)t._timer||(t._timer=setTimeout(function(){var e=n.getWindowSize();t.moveTo(0,0).resizeTo(e.w,e.h),t._timer=0},50));else{e=(new Date).getTime();var r=n.getWindowSize();t.moveTo(0,0).resizeTo(r.w,r.h),(new Date).getTime()-e>50&&(a=!0)}}),l=t.layoutRect(),t._fullscreen=e,e){t._initial={x:l.x,y:l.y,w:l.w,h:l.h},t.borderBox=o.parseBox("0"),t.getEl("head").style.display="none",l.deltaH-=l.headerH+2,r([i,document.body]).addClass(s+"fullscreen"),t.classes.add("fullscreen");var c=n.getWindowSize();t.moveTo(0,0).resizeTo(c.w,c.h)}else t.borderBox=o.parseBox(t.settings.border),t.getEl("head").style.display="",l.deltaH+=l.headerH,r([i,document.body]).removeClass(s+"fullscreen"),t.classes.remove("fullscreen"),t.moveTo(t._initial.x,t._initial.y).resizeTo(t._initial.w,t._initial.h);return t.reflow()},postRender:function(){var e=this,t;setTimeout(function(){e.classes.add("in")},0),e._super(),e.statusbar&&e.statusbar.postRender(),e.focus(),this.dragHelper=new i(e._id+"-dragh",{start:function(){t={x:e.layoutRect().x,y:e.layoutRect().y}},drag:function(n){e.moveTo(t.x+n.deltaX,t.y+n.deltaY)}}),e.on("submit",function(t){t.isDefaultPrevented()||e.close()}),u.push(e),s(!0)},submit:function(){return this.fire("submit",{data:this.toJSON()})},remove:function(){var e=this,t;for(e.dragHelper.destroy(),e._super(),e.statusbar&&this.statusbar.remove(),t=u.length;t--;)u[t]===e&&u.splice(t,1);s(u.length>0),l(e.classPrefix)},getContentWindow:function(){var e=this.getEl().getElementsByTagName("iframe")[0];return e?e.contentWindow:null}});return a.desktop||c(),f}),r(fe,[de],function(e){var t=e.extend({init:function(e){e={border:1,padding:20,layout:"flex",pack:"center",align:"center",containerCls:"panel",autoScroll:!0,buttons:{type:"button",text:"Ok",action:"ok"},items:{type:"label",multiline:!0,maxWidth:500,maxHeight:200}},this._super(e)},Statics:{OK:1,OK_CANCEL:2,YES_NO:3,YES_NO_CANCEL:4,msgBox:function(n){function r(e,t,n){return{type:"button",text:e,subtype:n?"primary":"",onClick:function(e){e.control.parents()[1].close(),o(t)}}}var i,o=n.callback||function(){};switch(n.buttons){case t.OK_CANCEL:i=[r("Ok",!0,!0),r("Cancel",!1)];break;case t.YES_NO:case t.YES_NO_CANCEL:i=[r("Yes",1,!0),r("No",0)],n.buttons==t.YES_NO_CANCEL&&i.push(r("Cancel",-1));break;default:i=[r("Ok",!0,!0)]}return new e({padding:20,x:n.x,y:n.y,minWidth:300,minHeight:100,layout:"flex",pack:"center",align:"center",buttons:i,title:n.title,role:"alertdialog",items:{type:"label",multiline:!0,maxWidth:500,maxHeight:200,text:n.text},onPostRender:function(){this.aria("describedby",this.items()[0]._id)},onClose:n.onClose,onCancel:function(){o(!1)}}).renderTo(document.body).reflow()},alert:function(e,n){return"string"==typeof e&&(e={text:e}),e.callback=n,t.msgBox(e)},confirm:function(e,n){return"string"==typeof e&&(e={text:e}),e.callback=n,e.buttons=t.OK_CANCEL,t.msgBox(e)}}});return t}),r(he,[de,fe],function(e,t){return function(n){function r(){return o.length?o[o.length-1]:void 0}var i=this,o=[];i.windows=o,n.on("remove",function(){for(var e=o.length;e--;)o[e].close()}),i.open=function(t,r){var i;return n.editorManager.setActive(n),t.title=t.title||" ",t.url=t.url||t.file,t.url&&(t.width=parseInt(t.width||320,10),t.height=parseInt(t.height||240,10)),t.body&&(t.items={defaults:t.defaults,type:t.bodyType||"form",items:t.body}),t.url||t.buttons||(t.buttons=[{text:"Ok",subtype:"primary",onclick:function(){i.find("form")[0].submit()}},{text:"Cancel",onclick:function(){i.close()}}]),i=new e(t),o.push(i),i.on("close",function(){for(var e=o.length;e--;)o[e]===i&&o.splice(e,1);o.length||n.focus()}),t.data&&i.on("postRender",function(){this.find("*").each(function(e){var n=e.name();n in t.data&&e.value(t.data[n])})}),i.features=t||{},i.params=r||{},1===o.length&&n.nodeChanged(),i.renderTo().reflow()},i.alert=function(e,r,i){t.alert(e,function(){r?r.call(i||this):n.focus()})},i.confirm=function(e,n,r){t.confirm(e,function(e){n.call(r||this,e)})},i.close=function(){r()&&r().close()},i.getParams=function(){return r()?r().params:null},i.setParams=function(e){r()&&(r().params=e)},i.getWindows=function(){return o}}}),r(pe,[D,w,m,E,v,u,f],function(e,t,n,r,i,o,a){return function(s){function l(e,t){try{s.getDoc().execCommand(e,!1,t)}catch(n){}}function c(){var e=s.getDoc().documentMode;return e?e:6}function u(e){return e.isDefaultPrevented()}function d(e){var t,n;e.dataTransfer&&(s.selection.isCollapsed()&&"IMG"==e.target.tagName&&X.select(e.target),t=s.selection.getContent(),t.length>0&&(n=re+escape(s.id)+","+escape(t),e.dataTransfer.setData(ie,n)))}function f(e){var t;return e.dataTransfer&&(t=e.dataTransfer.getData(ie),t&&t.indexOf(re)>=0)?(t=t.substr(re.length).split(","),{id:unescape(t[0]),html:unescape(t[1])}):null}function h(e){s.queryCommandSupported("mceInsertClipboardContent")?s.execCommand("mceInsertClipboardContent",!1,{content:e}):s.execCommand("mceInsertContent",!1,e)}function p(){function r(e){var t=v.schema.getBlockElements(),n=s.getBody();if("BR"!=e.nodeName)return!1;for(e=e;e!=n&&!t[e.nodeName];e=e.parentNode)if(e.nextSibling)return!1;return!0}function i(e,t){var n;for(n=e.nextSibling;n&&n!=t;n=n.nextSibling)if((3!=n.nodeType||0!==j.trim(n.data).length)&&n!==t)return!1;return n===t}function o(e,t,i){var o,a,s;for(s=v.schema.getNonEmptyElements(),o=new n(i||e,e);a=o[t?"next":"prev"]();){if(s[a.nodeName]&&!r(a))return a;if(3==a.nodeType&&a.data.length>0)return a}}function l(e){var n,r,i,a,l;if(!e.collapsed&&(n=v.getParent(t.getNode(e.startContainer,e.startOffset),v.isBlock),r=v.getParent(t.getNode(e.endContainer,e.endOffset),v.isBlock),l=s.schema.getTextBlockElements(),n!=r&&l[n.nodeName]&&l[r.nodeName]&&"false"!==v.getContentEditable(n)&&"false"!==v.getContentEditable(r)))return e.deleteContents(),i=o(n,!1),a=o(r,!0),v.isEmpty(r)||j(n).append(r.childNodes),j(r).remove(),i?1==i.nodeType?"BR"==i.nodeName?(e.setStartBefore(i),e.setEndBefore(i)):(e.setStartAfter(i),e.setEndAfter(i)):(e.setStart(i,i.data.length),e.setEnd(i,i.data.length)):a&&(1==a.nodeType?(e.setStartBefore(a),e.setEndBefore(a)):(e.setStart(a,0),e.setEnd(a,0))),y.setRng(e),!0}function c(e,n){var r,a,l,c,u,d;if(!e.collapsed)return e;if(u=e.startContainer,d=e.startOffset,3==u.nodeType)if(n){if(d<u.data.length)return e}else if(d>0)return e;if(r=t.getNode(e.startContainer,e.startOffset),l=v.getParent(r,v.isBlock),a=o(s.getBody(),n,r),c=v.getParent(a,v.isBlock),!r||!a)return e;if(c&&l!=c)if(n){if(!i(l,c))return e;1==r.nodeType?"BR"==r.nodeName?e.setStartBefore(r):e.setStartAfter(r):e.setStart(r,r.data.length),1==a.nodeType?e.setEnd(a,0):e.setEndBefore(a)}else{if(!i(c,l))return e;1==a.nodeType?"BR"==a.nodeName?e.setStartBefore(a):e.setStartAfter(a):e.setStart(a,a.data.length),1==r.nodeType?e.setEnd(r,0):e.setEndBefore(r)}return e}function p(e){var t=y.getRng();return t=c(t,e),l(t)?!0:void 0}function m(e){var t,n,r;p(e)||(a.each(s.getBody().getElementsByTagName("*"),function(e){"SPAN"==e.tagName&&e.setAttribute("mce-data-marked",1),!e.hasAttribute("data-mce-style")&&e.hasAttribute("style")&&s.dom.setAttrib(e,"style",s.dom.getAttrib(e,"style"))}),t=new b(function(){}),t.observe(s.getDoc(),{childList:!0,attributes:!0,subtree:!0,attributeFilter:["style"]}),s.getDoc().execCommand(e?"ForwardDelete":"Delete",!1,null),n=s.selection.getRng(),r=n.startContainer.parentNode,a.each(t.takeRecords(),function(e){if(v.isChildOf(e.target,s.getBody())){if("style"==e.attributeName){var t=e.target.getAttribute("data-mce-style");t?e.target.setAttribute("style",t):e.target.removeAttribute("style")}a.each(e.addedNodes,function(e){if("SPAN"==e.nodeName&&!e.getAttribute("mce-data-marked")){var t,i;e==r&&(t=n.startOffset,i=e.firstChild),v.remove(e,!0),i&&(n.setStart(i,t),n.setEnd(i,t),s.selection.setRng(n))}})}}),t.disconnect(),a.each(s.dom.select("span[mce-data-marked]"),function(e){e.removeAttribute("mce-data-marked")}))}var g=s.getDoc(),v=s.dom,y=s.selection,b=window.MutationObserver,x,C;b||(x=!0,b=function(){function e(e){var t=e.relatedNode||e.target;n.push({target:t,addedNodes:[t]})}function t(e){var t=e.relatedNode||e.target;n.push({target:t,attributeName:e.attrName})}var n=[],r;this.observe=function(n){r=n,r.addEventListener("DOMSubtreeModified",e,!1),r.addEventListener("DOMNodeInsertedIntoDocument",e,!1),r.addEventListener("DOMNodeInserted",e,!1),r.addEventListener("DOMAttrModified",t,!1)},this.disconnect=function(){r.removeEventListener("DOMSubtreeModified",e,!1),r.removeEventListener("DOMNodeInsertedIntoDocument",e,!1),r.removeEventListener("DOMNodeInserted",e,!1),r.removeEventListener("DOMAttrModified",t,!1)},this.takeRecords=function(){return n}}),s.on("keydown",function(e){var t=e.keyCode==Y,n=e.ctrlKey||e.metaKey;if(!u(e)&&(t||e.keyCode==K)){var r=s.selection.getRng(),i=r.startContainer,o=r.startOffset;if(t&&e.shiftKey)return;if(!n&&r.collapsed&&3==i.nodeType&&(t?o<i.data.length:o>0))return;e.preventDefault(),n&&s.selection.getSel().modify("extend",t?"forward":"backward",e.metaKey?"lineboundary":"word"),m(t)}}),s.on("keypress",function(t){if(!u(t)&&!y.isCollapsed()&&t.charCode&&!e.metaKeyPressed(t)){var n,r,i,o,a,l;n=s.selection.getRng(),l=String.fromCharCode(t.charCode),t.preventDefault(),r=j(n.startContainer).parents().filter(function(e,t){return!!s.schema.getTextInlineElements()[t.nodeName]}),m(!0),r=r.filter(function(e,t){return!j.contains(s.getBody(),t)}),r.length?(i=v.createFragment(),r.each(function(e,t){t=t.cloneNode(!1),i.hasChildNodes()?(t.appendChild(i.firstChild),i.appendChild(t)):(a=t,i.appendChild(t)),i.appendChild(t)}),a.appendChild(s.getDoc().createTextNode(l)),o=v.getParent(n.startContainer,v.isBlock),v.isEmpty(o)?j(o).empty().append(i):n.insertNode(i),n.setStart(a.firstChild,1),n.setEnd(a.firstChild,1),s.selection.setRng(n)):s.selection.setContent(l)}}),s.addCommand("Delete",function(){m()}),s.addCommand("ForwardDelete",function(){m(!0)}),x||(s.on("dragstart",function(e){C=y.getRng(),d(e)}),s.on("drop",function(e){if(!u(e)){var n=f(e);n&&(e.preventDefault(),window.setTimeout(function(){var r=t.getCaretRangeFromPoint(e.x,e.y,g);C&&(y.setRng(C),C=null),m(),y.setRng(r),h(n.html)},0))}}),s.on("cut",function(e){u(e)||!e.clipboardData||s.selection.isCollapsed()||(e.preventDefault(),e.clipboardData.clearData(),e.clipboardData.setData("text/html",s.selection.getContent()),e.clipboardData.setData("text/plain",s.selection.getContent({format:"text"})),window.setTimeout(function(){m(!0)},0))}))}function m(){function e(e){var t=G.create("body"),n=e.cloneContents();return t.appendChild(n),X.serializer.serialize(t,{format:"html"})}function n(n){if(!n.setStart){if(n.item)return!1;var r=n.duplicate();return r.moveToElementText(s.getBody()),t.compareRanges(n,r)}var i=e(n),o=G.createRng();o.selectNode(s.getBody());var a=e(o);return i===a}s.on("keydown",function(e){var t=e.keyCode,r,i;if(!u(e)&&(t==Y||t==K)){if(r=s.selection.isCollapsed(),i=s.getBody(),r&&!G.isEmpty(i))return;if(!r&&!n(s.selection.getRng()))return;e.preventDefault(),s.setContent(""),i.firstChild&&G.isBlock(i.firstChild)?s.selection.setCursorLocation(i.firstChild,0):s.selection.setCursorLocation(i,0),s.nodeChanged()}})}function g(){s.shortcuts.add("meta+a",null,"SelectAll")}function v(){s.settings.content_editable||(G.bind(s.getDoc(),"focusin",function(){X.setRng(X.getRng())}),G.bind(s.getDoc(),"mousedown mouseup",function(e){e.target==s.getDoc().documentElement&&(s.getBody().focus(),"mousedown"==e.type?X.placeCaretAt(e.clientX,e.clientY):X.setRng(X.getRng()))}))}function y(){s.on("keydown",function(e){if(!u(e)&&e.keyCode===K){if(!s.getBody().getElementsByTagName("hr").length)return;if(X.isCollapsed()&&0===X.getRng(!0).startOffset){var t=X.getNode(),n=t.previousSibling;if("HR"==t.nodeName)return G.remove(t),void e.preventDefault();n&&n.nodeName&&"hr"===n.nodeName.toLowerCase()&&(G.remove(n),e.preventDefault())}}})}function b(){window.Range.prototype.getClientRects||s.on("mousedown",function(e){if(!u(e)&&"HTML"===e.target.nodeName){var t=s.getBody();t.blur(),setTimeout(function(){t.focus()},0)}})}function x(){s.on("click",function(e){var t=e.target;/^(IMG|HR)$/.test(t.nodeName)&&(e.preventDefault(),X.getSel().setBaseAndExtent(t,0,t,1),s.nodeChanged()),"A"==t.nodeName&&G.hasClass(t,"mce-item-anchor")&&(e.preventDefault(),X.select(t))})}function C(){function e(){var e=G.getAttribs(X.getStart().cloneNode(!1));return function(){var t=X.getStart();t!==s.getBody()&&(G.setAttrib(t,"style",null),q(e,function(e){t.setAttributeNode(e.cloneNode(!0))}))}}function t(){return!X.isCollapsed()&&G.getParent(X.getStart(),G.isBlock)!=G.getParent(X.getEnd(),G.isBlock)}s.on("keypress",function(n){var r;return u(n)||8!=n.keyCode&&46!=n.keyCode||!t()?void 0:(r=e(),s.getDoc().execCommand("delete",!1,null),r(),n.preventDefault(),!1)}),G.bind(s.getDoc(),"cut",function(n){var r;!u(n)&&t()&&(r=e(),setTimeout(function(){r()},0))})}function w(){document.body.setAttribute("role","application")}function _(){s.on("keydown",function(e){if(!u(e)&&e.keyCode===K&&X.isCollapsed()&&0===X.getRng(!0).startOffset){var t=X.getNode().previousSibling;if(t&&t.nodeName&&"table"===t.nodeName.toLowerCase())return e.preventDefault(),!1}})}function E(){c()>7||(l("RespectVisibilityInDesign",!0),s.contentStyles.push(".mceHideBrInPre pre br {display: none}"),G.addClass(s.getBody(),"mceHideBrInPre"),Q.addNodeFilter("pre",function(e){for(var t=e.length,n,i,o,a;t--;)for(n=e[t].getAll("br"),i=n.length;i--;)o=n[i],a=o.prev,a&&3===a.type&&"\n"!=a.value.charAt(a.value-1)?a.value+="\n":o.parent.insert(new r("#text",3),o,!0).value="\n"}),Z.addNodeFilter("pre",function(e){for(var t=e.length,n,r,i,o;t--;)for(n=e[t].getAll("br"),r=n.length;r--;)i=n[r],o=i.prev,o&&3==o.type&&(o.value=o.value.replace(/\r?\n$/,""))}))}function N(){G.bind(s.getBody(),"mouseup",function(){var e,t=X.getNode();"IMG"==t.nodeName&&((e=G.getStyle(t,"width"))&&(G.setAttrib(t,"width",e.replace(/[^0-9%]+/g,"")),G.setStyle(t,"width","")),(e=G.getStyle(t,"height"))&&(G.setAttrib(t,"height",e.replace(/[^0-9%]+/g,"")),G.setStyle(t,"height","")))})}function k(){s.on("keydown",function(t){var n,r,i,o,a;if(!u(t)&&t.keyCode==e.BACKSPACE&&(n=X.getRng(),r=n.startContainer,i=n.startOffset,o=G.getRoot(),a=r,n.collapsed&&0===i)){for(;a&&a.parentNode&&a.parentNode.firstChild==a&&a.parentNode!=o;)a=a.parentNode;"BLOCKQUOTE"===a.tagName&&(s.formatter.toggle("blockquote",null,a),n=G.createRng(),n.setStart(r,0),n.setEnd(r,0),X.setRng(n))}})}function S(){function e(){s._refreshContentEditable(),l("StyleWithCSS",!1),l("enableInlineTableEditing",!1),J.object_resizing||l("enableObjectResizing",!1)}J.readonly||s.on("BeforeExecCommand MouseDown",e)}function T(){function e(){q(G.select("a"),function(e){var t=e.parentNode,n=G.getRoot();if(t.lastChild===e){for(;t&&!G.isBlock(t);){if(t.parentNode.lastChild!==t||t===n)return;t=t.parentNode}G.add(t,"br",{"data-mce-bogus":1})}})}s.on("SetContent ExecCommand",function(t){("setcontent"==t.type||"mceInsertLink"===t.command)&&e()})}function R(){J.forced_root_block&&s.on("init",function(){l("DefaultParagraphSeparator",J.forced_root_block)})}function A(){s.on("Undo Redo SetContent",function(e){e.initial||s.execCommand("mceRepaint")})}function B(){s.on("keydown",function(e){var t;u(e)||e.keyCode!=K||(t=s.getDoc().selection.createRange(),t&&t.item&&(e.preventDefault(),s.undoManager.beforeChange(),G.remove(t.item(0)),s.undoManager.add()))})}function D(){var e;c()>=10&&(e="",q("p div h1 h2 h3 h4 h5 h6".split(" "),function(t,n){e+=(n>0?",":"")+t+":empty"}),s.contentStyles.push(e+"{padding-right: 1px !important}"))}function M(){c()<9&&(Q.addNodeFilter("noscript",function(e){for(var t=e.length,n,r;t--;)n=e[t],r=n.firstChild,r&&n.attr("data-mce-innertext",r.value)}),Z.addNodeFilter("noscript",function(e){for(var t=e.length,n,o,a;t--;)n=e[t],o=e[t].firstChild,o?o.value=i.decode(o.value):(a=n.attributes.map["data-mce-innertext"],a&&(n.attr("data-mce-innertext",null),o=new r("#text",3),o.value=a,o.raw=!0,n.append(o)))}))}function H(){function e(e,t){var n=i.createTextRange();try{n.moveToPoint(e,t)}catch(r){n=null}return n}function t(t){var r;t.button?(r=e(t.x,t.y),r&&(r.compareEndPoints("StartToStart",a)>0?r.setEndPoint("StartToStart",a):r.setEndPoint("EndToEnd",a),r.select())):n()}function n(){var e=r.selection.createRange();a&&!e.item&&0===e.compareEndPoints("StartToEnd",e)&&a.select(),G.unbind(r,"mouseup",n),G.unbind(r,"mousemove",t),a=o=0}var r=G.doc,i=r.body,o,a,s;r.documentElement.unselectable=!0,G.bind(r,"mousedown contextmenu",function(i){if("HTML"===i.target.nodeName){if(o&&n(),s=r.documentElement,s.scrollHeight>s.clientHeight)return;o=1,a=e(i.x,i.y),a&&(G.bind(r,"mouseup",n),G.bind(r,"mousemove",t),G.getRoot().focus(),a.select())}})}function L(){s.on("keyup focusin mouseup",function(t){65==t.keyCode&&e.metaKeyPressed(t)||X.normalize()},!0)}function P(){s.contentStyles.push("img:-moz-broken {-moz-force-broken-image-icon:1;min-width:24px;min-height:24px}")}function O(){s.inline||s.on("keydown",function(){document.activeElement==document.body&&s.getWin().focus()})}function I(){s.inline||(s.contentStyles.push("body {min-height: 150px}"),s.on("click",function(e){var t;if("HTML"==e.target.nodeName){if(o.ie>11)return void s.getBody().focus();t=s.selection.getRng(),s.getBody().focus(),s.selection.setRng(t),s.selection.normalize(),s.nodeChanged()}}))}function F(){o.mac&&s.on("keydown",function(t){!e.metaKeyPressed(t)||t.shiftKey||37!=t.keyCode&&39!=t.keyCode||(t.preventDefault(),s.selection.getSel().modify("move",37==t.keyCode?"backward":"forward","lineboundary"))})}function z(){l("AutoUrlDetect",!1)}function W(){s.on("click",function(e){var t=e.target;do if("A"===t.tagName)return void e.preventDefault();while(t=t.parentNode)}),s.contentStyles.push(".mce-content-body {-webkit-touch-callout: none}")}function V(){s.on("init",function(){s.dom.bind(s.getBody(),"submit",function(e){e.preventDefault()})})}function U(){Q.addNodeFilter("br",function(e){for(var t=e.length;t--;)"Apple-interchange-newline"==e[t].attr("class")&&e[t].remove()})}function $(){s.on("dragstart",function(e){d(e)}),s.on("drop",function(e){if(!u(e)){var n=f(e);if(n&&n.id!=s.id){e.preventDefault();var r=t.getCaretRangeFromPoint(e.x,e.y,s.getDoc());X.setRng(r),h(n.html)}}})}var q=a.each,j=s.$,K=e.BACKSPACE,Y=e.DELETE,G=s.dom,X=s.selection,J=s.settings,Q=s.parser,Z=s.serializer,ee=o.gecko,te=o.ie,ne=o.webkit,re="data:text/mce-internal,",ie=te?"Text":"URL";k(),m(),L(),ne&&(p(),v(),x(),R(),V(),_(),U(),o.iOS?(O(),I(),W()):g()),te&&o.ie<11&&(y(),w(),E(),N(),B(),D(),M(),H()),o.ie>=11&&(I(),_()),o.ie&&(g(),z(),$()),ee&&(y(),b(),C(),S(),T(),A(),P(),F(),_())}}),r(me,[K,b,f],function(e,t,n){function r(e,t){return"selectionchange"==t?e.getDoc():!e.inline&&/^mouse|click|contextmenu|drop|dragover|dragend/.test(t)?e.getDoc().documentElement:e.settings.event_root?(e.eventRoot||(e.eventRoot=o.select(e.settings.event_root)[0]),e.eventRoot):e.getBody()}function i(e,t){var n=r(e,t),i;if(e.delegates||(e.delegates={}),!e.delegates[t])if(e.settings.event_root){if(a||(a={},e.editorManager.on("removeEditor",function(){var t;if(!e.editorManager.activeEditor&&a){for(t in a)e.dom.unbind(r(e,t));a=null}})),a[t])return;i=function(n){for(var r=n.target,i=e.editorManager.editors,a=i.length;a--;){var s=i[a].getBody();(s===r||o.isChildOf(r,s))&&(i[a].hidden||i[a].fire(t,n))}},a[t]=i,o.bind(n,t,i)}else i=function(n){e.hidden||e.fire(t,n)},o.bind(n,t,i),e.delegates[t]=i}var o=t.DOM,a,s={bindPendingEventDelegates:function(){var e=this;n.each(e._pendingNativeEvents,function(t){i(e,t)})},toggleNativeEvent:function(e,t){var n=this;n.settings.readonly||"focus"!=e&&"blur"!=e&&(t?n.initialized?i(n,e):n._pendingNativeEvents?n._pendingNativeEvents.push(e):n._pendingNativeEvents=[e]:n.initialized&&(n.dom.unbind(r(n,e),e,n.delegates[e]),delete n.delegates[e]))},unbindAllNativeEvents:function(){var e=this,t;if(e.delegates){for(t in e.delegates)e.dom.unbind(r(e,t),t,e.delegates[t]);delete e.delegates}e.inline||(e.getBody().onload=null,e.dom.unbind(e.getWin()),e.dom.unbind(e.getDoc())),e.dom.unbind(e.getBody()),e.dom.unbind(e.getContainer())}};return s=n.extend({},e,s)}),r(ge,[f,u],function(e,t){var n=e.each,r=e.explode,i={f9:120,f10:121,f11:122},o=e.makeMap("alt,ctrl,shift,meta,access");return function(a){function s(e,s,l,c){var u,d,f;f={func:l,scope:c||a,desc:a.translate(s)},n(r(e,"+"),function(e){e in o?f[e]=!0:/^[0-9]{2,}$/.test(e)?f.keyCode=parseInt(e,10):(f.charCode=e.charCodeAt(0),f.keyCode=i[e]||e.toUpperCase().charCodeAt(0))}),u=[f.keyCode];for(d in o)f[d]?u.push(d):f[d]=!1;return f.id=u.join(","),f.access&&(f.alt=!0,t.mac?f.ctrl=!0:f.shift=!0),f.meta&&(t.mac?f.meta=!0:(f.ctrl=!0,f.meta=!1)),f}var l=this,c={};a.on("keyup keypress keydown",function(e){(e.altKey||e.ctrlKey||e.metaKey)&&!e.isDefaultPrevented()&&n(c,function(t){return t.ctrl==e.ctrlKey&&t.meta==e.metaKey&&t.alt==e.altKey&&t.shift==e.shiftKey&&(e.keyCode==t.keyCode||e.charCode&&e.charCode==t.charCode)?(e.preventDefault(),"keydown"==e.type&&t.func.call(t.scope),!0):void 0})}),l.add=function(t,i,o,l){var u;return u=o,"string"==typeof o?o=function(){a.execCommand(u,!1,null)}:e.isArray(u)&&(o=function(){a.execCommand(u[0],u[1],u[2])}),n(r(t.toLowerCase()),function(e){var t=s(e,i,o,l);c[t.id]=t}),!0},l.remove=function(e){var t=s(e);return c[t.id]?(delete c[t.id],!0):!1}}}),r(ve,[],function(){function e(e,t){return function(){e.apply(t,arguments)}}function t(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],s(t,e(r,this),e(i,this))}function n(e){var t=this;return null===this._state?void this._deferreds.push(e):void l(function(){var n=t._state?e.onFulfilled:e.onRejected;if(null===n)return void(t._state?e.resolve:e.reject)(t._value);var r;try{r=n(t._value)}catch(i){return void e.reject(i)}e.resolve(r)})}function r(t){try{if(t===this)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if("function"==typeof n)return void s(e(n,t),e(r,this),e(i,this))}this._state=!0,this._value=t,o.call(this)}catch(a){i.call(this,a)}}function i(e){this._state=!1,this._value=e,o.call(this)}function o(){for(var e=0,t=this._deferreds.length;t>e;e++)n.call(this,this._deferreds[e]);this._deferreds=null}function a(e,t,n,r){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r}function s(e,t,n){var r=!1;try{e(function(e){r||(r=!0,t(e))},function(e){r||(r=!0,n(e))})}catch(i){if(r)return;r=!0,n(i)}}if(window.Promise)return window.Promise;var l=t.immediateFn||"function"==typeof setImmediate&&setImmediate||function(e){setTimeout(e,1)},c=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};return t.prototype["catch"]=function(e){return this.then(null,e)},t.prototype.then=function(e,r){var i=this;return new t(function(t,o){n.call(i,new a(e,r,t,o))})},t.all=function(){var e=Array.prototype.slice.call(1===arguments.length&&c(arguments[0])?arguments[0]:arguments);return new t(function(t,n){function r(o,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(e){r(o,e)},n)}e[o]=a,0===--i&&t(e)}catch(l){n(l)}}if(0===e.length)return t([]);for(var i=e.length,o=0;o<e.length;o++)r(o,e[o])})},t.resolve=function(e){return e&&"object"==typeof e&&e.constructor===t?e:new t(function(t){t(e)})},t.reject=function(e){return new t(function(t,n){n(e)})},t.race=function(e){return new t(function(t,n){for(var r=0,i=e.length;i>r;r++)e[r].then(t,n)})},t}),r(ye,[],function(){function e(e){return function(){return e}}return{constant:e}}),r(be,[ve,f,ye],function(e,t,n){return function(r){function i(e){var t,n;return n={"image/jpeg":"jpg","image/jpg":"jpg","image/gif":"gif","image/png":"png"},t=n[e.blob().type.toLowerCase()]||"dat",e.id()+"."+t}function o(e,t){return e?e.replace(/\/$/,"")+"/"+t.replace(/^\//,""):t}function a(e){return{id:e.id,blob:e.blob,base64:e.base64,filename:n.constant(i(e))}}function s(e,t,n){var a,s;a=new XMLHttpRequest,a.open("POST",r.url),a.withCredentials=r.credentials,a.onload=function(){var e;return 200!=a.status?void n("HTTP Error: "+a.status):(e=JSON.parse(a.responseText),e&&"string"==typeof e.location?void t(o(r.basePath,e.location)):void n("Invalid JSON: "+a.responseText))},s=new FormData,s.append("file",e.blob(),i(e)),a.send(s)}function l(n){function i(t){return new e(function(e){var n=r.handler;n(a(t),function(n){e({url:n,blobInfo:t,status:!0})},function(n){e({url:"",blobInfo:t,status:!1,error:n})})})}var o;return r.url||r.handler!==s?(o=t.map(n,function(e){var t,n=e.id();return c[n]?c[n]:(t=i(e).then(function(e){return delete c[n],e})["catch"](function(e){return delete c[n],e}),c[n]=t,t)}),e.all(o)):new e(function(e){e([])})}var c={};return r=t.extend({credentials:!1,handler:s},r),{upload:l}}}),r(xe,[ve],function(e){function t(t){return new e(function(e){var n=new XMLHttpRequest;n.open("GET",t,!0),n.responseType="blob",n.onload=function(){200==this.status&&e(this.response)},n.send()})}function n(e){var t,n;return e=decodeURIComponent(e).split(","),n=/data:([^;]+)/.exec(e[0]),n&&(t=n[1]),{type:t,data:e[1]}}function r(t){return new e(function(e){var r,i,o;t=n(t);try{r=atob(t.data)}catch(a){return void e(new Blob([]))}for(i=new Uint8Array(r.length),o=0;o<i.length;o++)i[o]=r.charCodeAt(o);e(new Blob([i],{type:t.type}))})}function i(e){return 0===e.indexOf("blob:")?t(e):0===e.indexOf("data:")?r(e):null}function o(t){return new e(function(e){var n=new FileReader;n.onloadend=function(){e(n.result)},n.readAsDataURL(t)})}return{uriToBlob:i,blobToDataUri:o,parseDataUri:n}}),r(Ce,[ve,d,xe,u],function(e,t,n,r){var i=0;return function(o){function a(a){function l(e,t){var r,a;return 0===e.src.indexOf("blob:")?(a=o.getByUri(e.src),void(a&&t({image:e,blobInfo:a}))):(r=n.parseDataUri(e.src).data,a=o.findFirst(function(e){return e.base64()===r}),void(a?t({image:e,blobInfo:a}):n.uriToBlob(e.src).then(function(n){var a="blobid"+i++,s=o.create(a,n,r);o.add(s),t({image:e,blobInfo:s})})))}var c,u;return c=t.filter(a.getElementsByTagName("img"),function(e){var t=e.src;return r.fileApi?e.hasAttribute("data-mce-bogus")?!1:e.hasAttribute("data-mce-placeholder")?!1:t&&t!=r.transparentSrc?0===t.indexOf("data:")||0===t.indexOf("blob:"):!1:!1}),u=t.map(c,function(t){var n;return s[t.src]?new e(function(e){s[t.src].then(function(n){e({image:t,blobInfo:n.blobInfo})})}):(n=new e(function(e){l(t,e)}).then(function(e){return delete s[e.image.src],e})["catch"](function(e){return delete s[t.src],e}),s[t.src]=n,
n)}),e.all(u)}var s={};return{findAll:a}}}),r(we,[d,ye],function(e,t){return function(){function n(e,t,n){return{id:c(e),blob:c(t),base64:c(n),blobUri:c(URL.createObjectURL(t))}}function r(e){i(e.id())||l.push(e)}function i(e){return o(function(t){return t.id()===e})}function o(t){return e.filter(l,t)[0]}function a(e){return o(function(t){return t.blobUri()==e})}function s(){e.each(l,function(e){URL.revokeObjectURL(e.blobUri())}),l=[]}var l=[],c=t.constant;return{create:n,add:r,get:i,getByUri:a,findFirst:o,destroy:s}}}),r(_e,[d,be,Ce,we],function(e,t,n,r){return function(i){function o(e){return function(t){return i.selection?e(t):[]}}function a(e,t,n){var r=0;do r=e.indexOf(t,r),-1!==r&&(e=e.substring(0,r)+n+e.substr(r+t.length),r+=n.length-t.length+1);while(-1!==r);return e}function s(e,t,n){return e=a(e,'src="'+t+'"','src="'+n+'"'),e=a(e,'data-mce-src="'+t+'"','data-mce-src="'+n+'"')}function l(t,n){e.each(i.undoManager.data,function(e){e.content=s(e.content,t,n)})}function c(n){return m||(m=new t({url:i.settings.images_upload_url,basePath:i.settings.images_upload_base_path,credentials:i.settings.images_upload_credentials,handler:i.settings.images_upload_handler})),d().then(o(function(t){var r;return r=e.map(t,function(e){return e.blobInfo}),m.upload(r).then(o(function(r){return r=e.map(r,function(e,n){var r=t[n].image;return l(r.src,e.url),i.$(r).attr({src:e.url,"data-mce-src":i.convertURL(e.url,"src")}),{element:r,status:e.status}}),n&&n(r),r}))}))}function u(e){return i.settings.automatic_uploads!==!1?c(e):void 0}function d(){return g||(g=new n(p)),g.findAll(i.getBody()).then(o(function(t){return e.each(t,function(e){l(e.image.src,e.blobInfo.blobUri()),e.image.src=e.blobInfo.blobUri()}),t}))}function f(){p.destroy(),g=m=null}function h(t){return t.replace(/src="(blob:[^"]+)"/g,function(t,n){var r=p.getByUri(n);return r||(r=e.reduce(i.editorManager.editors,function(e,t){return e||t.editorUpload.blobCache.getByUri(n)},null)),r?'src="data:'+r.blob().type+";base64,"+r.base64()+'"':t})}var p=new r,m,g;return i.on("setContent",function(){i.settings.automatic_uploads!==!1?u():d()}),i.on("RawSaveContent",function(e){e.content=h(e.content)}),i.on("getContent",function(e){e.source_view||"raw"==e.format||(e.content=h(e.content))}),{blobCache:p,uploadImages:c,uploadImagesAuto:u,scanForImages:d,destroy:f}}}),r(Ee,[b,h,C,_,E,A,R,L,I,F,z,W,V,U,x,l,he,N,S,pe,u,f,me,ge,_e],function(e,n,r,i,o,a,s,l,c,u,d,f,h,p,m,g,v,y,b,x,C,w,_,E,N){function k(e,t,i){var o=this,a,s;a=o.documentBaseUrl=i.documentBaseURL,s=i.baseURI,o.settings=t=A({id:e,theme:"modern",delta_width:0,delta_height:0,popup_css:"",plugins:"",document_base_url:a,add_form_submit_trigger:!0,submit_patch:!0,add_unload_trigger:!0,convert_urls:!0,relative_urls:!0,remove_script_host:!0,object_resizing:!0,doctype:"<!DOCTYPE html>",visual:!0,font_size_style_values:"xx-small,x-small,small,medium,large,x-large,xx-large",font_size_legacy_values:"xx-small,small,medium,large,x-large,xx-large,300%",forced_root_block:"p",hidden_input:!0,padd_empty_editor:!0,render_ui:!0,indentation:"30px",inline_styles:!0,convert_fonts_to_spans:!0,indent:"simple",indent_before:"p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist",indent_after:"p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist",validate:!0,entity_encoding:"named",url_converter:o.convertURL,url_converter_scope:o,ie7_compat:!0},t),r.language=t.language||"en",r.languageLoad=t.language_load,r.baseURL=i.baseURL,o.id=t.id=e,o.isNotDirty=!0,o.plugins={},o.documentBaseURI=new p(t.document_base_url||a,{base_uri:s}),o.baseURI=s,o.contentCSS=[],o.contentStyles=[],o.shortcuts=new E(o),o.loadedCSS={},o.editorCommands=new h(o),t.target&&(o.targetElm=t.target),o.suffix=i.suffix,o.editorManager=i,o.inline=t.inline,t.cache_suffix&&(C.cacheSuffix=t.cache_suffix.replace(/^[\?\&]+/,"")),t.override_viewport===!1&&(C.overrideViewPort=!1),i.fire("SetupEditor",o),o.execCallback("setup",o),o.$=n.overrideDefaults(function(){return{context:o.inline?o.getBody():o.getDoc(),element:o.getBody()}})}var S=e.DOM,T=r.ThemeManager,R=r.PluginManager,A=w.extend,B=w.each,D=w.explode,M=w.inArray,H=w.trim,L=w.resolve,P=g.Event,O=C.gecko,I=C.ie;return k.prototype={render:function(){function e(){S.unbind(window,"ready",e),n.render()}function t(){var e=m.ScriptLoader;if(r.language&&"en"!=r.language&&!r.language_url&&(r.language_url=n.editorManager.baseURL+"/langs/"+r.language+".js"),r.language_url&&e.add(r.language_url),r.theme&&"function"!=typeof r.theme&&"-"!=r.theme.charAt(0)&&!T.urls[r.theme]){var t=r.theme_url;t=t?n.documentBaseURI.toAbsolute(t):"themes/"+r.theme+"/theme"+o+".js",T.load(r.theme,t)}w.isArray(r.plugins)&&(r.plugins=r.plugins.join(" ")),B(r.external_plugins,function(e,t){R.load(t,e),r.plugins+=" "+t}),B(r.plugins.split(/[ ,]/),function(e){if(e=H(e),e&&!R.urls[e])if("-"==e.charAt(0)){e=e.substr(1,e.length);var t=R.dependencies(e);B(t,function(e){var t={prefix:"plugins/",resource:e,suffix:"/plugin"+o+".js"};e=R.createUrl(t,e),R.load(e.resource,e)})}else R.load(e,{prefix:"plugins/",resource:e,suffix:"/plugin"+o+".js"})}),e.loadQueue(function(){n.removed||n.init()})}var n=this,r=n.settings,i=n.id,o=n.suffix;if(!P.domLoaded)return void S.bind(window,"ready",e);if(n.getElement()&&C.contentEditable){r.inline?n.inline=!0:(n.orgVisibility=n.getElement().style.visibility,n.getElement().style.visibility="hidden");var a=n.getElement().form||S.getParent(i,"form");a&&(n.formElement=a,r.hidden_input&&!/TEXTAREA|INPUT/i.test(n.getElement().nodeName)&&(S.insertAfter(S.create("input",{type:"hidden",name:i}),i),n.hasHiddenInput=!0),n.formEventDelegate=function(e){n.fire(e.type,e)},S.bind(a,"submit reset",n.formEventDelegate),n.on("reset",function(){n.setContent(n.startContent,{format:"raw"})}),!r.submit_patch||a.submit.nodeType||a.submit.length||a._mceOldSubmit||(a._mceOldSubmit=a.submit,a.submit=function(){return n.editorManager.triggerSave(),n.isNotDirty=!0,a._mceOldSubmit(a)})),n.windowManager=new v(n),"xml"==r.encoding&&n.on("GetContent",function(e){e.save&&(e.content=S.encode(e.content))}),r.add_form_submit_trigger&&n.on("submit",function(){n.initialized&&n.save()}),r.add_unload_trigger&&(n._beforeUnload=function(){!n.initialized||n.destroyed||n.isHidden()||n.save({format:"raw",no_events:!0,set_dirty:!1})},n.editorManager.on("BeforeUnload",n._beforeUnload)),t()}},init:function(){function e(n){var r=R.get(n),i,o;i=R.urls[n]||t.documentBaseUrl.replace(/\/$/,""),n=H(n),r&&-1===M(m,n)&&(B(R.dependencies(n),function(t){e(t)}),o=new r(t,i,t.$),t.plugins[n]=o,o.init&&(o.init(t,i),m.push(n)))}var t=this,n=t.settings,r=t.getElement(),i,o,a,s,l,c,u,d,f,h,p,m=[];if(this.editorManager.i18n.setCode(n.language),t.rtl=n.rtl_ui||this.editorManager.i18n.rtl,t.editorManager.add(t),n.aria_label=n.aria_label||S.getAttrib(r,"aria-label",t.getLang("aria.rich_text_area")),n.theme&&("function"!=typeof n.theme?(n.theme=n.theme.replace(/-/,""),c=T.get(n.theme),t.theme=new c(t,T.urls[n.theme]),t.theme.init&&t.theme.init(t,T.urls[n.theme]||t.documentBaseUrl.replace(/\/$/,""),t.$)):t.theme=n.theme),B(n.plugins.replace(/\-/g,"").split(/[ ,]/),e),n.render_ui&&t.theme&&(t.orgDisplay=r.style.display,"function"!=typeof n.theme?(i=n.width||r.style.width||r.offsetWidth,o=n.height||r.style.height||r.offsetHeight,a=n.min_height||100,h=/^[0-9\.]+(|px)$/i,h.test(""+i)&&(i=Math.max(parseInt(i,10),100)),h.test(""+o)&&(o=Math.max(parseInt(o,10),a)),l=t.theme.renderUI({targetNode:r,width:i,height:o,deltaWidth:n.delta_width,deltaHeight:n.delta_height}),n.content_editable||(o=(l.iframeHeight||o)+("number"==typeof o?l.deltaHeight||0:""),a>o&&(o=a))):(l=n.theme(t,r),l.editorContainer.nodeType&&(l.editorContainer=l.editorContainer.id=l.editorContainer.id||t.id+"_parent"),l.iframeContainer.nodeType&&(l.iframeContainer=l.iframeContainer.id=l.iframeContainer.id||t.id+"_iframecontainer"),o=l.iframeHeight||r.offsetHeight),t.editorContainer=l.editorContainer),n.content_css&&B(D(n.content_css),function(e){t.contentCSS.push(t.documentBaseURI.toAbsolute(e))}),n.content_style&&t.contentStyles.push(n.content_style),n.content_editable)return r=s=l=null,t.initContentBody();for(t.iframeHTML=n.doctype+"<html><head>",n.document_base_url!=t.documentBaseUrl&&(t.iframeHTML+='<base href="'+t.documentBaseURI.getURI()+'" />'),!C.caretAfter&&n.ie7_compat&&(t.iframeHTML+='<meta http-equiv="X-UA-Compatible" content="IE=7" />'),t.iframeHTML+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',p=0;p<t.contentCSS.length;p++){var g=t.contentCSS[p];t.iframeHTML+='<link type="text/css" rel="stylesheet" href="'+w._addCacheSuffix(g)+'" />',t.loadedCSS[g]=!0}d=n.body_id||"tinymce",-1!=d.indexOf("=")&&(d=t.getParam("body_id","","hash"),d=d[t.id]||d),f=n.body_class||"",-1!=f.indexOf("=")&&(f=t.getParam("body_class","","hash"),f=f[t.id]||""),n.content_security_policy&&(t.iframeHTML+='<meta http-equiv="Content-Security-Policy" content="'+n.content_security_policy+'" />'),t.iframeHTML+='</head><body id="'+d+'" class="mce-content-body '+f+'" data-id="'+t.id+'"><br></body></html>';var v='javascript:(function(){document.open();document.domain="'+document.domain+'";var ed = window.parent.tinymce.get("'+t.id+'");document.write(ed.iframeHTML);document.close();ed.initContentBody(true);})()';document.domain!=location.hostname&&C.ie&&C.ie<12&&(u=v);var y=S.create("iframe",{id:t.id+"_ifr",frameBorder:"0",allowTransparency:"true",title:t.editorManager.translate("Rich Text Area. Press ALT-F9 for menu. Press ALT-F10 for toolbar. Press ALT-0 for help"),style:{width:"100%",height:o,display:"block"}});if(y.onload=function(){y.onload=null,t.fire("load")},S.setAttrib(y,"src",u||'javascript:""'),t.contentAreaContainer=l.iframeContainer,t.iframeElement=y,s=S.add(l.iframeContainer,y),I)try{t.getDoc()}catch(b){s.src=u=v}l.editorContainer&&(S.get(l.editorContainer).style.display=t.orgDisplay,t.hidden=S.isHidden(l.editorContainer)),t.getElement().style.display="none",S.setAttrib(t.id,"aria-hidden",!0),u||t.initContentBody(),r=s=l=null},initContentBody:function(t){var n=this,r=n.settings,s=n.getElement(),h=n.getDoc(),p,m;r.inline||(n.getElement().style.visibility=n.orgVisibility),t||r.content_editable||(h.open(),h.write(n.iframeHTML),h.close()),r.content_editable&&(n.on("remove",function(){var e=this.getBody();S.removeClass(e,"mce-content-body"),S.removeClass(e,"mce-edit-focus"),S.setAttrib(e,"contentEditable",null)}),S.addClass(s,"mce-content-body"),n.contentDocument=h=r.content_document||document,n.contentWindow=r.content_window||window,n.bodyElement=s,r.content_document=r.content_window=null,r.root_name=s.nodeName.toLowerCase()),p=n.getBody(),p.disabled=!0,r.readonly||(n.inline&&"static"==S.getStyle(p,"position",!0)&&(p.style.position="relative"),p.contentEditable=n.getParam("content_editable_state",!0)),p.disabled=!1,n.editorUpload=new N(n),n.schema=new y(r),n.dom=new e(h,{keep_values:!0,url_converter:n.convertURL,url_converter_scope:n,hex_colors:r.force_hex_style_colors,class_filter:r.class_filter,update_styles:!0,root_element:n.inline?n.getBody():null,collect:r.content_editable,schema:n.schema,onSetAttrib:function(e){n.fire("SetAttrib",e)}}),n.parser=new b(r,n.schema),n.parser.addAttributeFilter("src,href,style,tabindex",function(e,t){for(var r=e.length,i,o=n.dom,a,s;r--;)if(i=e[r],a=i.attr(t),s="data-mce-"+t,!i.attributes.map[s]){if(0===a.indexOf("data:")||0===a.indexOf("blob:"))continue;"style"===t?(a=o.serializeStyle(o.parseStyle(a),i.name),a.length||(a=null),i.attr(s,a),i.attr(t,a)):"tabindex"===t?(i.attr(s,a),i.attr(t,null)):i.attr(s,n.convertURL(a,t,i.name))}}),n.parser.addNodeFilter("script",function(e){for(var t=e.length,n;t--;)n=e[t],n.attr("type","mce-"+(n.attr("type")||"no/type"))}),n.parser.addNodeFilter("#cdata",function(e){for(var t=e.length,n;t--;)n=e[t],n.type=8,n.name="#comment",n.value="[CDATA["+n.value+"]]"}),n.parser.addNodeFilter("p,h1,h2,h3,h4,h5,h6,div",function(e){for(var t=e.length,r,i=n.schema.getNonEmptyElements();t--;)r=e[t],r.isEmpty(i)&&(r.append(new o("br",1)).shortEnded=!0)}),n.serializer=new a(r,n),n.selection=new l(n.dom,n.getWin(),n.serializer,n),n.formatter=new c(n),n.undoManager=new u(n),n.forceBlocks=new f(n),n.enterKey=new d(n),n._nodeChangeDispatcher=new i(n),n.fire("PreInit"),r.browser_spellcheck||r.gecko_spellcheck||(h.body.spellcheck=!1,S.setAttrib(p,"spellcheck","false")),n.fire("PostRender"),n.quirks=new x(n),r.directionality&&(p.dir=r.directionality),r.nowrap&&(p.style.whiteSpace="nowrap"),r.protect&&n.on("BeforeSetContent",function(e){B(r.protect,function(t){e.content=e.content.replace(t,function(e){return"<!--mce:protected "+escape(e)+"-->"})})}),n.on("SetContent",function(){n.addVisual(n.getBody())}),r.padd_empty_editor&&n.on("PostProcess",function(e){e.content=e.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/,"")}),n.load({initial:!0,format:"html"}),n.startContent=n.getContent({format:"raw"}),n.initialized=!0,n.bindPendingEventDelegates(),n.fire("init"),n.focus(!0),n.nodeChanged({initial:!0}),n.execCallback("init_instance_callback",n),n.contentStyles.length>0&&(m="",B(n.contentStyles,function(e){m+=e+"\r\n"}),n.dom.addStyle(m)),B(n.contentCSS,function(e){n.loadedCSS[e]||(n.dom.loadCSS(e),n.loadedCSS[e]=!0)}),r.auto_focus&&setTimeout(function(){var e;e=r.auto_focus===!0?n:n.editorManager.get(r.auto_focus),e.destroyed||e.focus()},100),s=h=p=null},focus:function(e){var t=this,n=t.selection,r=t.settings.content_editable,i,o,a=t.getDoc(),s;if(!e){if(i=n.getRng(),i.item&&(o=i.item(0)),t._refreshContentEditable(),r||(C.opera||t.getBody().focus(),t.getWin().focus()),O||r){if(s=t.getBody(),s.setActive)try{s.setActive()}catch(l){s.focus()}else s.focus();r&&n.normalize()}o&&o.ownerDocument==a&&(i=a.body.createControlRange(),i.addElement(o),i.select())}t.editorManager.setActive(t)},execCallback:function(e){var t=this,n=t.settings[e],r;if(n)return t.callbackLookup&&(r=t.callbackLookup[e])&&(n=r.func,r=r.scope),"string"==typeof n&&(r=n.replace(/\.\w+$/,""),r=r?L(r):0,n=L(n),t.callbackLookup=t.callbackLookup||{},t.callbackLookup[e]={func:n,scope:r}),n.apply(r||t,Array.prototype.slice.call(arguments,1))},translate:function(e){var t=this.settings.language||"en",n=this.editorManager.i18n;return e?n.data[t+"."+e]||e.replace(/\{\#([^\}]+)\}/g,function(e,r){return n.data[t+"."+r]||"{#"+r+"}"}):""},getLang:function(e,n){return this.editorManager.i18n.data[(this.settings.language||"en")+"."+e]||(n!==t?n:"{#"+e+"}")},getParam:function(e,t,n){var r=e in this.settings?this.settings[e]:t,i;return"hash"===n?(i={},"string"==typeof r?B(r.indexOf("=")>0?r.split(/[;,](?![^=;,]*(?:[;,]|$))/):r.split(","),function(e){e=e.split("="),e.length>1?i[H(e[0])]=H(e[1]):i[H(e[0])]=H(e)}):i=r,i):r},nodeChanged:function(e){this._nodeChangeDispatcher.nodeChanged(e)},addButton:function(e,t){var n=this;t.cmd&&(t.onclick=function(){n.execCommand(t.cmd)}),t.text||t.icon||(t.icon=e),n.buttons=n.buttons||{},t.tooltip=t.tooltip||t.title,n.buttons[e]=t},addMenuItem:function(e,t){var n=this;t.cmd&&(t.onclick=function(){n.execCommand(t.cmd)}),n.menuItems=n.menuItems||{},n.menuItems[e]=t},addContextToolbar:function(e,t){var n=this,r;n.contextToolbars=n.contextToolbars||[],"string"==typeof e&&(r=e,e=function(e){return n.dom.is(e,r)}),n.contextToolbars.push({predicate:e,items:t})},addCommand:function(e,t,n){this.editorCommands.addCommand(e,t,n)},addQueryStateHandler:function(e,t,n){this.editorCommands.addQueryStateHandler(e,t,n)},addQueryValueHandler:function(e,t,n){this.editorCommands.addQueryValueHandler(e,t,n)},addShortcut:function(e,t,n,r){this.shortcuts.add(e,t,n,r)},execCommand:function(e,t,n,r){return this.editorCommands.execCommand(e,t,n,r)},queryCommandState:function(e){return this.editorCommands.queryCommandState(e)},queryCommandValue:function(e){return this.editorCommands.queryCommandValue(e)},queryCommandSupported:function(e){return this.editorCommands.queryCommandSupported(e)},show:function(){var e=this;e.hidden&&(e.hidden=!1,e.inline?e.getBody().contentEditable=!0:(S.show(e.getContainer()),S.hide(e.id)),e.load(),e.fire("show"))},hide:function(){var e=this,t=e.getDoc();e.hidden||(I&&t&&!e.inline&&t.execCommand("SelectAll"),e.save(),e.inline?(e.getBody().contentEditable=!1,e==e.editorManager.focusedEditor&&(e.editorManager.focusedEditor=null)):(S.hide(e.getContainer()),S.setStyle(e.id,"display",e.orgDisplay)),e.hidden=!0,e.fire("hide"))},isHidden:function(){return!!this.hidden},setProgressState:function(e,t){this.fire("ProgressState",{state:e,time:t})},load:function(e){var n=this,r=n.getElement(),i;return r?(e=e||{},e.load=!0,i=n.setContent(r.value!==t?r.value:r.innerHTML,e),e.element=r,e.no_events||n.fire("LoadContent",e),e.element=r=null,i):void 0},save:function(e){var t=this,n=t.getElement(),r,i;if(n&&t.initialized)return e=e||{},e.save=!0,e.element=n,r=e.content=t.getContent(e),e.no_events||t.fire("SaveContent",e),"raw"==e.format&&t.fire("RawSaveContent",e),r=e.content,/TEXTAREA|INPUT/i.test(n.nodeName)?n.value=r:(t.inline||(n.innerHTML=r),(i=S.getParent(t.id,"form"))&&B(i.elements,function(e){return e.name==t.id?(e.value=r,!1):void 0})),e.element=n=null,e.set_dirty!==!1&&(t.isNotDirty=!0),r},setContent:function(e,t){var n=this,r=n.getBody(),i;return t=t||{},t.format=t.format||"html",t.set=!0,t.content=e,t.no_events||n.fire("BeforeSetContent",t),e=t.content,0===e.length||/^\s+$/.test(e)?(i=n.settings.forced_root_block,i&&n.schema.isValidChild(r.nodeName.toLowerCase(),i.toLowerCase())?(e=I&&11>I?"":'<br data-mce-bogus="1">',e=n.dom.createHTML(i,n.settings.forced_root_block_attrs,e)):I||(e='<br data-mce-bogus="1">'),n.dom.setHTML(r,e),n.fire("SetContent",t)):("raw"!==t.format&&(e=new s({},n.schema).serialize(n.parser.parse(e,{isRootContent:!0}))),t.content=H(e),n.dom.setHTML(r,t.content),t.no_events||n.fire("SetContent",t)),t.content},getContent:function(e){var t=this,n,r=t.getBody();return e=e||{},e.format=e.format||"html",e.get=!0,e.getInner=!0,e.no_events||t.fire("BeforeGetContent",e),n="raw"==e.format?r.innerHTML:"text"==e.format?r.innerText||r.textContent:t.serializer.serialize(r,e),"text"!=e.format?e.content=H(n):e.content=n,e.no_events||t.fire("GetContent",e),e.content},insertContent:function(e,t){t&&(e=A({content:e},t)),this.execCommand("mceInsertContent",!1,e)},isDirty:function(){return!this.isNotDirty},getContainer:function(){var e=this;return e.container||(e.container=S.get(e.editorContainer||e.id+"_parent")),e.container},getContentAreaContainer:function(){return this.contentAreaContainer},getElement:function(){return this.targetElm||(this.targetElm=S.get(this.id)),this.targetElm},getWin:function(){var e=this,t;return e.contentWindow||(t=e.iframeElement,t&&(e.contentWindow=t.contentWindow)),e.contentWindow},getDoc:function(){var e=this,t;return e.contentDocument||(t=e.getWin(),t&&(e.contentDocument=t.document)),e.contentDocument},getBody:function(){return this.bodyElement||this.getDoc().body},convertURL:function(e,t,n){var r=this,i=r.settings;return i.urlconverter_callback?r.execCallback("urlconverter_callback",e,n,!0,t):!i.convert_urls||n&&"LINK"==n.nodeName||0===e.indexOf("file:")||0===e.length?e:i.relative_urls?r.documentBaseURI.toRelative(e):e=r.documentBaseURI.toAbsolute(e,i.remove_script_host)},addVisual:function(e){var n=this,r=n.settings,i=n.dom,o;e=e||n.getBody(),n.hasVisual===t&&(n.hasVisual=r.visual),B(i.select("table,a",e),function(e){var t;switch(e.nodeName){case"TABLE":return o=r.visual_table_class||"mce-item-table",t=i.getAttrib(e,"border"),void(t&&"0"!=t||!n.hasVisual?i.removeClass(e,o):i.addClass(e,o));case"A":return void(i.getAttrib(e,"href",!1)||(t=i.getAttrib(e,"name")||e.id,o=r.visual_anchor_class||"mce-item-anchor",t&&n.hasVisual?i.addClass(e,o):i.removeClass(e,o)))}}),n.fire("VisualAid",{element:e,hasVisual:n.hasVisual})},remove:function(){var e=this;e.removed||(e.save(),e.removed=1,e.unbindAllNativeEvents(),e.hasHiddenInput&&S.remove(e.getElement().nextSibling),e.inline||(I&&10>I&&e.getDoc().execCommand("SelectAll",!1,null),S.setStyle(e.id,"display",e.orgDisplay),e.getBody().onload=null),e.fire("remove"),e.editorManager.remove(e),S.remove(e.getContainer()),e.editorUpload.destroy(),e.destroy())},destroy:function(e){var t=this,n;if(!t.destroyed){if(!e&&!t.removed)return void t.remove();e||(t.editorManager.off("beforeunload",t._beforeUnload),t.theme&&t.theme.destroy&&t.theme.destroy(),t.selection.destroy(),t.dom.destroy()),n=t.formElement,n&&(n._mceOldSubmit&&(n.submit=n._mceOldSubmit,n._mceOldSubmit=null),S.unbind(n,"submit reset",t.formEventDelegate)),t.contentAreaContainer=t.formElement=t.container=t.editorContainer=null,t.bodyElement=t.contentDocument=t.contentWindow=null,t.iframeElement=t.targetElm=null,t.selection&&(t.selection=t.selection.win=t.selection.dom=t.selection.dom.doc=null),t.destroyed=1}},uploadImages:function(e){return this.editorUpload.uploadImages(e)},_scanForImages:function(){return this.editorUpload.scanForImages()},_refreshContentEditable:function(){var e=this,t,n;e._isHidden()&&(t=e.getBody(),n=t.parentNode,n.removeChild(t),n.appendChild(t),t.focus())},_isHidden:function(){var e;return O?(e=this.selection.getSel(),!e||!e.rangeCount||0===e.rangeCount):0}},A(k.prototype,_),k}),r(Ne,[],function(){var e={},t="en";return{setCode:function(e){e&&(t=e,this.rtl=this.data[e]?"rtl"===this.data[e]._dir:!1)},getCode:function(){return t},rtl:!1,add:function(t,n){var r=e[t];r||(e[t]=r={});for(var i in n)r[i]=n[i];this.setCode(t)},translate:function(n){var r;if(r=e[t],r||(r={}),"undefined"==typeof n)return n;if("string"!=typeof n&&n.raw)return n.raw;if(n.push){var i=n.slice(1);n=(r[n[0]]||n[0]).replace(/\{([0-9]+)\}/g,function(e,t){return i[t]})}return(r[n]||n).replace(/{context:\w+}$/,"")},data:e}}),r(ke,[b,u],function(e,t){function n(e){function s(){try{return document.activeElement}catch(e){return document.body}}function l(e,t){if(t&&t.startContainer){if(!e.isChildOf(t.startContainer,e.getRoot())||!e.isChildOf(t.endContainer,e.getRoot()))return;return{startContainer:t.startContainer,startOffset:t.startOffset,endContainer:t.endContainer,endOffset:t.endOffset}}return t}function c(e,t){var n;return t.startContainer?(n=e.getDoc().createRange(),n.setStart(t.startContainer,t.startOffset),n.setEnd(t.endContainer,t.endOffset)):n=t,n}function u(e){return!!a.getParent(e,n.isEditorUIElement)}function d(n){var d=n.editor;d.on("init",function(){(d.inline||t.ie)&&("onbeforedeactivate"in document&&t.ie<9?d.dom.bind(d.getBody(),"beforedeactivate",function(e){if(e.target==d.getBody())try{d.lastRng=d.selection.getRng()}catch(t){}}):d.on("nodechange mouseup keyup",function(e){var t=s();"nodechange"==e.type&&e.selectionChange||(t&&t.id==d.id+"_ifr"&&(t=d.getBody()),d.dom.isChildOf(t,d.getBody())&&(d.lastRng=d.selection.getRng()))}),t.webkit&&!r&&(r=function(){var t=e.activeEditor;if(t&&t.selection){var n=t.selection.getRng();n&&!n.collapsed&&(d.lastRng=n)}},a.bind(document,"selectionchange",r)))}),d.on("setcontent",function(){d.lastRng=null}),d.on("mousedown",function(){d.selection.lastFocusBookmark=null}),d.on("focusin",function(){var t=e.focusedEditor;d.selection.lastFocusBookmark&&(d.selection.setRng(c(d,d.selection.lastFocusBookmark)),d.selection.lastFocusBookmark=null),t!=d&&(t&&t.fire("blur",{focusedEditor:d}),e.setActive(d),e.focusedEditor=d,d.fire("focus",{blurredEditor:t}),d.focus(!0)),d.lastRng=null}),d.on("focusout",function(){window.setTimeout(function(){var t=e.focusedEditor;u(s())||t!=d||(d.fire("blur",{focusedEditor:null}),e.focusedEditor=null,d.selection&&(d.selection.lastFocusBookmark=null))},0)}),i||(i=function(t){var n=e.activeEditor;n&&t.target.ownerDocument==document&&(n.selection&&t.target!=n.getBody()&&(n.selection.lastFocusBookmark=l(n.dom,n.lastRng)),t.target==document.body||u(t.target)||e.focusedEditor!=n||(n.fire("blur",{focusedEditor:null}),e.focusedEditor=null))},a.bind(document,"focusin",i)),d.inline&&!o&&(o=function(t){var n=e.activeEditor;if(n.inline&&!n.dom.isChildOf(t.target,n.getBody())){var r=n.selection.getRng();r.collapsed||(n.lastRng=r)}},a.bind(document,"mouseup",o))}function f(t){e.focusedEditor==t.editor&&(e.focusedEditor=null),e.activeEditor||(a.unbind(document,"selectionchange",r),a.unbind(document,"focusin",i),a.unbind(document,"mouseup",o),r=i=o=null)}e.on("AddEditor",d),e.on("RemoveEditor",f)}var r,i,o,a=e.DOM;return n.isEditorUIElement=function(e){return-1!==e.className.toString().indexOf("mce-")},n}),r(Se,[Ee,h,b,U,u,f,K,Ne,ke],function(e,t,n,r,i,o,a,s,l){function c(e){m(b.editors,function(t){t.fire("ResizeWindow",e)})}function u(e,n){n!==x&&(n?t(window).on("resize",c):t(window).off("resize",c),x=n)}function d(e){var t=b.editors,n;delete t[e.id];for(var r=0;r<t.length;r++)if(t[r]==e){t.splice(r,1),n=!0;break}return b.activeEditor==e&&(b.activeEditor=t[0]),b.focusedEditor==e&&(b.focusedEditor=null),n}function f(e){return e&&!(e.getContainer()||e.getBody()).parentNode&&(d(e),e.unbindAllNativeEvents(),e.destroy(!0),e=null),e}var h=n.DOM,p=o.explode,m=o.each,g=o.extend,v=0,y,b,x=!1;return b={$:t,majorVersion:"4",minorVersion:"2.6",releaseDate:"2015-09-28",editors:[],i18n:s,activeEditor:null,setup:function(){var e=this,t,n,i="",o,a;if(n=document.location.href,/^[^:]+:\/\/\/?[^\/]+\//.test(n)&&(n=n.replace(/[\?#].*$/,"").replace(/[\/\\][^\/]+$/,""),/[\/\\]$/.test(n)||(n+="/")),o=window.tinymce||window.tinyMCEPreInit)t=o.base||o.baseURL,i=o.suffix;else{for(var s=document.getElementsByTagName("script"),c=0;c<s.length;c++){a=s[c].src;var u=a.substring(a.lastIndexOf("/"));if(/tinymce(\.full|\.jquery|)(\.min|\.dev|)\.js/.test(a)){-1!=u.indexOf(".min")&&(i=".min"),t=a.substring(0,a.lastIndexOf("/"));break}}!t&&document.currentScript&&(a=document.currentScript.src,-1!=a.indexOf(".min")&&(i=".min"),t=a.substring(0,a.lastIndexOf("/")))}e.baseURL=new r(n).toAbsolute(t),e.documentBaseURL=n,e.baseURI=new r(e.baseURL),e.suffix=i,e.focusManager=new l(e)},init:function(t){function n(e){var t=e.id;return t||(t=e.name,t=t&&!h.get(t)?e.name:h.uniqueId(),e.setAttribute("id",t)),t}function r(t,n,r){if(!f(s.get(t))){var i=new e(t,n,s);i.targetElm=i.targetElm||r,l.push(i),i.render()}}function i(e){var n=t[e];if(n)return n.apply(s,Array.prototype.slice.call(arguments,2))}function o(e,t){return t.constructor===RegExp?t.test(e.className):h.hasClass(e,t)}function a(){var e,s;if(h.unbind(window,"ready",a),i("onpageload"),t.types)return void m(t.types,function(e){m(h.select(e.selector),function(i){r(n(i),g({},t,e),i)})});if(t.selector)return void m(h.select(t.selector),function(e){r(n(e),t,e)});switch(t.target&&r(n(t.target),t),t.mode){case"exact":e=t.elements||"",e.length>0&&m(p(e),function(e){var n;(n=h.get(e))?r(e,t,n):m(document.forms,function(n){m(n.elements,function(n){n.name===e&&(e="mce_editor_"+v++,h.setAttrib(n,"id",e),r(e,t,n))})})});break;case"textareas":case"specific_textareas":m(h.select("textarea"),function(e){t.editor_deselector&&o(e,t.editor_deselector)||(!t.editor_selector||o(e,t.editor_selector))&&r(n(e),t,e)})}t.oninit&&(e=s=0,m(l,function(t){s++,t.initialized?e++:t.on("init",function(){e++,e==s&&i("oninit")}),e==s&&i("oninit")}))}var s=this,l=[];s.settings=t,h.bind(window,"ready",a)},get:function(e){return arguments.length?e in this.editors?this.editors[e]:null:this.editors},add:function(e){var t=this,n=t.editors;return n[e.id]=e,n.push(e),u(n,!0),t.activeEditor=e,t.fire("AddEditor",{editor:e}),y||(y=function(){t.fire("BeforeUnload")},h.bind(window,"beforeunload",y)),e},createEditor:function(t,n){return this.add(new e(t,n,this))},remove:function(e){var t=this,n,r=t.editors,i;{if(e)return"string"==typeof e?(e=e.selector||e,void m(h.select(e),function(e){i=r[e.id],i&&t.remove(i)})):(i=e,r[i.id]?(d(i)&&t.fire("RemoveEditor",{editor:i}),r.length||h.unbind(window,"beforeunload",y),i.remove(),u(r,r.length>0),i):null);for(n=r.length-1;n>=0;n--)t.remove(r[n])}},execCommand:function(t,n,r){var i=this,o=i.get(r);switch(t){case"mceAddEditor":return i.get(r)||new e(r,i.settings,i).render(),!0;case"mceRemoveEditor":return o&&o.remove(),!0;case"mceToggleEditor":return o?(o.isHidden()?o.show():o.hide(),!0):(i.execCommand("mceAddEditor",0,r),!0)}return i.activeEditor?i.activeEditor.execCommand(t,n,r):!1},triggerSave:function(){m(this.editors,function(e){e.save()})},addI18n:function(e,t){s.add(e,t)},translate:function(e){return s.translate(e)},setActive:function(e){var t=this.activeEditor;this.activeEditor!=e&&(t&&t.fire("deactivate",{relatedTarget:e}),e.fire("activate",{relatedTarget:t})),this.activeEditor=e}},g(b,a),b.setup(),window.tinymce=window.tinyMCE=b,b}),r(Te,[Se,f],function(e,t){var n=t.each,r=t.explode;e.on("AddEditor",function(e){var t=e.editor;t.on("preInit",function(){function e(e,t){n(t,function(t,n){t&&s.setStyle(e,n,t)}),s.rename(e,"span")}function i(e){s=t.dom,l.convert_fonts_to_spans&&n(s.select("font,u,strike",e.node),function(e){o[e.nodeName.toLowerCase()](s,e)})}var o,a,s,l=t.settings;l.inline_styles&&(a=r(l.font_size_legacy_values),o={font:function(t,n){e(n,{backgroundColor:n.style.backgroundColor,color:n.color,fontFamily:n.face,fontSize:a[parseInt(n.size,10)-1]})},u:function(n,r){"html4"===t.settings.schema&&e(r,{textDecoration:"underline"})},strike:function(t,n){e(n,{textDecoration:"line-through"})}},t.on("PreProcess SetContent",i))})})}),r(Re,[K,f],function(e,t){var n={send:function(e){function r(){!e.async||4==i.readyState||o++>1e4?(e.success&&1e4>o&&200==i.status?e.success.call(e.success_scope,""+i.responseText,i,e):e.error&&e.error.call(e.error_scope,o>1e4?"TIMED_OUT":"GENERAL",i,e),i=null):setTimeout(r,10)}var i,o=0;if(e.scope=e.scope||this,e.success_scope=e.success_scope||e.scope,e.error_scope=e.error_scope||e.scope,e.async=e.async===!1?!1:!0,e.data=e.data||"",i=new XMLHttpRequest){if(i.overrideMimeType&&i.overrideMimeType(e.content_type),i.open(e.type||(e.data?"POST":"GET"),e.url,e.async),e.crossDomain&&(i.withCredentials=!0),e.content_type&&i.setRequestHeader("Content-Type",e.content_type),e.requestheaders&&t.each(e.requestheaders,function(e){i.setRequestHeader(e.key,e.value)}),i.setRequestHeader("X-Requested-With","XMLHttpRequest"),i=n.fire("beforeSend",{xhr:i,settings:e}).xhr,i.send(e.data),!e.async)return r();setTimeout(r,10)}}};return t.extend(n,e),n}),r(Ae,[],function(){function e(t,n){var r,i,o,a;if(n=n||'"',null===t)return"null";if(o=typeof t,"string"==o)return i="\bb	t\nn\ff\rr\"\"''\\\\",n+t.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g,function(e,t){return'"'===n&&"'"===e?e:(r=i.indexOf(t),r+1?"\\"+i.charAt(r+1):(e=t.charCodeAt().toString(16),"\\u"+"0000".substring(e.length)+e))})+n;if("object"==o){if(t.hasOwnProperty&&"[object Array]"===Object.prototype.toString.call(t)){for(r=0,i="[";r<t.length;r++)i+=(r>0?",":"")+e(t[r],n);return i+"]"}i="{";for(a in t)t.hasOwnProperty(a)&&(i+="function"!=typeof t[a]?(i.length>1?","+n:n)+a+n+":"+e(t[a],n):"");return i+"}"}return""+t}return{serialize:e,parse:function(e){try{return window[String.fromCharCode(101)+"val"]("("+e+")")}catch(t){}}}}),r(Be,[Ae,Re,f],function(e,t,n){function r(e){this.settings=i({},e),this.count=0}var i=n.extend;return r.sendRPC=function(e){return(new r).send(e)},r.prototype={send:function(n){var r=n.error,o=n.success;n=i(this.settings,n),n.success=function(t,i){t=e.parse(t),"undefined"==typeof t&&(t={error:"JSON Parse error."}),t.error?r.call(n.error_scope||n.scope,t.error,i):o.call(n.success_scope||n.scope,t.result)},n.error=function(e,t){r&&r.call(n.error_scope||n.scope,e,t)},n.data=e.serialize({id:n.id||"c"+this.count++,method:n.method,params:n.params}),n.content_type="application/json",t.send(n)}},r}),r(De,[b],function(e){return{callbacks:{},count:0,send:function(n){var r=this,i=e.DOM,o=n.count!==t?n.count:r.count,a="tinymce_jsonp_"+o;r.callbacks[o]=function(e){i.remove(a),delete r.callbacks[o],n.callback(e)},i.add(i.doc.body,"script",{id:a,src:n.url,type:"text/javascript"}),r.count++}}}),r(Me,[],function(){
function e(){s=[];for(var e in a)s.push(e);i.length=s.length}function n(){function n(e){var n,r;return r=e!==t?u+e:i.indexOf(",",u),-1===r||r>i.length?null:(n=i.substring(u,r),u=r+1,n)}var r,i,s,u=0;if(a={},c){o.load(l),i=o.getAttribute(l)||"";do{var d=n();if(null===d)break;if(r=n(parseInt(d,32)||0),null!==r){if(d=n(),null===d)break;s=n(parseInt(d,32)||0),r&&(a[r]=s)}}while(null!==r);e()}}function r(){var t,n="";if(c){for(var r in a)t=a[r],n+=(n?",":"")+r.length.toString(32)+","+r+","+t.length.toString(32)+","+t;o.setAttribute(l,n);try{o.save(l)}catch(i){}e()}}var i,o,a,s,l,c;try{if(window.localStorage)return localStorage}catch(u){}return l="tinymce",o=document.documentElement,c=!!o.addBehavior,c&&o.addBehavior("#default#userData"),i={key:function(e){return s[e]},getItem:function(e){return e in a?a[e]:null},setItem:function(e,t){a[e]=""+t,r()},removeItem:function(e){delete a[e],r()},clear:function(){a={},r()}},n(),i}),r(He,[b,l,x,C,f,u],function(e,t,n,r,i,o){var a=window.tinymce;return a.DOM=e.DOM,a.ScriptLoader=n.ScriptLoader,a.PluginManager=r.PluginManager,a.ThemeManager=r.ThemeManager,a.dom=a.dom||{},a.dom.Event=t.Event,i.each(i,function(e,t){a[t]=e}),i.each("isOpera isWebKit isIE isGecko isMac".split(" "),function(e){a[e]=o[e.substr(2).toLowerCase()]}),{}}),r(Le,[$,f],function(e,t){return e.extend({Defaults:{firstControlClass:"first",lastControlClass:"last"},init:function(e){this.settings=t.extend({},this.Defaults,e)},preRender:function(e){e.bodyClasses.add(this.settings.containerClass)},applyClasses:function(e){var t=this,n=t.settings,r,i,o,a;r=n.firstControlClass,i=n.lastControlClass,e.each(function(e){e.classes.remove(r).remove(i).add(n.controlClass),e.visible()&&(o||(o=e),a=e)}),o&&o.classes.add(r),a&&a.classes.add(i)},renderHtml:function(e){var t=this,n="";return t.applyClasses(e.items()),e.items().each(function(e){n+=e.renderHtml()}),n},recalc:function(){},postRender:function(){},isNative:function(){return!1}})}),r(Pe,[Le],function(e){return e.extend({Defaults:{containerClass:"abs-layout",controlClass:"abs-layout-item"},recalc:function(e){e.items().filter(":visible").each(function(e){var t=e.settings;e.layoutRect({x:t.x,y:t.y,w:t.w,h:t.h}),e.recalc&&e.recalc()})},renderHtml:function(e){return'<div id="'+e._id+'-absend" class="'+e.classPrefix+'abs-end"></div>'+this._super(e)}})}),r(Oe,[te,le],function(e,t){return e.extend({Mixins:[t],Defaults:{classes:"widget tooltip tooltip-n"},renderHtml:function(){var e=this,t=e.classPrefix;return'<div id="'+e._id+'" class="'+e.classes+'" role="presentation"><div class="'+t+'tooltip-arrow"></div><div class="'+t+'tooltip-inner">'+e.encode(e.state.get("text"))+"</div></div>"},bindStates:function(){var e=this;return e.state.on("change:text",function(t){e.getEl().lastChild.innerHTML=e.encode(t.value)}),e._super()},repaint:function(){var e=this,t,n;t=e.getEl().style,n=e._layoutRect,t.left=n.x+"px",t.top=n.y+"px",t.zIndex=131070}})}),r(Ie,[te,Oe],function(e,t){var n,r=e.extend({init:function(e){var t=this;t._super(e),e=t.settings,t.canFocus=!0,e.tooltip&&r.tooltips!==!1&&(t.on("mouseenter",function(n){var r=t.tooltip().moveTo(-65535);if(n.control==t){var i=r.text(e.tooltip).show().testMoveRel(t.getEl(),["bc-tc","bc-tl","bc-tr"]);r.classes.toggle("tooltip-n","bc-tc"==i),r.classes.toggle("tooltip-nw","bc-tl"==i),r.classes.toggle("tooltip-ne","bc-tr"==i),r.moveRel(t.getEl(),i)}else r.hide()}),t.on("mouseleave mousedown click",function(){t.tooltip().hide()})),t.aria("label",e.ariaLabel||e.tooltip)},tooltip:function(){return n||(n=new t({type:"tooltip"}),n.renderTo()),n},postRender:function(){var e=this,t=e.settings;e._super(),e.parent()||!t.width&&!t.height||(e.initLayoutRect(),e.repaint()),t.autofocus&&e.focus()},bindStates:function(){function e(e){n.aria("disabled",e),n.classes.toggle("disabled",e)}function t(e){n.aria("pressed",e),n.classes.toggle("active",e)}var n=this;return n.state.on("change:disabled",function(t){e(t.value)}),n.state.on("change:active",function(e){t(e.value)}),n.state.get("disabled")&&e(!0),n.state.get("active")&&t(!0),n._super()},remove:function(){this._super(),n&&(n.remove(),n=null)}});return r}),r(Fe,[Ie],function(e){return e.extend({Defaults:{classes:"widget btn",role:"button"},init:function(e){var t=this,n;t._super(e),e=t.settings,n=t.settings.size,t.on("click mousedown",function(e){e.preventDefault()}),t.on("touchstart",function(e){t.fire("click",e),e.preventDefault()}),e.subtype&&t.classes.add(e.subtype),n&&t.classes.add("btn-"+n),e.icon&&t.icon(e.icon)},icon:function(e){return arguments.length?(this.state.set("icon",e),this):this.state.get("icon")},repaint:function(){var e=this.getEl().firstChild,t;e&&(t=e.style,t.width=t.height="100%"),this._super()},renderHtml:function(){var e=this,t=e._id,n=e.classPrefix,r=e.state.get("icon"),i,o=e.state.get("text");return i=e.settings.image,i?(r="none","string"!=typeof i&&(i=window.getSelection?i[0]:i[1]),i=" style=\"background-image: url('"+i+"')\""):i="",o&&e.classes.add("btn-has-text"),r=e.settings.icon?n+"ico "+n+"i-"+r:"",'<div id="'+t+'" class="'+e.classes+'" tabindex="-1" aria-labelledby="'+t+'"><button role="presentation" type="button" tabindex="-1">'+(r?'<i class="'+r+'"'+i+"></i>":"")+(o?e.encode(o):"")+"</button></div>"},bindStates:function(){function e(e){for(var n=t.getEl().firstChild.firstChild;n;n=n.nextSibling)3==n.nodeType&&(n.data=t.translate(e));t.classes.toggle("btn-has-text",!!e)}var t=this;return t.state.on("change:text",function(t){e(t.value)}),t.state.on("change:icon",function(n){var r=n.value,i=t.classPrefix;t.settings.icon=r,r=r?i+"ico "+i+"i-"+t.settings.icon:"";var o=t.getEl().firstChild,a=o.getElementsByTagName("i")[0];r?(a&&a==o.firstChild||(a=document.createElement("i"),o.insertBefore(a,o.firstChild)),a.className=r):a&&o.removeChild(a),e(t.state.get("text"))}),t._super()}})}),r(ze,[ie],function(e){return e.extend({Defaults:{defaultType:"button",role:"group"},renderHtml:function(){var e=this,t=e._layout;return e.classes.add("btn-group"),e.preRender(),t.preRender(e),'<div id="'+e._id+'" class="'+e.classes+'"><div id="'+e._id+'-body">'+(e.settings.html||"")+t.renderHtml(e)+"</div></div>"}})}),r(We,[Ie],function(e){return e.extend({Defaults:{classes:"checkbox",role:"checkbox",checked:!1},init:function(e){var t=this;t._super(e),t.on("click mousedown",function(e){e.preventDefault()}),t.on("click",function(e){e.preventDefault(),t.disabled()||t.checked(!t.checked())}),t.checked(t.settings.checked)},checked:function(e){return arguments.length?(this.state.set("checked",e),this):this.state.get("checked")},value:function(e){return arguments.length?this.checked(e):this.checked()},renderHtml:function(){var e=this,t=e._id,n=e.classPrefix;return'<div id="'+t+'" class="'+e.classes+'" unselectable="on" aria-labelledby="'+t+'-al" tabindex="-1"><i class="'+n+"ico "+n+'i-checkbox"></i><span id="'+t+'-al" class="'+n+'label">'+e.encode(e.state.get("text"))+"</span></div>"},bindStates:function(){function e(e){t.classes.toggle("checked",e),t.aria("checked",e)}var t=this;return t.state.on("change:text",function(e){t.getEl("al").firstChild.data=t.translate(e.value)}),t.state.on("change:checked change:value",function(n){t.fire("change"),e(n.value)}),t.state.on("change:icon",function(e){var n=e.value,r=t.classPrefix;if("undefined"==typeof n)return t.settings.icon;t.settings.icon=n,n=n?r+"ico "+r+"i-"+t.settings.icon:"";var i=t.getEl().firstChild,o=i.getElementsByTagName("i")[0];n?(o&&o==i.firstChild||(o=document.createElement("i"),i.insertBefore(o,i.firstChild)),o.className=n):o&&i.removeChild(o)}),t.state.get("checked")&&e(!0),t._super()}})}),r(Ve,[Ie,ne,J,h],function(e,t,n,r){return e.extend({init:function(e){var t=this;t._super(e),e=t.settings,t.classes.add("combobox"),t.subinput=!0,t.ariaTarget="inp",e.menu=e.menu||e.values,e.menu&&(e.icon="caret"),t.on("click",function(n){var i=n.target,o=t.getEl();if(r.contains(o,i)||i==o)for(;i&&i!=o;)i.id&&-1!=i.id.indexOf("-open")&&(t.fire("action"),e.menu&&(t.showMenu(),n.aria&&t.menu.items()[0].focus())),i=i.parentNode}),t.on("keydown",function(e){"INPUT"==e.target.nodeName&&13==e.keyCode&&t.parents().reverse().each(function(n){var r=t.state.get("value"),i=t.getEl("inp").value;return e.preventDefault(),t.state.set("value",i),r!=i&&t.fire("change"),n.hasEventListeners("submit")&&n.toJSON?(n.fire("submit",{data:n.toJSON()}),!1):void 0})}),t.on("keyup",function(e){"INPUT"==e.target.nodeName&&t.state.set("value",e.target.value)})},showMenu:function(){var e=this,n=e.settings,r;e.menu||(r=n.menu||[],r.length?r={type:"menu",items:r}:r.type=r.type||"menu",e.menu=t.create(r).parent(e).renderTo(e.getContainerElm()),e.fire("createmenu"),e.menu.reflow(),e.menu.on("cancel",function(t){t.control===e.menu&&e.focus()}),e.menu.on("show hide",function(t){t.control.items().each(function(t){t.active(t.value()==e.value())})}).fire("show"),e.menu.on("select",function(t){e.value(t.control.value())}),e.on("focusin",function(t){"INPUT"==t.target.tagName.toUpperCase()&&e.menu.hide()}),e.aria("expanded",!0)),e.menu.show(),e.menu.layoutRect({w:e.layoutRect().w}),e.menu.moveRel(e.getEl(),e.isRtl()?["br-tr","tr-br"]:["bl-tl","tl-bl"])},focus:function(){this.getEl("inp").focus()},repaint:function(){var e=this,t=e.getEl(),i=e.getEl("open"),o=e.layoutRect(),a,s;a=i?o.w-n.getSize(i).width-10:o.w-10;var l=document;return l.all&&(!l.documentMode||l.documentMode<=8)&&(s=e.layoutRect().h-2+"px"),r(t.firstChild).css({width:a,lineHeight:s}),e._super(),e},postRender:function(){var e=this;return r(this.getEl("inp")).on("change",function(t){e.state.set("value",t.target.value),e.fire("change",t)}),e._super()},renderHtml:function(){var e=this,t=e._id,n=e.settings,r=e.classPrefix,i=e.state.get("value")||"",o,a,s="",l="";return"spellcheck"in n&&(l+=' spellcheck="'+n.spellcheck+'"'),n.maxLength&&(l+=' maxlength="'+n.maxLength+'"'),n.size&&(l+=' size="'+n.size+'"'),n.subtype&&(l+=' type="'+n.subtype+'"'),e.disabled()&&(l+=' disabled="disabled"'),o=n.icon,o&&"caret"!=o&&(o=r+"ico "+r+"i-"+n.icon),a=e.state.get("text"),(o||a)&&(s='<div id="'+t+'-open" class="'+r+"btn "+r+'open" tabIndex="-1" role="button"><button id="'+t+'-action" type="button" hidefocus="1" tabindex="-1">'+("caret"!=o?'<i class="'+o+'"></i>':'<i class="'+r+'caret"></i>')+(a?(o?" ":"")+a:"")+"</button></div>",e.classes.add("has-open")),'<div id="'+t+'" class="'+e.classes+'"><input id="'+t+'-inp" class="'+r+'textbox" value="'+e.encode(i,!1)+'" hidefocus="1"'+l+' placeholder="'+e.encode(n.placeholder)+'" />'+s+"</div>"},value:function(e){return arguments.length?(this.state.set("value",e),this):(this.state.get("rendered")&&this.state.set("value",this.getEl("inp").value),this.state.get("value"))},bindStates:function(){var e=this;return e.state.on("change:value",function(t){e.getEl("inp").value!=t.value&&(e.getEl("inp").value=t.value)}),e.state.on("change:disabled",function(t){e.getEl("inp").disabled=t.value}),e._super()},remove:function(){r(this.getEl("inp")).off(),this._super()}})}),r(Ue,[Ve],function(e){return e.extend({init:function(e){var t=this;e.spellcheck=!1,e.onaction&&(e.icon="none"),t._super(e),t.classes.add("colorbox"),t.on("change keyup postrender",function(){t.repaintColor(t.value())})},repaintColor:function(e){var t=this.getEl().getElementsByTagName("i")[0];if(t)try{t.style.background=e}catch(n){}},bindStates:function(){var e=this;return e.state.on("change:value",function(t){e._rendered&&e.repaintColor(t.value)}),e._super()}})}),r($e,[Fe,ue],function(e,t){return e.extend({showPanel:function(){var e=this,n=e.settings;if(e.active(!0),e.panel)e.panel.show();else{var r=n.panel;r.type&&(r={layout:"grid",items:r}),r.role=r.role||"dialog",r.popover=!0,r.autohide=!0,r.ariaRoot=!0,e.panel=new t(r).on("hide",function(){e.active(!1)}).on("cancel",function(t){t.stopPropagation(),e.focus(),e.hidePanel()}).parent(e).renderTo(e.getContainerElm()),e.panel.fire("show"),e.panel.reflow()}e.panel.moveRel(e.getEl(),n.popoverAlign||(e.isRtl()?["bc-tr","bc-tc"]:["bc-tl","bc-tc"]))},hidePanel:function(){var e=this;e.panel&&e.panel.hide()},postRender:function(){var e=this;return e.aria("haspopup",!0),e.on("click",function(t){t.control===e&&(e.panel&&e.panel.visible()?e.hidePanel():(e.showPanel(),e.panel.focus(!!t.aria)))}),e._super()},remove:function(){return this.panel&&(this.panel.remove(),this.panel=null),this._super()}})}),r(qe,[$e,b],function(e,t){var n=t.DOM;return e.extend({init:function(e){this._super(e),this.classes.add("colorbutton")},color:function(e){return e?(this._color=e,this.getEl("preview").style.backgroundColor=e,this):this._color},resetColor:function(){return this._color=null,this.getEl("preview").style.backgroundColor=null,this},renderHtml:function(){var e=this,t=e._id,n=e.classPrefix,r=e.state.get("text"),i=e.settings.icon?n+"ico "+n+"i-"+e.settings.icon:"",o=e.settings.image?" style=\"background-image: url('"+e.settings.image+"')\"":"";return'<div id="'+t+'" class="'+e.classes+'" role="button" tabindex="-1" aria-haspopup="true"><button role="presentation" hidefocus="1" type="button" tabindex="-1">'+(i?'<i class="'+i+'"'+o+"></i>":"")+'<span id="'+t+'-preview" class="'+n+'preview"></span>'+(r?(i?" ":"")+r:"")+'</button><button type="button" class="'+n+'open" hidefocus="1" tabindex="-1"> <i class="'+n+'caret"></i></button></div>'},postRender:function(){var e=this,t=e.settings.onclick;return e.on("click",function(r){r.aria&&"down"==r.aria.key||r.control!=e||n.getParent(r.target,"."+e.classPrefix+"open")||(r.stopImmediatePropagation(),t.call(e,r))}),delete e.settings.onclick,e._super()}})}),r(je,[],function(){function e(e){function i(e,i,o){var a,s,l,c,u,d;return a=0,s=0,l=0,e/=255,i/=255,o/=255,u=t(e,t(i,o)),d=n(e,n(i,o)),u==d?(l=u,{h:0,s:0,v:100*l}):(c=e==u?i-o:o==u?e-i:o-e,a=e==u?3:o==u?1:5,a=60*(a-c/(d-u)),s=(d-u)/d,l=d,{h:r(a),s:r(100*s),v:r(100*l)})}function o(e,i,o){var a,s,l,c;if(e=(parseInt(e,10)||0)%360,i=parseInt(i,10)/100,o=parseInt(o,10)/100,i=n(0,t(i,1)),o=n(0,t(o,1)),0===i)return void(d=f=h=r(255*o));switch(a=e/60,s=o*i,l=s*(1-Math.abs(a%2-1)),c=o-s,Math.floor(a)){case 0:d=s,f=l,h=0;break;case 1:d=l,f=s,h=0;break;case 2:d=0,f=s,h=l;break;case 3:d=0,f=l,h=s;break;case 4:d=l,f=0,h=s;break;case 5:d=s,f=0,h=l;break;default:d=f=h=0}d=r(255*(d+c)),f=r(255*(f+c)),h=r(255*(h+c))}function a(){function e(e){return e=parseInt(e,10).toString(16),e.length>1?e:"0"+e}return"#"+e(d)+e(f)+e(h)}function s(){return{r:d,g:f,b:h}}function l(){return i(d,f,h)}function c(e){var t;return"object"==typeof e?"r"in e?(d=e.r,f=e.g,h=e.b):"v"in e&&o(e.h,e.s,e.v):(t=/rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)[^\)]*\)/gi.exec(e))?(d=parseInt(t[1],10),f=parseInt(t[2],10),h=parseInt(t[3],10)):(t=/#([0-F]{2})([0-F]{2})([0-F]{2})/gi.exec(e))?(d=parseInt(t[1],16),f=parseInt(t[2],16),h=parseInt(t[3],16)):(t=/#([0-F])([0-F])([0-F])/gi.exec(e))&&(d=parseInt(t[1]+t[1],16),f=parseInt(t[2]+t[2],16),h=parseInt(t[3]+t[3],16)),d=0>d?0:d>255?255:d,f=0>f?0:f>255?255:f,h=0>h?0:h>255?255:h,u}var u=this,d=0,f=0,h=0;e&&c(e),u.toRgb=s,u.toHsv=l,u.toHex=a,u.parse=c}var t=Math.min,n=Math.max,r=Math.round;return e}),r(Ke,[Ie,oe,J,je],function(e,t,n,r){return e.extend({Defaults:{classes:"widget colorpicker"},init:function(e){this._super(e)},postRender:function(){function e(e,t){var r=n.getPos(e),i,o;return i=t.pageX-r.x,o=t.pageY-r.y,i=Math.max(0,Math.min(i/e.clientWidth,1)),o=Math.max(0,Math.min(o/e.clientHeight,1)),{x:i,y:o}}function i(e,t){var i=(360-e.h)/360;n.css(d,{top:100*i+"%"}),t||n.css(h,{left:e.s+"%",top:100-e.v+"%"}),f.style.background=new r({s:100,v:100,h:e.h}).toHex(),s.color().parse({s:e.s,v:e.v,h:e.h})}function o(t){var n;n=e(f,t),c.s=100*n.x,c.v=100*(1-n.y),i(c),s.fire("change")}function a(t){var n;n=e(u,t),c=l.toHsv(),c.h=360*(1-n.y),i(c,!0),s.fire("change")}var s=this,l=s.color(),c,u,d,f,h;u=s.getEl("h"),d=s.getEl("hp"),f=s.getEl("sv"),h=s.getEl("svp"),s._repaint=function(){c=l.toHsv(),i(c)},s._super(),s._svdraghelper=new t(s._id+"-sv",{start:o,drag:o}),s._hdraghelper=new t(s._id+"-h",{start:a,drag:a}),s._repaint()},rgb:function(){return this.color().toRgb()},value:function(e){var t=this;return arguments.length?(t.color().parse(e),void(t._rendered&&t._repaint())):t.color().toHex()},color:function(){return this._color||(this._color=new r),this._color},renderHtml:function(){function e(){var e,t,n="",i,a;for(i="filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=",a=o.split(","),e=0,t=a.length-1;t>e;e++)n+='<div class="'+r+'colorpicker-h-chunk" style="height:'+100/t+"%;"+i+a[e]+",endColorstr="+a[e+1]+");-ms-"+i+a[e]+",endColorstr="+a[e+1]+')"></div>';return n}var t=this,n=t._id,r=t.classPrefix,i,o="#ff0000,#ff0080,#ff00ff,#8000ff,#0000ff,#0080ff,#00ffff,#00ff80,#00ff00,#80ff00,#ffff00,#ff8000,#ff0000",a="background: -ms-linear-gradient(top,"+o+");background: linear-gradient(to bottom,"+o+");";return i='<div id="'+n+'-h" class="'+r+'colorpicker-h" style="'+a+'">'+e()+'<div id="'+n+'-hp" class="'+r+'colorpicker-h-marker"></div></div>','<div id="'+n+'" class="'+t.classes+'"><div id="'+n+'-sv" class="'+r+'colorpicker-sv"><div class="'+r+'colorpicker-overlay1"><div class="'+r+'colorpicker-overlay2"><div id="'+n+'-svp" class="'+r+'colorpicker-selector1"><div class="'+r+'colorpicker-selector2"></div></div></div></div></div>'+i+"</div>"}})}),r(Ye,[Ie],function(e){return e.extend({init:function(e){var t=this;e.delimiter||(e.delimiter="\xbb"),t._super(e),t.classes.add("path"),t.canFocus=!0,t.on("click",function(e){var n,r=e.target;(n=r.getAttribute("data-index"))&&t.fire("select",{value:t.row()[n],index:n})}),t.row(t.settings.row)},focus:function(){var e=this;return e.getEl().firstChild.focus(),e},row:function(e){return arguments.length?(this.state.set("row",e),this):this.state.get("row")},renderHtml:function(){var e=this;return'<div id="'+e._id+'" class="'+e.classes+'">'+e._getDataPathHtml(e.state.get("row"))+"</div>"},bindStates:function(){var e=this;return e.state.on("change:row",function(t){e.innerHtml(e._getDataPathHtml(t.value))}),e._super()},_getDataPathHtml:function(e){var t=this,n=e||[],r,i,o="",a=t.classPrefix;for(r=0,i=n.length;i>r;r++)o+=(r>0?'<div class="'+a+'divider" aria-hidden="true"> '+t.settings.delimiter+" </div>":"")+'<div role="button" class="'+a+"path-item"+(r==i-1?" "+a+"last":"")+'" data-index="'+r+'" tabindex="-1" id="'+t._id+"-"+r+'" aria-level="'+r+'">'+n[r].name+"</div>";return o||(o='<div class="'+a+'path-item">\xa0</div>'),o}})}),r(Ge,[Ye,Se],function(e,t){return e.extend({postRender:function(){function e(e){if(1===e.nodeType){if("BR"==e.nodeName||e.getAttribute("data-mce-bogus"))return!0;if("bookmark"===e.getAttribute("data-mce-type"))return!0}return!1}var n=this,r=t.activeEditor;return r.settings.elementpath!==!1&&(n.on("select",function(e){r.focus(),r.selection.select(this.row()[e.index].element),r.nodeChanged()}),r.on("nodeChange",function(t){for(var i=[],o=t.parents,a=o.length;a--;)if(1==o[a].nodeType&&!e(o[a])){var s=r.fire("ResolveName",{name:o[a].nodeName.toLowerCase(),target:o[a]});if(s.isDefaultPrevented()||i.push({name:s.name,element:o[a]}),s.isPropagationStopped())break}n.row(i)})),n._super()}})}),r(Xe,[ie],function(e){return e.extend({Defaults:{layout:"flex",align:"center",defaults:{flex:1}},renderHtml:function(){var e=this,t=e._layout,n=e.classPrefix;return e.classes.add("formitem"),t.preRender(e),'<div id="'+e._id+'" class="'+e.classes+'" hidefocus="1" tabindex="-1">'+(e.settings.title?'<div id="'+e._id+'-title" class="'+n+'title">'+e.settings.title+"</div>":"")+'<div id="'+e._id+'-body" class="'+e.bodyClasses+'">'+(e.settings.html||"")+t.renderHtml(e)+"</div></div>"}})}),r(Je,[ie,Xe,f],function(e,t,n){return e.extend({Defaults:{containerCls:"form",layout:"flex",direction:"column",align:"stretch",flex:1,padding:20,labelGap:30,spacing:10,callbacks:{submit:function(){this.submit()}}},preRender:function(){var e=this,r=e.items();e.settings.formItemDefaults||(e.settings.formItemDefaults={layout:"flex",autoResize:"overflow",defaults:{flex:1}}),r.each(function(r){var i,o=r.settings.label;o&&(i=new t(n.extend({items:{type:"label",id:r._id+"-l",text:o,flex:0,forId:r._id,disabled:r.disabled()}},e.settings.formItemDefaults)),i.type="formitem",r.aria("labelledby",r._id+"-l"),"undefined"==typeof r.settings.flex&&(r.settings.flex=1),e.replace(r,i),i.add(r))})},submit:function(){return this.fire("submit",{data:this.toJSON()})},postRender:function(){var e=this;e._super(),e.fromJSON(e.settings.data)},bindStates:function(){function e(){var e=0,n=[],r,i,o;if(t.settings.labelGapCalc!==!1)for(o="children"==t.settings.labelGapCalc?t.find("formitem"):t.items(),o.filter("formitem").each(function(t){var r=t.items()[0],i=r.getEl().clientWidth;e=i>e?i:e,n.push(r)}),i=t.settings.labelGap||0,r=n.length;r--;)n[r].settings.minWidth=e+i}var t=this;t._super(),t.on("show",e),e()}})}),r(Qe,[Je],function(e){return e.extend({Defaults:{containerCls:"fieldset",layout:"flex",direction:"column",align:"stretch",flex:1,padding:"25 15 5 15",labelGap:30,spacing:10,border:1},renderHtml:function(){var e=this,t=e._layout,n=e.classPrefix;return e.preRender(),t.preRender(e),'<fieldset id="'+e._id+'" class="'+e.classes+'" hidefocus="1" tabindex="-1">'+(e.settings.title?'<legend id="'+e._id+'-title" class="'+n+'fieldset-title">'+e.settings.title+"</legend>":"")+'<div id="'+e._id+'-body" class="'+e.bodyClasses+'">'+(e.settings.html||"")+t.renderHtml(e)+"</div></fieldset>"}})}),r(Ze,[Ve,f],function(e,t){return e.extend({init:function(e){var n=this,r=tinymce.activeEditor,i=r.settings,o,a,s;e.spellcheck=!1,s=i.file_picker_types||i.file_browser_callback_types,s&&(s=t.makeMap(s,/[, ]/)),(!s||s[e.filetype])&&(a=i.file_picker_callback,!a||s&&!s[e.filetype]?(a=i.file_browser_callback,!a||s&&!s[e.filetype]||(o=function(){a(n.getEl("inp").id,n.value(),e.filetype,window)})):o=function(){var i=n.fire("beforecall").meta;i=t.extend({filetype:e.filetype},i),a.call(r,function(e,t){n.value(e).fire("change",{meta:t})},n.value(),i)}),o&&(e.icon="browse",e.onaction=o),n._super(e)}})}),r(et,[Pe],function(e){return e.extend({recalc:function(e){var t=e.layoutRect(),n=e.paddingBox;e.items().filter(":visible").each(function(e){e.layoutRect({x:n.left,y:n.top,w:t.innerW-n.right-n.left,h:t.innerH-n.top-n.bottom}),e.recalc&&e.recalc()})}})}),r(tt,[Pe],function(e){return e.extend({recalc:function(e){var t,n,r,i,o,a,s,l,c,u,d,f,h,p,m,g,v=[],y,b,x,C,w,_,E,N,k,S,T,R,A,B,D,M,H,L,P,O,I,F,z=Math.max,W=Math.min;for(r=e.items().filter(":visible"),i=e.layoutRect(),o=e.paddingBox,a=e.settings,f=e.isRtl()?a.direction||"row-reversed":a.direction,s=a.align,l=e.isRtl()?a.pack||"end":a.pack,c=a.spacing||0,("row-reversed"==f||"column-reverse"==f)&&(r=r.set(r.toArray().reverse()),f=f.split("-")[0]),"column"==f?(k="y",E="h",N="minH",S="maxH",R="innerH",T="top",A="deltaH",B="contentH",P="left",H="w",D="x",M="innerW",L="minW",O="right",I="deltaW",F="contentW"):(k="x",E="w",N="minW",S="maxW",R="innerW",T="left",A="deltaW",B="contentW",P="top",H="h",D="y",M="innerH",L="minH",O="bottom",I="deltaH",F="contentH"),d=i[R]-o[T]-o[T],_=u=0,t=0,n=r.length;n>t;t++)h=r[t],p=h.layoutRect(),m=h.settings,g=m.flex,d-=n-1>t?c:0,g>0&&(u+=g,p[S]&&v.push(h),p.flex=g),d-=p[N],y=o[P]+p[L]+o[O],y>_&&(_=y);if(C={},0>d?C[N]=i[N]-d+i[A]:C[N]=i[R]-d+i[A],C[L]=_+i[I],C[B]=i[R]-d,C[F]=_,C.minW=W(C.minW,i.maxW),C.minH=W(C.minH,i.maxH),C.minW=z(C.minW,i.startMinWidth),C.minH=z(C.minH,i.startMinHeight),!i.autoResize||C.minW==i.minW&&C.minH==i.minH){for(x=d/u,t=0,n=v.length;n>t;t++)h=v[t],p=h.layoutRect(),b=p[S],y=p[N]+p.flex*x,y>b?(d-=p[S]-p[N],u-=p.flex,p.flex=0,p.maxFlexSize=b):p.maxFlexSize=0;for(x=d/u,w=o[T],C={},0===u&&("end"==l?w=d+o[T]:"center"==l?(w=Math.round(i[R]/2-(i[R]-d)/2)+o[T],0>w&&(w=o[T])):"justify"==l&&(w=o[T],c=Math.floor(d/(r.length-1)))),C[D]=o[P],t=0,n=r.length;n>t;t++)h=r[t],p=h.layoutRect(),y=p.maxFlexSize||p[N],"center"===s?C[D]=Math.round(i[M]/2-p[H]/2):"stretch"===s?(C[H]=z(p[L]||0,i[M]-o[P]-o[O]),C[D]=o[P]):"end"===s&&(C[D]=i[M]-p[H]-o.top),p.flex>0&&(y+=p.flex*x),C[E]=y,C[k]=w,h.layoutRect(C),h.recalc&&h.recalc(),w+=y+c}else if(C.w=C.minW,C.h=C.minH,e.layoutRect(C),this.recalc(e),null===e._lastRect){var V=e.parent();V&&(V._lastRect=null,V.recalc())}}})}),r(nt,[Le],function(e){return e.extend({Defaults:{containerClass:"flow-layout",controlClass:"flow-layout-item",endClass:"break"},recalc:function(e){e.items().filter(":visible").each(function(e){e.recalc&&e.recalc()})},isNative:function(){return!0}})}),r(rt,[te,Ie,ue,f,Se,u],function(e,t,n,r,i,o){function a(e){function t(t,n){return function(){var r=this;e.on("nodeChange",function(i){var o=e.formatter,a=null;s(i.parents,function(e){return s(t,function(t){return n?o.matchNode(e,n,{value:t.value})&&(a=t.value):o.matchNode(e,t.value)&&(a=t.value),a?!1:void 0}),a?!1:void 0}),r.value(a)})}}function r(e){e=e.replace(/;$/,"").split(";");for(var t=e.length;t--;)e[t]=e[t].split("=");return e}function i(){function t(e){var n=[];if(e)return s(e,function(e){var o={text:e.title,icon:e.icon};if(e.items)o.menu=t(e.items);else{var a=e.format||"custom"+r++;e.format||(e.name=a,i.push(e)),o.format=a,o.cmd=e.cmd}n.push(o)}),n}function n(){var n;return n=t(e.settings.style_formats_merge?e.settings.style_formats?o.concat(e.settings.style_formats):o:e.settings.style_formats||o)}var r=0,i=[],o=[{title:"Headings",items:[{title:"Heading 1",format:"h1"},{title:"Heading 2",format:"h2"},{title:"Heading 3",format:"h3"},{title:"Heading 4",format:"h4"},{title:"Heading 5",format:"h5"},{title:"Heading 6",format:"h6"}]},{title:"Inline",items:[{title:"Bold",icon:"bold",format:"bold"},{title:"Italic",icon:"italic",format:"italic"},{title:"Underline",icon:"underline",format:"underline"},{title:"Strikethrough",icon:"strikethrough",format:"strikethrough"},{title:"Superscript",icon:"superscript",format:"superscript"},{title:"Subscript",icon:"subscript",format:"subscript"},{title:"Code",icon:"code",format:"code"}]},{title:"Blocks",items:[{title:"Paragraph",format:"p"},{title:"Blockquote",format:"blockquote"},{title:"Div",format:"div"},{title:"Pre",format:"pre"}]},{title:"Alignment",items:[{title:"Left",icon:"alignleft",format:"alignleft"},{title:"Center",icon:"aligncenter",format:"aligncenter"},{title:"Right",icon:"alignright",format:"alignright"},{title:"Justify",icon:"alignjustify",format:"alignjustify"}]}];return e.on("init",function(){s(i,function(t){e.formatter.register(t.name,t)})}),{type:"menu",items:n(),onPostRender:function(t){e.fire("renderFormatsMenu",{control:t.control})},itemDefaults:{preview:!0,textStyle:function(){return this.settings.format?e.formatter.getCssText(this.settings.format):void 0},onPostRender:function(){var t=this;t.parent().on("show",function(){var n,r;n=t.settings.format,n&&(t.disabled(!e.formatter.canApply(n)),t.active(e.formatter.match(n))),r=t.settings.cmd,r&&t.active(e.queryCommandState(r))})},onclick:function(){this.settings.format&&l(this.settings.format),this.settings.cmd&&e.execCommand(this.settings.cmd)}}}}function o(t){return function(){function n(){return e.undoManager?e.undoManager[t]():!1}var r=this;t="redo"==t?"hasRedo":"hasUndo",r.disabled(!n()),e.on("Undo Redo AddUndo TypingUndo ClearUndos",function(){r.disabled(!n())})}}function a(){var t=this;e.on("VisualAid",function(e){t.active(e.hasVisual)}),t.active(e.hasVisual)}function l(t){t.control&&(t=t.control.value()),t&&e.execCommand("mceToggleFormat",!1,t)}var c;c=i(),s({bold:"Bold",italic:"Italic",underline:"Underline",strikethrough:"Strikethrough",subscript:"Subscript",superscript:"Superscript"},function(t,n){e.addButton(n,{tooltip:t,onPostRender:function(){var t=this;e.formatter?e.formatter.formatChanged(n,function(e){t.active(e)}):e.on("init",function(){e.formatter.formatChanged(n,function(e){t.active(e)})})},onclick:function(){l(n)}})}),s({outdent:["Decrease indent","Outdent"],indent:["Increase indent","Indent"],cut:["Cut","Cut"],copy:["Copy","Copy"],paste:["Paste","Paste"],help:["Help","mceHelp"],selectall:["Select all","SelectAll"],removeformat:["Clear formatting","RemoveFormat"],visualaid:["Visual aids","mceToggleVisualAid"],newdocument:["New document","mceNewDocument"]},function(t,n){e.addButton(n,{tooltip:t[0],cmd:t[1]})}),s({blockquote:["Blockquote","mceBlockQuote"],numlist:["Numbered list","InsertOrderedList"],bullist:["Bullet list","InsertUnorderedList"],subscript:["Subscript","Subscript"],superscript:["Superscript","Superscript"],alignleft:["Align left","JustifyLeft"],aligncenter:["Align center","JustifyCenter"],alignright:["Align right","JustifyRight"],alignjustify:["Justify","JustifyFull"],alignnone:["No alignment","JustifyNone"]},function(t,n){e.addButton(n,{tooltip:t[0],cmd:t[1],onPostRender:function(){var t=this;e.formatter?e.formatter.formatChanged(n,function(e){t.active(e)}):e.on("init",function(){e.formatter.formatChanged(n,function(e){t.active(e)})})}})}),e.addButton("undo",{tooltip:"Undo",onPostRender:o("undo"),cmd:"undo"}),e.addButton("redo",{tooltip:"Redo",onPostRender:o("redo"),cmd:"redo"}),e.addMenuItem("newdocument",{text:"New document",icon:"newdocument",cmd:"mceNewDocument"}),e.addMenuItem("undo",{text:"Undo",icon:"undo",shortcut:"Meta+Z",onPostRender:o("undo"),cmd:"undo"}),e.addMenuItem("redo",{text:"Redo",icon:"redo",shortcut:"Meta+Y",onPostRender:o("redo"),cmd:"redo"}),e.addMenuItem("visualaid",{text:"Visual aids",selectable:!0,onPostRender:a,cmd:"mceToggleVisualAid"}),e.addButton("remove",{tooltip:"Remove",icon:"remove",cmd:"Delete"}),s({cut:["Cut","Cut","Meta+X"],copy:["Copy","Copy","Meta+C"],paste:["Paste","Paste","Meta+V"],selectall:["Select all","SelectAll","Meta+A"],bold:["Bold","Bold","Meta+B"],italic:["Italic","Italic","Meta+I"],underline:["Underline","Underline"],strikethrough:["Strikethrough","Strikethrough"],subscript:["Subscript","Subscript"],superscript:["Superscript","Superscript"],removeformat:["Clear formatting","RemoveFormat"]},function(t,n){e.addMenuItem(n,{text:t[0],icon:n,shortcut:t[2],cmd:t[1]})}),e.on("mousedown",function(){n.hideAll()}),e.addButton("styleselect",{type:"menubutton",text:"Formats",menu:c}),e.addButton("formatselect",function(){var n=[],i=r(e.settings.block_formats||"Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;Preformatted=pre");return s(i,function(t){n.push({text:t[0],value:t[1],textStyle:function(){return e.formatter.getCssText(t[1])}})}),{type:"listbox",text:i[0][0],values:n,fixedWidth:!0,onselect:l,onPostRender:t(n)}}),e.addButton("fontselect",function(){var n="Andale Mono=andale mono,monospace;Arial=arial,helvetica,sans-serif;Arial Black=arial black,sans-serif;Book Antiqua=book antiqua,palatino,serif;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,palatino,serif;Helvetica=helvetica,arial,sans-serif;Impact=impact,sans-serif;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco,monospace;Times New Roman=times new roman,times,serif;Trebuchet MS=trebuchet ms,geneva,sans-serif;Verdana=verdana,geneva,sans-serif;Webdings=webdings;Wingdings=wingdings,zapf dingbats",i=[],o=r(e.settings.font_formats||n);return s(o,function(e){i.push({text:{raw:e[0]},value:e[1],textStyle:-1==e[1].indexOf("dings")?"font-family:"+e[1]:""})}),{type:"listbox",text:"Font Family",tooltip:"Font Family",values:i,fixedWidth:!0,onPostRender:t(i,"fontname"),onselect:function(t){t.control.settings.value&&e.execCommand("FontName",!1,t.control.settings.value)}}}),e.addButton("fontsizeselect",function(){var n=[],r="8pt 10pt 12pt 14pt 18pt 24pt 36pt",i=e.settings.fontsize_formats||r;return s(i.split(" "),function(e){var t=e,r=e,i=e.split("=");i.length>1&&(t=i[0],r=i[1]),n.push({text:t,value:r})}),{type:"listbox",text:"Font Sizes",tooltip:"Font Sizes",values:n,fixedWidth:!0,onPostRender:t(n,"fontsize"),onclick:function(t){t.control.settings.value&&e.execCommand("FontSize",!1,t.control.settings.value)}}}),e.addMenuItem("formats",{text:"Formats",menu:c})}var s=r.each;i.on("AddEditor",function(t){t.editor.rtl&&(e.rtl=!0),a(t.editor)}),e.translate=function(e){return i.translate(e)},t.tooltips=!o.iOS}),r(it,[Pe],function(e){return e.extend({
recalc:function(e){var t=e.settings,n,r,i,o,a,s,l,c,u,d,f,h,p,m,g,v,y,b,x,C,w,_,E=[],N=[],k,S,T,R,A,B;t=e.settings,i=e.items().filter(":visible"),o=e.layoutRect(),r=t.columns||Math.ceil(Math.sqrt(i.length)),n=Math.ceil(i.length/r),y=t.spacingH||t.spacing||0,b=t.spacingV||t.spacing||0,x=t.alignH||t.align,C=t.alignV||t.align,g=e.paddingBox,A="reverseRows"in t?t.reverseRows:e.isRtl(),x&&"string"==typeof x&&(x=[x]),C&&"string"==typeof C&&(C=[C]);for(d=0;r>d;d++)E.push(0);for(f=0;n>f;f++)N.push(0);for(f=0;n>f;f++)for(d=0;r>d&&(u=i[f*r+d],u);d++)c=u.layoutRect(),k=c.minW,S=c.minH,E[d]=k>E[d]?k:E[d],N[f]=S>N[f]?S:N[f];for(T=o.innerW-g.left-g.right,w=0,d=0;r>d;d++)w+=E[d]+(d>0?y:0),T-=(d>0?y:0)+E[d];for(R=o.innerH-g.top-g.bottom,_=0,f=0;n>f;f++)_+=N[f]+(f>0?b:0),R-=(f>0?b:0)+N[f];if(w+=g.left+g.right,_+=g.top+g.bottom,l={},l.minW=w+(o.w-o.innerW),l.minH=_+(o.h-o.innerH),l.contentW=l.minW-o.deltaW,l.contentH=l.minH-o.deltaH,l.minW=Math.min(l.minW,o.maxW),l.minH=Math.min(l.minH,o.maxH),l.minW=Math.max(l.minW,o.startMinWidth),l.minH=Math.max(l.minH,o.startMinHeight),!o.autoResize||l.minW==o.minW&&l.minH==o.minH){o.autoResize&&(l=e.layoutRect(l),l.contentW=l.minW-o.deltaW,l.contentH=l.minH-o.deltaH);var D;D="start"==t.packV?0:R>0?Math.floor(R/n):0;var M=0,H=t.flexWidths;if(H)for(d=0;d<H.length;d++)M+=H[d];else M=r;var L=T/M;for(d=0;r>d;d++)E[d]+=H?H[d]*L:L;for(p=g.top,f=0;n>f;f++){for(h=g.left,s=N[f]+D,d=0;r>d&&(B=A?f*r+r-1-d:f*r+d,u=i[B],u);d++)m=u.settings,c=u.layoutRect(),a=Math.max(E[d],c.startMinWidth),c.x=h,c.y=p,v=m.alignH||(x?x[d]||x[0]:null),"center"==v?c.x=h+a/2-c.w/2:"right"==v?c.x=h+a-c.w:"stretch"==v&&(c.w=a),v=m.alignV||(C?C[d]||C[0]:null),"center"==v?c.y=p+s/2-c.h/2:"bottom"==v?c.y=p+s-c.h:"stretch"==v&&(c.h=s),u.layoutRect(c),h+=a+y,u.recalc&&u.recalc();p+=s+b}}else if(l.w=l.minW,l.h=l.minH,e.layoutRect(l),this.recalc(e),null===e._lastRect){var P=e.parent();P&&(P._lastRect=null,P.recalc())}}})}),r(ot,[Ie],function(e){return e.extend({renderHtml:function(){var e=this;return e.classes.add("iframe"),e.canFocus=!1,'<iframe id="'+e._id+'" class="'+e.classes+'" tabindex="-1" src="'+(e.settings.url||"javascript:''")+'" frameborder="0"></iframe>'},src:function(e){this.getEl().src=e},html:function(e,t){var n=this,r=this.getEl().contentWindow.document.body;return r?(r.innerHTML=e,t&&t()):setTimeout(function(){n.html(e)},0),this}})}),r(at,[Ie,J],function(e,t){return e.extend({init:function(e){var t=this;t._super(e),t.classes.add("widget").add("label"),t.canFocus=!1,e.multiline&&t.classes.add("autoscroll"),e.strong&&t.classes.add("strong")},initLayoutRect:function(){var e=this,n=e._super();if(e.settings.multiline){var r=t.getSize(e.getEl());r.width>n.maxW&&(n.minW=n.maxW,e.classes.add("multiline")),e.getEl().style.width=n.minW+"px",n.startMinH=n.h=n.minH=Math.min(n.maxH,t.getSize(e.getEl()).height)}return n},repaint:function(){var e=this;return e.settings.multiline||(e.getEl().style.lineHeight=e.layoutRect().h+"px"),e._super()},renderHtml:function(){var e=this,t=e.settings.forId;return'<label id="'+e._id+'" class="'+e.classes+'"'+(t?' for="'+t+'"':"")+">"+e.encode(e.state.get("text"))+"</label>"},bindStates:function(){var e=this;return e.state.on("change:text",function(t){e.innerHtml(e.encode(t.value))}),e._super()}})}),r(st,[ie],function(e){return e.extend({Defaults:{role:"toolbar",layout:"flow"},init:function(e){var t=this;t._super(e),t.classes.add("toolbar")},postRender:function(){var e=this;return e.items().each(function(e){e.classes.add("toolbar-item")}),e._super()}})}),r(lt,[st],function(e){return e.extend({Defaults:{role:"menubar",containerCls:"menubar",ariaRoot:!0,defaults:{type:"menubutton"}}})}),r(ct,[Fe,ne,lt],function(e,t,n){function r(e,t){for(;e;){if(t===e)return!0;e=e.parentNode}return!1}var i=e.extend({init:function(e){var t=this;t._renderOpen=!0,t._super(e),e=t.settings,t.classes.add("menubtn"),e.fixedWidth&&t.classes.add("fixed-width"),t.aria("haspopup",!0),t.state.set("menu",e.menu||t.render())},showMenu:function(){var e=this,n;return e.menu&&e.menu.visible()?e.hideMenu():(e.menu||(n=e.state.get("menu")||[],n.length?n={type:"menu",items:n}:n.type=n.type||"menu",n.renderTo?e.menu=n.parent(e).show().renderTo():e.menu=t.create(n).parent(e).renderTo(),e.fire("createmenu"),e.menu.reflow(),e.menu.on("cancel",function(t){t.control.parent()===e.menu&&(t.stopPropagation(),e.focus(),e.hideMenu())}),e.menu.on("select",function(){e.focus()}),e.menu.on("show hide",function(t){t.control==e.menu&&e.activeMenu("show"==t.type),e.aria("expanded","show"==t.type)}).fire("show")),e.menu.show(),e.menu.layoutRect({w:e.layoutRect().w}),void e.menu.moveRel(e.getEl(),e.isRtl()?["br-tr","tr-br"]:["bl-tl","tl-bl"]))},hideMenu:function(){var e=this;e.menu&&(e.menu.items().each(function(e){e.hideMenu&&e.hideMenu()}),e.menu.hide())},activeMenu:function(e){this.classes.toggle("active",e)},renderHtml:function(){var e=this,t=e._id,r=e.classPrefix,i=e.settings.icon,o,a=e.state.get("text");return o=e.settings.image,o?(i="none","string"!=typeof o&&(o=window.getSelection?o[0]:o[1]),o=" style=\"background-image: url('"+o+"')\""):o="",i=e.settings.icon?r+"ico "+r+"i-"+i:"",e.aria("role",e.parent()instanceof n?"menuitem":"button"),'<div id="'+t+'" class="'+e.classes+'" tabindex="-1" aria-labelledby="'+t+'"><button id="'+t+'-open" role="presentation" type="button" tabindex="-1">'+(i?'<i class="'+i+'"'+o+"></i>":"")+(a?(i?"\xa0":"")+e.encode(a):"")+' <i class="'+r+'caret"></i></button></div>'},postRender:function(){var e=this;return e.on("click",function(t){t.control===e&&r(t.target,e.getEl())&&(e.showMenu(),t.aria&&e.menu.items()[0].focus())}),e.on("mouseenter",function(t){var n=t.control,r=e.parent(),o;n&&r&&n instanceof i&&n.parent()==r&&(r.items().filter("MenuButton").each(function(e){e.hideMenu&&e!=n&&(e.menu&&e.menu.visible()&&(o=!0),e.hideMenu())}),o&&(n.focus(),n.showMenu()))}),e._super()},bindStates:function(){var e=this;return e.state.on("change:menu",function(){e.menu&&e.menu.remove(),e.menu=null}),e._super()},remove:function(){this._super(),this.menu&&this.menu.remove()}});return i}),r(ut,[Ie,ne,u],function(e,t,n){return e.extend({Defaults:{border:0,role:"menuitem"},init:function(e){var t=this,n;t._super(e),e=t.settings,t.classes.add("menu-item"),e.menu&&t.classes.add("menu-item-expand"),e.preview&&t.classes.add("menu-item-preview"),n=t.state.get("text"),("-"===n||"|"===n)&&(t.classes.add("menu-item-sep"),t.aria("role","separator"),t.state.set("text","-")),e.selectable&&(t.aria("role","menuitemcheckbox"),t.classes.add("menu-item-checkbox"),e.icon="selected"),e.preview||e.selectable||t.classes.add("menu-item-normal"),t.on("mousedown",function(e){e.preventDefault()}),e.menu&&!e.ariaHideMenu&&t.aria("haspopup",!0)},hasMenus:function(){return!!this.settings.menu},showMenu:function(){var e=this,n=e.settings,r,i=e.parent();if(i.items().each(function(t){t!==e&&t.hideMenu()}),n.menu){r=e.menu,r?r.show():(r=n.menu,r.length?r={type:"menu",items:r}:r.type=r.type||"menu",i.settings.itemDefaults&&(r.itemDefaults=i.settings.itemDefaults),r=e.menu=t.create(r).parent(e).renderTo(),r.reflow(),r.on("cancel",function(t){t.stopPropagation(),e.focus(),r.hide()}),r.on("show hide",function(e){e.control.items().each(function(e){e.active(e.settings.selected)})}).fire("show"),r.on("hide",function(t){t.control===r&&e.classes.remove("selected")}),r.submenu=!0),r._parentMenu=i,r.classes.add("menu-sub");var o=r.testMoveRel(e.getEl(),e.isRtl()?["tl-tr","bl-br","tr-tl","br-bl"]:["tr-tl","br-bl","tl-tr","bl-br"]);r.moveRel(e.getEl(),o),r.rel=o,o="menu-sub-"+o,r.classes.remove(r._lastRel).add(o),r._lastRel=o,e.classes.add("selected"),e.aria("expanded",!0)}},hideMenu:function(){var e=this;return e.menu&&(e.menu.items().each(function(e){e.hideMenu&&e.hideMenu()}),e.menu.hide(),e.aria("expanded",!1)),e},renderHtml:function(){function e(e){var t,r,i={};for(i=n.mac?{alt:"&#x2325;",ctrl:"&#x2318;",shift:"&#x21E7;",meta:"&#x2318;"}:{meta:"Ctrl"},e=e.split("+"),t=0;t<e.length;t++)r=i[e[t].toLowerCase()],r&&(e[t]=r);return e.join("+")}var t=this,r=t._id,i=t.settings,o=t.classPrefix,a=t.encode(t.state.get("text")),s=t.settings.icon,l="",c=i.shortcut;return s&&t.parent().classes.add("menu-has-icons"),i.image&&(s="none",l=" style=\"background-image: url('"+i.image+"')\""),c&&(c=e(c)),s=o+"ico "+o+"i-"+(t.settings.icon||"none"),'<div id="'+r+'" class="'+t.classes+'" tabindex="-1">'+("-"!==a?'<i class="'+s+'"'+l+"></i>\xa0":"")+("-"!==a?'<span id="'+r+'-text" class="'+o+'text">'+a+"</span>":"")+(c?'<div id="'+r+'-shortcut" class="'+o+'menu-shortcut">'+c+"</div>":"")+(i.menu?'<div class="'+o+'caret"></div>':"")+"</div>"},postRender:function(){var e=this,t=e.settings,n=t.textStyle;if("function"==typeof n&&(n=n.call(this)),n){var r=e.getEl("text");r&&r.setAttribute("style",n)}return e.on("mouseenter click",function(n){n.control===e&&(t.menu||"click"!==n.type?(e.showMenu(),n.aria&&e.menu.focus(!0)):(e.fire("select"),e.parent().hideAll()))}),e._super(),e},active:function(e){return"undefined"!=typeof e&&this.aria("checked",e),this._super(e)},remove:function(){this._super(),this.menu&&this.menu.remove()}})}),r(dt,[ue,ut,f],function(e,t,n){var r=e.extend({Defaults:{defaultType:"menuitem",border:1,layout:"stack",role:"application",bodyRole:"menu",ariaRoot:!0},init:function(e){var t=this;if(e.autohide=!0,e.constrainToViewport=!0,e.itemDefaults)for(var r=e.items,i=r.length;i--;)r[i]=n.extend({},e.itemDefaults,r[i]);t._super(e),t.classes.add("menu")},repaint:function(){return this.classes.toggle("menu-align",!0),this._super(),this.getEl().style.height="",this.getEl("body").style.height="",this},cancel:function(){var e=this;e.hideAll(),e.fire("select")},hideAll:function(){var e=this;return this.find("menuitem").exec("hideMenu"),e._super()},preRender:function(){var e=this;return e.items().each(function(t){var n=t.settings;return n.icon||n.image||n.selectable?(e._hasIcons=!0,!1):void 0}),e._super()}});return r}),r(ft,[ct,dt],function(e,t){return e.extend({init:function(e){function t(r){for(var a=0;a<r.length;a++){if(i=r[a].selected||e.value===r[a].value)return o=o||r[a].text,n.state.set("value",r[a].value),!0;if(r[a].menu&&t(r[a].menu))return!0}}var n=this,r,i,o,a;n._super(e),e=n.settings,n._values=r=e.values,r&&("undefined"!=typeof e.value&&t(r),!i&&r.length>0&&(o=r[0].text,n.state.set("value",r[0].value)),n.state.set("menu",r)),n.state.set("text",e.text||o||r[0].text),n.classes.add("listbox"),n.on("select",function(t){var r=t.control;a&&(t.lastControl=a),e.multiple?r.active(!r.active()):n.value(t.control.value()),a=r})},bindStates:function(){function e(e,n){e instanceof t&&e.items().each(function(e){e.hasMenus()||e.active(e.value()===n)})}function n(e,t){var r;if(e)for(var i=0;i<e.length;i++){if(e[i].value===t)return e[i];if(e[i].menu&&(r=n(e[i].menu,t)))return r}}var r=this;return r.on("show",function(t){e(t.control,r.value())}),r.state.on("change:value",function(e){var t=n(r.state.get("menu"),e.value);t?r.text(t.text):r.text(r.settings.text)}),r._super()}})}),r(ht,[We],function(e){return e.extend({Defaults:{classes:"radio",role:"radio"}})}),r(pt,[],function(){function e(e,t,n){var r,i,o,a,l,c;return r=t.x,i=t.y,o=e.w,a=e.h,l=t.w,c=t.h,n=(n||"").split(""),"b"===n[0]&&(i+=c),"r"===n[1]&&(r+=l),"c"===n[0]&&(i+=s(c/2)),"c"===n[1]&&(r+=s(l/2)),"b"===n[3]&&(i-=a),"r"===n[4]&&(r-=o),"c"===n[3]&&(i-=s(a/2)),"c"===n[4]&&(r-=s(o/2)),{x:r,y:i,w:o,h:a}}function t(t,n,r,i){var o,a;for(a=0;a<i.length;a++)if(o=e(t,n,i[a]),o.x>=r.x&&o.x+o.w<=r.w+r.x&&o.y>=r.y&&o.y+o.h<=r.h+r.y)return i[a]}function n(e,t,n){return{x:e.x-t,y:e.y-n,w:e.w+2*t,h:e.h+2*n}}function r(e,t){var n,r,i,s;return n=a(e.x,t.x),r=a(e.y,t.y),i=o(e.x+e.w,t.x+t.w),s=o(e.y+e.h,t.y+t.h),0>i-n||0>s-r?null:{x:n,y:r,w:i-n,h:s-r}}function i(e,t,n){var r,i,o,s,l,c,u,d,f,h;return l=e.x,c=e.y,u=e.x+e.w,d=e.y+e.h,f=t.x+t.w,h=t.y+t.h,r=a(0,t.x-l),i=a(0,t.y-c),o=a(0,u-f),s=a(0,d-h),l+=r,c+=i,n&&(u+=r,d+=i,l-=o,c-=s),u-=o,d-=s,{x:l,y:c,w:u-l,h:d-c}}var o=Math.min,a=Math.max,s=Math.round;return{inflate:n,relativePosition:e,findBestRelativePosition:t,intersect:r,clamp:i}}),r(mt,[Ie,oe],function(e,t){return e.extend({renderHtml:function(){var e=this,t=e.classPrefix;return e.classes.add("resizehandle"),"both"==e.settings.direction&&e.classes.add("resizehandle-both"),e.canFocus=!1,'<div id="'+e._id+'" class="'+e.classes+'"><i class="'+t+"ico "+t+'i-resize"></i></div>'},postRender:function(){var e=this;e._super(),e.resizeDragHelper=new t(this._id,{start:function(){e.fire("ResizeStart")},drag:function(t){"both"!=e.settings.direction&&(t.deltaX=0),e.fire("Resize",t)},stop:function(){e.fire("ResizeEnd")}})},remove:function(){return this.resizeDragHelper&&this.resizeDragHelper.destroy(),this._super()}})}),r(gt,[Ie,oe,J],function(e,t,n){function r(e,t,n){return t>e&&(e=t),e>n&&(e=n),e}function i(e,t){var r,i,o,a,s;"v"==e.settings.orientation?(a="top",o="height",i="h"):(a="left",o="width",i="w"),r=(e.layoutRect()[i]||100)-n.getSize(e.getEl("handle"))[o],s=r*((t-e._minValue)/(e._maxValue-e._minValue))+"px",e.getEl("handle").style[a]=s,e.getEl("handle").style.height=e.layoutRect().h+"px"}return e.extend({init:function(e){var t=this;e.previewFilter||(e.previewFilter=function(e){return Math.round(100*e)/100}),t._super(e),t.classes.add("slider"),"v"==e.orientation&&t.classes.add("vertical"),t._minValue=e.minValue||0,t._maxValue=e.maxValue||100,t._initValue=t.state.get("value")},renderHtml:function(){var e=this,t=e._id,n=e.classPrefix;return'<div id="'+t+'" class="'+e.classes+'"><div id="'+t+'-handle" class="'+n+'slider-handle"></div></div>'},reset:function(){this.value(this._initValue).repaint()},postRender:function(){var e=this,i,o,a=0,s,l,c,u,d,f,h,p;l=e._minValue,c=e._maxValue,s=e.value(),"v"==e.settings.orientation?(d="screenY",f="top",h="height",p="h"):(d="screenX",f="left",h="width",p="w"),e._super(),e._dragHelper=new t(e._id,{handle:e._id+"-handle",start:function(t){i=t[d],o=parseInt(e.getEl("handle").style[f],10),u=(e.layoutRect()[p]||100)-n.getSize(e.getEl("handle"))[h],e.fire("dragstart",{value:s})},drag:function(t){var n=t[d]-i,h=e.getEl("handle");a=r(o+n,0,u),h.style[f]=a+"px",s=l+a/u*(c-l),e.value(s),e.tooltip().text(""+e.settings.previewFilter(s)).show().moveRel(h,"bc tc"),e.fire("drag",{value:s})},stop:function(){e.tooltip().hide(),e.fire("dragend",{value:s})}})},repaint:function(){this._super(),i(this,this.value())},bindStates:function(){var e=this;return e.state.on("change:value",function(t){i(e,t.value)}),e._super()}})}),r(vt,[Ie],function(e){return e.extend({renderHtml:function(){var e=this;return e.classes.add("spacer"),e.canFocus=!1,'<div id="'+e._id+'" class="'+e.classes+'"></div>'}})}),r(yt,[ct,J,h],function(e,t,n){return e.extend({Defaults:{classes:"widget btn splitbtn",role:"button"},repaint:function(){var e=this,r=e.getEl(),i=e.layoutRect(),o,a;return e._super(),o=r.firstChild,a=r.lastChild,n(o).css({width:i.w-t.getSize(a).width,height:i.h-2}),n(a).css({height:i.h-2}),e},activeMenu:function(e){var t=this;n(t.getEl().lastChild).toggleClass(t.classPrefix+"active",e)},renderHtml:function(){var e=this,t=e._id,n=e.classPrefix,r,i=e.state.get("icon"),o=e.state.get("text");return r=e.settings.image,r?(i="none","string"!=typeof r&&(r=window.getSelection?r[0]:r[1]),r=" style=\"background-image: url('"+r+"')\""):r="",i=e.settings.icon?n+"ico "+n+"i-"+i:"",'<div id="'+t+'" class="'+e.classes+'" role="button" tabindex="-1"><button type="button" hidefocus="1" tabindex="-1">'+(i?'<i class="'+i+'"'+r+"></i>":"")+(o?(i?" ":"")+o:"")+'</button><button type="button" class="'+n+'open" hidefocus="1" tabindex="-1">'+(e._menuBtnText?(i?"\xa0":"")+e._menuBtnText:"")+' <i class="'+n+'caret"></i></button></div>'},postRender:function(){var e=this,t=e.settings.onclick;return e.on("click",function(e){var n=e.target;if(e.control==this)for(;n;){if(e.aria&&"down"!=e.aria.key||"BUTTON"==n.nodeName&&-1==n.className.indexOf("open"))return e.stopImmediatePropagation(),void(t&&t.call(this,e));n=n.parentNode}}),delete e.settings.onclick,e._super()}})}),r(bt,[nt],function(e){return e.extend({Defaults:{containerClass:"stack-layout",controlClass:"stack-layout-item",endClass:"break"},isNative:function(){return!0}})}),r(xt,[se,h,J],function(e,t,n){return e.extend({Defaults:{layout:"absolute",defaults:{type:"panel"}},activateTab:function(e){var n;this.activeTabId&&(n=this.getEl(this.activeTabId),t(n).removeClass(this.classPrefix+"active"),n.setAttribute("aria-selected","false")),this.activeTabId="t"+e,n=this.getEl("t"+e),n.setAttribute("aria-selected","true"),t(n).addClass(this.classPrefix+"active"),this.items()[e].show().fire("showtab"),this.reflow(),this.items().each(function(t,n){e!=n&&t.hide()})},renderHtml:function(){var e=this,t=e._layout,n="",r=e.classPrefix;return e.preRender(),t.preRender(e),e.items().each(function(t,i){var o=e._id+"-t"+i;t.aria("role","tabpanel"),t.aria("labelledby",o),n+='<div id="'+o+'" class="'+r+'tab" unselectable="on" role="tab" aria-controls="'+t._id+'" aria-selected="false" tabIndex="-1">'+e.encode(t.settings.title)+"</div>"}),'<div id="'+e._id+'" class="'+e.classes+'" hidefocus="1" tabindex="-1"><div id="'+e._id+'-head" class="'+r+'tabs" role="tablist">'+n+'</div><div id="'+e._id+'-body" class="'+e.bodyClasses+'">'+t.renderHtml(e)+"</div></div>"},postRender:function(){var e=this;e._super(),e.settings.activeTab=e.settings.activeTab||0,e.activateTab(e.settings.activeTab),this.on("click",function(t){var n=t.target.parentNode;if(t.target.parentNode.id==e._id+"-head")for(var r=n.childNodes.length;r--;)n.childNodes[r]==t.target&&e.activateTab(r)})},initLayoutRect:function(){var e=this,t,r,i;r=n.getSize(e.getEl("head")).width,r=0>r?0:r,i=0,e.items().each(function(e){r=Math.max(r,e.layoutRect().minW),i=Math.max(i,e.layoutRect().minH)}),e.items().each(function(e){e.settings.x=0,e.settings.y=0,e.settings.w=r,e.settings.h=i,e.layoutRect({x:0,y:0,w:r,h:i})});var o=n.getSize(e.getEl("head")).height;return e.settings.minWidth=r,e.settings.minHeight=i+o,t=e._super(),t.deltaH+=o,t.innerH=t.h-t.deltaH,t}})}),r(Ct,[Ie],function(e){return e.extend({init:function(e){var t=this;t._super(e),t.classes.add("textbox"),e.multiline?t.classes.add("multiline"):(t.on("keydown",function(e){var n;13==e.keyCode&&(e.preventDefault(),t.parents().reverse().each(function(e){return e.toJSON?(n=e,!1):void 0}),t.fire("submit",{data:n.toJSON()}))}),t.on("keyup",function(e){t.state.set("value",e.target.value)}))},repaint:function(){var e=this,t,n,r,i=0,o=0,a;t=e.getEl().style,n=e._layoutRect,a=e._lastRepaintRect||{};var s=document;return!e.settings.multiline&&s.all&&(!s.documentMode||s.documentMode<=8)&&(t.lineHeight=n.h-o+"px"),r=e.borderBox,i=r.left+r.right+8,o=r.top+r.bottom+(e.settings.multiline?8:0),n.x!==a.x&&(t.left=n.x+"px",a.x=n.x),n.y!==a.y&&(t.top=n.y+"px",a.y=n.y),n.w!==a.w&&(t.width=n.w-i+"px",a.w=n.w),n.h!==a.h&&(t.height=n.h-o+"px",a.h=n.h),e._lastRepaintRect=a,e.fire("repaint",{},!1),e},renderHtml:function(){var e=this,t=e._id,n=e.settings,r=e.encode(e.state.get("value"),!1),i="";return"spellcheck"in n&&(i+=' spellcheck="'+n.spellcheck+'"'),n.maxLength&&(i+=' maxlength="'+n.maxLength+'"'),n.size&&(i+=' size="'+n.size+'"'),n.subtype&&(i+=' type="'+n.subtype+'"'),e.disabled()&&(i+=' disabled="disabled"'),n.multiline?'<textarea id="'+t+'" class="'+e.classes+'" '+(n.rows?' rows="'+n.rows+'"':"")+' hidefocus="1"'+i+">"+r+"</textarea>":'<input id="'+t+'" class="'+e.classes+'" value="'+r+'" hidefocus="1"'+i+" />"},value:function(e){return arguments.length?(this.state.set("value",e),this):(this.state.get("rendered")&&this.state.set("value",this.getEl().value),this.state.get("value"))},postRender:function(){var e=this;e._super(),e.$el.on("change",function(t){e.state.set("value",t.target.value),e.fire("change",t)})},bindStates:function(){var e=this;return e.state.on("change:value",function(t){e.getEl().value!=t.value&&(e.getEl().value=t.value)}),e.state.on("change:disabled",function(t){e.getEl().disabled=t.value}),e._super()},remove:function(){this.$el.off(),this._super()}})}),r(wt,[h,te],function(e,t){return function(n,r){var i=this,o,a=t.classPrefix;i.show=function(t,s){return i.hide(),o=!0,window.setTimeout(function(){o&&(e(n).append('<div class="'+a+"throbber"+(r?" "+a+"throbber-inline":"")+'"></div>'),s&&s())},t||0),i},i.hide=function(){var e=n.lastChild;return e&&-1!=e.className.indexOf("throbber")&&e.parentNode.removeChild(e),o=!1,i}}}),a([l,c,u,f,h,p,m,v,b,x,C,w,E,N,k,S,T,R,A,D,M,H,L,I,F,V,U,$,q,K,G,X,ee,te,ne,re,ie,oe,ae,se,le,ce,ue,de,fe,he,me,ge,ve,Ee,Ne,ke,Se,Re,Ae,Be,De,Me,He,Le,Pe,Oe,Ie,Fe,ze,We,Ve,Ue,$e,qe,je,Ke,Ye,Ge,Xe,Je,Qe,Ze,et,tt,nt,rt,it,ot,at,st,lt,ct,ut,dt,ft,ht,pt,mt,gt,vt,yt,bt,xt,Ct,wt])}(this);
/**
* Theme: Adminto Admin Template
* Author: Coderthemes
* Module/App: Core js
*/


//portlets
!function($) {
    "use strict";

    /**
    Portlet Widget
    */
    var Portlet = function() {
        this.$body = $("body"),
        this.$portletIdentifier = ".portlet",
        this.$portletCloser = '.portlet a[data-toggle="remove"]',
        this.$portletRefresher = '.portlet a[data-toggle="reload"]'
    };

    //on init
    Portlet.prototype.init = function() {
        // Panel closest
        var $this = this;
        $(document).on("click",this.$portletCloser, function (ev) {
            ev.preventDefault();
            var $portlet = $(this).closest($this.$portletIdentifier);
                var $portlet_parent = $portlet.parent();


            $portlet.slideUp("slow", function() {
                $(this).remove();
            });
            if ($portlet_parent.children().length == 0) {
                $portlet_parent.slideUp("slow", function() {
                   $(this).remove();
                });
            }
        });

        // Panel Reload
        $(document).on("click",this.$portletRefresher, function (ev) {
            ev.preventDefault();
            var $portlet = $(this).closest($this.$portletIdentifier);
            // This is just a simulation, nothing is going to be reloaded
            $portlet.append('<div class="panel-disabled"><div class="loader-1"></div></div>');
            var $pd = $portlet.find('.panel-disabled');
            setTimeout(function () {
                $pd.fadeOut('fast', function () {
                    $pd.remove();
                });
            }, 500 + 300 * (Math.random() * 5));
        });
    },
    //
    $.Portlet = new Portlet, $.Portlet.Constructor = Portlet

}(window.jQuery),



/**
 * Components
 */
function($) {
    "use strict";

    var Components = function() {};

    //initializing tooltip
    Components.prototype.initTooltipPlugin = function() {
        $.fn.tooltip && $('[data-toggle="tooltip"]').tooltip()
    },

    //initializing popover
    Components.prototype.initPopoverPlugin = function() {
        $.fn.popover && $('[data-toggle="popover"]').popover()
    },

    //initializing custom modal
    Components.prototype.initCustomModalPlugin = function() {
        $('[data-plugin="custommodal"]').on('click', function(e) {
        	Custombox.open({
                target: $(this).attr("href"),
                effect: $(this).attr("data-animation"),
                overlaySpeed: $(this).attr("data-overlaySpeed"),
                overlayColor: $(this).attr("data-overlayColor")
            });
        	e.preventDefault();
        });
    },

    //initializing nicescroll
    Components.prototype.initNiceScrollPlugin = function() {
        //You can change the color of scroll bar here
        $.fn.niceScroll &&  $(".nicescroll").niceScroll({ cursorcolor: '#98a6ad',cursorwidth:'6px', cursorborderradius: '5px'});
    },

    //range slider
    Components.prototype.initRangeSlider = function() {
        $.fn.slider && $('[data-plugin="range-slider"]').slider({});
    },

    /* -------------
     * Form related controls
     */
    //switch
    Components.prototype.initSwitchery = function() {
        $('[data-plugin="switchery"]').each(function (idx, obj) {
            new Switchery($(this)[0], $(this).data());
        });
    },
    //multiselect
    Components.prototype.initMultiSelect = function() {
        if($('[data-plugin="multiselect"]').length > 0)
            $('[data-plugin="multiselect"]').multiSelect($(this).data());
    },

     /* -------------
     * small charts related widgets
     */
     //peity charts
     Components.prototype.initPeityCharts = function() {
        $('[data-plugin="peity-pie"]').each(function(idx, obj) {
            var colors = $(this).attr('data-colors')?$(this).attr('data-colors').split(","):[];
            var width = $(this).attr('data-width')?$(this).attr('data-width'):20; //default is 20
            var height = $(this).attr('data-height')?$(this).attr('data-height'):20; //default is 20
            $(this).peity("pie", {
                fill: colors,
                width: width,
                height: height
            });
        });
        //donut
         $('[data-plugin="peity-donut"]').each(function(idx, obj) {
            var colors = $(this).attr('data-colors')?$(this).attr('data-colors').split(","):[];
            var width = $(this).attr('data-width')?$(this).attr('data-width'):20; //default is 20
            var height = $(this).attr('data-height')?$(this).attr('data-height'):20; //default is 20
            $(this).peity("donut", {
                fill: colors,
                width: width,
                height: height
            });
        });

         $('[data-plugin="peity-donut-alt"]').each(function(idx, obj) {
            $(this).peity("donut");
        });

         // line
         $('[data-plugin="peity-line"]').each(function(idx, obj) {
            $(this).peity("line", $(this).data());
         });

         // bar
         $('[data-plugin="peity-bar"]').each(function(idx, obj) {
            var colors = $(this).attr('data-colors')?$(this).attr('data-colors').split(","):[];
            var width = $(this).attr('data-width')?$(this).attr('data-width'):20; //default is 20
            var height = $(this).attr('data-height')?$(this).attr('data-height'):20; //default is 20
            $(this).peity("bar", {
                fill: colors,
                width: width,
                height: height
            });
         });
     },
     Components.prototype.initKnob = function() {
         $('[data-plugin="knob"]').each(function(idx, obj) {
            $(this).knob();
         });
     },

     Components.prototype.initCircliful = function() {
         $('[data-plugin="circliful"]').each(function(idx, obj) {
            $(this).circliful();
         });
     },

    Components.prototype.initCounterUp = function() {
        var delay = $(this).attr('data-delay')?$(this).attr('data-delay'):100; //default is 100
        var time = $(this).attr('data-time')?$(this).attr('data-time'):1200; //default is 1200
         $('[data-plugin="counterup"]').each(function(idx, obj) {
            $(this).counterUp({
                delay: 100,
                time: 1200
            });
         });
     },


    //initilizing
    Components.prototype.init = function() {
        var $this = this;
        this.initTooltipPlugin(),
        this.initPopoverPlugin(),
        this.initNiceScrollPlugin(),
        this.initCustomModalPlugin(),
        this.initRangeSlider(),
        this.initSwitchery(),
        this.initMultiSelect(),
        this.initPeityCharts(),
        this.initKnob(),
        this.initCircliful(),
        this.initCounterUp(),
        //creating portles
        $.Portlet.init();
    },

    $.Components = new Components, $.Components.Constructor = Components

}(window.jQuery),
    //initializing main application module
function($) {
    "use strict";
    $.Components.init();
}(window.jQuery);




/**
* Theme: Adminto Admin Template
* Author: Coderthemes
* Module/App: Main Js
*/



!function($) {
    "use strict";

    var Sidemenu = function() {
        this.$body = $("body"),
        this.$openLeftBtn = $(".open-left"),
        this.$menuItem = $("#sidebar-menu a")
    };
    Sidemenu.prototype.openLeftBar = function() {
      $("#wrapper").toggleClass("enlarged");
      $("#wrapper").addClass("forced");

      if($("#wrapper").hasClass("enlarged") && $("body").hasClass("fixed-left")) {
        $("body").removeClass("fixed-left").addClass("fixed-left-void");
      } else if(!$("#wrapper").hasClass("enlarged") && $("body").hasClass("fixed-left-void")) {
        $("body").removeClass("fixed-left-void").addClass("fixed-left");
      }

      if($("#wrapper").hasClass("enlarged")) {
        $(".left ul").removeAttr("style");
      } else {
        $(".subdrop").siblings("ul:first").show();
      }

      toggle_slimscroll(".slimscrollleft");
      $("body").trigger("resize");
    },
    //menu item click
    Sidemenu.prototype.menuItemClick = function(e) {
       if(!$("#wrapper").hasClass("enlarged")){
        if($(this).parent().hasClass("has_sub")) {

        }
        if(!$(this).hasClass("subdrop")) {
          // hide any open menus and remove all other classes
          $("ul",$(this).parents("ul:first")).slideUp(350);
          $("a",$(this).parents("ul:first")).removeClass("subdrop");
          $("#sidebar-menu .pull-right i").removeClass("md-remove").addClass("md-add");

          // open our new menu and add the open class
          $(this).next("ul").slideDown(350);
          $(this).addClass("subdrop");
          $(".pull-right i",$(this).parents(".has_sub:last")).removeClass("md-add").addClass("md-remove");
          $(".pull-right i",$(this).siblings("ul")).removeClass("md-remove").addClass("md-add");
        }else if($(this).hasClass("subdrop")) {
          $(this).removeClass("subdrop");
          $(this).next("ul").slideUp(350);
          $(".pull-right i",$(this).parent()).removeClass("md-remove").addClass("md-add");
        }
      }
    },

    //init sidemenu
    Sidemenu.prototype.init = function() {
      var $this  = this;

      var ua = navigator.userAgent,
        event = (ua.match(/iP/i)) ? "touchstart" : "click";

      //bind on click
      this.$openLeftBtn.on(event, function(e) {
        e.stopPropagation();
        $this.openLeftBar();
      });

      // LEFT SIDE MAIN NAVIGATION
      $this.$menuItem.on(event, $this.menuItemClick);

      // NAVIGATION HIGHLIGHT & OPEN PARENT
      $("#sidebar-menu ul li.has_sub a.active").parents("li:last").children("a:first").addClass("active").trigger("click");
    },

    //init Sidemenu
    $.Sidemenu = new Sidemenu, $.Sidemenu.Constructor = Sidemenu

}(window.jQuery),


function($) {
    "use strict";

    var FullScreen = function() {
        this.$body = $("body"),
        this.$fullscreenBtn = $("#btn-fullscreen")
    };

    //turn on full screen
    // Thanks to http://davidwalsh.name/fullscreen
    FullScreen.prototype.launchFullscreen  = function(element) {
      if(element.requestFullscreen) {
        element.requestFullscreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    },
    FullScreen.prototype.exitFullscreen = function() {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    },
    //toggle screen
    FullScreen.prototype.toggle_fullscreen  = function() {
      var $this = this;
      var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
      if(fullscreenEnabled) {
        if(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
          $this.launchFullscreen(document.documentElement);
        } else{
          $this.exitFullscreen();
        }
      }
    },
    //init sidemenu
    FullScreen.prototype.init = function() {
      var $this  = this;
      //bind
      $this.$fullscreenBtn.on('click', function() {
        $this.toggle_fullscreen();
      });
    },
     //init FullScreen
    $.FullScreen = new FullScreen, $.FullScreen.Constructor = FullScreen

}(window.jQuery),



//main app module
 function($) {
    "use strict";

    var App = function() {
        this.VERSION = "1.5.0",
        this.AUTHOR = "Coderthemes",
        this.SUPPORT = "coderthemes@gmail.com",
        this.pageScrollElement = "html, body",
        this.$body = $("body")
    };

     //on doc load
    App.prototype.onDocReady = function(e) {
      FastClick.attach(document.body);
      resizefunc.push("initscrolls");
      resizefunc.push("changeptype");

      $('.animate-number').each(function(){
        $(this).animateNumbers($(this).attr("data-value"), true, parseInt($(this).attr("data-duration")));
      });

      //RUN RESIZE ITEMS
      $(window).resize(debounce(resizeitems,100));
      $("body").trigger("resize");

      // right side-bar toggle
      $('.right-bar-toggle').on('click', function(e){

          $('#wrapper').toggleClass('right-bar-enabled');
      });


    },
    //initilizing
    App.prototype.init = function() {
        var $this = this;
        //document load initialization
        $(document).ready($this.onDocReady);
        //init side bar - left
        $.Sidemenu.init();
        //init fullscreen
        $.FullScreen.init();
    },

    $.App = new App, $.App.Constructor = App

}(window.jQuery),

//initializing main application module
function($) {
    "use strict";
    $.App.init();
}(window.jQuery);



/* ------------ some utility functions ----------------------- */
//this full screen
var toggle_fullscreen = function () {

}

function executeFunctionByName(functionName, context /*, args */) {
  var args = [].slice.call(arguments).splice(2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for(var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(this, args);
}
var w,h,dw,dh;
var changeptype = function(){
    w = $(window).width();
    h = $(window).height();
    dw = $(document).width();
    dh = $(document).height();

    if(jQuery.browser.mobile === true){
        $("body").addClass("mobile").removeClass("fixed-left");
    }

    if(!$("#wrapper").hasClass("forced")){
      if(w > 990){
        $("body").removeClass("smallscreen").addClass("widescreen");
          $("#wrapper").removeClass("enlarged");
      }else{
        $("body").removeClass("widescreen").addClass("smallscreen");
        $("#wrapper").addClass("enlarged");
        $(".left ul").removeAttr("style");
      }
      if($("#wrapper").hasClass("enlarged") && $("body").hasClass("fixed-left")){
        $("body").removeClass("fixed-left").addClass("fixed-left-void");
      }else if(!$("#wrapper").hasClass("enlarged") && $("body").hasClass("fixed-left-void")){
        $("body").removeClass("fixed-left-void").addClass("fixed-left");
      }

  }
  toggle_slimscroll(".slimscrollleft");
}


var debounce = function(func, wait, immediate) {
  var timeout, result;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  };
}

function resizeitems(){
  if($.isArray(resizefunc)){
    for (i = 0; i < resizefunc.length; i++) {
        window[resizefunc[i]]();
    }
  }
}

function initscrolls(){
    if(jQuery.browser.mobile !== true){
      //SLIM SCROLL
      $('.slimscroller').slimscroll({
        height: 'auto',
        size: "7px"
      });

      $('.slimscrollleft').slimScroll({
          height: 'auto',
          position: 'right',
          size: "7px",
          color: '#828e94',
          wheelStep: 5
      });
  }
}
function toggle_slimscroll(item){
    if($("#wrapper").hasClass("enlarged")){
      $(item).css("overflow","inherit").parent().css("overflow","inherit");
      $(item). siblings(".slimScrollBar").css("visibility","hidden");
    }else{
      $(item).css("overflow","hidden").parent().css("overflow","hidden");
      $(item). siblings(".slimScrollBar").css("visibility","visible");
    }
}

// === following js will activate the menu in left side bar based on url ====
$(document).ready(function() {
    $("#sidebar-menu a").each(function() {
      var pageUrl = window.location.href.split(/[?#]/)[0];
      if (this.href == pageUrl) { 
            $(this).addClass("active");
            $(this).parent().addClass("active"); // add active to li of the current link
            $(this).parent().parent().prev().addClass("active"); // add active class to an anchor
            $(this).parent().parent().prev().click(); // click the item to make it drop
        }
    });
});


var resizefunc = [];








//Index



//Show
//....

//Create




;
