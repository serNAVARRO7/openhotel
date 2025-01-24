import { Migration, DbMutable } from "@oh/utils";
import { RawRoom, RoomPoint } from "shared/types/room.types.ts";
import {
  getRoomSpawnDirection,
  getRoomSpawnPoint,
} from "shared/utils/rooms.utils.ts";
import { RoomPointEnum } from "shared/enums/room.enums.ts";

export default {
  id: "2025-01-24--09-00-add-demo-room",
  description: "Add demo room",
  up: async (db: DbMutable) => {
    const room: RawRoom = {
      version: 1,
      id: crypto.randomUUID(),
      title: "Demo Furnitures",
      ownerId: OWNER_ID,
      description: `This is a room for show all furnitures`,
      furniture: [],
      layout: [
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "x1111111111111",
        "s1111111111111",
      ],
    };

    const layout: RoomPoint[][] = room.layout.map((line) =>
      line
        .split("")
        .map((value) =>
          parseInt(value) ? parseInt(value) : (value as RoomPointEnum),
        ),
    );

    const roomData = {
      ...room,
      layout,
      spawnPoint: getRoomSpawnPoint(layout),
      spawnDirection: getRoomSpawnDirection(layout),
    };
    await db.set(["rooms", room.id], roomData);
  },
  down: async (db: DbMutable) => {},
} as Migration;

const OWNER_ID = "873e23bd-c018-41d3-b8a5-0e74aaf8140b";