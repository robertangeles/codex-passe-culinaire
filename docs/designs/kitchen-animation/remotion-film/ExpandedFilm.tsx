import {
  AbsoluteFill,
  Easing,
  Img,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import story from "./story.json";

const FPS = 30;
export const KITCHEN_STORY_DURATION = story.duration * FPS;

const C = {
  bone: "#F4F1EA",
  ink: "#1A1A18",
  moss: "#4A5A3F",
  clay: "#B8674B",
  ash: "#8A8A82",
  charcoal: "#141412",
  linen: "#E8E4DA",
};

type Chapter = (typeof story.chapters)[number];
type SceneProps = { chapter: Chapter; frame: number; portrait: boolean };

const ease = Easing.bezier(0.2, 0.75, 0.25, 1);
const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
const revealStyle = (frame: number, delay = 0): CSSProperties => ({
  opacity: progress(frame, delay, delay + 15),
  transform: `translateY(${interpolate(progress(frame, delay, delay + 15), [0, 1], [18, 0])}px)`,
});

const Text = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontFamily: '"Inter Local", Inter, sans-serif', ...style }}>{children}</div>
);
const Display = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontFamily: '"Fraunces Local", Fraunces, Georgia, serif', fontWeight: 350, ...style }}>{children}</div>
);
const Mono = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontFamily: '"Mono Local", "JetBrains Mono", monospace', ...style }}>{children}</div>
);

const Number = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <Display style={{ fontVariantNumeric: "lining-nums tabular-nums", whiteSpace: "nowrap", ...style }}>{children}</Display>
);

const Line = ({ dark = false }: { dark?: boolean }) => (
  <div style={{ height: 1, background: dark ? "rgb(244 241 234 / 32%)" : "rgb(138 138 130 / 36%)" }} />
);

const Photo = ({ chapter, frame, portrait }: SceneProps) => {
  const duration = Math.max(1, (chapter.end - chapter.at) * FPS);
  const p = interpolate(frame, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear });
  const scale = interpolate(p, [0, 1], [1.025, 1.065]);
  const x = interpolate(p, [0, 1], [-0.9, 0.9]);
  const y = interpolate(p, [0, 1], [0.5, -0.5]);
  const topHeight = portrait ? 620 : undefined;
  return (
    <>
      <Img
        src={staticFile(chapter.photo)}
        style={{
          position: "absolute",
          inset: portrait ? "0 0 auto" : 0,
          width: portrait || ["opening", "service"].includes(chapter.id) ? "100%" : "55%",
          height: portrait ? topHeight : "100%",
          objectFit: "cover",
          objectPosition: chapter.id === "recipe" ? "64% 50%" : "center",
          scale,
          translate: `${x}% ${y}%`,
          willChange: "transform",
        }}
      />
      {portrait ? (
        <AbsoluteFill style={{ height: topHeight, background: "linear-gradient(180deg, rgb(20 20 18 / 0%) 34%, rgb(20 20 18 / 25%) 62%, rgb(20 20 18 / 74%) 100%)" }} />
      ) : (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgb(20 20 18 / 80%) 0%, rgb(20 20 18 / 48%) 34%, rgb(20 20 18 / 0%) 75%)" }} />
      )}
    </>
  );
};

const Header = ({ chapter, frame }: SceneProps) => {
  const isOpening = chapter.id === "opening";
  return (
    <div style={{ position: "absolute", left: 84, top: 78, width: 860, color: C.bone, ...revealStyle(frame, 2) }}>
      {!isOpening && <Mono style={{ color: "#D2D5C8", fontSize: 19, letterSpacing: "0.17em", textTransform: "uppercase", marginBottom: 25 }}>{chapter.label}</Mono>}
      <Display style={{ fontSize: isOpening ? 112 : 84, lineHeight: 1.02, letterSpacing: "-0.04em", maxWidth: 850 }}>{chapter.title}</Display>
      {!isOpening && <Text style={{ marginTop: 24, maxWidth: 740, fontSize: 27, lineHeight: 1.4, color: "#E0DCD2" }}>{chapter.description}</Text>}
    </div>
  );
};

