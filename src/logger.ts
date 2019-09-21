import { BotClient, Song } from './customInterfaces';
import { Client, TextChannel, Message, MessageEmbed } from 'discord.js';
import config from './config';
import { Repository } from 'typeorm';
import { Songs } from './entities/songs';
import { StatusMessages } from './statusMessages';

export class Logger {

    private _botClient: BotClient;

    private _client: Client;

    private _logChannel: TextChannel;

    private _songRepsitory: Repository<Songs>;

    private _statusMessages: StatusMessages;

    public init(botClient: BotClient) {
        this._botClient = botClient;
        this._client = this._botClient.getClient();
    }

    // send help message to log channel
    public logHelp(msg: Message, helpEmbed: MessageEmbed) {
        this._logChannel.send(`${msg.author.toString()}`).then(() => {
            this._logChannel.send(helpEmbed);
        });
    }

    // log song request
    public logSong(msg: Message, song: Song) {
        let embed = new MessageEmbed();
        embed.setColor(0x007BFF);
        embed.setAuthor(`${msg.author.username}`, `${msg.author.avatarURL()}`);
        embed.setTimestamp(new Date());

        embed.addField(song.name, `https://youtu.be/${song.id}`);
        this._logChannel.send(embed);
    }

    // log skip
    public logSkip(msg: Message) {
        let embed = new MessageEmbed();
        embed.setColor(0x28A745);
        embed.setAuthor(`${msg.author.username}`, `${msg.author.avatarURL()}`);
        embed.setTimestamp(new Date());

        embed.setTitle(':fast_forward: Skipped');
        this._logChannel.send(embed);
    }

    // log leave
    public logLeave(msg: Message) {
        let embed = new MessageEmbed();
        embed.setColor(0x28A745);
        embed.setAuthor(`${msg.author.username}`, `${msg.author.avatarURL()}`);
        embed.setTimestamp(new Date());

        embed.setTitle(':no_entry_sign: Left');
        this._logChannel.send(embed);
    }

    // log pause
    public logPause(msg: Message) {
        let embed = new MessageEmbed();
        embed.setColor(0x28A745);
        embed.setAuthor(`${msg.author.username}`, `${msg.author.avatarURL()}`);
        embed.setTimestamp(new Date());

        embed.setTitle(':pause_button: Paused');
        this._logChannel.send(embed);
    }

    // log resume
    public logResume(msg: Message) {
        let embed = new MessageEmbed();
        embed.setColor(0x28A745);
        embed.setAuthor(`${msg.author.username}`, `${msg.author.avatarURL()}`);
        embed.setTimestamp(new Date());

        embed.setTitle(':arrow_forward: Resumed');
        this._logChannel.send(embed);
    }

    // log any error (provide error as string)
    public logError(msg: Message, errorString: string) {
        this._logChannel.send(`${msg.author.toString()}\n${errorString}`);
    }

    // save Song in database
    public async saveSong(newSong: Song) {
        let song = await this._songRepsitory.findOne({ where: { id: newSong.id, userID: newSong.requester } });
        if (song) {
            await this._songRepsitory.update({ id: newSong.id, userID: newSong.requester }, { timesPlayed: song.timesPlayed + 1 });
        } else {
            await this._songRepsitory.insert({ id: newSong.id, userID: newSong.requester, name: newSong.name, timesPlayed: 1 });
        }
        this._statusMessages.updateSongLeaderboard();
        this._statusMessages.updateDJLeaderboard();
    }

    public afterInit() {
        this._logChannel = this._client.channels.get(config.logChannelID) as TextChannel;
        this._songRepsitory = this._botClient.getDBConnection().getSongsRepository();
        this._statusMessages = this._botClient.getStatusMessages();
    }

}