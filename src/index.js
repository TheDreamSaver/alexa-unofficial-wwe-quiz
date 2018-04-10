"use strict";

var data = require('./data');
const OD = data.OD;
var AR = data.AR.slice();
var Alexa = require("alexa-sdk");


var handlers = {
   'LaunchRequest': function () {
    this.response.speak('<audio src="https://s3.amazonaws.com/doesitfly/bada_bing_bada_boom._TTH_.mp3"/> Welcome, to the unofficial WWE Quiz. Alexa will ask you a question, and you have to tell the correct answer. Let\'s see how many you can answer correctly. Would you like to play?').listen("Ask for help if not sure what to do!"); 
    this.emit(":responseReady");
   },
   'QuizIntent': function () {
       let outputspeech = "";
       if(this.attributes.score == 0){
           outputspeech += '<say-as interpret-as="interjection">all righty!</say-as>';
       }
       if(this.attributes.score != 0){
           outputspeech += 'Right answer. The next question is,';
       }
       
       if(AR.length > 0 ) {
            this.attributes.randomizer = Math.floor(Math.random() * (AR.length-1));
            outputspeech += ` ${OD[AR[this.attributes.randomizer]].question}`;
       }   
       this.response.speak(outputspeech).listen();
       this.emit(":responseReady");
   },
   'AnswerIntent': function () {
       this.attributes.answer = slotValue(this.event.request.intent.slots.answer);
       if(OD[AR[this.attributes.randomizer]].answer == this.attributes.answer){
            AR.splice(this.attributes.randomizer,1);
            this.attributes.score += 1;
            if(AR.length == 0){
                this.response.speak(`Well done, You completed the game, and got all ${this.attributes.score} of them correctly. If you enjoyed the game, do leave feedback and reviews on Amazon.`);
                this.emit(':responseReady');
            }
            this.emit('QuizIntent');
        }
        let finalSpeech = `<say-as interpret-as="interjection">argh!</say-as> Wrong Answer. The correct answer is ${OD[AR[this.attributes.randomizer]].answer}. You were ${OD[AR[this.attributes.randomizer]].finisher} . `;
        if(this.attributes.score<=5){
            finalSpeech += `You need to work more on your pro wrestling knowledge. You got only ${this.attributes.score} correct. Do you want to play again?`;
        }
        else {
            finalSpeech += `You did good. You got ${this.attributes.score} correct. Do you want to play again?`;
        }
        this.response.speak(finalSpeech).listen('Want to play again?');
        this.emit(':responseReady');
   },
   'AMAZON.YesIntent': function () {
        AR = data.AR.slice();
        this.attributes.score = 0;
        this.emit('QuizIntent');
    },
    'AMAZON.NoIntent': function () {
        this.response.speak('<say-as interpret-as="interjection">argh!</say-as> We could have had a fun day together! Goodbye!');
        this.emit(":responseReady");
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak("Alexa will ask you a question, and you have to tell the correct answer. If you are able to answer all of them correctly, you win, else alexa wins. So would you like to play?").listen('Would you like to play?');
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('I thought we were having a good time. Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('I thought we were having a good time. Goodbye!');
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'Unhandled': function() {
        const message = 'I don\'t get it! Try saying Alexa, Open unofficial WWE quiz!';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'UnhandledIntent': function() {
        const message = 'I don\'t get it! Try saying Alexa, Open unofficial WWE quiz!';
        this.response.speak(message);
        this.emit(':responseReady');
    }

};



function slotValue(slot, useId){
    let value = slot.value;
    let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
    if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
        let resolutionValue = resolution.values[0].value;
        value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
    }
    return value;
}

// This is the function that AWS Lambda calls every time Alexa uses your skill.
exports.handler = function(event, context, callback) {

// Set up the Alexa object
var alexa = Alexa.handler(event, context); 
// Register Handlers
alexa.registerHandlers(handlers); 

// Start our Alexa code
alexa.execute(); 
  
};
