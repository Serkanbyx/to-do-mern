const { validationResult } = require("express-validator");

/**
 * @desc  Collects express-validator results and returns a 400 response
 *        when any validation rule fails. Keeps controllers free of
 *        repeated validation boilerplate (DRY).
 * @usage router.post("/", rules, validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = validate;
