#!/usr/bin/env node

var url = require('url');
var async = require('async');
var couchr = require('couchr');

var couch = process.argv[2];

var db = url.resolve(couch, '_replicator');
var all_docs = url.resolve(db +'/', '_all_docs');

couchr.get(all_docs, function(err, resp){
  if (err) return console.log(err);
  if (!resp || !resp.rows) return console.log('no rows in db');

  async.eachLimit(resp.rows, 10, rm, function(err){
    if (err) return console.log('an error removing rows', err);
    console.log('complete')
  })


})


function rm(item, cb){
  if (item.id.indexOf('_design') === 0) return; // skip design docs
  var doc_url = url.resolve(db + '/', item.id);
  couchr.del(doc_url, {rev: item.value.rev}, function(err, resp){
    if (err) return cb(err);
    cb();
  })
}