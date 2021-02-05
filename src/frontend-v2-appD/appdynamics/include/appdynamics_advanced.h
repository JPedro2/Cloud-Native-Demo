/*
 * Copyright (c) AppDynamics, Inc., and its affiliates
 * 2015-2018
 * All Rights Reserved
 */

#ifndef APPDYNAMICS_ADVANCED_H_
#define APPDYNAMICS_ADVANCED_H_

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifdef _WIN32
#define APPD_API __declspec(dllexport)
#else
#define APPD_API __attribute__((visibility("default")))
#endif

typedef void* appd_bt_handle;
typedef void* appd_exitcall_handle;

/* This header file contains advanced functionality that can be
 * used to override the default behavior of the sdk. Please consult
 * the appdynamics documentation before making use of these functions
 */

/**
 * Override the time reported for a BT.
 *
 * The time is specified in milliseconds. By overriding the time with a
 * specific value, the BT's internal timer is disabled. Only the time you
 * specify to this function will be reported for the BT to the controller.
 *
 * This can be useful for reporting BTs that are recorded in external
 * monitoring systems and read into an SDK program.
 *
 * IMPORTANT NOTE: When this function is called, the reported BT will be
 * either the time specified here *or* the sum of all exit call timings,
 * whichever is greatest. This is because you cannot report a BT that
 * takes less time than the exit calls it contains.
 *
 * @param bt
 *     The business transaction to override the timing of.
 * @param timeMS
 *     The time the business transaction took, in milliseconds.
 */
APPD_API void appd_bt_override_time_ms(appd_bt_handle bt, int64_t timeMS);

/**
 * Override the start time reported for a BT.
 * The time is the number of millisecond since start of epoch
 * (midnight, Jan 1, 1970 UTC). By overriding the start time with a
 * specific value, the BT's internal start time is disabled
 * The time specified by this function will be reported as the
 * start time to the controller.
 *
 * This can be useful for reporting BTs that are recorded in external
 * monitoring systems and read into an SDK program.
 *
 * @param bt
 *     The business transaction to override the timing of.
 * @param timeMS
 *     Time in milliseconds since start of epoch (midnight, Jan 1, 1970 UTC).
 */

APPD_API void appd_bt_override_start_time_ms(appd_bt_handle bt, int64_t timeMS);

/**
 * Override the time reported for an exit call.
 *
 * The time is specified in milliseconds. By overriding the time with a
 * specific value, the exit call's internal timer is disabled. Only the time you
 * specify to this function will be reported to the controller.
 *
 * This can be useful for reporting exit calls that are recorded in external
 * monitoring systems and read into an SDK program.
 *
 * @param exitCall
 *     The exit call to override the timing of.
 * @param timeMS
 *     The time the business transaction took, in milliseconds.
 */
APPD_API void appd_exitcall_override_time_ms(appd_exitcall_handle exitCall, int64_t timeMS);

/**
 * Override the start time reported for an exit call.
 *
 * The time is the number of millisecond since start of epoch
 * (midnight, Jan 1, 1970 UTC). By overriding the start time with a
 * specific value, the exit calls's internal start time is disabled
 * The time specified by this function will be reported as the
 * start time to the controller.
 *
 * This can be useful for reporting exit calls that are recorded in external
 * monitoring systems and read into an SDK program.
 *
 * @param exitCall
 *     The exit call to override the timing of.
 * @param timeMS
 *     Time in milliseconds since start of epoch (midnight, Jan 1, 1970 UTC).
 */

APPD_API void appd_exitcall_override_start_time_ms(appd_exitcall_handle exitCall, int64_t timeMS);

#ifdef __cplusplus
} /* extern "C" */

#endif /* !defined(__cplusplus) */

#endif /* APPDYNAMICS_ADVANCED_H_ */
