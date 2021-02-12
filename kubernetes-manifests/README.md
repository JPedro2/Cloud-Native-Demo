# Online Boutique Kubernetes Manifests 

**⚠️ Warning ⚠️** The manifests provided in this directory are not directly
deployable to a cluster, apart from `frontend-v2.yaml.tplt` and `loadgenerator.yaml.tplt`, which are manifest templates
that require further details.

To deploy to a cluster you **must** use the manifests in [/release](./release) directory which are configured with
pre-built public images. In order to deploy `frontend-v2.yaml` and `loadgenerator.yaml` to the cluster you need 
to follow the [_Quick-Start with GKE and Istio_](https://github.com/JPedro2/Cloud-Native-Demo#quick-start-with-gke-and-istio) and [_AppDynamics APM Agent_](https://github.com/JPedro2/Cloud-Native-Demo#apm-agent) steps in the [deployment guide](../README.md).