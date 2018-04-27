(function (window, document, $) {
    'use strict';
    $(document).ready(function () {

        var canvas = document.getElementById('canvas'),
            imageUrl = document.getElementById('canvasWrap').getAttribute('data-img'),
            paperMarker = new window.PaperMarker(canvas, imageUrl),
            events = {};

        events.clearCanvas = function () {
            paperMarker.clear();
        };
        events.clearRect = function () {
            paperMarker.clearCurRect();
        };
        events.getRectInfo = function () {
            var rectList = paperMarker.getAllRect();
            if(rectList.length > 0) {
                console.log(rectList);
                alert(JSON.stringify(rectList));
            }
            else {
                alert('没有可输出的信息');
            }
        };
        events.getSelectInfo = function () {
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
        events.setScaleUp = function () {
            paperMarker.setCanvasScale(2);
        };
        events.setScaleDown = function () {
            paperMarker.setCanvasScale(0.5);
        };
        events.clearCurRect = function (ev) {
            if(ev.keyCode === 8 || ev.keyCode === 46) {
                paperMarker.clearCurRect();
            }
        };

        paperMarker.initialize(function () {
            $('#clearCanvas').click(events.clearCanvas);
            $('#clearRect').click(events.clearRect);
            $('#getRectInfo').click(events.getRectInfo);
            $('#getSelectInfo').click(events.getSelectInfo);
            $('#setScaleUp').click(events.setScaleUp);
            $('#setScaleDown').click(events.setScaleDown);
            $(document).keyup(events.clearCurRect);
        });

    });
})(window, document, jQuery);