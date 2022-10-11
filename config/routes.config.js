const router = require('express').Router();

router.get('/', (req, res, next) => res.json({ ok: true }));

module.exports = router;