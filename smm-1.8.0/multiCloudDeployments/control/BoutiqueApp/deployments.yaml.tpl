# Copyright (c) 2021, Cisco Systems, Inc. and/or its affiliates. All rights reserved. 
# Licensed under the Apache 2.0 license, see LICENSE file.

apiVersion: apps/v1
kind: Deployment
metadata:
  name: emailservice
spec:
  selector:
    matchLabels:
      app: emailservice
  template:
    metadata:
      labels:
        app: emailservice
    spec:
      terminationGracePeriodSeconds: 5
      containers:
      - name: server
        image: gcr.io/google-samples/microservices-demo/emailservice:v0.2.0
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        - name: DISABLE_TRACING
          value: "1"
        - name: DISABLE_PROFILER
          value: "1"
        readinessProbe:
          periodSeconds: 5
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:8080"]
        livenessProbe:
          periodSeconds: 5
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:8080"]
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkoutservice
spec:
  selector:
    matchLabels:
      app: checkoutservice
  template:
    metadata:
      labels:
        app: checkoutservice
    spec:
      containers:
        - name: server
          image: gcr.io/google-samples/microservices-demo/checkoutservice:v0.2.0
          ports:
          - containerPort: 5050
          readinessProbe:
            exec:
              command: ["/bin/grpc_health_probe", "-addr=:5050"]
          livenessProbe:
            exec:
              command: ["/bin/grpc_health_probe", "-addr=:5050"]
          env:
          - name: PORT
            value: "5050"
          - name: PRODUCT_CATALOG_SERVICE_ADDR
            value: "productcatalogservice:3550"
          - name: SHIPPING_SERVICE_ADDR
            value: "shippingservice:50051"
          - name: PAYMENT_SERVICE_ADDR
            value: "paymentservice:50051"
          - name: EMAIL_SERVICE_ADDR
            value: "emailservice:5000"
          - name: CURRENCY_SERVICE_ADDR
            value: "currencyservice:7000"
          - name: CART_SERVICE_ADDR
            value: "cartservice:7070"
          - name: DISABLE_STATS
            value: "1"
          - name: DISABLE_TRACING
            value: "1"
          - name: DISABLE_PROFILER
            value: "1"
          # - name: JAEGER_SERVICE_ADDR
          #   value: "jaeger-collector:14268"
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: paymentservice
spec:
  selector:
    matchLabels:
      app: paymentservice
  template:
    metadata:
      labels:
        app: paymentservice
    spec:
      terminationGracePeriodSeconds: 5
      containers:
      - name: server
        image: gcr.io/google-samples/microservices-demo/paymentservice:v0.2.0
        ports:
        - containerPort: 50051
        env:
        - name: PORT
          value: "50051"
        readinessProbe:
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:50051"]
        livenessProbe:
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:50051"]
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: productcatalogservice
spec:
  selector:
    matchLabels:
      app: productcatalogservice
  template:
    metadata:
      labels:
        app: productcatalogservice
    spec:
      terminationGracePeriodSeconds: 5
      containers:
      - name: server
        image: gcr.io/google-samples/microservices-demo/productcatalogservice:v0.2.0
        ports:
        - containerPort: 3550
        env:
        - name: PORT
          value: "3550"
        - name: DISABLE_STATS
          value: "1"
        - name: DISABLE_TRACING
          value: "1"
        - name: DISABLE_PROFILER
          value: "1"
        # - name: JAEGER_SERVICE_ADDR
        #   value: "jaeger-collector:14268"
        readinessProbe:
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:3550"]
        livenessProbe:
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:3550"]
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: loadgenerator-internal
spec:
  selector:
    matchLabels:
      app: loadgenerator-internal
  replicas: 1
  template:
    metadata:
      labels:
        app: loadgenerator-internal
    spec:
      terminationGracePeriodSeconds: 5
      restartPolicy: Always
      containers:
      - name: main
        image: gcr.io/google-samples/microservices-demo/loadgenerator:v0.2.0
        env:
        - name: FRONTEND_ADDR
          value: "boutique-frontEnd-mesh-gateway.istio-system.svc.cluster.local"
        - name: USERS
          value: "10"
        resources:
          requests:
            cpu: 300m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shippingservice
