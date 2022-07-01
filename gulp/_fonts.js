import sync from "browser-sync";
import { src, dest } from "gulp";
import { logger } from "./_logger";
import { PATH } from "./_paths";

export const fonts = async () => {
    await src(PATH.fonts.src)
        .pipe(dest(PATH.fonts.dest))
        .on("error", (e) => logger.failed("fonts", e))
        .on("end", () => {
            logger.success("FONTS");
            sync.reload();
        });
};
