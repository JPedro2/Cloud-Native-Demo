/*
 * Copyright (c) AppDynamics, Inc., and its affiliates
 * 2015-2018
 * All Rights Reserved
 */
#ifndef APPDYNAMICS_H_
#define APPDYNAMICS_H_

#ifdef __cplusplus
#include <string>
#include <memory>
extern "C" {
#endif

#ifdef _WIN32
#define APPD_API __declspec(dllexport)
#else
#define APPD_API __attribute__((visibility("default")))
#endif

typedef void* appd_bt_handle;
typedef void* appd_exitcall_handle;
typedef void* appd_frame_handle;

#ifdef _WIN32
#pragma pack(push, 8) /* CORE-65451 */
#endif

struct appd_config;
struct appd_context_config;

enum appd_config_log_level
{
  APPD_LOG_LEVEL_TRACE,
  APPD_LOG_LEVEL_DEBUG,
  APPD_LOG_LEVEL_INFO,
  APPD_LOG_LEVEL_WARN,
  APPD_LOG_LEVEL_ERROR,
  APPD_LOG_LEVEL_FATAL
};

#ifdef _WIN32
#pragma pack(pop) /* CORE-65451 */
#endif

/**
 * Initialize the AppDynamics configuration object.
 *
 * @return config
 *     AppDynamics configuration object.
 */
APPD_API struct appd_config* appd_config_init();

/**
 * Default business application name.
 *
 * If app_name, tier_name, and node_name are all set, this is used as the
 * app_name for the default app context (see appd_bt_begin).
 */
APPD_API void appd_config_set_app_name(struct appd_config* cfg, const char* app);

/**
 * Default tier name.
 *
 * If app_name, tier_name, and node_name are all set, this is used as the
 * tier_name for the default app context (see appd_bt_begin).
 */
APPD_API void appd_config_set_tier_name(struct appd_config* cfg, const char* tier);

/**
 * Default node name.
 *
 * This is only used if app_name and tier_name are both set, in which case
 * it is the name of the node for the default app context (see
 * appd_bt_begin).
 */
APPD_API void appd_config_set_node_name(struct appd_config* cfg, const char* node);

/** Host name of the controller.  */
APPD_API void appd_config_set_controller_host(struct appd_config* cfg, const char* host);
APPD_API void appd_context_config_set_controller_host(struct appd_context_config* context_cfg,
                                                      const char* host);

/**
 * Port on which the controller is listening.
 *
 * If not specifed, defaults to 80 when use_ssl is false and 443 when
 * use_ssl is true.
 */
APPD_API void appd_config_set_controller_port(struct appd_config* cfg, const unsigned short port);
APPD_API void appd_context_config_set_controller_port(struct appd_context_config* context_cfg,
                                                      const unsigned short port);

/** Account name for connecting to the controller. */
APPD_API void appd_config_set_controller_account(struct appd_config* cfg, const char* acct);
APPD_API void appd_context_config_set_controller_account(struct appd_context_config* context_cfg,
                                                         const char* acct);

/** Access key for connecting to the controller. */
APPD_API void appd_config_set_controller_access_key(struct appd_config* cfg, const char* key);
APPD_API void appd_context_config_set_controller_access_key(struct appd_context_config* context_cfg,
                                                            const char* key);

/**
 * Flag that specifies if SSL should be used to talk to the controller.
 *
 * Set to a non-zero integer for true. Set to the integer zero for
 * false.
 *
 * Note that SaaS controllers require this to be set to non-zero.
 */
APPD_API void appd_config_set_controller_use_ssl(struct appd_config* cfg, const unsigned int ssl);
APPD_API void appd_context_config_set_controller_use_ssl(struct appd_context_config* context_cfg,
                                                         unsigned int ssl);

/** Host name of the HTTP proxy if using an HTTP proxy to talk to controller.
 * (Optional) */
APPD_API void appd_config_set_controller_http_proxy_host(struct appd_config* cfg, const char* host);
APPD_API void appd_context_config_set_controller_http_proxy_host(
    struct appd_context_config* context_cfg, const char* host);

/** Port name of the HTTP proxy. (Optional; Default; 80) */
APPD_API void appd_config_set_controller_http_proxy_port(struct appd_config* cfg,
                                                         const unsigned short port);
APPD_API void appd_context_config_set_controller_http_proxy_port(
    struct appd_context_config* context_cfg, const unsigned short port);

/** Username to connect to the HTTP proxy with. (Optional) */
APPD_API void appd_config_set_controller_http_proxy_username(struct appd_config* cfg,
                                                             const char* user);
APPD_API void appd_context_config_set_controller_http_proxy_username(
    struct appd_context_config* context_cfg, const char* user);

/** Password to connect to the HTTP proxy with. (Optional) */
APPD_API void appd_config_set_controller_http_proxy_password(struct appd_config* cfg,
                                                             const char* pwd);
APPD_API void appd_context_config_set_controller_http_proxy_password(
    struct appd_context_config* context_cfg, const char* pwd);

/** File containing password to connect to the HTTP proxy with. (Optional) */
APPD_API void appd_config_set_controller_http_proxy_password_file(struct appd_config* cfg,
                                                                  const char* file);
APPD_API void appd_context_config_set_controller_http_proxy_password_file(
    struct appd_context_config* context_cfg, const char* file);

/**
 * CA certificate file (full path)
 *
 * Defaults to the included ca-bundle.crt file. Set this if you
 * choose to use your own certificate file.
 */
APPD_API void appd_config_set_controller_certificate_file(struct appd_config* cfg,
                                                          const char* file);
APPD_API void appd_context_config_set_controller_certificate_file(
    struct appd_context_config* context_cfg, const char* file);

/**
 * CA certificate directory
 *
 * Set this if you have multiple certificate files
 */
APPD_API void appd_config_set_controller_certificate_dir(struct appd_config* cfg, const char* dir);
APPD_API void appd_context_config_set_controller_certificate_dir(
    struct appd_context_config* context_cfg, const char* dir);

/**
 * Host for analytics agent.
 * Defaults to "localhost".
 */
APPD_API void appd_config_set_analytics_host(struct appd_config* cfg, const char* host);

/**
 * Port on which the analytics agent is listening.
 * Defaults to 9090.
 */

APPD_API void appd_config_set_analytics_port(struct appd_config* cfg, const unsigned short port);

/**
 * The minimum level of logging that's allowed. If APPD_LOG_LEVEL_TRACE,
 * all log messages are allowed. If APPD_LOG_LEVEL_FATAL, only the most
 * severe errors are logged. The default is APPD_LOG_LEVEL_INFO.
 */
APPD_API void appd_config_set_logging_min_level(struct appd_config* cfg,
                                                enum appd_config_log_level lvl);

/**
 * The directory to log to. If not set, defaults to "/tmp/appd". The
 * process running the SDK must have permissions to create this
 * directory (if it doesn't already exist), to list the files within it,
 * and to write to the files within it.
 */
APPD_API void appd_config_set_logging_log_dir(struct appd_config* cfg, const char* dir);

/**
 * Maximum number of log files allowed per tenant. Once this is hit, the
 * logs are rotated.
 */
APPD_API void appd_config_set_logging_max_num_files(struct appd_config* cfg,
                                                    const unsigned int num);

/**
 * Maximum size of an individual log file, in bytes. Log files are
 * rotated when they reach this size.
 */
APPD_API void appd_config_set_logging_max_file_size_bytes(struct appd_config* cfg,
                                                          const unsigned int size);

/**
 * appd_sdk_init relies on controller configuration to start business
 * transactions. This is an asynchronous action so that appd_sdk_init does
 * not block your program. This appd_config field allows you to instruct
 * appd_sdk_init to wait for up to init_timeout_ms milliseconds and
 * wait until it has received controller configuration and is ready to
 * capture bt's.
 *
 * X  : Wait up to X milliseconds for controller configuration.
 * 0  : Do not Wait for controller configuration.
 * -1 : Wait indefinitely until controller configuration is received by agent
 */
APPD_API void appd_config_set_init_timeout_ms(struct appd_config* cfg, const int time);

/**
* This controls the behavior of the SDK shutdown (appd_sdk_term).
* By default, any metrics not reported to the controller in the minute before shutdown
^ will be lost.
* Enabling flush_metrics_on_shutdown will cause appd_sdk_term() to block for up to one minute
* to allow the reporting of the final minute's metrics.
*
* @param enable
*     If non-zero will enable flushing. Zero will disable flushing (the default behavior)
*/
APPD_API void appd_config_set_flush_metrics_on_shutdown(struct appd_config* cfg, int enable);

/**
 * Read configuration from environment variables.
 *
 * Environment variables are named like `<prefix>_<base>` where `<base>` is:
 *
 * * APP_NAME for appd_config.app_name
 * * TIER_NAME for appd_config.tier_name
 * * NODE_NAME for appd_config.node_name
 * * CONTROLLER_HOST for appd_config.controller.host
 * * CONTROLLER_PORT for appd_config.controller.port
 * * ANALYTICS_HOST for appd_condif.analytics_agent.host
 * * ANALYTICS_PORT for appd_condif.analytics_agent.port
 * * CONTROLLER_ACCOUNT for appd_config.controller.account
 * * CONTROLLER_ACCESS_KEY for appd_config.controller.access_key
 * * CONTROLLER_USE_SSL for appd_config.controller.use_ssl
 * * CONTROLLER_HTTP_PROXY_HOST for appd_config.http_proxy.host
 * * CONTROLLER_HTTP_PROXY_PORT for appd_config.http_proxy.port
 * * CONTROLLER_HTTP_PROXY_USERNAME for appd_config.http_proxy.username
 * * CONTROLLER_HTTP_PROXY_PASSWORD_FILE for appd_config.http_proxy.password_file
 * * INIT_TIMEOUT_MS for appd_config.init_timeout_ms
 * * FLUSH_METRICS_ON_SHUTDOWN for appd_config_set_flush_metrics_on_shutdown
 *
 * The `<prefix>` is the value of the `prefix` argument to this function. If
 * the passed prefix is NULL or empty, then "APPD_SDK" is used.
 *
 * For the `CONTROLLER_USE_SSL` environment variable, values of "off", "0", "f",
 * and "false" (case insensitive) set use_ssl to false. Any other value sets
 * use_ssl to true.
 *
 * Note that environment variables are NOT read by default. You must callthis
 * function if you wish to be able to configure the SDK via environment
 * variables.
 *
 * Note also that there is no built-in way to add multiple app contexts via
 * environment variables. You will have to build your own way of doing that.
 */
APPD_API void appd_config_getenv(struct appd_config* cfg, const char* prefix);

/**
 * Initialize the AppDynamics context (tenant) configuration object.
 *
 * @return config
 *     AppDynamics context configuration object.
 */
APPD_API struct appd_context_config* appd_context_config_init(const char* context);

/**
 * Business application name for this context
 */
APPD_API void appd_context_config_set_app_name(struct appd_context_config* context_cfg,
                                               const char* app);

/**
 * Tier name for this context
 */
APPD_API void appd_context_config_set_tier_name(struct appd_context_config* context_cfg,
                                                const char* tier);

/**
 * Node name for this context
 */
APPD_API void appd_context_config_set_node_name(struct appd_context_config* context_cfg,
                                                const char* node);

/**
 * Add application context to AppDynamics SDK for multi-tenancy.
 *
 * @param context_cfg
 *     AppDynamics context configuration object
 */
APPD_API int appd_sdk_add_app_context(struct appd_context_config* context_cfg);

/**
 * Initialize the AppDynamics SDK.
 *
 * @param config
 *     AppDynamics configuration object.
 * @return
 *     On success, 0 is returned. Otherwise, a non-zero value is returned.
 */
APPD_API int appd_sdk_init(const struct appd_config* config);

/**
 * Built-in exit call types.
 */
#define APPD_BACKEND_HTTP "HTTP"
#define APPD_BACKEND_DB "DB"
#define APPD_BACKEND_CACHE "CACHE"
#define APPD_BACKEND_RABBITMQ "RABBITMQ"
#define APPD_BACKEND_WEBSERVICE "WEB_SERVICE"
#define APPD_BACKEND_JMS "JMS"
#define APPD_BACKEND_WEBSPHEREMQ "WEBSPHERE_MQ"

/**
 * Declare the existence of a backend.
 *
 * @param type
 *     One of the APPD_BACKEND_xxx constants or any string.
 * @param unregistered_name
 *     The name to give the backend if it has not been registered with the
 *     controller.
 */
APPD_API void appd_backend_declare(const char* type, const char* unregistered_name);

/**
 * Set an identifying property of a backend. This must be called with a valid
 * key before appd_backend_add() for well known backend types.
 *
 * @param backend
 * @param key
 * @param value
 * @return
 *     Zero on success, otherwise non-zero. If non-zero is returned, a
 *     message is logged describing the error.
 */
APPD_API int appd_backend_set_identifying_property(const char* backend, const char* key,
                                                   const char* value);

/**
 * Call to prevent a downstream agent as resolving as this backend. This
 * must be called before appd_backend_add().
 *
 * Normally, if an agent picks up a correlation header for an unresolved
 * backend, it will resolve itself as that backend. This is usually the
 * desired behavior.
 *
 * However, if the backend is actually an uninstrumented tier that is
 * passing through the correlation header (for example, a message queue
 * or proxy), then you may wish the backend to show up distinct from the
 * tier that it routes to. If you call this function, correlation headers
 * generated for exit calls to this backend in the SDK will instruct
 * downstream agents to report as distinct from the backend.
 *
 * For example: if you have Tier A talking to uninstrumented Backend B
 * which routes to instrumented Tier C, if you do NOT call this function,
 * the flow map will be A -> C. If you DO call this function, the flow
 * map will be A -> B -> C.
 *
 * @param backend
 * @return
 *     Zero on success, otherwise non-zero. If non-zero is returned, a
 *     message is logged describing the error.
 */
APPD_API int appd_backend_prevent_agent_resolution(const char* backend);

/**
 * Add a declared backend.
 *
 * @param backend
 * @return
 *     Zero on success, otherwise non-zero. If non-zero is returned, a
 *     message is logged describing the error. The most common error is that a
 *     backend with the same identifying properties has already been added.
 */
APPD_API int appd_backend_add(const char* backend);

/**
 * Start a business transaction.
 *
 * @param context
 *     The application context name this business tranaction belongs to
 * @param name
 *     The name to give the business transaction.
 * @param correlation_header
 *     A correlation header if this is a continuing transaction, else NULL.
 * @return
 *     An opaque handle for the business transaction that was started
 */
APPD_API appd_bt_handle appd_bt_begin(const char* name, const char* correlation_header);

APPD_API appd_bt_handle appd_bt_begin_with_app_context(const char* context, const char* name,
                                                       const char* correlation_header);

/**
 * Store a BT handle for retrieval with appd_bt_get.
 *
 * This function allows you to store a BT in a global registry to retrieve
 * later. This is convenient when you need to start and end a BT in
 * separate places, and it is difficult to pass the handle to the BT
 * through the parts of the code that need it.
 *
 * When the BT is ended, the handle is removed from the global registry.
 *
 * Example
 * =======
 *
 *     int begin_transaction(uint64_t txid, uint64_t sku, float price)
 *     {
 *         appd_bt_handle bt = appd_bt_begin("payment-processing", NULL);
 *         appd_bt_store(bt, std::to_string(txid).c_str());
 *         // ...
 *     }
 *
 * @param bt
 *     The BT to store.
 * @param guid
 *     A globally unique identifier to associate with the given BT.
 */
APPD_API void appd_bt_store(appd_bt_handle bt, const char* guid);

/**
 * Get a BT handle associated with the given guid by appd_bt_store.
 *
 * @param guid
 *     The globally unique identifier that was passed to appd_bt_store.
 * @return
 *     The BT handle associated with the given guid. If no BT handle was
 *     associated with the guid, or if the BT ended prior to getting it,
 *     a warning is logged and the returned handle may be safely used in
 *     other API functions but will cause these functions to immediately
 *     return without doing anything.
 */
APPD_API appd_bt_handle appd_bt_get(const char* guid);

/**
 * Error levels for passing to appd_bt_add_error() and
 * appd_exitcall_add_error().
 */
enum appd_error_level
{
  APPD_LEVEL_NOTICE,
  APPD_LEVEL_WARNING,
  APPD_LEVEL_ERROR
};

/**
 * Add an error to a business transaction.
 *
 * Errors are reported as part of the business transaction. However, you can
 * add an error without marking the business transaction as an error (e.g.,
 * for non-fatal errors).
 *
 * @param bt
 *     The business transaction to add the error to.
 * @param level
 *     The error level. One of the APPD_LEVEL_xxx constants.
 * @param message
 *     The error message.
 * @param mark_bt_as_error
 *     If true, the business transaction is marked as an error. Otherwise, the
 *     error is added but the transaction is not marked as an error.
 */
APPD_API void appd_bt_add_error(appd_bt_handle bt, enum appd_error_level level, const char* message,
                                int mark_bt_as_error);

/**
 * Return non-zero if the business transaction is taking a snapshot.
 *
 * @param bt
 *     The business transaction to check for snapshotting.
 * @return
 *     Non-zero if the given business transaction is taking a snapshot.
 *     Otherwise, zero.
 */
APPD_API char appd_bt_is_snapshotting(appd_bt_handle bt);

/**
 * Add user data to a snapshot (if one is being taken) or for analytics (if
 * analytics is enabled for this bt).
 *
 * Data should be either 7-bit ASCII or UTF-8.
 *
 * It is safe to call this function when a snapshot is not occurring or analytics
 * is not enabled.
 * When the data is for snapshotting only and if extracting the data to pass to
 * this function is expensive, you can use `appd_bt_is_snapshotting` to check
 * if the business transaction is snapshotting before extracting the data
 * and calling this function.
 *
 * @param bt
 *     The business transaction to add the user data to, if it's taking a
 *     snapshot.
 * @param key
 *     The name of the user data to add to the snapshot as 7-bit ASCII or
 *     UTF-8.
 * @param value
 *     The value of the user data to add to the snapshot as 7-bit ASCII or
 *     UTF-8.
 */
APPD_API void appd_bt_add_user_data(appd_bt_handle bt, const char* key, const char* value);

/**
 * Set URL for a snapshot (if one is being taken).
 *
 * URL is set for a snapshot if one is occurring. Data should be
 * either 7-bit ASCII or UTF-8.
 *
 * It is safe to call this function when a snapshot is not occurring.
 * When the given business transcation is NOT snapshotting, this function
 * immediately returns. However, if extracting the data to pass to this
 * function is expensive, you can use `appd_bt_is_snapshotting` to check
 * if the business transaction is snapshotting before extracting the data
 * and calling this function.
 *
 * @param bt
 *     The business transaction to add the user data to, if it's taking a
 *     snapshot.
 * @param url
 *     The value of the URL for the snapshot as 7-bit ASCII or UTF-8.
 */
APPD_API void appd_bt_set_url(appd_bt_handle bt, const char* url);

/**
 * End the given business transaction.
 *
 * @param bt
 *     The handle to the business transaction to end.
 */
APPD_API void appd_bt_end(appd_bt_handle bt);

/**
 * Start an exit call as part of a business transaction.
 *
 * @param bt
 * @param backend
 * @return
 *     An opaque handle to the exit call that was started. NULL if the call fails.
 */
APPD_API appd_exitcall_handle appd_exitcall_begin(appd_bt_handle bt, const char* backend);

/**
 * Store an exit call handle for retrieval with appd_exitcall_get.
 *
 * This function allows you to store an exit call in a global registry to
 * retrieve later. This is convenient when you need to start and end the
 * call in separate places, and it is difficult to pass the handle through
 * the parts of the code that need it.
 *
 * The handle is removed when the exit call (or the BT containing it) ends.
 *
 * Example
 * =======
 *
 *     appd_exitcall_handle ec = appd_exitcall_begin(bt, "authdb");
 *     appd_exitcall_store(ec, "login-exit");
 *
 * @param exitcall
 *     The exit call to store.
 * @param guid
 *     A globally unique identifier to associate with the given call.
 */
APPD_API void appd_exitcall_store(appd_exitcall_handle exitcall, const char* guid);

/**
 * Get an exit call associated with a guid via appd_exitcall_store.
 *
 * @param guid
 *     The globally unique identifier that was passed to appd_exitcall_store.
 * @return
 *     The handle associated with the given guid. If no handle was associated
 *     with the guid, or if the call ended prior to getting it, a warning is
 *     logged and the returned handle may be safely used in other API
 *     functions but will cause these functions to immediately return without
 *     doing anything.
 */
APPD_API appd_exitcall_handle appd_exitcall_get(const char* guid);

/**
 * Set the details string for an exit call.
 *
 * This can be used, for example, to add the SQL statement that a DB backend
 * has executed as part of the exit call.
 *
 * @param exitcall
 * @param details
 *     An arbitrary detail string to add to the exit call.
 * @return
 *     Zero on success. Non-zero on error. On error, a message is logged.
 */
APPD_API int appd_exitcall_set_details(appd_exitcall_handle exitcall, const char* details);

/**
 * The default name of the correlation header.
 *
 * Other AppDynamics agents perform automatic correlation for certain
 * types of entry and exit points by looking for a correlation header
 * in the payload with this name.
 *
 * Upstream Correlation
 * ====================
 *
 * When your SDK instrumented process receives a continuing transaction
 * from an upstream agent that supports automatic correlation, extract
 * the header named APPD_CORRELATION_HEADER_NAME from the incoming
 * payload and pass it to appd_bt_begin():
 *
 *   const char* hdr = http_get_header(req, APPD_CORRELATION_HEADER_NAME);
 *   appd_bt_handle bt = appd_bt_begin("fraud detection", hdr);
 *
 * If the header retrieved by the third-party http_get_header() function
 * valid, the BT started on the second line will be a continuation of the
 * business transaction started by the upstream service.
 *
 * Downstream Correlation
 * ======================
 *
 * If you are making an exit call where a downstream agent supports
 * automatic correlation, inject a header named APPD_CORREATION_HEADER_NAME
 * into the outgoing payload. The value of the header is retrieved using the
 * appd_exitcall_get_correlation_header() function:
 *
 *   appd_exitcall_handle inventory = appd_exitcall_begin(bt, "inventory");
 *   const char* hdr = appd_exitcall_get_correlation_header(inventory);
 *   http_request req;
 *   http_init(&req, HTTP_POST, "https://inventory/holds/%s", sku);
 *   http_set_header(&req, APPD_CORRELATION_HEADER_NAME, hdr);
 *   http_perform(&req);
 *
 * In this example, the hypothetical third-party http_xxx functions are used
 * to make an HTTP POST request with an HTTP header containing the correlation
 * header as retrieved by appd_exitcall_get_correlation_header(). The header
 * is given the name APPD_CORRELATION_HEADER_NAME. A downstream agent that
 * supports automatic correlation for HTTP entry points will automatically
 * extract the correlation header and perform distributed transaction tracing.
 */
#define APPD_CORRELATION_HEADER_NAME "singularityheader"

/**
 * Get the header for correlating a business transaction.
 *
 * If a business transaction makes exit calls that you wish to correlate
 * across, you should retrieve the correlation header and inject it into
 * your exit call's payload.
 *
 * The returned string is freed when the exit call ends. Do not free it
 * yourself.
 *
 * @param exitcall
 * @return
 *     A 7-bit ASCII string containing the correlation information.
 *     You can inject this into your payload for an exit call. An
 *     agent on the other end can then extract the header from your
 *     payload and continue the business transaction. On error, a
 *     message is logged and the default header that prevents
 *     downstream bt detection is returned.
 */
APPD_API const char* appd_exitcall_get_correlation_header(appd_exitcall_handle exitcall);

/**
 * Add an error to the exit call.
 *
 * @param exitcall
 * @param level
 * @param message
 * @param mark_bt_as_error
 */
APPD_API void appd_exitcall_add_error(appd_exitcall_handle exitcall, enum appd_error_level level,
                                      const char* message, int mark_bt_as_error);

/**
 * Complete the exit call.
 *
 * @param exitcall
 */
APPD_API void appd_exitcall_end(appd_exitcall_handle exitcall);

enum appd_time_rollup_type
{
  /**
   * Compute the average value of the metric over time
   */
  APPD_TIMEROLLUP_TYPE_AVERAGE = 1,

  /**
   * Compute the sum of the value of the metric over time
   */
  APPD_TIMEROLLUP_TYPE_SUM,

  /**
   * Report the current value of the metric
   */
  APPD_TIMEROLLUP_TYPE_CURRENT
};

enum appd_cluster_rollup_type
{
  /**
   * Roll-up the value individually for each member of the cluster
   */
  APPD_CLUSTERROLLUP_TYPE_INDIVIDUAL = 1,

  /**
   * Roll-up the value across all members of the cluster
   */
  APPD_CLUSTERROLLUP_TYPE_COLLECTIVE
};

enum appd_hole_handling_type
{
  APPD_HOLEHANDLING_TYPE_RATE_COUNTER = 1,
  APPD_HOLEHANDLING_TYPE_REGULAR_COUNTER
};

/**
 * Define a custom metric.
 *
 * @param application_context
 *     The application context for this custom metric
 * @param metric_path
 *     The path of the custom metric
 * @param time_rollup_type
 *     Specifies how to rollup metric values for this metric over time, e.g.,
 *     to compute the average over time, pass APPD_TIMEROLLUP_TYPE_AVERAGE
 * @param cluster_rollup_type
 *     Specifies how to rollup metric values for this metric across clusters
 * @param hole_handling_type
 *     Specifies how to handle holes (gaps where no value has been reported
 *     from this metric)
 */
APPD_API void appd_custom_metric_add(const char* application_context, const char* metric_path,
                                     enum appd_time_rollup_type time_rollup_type,
                                     enum appd_cluster_rollup_type cluster_rollup_type,
                                     enum appd_hole_handling_type hole_handling_type);

/**
 * Report a value for a given metric.
 *
 * @param application_context
 *     The application context for this custom metric
 * @param metric_path
 *     The path of the metric to report, as defined by `appd_custom_metric_add`
 * @param value
 *     The value to report for the metric. The way the value is aggregated is
 *     specified by the roll-up parameters to `appd_custom_metric_add`
 */
APPD_API void appd_custom_metric_report(const char* application_context, const char* metric_path,
                                        long value);

/**
 * This is the language of the current frame (will be expanded in the future).
 */
enum appd_frame_type
{
  APPD_FRAME_TYPE_CPP = 1
};

/**
 * Record start of a frame in a call graph that can be reported with a BT.
 * The info is collected only if the BT is snapshotting.
 * This should be called near the start of the method code and must be paired with appd_frame_end
 * when returning from the method.
 * In C++ code please use the Frame class (below).
 * The current implementation collects only frames from one thread for a BT. Subsequent calls from
 * a different thread will be dropped.
 *
 * @param bt
 *     The business transaction for the call graph.
 * @param frame_type
 *     The type of the frame. When used in C or C++ code, use APPD_FRAME_TYPE_CPP.
 * @param class_name
 *     The name of the class if this method is a member of the class, else NULL.
 * @param method_name
 *     The name of the method
 * @param file
 *     The path of the source file.
 * @param line_number
 *     The line number in the source file.
 * @return
 *     An opaque handle for the frame. NULL if an error happened.
 */
APPD_API appd_frame_handle appd_frame_begin(appd_bt_handle bt, enum appd_frame_type frame_type,
                                            const char* class_name, const char* method_name,
                                            const char* file, int line_number);

/**
 * Record the end of a frame. Must match a corresponding appd_frame_begin.
 * Call this before returning from the method. Note that if exceptions are thrown, you must handle
 * this in your code, otherwise this part of the callgraph will be discarded.
 *
 * @param bt
 *     The business transaction for the call graph.
 * @param frame
 *     The handle of returned by the corresponding appd_frame_begin
 */
APPD_API void appd_frame_end(appd_bt_handle bt, appd_frame_handle frame);

/**
 * Terminate the AppDynamics SDK.
 */
APPD_API void appd_sdk_term();

#ifdef __cplusplus

namespace appd {
namespace sdk {
class CallGraph;
class CallGraphElement;
}  // namespace sdk
}  // namespace appd

APPD_API
appd::sdk::CallGraphElement* appd_construct_callgraph_element(
    const appd::sdk::CallGraph* callgraph, const std::string& class_name,
    const std::string& method_name, const std::string& file_path, int32_t line_number,
    int32_t time_msec, appd_frame_type frame_type);

APPD_API
bool appd_callgraph_add_to_snapshot(const appd::sdk::CallGraph* callgraph);

} /* extern "C" */

