package appdynamics

//#cgo CFLAGS: -I${SRCDIR}
//#cgo LDFLAGS: -L${SRCDIR}/lib -lappdynamics -ldl -Wl,-rpath,${SRCDIR}/lib
//#cgo linux LDFLAGS: -lrt
//#include "include/appdynamics.h"
//#include <stdlib.h>
//#include <stdint.h>
/*
extern void appd_config_set_golang(void);

uintptr_t bthandle_to_uint(appd_bt_handle bthandle) {
    return (uintptr_t) bthandle;
}
appd_bt_handle uint_to_bthandle(uintptr_t bthandle) {
    return (appd_bt_handle) bthandle;
}

uintptr_t echandle_to_uint(appd_exitcall_handle echandle) {
    return (uintptr_t) echandle;
}
appd_exitcall_handle uint_to_echandle(uintptr_t echandle) {
    return (appd_exitcall_handle) echandle;
}

uintptr_t contexthandle_to_uint(struct appd_context_config* context) {
    return (uintptr_t) context;
}
*/
import "C"

import (
    "errors"
    "fmt"
    "unsafe"
)

// The required name of the correlation header.
//
// Other AppDynamics agents perform automatic correlation for certain
// types of entry and exit points by looking for a correlation header
// in the payload with this name.
//
// Upstream Correlation
// ====================
//
// When your SDK instrumented process receives a continuing transaction
// from an upstream agent that supports automatic correlation, extract
// the header named APPD_CORRELATION_HEADER_NAME from the incoming
// payload and pass it to StartBT():
//
//   string hdr = req.Header.Get(APPD_CORRELATION_HEADER_NAME);
//   BtHandle bt = StartBT("fraud detection", hdr);
//
// If the header retrieved by the req.Header.Get() function is
// valid, the BT started on the second line will be a continuation of the
// business transaction started by the upstream service.
//
// Downstream Correlation
// ======================
//
// If you are making an exit call where a downstream agent supports
// automatic correlation, inject a header named APPD_CORREATION_HEADER_NAME
// into the outgoing payload. The value of the header is retrieved using the
// GetExitcallCorrelationHeader() function:
//
//   ExitcallHandle inventory = StartExitcall(bt, "inventory");
//   string hdr = GetExitcallCorrelationHeader(inventory);
//   client := &http.Client{}
//   req, err := http.NewRequest("POST", "https://inventory/holds/sku123123")
//   req.Header.Add(APPD_CORRELATION_HEADER_NAME, hdr)
//   resp, err := client.Do(req)
//
// In this example, the http functions (import "net/http") are used
// to make an HTTP POST request with an HTTP header containing the correlation
// header as retrieved by GetExitcallCorrelationHeader(). The header
// is given the name APPD_CORRELATION_HEADER_NAME. A downstream agent that
// supports automatic correlation for HTTP entry points will automatically
// extract the correlation header and perform distributed transaction tracing.
const APPD_CORRELATION_HEADER_NAME string = "singularityheader"

type ExitcallHandle uint64
type BtHandle uint64

type Config struct {
    AppName, TierName, NodeName string

    Controller Controller
    Logging LoggingConfig

    /*
     * Set to true if you want the SDK to check for configuration in the
     * environment on init. Note that because this happens on init, the
     * environment settings override whatever configuration you set in
     * your program.
     *
     * See the documentation for appd_config_getenv in the C/C++ SDK
     * for more information.
     */
    UseConfigFromEnv bool

    /*
     * If UseConfigFromEnv is set, this specifies the prefix to use for
     * environment variable names. If UseConfigFromEnv is true and this
     * is empty, then the default (APPD_SDK) is used.
     *
     * See the documentation for appd_config_getenv in the C/C++ SDK
     * for more information.
     */
    EnvVarPrefix string

    /*
     * appd_sdk_init relies on controller configuration to start business
     * transactions. This is an asynchronous action so that InitSDK does
     * not block your program. This Config field allows you to instruct
     * InitSDK to wait for up to InitTimeoutMs milliseconds and
     * wait until it has received controller configuration and is ready to
     * capture BTs.
     *
     * X  : Wait up to X milliseconds for controller configuration.
     * 0  : Do not wait for controller configuration.
     * -1 : Wait indefinitely until controller configuration is received by agent
     */
    InitTimeoutMs int
}

