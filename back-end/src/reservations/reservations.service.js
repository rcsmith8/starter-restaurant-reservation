const knex = require("../db/connection");

function create(newReservation) {
    return knex("reservations")
        .insert(newReservation)
        .returning("*")
        .then((createdReservations) => createdReservations[0])
}

function readReservation(reservation_id) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservation_id })
        .first()
}

function listByDate(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .orderBy("reservation_time", "asc");
}

function listByMobileNumber(mobile_number) {
    return knex("reservations")
        .whereRaw(
            "translate(mobile_number, '() -', '') like ?",
            `%${mobile_number.replace(/\D/g, "")}%`
        )
        .orderBy("reservation_date");
}

function updateStatus(updatedReservation) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: updatedReservation.reservation_id })
        .update(updatedReservation, "*")
        .then((updatedRecords) => updatedRecords[0])
}

module.exports = {
    create,
    listByDate,
    updateStatus,
    listByMobileNumber,
    readReservation
}
