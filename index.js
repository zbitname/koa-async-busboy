const Busboy = require('busboy');

module.exports = class AsyncBusboy {
  constructor(opts) {
    if (!opts.headers) {
      throw new Error('Miss headers');
    }

    this.busboy = new Busboy(opts);
    this._onFile = null;
    this._onField = null;
  }

  onFile(func) {
    this._onFile = func;
    return this;
  }

  onField(func) {
    this._onField = func;
    return this;
  }

  pipe(req) {
    if (!this.onFile) {
      throw new Error('Miss describe this.onFile');
    }

    return new Promise((resolve, reject) => {
      this.busboy.on('file', this._onFile);

      if (this._onField) {
        this.busboy.on('field', this._onField);
      }

      this.busboy.on('finish', function() {
        resolve();
      });

      req.pipe(this.busboy);
    });
  }
};
