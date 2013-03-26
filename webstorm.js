'use strict';

var spawn = require('child_process').spawn, child;

console.log('spawning grunt process');
// console.log(process.env);

child = spawn('grunt.cmd', ['assetify', 'server']);
child.on('exit', function(code) {
    console.log('grunt exited with code: ' + (code || '(falsy)'));
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);