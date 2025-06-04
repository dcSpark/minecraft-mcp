# buildSomething Skill Documentation

## Overview

The `buildSomething` skill allows AI agents to create complex structures in Minecraft using server commands. This skill requires the bot to have operator permissions (cheats enabled) on the server.

## Features

- **Command-based Building**: Uses Minecraft's built-in commands for efficient building
- **Dynamic JavaScript Execution**: Write loops, conditions, and complex logic for building
- **Automatic Cheat Detection**: Checks if the bot has permissions before attempting to build
- **Multiple Command Types**: Supports setblock, fill, clone, summon, give, and raw commands
- **Batch Execution**: Executes multiple commands in sequence with proper error handling
- **Progress Reporting**: Provides detailed feedback on each command's success or failure

## Usage Modes

The skill supports two modes of operation:

### 1. Build Script Mode (JSON Array)

Pass a `buildScript` parameter with an array of command objects. Each command is executed in sequence.

### 2. Code Mode (JavaScript String)

Pass a `code` parameter with JavaScript code as a string. This allows for dynamic building with loops, conditions, and calculations based on the bot's position.

## Build Script Format

### Supported Commands

#### 1. setblock

Place a single block at specific coordinates.

```json
{
  "command": "setblock",
  "x": 100,
  "y": 64,
  "z": 200,
  "block": "stone"
}
```

#### 2. fill

Fill a region with blocks.

```json
{
  "command": "fill",
  "x1": 100,
  "y1": 64,
  "z1": 200,
  "x2": 110,
  "y2": 70,
  "z2": 210,
  "block": "oak_planks",
  "mode": "replace"  // optional: replace, destroy, hollow, outline, keep
}
```

#### 3. clone

Copy a region to another location.

```json
{
  "command": "clone",
  "x1": 100,
  "y1": 64,
  "z1": 200,
  "x2": 110,
  "y2": 70,
  "z2": 210,
  "dx": 120,
  "dy": 64,
  "dz": 200,
  "mode": "replace"  // optional: replace, masked, filtered
}
```

#### 4. summon

Summon entities at specified coordinates.

```json
{
  "command": "summon",
  "entity": "chicken",
  "x": 100,  // optional
  "y": 64,   // optional
  "z": 200   // optional
}
```

#### 5. give

Give items to the bot.

```json
{
  "command": "give",
  "item": "diamond",
  "count": 64
}
```

#### 6. raw

Execute any raw Minecraft command.

```json
{
  "command": "raw",
  "raw": "/weather clear"
}
```

## Code Mode Functions

When using the `code` parameter, the following functions and variables are available:

### Available Functions

- `setBlock(x, y, z, block)` - Place a block at coordinates
- `fill(x1, y1, z1, x2, y2, z2, block, mode?)` - Fill a region with blocks
- `clone(x1, y1, z1, x2, y2, z2, dx, dy, dz, mode?)` - Clone a region
- `summon(entity, x?, y?, z?)` - Summon an entity
- `give(item, count?)` - Give items to the bot
- `execute(command)` - Execute any raw command
- `wait(ticks)` - Wait for a number of game ticks (async)
- `log(message)` - Send a message to the bot's observation log
- `shouldStop()` - Check if the build should be aborted

### Available Variables

- `bot` - The Mineflayer bot instance
- `pos` - The bot's current position (with x, y, z properties)
- `Math` - JavaScript Math object for calculations

## Example Usage

### Build Script Mode - Simple House

```javascript
await client.callTool('buildSomething', {
  buildScript: [
    // Foundation
    { command: "fill", x1: 0, y1: 63, z1: 0, x2: 10, y2: 63, z2: 10, block: "stone" },
    
    // Walls
    { command: "fill", x1: 0, y1: 64, z1: 0, x2: 10, y2: 67, z2: 0, block: "oak_planks" },
    { command: "fill", x1: 0, y1: 64, z1: 10, x2: 10, y2: 67, z2: 10, block: "oak_planks" },
    { command: "fill", x1: 0, y1: 64, z1: 0, x2: 0, y2: 67, z2: 10, block: "oak_planks" },
    { command: "fill", x1: 10, y1: 64, z1: 0, x2: 10, y2: 67, z2: 10, block: "oak_planks" },
    
    // Roof
    { command: "fill", x1: 0, y1: 68, z1: 0, x2: 10, y2: 68, z2: 10, block: "oak_slab" },
    
    // Door
    { command: "setblock", x: 5, y: 64, z: 0, block: "oak_door[facing=south,half=lower]" },
    { command: "setblock", x: 5, y: 65, z: 0, block: "oak_door[facing=south,half=upper]" },
    
    // Windows
    { command: "setblock", x: 2, y: 65, z: 0, block: "glass_pane" },
    { command: "setblock", x: 8, y: 65, z: 0, block: "glass_pane" }
  ]
});
```

### Code Mode - Dynamic Spiral Tower

