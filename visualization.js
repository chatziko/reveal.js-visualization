// For seeding Math.random
// https://github.com/davidbau/seedrandom
!function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);

const printing = window.location.search.match(/print-pdf/gi)

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
		Reveal.addKeyBinding(40, onDown)

	 	// initialize visualizations in all slides
		if(printing)
			// slides will be duplicated to print each fragment in different page, delay initializeSlides to run after duplication
			Reveal.addEventListener('pdf-ready', initializeSlides)
		else
			initializeSlides()
	}
}
Reveal.registerPlugin('visualization', Visualization)


function initializeSlides() {
	for(let slide of Reveal.getSlides()) {
		// NOTE: we want to find elements in the current slide, not nested ones
		let container = Array.from(slide.getElementsByTagName("div"))
			.filter(c => c.parentElement === slide && c.hasAttribute("data-visual-algorithm"))[0]
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

		// Seed for Math.random can be passed as 'data-visual-seed'
		let seed = container.getAttribute("data-visual-seed")
		if(seed != undefined)
			Math.seedrandom(seed)

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
				return a.parentElement === slide && !a.classList.contains("fragment") && a.hasAttribute("data-visual-action")
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

		// if printing, we update all slides now
		if(printing)
			syncVisual(slide)
	}
}

function parseValue(s) {
	if(s.match(/^[0-9]$/))
		return Number.parseInt(s)
	else
		return s
}

// Returns the current fragment of the visualization animation
function currentAnimFragment(vi) {
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

	let current = currentAnimFragment(vi)
	if(vi.manager.awaitingStep) {
		vi.manager.stepBack()

		// all steps are included in the action of the current fragment. This always matches
		// Reveal.getState().indexf. If we keep hitting prev() we will reach the previous
		// fragment, so we need to Reveal.prev() so that indexf matches the visualization.
		//
		function onWaitingOrEnded() {
			vi.manager.removeListener("AnimationWaiting", null, onWaitingOrEnded)
			vi.manager.removeListener("AnimationEnded",   null, onWaitingOrEnded)
			if(currentAnimFragment(vi) != current)
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

function onDown() {
	let vi = Reveal.getCurrentSlide().visualInfo

	if(vi && (vi.manager.awaitingStep || vi.manager.currentlyAnimating))
		vi.manager.skipForward()
	else
		Reveal.down()
}

function syncVisual(slide) {
	let vi = slide.visualInfo
	if(!vi) return

	if(!vi.noSkipOnNextSync)
		vi.manager.skipForward()

	let fragments = Array.from(slide.getElementsByClassName("fragment")).filter(f => f.parentElement === slide)
	let animFragments = fragments.filter(f => f.hasAttribute("data-visual-action"))
	let currentFragment = fragments.filter(f => f.classList.contains("current-fragment"))[0]

	let current = currentAnimFragment(vi)
	let toShow = currentFragment ? currentFragment.getAttribute("data-fragment-index") : -1;

	while(toShow < current) {
		vi.manager.skipBack()
		current--
	}

	while(toShow > current) {
		current++
		if(!animFragments[current])		// more fragments than actions
			break;

		let action = animFragments[current].getAttribute("data-visual-action")
		let value = parseValue(animFragments[current].getAttribute("data-visual-value"))

		vi.algorithm.implementAction(vi.algorithm[action].bind(vi.algorithm), value)
		if(!vi.noSkipOnNextSync)
			vi.manager.skipForward()
	}

	vi.noSkipOnNextSync = false
}
