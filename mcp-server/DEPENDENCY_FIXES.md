# Dependency Fixes for Bundled Skills

## Summary

When bundling the skills into the MCP server, several dependency issues were identified and fixed:

## 1. Import Path Extensions

**Issue**: With TypeScript moduleResolution set to 'Node16', all relative imports require explicit `.js` extensions.

**Fix**: Updated all imports in skill files to include `.js` extensions:

- `from '../library/attack'` → `from '../library/attack.js'`
- `from '../index'` → `from '../index.js'`
- `from '../../types/skillType'` → `from '../../types/skillType.js'`

## 2. Custom Bot Properties

**Issue**: Skills expect custom properties on the Bot object that aren't in the standard mineflayer types.

**Fix**: Extended the Bot interface in `src/types.ts` to include:

- `exploreChunkSize`, `knownChunks`, `currentSkillCode`, `currentSkillData`
- Constants: `nearbyBlockXZRange`, `nearbyBlockYRange`, `nearbyPlayerRadius`, `hearingRadius`, `nearbyEntityRadius`
- `Movements` constructor from pathfinder plugin

## 3. Custom Bot Events

**Issue**: Skills emit custom events like `alteraBotEndObservation` that aren't in the standard BotEvents.

**Fix**: Extended the BotEvents interface to include:

- `alteraBotEndObservation`
- `alteraBotTextObservation`
- `alteraBotStartObservation`

## 4. Custom Entity Properties

**Issue**: Some skills check for `isSleeping` property on entities.

**Fix**: Extended the Entity interface to include optional `isSleeping` property.

## 5. Custom Furnace Properties

**Issue**: Furnace-related skills add custom properties to track fuel and progress.

**Fix**: Extended the Furnace interface to include:

- `totalFuel`, `totalFuelSeconds`, `fuelSeconds`
- `totalProgress`, `totalProgressSeconds`, `progressSeconds`

## Build Instructions

After these fixes, the MCP server should build successfully:

```bash
cd mcp-server
npm run build
```

The build script will:

1. Compile all TypeScript files (including bundled skills)
2. Output to the `dist/` directory
3. Make the main script executable

## Verification

To verify the fixes worked:

1. Check that `dist/skills/verified/` contains all 26 compiled skill .js files
2. Check that `dist/skills/library/` contains all helper .js files
3. Run the server with a test skill to ensure imports resolve correctly

## Notes

- All skill imports now use ES module syntax with .js extensions
- The custom type definitions ensure TypeScript recognizes all bot properties
- The bundled structure is completely self-contained within the MCP server package
