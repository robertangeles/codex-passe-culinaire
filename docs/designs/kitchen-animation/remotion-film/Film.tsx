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
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export const KITCHEN_DAY_DURATION = 80 * 30;

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

const Layer = ({ start, end, render }: LayerProps) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  return <AbsoluteFill>{render(frame - start)}</AbsoluteFill>;
};

type PhotoProps = {
  name: string;
  frame: number;
  duration: number;
  position?: string;
  reverse?: boolean;
  opacity?: number;
};

const Photo = ({
  name,
  frame,
  duration,
  position = "center",
  reverse = false,
  opacity = 1,
}: PhotoProps) => {
  const progress = interpolate(frame, [0, Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const scale = interpolate(progress, [0, 1], reverse ? [1.055, 1.025] : [1.025, 1.055]);
  const x = interpolate(progress, [0, 1], reverse ? ["1.2%", "-1.2%"] : ["-1.2%", "1.2%"]);
  const y = interpolate(progress, [0, 1], ["0.4%", "-0.4%"]);
  return (
    <Img
      src={staticFile(name)}
      className="film-photo"
      style={{ objectPosition: position, opacity, scale, translate: `${x} ${y}` }}
    />
  );
};

const Kicker = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div className="film-kicker" style={style}>{children}</div>
);

const Heading = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <h1 className="film-heading" style={style}>{children}</h1>
);

const Footer = ({ dark = false }: { dark?: boolean }) => (
  <div className="film-footer" style={{ color: dark ? C.bone : C.ink }}>
    <span className="film-mono" style={{ fontSize: 15, letterSpacing: "0.16em" }}>
      Illustrative kitchen records
    </span>
    <span className="film-mono" style={{ fontSize: 15, color: dark ? "#D4D0C7" : "#5E5E55" }}>
      Passe Culinaire
    </span>
  </div>
);

const count = (frame: number, frames: number, value: number) =>
  Math.round(interpolate(frame, [0, frames], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  }));

