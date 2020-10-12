

/* Loading indicator */
var tako = document.getElementById('tako')
/* Force click to play media */
var panels = Array.from(document.getElementsByClassName('panel'))

/* Audio ready to play, get click */
var playing = false
function readyToPlay(callback) {
    
    tako.style.opacity = '0'
    tako.style.visibility = 'hidden'
    
    // todo: detect autoplay
    panels.concat(tako).forEach(l => {
        l.style.cursor = 'pointer'
        l.addEventListener('click', function() {
            panels.forEach(p => p.classList.add('running'))
            // idempotency
            if(!playing) callback()
            playing = true
        })
    })
    
}

/* Audio element method (fallback) **/
var audio
var fallenBack = false
function fallback() {
    if (fallenBack) console.error("Already fell ;-;")
    fallenBack = true
    
    console.log("Falling back to HTML5 <audio>")
    document.getElementById('footer').insertAdjacentHTML(
        'beforeend',
        document.getElementsByTagName('noscript')[0].innerText
    )
    
    audio = document.getElementById('loop')
    audio.addEventListener('loadeddata', function() {
        readyToPlay(function() {
            console.log("Playing using <audio> fallback")
            audio.play()
        })
    })
    // TODO: gapless-ish by using two audio elements
}

/* WebAudio (intro + gapless) */
// TODO: detect mp3 not supported
var introSrc = 'bg-intro.mp3?webaudio'
var loopSrc = 'bg-loop.mp3?webaudio'

// Safari polyfill
/* https://gist.github.com/jakearchibald/131d7101b134b6f7bed1d8320e4da599 */
if (!window.AudioContext && window.webkitAudioContext) {
    const oldFunc = webkitAudioContext.prototype.decodeAudioData
    webkitAudioContext.prototype.decodeAudioData = function(arraybuffer) {
        return new Promise((resolve, reject) => {
            oldFunc.call(this, arraybuffer, resolve, reject)
        })
    }
}

// Detect Chrome (requires user input before creating the audio context)


// All of this is just for gapless playback
var AudioContext = window.AudioContext || window.webkitAudioContext
try { var context = new AudioContext() }
catch(e) {
    console.error(e)
    fallback()
}

var introSource
var loopSource
if (context) {
    
    // Using promises as callbacks for simplicity
    // https://caniuse.com/?search=await
    
    fetch(introSrc)
    .then(response => response.arrayBuffer())
    .then(buffer => context.decodeAudioData(buffer))
    .catch(e => {
        console.error(e)
        fallback()
    })
    .then(introBuffer => {
         if (!introBuffer) return
         
         introSource = context.createBufferSource()
         introSource.buffer = introBuffer
         introSource.connect(context.destination)
         
         readyToPlay(function() {
             console.log("Playing using WebAudio API")
             introSource.start()
         })
         
         fetch(loopSrc)
         .then(response => response.arrayBuffer())
         .then(buffer => context.decodeAudioData(buffer))
         .catch(e => {
             console.error(e)
             // todo: test this path
             console.log('Oh no, failed to load loop')
             introSource.loop = true
         })
         .then(loopBuffer => {
             if (!loopBuffer) return
             loopSource = context.createBufferSource()
             loopSource.buffer = loopBuffer
             loopSource.connect(context.destination)
             loopSource.loop = true
             loopSource.start(introBuffer.duration)
         })
        
    })
    
}

function resize(){
    let referenceW = 1924;
    let referenceH = 948;
    let w = window.outerWidth-12;
    let h = window.outerHeight-108;
    $newH = 10*(referenceH/h);
    $newW = 4.5*(referenceW/w);
    $newH = String($newH);
    $newW = String($newW);
    document.getElementById("circle").style.height = $newH.concat("%");
    document.getElementById("circle").style.width = $newW.concat("%");
}
function inaSound(){
    let sound = document.getElementById("inaSound");
    sound.play();
}
window.onload = resize