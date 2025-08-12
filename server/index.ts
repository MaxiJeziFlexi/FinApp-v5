import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 300) {
        logLine = logLine.slice(0, 299) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Validate required environment variables
function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'SESSION_SECRET'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  log('✓ Environment variables validated');
}

// Test database connection
async function validateDatabaseConnection() {
  try {
    log('Testing database connection...');
    
    // Test basic connectivity
    const result = await pool.query('SELECT 1 as test');
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Database query returned no results');
    }
    
    log('✓ Database connection validated');
    return true;
  } catch (error) {
    log(`⚠️ Database connection issue: ${error}`);
    log('⚠️ Starting server in limited mode without database features');
    // Allow server to start even if database is temporarily unavailable
    return false;
  }
}

// Enhanced server initialization with proper error handling
async function initializeServer() {
  try {
    log('🚀 Starting server initialization...');
    
    // Step 1: Validate environment variables
    validateEnvironment();
    
    // Step 2: Validate database connection (non-blocking)
    const dbConnected = await validateDatabaseConnection();
    if (!dbConnected) {
      log('⚠️ Running in limited mode - some features may be unavailable');
    }
    
    // Step 3: Register routes
    log('Registering routes...');
    const server = await registerRoutes(app);
    log('✓ Routes registered successfully');

    // Step 4: Setup error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log(`Error ${status}: ${message}`);
      res.status(status).json({ message });
      
      // Log error but don't throw in production to prevent server crash
      if (process.env.NODE_ENV !== 'production') {
        throw err;
      }
    });

    // Step 5: Setup Vite or static serving
    if (app.get("env") === "development") {
      log('Setting up Vite development server...');
      await setupVite(app, server);
      log('✓ Vite development server setup complete');
    } else {
      log('Setting up static file serving...');
      serveStatic(app);
      log('✓ Static file serving setup complete');
    }

    // Step 6: Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    log(`Starting server on port ${port}...`);
    
    return new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (err?: Error) => {
        if (err) {
          log(`✗ Failed to start server: ${err.message}`);
          reject(err);
        } else {
          log(`✓ Server running successfully on port ${port}`);
          log(`🌐 Server accessible at http://0.0.0.0:${port}`);
          resolve();
        }
      });
      
      // Handle server errors
      serverInstance.on('error', (error: Error) => {
        log(`✗ Server error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
    log(`✗ Server initialization failed: ${errorMessage}`);
    
    // In production, we want to exit gracefully
    if (process.env.NODE_ENV === 'production') {
      log('Exiting due to initialization failure...');
      process.exit(1);
    } else {
      throw error;
    }
  }
}

// Initialize server with error handling
initializeServer().catch((error) => {
  log(`🔥 Fatal error during server initialization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
});
