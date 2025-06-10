pipeline {
  agent any

  tools {
    nodejs 'Node22.12.0'
  }

  
  options {
    timestamps()
    // Keep only last 10 builds
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }
  
  stages {
    stage('Checkout') {
      steps {
        // Jenkins will automatically checkout the branch that triggered the webhook
        checkout scm
        echo 'Checked out repository successfully'
      }
    }
    
    stage('Verify Environment') {
      steps {
        echo '🔍 Verifying Node.js environment...'
        sh '''
          echo "Node.js version:"
          node --version
          echo "npm version:"
          npm --version
          echo "Current PATH:"
          echo $PATH
          echo "Node location:"
          which node
          echo "npm location:"
          which npm
        '''
        
        // Install PM2 if not present
        script {
          def pm2Status = sh(script: 'which pm2 || echo "not found"', returnStdout: true).trim()
          if (pm2Status.contains('not found')) {
            echo '📦 Installing PM2...'
            sh 'npm install -g pm2'
          }
          sh 'pm2 --version'
        }
      }
    }
    
    stage('Verify Build Info') {
      steps {
        script {
          echo '✅ Building from production branch'
          echo 'Build triggered by webhook'
          def commitId = env.GIT_COMMIT ?: 'Unknown'
          echo "Commit: " + commitId
        }
      }
    }
    
    stage('Install Dependencies') {
      steps {
        echo '📦 Installing dependencies...'
        sh 'npm ci'
        echo '✅ Dependencies installed successfully'
      }
    }
    
    stage('Build Project') {
      steps {
        echo '🔨 Building project...'
        sh 'npm run build'
        echo '✅ Build completed successfully'
      }
    }
    
    stage('Deploy with PM2') {
      steps {
        echo '🚀 Deploying application...'
        
        // Use credentials only when needed
        withCredentials([string(credentialsId: 'node-env', variable: 'NODE_ENV')]) {
          sh '''
            # Stop existing app (ignore error if not running)
            pm2 delete my-app || true
            
            # Start the application with NODE_ENV
            NODE_ENV=$NODE_ENV pm2 start npm --name "my-app" -- start
            
            # Show PM2 status
            pm2 list
            
            # Wait a moment for app to start up
            echo "Waiting for application to start..."
            sleep 5
            
            # Show recent logs to verify startup
            echo "=== Recent Application Logs ==="
            pm2 logs my-app --lines 20 --nostream || echo "No logs available yet"
            
            # Show app info
            echo "=== Application Information ==="
            pm2 show my-app || echo "App info not available"
          '''
        }
        
        echo '✅ Application deployed successfully'
      }
    }
    
    stage('Post-Deploy Health Check') {
      steps {
        echo '🔍 Performing health check...'
        script {
          try {
            sh '''
              # Give the app a moment to fully start
              sleep 3
              
              # Check if the app is running
              echo "=== PM2 Process Status ==="
              pm2 jlist | jq '.[] | select(.name=="my-app") | {name: .name, status: .pm2_env.status, pid: .pid, uptime: .pm2_env.pm_uptime}'
              
              # Show recent logs again
              echo "=== Final Log Check ==="
              pm2 logs my-app --lines 10 --nostream || echo "No logs available"
              
              # Optional: Health check endpoint (if your app has one)
              # curl -f http://localhost:3000/health || echo "Health check endpoint not available"
            '''
          } catch (Exception e) {
            echo "Health check warning: " + e.getMessage()
            // Don't fail the build for health check issues
          }
        }
      }
    }
  }
  
  post {
    success {
      echo '🎉 Deployment succeeded!'
      echo 'Application is now running on production'
      script {
        // Show final status
        sh '''
          echo "=== Final PM2 Status ==="
          pm2 list
          echo "=== Access logs with: pm2 logs my-app ==="
        '''
      }
    }
    
    failure {
      echo '❌ Build failed. Attempting rollback...'
      script {
        try {
          withCredentials([string(credentialsId: 'node-env', variable: 'NODE_ENV')]) {
            sh '''
              echo "Rolling back to previous commit..."
              git reset --hard HEAD~1
              npm ci
              npm run build
              pm2 delete my-app || true
              NODE_ENV=$NODE_ENV pm2 start npm --name "my-app" -- start
              echo "Rollback completed"
              
              # Show rollback logs
              echo "=== Rollback Application Logs ==="
              sleep 3
              pm2 logs my-app --lines 10 --nostream || echo "No rollback logs available"
            '''
          }
        } catch (Exception e) {
          echo 'Rollback failed: ' + e.getMessage()
        }
      }
    }
    
    always {
      script {
        def buildTime = new Date()
        echo 'Build finished at: ' + buildTime.toString()
        
        // Always show final PM2 status for debugging
        try {
          sh 'pm2 list || echo "PM2 not available"'
        } catch (Exception e) {
          echo "Could not get PM2 status: " + e.getMessage()
        }
      }
    }
  }
}