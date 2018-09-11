import Mark from './Mark';

export class Marker {

    private static defaults = {
        container: document.documentElement,
        canvasWidth: 0,
        line: {
            color: {
                normal: 'rgb(20, 71, 204)',
                select: 'rgb(255, 48, 0)',
                active: 'rgb(60, 60, 60)'
            },
            width: 1,
            join: 'round',
            dash: [5, 3]
        },
        rect: {
            color: {
                normal: 'rgba(20, 71, 204, 0.25)',
                select: 'rgba(255, 48, 0, 0.25)'
            }
        },
        text: {
            font: '14px Arial',
            color: 'rgba(255, 255, 255, 0.75)'
        }
    };
    private settings: any;

    private image: any = null;
    private ctx: any = null;

    private origin = { x: 0, y: 0 };
    private selectedOrigin: { x: number, y: number };
    private mark: Mark;
    private selectedMark: Mark;
    private markList: Mark[];

    private scaleHandSize = 10;
    private canvasScale = 1;
    private cursorEvent: string;

    private readonly imageUrl: string;
    private canvas: any;

    public constructor (canvas: any, imageUrl: string, options?: any) {
        this.canvas = canvas;
        this.imageUrl = imageUrl;
        this.settings = Object.assign({}, Marker.defaults, options || {});
        this.initialize();
    }

    // getMark () {
    //     let _this = this;
    //     return _this.mark;
    // }
    public setMark (event: MouseEvent) {
        let _this = this;
        let point = _this.getEventPosition(event);

        let [id, x, y, width, height] = [_this.markList.length, 0, 0, 0, 0];

        if (point.x >= _this.origin.x) {
            x = _this.origin.x;
            width = point.x - _this.origin.x;
        } else {
            x = point.x;
            width = _this.origin.x - point.x;
        }

        if (point.y >= _this.origin.y) {
            y = _this.origin.y;
            height = point.y - _this.origin.y;
        } else {
            y = point.y;
            height = _this.origin.y - point.y;
        }

        _this.mark = new Mark(id.toString(), x, y, width, height);
    }
    public addMark () {
        let _this = this;
        _this.markList.push(_this.mark);
    }

    public getMarkIndexById (id: string): number {
        let _this = this,
            index: number = null;

        _this.markList.every(function (item, i) {
            if (item.id === id) {
                index = i;
                return false;
            } else {
                return true;
            }
        });

        return index;
    }
    public getSelectedMarkIndex () {
        let _this = this;
        if (_this.selectedMark && (typeof _this.selectedMark.id !== 'undefined')) {
            return _this.getMarkIndexById(_this.selectedMark.id);
        } else {
            return null;
        }
    }

    public getSelectedMark () {
        let _this = this;
        let index = _this.getSelectedMarkIndex();
        if (index !== null) {
            return _this.markList[index];
        }
    }
    public setSelectedMark (index: number, event: MouseEvent) {
        let selectItem = this.markList[index];
        let {id, x, y, width, height} = selectItem;
        this.selectedOrigin = this.getEventPosition(event);
        this.selectedMark = new Mark(id, x, y, width, height);
        // {
        //     id: selectItem.id,
        //     width: selectItem.width,
        //     height: selectItem.height,
        //     x: selectItem.x,
        //     y: selectItem.y
        // };
    }

    public getMarkList () {
        let _this = this;
        return _this.markList;
    }
    // setMarkList (list) {
    //     let _this = this;
    //     _this.markList = list;
    // }
    public sortMarkList (index: number) {
        let _this = this;
        let selectedMark = _this.markList[index];
        _this.markList.splice(index, 1);
        _this.markList.push(selectedMark);
    }

    public setMarkOffset (event: MouseEvent, itemIndex: number) {
        let position = this.getEventPosition(event);
        let offsetX = position.x - this.selectedOrigin.x;
        let offsetY = position.y - this.selectedOrigin.y;
        this.markList[itemIndex].x = this.selectedMark.x + offsetX;
        this.markList[itemIndex].y = this.selectedMark.y + offsetY;
    }
    public resizeMark (event: MouseEvent, itemIndex: number, direction: string) {
        let _this = this;
        let point = _this.getEventPosition(event);
        let offsetW = point.x - _this.selectedOrigin.x;
        let offsetH = point.y - _this.selectedOrigin.y;

        let ways = direction.split(',');
        ways.forEach(function (item) {
            if (item === 'left') {
                if (offsetW <= 0 || _this.markList[itemIndex].width >= 2 * _this.scaleHandSize) {
                    _this.markList[itemIndex].x = _this.selectedMark.x + offsetW;
                    _this.markList[itemIndex].width = _this.selectedMark.width - offsetW;
                }
            } else if (item === 'right') {
                if (offsetW >= 0 || _this.markList[itemIndex].width >= 2 * _this.scaleHandSize) {
                    _this.markList[itemIndex].width = _this.selectedMark.width + offsetW;
                }
            } else if (item === 'top') {
                if (offsetH <= 0 || _this.markList[itemIndex].height > 2 * _this.scaleHandSize) {
                    _this.markList[itemIndex].y = _this.selectedMark.y + offsetH;
                    _this.markList[itemIndex].height = _this.selectedMark.height - offsetH;
                }
            } else if (item === 'bottom') {
                if (offsetH >= 0 || _this.markList[itemIndex].height >= 2 * _this.scaleHandSize) {
                    _this.markList[itemIndex].height = _this.selectedMark.height + offsetH;
                }
            }
        });
    }

