const router = require("express").Router();
const controller = require("./tables.controller");

router.route("/")
    .get(controller.listTables)
    .post(controller.createTable)

router.route("/:table_id/seat")
    .put(controller.updateTable)
    .delete(controller.finishTable)

module.exports = router;
