import { Bot } from 'mineflayer';
import { BotWithLogger } from './types.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface SkillDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
    execute: (bot: BotWithLogger, args: any) => Promise<any>;
}

export class SkillRegistry {
    private skills: Map<string, SkillDefinition> = new Map();

    registerSkill(skill: SkillDefinition): void {
        this.skills.set(skill.name, skill);
    }

    getSkill(name: string): SkillDefinition | undefined {
        return this.skills.get(name);
    }

    getAllSkills(): SkillDefinition[] {
        return Array.from(this.skills.values());
    }
}

// Map of skill names to their descriptions and parameter schemas
const SKILL_METADATA: Record<string, { description: string; params: Record<string, any>; required: string[] }> = {
    attackSomeone: {
        description: "Attack, kill, defend against, or initiate combat with someone",
        params: {
            targetType: { type: "string", description: "The type of target: 'player', 'mob', or 'animal'" },
            targetName: { type: "string", description: "Optional: The specific name of the entity to attack" },
            duration: { type: "number", description: "Optional: Duration in seconds to attack (default: 20, max: 120)" },
            count: { type: "number", description: "Optional: Number of kills to achieve (default: 1)" }
        },
        required: ["targetType"]
    },
    cookItem: {
        description: "Cook an item in a furnace",
        params: {
            itemName: { type: "string", description: "The name of the item to cook" },
            fuelName: { type: "string", description: "The fuel to use for cooking" },
            count: { type: "number", description: "Number of items to cook" }
        },
        required: ["itemName", "fuelName", "count"]
    },
    craftItems: {
        description: "Craft items using a crafting table or inventory",
        params: {
            item: { type: "string", description: "The name of the item to craft" },
            count: { type: "number", description: "Number of items to craft" }
        },
        required: ["item", "count"]
    },
    dance: {
        description: "Make the bot dance by moving and jumping",
        params: {
            time: { type: "number", description: "Duration to dance in seconds (default: 10)" },
            name: { type: "string", description: "Optional: Name of the dance move" }
        },
        required: []
    },
    dropItem: {
        description: "Drop items from inventory",
        params: {
            name: { type: "string", description: "Name of the item to drop" },
            count: { type: "number", description: "Optional: Number of items to drop (default: all)" },
            userName: { type: "string", description: "Optional: Drop near a specific player" }
        },
        required: ["name"]
    },
    eatFood: {
        description: "Eat food from inventory to restore hunger",
        params: {},
        required: []
    },
    equipItem: {
        description: "Equip an item (armor, tool, or weapon)",
        params: {
            name: { type: "string", description: "Name of the item to equip" }
        },
        required: ["name"]
    },
    giveItemToSomeone: {
        description: "Give items to another player",
        params: {
            userName: { type: "string", description: "Username of the player to give items to" },
            itemName: { type: "string", description: "Name of the item to give" },
            itemCount: { type: "number", description: "Number of items to give" }
        },
        required: ["userName", "itemName", "itemCount"]
    },
    goToKnownLocation: {
        description: "Navigate to specific coordinates",
        params: {
            x: { type: "number", description: "X coordinate" },
            y: { type: "number", description: "Y coordinate" },
            z: { type: "number", description: "Z coordinate" },
            name: { type: "string", description: "Optional: Name of the location" }
        },
        required: ["x", "y", "z"]
    },
    goToSomeone: {
        description: "Navigate to another player",
        params: {
            userName: { type: "string", description: "Username of the player to go to" },
            distance: { type: "number", description: "Distance to maintain from the player (default: 3)" },
            keepFollowing: { type: "boolean", description: "Continue following the player (default: false)" }
        },
        required: ["userName"]
    },
    harvestMatureCrops: {
        description: "Harvest mature crops from nearby farmland",
        params: {
            number: { type: "number", description: "Number of crops to harvest" },
            radius: { type: "number", description: "Search radius (default: 30)" }
        },
        required: []
    },
    hunt: {
        description: "Hunt animals or mobs",
        params: {
            targetType: { type: "string", description: "Type of target: 'animal' or 'mob'" },
            targetName: { type: "string", description: "Optional: Specific name of the target" },
            amount: { type: "number", description: "Number to hunt (default: 1)" },
            duration: { type: "number", description: "Max duration in seconds (default: 60)" }
        },
        required: ["targetType"]
    },
    mineResource: {
        description: "Mine specific blocks or resources",
        params: {
            name: { type: "string", description: "Name of the block/resource to mine" },
            count: { type: "number", description: "Number of blocks to mine" }
        },
        required: ["name", "count"]
    },
    openInventory: {
        description: "Open the bot's inventory",
        params: {},
        required: []
    },
    openNearbyChest: {
        description: "Open a nearby chest",
        params: {},
        required: []
    },
    pickupItem: {
        description: "Pick up items from the ground",
        params: {
            itemName: { type: "string", description: "Name of the item to pick up" }
        },
        required: ["itemName"]
    },
    placeItemNearYou: {
        description: "Place a block or item near the bot",
        params: {
            itemName: { type: "string", description: "Name of the item/block to place" },
            userName: { type: "string", description: "Optional: Place near a specific player" }
        },
        required: ["itemName"]
    },
    prepareLandForFarming: {
        description: "Prepare land for farming by tilling soil",
        params: {},
        required: []
    },
    rest: {
        description: "Rest to regain health",
        params: {
            restTime: { type: "number", description: "Time to rest in seconds (default: 10)" }
        },
        required: []
    },
    retrieveItemsFromNearbyFurnace: {
        description: "Retrieve smelted items from a nearby furnace",
        params: {},
        required: []
    },
    runAway: {
        description: "Run away from a threat",
        params: {
            targetType: { type: "string", description: "Type of threat: 'player', 'mob', or 'animal'" },
            targetName: { type: "string", description: "Optional: Specific name of the threat" },
            runDistance: { type: "number", description: "Distance to run away (default: 20)" }
        },
        required: ["targetType"]
    },
    sleepInNearbyBed: {
        description: "Find and sleep in a nearby bed",
        params: {
            maxDistance: { type: "number", description: "Maximum distance to search for bed (default: 30)" }
        },
        required: []
    },
    smeltItem: {
        description: "Smelt items in a furnace",
        params: {
            itemName: { type: "string", description: "Name of the item to smelt" },
            fuelName: { type: "string", description: "Name of the fuel to use" },
            count: { type: "number", description: "Number of items to smelt" }
        },
        required: ["itemName", "fuelName", "count"]
    },
    swimToLand: {
        description: "Swim to the nearest land when in water",
        params: {},
        required: []
    },
    useItemOnBlockOrEntity: {
        description: "Use an item on a block or entity",
        params: {
            item: { type: "string", description: "Name of the item to use" },
            target: { type: "string", description: "Target block or entity" },
            count: { type: "number", description: "Optional: Number of times to use (default: 1)" }
        },
        required: ["item", "target"]
    },
    lookAround: {
        description: "Look around and observe the environment, providing a detailed text-based view of surroundings",
        params: {},
        required: []
    },
    buildSomething: {
        description: "Build structures using Minecraft commands (requires cheats/operator permissions). Supports two modes: 1) buildScript - array of command objects like [{\"command\": \"fill\", \"x1\": 0, \"y1\": 64, \"z1\": 0, \"x2\": 10, \"y2\": 70, \"z2\": 10, \"block\": \"stone\"}], 2) code - JavaScript string for dynamic building like \"for(let i = 0; i < 10; i++) { setBlock(pos.x + i, pos.y, pos.z, 'stone'); }\"",
        params: {
            buildScript: {
                type: "array",
                description: "Array of build commands. Supported commands: setblock (place single block), fill (fill region), clone (copy region), summon (spawn entities), give (give items), raw (execute raw command). Each command is an object with command type and parameters."
            },
            code: {
                type: "string",
                description: "JavaScript code string for dynamic building. Available functions: setBlock(x,y,z,block), fill(x1,y1,z1,x2,y2,z2,block,mode?), clone(x1,y1,z1,x2,y2,z2,dx,dy,dz,mode?), summon(entity,x?,y?,z?), give(item,count?), execute(command), wait(ticks), log(message). Variables: bot, pos (bot position), Math, shouldStop()."
            }
        },
        required: [] // Neither is required, but one must be provided (checked in skill)
    }
};

