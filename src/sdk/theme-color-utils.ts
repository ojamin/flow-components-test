export type ComponentThemeRgbaColor = {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;
};

export function parseComponentThemeCssColor(value: string): ComponentThemeRgbaColor | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  return (
    parseHexColor(normalized) ??
    parseRgbColor(normalized) ??
    parseHslColor(normalized) ??
    parseOklchColor(normalized)
  );
}

export function formatComponentThemeCanvasColor(color: ComponentThemeRgbaColor): string {
  if (color.alpha < 1) {
    return `rgba(${color.red}, ${color.green}, ${color.blue}, ${formatAlpha(color.alpha)})`;
  }
  return `#${toHexPair(color.red)}${toHexPair(color.green)}${toHexPair(color.blue)}`;
}

function parseHexColor(value: string): ComponentThemeRgbaColor | undefined {
  const hex = value.startsWith("#") ? value.slice(1) : "";
  if (!hex) return undefined;

  if (/^[0-9a-f]{3,4}$/.test(hex)) {
    const [red = "0", green = "0", blue = "0", alpha = "f"] = hex.split("");
    return {
      red: Number.parseInt(`${red}${red}`, 16),
      green: Number.parseInt(`${green}${green}`, 16),
      blue: Number.parseInt(`${blue}${blue}`, 16),
      alpha: Number.parseInt(`${alpha}${alpha}`, 16) / 255,
    };
  }

  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) {
    return {
      red: Number.parseInt(hex.slice(0, 2), 16),
      green: Number.parseInt(hex.slice(2, 4), 16),
      blue: Number.parseInt(hex.slice(4, 6), 16),
      alpha: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  return undefined;
}

function parseRgbColor(value: string): ComponentThemeRgbaColor | undefined {
  const match = /^rgba?\((.+)\)$/.exec(value);
  if (!match?.[1]) return undefined;

  const parts = match[1].includes(",")
    ? match[1].split(",").map((part) => part.trim())
    : match[1].replace("/", " / ").split(/\s+/).filter(Boolean);
  const separatorIndex = parts.indexOf("/");
  const channelParts = separatorIndex === -1 ? parts.slice(0, 3) : parts.slice(0, separatorIndex);
  const alphaPart = separatorIndex === -1 ? parts[3] : parts[separatorIndex + 1];
  if (channelParts.length !== 3) return undefined;

  const channels = channelParts.map(parseRgbChannel);
  if (channels.some((channel) => channel === undefined)) return undefined;

  const alpha = alphaPart === undefined ? 1 : parseAlpha(alphaPart);
  if (alpha === undefined) return undefined;

  return {
    red: channels[0] as number,
    green: channels[1] as number,
    blue: channels[2] as number,
    alpha,
  };
}

function parseHslColor(value: string): ComponentThemeRgbaColor | undefined {
  const body = value.startsWith("hsl(") && value.endsWith(")") ? value.slice(4, -1) : value;
  const parts = tokenizeColorFunctionBody(body);
  const separatorIndex = parts.indexOf("/");
  const colorParts = separatorIndex === -1 ? parts.slice(0, 3) : parts.slice(0, separatorIndex);
  const alphaPart = separatorIndex === -1 ? parts[3] : parts[separatorIndex + 1];
  if (colorParts.length !== 3) return undefined;

  const hue = parseHue(colorParts[0] ?? "");
  const saturation = parsePercentage(colorParts[1] ?? "");
  const lightness = parsePercentage(colorParts[2] ?? "");
  const alpha = alphaPart === undefined ? 1 : parseAlpha(alphaPart);
  if (![hue, saturation, lightness, alpha].every((part) => Number.isFinite(part))) return undefined;

  return hslToRgb(hue, saturation, lightness, alpha as number);
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number,
): ComponentThemeRgbaColor {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = (((hue % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const [r1, g1, b1] =
    huePrime < 1
      ? [chroma, x, 0]
      : huePrime < 2
        ? [x, chroma, 0]
        : huePrime < 3
          ? [0, chroma, x]
          : huePrime < 4
            ? [0, x, chroma]
            : huePrime < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const match = lightness - chroma / 2;

  return {
    red: clampByte((r1 + match) * 255),
    green: clampByte((g1 + match) * 255),
    blue: clampByte((b1 + match) * 255),
    alpha: clamp01(alpha),
  };
}

function parseOklchColor(value: string): ComponentThemeRgbaColor | undefined {
  const match = /^oklch\((.+)\)$/.exec(value);
  if (!match?.[1]) return undefined;

  const parts = tokenizeColorFunctionBody(match[1]);
  const separatorIndex = parts.indexOf("/");
  const colorParts = separatorIndex === -1 ? parts.slice(0, 3) : parts.slice(0, separatorIndex);
  const alphaPart = separatorIndex === -1 ? parts[3] : parts[separatorIndex + 1];
  if (colorParts.length !== 3) return undefined;

  const lightness = parseLightness(colorParts[0] ?? "");
  const chroma = Number(colorParts[1]);
  const hue = parseHue(colorParts[2] ?? "");
  const alpha = alphaPart === undefined ? 1 : parseAlpha(alphaPart);
  if (
    ![lightness, chroma, hue, alpha].every((part) => part !== undefined && Number.isFinite(part))
  ) {
    return undefined;
  }

  return oklchToRgb(lightness as number, chroma, hue, alpha as number);
}

function oklchToRgb(
  lightness: number,
  chroma: number,
  hue: number,
  alpha: number,
): ComponentThemeRgbaColor {
  const hueRadians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(hueRadians);
  const b = chroma * Math.sin(hueRadians);

  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  return {
    red: linearRgbToByte(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    green: linearRgbToByte(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    blue: linearRgbToByte(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    alpha: clamp01(alpha),
  };
}

function linearRgbToByte(value: number): number {
  const clamped = clamp01(value);
  const gamma = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(clamp01(gamma) * 255);
}

function tokenizeColorFunctionBody(value: string): string[] {
  return value.replace(/,/g, " ").replace("/", " / ").split(/\s+/).filter(Boolean);
}

function parseHue(value: string): number {
  if (value.endsWith("deg")) return Number(value.slice(0, -3));
  if (value.endsWith("rad")) return (Number(value.slice(0, -3)) * 180) / Math.PI;
  if (value.endsWith("grad")) return Number(value.slice(0, -4)) * 0.9;
  if (value.endsWith("turn")) return Number(value.slice(0, -4)) * 360;
  return Number(value);
}

function parseLightness(value: string): number | undefined {
  if (value.endsWith("%")) return parsePercentage(value);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function parseRgbChannel(value: string): number | undefined {
  const parsed = value.endsWith("%") ? parsePercentage(value) * 255 : Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return clampByte(parsed);
}

function parseAlpha(value: string): number | undefined {
  const parsed = value.endsWith("%") ? parsePercentage(value) : Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return clamp01(parsed);
}

function parsePercentage(value: string): number {
  if (!value.endsWith("%")) return Number.NaN;
  return Number(value.slice(0, -1)) / 100;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampByte(value: number): number {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function toHexPair(value: number): string {
  return clampByte(value).toString(16).padStart(2, "0");
}

function formatAlpha(value: number): string {
  return Number(clamp01(value).toFixed(4)).toString();
}
