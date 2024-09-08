
const defaultTarget = "http://nn-hakaton.simbirsoft:7350/";

module.exports = {
   '/upload': {
      target: 'http://nn-hakaton.simbirsoft:80',
      secure: false,
   },
   '/v2': {
      target: defaultTarget,
      secure: false,
   },
   '/ws': {
      "target": defaultTarget,
      "secure": false,
      "ws": true
   }
}