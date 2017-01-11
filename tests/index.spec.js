const assert = require('assert');
const superkoa = require('superkoa');
const path = require('path');
const fs = require('fs');
const request = superkoa(path.normalize(path.join(__dirname, './server.js')));
const testFilename = 'lab.png';
const testFilePath = `./tests/data/${testFilename}`;

const testFileData = fs.readFileSync(testFilePath);
const testFileLength = testFileData.length;

describe('Tests for server koa2', () => {
  const filesForDelete = [];

  after(() => {
    filesForDelete.forEach(filePath => {
      fs.unlinkSync(filePath);
    });
  });

  const itUpload1File = async () => {
    const fieldname = 'image';
    const res = await request
      .post('/files')
      .attach(fieldname, testFilePath)
      .expect(200);

    assert(res.body instanceof Object);

    assert(res.body.hasOwnProperty('files'));
    assert(res.body.hasOwnProperty('fields'));

    assert(res.body.files instanceof Array);
    assert(res.body.fields instanceof Array);

    assert.equal(res.body.files.length, 1);
    assert.equal(res.body.fields.length, 0);

    const file = res.body.files[0];

    assert(file.hasOwnProperty('fieldname'));
    assert(file.hasOwnProperty('filename'));
    assert(file.hasOwnProperty('mimetype'));
    assert(file.hasOwnProperty('tmpFilePath'));

    assert.equal(file.fieldname, fieldname);
    assert.equal(file.filename, testFilename);
    assert.equal(file.mimetype, 'image/png');

    const tmpFileData = fs.readFileSync(file.tmpFilePath);

    filesForDelete.push(file.tmpFilePath);

    assert.equal(tmpFileData.length, testFileLength);
  };

  const itUpload2File = async () => {
    const fieldnames = ['image1', 'image2'];
    const res = await request
      .post('/files')
      .attach(fieldnames[0], testFilePath)
      .attach(fieldnames[1], testFilePath)
      .expect(200);

    assert(res.body instanceof Object);

    assert(res.body.hasOwnProperty('files'));
    assert(res.body.hasOwnProperty('fields'));

    assert(res.body.files instanceof Array);
    assert(res.body.fields instanceof Array);

    assert.equal(res.body.files.length, 2);
    assert.equal(res.body.fields.length, 0);

    const files = res.body.files;

    assert.equal(files[0].fieldname, fieldnames[0]);
    assert.equal(files[0].filename, testFilename);
    assert.equal(files[0].mimetype, 'image/png');

    assert.equal(files[1].fieldname, fieldnames[1]);
    assert.equal(files[1].filename, testFilename);
    assert.equal(files[1].mimetype, 'image/png');

    const tmpFileData = [fs.readFileSync(files[0].tmpFilePath), fs.readFileSync(files[1].tmpFilePath)];

    filesForDelete.push(files[0].tmpFilePath);
    filesForDelete.push(files[1].tmpFilePath);

    assert.equal(tmpFileData[0].length, testFileLength);
    assert.equal(tmpFileData[1].length, testFileLength);
  };

  it('Upload 1 file in 1 request', itUpload1File);

  it('Upload 2 files in 1 request', itUpload2File);

  it('Upload 2 file in 2 request', async () => {
    await itUpload1File();
    await itUpload1File();
  });

  it('Upload 4 file in 2 request', async () => {
    await itUpload2File();
    await itUpload2File();
  });
});
