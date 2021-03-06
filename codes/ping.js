
/**
 * Pings an ip address or domain. Requires sudo.
 * @async
 * @param {string} ip - Domain name or ip address to ping.
 * @returns {Promise<string>}  Number of packets received.
 */
const ping = async (ip) => {
  const childProcess = require("child_process");

  const execute = command => {
    return new Promise((resolve, reject) => {
      childProcess.exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return
        }
        if (stderr) {
          reject(stderr);
          return
        }
        resolve(stdout);
      });
    });
  }

  let result = '0';

  await execute(`ping -c 2 ${ip} | grep received`)
    .then( res => {
      result = res.split(' ')[3];
    })
    .catch(err => result = err.toString());

  return result
};

exports.ping = ping;

