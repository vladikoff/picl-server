/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * KVStore implementation using in-memory data.
 *
 */


module.exports = {

  connect: function(options, cb) {

    // This is the in-memory store for the data.
    // Each key maps to an object with keys "value" and "casid".
    // It's a very rough simultation of how memcache does its CAS.
    var data = {};

    // Following the lead of couchbase node module, this is using closures
    // and simple objects rather than instantiating a prototype connection.

    function get(key, cb) {
      if(data[key] === undefined) {
        cb(null, null);
      } else {
        // take a copy so caller cannot modify our internal data structures.
        cb(null, {
          value: data[key].value,
          casid: data[key].casid,
        })
      }
    }

    function set(key, value, cb) {
      if(data[key] === undefined) {
          data[key] = {value: value, casid: 1};
      } else {
          data[key].value = value;
          data[key].casid++;
      }
      cb(null);
    }

    function cas(key, value, casid, cb) {
      if(data[key] === undefined && casid !== 0) {
          cb("cas mismatch");
      } else if(data[key].casid != casid) {
          cb("cas mismatch");
      } else {
          set(key, value, cb)
      }
    }

    cb(null, {get:get, set:set, cas:cas});
  }

};