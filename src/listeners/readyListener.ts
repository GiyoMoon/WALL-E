import { BotClient } from '../customInterfaces';
import config from '../config';
import { VoiceChannel } from 'discord.js';

export default class readyListener {

    BotClient: BotClient;

    constructor(private _botClient: BotClient) { }

    public async evalReady() {
        console.log(`Logged in as ${this._botClient.getClient().user.tag}`);
        this._botClient.afterInit();
    }
}