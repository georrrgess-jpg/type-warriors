import random,math
HLMAX=20000;HLE=1.075;HLGUESS=3;HLFACE=.75;HLTIE=(1/13)*.65
pH=lambda r:(1-HLTIE)*(14-r)/12
pL=lambda r:(1-HLTIE)*(r-2)/12
fcut=lambda r,m: max(1.02,m*HLFACE) if r>=11 else m
mH=lambda r: fcut(r,HLE/pH(r)) if pH(r)>0 else 0
mL=lambda r: fcut(r,HLE/pL(r)) if pL(r)>0 else 0
def rnx(r):
    if random.random()<HLTIE: return r
    k=2+int(random.random()*12)
    if k>=r:k+=1
    return k
def play(bet,strat):
    cur=2+int(random.random()*13);cmul=1;gn=0
    while True:
        # choose side with higher EV
        eh=pH(cur)*mH(cur);el=pL(cur)*mL(cur)
        up= eh>=el
        if gn>0 and not strat(cur,eh if up else el): return min(HLMAX,math.floor(bet*cmul))
        mult=mH(cur) if up else mL(cur)
        nx=rnx(cur);win= nx>cur if up else nx<cur
        if not win: return 0
        gn+=1;cmul=math.floor(cmul*mult*100)/100;cur=nx
        if bet*cmul>=HLMAX or gn>=HLGUESS: return min(HLMAX,math.floor(bet*cmul))
for name,strat in []:# [('always 1 guess',lambda c,e:False),('continue if EV>1',lambda c,e:e>1),('always 3',lambda c,e:True)]:
    for bet in [100,5000]:
        N=400000;tot=0
        for _ in range(N): tot+=play(bet,strat)
        print(name,bet,'RTP=%.4f'%(tot/N/bet))
print('---')
for bet in [500,1000,2000,3000,5000]:
    N=300000;tot=0
    for _ in range(N): tot+=play(bet,lambda c,e:e>1)
    print('smart',bet,'RTP=%.4f profit/round=%.0f'%(tot/N/bet,tot/N-bet))