    public getMouseAction (event: MouseEvent) {
        let _this = this;
        let action = { name: 'append', index: 0, direction: '' };
        let point = _this.getEventPosition(event);
        let itemIndex = _this.getSelectedMarkIndex();

        if (_this.markList.length > 0) {
            _this.markList.forEach(function (item, index) {
                let x1 = item.x, x2 = item.x + item.width,
                    y1 = item.y, y2 = item.y + item.height;
                if (point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2) {
                    action.index = index;
                    action.name = 'scale';
                    if (index === itemIndex) {
                        if (point.x <= x1 + _this.scaleHandSize) {
                            if (point.y <= y1 + _this.scaleHandSize) {
                                action.direction = 'left,top';
                            } else if (point.y >= y2 - _this.scaleHandSize) {
                                action.direction = 'left,bottom';
                            } else {
                                action.direction = 'left';
                            }
                        } else if (point.x >= x2 - _this.scaleHandSize) {
                            if (point.y <= y1 + _this.scaleHandSize) {
                                action.direction = 'right,top';
                            } else if (point.y >= y2 - _this.scaleHandSize) {
                                action.direction = 'right,bottom';
                            } else {
                                action.direction = 'right';
                            }
                        } else if (point.y <= y1 + _this.scaleHandSize) {
                            action.direction = 'top';
                        } else if (point.y >= y2 - _this.scaleHandSize) {
                            action.direction = 'bottom';
                        } else {
                            action.name = 'move';
                        }
                    } else {
                        action.name = 'move';
                    }
                }
            });
        }

        return action;
    }
    public getCanvasAbsOffset () {
        let actualLeft = this.canvas.offsetLeft,
            actualTop = this.canvas.offsetTop,
            current = this.canvas.offsetParent; // 取得元素的offsetParent

        // 一直循环直到根元素
        while (current !== null) {
            actualLeft += current.offsetLeft;
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }

        // 返回包含left、top坐标的对象
        return {
            left: actualLeft,
            top: actualTop
        };
    }
    public getEventPosition (event: MouseEvent) {
        let scale = this.canvasScale;
        let canvasAbsOffset = this.getCanvasAbsOffset();
        let scrollContainer = this.settings.container;

        return {
            x: ((event.x + scrollContainer.scrollLeft) - canvasAbsOffset.left) / scale,
            y: ((event.y + scrollContainer.scrollTop) - canvasAbsOffset.top) / scale
        };
    }
    public canAppendMark (event: MouseEvent, success: Function, failure: Function) {
        let _this = this;
        let point = _this.getEventPosition(event);
        let width = Math.abs(point.x - _this.origin.x);
        let height = Math.abs(point.y - _this.origin.y);
        if (width > 2 * _this.scaleHandSize && height > 2 * _this.scaleHandSize) {
            // typeof success === 'function' && success();
            success();
        } else {
            // typeof failure === 'function' && failure();
            failure();
        }
    }
    public setOriginPoint (event: MouseEvent) {
        let _this = this;
        _this.origin = _this.getEventPosition(event);
    }
    public setCursorStyle (event: MouseEvent, itemIndex: number) {
        let _this = this;
        if (_this.markList.length <= 0) { return; }

        let point = _this.getEventPosition(event);
        let item = _this.markList[itemIndex];
        let style =  'cursor: move;';
        let x1 = item.x, x2 = item.x + item.width,
            y1 = item.y, y2 = item.y + item.height;

        if (point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2) {
            if (point.x <= x1 + _this.scaleHandSize) {
                if (point.y <= y1 + _this.scaleHandSize) {
                    style =  'cursor: nw-resize;';
                } else if (point.y >= y2 - _this.scaleHandSize) {
                    style =  'cursor: sw-resize;';
                } else {
                    style =  'cursor: w-resize;';
                }
            } else if (point.x >= x2 - _this.scaleHandSize) {
                if (point.y <= y1 + _this.scaleHandSize) {
                    style =  'cursor: ne-resize;';
                } else if (point.y >= y2 - _this.scaleHandSize) {
                    style =  'cursor: se-resize;';
                } else {
                    style =  'cursor: e-resize;';
                }
            } else if (point.y <= y1 + _this.scaleHandSize) {
                style =  'cursor: n-resize;';
            } else if (point.y >= y2 - _this.scaleHandSize) {
                style =  'cursor: s-resize;';
            } else {
                style = 'cursor: move;';
            }
        } else {
            style =  'cursor: default;';
        }
        _this.canvas.style = style;
    }
    public scaleCanvas (scale: number) {
        let _this = this;
        _this.canvasScale *= scale;
        _this.redraw();
    }