type Controller struct {
    Host                            string
    Port                            uint16
    Account, AccessKey              string
    UseSSL                          bool
    CertificateFile, CertificateDir string

    HTTPProxy HTTPProxy
}

type HTTPProxy struct {
    Host                   string
    Port                   uint16
    Username, PasswordFile string
}

type LogLevel int

const (
    APPD_LOG_LEVEL_DEFAULT LogLevel = iota
    APPD_LOG_LEVEL_TRACE
    APPD_LOG_LEVEL_DEBUG
    APPD_LOG_LEVEL_INFO
    APPD_LOG_LEVEL_WARN
    APPD_LOG_LEVEL_ERROR
    APPD_LOG_LEVEL_FATAL
)

type LoggingConfig struct {
    BaseDir             string
    MinimumLevel        LogLevel
    MaxNumFiles         uint
    MaxFileSizeBytes    uint
}

/**
 * Configuration of an application context (tenant) for the SDK.
 */
type ContextConfig struct {
    AppName  string
    TierName string
    NodeName string
}

// Error levels for passing to AddBTError() and
// AddExitcallError().
type ErrorLevel int

const (
    APPD_LEVEL_NOTICE ErrorLevel = iota
    APPD_LEVEL_WARNING
    APPD_LEVEL_ERROR
)

// Valid backend types to pass to AddBackend()
const (
    APPD_BACKEND_HTTP       = "HTTP"
    APPD_BACKEND_DB         = "DB"
    APPD_BACKEND_CACHE      = "CACHE"
    APPD_BACKEND_RABBITMQ   = "RABBITMQ"
    APPD_BACKEND_WEBSERVICE = "WEBSERVICE"
    APPD_BACKEND_JMS        = "JMS"
)

// Converts the Golang Config struct to the C appd_config struct equivalent
func marshalConfig(from *Config) *C.struct_appd_config {
    to := C.appd_config_init()

    app_name := C.CString(from.AppName)
    tier_name := C.CString(from.TierName)
    node_name := C.CString(from.NodeName)
    controller_host := C.CString(from.Controller.Host)
    controller_account := C.CString(from.Controller.Account)
    controller_access_key := C.CString(from.Controller.AccessKey)
    controller_certificate_file := C.CString(from.Controller.CertificateFile)
    controller_certificate_dir := C.CString(from.Controller.CertificateDir)

    defer C.free(unsafe.Pointer(app_name))
    defer C.free(unsafe.Pointer(tier_name))
    defer C.free(unsafe.Pointer(node_name))
    defer C.free(unsafe.Pointer(controller_host))
    defer C.free(unsafe.Pointer(controller_account))
    defer C.free(unsafe.Pointer(controller_access_key))
    defer C.free(unsafe.Pointer(controller_certificate_file))
    defer C.free(unsafe.Pointer(controller_certificate_dir))

    C.appd_config_set_app_name(to, app_name)
    C.appd_config_set_tier_name(to, tier_name)
    C.appd_config_set_node_name(to, node_name)
    C.appd_config_set_controller_host(to, controller_host)
    C.appd_config_set_controller_port(to, C.ushort(from.Controller.Port))
    C.appd_config_set_controller_account(to, controller_account)
    C.appd_config_set_controller_access_key(to, controller_access_key)

    if from.Controller.UseSSL {
        C.appd_config_set_controller_use_ssl(to, 1)
    } else {
        C.appd_config_set_controller_use_ssl(to, 0)
    }

    if len(from.Controller.CertificateDir) != 0 {
        C.appd_config_set_controller_certificate_dir(to, controller_certificate_dir)
    }

    if len(from.Controller.CertificateFile) != 0 {
        C.appd_config_set_controller_certificate_file(to, controller_certificate_file)
    }

    if len(from.Controller.HTTPProxy.Host) != 0 {
        controller_http_proxy_host := C.CString(from.Controller.HTTPProxy.Host)
        defer C.free(unsafe.Pointer(controller_http_proxy_host))
        controller_http_proxy_username := C.CString(from.Controller.HTTPProxy.Username)
        defer C.free(unsafe.Pointer(controller_http_proxy_username ))
        controller_http_proxy_password_file := C.CString(from.Controller.HTTPProxy.PasswordFile)
        defer C.free(unsafe.Pointer(controller_http_proxy_password_file))

        C.appd_config_set_controller_http_proxy_host(to, controller_http_proxy_host)
        C.appd_config_set_controller_http_proxy_port(to, C.ushort(from.Controller.HTTPProxy.Port))
        C.appd_config_set_controller_http_proxy_username(to, controller_http_proxy_username)
        C.appd_config_set_controller_http_proxy_password_file(to, controller_http_proxy_password_file)
    }


    switch from.Logging.MinimumLevel {
    case APPD_LOG_LEVEL_DEBUG:
        C.appd_config_set_logging_min_level(to, C.APPD_LOG_LEVEL_DEBUG)
    case APPD_LOG_LEVEL_TRACE:
        C.appd_config_set_logging_min_level(to, C.APPD_LOG_LEVEL_TRACE)
    case APPD_LOG_LEVEL_INFO:
        C.appd_config_set_logging_min_level(to, C.APPD_LOG_LEVEL_INFO)
    case APPD_LOG_LEVEL_WARN:
        C.appd_config_set_logging_min_level(to, C.APPD_LOG_LEVEL_WARN)
    case APPD_LOG_LEVEL_ERROR:
        C.appd_config_set_logging_min_level(to, C.APPD_LOG_LEVEL_ERROR)
    case APPD_LOG_LEVEL_FATAL:
        C.appd_config_set_logging_min_level(to, C.APPD_LOG_LEVEL_FATAL)
    }

    if len(from.Logging.BaseDir) != 0 {
        logging_log_dir := C.CString(from.Logging.BaseDir)
        defer C.free(unsafe.Pointer(logging_log_dir))

        C.appd_config_set_logging_log_dir(to, logging_log_dir)
    }

    if from.Logging.MaxNumFiles != 0 {
        C.appd_config_set_logging_max_num_files(to, C.uint(from.Logging.MaxNumFiles))
    }

    if from.Logging.MaxFileSizeBytes != 0 {
        C.appd_config_set_logging_max_file_size_bytes(to, C.uint(from.Logging.MaxFileSizeBytes))
    }

    C.appd_config_set_init_timeout_ms(to, C.int(from.InitTimeoutMs))

    return to
}

