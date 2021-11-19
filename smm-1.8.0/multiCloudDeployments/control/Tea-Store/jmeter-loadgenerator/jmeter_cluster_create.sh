#!/usr/bin/env bash
#Deploy jmeter load generator on jmeter namespace
#Please make sure that jmeter namespace is created: kubectl create ns jmeter

working_dir=`pwd`

#Check if the test template file exists
echo "checking if the jmeter test template file exists in this folder"

jmx=$working_dir"/tea-store-test.jmx"

if [ ! -f "$jmx" ];
then
    echo "Test script file was not found in PATH"
    echo "Kindly check and input the correct file path"
    exit
fi

echo "checking if kubectl is present"

if ! hash kubectl 2>/dev/null
then
    echo "'kubectl' was not found in PATH"
    echo "Kindly ensure that you can acces an existing kubernetes cluster via kubectl"
    exit
fi

kubectl version --short

#Check If jmeter namespace exists
echo "checking if the jmeter namespace exists"
tenant="jmeter"

kubectl get namespace $tenant > /dev/null 2>&1

if [ $? -ne 0 ]
then
  echo "Namespace $tenant does not exist, please create it before proceeding"
  
  echo
  echo "Current list of namespaces on the kubernetes cluster:"
  echo

  kubectl get namespaces | grep -v NAME | awk '{print $1}'
  
  echo

  exit 1
fi

echo

echo "Creating Jmeter slave nodes in jmeter namespace"

nodes=`kubectl get no | egrep -v "master|NAME" | wc -l`

echo

kubectl create -n $tenant -f $working_dir/jmeter_slaves_deploy.yaml
kubectl create -n $tenant -f $working_dir/jmeter_slaves_svc.yaml

echo

echo "Creating Jmeter Master"

echo

kubectl create -n $tenant -f $working_dir/jmeter_master_configmap.yaml
kubectl create -n $tenant -f $working_dir/jmeter_master_deploy.yaml

echo "Waiting for Jmeter to be ready, just takes a minute."

sleep 45

echo

echo "Printout Of the $tenant Objects"

echo

kubectl get -n $tenant all

echo namespace = $tenant > $working_dir/tenant_export

#Start the test from the testfile template 

test_name="$(basename "$jmx")"

#Get Master pod details

master_pod=`kubectl get po -n $tenant | grep jmeter-master | awk '{print $1}'`

kubectl cp "$jmx" -n $tenant "$master_pod:/$test_name"

echo Starting Jmeter load test

kubectl exec -ti -n $tenant $master_pod -- /bin/bash /load_test "$test_name"
