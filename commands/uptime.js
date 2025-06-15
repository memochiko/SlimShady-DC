const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Muestra cuánto tiempo ha estado el bot en línea.'),
    async execute(interaction) {
        const totalSeconds = interaction.client.uptime / 1000;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = Math.floor(totalSeconds % 60);

        let uptimeDate = '';
        if (days > 0) uptimeDate += `${days} día${days !== 1 ? 's' : ''}, `;
        if (hours > 0) uptimeDate += `${hours} hora${hours !== 1 ? 's' : ''}, `;
        if (minutes > 0) uptimeDate += `${minutes} minuto${minutes !== 1 ? 's' : ''}, `;
        uptimeDate += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('⬆️ Tiempo en Línea')
            .setDescription(`He estado en línea por: **${uptimeDate}**`)
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};