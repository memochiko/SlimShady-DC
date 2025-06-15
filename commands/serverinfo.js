const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información sobre el servidor actual.'),
    async execute(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            return interaction.reply({ content: 'Este comando solo se puede usar en un servidor.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`🏛️ Información del Servidor: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'ID del Servidor', value: guild.id, inline: true },
                { name: 'Dueño', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
                { name: 'Canales', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Fecha de Creación', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};