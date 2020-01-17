let Visualization = {
	init: function() {
		// events
		Reveal.addEventListener('slidechanged', function(event) {
			syncVisual(event.currentSlide)
		})
		Reveal.addEventListener('fragmentshown', function(event) {
			syncVisual(Reveal.getCurrentSlide())
		})
		Reveal.addEventListener('fragmenthidden', function(event) {
			syncVisual(Reveal.getCurrentSlide())
		})

		// key bindings
		Reveal.addKeyBinding(32, onNext)
		Reveal.addKeyBinding(80, onPrev)
		Reveal.addKeyBinding(39, onRight)

	 	// initialize visualizations in all slides
		for(let slide of Reveal.getSlides()) {
			let container = Array.from(slide.getElementsByTagName("div"))
				.filter(c => c.hasAttribute("data-visual-algorithm"))[0]
			if(!container) continue

			// Some magic to properly scale the canvas. Reveal.js scales all slides with CSS
			// (either "zoom" or "transform: scale(x)") but this auto scaling looks bad for canvas.
			// The proper way to scale the canvas is to make it really larger (more pixels) and
			// draw larger graphics in it. We do this with the folloing hacks:
			//
			// We first cancel the canvas' scaling by applying an inverse scale()
			var scale = Reveal.getScale()
			let canvas = container.childNodes[0]
			canvas.style.transform = "scale(" + (1/scale) + ")"

			// We make the canvas larger by increasing its width/height
			let origWidth = canvas.width
			let origHeight = canvas.height
			canvas.width = Math.floor(scale * canvas.width)
			canvas.height = Math.floor(scale * canvas.height)

			// Hoever the container has become too large now, because it takes into account
			// the new canvas size, plus the scaling (alghough we have "canceled" it out).
			// So we force the container to have the original height.
			container.style.height = origHeight + "px"

			// Also, we need to center the canvas within its container. However, the canvas is _larger_
			// than the container, which makes centering tricky. It is achieved via a flexbox below.
			container.style.display = 'flex'
			container.style.justifyContent = 'center'
			container.style.alignItems = 'center'
			canvas.style.flexShrink = 0

			// Create manager.
			var manager = initCanvas(canvas, null)

 			// We apply scale() to the canvas' ctx, so that all graphics are drawn larger
			// This must be done after creating the manager.
			canvas.getContext("2d").scale(scale, scale)

			// Finally create the algorithm, with an eval hack (classes exist in the wrapper function's scope, we avoid exporting to global scope)
			// Impotant: the constructor receives the canvas' width/height, which is used eg to center objects. We pass the _original_
			// size (without scaling), cause the scaling is automatically applied by scale().
			let algClass = eval(container.getAttribute("data-visual-algorithm"))
			let algorithm = new algClass(manager, origWidth, origHeight)

			manager.SetPaused(true)
			// manager.SetSpeed(0)

			// the slide can contain <div data-visual-action="..."> tags without a fragment class.
			// these are execute at the beginning, to form the initial state of the animation
			let initial = Array.from(slide.getElementsByTagName("div"))
				.filter(function(a) {
					return !a.classList.contains("fragment") && a.hasAttribute("data-visual-action")
				})

			for(let step of initial) {
				let action = step.getAttribute("data-visual-action")
				let value = parseValue(step.getAttribute("data-visual-value"))
				algorithm.implementAction(algorithm[action].bind(algorithm), value)
				manager.skipForward()
			}

			slide.visualInfo = {
				manager: manager,
				algorithm: algorithm,
				initialNo: initial.length,
				noSkipOnNextSync: false,
			}
		}
	}
}
Reveal.registerPlugin('visualization', Visualization)


function parseValue(s) {
	if(s.match(/^[0-9]$/))
		return Number.parseInt(s)
	else
		return s
}

// Returns the current fragment of the visualization animation
function currentFragment(vi) {
	// before starting AnimationSteps is empty, after starting previousAnimationSteps
	// contains one entry for each past step. We need to substract any initial actions
	// that are not aniamated so they don't have their own fragments
	//
	return (vi.manager.AnimationSteps ? vi.manager.previousAnimationSteps.length : -1) - vi.initialNo
}

// awaitingStep: animation is paused in the middle of a fragment, waiting for the next step
// currentlyAnimating: animation is playing

function onNext() {
	let vi = Reveal.getCurrentSlide().visualInfo
	if(!vi) return Reveal.next()

	if(vi.manager.awaitingStep) {
		vi.manager.step()
	} else if(!vi.manager.currentlyAnimating) {
		vi.noSkipOnNextSync = true;
		Reveal.next()
	}
}

function onPrev() {
	let vi = Reveal.getCurrentSlide().visualInfo
	if(!vi) return Reveal.prev();

	let current = currentFragment(vi)
	if(vi.manager.awaitingStep) {
		vi.manager.stepBack()

		// all steps are included in the action of the current fragment. This always matches
		// Reveal.getState().indexf. If we keep hitting prev() we will reach the previous
		// fragment, so we need to Reveal.prev() so that indexf matches the visualization.
		//
		function onWaitingOrEnded() {
			vi.manager.removeListener("AnimationWaiting", null, onWaitingOrEnded)
			vi.manager.removeListener("AnimationEnded",   null, onWaitingOrEnded)
			if(currentFragment(vi) != current)
				console.log("calling prev")
		}
		vi.manager.addListener("AnimationWaiting", null, onWaitingOrEnded)
		vi.manager.addListener("AnimationEnded"  , null, onWaitingOrEnded)

	} else if(vi.manager.currentlyAnimating) {
		// do nothing

	} else if(current > -1) {
		vi.noSkipOnNextSync = true
		vi.manager.stepBack()
	
	} else {
		Reveal.prev()
	}
}

function onRight() {
	let vi = Reveal.getCurrentSlide().visualInfo

	if(vi && (vi.manager.awaitingStep || vi.manager.currentlyAnimating))
		vi.manager.skipForward()
	else
		Reveal.right()
}

function syncVisual(slide) {
	let vi = slide.visualInfo
	if(!vi) return

	if(!vi.noSkipOnNextSync)
		vi.manager.skipForward()

	let fragments = Array.from(slide.getElementsByClassName("fragment"))
		.filter(function(a) {
			return a.hasAttribute("data-visual-action")
		})

	let current = currentFragment(vi)
	let toShow = Reveal.getState().indexf

	while(toShow < current) {
		vi.manager.skipBack()
		current--
	}

	while(toShow > current) {
		current++
		if(!fragments[current])		// more fragments than actions
			break;

		let action = fragments[current].getAttribute("data-visual-action")
		let value = parseValue(fragments[current].getAttribute("data-visual-value"))

		vi.algorithm.implementAction(vi.algorithm[action].bind(vi.algorithm), value)
		if(!vi.noSkipOnNextSync)
			vi.manager.skipForward()
	}

	vi.noSkipOnNextSync = false
}