namespace appd {
namespace sdk {

template <typename HandleT>
class HandleWrapper
{
public:
  HandleWrapper() : m_handle(), m_borrowed_handle(false) {}
  HandleWrapper(HandleT handle) : m_handle(handle), m_borrowed_handle(true) {}
  virtual ~HandleWrapper() = default;

  HandleT handle() { return m_handle; }
  const HandleT handle() const { return m_handle; }

  virtual void add_error(enum appd_error_level level, const char* message,
                         bool mark_bt_as_error = true) = 0;

  void add_error(enum appd_error_level level, const std::string& message,
                 bool mark_bt_as_error = true)
  {
    add_error(level, message.c_str(), mark_bt_as_error);
  }

protected:
  HandleT m_handle;
  bool m_borrowed_handle;

private:
  HandleWrapper(const HandleWrapper&);
  HandleWrapper& operator=(const HandleWrapper&);
};

/**
 * Represents an AppDynamics business transaction for C++ applications.
 *
 * An instance of this class begins a business transaction (as if by
 * calling `appd_bt_begin`) upon construction and ends the business
 * transaction upon destruction. This allows matching a BT's lifetime
 * to a scope:
 *
 *     {
 *         appd::sdk::BT bt("compute");
 *
 *         // all code in this scope is part of the "compute" BT
 *         // `bt` is automatically ended when it goes out of scope
 *     }
 *
 * When a BT has a lifetime that depends on the nondeterministic
 * lifetimes of other objects, you can use a shared pointer to a BT
 * to keep the BT alive for the lifetimes of its dependencies:
 *
 *     auto bt = std::make_shared<appd::sdk::BT>("compute");
 *     auto prod = createProducer(bt);
 *     auto consumers = createConsumers(bt, NUM_WORKERS);
 *
 * In this case, the `bt` ends when the last reference to it ends.
 *
 * A BT may not be copied.
 */
class BT : public HandleWrapper<appd_bt_handle>
{
public:
  /**
   * Construct a BT object with the given name.
   *
   * If a valid AppDynamics correlation_header is passed (as generated by
   * the SDK or another agent), the BT is marked as continuing the
   * transaction described in the header.
   *
   * @param name
   *     The name to give the BT, if it is originating
   * @param correlation_header
   *     An AppDynamics correlation header or NULL
   */
  BT(const char* name, const char* correlation_header = NULL) : HandleWrapper<appd_bt_handle>()
  {
    init(name, correlation_header);
  }

