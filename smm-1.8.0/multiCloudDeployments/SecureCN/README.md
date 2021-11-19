# Install SecureCN in the Control Cluster

At the time of writing, _SecureCN_ does not support multi-cluster with _SMM_ `v1.8.0`, so _SecureCN_ is only enabled on the control cluster.

**Please Note:** All of the following installation steps are for a K8s cluster with _SMM_ `v1.8.0` running. 

## Pre-reqs

1. Add the following to _Istio ConfigMap_ under `spec.meshConfig.defaultConfig.proxyMetadata`
   ```
   kubectx smm-eks 
   kubectl -n istio-system edit icp cp-v111x
   ```
   When the editor opens, go down to `spec` > `meshConfig` > `defaultConfig` > `proxyMetadata` and add the following, underneath `ISTIO_META_ALS_ENABLED: "true"`
   ```
   ISTIO_META_INSECURE_STACKDRIVER_ENDPOINT: portshift-agent.portshift:24227
   ```
   Then save and quit (Esc + wq!), check that the SMM control plane is reconciling and wait until it is active
   ```
   kubectl get icp -n istio-system
   ```
2. Apply the _Mutating Webhook Config_ that allows `istio-injection=enabled` label to work with _SMM_
   ```
   kubectl apply -f smm-secureCN-MutatingWebhookConfig.yaml
   ```
3. Go to _SecureCN_ dashboard, click `Deployments` then `New Cluster`, go through the prompt. **VERY IMPORTANT:** You can leave all the defaults but make sure that you **select the option where `istio` is already installed and then select version `1.11.4`**.

4. Download the _installer_ and move it to this folder
   
### Install SecureCN

1. Add `istio-injection` label to the `tea-store` namespace, and/or other relevant namespaces
   ```
   kubectx smm-eks 
   kubectl label namespace tea-store istio-injection=enabled --overwrite
   ```
   You can confirm this with: `kubectl get ns -L istio-injection`

2. Unzip the installer
   ```
   tar -xzvf <installer-name>.tar.gz
   ```
3. Run SecureCN installation script
   ```
   ./install_bundle.sh 
   ```