// Add application context to AppDynamics configuration for multi-tenancy.
func AddAppContextToConfig(cfg *Config, context string, contextCfg *ContextConfig) error {
    cs := C.CString(context)
    defer C.free(unsafe.Pointer(cs))

    app_name := C.CString(contextCfg.AppName)
    tier_name := C.CString(contextCfg.TierName)
    node_name := C.CString(contextCfg.NodeName)
    defer C.free(unsafe.Pointer(app_name))
    defer C.free(unsafe.Pointer(tier_name))
    defer C.free(unsafe.Pointer(node_name))

    c_contextCfg := C.appd_context_config_init(cs);
    if (C.contexthandle_to_uint(c_contextCfg) == 0) {
      return nil
    }
    C.appd_context_config_set_app_name(c_contextCfg, app_name);
    C.appd_context_config_set_tier_name(c_contextCfg, tier_name);
    C.appd_context_config_set_node_name(c_contextCfg, node_name);

    result := int(C.appd_sdk_add_app_context(c_contextCfg))
    if result != 0 {
        return errors.New("Could not add app context to config.")
    }

    return nil
}

// Initializes the AppDynamics SDK.
// Returns an error on failure.
func InitSDK(cfg *Config) error {
    // convert the go struct to a c struct
    C.appd_config_set_golang()
    c_cfg := marshalConfig(cfg)

    if cfg.UseConfigFromEnv {
        if cfg.EnvVarPrefix != "" {
            csPrefix := C.CString(cfg.EnvVarPrefix)
            defer C.free(unsafe.Pointer(csPrefix))
            C.appd_config_getenv(c_cfg, csPrefix)
        } else {
            C.appd_config_getenv(c_cfg, nil)
        }
    }

    result := int(C.appd_sdk_init(c_cfg))

    if result != 0 {
        return errors.New("Could not initialize the Golang SDK.")
    }

    return nil
}

