"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@atproto/api");
const dotenv = __importStar(require("dotenv"));
const mpdapi = __importStar(require("mpd-api"));
// Load environment variables
dotenv.config();
// Create a Bluesky Agent
const agent = new api_1.BskyAgent({
    service: 'https://bsky.social',
});
// Function to connect to MPD and log the current song
async function logCurrentSong() {
    try {
        // Define connection configuration
        const config = {
            host: "127.0.0.1", // MPD server host
            port: 6600, // MPD server port
            // password: 'yourpassword',  // Uncomment if MPD requires a password
        };
        // Connect to MPD using the config object
        const client = await mpdapi.connect(config);
        console.log("Connected to MPD");
        // Get the playback state and currently playing song
        const status = await client.api.status.get();
        const currentSong = await client.api.status.currentsong();
        // Check if MPD is currently playing something
        if (status.state === "play" && currentSong) {
            const songInfo = {
                title: currentSong.title || "Unknown Title",
                artist: currentSong.artist || "Unknown Artist",
                album: currentSong.album || "Unknown Album",
            };
            const songText = `Now playing: ${songInfo.title} by ${songInfo.artist} from the album ${songInfo.album}`;
            console.log(songText);
            return songText;
        }
        else {
            console.log("No song currently playing.");
            return "No song currently playing.";
        }
        // Disconnect from MPD
        await client.disconnect();
    }
    catch (error) {
        console.error("Error connecting to MPD or retrieving song information:", error);
        return "Error retrieving song info.";
    }
}
// Function to post current song info to Bluesky
async function postToBluesky() {
    try {
        // Login to Bluesky
        await agent.login({
            identifier: process.env.BLUESKY_USERNAME, // Explicitly cast to string
            password: process.env.BLUESKY_PASSWORD, // Explicitly cast to string
        });
        // Get the current song info
        const currentSongText = await logCurrentSong();
        // Post the current song info to Bluesky
        const response = await agent.post({
            text: currentSongText,
        });
        console.log("Successfully posted to Bluesky:", response);
    }
    catch (error) {
        console.error("Error posting to Bluesky:", error);
    }
}
// Run the Bluesky post function
postToBluesky();
