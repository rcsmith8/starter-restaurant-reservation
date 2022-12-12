const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/")
    .get(controller.listReservations)
    .post(controller.createReservation)

router.route("/:reservation_id/status")
    .put(controller.updateStatus)

router.route("/:reservation_id")
    .get(controller.readReservation)
    .put(controller.updateReservation)

module.exports = router;