// Adds a backend with the given name, type, and identifying properties.
// Returns an error on failure.
//
// The resolve parameter:
//   Normally, if an agent picks up a correlation header for an unresolved
//   backend, it will resolve itself as that backend. This is usually the
//   desired behavior.
//
//   However, if the backend is actually an uninstrumented tier that is
//   passing through the correlation header (for example, a message queue
//   or proxy), then you may wish the backend to show up distinct from the
//   tier that it routes to. If you set resolve to false, correlation headers
//   generated for exit calls to this backend in the SDK will instruct
//   downstream agents to report as distinct from the backend.
//
//   For example: if you have Tier A talking to uninstrumented Backend B
//   which routes to instrumented Tier C, if you set resolve to true,
//   the flow map will be A -> C. If you set resolve to false, the flow
//   map will be A -> B -> C.
func AddBackend(name, backendType string, identifyingProperties map[string]string, resolve bool) error {
    ns := C.CString(name)
    defer C.free(unsafe.Pointer(ns))
    ts := C.CString(backendType)
    defer C.free(unsafe.Pointer(ts))

    // Step 1/4: declare the backend
    C.appd_backend_declare(ts, ns)

    // Step 2/4: add identifying properties
    for key, value := range identifyingProperties {
        ks := C.CString(key)
        vs := C.CString(value)

        result_cint := C.appd_backend_set_identifying_property(ns, ks, vs)
        result := int(result_cint)

        C.free(unsafe.Pointer(ks))
        C.free(unsafe.Pointer(vs))

        if result != 0 {
            return fmt.Errorf("Could not add identifying property (key: %sm value: %s) for backend %s. See SDK log for more info.",
                key, value, name)
        }
    }

    // Step 3/4: prevent agent resolution if desired
    if !resolve {
        result_cint := C.appd_backend_prevent_agent_resolution(ns)
        if int(result_cint) != 0 {
            return fmt.Errorf("Could not prevent agent resolution on backend %s. See SDK log for more info.", name)
        }
    }

    // Step 4/4: add the backend
    result_cint := C.appd_backend_add(ns)
    if int(result_cint) != 0 {
        return fmt.Errorf("Could not add backend %s. See SDK log for more info.", name)
    }

    return nil
}

// Starts a business transaction.
// Returns an opaque handle for the business transaction that was started
func StartBT(name, correlation_header string) BtHandle {
    ns := C.CString(name)
    defer C.free(unsafe.Pointer(ns))
    chs := C.CString(correlation_header)
    defer C.free(unsafe.Pointer(chs))

    return BtHandle(C.bthandle_to_uint(C.appd_bt_begin(ns, chs)))
}

func StartBTWithAppContext(context, name, correlation_header string) BtHandle {
    cs := C.CString(context)
    defer C.free(unsafe.Pointer(cs))
    ns := C.CString(name)
    defer C.free(unsafe.Pointer(ns))
    chs := C.CString(correlation_header)
    defer C.free(unsafe.Pointer(chs))

    return BtHandle(C.bthandle_to_uint(C.appd_bt_begin_with_app_context(cs, ns, chs)))
}

//
// Store a BT handle for retrieval with appd_bt_get.
//
// This function allows you to store a BT in a global registry to retrieve
// later. This is convenient when you need to start and end a BT in
// separate places, and it is difficult to pass the handle to the BT
// through the parts of the code that need it.
//
// When the BT is ended, the handle is removed from the global registry.
//
// Example
// =======
//
//     func BeginTransaction(txid uint64, sku uint64, price float32) {
//         bt := appd.StartBT("payment-processing", "")
//         appd.StoreBT(bt, strconv.FormatUint(txid, 10))
//         // ...
//     }
//
// @param bt
//     The BT to store.
// @param guid
//     A globally unique identifier to associate with the given BT.

func StoreBT(bt BtHandle, guid string) {
    gs := C.CString(guid)
    defer C.free(unsafe.Pointer(gs))
    bth := C.uint_to_bthandle(C.uintptr_t(bt))

    C.appd_bt_store(bth, gs)
}

// // Get a BT handle associated with the given guid by StoreBT.
func GetBT(guid string) BtHandle {
    gs := C.CString(guid)
    defer C.free(unsafe.Pointer(gs))

    return BtHandle(C.bthandle_to_uint(C.appd_bt_get(gs)))
}

