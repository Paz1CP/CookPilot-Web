"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/contexts/LanguageContext";
import HeroAtmosphere from "../components/HeroAtmosphere";

const ASSET = "/images/cook-film/";
const FOOD = "/images/food/cutouts/";
const socialIcons = [
  {file:"ig",x:27,y:29,size:112,dx:-.7,dy:-.5,float:12,rotation:-8},
  {file:"tiktok",x:74,y:34,size:124,dx:.7,dy:-.3,float:14,rotation:7},
  {file:"yt",x:24,y:55,size:108,dx:-.7,dy:.2,float:10,rotation:-5},
  {file:"fb",x:68,y:16,size:76,dx:.2,dy:-.6,float:6,rotation:10},
  {file:"web",x:76,y:63,size:84,dx:.5,dy:.6,float:8,rotation:4},
];
const field = [
  {file:"beef_cubes.png", x:-.33, y:-.30, z:160, size:270, r:-14},
  {x:-.23, y:-.26, z:-100, size:170, r:-9},
  {file:"potato_sticks.png", x:.32, y:-.37, z:-170, size:220, r:18},
  {x:.41, y:-.08, z:40, size:180, r:7},
  {file:"red_onion_wedges.png", x:-.35, y:.24, z:160, size:310, r:25},
  {x:-.44, y:-.04, z:-180, size:160, r:5},
  {file:"tomato_wedges.png", x:.41, y:.28, z:160, size:330, r:-20},
  {x:.23, y:.24, z:-100, size:170, r:-8},
  {file:"yellow_pepper_strips.png", x:.08, y:-.40, z:-290, size:155, r:-18},
  {x:-.13, y:.23, z:90, size:205, r:4},
  {file:"cilantro_chopped.png", x:.42, y:-.24, z:200, size:190, r:20},
];
const ingredients = [
  "beef_cubes.png", "red_onion_wedges.png", "tomato_wedges.png",
  "yellow_pepper_strips.png", "potato_sticks.png", "cilantro_chopped.png",
];

const sunburstArms = [
  [-90, 16.5, 1.8], [-61, 14.2, -1.2], [-35, 16.9, 1.4], [-8, 14.8, -.8],
  [18, 16.1, 1.1], [47, 14.6, -1.5], [73, 16.8, .7], [101, 14.4, -1.1],
  [128, 16.4, 1.3], [157, 14.9, -.9], [184, 16.2, 1.5], [218, 14.3, -.7], [251, 16.6, 1.1],
] as const;

function HeroSunburst() {
  return <svg className="hero-sunburst" viewBox="-19 -19 38 38" aria-hidden="true">
    {sunburstArms.map(([angle, length, bend]) => {
      const radians = angle * Math.PI / 180;
      const x = Math.cos(radians) * length;
      const y = Math.sin(radians) * length;
      const controlX = Math.cos(radians + Math.PI / 2) * bend + x * .54;
      const controlY = Math.sin(radians + Math.PI / 2) * bend + y * .54;
      return <path key={angle} d={`M 0 0 Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`} />;
    })}
  </svg>;
}


function Title({name, first, accent}: {name:string; first:string; accent:string}) {
  return <h2 className={`shot-title ${name}`} aria-label={`${first} ${accent}`}>
    <span aria-hidden="true">{first.split(" ").map((word,i)=><span className="optical-word" key={i}>{word}{" "}</span>)}</span>
    <em aria-hidden="true">{accent.split("").map((char,i)=><span className="optical-glyph" key={i}>{char === " " ? "\u00a0" : char}</span>)}</em>
  </h2>;
}

