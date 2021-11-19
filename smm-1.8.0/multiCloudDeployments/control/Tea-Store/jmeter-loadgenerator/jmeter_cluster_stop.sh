#!/usr/bin/env bash

echo "checking if kubectl is present"

echo

if ! hash kubectl 2>/dev/null
then
    echo "'kubectl' was not found in PATH"
    echo "Kindly ensure that you can acces an existing kubernetes cluster via kubectl"
    exit
fi

kubectl version --short

echo

#Check If jmeter namespace exists
echo "Checking if jmeter namespace exists"
tenant="jmeter"

kubectl get namespace $tenant > /dev/null 2>&1

if [ $? -ne 0 ]
then
  echo "Namespace $tenant does not exist. There's nothing to stop, jmeter loadgenerator is not running!"
  
  echo
  echo "Current list of namespaces on the kubernetes cluster:"
  echo

  kubectl get namespaces | grep -v NAME | awk '{print $1}'
  
  echo

  exit 1
fi

echo

# Deleting all resources in the jmeter namespace
# The jmeter namespace **should NOT** be deleted since this should be labelled by SMM and part of the mesh
echo "Deleting all resources in the jmeter namespace"

kubectl delete all -n jmeter
kubectl delete cm jmeter-load-test -n jmeter

echo

echo "If you wish to re-run jmeter, you can now run the jmeter_cluster_create.sh script again."

echo



