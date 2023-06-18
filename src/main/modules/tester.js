const {spawn} = require('child_process');

var child = spawn("node", ["worker.js"], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });

const self = {};

self.start = () => {
    console.log("start");
    child.send("ping");
};