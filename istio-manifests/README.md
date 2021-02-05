# Service Mesh [WIP]

This directory contains ingress resources (an Istio `Gateway` and `VirtualService`) needed to expose the app frontend running inside a Kubernetes cluster.

You can apply these resources to your cluster in addition to the `kuberentes-manifests`, then use the Istio IngressGateway's external IP to view the app frontend. See the following instructions for Istio steps.   



## Aditional service mesh demos using OnlineBoutique 

- [Canary deployment](https://github.com/GoogleCloudPlatform/istio-samples/tree/master/istio-canary-gke)
- [Security (mTLS, JWT, Authorization)](https://github.com/GoogleCloudPlatform/istio-samples/tree/master/security-intro)
- [Cloud Operations (Stackdriver)](https://github.com/GoogleCloudPlatform/istio-samples/tree/master/istio-stackdriver)
- [Stackdriver metrics (Open source Istio)](https://github.com/GoogleCloudPlatform/istio-samples/tree/master/stackdriver-metrics)