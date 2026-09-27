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
} from "remotion";
import { useEffect, useState, type ReactNode } from "react";

export const KITCHEN_DAY_MOBILE_DURATION = 80 * 30;

const C = {
  bone: "#F4F1EA",
  ink: "#1A1A18",
  moss: "#4A5A3F",
  clay: "#B8674B",
  ash: "#8A8A82",
  charcoal: "#141412",
  linen: "#E8E4DA",
};

const ease = Easing.bezier(0.2, 0.75, 0.25, 1);

type LayerProps = {
  start: number;
  end: number;
  render: (frame: number) => ReactNode;
};

const MobileLayer = ({ start, end, render }: LayerProps) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  return <AbsoluteFill>{render(frame - start)}</AbsoluteFill>;
};

type PhotoProps = {
  name: string;
  frame: number;
  duration: number;
  drift?: "left" | "right" | "up" | "down";
  position?: string;
  opacity?: number;
};

const KitchenPhoto = ({
  name,
  frame,
  duration,
  drift = "left",
  position = "70% 50%",
  opacity = 1,
}: PhotoProps) => {
  const progress = interpolate(frame, [0, Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const delta = interpolate(progress, [0, 1], [0, 1]);
  const x = drift === "left" ? 1.15 - delta * 2.3 : drift === "right" ? -1.15 + delta * 2.3 : 0;
  const y = drift === "up" ? 1.1 - delta * 2.2 : drift === "down" ? -1.1 + delta * 2.2 : 0;
  const scale = 1.025 + delta * 0.022;

  return (
    <Img
      src={staticFile(name)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 700,
        objectFit: "cover",
        objectPosition: position,
        scale,
        translate: `${x}% ${y}%`,
        opacity,
      }}
    />
  );
};

const PhotoTitle = ({ children }: { children: ReactNode }) => (
  <div style={{
    position: "absolute",
    left: 70,
    right: 70,
    top: 505,
    color: C.bone,
    fontFamily: '"Fraunces Local", Georgia, serif',
    fontSize: 78,
    fontWeight: 350,
    letterSpacing: "-0.045em",
    lineHeight: 0.99,
    textShadow: "0 2px 20px rgb(0 0 0 / 28%)",
  }}>{children}</div>
);

const Caption = ({ dark = false }: { dark?: boolean }) => (
  <div style={{
    position: "absolute",
    left: 70,
    right: 70,
    bottom: 34,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: dark ? "#D4D0C7" : "#5E5E55",
    fontFamily: '"Mono Local", monospace',
    fontSize: 18,
    letterSpacing: "0.11em",
    textTransform: "uppercase",
  }}>
    <span>Illustrative kitchen records</span>
    <span>Passe Culinaire</span>
  </div>
);

const MobileShell = ({
  frame,
  image,
  title,
  children,
  panel = "bone",
  drift,
  position = "70% 50%",
}: {
  frame: number;
  image: string;
  title: ReactNode;
  children: ReactNode;
  panel?: "bone" | "charcoal";
  drift?: PhotoProps["drift"];
  position?: string;
}) => {
  const dark = panel === "charcoal";
  return (
    <AbsoluteFill style={{ backgroundColor: dark ? C.charcoal : C.bone, color: dark ? C.bone : C.ink }}>
      <KitchenPhoto name={image} frame={frame} duration={240} drift={drift} position={position} />
      <AbsoluteFill style={{ height: 700, background: "linear-gradient(180deg, rgb(20 20 18 / 7%) 0%, rgb(20 20 18 / 13%) 49%, rgb(20 20 18 / 80%) 100%)" }} />
      <div style={{ position: "absolute", top: 700, right: 0, bottom: 0, left: 0, backgroundColor: dark ? C.charcoal : C.bone }} />
      <PhotoTitle>{title}</PhotoTitle>
      <div style={{ position: "absolute", left: 70, right: 70, top: 768, bottom: 89 }}>
        {children}
      </div>
      <Caption dark={dark} />
    </AbsoluteFill>
  );
};

const Number = ({ children, size = 68, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span style={{
    color,
    fontFamily: '"Fraunces Local", Georgia, serif',
    fontSize: size,
    fontWeight: 350,
    letterSpacing: "-0.035em",
    lineHeight: 1,
    fontVariantNumeric: "lining-nums tabular-nums",
    whiteSpace: "nowrap",
  }}>{children}</span>
);

const RecordRow = ({
  label,
  value,
  dark = false,
  index = 0,
  frame = 60,
}: {
  label: ReactNode;
  value: ReactNode;
  dark?: boolean;
  index?: number;
  frame?: number;
}) => (
  <div style={{
    minHeight: 112,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 22,
    borderTop: `1px solid ${dark ? "rgb(244 241 234 / 34%)" : "rgb(138 138 130 / 38%)"}`,
    opacity: interpolate(frame, [index * 12, index * 12 + 16], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    }),
  }}>
    <div style={{
      color: dark ? C.bone : C.ink,
      fontFamily: '"Inter Local", sans-serif',
      fontSize: 44,
      fontWeight: 400,
      lineHeight: 1.08,
      maxWidth: 620,
    }}>{label}</div>
    <div style={{ flexShrink: 0 }}>{value}</div>
  </div>
);

const Kicker = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <div style={{
    marginBottom: 14,
    color: dark ? "#CDD1C3" : C.moss,
    fontFamily: '"Mono Local", monospace',
    fontSize: 19,
    letterSpacing: "0.12em",
    lineHeight: 1.2,
    textTransform: "uppercase",
  }}>{children}</div>
);

