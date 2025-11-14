#!/usr/bin/env bash

################################################################################
# run.sh - Astro Development Helper Script
################################################################################
#
# Description:
#   A convenient wrapper script for running common Astro development tasks.
#   Automatically handles dependency installation, port conflicts, and browser
#   opening for the development server.
#
# Usage:
#   ./run.sh              # Start development server (default)
#   ./run.sh --dev        # Start development server (explicit)
#   ./run.sh --build      # Build for production
#   ./run.sh --preview    # Preview production build
#   ./run.sh --check      # Run Astro type checking
#   ./run.sh --help       # Show help message
#
# Features:
#   - Auto-installs dependencies — checks for node_modules and installs if missing
#   - Port conflict detection — checks if port 4321 is in use and attempts cleanup
#   - Automatically opens browser for dev server
#   - Cross-platform — works on macOS, Linux, and Windows (Git Bash)
#   - Clean shutdown — handles Ctrl+C to stop the server
#   - Colored output for better readability status messages in green/yellow/red
#   - Browser auto-open only for dev and preview modes — waits 2 seconds, then opens http://localhost:4321 (macOS/Linux/Windows)
#   - Preview mode builds automatically if dist/ doesn't exist
#
# Requirements:
#   - Node.js 18+ and npm
#   - Bash 4.0+
#
################################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=4321
URL="http://localhost:${PORT}"

# Parse command line arguments
MODE="dev"
if [ $# -gt 0 ]; then
    case "$1" in
        --dev|--development)
            MODE="dev"
            ;;
        --build)
            MODE="build"
            ;;
        --preview)
            MODE="preview"
            ;;
        --check)
            MODE="check"
            ;;
        --help|-h)
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  (no args)    Start development server (default)"
            echo "  --dev         Start development server"
            echo "  --build       Build for production"
            echo "  --preview     Preview production build"
            echo "  --check       Run Astro type checking"
            echo "  --help, -h    Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Run '$0 --help' for usage information."
            exit 1
            ;;
    esac
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to open browser (cross-platform)
open_browser() {
    sleep 2  # Wait for server to start
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$URL" 2>/dev/null
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists xdg-open; then
            xdg-open "$URL" 2>/dev/null
        elif command_exists gnome-open; then
            gnome-open "$URL" 2>/dev/null
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash)
        start "$URL" 2>/dev/null
    fi
}

# Function to check if port is in use
check_port() {
    if command_exists lsof; then
        lsof -ti:${PORT} >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -an | grep -q ":${PORT}.*LISTEN"
    else
        false
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down server...${NC}"
    pkill -f "astro dev" 2>/dev/null || true
    pkill -f "astro preview" 2>/dev/null || true
    exit 0
}

# Set up signal handlers (only for dev and preview modes)
if [ "$MODE" == "dev" ] || [ "$MODE" == "preview" ]; then
    trap cleanup SIGINT SIGTERM
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Dependencies installed!${NC}\n"
fi

# Execute based on mode
case "$MODE" in
    dev)
        # Check if port is already in use
        if check_port; then
            echo -e "${YELLOW}Port ${PORT} is already in use.${NC}"
            echo -e "${YELLOW}Attempting to use existing server or kill process...${NC}"
            pkill -f "astro dev" 2>/dev/null
            sleep 1
        fi

        # Start the dev server and open browser
        echo -e "${GREEN}Starting Astro dev server...${NC}"
        echo -e "${GREEN}Server will be available at: ${URL}${NC}\n"

        # Open browser in background
        open_browser &

        # Start the dev server (this will run in foreground)
        npm run dev
        ;;

    build)
        echo -e "${BLUE}Building for production...${NC}\n"
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "\n${GREEN}Build completed successfully!${NC}"
            echo -e "${GREEN}Output directory: dist/${NC}"
        else
            echo -e "\n${RED}Build failed!${NC}"
            exit 1
        fi
        ;;

    preview)
        # Check if dist directory exists
        if [ ! -d "dist" ]; then
            echo -e "${YELLOW}No build found. Building first...${NC}\n"
            npm run build
            if [ $? -ne 0 ]; then
                echo -e "${RED}Build failed! Cannot preview.${NC}"
                exit 1
            fi
        fi

        # Check if port is already in use
        if check_port; then
            echo -e "${YELLOW}Port ${PORT} is already in use.${NC}"
            echo -e "${YELLOW}Attempting to use existing server or kill process...${NC}"
            pkill -f "astro preview" 2>/dev/null
            sleep 1
        fi

        echo -e "${BLUE}Starting preview server...${NC}"
        echo -e "${GREEN}Preview will be available at: ${URL}${NC}\n"

        # Open browser in background
        open_browser &

        # Start the preview server
        npm run preview
        ;;

    check)
        echo -e "${BLUE}Running Astro type checking...${NC}\n"
        npm run check
        exit $?
        ;;
esac
