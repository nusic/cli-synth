const exec = require('child_process').exec;

function Synthesizer(overridingSettings){
	this.settings = {
		octave: 0,
		transposition: 0,
		current_sound: 0,
		duration: 0.4,
		fadein: 0.03,
		fadeout: 0.3
	};

	for(s in overridingSettings){
		this.settings[s] = overridingSettings[s];
	}

	this.procs = [];
	this.lastLatency = 0;
	this.events = {
		noteDone: function(){}
	};
}

Synthesizer.prototype.SOUNDS = ['sin', 'tri', 'squ', 'pluck'];


Synthesizer.prototype.on = function(eventName, cb) {
	this.events[eventName] = cb;
};

/**
	Outputs the provided frequency as sound with the current synth settings
	@param frequency to play
*/
Synthesizer.prototype.playFrequency = function(frequency) {
	frequency *= Math.pow(2, this.settings.octave + this.settings.transposition / 12);
	const sound = Synthesizer.prototype.SOUNDS[this.settings.current_sound];
	const playCmd = `play -nq synth ${sound} ${frequency} fade ${this.settings.fadein} ${this.settings.duration} ${this.settings.fadeout} reverb `;
	//console.log(playCmd);
	var startTimeMillis = Date.now();
	var toneDurationMillis = this.settings.duration * 1000;
	var subproc = exec(playCmd, (error, stdout, stderr) => {
		this.lastLatency = Date.now() - startTimeMillis - toneDurationMillis;
		this.events.noteDone();
	  if (error) {
	  	console.error(error);
	    return;
	  }
	  if(stdout) console.log(`stdout: ${stdout}`);
	  if(stderr) console.log(`stderr: ${stderr}`);
	});
	this.procs.push(subproc);
}

Synthesizer.prototype.destruct = function() {
	this.procs.forEach(proc => proc.kill());
};

Synthesizer.prototype.nextSound = function() {
	this.settings.current_sound++;
	this.settings.current_sound %= Synthesizer.prototype.SOUNDS.length;
}

Synthesizer.prototype.sound = function() {
	return Synthesizer.prototype.SOUNDS[this.settings.current_sound];
};

Synthesizer.prototype.toString = function() {
	return 'sound:'+this.sound() + ' octave:'+this.settings.octave + ' transposition:' + this.settings.transposition + ' latency:'+this.lastLatency+'ms';
};

module.exports = Synthesizer;