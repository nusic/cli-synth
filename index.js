var keypress = require('keypress');
const exec = require('child_process').exec;
var Keyboard = require('./keyboard');

var keyboard = new Keyboard('awsedftgyhujkolpöä', 9);
//var keyboard = new Keyboard('q2w3er5t6y7ucfvgbnjmk,l.', 9);

var procs = [];
process.on('exit', () => {
	procs.forEach(proc => proc.kill());
	console.log();
})

// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);


 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  //console.log(ch);
  
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
    //procs.map(proc => console.log(proc.spawnargs[2]));
    process.exit(1);
  }
  else {
  	myOnPress(ch, key);
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();


var SOUNDS = ['sin', 'tri', 'squ', 'pluck'];

var settings = {
	transposition: 0,
	octave: 0,
	current_sound: 0,
}

var tone = {
	duration: 0.4,
	fadein: 0.03,
	fadeout: 0.3,
	sound: 'tri',
	frequency: 440,
};

console.log(keyboard.toString());
updateMonitor();
function myOnPress(ch, physicalKey){
	//console.log(ch, physicalKey);
	const key = keyboard.key(ch);
	if(key){
		tone.frequency = Math.pow(2, settings.octave + settings.transposition / 12) * key.frequency;
		//procs.forEach(proc => proc.kill());
		//console.log(ch);
		play(tone);
		//console.log(key.name);
		//console.log('play');
	}
	else if(ch === ' '){
		settings.current_sound = (SOUNDS.length + settings.current_sound + 1) % SOUNDS.length;
	}
	else if(physicalKey) {
		switch(physicalKey.name){
			case 'up': settings.octave++; break;
			case 'down': settings.octave--; break;
			case 'left': settings.transposition--; break;
			case 'right': settings.transposition++; break;
		}
	}
	
	else {
		//console.log(ch, key);
	}
	//console.log(keyboard.toString(ch));
	updateMonitor();
}

function updateMonitor(){
	process.stdout.clearLine();  // clear current text
	process.stdout.cursorTo(0);  // move cursor to beginning of line
	process.stdout.write('sound:'+SOUNDS[settings.current_sound] + ' octave:'+settings.octave + ' transposition:' + settings.transposition);  // write text
}

function play(tone){
	const playCmd = `play -nq synth ${SOUNDS[settings.current_sound]} ${tone.frequency} ${SOUNDS[settings.current_sound]} ${Math.pow(2,7/12)*tone.frequency} fade ${tone.fadein} ${tone.duration} ${tone.fadeout} reverb `;
	//console.log(playCmd);
	var subproc = exec(playCmd, (error, stdout, stderr) => {
	  if (error) {
	    return;
	  }
	  if(stdout) console.log(`stdout: ${stdout}`);
	  if(stderr) console.log(`stderr: ${stderr}`);
	});
	procs.push(subproc);
}

