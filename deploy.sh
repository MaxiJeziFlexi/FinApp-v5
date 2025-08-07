#!/bin/bash

# Production Deployment Script for Financial AI Platform
# This script helps ensure all production requirements are met before deployment

echo "🚀 Starting deployment preparation..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check required environment variables for production
echo "🔍 Checking required environment variables..."

REQUIRED_VARS=("DATABASE_URL" "OPENAI_API_KEY" "SESSION_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    MISSING_VARS+=("$var")
  fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
  echo "❌ Missing required environment variables:"
  printf '%s\n' "${MISSING_VARS[@]}"
  echo ""
  echo "Please set these variables in your deployment environment:"
  echo "- DATABASE_URL: Your production database connection string"
  echo "- OPENAI_API_KEY: Your OpenAI API key for AI services"
  echo "- SESSION_SECRET: A secure random string for session encryption"
  echo ""
  echo "Deployment aborted."
  exit 1
fi

# Check optional but recommended environment variables
echo "🔍 Checking optional environment variables..."

OPTIONAL_VARS=("REPLIT_CLIENT_ID" "REPLIT_CLIENT_SECRET" "STRIPE_SECRET_KEY" "PLAID_CLIENT_ID" "PLAID_SECRET")
MISSING_OPTIONAL=()

for var in "${OPTIONAL_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    MISSING_OPTIONAL+=("$var")
  fi
done

if [[ ${#MISSING_OPTIONAL[@]} -gt 0 ]]; then
  echo "⚠️  Missing optional environment variables (some features may be limited):"
  printf '%s\n' "${MISSING_OPTIONAL[@]}"
  echo ""
fi

# Set NODE_ENV to production
export NODE_ENV=production

echo "🔨 Building application..."

# Install dependencies
npm install --production=false

# Build the frontend and backend
npm run build

if [[ $? -ne 0 ]]; then
  echo "❌ Build failed. Please fix build errors before deploying."
  exit 1
fi

echo "✅ Build completed successfully"

echo "🔍 Testing production build..."

# Test that the built files exist
if [[ ! -f "dist/index.js" ]]; then
  echo "❌ Backend build file not found: dist/index.js"
  exit 1
fi

if [[ ! -d "dist/assets" ]]; then
  echo "❌ Frontend build assets not found: dist/assets"
  exit 1
fi

echo "✅ Production build files verified"

# Optional: Run a quick health check on the production build
echo "🏥 Testing application health..."

# Start the production server in background for health check
timeout 30s npm start &
SERVER_PID=$!

# Give the server time to start
sleep 10

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" localhost:5000/api/health)
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "503" ]]; then
  echo "✅ Health endpoint responding (HTTP $HTTP_CODE)"
else
  echo "⚠️  Health endpoint not responding as expected (HTTP $HTTP_CODE)"
fi

# Clean up
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "Next steps for Replit Deployment:"
echo "1. Ensure all required secrets are configured in the Deployments pane"
echo "2. Set NODE_ENV=production in deployment environment"
echo "3. The application will run with: npm start"
echo "4. Monitor health at: https://your-app.replit.app/api/health"
echo ""
echo "Required secrets to configure in Deployments pane:"
for var in "${REQUIRED_VARS[@]}"; do
  echo "  - $var"
done
echo ""
if [[ ${#MISSING_OPTIONAL[@]} -gt 0 ]]; then
  echo "Optional secrets for full functionality:"
  for var in "${MISSING_OPTIONAL[@]}"; do
    echo "  - $var"
  done
fi