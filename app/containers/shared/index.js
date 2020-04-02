export const handleScreenCapture = () => {
  new Promise(resolve => {
    const { execFile } = require('child_process');
    const screen_window = execFile(
      __dirname + './electron_screenshot/PrintScr.exe'
    );
    screen_window.on('exit', function(code) {
      console.log(arguments);
      let pngs = clipboard.readImage().toPNG();
      let imgData = new Buffer(pngs, 'base64');
      let imgs =
        'data:image/png;base64,' +
        btoa(
          new Uint8Array(imgData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
      console.log(imgs);
      resolve(imgs);
    });
  });
};