// translates the Go "enum" to the C equivalent in appdynamics.h
func GetCErrorLevel(level ErrorLevel) C.enum_appd_error_level {
    switch level {
    case APPD_LEVEL_NOTICE:
        return C.APPD_LEVEL_NOTICE
    case APPD_LEVEL_WARNING:
        return C.APPD_LEVEL_WARNING
    case APPD_LEVEL_ERROR:
        return C.APPD_LEVEL_ERROR
    }
    return C.APPD_LEVEL_ERROR
}

// Add an error to a business transaction.
//
// Errors are reported as part of the business transaction. However, you can
// add an error without marking the business transaction as an error (e.g.,
// for non-fatal errors).
func AddBTError(
    bt BtHandle,
    level ErrorLevel,
    message string,
    mark_bt_as_error bool) {

    ms := C.CString(message)
    defer C.free(unsafe.Pointer(ms))

    var mark_bt_as_error_int int
    if mark_bt_as_error {
        mark_bt_as_error_int = 1
    } else {
        mark_bt_as_error_int = 0
    }

    C.appd_bt_add_error(
        C.uint_to_bthandle(C.uintptr_t(bt)),
        GetCErrorLevel(level),
        ms,
        C.int(mark_bt_as_error_int))
}

// Returns true if the business transaction is taking a snapshot,
// otherwise false.
func IsBTSnapshotting(bt BtHandle) bool {
    bth := C.uint_to_bthandle(C.uintptr_t(bt))
    result := int8(C.appd_bt_is_snapshotting(bth))
    return result != 0
}

// Add user data to a snapshot (if one is being taken).
//
// User data is added to a snapshot if one is occurring. Data should be UTF-8.
//
// It is safe to call this function when a snapshot is not occurring.
// When the given business transcation is NOT snapshotting, this function
// immediately returns. However, if extracting the data to pass to this
// function is expensive, you can use IsBTSnapshotting() to check
// if the business transaction is snapshotting before extracting the data
// and calling this function.
func AddUserDataToBT(bt BtHandle, key, value string) {
    ks := C.CString(key)
    defer C.free(unsafe.Pointer(ks))
    vs := C.CString(value)
    defer C.free(unsafe.Pointer(vs))
    bth := C.uint_to_bthandle(C.uintptr_t(bt))

    C.appd_bt_add_user_data(bth, ks, vs)
}

// Set URL for a snapshot (if one is being taken).
//
// URL is set for a snapshot if one is occurring. Data should be UTF-8.
//
// It is safe to call this function when a snapshot is not occurring.
// When the given business transcation is NOT snapshotting, this function
// immediately returns. However, if extracting the data to pass to this
// function is expensive, you can use IsBTSnapshotting() to check
// if the business transaction is snapshotting before extracting the data
// and calling this function.
func SetBTURL(bt BtHandle, url string) {
    us := C.CString(url)
    defer C.free(unsafe.Pointer(us))
    bth := C.uint_to_bthandle(C.uintptr_t(bt))

    C.appd_bt_set_url(bth, us)
}

// End the given business transaction.
func EndBT(bt BtHandle) {
    bth := C.uint_to_bthandle(C.uintptr_t(bt))
    C.appd_bt_end(bth)
}

// Start an exit call as part of a business transaction.
//
// Returns An opaque handle to the exit call that was started.
func StartExitcall(bt BtHandle, backend string) ExitcallHandle {
    bs := C.CString(backend)
    defer C.free(unsafe.Pointer(bs))
    bth := C.uint_to_bthandle(C.uintptr_t(bt))
    return ExitcallHandle(C.echandle_to_uint(C.appd_exitcall_begin(bth, bs)))
}

// Store an exit call handle for retrieval with appd_exitcall_get.
//
//  This function allows you to store an exit call in a global registry to
//  retrieve later. This is convenient when you need to start and end the
//  call in separate places, and it is difficult to pass the handle through
//  the parts of the code that need it.
//
//  The handle is removed when the exit call (or the BT containing it) ends.
func StoreExitcall(exitcall ExitcallHandle, guid string) {
    gs := C.CString(guid)
    defer C.free(unsafe.Pointer(gs))
    ech := C.uint_to_echandle(C.uintptr_t(exitcall))

    C.appd_exitcall_store(ech, gs)
}

