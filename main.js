var Gpio = require('onoff').Gpio;
var prompt = require('prompt');
var colors = require('colors/safe');
var Spinner = require('cli-spinner').Spinner;
var MORSE_CODES = require('./MorseCodes');

var red = new Gpio(26, 'out');
var green = new Gpio(19, 'out');
var blue = new Gpio(13, 'out');
var yellow = new Gpio(6, 'out');

var led = blue;

var i = 0;
var input;
var promptUser = {
  properties: {
    message: {
      description: colors.green('What would you like to send?')
    }
  }
};
prompt.start();
prompt.message = '';
prompt.delimiter = '';
prompt.get(promptUser, messageResponder);

var spinner = new Spinner('Displaying message... %s');

function loopCharacters() {
  i++;
  if (i < input.length) {
    displayCharacter(input[i]).then(loopCharacters);
  }
  else {
    i = 0;
    spinner.stop();
    prompt.get(promptUser, messageResponder);
  }
}

function displayCharacter(character) {
  var j = 0;
  var codeVal = MORSE_CODES[character.toUpperCase()];

  var loopSymbols = function() {
    j++;
    if (j < codeVal.length) {
      return displaySymbol(codeVal[j]).then(loopSymbols);
    } else {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve();
        }, 1000);
      });
    }
  };

  var displaySymbol = function(symbol) {
      if (symbol === '-') {
        return dash();
      } else if (symbol === '.') {
        return dot();
      } else {
        return new Promise(function(resolve) {
          resolve();
        });
      }
  };

  var dash = function() {
    return new Promise(function(resolve) {
      led.write(1)
      setTimeout(function() {
        led.write(0)
        setTimeout(function() {
          resolve();
        }, 200);
      }, 500);
    });
  };

  var dot = function() {
    return new Promise(function(resolve) {
      led.write(1)
      setTimeout(function() {
        led.write(0)
        setTimeout(function() {
          resolve();
        }, 200);
      }, 200);
    });
  };

  return displaySymbol(codeVal[j]).then(loopSymbols);
};

function messageResponder(err, result) {
  if (result && result.message) {
    input = result.message;
    spinner.start();
    displayCharacter(input[i]).then(loopCharacters);
  }
  if (err) {
    console.log('');
  }
};

process.on('SIGINT', function() {
  led.unexport();
  process.exit();
});
