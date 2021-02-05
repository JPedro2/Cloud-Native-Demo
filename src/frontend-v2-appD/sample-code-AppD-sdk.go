package main

import (
	appd "appdynamics"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {

	fmt.Printf("About to run golang test process...\n")

	cfg := appd.Config{}

	cfg.AppName = "<app-name>"
	cfg.TierName = "<tier-name>"
	cfg.NodeName = "<node-name>"
	cfg.Controller.Host = "<appdynamics-controller-host>"
	cfg.Controller.Port = 443
	cfg.Controller.UseSSL = true
	cfg.Controller.Account = "<account-name>"
	cfg.Controller.AccessKey = "<access-key>"
	cfg.InitTimeoutMs = 30000

	fmt.Printf("about to call InitSDK(InitTimeoutMS = %d)...", cfg.InitTimeoutMs)
	if err := appd.InitSDK(&cfg); err != nil {
		fmt.Printf("Error initializing the AppDynamics SDK\n")
		os.Exit(1)
	} else {
		mt.Printf("Initialized AppDynamics SDK successfully\n")
	}
	backendName := "HTTPBE"
	backendType := "HTTP"
	backendProperties := map[string]string{
		"URL": "https://httpbin.org/get",
	}
	resolveBackend := false

	appd.AddBackend(backendName, backendType, backendProperties, resolveBackend)

	for loop := 0; loop < 3000; loop++ {
		btHandle := appd.StartBT("GoTestBT1", "")
		ecHandle := appd.StartExitcall(btHandle, backendName)
		hdr := appd.GetExitcallCorrelationHeader(ecHandle)
		resp, err := http.Get("https://httpbin.org/get")
		fmt.Printf(hdr)
		if err != nil {
			log.Fatalln(err)
		}

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatalln(err)
			log.Println(string(body))
		}
		appd.EndExitcall(ecHandle)
		appd.EndBT(btHandle)
		fmt.Printf("Loop %d: Got BT handle %x\n", loop, btHandle)

		time.Sleep(1 * time.Second)

		if loop%10 == 0 {
			fmt.Printf("Setting error for loop #%d\n", loop)
			appd.AddBTError(btHandle, appd.APPD_LEVEL_ERROR, "Error message test string", true)
		}

		appd.EndBT(btHandle)
	}

	fmt.Println("calling term()...")

	appd.TerminateSDK()

	fmt.Println("done")
}
