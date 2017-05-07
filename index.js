var keypress = require('keypress');

var Synthesizer = require('./synthesizer');
var Keyboard = require('./keyboard');

//var keyboard = new Keyboard('q2w3er5t6y7ucfvgbnjmk,l.', 9);
var keyboard = new Keyboard('awsedftgyhujkolpöä', 9);
var synth = new Synthesizer({
	fadein: 0.01,
	duration: 0.35
});
synth.on('noteDone', updateMonitor);

process.on('exit', () => {
	synth.destruct();
	console.log();
})

// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  //console.log(ch);  
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
    process.exit(1);
  }
  else {
  	myOnPress(ch, key);
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

console.log(keyboard.toString());
updateMonitor();

function myOnPress(ch, physicalKey){
	//console.log(ch, physicalKey);

	var lowerCh = ch.toLowerCase();
	var frequency = keyboard.frequency(lowerCh);
	if(frequency){
		if(ch !== lowerCh){
			frequency *= 2;
		}
		synth.playFrequency(frequency);
		//synth.playFrequency(Math.pow(2,7/12)*frequency);
	}
	else if(ch === ' '){
		synth.nextSound();
	}
	else if(physicalKey) {
		switch(physicalKey.name){
			case 'up': synth.settings.octave++; break;
			case 'down': synth.settings.octave--; break;
			case 'left': synth.settings.transposition--; break;
			case 'right': synth.settings.transposition++; break;
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
	process.stdout.write(synth.toString()+' ');  // write text
}