const Opening = ({ frame }: { frame: number }) => {
  const reveal = interpolate(frame, [0, 14], [0.86, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
      <Photo name="opening.png" frame={frame} duration={180} position="50% 48%" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgb(20 20 18 / 84%) 0%, rgb(20 20 18 / 50%) 45%, rgb(20 20 18 / 8%) 100%)" }} />
      <div style={{ position: "absolute", left: 128, top: 112, opacity: reveal }}>
        <Img src={staticFile("monogram.svg")} style={{ width: 86, height: 86, objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", left: 128, top: 352, maxWidth: 1050, color: C.bone, opacity: reveal }}>
        <Kicker style={{ color: "#E0DCD2", marginBottom: 40 }}>Passe Culinaire presents</Kicker>
        <Heading style={{ fontSize: 150, lineHeight: 0.93 }}>A day in<br />the kitchen.</Heading>
        <div style={{ marginTop: 38, width: 88, height: 2, background: C.clay }} />
        <div style={{ marginTop: 23, fontFamily: '"Fraunces Local", Georgia, serif', fontSize: 43, fontWeight: 350, letterSpacing: "-0.02em" }}>
          CulinAIre Kitchen
        </div>
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const Forecast = ({ frame }: { frame: number }) => {
  const reveal = interpolate(frame, [0, 24], [38, 0], { extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bone, color: C.ink }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Photo name="opening.png" frame={frame} duration={240} position="50% 50%" reverse />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #F4F1EA 0%, #F4F1EA 49%, rgb(244 241 234 / 92%) 53%, rgb(244 241 234 / 0%) 73%)" }} />
      <div style={{ position: "absolute", left: 124, top: 112, width: 850, transform: `translateY(${reveal}px)`, opacity: interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" }) }}>
        <Kicker style={{ color: C.moss, marginBottom: 35 }}>01 / Set the day</Kicker>
        <Heading style={{ fontSize: 112, maxWidth: 820 }}>Before the<br />first knife.</Heading>
        <p className="film-body" style={{ margin: "28px 0 42px", maxWidth: 760 }}>Forecast the covers. Decide what the kitchen should prepare.</p>
        <div className="film-rule" />
        <div className="film-ledger-row">
          <span>Expected covers</span>
          <span className="film-number" style={{ fontSize: 54 }}>{count(frame, 68, 80)}</span>
        </div>
        <div className="film-ledger-row">
          <span>Pear tart portions</span>
          <span className="film-number" style={{ fontSize: 54 }}>{count(frame - 12, 72, 24)} portions</span>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 31, color: C.moss, fontSize: 25 }}>
          <span>Recipe reviewed</span><span>Menu cost checked</span>
        </div>
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

const Pantry = ({ frame }: { frame: number }) => {
  const progress = interpolate(frame, [20, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const draw = (3 * progress).toFixed(1);
  const remaining = (8 - 3 * progress).toFixed(1);
  const line = interpolate(frame, [26, 84], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
      <Photo name="pantry.png" frame={frame} duration={240} position="54% 48%" reverse />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgb(20 20 18 / 83%) 0%, rgb(20 20 18 / 57%) 47%, rgb(20 20 18 / 14%) 100%)" }} />
      <div style={{ position: "absolute", left: 126, top: 138, width: 850, color: C.bone }}>
        <Kicker style={{ color: "#D2D5C8", marginBottom: 36 }}>02 / Mise en place</Kicker>
        <Heading style={{ fontSize: 112, maxWidth: 860 }}>From pantry<br />to pastry.</Heading>
        <p className="film-body" style={{ margin: "28px 0 65px", maxWidth: 740 }}>The team draws what the day calls for.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 1fr", alignItems: "center", gap: 26 }}>
          <div>
            <div className="film-mono" style={{ color: "#D2D5C8", marginBottom: 18 }}>Pantry / pears</div>
            <div className="film-number" style={{ fontSize: 84, lineHeight: 1 }}>{remaining}<span style={{ fontSize: 34 }}> kg</span></div>
            <div style={{ marginTop: 16, color: "#D4D0C7", fontSize: 25 }}>from 8.0 kg on hand</div>
          </div>
          <div style={{ position: "relative", height: 2, background: "rgb(244 241 234 / 34%)" }}>
            <div style={{ position: "absolute", inset: "-4px auto -4px 0", width: `${line}%`, background: C.clay }} />
            <div style={{ position: "absolute", top: -8, left: `${line}%`, width: 18, height: 18, borderRadius: 20, background: C.clay, transform: "translateX(-50%)" }} />
          </div>
          <div>
            <div className="film-mono" style={{ color: "#D2D5C8", marginBottom: 18 }}>Pastry section / draw</div>
            <div className="film-number" style={{ fontSize: 84, lineHeight: 1 }}>{draw}<span style={{ fontSize: 34 }}> kg</span></div>
            <div style={{ marginTop: 16, color: "#D4D0C7", fontSize: 25 }}>recorded for preparation</div>
          </div>
        </div>
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const Preparation = ({ frame }: { frame: number }) => {
  const sheet = interpolate(frame, [54, 86], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const shift = interpolate(frame, [54, 86], [70, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
      <Photo name="preparation.png" frame={frame} duration={300} position="48% 48%" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgb(20 20 18 / 66%) 0%, rgb(20 20 18 / 8%) 67%, rgb(20 20 18 / 9%) 100%)" }} />
      <div style={{ position: "absolute", left: 120, top: 126, color: C.bone, width: 770 }}>
        <Kicker style={{ color: "#D2D5C8", marginBottom: 34 }}>03 / Preparation</Kicker>
        <Heading style={{ fontSize: 110 }}>Good work<br />starts here.</Heading>
        <p className="film-body" style={{ marginTop: 30, maxWidth: 690 }}>Ingredients are weighed, the tart batch is built, then baked for service.</p>
      </div>
      <div style={{ position: "absolute", right: 118, top: 116, bottom: 112, width: 606, padding: "55px 56px", background: C.bone, color: C.ink, clipPath: `inset(0 ${sheet}% 0 0)`, transform: `translateX(${shift}px)` }}>
        <Kicker style={{ color: C.moss, marginBottom: 45 }}>Recipe / pear & almond tart</Kicker>
        <div style={{ fontFamily: '"Fraunces Local", Georgia, serif', fontSize: 58, fontWeight: 350, lineHeight: 1.04, letterSpacing: "-0.04em", marginBottom: 38 }}>Pear &<br />almond</div>
        <div className="film-rule" />
        <div className="film-ledger-row"><span>Pears for filling</span><span className="film-number" style={{ fontSize: 47 }}>2.4 kg</span></div>
        <div className="film-ledger-row"><span>Batch yield</span><span className="film-number" style={{ fontSize: 47 }}>24 portions</span></div>
        <div className="film-ledger-row"><span>Menu cost</span><span style={{ color: C.moss, fontSize: 26 }}>Reviewed</span></div>
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 54, color: "#5E5E55", fontSize: 23 }}>One recipe, ready for the hands that make it.</div>
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const Service = ({ frame }: { frame: number }) => (
  <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
    <Photo name="tart.png" frame={frame} duration={180} position="50% 52%" reverse />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgb(20 20 18 / 82%) 0%, rgb(20 20 18 / 24%) 44%, rgb(20 20 18 / 0%) 100%)" }} />
    <div style={{ position: "absolute", left: 122, bottom: 172, color: C.bone }}>
      <Kicker style={{ color: "#D2D5C8", marginBottom: 25 }}>04 / Service</Kicker>
      <Heading style={{ fontSize: 102 }}>The craft reaches the pass.</Heading>
    </div>
    <Footer dark />
  </AbsoluteFill>
);

const StockAndWaste = ({ frame }: { frame: number }) => {
  const draw = interpolate(frame, [14, 46], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const recipe = interpolate(frame, [40, 112], [0, 2.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const returned = interpolate(frame, [102, 146], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const waste = interpolate(frame, [146, 188], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const bars = [recipe / 3, returned / 3, waste / 3];
  const labels = ["Used in recipe", "Returned", "Recorded waste"];
  const values = [recipe, returned, waste];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bone, color: C.ink }}>
      <div style={{ position: "absolute", left: 126, top: 120, right: 126 }}>
        <Kicker style={{ color: C.moss, marginBottom: 34 }}>05 / Close the stock loop</Kicker>
        <Heading style={{ fontSize: 104 }}>Every kilo accounted for.</Heading>
        <p className="film-body" style={{ margin: "22px 0 52px", color: "#454540" }}>A 3.0 kg draw becomes a clear record of use, return and waste.</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <div className="film-mono" style={{ color: C.moss }}>Drawn from pantry</div>
          <div className="film-number" style={{ fontSize: 83, lineHeight: 1 }}>{draw.toFixed(1)} kg</div>
        </div>
        <div style={{ width: "100%", height: 20, display: "flex", background: "#D7D2C8", overflow: "hidden" }}>
          {bars.map((bar, index) => (
            <div key={labels[index]} style={{ width: `${bar * 100}%`, height: 20, background: [C.moss, C.ash, C.clay][index], borderRight: index < 2 ? `2px solid ${C.bone}` : "none" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30, marginTop: 30 }}>
          {labels.map((label, index) => (
            <div key={label} style={{ borderTop: `1px solid ${C.ash}66`, paddingTop: 20 }}>
              <div className="film-mono" style={{ color: index === 2 ? "#8D422F" : C.moss, minHeight: 29 }}>{label}</div>
              <div className="film-number" style={{ fontSize: index === 0 ? 67 : 57, marginTop: 8 }}>{values[index].toFixed(1)} kg</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

const Receiving = ({ frame }: { frame: number }) => {
  const order = count(frame - 12, 78, 12);
  const received = count(frame - 42, 72, 10);
  const short = count(frame - 94, 54, 2);
  const rows = [
    ["Purchase order", `${order} kg`],
    ["Received", `${received} kg`],
    ["Short delivery", `${short} kg`],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
      <Photo name="receiving.png" frame={frame} duration={240} position="58% 50%" reverse />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgb(20 20 18 / 79%) 0%, rgb(20 20 18 / 47%) 45%, rgb(20 20 18 / 4%) 100%)" }} />
      <div style={{ position: "absolute", left: 128, top: 118, width: 845, color: C.bone }}>
        <Kicker style={{ color: "#D2D5C8", marginBottom: 34 }}>06 / Receiving</Kicker>
        <Heading style={{ fontSize: 104 }}>A delivery<br />has a story.</Heading>
        <p className="film-body" style={{ maxWidth: 735, margin: "23px 0 40px" }}>Check what arrived against what the kitchen ordered.</p>
        {rows.map(([label, value], index) => (
          <div key={label} className="film-ledger-row" style={{ color: index === 2 ? "#E6B29B" : C.bone, borderColor: "rgb(244 241 234 / 38%)", minHeight: 82 }}>
            <span>{label}</span><span className="film-number" style={{ fontSize: 55 }}>{value}</span>
          </div>
        ))}
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const Team = ({ frame }: { frame: number }) => {
  const rows = [
    { time: "06:00", role: "Chef", shift: "Forecast & prep" },
    { time: "07:00", role: "Pastry", shift: "Batch & bake" },
    { time: "11:00", role: "Service", shift: "Ready for lunch" },
  ];
  const noteWidth = interpolate(frame, [88, 142], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
      <Photo name="team.png" frame={frame} duration={240} position="50% 47%" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgb(20 20 18 / 80%) 0%, rgb(20 20 18 / 46%) 55%, rgb(20 20 18 / 9%) 100%)" }} />
      <div style={{ position: "absolute", left: 126, top: 120, width: 990, color: C.bone }}>
        <Kicker style={{ color: "#D2D5C8", marginBottom: 34 }}>07 / People & handover</Kicker>
        <Heading style={{ fontSize: 102 }}>The right hands,<br />at the right time.</Heading>
        <div style={{ marginTop: 46, width: 925, borderTop: "1px solid rgb(244 241 234 / 42%)" }}>
          {rows.map((row, index) => (
            <div key={row.role} style={{ display: "grid", gridTemplateColumns: "125px 240px 1fr", gap: 24, alignItems: "baseline", padding: "20px 0", borderBottom: "1px solid rgb(244 241 234 / 32%)", fontSize: 30, opacity: interpolate(frame, [18 + index * 15, 40 + index * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) }}>
              <span className="film-mono" style={{ color: "#D2D5C8", fontSize: 20 }}>{row.time}</span><span>{row.role}</span><span style={{ color: "#E0DCD2" }}>{row.shift}</span>
            </div>
          ))}
        </div>
        <div style={{ width: 925, marginTop: 34, padding: "24px 28px", borderLeft: `3px solid ${C.clay}`, background: "rgb(20 20 18 / 58%)", clipPath: `inset(0 ${100 - noteWidth}% 0 0)` }}>
          <div className="film-mono" style={{ color: "#D2D5C8", marginBottom: 10, fontSize: 16 }}>Handover note</div>
          <div style={{ fontSize: 29 }}>Pastry batch ready for service.</div>
        </div>
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const Sales = ({ frame }: { frame: number }) => {
  const expected = count(frame - 14, 58, 80);
  const actual = count(frame - 50, 56, 74);
  const prepared = count(frame - 93, 50, 24);
  const sold = count(frame - 128, 50, 21);
  const unsold = count(frame - 163, 44, 3);
  const row = (label: string, value: number, total: number, color: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "270px 1fr 90px", alignItems: "center", gap: 24, marginTop: 19 }}>
      <span style={{ fontSize: 27 }}>{label}</span>
      <div style={{ height: 8, background: "rgb(244 241 234 / 19%)" }}>
        <div style={{ height: 8, width: `${(value / total) * 100}%`, background: color }} />
      </div>
      <span className="film-number" style={{ fontSize: 40, textAlign: "right" }}>{value}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal, color: C.bone }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 90% 12%, #33352D 0%, #141412 52%)" }} />
      <div style={{ position: "absolute", left: 126, top: 106, right: 126 }}>
        <Kicker style={{ color: "#D2D5C8", marginBottom: 29 }}>08 / The day, in numbers</Kicker>
        <Heading style={{ fontSize: 108 }}>A service, understood.</Heading>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 96, marginTop: 46 }}>
          <div>
            <div className="film-mono" style={{ color: "#D2D5C8", marginBottom: 16 }}>Covers</div>
            {row("Expected", expected, 80, C.moss)}
            {row("Served", actual, 80, C.bone)}
          </div>
          <div>
            <div className="film-mono" style={{ color: "#D2D5C8", marginBottom: 16 }}>Pear tart portions</div>
            {row("Prepared", prepared, 24, C.moss)}
            {row("Sold", sold, 24, C.bone)}
            {row("Unsold", unsold, 24, C.clay)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 49, paddingTop: 23, borderTop: "1px solid rgb(244 241 234 / 28%)" }}>
          <div style={{ padding: "14px 22px", border: "1px solid rgb(244 241 234 / 50%)", fontSize: 23 }}>Sales file</div>
          <div style={{ width: 92, height: 1, background: C.clay }} />
          <div style={{ padding: "14px 22px", border: "1px solid rgb(244 241 234 / 50%)", fontSize: 23 }}>Daily review</div>
          <div style={{ marginLeft: 18, color: "#D4D0C7", fontSize: 22 }}>Today’s service informs tomorrow’s forecast.</div>
        </div>
      </div>
      <Footer dark />
    </AbsoluteFill>
  );
};

const Closing = ({ frame }: { frame: number }) => {
  const labels = [
    { text: "Purchasing", x: 310, y: 520 },
    { text: "Stock", x: 620, y: 442 },
    { text: "Recipes", x: 1290, y: 442 },
    { text: "Preparation", x: 1590, y: 540 },
    { text: "Waste", x: 1460, y: 805 },
    { text: "People", x: 960, y: 862 },
    { text: "Sales", x: 440, y: 805 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal, color: C.bone }}>
      <Photo name="tart.png" frame={frame} duration={240} position="center" opacity={0.2} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgb(20 20 18 / 65%) 0%, rgb(20 20 18 / 45%) 100%)" }} />
      <div style={{ position: "absolute", left: 126, top: 94 }}>
        <Kicker style={{ color: "#D2D5C8", marginBottom: 24 }}>From first plan to last plate</Kicker>
        <Heading style={{ fontSize: 88, lineHeight: 1.04 }}>The craft is yours.<br />See the whole kitchen.</Heading>
      </div>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
        {labels.map((label, index) => {
          const progress = interpolate(frame, [24 + index * 9, 70 + index * 9], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease});
          return <g key={label.text}>
            <path d={`M960 650 L${label.x} ${label.y}`} fill="none" stroke="rgb(244 241 234 / 36%)" strokeWidth="1.5" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - progress)} />
            <circle cx={label.x} cy={label.y} r={5 * progress} fill={C.clay} />
          </g>;
        })}
      </svg>
      {labels.map((label, index) => (
        <div key={label.text} style={{ position: "absolute", left: label.x - 160, top: label.y - 54, width: 320, textAlign: "center", color: C.bone, fontSize: 34, opacity: interpolate(frame, [24 + index * 9, 50 + index * 9], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) }}>{label.text}</div>
      ))}
      <div style={{ position: "absolute", left: 715, top: 570, width: 490, padding: "15px 10px 25px", background: C.charcoal, textAlign: "center" }}>
        <Img src={staticFile("monogram.svg")} style={{ width: 74, height: 74, objectFit: "contain", marginBottom: 16 }} />
        <div style={{ fontFamily: '\"Fraunces Local\", Georgia, serif', fontSize: 48, fontWeight: 350, letterSpacing: "-0.02em" }}>CulinAIre Kitchen</div>
      </div>
      <div style={{ position: "absolute", right: 126, bottom: 108, fontSize: 28, color: C.bone }}>Explore CulinAIre Kitchen&nbsp; ↗</div>
      <Footer dark />
    </AbsoluteFill>
  );
};

export const KitchenDay = () => {
  const [fontHandle] = useState(() => delayRender("Load local Passe Culinaire fonts"));
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
    <AbsoluteFill style={{ backgroundColor: C.charcoal, color: C.bone }}>
      <Layer start={0} end={180} render={(frame) => <Opening frame={frame} />} />
      <Layer start={180} end={420} render={(frame) => <Forecast frame={frame} />} />
      <Layer start={420} end={660} render={(frame) => <Pantry frame={frame} />} />
      <Layer start={660} end={960} render={(frame) => <Preparation frame={frame} />} />
      <Layer start={960} end={1140} render={(frame) => <Service frame={frame} />} />
      <Layer start={1140} end={1380} render={(frame) => <StockAndWaste frame={frame} />} />
      <Layer start={1380} end={1620} render={(frame) => <Receiving frame={frame} />} />
      <Layer start={1620} end={1860} render={(frame) => <Team frame={frame} />} />
      <Layer start={1860} end={2160} render={(frame) => <Sales frame={frame} />} />
      <Layer start={2160} end={KITCHEN_DAY_DURATION} render={(frame) => <Closing frame={frame} />} />
    </AbsoluteFill>
  );
};
