node {
  def nodeHome = tool name: 'node-6'
  env.PATH = "${nodeHome}/bin:${env.PATH}"

  stage('Environment check') {
    sh 'echo $PATH'
    sh 'ls /var/jenkins_home/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/node-6/bin'
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