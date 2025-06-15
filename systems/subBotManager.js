const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const SUB_BOT_DATA_FILE = path.join(__dirname, '..', 'sub_bot_data.json'); // Ruta al archivo de datos de sub-bots

let subBots = {}; // Objeto para almacenar las instancias de cliente de los sub-bots activos
let subBotData = []; // Array para almacenar los tokens e IDs de los sub-bots configurados

// Carga los datos de los sub-bots desde el archivo JSON
const loadSubBotsData = () => {
    if (fs.existsSync(SUB_BOT_DATA_FILE)) {
        try {
            const data = fs.readFileSync(SUB_BOT_DATA_FILE, 'utf8');
            const parsedData = JSON.parse(data);
            // Asegúrate de que parsedData es un array, si no, usa un array vacío.
            subBotData = Array.isArray(parsedData) ? parsedData : [];
            console.log(`Sub-bots cargados desde ${SUB_BOT_DATA_FILE}:`, subBotData.length);
        } catch (error) {
            console.error('Error al cargar datos de sub-bots (posible JSON inválido):', error);
            subBotData = []; // Restablecer si hay un error de parseo o el contenido no es un array
        }
    } else {
        console.log(`Archivo de datos de sub-bots no encontrado: ${SUB_BOT_DATA_FILE}. Creando uno nuevo.`);
        subBotData = []; // Asegura que sea un array si el archivo no existe
        saveSubBotsData(); // Crear el archivo si no existe
    }
};

// Guarda los datos de los sub-bots en el archivo JSON
const saveSubBotsData = () => {
    try {
        fs.writeFileSync(SUB_BOT_DATA_FILE, JSON.stringify(subBotData, null, 2), 'utf8');
        console.log(`Datos de sub-bots guardados en ${SUB_BOT_DATA_FILE}.`);
    } catch (error) {
        console.error('Error al guardar datos de sub-bots:', error);
    }
};

// Inicia un sub-bot individual
const startSubBot = async (subBotEntry, mainCommands) => {
    // Si el sub-bot ya está corriendo, no hacer nada
    if (subBots[subBotEntry.id]) {
        console.log(`Sub-bot ${subBotEntry.id} ya está corriendo.`);
        return;
    }

    // Crea una nueva instancia de cliente para el sub-bot
    const subClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildPresences,
        ],
    });

    // Pasa la colección de comandos del bot principal al sub-bot
    subClient.commands = mainCommands;

    // Evento 'ready' del sub-bot
    subClient.once('ready', async () => {
        console.log(`Sub-bot ${subClient.user.tag} (ID: ${subBotEntry.id}) está en línea.`);
        subClient.user.setActivity(`/help | Sub-Bot de ${subClient.user.username}`, { type: 3 });
        // Nota: Los comandos de barra para los sub-bots son manejados por la interacción que redirige a los comandos principales.
        // No es necesario que cada sub-bot registre sus propios comandos de barra a menos que se desee una lógica de comandos separada.
        // Asumimos que los comandos de barra se registran solo una vez por el bot principal.
    });

    // Evento 'interactionCreate' del sub-bot para manejar comandos de barra
    subClient.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        // Busca el comando en la colección de comandos del bot principal
        const command = subClient.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Sub-bot ${subClient.user.tag}: No se encontró el comando ${interaction.commandName}.`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'El comando solicitado no existe o no está disponible en este sub-bot.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'El comando solicitado no existe o no está disponible en este sub-bot.', ephemeral: true });
            }
            return;
        }

        try {
            await command.execute(interaction); // Ejecuta el comando usando la lógica del bot principal
        } catch (error) {
            console.error(`Sub-bot ${subClient.user.tag}: Error al ejecutar comando ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error en el sub-bot al ejecutar este comando. ¡Lo siento!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error en el sub-bot al ejecutar este comando. ¡Lo siento!', ephemeral: true });
            }
        }
    });

    try {
        await subClient.login(subBotEntry.token);
        subBots[subBotEntry.id] = subClient; // Almacena la instancia del cliente del sub-bot
    } catch (error) {
        console.error(`Error al iniciar sub-bot ${subBotEntry.id} (token inválido o error de Discord):`, error);
        // Si el token es inválido o hay un error de inicio de sesión, eliminarlo de la configuración
        subBotData = subBotData.filter(sb => sb.id !== subBotEntry.id);
        saveSubBotsData(); // Guardar el cambio inmediatamente
        return `Error al iniciar sub-bot ${subBotEntry.id}: ${error.message}`;
    }
    return null; // Retorna null si no hay error
};

// Detiene un sub-bot individual por su ID
const stopSubBot = async (subBotId) => {
    const client = subBots[subBotId];
    if (client) {
        console.log(`Deteniendo sub-bot ${client.user.tag} (ID: ${subBotId})...`);
        await client.destroy(); // Destruye la conexión del cliente con Discord
        delete subBots[subBotId]; // Elimina la instancia de la memoria
        console.log(`Sub-bot ${subBotId} detenido.`);
        return true;
    }
    return false; // El sub-bot no estaba corriendo
};

module.exports = {
    // Carga los sub-bots desde el archivo
    loadSubBots: () => loadSubBotsData(),

    // Añade un nuevo sub-bot a la configuración y lo guarda
    addSubBot: (id, token) => {
        const existing = subBotData.find(sb => sb.id === id);
        if (existing) {
            existing.token = token; // Actualiza el token si el ID ya existe
        } else {
            subBotData.push({ id, token });
        }
        saveSubBotsData();
    },

    // Elimina un sub-bot de la configuración y lo guarda
    removeSubBot: (id) => {
        const initialLength = subBotData.length;
        subBotData = subBotData.filter(sb => sb.id !== id);
        if (subBotData.length < initialLength) {
            saveSubBotsData();
            return true; // Se eliminó exitosamente
        }
        return false; // No se encontró el sub-bot con ese ID
    },

    // Obtiene una lista de todos los sub-bots configurados
    getSubBots: () => subBotData,

    // Obtiene una lista de los sub-bots que actualmente están en línea
    getRunningSubBots: () => Object.values(subBots),

    // Inicia todos los sub-bots configurados
    startAllSubBots: async (mainCommands) => {
        loadSubBotsData(); // Asegura que se carguen los datos más recientes
        console.log(`Iniciando ${subBotData.length} sub-bots configurados...`);
        for (const entry of subBotData) {
            const error = await startSubBot(entry, mainCommands); // Iniciar secuencialmente para evitar problemas
            if (error) {
                console.error(error);
            }
        }
        console.log('Intento de inicio de todos los sub-bots completado.');
    },

    // Detiene todos los sub-bots que están actualmente en línea
    stopAllSubBots: async () => {
        console.log('Deteniendo todos los sub-bots activos...');
        const runningIds = Object.keys(subBots);
        for (const id of runningIds) {
            await stopSubBot(id);
        }
        subBots = {}; // Limpia las instancias de cliente activas
        console.log('Todos los sub-bots activos han sido detenidos.');
    },

    // Función para iniciar un sub-bot directamente (usado por el comando /jad add)
    startSpecificSubBot: startSubBot,
    // Función para detener un sub-bot directamente (usado por el comando /jad remove)
    stopSpecificSubBot: stopSubBot
};