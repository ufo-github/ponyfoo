'use strict';

var fs = require('fs');
var recluster = require('recluster');
var options = {
  workers: 2, backoff: 10
};
var cluster = recluster('app.js', options);

fs.writeFileSync('.pid', process.pid, 'utf8');
cluster.run();

process.on('SIGUSR2', function() {
  console.log('Cluster got SIGUSR2, reloading...');
  cluster.reload();
});
