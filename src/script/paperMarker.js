import Mark from './Mark';

class PaperMarker {
    constructor(canvas, imageUrl, options) {
        this.mark = {};
        this.markList = [];

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.imageUrl = imageUrl;
        this.image = new Image();

        this.origin = { x: 0, y: 0 };

        this.scaleHandSize = 10;
        this.canvasScale = 1;

        this.defaults = {
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

        this.settings = {};
        Object.assign(this.settings, this.defaults, options);
        // this.settings = ({}, this.defaults, options);
    }

    getMark () {
        let _this = this;
        return _this.mark;
    }
    setMark (event) {
        let _this = this;
        let point = _this.getEventPosition(event);

        let [id, x, y, width, height] = [_this.markList.length];

        if(point.x >= _this.origin.x) {
            x = _this.origin.x;
            width = point.x - _this.origin.x;
        }
        else {
            x = point.x;
            width = _this.origin.x - point.x;
        }

        if(point.y >= _this.origin.y) {
            y = _this.origin.y;
            height = point.y - _this.origin.y;
        }
        else {
            y = point.y;
            height = _this.origin.y - point.y;
        }

        _this.mark = new Mark(id, x, y, width, height);
    }
    addMark () {
        let _this = this;
        _this.markList.push(_this.mark);
    }

    getMarkIndexById (id) {
        let _this = this,
            index = null;

        _this.markList.every(function (item, i) {
            if(item.ID === id) {
                index = i;
                return false;
            }
            else {
                return true;
            }
        });

        return index;
    }
    getSelectedMarkIndex () {
        let _this = this;
        if((typeof _this.selectedMark !== 'undefined') && (typeof _this.selectedMark.ID !== 'undefined')) {
            return _this.getMarkIndexById(_this.selectedMark.ID);
        }
        else {
            return null;
        }
    }

    getSelectedMark () {
        let _this = this;
        let index = _this.getSelectedMarkIndex();
        if(index !== null) {
            return _this.markList[index];
        }
    }
    setSelectedMark (index) {
        let _this = this;
        let selectItem = _this.markList[index];
        _this.selectedOrigin = _this.getEventPosition(event);
        _this.selectedMark = selectItem;
        // {
        //     id: selectItem.id,
        //     width: selectItem.width,
        //     height: selectItem.height,
        //     x: selectItem.x,
        //     y: selectItem.y
        // };
    }

    getMarkList () {
        let _this = this;
        return _this.markList;
    }
    setMarkList (list) {
        let _this = this;
        _this.markList = list;
    }
    sortMarkList (index) {
        let _this = this;
        let selectedMark = _this.markList[index];
        _this.markList.splice(index, 1);
        _this.markList.push(selectedMark);
    }

    setMarkOffset (event, itemIndex) {
        let _this = this;
        let position = _this.getEventPosition(event);
        let offsetX = position.x - _this.selectedOrigin.x;
        let offsetY = position.y - _this.selectedOrigin.y;
        _this.markList[itemIndex].X = _this.selectedMark.X + offsetX;
        _this.markList[itemIndex].Y = _this.selectedMark.Y + offsetY;
    }
    resizeMark (event, itemIndex, direction) {
        let _this = this;
        let point = _this.getEventPosition(event);
        let offsetW = point.x - _this.selectedOrigin.x;
        let offsetH = point.y - _this.selectedOrigin.y;

        let ways = direction.split(',');
        ways.forEach(function (item) {
            if(item === 'left') {
                if(offsetW <= 0 || _this.markList[itemIndex].Width >= 2*_this.scaleHandSize) {
                    _this.markList[itemIndex].X = _this.selectedMark.X + offsetW;
                    _this.markList[itemIndex].Width = _this.selectedMark.Width - offsetW;
                }
            }
            else if(item === 'right') {
                if(offsetW >= 0 || _this.markList[itemIndex].Width >= 2*_this.scaleHandSize) {
                    _this.markList[itemIndex].Width = _this.selectedMark.Width + offsetW;
                }
            }
            else if(item === 'top') {
                if(offsetH <= 0 || _this.markList[itemIndex].Height > 2*_this.scaleHandSize) {
                    _this.markList[itemIndex].Y = _this.selectedMark.Y + offsetH;
                    _this.markList[itemIndex].Height = _this.selectedMark.Height - offsetH;
                }
            }
            else if(item === 'bottom') {
                if(offsetH >= 0 || _this.markList[itemIndex].Height >= 2*_this.scaleHandSize) {
                    _this.markList[itemIndex].Height = _this.selectedMark.Height + offsetH;
                }
            }
        });
    }

    getMouseAction (event) {
        let _this = this;
        let action = { name: 'append', index: 0, direction: '' };
        let point = _this.getEventPosition(event);
        let itemIndex = _this.getSelectedMarkIndex();

        if(_this.markList.length > 0) {
            _this.markList.forEach(function (item, index) {
                let x1 = item.X, x2 = item.X + item.Width,
                    y1 = item.Y, y2 = item.Y + item.Height;
                if(point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2) {
                    action.index = index;
                    action.name = 'scale';
                    if(index === itemIndex) {
                        if(point.x <= x1 + _this.scaleHandSize) {
                            if(point.y <= y1 + _this.scaleHandSize) {
                                action.direction = 'left,top';
                            }
                            else if(point.y >= y2 - _this.scaleHandSize) {
                                action.direction = 'left,bottom';
                            }
                            else {
                                action.direction = 'left';
                            }
                        }
                        else if(point.x >= x2 - _this.scaleHandSize) {
                            if(point.y <= y1 + _this.scaleHandSize) {
                                action.direction = 'right,top';
                            }
                            else if(point.y >= y2 - _this.scaleHandSize) {
                                action.direction = 'right,bottom';
                            }
                            else {
                                action.direction = 'right';
                            }
                        }
                        else if(point.y <= y1 + _this.scaleHandSize) {
                            action.direction = 'top';
                        }
                        else if(point.y >= y2 - _this.scaleHandSize) {
                            action.direction = 'bottom';
                        }
                        else {
                            action.name = 'move';
                        }
                    }
                    else {
                        action.name = 'move';
                    }
                }
            });
        }

        return action;
    }
    getImage (callback) {
        let _this = this;
        _this.image.src = _this.imageUrl;
        _this.image.onload = function () {
            if(typeof callback === 'function') {
                callback();
            }
        };
    }
    getEventPosition (event) {
        let _this = this;
        return {
            x: (event.x + window.scrollX) / _this.canvasScale,
            y: (event.y + window.scrollY) / _this.canvasScale
        };
    }
    canAppendMark (event, success, failure) {
        let _this = this;
        let point = _this.getEventPosition(event);
        let width = Math.abs(point.x - _this.origin.x);
        let height = Math.abs(point.y - _this.origin.y);
        if(width > 2*_this.scaleHandSize && height > 2*_this.scaleHandSize) {
            (typeof success === 'function') && success();
        }
        else {
            (typeof failure === 'function') && failure();
        }
    }
    setOriginPoint (event) {
        let _this = this;
        _this.origin = _this.getEventPosition(event);
    }
    setCursorStyle (event, itemIndex) {
        let _this = this;
        if(_this.markList.length <= 0) { return }

        let point = _this.getEventPosition(event);
        let item = _this.markList[itemIndex];
        let style =  'cursor: move;';
        let x1 = item.X, x2 = item.X + item.Width,
            y1 = item.Y, y2 = item.Y + item.Height;

        if(point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2) {
            if(point.x <= x1 + _this.scaleHandSize) {
                if(point.y <= y1 + _this.scaleHandSize) {
                    style =  'cursor: nw-resize;';
                }
                else if(point.y >= y2 - _this.scaleHandSize) {
                    style =  'cursor: sw-resize;';
                }
                else {
                    style =  'cursor: w-resize;';
                }
            }
            else if(point.x >= x2 - _this.scaleHandSize) {
                if(point.y <= y1 + _this.scaleHandSize) {
                    style =  'cursor: ne-resize;';
                }
                else if(point.y >= y2 - _this.scaleHandSize) {
                    style =  'cursor: se-resize;';
                }
                else {
                    style =  'cursor: e-resize;';
                }
            }
            else if(point.y <= y1 + _this.scaleHandSize) {
                style =  'cursor: n-resize;';
            }
            else if(point.y >= y2 - _this.scaleHandSize) {
                style =  'cursor: s-resize;';
            }
            else {
                style = 'cursor: move;';
            }
        }
        else {
            style =  'cursor: default;';
        }
        _this.canvas.style = style;
    }
    setCanvasScale (scale) {
        let _this = this;
        _this.canvasScale *= scale;
        _this.redraw();
    }

    drawImage () {
        let _this = this;
        _this.ctx.scale(_this.canvasScale, _this.canvasScale);
        _this.canvas.width = (_this.image.naturalWidth || _this.image.width) * _this.canvasScale;
        _this.canvas.height = (_this.image.naturalHeight || _this.image.height) * _this.canvasScale;
        _this.ctx.drawImage(_this.image, 0, 0, _this.canvas.width, _this.canvas.height);
    }

    drawCurrentMark () {
        let _this = this;
        _this.ctx.save();
        _this.ctx.strokeStyle = _this.settings.line.color.active;
        _this.ctx.lineWidth = _this.settings.line.width;
        _this.ctx.setLineDash(_this.settings.line.dash);
        _this.ctx.strokeRect(
            _this.mark.X * _this.canvasScale,
            _this.mark.Y * _this.canvasScale,
            _this.mark.Width * _this.canvasScale,
            _this.mark.Height * _this.canvasScale
        );
        _this.ctx.restore();
    }

    drawMarkList (selected) {
        let _this = this;
        let selectIndex = null;
        if(selected) {
            selectIndex = _this.getSelectedMarkIndex();
        }
        _this.ctx.save();
        _this.ctx.lineJoin = _this.settings.line.join;
        _this.ctx.lineWidth = _this.settings.line.width;
        _this.ctx.strokeStyle = _this.settings.line.color.normal;
        _this.ctx.fillStyle = _this.settings.rect.color.normal;

        _this.markList.forEach(function (item, index) {
            if(selectIndex === index) {
                _this.ctx.save();
                _this.ctx.strokeStyle = _this.settings.line.color.select;
                _this.ctx.fillStyle = _this.settings.rect.color.select;
                _this.ctx.lineWidth = _this.settings.line.width;
                _this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                _this.ctx.shadowOffsetX = 0;
                _this.ctx.shadowOffsetY = 2;
                _this.ctx.shadowBlur = 3;
            }
            _this.ctx.fillRect(item.X * _this.canvasScale, item.Y * _this.canvasScale,
                item.Width * _this.canvasScale, item.Height * _this.canvasScale);
            _this.ctx.strokeRect(item.X * _this.canvasScale, item.Y * _this.canvasScale,
                item.Width * _this.canvasScale, item.Height * _this.canvasScale);
            if(selectIndex === index) {
                _this.ctx.restore();
            }
            _this.drawCoordinate(item, index, selected, selectIndex);
        });

        _this.ctx.restore();
    }

    drawCoordinate (item, index, selected, selectIndex) {
        let _this = this;
        let verOffset = 4;
        let horOffset = 4;
        let str = 'ID:' + item.ID + ' - X:' + item.X + ' / Y:' + item.Y + ' / Z:' + index +
            ' - W:' + item.Width + ' / H:' + item.Height;

        _this.ctx.save();
        _this.ctx.font = _this.settings.text.font;
        _this.ctx.fillStyle = _this.settings.text.color;
        _this.ctx.fillRect(item.X * _this.canvasScale - 1, item.Y * _this.canvasScale - 1,
            _this.ctx.measureText(str).width + horOffset, -(parseInt(_this.settings.text.font) + verOffset));
        _this.ctx.fillStyle = (selected && selectIndex === index) ? _this.settings.line.color.select : _this.settings.line.color.normal;
        _this.ctx.fillText(str, item.X * _this.canvasScale, item.Y * _this.canvasScale - verOffset);
        _this.ctx.restore();
    }

    redraw (selected) {
        let _this = this;
        _this.clearCanvas();
        _this.drawImage();
        _this.drawMarkList(selected);
    }

    clearCanvas () {
        let _this = this;
        _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    }

    clearMarkList () {
        let _this = this;
        _this.markList = [];
    }

    clearMark (id) {
        let _this = this,
            index = _this.getMarkIndexById(id);

        if(index !== null) {
            _this.markList.splice(index, 1);
            _this.redraw();
        }
    }

    clearSelectedMark () {
        let _this = this;
        _this.selectedMark = {};
    }

    clearCurrentMark () {
        let _this = this;
        let itemIndex = _this.getSelectedMarkIndex();
        if(itemIndex !== null && _this.cursorEvent === 'none') {
            let id = _this.markList[itemIndex].ID;
            _this.clearMark(id);
            _this.canvas.onmousemove = null;
        }
    }

    clear () {
        let _this = this;
        if(_this.cursorEvent === 'none') {
            _this.clearMarkList();
            _this.redraw();
        }
    }

    handleEvent () {
        let _this = this,
            selectIndex = null,
            handler = {
                mouseDown: function (e) {
                    if(e.button !== 0) return;
                    let action = _this.getMouseAction(e);
                    if(action.name === 'move') {
                        _this.cursorEvent = 'move';
                        _this.canvas.style = 'cursor: move;';
                        _this.setSelectedMark(action.index);
                        _this.sortMarkList(action.index);
                        selectIndex = _this.getSelectedMarkIndex();
                        _this.redraw(true);
                        _this.canvas.onmousemove = handler.selectMove;
                        _this.canvas.onmouseup = handler.selectUp;
                    }
                    else if(action.name === 'scale') {
                        _this.cursorEvent = 'scale';
                        _this.canvas.style = 'cursor: move;';
                        _this.setSelectedMark(action.index);
                        selectIndex = _this.getSelectedMarkIndex();
                        _this.canvas.onmousemove = function (e) {
                            handler.scaleMove(e, action.direction);
                        };
                        _this.canvas.onmouseup = handler.scaleUp;
                    }
                    else {
                        // append rect
                        _this.cursorEvent = 'none';
                        _this.canvas.style = 'cursor: default;';
                        _this.setOriginPoint(e);
                        _this.clearSelectedMark();
                        _this.canvas.onmousemove = handler.mouseMove;
                        _this.canvas.onmouseup = handler.mouseUp;
                    }
                },
                mouseMove: function (e) {
                    _this.setMark(e);
                    _this.redraw();
                    _this.drawCurrentMark();
                },
                mouseUp: function (e) {
                    if(e.button !== 0) return;
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
                activeMove: function (e) {
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.setCursorStyle(e, selectIndex);
                },
                selectMove: function (e) {
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.setMarkOffset(e, selectIndex);
                    _this.redraw(true);
                },
                selectUp: function (e) {
                    if(e.button !== 0) return;
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.setMarkOffset(e, selectIndex);
                    _this.redraw(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                    _this.cursorEvent = 'none';
                },
                scaleMove: function (e, direction) {
                    // selectIndex = _this.getSelectedMarkIndex();
                    _this.resizeMark(e, selectIndex, direction);
                    _this.redraw(true);
                },
                scaleUp: function (e) {
                    if(e.button !== 0) return;
                    _this.redraw(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                    _this.cursorEvent = 'none';
                }
            };

        _this.canvas.onmousedown = handler.mouseDown;
    }

    initialize (callback) {
        let _this = this;
        _this.getImage(function () {
            if(_this.image.src) {
                _this.drawImage();
                _this.handleEvent();
                if(typeof callback === 'function') callback();
            }
            else {
                alert('图片加载错误');
            }
        });
    }

    get scale() {
        return this.canvasScale;
    }

    set scale(value) {
        this.canvasScale = value;
        console.log(this.canvasScale);
    }
}

// PaperMarker.prototype = PaperMarkerFn;
// window.PaperMarker = PaperMarker;
// Object.assign(PaperMarker.prototype, PaperMarkerFn);

export default PaperMarker;