```javascript
await client.callTool('buildSomething', {
  code: `
    // Build a spiral tower around the bot's current position
    const centerX = pos.x;
    const centerZ = pos.z;
    const radius = 5;
    const height = 20;
    
    // Create base platform
    fill(centerX - radius, pos.y - 1, centerZ - radius, 
         centerX + radius, pos.y - 1, centerZ + radius, 'stone');
    
    // Build spiral
    for (let y = 0; y < height; y++) {
      const angle = (y / height) * Math.PI * 4; // 2 full rotations
      const x = Math.round(centerX + radius * Math.cos(angle));
      const z = Math.round(centerZ + radius * Math.sin(angle));
      
      // Place stair block
      setBlock(x, pos.y + y, z, 'stone_brick_stairs[facing=west]');
      
      // Place support pillar every 5 blocks
      if (y % 5 === 0) {
        fill(x, pos.y, z, x, pos.y + y, z, 'stone_bricks');
      }
      
      // Add railing
      if (y > 0) {
        setBlock(x + 1, pos.y + y, z, 'iron_bars');
        setBlock(x - 1, pos.y + y, z, 'iron_bars');
        setBlock(x, pos.y + y, z + 1, 'iron_bars');
        setBlock(x, pos.y + y, z - 1, 'iron_bars');
      }
      
      // Log progress
      if (y % 5 === 0) {
        log(\`Building spiral: \${y}/\${height} blocks high\`);
      }
      
      // Check if we should stop
      if (shouldStop()) {
        log('Build cancelled by user');
        break;
      }
      
      // Small delay to not overwhelm the server
      await wait(1);
    }
    
    // Add platform at top
    fill(centerX - 3, pos.y + height, centerZ - 3,
         centerX + 3, pos.y + height, centerZ + 3, 'stone_slabs');
    
    log('Spiral tower complete!');
  `
});
```

### Code Mode - Pattern Generator

```javascript
await client.callTool('buildSomething', {
  code: `
    // Create a checkerboard pattern floor
    const size = 20;
    const startX = Math.floor(pos.x - size/2);
    const startZ = Math.floor(pos.z - size/2);
    const y = pos.y - 1;
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const block = (x + z) % 2 === 0 ? 'white_wool' : 'black_wool';
        setBlock(startX + x, y, startZ + z, block);
      }
      
      // Check for cancellation every row
      if (shouldStop()) return;
    }
    
    log(\`Created \${size}x\${size} checkerboard pattern\`);
  `
});
```

### Code Mode - Conditional Building

```javascript
await client.callTool('buildSomething', {
  code: `
    // Build different structures based on time of day
    const timeOfDay = bot.time.timeOfDay;
    
    if (timeOfDay < 6000 || timeOfDay > 18000) {
      // Night time - build a shelter
      log('Night detected, building emergency shelter');
      
      // Walls
      fill(pos.x - 2, pos.y, pos.z - 2, pos.x + 2, pos.y + 3, pos.z + 2, 'cobblestone', 'hollow');
      
      // Roof
      fill(pos.x - 2, pos.y + 4, pos.z - 2, pos.x + 2, pos.y + 4, pos.z + 2, 'oak_planks');
      
      // Door
      setBlock(pos.x, pos.y, pos.z - 2, 'oak_door[facing=south,half=lower]');
      setBlock(pos.x, pos.y + 1, pos.z - 2, 'oak_door[facing=south,half=upper]');
      
      // Torches
      setBlock(pos.x - 1, pos.y + 2, pos.z - 1, 'torch');
      setBlock(pos.x + 1, pos.y + 2, pos.z + 1, 'torch');
      
      // Bed
      setBlock(pos.x, pos.y, pos.z + 1, 'red_bed[facing=north,part=foot]');
      setBlock(pos.x, pos.y, pos.z, 'red_bed[facing=north,part=head]');
      
    } else {
      // Day time - build a garden
      log('Day detected, building garden');
      
      // Clear area
      fill(pos.x - 5, pos.y, pos.z - 5, pos.x + 5, pos.y, pos.z + 5, 'grass_block');
      
      // Plant flowers in a pattern
      const flowers = ['dandelion', 'poppy', 'blue_orchid', 'allium', 'azure_bluet'];
      
      for (let r = 1; r <= 4; r++) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
          const x = Math.round(pos.x + r * Math.cos(angle));
          const z = Math.round(pos.z + r * Math.sin(angle));
          const flower = flowers[Math.floor(Math.random() * flowers.length)];
          setBlock(x, pos.y + 1, z, flower);
        }
      }
      
      // Central fountain
      setBlock(pos.x, pos.y, pos.z, 'water');
      fill(pos.x - 1, pos.y - 1, pos.z - 1, pos.x + 1, pos.y - 1, pos.z + 1, 'stone_bricks');
    }
  `
});
```

## Error Handling

The skill includes several error handling mechanisms:

1. **Permission Check**: Automatically tests if the bot has operator permissions
2. **Parameter Validation**: Ensures all required parameters are provided for each command
3. **Individual Command Errors**: Continues execution even if individual commands fail
4. **Progress Reporting**: Reports success/failure for each command
5. **JavaScript Errors**: Catches and reports any JavaScript syntax or runtime errors in code mode

## Limitations

- Requires operator permissions on the server
- Commands are executed via chat, so they're subject to server rate limits
- Large operations may take time due to the delay between commands
- Some servers may have command blocks or certain commands disabled
- JavaScript code execution is sandboxed but still has access to the bot object

## Security Considerations

When using the code mode:

- The JavaScript code runs in the Node.js environment with access to the bot object
- Code is executed using `new Function()` which provides some isolation but is not a complete sandbox
- Only use code from trusted sources
- The bot object provides access to server chat and commands, so malicious code could potentially:
  - Send chat messages
  - Execute any commands the bot has permissions for
  - Access bot inventory and position information
- For maximum security, use the buildScript mode with predefined commands instead of arbitrary code

## Implementation Details

The skill is implemented in `minecraft-client/mcp-server/src/skills/verified/buildSomething.ts` and includes:

- Automatic cheat detection using a harmless teleport command
- Command validation and parameter checking
- Batch execution with progress tracking
- JavaScript code execution with a safe context
- Detailed error messages for debugging