const RecordPanel = ({ chapter, frame, portrait, children }: SceneProps & { children: ReactNode }) => {
  const mobile = portrait;
  const isDark = chapter.id === "opening" || chapter.id === "service" || chapter.id === "closing";
  const background = isDark ? C.charcoal : C.bone;
  return (
    <div style={{
      position: "absolute",
      ...(mobile ? { top: 620, left: 0, right: 0, bottom: 0, padding: "39px 66px 48px" } : { left: "55%", right: 0, top: 0, bottom: 0, padding: "110px 64px 100px", display: "flex", flexDirection: "column", justifyContent: "center" }),
      background,
      color: isDark ? C.bone : C.ink,
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, borderTop: `3px solid ${C.clay}`, pointerEvents: "none" }} />
      {chapter.id !== "opening" && (
        <Mono style={{ color: isDark ? "#D2D5C8" : C.moss, fontSize: mobile ? 38 : 24, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: mobile ? 24 : 32, ...revealStyle(frame, 4) }}>
          {chapter.label}
        </Mono>
      )}
      <div style={{ zoom: mobile ? 1 : 1.55, ...revealStyle(frame, 6) }}>{children}</div>
      <div style={{ position: "absolute", left: mobile ? 66 : 48, right: mobile ? 66 : 48, bottom: mobile ? 22 : 18, display: "flex", justifyContent: "space-between", color: isDark ? "#D4D0C7" : "#5E5E55" }}>
        <Mono style={{ fontSize: mobile ? 23 : 17, letterSpacing: "0.11em", textTransform: "uppercase" }}>Illustrative kitchen records</Mono>
        <Mono style={{ fontSize: mobile ? 23 : 17, letterSpacing: "0.11em", textTransform: "uppercase" }}>Passe Culinaire</Mono>
      </div>
    </div>
  );
};

const OpeningRecord = ({ portrait }: { portrait: boolean }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: portrait ? "row" : "column", alignItems: portrait ? "center" : "flex-start", justifyContent: "center", gap: portrait ? 34 : 25 }}>
    <Img src={staticFile("monogram.svg")} style={{ width: portrait ? 110 : 68, height: portrait ? 110 : 68, objectFit: "contain" }} />
    <div>
      <Display style={{ fontSize: portrait ? 78 : 42, lineHeight: 1.05 }}>CulinAIre Kitchen</Display>
      <Text style={{ marginTop: 10, color: "#D4D0C7", fontSize: portrait ? 54 : 23, lineHeight: 1.24 }}>A clearer view of the work behind service.</Text>
    </div>
  </div>
);

const ForecastRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const size = portrait ? 68 : 46;
  return (
    <div style={{ display: "grid", gap: portrait ? 24 : 20 }}>
      {[{ label: "Expected covers", value: "80" }, { label: "Pear tart portions", value: "24" }].map((item, i) => (
        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.ash}66`, paddingBottom: portrait ? 18 : 14, ...revealStyle(frame, 12 + i * 10) }}>
          <Text style={{ fontSize: portrait ? 58 : 25 }}>{item.label}</Text>
          <Number style={{ fontSize: portrait ? 112 : size, lineHeight: 1 }}>{item.value}</Number>
        </div>
      ))}
      <Text style={{ color: C.moss, fontSize: portrait ? 50 : 21 }}>Forecast reviewed · preparation planned</Text>
    </div>
  );
};

const RosterRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const rows = [
    { role: "Chef", offset: 0, start: "06:00", end: "14:00", duty: "Forecast · prep" },
    { role: "Pastry", offset: 1, start: "07:00", end: "15:00", duty: "Bake · finish" },
    { role: "Bar", offset: 9, start: "15:00", end: "23:00", duty: "Service · close" },
  ];
  return (
    <div>
      <div style={{ marginBottom: portrait ? 18 : 12, display: "flex", justifyContent: "space-between" }}>
        <Mono style={{ fontSize: portrait ? 28 : 13, color: C.moss }}>Shift plan</Mono>
        <Mono style={{ fontSize: portrait ? 28 : 13, color: C.moss }}>06:00 to 23:00</Mono>
      </div>
      {rows.map((row, i) => (
        <div key={row.role} style={{ display: "grid", gridTemplateColumns: "1fr", gap: portrait ? 8 : 14, marginBottom: portrait ? 17 : 12, ...revealStyle(frame, 10 + i * 12) }}>
          <Text style={{ fontSize: portrait ? 50 : 22 }}>{row.role} <span style={{ color: C.moss }}>{row.start}–{row.end}</span></Text>
          <div style={{ display: "flex", alignItems: "center", height: portrait ? 13 : 8, background: "#D7D2C8" }}>
            <div style={{ height: "100%", marginLeft: `${row.offset / 17 * 100}%`, width: `${progress(frame, i * 10, i * 10 + 28) * 8 / 17 * 100}%`, background: i === 2 ? C.clay : C.moss }} />
          </div>
          {!portrait && <Text style={{ fontSize: 18, color: "#55554E" }}>{row.duty}</Text>}
        </div>
      ))}
      <div style={{ marginTop: portrait ? 16 : 14, borderLeft: `4px solid ${C.clay}`, paddingLeft: portrait ? 20 : 14, color: portrait ? C.ink : "#454540" }}>
        <Mono style={{ fontSize: portrait ? 25 : 12, color: C.moss, marginBottom: 6 }}>Team message · Chef to sections</Mono>
        <Text style={{ fontSize: portrait ? 46 : 19, lineHeight: 1.15 }}>24 tart portions planned. Confirm prep.</Text>
      </div>
    </div>
  );
};

const RecipeRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => (
  <div>
  <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: portrait ? 20 : 28 }}>
    <div style={{ borderRight: `1px solid ${C.ash}66`, paddingRight: portrait ? 16 : 25 }}>
      <Mono style={{ fontSize: portrait ? 27 : 13, color: C.moss, marginBottom: portrait ? 12 : 10 }}>Recipe brief</Mono>
      <Display style={{ fontSize: portrait ? 65 : 36, lineHeight: 1.04 }}>Carrot<br />& lentil</Display>
      <Text style={{ marginTop: 14, fontSize: portrait ? 43 : 19, lineHeight: 1.25 }}>French · 12 portions</Text>
    </div>
    <div>
      <Mono style={{ fontSize: portrait ? 27 : 13, color: C.moss, marginBottom: portrait ? 12 : 10 }}>Develop & refine</Mono>
      <Text style={{ fontSize: portrait ? 42 : 20, lineHeight: 1.32 }}>Ingredients<br />Quantities<br />Method</Text>
      <div style={{ marginTop: portrait ? 15 : 13, padding: portrait ? "13px 14px" : "10px 12px", borderLeft: `3px solid ${C.clay}`, background: "#E8E4DA", ...revealStyle(frame, 75) }}>
        <Text style={{ fontSize: portrait ? 39 : 17, lineHeight: 1.17 }}>Keep it dairy-free.</Text>
      </div>
    </div>
  </div>
  <div style={{ marginTop: portrait ? 30 : 26, paddingTop: portrait ? 20 : 16, borderTop: `1px solid ${C.ash}66`, ...revealStyle(frame, 112) }}>
    <Mono style={{ color: C.moss, fontSize: portrait ? 27 : 13, marginBottom: 14 }}>Menu costing · illustrative</Mono>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      {[["Per portion", "$3.20"], ["Menu price", "$16"], ["Food cost", "20%"]].map(([label, value]) => <div key={label}>
        <Text style={{ fontSize: portrait ? 30 : 15 }}>{label}</Text>
        <Number style={{ fontSize: portrait ? 54 : 29 }}>{value}</Number>
      </div>)}
    </div>
  </div>
  </div>
);

const PatisserieRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const parts = ["Pâte sucrée", "Almond cream", "Pears"];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: portrait ? 9 : 11, alignItems: "center", textAlign: "center" }}>
        {parts.map((part, i) => <div key={part} style={{ display: "contents" }}>
          <div style={{ minHeight: portrait ? 105 : 78, display: "flex", alignItems: "center", justifyContent: "center", padding: portrait ? 7 : 10, background: i === 1 ? C.linen : "transparent", borderTop: `2px solid ${i === 2 ? C.clay : C.moss}`, ...revealStyle(frame, 12 + i * 14) }}>
            <Text style={{ fontSize: portrait ? 37 : 19, lineHeight: 1.12 }}>{part}</Text>
          </div>
          {i < 2 && <Text style={{ color: C.clay, fontSize: portrait ? 34 : 20 }}>+</Text>}
        </div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: portrait ? 23 : 18, borderTop: `1px solid ${C.ash}66`, paddingTop: portrait ? 18 : 14 }}>
        <Text style={{ fontSize: portrait ? 48 : 21 }}>Pear & almond tart</Text>
        <Number style={{ fontSize: portrait ? 60 : 31 }}>24 portions</Number>
      </div>
      <div style={{ marginTop: portrait ? 18 : 14, paddingLeft: portrait ? 18 : 14, borderLeft: `4px solid ${C.clay}`, ...revealStyle(frame, 62) }}>
        <Mono style={{ color: C.moss, fontSize: portrait ? 26 : 12, marginBottom: 5 }}>Make ahead</Mono>
        <Text style={{ fontSize: portrait ? 43 : 19 }}>Bake the shells before service.</Text>
      </div>
    </div>
  );
};

const CocktailRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const size = portrait ? 45 : 22;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: portrait ? 18 : 22 }}>
        {[ ["Spirit", "Gin"], ["Profile", "Citrus & herbal"] ].map(([label, value], i) => (
          <div key={label} style={{ paddingBottom: portrait ? 13 : 11, borderBottom: `1px solid ${C.ash}66`, ...revealStyle(frame, 10 + i * 11) }}>
            <Mono style={{ color: C.moss, fontSize: portrait ? 25 : 12, marginBottom: 7 }}>{label}</Mono>
            <Text style={{ fontSize: size, lineHeight: 1.15 }}>{value}</Text>
          </div>
        ))}
      </div>
      <Display style={{ marginTop: portrait ? 20 : 15, fontSize: portrait ? 68 : 36, lineHeight: 1.02 }}>Pear & thyme</Display>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: portrait ? 19 : 15, paddingTop: portrait ? 14 : 11, borderTop: `1px solid ${C.ash}66` }}>
        <Text style={{ fontSize: portrait ? 42 : 19 }}>Drink specification → batch</Text>
        <Number style={{ fontSize: portrait ? 71 : 38, color: C.moss }}>10 serves</Number>
      </div>
    </div>
  );
};

const PurchaseRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => (
  <div>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <Text style={{ fontSize: portrait ? 47 : 21 }}>Pears · target stock</Text>
      <Number style={{ fontSize: portrait ? 67 : 38 }}>20 kg</Number>
    </div>
    <div style={{ position: "relative", height: portrait ? 18 : 12, marginTop: portrait ? 12 : 10, background: "#D7D2C8" }}>
      <div style={{ width: `${progress(frame, 10, 76) * 40}%`, height: "100%", background: C.moss }} />
      <div style={{ position: "absolute", top: -8, bottom: -8, left: "40%", borderLeft: `2px solid ${C.clay}` }} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: portrait ? 18 : 22, marginTop: portrait ? 20 : 17 }}>
      <div><Mono style={{ fontSize: portrait ? 25 : 12, color: C.moss }}>On hand</Mono><Number style={{ fontSize: portrait ? 73 : 38 }}>8 kg</Number></div>
      <Display style={{ fontSize: portrait ? 49 : 25, color: C.clay }}>→</Display>
      <div><Mono style={{ fontSize: portrait ? 25 : 12, color: C.moss }}>To order</Mono><Number style={{ fontSize: portrait ? 73 : 38 }}>12 kg</Number></div>
    </div>
    <div style={{ marginTop: portrait ? 16 : 12, padding: portrait ? "13px 16px" : "9px 13px", background: C.linen, ...revealStyle(frame, 44) }}>
      <Text style={{ fontSize: portrait ? 42 : 18 }}>Purchase order prepared · 12 kg pears</Text>
    </div>
  </div>
);

const ReceivingRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const rows = [{ label: "Ordered", value: "12 kg" }, { label: "Accepted", value: "10 kg" }, { label: "Short", value: "2 kg" }];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: portrait ? 14 : 20 }}>
        {rows.map((row, i) => <div key={row.label} style={{ ...revealStyle(frame, 12 + i * 13) }}>
          <Mono style={{ color: i === 2 ? "#8D422F" : C.moss, fontSize: portrait ? 25 : 12, marginBottom: portrait ? 10 : 8 }}>{row.label}</Mono>
          <Number style={{ fontSize: portrait ? 70 : 37 }}>{row.value}</Number>
        </div>)}
      </div>
      <Line />
      <div style={{ marginTop: portrait ? 18 : 15 }}>
        <Text style={{ fontSize: portrait ? 44 : 20 }}>Delivery inspected against order</Text>
        <div style={{ display: "flex", alignItems: "center", gap: portrait ? 14 : 11, marginTop: portrait ? 14 : 10 }}>
          <div style={{ flex: 1, height: portrait ? 18 : 10, display: "flex", background: "#D7D2C8" }}>
            <div style={{ width: `${progress(frame, 10, 60) * 83.33}%`, background: C.moss }} />
            <div style={{ flex: 1, background: C.clay, opacity: 0.8 }} />
          </div>
          <Mono style={{ fontSize: portrait ? 23 : 11, color: C.moss }}>recorded</Mono>
        </div>
      </div>
    </div>
  );
};

const InventoryRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => (
  <div>
    <Text style={{ fontSize: portrait ? 46 : 20, marginBottom: portrait ? 15 : 12 }}>Pears · separate stock batches</Text>
    {[{ batch: "Opening stock · older", amount: 8, color: C.moss }, { batch: "Delivery · newer", amount: 10, color: C.clay }].map((item, i) => (
      <div key={item.batch} style={{ marginBottom: portrait ? 15 : 12, ...revealStyle(frame, 12 + i * 12) }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: portrait ? 8 : 6 }}>
          <Text style={{ fontSize: portrait ? 38 : 17 }}>{item.batch}</Text><Number style={{ fontSize: portrait ? 49 : 27 }}>{item.amount} kg</Number>
        </div>
        <div style={{ height: portrait ? 15 : 9, background: "#D7D2C8" }}><div style={{ width: `${item.amount / 18 * 100}%`, height: "100%", background: item.color }} /></div>
      </div>
    ))}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${C.ash}66`, paddingTop: portrait ? 15 : 12 }}>
      <Text style={{ fontSize: portrait ? 43 : 19 }}>Available inventory</Text><Number style={{ fontSize: portrait ? 75 : 42 }}>18 kg</Number>
    </div>
    <Text style={{ marginTop: portrait ? 12 : 9, color: C.moss, fontSize: portrait ? 37 : 16 }}>Draw the older batch first · FIFO</Text>
  </div>
);

const MiseRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const draw = 3 * progress(frame, 8, 112);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr", alignItems: "center", gap: portrait ? 10 : 16 }}>
        <div><Mono style={{ fontSize: portrait ? 23 : 11, color: C.moss, marginBottom: 7 }}>Pantry</Mono><Number style={{ fontSize: portrait ? 69 : 39 }}>{(18 - draw).toFixed(1)} kg</Number></div>
        <div style={{ position: "relative", height: 3, background: "#C8C3B8" }}>
          <div style={{ position: "absolute", inset: "-8px auto -8px 0", width: `${progress(frame, 12, 70) * 100}%`, background: C.clay }} />
          <div style={{ position: "absolute", left: `${progress(frame, 12, 70) * 100}%`, top: -14, color: C.clay, fontSize: 24 }}>›</div>
        </div>
        <div><Mono style={{ fontSize: portrait ? 23 : 11, color: C.moss, marginBottom: 7 }}>Pastry</Mono><Number style={{ fontSize: portrait ? 69 : 39 }}>{draw.toFixed(1)} kg</Number></div>
      </div>
      <div style={{ marginTop: portrait ? 17 : 12, textAlign: "center", fontSize: portrait ? 32 : 16, color: C.moss }}>Recorded stock transfer · 3 kg</div>
      <div style={{ display: "flex", gap: portrait ? 14 : 12, marginTop: portrait ? 19 : 14 }}>
        {["Weigh", "Prepare", "Arrange"].map((task, i) => <div key={task} style={{ flex: 1, padding: portrait ? "13px 8px" : "9px 6px", textAlign: "center", borderTop: `2px solid ${i === 1 ? C.clay : C.moss}`, background: i === 1 ? C.linen : "transparent", ...revealStyle(frame, 25 + i * 11) }}><Text style={{ fontSize: portrait ? 35 : 17 }}>{task}</Text></div>)}
      </div>
    </div>
  );
};

const ProductionRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const stages = ["Prepare", "Bake", "Finish"];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: portrait ? 11 : 10 }}>
        {stages.map((stage, i) => <div key={stage} style={{ display: "flex", alignItems: "center", gap: portrait ? 10 : 9, flex: 1, ...revealStyle(frame, 10 + i * 17) }}>
          <div style={{ width: portrait ? 19 : 12, height: portrait ? 19 : 12, borderRadius: 20, background: i < 2 ? C.moss : C.clay, flexShrink: 0 }} />
          <Text style={{ fontSize: portrait ? 35 : 17 }}>{stage}</Text>
          {i < 2 && <div style={{ height: 1, flex: 1, background: C.ash }} />}
        </div>)}
      </div>
      <div style={{ marginTop: portrait ? 20 : 15, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${C.ash}66`, paddingTop: portrait ? 17 : 13 }}>
        <div><Mono style={{ fontSize: portrait ? 24 : 11, color: C.moss }}>Completed batch</Mono><Text style={{ fontSize: portrait ? 39 : 17 }}>3 tarts</Text></div>
        <Number style={{ fontSize: portrait ? 77 : 44 }}>24 portions</Number>
      </div>
      <Text style={{ marginTop: portrait ? 12 : 8, fontSize: portrait ? 34 : 15, color: "#5E5E55" }}>Yield recorded by the kitchen team.</Text>
    </div>
  );
};

const ServiceRecord = ({ portrait }: { portrait: boolean }) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
    <Display style={{ fontSize: portrait ? 82 : 49, lineHeight: 1.02 }}>Savoury.<br />Patisserie.<br />Cocktail.</Display>
    <Text style={{ marginTop: portrait ? 19 : 14, fontSize: portrait ? 49 : 22, lineHeight: 1.3, color: "#D4D0C7" }}>Three crafts, brought together for service.</Text>
    <div style={{ marginTop: portrait ? 20 : 16, height: 2, width: portrait ? 110 : 72, background: C.clay }} />
  </div>
);

const WasteRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const items = [
    { label: "Recipe use", value: 2.4, color: C.moss },
    { label: "Usable return", value: 0.3, color: C.ash },
    { label: "Preparation trim", value: 0.3, color: C.clay },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: portrait ? 11 : 8 }}><Text style={{ fontSize: portrait ? 44 : 20 }}>Pears drawn</Text><Number style={{ fontSize: portrait ? 74 : 42 }}>3.0 kg</Number></div>
      <div style={{ display: "flex", height: portrait ? 17 : 12, background: "#D7D2C8", overflow: "hidden" }}>
        {items.map((item, i) => <div key={item.label} style={{ width: `${item.value / 3 * 100 * progress(frame, 12 + i * 8, 55 + i * 8)}%`, background: item.color, borderRight: "2px solid #F4F1EA" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: portrait ? 12 : 15, marginTop: portrait ? 16 : 12 }}>
        {items.map((item, i) => <div key={item.label} style={{ borderTop: `2px solid ${item.color}`, paddingTop: portrait ? 8 : 6, ...revealStyle(frame, 16 + i * 12) }}>
          <Text style={{ minHeight: portrait ? 66 : 32, fontSize: portrait ? 32 : 15, lineHeight: 1.1 }}>{item.label}</Text>
          <Number style={{ fontSize: portrait ? 48 : 28 }}>{item.value.toFixed(1)} kg</Number>
        </div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: portrait ? 15 : 11, borderTop: `1px solid ${C.ash}66`, paddingTop: portrait ? 11 : 8 }}>
        <div><Mono style={{ fontSize: portrait ? 22 : 11, color: "#8D422F" }}>Waste cost · illustrative</Mono><Text style={{ fontSize: portrait ? 35 : 16 }}>At $4/kg</Text></div>
        <Number style={{ color: "#8D422F", fontSize: portrait ? 68 : 38 }}>$1.20</Number>
      </div>
    </div>
  );
};

const SalesRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: portrait ? 14 : 12, marginBottom: portrait ? 16 : 11 }}>
      <div style={{ padding: portrait ? "9px 14px" : "7px 10px", border: `1px solid ${C.ash}`, fontSize: portrait ? 33 : 15 }}>Sales file</div>
      <div style={{ height: 1, flex: 1, background: C.clay, transform: `scaleX(${progress(frame, 14, 44)})`, transformOrigin: "left" }} />
      <div style={{ padding: portrait ? "9px 14px" : "7px 10px", background: C.linen, fontSize: portrait ? 33 : 15 }}>Review</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: portrait ? 44 : 28 }}>
      {[{ label: "Forecast", value: 80 }, { label: "Served", value: 74 }].map((row, i) => <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.ash}66`, paddingBottom: portrait ? 7 : 5, ...revealStyle(frame, 22 + i * 11) }}><Text style={{ fontSize: portrait ? 35 : 16 }}>{row.label}</Text><Number style={{ fontSize: portrait ? 50 : 28 }}>{row.value}</Number></div>)}
    </div>
    <div style={{ marginTop: portrait ? 14 : 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: portrait ? 35 : 16 }}><span>24 prepared</span><span>21 sold · 3 unsold</span></div>
      <div style={{ height: portrait ? 13 : 8, display: "flex", marginTop: portrait ? 6 : 4, background: "#D7D2C8" }}><div style={{ width: `${progress(frame, 32, 66) * 87.5}%`, background: C.moss }} /><div style={{ flex: 1, background: C.clay }} /></div>
    </div>
    <Text style={{ marginTop: portrait ? 12 : 9, fontSize: portrait ? 32 : 14, color: "#5E5E55" }}>Unsold portions are reviewed separately from waste.</Text>
  </div>
);

