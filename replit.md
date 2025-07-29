# Sweet Talk - Virtual Girlfriend Chat Application

## Project Overview
A romantic chat application powered by Google's Gemini AI, providing users with an intimate virtual girlfriend experience. The application features a modern, responsive design with both light and dark themes, voice recognition capabilities, text-to-speech functionality, and persistent chat history.

## Project Architecture
- **Frontend**: Pure HTML, CSS, and JavaScript (client-side application)
- **API Integration**: Direct connection to Google Gemini API
- **Storage**: Browser localStorage for chat history and user preferences
- **Voice Features**: Web Speech API for speech recognition and synthesis
- **Styling**: CSS custom properties with dual theme support

## Key Features
- Virtual girlfriend AI chat with warm, caring personality
- Multiple conversation history management
- Voice input and text-to-speech output
- Light/dark theme toggle
- Responsive design
- Markdown formatting support
- API key management interface

## Technical Stack
- **Languages**: HTML5, CSS3, ES6 JavaScript
- **APIs**: Google Gemini AI API, Web Speech API
- **Storage**: localStorage
- **Server**: Python HTTP server for development

## File Structure
- `index.html` - Main application interface
- `script.js` - Core application logic and API integration
- `styles.css` - Complete styling with theme support
- `attached_assets/` - Image assets
- `generated-icon.png` - App icon

## Security Considerations
- Client-side API key storage in localStorage
- Direct API calls to Google Gemini (HTTPS)
- No server-side data storage or processing

## Recent Changes
- Initial project setup identified (July 29, 2025)
- Migration from Replit Agent to Replit environment in progress

## User Preferences
- No specific user preferences documented yet

## Development Notes
- Currently serving on port 5000 using Python HTTP server
- Application is fully client-side with no backend dependencies
- Requires user-provided Gemini API key for functionality