const seedData = require('./00-reservations.json');

exports.seed = async function (knex) {
  await knex('reservations').del();
  await knex('reservations').insert(seedData);
};
