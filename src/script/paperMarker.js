import PaperMarkerFn from './paperMarkerFn';

function PaperMarker (canvas, imageUrl, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.imageUrl = imageUrl;
    this.image = new Image();
    this.rect = {};
    this.marks = [];
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
    this.settings = $.extend({}, this.defaults, options);
}

PaperMarker.prototype = PaperMarkerFn;

// window.PaperMarker = PaperMarker;

export default PaperMarker;