const CLOSING_FEATURES = [
  "Purchasing", "Receiving", "Inventory", "Mise en Place",
  "Production", "Waste Management", "Rostering", "Recipe Lab", "Patisserie Lab", "Cocktail Lab", "Sales",
];

const ClosingRecord = ({ frame, portrait }: { frame: number; portrait: boolean }) => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: portrait ? "1fr 1fr" : "1fr 1fr 1fr", columnGap: portrait ? 14 : 16, rowGap: portrait ? 8 : 8 }}>
      {CLOSING_FEATURES.map((feature, i) => <div key={feature} style={{ borderTop: `2px solid ${["Recipe Lab", "Patisserie Lab", "Cocktail Lab"].includes(feature) ? C.clay : C.moss}`, paddingTop: portrait ? 8 : 6, opacity: progress(frame, i * 5, i * 5 + 12) }}>
        <Text style={{ fontSize: portrait ? 40 : 26, lineHeight: 1.12 }}>{feature}</Text>
      </div>)}
    </div>
    <Text style={{ fontSize: portrait ? 38 : 26, marginTop: 28, color: C.bone }}>15.3 kg closing pear stock</Text>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: portrait ? 14 : 10, borderTop: `1px solid ${C.ash}66`, paddingTop: portrait ? 11 : 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: portrait ? 10 : 8 }}>
        <Img src={staticFile("monogram.svg")} style={{ width: portrait ? 52 : 31, height: portrait ? 52 : 31, objectFit: "contain" }} />
        <Display style={{ fontSize: portrait ? 37 : 22 }}>CulinAIre Kitchen</Display>
      </div>
      <Text style={{ color: C.bone, fontSize: portrait ? 32 : 20 }}>Explore the kitchen ↗</Text>
    </div>
  </div>
);

