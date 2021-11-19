/**
 * Intersight Helper
 * 
 * This helper class purpose is to generate the right signed/encrypted 
 * request headers for querying Intersigh. The original module, 
 * intersight-rest has been written by Matthew Garret, with the help of 
 * David Soper, Chris Gascoigne, John McDonough
 * Original Intersight rest module can be found here:
 *  - https://github.com/dcmattyg/intersight-rest
 *  - https://www.npmjs.com/package/intersight-rest
 * 
 * Copyright (c) 2018 Cisco and/or its affiliates.
 * This software is licensed to you under the terms of the Cisco Sample
 * Code License, Version 1.0 (the "License"). You may obtain a copy of the
 * License at:
 * 
 *              https://developer.cisco.com/docs/licenses
 * 
 * All use of the material herein must be in accordance with the terms of
 * the License. All rights not expressly granted by the License are
 * reserved. Unless required by applicable law or agreed to separately in
 * writing, software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied.
 */

const request = require('request-promise');
const crypto = require('crypto');
const url = require('url');
const qs = require('qs');

const host = url.parse('https://intersight.com/wo/api/v3');
const digestAlgorithm = 'rsa-sha256';

var privateKey = null;
var publicKey = null;


/**
 * Set RSA public key.
 * @function set_publicKey
 * @public
 * @param  {String} pubKey  RSA public key.
 */
const setPublicKey = function set_publicKey(pubKey) {
    publicKey = pubKey;
}

/**
 * Set RSA private key.
 * @function set_privateKey
 * @public
 * @param  {String} prvKey  RSA private key.
 */
const setPrivateKey = function set_privateKey(prvKey) {
    privateKey = prvKey;
}

/**
 * Generates a SHA256 digest from a JSON Object.
 * @function getSHA256Digest
 * @private
 * @param  {Object} data    JSON object.
 * @return {string}         Base64 formatted string.
 */
function getSHA256Digest(data) {
    return digest = crypto.createHash('sha256').update(data, 'utf8').digest().toString('base64');
}

/**
 * Generates an RSA Signed SHA256 digest from a String.
 * @function getRSASigSHA256b64Encode
 * @private
 * @param  {String} data    String to be signed & hashed.
 * @return {string}         Base64 formatted string.
 */
function getRSASigSHA256b64Encode(data) {
    var keyData = {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    };

    return sign = crypto.createSign('RSA-SHA256').update(data).sign(keyData, 'base64');
}

/**
 * Assmebled an Intersight formatted authorization header.
 * @function getAuthHeader
 * @private
 * @param  {Object} hdrs        Object with header keys.
 * @param  {String} signedMsg   Base64 encoded SHA256 hashed body.
 * @return {string}             Concatenated authorization header.
 */
function getAuthHeader(hdrs, signedMsg) {
    var keys = [];

    var authStr = "Signature";

    authStr = authStr + " " + "keyId=\"" + publicKey + "\"," + "algorithm=\"" + digestAlgorithm + "\"," + "headers=\"(request-target)";

    for (var objKey in hdrs) {
        keys.push(objKey);
    }
    keys.sort();

    for (var i = 0; i < keys.length; i++) {
        authStr = authStr + " " + keys[i].toLowerCase();
    }
    authStr = authStr + "\"";

    authStr = authStr + "," + "signature=\"" + signedMsg + "\"";

    return authStr;
}

/**
 * Concatenates Intersight headers in preparation to be RSA signed.
 * @function prepStringToSign
 * @private
 * @param  {String} reqTarget   HTTP Method + endpoint.
 * @param  {Object} hdrs        Object with header keys.
 * @return {string}             Concatenated header authorization string.
 */
function prepStringToSign(reqTarget, hdrs) {
    var keys = [];

    var ss = "(request-target): " + reqTarget.toLowerCase() + "\n";

    for (var objKey in hdrs) {
        keys.push(objKey);
    }
    keys.sort();

    for (var i = 0; i < keys.length; i++) {
        ss = ss + keys[i].toLowerCase() + ": " + hdrs[keys[i]];
        if(i < keys.length-1) {
            ss = ss + "\n";
        }
    }

    return ss;
}

/**
 * Generated a GMT formatted Date.
 * @function getGMTDate
 * @private
 * @return {String} GMT formatted Date string.
 */
function getGMTDate() {
    return new Date().toGMTString();
}

/**
 * Retrieve an Intersight object moid by name.
 * @function getMoidByName
 * @private
 * @param  {String} resourcePath    Intersight resource path e.g. '/ntp/Policies'.
 * @param  {String} targetName      Name of target Intersight Object.
 * @return {Object}                 MOID for target Intersight Object.
 */
async function getMoidByName(resourcePath, targetName) {
    var locatedMoid = "";

    var queryParams = {
        "$filter": `Name eq '${targetName}'`
    };

    var options = {
        "httpMethod": "GET",
        "resourcePath": resourcePath,
        "queryParams": queryParams
    };

    var response = await intersightREST(options);

    if(JSON.parse(response.body).Results != null) {
        locatedMoid = JSON.parse(response.body).Results[0].Moid;
    } else {
        return Promise.reject(`Object with name "${targetName}" not found!`);
    }

    return locatedMoid;
}



/**
 * 
 * @param {*} options The request options
 */
function prepareRequest(options){
    var targetHost = host.hostname;
    var targetPath = host.pathname;
    var queryPath = "";
    var method = options.method.toUpperCase();
    var bodyString = "";
    
     if (method != "GET") {
         bodyString = options.body;
  
    }

    // Concatenate URLs for headers
    var targetUrl = host.href + options.resourcePath;
    var requestTarget = method + " " + targetPath + options.resourcePath + queryPath;

    // Get the current GMT Date/Time
    var currDate = getGMTDate();

    // Generate the body digest
    var b64BodyDigest = getSHA256Digest(bodyString);

    // Generate the authorization header
    var authHeader = {
        'Date' : currDate,
        'Host' : targetHost,
        'Digest' : 'SHA-256=' + b64BodyDigest
    };

    var stringToSign = prepStringToSign(requestTarget, authHeader);
    var b64SignedMsg = getRSASigSHA256b64Encode(stringToSign);
    var headerAuth = getAuthHeader(authHeader, b64SignedMsg);

    // Generate the HTTP requests header
    var reqHeader = {
        'Accept':           `application/json`,
        'Host':             `${targetHost}`,
        'Date':             `${currDate}`,
        'Digest':           `SHA-256=${b64BodyDigest}`,
        'Authorization':    `${headerAuth}`,
        'Content-type':     `application/json`,
    };

    // Generate the HTTP request options
    var requestOptions = {
        method: method,
        url: targetUrl,
        //qs: queryParams,
        body: bodyString,
        headers: reqHeader,
        resolveWithFullResponse: true
        //proxy: proxy
    };
    console.log(requestOptions);
    return requestOptions;

}


// Export the module functions
module.exports = {
    setPublicKey,
    setPrivateKey,
    prepareRequest,
};