const Opening = ({ frame }: { frame: number }) => (
  <AbsoluteFill style={{ backgroundColor: C.bone, color: C.ink }}>
    <KitchenPhoto name="opening.png" frame={frame} duration={180} position="70% 49%" drift="right" />
    <AbsoluteFill style={{ height: 700, background: "linear-gradient(180deg, rgb(20 20 18 / 10%) 0%, rgb(20 20 18 / 21%) 50%, rgb(20 20 18 / 83%) 100%)" }} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 505, color: C.bone, fontFamily: '"Fraunces Local", Georgia, serif', fontSize: 78, fontWeight: 350, letterSpacing: "-0.045em", lineHeight: 0.99 }}>
      A day in the kitchen.
    </div>
    <div style={{ position: "absolute", left: 70, right: 70, top: 768, bottom: 85, display: "flex", alignItems: "center", gap: 28 }}>
      <Img src={staticFile("monogram.svg")} style={{ width: 88, height: 88, objectFit: "contain", flexShrink: 0, filter: "brightness(0)" }} />
      <div>
        <div style={{ fontFamily: '"Fraunces Local", Georgia, serif', fontSize: 57, fontWeight: 350, letterSpacing: "-0.03em", lineHeight: 1.05 }}>CulinAIre Kitchen</div>
        <div style={{ marginTop: 18, maxWidth: 760, fontSize: 44, lineHeight: 1.24, color: "#55554E" }}>The work behind every service, from the first plan to the last plate.</div>
      </div>
    </div>
    <Caption />
  </AbsoluteFill>
);

const Forecast = ({ frame }: { frame: number }) => (
  <MobileShell frame={frame} image="opening.png" title="Before the first knife." position="73% 51%" drift="up">
    <Kicker>01 / Set the day</Kicker>
    <RecordRow frame={frame} index={0} label="Expected covers" value={<Number>{Math.round(interpolate(frame, [0, 58], [0, 80], { extrapolateRight: "clamp", easing: ease }))}</Number>} />
    <RecordRow frame={frame} index={1} label="Pastry to prepare" value={<Number>{Math.round(interpolate(frame - 16, [0, 56], [0, 24], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }))} portions</Number>} />
    <div style={{ marginTop: 20, color: C.moss, fontFamily: '"Inter Local", sans-serif', fontSize: 38, lineHeight: 1.2 }}>Recipe reviewed · Menu cost checked</div>
  </MobileShell>
);

