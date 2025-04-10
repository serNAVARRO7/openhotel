import React, { useMemo } from "react";
import {
  ContainerComponent,
  ContainerProps,
  Cursor,
  EventMode,
  GraphicsComponent,
  GraphicType,
} from "@oh/pixi-components";
import {
  CharacterArmAction,
  CharacterArmSide,
  CharacterBodyAction,
  Direction,
} from "shared/enums";
import { SAFE_Z_INDEX, TILE_SIZE } from "shared/consts";
import { ArmComponent, BodyComponent, HeadComponent } from "./components";
import { Point3d } from "shared/types";
import { getPositionFromIsometricPosition } from "shared/utils";
import { getCubePolygon } from "shared/utils/polygon.utils";

type Props = {
  bodyAction: CharacterBodyAction;
  bodyDirection: Direction;
  headDirection: Direction;
  leftArmAction: CharacterArmAction;
  rightArmAction: CharacterArmAction;
  skinColor: number;

  speaking?: boolean;

  position: Point3d;
} & ContainerProps;

export const CharacterComponent: React.FC<Props> = ({
  bodyAction,
  bodyDirection,
  headDirection,
  leftArmAction,
  rightArmAction,
  skinColor,

  speaking = false,

  position,

  onPointerDown,
  ...containerProps
}) => {
  // const { data } = useCharacter();
  //
  // const [bodyAction, setBodyAction] = useState<CharacterBodyAction>(null);
  //
  // useEffect(() => {
  //   const animationBodyActions =
  //     CHARACTER_BODY_ANIMATION_MAP?.[bodyDirection]?.[bodyAnimation];
  //
  //   if (!Array.isArray(animationBodyActions))
  //     return setBodyAction(animationBodyActions);
  //
  //   setBodyAction(animationBodyActions[0]);
  //   return System.tasks.add({
  //     type: TickerQueue.REPEAT,
  //     repeatEvery: 120,
  //     repeats: undefined,
  //     onFunc: () => {
  //       setBodyAction((animation) => {
  //         const index = animationBodyActions.indexOf(animation) + 1;
  //         return animationBodyActions[index] ?? animationBodyActions[0];
  //       });
  //     },
  //   });
  // }, [bodyAnimation, bodyDirection, setBodyAction]);
  //
  // if (
  //   bodyAction === null ||
  //   isNaN(bodyAction) ||
  //   !getBodyData(bodyDirection, bodyAction)
  // )
  //   return null;

  const $zIndex = useMemo(
    () => position.x + position.z + Math.abs(position.y / 100) + 0.5,
    [position],
  );
  const $pivot = useMemo(
    () => ({
      x: -(TILE_SIZE.width + 2) / 2,
      y: -TILE_SIZE.height / 2,
    }),
    [],
  );
  const $position = useMemo(
    () => getPositionFromIsometricPosition(position),
    [position],
  );

  return (
    <React.Fragment>
      <GraphicsComponent
        type={GraphicType.POLYGON}
        tint={0x00ffff}
        alpha={0}
        polygon={getCubePolygon({ width: 26, height: 65 })}
        eventMode={EventMode.STATIC}
        cursor={Cursor.CROSSHAIR}
        zIndex={SAFE_Z_INDEX + $zIndex}
        position={$position}
        pivot={{
          x: -11,
          y: -6,
        }}
        onPointerDown={onPointerDown}
      />
      <ContainerComponent
        pivot={$pivot}
        zIndex={$zIndex}
        position={$position}
        {...containerProps}
      >
        <BodyComponent
          action={bodyAction}
          direction={bodyDirection}
          skinColor={skinColor}
        >
          <HeadComponent
            skinColor={skinColor}
            bodyDirection={bodyDirection}
            bodyAction={bodyAction}
            direction={headDirection}
          />
          <ArmComponent
            skinColor={skinColor}
            bodyDirection={bodyDirection}
            bodyAction={bodyAction}
            side={CharacterArmSide.LEFT}
            action={leftArmAction}
          />
          <ArmComponent
            skinColor={skinColor}
            bodyDirection={bodyDirection}
            bodyAction={bodyAction}
            side={CharacterArmSide.RIGHT}
            action={rightArmAction}
          />
          {/*<BubbleActionComponent*/}
          {/*  pivot={{*/}
          {/*    x: 0,*/}
          {/*    y: 15,*/}
          {/*  }}*/}
          {/*  scale={{ x: -1 }}*/}
          {/*  text="..."*/}
          {/*  zIndex={100}*/}
          {/*  padding={{*/}
          {/*    top: 0,*/}
          {/*    right: 3,*/}
          {/*    left: 3,*/}
          {/*    bottom: 3,*/}
          {/*  }}*/}
          {/*/>*/}
        </BodyComponent>
      </ContainerComponent>
    </React.Fragment>
  );
};
