const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Muestra información sobre el bot.'),
    async execute(interaction) {
        const client = interaction.client;
        const totalSeconds = client.uptime / 1000;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = Math.floor(totalSeconds % 60);

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🤖 Información de Slim Shaidy')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Desarrollador', value: `Tu Nombre/Alias Aquí`, inline: true }, // ¡CAMBIA ESTO!
                { name: 'Versión de Discord.js', value: `v${version}`, inline: true },
                { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Usuarios', value: `${client.users.cache.size}`, inline: true },
                { name: 'Canales', value: `${client.channels.cache.size}`, inline: true },
                { name: 'Uso de Memoria', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: 'Plataforma', value: `${os.platform()}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};