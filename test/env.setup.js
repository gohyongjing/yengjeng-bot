/*
 * This file should contain any environment variables
 * that are explicitly required, e.g. variable that
 * you can't set a default value for using nullish
 * operator (??).
 *
 * Example:
 * process.env.SOME_REQUIRED_ENV_VAR = 'some custom value'
 *
 * By doing this, we can produce an error when launching the service
 * if the variable is not set, and avoid that error when testing it.
 */

// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config();
