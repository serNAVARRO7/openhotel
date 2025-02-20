import { SpriteComponent, sprite, DisplayObjectEvent } from "@tu/tulip";
import { TextureEnum } from "shared/enums";
import { wait } from "shared/utils";
import { System } from "system";
import { TickerQueue } from "@oh/queue";

export const logoComponent: SpriteComponent = () => {
  const $logo = sprite({
    texture: TextureEnum.LOGO_FULL,
    pivot: {
      x: 0,
      y: 90,
    },
  });

  let onRemoveResize;

  $logo.on(DisplayObjectEvent.MOUNT, async () => {
    await wait(1250);
    System.tasks.add({
      type: TickerQueue.CUSTOM,
      onFunc: (delta) => {
        if (!$logo.isMounted()) return;
        $logo.setPivotY((y) => y - delta * 0.25);
        if (0 >= $logo.getPivot().y) {
          $logo.setPivotY(0);
          return true;
        }
      },
    });
  });
  $logo.on(DisplayObjectEvent.UNMOUNT, async () => {
    onRemoveResize?.();
  });

  return $logo.getComponent(logoComponent);
};