  /**
   * Construct a BT object with the given name.
   *
   * The BT is originating.
   *
   * @param name
   *     The name to give the BT
   */
  explicit BT(const std::string& name) : HandleWrapper<appd_bt_handle>() { init(name.c_str()); }

  /**
   * Construct a continuing BT object with the given name and
   * correlation header.
   *
   * The name is used only if the correlation header is empty or
   * otherwise invalid, in which case this BT will be reported as an
   * originating BT with the specified name.
   *
   * @param name
   *     The name to give the BT if the correlation header is invalid
   * @param correlation_header
   *     An AppDynamics correlation header
   */
  BT(const std::string& name, const std::string& correlation_header)
      : HandleWrapper<appd_bt_handle>()
  {
    init(name.c_str(), correlation_header.c_str());
  }

  /**
   * Wrap an appd_bt_handle in a BT object. The BT object does not
   * own the wrapped handle: destructing this object will not end
   * the wrapped BT.
   *
   * @param bt
   *     The handle of a BT, as returned by appd_bt_begin or appd_bt_get
   */
  BT(appd_bt_handle bt) : HandleWrapper<appd_bt_handle>(bt) {}

  ~BT()
  {
    if (!m_borrowed_handle) {
      appd_bt_end(m_handle);
    }
  }

  /**
   * Calls appd_bt_store on this BT with the given guid.
   */
  void store(const char* guid) { appd_bt_store(m_handle, guid); }

