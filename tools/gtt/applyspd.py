# python3 applyspd.py "gravy:1.0298 ..." SCALE   -> writes eq + SCALE*offsets into 99u_gtt_data.js (offsets: the designed strength order)
import re,sys,os
off={'gravy':-.002,'comet':.004,'gobbles':.003,'spice':-.004,'willie':0,'butter':.004,'maple':-.002,'drum':-.004,'annie':.001,'stuff':-.003,'hank':.002,'duchess':.005}
eq=dict(x.split(':') for x in sys.argv[1].split());sc=float(sys.argv[2])
p=os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','99u_gtt_data.js');s=open(p).read()
for k in eq:
    s=re.sub(r"(\{id:'%s',[^}]*?spd:)[0-9.]+"%k, r"\g<1>%.4f"%(float(eq[k])+sc*off[k]), s)
open(p,'w').write(s)
