const appState = {
    currentFilters: {},
    editingTaskId: null,
    zoomLevel: 1
};

function seedIfEmpty() {
    if (localStorage.getItem("tasks") === null) {
        const demos = [
        { name: 'Task 1', status: 'NEW' },
        { name: 'Task 2', status: 'DOING' },
        { name: 'Task 3', status: 'TESTING' },
        { name: 'Task 4', status: 'DONE' },
        { name: 'Task 5', status: 'PENDING' },
        { name: 'Task 6', status: 'NEW' },
        { name: 'Task 7', status: 'DOING' },
        { name: 'Task 8', status: 'TESTING' },
        { name: 'Task 9', status: 'DONE' },
        { name: 'Task 10', status: 'PENDING' },
        { name: 'Task 11', status: 'NEW' },
        { name: 'Task 12', status: 'DOING' },
        { name: 'Task 13', status: 'TESTING' },
        { name: 'Task 14', status: 'DONE' },
        { name: 'Task 15', status: 'PENDING' },
        { name: 'Task 16', status: 'NEW' },
        { name: 'Task 17', status: 'DOING' },
        { name: 'Task 18', status: 'TESTING' },
        { name: 'Task 19', status: 'DONE' },
        { name: 'Task 20', status: 'PENDING' },
        { name: 'Task 21', status: 'NEW' },
        { name: 'Task 22', status: 'DOING' },
        { name: 'Task 23', status: 'TESTING' },
        { name: 'Task 24', status: 'DONE' },
        { name: 'Task 25', status: 'PENDING' },
        { name: 'Task 26', status: 'NEW' },
        { name: 'Task 27', status: 'DOING' },
        { name: 'Task 28', status: 'TESTING' },
        { name: 'Task 29', status: 'DONE' },
        { name: 'Task 30', status: 'PENDING' },
        ];

        demos.forEach(d => {
            d.description = `Mô tả mẫu cho ${d.name}`;
            const t = new Task(d);
            t.save();
        });
    }
}

// Hiển thị thông báo toast góc phải màn hình trong 3 giây
function showToast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
    c.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// Hiển thị dialog xác nhận trước khi thực hiện hành động nguy hiểm
function showConfirm(msg, onYes) {
    const modal = document.getElementById('confirm-dialog');
    document.getElementById('confirm-message').textContent = msg;
    modal.style.display = 'flex';

    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');
    const close = () => {
        modal.style.display = 'none';
        // Clone để xóa event listener cũ, tránh trùng lặp
        yesBtn.replaceWith(yesBtn.cloneNode(true));
    };

    noBtn.onclick = close;
    modal.onclick = e => { if (e.target === modal) close(); };
    document.getElementById('confirm-yes').onclick = () => { close(); onYes(); };
}


// Format date string từ YYYY-MM-DD về DD/MM/YYYY để hiển thị
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

