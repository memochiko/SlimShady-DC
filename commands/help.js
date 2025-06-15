const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra todos los comandos disponibles o información sobre un comando específico.')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('El nombre del comando sobre el que quieres ayuda.')
                .setRequired(false)),
    async execute(interaction) {
        const { commands } = interaction.client;
        const commandName = interaction.options.getString('comando');

        if (!commandName) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📚 Comandos de Slim Shaidy')
                .setDescription(`Para obtener ayuda sobre un comando específico, usa: \`/help [nombre_comando]\``)
                .addFields(
                    { name: 'Comandos:', value: commands.map(command => `\`${command.data.name}\``).join(', ') || 'No hay comandos cargados.' }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });

            return interaction.reply({ embeds: [embed] });
        }

        const command = commands.get(commandName.toLowerCase());

        if (!command) {
            return interaction.reply({ content: 'Ese no es un comando válido.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle(`❓ Ayuda para \`/${command.data.name}\``)
            .addFields(
                { name: 'Descripción', value: command.data.description || 'Sin descripción.' }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        interaction.reply({ embeds: [embed] });
    },
};