import { Envs, ConfigTypes } from "shared/types/main.ts";
import { proxy } from "./proxy/main.ts";
import { game } from "./game/main.ts";
import { debug, initLog, log } from "shared/utils/main.ts";
import { tasks } from "./tasks.ts";
import { CONFIG_DEFAULT } from "shared/consts/config.consts.ts";
import { getConfig, update, getDb, DbMutable } from "@oh/utils";
import { onet } from "./onet/main.ts";
import { auth } from "modules/shared/auth.ts";
import { Migrations } from "../migrations/main.ts";

export const System = (() => {
  let $config: ConfigTypes;
  let $envs: Envs;

  const $proxy = proxy();
  const $tasks = tasks();
  const $game = game();
  const $db: DbMutable = getDb({ pathname: `./server-database` });
  const $onet = onet();
  const $auth = auth();

  const load = async (envs: Envs) => {
    console.clear();

    $envs = envs;

    const isDevelopment = $envs.version === "development";

    $config = await getConfig<ConfigTypes>({
      defaults: {
        ...CONFIG_DEFAULT,
        version: isDevelopment ? "development" : CONFIG_DEFAULT.version,
        auth: {
          ...CONFIG_DEFAULT.auth,
          enabled: isDevelopment ? false : CONFIG_DEFAULT.auth.enabled,
        },
        onet: {
          ...CONFIG_DEFAULT.onet,
          enabled: isDevelopment ? false : CONFIG_DEFAULT.onet.enabled,
        },
      },
    });

    // Check for an update if true, close the server

    console.info($config.version, envs.version);
    if (
      !isDevelopment &&
      envs.upgrade &&
      (await update({
        targetVersion: $config.version,
        version: envs.version,
        repository: "openhotel/openhotel",
        log,
        debug,
      }))
    )
      return;

    if (isDevelopment)
      console.log(
        "\n\n    ------------------\n    DEVELOPMENT SERVER\n    ------------------\n\n",
      );
    initLog();

    // -> Load proxy

    log("server");

    await $auth.load($config, true);
    $proxy.load();
    await $db.load();
    await Migrations.load($db);
    await $game.load();
    $tasks.load();
    await $onet.load();
  };

  const $getConfig = () => $config;
  const getEnvs = () => $envs;

  const isDevelopment = () => $config.version === "development";

  return {
    load,

    getConfig: $getConfig,
    getEnvs,
    isDevelopment,

    game: $game,
    proxy: $proxy,
    tasks: $tasks,
    db: $db,
    onet: $onet,
    auth: $auth,
  };
})();
