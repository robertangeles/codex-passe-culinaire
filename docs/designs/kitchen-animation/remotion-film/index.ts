import { createElement, Fragment } from "react";
import { Composition, registerRoot } from "remotion";
import { KitchenStory, KITCHEN_STORY_DURATION } from "./ExpandedFilm";
import "./film.css";

const RemotionRoot = () =>
  createElement(Fragment, null, createElement(Composition, {
    id: "KitchenDay",
    component: KitchenStory,
    durationInFrames: KITCHEN_STORY_DURATION,
    fps: 30,
    width: 1920,
    height: 1080,
  }), createElement(Composition, {
    id: "KitchenDayMobile", component: KitchenStory, durationInFrames: KITCHEN_STORY_DURATION, fps: 30, width: 1080, height: 1350,
  }));

registerRoot(RemotionRoot);