  /**
   * Calls appd_bt_store on this BT with the given guid.
   */
  void store(const std::string& guid) { store(guid.c_str()); }

  /**
   * Calls appd_bt_is_snapshotting on this BT.
   */
  bool is_snapshotting() const { return appd_bt_is_snapshotting(m_handle); }

  /**
   * Calls appd_bt_add_error on this BT with the given error information.
   */
  virtual void add_error(enum appd_error_level level, const char* message,
                         bool mark_bt_as_error = true)
  {
    appd_bt_add_error(m_handle, level, message, mark_bt_as_error);
  }

  /**
   * Calls appd_bt_add_user_data on this BT with the given key and value.
   */
  void add_user_data(const char* key, const char* value)
  {
    appd_bt_add_user_data(m_handle, key, value);
  }

  /**
   * Calls appd_bt_add_user_data on this BT with the given key and value.
   */
  void add_user_data(const std::string& key, const std::string& value)
  {
    add_user_data(key.c_str(), value.c_str());
  }

  /**
   * Calls appd_bt_set_url on this BT with the given URL.
   */
  void set_url(const char* url) { appd_bt_set_url(m_handle, url); }

  /**
   * Calls appd_bt_set_url on this BT with the given URL.
   */
  void set_url(const std::string& url) { set_url(url.c_str()); }

protected:
  void init(const char* name, const char* correlation_header = NULL)
  {
    m_handle = appd_bt_begin(name, correlation_header);
  }

private:
  BT();
};

/**
 * Represents an AppDynamics exit call as part of a business transaction.
 *
 * As with `appd::sdk::BT`, this class allows automatically ending an
 * exit call when it goes out of scope:
 *
 *     {
 *         appd::sdk::BT bt("compute");
 *
 *         {
 *             appd::sdk::ExitCall db_call(bt, "primary-db");
 *             auto db = get_db_connection();
 *             db_call.set_details(query);
 *             db.execute(query, params);
 *         }  // exit call ends automatically
 *
 *         // ... more that happens as part of the BT ...
 *     }
 *
 * For managing an exit call with a more complex lifetime, you are
 * encouraged to look at a `std::unique_ptr<appd::sdk::ExitCall>` or
 * `std::shared_ptr<appd::sdk::ExitCall>`.
 *
 * An ExitCall may not be copied.
 */
class ExitCall : public HandleWrapper<appd_exitcall_handle>
{
public:
  /**
   * Construct an object representing an ExitCall.
   *
   * @param bt
   *     The BT object that owns this exit call
   * @param backend
   *     The name of the registered backend this exit call talks to
   */
  ExitCall(BT& bt, const char* backend) { init(bt, backend); }