const Pantry = ({ frame }: { frame: number }) => {
  const draw = interpolate(frame, [24, 122], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const left = 8 - draw;
  const line = interpolate(frame, [28, 92], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <MobileShell frame={frame} image="pantry.png" title="From pantry to pastry." panel="charcoal" position="70% 48%" drift="left">
      <Kicker dark>02 / Mise en place</Kicker>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#D4D0C7", fontSize: 34, margin: "21px 0 12px" }}>
        <span>Pantry opening stock</span><span className="film-number">8.0 kg</span>
      </div>
      <div style={{ height: 5, background: "rgb(244 241 234 / 21%)", marginBottom: 4 }}>
        <div style={{ height: 5, width: `${line}%`, background: C.clay }} />
      </div>
      <RecordRow frame={frame} index={0} dark label="Drawn for pastry" value={<Number>{draw.toFixed(1)} kg</Number>} />
      <RecordRow frame={frame} index={1} dark label="Left in pantry" value={<Number>{left.toFixed(1)} kg</Number>} />
    </MobileShell>
  );
};

const Preparation = ({ frame }: { frame: number }) => (
  <MobileShell frame={frame} image="preparation.png" title="Weigh. Prepare. Bake." position="70% 50%" drift="down">
    <Kicker>03 / Preparation</Kicker>
    <RecordRow frame={frame} index={0} label="Pears for the recipe" value={<Number>2.4 kg</Number>} />
    <RecordRow frame={frame} index={1} label="Batch yield" value={<Number>24 portions</Number>} />
    <RecordRow frame={frame} index={2} label="Recipe & menu cost" value={<span style={{ color: C.moss, fontSize: 42 }}>Reviewed</span>} />
  </MobileShell>
);

const Service = ({ frame }: { frame: number }) => (
  <MobileShell frame={frame} image="tart.png" title={<>The craft reaches<br />the pass.</>} panel="charcoal" position="66% 52%" drift="right">
    <Kicker dark>04 / Service</Kicker>
    <div style={{ marginTop: 26, fontFamily: '"Fraunces Local", Georgia, serif', fontSize: 57, fontWeight: 350, letterSpacing: "-0.03em" }}>Pear & almond tart</div>
    <div style={{ marginTop: 18, maxWidth: 820, fontSize: 40, lineHeight: 1.25, color: "#D4D0C7" }}>A prepared batch, made ready for the room.</div>
  </MobileShell>
);

const Waste = ({ frame }: { frame: number }) => {
  const recipe = interpolate(frame, [32, 100], [0, 2.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const returned = interpolate(frame, [98, 140], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const waste = interpolate(frame, [137, 179], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <MobileShell frame={frame} image="pantry.png" title={<>Use it. Return it.<br />Record it.</>} position="69% 47%" drift="up">
      <Kicker>05 / Stock & waste</Kicker>
      <div style={{ margin: "20px 0 22px", fontSize: 36, color: "#505049" }}>3.0 kg drawn from pantry</div>
      <RecordRow frame={frame} index={0} label="Used in recipe" value={<Number>{recipe.toFixed(1)} kg</Number>} />
      <RecordRow frame={frame} index={1} label="Returned" value={<Number>{returned.toFixed(1)} kg</Number>} />
      <RecordRow frame={frame} index={2} label="Recorded waste" value={<Number color="#8D422F">{waste.toFixed(1)} kg</Number>} />
    </MobileShell>
  );
};

const Receiving = ({ frame }: { frame: number }) => {
  const ordered = Math.round(interpolate(frame - 8, [0, 55], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const received = Math.round(interpolate(frame - 40, [0, 55], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const short = Math.round(interpolate(frame - 82, [0, 46], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  return (
    <MobileShell frame={frame} image="receiving.png" title="Check what arrived." panel="charcoal" position="68% 50%" drift="left">
      <Kicker dark>06 / Receiving</Kicker>
      <RecordRow frame={frame} index={0} dark label="Ordered" value={<Number>{ordered} kg</Number>} />
      <RecordRow frame={frame} index={1} dark label="Received" value={<Number>{received} kg</Number>} />
      <RecordRow frame={frame} index={2} dark label="Short delivery" value={<Number color="#E6B29B">{short} kg</Number>} />
    </MobileShell>
  );
};

const Team = ({ frame }: { frame: number }) => {
  const rows = [
    { time: "06:00", role: "Chef", duty: "Forecast & prep" },
    { time: "07:00", role: "Pastry", duty: "Batch & bake" },
    { time: "11:00", role: "Service", duty: "Ready for lunch" },
  ];
  const note = interpolate(frame, [84, 126], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <MobileShell frame={frame} image="team.png" title="A team, in rhythm." panel="charcoal" position="72% 48%" drift="down">
      <Kicker dark>07 / People & handover</Kicker>
      {rows.map((row, index) => (
        <div key={row.role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 22, minHeight: 88, borderTop: "1px solid rgb(244 241 234 / 34%)", opacity: interpolate(frame, [index * 15, index * 15 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 44, lineHeight: 1.05 }}>{row.role}</div>
            <div style={{ marginTop: 7, fontSize: 36, lineHeight: 1.1, color: "#D4D0C7" }}>{row.duty}</div>
          </div>
          <div style={{ flexShrink: 0, color: "#D2D5C8", fontFamily: '"Mono Local", monospace', fontSize: 26 }}>{row.time}</div>
        </div>
      ))}
      <div style={{ marginTop: 17, padding: "17px 22px", borderLeft: `3px solid ${C.clay}`, background: "rgb(244 241 234 / 7%)", fontSize: 38, lineHeight: 1.18, opacity: note }}>Pastry batch ready for service.</div>
    </MobileShell>
  );
};

const Sales = ({ frame }: { frame: number }) => {
  const covers = Math.round(interpolate(frame - 16, [0, 56], [0, 74], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const sold = Math.round(interpolate(frame - 68, [0, 56], [0, 21], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const unsold = Math.round(interpolate(frame - 118, [0, 45], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  return (
    <MobileShell frame={frame} image="team.png" title="The day, in numbers." panel="charcoal" position="69% 48%" drift="up">
      <Kicker dark>08 / Sales review</Kicker>
      <RecordRow frame={frame} index={0} dark label="Covers served" value={<Number>{covers}</Number>} />
      <RecordRow frame={frame} index={1} dark label="Sold of 24 prepared" value={<Number>{sold}</Number>} />
      <RecordRow frame={frame} index={2} dark label="Portions unsold" value={<Number color="#E6B29B">{unsold}</Number>} />
      <div style={{marginTop:20,fontSize:38,color:"#D4D0C7"}}>Upload sales. Review service.</div>
    </MobileShell>
  );
};

const Closing = ({ frame }: { frame: number }) => {
  const stock = interpolate(frame, [0, 48], [0, 15.3], { extrapolateRight: "clamp", easing: ease });
  const sections = ["Purchasing · receiving", "Stock · recipes", "Preparation · waste", "People · sales"];
  return (
    <MobileShell frame={frame} image="tart.png" title={<>See the whole<br />kitchen.</>} panel="charcoal" position="70% 52%" drift="right">
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 26 }}>
        <Img src={staticFile("monogram.svg")} style={{ width: 66, height: 66, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ fontFamily: '"Fraunces Local", Georgia, serif', fontSize: 43, fontWeight: 350, letterSpacing: "-0.02em" }}>CulinAIre Kitchen</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 21, borderTop: "1px solid rgb(244 241 234 / 34%)", paddingTop: 20 }}>
        <Number size={82}>{stock.toFixed(1)} kg</Number>
        <span style={{ fontSize: 40, color: "#D4D0C7" }}>closing stock</span>
      </div>
      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 13, columnGap: 28 }}>
        {sections.map((section, index) => (
          <div key={section} style={{ borderTop: "1px solid rgb(244 241 234 / 25%)", paddingTop: 12, fontSize: 32, color: C.bone, opacity: interpolate(frame, [18 + index * 10, 40 + index * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) }}>{section}</div>
        ))}
      </div>
    </MobileShell>
  );
};

export const KitchenDayMobile = () => {
  const [fontHandle] = useState(() => delayRender("Load local Passe Culinaire fonts for mobile film"));
  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          document.fonts.load('350 100px "Fraunces Local"', "Passe Culinaire"),
          document.fonts.load('400 40px "Inter Local"', "Kitchen records"),
          document.fonts.load('500 18px "Mono Local"', "Illustrative"),
        ]);
        continueRender(fontHandle);
      } catch (error) {
        cancelRender(error);
      }
    };
    void load();
  }, [fontHandle]);

  return (
    <AbsoluteFill style={{ width: 1080, height: 1350, backgroundColor: C.charcoal, color: C.bone }}>
      <MobileLayer start={0} end={180} render={(frame) => <Opening frame={frame} />} />
      <MobileLayer start={180} end={420} render={(frame) => <Forecast frame={frame} />} />
      <MobileLayer start={420} end={660} render={(frame) => <Pantry frame={frame} />} />
      <MobileLayer start={660} end={960} render={(frame) => <Preparation frame={frame} />} />
      <MobileLayer start={960} end={1140} render={(frame) => <Service frame={frame} />} />
      <MobileLayer start={1140} end={1380} render={(frame) => <Waste frame={frame} />} />
      <MobileLayer start={1380} end={1620} render={(frame) => <Receiving frame={frame} />} />
      <MobileLayer start={1620} end={1860} render={(frame) => <Team frame={frame} />} />
      <MobileLayer start={1860} end={2160} render={(frame) => <Sales frame={frame} />} />
      <MobileLayer start={2160} end={KITCHEN_DAY_MOBILE_DURATION} render={(frame) => <Closing frame={frame} />} />
    </AbsoluteFill>
  );
};
