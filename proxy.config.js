
const defaultTarget = "http://nn-hakaton.simbirsoft:7350/";

module.exports = {
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