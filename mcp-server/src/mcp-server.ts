#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    CallToolRequest,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { program } from 'commander';
import { Bot } from 'mineflayer';
import { createBot as mineflayerCreateBot } from 'mineflayer';
import { loadSkills, SkillRegistry } from './skillRegistry.js';
import { BotManager } from './botManager.js';
import { initializeChatHistory } from './skills/verified/readChat.js';

// Parse command line arguments (now optional)
program
    .option('-p, --port <port>', 'Default Minecraft server port')
    .option('-h, --host <host>', 'Default Minecraft server host')
    .parse(process.argv);

const options = program.opts();

// Initialize the MCP server
const server = new Server(
    {
        name: "fl-minecraft",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

// Bot manager to handle multiple bot instances
const botManager = new BotManager();

// Skill registry to manage available skills
const skillRegistry = new SkillRegistry();

// Initialize skills
async function initializeSkills() {
    const skills = await loadSkills();
    for (const skill of skills) {
        skillRegistry.registerSkill(skill);
    }
}

// List all available tools (joinGame + all skills)
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = [
        {
            name: "joinGame",
            description: "Spawn a bot into the Minecraft game",
            inputSchema: {
                type: "object",
                properties: {
                    username: {
                        type: "string",
                        description: "The username for the bot"
                    },
                    host: {
                        type: "string",
                        description: "Minecraft server host (defaults to 'localhost' or command line option)"
                    },
                    port: {
                        type: "number",
                        description: "Minecraft server port (defaults to 25565 or command line option)"
                    }
                },
                required: ["username"]
            }
        },
        {
            name: "leaveGame",
            description: "Disconnect a bot from the game",
            inputSchema: {
                type: "object",
                properties: {
                    username: {
                        type: "string",
                        description: "The username of the bot to disconnect"
                    },
                    disconnectAll: {
                        type: "boolean",
                        description: "If true, disconnect all bots and close all connections"
                    }
                }
            }
        }
    ];

    // Add all registered skills as tools
    const skillTools = skillRegistry.getAllSkills().map(skill => ({
        name: skill.name,
        description: skill.description,
        inputSchema: skill.inputSchema
    }));

    return { tools: [...tools, ...skillTools] };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    // Handle joinGame tool
    if (name === "joinGame") {
        try {
            const { username, host, port } = args as { username: string; host?: string; port?: number };

            // Use provided values, fall back to command line options, then defaults
            const serverHost = host || options.host || 'localhost';
            const serverPort = port || (options.port ? parseInt(options.port) : 25565);

            console.error(`[MCP] Attempting to spawn bot '${username}' on ${serverHost}:${serverPort}`);

            // Create a new bot
            const bot = mineflayerCreateBot({
                host: serverHost,
                port: serverPort,
                username: username
                // Auto-detect version by not specifying it
            }) as any; // Type assertion to allow adding custom properties

            // Dynamically import and load plugins
            const [pathfinderModule, pvpModule, toolModule, collectBlockModule] = await Promise.all([
                import('mineflayer-pathfinder'),
                import('mineflayer-pvp'),
                import('mineflayer-tool'),
                import('mineflayer-collectblock')
            ]);

            // Load plugins
            bot.loadPlugin(pathfinderModule.pathfinder);
            bot.loadPlugin(pvpModule.plugin);
            bot.loadPlugin(toolModule.plugin);
            bot.loadPlugin(collectBlockModule.plugin);

            // Add Movements constructor to bot for skills that create movement configurations
            bot.Movements = pathfinderModule.Movements;

            // Add a logger to the bot
            bot.logger = {
                info: (message: string) => {
                    const timestamp = new Date().toISOString();
                    console.error(`[${username}] ${timestamp} : ${message}`);
                },
                error: (message: string) => {
                    const timestamp = new Date().toISOString();
                    console.error(`[${username}] ${timestamp} : ERROR: ${message}`);
                },
                warn: (message: string) => {
                    const timestamp = new Date().toISOString();
                    console.error(`[${username}] ${timestamp} : WARN: ${message}`);
                },
                debug: (message: string) => {
                    const timestamp = new Date().toISOString();
                    console.error(`[${username}] ${timestamp} : DEBUG: ${message}`);
                }
            };

            // Register the bot
            const botId = botManager.addBot(username, bot);

            // Wait for spawn
            await new Promise<void>((resolve, reject) => {
                bot.once('spawn', () => {
                    console.error(`[MCP] Bot ${username} spawned, initializing additional properties...`);

                    // Initialize properties that skills expect
                    bot.exploreChunkSize = 16; // INTERNAL_MAP_CHUNK_SIZE
                    bot.knownChunks = bot.knownChunks || {};
                    bot.currentSkillCode = '';
                    bot.currentSkillData = {};

                    // Set constants that skills use
                    bot.nearbyBlockXZRange = 20; // NEARBY_BLOCK_XZ_RANGE
                    bot.nearbyBlockYRange = 10; // NEARBY_BLOCK_Y_RANGE
                    bot.nearbyPlayerRadius = 10; // NEARBY_PLAYER_RADIUS
                    bot.hearingRadius = 30; // HEARING_RADIUS
                    bot.nearbyEntityRadius = 10; // NEARBY_ENTITY_RADIUS

                    // Initialize chat history tracking
                    initializeChatHistory(bot);

                    resolve();
                });
                bot.once('error', (err: Error) => reject(err));
                bot.once('kicked', (reason: string) => reject(new Error(`Bot kicked: ${reason}`)));
            });

            return {
                content: [{
                    type: "text",
                    text: `Bot '${username}' successfully joined the game on ${serverHost}:${serverPort}. Bot ID: ${botId}`
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to join game: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            };
        }
    }

    // Handle leaveGame tool
    if (name === "leaveGame") {
        try {
            const { username, disconnectAll } = args as { username?: string; disconnectAll?: boolean };

            if (disconnectAll) {
                const count = botManager.getBotCount();
                botManager.disconnectAll();
                return {
                    content: [{
                        type: "text",
                        text: `Disconnected all ${count} bot(s) from the game.`
                    }]
                };
            }

            if (!username) {
                throw new Error("Either 'username' or 'disconnectAll' must be specified");
            }

            const bot = botManager.getBotByUsername(username);
            if (!bot) {
                throw new Error(`No bot found with username '${username}'`);
            }

            botManager.removeBot(username);

            return {
                content: [{
                    type: "text",
                    text: `Bot '${username}' has been disconnected from the game.`
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to leave game: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            };
        }
    }

    // Handle skill tools
    const skill = skillRegistry.getSkill(name);
    if (skill) {
        try {
            // Get the active bot (for now, we'll use the most recently created bot)
            const bot = botManager.getActiveBot();
            if (!bot) {
                throw new Error("No active bot. Please use 'joinGame' first to spawn a bot.");
            }

            // Execute the skill
            const result = await skill.execute(bot, args);

            return {
                content: [{
                    type: "text",
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Skill execution failed: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            };
        }
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

// Initialize and start the server
async function main() {
    const defaultHost = options.host || 'localhost';
    const defaultPort = options.port || '25565';

    console.error(`Starting MCP server for Minecraft`);
    console.error(`Default connection: ${defaultHost}:${defaultPort} (can be overridden per bot)`);

    // Initialize skills
    await initializeSkills();
    console.error(`Loaded ${skillRegistry.getAllSkills().length} skills`);

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("MCP server running on stdio transport");
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.error("Shutting down...");
    botManager.disconnectAll();
    process.exit(0);
});

main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
}); 