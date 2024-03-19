const storage = {
    setItem(key, item) {
        if (this.containsKey(key))
            this.removeItem(key);

        localStorage.
            setItem(key, item);
    },

    getItem(key) {
        return localStorage.getItem(key);
    },

    removeItem(key) {
        localStorage.removeItem(key)
    },

    containsKey(key) {
        const result = this.getItem(key);
        if (result)
            return true;

        return false;
    }
};