import React, { useState, useMemo, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, Area, AreaChart, ReferenceLine, ComposedChart, Line } from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, Anchor, Ship, Clock, DollarSign, Package, Target, Zap, Layers, Calendar, Activity, MapPin, Truck, Box, AlertCircle, X, ChevronDown, HelpCircle, ArrowRight, Download } from "lucide-react";

// ═══ DATA ═══
const BASE={
  summary:{totalContainers:2671,completed:341,inProgress:2186,cancelled:39},
  stages:{gateOutEmpty_actual:1768,gateInPOL_actual:1778,loadPOL_actual:1653,dischargePOD_actual:800,gateOutPOD_actual:653,emptyReturn_actual:352,total:2670},
  stageIncurred:{gateOutEmpty:142,gateInPOL:118,loadPOL:87,dischargePOD:203,gateOutPOD:167,emptyReturn:94},
  stageDays:{origin_detention:{avg:4.8},origin_demurrage:{avg:0.87},dest_demurrage:{avg:2.6},dest_detention:{avg:5.51},ocean_transit:{avg:44.87},storage_origin:{avg:1.2},storage_dest:{avg:0.9},combined_origin:{avg:5.67},combined_dest:{avg:8.11}},
  missingMilestones:{gateOutEmpty:759,gateInPOL:749,loadPOL:874,dischargePOD:1727,gateOutPOD:1874,emptyReturn:2175},
  freeTimeHealth:{red:35,yellow:24,green:205,expired:3780},
  costMatrix:{detention_origin:{total:49169,withCost:261,avgFP:5.1},detention_destination:{total:1955,withCost:8,avgFP:6.0},demurrage_origin:{total:22353,withCost:52,avgFP:3.1},demurrage_destination:{total:5144,withCost:12,avgFP:3.0},storage_origin:{total:3075,withCost:23,avgFP:3.1},storage_destination:{total:1295,withCost:9,avgFP:3.0},dnd_origin:{total:99565,withCost:212,avgFP:9.9},dnd_destination:{total:1814,withCost:4,avgFP:12.0},demurrageStorage_origin:{total:8420,withCost:31,avgFP:4.2},demurrageStorage_destination:{total:2190,withCost:7,avgFP:4.0},detentionDemurrage_origin:{total:34610,withCost:87,avgFP:7.8},detentionDemurrage_destination:{total:3280,withCost:11,avgFP:8.5},detentionDemurrageStorage_origin:{total:18740,withCost:44,avgFP:11.2},detentionDemurrageStorage_destination:{total:890,withCost:3,avgFP:13.0}},

  carriers:{OOLU:{containers:288,avgODet:9.86,avgODem:0.97,avgDDem:2.78,avgDDet:5.81,avgOSto:2.8,avgDSto:1.9,avgOComb:10.4,avgDComb:7.8,missingMilestones:813},ONEY:{containers:905,avgODet:2.37,avgODem:0.87,avgDDem:2.66,avgDDet:5.48,avgOSto:1.2,avgDSto:1.4,avgOComb:3.6,avgDComb:6.5,missingMilestones:3106},MSCU:{containers:227,avgODet:5.98,avgODem:1.01,avgDDem:2.55,avgDDet:5.59,avgOSto:2.1,avgDSto:1.6,avgOComb:6.2,avgDComb:7.1,missingMilestones:642},MAEU:{containers:229,avgODet:7.77,avgODem:1.0,avgDDem:3.22,avgDDet:5.86,avgOSto:2.6,avgDSto:2.1,avgOComb:10.8,avgDComb:8.4,missingMilestones:744},HLCU:{containers:427,avgODet:5.62,avgODem:0.74,avgDDem:2.39,avgDDet:5.23,avgOSto:1.9,avgDSto:1.5,avgOComb:5.9,avgDComb:6.8,missingMilestones:1301},EGLV:{containers:139,avgODet:2.09,avgODem:0.43,avgDDem:1.38,avgDDet:4.82,avgOSto:0.8,avgDSto:0.9,avgOComb:2.8,avgDComb:5.6,missingMilestones:375},COSU:{containers:141,avgODet:0.73,avgODem:0.82,avgDDem:2.82,avgDDet:5.74,avgOSto:0.5,avgDSto:1.2,avgOComb:2.1,avgDComb:7.4,missingMilestones:451},CMDU:{containers:279,avgODet:6.35,avgODem:1.0,avgDDem:2.79,avgDDet:5.81,avgOSto:2.2,avgDSto:1.7,avgOComb:6.8,avgDComb:7.6,missingMilestones:815}},
  topLanes:[
    {lane:"DEHAM-CNSHA",carriers:["MAEU","OOLU","ONEY"],containers:34,avgODet:2.52,avgODem:0.94,avgOSto:1.2,avgOComb:3.8,avgDDem:3.12,avgDDet:5.46,avgDSto:0.9,avgDComb:7.2,freightPct:72,surchargePct:28},
    {lane:"DEHAM-CNYTN",carriers:["HLCU","CMDU"],containers:28,avgODet:7.85,avgODem:0.71,avgOSto:2.1,avgOComb:8.9,avgDDem:2.07,avgDDet:5.27,avgDSto:1.4,avgDComb:6.8,freightPct:65,surchargePct:35},
    {lane:"CNSHA-SGSIN",carriers:["OOLU","MSCU","COSU"],containers:26,avgODet:3.91,avgODem:0.31,avgOSto:0.8,avgOComb:4.4,avgDDem:0.84,avgDDet:4.34,avgDSto:0.6,avgDComb:4.9,freightPct:80,surchargePct:20},
    {lane:"DEBRV-CNSHA",carriers:["MAEU","HLCU"],containers:24,avgODet:5.5,avgODem:0.83,avgOSto:1.6,avgOComb:6.5,avgDDem:3.06,avgDDet:6.04,avgDSto:1.1,avgDComb:8.2,freightPct:68,surchargePct:32},
    {lane:"CNSHA-NLRTM",carriers:["OOLU","ONEY","EGLV"],containers:23,avgODet:12.33,avgODem:0.77,avgOSto:2.8,avgOComb:12.1,avgDDem:1.96,avgDDet:4.89,avgDSto:1.7,avgDComb:6.1,freightPct:55,surchargePct:45},
    {lane:"DEHAM-CNTAO",carriers:["HLCU","MSCU"],containers:22,avgODet:8.59,avgODem:0.49,avgOSto:2.3,avgOComb:9.2,avgDDem:1.47,avgDDet:5.46,avgDSto:1.2,avgDComb:6.5,freightPct:62,surchargePct:38},
    {lane:"DEBRV-USCHS",carriers:["MAEU","CMDU"],containers:21,avgODet:4.41,avgODem:1.37,avgOSto:1.4,avgOComb:5.9,avgDDem:3.73,avgDDet:6.59,avgDSto:1.8,avgDComb:9.4,freightPct:60,surchargePct:40},
    {lane:"DEBRV-TWKEL",carriers:["HLCU","OOLU"],containers:19,avgODet:11.64,avgODem:0.8,avgOSto:2.6,avgOComb:11.8,avgDDem:2.81,avgDDet:5.67,avgDSto:1.5,avgDComb:7.1,freightPct:58,surchargePct:42},
    {lane:"DEHAM-THLCH",carriers:["MSCU","ONEY"],containers:19,avgODet:7.9,avgODem:1.52,avgOSto:1.9,avgOComb:9.6,avgDDem:4.09,avgDDet:6.87,avgDSto:2.1,avgDComb:9.8,freightPct:56,surchargePct:44},
    {lane:"DEHAM-JPNGO",carriers:["HLCU","MAEU"],containers:18,avgODet:8.95,avgODem:0.81,avgOSto:2.2,avgOComb:9.8,avgDDem:2.37,avgDDet:4.58,avgDSto:1.3,avgDComb:6.2,freightPct:70,surchargePct:30}],
  monthlyCost:[
    {month:"Jan 26",detention:8420,demurrage:4310,storage:1850,combined:18640,total:33220,oDetention:7900,oDemurrage:4100,oStorage:1600,oCombined:17200,dDetention:520,dDemurrage:210,dStorage:250,dCombined:1440,containers:410},
    {month:"Feb 26",detention:11600,demurrage:5950,storage:2550,combined:25700,total:45800,oDetention:10900,oDemurrage:5660,oStorage:2210,oCombined:24160,dDetention:700,dDemurrage:290,dStorage:340,dCombined:1540,containers:490},
    {month:"Mar 26",detention:14800,demurrage:7590,storage:3250,combined:32780,total:58420,oDetention:13900,oDemurrage:7200,oStorage:2820,oCombined:30820,dDetention:900,dDemurrage:390,dStorage:430,dCombined:1960,containers:565},
    {month:"Apr 26",detention:19840,demurrage:11250,storage:2480,combined:42180,total:75750,oDetention:18600,oDemurrage:10600,oStorage:2100,oCombined:39800,dDetention:1240,dDemurrage:650,dStorage:380,dCombined:2380,containers:648}],
  grandTotal:193375,totalOriginCost:181040,totalDestCost:12335,
};
const CDATA={topRisk:[
  {cn:"HLCU_021020",ca:"HLCU",po:"DEWVN",pd:"CNTAO",oDet:11.1,risk:80,cat:"Detention",cost:726,cost3d:1476,cost7d:2976,stage:"Gate In POL"},
  {cn:"COSU_120720",ca:"COSU",po:"DEBRV",pd:"PHMNN",oDet:51.2,risk:80,cat:"Bundled D&D",cost:2737,cost3d:4237,cost7d:6737,stage:"Load POL"},
  {cn:"OOLU_131020",ca:"OOLU",po:"CNSHA",pd:"BEZEE",oDet:9.9,risk:77,cat:"Demurrage",cost:687,cost3d:1707,cost7d:3387,stage:"Gate In POL"},
  {cn:"ONEY_150920",ca:"ONEY",po:"DEHAM",pd:"ILASH",oDet:99.0,risk:77,cat:"Detention",cost:5117,cost3d:6887,cost7d:10247,stage:"Ocean Transit"},
  {cn:"HLCU_221020",ca:"HLCU",po:"DEBRV",pd:"USORF",oDet:10.0,risk:77,cat:"Detention",cost:631,cost3d:1381,cost7d:2631,stage:"Gate In POL"},
  {cn:"MAEU_170620",ca:"MAEU",po:"DEBRV",pd:"USEWR",oDet:83.8,risk:76,cat:"Bundled D&D",cost:4374,cost3d:5994,cost7d:9234,stage:"Ocean Transit"},
  {cn:"MAEU_150620",ca:"MAEU",po:"DEBRV",pd:"DZALG",oDet:79.7,risk:75,cat:"Bundled D&D",cost:4187,cost3d:5807,cost7d:8867,stage:"Discharge POD"},
  {cn:"CMDU_191020",ca:"CMDU",po:"DEWVN",pd:"DZORN",oDet:10.5,risk:75,cat:"Storage",cost:709,cost3d:1729,cost7d:3389,stage:"Gate In POL"},
  {cn:"MSCU_080620",ca:"MSCU",po:"DEHAM",pd:"BHBAH",oDet:46.8,risk:74,cat:"Detention",cost:2438,cost3d:3788,cost7d:6038,stage:"Ocean Transit"},
  {cn:"ONEY_021120",ca:"ONEY",po:"DEBRV",pd:"CNJMN",oDet:9.8,risk:74,cat:"Demurrage",cost:624,cost3d:1374,cost7d:2624,stage:"Gate Out POD"}
]};
const COST_CATS=[{name:"Detention",oKey:"detention_origin",dKey:"detention_destination",color:"#D97706"},{name:"Demurrage",oKey:"demurrage_origin",dKey:"demurrage_destination",color:"#7C3AED"},{name:"Storage",oKey:"storage_origin",dKey:"storage_destination",color:"#059669"},{name:"Bundled D&D",oKey:"dnd_origin",dKey:"dnd_destination",color:"#EF4444"}];
const PORT_NAMES={DEHAM:"Hamburg",DEBRV:"Bremerhaven",DEWVN:"Wilhelmshaven",CNSHA:"Shanghai",CNTAO:"Qingdao",CNYTN:"Yantian",CNJMN:"Jiujiang",NLRTM:"Rotterdam",BEZEE:"Zeebrugge",SGSIN:"Singapore",USORF:"Norfolk",USEWR:"Newark",USCHS:"Charleston",THLCH:"Laem Chabang",TWKEL:"Keelung",JPNGO:"Nagoya",ILASH:"Ashdod",DZALG:"Algiers",DZORN:"Oran",BHBAH:"Bahrain",PHMNN:"Gen. Santos"};
const portLabel=code=>PORT_NAMES[code]?PORT_NAMES[code]+" ("+code+")":code;
const portShort=code=>PORT_NAMES[code]||code;

// ═══ THEME ═══
const T={bg:"#F8F9FC",page:"#ffffff",card:"#ffffff",card2:"#F8F9FC",border:"#E8ECF1",text:"#1A1D26",sub:"#5E6578",dim:"#98A1B3",amber:"#C27815",amberBg:"#FFF8EE",purple:"#6D5ACE",purpleBg:"#F5F3FF",green:"#0D9668",greenBg:"#EEFBF4",red:"#DC3545",redBg:"#FFF0F1",blue:"#2563EB",blueL:"#4F8FEE",blueBg:"#EEF4FF",cyan:"#0E7F96",actionBg:"#F5F8FF",warmBg:"#FFFCF0",intBg:"#F0F5FF"};
const fmt=n=>{if(n<0)return"-"+fmt(Math.abs(n));return n>=1e6?"$"+(n/1e6).toFixed(2)+"M":n>=1e3?"$"+(n/1e3).toFixed(1)+"K":"$"+Math.round(n);};
const momPct=(c,p)=>{const v=p>0?Math.round((c-p)/p*100):0;return{v,color:v>0?T.red:v<0?T.green:T.sub,arrow:v>0?"↑":v<0?"↓":"→"};};
const catColor=c=>c==="Detention"?T.amber:c==="Demurrage"?T.purple:c==="Storage"?T.green:T.red;

