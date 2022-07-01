const { DEST, SRC } = process.env;

export const PATH = {
    pug: {
        src: `${SRC}/view/templates/*.pug`,
        watch: `${SRC}/**/*.pug`,
        dest: `html`,
    },
    css: {
        src: `${SRC}/scss/*.scss`,
        dest: `${DEST}/css`,
    },
    js: {
        src: `${SRC}/js`,
        dest: `${DEST}/js`,
    },
    fonts: {
        src: [
            "node_modules/pretendard/dist/web/static/woff2/Pretendard-ExtraBold.woff2",
            "node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
            "node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
            "node_modules/pretendard/dist/web/static/woff/Pretendard-ExtraBold.woff",
            "node_modules/pretendard/dist/web/static/woff/Pretendard-Bold.woff",
            "node_modules/pretendard/dist/web/static/woff/Pretendard-Regular.woff",
            "node_modules/bootstrap-icons/font/fonts/*",
        ],
        dest: `${DEST}/fonts`,
    },
    assets: {
        src: `${SRC}/assets/**/*`,
        dest: `${DEST}/assets`,
    },
};
