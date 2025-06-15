const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario o sobre ti mismo.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del que quieres obtener información.')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle(`ℹ️ Información de Usuario: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'ID de Usuario', value: user.id, inline: true },
                { name: 'Tag de Discord', value: user.tag, inline: true },
                { name: 'Bot', value: user.bot ? '✅ Sí' : '❌ No', inline: true },
                { name: 'Se unió a Discord', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
            );

        if (member) {
            embed.addFields(
                { name: 'Apodo en el Servidor', value: member.nickname || 'Ninguno', inline: true },
                { name: 'Se unió al Servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(role => role.name).join(', ') || 'Ninguno' }
            );
        }

        embed.setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};