spec:
  selector:
    matchLabels:
      app: shippingservice
  template:
    metadata:
      labels:
        app: shippingservice
    spec:
      containers:
      - name: server
        image: gcr.io/google-samples/microservices-demo/shippingservice:v0.2.0
        ports:
        - containerPort: 50051
        env:
        - name: PORT
          value: "50051"
        - name: DISABLE_STATS
          value: "1"
        - name: DISABLE_TRACING
          value: "1"
        - name: DISABLE_PROFILER
          value: "1"
        # - name: JAEGER_SERVICE_ADDR
        #   value: "jaeger-collector:14268"
        readinessProbe:
          periodSeconds: 5
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:50051"]
        livenessProbe:
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:50051"]
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adservice
spec:
  selector:
    matchLabels:
      app: adservice
  template:
    metadata:
      labels:
        app: adservice
    spec:
      terminationGracePeriodSeconds: 5
      containers:
      - name: server
        image: gcr.io/google-samples/microservices-demo/adservice:v0.2.0
        ports:
        - containerPort: 9555
        env:
        - name: PORT
          value: "9555"
        - name: DISABLE_STATS
          value: "1"
        - name: DISABLE_TRACING
          value: "1"
        #- name: JAEGER_SERVICE_ADDR
        #  value: "jaeger-collector:14268"
        resources:
          requests:
            cpu: 200m
            memory: 180Mi
          limits:
            cpu: 300m
            memory: 300Mi
        readinessProbe:
          initialDelaySeconds: 20
          periodSeconds: 15
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:9555"]
        livenessProbe:
          initialDelaySeconds: 20
          periodSeconds: 15
          exec:
            command: ["/bin/grpc_health_probe", "-addr=:9555"]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-v2
spec:
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        version: v2
      annotations:
        sidecar.istio.io/rewriteAppHTTPProbers: "true"
    spec:
      containers:
        - name: server
          image: docker.io/peolivei/boutique-appd-frontend:v1.1
          ports:
          - containerPort: 8080
          readinessProbe:
            initialDelaySeconds: 10
            httpGet:
              path: "/_healthz"
              port: 8080
              httpHeaders:
              - name: "Cookie"
                value: "shop_session-id=x-readiness-probe"
          livenessProbe:
            initialDelaySeconds: 10
            httpGet:
              path: "/_healthz"
              port: 8080
              httpHeaders:
              - name: "Cookie"
                value: "shop_session-id=x-liveness-probe"
          env:
          - name: PORT
            value: "8080"
          - name: PRODUCT_CATALOG_SERVICE_ADDR
            value: "productcatalogservice:3550"
          - name: CURRENCY_SERVICE_ADDR
            value: "currencyservice:7000"
          - name: CART_SERVICE_ADDR
            value: "cartservice:7070"
          - name: RECOMMENDATION_SERVICE_ADDR
            value: "recommendationservice:8080"
          - name: SHIPPING_SERVICE_ADDR
            value: "shippingservice:50051"
          - name: CHECKOUT_SERVICE_ADDR
            value: "checkoutservice:5050"
          - name: AD_SERVICE_ADDR
            value: "adservice:9555"
          - name: ENV_PLATFORM
            value: "gcp"
          ######################## APPD CONTROLLER VARIABLES ########################
          - name: APPD_APP_NAME
            value: ""
          - name: APPD_TIER_NAME
            value: ""
          - name: APPD_NODE_NAME
            value: ""
          - name: APPD_CONTROLLER_HOST
            value: ""
          - name: APPD_CONTROLLER_PORT
            value: "443"
          - name: APPD_CONTROLLER_USE_SSL
            value: "true"
          - name: APPD_CONTROLLER_ACCOUNT
            value: ""
          - name: APPD_CONTROLLER_ACCESS_KEY
            value: ""
          - name: UNIQUE_HOST_ID
            value: ""
          ######################## APPD CONTROLLER VARIABLES ########################
          - name: DISABLE_TRACING
            value: "1"
          - name: DISABLE_PROFILER
            value: "1"
          # - name: JAEGER_SERVICE_ADDR
          #   value: "jaeger-collector:14268"
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi