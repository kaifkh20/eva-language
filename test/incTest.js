const assert = require('assert');
const {test} = require('./testUtil');

module.exports = eva => {

  test(eva,
  `
    (begin

      (var result 0)

      (++ result)

      result

    )

  `,
  1);

};