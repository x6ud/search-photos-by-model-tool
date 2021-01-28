export default function throttle(func: Function, ms: number) {
    let lastTimestamp: number | null = null;
    let tid: NodeJS.Timeout | undefined = undefined;

    function ret(this: any) {
        tid != null && clearTimeout(tid);
        const timestamp = Date.now();
        if (lastTimestamp != null && timestamp - lastTimestamp >= ms) {
            func.apply(this, arguments);
            lastTimestamp = null;
        } else {
            tid = setTimeout(ret.bind(this, arguments), ms);
            lastTimestamp = timestamp;
        }
    }

    return ret;
}
