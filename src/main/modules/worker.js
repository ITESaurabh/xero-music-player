process.on("message", (data) => {
    console.log(data);
    console.log("pong");
});