  /**
   * Construct an object representing an ExitCall.
   *
   * @param bt
   *     The BT object that owns this exit call
   * @param backend
   *     The name of the registered backend this exit call talks to
   */
  ExitCall(BT& bt, const std::string& backend) { init(bt, backend.c_str()); }

  /**
   * Construct an object wrapping the given exit call handle.
   *
   * The handle is not owned by this object: the destructor will not call
   * appd_exitcall_end on the given handle.
   *
   * @param exitcall
   *     An exit call handle as returned by appd_exitcall_begin or
   *     appd_exitcall_get
   */
  ExitCall(appd_exitcall_handle exitcall)
      : HandleWrapper<appd_exitcall_handle>(exitcall), m_loaded_correlation_header(false)
  {
  }

  ~ExitCall()
  {
    if (!m_borrowed_handle) {
      appd_exitcall_end(m_handle);
    }
  }

  /**
   * Calls appd_exitcall_store on this exit call with the given guid.
   */
  void store(const char* guid) { appd_exitcall_store(m_handle, guid); }

  /**
   * Calls appd_exitcall_store on this exit call with the given guid.
   */
  void store(const std::string& guid) { store(guid.c_str()); }

  /**
   * Calls appd_exitcall_get_correlation_header on this exit call.
   */
  const std::string& get_correlation_header()
  {
    if (!m_loaded_correlation_header) {
      const char* hdr = appd_exitcall_get_correlation_header(m_handle);
      m_loaded_correlation_header = true;

      if (hdr) {
        correlation_header = hdr;
      }
    }

    return correlation_header;
  }

