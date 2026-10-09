export interface PixelArt {
  map: string[];
  palette: Record<string, string>;
}

const white = "#f0f2f5";
const ink = "#0a0f1e";
const gold = "#e8b84f";
const accent = "#6366f1";

export const cat: PixelArt = {
  palette: { X: white, o: ink },
  map: [
    "..XX......XX..",
    "..XXX....XXX..",
    "..XXXXXXXXXX..",
    ".XXXXXXXXXXX..",
    ".XXXXXXXXXX...",
    ".XXXXXXXXXX...",
    "...XXXXXXXX...",
    "...XXXXXXX..X.",
    "...XXXXXX..XX.",
    "..XXXXXXXX.XX.",
    "..XXXXXXXXXXX.",
    ".XXXXXXXXXXXX.",
    "XXXXXXXXXXXX..",
  ],
};

export const catEyes: PixelArt = {
  palette: { o: ink },
  map: [
    "..............",
    "..............",
    "..............",
    "..............",
    "..o...........",
    "..............",
    "..............",
    "..............",
    "..............",
    "..............",
    "..............",
    "..............",
    "..............",
  ],
};

export const flag: PixelArt = {
  palette: { F: gold, P: accent },
  map: [
    ".FFFFFF",
    ".FFFFFF",
    ".FFFFF.",
    ".FFFF..",
    ".P.....",
    ".P.....",
    ".P.....",
    ".P.....",
    ".P.....",
    "PPP....",
  ],
};

export const hanger: PixelArt = {
  palette: { X: white, o: accent },
  map: [
    ".X...X.",
    ".X...X.",
    ".XXXXX.",
    ".XoXoX.",
    ".XXXXX.",
    "..XXX..",
    "..oXo..",
    "..X.X..",
  ],
};

export const walker: PixelArt = {
  palette: { X: white, G: gold },
  map: [
    ".XX.",
    ".XX.",
    "GGGG",
    "GGGG",
    "GGGG",
    ".GG.",
    ".G.G",
    ".G.G",
  ],
};

export const ranger: PixelArt = {
  palette: { X: white, P: accent },
  map: [
    "..XX..",
    "..XX..",
    "PPPPPP",
    "PPoPP.",
    "PPPP..",
    ".PP...",
    ".P.P..",
    ".P.P..",
  ],
};

export const jumper: PixelArt = {
  palette: { X: white, Y: gold, o: ink },
  map: [
    "..X..",
    ".XXX.",
    ".XoX.",
    "YYYYY",
    "YYYYY",
    ".YYY.",
    ".Y.Y.",
    ".Y.Y.",
  ],
};
