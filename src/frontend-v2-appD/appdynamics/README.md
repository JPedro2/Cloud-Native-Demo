AppDynamics SDK for Go
======================

The AppDynamics SDK for Go allows you to add instrumentation to your Go applications and services. The SDK is shipped as a package containing a Cgo wrapper around the AppDynamics SDK for C/C++. The Go SDK and other AppDynamics agents and products are available from the [AppDynamics Download site](https://download.appdynamics.com). For up-to-date installation instructions and documentation, see the [AppDynamics Documentation Site](https://docs.appdynamics.com).

## Installation

To install, extract the Golang SDK in to your `GOPATH` (see the [GOPATH documentation](https://golang.org/doc/code.html#GOPATH) to learn how to set it or for the default value on your platform).

## Usage

After installation, the `appdynamics` package is available to import into your program. It's typical to alias it as `appd` for simplicity:

```go
import appd "appdynamics"
```

Before you can use the AppDynamics Golang SDK, you need to initialize the SDK with the required configuration:

```
cfg := appd.Config{}

cfg.AppName = "exampleapp"
cfg.TierName = "orderproc"
cfg.NodeName = "orderproc01"
cfg.Controller.Host = "my-appd-controller.example.org"
cfg.Controller.Port = 8080
cfg.Controller.UseSSL = true
cfg.Controller.Account = "customer1"
cfg.Controller.AccessKey = "secret"
cfg.InitTimeoutMs = 1000  // Wait up to 1s for initialization to finish

InitSDK(&cfg)
```

Afterwards, you can report business transactions using the `StartBT` and `EndBT` calls:

```
for i := 0; i < 1000; i++ {
    bt := StartBT("my bt", "")
    DoSomeWork()
    EndBT(bt)
}
```

It's ideal to use the Golang SDK in long running programs. To minimize network traffic, the SDK rolls up the metrics its observed over a sliding window before reporting. If a program terminates too soon, you may not see the metrics.

See the [documentation for full usage instructions](https://docs.appdynamics.com).
