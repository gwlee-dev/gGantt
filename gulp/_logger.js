import { log } from "gulp-util";

export const logger = {
    success: (msg) => {
        log(`✅ ${msg}: Success`);
    },
    failed: (msg, e) => {
        log(`❌ [${msg}] ${e}: Failed`);
    },
};
