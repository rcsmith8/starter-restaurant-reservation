const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const bodyDataHas = (propertyName) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    
    if (data[propertyName] && data[propertyName] !== "") {
      return next();
    }
    
    next({
      status: 400,
      message: `User must include ${propertyName}`
    })
  }
}

const validateNotTuesdays = (req, res, next) => {
  const { data: { reservation_date } = {} } = req.body;
  const dt = new Date(reservation_date).getDay();
  if (dt === 2) {
    return next({
      status: 400,
      message: "Sorry, we are closed on Tuesdays."
    })
  }
  next();
}

const validateNotPastDays = (req, res, next) => {
  const { data: { reservation_date } = {} } = req.body;

  const reservationDate = new Date(reservation_date);
  const revDate = reservationDate.getDate();
  const revMonth = reservationDate.getMonth();
  const revYear = reservationDate.getFullYear();

  const today = new Date();
  const tdDate = today.getDate();
  const tdMonth = today.getMonth();
  const tdYear = today.getFullYear();

  const diffDate = revDate - tdDate;
  const diffMonth = revMonth - tdMonth;
  const diffYear = revYear - tdYear;
 
  if (diffDate < 0 || diffMonth < 0 || diffYear < 0) {
    return next({
      status: 400,
      message: "You can't book a day in the past."
    })
  }
  next();
}

const validateTime = (req, res, next) => {
  const { data: { reservation_date, reservation_time } = {} } = req.body;

  const today = new Date();
  const now = today.getTime();
  const revTime = new Date(`${reservation_date} ${reservation_time}`).getTime()
  const diffTime = revTime - now;
  
  if (diffTime < 0) {
    return next({
      status: 400,
      message: `You can't book a time in the past.`
    })
  }
  next();
}

const validateBusinessHour = (req, res, next) => {
  const { data: { reservation_date, reservation_time } = {} } = req.body;

  const openTime = new Date(`${reservation_date} 10:30:00`).getTime()
  const closingTime = new Date(`${reservation_date} 21:30:00`).getTime()
  const revTime = new Date(`${reservation_date} ${reservation_time}`).getTime()
  
  const afterOpen = revTime - openTime;
  const beforeClose = closingTime - revTime;

  if (afterOpen < 0 || beforeClose < 0) {
    return next({
      status: 400,
      message: "Our business hour is from 10:30AM to 10:30PM. You can book from 10:30AM to 9:30PM for your reservation."
    })
  }
  next();
}

async function createReservation(req, res) {
  const { data: { 
    first_name, 
    last_name, 
    mobile_number, 
    reservation_date, 
    reservation_time, 
    people } = {} } = req.body;
  
  const newReservation = ({
    first_name, 
    last_name, 
    mobile_number, 
    reservation_date, 
    reservation_time, 
    people
  });
  const createdReservation = await service.create(newReservation);
  res.status(201).json({ data: createdReservation })
}

async function listReservations(req, res, next) {
  const date = req.query.date;
  const mobileNumber = req.query.mobile_number
  let reservations = [];

  if (date) {
    reservations = await service.listByDate(date);
  }

  if (mobileNumber) {
    reservations = await service.listByMobileNumber(mobileNumber);
  }

  res.json({ data: reservations });
}

async function updateReservation(req, res, next) {
  const { reservation_id }  = req.params;
  const { data: reservation = {} } = req.body;

  const updatedReservation = {
    ...reservation,
    reservation_id: reservation_id
  }

  const newReservation = await service.updateStatus(updatedReservation);
  res.json({ data: newReservation })
}

async function updateStatus(req, res, next) {
  const { reservation_id } = req.params;
  const { data: { status } = {} } = req.body;

  const updatedReservation = {
    reservation_id: reservation_id,
    status: status
  }

  const reservation = await service.updateStatus(updatedReservation);
  res.json({ data: reservation });
}

async function readReservation(req, res, next) {
  const { reservation_id } = req.params;
  
  const reservation = await service.readReservation(reservation_id);

  if (reservation) {
    res.json({ data: reservation })
  }

  next({
    status: 404,
    message: 'Reservation does not exist'
  })
}

module.exports = {
  createReservation: [
    bodyDataHas("first_name"),
    bodyDataHas("last_name"),
    bodyDataHas("mobile_number"),
    bodyDataHas("reservation_date"),
    bodyDataHas("reservation_time"),
    bodyDataHas("people"),
    validateNotPastDays,
    validateNotTuesdays,
    validateTime,
    validateBusinessHour,
    asyncErrorBoundary(createReservation)
  ],
  listReservations: asyncErrorBoundary(listReservations),
  updateStatus: asyncErrorBoundary(updateStatus),
  readReservation: asyncErrorBoundary(readReservation),
  updateReservation: [
    bodyDataHas("first_name"),
    bodyDataHas("last_name"),
    bodyDataHas("mobile_number"),
    bodyDataHas("reservation_date"),
    bodyDataHas("reservation_time"),
    bodyDataHas("people"),
    validateNotPastDays,
    validateNotTuesdays,
    validateTime,
    validateBusinessHour,
    asyncErrorBoundary(updateReservation)
  ]
};
