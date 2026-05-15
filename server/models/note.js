const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  parsed: {
    type: DataTypes.JSON,
    allowNull: true,
  }
});

module.exports = Note;
