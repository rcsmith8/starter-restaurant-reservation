const seedData = require('./01-tables.json');

exports.seed = async function (knex) {
  await knex('tables').del();
  await knex('tables').insert(seedData);
};
