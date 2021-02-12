# FrontEnd microservice with AppDynamics GO SDK for APM

The _AppDynamics_ GO SDK is deployed in the `main.go` script and installed in the frontEnd application container via `Dockerfile`.

## AppDynamics GO SDK in `main.go`

The `main.go` file imports the `appdynamics` package and initiates the _AppDynamics_ controller as shown below.

``` golang
import (
    appd "appdynamics"
    ...
)

cfg := appd.Config{}
	
cfg.AppName = "UKI-DevX-k8s-Demo"
cfg.TierName = "BoutiqueFrontEnd"
cfg.NodeName = "FrontEndv1"

controllerPORT, _ := strconv.ParseUint(os.Getenv("APPD_CONTROLLER_PORT"), 10, 10)
controllerUseSSL, _ := strconv.ParseBool(os.Getenv("APPD_CONTROLLER_USE_SSL"))

cfg.Controller.Host = os.Getenv("APPD_CONTROLLER_HOST")
cfg.Controller.Port = uint16(controllerPORT)
cfg.Controller.UseSSL  = controllerUseSSL
cfg.Controller.Account = os.Getenv("APPD_CONTROLLER_ACCOUNT")
cfg.Controller.AccessKey = os.Getenv("APPD_CONTROLLER_ACCESS_KEY")
cfg.InitTimeoutMs = 1000  // Wait up to 1s for initialization to finish

//Initialize the agent by passing the configuration structure to InitSDK() in your main function
//If nil is returned, the agent is initialized successfully. If an error returns, it is likely because the agent could not reach the Controller.
if err := appd.InitSDK(&cfg); err != nil {
    fmt.Printf("Error initializing the AppDynamics SDK\n")
} else {
    fmt.Printf("Initialized AppDynamics SDK successfully\n")
}
```

The Business Transactions [`BTs`] are wrapped around the frontEnd routing function by using the middleware shown below. For more information on this please checkout the [Gorilla/MUX package project](https://github.com/gorilla/mux#middleware).

``` golang
//AppD middleware to enclose the routing handling functions and monitor Business Transactions
func appdynamicsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        btHandle := appd.StartBT(r.URL.Path, "")
        next.ServeHTTP(w, r)
		appd.EndBT(btHandle)
		fmt.Printf("AppD Middleware sucessfully instrumented BT with handle: %x and URL.Path: %s\n", btHandle, r.URL.Path)
    })
}

r := mux.NewRouter()
r.HandleFunc("/", svc.homeHandler).Methods(http.MethodGet, http.MethodHead)
r.Use(appdynamicsMiddleware)
```

## Dockerfile Deployment

The `Dockerfile` installs the _AppDynamics_ `GO` SDK [as per documentation](https://docs.appdynamics.com/display/PRO45/Go+Language+Agent). There are a few things to consider - all included in the `Dockerfile`. 

1. It is highly advisable **not** to use an `ubuntu:alpine` distribution as the _AppDynamics_ `GO` SDK [requires](https://docs.appdynamics.com/display/PRO45/Go+Language+Supported+Environments) a Linux distribution with _glibc_ libraries. 
2. The `libappdynamics.so` file needs to be copied into the shared libraries folder `/lib` - for more information [please check this AppDynamics Community Page discussion](https://community.appdynamics.com/t5/Dynamic-Languages-Node-JS-Python/Golang-SDK-libappdynamics-so-cannot-open-shared-object-file/td-p/29174).
3. The AppDynamics Golang SDK, `/appdynamics`, needs to be in the `GOPATH`.

## Further Development

If you wish to develop this further, like add more _Business Transactions_ to [provide extra visibility to the _AppDynamics_ controller](https://docs.appdynamics.com/display/PRO45/Using+Go+SDK), you will need a [_Docker Hub_ account](https://hub.docker.com/) and to do the following:

1. Update and save the `main.go` and/or other `.go` files
2. Rebuild the `frontend-v2` docker container image
   ```sh
   cd ./src/frontend-v2-appD
   docker build -t <your Docker Hub username>/boutique-appd-frontend:latest .
   ```

3. Push the docker container to your _Docker Hub_ repo
   ```sh
   docker push <your Docker Hub username>/boutique-appd-frontend:latest
   ```

4. Update and save the [frontend-v2.yaml manifest](../../kubernetes-manifests/) _line 33_ with the new docker image that you just pushed to your _Docker Hub_ repo and re-deploy it
   ```sh
   kubectl apply -f kubernetes-manifests/frontend2.yaml
   ```

## More Resources

In this folder, the `sample-code-AppD-sdk.go` script has some sample code with `Transaction BackEnds` and `ExitCalls` for further reference, if you wish to explore that route. The [GO SDK Reference](https://docs.appdynamics.com/display/PRO45/Go+SDK+Reference) also provides more insights on the `GO` SDK capabilities. 

The `GO` SDK and other _AppDynamics_ agents and products are available from the [AppDynamics Download site](https://download.appdynamics.com). For up-to-date installation instructions and documentation, see the [AppDynamics Documentation Site](https://docs.appdynamics.com).