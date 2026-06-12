#!/bin/bash

# LoanCrypto Platform - Setup Script
# This script helps set up and test the project

echo "======================================"
echo "LoanCrypto Platform - Setup Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print messages
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if both Backend and Frontend directories exist
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    print_error "Please run this script from the project root directory (where Backend/ and Frontend/ folders are)"
    exit 1
fi

# Menu
echo "Select an action:"
echo "1) Install dependencies"
echo "2) Start Backend server"
echo "3) Start Frontend server"
echo "4) Seed testimonials"
echo "5) Check API endpoints"
echo "6) Run complete setup"
echo "0) Exit"
echo ""

read -p "Enter your choice (0-6): " choice

case $choice in
    1)
        print_step "Installing Backend dependencies..."
        cd Backend
        npm install
        cd ..
        print_step "Installing Frontend dependencies..."
        cd Frontend
        npm install
        cd ..
        print_step "Dependencies installed successfully!"
        ;;
    
    2)
        print_step "Starting Backend server..."
        cd Backend
        npm run dev
        ;;
    
    3)
        print_step "Starting Frontend server..."
        cd Frontend
        npm run dev
        ;;
    
    4)
        print_step "Seeding testimonials..."
        print_warning "Make sure your backend is running on http://localhost:5000"
        read -p "Press Enter to continue..."
        
        response=$(curl -s -X POST http://localhost:5000/api/testimonials/seed -H "Content-Type: application/json")
        
        if echo "$response" | grep -q "error"; then
            print_error "Failed to seed testimonials"
            echo "Response: $response"
        else
            print_step "Testimonials seeded successfully!"
            echo "Response: $response"
        fi
        ;;
    
    5)
        print_step "Checking API endpoints..."
        print_warning "Make sure your backend is running on http://localhost:5000"
        echo ""
        
        # Test testimonials endpoint
        print_step "Testing GET /api/testimonials..."
        response=$(curl -s http://localhost:5000/api/testimonials)
        if [ -z "$response" ]; then
            print_error "No response from testimonials endpoint"
        else
            echo "✓ Response received"
        fi
        echo ""
        
        # Test crypto endpoint
        print_step "Testing GET /api/crypto/prices..."
        response=$(curl -s http://localhost:5000/api/crypto/prices)
        if [ -z "$response" ]; then
            print_error "No response from crypto endpoint"
        else
            echo "✓ Response received"
        fi
        echo ""
        ;;
    
    6)
        print_step "Running complete setup..."
        
        # Install dependencies
        print_step "Installing dependencies..."
        cd Backend && npm install && cd ..
        cd Frontend && npm install && cd ..
        
        echo ""
        echo "======================================"
        echo -e "${GREEN}Setup Complete!${NC}"
        echo "======================================"
        echo ""
        echo "Next steps:"
        echo "1. Open two terminals"
        echo "2. In Terminal 1: cd Backend && npm run dev"
        echo "3. In Terminal 2: cd Frontend && npm run dev"
        echo "4. Open http://localhost:5174 in your browser"
        echo "5. Run this script again and select option 4 to seed testimonials"
        echo ""
        ;;
    
    0)
        echo "Goodbye!"
        exit 0
        ;;
    
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_step "Done!"
