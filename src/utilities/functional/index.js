'use strict';

module.exports = {
  ...require('./map'),
  ...require('./reduce'),
  ...require('./filter'),
  ...require('./invert'),
  ...require('./merge'),
  ...require('./immutable'),
  ...require('./memoize'),
  ...require('./once'),
  ...require('./identity'),
  ...require('./group'),
  ...require('./sort'),
  // eslint-disable-next-line import/max-dependencies
  ...require('./reverse'),
};
