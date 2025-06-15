const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const QRCode = require('qrcode'); // Necesitas instalar esta librería: npm install qrcode

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Genera un código QR a partir de un texto o URL.')
        .addStringOption(option =>
            option.setName('contenido')
                .setDescription('El texto o URL para el código QR.')
                .setRequired(true)),
    async execute(interaction) {
        const content = interaction.options.getString('contenido');

        if (content.length > 2000) { // Limita el tamaño del contenido para evitar QR demasiado grandes
            return interaction.reply({ content: 'El contenido para el QR es demasiado largo (máx. 2000 caracteres).', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Genera el código QR como un buffer de PNG
            const buffer = await QRCode.toBuffer(content, {
                errorCorrectionLevel: 'H', // Nivel de corrección de error alto
                type: 'image/png',
                width: 256, // Tamaño de la imagen QR
                color: {
                    dark: '#000000',  // Color del módulo oscuro
                    light: '#FFFFFF' // Color del módulo claro
                }
            });

            const attachment = new AttachmentBuilder(buffer, { name: 'qrcode.png' });

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('📷 Código QR Generado')
                .setDescription(`Contenido: \`${content.slice(0, 50)}${content.length > 50 ? '...' : ''}\``)
                .setImage('attachment://qrcode.png') // Referencia a la imagen adjunta
                .setTimestamp()
                .setFooter({ text: 'Slim Shady Bot' });

            await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error('Error al generar código QR:', error);
            await interaction.editReply('Hubo un error al generar el código QR. Intenta de nuevo más tarde.');
        }
    },
};