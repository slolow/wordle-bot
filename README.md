# wordle-bot

A telegram bot for a wordle championship 🏆

Latest version: 1.1.0

## start

Run me with `npm run bot`

## run me on a raspberry pi

1. run `hostname -I` on raspberry to find it's ip address

2. connect to raspberry pi via ssh with `ssh <username>@<ip-adress>`

3. when starting bot for the first time create a screen session with `screen -S wordlebotserver` otherwise reconnect to session with `screen -r wordlebotserver`

4. run bot with `npm run bot`

5. detach from screen session by pressing `Ctrl+A`, then `D`

6. you can now end the ssh connection without stopping the bot.
