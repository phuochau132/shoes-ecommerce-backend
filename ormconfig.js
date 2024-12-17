module.exports = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'mppl_silvery_test',
  logging: false,
  entities: ['src/models/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  cli: {
    migrationsDir: 'src/migrations',
    entitiesDir: 'src/models',
  },
};
