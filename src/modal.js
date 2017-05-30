import Rx from 'rxjs/rx';
import { div } from '@cycle/dom'
import xs from 'xstream';

function intent(DOMSource, props$) {
    const action$ = props$.map(props => {
        const close$ = DOMSource
            .select('.close')
            .events('click')
            .mapTo({
                type: 'CLOSE'
            });
        close$.addListener({
            next: props.onClose
        });
        const confirm$ = DOMSource
            .select('.confirm')
            .events('click')
            .mapTo({
                type: 'CONFIRM'
            });
        confirm$.addListener({
            next: props.onConfirm
        });
        const hide$ = xs.merge(close$, confirm$);
        const open$ = props.open.mapTo({
            type: 'OPEN'
        });
        return xs.merge(hide$, open$);
    });
    return action$.flatten();
}

function model(action$, props$) {
    const usePropsReducer$ = props$
        .map(props => state => ({
            title: props.title,
            content: props.content
        }));

    const enableVisibleReducer$ = action$
        .filter(a => a.type === 'CLOSE' || a.type === 'CONFIRM')
        .map(action => state => ({ ...state, visible: false }));

    const disableVisibleReducer$ = action$
        .filter(a => a.type === 'OPEN')
        .map(action => state => ({ ...state, visible: true }));

    return xs.merge(usePropsReducer$, enableVisibleReducer$, disableVisibleReducer$)
        .fold((state, reducer) => reducer(state), {
            title: 'Modal',
            content: div('', 'Content'),
            visible: false
        });
}

function view(state$) {
    return state$.map(state => {
        return div('.modal', { style: { display: state.visible ? 'block' : 'none' } }, [
            div('.header', [
                div('.title', state.title),
                div('.close', 'x')
            ]),
            div('.content', state.content),
            div('.footer', [
                div('.confirm .button', '确认'),
                div('.cancel .button', '取消')
            ])
        ]);
    });
}

const Modal = (sources) => {
    const action$ = intent(sources.DOM, sources.props);
    const state$ = model(action$, sources.props);
    const vtree$ = view(state$);
    return {
        DOM: vtree$
    };
};

export default Modal;
