'use strict';

process.chdir(__dirname);

var fs = require('fs');
var recluster = require('recluster');
var options = { workers: 2, backoff: 10 };
var cluster = recluster('app.js', options);

fs.writeFileSync('.pid', process.pid.toString() + '\n');

cluster.run();

process.on('SIGUSR2', function() {
  console.log('Cluster got SIGUSR2, reloading...');
  cluster.reload();
});

process.on('exit', function () {
  console.log('Cluster shutting down...');
  fs.unlinkSync('.pid');
});

console.log('Cluster executing with pid: ' + process.pid);
