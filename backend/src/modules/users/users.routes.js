const r = require('express').Router();
const { requireAuth } = require('../../middlewares/auth');
const c = require('./users.controller');

r.get('/', requireAuth, c.list);
module.exports = r;
