(function (window, document) {
    'use strict';

    var PaperMarker = function (canvas, imageUrl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imageUrl = imageUrl;
        this.image = new Image();
        this.rect = {};
        this.marks = [];
        this.origin = {
            x: 0, y: 0
        };
        this.pen = {
            normal: {
                color: 'blue',
                width: 1
            },
            active: {
                color: 'green',
                width: 1
            },
            select: {
                color: 'red',
                width: 1
            },
            coordinate: {
                font: '14px Arial'
            }
        };
        this.scaleHandlerWidth = 5;
    };



    PaperMarker.prototype.getPosition = function (event) {
        return {
            x: event.x + window.scrollX,
            y: event.y + window.scrollY
        };
    };

    PaperMarker.prototype.getOrigin = function (event) {
        var _this = this;
        _this.origin = _this.getPosition(event);
    };

    PaperMarker.prototype.getSelectOrigin = function (index) {
        var _this = this;
        var selectItem = _this.marks[index];
        _this.slelectOrigin = _this.getPosition(event);
        _this.slelectRect = {
            width: selectItem.width,
            height: selectItem.height,
            x: selectItem.x,
            y: selectItem.y
        };
    };

    PaperMarker.prototype.getRect = function (event) {
        var _this = this;
        var point = _this.getPosition(event);

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

        // _this.rect.z = _this.marks.length;
    };

    PaperMarker.prototype.setRect = function () {
        var _this = this;
        _this.marks.push({
            x: _this.rect.x,
            y: _this.rect.y,
            // z: _this.rect.z,
            width: _this.rect.width,
            height: _this.rect.height
        });
    };

    PaperMarker.prototype.setRectOffset = function (event) {
        var _this = this;
        var lastItemIndex = _this.marks.length - 1;
        var position = _this.getPosition(event);
        var offsetX = position.x - _this.slelectOrigin.x;
        var offsetY = position.y - _this.slelectOrigin.y;
        _this.marks[lastItemIndex].x = _this.slelectRect.x + offsetX;
        _this.marks[lastItemIndex].y = _this.slelectRect.y + offsetY;
    };

    PaperMarker.prototype.setRectSize = function (event, direction) {
        var _this = this;
        var lastItemIndex = _this.marks.length - 1;
        var point = _this.getPosition(event);
        var offsetW = point.x - _this.slelectOrigin.x;
        var offsetH = point.y - _this.slelectOrigin.y;

        if(direction === 'left') {
            if(offsetW <= 0 || _this.marks[lastItemIndex].width >= 2*_this.scaleHandlerWidth) {
                _this.marks[lastItemIndex].x = _this.slelectRect.x + offsetW;
                _this.marks[lastItemIndex].width = _this.slelectRect.width - offsetW;
            }
        }
        else if(direction === 'right') {
            if(offsetW >= 0 || _this.marks[lastItemIndex].width >= 2*_this.scaleHandlerWidth) {
                _this.marks[lastItemIndex].width = _this.slelectRect.width + offsetW;
            }
        }
        else if(direction === 'top') {
            if(offsetH <= 0 || _this.marks[lastItemIndex].height > 2*_this.scaleHandlerWidth) {
                _this.marks[lastItemIndex].y = _this.slelectRect.y + offsetH;
                _this.marks[lastItemIndex].height = _this.slelectRect.height - offsetH;
            }
        }
        else if(direction === 'bottom') {
            if(offsetH >= 0 || _this.marks[lastItemIndex].height >= 2*_this.scaleHandlerWidth) {
                _this.marks[lastItemIndex].height = _this.slelectRect.height + offsetH;
            }
        }
    };

    PaperMarker.prototype.selectRect = function (index) {
        var _this = this;
        var selectedRect = _this.marks[index];
        _this.marks.splice(index, 1);
        _this.marks.push(selectedRect);
    };

    PaperMarker.prototype.setCursorStyle = function (event) {
        var _this = this;
        if(_this.marks.length <= 0) { return }

        var point = _this.getPosition(event);
        var style =  'cursor: move;';
        var item = _this.marks[_this.marks.length - 1];
        var x1, x2, y1, y2;
        x1 = item.x;
        y1 = item.y;
        x2 = item.x + item.width;
        y2 = item.y + item.height;

        if(point.x >= x1 && point.x <= x2) {
            if(point.y >= y1 && point.y <= y2) {
                if(point.x <= x1 + _this.scaleHandlerWidth) {
                    style =  'cursor: w-resize;';
                }
                else if(point.x >= x2 - _this.scaleHandlerWidth) {
                    style =  'cursor: e-resize;';
                }
                else if(point.y <= y1 + _this.scaleHandlerWidth) {
                    style =  'cursor: n-resize;';
                }
                else if(point.y >= y2 - _this.scaleHandlerWidth) {
                    style =  'cursor: s-resize;';
                }
                else {
                    style = 'cursor: move;';
                }
            }
            else {
                style =  'cursor: default;';
            }
        }
        else {
            style =  'cursor: default;';
        }
        _this.canvas.style = style;
    };

    PaperMarker.prototype.getMouseAction = function (event) {
        var _this = this;
        var action = { name: 'append', index: 0 };
        var point = _this.getPosition(event);
        if(_this.marks.length > 0) {
            _this.marks.forEach(function (item, index) {
                var x1, x2, y1, y2;
                x1 = item.x;
                y1 = item.y;
                x2 = item.x + item.width;
                y2 = item.y + item.height;

                if(point.x >= x1 && point.x <= x2) {
                    if(point.y >= y1 && point.y <= y2) {
                        action.index = index;
                        action.name = 'scale';
                        if(index === _this.marks.length - 1) {
                            if(point.x <= x1 + _this.scaleHandlerWidth) {
                                action.direction = 'left';
                            }
                            else if(point.x >= x2 - _this.scaleHandlerWidth) {
                                action.direction = 'right';
                            }
                            else if(point.y <= y1 + _this.scaleHandlerWidth) {
                                action.direction = 'top';
                            }
                            else if(point.y >= y2 - _this.scaleHandlerWidth) {
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
                }
            });
        }
        return action;
    };

    PaperMarker.prototype.drawRectCur = function () {
        var _this = this;
        _this.ctx.save();
        _this.ctx.strokeStyle = _this.pen.active.color;
        _this.ctx.lineWidth = _this.pen.active.width;
        _this.ctx.strokeRect(_this.rect.x, _this.rect.y, _this.rect.width, _this.rect.height);
        _this.ctx.restore();
    };

    PaperMarker.prototype.drawRectAll = function (selected) {
        var _this = this;
        _this.ctx.save();
        _this.ctx.strokeStyle = _this.pen.normal.color;
        _this.ctx.lineWidth = _this.pen.normal.width;
        _this.marks.forEach(function (item, index) {
            _this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            _this.ctx.fillRect(item.x, item.y, item.width, item.height);
            if(selected && (_this.marks.length-1) === index) {
                _this.ctx.strokeStyle = _this.pen.select.color;
                _this.ctx.lineWidth = _this.pen.select.width;
            }
            _this.ctx.strokeRect(item.x, item.y, item.width, item.height);
            _this.drawCoordinate(item, index, selected);
        });
        _this.ctx.restore();
    };

    PaperMarker.prototype.drawCoordinate = function (item, index, selected) {
        var _this = this;
        var verOffset = 4;
        var horOffset = 4;
        var str = 'X:' + item.x + ' - Y:' + item.y + ' - Z:' + index +
            ' - Width:' + item.width + ' - Height:' + item.height;

        _this.ctx.save();
        _this.ctx.font = _this.pen.coordinate.font;
        _this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        _this.ctx.fillRect(item.x-1, item.y-1, _this.ctx.measureText(str).width + horOffset, -(parseInt(_this.pen.coordinate.font) + verOffset));
        _this.ctx.fillStyle = (selected && (_this.marks.length-1)===index) ? _this.pen.select.color : _this.pen.normal.color;
        _this.ctx.fillText(str, item.x, item.y - verOffset);
        _this.ctx.restore();
    };

    PaperMarker.prototype.getImage = function (callback) {
        var _this = this;
        _this.image.src = _this.imageUrl;
        _this.image.onload = function () {
            if(typeof callback === 'function') {
                callback();
            }
        };
    };

    PaperMarker.prototype.drawImage = function () {
        var _this = this;

        _this.canvas.width = _this.image.naturalWidth || _this.image.width;
        _this.canvas.height = _this.image.naturalHeight || _this.image.height;
        _this.ctx.drawImage(_this.image, 0, 0, _this.canvas.width, _this.canvas.height);

    };

    PaperMarker.prototype.clearCanvas = function () {
        var _this = this;
        _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    };

    PaperMarker.prototype.clearMarks = function () {
        var _this = this;
        _this.marks = [];
    };

    PaperMarker.prototype.clear = function () {
        var _this = this;
        _this.clearMarks();
        _this.clearCanvas();
        _this.drawImage();
    };

    PaperMarker.prototype.handleEvent = function () {
        var _this = this,
            handler = {
                mouseDown: function (e) {
                    if(e.button !== 0) return;
                    var action = _this.getMouseAction(e);
                    if(action.name === 'move') {
                        _this.canvas.style = 'cursor: move;';
                        _this.getSelectOrigin(action.index);
                        _this.selectRect(action.index);
                        _this.clearCanvas();
                        _this.drawImage();
                        _this.drawRectAll(true);
                        _this.canvas.onmousemove = handler.selectMove;
                        _this.canvas.onmouseup = handler.selectUp;
                    }
                    else if(action.name === 'scale') {
                        _this.canvas.style = 'cursor: move;';
                        _this.getSelectOrigin(action.index);
                        switch (action.direction) {
                            case 'left':
                                _this.canvas.onmousemove = handler.scaleMoveLeft;
                                break;
                            case 'right':
                                _this.canvas.onmousemove = handler.scaleMoveRight;
                                break;
                            case 'top':
                                _this.canvas.onmousemove = handler.scaleMoveTop;
                                break;
                            case 'bottom':
                                _this.canvas.onmousemove = handler.scaleMoveBottom;
                                break;
                        }
                        _this.canvas.onmouseup = handler.scaleUp;
                    }
                    else {
                        _this.canvas.style = 'cursor: default;';
                        _this.getOrigin(e);
                        _this.canvas.onmousemove = handler.mouseMove;
                        _this.canvas.onmouseup = handler.mouseUp;
                    }
                },
                mouseMove: function (e) {
                    _this.getRect(e);
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll();
                    _this.drawRectCur();
                },
                mouseUp: function (e) {
                    if(e.button !== 0) return;
                    _this.getRect(e);
                    _this.setRect();
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll();
                    _this.canvas.onmousemove = null;
                    _this.canvas.onmouseup = null;
                },
                activeMove: function (e) {
                    _this.setCursorStyle(e);
                },
                selectMove: function (e) {
                    _this.setRectOffset(e);
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                },
                selectUp: function (e) {
                    if(e.button !== 0) return;
                    _this.setRectOffset(e);
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                },
                scaleMoveTop: function (e) {
                    _this.setRectSize(e, 'top');
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                },
                scaleMoveBottom: function (e) {
                    _this.setRectSize(e, 'bottom');
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                },
                scaleMoveLeft: function (e) {
                    _this.setRectSize(e, 'left');
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                },
                scaleMoveRight: function (e) {
                    _this.setRectSize(e, 'right');
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                },
                scaleUp: function (e) {
                    if(e.button !== 0) return;
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll(true);
                    _this.canvas.onmousemove = handler.activeMove;
                    _this.canvas.onmouseup = null;
                }
            };

        _this.canvas.onmousedown = handler.mouseDown;
    };

    PaperMarker.prototype.init = function () {
        var _this = this;
        _this.getImage(function () {
            if(_this.image.src) {
                _this.drawImage();
                _this.handleEvent();
            }
        });
    };

    window.onload = function () {
        var canvas = document.getElementById('canvas'),
            imageUrl = document.getElementById('canvasWrap').getAttribute('data-img'),
            paperMarker = new PaperMarker(canvas, imageUrl);

        paperMarker.init();
        document.getElementById('clearCanvas').onclick = function () {
            paperMarker.clear();
        };
    };

})(window, document);