apiVersion: v1
kind: Service
metadata:
  name: te-agent-teastore-multicloud-eks
  namespace: thousandeyes
spec:
  type: ClusterIP
  selector:
    app: te-agent-teastore-multicloud-eks
  ports:
  - name: te-agent2agent-udp-1
    protocol: UDP
    port: 49152
    targetPort: 49152
  - name: te-agent2agent-udp
    protocol: UDP
    port: 49153
    targetPort: 49153
  - name: te-agent2agent-tcp
    protocol: TCP
    port: 49153
    targetPort: 49153

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: te-agent-teastore-multicloud-eks
  namespace: thousandeyes
spec:
  selector:
    matchLabels:
      app: te-agent-teastore-multicloud-eks
  serviceName: te-agent-teastore-multicloud-eks
  replicas: 1
  template:
    metadata:
      labels:
        app: te-agent-teastore-multicloud-eks
    spec:
      # Node label must be applied: kubectl label nodes <node-name> tehost=host2
      # To view a label node: kubectl get nodes -L tehost
      # To delete a label node: kubectl label node <node-name> tehost-
      nodeSelector:
        tehost: host2
      containers:
      - name: te-agent-teastore-multicloud-eks
        image: thousandeyes/enterprise-agent:latest
        ports:
          - containerPort: 49152
          - containerPort: 49153
        command: ["/sbin/my_init"]
        securityContext:
          capabilities:
            add:
              - NET_ADMIN
              - SYS_ADMIN
        env:
          - name: TEAGENT_ACCOUNT_TOKEN
            value: ""
            # valueFrom:
            #   secretKeyRef:
            #     name: te-credentials
            #     key: TEAGENT_ACCOUNT_TOKEN
          - name: TEAGENT_INET
            value: "4"
          - name: KUBERNETES
            value: "true"
          - name: AGENT_NAME
            valueFrom:
              fieldRef:
                apiVersion: v1
                # StatefulSet metadata.name will be te-agent-teastore-multicloud-eks-0
                fieldPath: metadata.name
        resources:
          requests:
            memory: "1Gi"
            cpu: "100m"
          limits:
            memory: "2Gi"
            cpu: "200m"
        tty: true
        volumeMounts:
          - name: vol-agent
            mountPath: /var/lib/te-agent
            subPathExpr: $(AGENT_NAME)/te-agent
          - name: vol-agent
            mountPath: /var/lib/te-browserbot
            subPathExpr: $(AGENT_NAME)/te-browserbot
          - name: vol-agent
            mountPath: /var/log/agent
            subPathExpr: $(AGENT_NAME)/log
      volumes:
        - name: vol-agent
          persistentVolumeClaim:
            claimName: te-pvc-1
      terminationGracePeriodSeconds: 10
      restartPolicy: Always
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: te-pv-1
  namespace: thousandeyes
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  volumeMode: Filesystem
  hostPath:
    path: /var/te-pv-1/
    type: DirectoryOrCreate
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: te-pvc-1
  namespace: thousandeyes
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  volumeName: te-pv-1