/* DASH-03/04/05: Chỉ đọc dữ liệu được service cấp; không truy cập storage hay tự cấp quyền. */
// CORE-03: Cần Thành cung cấp module js/service.js export đúng tên hàm này.
import { getParentDashboard } from '../service.js';

const ui = {
  notice: document.querySelector('#dashboard-notice'),
  reload: document.querySelector('#reload-button'),
  childrenList: document.querySelector('#children-list'),
  childrenCount: document.querySelector('#children-count'),
  childrenEmpty: document.querySelector('#children-empty'),
  camerasList: document.querySelector('#cameras-list'),
  camerasCount: document.querySelector('#cameras-count'),
  camerasEmpty: document.querySelector('#cameras-empty'),
  searchEmpty: document.querySelector('#search-empty'),
  search: document.querySelector('#camera-search'),
  searchFeedback: document.querySelector('#search-feedback'),
};

let availableCameras = []; // Chỉ giữ kết quả đã cấp từ service, không hardcode camera.

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text); // Tránh chèn dữ liệu bằng innerHTML.
  return node;
}

function notice(message, kind = 'info') {
  const title = ui.notice.querySelector('.dashboard-notice__title');
  const subtitle = ui.notice.querySelector('.dashboard-notice__subtitle');
  const icon = ui.notice.querySelector('.dashboard-notice__icon');
  title.textContent = message;
  subtitle.textContent = kind === 'loading' ? 'Hệ thống đang cập nhật dữ liệu mới nhất cho tài khoản của bạn.' : '';
  icon.textContent = kind === 'error' ? '!' : kind === 'warning' ? '!' : kind === 'loading' ? '↻' : '✓';
  ui.notice.dataset.kind = kind;
  ui.notice.hidden = !message;
}

function status(label, modifier = '') {
  return element('span', `dashboard-status${modifier ? ` dashboard-status--${modifier}` : ''}`, label);
}

function renderChildren(children) {
  ui.childrenList.replaceChildren();
  ui.childrenCount.textContent = `${children.length} học sinh`;
  ui.childrenEmpty.hidden = children.length !== 0;

  children.forEach(child => {
    const card = element('article', 'dashboard-card');
    const top = element('div', 'dashboard-card__top');
    const details = element('div');
    details.append(
      element('h3', '', child.fullName || 'Chưa có tên'),
      element('p', 'dashboard-card__meta', child.className ? `Lớp: ${child.className}` : 'Chưa phân lớp')
    );
    top.append(details, child.status === 'active' ? status('Đang học') : status('Không hoạt động', 'inactive'));
    card.append(top);
    ui.childrenList.append(card);
  });
}

function cameraCard(camera) {
  const card = element('article', 'dashboard-card dashboard-camera');
  const top = element('div', 'dashboard-card__top');
  const details = element('div');
  details.append(
    element('h3', '', camera.name || 'Camera chưa đặt tên'),
    element('p', 'dashboard-card__meta', camera.className ? `Lớp: ${camera.className}` : 'Lớp chưa xác định')
  );
  const disabled = camera.enabled !== true;
  const offline = camera.connectionStatus !== 'online';
  top.append(details, disabled ? status('Đã tắt', 'disabled') : offline ? status('Ngoại tuyến', 'offline') : status('Trực tuyến'));
  const bottom = element('div', 'dashboard-camera__bottom');
  bottom.append(element('span', 'dashboard-camera__label', 'Camera lớp học'));

  if (disabled || offline) {
    bottom.append(element('span', 'dashboard-camera__unavailable', disabled ? 'Không khả dụng' : 'Tạm thời không kết nối'));
  } else {
    const link = element('a', 'dashboard-camera__link', 'Xem camera');
    // VIEW-03: Viewer của Tuấn cần đọc URLSearchParams.get('id').
    link.href = `camera-viewer.html?id=${encodeURIComponent(String(camera.id))}`;
    link.setAttribute('aria-label', `Xem camera ${camera.name || ''}`);
    bottom.append(link);
  }
  card.append(top, bottom);
  return card;
}

function renderCameras() {
  const keyword = ui.search.value.trim().toLocaleLowerCase('vi');
  const filtered = availableCameras.filter(camera => String(camera.name || '').toLocaleLowerCase('vi').includes(keyword));
  ui.camerasList.replaceChildren(...filtered.map(cameraCard));
  ui.camerasCount.textContent = `${filtered.length}/${availableCameras.length} camera`;
  ui.camerasEmpty.hidden = availableCameras.length !== 0;
  ui.searchEmpty.hidden = availableCameras.length === 0 || filtered.length !== 0;
  ui.searchFeedback.textContent = keyword && availableCameras.length ? `Tìm thấy ${filtered.length} camera phù hợp.` : '';
}

function showFailure(error) {
  const codes = {
    UNAUTHENTICATED: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
    FORBIDDEN: 'Tài khoản không có quyền truy cập trang này.',
    NOT_FOUND: 'Không tìm thấy thông tin cần hiển thị.',
    STORAGE_ERROR: 'Không thể đọc dữ liệu. Vui lòng thử lại.',
  };
  notice(codes[error?.code] || 'Không tải được Dashboard. Vui lòng thử lại.', 'error');
}

async function loadDashboard() {
  ui.reload.disabled = true;
  ui.search.disabled = true;
  ui.childrenList.setAttribute('aria-busy', 'true');
  ui.camerasList.setAttribute('aria-busy', 'true');
  notice('Đang tải thông tin...', 'loading');
  try {
    const data = await getParentDashboard();
    if (!data || !Array.isArray(data.children) || !Array.isArray(data.cameras) || !data.parent) {
      throw new Error('Dashboard service trả dữ liệu sai contract');
    }
    renderChildren(data.children);
    availableCameras = data.cameras;
    renderCameras();
    ui.search.disabled = availableCameras.length === 0;
    if (data.parent.accessEnabled === false) {
      notice('Quyền truy cập camera của tài khoản đang bị khóa. Vui lòng liên hệ nhà trường.', 'warning');
    } else if (availableCameras.length === 0) {
      notice('Hiện chưa có camera được cấp quyền. Hãy kiểm tra trạng thái học sinh hoặc liên hệ nhà trường.', 'warning');
    } else {
      notice('');
    }
  } catch (error) {
    availableCameras = [];
    renderChildren([]);
    renderCameras();
    showFailure(error);
    console.error('Dashboard load failed:', error?.code || error?.message || 'Unknown error');
  } finally {
    ui.reload.disabled = false;
    ui.childrenList.setAttribute('aria-busy', 'false');
    ui.camerasList.setAttribute('aria-busy', 'false');
  }
}

ui.search.addEventListener('input', renderCameras);
ui.reload.addEventListener('click', loadDashboard);
loadDashboard();
