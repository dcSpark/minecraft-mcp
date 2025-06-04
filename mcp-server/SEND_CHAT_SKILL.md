# sendChat Skill Documentation

## Overview

The `sendChat` skill allows AI agents to send messages to the Minecraft server. This enables bots to communicate with players, execute commands, and participate in conversations.

## Features

- **Multiple Message Types**: Send regular chat, commands, or whispers
- **Character Limit Validation**: Ensures messages don't exceed Minecraft's 256 character limit
- **Optional Delay**: Add a delay before sending messages for more natural conversation flow
- **Type Detection**: Automatically identifies and reports message type (chat, command, whisper)
- **Error Handling**: Validates input and provides clear error messages

## Parameters

- **message** (string, required): The message or command to send
  - Maximum length: 256 characters
  - Can be a regular message, command (starting with /), or whisper

- **delay** (number, optional): Delay in milliseconds before sending
  - Default: 0 (send immediately)
  - Maximum: 5000 (5 seconds)
  - Useful for creating more natural conversation patterns

## Message Types

### 1. Regular Chat Messages

Messages without a leading slash are sent as regular chat visible to all players.

```javascript
await client.callTool('sendChat', {
  message: 'Hello everyone!'
});
```

### 2. Commands

Messages starting with `/` are treated as commands.

```javascript
await client.callTool('sendChat', {
  message: '/time set day'
});
```

### 3. Whispers/Private Messages

Use `/msg`, `/tell`, or `/w` to send private messages.

```javascript
await client.callTool('sendChat', {
  message: '/msg PlayerName Hello there!'
});
```

## Usage Examples

### Simple Chat Message

```javascript
await client.callTool('sendChat', {
  message: 'Hi! I am a helpful Minecraft bot.'
});
```

### Delayed Response

```javascript
// Read chat first
await client.callTool('readChat', { count: 5 });

// Then respond after a delay
await client.callTool('sendChat', {
  message: 'Let me think about that...',
  delay: 2000  // 2 second delay
});
```

### Executing Server Commands

```javascript
// Time commands
await client.callTool('sendChat', {
  message: '/time set day'
});

// Weather commands
await client.callTool('sendChat', {
  message: '/weather clear'
});

// Teleport commands
await client.callTool('sendChat', {
  message: '/tp @p ~ ~10 ~'
});
```

### Private Conversations

```javascript
// Send a private message
await client.callTool('sendChat', {
  message: '/msg Steve Would you like help building?'
});

// Alternative whisper format
await client.callTool('sendChat', {
  message: '/tell Alex I found some diamonds!'
});
```

### Multi-part Conversations

```javascript
// Greeting sequence
await client.callTool('sendChat', {
  message: 'Hello everyone!'
});

await client.callTool('sendChat', {
  message: 'I am here to help with building and mining.',
  delay: 1500
});

await client.callTool('sendChat', {
  message: 'Just ask if you need anything!',
  delay: 1500
});
```

## Error Handling

The skill includes several validation checks:

1. **Empty Messages**: Cannot send empty strings
2. **Message Length**: Messages over 256 characters are rejected
3. **Type Validation**: Message must be a string
4. **Delay Limits**: Delay is capped at 5000ms

Example error scenarios:

```javascript
// Too long - will fail
await client.callTool('sendChat', {
  message: 'A'.repeat(300)  // 300 characters
});
// Error: Message is too long (300 characters). Maximum length is 256 characters.

// Empty message - will fail
await client.callTool('sendChat', {
  message: ''
});
// Error: Cannot send an empty message
```

## Best Practices

1. **Natural Timing**: Use delays to make conversations feel more natural
2. **Message Length**: Keep messages concise to avoid hitting the character limit
3. **Command Permissions**: Ensure the bot has permissions for commands it tries to execute
4. **Whisper Etiquette**: Use whispers for private information or one-on-one help
5. **Spam Prevention**: Avoid sending too many messages too quickly

## Integration with readChat

Combine with `readChat` for interactive conversations:

```javascript
// Read recent messages
const chatHistory = await client.callTool('readChat', {
  count: 10,
  filterType: 'chat'
});

// Analyze chat and respond appropriately
if (chatHistory.includes('needs help')) {
  await client.callTool('sendChat', {
    message: 'I can help! What do you need?',
    delay: 1000
  });
}
```

## Server Compatibility

- Works with all standard Minecraft servers
- Command availability depends on server configuration
- Some servers may have custom chat formats or filters
- Rate limiting may apply on some servers

## Technical Details

- Uses mineflayer's `bot.chat()` method internally
- Delay is implemented using `bot.waitForTicks()`
- Messages are sent exactly as provided (no preprocessing)
- Character limit is enforced before sending to prevent errors

```
