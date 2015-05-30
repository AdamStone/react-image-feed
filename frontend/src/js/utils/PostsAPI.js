"use strict";

var Promise = require('promise'),
    Request = require('superagent');

var url = 'https://appsheettest1.azurewebsites.net/sample/posts';

module.exports = {
  getPosts: function() {

    return new Promise(function(resolve, reject) {
      Request
        .get(url)
        .end(function(err, res) {
          if (err) {
            reject(err);
          }
          else {
            resolve(res.body);
          }
        });
    });
  }
};
