const { DEST, SRC } = process.env;

export const PATH = {
    pug: {
        src: `${SRC}/view/*.pug`,
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
    assets: {
        src: `${SRC}/assets`,
        dest: `${DEST}/assets`,
    },
};
