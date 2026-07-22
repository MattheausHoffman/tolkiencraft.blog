import { showTimedAlert } from './auth-ui.js';
import { initAdminShell } from './admin-session.js';

async function initDashboard() {
  const alertElement = document.querySelector('[data-auth-alert]');
  try {
    await initAdminShell({ alertElement });
  } catch (error) {
    showTimedAlert(alertElement, error.message);
  }
}

initDashboard();
