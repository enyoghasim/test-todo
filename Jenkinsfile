pipeline {
  agent any
  
  // environment {
  //   NODE_ENV = credentials('node-env') // Secure secret from Jenkins Credentials
  // }
  
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
          '''
        }
        
        echo '✅ Application deployed successfully'
      }
    }
  }
  
  post {
        success {
      echo '🎉 Deployment succeeded!'
      echo 'Application is now running on production'
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
      }
    }
  }
}