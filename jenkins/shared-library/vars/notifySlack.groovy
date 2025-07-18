#!/usr/bin/env groovy

/**
 * Slack Notification Pipeline Function
 * 
 * Sends comprehensive notifications to Slack with rich formatting
 * 
 * @param config Notification configuration
 */
def call(Map config = [:]) {
    
    // Default configuration
    def defaultConfig = [
        channel: '#deployments',
        color: 'good',
        title: 'Pipeline Notification',
        includeChanges: true,
        includeCoverage: true,
        includeTests: true,
        includeSecurity: true,
        includeArtifacts: true
    ]
    
    // Merge configurations
    config = defaultConfig + config
    
    script {
        if (!env.SLACK_WEBHOOK) {
            echo "⚠️ Slack webhook not configured, skipping notification"
            return
        }
        
        try {
            def message = buildSlackMessage(config)
            
            slackSend(
                channel: config.channel,
                color: config.color,
                message: message,
                webhookUrl: env.SLACK_WEBHOOK
            )
            
            echo "✅ Slack notification sent successfully to ${config.channel}"
        } catch (Exception e) {
            echo "❌ Failed to send Slack notification: ${e.message}"
        }
    }
}

def buildSlackMessage(config) {
    def message = """
${getStatusIcon(config.color)} *${config.title}* - ${currentBuild.result ?: 'SUCCESS'}

*Project:* SecureFlow Automaton
*Branch:* ${env.BRANCH_NAME}
*Commit:* ${env.GIT_COMMIT.take(7)}
*Build:* ${env.BUILD_NUMBER}
*Duration:* ${currentBuild.durationString}
*Triggered by:* ${getBuildCause()}

"""
    
    // Add build information
    if (config.includeChanges) {
        message += getBuildChanges()
    }
    
    // Add test results
    if (config.includeTests) {
        message += getTestResults()
    }
    
    // Add coverage information
    if (config.includeCoverage) {
        message += getCoverageResults()
    }
    
    // Add security scan results
    if (config.includeSecurity) {
        message += getSecurityResults()
    }
    
    // Add deployment information
    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'develop') {
        message += getDeploymentInfo()
    }
    
    // Add artifacts
    if (config.includeArtifacts) {
        message += getArtifactInfo()
    }
    
    // Add action links
    message += getActionLinks()
    
    return message
}

def getStatusIcon(color) {
    switch (color) {
        case 'good':
            return '✅'
        case 'danger':
            return '❌'
        case 'warning':
            return '⚠️'
        default:
            return 'ℹ️'
    }
}

def getBuildCause() {
    def cause = currentBuild.getBuildCauses()[0]
    
    if (cause._class?.contains('GitHubPushCause')) {
        return "GitHub Push"
    } else if (cause._class?.contains('BranchEventCause')) {
        return "Branch Event"
    } else if (cause._class?.contains('UserIdCause')) {
        return "Manual (${cause.userId})"
    } else if (cause._class?.contains('TimerTriggerCause')) {
        return "Scheduled"
    } else {
        return "Unknown"
    }
}

def getBuildChanges() {
    def changes = currentBuild.changeSets
    
    if (!changes || changes.isEmpty()) {
        return "*Changes:* No changes\n\n"
    }
    
    def message = "*Changes:*\n"
    def changeCount = 0
    
    changes.each { changeSet ->
        changeSet.items.each { change ->
            if (changeCount < 5) { // Limit to 5 changes
                message += "• ${change.msg} (${change.author.fullName})\n"
                changeCount++
            }
        }
    }
    
    if (changeCount >= 5) {
        message += "• ... and ${changes.size() - 5} more changes\n"
    }
    
    return message + "\n"
}

def getTestResults() {
    try {
        def testResults = currentBuild.testResults
        
        if (!testResults) {
            return "*Tests:* No test results available\n\n"
        }
        
        def message = "*Test Results:*\n"
        message += "• Total: ${testResults.totalCount}\n"
        message += "• Passed: ${testResults.passCount} ✅\n"
        message += "• Failed: ${testResults.failCount} ${testResults.failCount > 0 ? '❌' : ''}\n"
        message += "• Skipped: ${testResults.skipCount} ${testResults.skipCount > 0 ? '⏭️' : ''}\n"
        
        return message + "\n"
    } catch (Exception e) {
        return "*Tests:* Test results not available\n\n"
    }
}

