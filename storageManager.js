class StorageManager {

    static getAll(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }
    
    static saveAll(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch(e) {
            console.error(e);
            return [];
        }
    }

    static deleteAll(keys = []) {
        if (!Array.isArray(keys) || keys.length === 0) {
            return false;
        }

        keys.forEach(key => localStorage.removeItem(key));
        return true;
    }

    static findById(key, id) {
        const items = this.getAll(key);
        const item = items.find(p => p.id === id);
        return item || null;
    }

    static addItem(key, item) {
        const items = this.getAll(key);
        items.push(item);
        this.saveAll(key, items);
    }

    static updateItem(key, id, updateData) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === id);
        if (index != -1) {
            items[index] = {...items[index], ...updateData};
            this.saveAll(key, items);
            return true;
        }
        return false;
    }

    static deleteItem(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(p => p.id !== id);
        this.saveAll(key, filtered);
        return filtered.length < items.length;
    }

}