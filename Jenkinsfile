node {
  stage('Environment check') {
    sh 'node -v'
    sh 'npm -v'
  }
  stage('Package installation') {
    sh 'npm install'
  }
  stage('Testing') {
    sh 'npm test'
  }
}