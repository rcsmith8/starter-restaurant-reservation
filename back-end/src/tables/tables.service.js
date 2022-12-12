const knex = require("../db/connection");

function updateTable(updatedTable) {
    return knex("tables")
        .select("*")
        .where({ table_id: updatedTable.table_id })
        .update(updatedTable, "*")
        .then((updatedRecords) => updatedRecords[0])
}

function readTable(tableId) {
    return knex("tables")
        .select("*")
        .where({ table_id: tableId })
        .first()
}

function listTables() {
    return knex("tables")
        .select("*")
        .orderBy("table_name", "asc")
}

function createTable(newTable) {
    return knex("tables")
        .insert(newTable)
        .returning("*")
        .then((createdTables) => createdTables[0])
}

module.exports = {
    updateTable,
    readTable,
    listTables,
    createTable
}
