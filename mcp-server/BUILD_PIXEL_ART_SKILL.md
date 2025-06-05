# buildPixelArt Skill Documentation

## Overview

The `buildPixelArt` skill allows AI agents to create pixel art in Minecraft from any image. This skill converts images into Minecraft blocks by mapping colors to the closest matching block types.

## Requirements

- The bot must have operator permissions (cheats enabled) on the server
- Maximum pixel art size is 256x256 blocks
- The skill supports both local image files and URLs

## Installation

Before using this skill, you need to install the required dependencies:

```bash
cd mcp-server
npm install
npm run build
```

## Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `imagePath` | string | Path or URL to the image file | Yes |
| `width` | number | Width of the pixel art in blocks (max 256) | Yes |
| `height` | number | Height of the pixel art in blocks (max 256) | Yes |
| `x` | number | X coordinate for the bottom middle of the pixel art | Yes |
| `y` | number | Y coordinate for the bottom of the pixel art | Yes |
| `z` | number | Z coordinate for the bottom middle of the pixel art | Yes |
| `facing` | string | Direction the pixel art faces: 'north', 'south', 'east', or 'west' | No (default: 'north') |

## Usage Examples

### Basic Example - Local Image

```javascript
await client.callTool('buildPixelArt', {
    imagePath: '/path/to/image.png',
    width: 64,
    height: 64,
    x: 100,
    y: 64,
    z: 200,
    facing: 'north'
});
```

### Using an Image URL

```javascript
await client.callTool('buildPixelArt', {
    imagePath: 'https://example.com/logo.png',
    width: 128,
    height: 128,
    x: 0,
    y: 70,
    z: 0,
    facing: 'east'
});
```

### Maximum Size Pixel Art

```javascript
await client.callTool('buildPixelArt', {
    imagePath: 'banner.jpg',
    width: 256,
    height: 256,
    x: 500,
    y: 100,
    z: 500,
    facing: 'south'
});
```

## How It Works

1. **Image Loading**: The skill loads the image from a file path or URL using the Jimp library
2. **Resizing**: The image is resized to the specified dimensions (width × height)
3. **Color Mapping**: Each pixel's RGB color is mapped to the closest Minecraft block color
4. **Building**: Blocks are placed using `/setblock` commands, building from bottom to top

## Supported Block Colors

The skill uses a variety of Minecraft blocks to match colors:

### Grayscale

- White: `white_concrete`, `white_wool`
- Light Gray: `light_gray_concrete`, `light_gray_wool`
- Gray: `gray_concrete`, `gray_wool`
- Black: `black_concrete`, `black_wool`

### Colors

- Red: `red_concrete`, `red_wool`, `red_terracotta`
- Orange: `orange_concrete`, `orange_wool`
- Yellow: `yellow_concrete`, `yellow_wool`, `yellow_terracotta`
- Green: `lime_concrete`, `green_concrete`, `green_wool`
- Blue: `light_blue_concrete`, `blue_concrete`, `blue_wool`
- Purple: `purple_concrete`, `purple_wool`, `magenta_concrete`
- Brown: `brown_concrete`, `brown_wool`, `brown_terracotta`
- Pink: `pink_concrete`, `pink_wool`
- Cyan: `cyan_concrete`, `cyan_wool`

## Facing Directions

The `facing` parameter determines which direction the pixel art faces:

- **north**: Pixel art faces negative Z direction (default)
- **south**: Pixel art faces positive Z direction
- **east**: Pixel art faces positive X direction
- **west**: Pixel art faces negative X direction

## Tips for Best Results

1. **Image Selection**: Choose images with clear colors and good contrast
2. **Size Considerations**: Smaller pixel art (32x32 to 64x64) often looks better than large ones
3. **Transparent Pixels**: Transparent pixels (alpha < 128) are skipped, allowing for non-rectangular shapes
4. **Performance**: Large pixel art can take time to build. The skill provides progress updates every 10%
5. **Color Accuracy**: The skill uses a simple RGB distance algorithm. Complex gradients may not translate perfectly

## Error Handling

The skill will fail if:

- Cheats are not enabled on the server
- The image cannot be loaded
- The bot loses connection during building
- Invalid parameters are provided

## Example: Building a Minecraft Logo

```javascript
// Build a 64x64 Minecraft logo facing north
await client.callTool('buildPixelArt', {
    imagePath: 'https://example.com/minecraft-logo.png',
    width: 64,
    height: 64,
    x: 0,
    y: 80,
    z: 0,
    facing: 'north'
});
```

This will create a vertical pixel art of the Minecraft logo, 64 blocks wide and 64 blocks tall, centered at coordinates (0, 80, 0) and facing north.
