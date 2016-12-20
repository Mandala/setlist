node {
  def nodeHome = tool name: 'node-6'
  env.PATH = "${nodeHome}/bin:${env.PATH}"

  stage('Environment check') {
    sh 'export PATH=$PATH'
    sh 'node -v'
    sh 'npm -v'
  }
  stage('Install') {
    sh 'npm install'
  }
  stage('Test') {
    sh 'npm test'
  }
}