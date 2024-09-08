
const defaultTarget = "http://nn-hakaton.simbirsoft:7350/";
const defaultTarget2 = "http://nn-hakaton.simbirsoft:80/";

module.exports = {
   '/v2': {
      target: defaultTarget,
      secure: false,
   },
  '/upload': {
    target: defaultTarget2,
    secure: false,
  },
   '/ws': {
      "target": defaultTarget,
      "secure": false,
      "ws": true
   }
}
