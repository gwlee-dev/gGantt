import sync from "browser-sync";
import del from "del";
import { series } from "gulp";
import { assets } from "./_assets";
import { compressCss, css } from "./_css";
import { compressJs, js } from "./_js";
import { view } from "./_view";
import { watcher } from "./_watcher";

const { DEST, SERVER_PORT } = process.env;

const clean = async () => await del.sync([DEST]);

const server = async () => {
    await sync.init(null, {
        proxy: `http://localhost:${SERVER_PORT}`,
        open: false,
        notify: false,
    });
};

export const dev = series([server], [watcher]);

export const build = series([clean], [js], [css], [assets]);

export const compress = series(
    [clean],
    [view],
    [compressCss],
    [compressJs],
    [assets]
);