  /**
   * Calls appd_exitcall_set_details on this exit call with the given
   * information.
   */
  int set_details(const char* details) { return appd_exitcall_set_details(m_handle, details); }

  /**
   * Calls appd_exitcall_set_details on this exit call with the given
   * information.
   */
  int set_details(const std::string& details) { return set_details(details.c_str()); }

  /**
   * Calls appd_exitcall_add_error on this exit call with the given error
   * information.
   */
  virtual void add_error(enum appd_error_level level, const char* message,
                         bool mark_bt_as_error = true)
  {
    appd_exitcall_add_error(m_handle, level, message, mark_bt_as_error);
  }

protected:
  void init(BT& bt, const char* backend)
  {
    m_handle = appd_exitcall_begin(bt.handle(), backend);
    m_loaded_correlation_header = false;
  }

private:
  ExitCall();

  bool m_loaded_correlation_header;
  std::string correlation_header;
};

/**
 * Represents a frame in a call graph that can be reported with a BT.
 *
 * Each BT has a stack of active frames. When a Frame object is constructed,
 * it is pushed onto the BT's stack. The constructed Frame has as its parent
 * the Frame that was at the top of the stack at the time of its construction.
 * If the stack was empty when the Frame was created, it is the root of the
 * BT's call graph and has no parent.
 *
 * It is recommended to create these objects on the stack (using the RAII
 * pattern) and from a single thread.
 */

class Frame
{
public:
  /**
   * @param bt
   *     The BT object that owns this function call
   * @param frame_type
   *     The type of the frame. When used in C or C++ code, use APPD_FRAME_TYPE_CPP.
   * @param class_name
   *     The name of the class if this method is a member of the class, else NULL.
   * @param method_name
   *     The name of the method
   * @param file
   *     The path of the source file.
   * @param line_number
   *     The line number in the source file.
   */
  Frame(BT& bt, appd_frame_type frame_type, const char* class_name, const char* method_name,
        const char* file, int line_number)
      : m_bt(bt)
  {
    m_frame_handle =
        appd_frame_begin(m_bt.handle(), frame_type, class_name, method_name, file, line_number);
  }