// Đổ dữ liệu danh sách task lên bảng
function renderTaskTable() {
    const tbody = document.getElementById('tasks-tbody');
    const tasks = Task.search(appState.currentFilters);

    // Trường hợp không có dữ liệu
    if (tasks.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7">
            <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.3"></i>
            Không có dữ liệu
        </td></tr>`;
        return;
    }

    // Render danh sách bằng map
    tbody.innerHTML = tasks.map((task, idx) => `<tr data-id="${task.id}" title="Double-click để chỉnh sửa">
            <td>${idx + 1}</td>
            <td><span class="badge badge-${task.status.toLowerCase()}">${task.status}</span></td>
            <td class="task-name-cell">${task.name}</td>
            <td><code class="task-id">${task.id}</code></td>
            <td class="task-desc-cell">${task.description}</td>
            <td>${formatDate(task.createdAt)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" title="Chỉnh sửa" data-id="${task.id}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-action btn-delete" title="Xóa" data-id="${task.id}" data-name="${task.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

// ==================== XỬ LÝ FORM & MODAL ====================

// Thu thập giá trị bộ lọc từ giao diện
function getFilters() {
    return {
        nameOrId: document.getElementById('filter-task-name').value.trim(),
        status: document.getElementById('filter-task-status').value === 'ALL' ? '' : document.getElementById('filter-task-status').value,
        description: document.getElementById('filter-task-description').value.trim(),
        dateFrom: document.getElementById('filter-task-date-from').value,
        dateTo: document.getElementById('filter-task-date-to').value,
    };
}

// Xóa toàn bộ bộ lọc và tải lại danh sách
function resetFilters() {
    document.getElementById('filter-task-name').value = '';
    document.getElementById('filter-task-status').value = 'ALL';
    document.getElementById('filter-task-description').value = '';
    document.getElementById('filter-task-date-from').value = '';
    document.getElementById('filter-task-date-to').value = '';
    appState.currentFilters = {};
    renderTaskTable();
}

// Tìm kiếm task theo bộ lọc hiện tại
function searchTasks() {
    appState.currentFilters = getFilters();
    renderTaskTable();
}

// Mở modal thêm/sửa task. Nếu có taskId thì là chế độ Sửa, không có thì là Thêm mới
function openModal(taskId = null) {
    appState.editingTaskId = taskId;
    const modal = document.getElementById('modal-add-task');
    const title = modal.querySelector('.modal-header h2');
    const btnSave = document.getElementById('btn-save-patient');

    // Reset form về trạng thái ban đầu
    document.getElementById('modal-form-name').value = '';
    document.getElementById('modal-form-status').value = '';
    document.getElementById('modal-form-description').value = '';

    if (taskId) {
        // Chế độ Sửa: đổ dữ liệu có sẵn lên form
        const task = Task.findById(taskId);
        if (!task) { showToast('Không tìm thấy task!', 'error'); return; }
        title.textContent = 'Cập nhật công việc';
        btnSave.textContent = 'Cập nhật';
        document.getElementById('modal-form-name').value = task.name;
        document.getElementById('modal-form-status').value = task.status;
        document.getElementById('modal-form-description').value = task.description;
    } else {
        // Chế độ Thêm mới
        title.textContent = 'Thêm công việc';
        btnSave.textContent = 'Lưu';
    }

    modal.style.display = 'flex';
    document.getElementById('modal-form-name').focus();
}

// Đóng modal thêm/sửa task
function closeModal() {
    document.getElementById('modal-add-task').style.display = 'none';
    appState.editingTaskId = null;
}

// Xử lý lưu task (thêm mới hoặc cập nhật)
function saveTask() {
    const name = document.getElementById('modal-form-name').value.trim();
    const status = document.getElementById('modal-form-status').value || 'NEW';
    const description = document.getElementById('modal-form-description').value.trim();

    const isEdit = appState.editingTaskId !== null;
    let taskData = { name, status, description };

    if (isEdit) {
        // Lấy task cũ để giữ lại createdAt và id khi cập nhật
        const existing = Task.findById(appState.editingTaskId);
        if (!existing) {
            showToast('Không tìm thấy task để cập nhật!', 'error');
            return;
        }
        taskData.id = existing.id;
        taskData.createdAt = existing.createdAt;
    }

    const task = new Task(taskData);
    const result = task.save();

    if (!result.valid) {
        showToast(result.errors.join(' | '), 'error');
        return;
    }

    closeModal();
    renderTaskTable();
    showToast(isEdit ? 'Cập nhật task thành công!' : 'Thêm task thành công!');
}

// Gán các sự kiện cho bảng, bộ lọc, modal
function setupEvents() {

    // Nút tìm kiếm và xóa lọc
    document.getElementById('btn-search-task').addEventListener('click', searchTasks);
    document.getElementById('btn-reset-task').addEventListener('click', resetFilters);

    // Enter trên các ô text/date trong bộ lọc => tìm kiếm ngay
    ['filter-task-name', 'filter-task-description',
        'filter-task-date-from', 'filter-task-date-to'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchTasks();
                }
            });
        });

    // Dropdown trạng thái => lọc ngay khi thay đổi
    document.getElementById('filter-task-status').addEventListener('change', searchTasks);

    // Nút thêm task => mở modal chế độ Thêm mới
    document.getElementById('btn-add-appointment').addEventListener('click', () => openModal());

    // Nút lưu / hủy / đóng modal
    document.getElementById('btn-save-patient').addEventListener('click', saveTask);
    document.getElementById('btn-cancel-patient').addEventListener('click', closeModal);
    document.getElementById('btn-close-task').addEventListener('click', closeModal);

    // Click overlay modal => đóng modal
    document.getElementById('modal-add-task').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Sửa và Xóa
    const tbody = document.getElementById('tasks-tbody');

    tbody.addEventListener('click', e => {
        // Nút chỉnh sửa
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            e.stopPropagation();
            openModal(editBtn.dataset.id);
            return;
        }

        // Nút xóa
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            e.stopPropagation();
            showConfirm(`Bạn có chắc muốn xóa task "${deleteBtn.dataset.name}" không?`, () => {
                const ok = Task.deleteById(deleteBtn.dataset.id);
                if (ok) {
                    renderTaskTable();
                    showToast('Đã xóa task thành công!');
                } else {
                    showToast('Xóa thất bại!', 'error');
                }
            });
            return;
        }
    });

    // Double-click vào dòng => mở modal Sửa
    tbody.addEventListener('dblclick', e => {
        if (e.target.closest('.btn-action')) return;
        const row = e.target.closest('tr[data-id]');
        if (row && !row.classList.contains('empty-row')) {
            openModal(row.dataset.id);
        }
    });

}

// Setup giao diện: sidebar, topbar, zoom, nút cuộn
function setupUI() {
    const sidebar = document.getElementById('sidebar');

    // Ẩn/hiện sidebar
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Nút điều hướng trình duyệt
    document.getElementById('btn-back').addEventListener('click', () => history.back());
    document.getElementById('btn-next').addEventListener('click', () => history.forward());
    document.getElementById('btn-refresh').addEventListener('click', () => document.location.reload());

    // Phóng to / thu nhỏ trang
    const applyZoom = () => {
        document.body.style.zoom = appState.zoomLevel;
        document.getElementById('zoom-label').textContent = Math.round(appState.zoomLevel * 100) + '%';
    };

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        appState.zoomLevel = Math.min(2, appState.zoomLevel + 0.1); applyZoom();
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        appState.zoomLevel = Math.max(0.5, appState.zoomLevel - 0.1); applyZoom();
    });
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
        appState.zoomLevel = 1; applyZoom();
    });

    // Nút cuộn lên đầu trang (floating)
    const pageContent = document.getElementById('page-tasks');
    const btnTop = document.getElementById('btn-scroll-top');

    btnTop.addEventListener('click', () => {
        pageContent.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Hiện/ẩn nút cuộn dựa theo vị trí scroll
    pageContent.addEventListener('scroll', () => {
        btnTop.classList.toggle('visible', pageContent.scrollTop > 300);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    seedIfEmpty();
    setupUI();
    setupEvents();
    renderTaskTable();
});
