export const hrefFor = (locale: string, path: string) =>
  locale === "zh" ? (path === "/" ? "/zh" : `/zh${path}`) : path;

export const unitLinks = [
  ["heatPump", "heat-pump-systems"],
  ["packaged", "packaged-units"],
  ["miniSplits", "mini-splits"],
  ["acFurnace", "ac-furnace-systems"],
] as const;

export const partLinks = [
  ["capacitors", "capacitors"],
  ["contactors", "contactors-relays"],
  ["motors", "motors"],
  ["thermostats", "thermostats"],
  ["furnace", "furnace-parts"],
  ["refrigeration", "refrigeration-parts"],
  ["electrical", "electrical"],
  ["condensate", "condensate"],
  ["chemicals", "chemicals-leak-detection"],
  ["tools", "tools"],
  ["refrigerant", "refrigerant"],
] as const;
