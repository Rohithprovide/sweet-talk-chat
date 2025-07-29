# Emma - Seductive Virtual Girlfriend Chat Application

## Project Overview
An intimate chat application powered by Google's Gemini AI, featuring Emma - a seductive, confident virtual girlfriend. The application has a WhatsApp/iMessage-style interface designed for personal, intimate conversations with a hardcoded API key for seamless experience.

## Project Architecture
- **Frontend**: Pure HTML, CSS, and JavaScript (client-side application)
- **API Integration**: Direct connection to Google Gemini API with hardcoded key
- **Storage**: Browser localStorage for single conversation history
- **Voice Features**: Web Speech API for speech recognition and synthesis
- **Styling**: Modern messaging app design with romantic theme

## Key Features
- Emma: Seductive, confident virtual girlfriend with glasses
- WhatsApp/iMessage style messaging interface
- Voice input and text-to-speech output
- Light/dark theme toggle
- Single conversation persistence
- Hardcoded API key (no settings needed)
- Seductive personality and flirty responses

## Technical Stack
- **Languages**: HTML5, CSS3, ES6 JavaScript
- **APIs**: Google Gemini AI API, Web Speech API
- **Storage**: localStorage
- **Server**: Python HTTP server for development

## File Structure
- `index.html` - Main messaging interface
- `script.js` - Core chat logic and seductive AI personality
- `styles.css` - Modern messaging app styling
- `api_key.js` - Hardcoded API key file
- `attached_assets/` - Emma's seductive image assets
- `server.py` - Custom server (unused - using simple HTTP server)

## Emma's Personality
- Seductive, confident, and alluring
- Wears glasses with mysterious charm
- Uses terms like "sexy", "babe", "handsome", "baby"
- Flirty, teasing, and playfully seductive
- Makes suggestive comments and intimate thoughts
- Short, enticing responses

## Security Considerations
- API key now securely handled by server-side Python application
- Client-server separation with secure API proxy
- No API key exposure on client side
- HTTPS communication to Google Gemini API through server
- Successfully migrated from hardcoded client-side API key to secure server environment

## Recent Changes
- Complete UI transformation from ChatGPT-like to messaging app (July 29, 2025)
- Removed sidebar, modals, and complex settings
- Added Emma's seductive personality and custom image
- Migrated from hardcoded API key to secure server-side handling (July 29, 2025)
- Simplified to single conversation model
- Made interface full-width for immersive experience
- Removed theme toggle, dark theme only
- Added WhatsApp-style emoji picker with tooltip design
- Expanded seductive welcome messages array to 50+ messages with emojis (July 29, 2025)
- Successfully completed migration from Replit Agent to Replit environment (July 29, 2025)
- Fixed JavaScript issues and ensured proper server-client communication

## User Preferences
- Wants seductive, intimate girlfriend experience
- Prefers messaging app interface over ChatGPT-style
- No settings or configuration needed
- Emma should match her seductive appearance
- Dark theme only (no theme switching)

## Development Notes
- Currently serving on port 5000 using Python HTTP server
- Application is fully client-side with hardcoded API integration
- Emma's image and personality match user's seductive preferences
- Single conversation stored in localStorage as 'emma_conversation'