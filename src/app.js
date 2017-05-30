import { div } from '@cycle/dom'
import xs from 'xstream'
import Modal from './modal';
import Rx from 'rxjs/rx';

const mockRequest = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('请求成功');
        resolve('请求成功');
    }, 2000);
});

export function App(sources) {
    const modal = Modal({
        DOM: sources.DOM,
        props: xs.of({
            onClose: () => console.log('closed'),
            onConfirm: () => console.log('confirmed'),
            open: sources.DOM.select('div.open').events('click'),
            content: div('This is modal content'),
            title: 'New Modal'
        })
    });

    const modalVDom$ = modal.DOM;

    const sinks = {
        DOM: modalVDom$.map((modalVDom) => {
            return div([
                div('.open .button', { style: { width: '100px' } }, '打开模态框'),
                modalVDom
            ]);
        })
    };

    return sinks;
}