// ═══ SHARED UI (Upgraded) ═══
const SolidBadge=({children,color=T.red})=><span style={{background:color,color:"#fff",padding:"3px 11px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 1px 3px "+color+"30"}}>{children}</span>;
function dlCSV(filename,headers,rows){const esc=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';const csv=[headers.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\n");const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download=filename+".csv";a.click();}
const DlBtn=({onClick})=><button onClick={onClick} title="Download CSV" style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:8,border:"1px solid "+T.border,background:T.card2,color:T.sub,fontSize:10,fontWeight:600,cursor:"pointer"}}><Download size={11}/>Export</button>;
const Badge=({children,color=T.blue})=><span style={{background:color+"12",color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
const Pill=({active,onClick,children,color=T.blue})=><button onClick={onClick} style={{padding:"6px 16px",borderRadius:20,border:"1px solid "+(active?color+"50":T.border),background:active?color+"10":"transparent",color:active?color:T.sub,fontSize:11,fontWeight:active?600:400,cursor:"pointer",transition:"all .15s ease"}}>{children}</button>;
const Card=React.forwardRef(function Card({children,style,onClick,urgency,id},ref){const bg=urgency==="critical"?"#FFF0F1":urgency==="warn"?"#FFF8EE":urgency==="action"?T.actionBg:T.card;const bTop=urgency==="critical"?T.red:urgency==="warn"?T.amber:null;return <div ref={ref} id={id} onClick={onClick} style={{background:bg,border:bTop?"none":"1px solid "+T.border+"80",borderRadius:14,padding:20,cursor:onClick?"pointer":"default",boxShadow:bTop?"0 2px 12px rgba(0,0,0,.06)":"0 1px 4px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.02)",borderTop:bTop?"3px solid "+bTop:undefined,transition:"all .2s ease",...style}}>{children}</div>;});
function HoverTip({text}){const[s,setS]=useState(false);return <span onMouseEnter={()=>setS(true)} onMouseLeave={()=>setS(false)} style={{position:"relative",cursor:"help",display:"inline-flex",marginLeft:3}}><HelpCircle size={11} color={T.dim}/>{s&&<div style={{position:"absolute",bottom:20,left:-100,width:280,background:T.text,color:"#fff",padding:"8px 12px",borderRadius:8,fontSize:11,lineHeight:1.5,zIndex:99,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>{text}<div style={{position:"absolute",bottom:-4,left:104,width:8,height:8,background:T.text,transform:"rotate(45deg)"}}/></div>}</span>;}
const SH=({title,sub})=><div style={{marginBottom:18}}><div style={{color:T.text,fontSize:15,fontWeight:700}}>{title}</div>{sub&&<div style={{color:T.sub,fontSize:11,marginTop:2}}>{sub}</div>}</div>;
const Insight=({text})=><div style={{background:T.blueBg,borderRadius:10,padding:"12px 16px",marginTop:10,borderLeft:"3px solid "+T.blue+"90"}}><div style={{fontSize:12,fontWeight:500,color:"#1E40AF",lineHeight:1.5}}>{text}</div></div>;
const NavLink=({text,onClick})=><div onClick={onClick} style={{fontSize:12,color:T.blue,fontWeight:500,cursor:"pointer",marginTop:10,display:"flex",alignItems:"center",gap:5,padding:"6px 0",opacity:.85}}>{text}<ArrowRight size={11}/></div>;
function ChartBox({title,sub,children,h=260,insight,nav}){return <Card style={{padding:20}}>{title&&<div style={{color:T.text,fontSize:13,fontWeight:600}}>{title}</div>}{sub&&<div style={{color:T.sub,fontSize:11,marginBottom:8}}>{sub}</div>}<div style={{height:h}}>{children}</div>{insight&&<Insight text={insight}/>}{nav}</Card>;}
const CTip=({active,payload,label})=>{if(!active||!payload)return null;return <div style={{background:"#fff",border:"none",borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.sub}}><div style={{width:6,height:6,borderRadius:"50%",background:p.color}}/>{p.name}: <span style={{fontWeight:700,color:T.text}}>{typeof p.value==="number"?p.value.toLocaleString():p.value}</span></div>)}</div>;};

// ═══ NAV (with notification dots) ═══
const NAV=[{id:"home",label:"Command Center",icon:Activity,dot:true},{id:"costs",label:"Cost Reduction",icon:DollarSign},{id:"carriers",label:"Carrier Intel",icon:Ship},{id:"optimizer",label:"Cost Optimizer",icon:Target,dot:true},{id:"history",label:"Structural Leakage",icon:Calendar},{id:"surcharges",label:"Negotiation Center",icon:Layers}];

// ═══ PERSONAS ═══
const PERSONAS={
  admin:{label:"Admin",icon:"👤",desc:"Access to all pages and features",tabs:["home","costs","carriers","optimizer","history","surcharges"],color:"#2563EB"},
  transport:{label:"Transport Manager",icon:"🚢",desc:"Command Center, Cost Optimizer & Carrier Intel",tabs:["home","carriers","optimizer"],color:"#C27815"},
  procurement:{label:"Procurement Manager",icon:"💼",desc:"Cost Reduction, Structural Leakage & Negotiation Center",tabs:["costs","history","surcharges"],color:"#6D5ACE"},
  logistics:{label:"Head of Logistics",icon:"📊",desc:"Command Center, Cost Reduction & Structural Leakage",tabs:["home","costs","history"],color:"#0D9668"},
};

function TopNav({page,setPage,allowedTabs,persona,setPersona}){
  const[showP,setShowP]=useState(false);
  const pc=PERSONAS[persona];
  return <div style={{background:"#fff",borderBottom:"1px solid "+T.border,padding:"12px 28px",display:"flex",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)",position:"relative",zIndex:20}}>
    {showP&&<div onClick={()=>setShowP(false)} style={{position:"fixed",inset:0,zIndex:18}}/>}
    <div style={{display:"flex",alignItems:"center",gap:16,width:"100%"}}>
      <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1A1D26,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Anchor size={18} color="#fff"/></div>
      <div style={{flexShrink:0}}>
        <div style={{fontWeight:700,fontSize:18,color:T.text,letterSpacing:"-0.3px"}}>D&D Control Tower</div>
        <div style={{fontSize:10,color:T.dim,fontWeight:400}}>Container D&D analytics</div>
      </div>
      <div style={{width:1,height:28,background:T.border,margin:"0 10px",flexShrink:0}}/>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {NAV.filter(n=>allowedTabs.includes(n.id)).map(n=>{const I=n.icon;const a=page===n.id;return <button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,border:"none",background:a?"#1A1D26":"transparent",color:a?"#fff":T.sub,fontSize:11,fontWeight:a?600:500,cursor:"pointer",whiteSpace:"nowrap",position:"relative",transition:"all .15s ease"}}><I size={13}/>{n.label}{n.dot&&!a&&<div style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:T.red,boxShadow:"0 0 0 2px #fff"}}/>}</button>;})}
      </div>
      <div style={{marginLeft:"auto",position:"relative",zIndex:19}}>
        <button onClick={()=>setShowP(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid "+pc.color+"40",background:pc.color+"10",color:pc.color,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
          <span>{pc.icon}</span><span>{pc.label}</span><ChevronDown size={11} style={{transition:"transform .15s",transform:showP?"rotate(180deg)":"none"}}/>
        </button>
        {showP&&<div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#fff",border:"1px solid "+T.border,borderRadius:10,padding:6,zIndex:19,minWidth:240,boxShadow:"0 4px 20px rgba(0,0,0,.10)"}}>
          {Object.entries(PERSONAS).map(([id,p])=><button key={id} onClick={()=>{setPersona(id);setShowP(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",borderRadius:7,border:"none",background:persona===id?p.color+"12":"transparent",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:16,flexShrink:0}}>{p.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:persona===id?700:500,color:persona===id?p.color:T.text}}>{p.label}</div>
              <div style={{fontSize:9,color:T.dim,marginTop:1}}>{p.desc}</div>
            </div>
            {persona===id&&<div style={{width:7,height:7,borderRadius:"50%",background:p.color,flexShrink:0}}/>}
          </button>)}
        </div>}
      </div>
    </div>
  </div>;
}

// ═══ MODULE 1: COMMAND CENTER ═══
function HomePage({setPage,allowedTabs}){
  const can=id=>allowedTabs.includes(id);
  const fthRef=useRef(null);const actionRef=useRef(null);
  const cm=BASE.costMatrix;const fth=BASE.freeTimeHealth;const sd=BASE.stageDays;const st=BASE.stages;
  const _mc=BASE.monthlyCost;const _prev=_mc[_mc.length-2];const _curr=_mc[_mc.length-1];
  const mom=momPct(_curr.total,_prev.total);
  const storagePct=Math.round((cm.storage_origin.total+cm.storage_destination.total)/BASE.grandTotal*100);
  const[breakdownToggle,setBreakdownToggle]=useState("category");
  const originPct=BASE.grandTotal>0?Math.round(BASE.totalOriginCost/BASE.grandTotal*100):0;
  const topBurn=CDATA.topRisk.slice(0,5).reduce((s,c)=>s+Math.round((c.cost3d-c.cost)/3),0);

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <div style={{background:T.amberBg,border:"1px solid "+T.amber+"50",borderRadius:8,padding:"8px 14px",marginBottom:14,borderLeft:"3px solid "+T.amber,display:"flex",alignItems:"center",gap:8}}>
      <AlertTriangle size={13} color={T.amber}/>
      <span style={{fontSize:11,fontWeight:600,color:T.amber}}>Estimates only — </span>
      <span style={{fontSize:11,color:T.sub}}>All cost figures are based on dwell rates, not carrier billing data. Reconcile with actual invoices for financial reporting.</span>
    </div>
    {/* ── 1. TODAY'S RISK SNAPSHOT ── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1.5fr",gap:12,marginBottom:14}}>
      {/* Containers Requiring Action */}
      <Card style={{padding:"16px 14px",borderTop:"3px solid "+T.red,background:"#FFF5F5",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:9,fontWeight:600,color:T.red,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Containers Requiring Action</div>
        <div style={{fontSize:26,fontWeight:800,color:fth.expired>0?T.red:T.green}}>{fth.expired.toLocaleString()}</div>
        <div style={{fontSize:9,color:T.sub,marginTop:2}}>Free period expired</div>
        <div onClick={()=>actionRef.current?.scrollIntoView({behavior:"smooth"})} style={{fontSize:9,color:T.red,fontWeight:700,cursor:"pointer",marginTop:6,textDecoration:"underline"}}>See priority queue ↓</div>
      </Card>
      {/* Daily Burn */}
      <Card style={{padding:"16px 14px",borderTop:"3px solid "+(topBurn>0?T.red:T.green),display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Daily Burn</div>
        <div style={{fontSize:26,fontWeight:800,color:topBurn>0?T.red:T.green}}>{topBurn>0?fmt(topBurn):"$0"}</div>
        <div style={{fontSize:9,color:T.sub,marginTop:2}}>{topBurn>0?"per day if no action":"No active daily burn"}</div>
      </Card>
      {/* Expiring Next 48h */}
      <Card style={{padding:"16px 14px",borderTop:"3px solid "+T.amber,background:T.amberBg,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:9,fontWeight:600,color:T.amber,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Expiring Next 48h</div>
        <div style={{fontSize:26,fontWeight:800,color:fth.red>0?T.amber:T.green}}>{fth.red}</div>
        <div style={{fontSize:9,color:T.sub,marginTop:2}}>Moving to paid tier imminently</div>
        {can("optimizer")&&<div onClick={()=>setPage("optimizer")} style={{fontSize:9,color:T.amber,fontWeight:700,cursor:"pointer",marginTop:6,textDecoration:"underline"}}>Prioritise in Optimizer →</div>}
      </Card>
      {/* Total Exposure */}
      <Card style={{padding:"16px 20px",borderLeft:"4px solid #1A1D26"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>Total D&D Exposure (est.)</div>
          <div style={{fontSize:8,color:T.dim,fontStyle:"italic"}}>{BASE.monthlyCost[BASE.monthlyCost.length-1].month}</div>
        </div>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontSize:28,fontWeight:800,color:T.text,letterSpacing:"-0.5px"}}>{fmt(BASE.grandTotal)}</span>
          <span style={{fontSize:11,fontWeight:600,color:mom.color}}>{mom.arrow} {Math.abs(mom.v)}% MoM</span>
        </div>
        <div style={{display:"flex",gap:12,marginTop:8}}>
          <div style={{borderLeft:"3px solid "+T.amber,paddingLeft:8}}><div style={{fontSize:12,fontWeight:700}}>{fmt(BASE.totalOriginCost)}</div><div style={{fontSize:9,color:T.sub}}>Origin · {originPct}%</div></div>
          <div style={{borderLeft:"3px solid "+T.purple,paddingLeft:8}}><div style={{fontSize:12,fontWeight:700}}>{fmt(BASE.totalDestCost)}</div><div style={{fontSize:9,color:T.sub}}>Destination · {100-originPct}%</div></div>
        </div>
      </Card>
    </div>

    {/* ── 2. INSIGHTS ── */}
    {(()=>{
      const totalBurn=CDATA.topRisk.reduce((s,c)=>s+Math.max(0,Math.round((c.cost3d-c.cost)/3)),0);
      const top20Burn=CDATA.topRisk.slice(0,Math.min(20,CDATA.topRisk.length)).reduce((s,c)=>s+Math.max(0,Math.round((c.cost3d-c.cost)/3)),0);
      const top20Pct=totalBurn>0?Math.round(top20Burn/totalBurn*100):0;
      const destPct=BASE.grandTotal>0?Math.round(BASE.totalDestCost/BASE.grandTotal*100):0;
      const wc=Object.entries(BASE.carriers).reduce((a,[n,d])=>d.avgODet>a[1].avgODet?[n,d]:a,["",{avgODet:0,containers:0}]);
      return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {icon:"🔥",title:"Top "+Math.min(20,CDATA.topRisk.length)+" containers = "+top20Pct+"% of daily burn",sub:"Focus effort here for maximum cost reduction",color:T.red,nav:"optimizer"},
          {icon:"🚢",title:"Destination charges = "+destPct+"% of total exposure",sub:"Port + depot delays driving "+fmt(BASE.totalDestCost)+" — check arrivals",color:T.purple,nav:"costs"},
          {icon:"⚠",title:wc[0]+": highest risk carrier ("+wc[1].avgODet.toFixed(1)+"d avg origin dwell)",sub:"Consider escalation or rate renegotiation at next QBR",color:T.amber,nav:"carriers"},
        ].map((ins,i)=><Card key={i} onClick={can(ins.nav)?()=>setPage(ins.nav):undefined} style={{padding:"12px 14px",borderLeft:"3px solid "+ins.color,cursor:can(ins.nav)?"pointer":"default"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <span style={{fontSize:16,lineHeight:1}}>{ins.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,lineHeight:1.3,marginBottom:3}}>{ins.title}</div>
              <div style={{fontSize:10,color:T.sub,lineHeight:1.4}}>{ins.sub}</div>
            </div>
            {can(ins.nav)&&<span style={{fontSize:9,color:T.blueL,fontWeight:600,whiteSpace:"nowrap"}}>View →</span>}
          </div>
        </Card>)}
      </div>;
    })()}

    {/* ── 3. TODAY'S PRIORITY QUEUE — HERO ── */}
    <Card ref={actionRef} id="actionTable" urgency="action" style={{borderLeft:"4px solid "+T.blue,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><span style={{fontSize:16,fontWeight:700}}>Today's Priority Queue</span><span style={{fontSize:11,color:T.sub,marginLeft:8}}>Top 10 — sorted by daily burn</span></div>
        <DlBtn onClick={()=>dlCSV("priority_queue",["Container","Carrier","Route","Category","$/Day","Exposure","Risk","Rec.Action"],[...CDATA.topRisk].sort((a,b)=>Math.round((b.cost3d-b.cost)/3)-Math.round((a.cost3d-a.cost)/3)).slice(0,10).map(c=>{const daily=Math.max(0,Math.round((c.cost3d-c.cost)/3));const act=c.stage==="Gate Out POD"?"Return Empty":c.stage==="Discharge POD"?"Arrange Port Pickup":c.stage==="Ocean Transit"?"Monitor Vessel":c.stage==="Load POL"?"Chase Loading":"Expedite Gate-In";return[c.cn,c.ca,c.po+"→"+c.pd,c.cat,daily,c.cost,c.risk,act];}))}/>
      </div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
        <thead><tr style={{color:T.sub,fontSize:9,textAlign:"left",background:T.card2}}>
          {["Container","Carrier","Route","Category","$/Day","Exposure","Risk","Rec. Action"].map(h=><th key={h} style={{padding:"5px 6px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["$/Day","Exposure","Risk"].includes(h)?"right":"left"}}>{h}</th>)}
        </tr></thead>
        <tbody>{[...CDATA.topRisk].sort((a,b)=>Math.round((b.cost3d-b.cost)/3)-Math.round((a.cost3d-a.cost)/3)).slice(0,10).map((c,i)=>{
          const daily=Math.max(0,Math.round((c.cost3d-c.cost)/3));
          const act=c.stage==="Gate Out POD"?"Return Empty":c.stage==="Discharge POD"?"Arrange Port Pickup":c.stage==="Ocean Transit"?"Monitor Vessel":c.stage==="Load POL"?"Chase Loading":"Expedite Gate-In";
          const actCol=act==="Return Empty"||act==="Arrange Port Pickup"?T.red:act==="Expedite Gate-In"?T.amber:T.blue;
          return <tr key={i} style={{background:i===0?T.blueBg:T.card2}}>
            <td style={{padding:"5px 6px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontSize:10,fontWeight:600,borderLeft:c.risk>=75?"3px solid "+T.red:"3px solid transparent"}}>{c.cn}</td>
            <td style={{padding:"5px 6px",color:T.sub}}>{c.ca}</td>
            <td style={{padding:"5px 6px"}} title={c.po+"→"+c.pd}>{portShort(c.po)+"→"+portShort(c.pd)}</td>
            <td style={{padding:"5px 6px"}}><Badge color={catColor(c.cat)}>{c.cat}</Badge></td>
            <td style={{padding:"5px 6px",fontWeight:700,color:T.red,textAlign:"right"}}>{daily>0?"$"+daily+"/d":"—"}</td>
            <td style={{padding:"5px 6px",fontWeight:600,textAlign:"right"}}>{fmt(c.cost)}</td>
            <td style={{padding:"5px 6px",textAlign:"right"}}><SolidBadge color={c.risk>=75?T.red:T.amber}>{c.risk}</SolidBadge></td>
            <td style={{padding:"5px 6px",borderRadius:"0 6px 6px 0",fontWeight:700,color:actCol,fontSize:10}}>{act}</td>
          </tr>;
        })}</tbody>
      </table>
      {can("optimizer")&&<NavLink text="Full prioritization queue → Cost Optimizer" onClick={()=>setPage("optimizer")}/>}
    </Card>

    {/* ── 4. COST DRIVERS ── */}
    {(()=>{
      const buckets=COST_CATS.map(cat=>({name:cat.name,color:cat.color,total:cm[cat.oKey].total+cm[cat.dKey].total,count:cm[cat.oKey].withCost+cm[cat.dKey].withCost}));
      const topCat=buckets.reduce((a,b)=>a.total>b.total?a:b);
      const wcEntry=Object.entries(BASE.carriers).reduce((a,[n,d])=>d.avgODet*d.containers>a[1].avgODet*a[1].containers?[n,d]:a,["",{avgODet:0,containers:0}]);
      const polCounts={};BASE.topLanes.forEach(l=>{const p=l.lane.slice(0,5);polCounts[p]=(polCounts[p]||0)+l.containers;});
      const topPol=Object.entries(polCounts).reduce((a,[p,c])=>c>a[1]?[p,c]:a,["",0]);
      const topPerCont=buckets.reduce((a,b)=>b.count>0&&b.total/b.count>a.total/Math.max(1,a.count)?b:a);
      return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {label:"Top Cost Category",value:topCat.name,sub:fmt(topCat.total)+" total",color:topCat.color,nav:"costs"},
          {label:"Top Carrier (Origin Risk)",value:wcEntry[0],sub:wcEntry[1].avgODet.toFixed(1)+"d avg origin dwell",color:T.amber,nav:"carriers"},
          {label:"Top Origin Port",value:topPol[0]||"—",sub:(topPol[1]||0)+" containers",color:T.blue,nav:"history"},
          {label:"Highest $/Container",value:topPerCont.name,sub:fmt(Math.round(topPerCont.total/Math.max(1,topPerCont.count)))+"/container",color:T.red,nav:"surcharges"},
        ].map((d,i)=><Card key={i} onClick={can(d.nav)?()=>setPage(d.nav):undefined} style={{padding:"12px 14px",borderLeft:"3px solid "+d.color,cursor:can(d.nav)?"pointer":"default"}}>
          <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{d.label}</div>
          <div style={{fontSize:14,fontWeight:800,color:d.color}}>{d.value}</div>
          <div style={{fontSize:9,color:T.dim,marginTop:2}}>{d.sub}</div>
          {can(d.nav)&&<div style={{fontSize:9,color:T.blueL,marginTop:4,fontWeight:600}}>View →</div>}
        </Card>)}
      </div>;
    })()}

    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>

    {/* ── 5. PROCESS BOTTLENECKS: Journey ── */}
    <Card style={{padding:18,marginBottom:18,background:"#FEFCE808"}}>
      <div style={{marginBottom:4}}><div style={{fontSize:14,fontWeight:600}}>Where Is The Process Stuck?</div><div style={{fontSize:9,color:T.sub}}>The drop between stages shows where D&D cost is building. Charges accrue at ports and depots — not during ocean transit.</div></div>
      {[{label:"ORIGIN",bg:T.amberBg,lc:T.amber,nodes:[
          {label:"Gate Out Empty",sub:"Depot",icon:Box,color:T.amber,actual:st.gateOutEmpty_actual,missing:BASE.missingMilestones.gateOutEmpty},
          {label:"Gate In POL",sub:"Port",icon:MapPin,color:T.amber,actual:st.gateInPOL_actual,missing:BASE.missingMilestones.gateInPOL},
          {label:"Load POL",sub:"Vessel",icon:Ship,color:T.purple,actual:st.loadPOL_actual,missing:BASE.missingMilestones.loadPOL}]},
        {label:"DESTINATION",bg:T.purpleBg,lc:T.purple,nodes:[
          {label:"Discharge POD",sub:"Arrived",icon:Anchor,color:T.purple,actual:st.dischargePOD_actual,missing:BASE.missingMilestones.dischargePOD},
          {label:"Gate Out POD",sub:"Left Port",icon:Truck,color:T.purple,actual:st.gateOutPOD_actual,missing:BASE.missingMilestones.gateOutPOD},
          {label:"Empty Return",sub:"Returned",icon:Box,color:T.amber,actual:st.emptyReturn_actual,missing:BASE.missingMilestones.emptyReturn}]}
      ].map((sec,si)=><div key={si}>
        {si===1&&<div style={{textAlign:"center",padding:"6px 0"}}><span style={{fontSize:10,color:T.dim}}>{"— Ocean Transit: "+sd.ocean_transit.avg+"d avg — No D&D charges during transit —"}</span></div>}
        <div style={{background:sec.bg+"80",borderRadius:14,padding:"16px 14px 12px",marginBottom:si===0?6:0,position:"relative"}}>
          <div style={{position:"absolute",top:7,left:12,fontSize:9,fontWeight:700,color:sec.lc,textTransform:"uppercase",letterSpacing:1}}>{sec.label}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
            {sec.nodes.map((n,i)=><div key={i} style={{background:"#fff",border:"1px solid "+T.border+"80",borderRadius:12,padding:"12px 10px",textAlign:"center",position:"relative"}}>
              {n.missing>0&&(()=>{const TOTAL=BASE.summary.inProgress+BASE.summary.completed;const reachRatio=n.actual/TOTAL;const isLate=["Gate Out POD","Empty Return"].includes(n.label);const badgeColor=isLate?T.sub:(reachRatio>0.5?T.amber:T.dim);const tip=isLate?"Most containers have not yet reached this stage.":(reachRatio>0.5?"⚠ "+n.missing.toLocaleString()+" containers reached this stage but date was not captured.":"Many containers have not yet reached this stage.");return<div style={{position:"absolute",top:6,right:8,cursor:"help",fontSize:11,color:badgeColor}} title={tip}>{(isLate?"○ ":"⚠ ")+n.missing.toLocaleString()}</div>;})()}
              <n.icon size={14} color={n.color} style={{marginBottom:2}}/><div style={{fontSize:11,fontWeight:700}}>{n.label}</div><div style={{fontSize:10,color:T.dim}}>{n.sub}</div>
              <div style={{fontSize:9,color:T.sub,marginTop:4}}>reached this stage</div>
              <div style={{fontSize:16,fontWeight:700,margin:"2px 0"}}>{n.actual.toLocaleString()}</div>
            </div>)}
          </div>
        </div>
      </div>)}
    </Card>

    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>

    {/* ── 6. FUTURE RISK ── */}
    <div ref={fthRef}><Card>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Future Risk — Free Time Health</div>
      <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Which containers are next to breach free period?</div>
      {[
        {label:"Overdue",desc:"Free period expired",count:fth.expired,color:T.red,link:"→ See priority queue above",onClick:()=>actionRef.current?.scrollIntoView({behavior:"smooth"})},
        {label:"At Risk",desc:"Expiring within 48h",count:fth.red,color:T.amber,link:can("optimizer")?"→ Prioritise in Cost Optimizer":null,onClick:can("optimizer")?()=>setPage("optimizer"):undefined},
        {label:"Monitor",desc:"Expiring in 3–5 days",count:fth.yellow,color:"#EAB308"},
        {label:"Safe",desc:"6+ days remaining",count:fth.green,color:T.green}
      ].map(b=>{const tot=fth.expired+fth.red+fth.yellow+fth.green;return <div key={b.label} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <div><span style={{fontSize:12,fontWeight:600,color:b.color}}>{b.label}</span><span style={{fontSize:9,color:T.sub,marginLeft:6}}>{b.desc}</span></div>
          <span style={{fontSize:12,fontWeight:700,color:b.color}}>{b.count.toLocaleString()}</span>
        </div>
        <div style={{height:6,background:T.card2,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.round(b.count/tot*100)+"%",background:b.color,borderRadius:3}}/></div>
        {b.link&&b.count>0&&<div onClick={b.onClick} style={{fontSize:9,fontWeight:700,color:b.color,cursor:"pointer",marginTop:3,textDecoration:"underline"}}>{b.link}</div>}
      </div>;})}
    </Card></div>
  </div>);
}

// ═══ MODULE 2: COST OVERVIEW ═══
function CostPage({setPage,allowedTabs}){
  const can=id=>allowedTabs.includes(id);
  const cm=BASE.costMatrix;const _mc2=BASE.monthlyCost;const _p2=_mc2[_mc2.length-2];const _c2=_mc2[_mc2.length-1];
  const momO=momPct(_c2.oDetention+_c2.oDemurrage+_c2.oStorage+_c2.oCombined,_p2.oDetention+_p2.oDemurrage+_p2.oStorage+_p2.oCombined);
  const momD=momPct(_c2.dDetention+_c2.dDemurrage+_c2.dStorage+_c2.dCombined,_p2.dDetention+_p2.dDemurrage+_p2.dStorage+_p2.dCombined);
  const barData=COST_CATS.map(c=>({name:c.name,Origin:cm[c.oKey].total,Dest:cm[c.dKey].total}));
  const pieData=COST_CATS.map(c=>({name:c.name,value:cm[c.oKey].total+cm[c.dKey].total,color:c.color})).filter(d=>d.value>0);
  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Cost Reduction Center" sub="Where is the biggest money leakage? Find and act on your highest savings opportunities."/>
    {/* ── BIGGEST SAVINGS OPPORTUNITIES ── */}
    {(()=>{
      const buckets=COST_CATS.map(cat=>({name:cat.name,color:cat.color,total:cm[cat.oKey].total+cm[cat.dKey].total,count:cm[cat.oKey].withCost+cm[cat.dKey].withCost}));
      const topBucket=buckets.reduce((a,b)=>a.total>b.total?a:b);
      const topPerCont=buckets.filter(b=>b.count>0).reduce((a,b)=>b.total/b.count>a.total/a.count?b:a);
      const mostImpacted=buckets.reduce((a,b)=>a.count>b.count?a:b);
      const destExp=cm.dnd_destination.total+cm.detention_destination.total+cm.demurrage_destination.total+cm.storage_destination.total;
      const avoidable=BASE.freeTimeHealth.red*250;
      return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[
          {label:"Highest Cost Bucket",value:topBucket.name,sub:fmt(topBucket.total)+" total",color:topBucket.color},
          {label:"Most Avoidable (48h)",value:fmt(avoidable),sub:BASE.freeTimeHealth.red+" containers expiring — act now",color:T.red},
          {label:"Highest $/Container",value:topPerCont.name,sub:fmt(Math.round(topPerCont.total/topPerCont.count))+"/container",color:T.amber},
          {label:"Destination Exposure",value:fmt(destExp),sub:Math.round(destExp/Math.max(1,BASE.grandTotal)*100)+"% of total portfolio",color:T.purple},
        ].map((d,i)=><Card key={i} style={{padding:"14px 16px",borderLeft:"3px solid "+d.color}}>
          <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{d.label}</div>
          <div style={{fontSize:18,fontWeight:800,color:d.color}}>{d.value}</div>
          <div style={{fontSize:9,color:T.dim,marginTop:2}}>{d.sub}</div>
        </Card>)}
      </div>;
    })()}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
      <ChartBox title="Origin vs Destination by Category" sub="Compare which category has the biggest origin-to-destination gap" h={220} insight={(()=>{const maxCat=COST_CATS.reduce((a,cat)=>{const t=cm[cat.oKey].total+cm[cat.dKey].total;return t>a.total?{name:cat.name,total:t,oTotal:cm[cat.oKey].total}:a;},{name:"",total:0,oTotal:0});return maxCat.name+" ("+fmt(maxCat.total)+") is the largest category at "+Math.round(maxCat.total/Math.max(1,BASE.grandTotal)*100)+"% of total. Origin accounts for "+fmt(maxCat.oTotal)+" ("+Math.round(maxCat.oTotal/Math.max(1,maxCat.total)*100)+"%).";})()} nav={can("carriers")?<NavLink text="See which carriers drive this → Carrier Intel" onClick={()=>setPage("carriers")}/>:null}><ResponsiveContainer><BarChart data={barData} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip content={<CTip/>}/><Bar dataKey="Origin" fill={T.amber} radius={[3,3,0,0]}/><Bar dataKey="Dest" fill={T.purple} radius={[3,3,0,0]}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/></BarChart></ResponsiveContainer></ChartBox>
      <ChartBox title="Cost Distribution" sub="Proportional share of each charge type in total cost" h={220}>{pieData.length>0?<ResponsiveContainer><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" paddingAngle={2}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/></PieChart></ResponsiveContainer>:<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:T.dim,fontSize:11}}>No cost data available.</div>}</ChartBox>
    </div>
    <Card>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Full Cost Matrix</div><div style={{fontSize:11,color:T.sub,marginBottom:10}}>Detailed breakdown by surcharge category and side — broad categories above, combined surcharge types below</div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
        <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left",background:T.card2}}>{["Category","Origin $","O #","O FP","Dest $","D #","D FP","Total"].map(h=><th key={h} style={{padding:"7px 8px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:h!=="Category"?"right":"left"}}>{h}</th>)}</tr></thead>
        <tbody>
          {[
            {name:"Detention",                  oKey:"detention_origin",                  dKey:"detention_destination",                  color:T.amber},
            {name:"Demurrage",                  oKey:"demurrage_origin",                  dKey:"demurrage_destination",                  color:T.purple},
            {name:"Storage",                    oKey:"storage_origin",                    dKey:"storage_destination",                    color:T.green},
            {name:"Bundled D&D",                 oKey:"dnd_origin",                        dKey:"dnd_destination",                        color:T.red},
            {name:"Demurrage + Storage",        oKey:"demurrageStorage_origin",           dKey:"demurrageStorage_destination",           color:T.purple},
            {name:"Detention + Demurrage",      oKey:"detentionDemurrage_origin",         dKey:"detentionDemurrage_destination",         color:T.amber},
            {name:"Det. + Dem. + Storage",      oKey:"detentionDemurrageStorage_origin",  dKey:"detentionDemurrageStorage_destination",  color:T.red},
          ].map(cat=>{const o=cm[cat.oKey];const d=cm[cat.dKey];return <tr key={cat.name} style={{background:T.card2}}><td style={{padding:"7px 8px",borderRadius:"6px 0 0 6px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:cat.color}}/><span style={{fontWeight:600}}>{cat.name}</span></div></td><td style={{padding:"7px 8px",fontWeight:600,textAlign:"right"}}>{fmt(o.total)}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{o.withCost}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{o.avgFP}d</td><td style={{padding:"7px 8px",fontWeight:600,textAlign:"right"}}>{fmt(d.total)}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{d.withCost}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{d.avgFP}d</td><td style={{padding:"7px 8px",borderRadius:"0 6px 6px 0",color:cat.color,fontWeight:600,textAlign:"right"}}>{fmt(o.total+d.total)}</td></tr>;})}
          <tr><td colSpan={7} style={{padding:"8px 8px",fontWeight:700,fontSize:13}}>GRAND TOTAL</td><td style={{padding:"8px 8px",color:T.red,fontWeight:700,fontSize:15,textAlign:"right"}}>{fmt(BASE.grandTotal)}</td></tr>
        </tbody>
      </table>
      <div style={{background:T.blueBg,borderRadius:8,padding:"10px 14px",marginTop:10,marginBottom:6,borderLeft:"3px solid "+T.blue}}>
        <div style={{fontSize:11,fontWeight:700,color:T.blue,marginBottom:4}}>Contributing Factors</div>
        <div style={{fontSize:12,color:T.text}}>
          {(()=>{const topLanes=BASE.topLanes.slice(0,3).map(l=>l.lane).join(", ");const wc=Object.entries(BASE.carriers).reduce((a,[n,d])=>d.avgODet>a[1].avgODet?[n,d]:a,["",{avgODet:0}]);const avgBFP=Math.max(0,BASE.stageDays.origin_detention.avg-BASE.costMatrix.detention_origin.avgFP).toFixed(1);return "Top lanes by cost: "+topLanes+". Worst carrier: "+wc[0]+" ("+wc[1].avgODet.toFixed(1)+"d avg origin dwell). Avg days beyond free period: "+avgBFP+"d.";})()}
        </div>
      </div>
    </Card>
    {/* ── RECOMMENDED NEXT INVESTIGATION ── */}
    <div style={{marginTop:16,marginBottom:4}}>
      <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>What should I do next?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {title:"Find the worst carrier",sub:"See who is driving dwell beyond free period on origin and destination.",cta:"→ Carrier Intel",page:"carriers",color:T.amber},
          {title:"Negotiate better free days",sub:"Identify which lanes have the largest gap between dwell and contracted free period.",cta:"→ Negotiation Center",page:"surcharges",color:T.purple},
          {title:"Reduce spend now",sub:"Prioritize containers with highest avoidable cost today before charges escalate.",cta:"→ Cost Optimizer",page:"optimizer",color:T.blue},
        ].filter(d=>!d.page||can(d.page)).map((d,i)=><Card key={i} style={{padding:"14px 16px",cursor:can(d.page)?"pointer":"default",borderTop:"2px solid "+d.color}} onClick={can(d.page)?()=>setPage(d.page):undefined}>
          <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:4}}>{d.title}</div>
          <div style={{fontSize:10,color:T.sub,lineHeight:1.5,marginBottom:can(d.page)?8:0}}>{d.sub}</div>
          {can(d.page)&&<div style={{fontSize:10,fontWeight:700,color:d.color}}>{d.cta}</div>}
        </Card>)}
      </div>
    </div>
  </div>);
}

// ═══ MODULE 3: CARRIER INTEL ═══
const CARRIER_VIEWS=[
  {id:"scatter",   label:"Free Period Utilization"},
  {id:"exceeding", label:"Containers Exceeding Free Days"},
  {id:"cost",      label:"Cost Exposure"},
];
const SCATTER_CATS=[
  {id:"detention",label:"Detention",  xKey:"avgODet",yKey:"avgDDet",fpX:5.1,fpY:6.0,xLabel:"Origin Det (days)",yLabel:"Dest Det (days)",color:T.amber},
  {id:"demurrage",label:"Demurrage", xKey:"avgODem",yKey:"avgDDem",fpX:3.1,fpY:3.0,xLabel:"Origin Dem (days)",yLabel:"Dest Dem (days)",color:T.purple},
  {id:"storage",  label:"Storage",   xKey:"avgOSto",yKey:"avgDSto",fpX:3.1,fpY:3.0,xLabel:"Origin Sto (days)",yLabel:"Dest Sto (days)",color:T.green},
  {id:"combined", label:"Bundled D&D",xKey:"totalO",yKey:"totalD",fpX:9.9,fpY:9.0,xLabel:"Origin Total (days)",yLabel:"Dest Total (days)",color:T.red},
];

function CarrierPage({setPage,allowedTabs}){
  const can=id=>allowedTabs.includes(id);
  const[selCarrier,setSelCarrier]=useState(null);
  const[view,setView]=useState("scatter");
  const carriers=useMemo(()=>Object.entries(BASE.carriers).filter(([,v])=>v.containers>=5).map(([n,d])=>{
    const beyondFP=+(d.avgODet-5.1).toFixed(1);
    const oSto=d.avgOSto||0;const dSto=d.avgDSto||0;
    const oC=d.avgOComb||0;const dC=d.avgDComb||0;
    const tO=d.avgODet+d.avgODem;const tD=d.avgDDem+d.avgDDet;
    // pastFPCount covers all 4 origin+destination categories, not just origin detention
    const totalBeyond=Math.max(0,d.avgODet-5.1)+Math.max(0,d.avgODem-3.1)+Math.max(0,oSto-3.1)+Math.max(0,oC-9.9)+Math.max(0,d.avgDDet-6.0)+Math.max(0,d.avgDDem-3.0)+Math.max(0,dSto-3.0)+Math.max(0,dC-12.0);
    const pastFPCount=Math.round(totalBeyond*d.containers*0.3);
    const pastFPPct=+(pastFPCount/d.containers*100).toFixed(1);
    const avgDaysBeyond=d.containers>0?+(totalBeyond/8).toFixed(1):0;
    const estCost=Math.max(0,Math.round(pastFPCount*(totalBeyond>0?totalBeyond*60:0)+d.containers*d.avgDDem*40+d.containers*d.avgDDet*80));
    const tierIn=Math.round(d.containers*(1-(pastFPPct/100)));
    const tier1=Math.round(d.containers*Math.min(pastFPPct/100,0.3));
    const tier2=Math.round(d.containers*Math.max(0,Math.min(pastFPPct/100-0.3,0.25)));
    const tier3=Math.round(d.containers*Math.max(0,pastFPPct/100-0.55));
    const beyondFPDest=+(d.avgDDet-6.0).toFixed(1);
    const risk=Math.min(100,Math.round(
      Math.max(0,d.avgODet-5.1)*15+
      Math.max(0,d.avgODem-3.1)*10+
      Math.max(0,oSto-3.1)*6+
      Math.max(0,oC-9.9)*10+
      Math.max(0,d.avgDDet-6.0)*12+
      Math.max(0,d.avgDDem-3.0)*8+
      Math.max(0,dSto-3.0)*5+
      Math.max(0,dC-12.0)*8
    ));
    const dailyBurn=Math.max(0,Math.round(pastFPCount*80));
    return{name:n,...d,avgOSto:oSto,avgDSto:dSto,avgOComb:oC,avgDComb:dC,
      totalO:tO,totalD:tD,beyondFP,beyondFPDest,pastFPCount,pastFPPct,avgDaysBeyond,estCost,dailyBurn,tierIn,tier1,tier2,tier3,risk};
  }).sort((a,b)=>b.totalO-a.totalO),[]);

  const riskCol=r=>r>70?T.red:r>40?T.amber:T.green;

  const renderPanel=(cat)=>{
    if(view==="scatter"){
      // Show % of free period consumed per carrier — origin vs destination
      // 100% = exactly at free period threshold. >100% = in paid tier.
      const data=carriers.map(c=>{
        const oPct=Math.round(c[cat.xKey]/cat.fpX*100);
        const dPct=Math.round(c[cat.yKey]/cat.fpY*100);
        const isSel=selCarrier===c.name;
        return{name:c.name,origin:oPct,dest:dPct,oActual:+c[cat.xKey].toFixed(1),dActual:+c[cat.yKey].toFixed(1),containers:c.containers,risk:c.risk,isSel};
      });
      if(!data.length)return<div style={{padding:20,textAlign:"center",color:T.dim,fontSize:11}}>No carrier data available for this category.</div>;
      const maxPct=Math.max(...data.flatMap(d=>[d.origin,d.dest]),120);
      const barCol=pct=>pct>100?T.red:pct>85?T.amber:T.green;
      return <div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:6,flexWrap:"wrap"}}>
          {[{c:T.red,label:"Over free period (>100%)"},{c:T.amber,label:"Near limit (85–100%)"},{c:T.green,label:"Within free period"}].map(({c,label})=>
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:2,background:c,opacity:0.85}}/><span style={{fontSize:9,color:T.sub}}>{label}</span></div>)}
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:4}}><div style={{width:14,height:2,background:T.red,borderStyle:"dashed",borderTop:"2px dashed "+T.red,height:0}}/><span style={{fontSize:9,color:T.red,fontWeight:600}}>100% = free period limit</span></div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{top:4,right:30,bottom:4,left:4}} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke={T.border+"50"} horizontal={false}/>
            <XAxis type="number" domain={[0,maxPct]} stroke={T.dim} fontSize={9} tickFormatter={v=>v+"%"}/>
            <YAxis type="category" dataKey="name" stroke={T.dim} fontSize={9} width={40}
              tick={({x,y,payload})=>{const isSel=selCarrier===payload.value;return<text x={x} y={y} textAnchor="end" dominantBaseline="middle" fontSize={isSel?10:9} fontWeight={isSel?800:500} fill={isSel?T.blue:T.sub}>{payload.value}</text>;}}/>
            <ReferenceLine x={100} stroke={T.red} strokeDasharray="4 2" strokeWidth={1.5}
              label={{value:"FP",position:"top",fontSize:8,fill:T.red}}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length)return null;
              const d=data.find(r=>r.name===label);if(!d)return null;
              return<div style={{background:"#fff",borderRadius:8,padding:"8px 12px",boxShadow:"0 4px 14px rgba(0,0,0,.12)",minWidth:160}}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:4,color:riskCol(d.risk)}}>{d.name}</div>
                <div style={{fontSize:10,color:T.sub,marginBottom:2}}>Origin: <b>{d.oActual}d</b> / {cat.fpX}d FP = <span style={{color:barCol(d.origin),fontWeight:700}}>{d.origin}%</span></div>
                <div style={{fontSize:10,color:T.sub}}>Dest: <b>{d.dActual}d</b> / {cat.fpY}d FP = <span style={{color:barCol(d.dest),fontWeight:700}}>{d.dest}%</span></div>
                <div style={{fontSize:9,color:T.dim,marginTop:3}}>{d.containers} containers</div>
              </div>;
            }}/>
            <Bar dataKey="origin" name="Origin" maxBarSize={9} radius={[0,3,3,0]}>
              {data.map((d,i)=><Cell key={i} fill={barCol(d.origin)} fillOpacity={selCarrier&&selCarrier!==d.name?0.35:0.85}/>)}
            </Bar>
            <Bar dataKey="dest" name="Destination" maxBarSize={9} radius={[0,3,3,0]}>
              {data.map((d,i)=><Cell key={i} fill={barCol(d.dest)} fillOpacity={selCarrier&&selCarrier!==d.name?0.35:0.85}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:4}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:18,height:8,borderRadius:2,background:T.sub,opacity:0.5}}/><span style={{fontSize:9,color:T.dim}}>Top bar = Origin · Bottom bar = Destination</span></div>
          {!selCarrier&&<span style={{fontSize:9,color:T.blue,fontWeight:500}}>Click a carrier row below to highlight</span>}
          {selCarrier&&<span style={{fontSize:9,color:T.blue,fontWeight:600}}>{selCarrier} highlighted — other carriers dimmed</span>}
        </div>
      </div>;
    }
if(view==="exceeding"){
      const fpField={detention:"avgODet",demurrage:"avgODem",storage:"avgOSto",combined:"totalO"}[cat.id];
      const fp=cat.fpX;
      const data=carriers.map(c=>{
        const beyond=Math.max(0,c[fpField]-fp);
        const pastCount=Math.round(beyond*c.containers*0.6);
        return{name:c.name,withinFP:c.containers-pastCount,pastFP:pastCount};
      });
      return <div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:6}}>
          {[{c:T.green,label:"Within Free Period"},{c:T.red,label:"Past Free Period"}].map(({c,label})=>
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:2,background:c,opacity:0.8}}/><span style={{fontSize:9,color:T.sub}}>{label}</span></div>)}
        </div>
        <div style={{height:200}}><ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{top:8,right:8,bottom:20,left:4}} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={T.border+"50"} vertical={false}/>
          <XAxis dataKey="name" fontSize={8} stroke={T.dim} tick={{fontSize:8}}/>
          <YAxis fontSize={8} stroke={T.dim} width={28}/>
          <Tooltip contentStyle={{fontSize:10,borderRadius:8}} labelStyle={{fontWeight:700}}/>
          <Bar dataKey="withinFP" name="Within FP" stackId="a" fill={T.green} fillOpacity={0.7} radius={[0,0,0,0]}/>
          <Bar dataKey="pastFP"   name="Past FP"   stackId="a" fill={T.red}   fillOpacity={0.8} radius={[3,3,0,0]}/>
        </BarChart>
      </ResponsiveContainer></div></div>;
    }
    // cost view
    const data=carriers.map(c=>({name:c.name,cost:Math.round(c.estCost/1000)})).sort((a,b)=>b.cost-a.cost);
    return <div>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
        <div style={{width:10,height:10,borderRadius:2,background:cat.color,opacity:0.8}}/><span style={{fontSize:9,color:T.sub}}>{"Est. D&D cost exposure — "+cat.label+" (sorted highest to lowest)"}</span>
      </div>
      <div style={{height:200}}><ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{top:8,right:8,bottom:20,left:4}} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={T.border+"50"} vertical={false}/>
        <XAxis dataKey="name" fontSize={8} stroke={T.dim} tick={{fontSize:8}}/>
        <YAxis fontSize={8} stroke={T.dim} width={32} tickFormatter={v=>v+"k"}/>
        <Tooltip contentStyle={{fontSize:10,borderRadius:8}} labelStyle={{fontWeight:700}} formatter={v=>"$"+v+"k"}/>
        <Bar dataKey="cost" name="Est. Cost" fill={cat.color} fillOpacity={0.8} radius={[3,3,0,0]}/>
      </BarChart>
    </ResponsiveContainer></div></div>;
  };

  const viewLabels={scatter:"Origin vs Destination scatter — quadrant view per charge category. Bubbles sized by container volume, colored by carrier risk score.",exceeding:"Container count within vs past free period per carrier, by charge category.",cost:"Estimated D&D cost exposure by carrier (directional estimate, not billing data)."};

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Carrier Intel" sub="Who is causing D&D? Find the carrier to escalate operationally and the contract to renegotiate."/>

    {/* ── CARRIER RISK SNAPSHOT ── */}
    {(()=>{
      const sorted=[...carriers].sort((a,b)=>b.risk-a.risk);
      const topExp=sorted.length>0?sorted.reduce((a,b)=>b.estCost>a.estCost?b:a,sorted[0]):null;
      const topBurn=sorted.length>0?sorted.reduce((a,b)=>b.dailyBurn>a.dailyBurn?b:a,sorted[0]):null;
      const topRisk=sorted.length>0?sorted[0]:null;
      const topBFP=sorted.length>0?sorted.reduce((a,b)=>b.beyondFP>a.beyondFP?b:a,sorted[0]):null;
      return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {label:"Highest Exposure",value:topExp?topExp.name:"—",sub:topExp?fmt(topExp.estCost)+" estimated":"-",color:T.red},
          {label:"Highest Daily Burn",value:topBurn?topBurn.name:"—",sub:topBurn&&topBurn.dailyBurn>0?fmt(topBurn.dailyBurn)+"/day burning":"Within free period",color:T.amber},
          {label:"Highest Risk Score",value:topRisk?topRisk.name:"—",sub:topRisk?"Score: "+topRisk.risk+" / 100":"No risk data",color:topRisk&&topRisk.risk>70?T.red:topRisk&&topRisk.risk>40?T.amber:T.green},
          {label:"Largest Negotiation Target",value:topBFP&&topBFP.beyondFP>0?topBFP.name:"No overage",sub:topBFP&&topBFP.beyondFP>0?"+"+topBFP.beyondFP+"d avg beyond O.Det free period":"All carriers within free period",color:T.purple},
        ].map((d,i)=><Card key={i} style={{padding:"14px 16px",borderLeft:"3px solid "+d.color}}>
          <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{d.label}</div>
          <div style={{fontSize:18,fontWeight:800,color:d.color}}>{d.value}</div>
          <div style={{fontSize:9,color:T.dim,marginTop:2}}>{d.sub}</div>
        </Card>)}
      </div>;
    })()}

    {false&&<Card style={{display:"none"}}>
      <div style={{fontSize:11,color:T.sub,marginBottom:12}}>{viewLabels[view]}</div>
      {view!=="lanes"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {SCATTER_CATS.map(cat=>(
          <div key={cat.id} style={{background:T.card2,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:11,fontWeight:700,color:cat.color,marginBottom:6}}>{cat.label}</div>
            {renderPanel(cat)}
          </div>
        ))}
      </div>}
      {view==="lanes"&&(()=>{
        const lanes=selCarrier?BASE.topLanes.filter(l=>l.carriers&&l.carriers.includes(selCarrier)):BASE.topLanes;
        const oStat=v=>v>5.1?{t:"Over FP",c:T.red}:v>3.5?{t:"Near FP",c:T.amber}:{t:"OK",c:T.green};
        const dStat=v=>v>6.0?{t:"Over FP",c:T.red}:v>4.0?{t:"Near FP",c:T.amber}:{t:"OK",c:T.green};
        return <div>
          <div style={{background:T.amberBg,border:"1px solid "+T.amber+"40",borderRadius:8,padding:"8px 14px",marginBottom:12,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:11,fontWeight:700,color:T.amber}}>🚧 Development in Progress — this view is under active development. Data shown is indicative only.</div></div>
          {selCarrier&&<div style={{fontSize:9,color:T.sub,marginBottom:8,fontStyle:"italic"}}>Showing {lanes.length} lane{lanes.length!==1?"s":""} operated by {selCarrier}. Click scorecard row below to filter.</div>}
          {!selCarrier&&<div style={{fontSize:9,color:T.sub,marginBottom:8}}>All trade lanes — click a carrier in the scorecard to filter by carrier.</div>}
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
            <thead><tr style={{color:T.dim,fontSize:9}}>
              {["Lane","Carriers","Containers","Avg O.Det","Avg D.Det","Origin Status","Dest Status",""].map(h=><th key={h} style={{padding:"4px 8px",textAlign:["Containers","Avg O.Det","Avg D.Det"].includes(h)?"right":"left",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>{h}</th>)}
            </tr></thead>
            <tbody>{lanes.length===0?<tr><td colSpan={8} style={{padding:"16px",textAlign:"center",color:T.dim,fontSize:10}}>{selCarrier?"No top-10 lanes found for "+selCarrier+". This carrier may operate on routes outside the top 10 by volume.":"No lane data available."}</td></tr>:lanes.map((l,i)=>{
              const os=oStat(l.avgODet);const ds=dStat(l.avgDDet);
              const bothOver=os.c===T.red&&ds.c===T.red;
              return <tr key={i} style={{background:T.card2,borderLeft:bothOver?"3px solid "+T.red:"3px solid transparent"}}>
                <td style={{padding:"6px 8px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontSize:10,fontWeight:700}}>{l.lane}</td>
                <td style={{padding:"6px 8px",fontSize:9}}>{(l.carriers||[]).map(c=><span key={c} style={{background:T.blue+"15",color:T.blue,borderRadius:4,padding:"1px 5px",marginRight:3,fontSize:9,fontWeight:600}}>{c}</span>)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600}}>{l.containers}</td>
                <td style={{padding:"6px 8px",textAlign:"right",color:l.avgODet>5.1?T.red:T.text,fontWeight:l.avgODet>5.1?700:400}}>{l.avgODet}d</td>
                <td style={{padding:"6px 8px",textAlign:"right",color:l.avgDDet>6.0?T.red:T.text,fontWeight:l.avgDDet>6.0?700:400}}>{l.avgDDet}d</td>
                <td style={{padding:"6px 8px"}}><span style={{background:os.c+"18",color:os.c,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:600}}>{os.t}</span></td>
                <td style={{padding:"6px 8px"}}><span style={{background:ds.c+"18",color:ds.c,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:600}}>{ds.t}</span></td>
                <td style={{padding:"6px 8px",borderRadius:"0 6px 6px 0"}}>{can("surcharges")?<span onClick={()=>setPage("surcharges")} style={{cursor:"pointer",color:T.blue,fontSize:9,fontWeight:600}}>Surcharges →</span>:<span style={{fontSize:9,color:T.dim}}>—</span>}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>;
      })()}
      {can("history")&&<NavLink text="See port and lane performance trends → Historical" onClick={()=>setPage("history")}/>}
    </Card>}

    {selCarrier&&view!=="lanes"&&(()=>{
      const cd=carriers.find(c=>c.name===selCarrier);
      if(!cd)return null;
      const overO=cd.avgODet>5.1||cd.avgODem>3.1;
      const overD=cd.avgDDet>6.0||cd.avgDDem>3.0;
      const both=overO&&overD;
      const color=both?T.red:overO||overD?T.amber:T.green;
      const bg=both?T.redBg:overO||overD?T.amber+"15":T.green+"15";
      const icon=both?"⚠":overO?"↑":overD?"↓":"✓";
      const label=both?"Both sides over free period":overO?"Origin delays":overD?"Destination delays":"Within free period";
      const msg=both
        ?selCarrier+" exceeds free period on both origin and destination. Operational: Contact the freight forwarder or warehouse handling "+selCarrier+" shipments — late gate-in at origin and delayed returns at destination are the likely drivers. Procurement: At the next tender, negotiate extended free days on "+selCarrier+" lanes where dwell consistently exceeds threshold."
        :overO
        ?selCarrier+" shows origin-side delays. Operational: Contact your origin freight forwarder or factory for "+selCarrier+" shipments — gate-in timing is the likely driver. Destination performance is within free period, no action needed there."
        :overD
        ?selCarrier+" shows destination-side delays. Operational: Contact your customs broker or inland delivery partner for "+selCarrier+" shipments — terminal congestion or warehouse intake delays are the likely driver. Origin performance is within free period."
        :selCarrier+" is performing within free period on both sides. No operational action needed. Flag as preferred carrier in your next tender review.";
      return <div style={{background:bg,borderRadius:10,padding:"12px 16px",margin:"0 0 12px",borderLeft:"3px solid "+color}}>
        <div style={{fontSize:11,fontWeight:700,color,marginBottom:4}}>{icon} {label} — {selCarrier}</div>
        <div style={{fontSize:11,color:T.text,lineHeight:1.6}}>{msg}</div>
      </div>;
    })()}

    <div style={{marginTop:18,marginBottom:10,borderTop:"2px solid "+T.border,paddingTop:14}}>
      <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"1px"}}>Carrier Scorecard</div>
      <div style={{fontSize:10,color:T.dim,marginTop:2}}>Rank carriers by risk. Click any row to drill into container detail.</div>
    </div>
    <Card style={{marginBottom:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div>
          <div style={{fontSize:14,fontWeight:600}}>Carrier Scorecard <span style={{fontSize:10,fontWeight:400,color:T.blue}}>— click any row to see containers</span></div>
          <div style={{fontSize:10,color:T.sub,marginTop:2}}>Avg Score = portfolio average dwell vs free period. <span style={{color:T.amber,fontWeight:600}}>Red cell = avg dwell exceeds free period.</span> Sorted by Avg Score.</div>
        </div>
        <DlBtn onClick={()=>dlCSV("carrier_scorecard_"+new Date().toISOString().slice(0,10),["Carrier","Containers","Containers Over FP (est)","Avg Days Beyond FP","Est Daily Burn","Total Exposure (est)","Score"],[...carriers].sort((a,b)=>b.risk-a.risk).map(c=>[c.name,c.containers,c.pastFPCount,c.avgDaysBeyond>0?"+"+c.avgDaysBeyond+"d":"Within FP",c.dailyBurn,c.estCost,c.risk>70?"High":c.risk>40?"Medium":"Low"]))}/>
      </div>
      {(()=>{
        const th=(label,right,tip)=><th style={{padding:"6px 7px",fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.4px",color:T.dim,background:T.card2,textAlign:right?"right":"left",whiteSpace:"nowrap"}}>{label}{tip&&<HoverTip text={tip}/>}</th>;
        return <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px",fontSize:10}}>
          <thead><tr>
            {th("Carrier")}
            {th("Vol",true,"Total containers for this carrier")}
            {th("Containers Over FP",true,"Estimated containers exceeding free period across all categories (Det, Dem, Sto, Comb — origin and destination)")}
            {th("Avg Days Beyond FP",true,"Average excess days beyond free period across all 8 category+side combinations")}
            {th("Est. Daily Burn",true,"Directional estimate — daily D&D cost accumulating across all over-FP containers. Not billing data.")}
            {th("Total Exposure (est.)",true,"Directional estimate of total D&D cost exposure. Not billing data.")}
            {th("Score",true,"Risk score based on how far avg dwell exceeds FP across all categories. Click row to see container detail.")}
          </tr></thead>
          <tbody>{[...carriers].sort((a,b)=>b.risk-a.risk).map(c=>{
            const sel=selCarrier===c.name;
            const rc=c.risk>70?T.red:c.risk>40?T.amber:T.green;
            const topRiskCount=CDATA.topRisk.filter(r=>r.ca===c.name).length;
            return <tr key={c.name} onClick={()=>setSelCarrier(sel?null:c.name)} style={{background:sel?T.blueBg:"#fff",cursor:"pointer",transition:"filter .1s"}} onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.97)"} onMouseLeave={e=>e.currentTarget.style.filter=""}>
              <td style={{padding:"6px 7px",borderRadius:"6px 0 0 6px",fontWeight:700,whiteSpace:"nowrap"}}>
                {c.name}
                {topRiskCount>0&&<span style={{marginLeft:5,fontSize:8,fontWeight:700,color:T.red,background:T.redBg,padding:"1px 5px",borderRadius:8}}>{topRiskCount+" priority"}</span>}
                {sel&&<ChevronDown size={10} color={T.blue} style={{marginLeft:4}}/>}
              </td>
              <td style={{padding:"6px 7px",textAlign:"right",color:T.sub}}>{c.containers}</td>
              <td style={{padding:"6px 7px",textAlign:"right",fontWeight:600,color:c.pastFPCount>0?T.red:T.green}}>{c.pastFPCount}</td>
              <td style={{padding:"6px 7px",textAlign:"right",fontWeight:600,color:c.avgDaysBeyond>0?T.red:T.green}}>{c.avgDaysBeyond>0?"+"+c.avgDaysBeyond+"d":"Within FP"}</td>
              <td style={{padding:"6px 7px",textAlign:"right",fontWeight:600,color:c.dailyBurn>0?T.red:T.sub}}>{c.dailyBurn>0?fmt(c.dailyBurn)+"/d":"—"}</td>
              <td style={{padding:"6px 7px",textAlign:"right",fontWeight:600}}>{fmt(c.estCost)}</td>
              <td style={{padding:"6px 7px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={rc}>{c.risk>70?"High":c.risk>40?"Medium":"Low"}</SolidBadge></td>
            </tr>;
          })}</tbody>
        </table>;
      })()}
      <div style={{fontSize:9,color:T.dim,marginTop:6}}>Carrier scores are for evaluation only. Business relationships and other factors can also influence decisions.</div>
    </Card>

    {selCarrier&&(()=>{const rows=CDATA.topRisk.filter(c=>c.ca===selCarrier);const cd=BASE.carriers[selCarrier];const risk=cd?Math.min(100,Math.round(Math.max(0,cd.avgODet-5.1)*15+Math.max(0,cd.avgODem-3.1)*10+Math.max(0,cd.avgOSto-3.1)*6+Math.max(0,cd.avgOComb-9.9)*10+Math.max(0,cd.avgDDet-6.0)*12+Math.max(0,cd.avgDDem-3.0)*8+Math.max(0,cd.avgDSto-3.0)*5+Math.max(0,cd.avgDComb-12.0)*8)):0;
      return <Card style={{marginTop:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:700}}>{selCarrier} — Container Detail</div>
            <div style={{fontSize:10,color:T.sub,marginTop:2}}>Avg Score (scorecard): <span style={{fontWeight:700,color:risk<40?T.green:risk<70?T.amber:T.red}}>{risk}</span> — based on portfolio average dwell vs free period.</div>
          </div>
          <button onClick={()=>setSelCarrier(null)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={14} color={T.dim}/></button>
        </div>
        {rows.length>0&&<div style={{background:T.amberBg,border:"1px solid "+T.amber+"30",borderRadius:8,padding:"7px 12px",marginBottom:10,fontSize:10,color:T.sub}}>
          <span style={{fontWeight:700,color:T.amber}}>Note: </span>{"Avg Score reflects the carrier's average across all "+cd?.containers+" containers. Individual containers below may have higher risk scores if specific shipments ran significantly over free period — this does not mean the carrier's overall performance is poor."}
        </div>}
        {!rows.length?(
          <div>
            <div style={{background:T.greenBg,border:"1px solid "+T.green+"40",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:4}}>{"✓ No priority containers for "+selCarrier}</div>
              <div style={{fontSize:10,color:T.sub}}>{"None of this carrier's "+(cd?.containers||"—")+" containers breach the top-risk threshold. Avg Score "+risk+" confirms performance within acceptable range."}</div>
            </div>
            {cd&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[{l:"Portfolio",v:cd.containers+" containers",c:T.text},{l:"O.Det avg",v:cd.avgODet+"d",c:cd.avgODet>5.1?T.red:T.green},{l:"O.Dem avg",v:cd.avgODem+"d",c:cd.avgODem>3.1?T.red:T.green},{l:"O.Comb avg",v:cd.avgOComb+"d",c:cd.avgOComb>9.9?T.red:T.green},{l:"D.Det avg",v:cd.avgDDet+"d",c:cd.avgDDet>6.0?T.red:T.green},{l:"D.Dem avg",v:cd.avgDDem+"d",c:cd.avgDDem>3.0?T.red:T.green},{l:"D.Comb avg",v:cd.avgDComb+"d",c:cd.avgDComb>12.0?T.red:T.green},{l:"Avg Score",v:risk,c:risk<40?T.green:risk<70?T.amber:T.red}].map(s=><div key={s.l} style={{background:T.card2,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:T.sub,marginTop:2}}>{s.l}</div>
              </div>)}
            </div>}
          </div>
        ):(
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
            <thead><tr style={{color:T.dim,fontSize:9,background:T.card2}}>
              {["Container","Lane","Category","Stage","Days Beyond FP","Daily Burn","Total Cost","Status"].map(h=><th key={h} style={{padding:"5px 6px",textAlign:["Days Beyond FP","Daily Burn","Total Cost"].includes(h)?"right":"left",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>
                {h}
                {h==="Days Beyond FP"&&<HoverTip text="How many days this container has exceeded its free period."/>}
                {h==="Daily Burn"&&<HoverTip text="Estimated D&D cost accumulating per day for this container."/>}
                {h==="Status"&&<HoverTip text="Individual container risk — can be high even when carrier avg score is low."/>}
              </th>)}
            </tr></thead>
            <tbody>{rows.map((c,i)=>{
              const fpThreshold=c.cat==="Detention"?5.1:c.cat==="Demurrage"?3.1:c.cat==="Storage"?3.1:9.9;
              const daysBeyond=Math.max(0,+(c.oDet-fpThreshold).toFixed(1));
              const daily=Math.max(0,Math.round((c.cost3d-c.cost)/3));
              return <tr key={i} style={{background:T.card2}}>
                <td style={{padding:"5px 6px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontSize:10,fontWeight:600}}>{c.cn}</td>
                <td style={{padding:"5px 6px",color:T.sub,fontSize:9}} title={c.po+"→"+c.pd}>{portShort(c.po)+"→"+portShort(c.pd)}</td>
                <td style={{padding:"5px 6px"}}><Badge color={catColor(c.cat)}>{c.cat}</Badge></td>
                <td style={{padding:"5px 6px",fontSize:9,color:T.sub}}>{c.stage}</td>
                <td style={{padding:"5px 6px",fontWeight:600,textAlign:"right",color:daysBeyond>0?T.red:T.green}}>{daysBeyond>0?"+"+daysBeyond+"d":"Within FP"}</td>
                <td style={{padding:"5px 6px",fontWeight:600,textAlign:"right",color:daily>0?T.red:T.sub}}>{daily>0?fmt(daily)+"/d":"—"}</td>
                <td style={{padding:"5px 6px",fontWeight:600,textAlign:"right"}}>{fmt(c.cost)}</td>
                <td style={{padding:"5px 6px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={c.risk>=75?T.red:c.risk>=50?T.amber:T.green}>{c.risk>=75?"High":c.risk>=50?"Medium":"Low"}</SolidBadge></td>
              </tr>;
            })}
            </tbody>
          </table>
        )}
      </Card>;
    })()}

    <div style={{marginTop:18,marginBottom:10,borderTop:"2px solid "+T.border,paddingTop:14}}>
      <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"1px"}}>Why Is This Carrier Expensive?</div>
      <div style={{fontSize:10,color:T.dim,marginTop:2}}>% of contracted free period used per carrier — origin vs destination. Red bars exceed 100% (paid tier). Use to identify which carrier and side to escalate in negotiations.</div>
    </div>
    <Card style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,fontWeight:600,color:T.sub,textTransform:"uppercase"}}>View</span>
        <select value={view} onChange={e=>{setView(e.target.value);setSelCarrier(null);}} style={{border:"1px solid "+T.border,borderRadius:8,padding:"4px 10px",fontSize:10,color:T.text,background:"#fff",cursor:"pointer",outline:"none",fontWeight:600}}>
          {CARRIER_VIEWS.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
        <span style={{fontSize:10,color:T.dim}}>{viewLabels[view]}</span>
        {selCarrier&&<span style={{fontSize:9,color:T.blue,fontWeight:600,marginLeft:4}}>Showing {selCarrier} highlighted (dashed ring).</span>}
      </div>
      {view==="scatter"&&<div style={{background:T.card2,borderRadius:8,padding:"7px 12px",marginBottom:8,fontSize:10,color:T.sub,lineHeight:1.5,border:"1px solid "+T.border+"60"}}>
        <span style={{fontWeight:600,color:T.text}}>How to read: </span>X-axis = origin dwell days, Y-axis = destination dwell days. Dashed lines mark contracted free period thresholds. Bubbles in the <span style={{color:T.red,fontWeight:600}}>top-right</span> exceed free period on both sides. Bottom-left = within free period.{!selCarrier&&<span style={{color:T.blue,fontWeight:600}}> Click any carrier row in the scorecard above to highlight them here.</span>}
      </div>}
      {view!=="lanes"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {SCATTER_CATS.map(cat=>(
          <div key={cat.id} style={{background:T.card2,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:11,fontWeight:700,color:cat.color,marginBottom:6}}>{cat.label}</div>
            {renderPanel(cat)}
          </div>
        ))}
      </div>}
      {view==="lanes"&&(()=>{
        const lanes=selCarrier?BASE.topLanes.filter(l=>l.carriers&&l.carriers.includes(selCarrier)):BASE.topLanes;
        const oStat=v=>v>5.1?{t:"Over FP",c:T.red}:v>3.5?{t:"Near FP",c:T.amber}:{t:"OK",c:T.green};
        const dStat=v=>v>6.0?{t:"Over FP",c:T.red}:v>4.0?{t:"Near FP",c:T.amber}:{t:"OK",c:T.green};
        return <div>
          <div style={{background:T.amberBg,border:"1px solid "+T.amber+"40",borderRadius:8,padding:"8px 14px",marginBottom:12,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:11,fontWeight:700,color:T.amber}}>🚧 Under active development — data shown is indicative only.</div></div>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
            <thead><tr style={{color:T.dim,fontSize:9}}>
              {["Lane","Carriers","Containers","Avg O.Det","Avg D.Det","Origin Status","Dest Status",""].map(h=><th key={h} style={{padding:"4px 8px",textAlign:["Containers","Avg O.Det","Avg D.Det"].includes(h)?"right":"left",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>{h}</th>)}
            </tr></thead>
            <tbody>{lanes.length===0?<tr><td colSpan={8} style={{padding:"16px",textAlign:"center",color:T.dim,fontSize:10}}>{selCarrier?"No top-10 lanes found for "+selCarrier+". This carrier may operate on routes outside the top 10 by volume.":"No lane data available."}</td></tr>:lanes.map((l,i)=>{
              const os=oStat(l.avgODet);const ds=dStat(l.avgDDet);
              const bothOver=os.c===T.red&&ds.c===T.red;
              return <tr key={i} style={{background:T.card2,borderLeft:bothOver?"3px solid "+T.red:"3px solid transparent"}}>
                <td style={{padding:"6px 8px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontSize:10,fontWeight:700}}>{l.lane}</td>
                <td style={{padding:"6px 8px",fontSize:9}}>{(l.carriers||[]).map(c=><span key={c} style={{background:T.blue+"15",color:T.blue,borderRadius:4,padding:"1px 5px",marginRight:3,fontSize:9,fontWeight:600}}>{c}</span>)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600}}>{l.containers}</td>
                <td style={{padding:"6px 8px",textAlign:"right",color:l.avgODet>5.1?T.red:T.text,fontWeight:l.avgODet>5.1?700:400}}>{l.avgODet}d</td>
                <td style={{padding:"6px 8px",textAlign:"right",color:l.avgDDet>6.0?T.red:T.text,fontWeight:l.avgDDet>6.0?700:400}}>{l.avgDDet}d</td>
                <td style={{padding:"6px 8px"}}><span style={{background:os.c+"18",color:os.c,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:600}}>{os.t}</span></td>
                <td style={{padding:"6px 8px"}}><span style={{background:ds.c+"18",color:ds.c,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:600}}>{ds.t}</span></td>
                <td style={{padding:"6px 8px",borderRadius:"0 6px 6px 0"}}>{can("surcharges")?<span onClick={()=>setPage("surcharges")} style={{cursor:"pointer",color:T.blue,fontSize:9,fontWeight:600}}>Surcharges →</span>:<span style={{fontSize:9,color:T.dim}}>—</span>}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>;
      })()}
    </Card>

    {/* ── RECOMMENDED ACTION ── */}
    {!selCarrier&&<div style={{marginTop:16,marginBottom:4}}>
      <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>What should I do next?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {type:"Operational Fix",desc:"Contact the freight forwarder or warehouse handling the highest-risk carrier's shipments. Gate-in timing and terminal congestion are the primary operational levers.",color:T.red,icon:"🚨"},
          {type:"Negotiation Fix",desc:"Use Negotiation Center to build the case for extended free days on lanes where your carrier consistently runs beyond contracted free periods.",color:T.purple,icon:"📋",page:"surcharges"},
          {type:"Contract Fix",desc:"Flag top-risk carriers as priority items in your next tender review. Use this scorecard as supporting data to renegotiate free period thresholds.",color:T.blue,icon:"📑"},
        ].filter(d=>!d.page||can(d.page)).map((d,i)=><Card key={i} style={{padding:"14px 16px",borderTop:"2px solid "+d.color}}>
          <div style={{fontSize:10,fontWeight:700,color:d.color,marginBottom:4}}>{d.icon} {d.type}</div>
          <div style={{fontSize:10,color:T.sub,lineHeight:1.5,marginBottom:d.page?8:0}}>{d.desc}</div>
          {d.page&&<div style={{fontSize:10,fontWeight:700,color:d.color,cursor:"pointer"}} onClick={()=>setPage(d.page)}>→ Negotiation Center</div>}
        </Card>)}
      </div>
    </div>}

  </div>);
}

// ═══ MODULE 4: COST OPTIMIZER ═══
function OptimizerPage(){
  const[predDate,setPredDate]=useState(()=>new Date().toISOString().slice(0,10));
  // Group A filters (all-in-one per side)
  const[aFpStatus,setAFpStatus]=useState("All");const[aCat,setACat]=useState("All");const[aRisk,setARisk]=useState("All");const[aCostBand,setACostBand]=useState("All");
  const[aPolF,setAPolF]=useState("All");const[aPodF,setAPodF]=useState("All");const[aCarF,setACarF]=useState("All");
  const[aTopN,setATopN]=useState("All");
  const[aStageF,setAStageF]=useState("All");
  // Group B filters (all-in-one per side)
  const[bFpStatus,setBFpStatus]=useState("All");const[bCat,setBCat]=useState("All");const[bRisk,setBRisk]=useState("All");const[bCostBand,setBCostBand]=useState("All");
  const[bPolF,setBPolF]=useState("All");const[bPodF,setBPodF]=useState("All");const[bCarF,setBCarF]=useState("All");
  const[bTopN,setBTopN]=useState("All");
  const[bStageF,setBStageF]=useState("All");
  // Sort state for container tables
  const[aSortCol,setASortCol]=useState("todayCost");const[aSortDir,setASortDir]=useState("desc");
  const[bSortCol,setBSortCol]=useState("todayCost");const[bSortDir,setBSortDir]=useState("desc");

  const predDays=useMemo(()=>Math.max(0,Math.round((new Date(predDate)-new Date(new Date().toISOString().slice(0,10)))/86400000)),[predDate]);
  const CAT_META={Detention:{fp:5.1,c:T.amber},Demurrage:{fp:3.1,c:T.purple},Storage:{fp:3.1,c:T.green},"Bundled D&D":{fp:9.9,c:T.red}};
  // predCost derived from allContainers so table always matches widget total
  const predCost=useMemo(()=>{
    const grouped={};
    CDATA.topRisk.forEach(c=>{
      const key=c.cat in CAT_META?c.cat:"Bundled D&D";
      if(!grouped[key])grouped[key]={total:0,count:0,totalDaily:0};
      const daily=Math.max(0,Math.round((c.cost3d-c.cost)/3));
      const todayCost=predDays>0?daily*predDays:c.cost;
      grouped[key].total+=todayCost;
      grouped[key].count+=1;
      grouped[key].totalDaily+=daily;
    });
    return Object.entries(CAT_META).map(([n,meta])=>{
      const g=grouped[n]||{total:0,count:0,totalDaily:0};
      return{n,fp:meta.fp,c:meta.c,containers:g.count,dailyRate:g.count>0?Math.round(g.totalDaily/g.count):0,predicted:g.total};
    });
  },[predDays]);

  const allContainers=useMemo(()=>CDATA.topRisk.map(c=>{
    const d3=c.cost3d-c.cost;const d7=c.cost7d-c.cost;const fp=5.1;const daily=Math.max(0,Math.round(d3/3));
    const todayCost=predDays>0?daily*predDays:c.cost;
    const fpStatus=c.oDet>fp?"Expired":c.oDet>fp-0.5?"Expiring Today":c.oDet>fp-2?"Expiring 48h":"Green";
    const side=["Gate Out POD","Discharge POD","Empty Return"].includes(c.stage)?"Destination":"Origin";
    const lane=c.po+"-"+c.pd;
    const costBand=todayCost>3000?"High Impact":todayCost>1000?"Medium":"Low";
    const riskLevel=c.risk>=75?"High":c.risk>=50?"Medium":"Low";
    return{...c,daily,todayCost,sav3d:d3,sav7d:d7,fpStatus,side,lane,costBand,riskLevel};
  }).sort((a,b)=>b.todayCost-a.todayCost),[predDays]);

  const filterOpts=useMemo(()=>({pols:[...new Set(allContainers.map(c=>c.po))].sort(),pods:[...new Set(allContainers.map(c=>c.pd))].sort(),carriers:[...new Set(allContainers.map(c=>c.ca))].sort(),stages:[...new Set(allContainers.map(c=>c.stage))].sort()}),[allContainers]);

  // Group A & B independently filtered
  const groupA=useMemo(()=>{let g=allContainers.filter(c=>{
    if(aFpStatus!=="All"&&c.fpStatus!==aFpStatus)return false;
    if(aCat!=="All"&&c.cat!==aCat)return false;
    if(aRisk!=="All"&&c.riskLevel!==aRisk)return false;
    if(aCostBand!=="All"&&c.costBand!==aCostBand)return false;
    if(aPolF!=="All"&&c.po!==aPolF)return false;
    if(aPodF!=="All"&&c.pd!==aPodF)return false;
    if(aCarF!=="All"&&c.ca!==aCarF)return false;
    if(aStageF!=="All"&&c.stage!==aStageF)return false;
    return true;
  });const n=aTopN==="All"?g.length:parseInt(aTopN);return{all:g,active:g.slice(0,n),excluded:g.slice(n)};},[allContainers,aFpStatus,aCat,aRisk,aCostBand,aPolF,aPodF,aCarF,aTopN,aStageF]);
  const groupB=useMemo(()=>{let g=allContainers.filter(c=>{
    if(bFpStatus!=="All"&&c.fpStatus!==bFpStatus)return false;
    if(bCat!=="All"&&c.cat!==bCat)return false;
    if(bRisk!=="All"&&c.riskLevel!==bRisk)return false;
    if(bCostBand!=="All"&&c.costBand!==bCostBand)return false;
    if(bPolF!=="All"&&c.po!==bPolF)return false;
    if(bPodF!=="All"&&c.pd!==bPodF)return false;
    if(bCarF!=="All"&&c.ca!==bCarF)return false;
    if(bStageF!=="All"&&c.stage!==bStageF)return false;
    return true;
  });const n=bTopN==="All"?g.length:parseInt(bTopN);return{all:g,active:g.slice(0,n),excluded:g.slice(n)};},[allContainers,bFpStatus,bCat,bRisk,bCostBand,bPolF,bPodF,bCarF,bTopN,bStageF]);
  const sharedFiltered=allContainers; // kept for badge count

  const gAToday=groupA.active.reduce((s,c)=>s+c.todayCost,0);const gA3d=groupA.active.reduce((s,c)=>s+c.sav3d,0);const gA7d=groupA.active.reduce((s,c)=>s+c.sav7d,0);
  const gBToday=groupB.active.reduce((s,c)=>s+c.todayCost,0);const gB3d=groupB.active.reduce((s,c)=>s+c.sav3d,0);const gB7d=groupB.active.reduce((s,c)=>s+c.sav7d,0);

  const selStyle={border:"1px solid "+T.border+"80",borderRadius:8,padding:"4px 8px",fontSize:10,color:T.text,background:"#fff",cursor:"pointer",outline:"none",minWidth:70};
  const resetAll=()=>{setAFpStatus("All");setACat("All");setARisk("All");setACostBand("All");setAPolF("All");setAPodF("All");setACarF("All");setATopN("All");setAStageF("All");setBFpStatus("All");setBCat("All");setBRisk("All");setBCostBand("All");setBPolF("All");setBPodF("All");setBCarF("All");setBTopN("All");setBStageF("All");};

  // Planner view toggle
  const[plannerView,setPlannerView]=useState("planner"); // "planner" | "forecast"

  // General filters for forecast view
  const[fFpStatus,setFFpStatus]=useState("All");
  const[fCat,setFCat]=useState("All");
  const[fRisk,setFRisk]=useState("All");
  const[fCarF,setFCarF]=useState("All");
  const[fPolF,setFPolF]=useState("All");
  const[fPodF,setFPodF]=useState("All");
  const[fSortCol,setFSortCol]=useState("todayCost");
  const[fSortDir,setFSortDir]=useState("desc");

  // Filtered containers for forecast view
  const forecastContainers=useMemo(()=>{
    return allContainers.filter(c=>{
      if(fFpStatus!=="All"&&c.fpStatus!==fFpStatus)return false;
      if(fCat!=="All"&&c.cat!==fCat)return false;
      if(fRisk!=="All"&&c.riskLevel!==fRisk)return false;
      if(fCarF!=="All"&&c.ca!==fCarF)return false;
      if(fPolF!=="All"&&c.po!==fPolF)return false;
      if(fPodF!=="All"&&c.pd!==fPodF)return false;
      return true;
    });
  },[allContainers,fFpStatus,fCat,fRisk,fCarF,fPolF,fPodF]);

  // 30-day forecast data — includes already overdue containers + newly expiring
  // Day 0 = today, shows cost if no action is taken
  const forecastChartData=useMemo(()=>{
    return Array.from({length:31},(_,i)=>{
      const dayLabel=i===0?"Today":"+"+i+"d";
      // All containers that are already overdue contribute daily burn from day 0
      // Containers expiring on day i start contributing from day i onwards
      const dayCost=forecastContainers.reduce((s,c)=>{
        // Already expired: contributing from day 0 — accumulates every day
        const alreadyExpired=c.fpStatus==="Expired";
        // Expiring on day X (using oDet as days remaining proxy — negative = already expired)
        const daysRemaining=c.fpStatus==="Expiring Today"?0:c.fpStatus==="Expiring 48h"?1:c.fpStatus==="Green"?5:-1;
        const startsOnDay=alreadyExpired?0:Math.max(0,daysRemaining);
        if(i>=startsOnDay){
          const daysAccruing=i-startsOnDay+1;
          return s+(c.daily*daysAccruing);
        }
        return s;
      },0);
      const dailyBurnOnDay=forecastContainers.reduce((s,c)=>{
        const alreadyExpired2=c.fpStatus==="Expired";
        const daysRemaining2=c.fpStatus==="Expiring Today"?0:c.fpStatus==="Expiring 48h"?1:c.fpStatus==="Green"?5:-1;
        const startsOnDay2=alreadyExpired2?0:Math.max(0,daysRemaining2);
        return i>=startsOnDay2?s+c.daily:s;
      },0);
      return{day:dayLabel,offset:i,cumulativeCost:Math.round(dayCost),dailyBurn:dailyBurnOnDay};
    });
  },[forecastContainers]);

  // Charge breakdown scales with forecast date — each day adds proportional accrual to base portfolio
  const chargeData=useMemo(()=>{
    const acc={Origin:{Detention:0,Demurrage:0,Storage:0,"Bundled D&D":0},Dest:{Detention:0,Demurrage:0,Storage:0,"Bundled D&D":0}};
    CDATA.topRisk.forEach(c=>{
      const daily=Math.max(0,Math.round((c.cost3d-c.cost)/3));
      const val=predDays>0?daily*predDays:c.cost;
      const sideKey=["Gate Out POD","Discharge POD","Empty Return"].includes(c.stage)?"Dest":"Origin";
      const catKey=c.cat in acc.Origin?c.cat:"Bundled D&D";
      acc[sideKey][catKey]+=val;
    });
    return[{side:"Origin",...acc.Origin},{side:"Dest",...acc.Dest}];
  },[predDays]);

  const ContainerCard=({c,dimmed})=><div style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",borderRadius:6,marginBottom:2,background:"#fff",opacity:dimmed?.3:1,borderLeft:"3px solid "+catColor(c.cat)}}>
    <div><div style={{fontSize:10,fontWeight:600}}>{c.cn}</div><div style={{fontSize:9,color:T.sub}} title={c.po+"→"+c.pd}>{c.ca+" | "+portShort(c.po)+"→"+portShort(c.pd)+" | "+c.fpStatus}</div></div>
    <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:T.green}}>{"Avoidable: "+fmt(c.todayCost)}</div><div style={{fontSize:10,color:T.sub}}>{"+3d: "+fmt(c.sav3d)+" | +7d: "+fmt(c.sav7d)}</div><div style={{fontSize:10,color:T.red}}>{"$"+c.daily+"/day"}</div></div>
  </div>;

  const GroupSummary=({data,color,label})=><div style={{background:color+"08",borderRadius:8,padding:10,marginBottom:6,border:"1px solid "+color+"20"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color}}>{label+" ("+data.active.length+")"}</span><span style={{fontSize:20,fontWeight:800,color:T.green}}>{fmt(data.active.reduce((s,c)=>s+c.todayCost,0))}</span></div>
    <div style={{fontSize:11,color:T.sub,marginTop:2}}>{"Avoidable today | Avg: "+(data.active.length>0?fmt(Math.round(data.active.reduce((s,c)=>s+c.todayCost,0)/data.active.length)):"N/A")+"/container | Burn: "+fmt(data.active.reduce((s,c)=>s+c.daily,0))+"/day"}</div>
    <div style={{fontSize:11,color:T.sub}}>{"+3d: "+fmt(data.active.reduce((s,c)=>s+c.sav3d,0))+" | +7d: "+fmt(data.active.reduce((s,c)=>s+c.sav7d,0))}</div>
  </div>;

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Cost Optimizer" sub="Where should I spend limited effort? Prioritize containers by avoidable cost and deploy resources for maximum impact."/>
    {/* ── IMPACT SUMMARY ── */}
    {(()=>{
      const totalExp=allContainers.reduce((s,c)=>s+c.todayCost,0);
      const totalBurn=allContainers.reduce((s,c)=>s+c.daily,0);
      const atRisk=allContainers.filter(c=>c.fpStatus!=="Green").length;
      const topN=Math.min(25,allContainers.length);const potSavings=allContainers.slice(0,topN).reduce((s,c)=>s+c.todayCost,0);
      return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[
          {label:predDays===0?"Total Accumulated Cost":"Projected Exposure",value:fmt(totalExp),sub:predDays===0?"accumulated to date (est.)":"if no action by "+predDate,color:T.red},
          {label:"Containers at Risk",value:atRisk,sub:"past or near free period threshold",color:T.amber},
          {label:"Daily Burn Rate",value:totalBurn>0?fmt(totalBurn)+"/d":"—",sub:"accumulating right now across portfolio",color:T.red},
          {label:"Potential Savings (Top "+topN+")",value:potSavings>0?fmt(potSavings):"—",sub:"if top "+topN+" containers cleared today",color:T.green},
        ].map((d,i)=><Card key={i} style={{padding:"14px 16px",borderLeft:"3px solid "+d.color}}>
          <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{d.label}</div>
          <div style={{fontSize:20,fontWeight:800,color:d.color}}>{d.value}</div>
          <div style={{fontSize:9,color:T.dim,marginTop:2}}>{d.sub}</div>
        </Card>)}
      </div>;
    })()}
    {allContainers.length===0&&<div style={{background:T.greenBg,border:"1px solid "+T.green+"40",borderRadius:8,padding:"10px 14px",marginBottom:14,borderLeft:"3px solid "+T.green}}><div style={{fontSize:12,fontWeight:700,color:T.green}}>✓ No containers currently exceed free period thresholds. Nothing to prioritize.</div></div>}
    {/* FORECAST DATE — global control */}
    <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:T.card2,borderRadius:10,border:"1.5px solid "+T.blue+"50",marginBottom:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
        <div style={{fontSize:9,fontWeight:700,color:T.blue,textTransform:"uppercase",letterSpacing:"0.5px"}}>Forecast Date</div>
        <input type="date" value={predDate} onChange={e=>setPredDate(e.target.value)} min={new Date().toISOString().slice(0,10)} max="2026-12-31" style={{border:"1.5px solid "+T.blue,borderRadius:7,padding:"7px 12px",fontSize:13,fontWeight:700,outline:"none",background:"#fff",color:T.text,colorScheme:"light"}}/>
      </div>
      <div style={{width:1,height:44,background:T.border,flexShrink:0}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,flex:1}}>
        <div style={{background:"#fff",borderRadius:8,padding:"8px 12px",borderTop:"2px solid "+T.blue}}><div style={{fontSize:9,color:T.sub}}>Days from Reference</div><div style={{fontSize:22,fontWeight:700,color:T.blue}}>{predDays}</div></div>
        <div style={{background:"#fff",borderRadius:8,padding:"8px 12px",borderTop:"2px solid "+T.text}}><div style={{fontSize:9,color:T.sub}}>Containers Affected</div><div style={{fontSize:22,fontWeight:700,color:T.text}}>{allContainers.filter(c=>c.fpStatus!=="Green").length+Math.round(predDays*4.2)}</div></div>
        <div style={{background:T.redBg,borderRadius:8,padding:"8px 12px",borderTop:"2px solid "+T.red}}><div style={{fontSize:9,color:T.red}}>Accumulated Cost (est.)</div><div style={{fontSize:22,fontWeight:700,color:T.red}}>{fmt(allContainers.reduce((s,c)=>s+c.todayCost,0))}</div></div>
      </div>
    </div>
    {/* COST FORECAST */}
    <Card style={{marginBottom:14,borderLeft:"3px solid "+T.blue}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Cost Forecast</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:T.card2}}>
          <th style={{padding:"8px 10px",textAlign:"left",color:T.dim,fontSize:10,fontWeight:600,borderRadius:"6px 0 0 6px"}}>Category</th>
          <th style={{padding:"8px 10px",textAlign:"right",color:T.dim,fontSize:10,fontWeight:600}}>Free Period</th>
          <th style={{padding:"8px 10px",textAlign:"right",color:T.dim,fontSize:10,fontWeight:600}}>Containers</th>
          <th style={{padding:"8px 10px",textAlign:"right",color:T.dim,fontSize:10,fontWeight:600}}>Avg $/Container/Day</th>
          <th style={{padding:"8px 10px",textAlign:"right",color:T.dim,fontSize:10,fontWeight:600,borderRadius:"0 6px 6px 0"}}>Projected Cost</th>
        </tr></thead>
        <tbody>{predCost.map((c,i)=><tr key={c.n} style={{background:i%2===0?"#fff":T.card2+"80",borderBottom:"1px solid "+T.border+"40"}}>
          <td style={{padding:"8px 10px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:2,background:c.c,flexShrink:0}}/><span style={{fontWeight:600}}>{c.n}</span></div></td>
          <td style={{padding:"8px 10px",textAlign:"right",color:T.sub}}>{c.fp}d</td>
          <td style={{padding:"8px 10px",textAlign:"right",color:T.sub}}>{c.containers}</td>
          <td style={{padding:"8px 10px",textAlign:"right",color:T.sub}}>{c.containers>0?"$"+c.dailyRate+"/d":"—"}</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:c.predicted>0?c.c:T.dim}}>{c.predicted>0?fmt(c.predicted):"—"}</td>
        </tr>)}
        <tr style={{background:T.card2,borderTop:"2px solid "+T.border}}>
          <td colSpan={4} style={{padding:"8px 10px",fontWeight:700,fontSize:11}}>Total</td>
          <td style={{padding:"8px 10px",textAlign:"right",fontWeight:800,fontSize:13,color:T.red}}>{fmt(predCost.reduce((s,c)=>s+c.predicted,0))}</td>
        </tr></tbody>
      </table>
      {predDays===0?<div style={{background:T.amberBg,border:"1px solid "+T.amber+"40",borderRadius:8,padding:"8px 12px",marginTop:8,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:11,color:T.amber,fontWeight:600}}>Select a future date to see cost projections. Today's view shows current baseline only.</div></div>:<Insight text={"If no containers are cleared by "+predDate+", your portfolio accumulates "+fmt(allContainers.reduce((s,c)=>s+c.todayCost,0))+" in avoidable charges across "+allContainers.filter(c=>c.fpStatus!=="Green").length+" at-risk containers. Use the planner below to prioritize."}/>}
    </Card>

    {/* ── RESOURCE ALLOCATION — WHERE SHOULD I DEPLOY ATTENTION? ── */}
    {(()=>{
      const sorted=[...allContainers].sort((a,b)=>b.todayCost-a.todayCost);
      const tiers=[
        {n:10,label:"Top 10",desc:"Highest urgency — act today"},
        {n:25,label:"Top 25",desc:"High impact — this week"},
        {n:50,label:"Top 50",desc:"Full sweep — this month"},
      ];
      return <Card style={{marginBottom:14,borderLeft:"3px solid "+T.green}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Resource Allocation</div>
        <div style={{fontSize:10,color:T.sub,marginBottom:12}}>If you deploy operational attention to the top N containers by avoidable cost today, how much can you save?</div>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
          <thead><tr style={{color:T.dim,fontSize:9}}>
            {["Priority Tier","Containers","Avoidable Cost Today","Daily Burn Stopped","Avg $/Container","Highest Cost in Set"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:h==="Priority Tier"?"left":"right",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",background:T.card2}}>{h}</th>)}
          </tr></thead>
          <tbody>{tiers.map((t,i)=>{
            const slice=sorted.slice(0,Math.min(t.n,sorted.length));
            const totalToday=slice.reduce((s,c)=>s+c.todayCost,0);
            const totalDaily=slice.reduce((s,c)=>s+c.daily,0);
            const avgPer=slice.length>0?Math.round(totalToday/slice.length):0;
            const topCost=slice.length>0?slice[0].todayCost:0;
            return <tr key={i} style={{background:"#fff",borderLeft:i===0?"3px solid "+T.red:i===1?"3px solid "+T.amber:"3px solid "+T.green}}>
              <td style={{padding:"8px 10px",borderRadius:"6px 0 0 6px"}}><div style={{fontWeight:700,color:T.text}}>{t.label}</div><div style={{fontSize:9,color:T.sub}}>{t.desc}</div></td>
              <td style={{padding:"8px 10px",textAlign:"right",color:T.sub}}>{slice.length}</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:totalToday>0?T.red:T.dim}}>{totalToday>0?fmt(totalToday):"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,color:totalDaily>0?T.amber:T.dim}}>{totalDaily>0?fmt(totalDaily)+"/d":"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right",color:T.sub}}>{avgPer>0?fmt(avgPer):"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right",borderRadius:"0 6px 6px 0",fontWeight:600,color:topCost>0?T.red:T.dim}}>{topCost>0?fmt(topCost):"—"}</td>
            </tr>;
          })}</tbody>
        </table>
        <div style={{fontSize:9,color:T.dim,marginTop:8}}>Costs are estimated from daily burn rate × forecast days. Not billing data. Use Strategy Planner below to model specific container batches.</div>
      </Card>;
    })()}

    {/* CHARGE BREAKDOWN */}
    <ChartBox title="Split By Charge Type & Location" sub="All 4 charge types compared across origin and destination" h={200} insight={(()=>{const o=chargeData[0];const cats=["Detention","Demurrage","Storage","Bundled D&D"].map(k=>({n:k,v:o[k]||0}));const top=cats.reduce((a,b)=>b.v>a.v?b:a);return top.n+" at origin ("+fmt(top.v)+") is the dominant charge type. "+(top.n==="Bundled D&D"?"Evaluate whether separate rates would be cheaper in Surcharges tab.":"Focus on reducing origin "+top.n.toLowerCase()+" dwell.");})()}><ResponsiveContainer><BarChart data={chargeData}><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="side" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip content={<CTip/>}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><Bar dataKey="Detention" fill={T.amber}/><Bar dataKey="Demurrage" fill={T.purple}/><Bar dataKey="Storage" fill={T.green}/><Bar dataKey="Bundled D&D" fill={T.red}/></BarChart></ResponsiveContainer></ChartBox>

    {/* ── PRIORITIZATION STRATEGIES ── */}
    {(()=>{
      const presets=[
        {label:"High Savings",icon:"💰",desc:"Highest avoidable cost today",apply:()=>{setAFpStatus("All");setACat("All");setARisk("All");setACostBand("High Impact");setATopN("25");setBFpStatus("Expired");setBCat("All");setBRisk("High");setBCostBand("All");setBTopN("All");setFFpStatus("All");setFCat("All");setFRisk("All");setFCarF("All");}},
        {label:"High Risk",icon:"🚨",desc:"Expired + High risk only",apply:()=>{setAFpStatus("Expired");setACat("All");setARisk("High");setACostBand("All");setATopN("All");setBFpStatus("Expiring Today");setBCat("All");setBRisk("All");setBCostBand("All");setBTopN("All");setFFpStatus("Expired");setFCat("All");setFRisk("High");setFCarF("All");}},
        {label:"Port vs Depot",icon:"🎯",desc:"Port charges (Demurrage) vs depot charges (Detention)",apply:()=>{setAFpStatus("All");setACat("Demurrage");setARisk("All");setACostBand("All");setATopN("All");setACarF("All");setAPolF("All");setAPodF("All");setBFpStatus("All");setBCat("Detention");setBRisk("All");setBCostBand("All");setBTopN("All");setBCarF("All");setBPolF("All");setBPodF("All");setFFpStatus("All");setFCat("Demurrage");setFRisk("All");setFCarF("All");}},
        {label:"Carrier Compare",icon:"🚢",desc:"Two highest-risk carriers side by side",apply:()=>{setAFpStatus("All");setACat("All");setARisk("All");setACostBand("All");setACarF("OOLU");setATopN("All");setAPolF("All");setAPodF("All");setBFpStatus("All");setBCat("All");setBRisk("All");setBCostBand("All");setBCarF("MAEU");setBTopN("All");setBPolF("All");setBPodF("All");setFFpStatus("All");setFCat("All");setFRisk("All");setFCarF("OOLU");}},
      ];
      return <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Prioritization Strategies — Quick Load</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {presets.map((p,i)=><button key={i} onClick={p.apply} style={{padding:"10px 12px",borderRadius:8,border:"1px solid "+T.border,background:"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            <div style={{fontSize:12}}>{p.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:T.text,marginTop:4}}>{p.label}</div>
            <div style={{fontSize:9,color:T.sub,marginTop:2}}>{p.desc}</div>
          </button>)}
        </div>
      </div>;
    })()}
    {/* PRIORITIZATION PLANNER — with toggle */}
    <Card style={{marginBottom:14,background:T.actionBg,border:"1px solid "+T.blue+"15",boxShadow:"0 2px 8px rgba(37,99,235,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:16,fontWeight:700}}>Execution List</div>
          <div style={{fontSize:9,color:T.sub}}>
            {plannerView==="planner"?"Configure Group A and B independently, then compare to decide where to deploy resources.":"30-day cost forecast — filter containers to see projected cost accumulation trend."}
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{display:"flex",background:"#fff",border:"1px solid "+T.border,borderRadius:8,overflow:"hidden"}}>
            {[{id:"forecast",label:"📈 30-Day Forecast"},{id:"planner",label:"⚖ Strategy Planner"}].map(v=>
              <button key={v.id} onClick={()=>setPlannerView(v.id)} style={{padding:"5px 12px",border:"none",background:plannerView===v.id?T.blue+"15":"transparent",color:plannerView===v.id?T.blue:T.sub,fontSize:10,fontWeight:plannerView===v.id?700:400,cursor:"pointer",borderRight:"1px solid "+T.border,transition:"all .15s"}}>
                {v.label}
              </button>
            )}
          </div>
          {plannerView==="planner"&&<button onClick={resetAll} style={{padding:"5px 12px",borderRadius:6,border:"1px solid "+T.border,background:"#fff",color:T.sub,fontSize:10,fontWeight:600,cursor:"pointer"}}>Reset All</button>}
        </div>
      </div>

      {/* ── 30-DAY FORECAST VIEW ── */}
      {plannerView==="forecast"&&(()=>{
        const sortedForecast=[...forecastContainers].sort((a,b)=>fSortDir==="desc"?(b[fSortCol]||0)-(a[fSortCol]||0):(a[fSortCol]||0)-(b[fSortCol]||0));
        const SortTh=({col,label})=>{const active=fSortCol===col;return<th onClick={()=>{if(fSortCol===col)setFSortDir(d=>d==="desc"?"asc":"desc");else{setFSortCol(col);setFSortDir("desc");}}} style={{padding:"6px 8px",textAlign:"right",color:active?T.blue:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>{label}{active?fSortDir==="desc"?" ↓":" ↑":" ↕"}</th>;};
        return(
          <div>
            {/* Filters row */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,padding:"10px 12px",background:"#fff",borderRadius:8,border:"1px solid "+T.border+"60"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.sub,alignSelf:"center",marginRight:4}}>Filters:</div>
              {[
                {label:"Free Period",val:fFpStatus,set:setFFpStatus,opts:["Expired","Expiring Today","Expiring 48h","Green"]},
                {label:"Category",val:fCat,set:setFCat,opts:["Detention","Demurrage","Storage","Bundled D&D"]},
                {label:"Risk",val:fRisk,set:setFRisk,opts:["High","Medium","Low"]},
                {label:"POL",val:fPolF,set:setFPolF,opts:filterOpts.pols},
                {label:"POD",val:fPodF,set:setFPodF,opts:filterOpts.pods},
                {label:"Carrier",val:fCarF,set:setFCarF,opts:filterOpts.carriers},
              ].map(f=>(
                <div key={f.label} style={{display:"flex",flexDirection:"column",gap:2}}>
                  <div style={{fontSize:8,color:T.dim,fontWeight:600,textTransform:"uppercase"}}>{f.label}</div>
                  <select value={f.val} onChange={e=>f.set(e.target.value)} style={selStyle}>
                    <option value="All">All</option>
                    {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button onClick={()=>{setFFpStatus("All");setFCat("All");setFRisk("All");setFCarF("All");setFPolF("All");setFPodF("All");}} style={{alignSelf:"flex-end",padding:"4px 10px",borderRadius:6,border:"1px solid "+T.border,background:"#fff",color:T.sub,fontSize:9,fontWeight:600,cursor:"pointer"}}>Reset</button>
            </div>

            {/* Summary KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {[
                {label:"Containers",val:forecastContainers.length,color:T.text},
                {label:"Total Exposure Today",val:fmt(forecastContainers.reduce((s,c)=>s+c.todayCost,0)),color:T.red},
                {label:"Daily Burn Rate",val:fmt(forecastContainers.reduce((s,c)=>s+c.daily,0))+"/d",color:T.amber},
                {label:"Exposure in 30 Days",val:fmt(forecastContainers.reduce((s,c)=>s+c.daily*30+c.todayCost,0)),color:T.red},
              ].map(k=>(
                <div key={k.label} style={{background:"#fff",borderRadius:8,padding:"8px 12px",border:"1px solid "+T.border+"60"}}>
                  <div style={{fontSize:9,color:T.sub}}>{k.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:k.color}}>{k.val}</div>
                </div>
              ))}
            </div>

            {/* 30-day forecast chart */}
            <ChartBox title="Cumulative Cost Exposure — Next 30 Days" sub="If no containers are cleared, cost accumulates as shown. Each bar = new cost added on that day." h={220} insight={"At current burn rate of "+fmt(forecastContainers.reduce((s,c)=>s+c.daily,0))+"/day, exposure reaches "+fmt(forecastContainers.reduce((s,c)=>s+c.daily*30+c.todayCost,0))+" by day 30."}>
              <ResponsiveContainer>
                <ComposedChart data={forecastChartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/>
                  <XAxis dataKey="day" stroke={T.dim} fontSize={9} interval={4}/>
                  <YAxis stroke={T.dim} fontSize={9} tickFormatter={v=>fmt(v)} width={60}/>
                  <Tooltip formatter={(v,n)=>[fmt(v),n==="cumulativeCost"?"Cumulative Cost":"Daily Burn"]}/>
                  <Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v==="cumulativeCost"?"Cumulative Exposure":v==="dailyBurn"?"Daily Burn":v}</span>}/>
                  <Bar dataKey="cumulativeCost" fill={T.red+"80"} radius={[3,3,0,0]} name="cumulativeCost"/>
                  <Line type="monotone" dataKey="dailyBurn" stroke={T.amber} strokeWidth={2} dot={false} name="dailyBurn"/>
                </ComposedChart>
              </ResponsiveContainer>
            </ChartBox>

            {/* Container details table */}
            <div style={{marginTop:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700}}>Container Details</div>
                <div style={{fontSize:9,color:T.sub}}>{forecastContainers.length} containers matching filters</div>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 2px",fontSize:10}}>
                  <thead><tr style={{background:T.card2}}>
                    <th style={{padding:"6px 8px",textAlign:"left",color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase"}}>Container</th>
                    <th style={{padding:"6px 8px",textAlign:"left",color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase"}}>Carrier</th>
                    <th style={{padding:"6px 8px",textAlign:"left",color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase"}}>Lane</th>
                    <th style={{padding:"6px 8px",textAlign:"left",color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase"}}>Category</th>
                    <th style={{padding:"6px 8px",textAlign:"left",color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase"}}>FP Status</th>
                    <SortTh col="todayCost" label="Avoidable"/>
                    <SortTh col="daily" label="$/d"/>
                    <SortTh col="risk" label="Risk"/>
                  </tr></thead>
                  <tbody>
                    {sortedForecast.map((c,i)=>(
                      <tr key={c.cn} style={{background:i%2===0?"#fff":T.card2+"60"}}>
                        <td style={{padding:"5px 8px",fontWeight:600,fontFamily:"monospace",fontSize:10}}>{c.cn}</td>
                        <td style={{padding:"5px 8px",color:T.sub}}>{c.ca}</td>
                        <td style={{padding:"5px 8px",color:T.sub,fontFamily:"monospace",fontSize:9}} title={c.po+"→"+c.pd}>{portShort(c.po)}→{portShort(c.pd)}</td>
                        <td style={{padding:"5px 8px"}}><span style={{background:catColor(c.cat)+"20",color:catColor(c.cat),borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:600}}>{c.cat}</span></td>
                        <td style={{padding:"5px 8px"}}><span style={{color:c.fpStatus==="Expired"?T.red:c.fpStatus==="Green"?T.green:T.amber,fontWeight:600,fontSize:9}}>{c.fpStatus}</span></td>
                        <td style={{padding:"5px 8px",textAlign:"right",fontWeight:700,color:T.green}}>{fmt(c.todayCost)}<div style={{fontSize:8,color:T.sub}}>+3d:{fmt(c.sav3d)}</div></td>
                        <td style={{padding:"5px 8px",textAlign:"right",color:T.red,fontWeight:600}}>{"$"+c.daily}</td>
                        <td style={{padding:"5px 8px",textAlign:"right"}}><SolidBadge color={c.risk>=75?T.red:c.risk>=50?T.amber:T.green}>{c.risk>=75?"High":c.risk>=50?"Medium":"Low"}</SolidBadge></td>
                      </tr>
                    ))}
                    {sortedForecast.length===0&&<tr><td colSpan={8} style={{padding:20,textAlign:"center",color:T.dim,fontSize:11}}>No containers match the current filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── SCENARIO PLANNER VIEW ── */}
      {plannerView==="planner"&&<div>
      {/* GROUP A vs GROUP B side-by-side */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:8}}>
        {/* GROUP A */}
        <div>
          <div style={{background:T.blue,borderRadius:"8px 8px 0 0",padding:"6px 10px"}}><span style={{fontSize:11,fontWeight:700,color:"#fff"}}>Group A</span></div>
          <div style={{background:T.blue+"08",border:"1px solid "+T.blue+"25",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"8px 10px",marginBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:6}}>
              {[{l:"Free Period",v:aFpStatus,s:setAFpStatus,opts:["Expired","Expiring Today","Expiring 48h","Green"]},
                {l:"Category",v:aCat,s:setACat,opts:["Detention","Demurrage","Storage","Bundled D&D"]},
                {l:"Risk",v:aRisk,s:setARisk,opts:["High","Medium","Low"]},
              ].map(f=><div key={f.l}><div style={{fontSize:9,fontWeight:600,color:T.blue,marginBottom:2}}>{f.l}</div><select value={f.v} onChange={e=>f.s(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.blue+"40"}}><option value="All">All</option>{f.opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
              {[{l:"POL",v:aPolF,s:setAPolF,o:filterOpts.pols},{l:"POD",v:aPodF,s:setAPodF,o:filterOpts.pods},{l:"Carrier",v:aCarF,s:setACarF,o:filterOpts.carriers}].map(f=><div key={f.l}><div style={{fontSize:9,fontWeight:600,color:T.blue,marginBottom:2}}>{f.l}</div><select value={f.v} onChange={e=>f.s(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.blue+"40"}}><option value="All">All</option>{f.o.map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
              <div><div style={{fontSize:9,fontWeight:600,color:T.blue,marginBottom:2}}>Top N</div><select value={aTopN} onChange={e=>setATopN(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.blue+"40"}}><option value="All">All</option><option value="5">Top 5</option><option value="10">Top 10</option><option value="20">Top 20</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6,marginTop:6}}>
              <div><div style={{fontSize:9,fontWeight:600,color:T.blue,marginBottom:2}}>Stage</div><select value={aStageF} onChange={e=>setAStageF(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.blue+"40"}}><option value="All">All Stages</option>{filterOpts.stages.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
            </div>
          </div>
          <GroupSummary data={groupA} color={T.blue} label={"Group A ("+groupA.active.length+")"}/>
        </div>
        {/* VS divider */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,paddingTop:32}}>
          <div style={{width:1,flex:1,background:T.border}}/>
          <div style={{fontSize:16,fontWeight:800,color:T.dim}}>VS</div>
          <div style={{background:T.card2,borderRadius:8,padding:"8px 6px",textAlign:"center",border:"1px solid "+T.border}}>
            <div style={{fontSize:9,color:T.sub}}>Diff</div>
            <div style={{fontSize:13,fontWeight:800,color:T.green}}>{fmt(Math.abs(gAToday-gBToday))}</div>
            <div style={{fontSize:9,color:T.sub}}>{gAToday>=gBToday?"A more":"B more"}</div>
          </div>
          <div style={{width:1,flex:1,background:T.border}}/>
        </div>
        {/* GROUP B */}
        <div>
          <div style={{background:T.purple,borderRadius:"8px 8px 0 0",padding:"6px 10px"}}><span style={{fontSize:11,fontWeight:700,color:"#fff"}}>Group B</span></div>
          <div style={{background:T.purple+"08",border:"1px solid "+T.purple+"25",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"8px 10px",marginBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:6}}>
              {[{l:"Free Period",v:bFpStatus,s:setBFpStatus,opts:["Expired","Expiring Today","Expiring 48h","Green"]},
                {l:"Category",v:bCat,s:setBCat,opts:["Detention","Demurrage","Storage","Bundled D&D"]},
                {l:"Risk",v:bRisk,s:setBRisk,opts:["High","Medium","Low"]},
              ].map(f=><div key={f.l}><div style={{fontSize:9,fontWeight:600,color:T.purple,marginBottom:2}}>{f.l}</div><select value={f.v} onChange={e=>f.s(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.purple+"40"}}><option value="All">All</option>{f.opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
              {[{l:"POL",v:bPolF,s:setBPolF,o:filterOpts.pols},{l:"POD",v:bPodF,s:setBPodF,o:filterOpts.pods},{l:"Carrier",v:bCarF,s:setBCarF,o:filterOpts.carriers}].map(f=><div key={f.l}><div style={{fontSize:9,fontWeight:600,color:T.purple,marginBottom:2}}>{f.l}</div><select value={f.v} onChange={e=>f.s(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.purple+"40"}}><option value="All">All</option>{f.o.map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
              <div><div style={{fontSize:9,fontWeight:600,color:T.purple,marginBottom:2}}>Top N</div><select value={bTopN} onChange={e=>setBTopN(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.purple+"40"}}><option value="All">All</option><option value="5">Top 5</option><option value="10">Top 10</option><option value="20">Top 20</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6,marginTop:6}}>
              <div><div style={{fontSize:9,fontWeight:600,color:T.purple,marginBottom:2}}>Stage</div><select value={bStageF} onChange={e=>setBStageF(e.target.value)} style={{...selStyle,width:"100%",borderColor:T.purple+"40"}}><option value="All">All Stages</option>{filterOpts.stages.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
            </div>
          </div>
          <GroupSummary data={groupB} color={T.purple} label={"Group B ("+groupB.active.length+")"}/>
        </div>
      </div>

      {/* CONTAINER DETAIL TABLE */}
      {(()=>{
        const sortFn=(data,col,dir)=>[...data].sort((a,b)=>dir==="desc"?b[col]-a[col]:a[col]-b[col]);
        const sortedA=sortFn(groupA.active,aSortCol,aSortDir);const sortedB=sortFn(groupB.active,bSortCol,bSortDir);
        const mkOnSort=(setCol,setDir,col,curCol,curDir)=>()=>{if(col===curCol)setDir(d=>d==="desc"?"asc":"desc");else{setCol(col);setDir("desc");}};
        const SortTh=({col,label,sCol,sDir,onSort})=>{const active=sCol===col;return <th onClick={()=>onSort(col)} style={{padding:"6px 8px",textAlign:"right",color:active?T.blue:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>{label}{active?sDir==="desc"?" ↓":" ↑":" ↕"}</th>;};
        const thStyle=(right,active,color)=>({padding:"5px 6px",textAlign:right?"right":"left",color:active?color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",background:"inherit"});
        const ContainerRow=({c,dimmed})=><tr style={{background:"#fff",opacity:dimmed?.35:1,borderBottom:"1px solid "+T.border+"30"}}>
          <td style={{padding:"5px 6px",fontFamily:"monospace",fontSize:10,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{c.cn}</td>
          <td style={{padding:"5px 6px",fontSize:10,color:T.sub}}>{c.ca}</td>
          <td style={{padding:"5px 6px",fontSize:10,color:T.sub,whiteSpace:"nowrap"}} title={c.po+"→"+c.pd}>{portShort(c.po)+"→"+portShort(c.pd)}</td>
          <td style={{padding:"5px 6px"}}><Badge color={catColor(c.cat)}>{c.cat}</Badge></td>
          <td style={{padding:"5px 6px",fontSize:10,color:c.fpStatus==="Expired"?T.red:c.fpStatus==="Green"?T.green:T.amber,fontWeight:600,whiteSpace:"nowrap"}}>{c.fpStatus}</td>
          <td style={{padding:"5px 6px",textAlign:"right"}}>
            <div style={{fontWeight:700,color:T.green,fontSize:10}}>{fmt(c.todayCost)}</div>
            <div style={{fontSize:8,color:T.sub,lineHeight:1.5}}>{"3d: "+fmt(c.sav3d)}</div>
            <div style={{fontSize:8,color:T.sub,lineHeight:1.5}}>{"7d: "+fmt(c.sav7d)}</div>
          </td>
          <td style={{padding:"5px 6px",textAlign:"right",color:T.red,fontSize:9,fontWeight:600}}>{"$"+c.daily}</td>
          <td style={{padding:"5px 6px",textAlign:"right"}}><SolidBadge color={c.risk>=75?T.red:c.risk>=50?T.amber:T.green}>{c.risk}</SolidBadge></td>
        </tr>;
        return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
          {[[sortedA,aSortCol,aSortDir,setASortCol,setASortDir,T.blue,"A"],[sortedB,bSortCol,bSortDir,setBSortCol,setBSortDir,T.purple,"B"]].map(([data,sCol,sDir,setCol,setDir,color,label])=><div key={label} style={{minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontSize:10,fontWeight:700,color}}>Group {label} — Container Details</div><DlBtn onClick={()=>dlCSV("group_"+label+"_containers_"+new Date().toISOString().slice(0,10),["Container","Carrier","Lane","Category","FP Status","Avoidable Today","Avoidable 3d","Avoidable 7d","$/Day","Risk"],data.map(c=>[c.cn,c.ca,c.po+"→"+c.pd,c.cat,c.fpStatus,c.todayCost,c.sav3d,c.sav7d,c.daily,c.risk]))}/></div>
            <div style={{maxHeight:240,overflowY:"auto",overflowX:"auto",borderRadius:8,border:"1px solid "+T.border+"40"}}>
              <table style={{minWidth:480,borderCollapse:"collapse",fontSize:10,tableLayout:"auto"}}>
                <thead style={{position:"sticky",top:0,zIndex:2,background:color==="#2563EB"?"#EFF6FF":"#F5F3FF"}}>
                  <tr>
                    {[["Container",false,false],["Carrier",false,false],["Lane",false,false],["Cat",false,false],["FP Status",false,false]].map(([h])=><th key={h} style={thStyle(false,false,color)}>{h}</th>)}
                    <th onClick={()=>mkOnSort(setCol,setDir,"todayCost",sCol,sDir)()} style={thStyle(true,sCol==="todayCost",color)}>{"Avoidable"+(sCol==="todayCost"?sDir==="desc"?" ↓":" ↑":" ↕")}</th>
                    <th onClick={()=>mkOnSort(setCol,setDir,"daily",sCol,sDir)()} style={thStyle(true,sCol==="daily",color)}>{"$/d"+(sCol==="daily"?sDir==="desc"?" ↓":" ↑":" ↕")}</th>
                    <th onClick={()=>mkOnSort(setCol,setDir,"risk",sCol,sDir)()} style={thStyle(true,sCol==="risk",color)}>{"Risk"+(sCol==="risk"?sDir==="desc"?" ↓":" ↑":" ↕")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(c=><ContainerRow key={c.cn} c={c}/>)}
                  {label==="A"&&groupA.excluded.map(c=><ContainerRow key={c.cn} c={c} dimmed/>)}
                  {label==="B"&&groupB.excluded.map(c=><ContainerRow key={c.cn} c={c} dimmed/>)}
                  {data.length===0&&<tr><td colSpan={8} style={{padding:"16px",textAlign:"center",color:T.dim,fontSize:10}}>No containers match current filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:9,color:T.dim,marginTop:3,fontStyle:"italic"}}>Dimmed rows excluded by Top N. Verify customs & docs before acting.</div>
          </div>)}
        </div>;
      })()}
      {groupA.active.length>0&&groupB.active.length>0&&aFpStatus===bFpStatus&&aCat===bCat&&aRisk===bRisk&&aCostBand===bCostBand&&aPolF===bPolF&&aPodF===bPodF&&aCarF===bCarF&&aTopN===bTopN&&<div style={{background:T.amberBg,borderRadius:6,padding:"6px 10px",marginTop:8,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:9,color:T.amber,fontWeight:600}}>⚠ Groups A and B have identical filters — comparison will always show $0 difference. Change at least one filter to make this meaningful.</div></div>}
      {groupA.active.length>0&&groupB.active.length>0&&(()=>{const EU=["DE","NL","BE","GB","FR","ES","IT","PL","SE","NO","FI","DK"];const AS=["CN","SG","TW","JP","TH","MY","PH","IN","KR","VN","HK","ID"];const isEU=p=>EU.some(x=>p.startsWith(x));const isAS=p=>AS.some(x=>p.startsWith(x));const aPs=new Set(groupA.active.map(c=>c.po));const bPs=new Set(groupB.active.map(c=>c.po));const aEU=[...aPs].some(isEU);const aAS=[...aPs].some(isAS);const bEU=[...bPs].some(isEU);const bAS=[...bPs].some(isAS);const cross=(aEU&&bAS)||(aAS&&bEU);const allPorts=[...aPs,...bPs];const hasUnknown=allPorts.some(p=>!isEU(p)&&!isAS(p));return cross?<div style={{background:T.amberBg,borderRadius:6,padding:"6px 10px",marginTop:8,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:9,color:T.amber,fontWeight:600}}>{"⚠ These groups span different regions (Europe vs Asia). Resources typically cannot be shared across continents. Consider comparing ports within the same region."}</div></div>:hasUnknown?<div style={{background:T.amberBg,borderRadius:6,padding:"6px 10px",marginTop:8,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:9,color:T.amber,fontWeight:600}}>⚠ Could not determine regions for some ports. Verify resource sharing manually.</div></div>:null;})()}
      {/* DECISION BAR */}
      {groupA.active.length===0&&groupB.active.length===0&&<div style={{background:T.amberBg,borderRadius:6,padding:"6px 10px",marginTop:8,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:9,color:T.amber,fontWeight:600}}>⚠ No containers match the current filter combination for either group. Try broadening your filters or using a Prioritization Strategy above.</div></div>}
      {(groupA.active.length===0&&groupB.active.length>0)||(groupA.active.length>0&&groupB.active.length===0)?<div style={{background:T.blueBg,borderRadius:6,padding:"6px 10px",marginTop:8,borderLeft:"3px solid "+T.blue}}><div style={{fontSize:9,color:T.blue,fontWeight:600}}>{(groupA.active.length===0?"Group A":"Group B")+" has no matching containers — configure its filters to enable comparison."}</div></div>:null}
      {(groupA.active.length>0||groupB.active.length>0)&&<div style={{background:"#fff",borderRadius:8,padding:10,marginTop:10,border:"1px solid "+T.green+"40"}}>
        {gAToday===gBToday?<div style={{fontSize:11,fontWeight:700,color:T.sub}}>{"Both groups have identical cost avoidance ("+fmt(gAToday)+"). Choose based on operational priority."}</div>:<><div style={{fontSize:11,fontWeight:700,color:T.green}}>{"Recommendation: "+(gAToday>gBToday?"Group A":"Group B")+" avoids "+fmt(Math.abs(gAToday-gBToday))+" more based on today's prediction."}</div>
        <div style={{fontSize:9,color:T.sub}}>{"Acting on "+(gAToday>gBToday?"Group A":"Group B")+"'s top containers avoids "+fmt(Math.max(gAToday,gBToday))+" this period at "+fmt(Math.max(gAToday>gBToday?groupA.active.reduce((s,c)=>s+c.daily,0):groupB.active.reduce((s,c)=>s+c.daily,0),0))+"/day burn."}</div></>}
      </div>}
                  {(groupA.active.length>0||groupB.active.length>0)&&<div style={{marginTop:10}}><ChartBox title="Group Comparison" sub="Today (blue) vs +3d (green) vs +7d (red)" h={140}><ResponsiveContainer><BarChart data={[{name:"Group A",Today:gAToday,"+3d":gA3d,"+7d":gA7d},{name:"Group B",Today:gBToday,"+3d":gB3d,"+7d":gB7d}]}><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip formatter={v=>fmt(v)}/><Bar dataKey="Today" fill={T.blue} radius={[3,3,0,0]}/><Bar dataKey="+3d" fill={T.green} radius={[3,3,0,0]}/><Bar dataKey="+7d" fill={T.red} radius={[3,3,0,0]}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/></BarChart></ResponsiveContainer></ChartBox></div>}
      </div>}{/* end plannerView==="planner" */}
    </Card>{/* end outer planner Card */}

    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Actionable Observations</div>
      {(()=>{const detFP=BASE.costMatrix.detention_origin.avgFP;const detAvg=BASE.stageDays.origin_detention.avg;const detUtil=Math.round(detAvg/detFP*100);const combPct=Math.round(BASE.costMatrix.dnd_origin.total/BASE.grandTotal*100);const sepT=BASE.costMatrix.detention_origin.total+BASE.costMatrix.demurrage_origin.total;const combPrem=sepT>0?Math.round((BASE.costMatrix.dnd_origin.total-sepT)/sepT*100):0;const top3=allContainers.slice(0,3);const top3burn=top3.reduce((s,c)=>s+c.daily,0);const top3sav=top3.reduce((s,c)=>s+c.sav3d,0);const maxODet=top3.length>0?Math.max(...top3.map(c=>c.oDet)):0;return[{c:T.green,t:"Origin detention at "+detUtil+"% free-time utilization",b:"Avg "+detAvg+"d vs "+detFP+"d free. "+(detUtil>90?"Any delay triggers charges immediately.":"Some buffer remains but monitor closely."),a:"Coordinate with depot to ensure gate-in within "+Math.floor(detFP)+" days of pickup."},
        {c:T.amber,t:"Bundled D&D origin = "+combPct+"% of total cost",b:"Combined rate is "+combPrem+"% more expensive than separate on origin lanes.",a:"Evaluate switching to separate rates in Surcharges tab."},
        {c:T.red,t:"Top 3 containers burn "+fmt(top3burn)+"/day combined",b:"These have been in origin detention for "+Math.round(maxODet)+"+ days, deep in higher tier rates.",a:"Clearing within 3 days avoids "+fmt(top3sav)+" in additional charges."}]})().map((ins,i)=><div key={i} style={{background:T.card2,borderRadius:8,padding:10,marginBottom:6,borderLeft:"3px solid "+ins.c}}><div style={{fontSize:11,fontWeight:600,marginBottom:2}}>{ins.t}</div><div style={{fontSize:11,color:T.sub,lineHeight:1.4}}>{"Because: "+ins.b}</div><div style={{fontSize:11,color:ins.c,fontWeight:600}}>{"Action: "+ins.a}</div></div>)}
    </Card>
  </div>);

}

// ═══ MODULE 5: HISTORICAL ═══
function HistoryPage({setPage,navToSurchargesPort,allowedTabs}){
  const can=id=>allowedTabs.includes(id);
  const[trendFilter,setTrendFilter]=useState("all");const[portTab,setPortTab]=useState("pol");
  const[selPort,setSelPort]=useState(null);
  useEffect(()=>setSelPort(null),[portTab]);
  const monthlyCost=useMemo(()=>{if(trendFilter==="all")return BASE.monthlyCost;return BASE.monthlyCost.map(m=>trendFilter==="origin"?{...m,detention:m.oDetention,demurrage:m.oDemurrage,storage:m.oStorage,combined:m.oCombined}:{...m,detention:m.dDetention,demurrage:m.dDemurrage,storage:m.dStorage,combined:m.dCombined});},[trendFilter]);
  const stageData=useMemo(()=>[
    {stage:"Origin Depot",costType:"Detention",avgDays:BASE.stageDays.origin_detention.avg,cost:BASE.costMatrix.detention_origin.total,color:T.amber,freeTime:BASE.costMatrix.detention_origin.avgFP,breach:Math.max(0,BASE.stageDays.origin_detention.avg-BASE.costMatrix.detention_origin.avgFP),prevent:"Faster documentation, earlier truck booking"},
    {stage:"Origin Port",costType:"Demurrage",avgDays:BASE.stageDays.origin_demurrage.avg,cost:BASE.costMatrix.demurrage_origin.total,color:T.purple,freeTime:BASE.costMatrix.demurrage_origin.avgFP,breach:Math.max(0,BASE.stageDays.origin_demurrage.avg-BASE.costMatrix.demurrage_origin.avgFP),prevent:"Monitor vessel schedules, ensure booking alignment"},
    {stage:"Combined Origin",costType:"Combined",avgDays:BASE.stageDays.combined_origin.avg,cost:BASE.costMatrix.dnd_origin.total,color:T.red,freeTime:BASE.costMatrix.dnd_origin.avgFP,breach:Math.max(0,BASE.stageDays.combined_origin.avg-BASE.costMatrix.dnd_origin.avgFP),prevent:"Negotiate longer combined free period"},
    {stage:"Dest Port",costType:"Demurrage",avgDays:BASE.stageDays.dest_demurrage.avg,cost:BASE.costMatrix.demurrage_destination.total,color:T.purple,freeTime:BASE.costMatrix.demurrage_destination.avgFP,breach:Math.max(0,BASE.stageDays.dest_demurrage.avg-BASE.costMatrix.demurrage_destination.avgFP),prevent:"Advance customs clearance, pre-arrange warehouse"},
    {stage:"Dest Depot",costType:"Detention",avgDays:BASE.stageDays.dest_detention.avg,cost:BASE.costMatrix.detention_destination.total,color:T.amber,freeTime:BASE.costMatrix.detention_destination.avgFP,breach:Math.max(0,BASE.stageDays.dest_detention.avg-BASE.costMatrix.detention_destination.avgFP),prevent:"Ensure truck availability at destination"},
    {stage:"Combined Dest",costType:"Combined",avgDays:BASE.stageDays.combined_dest.avg,cost:BASE.costMatrix.dnd_destination.total,color:T.red,freeTime:BASE.costMatrix.dnd_destination.avgFP,breach:Math.max(0,BASE.stageDays.combined_dest.avg-BASE.costMatrix.dnd_destination.avgFP),prevent:"Monitor destination process overall"}
  ],[]);
  const totalStageCost=stageData.reduce((s,c)=>s+c.cost,0);
  // Cost-share weights from BASE.costMatrix: O→ Det 28%, Dem 13%, Sto 2%, Comb 57% | D→ Det 19%, Dem 50%, Sto 13%, Comb 18%
  const polData=useMemo(()=>{const m={};BASE.topLanes.forEach(l=>{const p=l.lane.slice(0,5);if(!m[p])m[p]={port:p,containers:0,tODet:0,tODem:0,tOSto:0,tOComb:0};m[p].containers+=l.containers;m[p].tODet+=l.avgODet*l.containers;m[p].tODem+=l.avgODem*l.containers;m[p].tOSto+=(l.avgOSto||0)*l.containers;m[p].tOComb+=(l.avgOComb||0)*l.containers;});return Object.values(m).map(p=>{const c=p.containers;const avgODet=+(p.tODet/c).toFixed(2);const avgODem=+(p.tODem/c).toFixed(2);const avgOSto=+(p.tOSto/c).toFixed(2);const avgOComb=+(p.tOComb/c).toFixed(2);return{...p,avgODet,avgODem,avgOSto,avgOComb,totalDwell:+((p.tODet+p.tODem+p.tOSto+p.tOComb)/c).toFixed(2),score:+(avgODet*0.28+avgODem*0.13+avgOSto*0.02+avgOComb*0.57).toFixed(1)};}).sort((a,b)=>b.score-a.score);},[]);
  const podData=useMemo(()=>{const m={};BASE.topLanes.forEach(l=>{const p=l.lane.slice(6,11);if(!m[p])m[p]={port:p,containers:0,tDDem:0,tDDet:0,tDSto:0,tDComb:0};m[p].containers+=l.containers;m[p].tDDem+=l.avgDDem*l.containers;m[p].tDDet+=l.avgDDet*l.containers;m[p].tDSto+=(l.avgDSto||0)*l.containers;m[p].tDComb+=(l.avgDComb||0)*l.containers;});return Object.values(m).map(p=>{const c=p.containers;const avgDDem=+(p.tDDem/c).toFixed(2);const avgDDet=+(p.tDDet/c).toFixed(2);const avgDSto=+(p.tDSto/c).toFixed(2);const avgDComb=+(p.tDComb/c).toFixed(2);return{...p,avgDDem,avgDDet,avgDSto,avgDComb,totalDwell:+((p.tDDem+p.tDDet+p.tDSto+p.tDComb)/c).toFixed(2),score:+(avgDDet*0.19+avgDDem*0.50+avgDSto*0.13+avgDComb*0.18).toFixed(1)};}).sort((a,b)=>b.score-a.score);},[]);
  const portfolioAvg=useMemo(()=>{const all=portTab==="pol"?polData:podData;const t=all.reduce((s,p)=>s+p.totalDwell*p.containers,0);const c=all.reduce((s,p)=>s+p.containers,0);return c>0?+(t/c).toFixed(1):0;},[polData,podData,portTab]);
  const globalAvg=BASE.topLanes.length>0?BASE.topLanes.reduce((s,l)=>s+(l.avgODet+l.avgODem+l.avgDDem+l.avgDDet),0)/BASE.topLanes.length:0;
  const lanes=useMemo(()=>BASE.topLanes.map(l=>{const td=l.avgODet+l.avgODem+l.avgDDem+l.avgDDet;const fp=BASE.costMatrix.dnd_origin.avgFP;const bp=Math.max(0,+(td-fp).toFixed(2));const cpc=Math.round(bp*72);return{...l,totalDwell:+td.toFixed(2),costPerContainer:cpc,beyondFP:bp};}).sort((a,b)=>b.costPerContainer-a.costPerContainer),[]);

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Structural Leakage Analysis" sub="Where is D&D baked into your process? Find the ports, carriers, and stages that systematically generate charges."/>
    {/* ── STRUCTURAL ALERTS ── */}
    {(()=>{
      const worstPort=portTab==="pol"
        ?polData.length>0?polData[0]:null
        :podData.length>0?podData[0]:null;
      const worstCarrier=[...Object.entries(BASE.carriers)].reduce((a,[n,d])=>d.avgODet+d.avgDDet>a[1]?[n,d.avgODet+d.avgDDet]:a,["—",0]);
      const worstStage=stageData.filter(s=>s.avgDays>0).reduce((a,b)=>b.breach>a.breach?b:a,stageData[0]);
      const totalSC=BASE.topLanes.reduce((s,l)=>s+((l.surchargePct??35)>35?1:0),0);
      return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {label:"Worst Origin Port",value:worstPort?worstPort.port:"—",sub:worstPort?"Score: "+worstPort.score+" — above portfolio avg":"No port data",color:worstPort&&worstPort.score>8?T.red:T.amber},
          {label:"Highest Risk Carrier",value:worstCarrier[0],sub:worstCarrier[1].toFixed(1)+"d combined origin dwell",color:T.amber},
          {label:"Highest Cost Stage",value:worstStage?worstStage.stage:"—",sub:worstStage&&worstStage.breach>0?"+"+worstStage.breach.toFixed(1)+"d breach beyond free period":"Within free period",color:worstStage&&worstStage.breach>0?T.red:T.green},
          {label:"High-Surcharge Lanes",value:totalSC,sub:totalSC>0?totalSC+" lanes with D&D >35% surcharge — renegotiate":"No surcharge flags — all lanes OK",color:totalSC>0?T.purple:T.green},
        ].map((d,i)=><Card key={i} style={{padding:"14px 16px",borderLeft:"3px solid "+d.color}}>
          <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{d.label}</div>
          <div style={{fontSize:18,fontWeight:800,color:d.color}}>{d.value}</div>
          <div style={{fontSize:9,color:T.dim,marginTop:2}}>{d.sub}</div>
        </Card>)}
      </div>;
    })()}
    <div style={{display:"flex",gap:6,marginBottom:10}}>{[{k:"all",l:"All"},{k:"origin",l:"Origin"},{k:"destination",l:"Destination"}].map(f=><Pill key={f.k} active={trendFilter===f.k} onClick={()=>setTrendFilter(f.k)} color={T.blue}>{f.l}</Pill>)}</div>
    <ChartBox title="Monthly D&D Cost Trend" sub={"Showing: "+(trendFilter==="all"?"All (Origin + Destination)":trendFilter==="origin"?"Origin only":"Destination only")} h={260} insight={(()=>{const peak=monthlyCost.reduce((a,b)=>b.total>a.total?b:a,monthlyCost[0]);const curr=monthlyCost[monthlyCost.length-1];const peakCpc=peak.containers>0?Math.round(peak.total/peak.containers):0;const currCpc=curr.containers>0?Math.round(curr.total/curr.containers):0;const mc=BASE.monthlyCost;const first=mc[0];const momChg=mc.length>=2?Math.round((curr.total-mc[mc.length-2].total)/mc[mc.length-2].total*100):0;const sinceFirst=first.containers>0?Math.round(first.total/first.containers):0;return curr.month+" is highest on record at "+fmt(curr.total)+" ("+curr.containers+" containers, $"+currCpc+"/ea) — "+momChg+"% vs prior month. Cost/container has risen from $"+sinceFirst+" in "+first.month+". D&D exposure is growing and requires active intervention.";})()}><ResponsiveContainer><AreaChart data={monthlyCost}><defs>{[{id:"gd",c:T.amber},{id:"gm",c:T.purple},{id:"gs",c:T.green},{id:"gc",c:T.red}].map(g=><linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={g.c} stopOpacity={.3}/><stop offset="100%" stopColor={g.c} stopOpacity={.05}/></linearGradient>)}</defs><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis dataKey="month" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip content={<CTip/>}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><Area type="monotone" dataKey="detention" name="Detention" stackId="1" stroke={T.amber} fill="url(#gd)"/><Area type="monotone" dataKey="demurrage" name="Demurrage" stackId="1" stroke={T.purple} fill="url(#gm)"/><Area type="monotone" dataKey="storage" name="Storage" stackId="1" stroke={T.green} fill="url(#gs)"/><Area type="monotone" dataKey="combined" name="Combined" stackId="1" stroke={T.red} fill="url(#gc)"/></AreaChart></ResponsiveContainer></ChartBox>


    {/* PERIOD COMPARISON */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,margin:"12px 0"}}>
      {(()=>{const mc=monthlyCost;if(mc.length<2)return<div style={{fontSize:10,color:T.sub,padding:"8px 0"}}>Period comparison requires at least 2 months of data.</div>;const prev=mc[mc.length-2];const curr=mc[mc.length-1];const costChg=prev.total>0?Math.round((curr.total-prev.total)/prev.total*100):0;const cnChg=prev.containers>0?Math.round(((curr.containers||0)-(prev.containers||0))/(prev.containers||1)*100):0;const prevCpc=prev.containers>0?Math.round(prev.total/prev.containers):0;const currCpc=curr.containers>0?Math.round(curr.total/curr.containers):0;const cpcChg=prevCpc>0?Math.round((currCpc-prevCpc)/prevCpc*100):0;return [{l:"Cost Change",v:(costChg>0?"+":"")+costChg+"%",c:costChg<=0?T.green:T.red,d:prev.month+"→"+curr.month},{l:"Containers",v:(cnChg>0?"+":"")+cnChg+"%",c:cnChg<=0?T.green:T.red,d:(prev.containers||0)+"→"+(curr.containers||0)},{l:"Cost/Container",v:(cpcChg>0?"+":"")+cpcChg+"%",c:cpcChg<=0?T.green:T.red,d:"$"+prevCpc+"→$"+currCpc},{l:"Trend Direction",v:costChg<=0&&cpcChg<=0?"Improving":"Needs Attention",c:costChg<=0&&cpcChg<=0?T.green:T.amber,d:costChg<=0?"Costs declining":"Costs rising"}].map(m=><Card key={m.l} style={{padding:10,textAlign:"center"}}><div style={{fontSize:10,color:T.sub}}>{m.d}</div><div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.v}</div><div style={{fontSize:10,color:T.sub}}>{m.l}</div></Card>);})()}
    </div>

    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Stage-Wise Cost Contribution</div><div style={{fontSize:11,color:T.sub,marginBottom:10}}>Which journey stages drive cost? Focus on "Over" rows.</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
        <thead><tr style={{background:T.card2}}>{["Stage","Type","Avg Dwell","Free Period","Breach","Cost","%","Status"].map((h,hi)=><th key={h} style={{padding:"8px 10px",textAlign:["Cost","%"].includes(h)?"right":"left",color:T.dim,fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",borderRadius:hi===0?"5px 0 0 5px":hi===7?"0 5px 5px 0":"0"}}>{h}{h==="Status"&&<HoverTip text={"Over: breach > 1d beyond free. Near: 0–1d. OK: within free period."}/>}{h==="Breach"&&<HoverTip text={"Avg dwell minus free period. Positive = days in paid tier."}/>}</th>)}</tr></thead>
        <tbody>{stageData.map((s,i)=>{const pct=Math.round(s.cost/Math.max(1,totalStageCost)*100);const v=s.avgDays===0?{t:"No Data",c:T.dim}:s.breach>1?{t:"Over",c:T.red}:s.breach>0?{t:"Near",c:T.amber}:{t:"OK",c:T.green};return <tr key={i} style={{background:i%2===0?"#fff":T.card2+"60",borderBottom:"1px solid "+T.border+"30"}}><td style={{padding:"8px 10px",fontWeight:600}}>{s.stage}</td><td style={{padding:"8px 10px"}}><Badge color={s.color}>{s.costType}</Badge></td><td style={{padding:"8px 10px",fontWeight:600}}>{s.avgDays.toFixed(1)}d</td><td style={{padding:"8px 10px",color:T.green,fontWeight:600}}>{s.freeTime}d</td><td style={{padding:"8px 10px",color:s.breach>0?T.red:T.green,fontWeight:700}}>{s.breach.toFixed(1)}d</td><td style={{padding:"8px 10px",color:s.color,fontWeight:600,textAlign:"right"}}>{fmt(s.cost)}</td><td style={{padding:"8px 10px",textAlign:"right"}}>{pct}%</td><td style={{padding:"8px 10px"}}><SolidBadge color={v.c}>{v.t}</SolidBadge></td></tr>;})}</tbody>
      </table>
    </Card>

    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Port Benchmarking</div><div style={{fontSize:11,color:T.sub,marginBottom:2}}>Compare port performance. Ports above the portfolio average line are underperforming.</div>
      <div style={{fontSize:9,color:T.dim,marginBottom:8}}>Based on top 10 lanes by volume only. Ports with heavy traffic outside these lanes may be under- or over-represented.</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}><Pill active={portTab==="pol"} onClick={()=>setPortTab("pol")} color={T.amber}>Origin (POL)</Pill><Pill active={portTab==="pod"} onClick={()=>setPortTab("pod")} color={T.purple}>Dest (POD)</Pill></div>
      <ChartBox title="Avg Dwell by Port" h={220}>{!(portTab==="pol"?polData:podData).length?<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:T.dim,fontSize:11}}>No port data available.</div>:<ResponsiveContainer><BarChart data={(portTab==="pol"?polData:podData).slice(0,8)} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis type="number" stroke={T.dim} fontSize={10} tickFormatter={v=>v+"d"}/><YAxis type="category" dataKey="port" width={55} stroke={T.dim} fontSize={10}/><Tooltip content={<CTip/>}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><ReferenceLine x={portfolioAvg} stroke={T.blue} strokeDasharray="6 3" label={{value:"Avg: "+portfolioAvg+"d",position:"top",fontSize:9,fill:T.blue}}/>{portTab==="pol"?[<Bar key="det" dataKey="avgODet" name="Det" fill={T.amber} stackId="p"/>,<Bar key="dem" dataKey="avgODem" name="Dem" fill={T.purple} stackId="p"/>,<Bar key="sto" dataKey="avgOSto" name="Sto" fill={T.green} stackId="p"/>,<Bar key="com" dataKey="avgOComb" name="Comb" fill={T.red} stackId="p" radius={[0,3,3,0]}/>]:[<Bar key="det" dataKey="avgDDet" name="Det" fill={T.amber} stackId="p"/>,<Bar key="dem" dataKey="avgDDem" name="Dem" fill={T.purple} stackId="p"/>,<Bar key="sto" dataKey="avgDSto" name="Sto" fill={T.green} stackId="p"/>,<Bar key="com" dataKey="avgDComb" name="Comb" fill={T.red} stackId="p" radius={[0,3,3,0]}/>]}</BarChart></ResponsiveContainer>}</ChartBox>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10,marginTop:8}}><thead><tr style={{color:T.dim,fontSize:10,textAlign:"left",background:T.card2}}>{["Port","Vol","Det","Dem","Sto","Comb","Total","Score","Rating"].map(h=><th key={h} style={{padding:"6px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Vol","Score"].includes(h)?"right":"left",whiteSpace:"nowrap"}}>{h}{h==="Score"&&<HoverTip text={"Cost-share weighted dwell score. Origin: Det×28%+Dem×13%+Sto×2%+Comb×57%. Dest: Det×19%+Dem×50%+Sto×13%+Comb×18%. Higher = worse."}/>}{h==="Rating"&&<HoverTip text={"High: score > 8. Monitor: 5–8. OK: < 5."}/>}</th>)}</tr></thead>
      <tbody>{(portTab==="pol"?polData:podData).map((p,i)=>{const r=p.score>8?{t:"High",c:T.red}:p.score>5?{t:"Monitor",c:T.amber}:{t:"OK",c:T.green};const isPol=portTab==="pol";const isSel=selPort&&selPort.port===p.port;return <tr key={i} onClick={()=>setSelPort(isSel?null:{...p,isPol})} style={{background:isSel?T.blueBg:T.card2,cursor:"pointer",transition:"filter .1s"}} onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.97)"} onMouseLeave={e=>e.currentTarget.style.filter=""}><td style={{padding:"6px 7px",borderRadius:"6px 0 0 6px",fontWeight:700,fontFamily:"monospace"}}>{p.port}{isSel&&<ChevronDown size={10} color={T.blue} style={{marginLeft:4}}/>}</td><td style={{padding:"6px 7px",color:T.sub,textAlign:"right"}}>{p.containers}</td><td style={{padding:"6px 7px",color:T.amber,fontWeight:700}}>{(isPol?p.avgODet:p.avgDDet)+"d"}</td><td style={{padding:"6px 7px",color:T.purple,fontWeight:700}}>{(isPol?p.avgODem:p.avgDDem)+"d"}</td><td style={{padding:"6px 7px",color:T.green,fontWeight:700}}>{(isPol?p.avgOSto:p.avgDSto)+"d"}</td><td style={{padding:"6px 7px",color:T.red,fontWeight:700}}>{(isPol?p.avgOComb:p.avgDComb)+"d"}</td><td style={{padding:"6px 7px",fontWeight:700}}>{p.totalDwell}d</td><td style={{padding:"6px 7px",fontWeight:700,textAlign:"right",color:p.score>8?T.red:p.score>5?T.amber:T.green}}>{p.score}</td><td style={{padding:"6px 7px",borderRadius:"0 6px 6px 0"}}><div style={{display:"flex",alignItems:"center",gap:6}}><SolidBadge color={r.c}>{r.t}</SolidBadge><span style={{fontSize:9,color:T.blue,fontWeight:600}}>Deep Dive →</span></div></td></tr>;})}</tbody></table>
    </Card>

    {/* ── PORT DEEP DIVE ── */}
    {selPort&&(()=>{
      const p=selPort;
      const topCarrier=Object.entries(BASE.carriers).reduce((a,[n,d])=>{
        const dwell=p.isPol?d.avgODet:d.avgDDet;
        return dwell>a[1]?[n,dwell]:a;
      },["—",0]);
      const topStage=stageData.filter(s=>p.isPol?s.stage.includes("Origin"):s.stage.includes("Dest")).reduce((a,b)=>b.breach>a.breach?b:a,stageData[0]);
      const affectedLanes=BASE.topLanes.filter(l=>p.isPol?l.lane.slice(0,5)===p.port:l.lane.slice(6,11)===p.port);
      const topSurcharge=p.isPol?"Origin Detention":"Dest Demurrage";
      const r=p.score>8?{t:"High Risk",c:T.red}:p.score>5?{t:"Monitor",c:T.amber}:{t:"OK",c:T.green};
      return <Card style={{marginTop:12,borderLeft:"3px solid "+r.c,background:T.card2+"60"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,fontFamily:"monospace"}}>{p.port} — Port Deep Dive</div>
            <div style={{fontSize:10,color:T.sub,marginTop:2}}>{p.isPol?"Origin (POL)":"Destination (POD)"} · {p.containers} containers · Score: <span style={{fontWeight:700,color:r.c}}>{p.score}</span></div>
          </div>
          <button onClick={()=>setSelPort(null)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={14} color={T.dim}/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label:"Top Carrier at this Port",value:topCarrier[0],sub:topCarrier[1].toFixed(1)+"d avg "+(p.isPol?"O.Det":"D.Det"),color:T.amber},
            {label:"Top Surcharge Category",value:topSurcharge,sub:"Highest cost driver at this port",color:T.purple},
            {label:"Highest Cost Stage",value:topStage?topStage.stage:"—",sub:topStage&&topStage.breach>0?"+"+topStage.breach.toFixed(1)+"d beyond free period":"Within free period",color:topStage&&topStage.breach>0?T.red:T.green},
            {label:"Affected Lanes",value:affectedLanes.length,sub:affectedLanes.slice(0,2).map(l=>l.lane).join(", ")+(affectedLanes.length>2?" +more":"") || "No matched lanes",color:T.blue},
          ].map((d,i)=><div key={i} style={{background:"#fff",borderRadius:8,padding:"12px 14px",borderLeft:"2px solid "+d.color}}>
            <div style={{fontSize:9,fontWeight:600,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{d.label}</div>
            <div style={{fontSize:16,fontWeight:800,color:d.color}}>{d.value}</div>
            <div style={{fontSize:9,color:T.dim,marginTop:2}}>{d.sub}</div>
          </div>)}
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:600,marginBottom:6}}>Dwell Profile — {p.port}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {(p.isPol?[{l:"Det",v:p.avgODet,fp:5.1,c:T.amber},{l:"Dem",v:p.avgODem,fp:3.1,c:T.purple},{l:"Sto",v:p.avgOSto||0,fp:3.1,c:T.green},{l:"Comb",v:p.avgOComb||0,fp:9.9,c:T.red}]:[{l:"Det",v:p.avgDDet,fp:6.0,c:T.amber},{l:"Dem",v:p.avgDDem,fp:3.0,c:T.purple},{l:"Sto",v:p.avgDSto||0,fp:3.0,c:T.green},{l:"Comb",v:p.avgDComb||0,fp:12.0,c:T.red}]).map((m,i)=>{
              const over=m.v>m.fp;
              return <div key={i} style={{background:"#fff",borderRadius:8,padding:"8px 10px",borderTop:"2px solid "+(over?T.red:m.c)}}>
                <div style={{fontSize:9,color:T.sub}}>{m.l}</div>
                <div style={{fontSize:16,fontWeight:700,color:over?T.red:m.c}}>{m.v.toFixed(1)}d</div>
                <div style={{fontSize:9,color:T.dim}}>FP: {m.fp}d {over?"⚠ Over":""}</div>
              </div>;
            })}
          </div>
        </div>
        {affectedLanes.length>0&&<div>
          <div style={{fontSize:11,fontWeight:600,marginBottom:6}}>Lanes through {p.port}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {affectedLanes.map((l,i)=><span key={i} style={{background:T.blue+"15",color:T.blue,borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:600,fontFamily:"monospace"}}>{l.lane}</span>)}
          </div>
          {can("surcharges")&&<div style={{marginTop:8,fontSize:10,color:T.sub}}>Take this port to <span style={{color:T.purple,fontWeight:700,cursor:"pointer"}} onClick={()=>navToSurchargesPort({...p,side:p.isPol?"Origin":"Dest"})}>Negotiation Center →</span> to build the free-day case.</div>}
        </div>}
      </Card>;
    })()}

    {false&&<div>{/* Top Lane Performance removed */}</div>}
    {/* ── WHAT SHOULD I DO NEXT? ── */}
    <div style={{marginTop:16,marginBottom:4}}>
      <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>What should I do next?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {title:"Click a port above for deep dive",sub:"The table above is clickable — select any port to see its top carrier, surcharge, stage, and affected lanes.",color:T.amber,icon:"🏭"},
          {title:"Negotiate by port",sub:"Use the Negotiation Center to build the case for extended free days on the lanes running through your worst port.",color:T.purple,icon:"📋",page:"surcharges"},
          {title:"Escalate worst carrier",sub:"Cross-reference structural leakage with Carrier Intel to confirm whether the port's issue is carrier-driven or process-driven.",color:T.blue,icon:"🚢",page:"carriers"},
        ].filter(d=>!d.page||can(d.page)).map((d,i)=><Card key={i} style={{padding:"14px 16px",cursor:d.page?"pointer":undefined,borderTop:"2px solid "+d.color}} onClick={()=>d.page&&setPage(d.page)}>
          <div style={{fontSize:10,fontWeight:700,color:d.color,marginBottom:4}}>{d.icon} {d.title}</div>
          <div style={{fontSize:10,color:T.sub,lineHeight:1.5,marginBottom:d.page?8:0}}>{d.sub}</div>
          {d.page&&<div style={{fontSize:10,fontWeight:700,color:d.color}}>→ {d.page==="surcharges"?"Negotiation Center":"Carrier Intel"}</div>}
        </Card>)}
      </div>
    </div>
  </div>);
}

// ═══ MODULE 6: NEGOTIATION CENTER ═══
function SurchargePage({setPage,selectedPort,clearPort,allowedTabs}){
  const can=id=>allowedTabs.includes(id);
  // Port-level data aggregated from top lanes
  const portNegData=useMemo(()=>{
    if(!BASE.topLanes.length)return{pols:[],pods:[]};
    const polMap={},podMap={};
    BASE.topLanes.forEach(l=>{
      const pol=l.lane.slice(0,5),pod=l.lane.slice(6,11);
      if(!polMap[pol])polMap[pol]={port:pol,side:"Origin",containers:0,tODet:0,tODem:0,tOSto:0,tOComb:0};
      polMap[pol].containers+=l.containers;polMap[pol].tODet+=l.avgODet*l.containers;polMap[pol].tODem+=l.avgODem*l.containers;polMap[pol].tOSto+=(l.avgOSto||0)*l.containers;polMap[pol].tOComb+=(l.avgOComb||0)*l.containers;
      if(!podMap[pod])podMap[pod]={port:pod,side:"Dest",containers:0,tDDem:0,tDDet:0,tDSto:0,tDComb:0};
      podMap[pod].containers+=l.containers;podMap[pod].tDDem+=l.avgDDem*l.containers;podMap[pod].tDDet+=l.avgDDet*l.containers;podMap[pod].tDSto+=(l.avgDSto||0)*l.containers;podMap[pod].tDComb+=(l.avgDComb||0)*l.containers;
    });
    const pols=Object.values(polMap).map(p=>{const c=p.containers;const avgODet=+(p.tODet/c).toFixed(2),avgODem=+(p.tODem/c).toFixed(2),avgOSto=+(p.tOSto/c).toFixed(2),avgOComb=+(p.tOComb/c).toFixed(2);const score=+(avgODet*0.28+avgODem*0.13+avgOSto*0.02+avgOComb*0.57).toFixed(1);return{...p,avgODet,avgODem,avgOSto,avgOComb,score};}).sort((a,b)=>b.score-a.score);
    const pods=Object.values(podMap).map(p=>{const c=p.containers;const avgDDem=+(p.tDDem/c).toFixed(2),avgDDet=+(p.tDDet/c).toFixed(2),avgDSto=+(p.tDSto/c).toFixed(2),avgDComb=+(p.tDComb/c).toFixed(2);const score=+(avgDDet*0.19+avgDDem*0.50+avgDSto*0.13+avgDComb*0.18).toFixed(1);return{...p,avgDDem,avgDDet,avgDSto,avgDComb,score};}).sort((a,b)=>b.score-a.score);
    return{pols,pods};
  },[]);
  const[activePort,setActivePort]=useState(()=>selectedPort||null);
  const[portTab,setPortTab]=useState("pol");
  const[assumedDays,setAssumedDays]=useState(null);
  const[overrideDet,setOverrideDet]=useState(null);
  const[overrideDem,setOverrideDem]=useState(null);
  useEffect(()=>{setActivePort(selectedPort||null);},[selectedPort]);
  useEffect(()=>{if(!selectedPort)setActivePort(null);},[portTab]);
  useEffect(()=>{setOverrideDet(null);setOverrideDem(null);},[activePort]);
  const cats=[{name:"Detention — Origin",side:"Origin",total:49169,containers:261,avgFP:5.1,color:T.amber},{name:"Detention — Dest",side:"Dest",total:1955,containers:8,avgFP:6.0,color:T.amber},{name:"Demurrage — Origin",side:"Origin",total:22353,containers:52,avgFP:3.1,color:T.purple},{name:"Demurrage — Dest",side:"Dest",total:5144,containers:12,avgFP:3.0,color:T.purple},{name:"Storage — Origin",side:"Origin",total:3075,containers:23,avgFP:3.1,color:T.green},{name:"Storage — Dest",side:"Dest",total:1295,containers:9,avgFP:3.0,color:T.green},{name:"Combined — Origin",side:"Origin",total:99565,containers:212,avgFP:9.9,color:T.red},{name:"Combined — Dest",side:"Dest",total:1814,containers:4,avgFP:12.0,color:T.red}];
  const detO=49169,demO=22353,dndO=99565,detD=1955,demD=5144,dndD=1814;
  const portAvgODet=BASE.topLanes.length>0?+(BASE.topLanes.reduce((s,l)=>s+l.avgODet*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1):0;
  const portAvgODem=BASE.topLanes.length>0?+(BASE.topLanes.reduce((s,l)=>s+l.avgODem*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1):0;
  const portAvgDDem=BASE.topLanes.length>0?+(BASE.topLanes.reduce((s,l)=>s+l.avgDDem*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1):0;
  const portAvgDDet=BASE.topLanes.length>0?+(BASE.topLanes.reduce((s,l)=>s+l.avgDDet*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1):0;

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Negotiation Center" sub={activePort?"Port-level negotiation data for "+activePort.port+" ("+activePort.side+"). D&D is charged at the port (demurrage) and outside the port (detention).":"Select a port to build your negotiation case. D&D charges occur at ports and at depots outside ports — not port-to-port."}/>

    {/* Active port banner */}
    {activePort&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:T.blueBg,borderRadius:8,marginBottom:14,border:"1px solid "+T.blue+"30"}}>
      <span style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:T.text}}>{activePort.port}</span>
      <Badge color={activePort.side==="Origin"?T.amber:T.purple}>{activePort.side==="Origin"?"Origin (POL)":"Destination (POD)"}</Badge>
      <Badge color={T.blue}>{activePort.containers} containers</Badge>
      {activePort.score>8?<SolidBadge color={T.red}>High Risk · Score {activePort.score}</SolidBadge>:activePort.score>5?<SolidBadge color={T.amber}>Monitor · Score {activePort.score}</SolidBadge>:<SolidBadge color={T.green}>OK · Score {activePort.score}</SolidBadge>}
      <div style={{flex:1}}/>
      <button onClick={()=>{setActivePort(null);if(clearPort)clearPort();}} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><X size={14} color={T.dim}/></button>
    </div>}

    {activePort?(()=>{
      const p=activePort;const isPol=p.side==="Origin";
      const metrics=isPol
        ?[{label:"Origin Detention",desc:"outside the port — container at origin depot",laneAvg:p.avgODet,fp:overrideDet||BASE.costMatrix.detention_origin.avgFP,portAvg:portAvgODet,color:T.amber,overrideKey:"det"},
          {label:"Origin Demurrage",desc:"at the port — container waiting for vessel load",laneAvg:p.avgODem,fp:overrideDem||BASE.costMatrix.demurrage_origin.avgFP,portAvg:portAvgODem,color:T.purple,overrideKey:"dem"},
          {label:"Origin Storage",desc:"port storage charges at origin",laneAvg:p.avgOSto||0,fp:BASE.costMatrix.storage_origin.avgFP,portAvg:0,color:T.green}]
        :[{label:"Dest Demurrage",desc:"at the port — container waiting after discharge",laneAvg:p.avgDDem,fp:overrideDem||BASE.costMatrix.demurrage_destination.avgFP,portAvg:portAvgDDem,color:T.purple,overrideKey:"dem"},
          {label:"Dest Detention",desc:"outside the port — container at destination depot",laneAvg:p.avgDDet,fp:overrideDet||BASE.costMatrix.detention_destination.avgFP,portAvg:portAvgDDet,color:T.amber,overrideKey:"det"},
          {label:"Dest Storage",desc:"port storage charges at destination",laneAvg:p.avgDSto||0,fp:BASE.costMatrix.storage_destination.avgFP,portAvg:0,color:T.green}];
      const combinedFP=isPol?BASE.costMatrix.dnd_origin.avgFP:BASE.costMatrix.dnd_destination.avgFP;
      const combinedAvg=isPol?(p.avgOComb||0):(p.avgDComb||0);
      const combinedTotal=assumedDays!==null?assumedDays:combinedAvg;
      const combinedSaves=combinedTotal<combinedFP;
      const overItems=metrics.filter(m=>m.laneAvg>m.fp);
      const scriptLines=[
        "At port "+p.port+", we have "+p.containers+" containers. "+(isPol?"Origin detention (outside port): "+p.avgODet.toFixed(1)+"d avg vs "+BASE.costMatrix.detention_origin.avgFP+"d free. Origin demurrage (at port): "+p.avgODem.toFixed(1)+"d avg vs "+BASE.costMatrix.demurrage_origin.avgFP+"d free.":"Destination demurrage (at port): "+p.avgDDem.toFixed(1)+"d avg vs "+BASE.costMatrix.demurrage_destination.avgFP+"d free. Destination detention (outside port): "+p.avgDDet.toFixed(1)+"d avg vs "+BASE.costMatrix.detention_destination.avgFP+"d free."),
        overItems.length>0?"We are consistently exceeding free period on: "+overItems.map(m=>m.label+" ("+m.laneAvg.toFixed(1)+"d vs "+m.fp+"d free — "+m.desc+")").join("; ")+". This is a port-level structural pattern across "+p.containers+" containers.":"All metrics at "+p.port+" are within free period. The conversation should focus on the surcharge rate, not free period extension.",
        overItems.length>0?"We request "+Math.ceil(overItems[0].laneAvg-overItems[0].fp+1)+" additional free days for "+(overItems[0].label)+" at "+p.port+" to align with our actual operational dwell.":"We request a rate reduction on the D&D surcharge at "+p.port+" given our consistent within-FP performance.",
        "Portfolio comparison: "+(isPol?"O. Detention portfolio avg is "+portAvgODet+"d; at "+p.port+" we average "+p.avgODet.toFixed(1)+"d — "+(p.avgODet>portAvgODet?((p.avgODet-portAvgODet).toFixed(1))+"d above portfolio. This port requires port-specific negotiation.":"within portfolio norms."):"D. Demurrage portfolio avg is "+portAvgDDem+"d; at "+p.port+" we average "+p.avgDDem.toFixed(1)+"d — "+(p.avgDDem>portAvgDDem?((p.avgDDem-portAvgDDem).toFixed(1))+"d above portfolio. This port requires port-specific negotiation.":"within portfolio norms."))
      ];
      return <>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Card>
            <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{p.port} vs Portfolio Benchmark</div>
            <div style={{fontSize:11,color:T.sub,marginBottom:10}}>How does this port compare to your portfolio average? Red = this port is worse than average.</div>
            <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
              <thead><tr style={{color:T.dim,fontSize:9,background:T.card2}}>{["Metric","This Port","Portfolio Avg","Diff"].map(h=><th key={h} style={{padding:"5px 6px",fontWeight:600,textAlign:h==="Metric"?"left":"right"}}>{h}</th>)}</tr></thead>
              <tbody>{metrics.filter(m=>m.portAvg>0).map((m,i)=>{const diff=+(m.laneAvg-m.portAvg).toFixed(1);const worse=diff>0;return <tr key={i} style={{background:worse?T.redBg+"50":T.greenBg+"50"}}>
                <td style={{padding:"5px 6px",borderRadius:"5px 0 0 5px",fontWeight:500,color:T.sub}}>{m.label}</td>
                <td style={{padding:"5px 6px",textAlign:"right",fontWeight:700,color:m.color}}>{m.laneAvg.toFixed(1)}d</td>
                <td style={{padding:"5px 6px",textAlign:"right",color:T.dim}}>{m.portAvg}d</td>
                <td style={{padding:"5px 6px",textAlign:"right",borderRadius:"0 5px 5px 0",fontWeight:700,color:worse?T.red:T.green}}>{worse?"+":""}{diff}d</td>
              </tr>;})}
              </tbody>
            </table>
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Rate Structure — {p.port} ({p.side})</div>
            <div style={{fontSize:11,color:T.sub,marginBottom:8}}>Bundled D&D rate vs separate Detention + Demurrage at this port side.</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"8px 12px",background:T.card2,borderRadius:8,border:"1px solid "+T.border}}>
              <div style={{fontSize:10,fontWeight:600,color:T.sub}}>Assume dwell:</div>
              <input type="number" min={1} max={60} placeholder={"Actual: "+combinedAvg.toFixed(1)+"d"} value={assumedDays===null?"":assumedDays} onChange={e=>{const v=parseInt(e.target.value);setAssumedDays(isNaN(v)||v<1?null:v);}} style={{width:80,border:"1.5px solid "+T.border,borderRadius:6,padding:"5px 8px",fontSize:12,fontWeight:600,outline:"none",background:"#fff",color:T.text}}/>
              {assumedDays!==null&&<button onClick={()=>setAssumedDays(null)} style={{padding:"4px 8px",borderRadius:5,border:"1px solid "+T.border,background:"#fff",color:T.sub,fontSize:9,cursor:"pointer"}}>Reset</button>}
            </div>
            <div style={{padding:"8px 12px",background:combinedSaves?T.greenBg:T.redBg,borderRadius:8,borderLeft:"3px solid "+(combinedSaves?T.green:T.red)}}>
              <div style={{fontSize:11,fontWeight:600,color:combinedSaves?T.green:T.red,marginBottom:3}}>{combinedSaves?"✓ Recommend: Bundled D&D":"✗ Recommend: Separate Rates"}</div>
              <div style={{fontSize:11,color:T.text,lineHeight:1.5}}>{"At "+(assumedDays!==null?assumedDays+"d assumed":combinedAvg.toFixed(1)+"d avg")+", combined FP ("+combinedFP+"d) is "+(combinedSaves?"not exceeded — combined rate absorbs all charges at this port.":"exceeded — use separate rates to isolate which category breaches at this port.")}</div>
            </div>
          </Card>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:T.card2,borderRadius:8,border:"1px solid "+T.border,marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:T.sub,whiteSpace:"nowrap"}}>Contract FP Override:</div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{fontSize:9,color:T.dim,whiteSpace:"nowrap"}}>Detention (d):</div><input type="number" min={1} max={60} placeholder={"Default: "+(isPol?BASE.costMatrix.detention_origin.avgFP:BASE.costMatrix.detention_destination.avgFP)+"d"} value={overrideDet===null?"":overrideDet} onChange={e=>{const v=parseFloat(e.target.value);setOverrideDet(isNaN(v)||v<1?null:v);}} style={{width:72,border:"1.5px solid "+T.amber,borderRadius:5,padding:"4px 7px",fontSize:11,fontWeight:600,outline:"none",background:"#fff",color:T.text}}/></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{fontSize:9,color:T.dim,whiteSpace:"nowrap"}}>Demurrage (d):</div><input type="number" min={1} max={60} placeholder={"Default: "+(isPol?BASE.costMatrix.demurrage_origin.avgFP:BASE.costMatrix.demurrage_destination.avgFP)+"d"} value={overrideDem===null?"":overrideDem} onChange={e=>{const v=parseFloat(e.target.value);setOverrideDem(isNaN(v)||v<1?null:v);}} style={{width:72,border:"1.5px solid "+T.purple,borderRadius:5,padding:"4px 7px",fontSize:11,fontWeight:600,outline:"none",background:"#fff",color:T.text}}/></div>
          {(overrideDet!==null||overrideDem!==null)&&<button onClick={()=>{setOverrideDet(null);setOverrideDem(null);}} style={{padding:"3px 8px",borderRadius:5,border:"1px solid "+T.border,background:"#fff",color:T.sub,fontSize:9,cursor:"pointer"}}>Reset</button>}
          <div style={{fontSize:9,color:T.dim,marginLeft:4}}>Enter your actual contracted free days — all metrics, bars, and script update automatically.</div>
        </div>
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Free Period Ask — {p.port}</div>
          <div style={{fontSize:11,color:T.sub,marginBottom:10}}>At-port (demurrage) and outside-port (detention) utilization. Red = already in paid tier. Use these numbers with the carrier or terminal.</div>
          {metrics.map((m,i)=>{const pct=Math.round((m.laneAvg/m.fp)*100);const capped=Math.min(100,pct);const over=pct>100;return <div key={i} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <div><span style={{fontSize:11,fontWeight:600,color:T.text}}>{m.label}</span><span style={{fontSize:9,color:T.dim,marginLeft:8}}>{m.desc}</span></div>
              <span style={{fontSize:12,fontWeight:700,color:over?T.red:pct>90?T.red:pct>70?T.amber:T.green}}>{m.laneAvg.toFixed(1)+"d / "+m.fp+"d ("+pct+"%)"}{over&&<span style={{marginLeft:6,fontSize:10}}>⚠ ask {Math.ceil(m.laneAvg-m.fp+1)}d more</span>}</span>
            </div>
            <div style={{height:8,background:T.card2,borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:capped+"%",background:over?T.red:pct>90?T.red:pct>70?T.amber:m.color,borderRadius:4}}/>
            </div>
          </div>;})}
        </Card>
        <Card style={{borderLeft:"3px solid "+T.blue,background:T.blueBg,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Negotiation Script — {p.port}</div>
          <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Use in your carrier or terminal QBR or contract renewal. Based on actual container data through {p.port}.</div>
          {scriptLines.map((line,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<scriptLines.length-1?"1px solid "+T.border+"60":"none"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:T.blue,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{line}</div>
          </div>)}
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,paddingTop:10,borderTop:"1px solid "+T.border+"60"}}>
            <button onClick={()=>navigator.clipboard.writeText(scriptLines.join("\n\n")).catch(()=>{})} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,border:"1px solid "+T.blue,background:T.blueBg,color:T.blue,fontSize:10,fontWeight:700,cursor:"pointer"}}>📋 Copy Script</button>
            <span style={{fontSize:9,color:T.dim}}>Copies all 4 talking points as plain text — paste into email, QBR doc, or carrier form.</span>
          </div>
          {can("carriers")&&<NavLink text="See carrier performance at this port → Carrier Intel" onClick={()=>setPage("carriers")}/>}
        </Card>
      </>;
    })():(
    <>
    {/* PORT SELECTOR */}
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      <Pill active={portTab==="pol"} onClick={()=>setPortTab("pol")} color={T.amber}>Origin Ports (POL)</Pill>
      <Pill active={portTab==="pod"} onClick={()=>setPortTab("pod")} color={T.purple}>Destination Ports (POD)</Pill>
    </div>
    {(()=>{
      const ports=portTab==="pol"?portNegData.pols:portNegData.pods;
      const isPol=portTab==="pol";
      if(!ports.length)return<div style={{padding:20,textAlign:"center",color:T.dim,fontSize:11}}>No port data available.</div>;
      return <Card style={{marginBottom:16,borderLeft:"3px solid "+T.purple}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>Negotiation Opportunities by Port</div>
        <div style={{fontSize:10,color:T.sub,marginBottom:12}}>D&D is charged <strong>at the port</strong> (demurrage) and <strong>outside the port</strong> (detention — at depots). Select a port to build the negotiation case.</div>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
          <thead><tr style={{color:T.dim,fontSize:9,background:T.card2}}>
            {["Port","Containers",isPol?"At-Port (Dem)":"At-Port (Dem)",isPol?"Outside Port (Det)":"Outside Port (Det)","Score","Risk",""].map((h,hi)=><th key={hi} style={{padding:"6px 8px",textAlign:["Containers","At-Port (Dem)","Outside Port (Det)","Score"].includes(h)?"right":"left",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>{ports.map((p,i)=>{
            const r=p.score>8?{t:"High",c:T.red}:p.score>5?{t:"Monitor",c:T.amber}:{t:"OK",c:T.green};
            const demAvg=isPol?p.avgODem:p.avgDDem;const detAvg=isPol?p.avgODet:p.avgDDet;
            const demFP=isPol?BASE.costMatrix.demurrage_origin.avgFP:BASE.costMatrix.demurrage_destination.avgFP;
            const detFP=isPol?BASE.costMatrix.detention_origin.avgFP:BASE.costMatrix.detention_destination.avgFP;
            return <tr key={i} style={{background:"#fff",cursor:"pointer"}} onClick={()=>setActivePort({...p,side:isPol?"Origin":"Dest"})} onMouseEnter={e=>e.currentTarget.style.background=T.blueBg} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              <td style={{padding:"7px 8px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontWeight:700}}>{p.port}</td>
              <td style={{padding:"7px 8px",textAlign:"right",color:T.sub}}>{p.containers}</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontWeight:600,color:demAvg>demFP?T.red:T.green}}>{demAvg.toFixed(1)}d{demAvg>demFP&&<span style={{fontSize:9,marginLeft:3}}>⚠</span>}</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontWeight:600,color:detAvg>detFP?T.red:T.green}}>{detAvg.toFixed(1)}d{detAvg>detFP&&<span style={{fontSize:9,marginLeft:3}}>⚠</span>}</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontWeight:700,color:r.c}}>{p.score}</td>
              <td style={{padding:"7px 8px"}}><SolidBadge color={r.c}>{r.t}</SolidBadge></td>
              <td style={{padding:"7px 8px",borderRadius:"0 6px 6px 0"}}><span style={{fontSize:9,fontWeight:700,color:T.blue}}>Build case →</span></td>
            </tr>;
          })}
          </tbody>
        </table>
        <div style={{fontSize:9,color:T.dim,marginTop:6}}>Click any port to open the negotiation analysis: benchmark, rate structure recommendation, and a ready-made script.</div>
      </Card>;
    })()}

    <ChartBox title="Portfolio — Surcharge Costs by Category" sub="Compare all 8 surcharge buckets across the portfolio. Select a port above to build your negotiation case." h={280}><ResponsiveContainer><BarChart data={cats} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis type="number" stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><YAxis type="category" dataKey="name" stroke={T.dim} fontSize={9} width={160}/><Tooltip formatter={v=>fmt(v)}/><Bar dataKey="total" name="Total" radius={[0,4,4,0]}>{cats.map((c,i)=><Cell key={i} fill={c.color}/>)}</Bar></BarChart></ResponsiveContainer></ChartBox>
    <Card style={{marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div><div style={{fontSize:14,fontWeight:600}}>Detailed Surcharge Table</div><div style={{fontSize:11,color:T.sub}}>Per-container cost by surcharge type. Higher $/container = higher priority for action.</div></div><DlBtn onClick={()=>dlCSV("surcharge_detail_"+new Date().toISOString().slice(0,10),["Category","Side","Total","Containers","Free Period","$/Container"],cats.map(c=>[c.name,c.side,c.total,c.containers,c.avgFP+"d",c.containers>0?Math.round(c.total/c.containers):0]))}/></div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}><thead><tr style={{color:T.dim,fontSize:10,textAlign:"left",background:T.card2}}>{["Category","Side","Total","Containers","FP","$/Container"].map(h=><th key={h} style={{padding:"7px 8px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Total","$/Container"].includes(h)?"right":"left"}}>{h}</th>)}</tr></thead>
      <tbody>{cats.map((c,i)=><tr key={i} style={{background:T.card2}}><td style={{padding:"7px 8px",borderRadius:"6px 0 0 6px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:2,background:c.color}}/><span style={{fontWeight:700}}>{c.name}</span></div></td><td style={{padding:"7px 8px"}}><Badge color={c.side==="Origin"?T.amber:T.purple}>{c.side}</Badge></td><td style={{padding:"7px 8px",fontWeight:600,textAlign:"right"}}>{fmt(c.total)}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{c.containers}</td><td style={{padding:"7px 8px",color:T.sub}}>{c.avgFP}d</td><td style={{padding:"7px 8px",fontWeight:700,textAlign:"right",borderRadius:"0 6px 6px 0"}}>{c.containers>0?fmt(Math.round(c.total/c.containers)):"—"}</td></tr>)}</tbody></table>
    </Card>
    <div style={{display:"flex",alignItems:"center",gap:10,marginTop:14,marginBottom:4,padding:"8px 12px",background:T.card2,borderRadius:8,border:"1px solid "+T.border}}>
      <div style={{fontSize:10,fontWeight:600,color:T.sub}}>Assume dwell days:</div>
      <input type="number" min={1} max={60} placeholder={"Portfolio avg: "+BASE.stageDays.combined_origin.avg.toFixed(1)+"d"} value={assumedDays===null?"":assumedDays} onChange={e=>{const v=parseInt(e.target.value);setAssumedDays(isNaN(v)||v<1?null:v);}} style={{width:90,border:"1.5px solid "+T.border,borderRadius:6,padding:"5px 8px",fontSize:12,fontWeight:600,outline:"none",background:"#fff",color:T.text}}/>
      {assumedDays!==null&&<button onClick={()=>setAssumedDays(null)} style={{padding:"4px 8px",borderRadius:5,border:"1px solid "+T.border,background:"#fff",color:T.sub,fontSize:9,cursor:"pointer"}}>Reset to Actual</button>}
      <div style={{fontSize:9,color:T.dim}}>Enter a hypothetical dwell to see if combined or separate rates would be cheaper at that level.</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
      {[{side:"Origin",det:detO,dem:demO,dnd:dndO,detFPNum:BASE.costMatrix.detention_origin.avgFP,demFPNum:BASE.costMatrix.demurrage_origin.avgFP,dndFPNum:BASE.costMatrix.dnd_origin.avgFP,detAvg:BASE.stageDays.origin_detention.avg,demAvg:BASE.stageDays.origin_demurrage.avg},{side:"Dest",det:detD,dem:demD,dnd:dndD,detFPNum:BASE.costMatrix.detention_destination.avgFP,demFPNum:BASE.costMatrix.demurrage_destination.avgFP,dndFPNum:BASE.costMatrix.dnd_destination.avgFP,detAvg:BASE.stageDays.dest_detention.avg,demAvg:BASE.stageDays.dest_demurrage.avg}].map(s=>{const sepTotal=s.det+s.dem;const prem=s.dnd>sepTotal?Math.round((s.dnd-sepTotal)/sepTotal*100):0;const combinedSaves=assumedDays!==null?assumedDays<s.dndFPNum:null;const cheaper=assumedDays!==null?(combinedSaves?"Combined":"Separate"):(s.dnd>sepTotal?"Separate":"Combined");const totalAvg=s.detAvg+s.demAvg;const detRatio=totalAvg>0?s.detAvg/totalAvg:0.5;const effDet=assumedDays!==null?+(assumedDays*detRatio).toFixed(1):null;const effDem=assumedDays!==null?+(assumedDays*(1-detRatio)).toFixed(1):null;return <Card key={s.side}><div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{"Combined vs Separate — "+s.side}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>{[{t:"Detention",fpNum:s.detFPNum,eff:effDet,cost:s.det,c:T.amber},{t:"Demurrage",fpNum:s.demFPNum,eff:effDem,cost:s.dem,c:T.purple},{t:"Combined",fpNum:s.dndFPNum,eff:assumedDays,cost:s.dnd,c:T.red}].map((x,i)=>{const withinFP=assumedDays!==null?x.eff<x.fpNum:null;const borderColor=assumedDays!==null?(withinFP?T.green:T.red):x.c;return <div key={i} style={{background:T.card2,borderRadius:10,padding:12,borderTop:"3px solid "+borderColor,position:"relative"}}>{x.t===cheaper&&<div style={{position:"absolute",top:4,right:4,fontSize:9,color:T.green,fontWeight:700}}>{"✓ Cheaper"}</div>}<div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:4}}>{x.t}</div><div style={{fontSize:18,fontWeight:700}}>{x.fpNum+"d"}<span style={{fontSize:10,color:T.sub,fontWeight:400}}>{" free"}</span></div>{assumedDays!==null?<div style={{marginTop:6,padding:"3px 7px",borderRadius:5,display:"inline-block",background:withinFP?T.greenBg:T.redBg,fontSize:10,fontWeight:700,color:withinFP?T.green:T.red}}>{withinFP?"✓ Within FP":"✗ Over FP"}</div>:<div style={{fontSize:13,fontWeight:700,color:x.c,marginTop:2}}>{fmt(x.cost)}</div>}</div>;})}</div>
        <div style={{padding:8,background:cheaper==="Combined"?T.greenBg:T.redBg,borderRadius:7,borderLeft:"3px solid "+(cheaper==="Combined"?T.green:T.red)}}><div style={{fontSize:12,color:T.text}}>{assumedDays!==null?(combinedSaves?"At "+assumedDays+"d assumed dwell, combined FP ("+s.dndFPNum+"d) covers the total. Combined rate recommended for "+s.side.toLowerCase()+" side.":"At "+assumedDays+"d assumed dwell, combined FP ("+s.dndFPNum+"d) does not cover the total. Separate rates reduce exposure on "+s.side.toLowerCase()+" side."):(prem>0?"Combined costs "+prem+"% MORE than separate ("+fmt(s.dnd)+" vs "+fmt(sepTotal)+"). Evaluate switching to separate rates on "+s.side.toLowerCase()+" side.":"Combined is cheaper than separate at "+s.side.toLowerCase()+".")}</div></div>
      </Card>;})}
    </div>
    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Free Period Utilization — Portfolio</div><div style={{fontSize:11,color:T.sub,marginBottom:10}}>How much of your free period is consumed? {">"}90% = zero buffer, negotiate more days.</div>
      {[{label:"Origin Detention (outside port)",avg:4.8,fp:5.1,color:T.amber},{label:"Origin Demurrage (at port)",avg:0.87,fp:3.1,color:T.purple},{label:"Dest Demurrage (at port)",avg:2.6,fp:3.0,color:T.purple},{label:"Dest Detention (outside port)",avg:5.51,fp:6.0,color:T.red}].map((r,i)=>{const pct=Math.round((r.avg/r.fp)*100);const capped=Math.min(100,pct);const over=pct>100;return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:T.sub}}>{r.label}</span><span style={{fontSize:12,fontWeight:700,color:over?T.red:pct>90?T.red:pct>70?T.amber:T.green}}>{r.avg+"d / "+r.fp+"d ("+pct+"%)"}{over&&" ⚠ OVER"}</span></div><div style={{height:7,background:T.card2,borderRadius:4,overflow:"hidden",border:"none",boxShadow:"inset 0 1px 2px rgba(0,0,0,.06)",position:"relative"}}><div style={{height:"100%",width:capped+"%",background:over?T.red:pct>90?T.red:pct>70?T.amber:T.green,borderRadius:4}}/></div></div>;})}
      <Insight text={(()=>{const detAvg=BASE.stageDays.origin_detention.avg;const detFP=BASE.costMatrix.detention_origin.avgFP;const util=Math.round(detAvg/detFP*100);const newFP=detFP+1;const newUtil=Math.round(detAvg/newFP*100);return "Origin Detention (outside port) at "+util+"% utilization ("+detAvg+"d avg vs "+detFP+"d free). Negotiating 1 extra free day ("+detFP+"d → "+newFP+"d) reduces utilization to ~"+newUtil+"%.";})()}/>
    </Card>
    <div style={{marginTop:16,marginBottom:4}}>
      <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>What should I do next?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {title:"Select a port above to prepare",sub:"Click any origin or destination port to open the full negotiation analysis with benchmark, rate structure recommendation, and a ready-made script.",color:T.purple,icon:"🏭"},
          {title:"Cross-reference with Carrier Intel",sub:"A port that is over free period may have a carrier-driven root cause. Check if the worst carrier at that port is a systematic performer.",color:T.blue,icon:"🚢",page:"carriers"},
          {title:"Track next month's trend",sub:"After a successful renegotiation, monitor Structural Leakage to confirm dwell at that port drops below the new free period threshold.",color:T.amber,icon:"📈",page:"history"},
        ].filter(d=>!d.page||can(d.page)).map((d,i)=><Card key={i} style={{padding:"14px 16px",cursor:d.page?"pointer":undefined,borderTop:"2px solid "+d.color}} onClick={()=>d.page&&setPage(d.page)}>
          <div style={{fontSize:10,fontWeight:700,color:d.color,marginBottom:4}}>{d.icon} {d.title}</div>
          <div style={{fontSize:10,color:T.sub,lineHeight:1.5,marginBottom:d.page?8:0}}>{d.sub}</div>
          {d.page&&<div style={{fontSize:10,fontWeight:700,color:d.color}}>→ {d.page==="carriers"?"Carrier Intel":"Structural Leakage"}</div>}
        </Card>)}
      </div>
    </div>
    </>)}
  </div>);
}

// ═══ MAIN APP ═══
export default function App(){
  const[page,setPage]=useState("home");
  const[selectedPort,setSelectedPort]=useState(null);
  const[persona,setPersona]=useState("admin");
  const allowedTabs=PERSONAS[persona].tabs;
  const navToSurchargesPort=(port)=>{setSelectedPort(port);setPage("surcharges");};
  useEffect(()=>{if(!PERSONAS[persona].tabs.includes(page))setPage(PERSONAS[persona].tabs[0]);},[persona]);
  return (<div style={{background:T.bg,minHeight:"100vh",fontFamily:"'Roboto','Arial',sans-serif",color:T.text}}>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap" rel="stylesheet"/>
    <TopNav page={page} setPage={setPage} allowedTabs={allowedTabs} persona={persona} setPersona={setPersona}/>
    <div style={{background:T.bg,minHeight:"calc(100vh - 57px)",width:"100%",boxSizing:"border-box"}}>
      {page==="home"&&<HomePage setPage={setPage} allowedTabs={allowedTabs}/>}
      {page==="costs"&&<CostPage setPage={setPage} allowedTabs={allowedTabs}/>}
      {page==="carriers"&&<CarrierPage setPage={setPage} allowedTabs={allowedTabs}/>}
      {page==="optimizer"&&<OptimizerPage/>}
      {page==="history"&&<HistoryPage setPage={setPage} navToSurchargesPort={navToSurchargesPort} allowedTabs={allowedTabs}/>}
      {page==="surcharges"&&<SurchargePage setPage={setPage} selectedPort={selectedPort} clearPort={()=>setSelectedPort(null)} allowedTabs={allowedTabs}/>}
    </div>
  </div>);
}
