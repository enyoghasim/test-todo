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
        echo "Checked out repository successfully"
      }
    }
    
    stage('Verify Build Info') {
      steps {
        script {
          echo "✅ Building from production branch"
          echo "Build triggered by: ${currentBuild.getBuildCauses()}"
          echo "Commit: ${env.GIT_COMMIT ?: 'Unknown'}"
        }
      }
    }
    
    stage('Install Dependencies') {
      steps {
        echo "📦 Installing dependencies..."
        sh 'npm ci'
        echo "✅ Dependencies installed successfully"
      }
    }
    
    stage('Build Project') {
      steps {
        echo "🔨 Building project..."
        sh 'npm run build'
        echo "✅ Build completed successfully"
      }
    }
    
    stage('Deploy with PM2') {
      steps {
        echo "🚀 Deploying application..."
        sh '''
          # Stop existing app (ignore error if not running)
          pm2 delete my-app || true
          
          # Start the application
          pm2 start npm --name "my-app" -- start
          
          # Show PM2 status
          pm2 list
        '''
        echo "✅ Application deployed successfully"
      }
    }
  }
  
  post {
    success {
      echo '🎉 Deployment succeeded!'
      echo "Application is now running on production"
    }
    
    failure {
      echo '❌ Build failed. Attempting rollback...'
      script {
        try {
          sh '''
            echo "Rolling back to previous commit..."
            git reset --hard HEAD~1
            npm ci
            npm run build
            pm2 delete my-app || true
            pm2 start npm --name "my-app" -- start
            echo "Rollback completed"
          '''
        } catch (Exception e) {
          echo "⚠️ Rollback failed: ${e.getMessage()}"
        }
      }
    }
    
    always {
      echo "Build finished at: ${new Date()}"
    }
  }
}