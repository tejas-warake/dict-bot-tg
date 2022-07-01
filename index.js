const axios = require('axios');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Welcome! Enter you word..");

});

bot.on('message', (msg) => {

    const word = msg.text.toString().toLowerCase();
    // console.log(word);

    if (word == "yes") {
        bot.sendMessage(msg.chat.id, `Glad to Help You!`);
        return;
    } else if (word == "no") {
        bot.sendMessage(msg.chat.id, `Sorry my bad!`);
        return;
    }

    if (!word.includes("start")) {
        handleRequest(word, msg);
    }

});


const handleRequest = (word, msg) => {
    axios.request({
        method: 'GET',
        url: `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    }
    ).then(function (response) {
        // bot.sendMessage(msg.chat.id, "Found!");
        const result = response.data[0];
        // console.log(result);
        const meanings = result.meanings;

        meanings.map((content) => {
            if (Object.keys(content).length == 4) {
                const type = content.partOfSpeech;
                const syn = content.synonyms;
                const ant = content.antonyms;
                const defs = content.definitions;
                bot.sendMessage(msg.chat.id, `Part of Speech: ${type}\nSynonym: ${syn || " "}\nAntonym: ${ant || " "}
                    `);

                defs.map((d) => {
                    bot.sendMessage(msg.chat.id, `Definition: ${d.definition}\n${d.example != null ? "Example: " + d.example : " "}`);
                })
            }

        })

        return response.data[0];

    }).then((result) => {
        // console.log(result);
        bot.sendMessage(msg.chat.id, `See More at\n${result.sourceUrls[0] != null ? result.sourceUrls[0] : "https://www.google.com/"}`, {
            "reply_markup": {
                "keyboard": [["YES", "NO"], ["Do you got the meaning?"]]
            }
        }
        );
        try {
            if (result.phonetics[0].audio) {
                bot.sendAudio(msg.chat.id, result.phonetics[0].audio);
            }
        } catch (e) {  }
    }
    ).catch(function (error) {
        bot.sendMessage(msg.chat.id, "Enter correct word, Please!");
        console.error(error);
    });
}