'use strict';

var _ = require('lodash');
var sanitizer = require('./lib/sanitizer.js');
var meta = require('./lib/metadata.js');

var dictionary = [];
var locale = [];

var validPatterns = ['character', 'grawlix', 'word'];
var grawlixChars = ['!','@','#','$','%','&','*'];

var replacement = {
    'character' : function(key, pat){
        var keyRepm = _.repeat(pat, key.length);
        return keyRepm;
    },

    'word': function(key, pat){
        return pat;
    },

    'grawlix' : function(key){
        var keyReplacement = '',
          grawlixLen = grawlixChars.length,
          wordLen = key.length,
          rand,
          i;

        for (i = 0; i < wordLen; i++) {
          rand = Math.floor(Math.random() * grawlixLen);
          keyReplacement += grawlixChars[rand];
        }

        return keyReplacement;
    }

};

module.exports = {

    /* This method sets the locale and also populates the dictionary based on the locale*/
    setLocale: function(localeArray){
        dictionary = [];
        locale = [];
        //Validate the incoming locales
        locale = sanitizer.sanitizeLocales(localeArray);

        //Now start populating dictionary; before that clear out the dictionary
        locale.forEach(function(lang){
            // First require the module
            var arrayContents = require('naughty-words')[lang];
            var otherDictionary = _.concat(dictionary, arrayContents);
            dictionary = _.uniq(otherDictionary);
        });
    },

    /* This method returns the current locales set on the object */
    getLocale: function(){
        if(locale === undefined || locale.length == 0)
        {
            throw "It appears that locale is not set. Perhaps you forgot to call setLocale ?";
        }
        return locale;
    },

    /* This method returns a list of available locales supported by the module */
    showAvailableLocales: function(){
        return meta.getSupportedLocales();
    },

    /* This method returns a lit of words currently added to the dictionary */
    getDictionary: function(){
        return dictionary;
    },

    /* This method allows you to add more words to the current directory instance incase they are not supported by our seeds*/
    addWords: function(inputWordArray){

        var sanitizedInputWordArray = sanitizer.sanitizeInputWordArray(inputWordArray);
        var otherDictionary = _.concat(dictionary, sanitizedInputWordArray);
        dictionary = _.uniq(otherDictionary);
    },

    /* This method removes words from the dictionary instance */
    removeWords: function(inputWords){
        if(dictionary.indexOf(inputWords) != -1)
        {
            var idx = dictionary.indexOf(inputWords);
            dictionary.splice(idx, 1);
        }
    },

    /* This method shows the supported replacement patterns */
    showReplacementPatterns: function(){
        return validPatterns;
    },

    /* This method replaces the bad words in the string with your replacement characeter */
    replace: function(origString, replacementPattern, replacementWord){

        var key, keyReplacement;

        // Validate that dictionary is populated. If not throw an error
        if(dictionary.length <= 0)
        {
            throw "Dictionary is not populated. Perhaps you forgot to call setLocale ?";
        }

        // Validate the replacementPattern
        var input = {};
        input.replacementPattern = replacementPattern;
        input.replacementWord = replacementWord;
        input.validPatterns = validPatterns;
        var repPatt = sanitizer.sanitizeReplacementPattern(input);


        // Parse the string to see if any word is in the dictionary and if they match generate replacement string
        var lowerStr = origString.toLowerCase();
        for (var j=0; j < dictionary.length; j++)
        {
            key = dictionary[j];
            var index = lowerStr.indexOf(key);
            // This check seems a bit wasteful, TODO: revisit
            if( index != -1)
            {
                keyReplacement = replacement[repPatt.pattern](key, repPatt.word);
                var regex = new RegExp('\\b'+ key + '\\b', 'gi');
                origString = origString.replace(regex, keyReplacement);
                lowerStr = origString.toLowerCase();
            }
        }

        return origString;

    },

};
