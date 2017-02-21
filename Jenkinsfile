#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { connectors: { 'appc.mongo': { url: 'mongodb://jenkin:mmpResearch4@ds049104.mongolab.com:49104/appcmongo' } } };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	} // node
} // timestamps