const RenderRecord = ({ chapter, frame, portrait }: SceneProps) => {
  switch (chapter.id) {
    case "opening": return <OpeningRecord portrait={portrait} />;
    case "forecast": return <ForecastRecord frame={frame} portrait={portrait} />;
    case "roster": return <RosterRecord frame={frame} portrait={portrait} />;
    case "recipe": return <RecipeRecord frame={frame} portrait={portrait} />;
    case "patisserie": return <PatisserieRecord frame={frame} portrait={portrait} />;
    case "cocktail": return <CocktailRecord frame={frame} portrait={portrait} />;
    case "purchasing": return <PurchaseRecord frame={frame} portrait={portrait} />;
    case "receiving": return <ReceivingRecord frame={frame} portrait={portrait} />;
    case "inventory": return <InventoryRecord frame={frame} portrait={portrait} />;
    case "mise": return <MiseRecord frame={frame} portrait={portrait} />;
    case "production": return <ProductionRecord frame={frame} portrait={portrait} />;
    case "service": return <ServiceRecord portrait={portrait} />;
    case "waste": return <WasteRecord frame={frame} portrait={portrait} />;
    case "sales": return <SalesRecord frame={frame} portrait={portrait} />;
    case "closing": return <ClosingRecord frame={frame} portrait={portrait} />;
    default: return null;
  }
};

