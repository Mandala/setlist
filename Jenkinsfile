node {
  def nodeHome = tool name: 'node-6', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
  env.PATH = "${nodeHome}/bin:${env.PATH}"
  
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