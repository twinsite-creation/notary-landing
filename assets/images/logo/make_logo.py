import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

def inst(path, w):
    f = TTFont(path); return instantiateVariableFont(f, {"wght": w})

PF = inst("fonts/PlayfairDisplay[wght].ttf", 900)
FT = inst("fonts/Manrope.ttf", 600)

def text_path(font, text, size, x, y, tracking=0.0):
    """returns (d, width). tracking in em."""
    gs = font.getGlyphSet(); cmap = font.getBestCmap(); upm = font['head'].unitsPerEm
    s = size/upm; pen = SVGPathPen(gs); cx = 0.0
    for i,ch in enumerate(text):
        g = cmap.get(ord(ch))
        if g is None: continue
        tp = TransformPen(pen, (s,0,0,-s,x+cx,y))
        gs[g].draw(tp)
        cx += gs[g].width*s + (tracking*size if i < len(text)-1 else 0)
    return pen.getCommands(), cx

def bounds(font, text, size, tracking=0.0):
    gs=font.getGlyphSet(); cmap=font.getBestCmap(); upm=font['head'].unitsPerEm; s=size/upm
    bp=BoundsPen(gs); cx=0
    for i,ch in enumerate(text):
        g=cmap[ord(ch)]; gs[g].draw(TransformPen(bp,(s,0,0,-s,cx,0)))
        cx+=gs[g].width*s+(tracking*size if i<len(text)-1 else 0)
    return bp.bounds, cx

def wordmark(name, sub, ink, stone, rule, out):
    NS=76; SS=17; TR_N=-0.03; TR_S=0.38
    (nx0,ny0,nx1,ny1), nw = bounds(PF,name,NS,TR_N)
    (_,sy0,_,sy1), sw = bounds(FT,sub,SS,TR_S)
    W = max(nw, sw) + 8
    top = -ny0  # baseline y so that glyph top sits at 4
    base_n = 4 + (-ny0) if False else 4 - ny0  # ny0 negative-> above baseline? (y flipped)
    # after flip, glyph top is at baseline - ny1*... compute: rendered y = base - glyph_y
    base_n = 4 - ny0
    rule_y = base_n + ny1 + 16
    base_s = rule_y + 16 - sy0
    H = base_s + sy1 + 4
    dn,_ = text_path(PF,name,NS,(W-nw)/2,base_n,TR_N)
    ds,_ = text_path(FT,sub,SS,(W-sw)/2,base_s,TR_S)
    rw = W*0.62
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} {H:.1f}" role="img" aria-label="{name} — {sub.lower()}">
  <title>{name} — приватний нотаріус</title>
  <path fill="{ink}" d="{dn}"/>
  <rect x="{(W-rw)/2:.1f}" y="{rule_y:.1f}" width="{rw:.1f}" height="1.6" fill="{rule}"/>
  <path fill="{stone}" d="{ds}"/>
</svg>
'''
    open(out,"w").write(svg); print(out, round(W), round(H))

def favicon(letter, bg, fg, out, rounded=True):
    size=64; (x0,y0,x1,y1),w = bounds(PF,letter,46)
    gw=x1-x0; gh=y1-y0
    x=(size-gw)/2 - x0; base=(size+gh)/2 + y0 + gh - gh  # center vertically
    base=(size-gh)/2 - y0
    d,_=text_path(PF,letter,46,x,base)
    r = 12 if rounded else 0
    open(out,"w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="{r}" fill="{bg}"/>
  <path fill="{fg}" d="{d}"/>
</svg>
'''); print(out)

name = sys.argv[1] if len(sys.argv)>1 else "Коваль"
sub = sys.argv[2] if len(sys.argv)>2 else "НОТАРІУС · ХАРКІВ"
wordmark(name, sub, "#1a1a18", "#76756e", "#1a1a18", "logo/logo-wordmark.svg")
wordmark(name, sub, "#ffffff", "rgba(255,255,255,0.55)", "rgba(255,255,255,0.35)", "logo/logo-wordmark-white.svg")
favicon(name[0], "#1a1a18", "#f8f7f4", "logo/favicon.svg")
