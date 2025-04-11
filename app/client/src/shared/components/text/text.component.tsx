import React from "react";
import {
  SpriteTextComponent,
  SpriteTextProps,
} from "@openhotel/pixi-components";
import { SpriteSheetEnum } from "shared/enums";

type Props = {
  bold?: boolean;
} & Omit<SpriteTextProps, "spriteSheet">;

export const TextComponent: React.FC<Props> = ({ bold, ...props }) => {
  return (
    <SpriteTextComponent
      spriteSheet={
        bold ? SpriteSheetEnum.BOLD_FONT : SpriteSheetEnum.DEFAULT_FONT
      }
      {...props}
    />
  );
};
