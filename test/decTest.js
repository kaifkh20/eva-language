const assert = require('assert');
const {test} = require('./testUtil');

module.exports = eva => {

  test(eva,
  `
    (begin

      (var result 1)

      (-- result)

      result

    )

  `,
  0);

};