  Frame() = delete;
  Frame(const Frame&) = delete;
  Frame& operator=(const Frame&) = delete;

  ~Frame() { appd_frame_end(m_bt.handle(), m_frame_handle); }

private:
  BT& m_bt;
  appd_frame_handle m_frame_handle;
};

/**
 * A call graph element
 *
 * A member of the CallGraph tree
 */
class CallGraphElement
{
protected:
  CallGraphElement() = default;
  CallGraphElement(const CallGraphElement&) = delete;
  CallGraphElement& operator=(const CallGraphElement&) = delete;

public:
  virtual ~CallGraphElement() = default;

  /**
   * @param time_msec
   *     The time in milliseconds for the execution of this method
   * For the other parameters see the "Frame" class.
   */
  virtual CallGraphElement& add_child(const std::string& class_name, const std::string& method_name,
                                      const std::string& file_path, int32_t line_number,
                                      int32_t time_msec, appd_frame_type frame_type) = 0;

  virtual CallGraphElement& add_exit_call(appd_exitcall_handle exit_call, int32_t time_msec) = 0;
};

/**
 * A pre populated call graph.
 *
 * User needs to provide the execution time and also construct the call graph
 * tree by specifying the parent/child (caller/called) relationships.
 * After the tree is constructed, it can be added to a business transaction using
 * 'add_to_snapshot'. You can use `appd_bt_is_snapshotting` to check
 * if the business transaction is snapshotting before generating the data
 * and calling this function.
 */

class CallGraph
{
public:
  /**
   * @param bt
   *     The business transaction for this call graph
   * @param time_msec
   *     The time in milliseconds for the execution of this method
   * For the other parameters see the "Frame" class. They refer to the root of the callgraph.
   */
  CallGraph(BT& bt, const std::string& class_name, const std::string& method_name,
            const std::string& file_path, int32_t line_number, int32_t time_msec,
            appd_frame_type frame_type)
      : m_bt(bt),
        m_root(appd_construct_callgraph_element(this, class_name, method_name, file_path,
                                                line_number, time_msec, frame_type))
  {
  }

