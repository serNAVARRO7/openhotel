import { __ } from "shared/utils/main.ts";
import { Command, CommandRole } from "shared/types/main.ts";
import { ProxyEvent } from "shared/enums/main.ts";
import { System } from "modules/system/main.ts";

export const deopCommand: Command = {
  command: "deop",
  role: CommandRole.OP,
  func: async ({ user, args }) => {
    const username = args[0] as string;
    if (!username) return;

    const config = await System.game.users.getConfig();
    config.op.users = config.op.users.filter((u) => u !== username);

    await System.game.users.setConfig(config);

    user.emit(ProxyEvent.SYSTEM_MESSAGE, {
      message: __(user.getLanguage())("User {{username}} is no longer op", {
        username,
      }),
    });
  },
};
