import { parseArgs } from "deno/cli/parse_args.ts";
import { UserMutable } from "shared/types/user.types.ts";
import { log } from "shared/utils/log.utils.ts";

import { stopCommand } from "./stop.command.ts";
import { opCommand } from "./op.command.ts";
import { deopCommand } from "./deop.command.ts";
import { banCommand } from "./ban.command.ts";
import { unbanCommand } from "./unban.command.ts";
import { blacklistCommand } from "./blacklist.command.ts";
import { whitelistCommand } from "./whitelist.command.ts";
import { kickCommand } from "./kick.command.ts";
import { updateCommand } from "./update.command.ts";
import { tpCommand } from "./tp.command.ts";
import { setCommand } from "./set.command.ts";
import { helpCommand } from "./help.command.ts";
import { unsetCommand } from "./unset.command.ts";
import { teleportCommand } from "./teleport.command.ts";
import { clearCommand } from "./clear.command.ts";
import { rotateCommand } from "./rotate.command.ts";
import { moveCommand } from "./move.command.ts";
import { demoCommand } from "./demo.command.ts";
import { ProxyEvent } from "shared/enums/event.enum.ts";
import { validateCommandUsages } from "shared/utils/commands.utils.ts";
import { __ } from "shared/utils/languages.utils.ts";

export const commandList = [
  stopCommand,

  opCommand,
  deopCommand,

  banCommand,
  unbanCommand,

  blacklistCommand,
  whitelistCommand,

  kickCommand,
  updateCommand,

  tpCommand,

  setCommand,
  unsetCommand,

  helpCommand,
  demoCommand,

  teleportCommand,

  clearCommand,

  rotateCommand,
  moveCommand,
];

export const executeCommand = ({
  message,
  user,
}: {
  message: string;
  user: UserMutable;
}) => {
  if (!message.startsWith("/")) return false;

  const { _ } = parseArgs(message.substring(1, message.length).split(" "));

  const foundCommand = commandList.find(({ command }) => _[0] === command);
  if (!foundCommand) {
    user.emit(ProxyEvent.SYSTEM_MESSAGE, {
      message: __(user.getLanguage())("Command not found"),
    });
    return true;
  }

  log(`Command /${foundCommand.command} executed by ${user.getUsername()}!`);
  _.shift();

  const usages = foundCommand.usages || [];

  if (usages.length > 0) {
    const validation = validateCommandUsages(foundCommand, _, user);
    if (!validation.isValid) {
      user.emit(ProxyEvent.SYSTEM_MESSAGE, {
        message: `${validation.errorMessage}`,
      });
      return true;
    }
  }

  try {
    foundCommand.func({ user, args: _ } as any);
  } catch (e) {
    console.error(`Something went wrong with command ${message}`);
  }

  return true;
};