export default function Film() {
  const copy = useLocale().t.landing.film;
  const dishes = copy.dishes;
  const root = useRef<HTMLDivElement>(null);
  const advanceDishRef = useRef<() => void>(() => undefined);
  const [viewportRevision, setViewportRevision] = useState(0);
  useLayoutEffect(() => {
    let timeout: number;
    const resize = () => { clearTimeout(timeout); timeout = window.setTimeout(() => setViewportRevision(v => v + 1), 180); };
    window.addEventListener("resize", resize);
    return () => { clearTimeout(timeout); window.removeEventListener("resize", resize); };
  }, []);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current!;
    const mm = gsap.matchMedia();
    let carousel: gsap.core.Timeline | undefined;
    let dishIndex = 0;
    const fast = (value: number) => value * .88;
    // Reframing the canvas must reset image and caption as one carousel state.
    const heroImages = host.querySelectorAll<HTMLImageElement>(".hero-food");
    gsap.set(heroImages, {opacity:0, rotation:0, scale:1});
    gsap.set(heroImages[0], {opacity:1});
    const heroCaption = host.querySelector(".hero-caption")!;
    gsap.set(heroCaption.querySelector("span"), {textContent:dishes[0].name});
    gsap.set(heroCaption.querySelector("small"), {textContent:dishes[0].caption});
    const advanceDish = () => {
      if (window.scrollY > 4 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const images = host.querySelectorAll<HTMLImageElement>(".hero-food");
      const old = images[dishIndex];
      dishIndex = (dishIndex + 1) % dishes.length;
      const next = images[dishIndex];
      const caption = host.querySelector(".hero-caption")!;
      carousel?.kill();
      carousel = gsap.timeline().to(old,{opacity:0, rotation:180, scale:.95, duration:fast(.65), ease:"power2.in"})
        .set(caption.querySelector("span"),{textContent:dishes[dishIndex].name},fast(.65))
        .set(caption.querySelector("small"),{textContent:dishes[dishIndex].caption},fast(.65))
        .fromTo(next,{opacity:0,rotation:-180,scale:.95},{opacity:1,rotation:0,scale:1,duration:fast(1.05),ease:"power3.out"},fast(.55));
    };
    advanceDishRef.current = advanceDish;
    const timer = window.setInterval(advanceDish, 4400);

    mm.add({desktop:"(min-width: 721px)", mobile:"(max-width: 720px)", reduced:"(prefers-reduced-motion: reduce)"}, context => {
      const mobile = !!context.conditions?.mobile;
      const reduced = !!context.conditions?.reduced;
      const w = host.clientWidth, h = window.innerHeight;
      const tokenPrimary = getComputedStyle(host).getPropertyValue("--cp-primary").trim();
      const tokenSuccess = getComputedStyle(host).getPropertyValue("--cp-secondary").trim();
      const $ = gsap.utils.selector(host);
      const plateSize = Math.min(w * (mobile ? 1.08 : .76), h * (mobile ? .98 : 1.12));
      const emptySize = Math.min(w * .64, h * (mobile ? .49 : .60));
      const cx = w * .5, cy = h * .57;
      gsap.set($(".protagonist"), {width:plateSize, height:plateSize, x:cx, y:h*(mobile?.49:.47)+plateSize/2, xPercent:-50, yPercent:-50});
      gsap.set($(".empty-food"),{autoAlpha:0});
      gsap.set($(".shot-title, .request-field, .cooklist, .cookmode, .cookplan, .table-shot, .action-seed, .meal-world"),{autoAlpha:0});
      gsap.set($(".opening-title .optical-word, .opening-title .optical-glyph"),{opacity:0,filter:reduced?"none":"blur(12px)",y:8});
      gsap.set($(".compression-light"),{scale:.1,autoAlpha:0});
      if (!mobile) gsap.set($(".compression-light"),{left:0,top:0,x:cx,y:cy,xPercent:-50,yPercent:-50,margin:0});
      if (!mobile) gsap.set($(".opening-title"),{top:"50%",yPercent:-50});
      gsap.set($(".action-seed"),{x:cx,y:cy,xPercent:-50,yPercent:-50});
      gsap.set($(".request-field"),{perspective:mobile?850:1400,perspectiveOrigin:"50% 57%"});
      field.forEach((item,i)=> {
        gsap.set($(".field-object")[i],{x:cx+item.x*w*(mobile?1.1:1), y:cy+item.y*h, z:reduced?0:item.z*(mobile?.35:1), width:item.size*(mobile?.46:Math.min(w/1600,1.25)), xPercent:-50,yPercent:-50, rotation:item.r, filter:`blur(${reduced?0:item.z>210?1.4:item.z < -150?1.1:0}px)`});
        if (!mobile) {
          const distance = Math.max(1.8, 1 / Math.max(Math.abs(item.x), Math.abs(item.y)));
          gsap.set($(".field-object")[i],{x:cx+item.x*w*distance,y:cy+item.y*h*distance,filter:"none"});
        }
      });
      const tl = gsap.timeline({defaults:{ease:"power2.inOut"},
        onUpdate: () => { host.dataset.time=tl.time().toFixed(2); },
        scrollTrigger:{
        id:"cookpilot-film",trigger:host,start:"top top",end:"bottom bottom",scrub:reduced ? true : .65,
        onUpdate: self => {
          const time = self.progress * (mobile ? 100 : 112);
          if (reduced && self.animation) {
            const held = time < 5 ? 0 : time < 12 ? 10 : time < 23 ? 16 : time < 39 ? 33 : time < 53 ? 46 : time < 62 ? 58 : time < 73 ? 68 : time < 87 ? 81 : time < 101 ? 98 : 110;
            self.animation.time(held);
          }
        },
      }});
      // One scroll owner and one reversible clock. Labels describe camera beats.
      tl.addLabel("hero",0).addLabel("handoff",1).addLabel("empty",9).addLabel("requests",14)
        .addLabel("compression",19).addLabel("order",25).addLabel("cooklist",32)
        .addLabel("action",39).addLabel("cookmode",46).addLabel("execute",54)
        .addLabel("return",63).addLabel("pause",69).addLabel("plan",76)
        .addLabel("table",88).addLabel("hold",96);

      tl.to($(".hero-title"),{y:-h*.35,autoAlpha:0,duration:fast(5)},1)
        .to($(".hero-caption, .hero-origin"),{autoAlpha:0,duration:fast(2.5)},1)
        .to($(".hero-atmosphere"),{autoAlpha:mobile?0:.65,duration:fast(2.5)},1)
        .to($(".hero-down"),{autoAlpha:0,duration:fast(1.7)},.2)
        .to($(".protagonist"),{y:h*1.2,scale:.86,opacity:.012,duration:fast(4.4),ease:"power2.in"},.6)
        .set($(".hero-foods"),{visibility:"hidden"},5);
      if (mobile) {
        tl.set($(".empty-food"),{autoAlpha:1},5)
        .set($(".protagonist"),{width:emptySize,height:emptySize,y:cy-h*.13,scale:1},5)
        .to($(".protagonist"),{y:cy,opacity:1,duration:fast(5),ease:"power2.out"},5)
        .set($(".opening-title"),{autoAlpha:1},5.5)
        .to($(".opening-title .optical-word, .opening-title .optical-glyph"),{opacity:1,filter:"blur(0px)",y:0,duration:fast(2.5),stagger:.16,ease:"power2.out"},5.5)
        .to($(".opening-title"),{y:-h*.55,duration:fast(4),ease:"power2.in"},11)
        .set($(".opening-title"),{autoAlpha:0},15)
        .to($(".request-field"),{autoAlpha:1,duration:fast(2)},11.5);
      } else {
        tl.addLabel("headline",6).addLabel("plate-emerges",12.2).addLabel("arrival",15)
          .set($(".protagonist"),{opacity:0,width:emptySize,height:emptySize,y:cy,scale:.08},5)
          .set($(".opening-title"),{autoAlpha:1},6)
          .to($(".opening-title .optical-word, .opening-title .optical-glyph"),{opacity:1,filter:"blur(0px)",y:0,duration:fast(2.5),stagger:.16,ease:"power2.out"},6)
          // Hold the complete headline alone before clearing space for the plate.
          .to($(".opening-title"),{y:-h*.22,autoAlpha:0,duration:fast(1.7),ease:"power2.inOut"},10.4)
          .set($(".empty-food"),{autoAlpha:1},12.2)
          .to($(".compression-light"),{autoAlpha:.85,scale:.65,duration:fast(.45)},12.15)
          .to($(".compression-light"),{autoAlpha:0,scale:1,duration:fast(1.8)},12.6)
          .to($(".protagonist"),{scale:1,opacity:1,duration:fast(2.6),ease:"power3.out"},12.2)
          .set($(".request-field"),{autoAlpha:1},15)
          .to($(".hero-atmosphere"),{autoAlpha:0,duration:fast(1.6)},23);
        field.forEach((item,i)=> {
          tl.to($(".field-object")[i],{x:cx+item.x*w,y:cy+item.y*h,duration:fast(2.1),ease:"power2.out"},15+(i%3)*.12);
        });
      }

      field.forEach((item,i)=> {
        const at = 18.2 + (i%3)*.12;
        tl.to($(".field-object")[i],{x:cx,y:cy,z:-120,scale:.025,rotation:item.r+26,filter:"blur(0px)",duration:fast(4.1),ease:"power3.in"},at)
          .to($(".field-object")[i],{opacity:0,duration:fast(mobile?.45:.18),ease:"power1.in"},at+(mobile?3.35:3.89));
      });
      tl.to($(".compression-light"),{autoAlpha:.3,scale:.3,duration:fast(1.2)},19.1)
        .to($(".compression-light"),{autoAlpha:.7,scale:.65,duration:fast(1.2)},20.3)
        .to($(".compression-light"),{autoAlpha:1,scale:1,duration:fast(.6)},21.5)
        .to($(".compression-light"),{autoAlpha:0,scale:.3,duration:fast(.7)},22.4)
        .set($(".request-field"),{autoAlpha:0},23.2)
        .to($(".protagonist"),{scale:.65,autoAlpha:0,duration:fast(1.8)},mobile?22:22.55)
        .set($(".action-seed"),{autoAlpha:1,scale:.1},mobile?22.3:22.55)
        .to($(".action-seed"),{y:h*(mobile?.97:.90),scale:1,duration:fast(4),ease:"power3.inOut"},mobile?22.3:22.55)
        .set($(".cooklist"),{autoAlpha:1},mobile?22.8:24.4)
        .fromTo($(".list-composition"),{scale:2.6,y:h*.40,rotationX:reduced?0:26},{scale:1,y:0,rotationX:0,duration:fast(mobile?5:3.4),ease:"power3.out"},mobile?22.8:24.4)
        .fromTo($(".ingredient-row"),{y:(i:number)=>h*(.16+i*.025),opacity:0},{y:0,opacity:1,duration:fast(3),stagger:.10,ease:"power3.out"},24)
        .fromTo($(".list-title"),{y:-h*.3,autoAlpha:0},{y:0,autoAlpha:1,duration:fast(3.5)},24.5)
        .to($(".row-check"),{backgroundColor:tokenPrimary,borderColor:tokenPrimary,color:"var(--cp-text-inverse)",duration:fast(.5),stagger:.55},29)
        .to($(".list-ready"),{opacity:1,duration:fast(1)},32);

      // The completed check becomes the action track. UI travels out of frame, never ghosts.
      const stepSize = mobile ? w*.12 : h*.075;
      const trackLeft = w*(mobile?.08:.20), trackWidth = w*(mobile?.84:.60);
      const stepOneX = cx;
      const trackY = h*.40+stepSize/2;
      tl.to($(".cooklist"),{y:-h*1.12,duration:fast(2.4),ease:"power3.inOut"},35)
        .to($(".action-seed span"),{opacity:0,duration:fast(.6)},36)
        .to($(".action-seed"),{y:trackY,width:trackWidth-stepSize,height:3,borderRadius:2,duration:fast(1.2)},35.6)
        .set($(".cookmode"),{autoAlpha:1},36)
        .fromTo($(".cookmode"),{y:h},{y:0,duration:fast(2.4),ease:"power3.out"},36)
        .set($(".mode-title"),{autoAlpha:1},36)
        .set($(".instruction-two, .instruction-three, .mode-stir"),{autoAlpha:0},0)
        .set($(".step-1"),{opacity:0},38)
        .to($(".action-seed"),{x:stepOneX,width:stepSize,height:stepSize,borderRadius:"50%",duration:fast(1.2)},36.8)
        .set($(".action-seed span"),{textContent:"1"},38)
        .to($(".action-seed span"),{opacity:1,duration:fast(.4)},38)
        .set($(".cooklist"),{autoAlpha:0},37.4)
        .to($(".instruction-one"),{autoAlpha:0,y:-24,duration:fast(.7)},46)
        .fromTo($(".instruction-two"),{y:24},{y:0,autoAlpha:1,duration:fast(.8)},46.7)
        .to($(".mode-stir"),{autoAlpha:1,duration:fast(1.4)},46)
        .to($(".mode-beef"),{autoAlpha:0,duration:fast(1.4)},46)
        .set($(".step-1"),{opacity:1,backgroundColor:tokenSuccess,color:"var(--cp-text-inverse)",textContent:"✓"},46)
        .to($(".action-seed"),{x:trackLeft+stepSize/2+(trackWidth-stepSize)*.75,duration:fast(1.2)},46)
        .set($(".step-2"),{opacity:0},47.2)
        .set($(".action-seed span"),{textContent:"2"},47.2)
        .to($(".instruction-two"),{autoAlpha:0,y:-24,duration:fast(.7)},54)
        .fromTo($(".instruction-three"),{y:24},{y:0,autoAlpha:1,duration:fast(.8)},54.7)
        .set($(".step-2"),{opacity:1,backgroundColor:tokenSuccess,color:"var(--cp-text-inverse)",textContent:"✓"},54)
        .to($(".action-seed"),{x:trackLeft+trackWidth-stepSize/2,duration:fast(1.2)},54)
        .set($(".step-3"),{opacity:0},55.2)
        .set($(".action-seed span"),{textContent:"✓"},55.2)
        .to($(".action-seed"),{backgroundColor:tokenSuccess,duration:fast(.6)},55.2)
        // Return ownership to the actual timeline node before its camera exits.
        .set($(".step-3"),{opacity:1,backgroundColor:tokenSuccess,color:"var(--cp-text-inverse)",textContent:"✓"},55.8)
        .set($(".action-seed"),{autoAlpha:0},55.8);

      // One food element survives the macro reference, return, and discovery of Saturday lunch.
      const mealX = w*(mobile?.38:.28), mealY=h*(mobile?.57:.7275);
      const mealSize = Math.min(w*(mobile?.55:.18),h*(mobile?.26:.235));
      // Explicit neutral filter values keep GSAP from interpolating contrast/brightness from zero.
      gsap.set($(".return-food"),{width:mealSize,height:mealSize,x:mealX,y:mealY,xPercent:-50,yPercent:-50,filter:"sepia(0) saturate(1) brightness(1) contrast(1)"});
      const modeSize = Math.min(w*.43,h*.44);
      if (mobile) {
        gsap.set($(".mode-food"),{width:modeSize,height:modeSize,left:w*.705-modeSize/2,top:h*.76-modeSize/2});
      } else {
        gsap.set($(".mode-food"),{width:modeSize,height:modeSize,left:"auto",top:"auto",right:0,bottom:0});
      }
      const thumb = modeSize/mealSize;
      const full = Math.min(w*(mobile?1.14:.64),h*(mobile?1.04:.76))/mealSize;
      // Registration in the 1672 × 941 photograph's object-fit:cover space.
      const photoScale = Math.max(w/1672,h/941);
      const tableX = (w-1672*photoScale)/2+818*photoScale;
      const tableY = (h-941*photoScale)/2+518*photoScale;
      const tableScaleX = 960*photoScale/mealSize;
      const tableScaleY = 766*photoScale/mealSize;
      gsap.set($(".table-contact"),{x:tableX,y:tableY+12,width:930*photoScale,height:740*photoScale,xPercent:-50,yPercent:-50,autoAlpha:0,scale:1.07});
      gsap.set($(".meal-world"),{transformOrigin:"0 0",scale:thumb,x:w*.705-mealX*thumb,y:h*.76-mealY*thumb});
      tl.to($(".meal-world"),{autoAlpha:1,duration:fast(1.5)},54)
        .to($(".mode-food"),{autoAlpha:0,duration:fast(1.5)},54)
        .to($(".cookmode"),{scale:1.6,x:-w*1.2,y:-h*.15,duration:fast(5),ease:"power3.inOut"},60)
        .to($(".meal-world"),{scale:full,x:cx-mealX*full,y:h*.55-mealY*full,duration:fast(5),ease:"power3.inOut"},60)
        .set($(".cookmode, .action-seed"),{autoAlpha:0},65)
        // 65–71: real food, complete stillness.
        .set($(".cookplan"),{autoAlpha:1},71)
        .fromTo($(".plan-days, .plan-meal"),{opacity:0,y:32},{opacity:1,y:0,duration:fast(4),stagger:.25},72)
        .to($(".meal-world"),{scale:1,x:0,y:0,duration:fast(8),ease:"power2.inOut"},71)
        .fromTo($(".plan-title"),{autoAlpha:0,y:24,filter:reduced?"none":"blur(8px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:fast(3)},76)
        .to($(".plan-title"),{y:-h*.5,duration:fast(3),ease:"power2.in"},83)
        .set($(".plan-title"),{autoAlpha:0},86)
        .to($(".cookplan"),{autoAlpha:0,y:-h*.12,duration:fast(3)},83)
        .to($(".meal-world"),{scaleX:tableScaleX,scaleY:tableScaleY,x:tableX-mealX*tableScaleX,y:tableY-mealY*tableScaleY-10,duration:fast(5),ease:"power2.inOut"},83)
        .to($(".return-food"),{rotationX:reduced?0:2,rotationZ:-.5,filter:"sepia(.09) saturate(1.08) brightness(.94) contrast(1.04)",duration:fast(4)},85)
        // The world appears behind the registered shared plate, then makes contact.
        .set($(".table-shot"),{autoAlpha:1},88)
        .fromTo($(".table-photo"),{opacity:0,filter:"brightness(.12)",scale:1,x:0},{opacity:1,filter:"brightness(1)",duration:fast(2.4),ease:"power2.out"},88)
        .to($(".table-contact"),{autoAlpha:.32,scale:1,duration:fast(2.2)},88)
        .to($(".meal-world"),{y:tableY-mealY*tableScaleY,duration:fast(2.2),ease:"power2.out"},88)
        .to($(".return-food"),{rotationX:0,rotationZ:0,duration:fast(2.2)},88)
        .to($(".return-food"),{autoAlpha:0,duration:fast(1.3),ease:"power1.inOut"},90.85)
        .to($(".table-contact"),{autoAlpha:0,duration:fast(.85)},90.85)
        .set($(".meal-world"),{autoAlpha:0},92.35)
        .to($(".table-photo"),{scale:1.035,transformOrigin:"50% 55%",duration:fast(5),ease:"sine.inOut"},93)
        .fromTo($(".table-title"),{autoAlpha:0,y:24,filter:reduced?"none":"blur(8px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:fast(3)},93);
      tl.to({}, {duration:fast(1)},99);
      if (!mobile) {
        gsap.set($(".rehook"),{autoAlpha:0});
        gsap.set($(".rehook-phone"),{y:h,scale:.9,transformOrigin:"50% 100%"});
        gsap.set($(".rehook-title .optical-word, .rehook-title .optical-glyph"),{opacity:0,clipPath:"inset(0 0 100% 0)"});
        tl.addLabel("rehook",100)
          .to($(".table-shot"),{autoAlpha:0,duration:fast(1)},100)
          .set($(".rehook"),{autoAlpha:1},101)
          .to($(".rehook-phone"),{y:0,scale:1,duration:fast(3),ease:"power3.out"},101)
          .set($(".rehook-title"),{autoAlpha:1},105)
          .to($(".rehook-title .optical-word"),{opacity:1,clipPath:"inset(0 0 0% 0)",duration:fast(1),stagger:.09,ease:"power2.out"},105)
          .to($(".rehook-title .optical-glyph"),{opacity:1,clipPath:"inset(0 0 0% 0)",duration:fast(1),stagger:.022,ease:"power2.out"},105.5)
          .to({}, {duration:fast(1)},111);
        socialIcons.forEach((icon,i)=> {
          const el = $(".rehook-icon")[i];
          gsap.set(el,{x:icon.dx*w,y:icon.dy*h,autoAlpha:0});
          tl.to(el,{x:0,y:0,autoAlpha:1,duration:fast(2),ease:"power3.out"},102.4+i*.15);
        });
      }
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      return () => tl.scrollTrigger?.kill();
    },host);
    return () => {clearInterval(timer);carousel?.kill();advanceDishRef.current=()=>undefined;mm.revert();};
  },[viewportRevision, dishes]);

  return <div className="film-experience" ref={root} id="top">
    <div className="film-anchor" id="film" /><div className="film-anchor" id="film-stage" />
    <div className="film-anchor serve-anchor" id="serve" />
    <div className="film-canvas">
      <HeroAtmosphere />
      <section className="film-hero" aria-label={copy.heroAria}>
        <div className="hero-title"><p>{copy.kicker}</p><h1><span>{copy.heroLineOne} <em>{copy.heroWant}</em></span><strong>{copy.heroLineTwo} <em>{copy.heroWay}</em></strong></h1></div>
        <div className="hero-caption hero-recipe"><HeroSunburst/><span>{dishes[0].name}</span><small>{dishes[0].caption}</small></div>
        <a className="hero-down" href="#film-stage" aria-label={copy.watchAria}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v15m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
        <p className="hero-origin">{copy.origin}</p>
      </section>
      <div className="protagonist">
        <div className="hero-foods" role="button" tabIndex={0} aria-label={copy.changeDishAria} onClick={() => advanceDishRef.current()} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); advanceDishRef.current(); } }}>{dishes.map((dish,i)=><Image className="hero-food" key={dish.file} src={FOOD+dish.file+".png"} alt={dish.name} width={1600} height={1600} style={{opacity:i===0?1:0}} fetchPriority={i===0?"high":"auto"} draggable={false} />)}</div>
        <Image className="empty-food" src={ASSET+"lomo_plate_empty.webp"} alt={copy.emptyPlateAlt} width={1600} height={1600} draggable={false}/>
      </div>
      <Title name="opening-title" first={copy.openingFirst} accent={copy.openingAccent}/>
      <div className="request-field" aria-label={copy.requestAria}>
        {field.map((item,i)=><div className={`field-object ${item.file?"ingredient-object":"ticket-object"}`} key={i}>
          {item.file?<Image src={ASSET+item.file} alt={copy.requests[i]} width={640} height={640}/>:<div className={`request-ticket ${i===9?"gold-ticket":""}`}><small>{copy.kitchenNote}</small><strong>{copy.requests[i]}</strong><span>{copy.ticketSignature}</span></div>}
        </div>)}
      </div>
      <div className="compression-light" aria-hidden="true"><i/><b/></div>
      <div className="action-seed" aria-hidden="true"><span>✓</span></div>
      <div className="cooklist" aria-label={copy.listAria}>
        <Title name="list-title" first={copy.listFirst} accent={copy.listAccent}/>
        <div className="list-composition">
          <div className="list-heading"><b className="product-wordmark">{copy.brandCook}<em>{copy.brandPilot}</em></b><div className="list-controls"><span className="portion-pill">− &nbsp; {copy.people} &nbsp; +</span><span className="yellow-pill">{copy.allInOne}</span></div></div>
          <div className="ingredient-grid">{ingredients.map((file,index)=><div className="ingredient-row" key={file}><span className="row-check">✓</span><Image src={ASSET+file} alt="" width={65} height={65}/><strong>{copy.ingredients[index].name}</strong><span className="ingredient-amount">{copy.ingredients[index].amount}</span></div>)}</div>
          <div className="list-ready"><strong>{dishes[0].name}</strong><span>{copy.readyToCook}</span></div>
        </div>
      </div>
      <div className="cookmode" aria-label={copy.modeAria}>
        <Title name="mode-title" first={copy.modeFirst} accent={copy.modeAccent}/>
        <div className="mode-track"><span className="mode-done">✓</span><span className="mode-done">✓</span>{[1,2,3].map(n=><span className={`step step-${n}`} key={n}>{n}</span>)}<i/></div>
        <div className="mode-lower-row">
          {copy.instructions.map((instruction,index)=><div className={`instruction-plane instruction-${["one","two","three"][index]}`} key={instruction.meta}><small>{instruction.meta}</small><p>{instruction.line}<br/><em>{instruction.accent}</em></p></div>)}
          <div className="mode-food"><Image className="mode-beef" src="/images/food/lomo_beef_only.png" alt={copy.modeBeefAlt} width={640} height={640}/><Image className="mode-stir" src="/images/food/lomo_stir_fry.png" alt={copy.modeStirAlt} width={640} height={640}/></div>
        </div>
      </div>
        <div className="cookplan" aria-label={copy.planAria}>
          <div className="plan-top"><b className="product-wordmark">{copy.brandCook}<em>{copy.brandPilot}</em></b><span>{copy.yourWeek}</span></div>
          <div className="plan-days">{copy.weekDays.map((day,i)=><div className={i===3?"chosen":""} key={day}><span>{day}</span><strong>{15+i}</strong></div>)}</div>
          <div className="plan-meal">
              <div className="lunch-header"><strong><i className="lunch-icon">☀</i>{copy.lunch}</strong><span>{copy.people}</span><b>{copy.cook}</b></div>
            <div className="lunch-menu">
                <div className="lunch-item"><div className="lunch-food-slot"/><strong>{copy.mealItems[0].name}</strong></div>
                <div className="lunch-item"><div className="lunch-food-slot"><Image src={FOOD+"ensalada_de_palta.png"} alt={copy.mealItems[1].alt} width={640} height={640}/></div><strong>{copy.mealItems[1].name}</strong></div>
                <div className="lunch-item"><div className="lunch-food-slot"><Image src="/images/food/jugo_maracuya_cutout.png" alt={copy.mealItems[2].alt} width={640} height={640}/></div><strong>{copy.mealItems[2].name}</strong></div>
            </div>
          </div>
        </div>
      <div className="meal-world">
        <Image className="return-food" src={FOOD+"lomo_saltado.png"} alt={dishes[0].name} width={640} height={640} draggable={false}/>
      </div>
      <Title name="plan-title" first={copy.planFirst} accent={copy.planAccent}/>
      <div className="table-contact" aria-hidden="true"/>
      <div className="table-shot" aria-label={copy.tableAria}><Image className="table-photo" src={ASSET+"lomo_table_final.png"} alt={copy.tableAlt} width={1672} height={941}/><div className="table-shade"/><Title name="table-title" first={copy.tableFirst} accent={copy.tableAccent}/></div>
      <section className="rehook" aria-label={copy.rehookAria}>
        <Image className="rehook-phone" src="/images/cook-film/lomo_phone_hand.png" alt={copy.rehookAlt} width={1200} height={1200} draggable={false}/>
        {socialIcons.map((icon,i)=><div className="rehook-icon" key={icon.file} style={{left:`${icon.x}%`,top:`${icon.y}%`,width:`min(${icon.size / 10}vw, ${icon.size / 7}vh)`}}>
          <Image src={`/icons/social/${icon.file}.png`} alt={copy.socialNames[i]} width={320} height={320} draggable={false} style={{animationDuration:`${6+i*.85}s`,animationDelay:`-${i*1.3}s`,"--float":`${icon.float}px`,"--rotation":`${icon.rotation}deg`} as React.CSSProperties}/>
        </div>)}
        <Title name="rehook-title" first={copy.rehookFirst} accent={copy.rehookAccent}/>
      </section>
    </div>
  </div>;
}