export async function loadSkills(): Promise<SkillDefinition[]> {
    const skills: SkillDefinition[] = [];

    for (const [skillName, metadata] of Object.entries(SKILL_METADATA)) {
        skills.push({
            name: skillName,
            description: metadata.description,
            inputSchema: {
                type: "object",
                properties: metadata.params,
                required: metadata.required
            },
            execute: createSkillExecutor(skillName)
        });
    }

    return skills;
}

// Create a skill executor that loads and runs the actual skill code
function createSkillExecutor(skillName: string) {
    return async (bot: BotWithLogger, args: any): Promise<any> => {
        console.error(`[MCP] Executing skill '${skillName}' with args:`, args);

        try {
            // Path to the compiled skill bundled with the MCP server
            // __dirname is at: mcp-server/dist
            // Skills are at: mcp-server/dist/skills/verified
            const skillModulePath = join(__dirname, 'skills', 'verified', `${skillName}.js`);
            console.error(`[MCP] Loading skill from: ${skillModulePath}`);

            // Check if the skill file exists
            if (!existsSync(skillModulePath)) {
                throw new Error(
                    `Skill implementation not found at ${skillModulePath}. ` +
                    `Please ensure the MCP server was built correctly with 'npm run build'.`
                );
            }

            const skillModule = await import(skillModulePath);
            console.error(`[MCP] Skill module loaded successfully`);

            // Get the skill function
            const skillFunction = skillModule[skillName] || skillModule.default;
            if (!skillFunction) {
                throw new Error(`Skill function '${skillName}' not found in module`);
            }

            // Create service parameters with necessary functions
            const abortController = new AbortController();
            const serviceParams = {
                signal: abortController.signal,
                cancelExecution: () => {
                    console.error(`[MCP] Skill '${skillName}' execution cancelled`);
                    abortController.abort();
                },
                resetTimeout: () => {
                    console.error(`[MCP] Skill '${skillName}' timeout reset`);
                },
                getStatsData: () => {
                    console.error(`[MCP] Skill '${skillName}' requested stats data`);
                    return {};
                },
                setStatsData: (data: any) => {
                    console.error(`[MCP] Skill '${skillName}' set stats data:`, data);
                }
            };

            // Execute the skill with simple parameters (skills now expect plain objects)
            console.error(`[MCP] Calling skill function with args:`, args);
            const result = await skillFunction(bot, args, serviceParams);
            console.error(`[MCP] Skill '${skillName}' returned:`, result);

            // Listen for bot events to capture skill feedback
            const observations: string[] = [];
            const observationHandler = (message: string) => {
                console.error(`[MCP] Bot observation: ${message}`);
                observations.push(message);
            };

            // Use type assertion to handle custom event
            (bot as any).on('alteraBotEndObservation', observationHandler);

            // Remove the event listener after a short delay to capture any final messages
            setTimeout(() => {
                (bot as any).removeListener('alteraBotEndObservation', observationHandler);
            }, 100);

            // Return the observations if any, otherwise a success message
            if (observations.length > 0) {
                return observations.join('\n');
            }
            return result ? `Skill '${skillName}' executed successfully` : `Skill '${skillName}' failed`;
        } catch (error) {
            console.error(`[MCP] Error executing skill '${skillName}':`, error);
            throw new Error(`Failed to execute skill '${skillName}': ${error instanceof Error ? error.message : String(error)}`);
        }
    };
} 