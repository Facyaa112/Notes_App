/**
 * Показать сообщение пользователю
 */
function showMessage(message, type = 'info') {
  const messageArea = $('#message-area');
  const alertClass = `alert-${type}`;
  
  const alert = $(`
    <div class="alert ${alertClass}">
      ${message}
    </div>
  `);
  
  messageArea.append(alert);
  
  // Автоматически скрываем через 5 секунд
  setTimeout(() => {
    alert.fadeOut(300, function() {
      $(this).remove();
    });
  }, 5000);
}

/**
 * Показать ошибку
 */
function showError(error) {
  const message = error.message || 'Произошла ошибка';
  showMessage(message, 'error');
  console.error(error);
}

/**
 * Показать модальное окно
 */
function showModal(modalId) {
  $(modalId).removeClass('hidden');
}

/**
 * Скрыть модальное окно
 */
function hideModal(modalId) {
  $(modalId).addClass('hidden');
}

/**
 * Очистить форму
 */
function clearForm(formId) {
  $(formId)[0].reset();
}

export default {
  showMessage,
  showError,
  showModal,
  hideModal,
  clearForm
};