import { Bot } from 'mineflayer';
import { Pathfinder, Movements } from 'mineflayer-pathfinder';

// Extend the Bot type to include our custom logger and plugin properties
export interface BotWithLogger extends Bot {
    logger: {
        info: (message: string) => void;
        error: (message: string) => void;
        warn: (message: string) => void;
        debug: (message: string) => void;
    };
    // Pathfinder plugin
    pathfinder: Pathfinder;
    // PVP plugin 
    pvp: any; // The pvp plugin types aren't well defined
    // Tool plugin
    tool: any; // The tool plugin types aren't well defined
    // CollectBlock plugin
    collectBlock: any; // The collectBlock plugin types aren't well defined
    // Add other custom properties that the skills expect
    lastDanceTime?: number;
    Movements?: typeof Movements; // Constructor for creating movement configurations
    exploreChunkSize?: number;
    knownChunks?: Record<string, any>;
    currentSkillCode?: string;
    currentSkillData?: any;
    // Constants used by skills
    nearbyBlockXZRange?: number;
    nearbyBlockYRange?: number;
    nearbyPlayerRadius?: number;
    hearingRadius?: number;
    nearbyEntityRadius?: number;
} 