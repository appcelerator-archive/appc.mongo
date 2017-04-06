#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { connectors: { 'appc.mongo': { } } };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	} // node
} // timestamps
