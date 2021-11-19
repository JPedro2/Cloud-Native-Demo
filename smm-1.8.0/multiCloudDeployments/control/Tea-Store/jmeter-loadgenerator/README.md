# Install JMeter load generator for Tea-Store

## Pre-Reqs
For stressing the TeaStore there is a Browse Profile template, `tea-store-test.jmx`, that is used by the JMeter Load generator. 
1. Provide the hostname of where your tea-store application is hosted and how many users you want to simulate the load
    1.1. (Line 13) Replace with your tea-store hostname. This could be internal within service mesh (ingress mesh gateway) or the external address.
    1.2. (Line 23) Modify the number of users, if needed
    1.3. Save the file!

2. Create `jmeter` namespace and apply `SMM` _sidecar-proxy auto injection_ to it
   2.1. `kubectl create ns jmeter`
   2.2. `smm sp ai on --namespace=jmeter` (**please note:** to use the `SMM` tool you need to add it to your `$PATH` if you haven't done so)

## Installation

1. Make the script executable and launch `jmeter_cluster.sh` to start the deployment 
    1.1 `chmod +x jmeter_cluster_create.sh`
    1.2 `./jmeter_cluster_create.sh`

2. After the test starts, you will see summary logs from the JMeter master pod
    2.1 Let it run for a while to make sure there are no errors
    2.2 Check the AppD Tea-Store Application Dashboard and make sure you can see the load
    2.3 The _loadgenerator_ is now running successfully and you can exit the pod by pressing `CTRL+C`

## Modify and/or Stop
_Please note_ that the default option is that the thread group loops forever.
If you wish to stop the test and/or modify the load (by modifying the number of users), you  will need to delete all the resources within the the `jmeter` namespace. For that you can use the `jmeter_cluster_stop.sh` script.
1. Make the script executable and launch `jmeter_cluster_stop.sh` to stop the deployment and delete all the resources 
   1.1. `chmod +x jmeter_cluster_stop.sh`
   1.2. `./jmeter_cluster_stop.sh`
2. Modify `tea-store-test.jmx` on lines 13 and/or 23, if needed. **Save it!**
3. Relaunch the jmeter start-up script
   3.1. `./jmeter_cluster_create.sh`