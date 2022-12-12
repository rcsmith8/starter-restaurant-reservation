const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function listTables(req, res, next) {
    const tableList = await service.listTables()
    res.json({ data: tableList })
}

async function readTable(req, res, next) {
    const { table_id } = req.params;
    const { data: currentReservation } = req.body;

    const table = await service.readTable(table_id);

    if (table) {
        res.locals.table = table;
        res.locals.reservation = currentReservation;
        return next();
    }

    next({
        status: 404,
        message: "Table cannot be found."
    })
}

function checkTableIsFree(req, res, next) {
    const currentTable = { ...res.locals.table }
    const currentReservation = { ...res.locals.reservation }

    if (currentTable.reservation_id != null && currentReservation.reservation_id != null) {
        next({
            status: 404,
            message: "The selected table is already occupied."
        })
    }
    res.locals.table = currentTable;
    res.locals.reservation = currentReservation;
    return next();
}

function checkTableHasEnoughSeats(req, res, next) {
    const currentTable = { ...res.locals.table }
    const currentReservation = { ...res.locals.reservation }

    if (currentTable.capacity < currentReservation.people) {
        next({ 
            status: 404,
            message: "Table doesn't have enough seats for the party size."
        })
    }
    res.locals.table = currentTable;
    res.locals.reservation = currentReservation;
    return next();
}

async function updateTable(req, res, next) {
    const currentTable = { ...res.locals.table }
    const currentReservation = { ...res.locals.reservation }

    const updatedTable = {
        reservation_id: currentReservation.reservation_id,
        table_id: currentTable.table_id
    }

    const data = await service.updateTable(updatedTable);
    res.json({ data })
}

function checkTableIsOccupied(req, res, next) {
    const currentTable = { ...res.locals.table }

    if (currentTable.reservation_id == null) {
        next({
            status: 404,
            message: "The selected table is not occupied."
        })
    }
    res.locals.table = currentTable;
    return next();
}

async function finishTable(req, res, next) {
    const currentTable = { ...res.locals.table };

    const updatedTable = {
        table_id: currentTable.table_id,
        reservation_id: null
    }

    await service.updateTable(updatedTable);
    res.json("Table is now Free.")
}

const bodyDataHas = (propertyName) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    
    if (data[propertyName] && data[propertyName] !== "") {
      return next();
    }
    
    next({
      status: 400,
      message: `Table must include ${propertyName}`
    })
  }
}

const validateTableName = (req, res, next) => {
  const { data: { table_name } = {} } = req.body;

  if (table_name.length < 2) {
    return next({
      status: 400,
      message: "table_name must have at least 2 characters."
    })
  }
  next();
}

const validateCapacity = (req, res, next) => {
  const { data: { capacity } = {} } = req.body;

  if (capacity < 1) {
    return next({
      status: 400,
      message: "Table capacity must be at least 1."
    })
  }
  next();
}

async function createTable(req, res, next) {
    const { data: { 
        table_name,
        capacity } = {} } = req.body;
    
    const newTable = ({
        table_name,
        capacity
    });

    const createdTable = await service.createTable(newTable);
    res.status(201).json({ data: createdTable })
}


module.exports = {
    listTables: asyncErrorBoundary(listTables),
    updateTable: [
        asyncErrorBoundary(readTable),
        checkTableIsFree,
        checkTableHasEnoughSeats,
        asyncErrorBoundary(updateTable)
    ],
    finishTable: [
        asyncErrorBoundary(readTable),
        checkTableIsOccupied,
        asyncErrorBoundary(finishTable)
    ],
    createTable: [
        bodyDataHas("table_name"),
        bodyDataHas("capacity"),
        validateTableName,
        validateCapacity,
        asyncErrorBoundary(createTable)
    ]
};
