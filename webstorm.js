'use strict';

var spawn = require('child_process').spawn, child;

console.log('spawning grunt process');

child = spawn('grunt.cmd', ['test', 'web']);
child.on('exit', function(code) {
    console.log('grunt exited with code: ' + (code || '(falsy)'));
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);