  ~CallGraph() = default;

  CallGraph() = delete;
  CallGraph(const CallGraph&) = delete;
  CallGraph& operator=(const CallGraph&) = delete;

  bool add_to_snapshot() const { return appd_callgraph_add_to_snapshot(this); }

  CallGraphElement& root() const { return *m_root; }
  BT& bt() { return m_bt; }
  const BT& bt() const { return m_bt; }

private:
  BT& m_bt;
  const std::unique_ptr<CallGraphElement> m_root;
};

}  // namespace sdk
}  // namespace appd

#endif /* !defined(__cplusplus) */

/**
 * Frame and callstack helpers.
 */
#ifndef __has_attribute
#define __has_attribute(x) 0
#endif

#if __STDC_VERSION__ >= 199901L || __cplusplus > 199711L
#define APPD_FUNCTION_NAME __func__
#elif __GNUC__ >= 2 || defined(_MSC_VER)
#define APPD_FUNCTION_NAME __FUNCTION__
#else
#define APPD_FUNCTION_NAME "unknown"
#endif

#if defined(__cplusplus)

#define APPD_AUTO_FRAME(bt)                                                                      \
  appd::sdk::Frame __appd_f##__COUNTER__((bt), APPD_FRAME_TYPE_CPP, nullptr, APPD_FUNCTION_NAME, \
                                         __FILE__, __LINE__)

#elif __has_attribute(cleanup) || __GNUC__ >= 4

#define APPD_AUTO_FRAME(bt)                                                          \
  appd_frame_handle __appd_f##__COUNTER__ __attribute__((cleanup(appd_frame_end))) = \
      appd_frame_begin((bt), APPD_FRAME_TYPE_CPP, NULL, APPD_FUNCTION_NAME, __FILE__, __LINE__)

#endif

#endif /* APPDYNAMICS_H_ */