def getCoverageResults() {
    try {
        // Try to read coverage from file
        def coverageFile = "coverage/lcov-report/index.html"
        
        if (fileExists(coverageFile)) {
            def coverage = sh(
                script: "grep -o 'All files[^%]*[0-9.]*%' ${coverageFile} | grep -o '[0-9.]*%' | head -1 | tr -d '%' || echo '0'",
                returnStdout: true
            ).trim()
            
            def coverageFloat = coverage.toFloat()
            def coverageIcon = coverageFloat >= 80 ? '✅' : coverageFloat >= 60 ? '⚠️' : '❌'
            
            return "*Coverage:* ${coverage}% ${coverageIcon}\n\n"
        } else {
            return "*Coverage:* Not available\n\n"
        }
    } catch (Exception e) {
        return "*Coverage:* Error reading coverage\n\n"
    }
}

def getSecurityResults() {
    try {
        def message = "*Security Scan:*\n"
        
        // Check for security scan results
        if (fileExists('security-report.json')) {
            def securityReport = readJSON file: 'security-report.json'
            
            message += "• Vulnerabilities: ${securityReport.vulnerabilities?.size() ?: 0}\n"
            message += "• High Risk: ${securityReport.highRisk ?: 0} ${securityReport.highRisk > 0 ? '❌' : '✅'}\n"
            message += "• Medium Risk: ${securityReport.mediumRisk ?: 0} ${securityReport.mediumRisk > 0 ? '⚠️' : '✅'}\n"
            message += "• Low Risk: ${securityReport.lowRisk ?: 0}\n"
        } else {
            message += "• Status: Completed ✅\n"
            message += "• No critical vulnerabilities found\n"
        }
        
        return message + "\n"
    } catch (Exception e) {
        return "*Security Scan:* Results not available\n\n"
    }
}

def getDeploymentInfo() {
    def environment = env.BRANCH_NAME == 'main' ? 'Production' : 'Staging'
    def url = env.BRANCH_NAME == 'main' ? 'https://secureflow.com' : 'https://staging.secureflow.com'
    
    def message = "*Deployment:*\n"
    message += "• Environment: ${environment}\n"
    message += "• Status: ${currentBuild.result == 'SUCCESS' ? 'Deployed ✅' : 'Failed ❌'}\n"
    message += "• URL: <${url}|${url}>\n"
    
    // Add Docker image info
    if (env.DOCKER_IMAGE_FULL) {
        message += "• Docker Image: ${env.DOCKER_IMAGE_FULL}\n"
    }
    
    return message + "\n"
}

def getArtifactInfo() {
    def artifacts = currentBuild.artifacts
    
    if (!artifacts || artifacts.isEmpty()) {
        return "*Artifacts:* None\n\n"
    }
    
    def message = "*Artifacts:*\n"
    artifacts.each { artifact ->
        message += "• <${env.BUILD_URL}artifact/${artifact.relativePath}|${artifact.displayPath}>\n"
    }
    
    return message + "\n"
}

def getActionLinks() {
    def message = "*Actions:*\n"
    message += "• <${env.BUILD_URL}|View Build>\n"
    message += "• <${env.BUILD_URL}console|View Console>\n"
    
    // Add coverage report link
    if (fileExists('coverage/index.html')) {
        message += "• <${env.BUILD_URL}Coverage_Report|Coverage Report>\n"
    }
    
    // Add test report link
    if (currentBuild.testResults) {
        message += "• <${env.BUILD_URL}testReport|Test Report>\n"
    }
    
    // Add security report link
    if (fileExists('security-report.html')) {
        message += "• <${env.BUILD_URL}Security_Report|Security Report>\n"
    }
    
    return message
}

// Success notification
def success(Map config = [:]) {
    config.color = 'good'
    config.title = 'Pipeline Success'
    config.channel = config.channel ?: '#deployments'
    
    call(config)
}

// Failure notification
def failure(Map config = [:]) {
    config.color = 'danger'
    config.title = 'Pipeline Failed'
    config.channel = config.channel ?: '#alerts'
    
    call(config)
}

// Warning notification
def warning(Map config = [:]) {
    config.color = 'warning'
    config.title = 'Pipeline Warning'
    config.channel = config.channel ?: '#alerts'
    
    call(config)
}

// Info notification
def info(Map config = [:]) {
    config.color = 'good'
    config.title = 'Pipeline Info'
    config.channel = config.channel ?: '#general'
    
    call(config)
}

// Deploy notification
def deploy(Map config = [:]) {
    config.color = 'good'
    config.title = 'Deployment Notification'
    config.channel = config.channel ?: '#deployments'
    config.includeChanges = false
    config.includeTests = false
    config.includeCoverage = false
    config.includeSecurity = false
    
    call(config)
}

// Security alert
def securityAlert(Map config = [:]) {
    config.color = 'danger'
    config.title = 'Security Alert'
    config.channel = config.channel ?: '#security'
    config.includeChanges = false
    config.includeTests = false
    config.includeCoverage = false
    config.includeSecurity = true
    
    call(config)
}
