import { setTimeout } from "node:timers/promises";

import { config, configData } from "../baseConfig";

// eslint-disable-next-line import/no-default-export
export default async () => {
    await setTimeout(100);

    return config(configData);
};
