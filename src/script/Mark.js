class Mark {

    constructor(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get ID() {
        return this.id;
    }
    set ID(val) {
        this.id = val;
    }

    get X() {
        return this.x;
    }
    set X(val) {
        this.x = val;
    }

    get Y() {
        return this.y;
    }
    set Y(val) {
        this.y = val;
    }

    get Width() {
        return this.width;
    }
    set Width(val) {
        this.width = val;
    }

    get Height() {
        return this.height;
    }
    set Height(val) {
        this.height = val;
    }

}

export default Mark;
