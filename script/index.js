(function (window, document) {

    var PaperMarker = function (canvas, imgUrl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imgUrl = imgUrl;
        this.img = null;
        this.rect = {};
        this.marks = [];
        this.origin = {
            x: 0, y: 0
        };
        this.pen = {
            normal: {
                color: 'red',
                width: 1
            },
            active: {
                color: 'blue',
                width: 1
            },
            coordinate: {
                color: 'red',
                font: '12px Arial'
            }
        };
    };

    PaperMarker.prototype.getOrigin = function (event) {
        var _this = this;
        _this.origin.x = event.x + window.scrollX;
        _this.origin.y = event.y + window.scrollY;
    };

    PaperMarker.prototype.getRect = function (event) {
        var _this = this;
        _this.rect.x = event.clientX + window.scrollX;
        _this.rect.y = event.clientY + window.scrollY;
        _this.rect.width = _this.rect.x - _this.origin.x;
        _this.rect.height = _this.rect.y - _this.origin.y;
    };

    PaperMarker.prototype.setRect = function () {
        var _this = this;
        _this.marks.push({
            x: _this.rect.x,
            y: _this.rect.y,
            width: _this.rect.width,
            height: _this.rect.height
        });
    };

    PaperMarker.prototype.drawRectCur = function () {
        var _this = this;
        _this.ctx.save();
        _this.ctx.strokeStyle = _this.pen.active.color;
        _this.ctx.lineWidth = _this.pen.active.width;
        _this.ctx.strokeRect(_this.rect.x, _this.rect.y, -_this.rect.width, -_this.rect.height);
        _this.ctx.restore();
    };

    PaperMarker.prototype.drawRectAll = function () {
        var _this = this;
        _this.ctx.save();
        _this.ctx.strokeStyle = _this.pen.normal.color;
        _this.ctx.lineWidth = _this.pen.normal.width;
        _this.marks.forEach(function (item) {
            _this.drawCoordinate(item);
            _this.ctx.strokeRect(item.x, item.y, -item.width, -item.height);
            // console.log(coordinate)
        });
        _this.ctx.restore();
    };

    PaperMarker.prototype.drawCoordinate = function (item) {
        var _this = this;
        var coordinate = {
            x: function () {
                return item.width>=0 ? item.x-item.width : item.x;
            },
            y: function () {
                return item.height>=0 ? item.y-item.height : item.y;
            },
            text: function () {
                return 'X:' + this.x().toString() + ' - Y:' + this.y().toString();
            }
        };

        _this.ctx.save();
        _this.ctx.font = _this.pen.coordinate.font;
        _this.ctx.fillStyle = _this.pen.coordinate.color;
        _this.ctx.fillText(coordinate.text(), coordinate.x(), coordinate.y() - 2);
        _this.ctx.restore();
    };

    PaperMarker.prototype.getImage = function (callback) {
        var _this = this;
        _this.img = new Image();
        _this.img.src = _this.imgUrl;
        _this.img.onload = function () {
            if(typeof callback === 'function') {
                callback();
            }
        };
    };

    PaperMarker.prototype.drawImage = function (callback) {
        var _this = this;
        var render = function () {
            _this.canvas.width = _this.img.naturalWidth || _this.img.width;
            _this.canvas.height = _this.img.naturalHeight || _this.img.height;
            _this.ctx.drawImage(_this.img, 0, 0, _this.canvas.width, _this.canvas.height);
        };

        if(_this.img === null) {
            _this.getImage(function () {
                render();
                if(typeof callback === 'function') {
                    callback();
                }
            });
        }
        else {
            render();
        }
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
                mousemove: function (e) {
                    _this.getRect(e);
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll();
                    _this.drawRectCur();
                },
                mousedown: function (e) {
                    _this.getOrigin(e);
                    _this.canvas.onmousemove = handler.mousemove;
                },
                mouseup: function (e) {
                    _this.getRect(e);
                    _this.setRect();
                    _this.clearCanvas();
                    _this.drawImage();
                    _this.drawRectAll();
                    _this.canvas.onmousemove = null;
                }
            };

        _this.canvas.onmousedown = handler.mousedown;
        _this.canvas.onmouseup = handler.mouseup;
    };

    PaperMarker.prototype.init = function () {
        var _this = this;
        _this.drawImage(function () {
            _this.handleEvent();
        });
    };

    window.onload = function () {
        var canvas = document.getElementById('canvas'),
            imgUrl = document.getElementById('canvasWrap').getAttribute('data-img'),
            paperMarker = new PaperMarker(canvas, imgUrl);

        paperMarker.init();
        document.getElementById('clearCanvas').onclick = function () {
            paperMarker.clear();
        };
    };

})(window, document);