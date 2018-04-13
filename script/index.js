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
        _this.ctx.strokeStyle = "#00c";
        _this.ctx.lineWidth = 1;
        _this.ctx.strokeRect(_this.rect.x, _this.rect.y, -_this.rect.width, -_this.rect.height);
        _this.ctx.restore();
    };

    PaperMarker.prototype.drawRectAll = function () {
        var _this = this;
        _this.clearCanvas();
        _this.drawImage(_this.img);

        _this.ctx.save();
        _this.ctx.strokeStyle = "#c00";
        _this.ctx.lineWidth = 1;
        _this.marks.forEach(function (item) {
            _this.ctx.strokeRect(item.x, item.y, -item.width, -item.height);

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
            _this.ctx.font="12px Arial";
            _this.ctx.fillStyle = 'red';
            _this.ctx.fillText(coordinate.text(), coordinate.x(), coordinate.y() - 2);
            // console.log(coordinate)
        });
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

    PaperMarker.prototype.drawImage = function (image) {
        var _this = this;
        _this.canvas.width = image.naturalWidth || image.width;
        _this.canvas.height = image.naturalHeight || image.height;
        _this.ctx.drawImage(image, 0, 0, _this.canvas.width, _this.canvas.height);
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
        _this.drawImage(_this.img);
    };

    PaperMarker.prototype.handleEvent = function () {
        var _this = this;

        var mouseMoveHandler = function (e) {
            _this.getRect(e);
            _this.drawRectAll();
            _this.drawRectCur();
        };
        var mouseDownHandler = function (e) {
            _this.getOrigin(e);
            _this.canvas.onmousemove = mouseMoveHandler;
        };
        var mouseUpHandler = function (e) {
            _this.getRect(e);
            _this.setRect();
            _this.drawRectAll();
            _this.canvas.onmousemove = null;
        };

        _this.canvas.onmousedown = mouseDownHandler;
        _this.canvas.onmouseup = mouseUpHandler;
    };
    
    PaperMarker.prototype.init = function () {
        var _this = this;
        _this.getImage(function () {
            _this.drawImage(_this.img);
            _this.handleEvent();
        });
    };

    window.onload = function () {

        var canvas = document.getElementById('canvas');
        var imgUrl = document.getElementById('canvasWrap').getAttribute('data-img');

        var paperMarker = new PaperMarker(canvas, imgUrl);
        paperMarker.init();

        document.getElementById('clearCanvas').onclick = function () {
            paperMarker.clear();
        };

    };

})(window, document);