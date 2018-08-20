/*
* Copyright dewlyer@gmail.com
* */

// import bg from '../images/bg.jpg';
import '../style/app.scss';
import { Marker as PaperMarker } from './Marker';


let loadListener = (ev: WindowEventMap['load']): any => {

    let [canvas, imageUrl] = [document.getElementById('canvas'), require('../images/bg.jpg')],
        paperMarker: PaperMarker,
        events: any;

    paperMarker = new PaperMarker(canvas, imageUrl);

    events = {
        clearRectList (event: WindowEventMap['click']): any {
            paperMarker.clear();
            console.log(event);
        },
        clearRectSelect (event: WindowEventMap['click']): any {
            paperMarker.clearCurrentMark();
            console.log(event);
        },
        getRectListInfo (event: WindowEventMap['click']): any {
            let rectList = paperMarker.getMarkList();
            if (rectList.length > 0) {
                console.log(rectList);
                window.alert(JSON.stringify(rectList));
            } else {
                window.alert('没有可输出的信息');
            }
            console.log(event);
        },
        getRectSelectInfo (event: WindowEventMap['click']): any {
            let selectRect = paperMarker.getSelectedMark();
            if (selectRect) {
                let str = `ID: ${selectRect.id} - X: ${selectRect.x} - Y: ${selectRect.y}
 - W: ${selectRect.width} - H: ${selectRect.height}`;
                window.alert(str);
                console.log(selectRect);
            } else {
                window.alert('没有选中的目标');
            }
            console.log(event);
        },
        setRectScaleUp (event: WindowEventMap['click']): any {
            paperMarker.scaleCanvas(2);
            console.log(event);
        },
        setRectScaleDown (event: WindowEventMap['click']): any {
            paperMarker.scaleCanvas(0.5);
            console.log(event);
        },
        clearRectSelectKey (event: WindowEventMap['keyup']): any {
            if (event.code === '8' || event.code === '46') {
                paperMarker.clearCurrentMark();
            }
        },
    };

    paperMarker.run((): void => {
        for (let key in events) {
            if (events.hasOwnProperty(key)) {
                let fn = events[key];
                if (key === 'clearRectSelectKey') {
                    document.addEventListener('keyup', fn);
                } else {
                    document.getElementById(key).addEventListener('click', fn);
                }
            }
        }
    });

    console.log(ev);
};

window.addEventListener('load', loadListener);
