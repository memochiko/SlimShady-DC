const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifica la latencia del bot.'),
    async execute(interaction) {
        await interaction.deferReply();

        const latency = interaction.client.ws.ping;
        const botLatency = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latencia del Bot', value: `${botLatency}ms`, inline: true },
                { name: 'Latencia de la API', value: `${latency}ms`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        await interaction.editReply({ embeds: [embed] });
    },
};