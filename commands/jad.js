// Importa las clases necesarias de discord.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
// Importa el sistema de gestión de sub-bots
const subBotManager = require('../systems/subBotManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jad')
        .setDescription('Gestiona los sub-bots del servidor.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('start')
                .setDescription('Inicia un sub-bot específico por su ID.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('El ID del sub-bot a iniciar.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
                .setDescription('Detiene un sub-bot específico por su ID.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('El ID del sub-bot a detener.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Añade un nuevo sub-bot a la configuración y lo inicia.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('El ID único para el sub-bot (ej. ID de cliente del bot).')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('token')
                        .setDescription('El token de autenticación del sub-bot.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Elimina un sub-bot de la configuración y lo detiene si está corriendo.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('El ID del sub-bot a eliminar.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Muestra todos los sub-bots configurados y su estado.')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const subcommand = interaction.options.getSubcommand();
        const subBotId = interaction.options.getString('id');
        const subBotToken = interaction.options.getString('token');
        const mainCommands = interaction.client.commands;

        let replyMessage = '';
        let embed = new EmbedBuilder().setTimestamp().setFooter({ text: 'Slim Shady Bot - Sub-Bot Team' });

        switch (subcommand) {
            case 'start':
                embed.setTitle('▶️ Iniciando Sub-Bot');
                embed.setColor('#2ECC71');
                if (subBotId) {
                    const existingSubBots = subBotManager.getSubBots();
                    const subBotEntry = existingSubBots.find(sb => sb.id === subBotId);

                    if (!subBotEntry) {
                        replyMessage = `No se encontró un sub-bot con el ID \`${subBotId}\` en la configuración. Primero añádelo con \`/jad add\`.`;
                        embed.setColor('#E74C3C');
                    } else {
                        const error = await subBotManager.startSpecificSubBot(subBotEntry, mainCommands);
                        if (error) {
                            replyMessage = `Error al iniciar el sub-bot \`${subBotId}\`: ${error}`;
                            embed.setColor('#E74C3C');
                        } else {
                            replyMessage = `Sub-bot \`${subBotId}\` iniciado con éxito.`;
                        }
                    }
                } else {
                    replyMessage = 'Por favor, proporciona el ID del sub-bot que deseas iniciar.';
                    embed.setColor('#E74C3C');
                }
                break;

            case 'stop':
                embed.setTitle('⏹️ Deteniendo Sub-Bot');
                embed.setColor('#E74C3C');
                if (subBotId) {
                    const success = await subBotManager.stopSpecificSubBot(subBotId);
                    if (success) {
                        replyMessage = `Sub-bot \`${subBotId}\` detenido con éxito.`;
                        embed.setColor('#F1C40F');
                    } else {
                        replyMessage = `No se encontró el sub-bot \`${subBotId}\` o no estaba corriendo.`;
                        embed.setColor('#7F8C8D');
                    }
                } else {
                    replyMessage = 'Por favor, proporciona el ID del sub-bot que deseas detener.';
                    embed.setColor('#E74C3C');
                }
                break;

            case 'add':
                embed.setTitle('➕ Añadiendo Sub-Bot');
                embed.setColor('#3498DB');
                if (subBotId && subBotToken) {
                    subBotManager.addSubBot(subBotId, subBotToken);
                    const subBotEntry = { id: subBotId, token: subBotToken };
                    const error = await subBotManager.startSpecificSubBot(subBotEntry, mainCommands);
                    if (error) {
                        replyMessage = `Sub-bot \`${subBotId}\` añadido a la configuración, pero hubo un error al iniciarlo: ${error}`;
                        embed.setColor('#E74C3C');
                    } else {
                        replyMessage = `Sub-bot \`${subBotId}\` añadido y iniciado con éxito.`;
                    }
                } else {
                    replyMessage = 'Por favor, proporciona tanto el ID como el token del sub-bot.';
                    embed.setColor('#E74C3C');
                }
                break;

            case 'remove':
                embed.setTitle('➖ Eliminando Sub-Bot');
                embed.setColor('#FF0000');
                if (subBotId) {
                    await subBotManager.stopSpecificSubBot(subBotId);

                    const success = subBotManager.removeSubBot(subBotId);
                    if (success) {
                        replyMessage = `Sub-bot \`${subBotId}\` eliminado de la configuración y detenido si estaba corriendo.`;
                    } else {
                        replyMessage = `No se encontró un sub-bot con el ID \`${subBotId}\` en la configuración.`;
                        embed.setColor('#7F8C8D');
                    }
                } else {
                    replyMessage = 'Por favor, proporciona el ID del sub-bot que deseas eliminar.';
                    embed.setColor('#E74C3C');
                }
                break;

            case 'list':
                embed.setTitle('📋 Lista de Sub-Bots');
                embed.setColor('#9B59B6'); // Púrpura
                const configuredSubBots = subBotManager.getSubBots();
                const runningSubBots = subBotManager.getRunningSubBots();
                const runningIds = runningSubBots.map(client => client.user.id);

                if (configuredSubBots.length === 0) {
                    replyMessage = 'No hay sub-bots configurados.';
                } else {
                    let fields = [];
                    for (const sb of configuredSubBots) {
                        const status = runningIds.includes(sb.id) ? '✅ En línea' : '❌ Desconectado';
                        fields.push({
                            name: `Sub-Bot ID: ${sb.id}`,
                            value: `Estado: ${status}\nToken (últimos 5): \`...${sb.token.slice(-5)}\``,
                            inline: false
                        });
                    }
                    embed.addFields(fields);
                    replyMessage = 'Aquí están los sub-bots configurados:';
                }
                break;

            default:
                replyMessage = 'Subcomando no válido.';
                embed.setColor('#E74C3C');
                break;
        }

        embed.setDescription(replyMessage);
        await interaction.editReply({ embeds: [embed] });
    },
};