#!/bin/bash

# 🚀 UNIFIED SERVICE MANAGER
# Universal script for managing all GoPublic services
# Works from any directory using .env and relative paths

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Find the script directory and GoPublic root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOPUBLIC_ROOT="$SCRIPT_DIR"

# Load environment variables
if [ -f "$GOPUBLIC_ROOT/.env" ]; then
    source "$GOPUBLIC_ROOT/.env"
    echo -e "${GREEN}✓${NC} Loaded environment from $GOPUBLIC_ROOT/.env"
else
    echo -e "${YELLOW}⚠${NC} No .env file found, using defaults"
fi

# Default port configurations (from CLAUDE.md XXYY architecture)
export TOOLS33_API=${TOOLS33_API:-4410}
export TOOLS33_WEB=${TOOLS33_WEB:-4420}
export TOOLS33_TUNNEL=${TOOLS33_TUNNEL:-4430}
export TOOLS33_PROXY=${TOOLS33_PROXY:-4440}

export TOOLS33STAGING_API=${TOOLS33STAGING_API:-2210}
export TOOLS33STAGING_WEB=${TOOLS33STAGING_WEB:-2220}
export TOOLS33STAGING_TUNNEL=${TOOLS33STAGING_TUNNEL:-2230}
export TOOLS33STAGING_PROXY=${TOOLS33STAGING_PROXY:-2240}

export CAMPING_API=${CAMPING_API:-3310}
export CAMPING_WEB=${CAMPING_WEB:-3320}
export CAMPING_TUNNEL=${CAMPING_TUNNEL:-3330}
export CAMPING_PROXY=${CAMPING_PROXY:-3340}

export BLADESPACE_API=${BLADESPACE_API:-5510}
export BLADESPACE_WEB=${BLADESPACE_WEB:-5520}
export BLADESPACE_TUNNEL=${BLADESPACE_TUNNEL:-5530}
export BLADESPACE_PROXY=${BLADESPACE_PROXY:-5540}

export CDS_API=${CDS_API:-6610}
export CDS_WEB=${CDS_WEB:-6620}
export CDS_TUNNEL=${CDS_TUNNEL:-6630}
export CDS_PROXY=${CDS_PROXY:-6640}

export LOGGING_API=${LOGGING_API:-7710}
export LOGGING_WEB=${LOGGING_WEB:-7720}
export LOGGING_STREAM=${LOGGING_STREAM:-7730}
export LOGGING_PROXY=${LOGGING_PROXY:-7740}

# Service definitions
declare -A SERVICES
SERVICES=(
    ["logging-api"]="$GOPUBLIC_ROOT/logging-system:node server.js:$LOGGING_API"
    ["logging-web"]="$GOPUBLIC_ROOT/logging-system/dashboard:npm start:$LOGGING_WEB"
    ["33tools-staging-api"]="$GOPUBLIC_ROOT/33tools-staging:npm run api:$TOOLS33STAGING_API"
    ["33tools-staging-web"]="$GOPUBLIC_ROOT/33tools-staging:npm run dev:$TOOLS33STAGING_WEB"
    ["33tools-production-api"]="$GOPUBLIC_ROOT/33tools-production:npm run api:$TOOLS33_API"
    ["33tools-production-web"]="$GOPUBLIC_ROOT/33tools-production:npm run dev:$TOOLS33_WEB"
    ["camping-api"]="$GOPUBLIC_ROOT/camping:node server.js:$CAMPING_API"
    ["camping-web"]="$GOPUBLIC_ROOT/camping:npm start:$CAMPING_WEB"
    ["bladespace-api"]="$GOPUBLIC_ROOT/bladespace:node api.js:$BLADESPACE_API"
    ["bladespace-web"]="$GOPUBLIC_ROOT/bladespace:npm start:$BLADESPACE_WEB"
    ["cds-api"]="$GOPUBLIC_ROOT/cds:npm run api:$CDS_API"
    ["cds-web"]="$GOPUBLIC_ROOT/cds:npm start:$CDS_WEB"
)

# Function to check if a port is in use
check_port() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN -t >/dev/null
}

# Function to get process info for a port
get_port_process() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN -F p | head -1 | cut -c2-
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(get_port_process $port)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
        echo -e "${RED}✗${NC} Killed process $pid on port $port"
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_config=${SERVICES[$service_name]}
    
    if [ -z "$service_config" ]; then
        echo -e "${RED}✗${NC} Unknown service: $service_name"
        return 1
    fi
    
    IFS=':' read -r dir command port <<< "$service_config"
    
    if ! [ -d "$dir" ]; then
        echo -e "${RED}✗${NC} Directory not found: $dir"
        return 1
    fi
    
    if check_port $port; then
        echo -e "${YELLOW}⚠${NC} Port $port already in use for $service_name"
        return 1
    fi
    
    echo -e "${BLUE}🚀${NC} Starting $service_name on port $port..."
    cd "$dir"
    
    # Set environment variables based on service
    case $service_name in
        *-web|*-frontend)
            export BROWSER=none
            export PORT=$port
            ;;
    esac
    
    # Start the service in background
    $command > "/tmp/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Wait a moment and check if it started
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $service_name started (PID: $pid, Port: $port)"
        echo "$pid" > "/tmp/${service_name}.pid"
    else
        echo -e "${RED}✗${NC} Failed to start $service_name"
        return 1
    fi
}

# Function to stop a service
stop_service() {
    local service_name=$1
    local service_config=${SERVICES[$service_name]}
    
    if [ -z "$service_config" ]; then
        echo -e "${RED}✗${NC} Unknown service: $service_name"
        return 1
    fi
    
    IFS=':' read -r dir command port <<< "$service_config"
    
    # Kill by port
    if check_port $port; then
        kill_port $port
        echo -e "${GREEN}✓${NC} Stopped $service_name (port $port)"
    else
        echo -e "${YELLOW}⚠${NC} $service_name not running on port $port"
    fi
    
    # Clean up PID file
    rm -f "/tmp/${service_name}.pid"
}

