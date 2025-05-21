#!/bin/bash
# Infinite Reality Engine Development Environment Setup Script
# This script sets up the development environment for the Infinite Reality Engine project.
# It installs required dependencies, configures the environment, and initializes the database.

# Exit on error
set -e

echo "====================================================="
echo "Infinite Reality Engine Development Environment Setup"
echo "====================================================="

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js using NVM
install_node() {
  echo "Installing Node.js v22.11.0 using NVM..."
  
  # Install NVM if not already installed
  if ! command_exists nvm; then
    echo "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # Source NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
  fi
  
  # Install Node.js
  nvm install 22.11.0
  nvm use 22.11.0
  
  # Add NVM to .bashrc if not already there
  if ! grep -q "NVM_DIR" ~/.bashrc; then
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
    echo 'nvm use 22.11.0' >> ~/.bashrc
  fi
  
  echo "Node.js $(node -v) installed successfully."
}

# Function to install system dependencies
install_system_dependencies() {
  echo "Installing system dependencies..."
  
  # Update package lists
  sudo apt-get update
  
  # Install required packages
  sudo apt-get install -y \
    build-essential \
    curl \
    git \
    python3 \
    python3-pip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release
    
  echo "System dependencies installed successfully."
}

# Function to install Docker and Docker Compose
install_docker() {
  echo "Installing Docker and Docker Compose..."
  
  if ! command_exists docker; then
    echo "Docker is not installed. Attempting to install Docker..."
    
    # Add Docker's official GPG key
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Add the repository to Apt sources
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    echo "Docker installed successfully. You may need to log out and back in for group changes to take effect."
  else
    echo "Docker is already installed."
  fi
  
  # Install Docker Compose if not already installed
  if ! command_exists docker-compose; then
    sudo apt-get install -y docker-compose
  fi
}

# Function to set up environment variables
setup_env_variables() {
  echo "Setting up environment variables..."
  
  # Check if .env.local exists, if not create it from .env.local.default
  if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.local.default..."
    cp .env.local.default .env.local
    echo "Environment variables configured successfully."
  else
    echo ".env.local already exists, skipping..."
  fi
}

# Function to install npm dependencies
install_npm_dependencies() {
  echo "Installing npm dependencies..."
  
  # Install project dependencies
  npm install
  
  # Install lerna locally (avoid global installation to prevent permission issues)
  echo "Installing lerna locally..."
  npm install --save-dev lerna
  
  echo "NPM dependencies installed successfully."
}

# Function to start Docker containers for database and Redis
start_docker_containers() {
  echo "Attempting to start Docker containers for database and Redis..."
  
  # Check if Docker is running
  if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running or not accessible. Skipping container startup."
    return 1
  fi
  
  # Check if start-containers.sh is executable, if not make it executable
  if [ -f scripts/start-containers.sh ] && [ ! -x scripts/start-containers.sh ]; then
    chmod +x scripts/start-containers.sh
  fi
  
  # Navigate to scripts directory and start containers
  cd scripts
  ./start-containers.sh || {
    echo "Failed to start containers. Please check Docker installation and try again."
    cd ..
    return 1
  }
  cd ..
  
  # Wait for database to be ready
  echo "Waiting for database to be ready..."
  sleep 10
  
  echo "Docker containers started successfully."
  return 0
}

# Function to initialize the database
initialize_database() {
  echo "Initializing the database..."
  
  # Run database initialization
  npm run dev-reinit || {
    echo "Failed to initialize database. Please check database connection and try again."
    return 1
  }
  
  echo "Database initialized successfully."
  return 0
}

# Main setup process
main() {
  # Check if Node.js is installed with correct version
  if ! command_exists node || [[ "$(node -v)" < "v22.11.0" ]]; then
    install_node
  else
    echo "Node.js $(node -v) is already installed."
  fi
  
  # Install system dependencies
  install_system_dependencies
  
  # Install Docker and Docker Compose
  install_docker
  
  # Set up environment variables
  setup_env_variables
  
  # Install npm dependencies
  install_npm_dependencies
  
  # Start Docker containers (skip if it fails)
  docker_status=0
  start_docker_containers || {
    echo "Skipping database initialization due to Docker issues."
    docker_status=1
  }
  
  # Initialize the database (only if Docker containers started successfully)
  if [ $docker_status -eq 0 ]; then
    initialize_database || echo "Database initialization failed. You may need to run 'npm run dev-reinit' manually."
  fi
  
  echo "====================================================="
  echo "Setup completed!"
  echo "====================================================="
  echo ""
  echo "You can now run 'npm run dev' to start the development server."
  echo ""
  
  if [ $docker_status -ne 0 ]; then
    echo "IMPORTANT: Docker containers could not be started during setup."
    echo "Before running the application, you'll need to:"
    echo "  1. Ensure Docker is running"
    echo "  2. Start the required containers: cd scripts && ./start-containers.sh"
    echo "  3. Initialize the database: npm run dev-reinit"
  fi
  
  echo ""
  echo "For more information, refer to the README.md file."
}

# Run the main setup process
main