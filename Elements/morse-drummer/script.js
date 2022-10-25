let speed = 220; //Duration in ms between notes

var letterMap = {
	A: ".-",
	B: "-...",
	C: "-.-.",
	D: "-..",
	E: ".",
	F: "..-.",
	G: "--.",
	H: "....",
	I: "..",
	J: ".---",
	K: "-.-",
	L: ".-..",
	M: "--",
	N: "-.",
	O: "---",
	P: ".--.",
	Q: "--.-",
	R: ".-.",
	S: "...",
	T: "-",
	U: "..-",
	V: "...-",
	W: ".--",
	X: "-..-",
	Y: "-.--",
	Z: "--..",
	" ": " "
};

const input = document.getElementById("textinput");
const display = document.getElementById("showtext");
const convertButton = document.getElementById("convertor");
const clearButton = document.getElementById("clearbutton");
const whatButton = document.getElementById("what");
const infobox = document.getElementById("infobox");
const closemodal = document.getElementById("closemodal");

input.onkeydown = (event) => {
	var key = event.keyCode;
	return (key >= 65 && key <= 90) || [8, 32, 37, 39].includes(key);
};

const convertTexttoMorse = (text) => {
	const splitText = input.value.split("");
	const morseConverts = splitText.map(
		(letter) => letterMap[letter.toUpperCase()]
	);
	return morseConverts.join("");
};

convertButton.onclick = () => {
	const morseText = convertTexttoMorse(input.value).split("");
	display.innerText = "";
	let counter = 0;
	let timed = setInterval(() => {
		if (counter >= morseText.length - 1) clearInterval(timed);
		display.innerText += morseText[counter];
		if (morseText[counter] === ".") {
			triggerKick();
		}
		if (morseText[counter] === "-") {
			triggerSnare();
		}
		++counter;
	}, speed);
};

clearButton.onclick = () => {
	input.value = "";
	display.innerText = "";
};

// Ref: https://dev.opera.com/articles/drum-sounds-webaudio/
class Kick {
	constructor() {
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	}

	play() {
		this.osc = this.audioContext.createOscillator();
		this.osc.frequency.value = 60;
		this.amp = this.audioContext.createGain();
		const time = this.audioContext.currentTime;

		this.osc.frequency.setValueAtTime(150, time);
		this.amp.gain.setValueAtTime(1, time);

		this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.8);
		this.amp.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

		this.osc.start(time);
		this.osc.stop(time + 0.5);

		//Connections
		this.osc.connect(this.amp);
		this.amp.connect(this.audioContext.destination);
	}
}

class Snare {
	constructor() {
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

		this.noise = this.audioContext.createBufferSource();
		this.noise.buffer = this.noiseBuffer();

		var noiseFilter = this.audioContext.createBiquadFilter();
		noiseFilter.type = "highpass";
		noiseFilter.frequency.value = 1000;
		this.noise.connect(noiseFilter);

		this.noiseEnvelope = this.audioContext.createGain();
		noiseFilter.connect(this.noiseEnvelope);

		this.noiseEnvelope.connect(this.audioContext.destination);

		this.osc = this.audioContext.createOscillator();
		this.osc.type = "triangle";

		this.oscEnvelope = this.audioContext.createGain();
		this.osc.connect(this.oscEnvelope);
		this.oscEnvelope.connect(this.audioContext.destination);
	}

	noiseBuffer() {
		var bufferSize = this.audioContext.sampleRate;
		var buffer = this.audioContext.createBuffer(
			1,
			bufferSize,
			this.audioContext.sampleRate
		);
		var output = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			output[i] = Math.random() * 2 - 1;
		}
		return buffer;
	}

	play() {
		const time = this.audioContext.currentTime;
		this.noiseEnvelope.gain.setValueAtTime(0.3, time);
		this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
		this.noise.start(time);

		this.osc.frequency.setValueAtTime(100, time);
		this.oscEnvelope.gain.setValueAtTime(0.7, time);
		this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
		this.osc.start(time);

		this.osc.stop(time + 0.2);
		this.noise.stop(time + 0.2);
	}
}

const triggerKick = () => {
	const kickDrum = new Kick();
	kickDrum.play();
};

const triggerSnare = () => {
	const snareDrum = new Snare();
	snareDrum.play();
};

whatButton.onclick = () => {
	infobox.classList.add("open");
};

closemodal.onclick = () => {
	infobox.classList.remove("open");
};