// // Get an exit call associated with a guid via StoreExitcall.
func GetExitcall(guid string) ExitcallHandle {
    gs := C.CString(guid)
    defer C.free(unsafe.Pointer(gs))

    return ExitcallHandle(C.echandle_to_uint(C.appd_exitcall_get(gs)))
}

// Set the details string for an exit call.
//
// This can be used, for example, to add the SQL statement that a DB backend
// has executed as part of the exit call.
// Returns an error on failure.
func SetExitcallDetails(exitcall ExitcallHandle, details string) error {
    ds := C.CString(details)
    defer C.free(unsafe.Pointer(ds))
    ech := C.uint_to_echandle(C.uintptr_t(exitcall))

    result := int(C.appd_exitcall_set_details(ech, ds))
    if result != 0 {
        return errors.New("Could not set exitcall details")
    }

    return nil
}

// Get the header for correlating a business transaction.
//
// If a business transaction makes exit calls that you wish to correlate
// across, you should retrieve the correlation header and inject it into
// your exit call's payload.
//
// The C string that is returned from the C.appd_get_exitcall_get_correlation_header()
// is freed when the exit call ends. Do not free it yourself.
//
// Returns a 7-bit ASCII string containing the correlation information.
//     You can inject this into your payload for an exit call. An
//     agent on the other end can then extract the header from your
//     payload and continue the business transaction. On error, a
//     message is logged and the default header that prevents
//     downstream bt detection is returned.
func GetExitcallCorrelationHeader(exitcall ExitcallHandle) string {
    ech := C.uint_to_echandle(C.uintptr_t(exitcall))
    header := C.appd_exitcall_get_correlation_header(ech)
    return C.GoString(header)
}

// Add an error to the exit call.
func AddExitcallError(
    exitcall ExitcallHandle,
    level ErrorLevel,
    message string,
    mark_bt_as_error bool) {

    ms := C.CString(message)
    defer C.free(unsafe.Pointer(ms))

    var mark_bt_as_error_int int
    if mark_bt_as_error {
        mark_bt_as_error_int = 1
    } else {
        mark_bt_as_error_int = 0
    }

    C.appd_exitcall_add_error(
        C.uint_to_echandle(C.uintptr_t(exitcall)),
        GetCErrorLevel(level),
        ms,
        C.int(mark_bt_as_error_int))
}

// Complete the exit call.
func EndExitcall(exitcall ExitcallHandle) {
    C.appd_exitcall_end(C.uint_to_echandle(C.uintptr_t(exitcall)))
}

// Specifies how to roll up values for the metric over time. There are three ways in which the Controller can roll up metrics, as follows:
// APPD_TIMEROLLUP_TYPE_AVERAGE: It can calculate the average of all reported values in the time period.
// An example of a built-in metric that uses this is the "Average Response Time" metric.
// APPD_TIMEROLLUP_TYPE_SUM: Sum of all reported values in that minute.
// This operation behaves like a counter. An example metric is the "Calls per Minute" metric.
// APPD_TIMEROLLUP_TYPE_CURRENT: Current is the last reported value in the minute.
// If no value is reported in that minute, the last reported value is used. An example of a metric that uses this would be a machine state metric, such as "Max Available (MB)" metric.
type RollupType int

const (
	APPD_TIMEROLLUP_TYPE_AVERAGE RollupType = iota + 1
	APPD_TIMEROLLUP_TYPE_SUM
	APPD_TIMEROLLUP_TYPE_CURRENT
)

func GetCRollupType(rollUp RollupType) C.enum_appd_time_rollup_type {
	switch rollUp {
	case APPD_TIMEROLLUP_TYPE_AVERAGE:
		return C.APPD_TIMEROLLUP_TYPE_AVERAGE
	case APPD_TIMEROLLUP_TYPE_SUM:
		return C.APPD_TIMEROLLUP_TYPE_SUM
	case APPD_TIMEROLLUP_TYPE_CURRENT:
		return C.APPD_TIMEROLLUP_TYPE_CURRENT
	}
    return C.APPD_TIMEROLLUP_TYPE_AVERAGE
}

