const API_BASE = '/api';

/**
 * Базовые заголовки для запросов
 */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Обработка ответа от сервера
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'Произошла ошибка');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

/**
 * GET запрос
 */
async function get(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

/**
 * POST запрос
 */
async function post(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

/**
 * PUT запрос
 */
async function put(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

/**
 * DELETE запрос
 */
async function del(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export default {
  get,
  post,
  put,
  delete: del
};