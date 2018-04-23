(function (window, document) {
    'use strict';

    window.onload = function () {

        var canvas = document.getElementById('canvas'),
            imageUrl = document.getElementById('canvasWrap').getAttribute('data-img'),
            paperMarker = new window.PaperMarker(canvas, imageUrl),
            events = {
                clearCanvas: function () {
                    paperMarker.clear();
                },
                clearRect: function () {
                    paperMarker.clearCurRect();
                },
                getRectInfo: function () {
                    var rectList = paperMarker.getAllRect();
                    if(rectList.length > 0) {
                        console.log(rectList);
                        alert(JSON.stringify(rectList));
                    }
                    else {
                        alert('没有可输出的信息');
                    }
                },
                getSelectInfo: function () {
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
                },
                setScaleUp: function () {
                    paperMarker.setCanvasScale(2);
                },
                setScaleDown: function () {
                    paperMarker.setCanvasScale(0.5);
                },
                clearCurRect: function (ev) {
                    if(ev.keyCode === 8 || ev.keyCode === 46) {
                        paperMarker.clearCurRect();
                    }
                }
            };

        paperMarker.initialize(function () {
            document.onkeyup = events.clearCurRect;
            document.getElementById('clearCanvas').onclick = events.clearCanvas;
            document.getElementById('clearRect').onclick = events.clearRect;
            document.getElementById('getRectInfo').onclick = events.getRectInfo;
            document.getElementById('getSelectInfo').onclick = events.getSelectInfo;
            document.getElementById('setScaleUp').onclick = events.setScaleUp;
            document.getElementById('setScaleDown').onclick = events.setScaleDown;
        });

    };

})(window, document);