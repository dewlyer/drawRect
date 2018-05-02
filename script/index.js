(function (window, document, $) {
    'use strict';

    $(document).ready(function () {

        var canvas = $('#canvas').get(0),
            imageUrl = $('#canvasWrap').attr('data-img'),
            paperMarker = null,
            events = {};

        if(!$.PaperMarker) return;

        paperMarker = new $.PaperMarker(canvas, imageUrl);

        events.clearRectList = function () {
            paperMarker.clear();
        };
        events.clearRectSelect = function () {
            paperMarker.clearCurRect();
        };
        events.getRectListInfo = function () {
            var rectList = paperMarker.getAllRect();
            if(rectList.length > 0) {
                console.log(rectList);
                alert(JSON.stringify(rectList));
            }
            else {
                alert('没有可输出的信息');
            }
        };
        events.getRectSelectInfo = function () {
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
        events.setRectScaleUp = function () {
            paperMarker.setCanvasScale(2);
        };
        events.setRectScaleDown = function () {
            paperMarker.setCanvasScale(0.5);
        };
        events.clearRectSelectKey = function (ev) {
            if(ev.keyCode === 8 || ev.keyCode === 46) {
                paperMarker.clearCurRect();
            }
        };

        paperMarker.initialize(function () {
            $.each(events, function (key, val) {
                key === 'clearRectSelectKey' ? $(document).on('keyup', val) : $('#' + key).on('click', val);
            });
        });

    });

})(window, document, jQuery);