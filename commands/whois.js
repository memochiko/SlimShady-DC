const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('Muestra información detallada sobre un usuario o sobre ti mismo.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del que quieres obtener información.')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle(`👤 Información detallada de: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'ID de Usuario', value: user.id, inline: true },
                { name: 'Tag de Discord', value: user.tag, inline: true },
                { name: 'Bot', value: user.bot ? '✅ Sí' : '❌ No', inline: true },
                { name: 'Cuenta creada el', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: false }
            );

        if (member) {
            const roles = member.roles.cache
                .filter(r => r.id !== interaction.guild.id) // Filtra el rol @everyone
                .sort((a, b) => b.position - a.position) // Ordena por jerarquía
                .map(role => role.name)
                .join(', ') || 'Ninguno';

            embed.addFields(
                { name: 'Apodo en el Servidor', value: member.nickname || 'Ninguno', inline: true },
                { name: 'Se unió al Servidor el', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`, inline: true },
                { name: 'Roles', value: roles.length > 1024 ? roles.substring(0, 1021) + '...' : roles }, // Limita a 1024 caracteres
                { name: 'ID de Miembro del Servidor', value: member.id, inline: true },
                { name: 'Color del Rol Principal', value: member.displayHexColor, inline: true }
            );
        } else {
            embed.setDescription('Este usuario no está en este servidor.');
        }

        embed.setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};