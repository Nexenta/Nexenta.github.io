node('master') {
    docker.withServer('unix:///var/run/docker.sock') {
        stage('Git clone') {
            git url: 'git@github.com-nexenta.github.io:nexentaedge/nexenta.github.io.git', branch: 'master'
            if (lastCommitIsPublishCommit()) {
                currentBuild.result = 'ABORTED'
                error('Aborting the build to prevent a loop.')
            }
        }
        stage('Install deps') {
            docker
                .image('solutions-team-jenkins-agent-nexenta.github.io-build')
                .inside('--volumes-from solutions-team-jenkins-master') {
                    sh """
                        cd src/website;\
                        npm install;
                    """
                }
        }
        stage('Run build') {
            docker
                .image('solutions-team-jenkins-agent-nexenta.github.io-build')
                .inside('--volumes-from solutions-team-jenkins-master') {
                    sh """
                        cd src/website;\
                        npm run build;\
                        cd -;\
                        cp -r src/website/build/nexenta.github.io/* ./
                    """
                }
        }
        stage('Publish changes') {
            sh """
                git status;\
                git add .;\
                git commit -m "[PUBLISH] Jenkins build number ${BUILD_NUMBER}";\
                git push --set-upstream origin master;\
                git push;
            """
        }
    }
}

private boolean lastCommitIsPublishCommit() {
    lastCommit = sh([script: 'git log -1', returnStdout: true])
    if (lastCommit.contains("[PUBLISH]")) {
        return true
    } else {
        return false
    }
}