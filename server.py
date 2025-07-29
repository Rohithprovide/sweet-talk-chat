#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import urllib.parse
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            self.handle_chat_request()
        else:
            self.send_error(404, "Not Found")
    
    def handle_chat_request(self):
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Get API key from environment
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                self.send_error(500, "API key not configured")
                return
            
            # Prepare the request to Gemini API
            endpoint = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            # Forward the request to Gemini API
            req = Request(endpoint, 
                         data=json.dumps(request_data).encode('utf-8'),
                         headers={'Content-Type': 'application/json'})
            
            with urlopen(req) as response:
                response_data = response.read()
                
            # Send the response back to client
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(response_data)
            
        except Exception as e:
            print(f"Error handling chat request: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

PORT = 5000
with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}/")
    httpd.serve_forever()