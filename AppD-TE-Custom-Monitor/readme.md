# ThousandEyes Machine Agent Extension - Docker Image

This example shows how to

* Build a machine agent Docker image bundled with the Thousandeyes monitor.
* Configure and deploy a ThousandEyes monitor container for monitoring an app.
* Conifgure and deploy the NetworkViz agent for connection info in AppDynamics.

## Building the Docker Image

First you'll need to download the machine agent bundle zip from https://downloads.appdynamics.com.

Next, run `./build.sh` and pass the name of the machine agent file you downloaded.

```bash
./build.sh machineagent-bundle-x64-2045.4.3.zip
```

This script will 
* Copy the zip to `build/thousandeyes-monitor/machineagent-bundle.zip`.
* Copy the local ThousandEyes Monitor code into the build folder.
* Run `docker-compose build --no-cache`.
* Create the `thousandeyes/appd-monitor` Docker image.

You may need to manually update the SHA256 value in `/build/thousandeyes-monitor/docker-compose.yaml`.

## Configuring the Monitor

Before you spin up a ThousandEyes Monitor from the Docker image, you'll need to set a few environment variables and pass those to either `docker run` or `docker-compose up`. These variables will configure the machine agent as well as the Monitor config settings (same as **config.json**). This example uses `docker-compose`.

### Editing the Config File

Edit the **configuration.env** file. The environment variables defined in this file are the same as those discussed in the [custom-monitor/readme.md]. Fill in the appropriate AppDynamics and ThousandEyes connection and credential information. Then fill in the information about what tests metrics you want to pull from ThousandEyes and what application you want to associate with in AppDynamics.

Here's an example configuration file contents:

Set your AppDynamics Controller connection and credentials
```bash
APPDYNAMICS_AGENT_ACCOUNT_NAME=tho...nc
APPDYNAMICS_AGENT_ACCOUNT_ACCESS_KEY=xrv..qr
APPDYNAMICS_CONTROLLER_HOST_NAME=tho...nc.saas.appdynamics.com
APPDYNAMICS_CONTROLLER_PORT=443
APPDYNAMICS_CONTROLLER_SSL_ENABLED=true
```

Set your AppDynamics Analytics credentials (only used by Monitor if pushing data to Analytics):
```bash
APPD_GLOBAL_ACCOUNT=thousa..._b454a33d-....
APPD_API_KEY=ffe982d6-....-da53374b74
```

Set your ThousandEyes credentials
```bash
TE_EMAIL=hashlock@thousandeyes.com
TE_API_KEY=ncea...p5
```

Set the application name of the application in AppDynamics to send metrics to. Alternatively, set this to a dummy application in AppDynamics. Setting to a dummy application will allow collecting metrics for multiple applications using a single ThousandEyes monitor machine agent. The tier and node should remain **thousandeyes**, but can be changed if desired.
```bash
APPDYNAMICS_AGENT_APPLICATION_NAME=samplenodejs2
APPDYNAMICS_AGENT_TIER_NAME=thousandeyes
APPDYNAMICS_AGENT_NODE_NAME=thousandeyes
```

Specify what ThousandEyes account group and tests the monitor will pull metrics from.
```bash
TE_ACCOUNTGROUP="Integration AppD"
TE_TESTS=["samplenodejs2"]
```

Specify the format of the custom metrics output. This is a templated value (see details in the custom-monitor readme). This is the recommended format for monitoring a single application:
```bash
TE_METRIC_TEMPLATE="name=Custom Metrics|{tier}|{agent}|{metricname},value={metricvalue}"
#TE_METRIC_TEMPLATE="name=Server|Component:{tier}|{agent}|{metricname},value={metricvalue}"
```

The name of the analytics schema (Analytics only).
```bash
TE_SCHEMA_NAME=thousandeyes
```

The ThousandEyes monitor host ID. This must be set to a unique host name ID so that the machine agent can restart without conflict. If not set, this will default to `thousandeyes-${APPDYNAMICS_AGENT_APPLICATION_NAME}` (in Docker **startup.sh**)

```bash
APPDYNAMICS_AGENT_UNIQUE_HOST_ID=thousandeyes-samplenodejs2
```

Other AppDynamics settings that may be of interest to configure as well. If you run into the metric limit (450) you can increase with APPDYNAMICS_AGENT_METRIC_LIMIT.  SIM is not required for custom metrics.
```bash
# Machine agent metric limit is 450
# SIM and Docker are disabled by default
APPDYNAMICS_AGENT_METRIC_LIMIT=2000
APPDYNAMICS_DOCKER_ENABLED=false
APPDYNAMICS_SIM_ENABLED=false
```

## Deploying Your Container

After you've configured **configuration.env**, run your container using `docker-compose`. This will use the **docker-compose.yaml** file, which automatically uses the `configuration.env` file to set all the required environment variables.

A simple **docker-compose.yaml**:
```yaml
services:
  te-appd-monitor:
    container_name: te-appd-monitor
    hostname: te-appd-monitor
    image: thousandeyes/appd-monitor
    env_file: ./configuration.env
    volumes:
      - /:/hostroot:ro
      - /var/run/docker.sock:/var/run/docker.sock
```

`docker-compose up` will get the container running. The startup script of the `thousandeyes/appd-monitor` image will display what options it was configured with at container bootup. For example:

```
te-appd-monitor     | Starting the ThousandEyes AppD Monitor Extension
te-appd-monitor     |  - Application: samplenodejs
te-appd-monitor     |  - AppD Controller: thousandeyesinc.saas.appdynamics.com
te-appd-monitor     |  - Machine Agent Host ID: thousandeyes-samplenodejs
te-appd-monitor     |  - ThousandEyes Tests:    ["samplenodejs"]
te-appd-monitor     |  - ThousandEyes Account:  "Integration AppD"
te-appd-monitor     |  - Custom Metric Format:  "name=Custom Metrics|{tier}|{agent}|{metricname},value={metricvalue}"
te-appd-monitor     | Using java executable at /opt/appdynamics/machine-agent/jre/bin/java
te-appd-monitor     | Started AppDynamics Machine Agent Successfully.
```


