const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Hace que el bot diga lo que quieras.')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('El texto que quieres que diga el bot.')
                .setRequired(true)),
    async execute(interaction) {
        const text = interaction.options.getString('texto');
        await interaction.reply({ content: text });
    },
};