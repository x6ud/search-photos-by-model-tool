declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare module '*.ttf' {
    const content: string;
    export default content;
}
