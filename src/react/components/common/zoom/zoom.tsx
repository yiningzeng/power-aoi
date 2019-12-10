// 控制滚轮缩放
const zoom = (onWheelEvent, callback) => {

    console.log(onWheelEvent);
    console.log(`啦啦: ${onWheelEvent.nativeEvent.deltaX}, ${onWheelEvent.nativeEvent.deltaY}, ${onWheelEvent.nativeEvent.deltaZ}`);
    // // console.log("zoom: width" + dom.style.width +" left" +dom.style.left);
    let e = onWheelEvent;
    e.preventDefault();
    // const ele = rdom.findDOMNode(this);
    if (e.nativeEvent.deltaY <= 0) {
        e.preventDefault();
        console.log("scrolling up");
        /* scrolling up */
        // if ( ele.scrollTop <= 0) {
        //
        // }
    } else {
        e.preventDefault();
        console.log("scrolling down");
        /* scrolling down */
        // if ( ele.scrollTop + ele.clientHeight >= ele.scrollHeight) {
        //
        // }
    }
    callback(e.deltaY);
    // var ratioL = (this.clientX - onWheelEvent.offsetLeft) / onWheelEvent.offsetWidth,
    //     ratioT = (this.clientY - onWheelEvent.offsetTop) / onWheelEvent.offsetHeight,
    //     ratioDelta = !delta ? 1 + 0.1 : 1 - 0.1,
    //     w = parseInt(oImg.offsetWidth * ratioDelta),
    //     h = parseInt(oImg.offsetHeight * ratioDelta),
    //     l = Math.round(this.clientX - (w * ratioL)),
    //     t = Math.round(this.clientY - (h * ratioT));
    // with(oImg.style) {
    //     width = w +'px';
    //     height = h +'px';
    //     left = l +'px';
    //     top = t +'px';
    // }

    // let imageModalWidth = parseInt(dom.style.width);
    // let modalLeft = parseInt(dom.style.left);
    // // 计算缩放后的大小 每一次滚轮 100px
    // let calcWidth = imageModalWidth - e.deltaY;
    // // 限制最小 width = 400
    // if (calcWidth <= 300) {
    //     return;
    // }
    // console.log("zoom:" + calcWidth);
    // // 不让modal由于缩小消失在视野中
    // if (modalLeft + calcWidth < 50) {
    //     return;
    // }
    // dom.style.width = `${calcWidth}px`;
};
export default zoom;
