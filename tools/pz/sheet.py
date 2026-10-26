"""python3 tools/pz/sheet.py OUT.png cols scale frames... : contact sheet of PNG frames."""
import sys
from PIL import Image
out,cols,sc=sys.argv[1],int(sys.argv[2]),float(sys.argv[3]);fs=sys.argv[4:]
ims=[Image.open(f).convert('RGB') for f in fs];w,h=ims[0].size;w2,h2=int(w*sc),int(h*sc);rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(w2*cols,h2*rows),(0,0,0))
for i,im in enumerate(ims):S.paste(im.resize((w2,h2),Image.LANCZOS),((i%cols)*w2,(i//cols)*h2))
S.save(out)
