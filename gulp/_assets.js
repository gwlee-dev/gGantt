import sync from "browser-sync";
import { src, dest } from "gulp";
import { logger } from "./_logger";
import { PATH } from "./_paths";

export const assets = async () => {
    await src(PATH.assets.src)
        .pipe(dest(PATH.assets.dest))
        .on("end", () => {
            logger.success("ASSETS");
            sync.reload();
        });
};
