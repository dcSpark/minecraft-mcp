# Altera/Lyfe Minecraft Client

This library is the Client library for the Minecraft Game. It should be able to run independently, but it also would be provided to our users via the Electron App.
## Dependencies
### cmake
```bash
brew install cmake
```
`cmake` is required for the `mineflayer-viaproxy` package.

## How to Run

```bash
cd minecraft-client
# 1) Set up the npm environments
npm run setup

# There are two ways to run the client
# 2.1) choose to use npm run. Note that you need `--` first, then at least provide a Minecraft server port
npm run start -- -p 25565

# 2.2) use node directly
node ./src/index.js -p 25565
```

## How to build Docker image

```bash
cd minecraft-client
npm run setup
# build a image tagged as tmp and put that into minecraft-client repository
docker build -t minecraft-client:tmp .
```


## Logging
create a .env file in the folder you are running from (either `minecraft-client/` or `minecraft-bot-fe/`).

Add `NODE_ENV="dev"` on one line and `LOG_PATH="[YourLoggingDirectory]"`, 
replacing `[YourLoggingDirectory]` with where you want files to be logged.


## Testing minecraft skills in game.

The following code assumes that you are running everything under `minecraft-client/`.

1. Run the script 
   ```
   npm run test -- -p <port> -h <address> -t <skill instuctions filename>
   ```
   
   Example:
   ```
   npm run test -- -p 60000 -h localhost -t sleepInNearbyBedTest.json
   ```

2. In minecraft chat interface, run specific skill with parameters you choose.

    For example, if you choose skill `sleepInNearbyBed`, here is a way you can trigger the skill.
    ```
    run sleepInNearbyBed(bot, 10)
    ```

Command line arguments:
```
-p (number): The port number from either opening to lan or your local server, default 60000
-h (ip): Defaults to localhost, otherwise is the IP of the server
-t: Run a testing file of the given filename.
```