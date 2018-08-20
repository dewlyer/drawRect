/**
 * Interface Rectangle
 */
interface Rectangle {
    readonly id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Mark Class
 */
export default class Mark implements Rectangle {

    // private static origin = { x: 0, y: 0 };

    public constructor (
        private readonly _id: string,
        private _x: number,
        private _y: number,
        private _width: number,
        private _height: number
    ) {
        this.initialize();
    }

    public get id (): string { return this._id; }
    // public set id (id: string) { this._id = id; }

    public get x (): number { return this._x; }
    public set x (x: number) { this._x = x; }

    public get y (): number { return this._y; }
    public set y (y: number) { this._y = y; }

    public get width (): number { return this._width; }
    public set width (width: number) { this._width = width; }

    public get height (): number { return this._height; }
    public set height (height: number) { this._height = height; }

    private initialize (): void {
        console.log('Class Mark Initialize Successfully');
        console.log(this.id);
    }

}
