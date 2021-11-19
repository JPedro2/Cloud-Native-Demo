controllerInfo:
  url: 
  account: 
  username: 
  password: 
  accessKey: 

# Cluster agent auto-instrument config
clusterAgent:
  appName: UKI-DevX-k8s-MultiCloud-EKS
  nsToMonitorRegex: .*

instrumentationConfig:
  enabled: true
  instrumentationMethod: env
  nsToInstrumentRegex: tea-store
  defaultAppName: UKI-DevX-k8s-Tea-Store
  appNameStrategy: manual
  instrumentationRules:
    - namespaceRegex: tea-store
      language: java
      labelMatch:
        - framework: java
      imageInfo:
        image: docker.io/appdynamics/java-agent:21.8.0
        agentMountPath: /opt/appdynamics
        imagePullPolicy: Always