# MCP Client

A TypeScript-based client for interacting with Model Context Protocol (MCP) servers. This client provides a command-line interface for communicating with MCP servers and processing queries using Anthropic's Claude model.

## Features

- Connect to MCP servers (Python or JavaScript)
- Interactive command-line interface
- Tool integration with Claude model
- Error handling and graceful shutdown
- Environment variable configuration

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Python 3.x (if connecting to Python servers)
- Anthropic API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mcp-clients
```

2. Install dependencies:
```bash
cd typescript
npm install
```

3. Create a `.env` file in the project root:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

## Usage

Run the client with a server script:

```bash
npm start <path_to_server_script>
```

The server script must be either a `.js` or `.py` file.

### Example

```bash
npm start ../python/server.py
```

## Commands

- Type your queries in the interactive prompt
- Type 'quit' to exit the program

## Error Handling

The client includes comprehensive error handling:
- Connection errors
- Query processing errors
- Tool execution errors
- Graceful cleanup on exit

## Development

### Project Structure

```
typescript/
├── src/
│   └── index.ts    # Main client implementation
├── package.json    # Project dependencies
└── .env           # Environment variables
```

### Building

```bash
npm run build
```

## License

MIT

## Contributing

