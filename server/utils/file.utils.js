const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data');

/**
 * Чтение данных из JSON файла
 * @param {string} filename - имя файла (например, 'users.json')
 * @returns {Promise<Array>} - массив данных
 */
async function readData(filename) {
  try {
    const filePath = path.join(DATA_PATH, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файл не существует или пустой, возвращаем пустой массив
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Запись данных в JSON файл
 * @param {string} filename - имя файла
 * @param {Array} data - данные для записи
 * @returns {Promise<void>}
 */
async function writeData(filename, data) {
  const filePath = path.join(DATA_PATH, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readData,
  writeData
};