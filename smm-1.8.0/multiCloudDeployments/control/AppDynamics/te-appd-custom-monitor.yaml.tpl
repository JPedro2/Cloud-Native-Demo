apiVersion: apps/v1
kind: Deployment
metadata:
  name: te-appd-custom-monitor-agent
  namespace: appdynamics
  labels:
    app: te-appd-custom-monitor-agent
spec:
  replicas: 1
  selector:
    matchLabels:
      app: te-appd-custom-monitor-agent
  template:
    metadata:
      labels:
        app: te-appd-custom-monitor-agent
    spec:
      containers:
        - name: te-appd-monitor
          image: peolivei/te-appd-custom-monitor:v21.2.0
          env:
          - name: APPDYNAMICS_AGENT_ACCOUNT_ACCESS_KEY
            value: ""
          - name: APPDYNAMICS_AGENT_ACCOUNT_NAME
            value: ""
          - name: APPDYNAMICS_AGENT_APPLICATION_NAME
            value: ""
          - name: APPDYNAMICS_AGENT_METRIC_LIMIT
            value: "300000"
          - name: APPDYNAMICS_AGENT_NODE_NAME
            value: "thousandeyes"
          - name: APPDYNAMICS_AGENT_TIER_NAME
            value: "thousandeyes"
          - name: APPDYNAMICS_AGENT_UNIQUE_HOST_ID
            value: "TE-AppD-Custom-Agent-MultiCloud"
          - name: APPDYNAMICS_CONTROLLER_HOST_NAME
            value: ""
          - name: APPDYNAMICS_CONTROLLER_PORT
            value: "443"
          - name: APPDYNAMICS_CONTROLLER_SSL_ENABLED
            value: "true"
          - name: APPDYNAMICS_DOCKER_ENABLED
            value: "false"
          - name: APPDYNAMICS_SIM_ENABLED
            value: "false"
          - name: APPD_API_KEY
            value: ""
          - name: APPD_GLOBAL_ACCOUNT
            value: ""
          - name: TE_ACCOUNTGROUP
            value: ""
          - name: TE_API_KEY
            value: ""
          - name: TE_EMAIL
            value: ""
          - name: TE_METRIC_TEMPLATE
            value: "name=Custom Metrics|{tier}|{agent}|{metricname},value={metricvalue}"
          - name: TE_SCHEMA_NAME
            value: "thousandeyes"
          - name: TE_TESTS
            value: '["", ""]'
          volumeMounts:
            - name: dockersock
              mountPath: "/var/run/docker.sock"        
          resources: 
            requests:
              cpu: 200m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
      volumes:
      - name: dockersock
        hostPath:
          path: /var/run/docker.sock
      hostname: te-appd-monitor
      restartPolicy: Always