const Busboy = require('busboy');

module.exports = class AsyncBusboy {
  /**
   * Creates an instance of AsyncBusboy.
   *
   * @param {any} opts
   * This object is argument for busboy constructor (https://github.com/mscdex/busboy#busboy-methods)
   */
  constructor(opts) {
    if (!opts.headers) {
      throw new Error('Miss headers');
    }

    this.busboy = new Busboy(opts);
    this._onFile = null;
    this._onField = null;
    this._onFilesLimit = null;
  }

  /**
   * Function executed on event "file"
   *
   * @param {function} func
   * @return {AsyncBusboy} this
   */
  onFile(func) {
    this._onFile = func;
    return this;
  }

  /**
   * Function executed on event "field"
   *
   * @param {function} func
   * @return {AsyncBusboy} this
   */
  onField(func) {
    this._onField = func;
    return this;
  }

  /**
   * Function executed on event "filesLimit"
   *
   * @param {function} func
   * @return {AsyncBusboy} this
   */
  onFilesLimit(func) {
    this._onFilesLimit = func;
    return this;
  }

  /**
   * Function executed on event "partsLimit"
   *
   * @param {function} func
   * @return {AsyncBusboy} this
   */
  onPartsLimit(func) {
    this._onPartsLimit = func;
    return this;
  }

  /**
   * Function executed on event "fieldsLimit"
   *
   * @param {function} func
   * @return {AsyncBusboy} this
   */
  onFieldsLimit(func) {
    this._onFieldsLimit = func;
    return this;
  }

  /**
   * Request object for pipe busboy
   *
   * @param {any} req
   * @return {Promise}
   */
  pipe(req) {
    if (!this.onFile) {
      throw new Error('Miss describe this.onFile');
    }

    return new Promise((resolve, reject) => {
      this.busboy.on('file', this._onFile);

      if (this._onField) {
        this.busboy.on('field', this._onField);
      }

      if (this._onFilesLimit) {
        this.busboy.on('filesLimit', () => {
          try {
            this._onFilesLimit();
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this._onPartsLimit) {
        this.busboy.on('partsLimit', () => {
          try {
            this._onPartsLimit();
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this._onFieldsLimit) {
        this.busboy.on('fieldsLimit', () => {
          try {
            this._onFieldsLimit();
          } catch (e) {
            reject(e);
          }
        });
      }

      this.busboy.on('finish', function() {
        resolve();
      });

      req.pipe(this.busboy);
    });
  }
};
