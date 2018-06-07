export default {

    getImage: function (callback) {
        let _this = this;
        _this.image.src = _this.imageUrl;
        _this.image.onload = function () {
            if(typeof callback === 'function') {
                callback();
            }
        };
    },

    getPosition: function (event) {
        let _this = this;
        return {
            x: (event.x + window.scrollX) / _this.canvasScale,
            y: (event.y + window.scrollY) / _this.canvasScale
        };
    },

    getRectIndexById: function (id) {
        let _this = this,
            index = null;

        _this.marks.every(function (item, i) {
            if(item.id === id) {
                index = i;
                return false;
            }
            else {
                return true;
            }
        });

        return index;
    },

    getSelectRectIndex: function () {
        let _this = this;
        if((typeof _this.selectedRect !== 'undefined') && (typeof _this.selectedRect.id !== 'undefined')) {
            return _this.getRectIndexById(_this.selectedRect.id);
        }
        else {
            return null;
        }
    },

    getSelectRect: function () {
        let _this = this;
        let index = _this.getSelectRectIndex();
        if(index !== null) {
            return _this.marks[index];
        }
    },

    getRect: function (event) {
        let _this = this;
        let point = _this.getPosition(event);

        if(point.x >= _this.origin.x) {
            _this.rect.x = _this.origin.x;
            _this.rect.width = point.x - _this.origin.x;
        }
        else {
            _this.rect.x = point.x;
            _this.rect.width = _this.origin.x - point.x;
        }

        if(point.y >= _this.origin.y) {
            _this.rect.y = _this.origin.y;
            _this.rect.height = point.y - _this.origin.y;
        }
        else {
            _this.rect.y = point.y;
            _this.rect.height = _this.origin.y - point.y;
        }
        _this.rect.id = _this.marks.length;
    },

    getAllRect: function () {
        let _this = this;
        return _this.marks;
    },

    getMouseAction: function (event) {
        let _this = this;
        let action = { name: 'append', index: 0, direction: '' };
        let point = _this.getPosition(event);
        let itemIndex = _this.getSelectRectIndex();

        if(_this.marks.length > 0) {
            _this.marks.forEach(function (item, index) {
                let x1 = item.x, x2 = item.x + item.width,
                    y1 = item.y, y2 = item.y + item.height;
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
    },

    canAppendRect: function (event, success, failure) {
        let _this = this;
        let point = _this.getPosition(event);
        let width = Math.abs(point.x - _this.origin.x);
        let height = Math.abs(point.y - _this.origin.y);
        if(width > 2*_this.scaleHandSize && height > 2*_this.scaleHandSize) {
            (typeof success === 'function') && success();
        }
        else {
            (typeof failure === 'function') && failure();
        }
    },

    setOriginPoint: function (event) {
        let _this = this;
        _this.origin = _this.getPosition(event);
    },

    setRect: function () {
        let _this = this;
        _this.marks.push({
            x: _this.rect.x,
            y: _this.rect.y,
            width: _this.rect.width,
            height: _this.rect.height,
            id: _this.rect.id
        });
    },

    setSelectRect: function (index) {
        let _this = this;
        let selectItem = _this.marks[index];
        _this.selectedOrigin = _this.getPosition(event);
        _this.selectedRect = {
            id: selectItem.id,
            width: selectItem.width,
            height: selectItem.height,
            x: selectItem.x,
            y: selectItem.y
        };
    },

    setRectSort: function (index) {
        let _this = this;
        let selectedRect = _this.marks[index];
        _this.marks.splice(index, 1);
        _this.marks.push(selectedRect);
    },

    setRectSize: function (event, itemIndex, direction) {
        let _this = this;
        let point = _this.getPosition(event);
        let offsetW = point.x - _this.selectedOrigin.x;
        let offsetH = point.y - _this.selectedOrigin.y;

        let ways = direction.split(',');
        ways.forEach(function (item) {
            if(item === 'left') {
                if(offsetW <= 0 || _this.marks[itemIndex].width >= 2*_this.scaleHandSize) {
                    _this.marks[itemIndex].x = _this.selectedRect.x + offsetW;
                    _this.marks[itemIndex].width = _this.selectedRect.width - offsetW;
                }
            }
            else if(item === 'right') {
                if(offsetW >= 0 || _this.marks[itemIndex].width >= 2*_this.scaleHandSize) {
                    _this.marks[itemIndex].width = _this.selectedRect.width + offsetW;
                }
            }
            else if(item === 'top') {
                if(offsetH <= 0 || _this.marks[itemIndex].height > 2*_this.scaleHandSize) {
                    _this.marks[itemIndex].y = _this.selectedRect.y + offsetH;
                    _this.marks[itemIndex].height = _this.selectedRect.height - offsetH;
                }
            }
            else if(item === 'bottom') {
                if(offsetH >= 0 || _this.marks[itemIndex].height >= 2*_this.scaleHandSize) {
                    _this.marks[itemIndex].height = _this.selectedRect.height + offsetH;
                }
            }
        });
    },

    setRectOffset: function (event, itemIndex) {
        let _this = this;
        let position = _this.getPosition(event);
        let offsetX = position.x - _this.selectedOrigin.x;
        let offsetY = position.y - _this.selectedOrigin.y;
        _this.marks[itemIndex].x = _this.selectedRect.x + offsetX;
        _this.marks[itemIndex].y = _this.selectedRect.y + offsetY;
    },

    setCursorStyle: function (event, itemIndex) {
        let _this = this;
        if(_this.marks.length <= 0) { return }

        let point = _this.getPosition(event);
        let item = _this.marks[itemIndex];
        let style =  'cursor: move;';
        let x1 = item.x, x2 = item.x + item.width,
            y1 = item.y, y2 = item.y + item.height;

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
    },

    setCanvasScale: function (scale) {
        let _this = this;
        _this.canvasScale *= scale;
        _this.redraw();
    },

    drawImage: function () {
        let _this = this;
        _this.ctx.scale(_this.canvasScale, _this.canvasScale);
        _this.canvas.width = (_this.image.naturalWidth || _this.image.width) * _this.canvasScale;
        _this.canvas.height = (_this.image.naturalHeight || _this.image.height) * _this.canvasScale;
        _this.ctx.drawImage(_this.image, 0, 0, _this.canvas.width, _this.canvas.height);
    },

    drawRectCur: function () {
        let _this = this;
        _this.ctx.save();
        _this.ctx.strokeStyle = _this.settings.line.color.active;
        _this.ctx.lineWidth = _this.settings.line.width;
        _this.ctx.setLineDash(_this.settings.line.dash);
        _this.ctx.strokeRect(
            _this.rect.x * _this.canvasScale,
            _this.rect.y * _this.canvasScale,
            _this.rect.width * _this.canvasScale,
            _this.rect.height * _this.canvasScale
        );
        _this.ctx.restore();
    },

    drawRectList: function (selected) {
        let _this = this;
        let selectIndex = null;
        if(selected) {
            selectIndex = _this.getSelectRectIndex();
        }
        _this.ctx.save();
        _this.ctx.lineJoin = _this.settings.line.join;
        _this.ctx.lineWidth = _this.settings.line.width;
        _this.ctx.strokeStyle = _this.settings.line.color.normal;
        _this.ctx.fillStyle = _this.settings.rect.color.normal;

        _this.marks.forEach(function (item, index) {
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
            _this.ctx.fillRect(item.x * _this.canvasScale, item.y * _this.canvasScale,
                item.width * _this.canvasScale, item.height * _this.canvasScale);
            _this.ctx.strokeRect(item.x * _this.canvasScale, item.y * _this.canvasScale,
                item.width * _this.canvasScale, item.height * _this.canvasScale);
            if(selectIndex === index) {
                _this.ctx.restore();
            }
            _this.drawCoordinate(item, index, selected, selectIndex);
        });

        _this.ctx.restore();
    },

    drawCoordinate: function (item, index, selected, selectIndex) {
        let _this = this;
        let verOffset = 4;
        let horOffset = 4;
        let str = 'ID:' + item.id + ' - X:' + item.x + ' / Y:' + item.y + ' / Z:' + index +
            ' - W:' + item.width + ' / H:' + item.height;

        _this.ctx.save();
        _this.ctx.font = _this.settings.text.font;
        _this.ctx.fillStyle = _this.settings.text.color;
        _this.ctx.fillRect(item.x * _this.canvasScale -1, item.y * _this.canvasScale-1,
            _this.ctx.measureText(str).width + horOffset, -(parseInt(_this.settings.text.font) + verOffset));
        _this.ctx.fillStyle = (selected && selectIndex === index) ? _this.settings.line.color.select : _this.settings.line.color.normal;
        _this.ctx.fillText(str, item.x * _this.canvasScale, item.y * _this.canvasScale - verOffset);
        _this.ctx.restore();
    },

    redraw: function (selected) {
        let _this = this;
        _this.clearCanvas();
        _this.drawImage();
        _this.drawRectList(selected);
    },

    clearCanvas: function () {
        let _this = this;
        _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    },

    clearMarks: function () {
        let _this = this;
        _this.marks = [];
    },

    clearRect: function (id) {
        let _this = this,
            index = _this.getRectIndexById(id);

        if(index !== null) {
            _this.marks.splice(index, 1);
            _this.redraw();
        }
    },

    clearSelectRect: function () {
        let _this = this;
        _this.selectedRect = {};
    },

    clearCurRect: function () {
        let _this = this;
        let itemIndex = _this.getSelectRectIndex();
        if(itemIndex !== null && _this.cursorEvent === 'none') {
            let id = _this.marks[itemIndex].id;
            _this.clearRect(id);
            _this.canvas.onmousemove = null;
        }
    },

    clear: function () {
        let _this = this;
        if(_this.cursorEvent === 'none') {
            _this.clearMarks();
            _this.redraw();
        }
    },

    handleEvent: function () {
        let _this = this,
            selectIndex = null,
            handler = {
                mouseDown: function (e) {
                    if(e.button !== 0) return;
                    let action = _this.getMouseAction(e);
                    if(action.name === 'move') {
                        _this.cursorEvent = 'move';
                        _this.canvas.style = 'cursor: move;';
                        _this.setSelectRect(action.index);
                        _this.setRectSort(action.index);
                        selectIndex = _this.getSelectRectIndex();
                        _this.redraw(true);
                        _this.canvas.onmousemove = handler.selectMove;
                        _this.canvas.onmouseup = handler.selectUp;
                    }
                    else if(action.name === 'scale') {
                        _this.cursorEvent = 'scale';
                        _this.canvas.style = 'cursor: move;';
                        _this.setSelectRect(action.index);
                        selectIndex = _this.getSelectRectIndex();
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
                        _this.clearSelectRect();
                        _this.canvas.onmousemove = handler.mouseMove;
                        _this.canvas.onmouseup = handler.mouseUp;
                    }
                },
                mouseMove: function (e) {
                    _this.getRect(e);
                    _this.redraw();
                    _this.drawRectCur();
                },
                mouseUp: function (e) {
                    if(e.button !== 0) return;
                    _this.canAppendRect(e, function () {
                        _this.getRect(e);
                        _this.setRect();
                    }, function () {
                        // alert('所选区域太小，请重现选取！');
                    });
                    _this.redraw();
                    _this.canvas.onmousemove = null;
                    _this.canvas.onmouseup = null;
                },
                activeMove: function (e) {
                    // selectIndex = _this.getSelectRectIndex();
                    _this.setCursorStyle(e, selectIndex);
                },
                selectMove: function (e) {
                    // selectIndex = _this.getSelectRectIndex();
                    _this.setRectOffset(e, selectIndex);
                    _this.redraw(true);
                },
                selectUp: function (e) {
                    if(e.button !== 0) return;
                    // selectIndex = _this.getSelectRectIndex();
                    _this.setRectOffset(e, selectIndex);
                    _this.redraw(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                    _this.cursorEvent = 'none';
                },
                scaleMove: function (e, direction) {
                    // selectIndex = _this.getSelectRectIndex();
                    _this.setRectSize(e, selectIndex, direction);
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
    },

    initialize: function (callback) {
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
};