    public clearCanvas () {
        let _this = this;
        _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    }

    public clearMarkList () {
        let _this = this;
        _this.markList = [];
    }

    public clearMark (id: string) {
        let _this = this,
            index = _this.getMarkIndexById(id);

        if (index !== null) {
            _this.markList.splice(index, 1);
            _this.redraw();
        }
    }

    public clearSelectedMark () {
        let _this = this;
        _this.selectedMark = null;
    }

    public clearCurrentMark () {
        let _this = this;
        let itemIndex = _this.getSelectedMarkIndex();
        if (itemIndex !== null && _this.cursorEvent === 'none') {
            let id = _this.markList[itemIndex].id;
            _this.clearMark(id);
            _this.canvas.onmousemove = null;
        }
    }

    public clear () {
        let _this = this;
        if (_this.cursorEvent === 'none') {
            _this.clearMarkList();
            _this.redraw();
        }
    }

    public handleEvent () {
        let _this = this,
            selectIndex: number = null,
            handler = {
                mouseDown: function (e: MouseEvent) {
                    if (e.button !== 0) { return; }
                    let action = _this.getMouseAction(e);
                    if (action.name === 'move') {
                        _this.cursorEvent = 'move';
                        _this.canvas.style = 'cursor: move;';
                        _this.setSelectedMark(action.index, e);
                        _this.sortMarkList(action.index);
                        selectIndex = _this.getSelectedMarkIndex();
                        _this.redraw(true);
                        _this.canvas.onmousemove = handler.selectMove;
                        _this.canvas.onmouseup = handler.selectUp;
                    } else if (action.name === 'scale') {
                        _this.cursorEvent = 'scale';
                        _this.canvas.style = 'cursor: move;';
                        _this.setSelectedMark(action.index, e);
                        selectIndex = _this.getSelectedMarkIndex();
                        _this.canvas.onmousemove = function (event: MouseEvent) {
                            handler.scaleMove(event, action.direction);
                        };
                        _this.canvas.onmouseup = handler.scaleUp;
                    } else {
                        // append rect
                        _this.cursorEvent = 'none';
                        _this.canvas.style = 'cursor: default;';
                        _this.setOriginPoint(e);
                        _this.clearSelectedMark();
                        _this.canvas.onmousemove = handler.mouseMove;
                        _this.canvas.onmouseup = handler.mouseUp;
                    }
                },
                mouseMove: function (e: MouseEvent) {
                    _this.setMark(e);
                    _this.redraw();
                    _this.drawCurrentMark();
                },
                mouseUp: function (e: MouseEvent) {
                    if (e.button !== 0) { return; }
                    _this.canAppendMark(e, function () {
                        _this.setMark(e);
                        _this.addMark();
                    }, function () {
                        // alert('所选区域太小，请重现选取！');
                    });
                    _this.redraw();
                    _this.canvas.onmousemove = null;
                    _this.canvas.onmouseup = null;
                },
                activeMove: function (e: MouseEvent) {
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.setCursorStyle(e, selectIndex);
                },
                selectMove: function (e: MouseEvent) {
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.setMarkOffset(e, selectIndex);
                    _this.redraw(true);
                },
                selectUp: function (e: MouseEvent) {
                    if (e.button !== 0) { return; }
                    // selectIndex = _this.getSelectedMarkIndex();
                    // _this.setMarkOffset(e, selectIndex);
                    _this.redraw(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                    _this.cursorEvent = 'none';
                },
                scaleMove: function (e: MouseEvent, direction: string) {
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.resizeMark(e, selectIndex, direction);
                    _this.redraw(true);
                },
                scaleUp: function (e: MouseEvent) {
                    if (e.button !== 0) { return; }
                    _this.redraw(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                    _this.cursorEvent = 'none';
                }
            };

        _this.canvas.onmousedown = handler.mouseDown;
    }

    public getImageWidth (): number {
        return this.image.naturalWidth || this.image.width;
    }
    public getImageHeight (): number {
        return this.image.naturalHeight || this.image.height;
    }
    public getCanvasScale (): number {
        return this.canvasScale;
    }
    // public setCanvasScale (scale: number) {
    //     this.canvasScale = scale;
    //     this.ctx.scale(this.canvasScale, this.canvasScale);
    // }

    /***
     * Drawing Functions
     * */

    public drawBackgroundImage (): void {
        // this.ctx.scale(this.canvasScale, this.canvasScale);
        let scale = this.getCanvasScale(),
            [width, height] = [this.getImageWidth() * scale, this.getImageHeight() * scale];
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(this.image, 0, 0, width, height);
    }

    public drawCurrentMark (): void {
        this.ctx.save();
        this.ctx.strokeStyle = this.settings.line.color.active;
        this.ctx.lineWidth = this.settings.line.width;
        this.ctx.setLineDash(this.settings.line.dash);

        let scale = this.getCanvasScale();
        this.ctx.strokeRect(
            this.mark.x * scale,
            this.mark.y * scale,
            this.mark.width * scale,
            this.mark.height * scale
        );
        this.ctx.restore();
    }

    public drawMarkList (selected: boolean): void {
        let _this = this;
        let selectIndex: number = null;
        if (selected) {
            selectIndex = _this.getSelectedMarkIndex();
        }
        _this.ctx.save();
        _this.ctx.lineJoin = _this.settings.line.join;
        _this.ctx.lineWidth = _this.settings.line.width;
        _this.ctx.strokeStyle = _this.settings.line.color.normal;
        _this.ctx.fillStyle = _this.settings.rect.color.normal;

        _this.markList.forEach(function (item, index) {
            if (selectIndex === index) {
                _this.ctx.save();
                _this.ctx.strokeStyle = _this.settings.line.color.select;
                _this.ctx.fillStyle = _this.settings.rect.color.select;
                _this.ctx.lineWidth = _this.settings.line.width;
                _this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                _this.ctx.shadowOffsetX = 0;
                _this.ctx.shadowOffsetY = 2;
                _this.ctx.shadowBlur = 3;
            }
            _this.ctx.fillRect(item.x * _this.canvasScale, item.y * _this.canvasScale,
                item.width * _this.canvasScale, item.height * _this.canvasScale);
            _this.ctx.strokeRect(item.x * _this.canvasScale, item.y * _this.canvasScale,
                item.width * _this.canvasScale, item.height * _this.canvasScale);
            if (selectIndex === index) {
                _this.ctx.restore();
            }
            _this.drawCoordinate(item, index, selected, selectIndex);
        });

        _this.ctx.restore();
    }

    public drawCoordinate (item: Mark, index: number, selected: boolean, selectIndex: number): void {
        let verOffset = 4,
            horOffset = 4,
            scale = this.getCanvasScale(),
            str = `ID: ${item.id} - X: ${item.x} - Y: ${item.y} - Z: ${index} - W: ${item.width} - H: ${item.height}`;

        this.ctx.save();
        this.ctx.font = this.settings.text.font;
        this.ctx.fillStyle = this.settings.text.color;
        this.ctx.fillRect(
            item.x * scale - 1,
            item.y * scale - 1,
            this.ctx.measureText(str).width + horOffset,
            -(parseInt(this.settings.text.font, 10) + verOffset)
        );
        this.ctx.fillStyle = (selected && selectIndex === index) ? this.settings.line.color.select : this.settings.line.color.normal;
        this.ctx.fillText(str, item.x * scale, item.y * scale - verOffset);
        this.ctx.restore();
    }

    public redraw (selected?: boolean): void {
        this.clearCanvas();
        this.drawBackgroundImage();
        this.drawMarkList(selected);
    }

    public run (callback: () => void): void {
        let _this = this;
        this.initImageObj(() => {
            if (_this.image.src) {
                _this.drawBackgroundImage();
                _this.handleEvent();
                callback();
            } else {
                console.log('图片加载错误');
            }
        });
    }

    private setImageSrc (url: string): void {
        this.image.src = url;
    }

    private initImageObj (callback: () => void): void {
        this.setImageSrc(this.imageUrl);
        this.image.addEventListener('load', () => {
            callback();
        });
    }

    private initialize (): void {
        this.image = new Image();
        this.ctx = this.canvas.getContext('2d');
        this.markList = [];

        let manualScale = null;
        if(this.settings.canvasWidth && this.image.length) {
            manualScale = this.settings.canvasWidth / (this.image[0].naturalWidth || this.image[0].width);
            this.canvasScale = manualScale;
        }

        if(this.settings.data && this.settings.data.length > 0) {
            this.markList = this.settings.data;
            this.redraw();
        }
    }
}
