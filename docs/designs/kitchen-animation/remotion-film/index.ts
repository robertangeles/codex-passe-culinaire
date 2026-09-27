import { createElement, Fragment } from "react";
import { Composition, registerRoot } from "remotion";
import { KitchenDay, KITCHEN_DAY_DURATION } from "./Film";
import { KitchenDayMobile } from "./MobileFilm";
import "./film.css";

const RemotionRoot = () =>
  createElement(Fragment, null, createElement(Composition, {
    id: "KitchenDay",
    component: KitchenDay,
    durationInFrames: KITCHEN_DAY_DURATION,
    fps: 30,
    width: 1920,
    height: 1080,
  }), createElement(Composition, {
    id: "KitchenDayMobile", component: KitchenDayMobile, durationInFrames: KITCHEN_DAY_DURATION, fps: 30, width: 1080, height: 1350,
  }));

registerRoot(RemotionRoot);
