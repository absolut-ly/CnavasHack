const polling = (() => {
  const msg = require('./msgModule');
  const fetch = require('node-fetch');
  const { createReadStream } = require('fs');
  const csv = require('csv-parser');
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const _whurl = "https://discord.com/api/webhooks/817140114680971306/X2GzQqA-Sonr1tM1-yAd-43fkuxKBGBWn0a-OIL8AE1okq6H3sPEqgGKRJvX7vCTQWEY";
  const data = [];
  const newData = [];
  const urls = [];
  let statusChange = false;
  let updateFile = false;
  let newStatus;

  const checkStatus = (domainUrl, username, avatar_url, status, resVal) => {
    let currentStatus = status;
    statusChange = false;
    if (currentStatus === 'Up' && !resVal) {
      msg.send(_whurl, 'Server is down.', username, avatar_url);
      statusChange = true;
      newStatus = 'Down';
    }
    if (currentStatus === 'Down' && resVal) {
      msg.send(_whurl, 'Server is up.', username, avatar_url);
      statusChange = true;
      newStatus = 'Up';
    }
    if (statusChange) {
      currentStatus = newStatus;
      updateFile = true;
    }
    newData.push({ "domain": domainUrl, "name": username, "avatar": avatar_url, "status": currentStatus });
  }

  const updateDB = (arrOfDataObj) => {
    const csvWriter = createCsvWriter({
      path: 'data2.csv',
      header: [
        { id: 'domain', title: 'DomainURL' },
        { id: 'name', title: 'Username' },
        { id: 'avatar', title: 'Avatar_url' },
        { id: 'status', title: 'Status' }
      ]
    });
    csvWriter.writeRecords(arrOfDataObj);
  }

  async function run() {
    const stream = createReadStream('data.csv').pipe(csv())
    for await (let chunk of stream) {
      data.push(chunk);
      urls.push(chunk.DomainURL);
    }
    let promises = urls.map(url => fetch(url).then(res => res.ok));
    Promise.all(promises).then(results => {
      data.forEach((el, i) => {
        checkStatus(el.DomainURL, el.Username, el.Avatar_url, el.Status, results[i]);
      })
      if (updateFile) updateDB(newData);
    });
  }

  run();

})();