# Function to show service status
show_status() {
    echo -e "\n${CYAN}🔍 SERVICE STATUS${NC}"
    echo -e "===================="
    
    for service_name in "${!SERVICES[@]}"; do
        local service_config=${SERVICES[$service_name]}
        IFS=':' read -r dir command port <<< "$service_config"
        
        if check_port $port; then
            local pid=$(get_port_process $port)
            echo -e "${GREEN}✓${NC} $service_name - Running (PID: $pid, Port: $port)"
        else
            echo -e "${RED}✗${NC} $service_name - Stopped (Port: $port)"
        fi
    done
    
    echo -e "\n${PURPLE}📊 PORT SUMMARY${NC}"
    echo -e "=================="
    netstat -tlnp 2>/dev/null | grep -E ':(22[0-9]{2}|33[0-9]{2}|44[0-9]{2}|55[0-9]{2}|66[0-9]{2}|77[0-9]{2})' | while read line; do
        port=$(echo $line | awk '{print $4}' | cut -d':' -f2)
        echo -e "${BLUE}→${NC} Port $port: Active"
    done
}

# Function to show logs
show_logs() {
    local service_name=$1
    local log_file="/tmp/${service_name}.log"
    
    if [ -f "$log_file" ]; then
        echo -e "${CYAN}📋 LOGS for $service_name${NC}"
        echo -e "========================="
        tail -50 "$log_file"
    else
        echo -e "${RED}✗${NC} No log file found for $service_name"
    fi
}

# Function to restart a service
restart_service() {
    local service_name=$1
    echo -e "${YELLOW}🔄${NC} Restarting $service_name..."
    stop_service $service_name
    sleep 1
    start_service $service_name
}

# Main script logic
case "${1:-status}" in
    "start")
        if [ -z "$2" ]; then
            echo -e "${CYAN}🚀 STARTING ALL SERVICES${NC}"
            for service in "${!SERVICES[@]}"; do
                start_service $service
            done
        else
            start_service $2
        fi
        ;;
    "stop")
        if [ -z "$2" ]; then
            echo -e "${RED}🛑 STOPPING ALL SERVICES${NC}"
            for service in "${!SERVICES[@]}"; do
                stop_service $service
            done
        else
            stop_service $2
        fi
        ;;
    "restart")
        if [ -z "$2" ]; then
            echo -e "${YELLOW}🔄 RESTARTING ALL SERVICES${NC}"
            for service in "${!SERVICES[@]}"; do
                restart_service $service
            done
        else
            restart_service $2
        fi
        ;;
    "status")
        show_status
        ;;
    "logs")
        if [ -z "$2" ]; then
            echo -e "${RED}✗${NC} Please specify a service name for logs"
            echo -e "Available services: ${!SERVICES[*]}"
        else
            show_logs $2
        fi
        ;;
    "list")
        echo -e "\n${CYAN}📋 AVAILABLE SERVICES${NC}"
        echo -e "====================="
        for service_name in "${!SERVICES[@]}"; do
            local service_config=${SERVICES[$service_name]}
            IFS=':' read -r dir command port <<< "$service_config"
            echo -e "${BLUE}→${NC} $service_name (Port: $port)"
        done
        ;;
    "health")
        echo -e "\n${CYAN}🏥 HEALTH CHECK${NC}"
        echo -e "================"
        for service_name in "${!SERVICES[@]}"; do
            local service_config=${SERVICES[$service_name]}
            IFS=':' read -r dir command port <<< "$service_config"
            
            if check_port $port; then
                # Try to curl health endpoint
                if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
                    echo -e "${GREEN}✓${NC} $service_name - Healthy"
                elif curl -s "http://localhost:$port" >/dev/null 2>&1; then
                    echo -e "${YELLOW}⚠${NC} $service_name - Running but no health endpoint"
                else
                    echo -e "${RED}✗${NC} $service_name - Port open but not responding"
                fi
            else
                echo -e "${RED}✗${NC} $service_name - Not running"
            fi
        done
        ;;
    "help"|"--help"|"-h")
        echo -e "\n${CYAN}🛠️  UNIVERSAL SERVICE MANAGER${NC}"
        echo -e "=============================="
        echo -e "${GREEN}Usage:${NC} ./service-manager.sh [COMMAND] [SERVICE]"
        echo -e ""
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  start [service]    - Start all services or specific service"
        echo -e "  stop [service]     - Stop all services or specific service" 
        echo -e "  restart [service]  - Restart all services or specific service"
        echo -e "  status            - Show status of all services"
        echo -e "  logs <service>    - Show logs for specific service"
        echo -e "  list              - List all available services"
        echo -e "  health            - Check health of all services"
        echo -e "  help              - Show this help"
        echo -e ""
        echo -e "${YELLOW}Examples:${NC}"
        echo -e "  ./service-manager.sh start logging-web"
        echo -e "  ./service-manager.sh stop"
        echo -e "  ./service-manager.sh logs 33tools-staging-api"
        echo -e "  ./service-manager.sh restart logging-api"
        echo -e ""
        echo -e "${PURPLE}🔧 Port Architecture (XXYY):${NC}"
        echo -e "  22XX - Staging, 33XX - Camping, 44XX - Production"
        echo -e "  55XX - Bladespace, 66XX - CDS, 77XX - Logging"
        ;;
    *)
        echo -e "${RED}✗${NC} Unknown command: $1"
        echo -e "Run './service-manager.sh help' for usage information"
        exit 1
        ;;
esac