(function (window, document) {
    'use strict';

    window.onload = function () {
        var canvas = document.getElementById('canvas'),
            imageUrl = document.getElementById('canvasWrap').getAttribute('data-img'),
            paperMarker = new PaperMarker(canvas, imageUrl);

        paperMarker.init();

        document.getElementById('clearCanvas').onclick = function () {
            paperMarker.clear();
        };

        document.getElementById('clearRect').onclick = function () {
            paperMarker.clearCurRect();
        };

        document.getElementById('getRectInfo').onclick = function () {
            var rectList = paperMarker.getAllRect();
            if(rectList.length > 0) {
                console.log(rectList);
                alert(JSON.stringify(rectList));
            }
            else {
                alert('没有可输出的信息');
            }
        };

        document.getElementById('getSelectInfo').onclick = function () {
            var selectRect = paperMarker.getSelectRect();
            if(selectRect) {
                var str = 'ID : ' + selectRect.id + '\n';
                str += 'X : ' + selectRect.x + '\n';
                str += 'Y : ' + selectRect.y + '\n';
                str += 'Width : ' + selectRect.width + '\n';
                str += 'Height :' + selectRect.height;
                alert(str);
                console.log(selectRect);
            }
            else {
                alert('没有选中的目标');
            }
        };

        document.getElementById('setScaleUp').onclick = function () {
            paperMarker.setCanvasScale(2);
        };

        document.getElementById('setScaleDown').onclick = function () {
            paperMarker.setCanvasScale(0.5);
        };

        document.onkeyup = function (ev) {
            if(ev.keyCode === 8 || ev.keyCode === 46) {
                paperMarker.clearCurRect();
            }
        };
    };

})(window, document);