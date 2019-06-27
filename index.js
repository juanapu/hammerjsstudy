var element = document.getElementById('drag')
    var hammertime = new Hammer(element, {});

    hammertime.get('pinch').set({ enable: true });
    // hammertime.get('pan').set({ threshold: 0 });
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL, pointer: 2 });

    var fixHammerjsDeltaIssue = undefined;
    var pinchStart = { x: undefined, y: undefined }
    var lastEvent = undefined;

    var originalSize = {
        width: 200,
        height: 300
    }

    var current = {
        x: 0,
        y: 0,
        z: 1,
        zooming: false,
        width: originalSize.width * 1,
        height: originalSize.height * 1,
    }

    var last = {
        x: current.x,
        y: current.y,
        z: current.z
    }

    function getRelativePosition(element, point, originalSize, scale) {
        var domCoords = getCoords(element);

        var elementX = point.x - domCoords.x;
        var elementY = point.y - domCoords.y;

        var relativeX = elementX / (originalSize.width * scale / 2) - 1;
        var relativeY = elementY / (originalSize.height * scale / 2) - 1;
        return { x: relativeX, y: relativeY }
    }

    function getCoords(elem) { // crossbrowser version
	    var box = elem.getBoundingClientRect();

	    var body = document.body;
	    var docEl = document.documentElement;

	    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
	    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	    var clientTop = docEl.clientTop || body.clientTop || 0;
	    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

	    var top  = box.top +  scrollTop - clientTop;
	    var left = box.left + scrollLeft - clientLeft;

	    return { x: Math.round(left), y: Math.round(top) };
	}

    function scaleFrom(zoomOrigin, currentScale, newScale) {
        var currentShift = getCoordinateShiftDueToScale(originalSize, currentScale);
        var newShift = getCoordinateShiftDueToScale(originalSize, newScale)

        var zoomDistance = newScale - currentScale
        
        var shift = {
        	x: currentShift.x - newShift.x,
        	y: currentShift.y - newShift.y,
        }

        var output = {
            x: zoomOrigin.x * shift.x,
            y: zoomOrigin.y * shift.y,
            z: zoomDistance
        }
        return output
    }

    function getCoordinateShiftDueToScale(size, scale){
    	var newWidth = scale * size.width;
        var newHeight = scale * size.height;
    	var dx = (newWidth - size.width) / 2
    	var dy = (newHeight - size.height) / 2
    	return {
    		x: dx,
    		y: dy
    	}
    }

    hammertime.on('pinch', function(e) {
        var d = scaleFrom(pinchZoomOrigin, last.z, last.z * e.scale)
        current.x = d.x + last.x + e.deltaX;
        current.y = d.y + last.y + e.deltaY;
        current.z = d.z + last.z;
        lastEvent = 'pinch';
        update();
    })

    hammertime.on('pan', function(e) {
        current.x =  last.x + e.deltaX;
        current.y = last.y + e.deltaY;
        // console.table([{lastx: last.x},{lasty: last.y},{deltyx: e.deltaX},{delty: e.deltaY}]);
        update();
    })
    hammertime.on('panstart', function(e) {
      // console.log('--- panstart---')
      // document.getElementById('dragWrapper').innerHTML += '1';
       document.getElementById('test').innerText += '1';
    })
        hammertime.on('press', function(e) {
      // console.log('--- panstart---')
      // document.getElementById('dragWrapper').innerHTML += '1';
       document.getElementById('test').innerText += '2';
    })
    hammertime.on('panend', function(e) {
        last.x = current.x;
        last.y = current.y;
    })

    var pinchZoomOrigin = undefined;
    hammertime.on('pinchstart', function(e) {
        pinchStart.x = e.center.x;
        pinchStart.y = e.center.y;
        pinchZoomOrigin = getRelativePosition(element, { x: pinchStart.x, y: pinchStart.y }, originalSize, current.z);
        lastEvent = 'pinchstart';
    })

    hammertime.on('pinchend', function(e) {
        last.x = current.x;
        last.y = current.y;
        last.z = current.z;
        lastEvent = 'pinchend';
    })

    function update() {
        current.height = originalSize.height * current.z;
        current.width = originalSize.width * current.z;
        // console.table([{currentx: current.x}, {currenty: current.y},{scale: current.z}]);
        element.style.transform = "translate3d(" + current.x + "px, " + current.y + "px, 0) scale(" + current.z + ")";
    }
    