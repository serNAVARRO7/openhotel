import { Command } from "shared/types/main.ts";
import { System } from "modules/system/main.ts";
import { ProxyEvent } from "shared/enums/main.ts";
import { __ } from "shared/utils/main.ts";

export const unsetCommand: Command = {
  command: "unset",
  usages: ["<furniture_id>"],
  description: "command.unset.description",
  func: async ({ user, args }) => {
    if (1 !== args.length) return;

    const [id] = args as [string];

    const roomId = user.getRoom();
    if (!roomId) return;

    const room = await System.game.rooms.get(roomId);
    const furniture = room
      .getFurnitures()
      .find((furniture) => furniture.id === id);

    if (!furniture) {
      user.emit(ProxyEvent.SYSTEM_MESSAGE, {
        message: __(user.getLanguage())("Furniture not found!"),
      });
      return;
    }

    await room.removeFurniture(furniture);
    room.emit(ProxyEvent.REMOVE_FURNITURE, {
      furniture,
    });
  },
};