const Scene = ({ chapter, frame, portrait }: SceneProps) => (
  <AbsoluteFill style={{ backgroundColor: chapter.id === "opening" || chapter.id === "service" || chapter.id === "closing" ? C.charcoal : C.bone }}>
    <Photo chapter={chapter} frame={frame} portrait={portrait} />
    {!portrait && <Header chapter={chapter} frame={frame} portrait={portrait} />}
    {portrait ? (
      <div style={{ position: "absolute", top: 0, height: 620, left: 0, right: 0 }}>
        <div style={{ position: "absolute", bottom: 36, left: 66, right: 66, color: C.bone, ...revealStyle(frame, 2) }}>
          <Display style={{ fontSize: chapter.id === "opening" ? 108 : 92, lineHeight: 1.04, letterSpacing: "-0.025em" }}>{chapter.title}</Display>
        </div>
      </div>
    ) : null}
    {!portrait && ["opening", "service"].includes(chapter.id) ? (
      <div style={{ position: "absolute", left: 84, bottom: 100, width: 760, color: C.bone, ...revealStyle(frame, 8) }}>
        <Img src={staticFile("monogram.svg")} style={{ width: 90, height: 90, marginBottom: 24 }} />
        <Display style={{ fontSize: 58 }}>CulinAIre Kitchen</Display>
        <Text style={{ fontSize: 26, marginTop: 16 }}>The kitchen. The pastry bench. The bar.</Text>
      </div>
    ) : (
      <RecordPanel chapter={chapter} frame={frame} portrait={portrait}>
        <RenderRecord chapter={chapter} frame={frame} portrait={portrait} />
      </RecordPanel>
    )}
  </AbsoluteFill>
);

export const KitchenStory = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const [fontHandle] = useState(() => delayRender("Load local Passe Culinaire film fonts"));

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Promise.all([
          document.fonts.load('350 100px "Fraunces Local"', "Passe Culinaire"),
          document.fonts.load('400 40px "Inter Local"', "Kitchen records"),
          document.fonts.load('500 18px "Mono Local"', "Illustrative kitchen records"),
        ]);
        continueRender(fontHandle);
      } catch (error) {
        cancelRender(error);
      }
    };
    void loadFonts();
  }, [fontHandle]);

  const chapter = story.chapters.find((item) => frame >= item.at * FPS && frame < item.end * FPS);
  if (!chapter) return <AbsoluteFill style={{ backgroundColor: C.charcoal }} />;
  return <Scene chapter={chapter} frame={frame - chapter.at * FPS} portrait={portrait} />;
};
