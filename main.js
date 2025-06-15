const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
// Importa el módulo 'fs' (file system) para leer archivos
const fs = require('node:fs');
// Importa el módulo 'path' para trabajar con rutas de archivos
const path = require('node:path');
// Importa la configuración del bot
const config = require('./config.js');
// Importa el nuevo sistema de gestión de sub-bots
const subBotManager = require('./systems/subBotManager.js');
const systemStateManager = require('./systems/systemStateManager.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildPresences,
    ],
});

client.config = config;

client.commands = new Collection();
const commandsForDeploy = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsForDeploy.push(command.data.toJSON());
    } else {
        console.warn(`[ADVERTENCIA] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`);
    }
}

const systemsPath = path.join(__dirname, 'systems');
const systemFiles = fs.readdirSync(systemsPath).filter(file => file.endsWith('.js') && file !== 'subBotManager.js'); // Excluir subBotManager aquí, ya se importó arriba

for (const file of systemFiles) {
    const filePath = path.join(systemsPath, file);
    const system = require(filePath);
    console.log(`Sistema cargado: ${file}`);
}


client.once('ready', async () => {
    console.log(`¡Slim Shaidy está en línea! Logueado como ${client.user.tag}`);

    client.user.setActivity(`${client.guilds.cache.size} servidores`, { type: 3 }); // 3 = Watching

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log(`Iniciando el refresco de ${commandsForDeploy.length} comandos de aplicación (/).`);

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commandsForDeploy },
        );
		
        if (config.guildId) {
            const data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commandsForDeploy },
            );
            console.log(`Recargados ${data.length} comandos de aplicación (/) específicos del servidor ${config.guildId}.`);
        } else {
            const data = await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commandsForDeploy },
            );
            console.log(`Recargados ${data.length} comandos de aplicación (/) globalmente. La propagación puede tardar hasta 1 hora.`);
        }


    } catch (error) {
        console.error('Error al desplegar comandos de aplicación:', error);
    }

    await subBotManager.startAllSubBots(client.commands);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error al ejecutar este comando. ¡Lo siento!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando. ¡Lo siento!', ephemeral: true });
        }
    }
});

const welcomeSystem = require('./systems/welcome.js');
const farewellSystem = require('./systems/farewell.js');
const boostSystem = require('./systems/boost.js');

client.on('guildMemberAdd', member => welcomeSystem.execute(member, client, systemStateManager));
client.on('guildMemberRemove', member => farewellSystem.execute(member, client, systemStateManager));
client.on('guildMemberUpdate', (oldMember, newMember) => boostSystem.execute(oldMember, newMember, client, systemStateManager));

const shutdown = async () => {
    console.log('Detectada señal de apagado. Deteniendo sub-bots...');
    await subBotManager.stopAllSubBots();
    console.log('Todos los sub-bots detenidos. Cerrando bot principal.');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

client.login(config.token);
