class Task {

    static STORAGE_KEY = 'tasks';
    static ID_PREFIX = 'TASK';

    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.createdAt = data.createdAt || '';
        this.status = data.status || '';
        this.description = data.description || '';
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            status: this.status,
            description: this.description
        }
    }

    validate() {
        const errors = [];
        if (!this.name.trim()) errors.push('Tên task không được để trống');
        if (!this.description.trim()) errors.push('Thiếu mô tả công việc trong task');

        return {valid: errors.length ===0, errors};
    }

    save() {
        const validation = this.validate();
        if (!validation.valid) return validation;

        if (!this.id) {
            const today = new Date();
            const yy = String(today.getFullYear()).slice(2);
            const mm = String(today.getMonth()+1).padStart(2, '0');
            const dateStr = `${mm}${yy}`

            const items = StorageManager.getAll(Task.STORAGE_KEY);
            const prefix = Task.ID_PREFIX + dateStr;
            let maxNum = 0;

            items.forEach(item => {
                if (item.id && item.id.startsWith(prefix)){
                    const num = parseInt(item.id.replace(prefix, ''), 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num; 
                }
            });

            const counter = String(maxNum + 1).padStart(4, '0');
            
            this.id = prefix + counter;

            const yyyy = today.getFullYear();
            const dd = String(today.getDate()).padStart(2, '0');
            this.createdAt = `${yyyy}-${mm}-${dd}`;

        }

        const existing = StorageManager.findById(Task.STORAGE_KEY, this.id);
        if (existing)
            StorageManager.updateItem(Task.STORAGE_KEY, this.id, this.toJSON());
        else
             StorageManager.addItem(Task.STORAGE_KEY, this.toJSON());


        return {valid: true, errors: []};
    }

    static removeVN(str) {
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
        return str;
    }

    static getAll() {
        return StorageManager.getAll(Task.STORAGE_KEY).map(p => new Task(p));
    }

    static findById(id) {
        const data = StorageManager.findById(Task.STORAGE_KEY, id );
        return data ? new Task(data) : null;
    }

    static deleteById(id) {
        return StorageManager.deleteItem(Task.STORAGE_KEY, id )
    }

    static search(filters = {}) {
        let results = Task.getAll();

        if (filters.nameOrId) {
            const kw = Task.removeVN(filters.nameOrId).toLowerCase();
            results = results.filter(p => 
                Task.removeVN(p.name).toLowerCase().includes(kw) || 
                Task.removeVN(p.id).toLowerCase().includes(kw)
            );
        }
        if (filters.status) {
            results = results.filter(p => p.status === filters.status);
        }
        if (filters.description) {
            const kw = Task.removeVN(filters.description).toLowerCase();
            results = results.filter(p => Task.removeVN(p.description).toLowerCase().includes(kw));
        }

        if (filters.dateFrom) { 
            results = results.filter(p => p.createdAt >= filters.dateFrom);
        }
        if (filters.dateTo) {
            results = results.filter(p => p.createdAt <= filters.dateTo);
        }
        return results;
    }
}