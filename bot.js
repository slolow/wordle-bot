require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const WORDLE_MSG_START = 'Wordle'

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id.toString();
    const messageText = msg.text;

    if(chatId === CHAT_ID && messageText.startsWith(WORDLE_MSG_START)) {
        const sender = msg.from
        const informationsFromWordleMessage = msg.text.split(" ")
        
        // depending on the users phone settings the gameNumber can be for example '1.223' or '1,223'
        const gameNumber = informationsFromWordleMessage[1].replace(',', '.')
        const numberOfAttempts = Number(informationsFromWordleMessage[2][0])
    }
});