export function createElement(id, attrs) {
    let dom
    if (document.getElementById(id)) {
        dom = document.getElementById(id);
    } else {
        dom = document.createElement('div')
        dom.id = id
        document.body.appendChild(dom)

    }
    dom.style.touchAction = 'none';
    dom.addEventListener('pointerdown', ev => onPointerDown(ev, attrs, dom))
    return dom
}

function onPointerDown(event, attrs, dom) {
    if (event.isPrimary === false) return;

    attrs.pointerXOnPointerDown = event.clientX - attrs.windowHalfX;
    attrs.targetRotationOnPointerDown = attrs.targetRotation;

    const moveFn = ev => onPointerMove(ev, attrs)
    const upFn = () => {
        dom.removeEventListener('pointermove', moveFn);
        dom.removeEventListener('pointerup', upFn);
    }
    dom.addEventListener('pointermove', moveFn);
    dom.addEventListener('pointerup', upFn);
}

function onPointerMove(event, attrs) {
    if (event.isPrimary === false) return;

    attrs.pointerX = event.clientX - attrs.windowHalfX;
    attrs.targetRotation = attrs.targetRotationOnPointerDown + (attrs.pointerX - attrs.pointerXOnPointerDown) * 0.02;

}