// Specifies how to aggregate metric values for the tier (a cluster of nodes).
// APPD_CLUSTERROLLUP_TYPE_INDIVIDUAL – Aggregates the metric value by averaging the metric values
// across each node in the tier. For example, "Hardware Resources|Memory|Used %" is a built-in metric
// that uses the individual rollup type.
// APPD_CLUSTERROLLUP_TYPE_COLLECTIVE – Aggregates the metric value by adding up the metric values
// for all the nodes in the tier. For example, "Agent|Metric Upload|Metrics uploaded" is a built-in metric
// that uses the collective rollup type. 
type ClusterRollupType int

const (
	APPD_CLUSTERROLLUP_TYPE_INDIVIDUAL ClusterRollupType = iota + 1
	APPD_CLUSTERROLLUP_TYPE_COLLECTIVE
)

func GetCClusterRollupType(rollUp ClusterRollupType) C.enum_appd_cluster_rollup_type {
	switch rollUp {
	case APPD_CLUSTERROLLUP_TYPE_INDIVIDUAL:
		return C.APPD_CLUSTERROLLUP_TYPE_INDIVIDUAL
	case APPD_CLUSTERROLLUP_TYPE_COLLECTIVE:
		return C.APPD_CLUSTERROLLUP_TYPE_COLLECTIVE
	}
    return C.APPD_CLUSTERROLLUP_TYPE_INDIVIDUAL
}

// A particular metric may not report data for a given minute. This configuration tells the Controller how to set
// the metric's count for that time slice. The count is set to zero if the hole handling type is APPD_HOLEHANDLING_TYPE_REGULAR_COUNTER,
// and set to one if APPD_HOLEHANDLING_TYPE_RATE_COUNTER. In effect, APPD_HOLEHANDLING_TYPE_RATE_COUNTER does not affect aggregation while
// APPD_HOLEHANDLING_TYPE_RATE_COUNTER does. 
type HoleHandlingType int

const (
	APPD_HOLEHANDLING_TYPE_RATE_COUNTER HoleHandlingType = iota + 1
	APPD_HOLEHANDLING_TYPE_REGULAR_COUNTER
)

func GetCHoleHandlingType(counter HoleHandlingType) C.enum_appd_hole_handling_type {
	switch counter {
	case APPD_HOLEHANDLING_TYPE_RATE_COUNTER:
		return C.APPD_HOLEHANDLING_TYPE_RATE_COUNTER
	case APPD_HOLEHANDLING_TYPE_REGULAR_COUNTER:
		return C.APPD_HOLEHANDLING_TYPE_REGULAR_COUNTER
	}
    return C.APPD_HOLEHANDLING_TYPE_RATE_COUNTER
}

// Define a custom metric.
// The API takes ApplicationContext, MetricPath, RollupType which specifies how to rollup
// metric values for this metric over time, e.g., 
// to compute the average over time, pass APPD_TIMEROLLUP_TYPE_AVERAGE, ClusterRollUp which specifies
// how to rollup metric values for this metric across clusters and  HoleHandlingType which specifies
// how to handle holes (gaps where no value has been reported from this metric
func AddCustomMetric(applicationContext, metricPath string, rollup RollupType,
	clusterRollUp ClusterRollupType, holeHandling HoleHandlingType) {

	applicationContext_s := C.CString(applicationContext)
	defer C.free(unsafe.Pointer(applicationContext_s))

	metricPath_s := C.CString(metricPath)
	defer C.free(unsafe.Pointer(metricPath_s))

	C.appd_custom_metric_add(applicationContext_s, metricPath_s,
		GetCRollupType(rollup), GetCClusterRollupType(clusterRollUp),
		GetCHoleHandlingType(holeHandling))
}

// Report a value for a given metric.
// API takes ApplicationContext, MetricPath and the the value to report for the metric.
// The way the value is aggregated is specified by the roll-up parameters to `AddCustomMetric`
func ReportCustomMetric(applicationContext, metricPath string, value int64) {
	applicationContext_s := C.CString(applicationContext)
	defer C.free(unsafe.Pointer(applicationContext_s))

	metricPath_s := C.CString(metricPath)
	defer C.free(unsafe.Pointer(metricPath_s))

	C.appd_custom_metric_report(applicationContext_s, metricPath_s, C.long(value))
}

func TerminateSDK() {
    C.appd_sdk_term()
}
