import { BotCommand, BotClient } from '../customInterfaces';
import { Message, Collection, RichEmbed, Client } from 'discord.js';

export default class helpCommand implements BotCommand {
    information: BotCommand['information'] = {
        id: 0,
        name: 'help',
        category: 'Information',
        description: 'Displays all available commands.',
        argsRequired: false,
        hasAfterInit: true,
        admin: false,
        aliases: ['h'],
        usage: 'help',
        examples: ['help', 'help addEvent']
    }

    BotClient: BotClient;

    client: Client;

    commands: Collection<string, BotCommand>;

    public initCommand(bot: BotClient) {
        this.BotClient = bot;
        this.client = this.BotClient.getClient();
    }

    public execute(msg: Message, args: string[], prefix: string) {
        let embed = new RichEmbed();
        const command = this.commands.get(args[0]) || this.commands.find(cmd => cmd.information.aliases && cmd.information.aliases.includes(args[0]));
        embed.setColor(0xEDD5BD);
        embed.setAuthor(`${this.client.user.username}`, `${this.client.user.avatarURL}`);
        embed.setFooter(msg.member.displayName, msg.author.avatarURL);
        embed.setTimestamp(new Date());
        if (command) {
            embed.setTitle(`Commandinfo \`${command.information.name}\``);
            embed.addField(`Description`, `${command.information.description}`);
            embed.addField(`Category`, `${command.information.category}`);
            embed.addField(`Usage`, `\`${prefix}${command.information.usage}\``);
            if (command.information.aliases.length > 0) {
                let aliases: string;
                for (let alias of command.information.aliases) {
                    if (aliases) {
                        aliases += `, \`${alias}\``;
                    } else {
                        aliases = `\`${alias}\``;
                    }
                }
                embed.addField(`Aliases`, `${aliases}`);
            }
            if (command.information.examples) {
                let examples: string;
                for (let example of command.information.examples) {
                    if (examples) {
                        examples += `\n\`${prefix}${example}\``;
                    } else {
                        examples = `\`${prefix}${example}\``;
                    }
                }
                embed.addField(`Example`, `${examples}`);
            }
            msg.channel.send(embed);
        } else if (args[0]) {
            msg.channel.send(`:no_entry_sign: Command not found.`);
        } else {
            embed.setTitle(`Commands`);
            embed.setDescription(`To get detailed information about a command, type \`${prefix}help {command}\``);
            let fields:  {
                [key: string]: string
            } = {};
            for (const command of this.commands) {
                if (fields[`${command[1].information.category}`]) {
                    fields[`${command[1].information.category}`] += `\n**${prefix}${command[1].information.name}**\n${command[1].information.description}`;
                } else {
                    fields[`${command[1].information.category}`] = `**${prefix}${command[1].information.name}**\n${command[1].information.description}`;
                }
            }

            for (const key in fields) {
                embed.addField(`:arrow_forward:${key}:arrow_backward:`, fields[key]);
            }
            msg.channel.send(embed);
        }
    }

    public afterInit() {
        this.commands = this.BotClient.getAllCommands();
    }

}