# readChat Skill Documentation

## Overview

The `readChat` skill allows AI agents to read recent chat messages from the Minecraft server. This is essential for understanding player communication, monitoring server events, and responding to in-game activities.

## Features

- **Comprehensive Message Tracking**: Captures all types of messages the bot can see
- **Persistent History**: Maintains chat history throughout the bot's session
- **Flexible Filtering**: Filter messages by type, time, or username
- **Formatted Output**: Returns messages in a readable, timestamped format
- **Memory Efficient**: Automatically trims old messages to prevent memory issues

## Message Types

The skill tracks the following message types:

1. **chat** - Regular player chat messages
2. **whisper** - Private messages sent to the bot
3. **system** - Server announcements, join/leave messages, achievements, etc.
4. **actionbar** - Messages displayed in the action bar (above hotbar)
5. **title** - Large title text displayed in the center of the screen

## Parameters

All parameters are optional:

- **count** (number): Number of recent messages to return
  - Default: 20
  - Maximum: 100

- **timeLimit** (number): Only return messages from the last N seconds
  - Example: `60` returns messages from the last minute
  - If not specified, returns messages regardless of age

- **filterType** (string): Filter by message type
  - Options: `'all'`, `'chat'`, `'whisper'`, `'system'`, `'actionbar'`, `'title'`
  - Default: `'all'`

- **filterUsername** (string): Filter messages by specific username
  - Case-insensitive
  - Only applies to chat and whisper messages

## Output Format

Messages are returned in the following format:

```
=== Chat History ===
Showing 20 messages
Filtered by type: chat
==================
[10:23:45 AM] <Player1>: Hello everyone!
[10:23:52 AM] <Player2>: Hey there!
[10:24:03 AM] [System] Player3 joined the game
[10:24:15 AM] <Player3>: Hi all!
[10:24:30 AM] [Whisper] <Player1>: Can you help me build?
```

## Usage Examples

### Read Recent Messages (Default)

```javascript
await client.callTool('readChat', {});
```

Returns the last 20 messages of all types.

### Read More Messages

```javascript
await client.callTool('readChat', {
  count: 50
});
```

Returns the last 50 messages (up to max of 100).

### Filter by Time

```javascript
await client.callTool('readChat', {
  timeLimit: 300  // Last 5 minutes
});
```

Returns all messages from the last 5 minutes.

### Filter by Message Type

```javascript
await client.callTool('readChat', {
  filterType: 'chat'
});
```

Returns only player chat messages.

### Filter by Username

```javascript
await client.callTool('readChat', {
  filterUsername: 'Steve',
  filterType: 'chat'
});
```

Returns only chat messages from the player named "Steve".

### Complex Filter

```javascript
await client.callTool('readChat', {
  count: 30,
  timeLimit: 600,  // Last 10 minutes
  filterType: 'whisper'
});
```

Returns up to 30 whisper messages from the last 10 minutes.

## Implementation Details

### Message Storage

- Messages are stored in memory using a WeakMap keyed by bot instance
- Each bot maintains its own independent chat history
- History is automatically cleaned up when the bot disconnects
- Maximum of 1000 messages are kept to prevent memory issues

### Event Listeners

The skill automatically sets up listeners when first called:

- `chat` event for player messages
- `whisper` event for private messages
- `message` event for system messages (filtered to exclude duplicates)
- `actionBar` event for action bar text
- `title` event for title displays

### Performance Considerations

- Message filtering is done in memory for fast retrieval
- History trimming prevents unbounded memory growth
- WeakMap ensures proper garbage collection of disconnected bots

## Use Cases

1. **Conversation Monitoring**: Keep track of player conversations
2. **Command Detection**: Check if players have given the bot commands
3. **Event Monitoring**: Track server events like player joins/leaves
4. **Whisper Response**: Detect and respond to private messages
5. **Activity Logging**: Record server activity for later analysis
6. **Context Building**: Understand recent context before taking actions

## Limitations

- Only captures messages after the bot joins the server
- Cannot see messages from before the skill was first called
- Limited to 1000 messages in history to prevent memory issues
- Cannot capture messages the bot doesn't have permission to see
- Subtitle messages are not currently tracked (not standard in mineflayer)
