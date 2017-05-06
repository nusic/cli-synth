const KEY_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const NO_KEY = ' ';

function keyType(semiTonesFromA){
	// ensure semiTonesFromA is represented in the interval [0, 11]
	while (semiTonesFromA < 0) semiTonesFromA += 12;
	while (semiTonesFromA > 11) semiTonesFromA -= 12;

	// ░░   ░   ░   ░░ ░░   ░   ░░ ░░   ░   ░   ░░
	// ░░   ░   ░   ░░ ░░   ░   ░░ ░░   ░   ░   ░░
	// ░░   ░   ░ 1 ░░ ░░ 4 ░ 6 ░░ ░░ 9 ░ 11░   ░░
	// ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
	// ░░░ ░░░ ░0░ ░2░ ░3░ ░5░ ░7░ ░8░ ░10 ░░░ ░░░
	switch(semiTonesFromA){
		case 0: 
		case 5: 
		case 10: return 'middle white';
		case 2: 
		case 7: return 'left white';
		case 3: 
		case 8: return 'right white';
		default: return 'black';
	}
}

function Keyboard(keyboardChars, locationStandardA){
	this.keyboardChars = keyboardChars;
	this.locationStandardA = locationStandardA;
	this.charToKeyMap = buildKeyFreqMap(keyboardChars, locationStandardA);

	// create a direct mapping from key to frequency
	var self = this;
	this.charToFrequency = Object.keys(this.charToKeyMap).reduce((charToFreq, ch) => {
			charToFreq[ch] = self.charToKeyMap[ch].frequency;
			return charToFreq;
		}, {});
}

Keyboard.prototype.key = function(ch) {
	return this.charToKeyMap[ch];
};

Keyboard.prototype.frequency = function(ch) {
	return this.charToFrequency[ch];
};

Keyboard.prototype.charIndexIsBlackKey = function(charIndex) {
	return this.charIsBlackKey(this.keyboardChars[charIndex]);
};

Keyboard.prototype.charIsBlackKey = function(ch) {
	var key = this.charToKeyMap[ch];
	return key !== null && key.name.length === 2; // its a sharp -> black
};

Keyboard.prototype.toString = function(charPressed) {
	var lines = ['','','','',''];
	for (var i = 0; i < this.keyboardChars.length; i++) {
		const semiTonesFromA = i - this.locationStandardA;
		var ch = this.keyboardChars[i];
		if(ch === NO_KEY){
			ch = this.charIndexIsBlackKey(i%12) ? ' ' : '░';
		}
		else if (ch === charPressed){
			ch = 'X';
		}
		var CH = ch.toUpperCase();

		const type = keyType(semiTonesFromA);
		switch(type){
			case 'left white':
			lines[0] += ' ░░ ';
			lines[1] += ' ░░ ';
			lines[2] += ' ░░ ';
			lines[3] += '░░░ ';
			lines[4] += '░'+CH+'░ ';
			break;

			case 'right white':
			lines[0] += '░░ ';
			lines[1] += '░░ ';
			lines[2] += '░░ ';
			lines[3] += '░░░';
			lines[4] += '░'+CH+'░';
			break;

			case 'middle white':
			lines[0] += ' ░ ';
			lines[1] += ' ░ ';
			lines[2] += ' ░ ';
			lines[3] += '░░░';
			lines[4] += '░'+CH+'░';
			break;

			case 'black':
			lines[0] += ' ';
			lines[1] += ' ';
			lines[2] += CH;
			lines[3] += ' ';
			lines[4] += ' ';
		}
	}
	return lines.join('\n');
};

function buildKeyFreqMap(keyboard, locationStandardA){
	if(locationStandardA < 0 || 11 < locationStandardA){
		throw new Error('location of standard A must be within keyboard. You can octavize later');
	}
	const freqStandardA = 440;
	return keyboard.split('').reduce((keyMap, key, location) => {
		if(key === NO_KEY) return keyMap;
		const semiToneDiff = location - locationStandardA;
		const octaveDiff = semiToneDiff / 12;
		const freq = freqStandardA * Math.pow(2, octaveDiff);
		const keyIndex = (12 + semiToneDiff) % 12;
		keyMap[key] = {
			frequency: freq,
			name: KEY_NAMES[keyIndex],
			semiToneDiff: semiToneDiff,
		}
		return keyMap;
	}, {});
}


module.exports = Keyboard;