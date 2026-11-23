
(()=>{
"use strict";

/* V36.50.0
   Gameplay real de Ruta 1: las fórmulas/cadencia base se toman del motor Kanto,
   pero TODO el estado persistente vive en pokesenda_johto_dev_isolated_v1. */
const SAVE="pokesenda_johto_dev_isolated_v1";
const ANIM="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/";
const EXTRA={"natures":{"fuerte":{"name":"Fuerte","up":"atk","down":"atk","neutral":true},"huraña":{"name":"Huraña","up":"atk","down":"def"},"audaz":{"name":"Audaz","up":"atk","down":"speed"},"firme":{"name":"Firme","up":"atk","down":"spAtk"},"picara":{"name":"Pícara","up":"atk","down":"spDef"},"osada":{"name":"Osada","up":"def","down":"atk"},"docil":{"name":"Dócil","up":"def","down":"def","neutral":true},"placida":{"name":"Plácida","up":"def","down":"speed"},"agitada":{"name":"Agitada","up":"def","down":"spAtk"},"floja":{"name":"Floja","up":"def","down":"spDef"},"miedosa":{"name":"Miedosa","up":"speed","down":"atk"},"activa":{"name":"Activa","up":"speed","down":"def"},"seria":{"name":"Seria","up":"speed","down":"speed","neutral":true},"alegre":{"name":"Alegre","up":"speed","down":"spAtk"},"ingenua":{"name":"Ingenua","up":"speed","down":"spDef"},"modesta":{"name":"Modesta","up":"spAtk","down":"atk"},"afable":{"name":"Afable","up":"spAtk","down":"def"},"mansa":{"name":"Mansa","up":"spAtk","down":"speed"},"timida":{"name":"Tímida","up":"spAtk","down":"spAtk","neutral":true},"alocada":{"name":"Alocada","up":"spAtk","down":"spDef"},"serena":{"name":"Serena","up":"spDef","down":"atk"},"amable":{"name":"Amable","up":"spDef","down":"def"},"grosera":{"name":"Grosera","up":"spDef","down":"speed"},"cauta":{"name":"Cauta","up":"spDef","down":"spAtk"},"rara":{"name":"Rara","up":"spDef","down":"spDef","neutral":true}},"crossStats":{"25":[35,55,40,50,50,90],"26":[60,90,55,90,80,110],"35":[70,45,48,60,65,35],"36":[95,70,73,95,90,60],"39":[115,45,20,45,25,20],"40":[140,70,45,85,50,45],"41":[40,45,35,30,40,55],"42":[75,80,70,65,75,90],"43":[45,50,55,75,65,30],"44":[60,65,70,85,75,40],"45":[75,80,85,110,90,50],"60":[40,50,40,40,40,90],"61":[65,65,65,50,50,90],"62":[90,95,95,70,90,70],"79":[90,65,65,40,40,15],"80":[95,75,110,100,80,30],"95":[35,45,160,30,45,70],"106":[50,120,53,35,110,87],"107":[50,105,79,35,110,76],"113":[250,5,5,35,105,50],"116":[30,40,70,70,25,60],"117":[55,65,95,95,45,85],"123":[70,110,80,55,80,105],"124":[65,50,35,115,95,95],"125":[65,83,57,95,85,105],"126":[65,95,57,100,85,93],"133":[55,55,50,45,65,55],"134":[130,65,60,110,95,65],"135":[65,65,60,110,95,130],"136":[65,130,60,95,110,65],"137":[65,60,70,85,75,40]},"crossNames":{"25":"Pikachu","26":"Raichu","35":"Clefairy","36":"Clefable","39":"Jigglypuff","40":"Wigglytuff","41":"Zubat","42":"Golbat","43":"Oddish","44":"Gloom","45":"Vileplume","60":"Poliwag","61":"Poliwhirl","62":"Poliwrath","79":"Slowpoke","80":"Slowbro","95":"Onix","106":"Hitmonlee","107":"Hitmonchan","113":"Chansey","116":"Horsea","117":"Seadra","123":"Scyther","124":"Jynx","125":"Electabuzz","126":"Magmar","133":"Eevee","134":"Vaporeon","135":"Jolteon","136":"Flareon","137":"Porygon"},"itemDefs":{"potion":{"name":"Poción","icon":"🧪","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png","rarity":"common","consumable":true,"healPct":0.25,"desc":"Consumible: restaura 25% de los PS máximos de un Pokémon vivo durante una expedición."},"super_potion":{"name":"Superpoción","icon":"🧴","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png","rarity":"uncommon","consumable":true,"healPct":0.5,"desc":"Consumible: restaura 50% de los PS máximos de un Pokémon vivo durante una expedición."},"hyper_potion":{"name":"Hiperpoción","icon":"⚗️","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png","rarity":"rare","consumable":true,"healPct":1.0,"desc":"Consumible: restaura 100% de los PS máximos de un Pokémon vivo durante una expedición."},"full_heal":{"name":"Cura Total","icon":"💊","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-heal.png","rarity":"uncommon","consumable":true,"curesStatus":true,"desc":"Consumible: elimina quemadura, veneno, parálisis, sueño, congelación y confusión de un Pokémon vivo."},"oran_berry":{"name":"Baya Aranja","icon":"🍊","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oran-berry.png","rarity":"common","hp":0.05,"desc":"+5% PS máximos."},"quick_claw":{"name":"Garra Rápida","icon":"🦴","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-claw.png","rarity":"rare","speed":0.12,"desc":"+12% velocidad de ataque."},"scope_lens":{"name":"Periscopio","icon":"🔭","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png","rarity":"rare","crit":0.1,"desc":"+10% probabilidad de crítico."},"focus_band":{"name":"Cinta Focus","icon":"🎗️","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-band.png","rarity":"rare","survive":0.08,"desc":"8% de sobrevivir a un golpe mortal con 1 PS."},"leftovers":{"name":"Restos","icon":"🍱","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png","rarity":"epic","roundHeal":0.045,"desc":"+4,5% PS máximos recuperados después de cada grupo."},"lucky_egg":{"name":"Huevo Suerte","icon":"🥚","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png","rarity":"legendary","xp":0.35,"desc":"+35% experiencia obtenida."},"kings_rock":{"name":"Roca del Rey","icon":"👑","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png","rarity":"epic","slowProc":0.12,"evolutionCatalyst":true,"desc":"12% de retrasar el próximo ataque del objetivo. En Johto también funciona como catalizador para evoluciones especiales por intercambio."},"link_cable":{"name":"Cable de Intercambio","icon":"🔗","rarity":"epic","tradeOnly":true,"desc":"Permite evoluciones por intercambio. Equípalo junto al catalizador requerido cuando corresponda y sube 1 nivel; si el Pokémon ya está en Nv.60, la evolución queda disponible inmediatamente."},"relearning_orb":{"name":"Orbe de Reaprendizaje","icon":"🔮","rarity":"legendary","desc":"Objeto Legendario de reconfiguración. Reinicia todos los rangos de movimientos del Pokémon a su nivel base y devuelve íntegramente los puntos invertidos para repartirlos de nuevo. No cambia nivel, estrellas, evolución, MT ni objeto equipado.","consumable":true,"resetMoves":true,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sacred-ash.png"},"miracle_seed":{"name":"Semilla Milagro","icon":"🌱","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/miracle-seed.png","rarity":"uncommon","boostType":"grass","power":0.12,"desc":"+12% daño Planta."},"mystic_water":{"name":"Agua Mística","icon":"💧","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mystic-water.png","rarity":"uncommon","boostType":"water","power":0.12,"desc":"+12% daño Agua."},"charcoal":{"name":"Carbón","icon":"🔥","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charcoal.png","rarity":"uncommon","boostType":"fire","power":0.12,"desc":"+12% daño Fuego."},"magnet":{"name":"Imán","icon":"🧲","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magnet.png","rarity":"uncommon","boostType":"electric","power":0.12,"desc":"+12% daño Eléctrico."},"sharp_beak":{"name":"Pico Afilado","icon":"🪶","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sharp-beak.png","rarity":"uncommon","boostType":"flying","power":0.12,"desc":"+12% daño Volador."},"soft_sand":{"name":"Arena Fina","icon":"🏜️","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soft-sand.png","rarity":"uncommon","boostType":"ground","power":0.12,"desc":"+12% daño Tierra."},"hard_stone":{"name":"Piedra Dura","icon":"🪨","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hard-stone.png","rarity":"uncommon","boostType":"rock","power":0.12,"desc":"+12% daño Roca."},"black_belt":{"name":"Cinturón Negro","icon":"🥋","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-belt.png","rarity":"uncommon","boostType":"fighting","power":0.12,"desc":"+12% daño Lucha."},"twisted_spoon":{"name":"Cuchara Torcida","icon":"🥄","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/twisted-spoon.png","rarity":"uncommon","boostType":"psychic","power":0.12,"desc":"+12% daño Psíquico."},"spell_tag":{"name":"Hechizo","icon":"🏷️","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/spell-tag.png","rarity":"uncommon","boostType":"ghost","power":0.12,"desc":"+12% daño Fantasma."},"never_melt_ice":{"name":"Antiderretir","icon":"❄️","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/never-melt-ice.png","rarity":"uncommon","boostType":"ice","power":0.12,"desc":"+12% daño Hielo."},"dragon_fang":{"name":"Colmillo Dragón","icon":"🐉","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-fang.png","rarity":"uncommon","boostType":"dragon","power":0.12,"desc":"+12% daño Dragón."},"silver_powder":{"name":"Polvo Plata","icon":"✨","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/silver-powder.png","rarity":"common","boostType":"bug","power":0.08,"desc":"+8% daño Bicho."},"poison_barb":{"name":"Flecha Venenosa","icon":"🪡","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poison-barb.png","rarity":"common","boostType":"poison","power":0.08,"desc":"+8% daño Veneno."},"light_ball":{"name":"Bola Luminosa","icon":"⚡","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/light-ball.png","rarity":"epic","atk":0.4,"restrictDex":[25,26,172],"desc":"+40% ATQ y AT. ESP. para Pichu, Pikachu y Raichu."},"fire_stone":{"name":"Piedra Fuego","icon":"🔴","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png","rarity":"rare","consumable":true,"evolutionStone":true,"desc":"Piedra evolutiva. Permite evoluciones de tipo Piedra Fuego, incluido Eevee a Flareon. Se consume al evolucionar."},"water_stone":{"name":"Piedra Agua","icon":"🔵","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png","rarity":"rare","consumable":true,"evolutionStone":true,"desc":"Piedra evolutiva. Permite evoluciones de tipo Piedra Agua, incluido Eevee a Vaporeon y Poliwhirl a Poliwrath. Se consume al evolucionar."},"thunder_stone":{"name":"Piedra Trueno","icon":"🟡","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png","rarity":"rare","consumable":true,"evolutionStone":true,"desc":"Piedra evolutiva. Permite evoluciones de tipo Piedra Trueno, incluido Pikachu a Raichu y Eevee a Jolteon. Se consume al evolucionar."},"leaf_stone":{"name":"Piedra Hoja","icon":"🟢","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png","rarity":"rare","consumable":true,"evolutionStone":true,"desc":"Piedra evolutiva. Permite evoluciones de tipo Piedra Hoja, incluido Gloom a Vileplume. Se consume al evolucionar."},"moon_stone":{"name":"Piedra Lunar","icon":"🌙","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png","rarity":"epic","consumable":true,"evolutionStone":true,"desc":"Piedra evolutiva. Permite evoluciones de tipo Piedra Lunar en las familias compatibles. Se consume al evolucionar."},"sun_stone":{"name":"Piedra Solar","icon":"☀️","rarity":"epic","consumable":true,"evolutionStone":true,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png","desc":"Piedra evolutiva de Johto para Bellossom y Sunflora."},"metal_coat":{"name":"Revestimiento Metálico","icon":"⚙️","rarity":"epic","boostType":"steel","power":0.12,"evolutionCatalyst":true,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metal-coat.png","desc":"+12% daño Acero. También sirve con Cable para Steelix y Scizor."},"dragon_scale":{"name":"Escama Dragón","icon":"🐉","rarity":"epic","evolutionCatalyst":true,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-scale.png","desc":"Catalizador de evolución para Kingdra junto al Cable de Intercambio."},"up_grade":{"name":"Mejora","icon":"💾","rarity":"epic","evolutionCatalyst":true,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/up-grade.png","desc":"Catalizador de evolución para Porygon2 junto al Cable de Intercambio."},"black_glasses":{"name":"Gafas de Sol","icon":"🕶️","rarity":"uncommon","boostType":"dark","power":0.12,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-glasses.png","desc":"+12% daño Siniestro."},"amulet_coin":{"name":"Moneda Amuleto","icon":"🪙","rarity":"rare","money":0.18,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/amulet-coin.png","desc":"+18% Pokédolares obtenidos por derrotas durante rutas de Johto."},"bright_powder":{"name":"Polvo Brillo","icon":"✨","rarity":"rare","dodge":0.07,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bright-powder.png","desc":"7% de probabilidad de evitar un ataque recibido. Efecto adaptado al combate idle."},"smoke_ball":{"name":"Bola Humo","icon":"🌫️","rarity":"uncommon","speed":0.1,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/smoke-ball.png","desc":"+10% velocidad de ataque. Adaptación de su utilidad de escape."},"cleanse_tag":{"name":"Amuleto","icon":"🏷️","rarity":"uncommon","statusResist":0.15,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cleanse-tag.png","desc":"+15% resistencia a estados alterados."},"pink_bow":{"name":"Lazo Rosa","icon":"🎀","rarity":"uncommon","boostType":"normal","power":0.12,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pink-bow.png","desc":"+12% daño Normal. Objeto clásico de Johto adaptado al sistema de tipos de PokéSenda."},"gold_berry":{"name":"Baya Dorada","icon":"🟡","rarity":"rare","hp":0.08,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png","desc":"+8% PS máximos. Adaptación PokéSenda de la Baya Dorada de Gen II."},"miracle_berry":{"name":"Baya Milagro","icon":"🫐","rarity":"rare","statusResist":0.22,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lum-berry.png","desc":"+22% resistencia a estados alterados. Adaptación de la Baya Milagro de Gen II."},"lucky_punch":{"name":"Puño Suerte","icon":"🥊","rarity":"epic","crit":0.2,"restrictDex":[113,242],"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-punch.png","desc":"+20% crítico para Chansey/Blissey. Muy raro y específico de su familia."},"sacred_ash":{"name":"Ceniza Sagrada","icon":"🪶","rarity":"legendary","specialReward":true,"sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sacred-ash.png","desc":"Recompensa especial de endgame asociada a Ho-Oh. No formará parte del drop normal de enemigos."}},"crossTypes":{"25":["electric"],"26":["electric"],"35":["fairy"],"36":["fairy"],"39":["normal","fairy"],"40":["normal","fairy"],"41":["poison","flying"],"42":["poison","flying"],"43":["grass","poison"],"44":["grass","poison"],"45":["grass","poison"],"60":["water"],"61":["water"],"62":["water","fighting"],"79":["water","psychic"],"80":["water","psychic"],"95":["rock","ground"],"106":["fighting"],"107":["fighting"],"113":["normal"],"116":["water"],"117":["water"],"123":["bug","flying"],"124":["ice","psychic"],"125":["electric"],"126":["fire"],"133":["normal"],"134":["water"],"135":["electric"],"136":["fire"],"137":["normal"]}};
const MAX_DISTANCE=10000,MAX_LEVEL=60,RESERVE_XP_RATE=.10,POKEMON_CENTERS=[2500,5000,7500],ROUND_HEAL=.045;
const JOHTO_ACT_DIFFICULTY={
 johto_route1:{hp:.52,atk:.54,def:.88,speed:1.00,bossHp:4.8,finalBossHp:10.0,bossAtk:1.35},
 johto_route2:{hp:.72,atk:.68,def:.95,speed:.98,bossHp:4.6,finalBossHp:7.4,bossAtk:1.08},
 johto_route3:{hp:.98,atk:.91,def:1.05,speed:.89,bossHp:5.2,finalBossHp:9.0,bossAtk:1.15}
};
function johtoRouteDifficultyCurve(routeId,distance){
  if(routeId!=="johto_route3")return {hp:1,atk:1,def:1,speed:1};
  const progress=Math.max(0,Math.min(1,Number(distance||0)/MAX_DISTANCE));
  return {hp:1+progress*.18,atk:1+progress*.14,def:1+progress*.08,speed:1-progress*.05};
}
const $=id=>document.getElementById(id),API=()=>window.PokeSendaJohtoIsolated,DATA=()=>API()?.getData?.()||{};
const PHYSICAL_TYPES=new Set(["normal","fighting","flying","poison","ground","rock","bug","ghost","steel"]);
const PHYSICAL_MOVE_NAMES=new Set(["Doble Ataque","Picadura","Tijera X","Cola Dragón","Chispa","Doble Patada","Golpe Karate","Llave Vital","Tajo Cruzado","Colmillo Ígneo","Ataque Ala","Golpe Aéreo","Pico Taladro","Picotazo","Impresionar","Lengüetazo","Bomba Germen","Hoja Afilada","Látigo Cepa","Excavar","Hueso Palo","Huesomerang","Terremoto","Agarre","Arañazo","Atadura","Ataque Rápido","Azote","Cornada","Destructor","Doble Filo","Golpe Cabeza","Golpe Cuerpo","Hipercolmillo","Mordisco","Pisotón","Placaje","Aguijón Venenoso","Picotazo Veneno","Veneno Cruzado","Avalancha","Lanzarrocas","Acua Cola","Martillazo"]);
const SPECIAL_MOVE_NAMES=new Set(["Viento Plata","Furia Dragón","Pulso Dragón","Descarga","Electrotela","Impactrueno","Rayo","Trueno","Brillo Mágico","Voz Cautivadora","Ascua","Lanzallamas","Aire Afilado","Tornado","Vendaval","Bola Sombra","Absorber","Megaagotar","Rayo Aurora","Rayo Hielo","Ventisca","Bomba Sónica","Rapidez","Bomba Lodo","Ácido","Come Sueños","Confusión","Psicorrayo","Psíquico","Poder Pasado","Burbuja","Hidrobomba","Hidropulso","Pistola Agua","Surf"]);
const STARTERS=["j_chikorita","j_cyndaquil","j_totodile"],WEAK={j_chikorita:"j_totodile",j_cyndaquil:"j_chikorita",j_totodile:"j_cyndaquil"},STRONG={j_chikorita:"j_cyndaquil",j_cyndaquil:"j_totodile",j_totodile:"j_chikorita"};
const TYPE={
 normal:{rock:.5,ghost:0,steel:.5},fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},
 water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
 grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},
 fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},
 ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},
 psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},bug:{fire:.5,grass:2,fighting:.5,poison:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},
 rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},ghost:{normal:0,psychic:2,ghost:2,dark:.5},
 dragon:{dragon:2,steel:.5,fairy:0},dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},
 fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}
};
const STATUS_META={burn:"🔥 BRN",poison:"☠ PSN",paralysis:"⚡ PAR",sleep:"💤 SLP",freeze:"❄ FRZ",confusion:"💫 CONF"};

const INCENSE_TYPES=["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"],INCENSE_TYPE_NAMES={normal:"Normal",fire:"Fuego",water:"Agua",electric:"Eléctrico",grass:"Planta",ice:"Hielo",fighting:"Lucha",poison:"Veneno",ground:"Tierra",flying:"Volador",psychic:"Psíquico",bug:"Bicho",rock:"Roca",ghost:"Fantasma",dragon:"Dragón",dark:"Siniestro",steel:"Acero",fairy:"Hada"},INCENSE_PRICE=10000,INCENSE_WEIGHT_MULT=5,INCENSE_SPRITE="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sea-incense.png";
const MINT_PRICE=50000,MASTER_MINT_PRICE=150000,MASTER_MINT_CHANCE=.02;
const NATURE_KEYS=Object.keys(EXTRA.natures),MINT_NATURE_KEYS=NATURE_KEYS.filter(k=>!EXTRA.natures[k].neutral||k==="seria");
function incenseItemId(type){return "type_incense_"+type;}
function incenseTypeFromItem(id){return String(id||"").startsWith("type_incense_")?String(id).slice(13):null;}
function materialItemDef(id){
  const type=incenseTypeFromItem(id);if(type&&INCENSE_TYPES.includes(type))return{name:"Incienso "+(INCENSE_TYPE_NAMES[type]||type),icon:"🧿",rarity:"uncommon",incense:true,incenseType:type,sprite:INCENSE_SPRITE,desc:"Multiplica ×5 el peso de familias afines a este tipo dentro de la rareza que ya haya salido. No cambia la rareza ni la probabilidad Shiny."};
  return EXTRA.itemDefs?.[id]||null;
}
function markJohtoItemSeen(id){
  if(!materialItemDef(id))return false;js.itemSeen=Array.isArray(js.itemSeen)?js.itemSeen:[];js.itemUnread=Array.isArray(js.itemUnread)?js.itemUnread:[];
  const fresh=!js.itemSeen.includes(id);if(fresh){js.itemSeen.push(id);if(!js.itemUnread.includes(id))js.itemUnread.push(id);}return fresh;
}
function natureEffectText(k){const n=EXTRA.natures[k]||EXTRA.natures.seria;if(n.neutral||n.up===n.down)return "Sin variación de estadísticas";const L={atk:"ATQ",def:"DEF",spAtk:"AT. ESP.",spDef:"DEF. ESP.",speed:"Velocidad"};return "▲ "+L[n.up]+" +10% base · ▼ "+L[n.down]+" -10% base";}
function mintSpriteUrl(k){const slugs={fuerte:"hardy",huraña:"lonely",audaz:"brave",firme:"adamant",picara:"naughty",osada:"bold",docil:"docile",placida:"relaxed",agitada:"impish",floja:"lax",miedosa:"timid",activa:"hasty",seria:"serious",alegre:"jolly",ingenua:"naive",modesta:"modest",afable:"mild",mansa:"quiet",timida:"bashful",alocada:"rash",serena:"calm",amable:"gentle",grosera:"sassy",cauta:"careful",rara:"quirky"};return "https://www.serebii.net/itemdex/sprites/sv/"+(slugs[k]||"serious")+"mint.png";}
function familyMatchesType(fid,type){const f=fam(fid);return !!f&&(f.members||[]).some(d=>(species(d).types||[]).includes(type));}
function randomIncenseOffers(){const a=[...INCENSE_TYPES];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,3);}
function randomMintOffers(){const a=[...MINT_NATURE_KEYS];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const out=a.slice(0,3).map(nature=>({kind:"mint",nature}));if(Math.random()<MASTER_MINT_CHANCE)out[Math.floor(Math.random()*out.length)]={kind:"master"};return out;}
const STAR_COSTS={1:10,2:100,3:1000,4:10000};
const RARITY_CANDY={common:10,uncommon:15,rare:25,epic:50,legendary:25};
function skillRank(id){const n=Number(js?.skillTree?.[id]||0);return Number.isFinite(n)?n:0;}
function captureFamilyRarity(fid){
  if(STARTERS.includes(fid))return "rare";
  const tags=fam(fid)?.tags||[];if(tags.includes("legendary")||tags.includes("mythical"))return "legendary";
  for(const r of Object.values(DATA().routes||{}))for(const [rar,ids] of Object.entries(r.gachaByRarity||{}))if((ids||[]).includes(fid))return rar;
  return "common";
}
// Johto RELEASE · rareza VISIBLE por especie, igual que Kanto.
// Las probabilidades del Gachapon siguen siendo por familia (captureFamilyRarity);
// la Pokédex, Caja, fichas y recompensa final usan el valor individual de cada especie.
const JOHTO_SPECIES_RARITY=(()=>{
  const out={};
  const put=(rar,dexes)=>dexes.forEach(d=>out[Number(d)]=rar);
  put("common",[41,43,44,60,116,161,163,165,167,170,187,191,194,204,216,218,220,223,231]);
  put("uncommon",[39,40,42,45,61,79,117,162,164,166,168,177,179,180,183,188,190,192,193,195,198,203,206,209,211,219,221,222,224,225,228,234]);
  put("rare",[25,26,35,36,62,80,95,106,107,113,124,125,126,133,134,135,136,137,152,153,155,156,158,159,171,172,173,174,178,182,184,185,186,189,200,201,202,205,207,210,213,215,217,226,232,235,236,237,238,239,240,246,247]);
  put("epic",[123,154,157,160,169,175,176,181,196,197,199,208,212,214,227,229,230,233,241,242,248]);
  put("legendary",[243,244,245,249,250,251]);
  return Object.freeze(out);
})();
function rarityForDex(dex,fallback="common"){return JOHTO_SPECIES_RARITY[Number(dex)]||fallback;}
function familyRarity(fid,dexOverride=null){
  const p=js?.pokemon?.[fid],members=fam(fid)?.members||[],dex=Number((dexOverride??p?.dex??members[0])||0);
  return rarityForDex(dex,captureFamilyRarity(fid));
}
function shinyRelativeMult(){const dexBonus=Number(window.PokeSendaShinyDexBonus?.relativeBonus?.("johto")||0);return 1+.08*skillRank("f15")+.10*skillRank("f16")+.14*skillRank("f17")+dexBonus;}
function candyReward(rarity){
  const masterFortune=skillRank("f8") ? 0.10 : 0;
  let n=Math.max(1,Math.round((RARITY_CANDY[rarity]||10)*(1+.03*skillRank("f2")+masterFortune)));
  if(skillRank("f7")&&Math.random()<.10)n*=2;
  return n;
}

let js=null,run=null,timer=null,reward=null,centerTimer=null,centerDeadline=0,floatingDriver=false,floatingAutoRestartPending=false,backgroundAutoRestartWallMs=0,backgroundCatchingUp=false,backgroundSaveDirty=false,backgroundCarryReal=0,backgroundDrainTimer=null,backgroundRecoveredTotal=0,backgroundDrainFaulted=false,backgroundWasEligibleOnHide=false;

function load(){const raw=localStorage.getItem(SAVE);if(!raw)return{};try{const x=JSON.parse(raw);return x&&typeof x==="object"?x:{};}catch(e){const recovered=window.PokeSendaSaveGuard?.getRecoveryObject?.(SAVE);if(recovered)return recovered;window.PokeSendaSaveGuard?.flagLoadFailure?.(SAVE,"El save de Johto no se pudo leer. Se bloqueó la sobrescritura automática para proteger la partida.");return{};}}
function save(){if(backgroundCatchingUp){backgroundSaveDirty=true;return;}localStorage.setItem(SAVE,JSON.stringify(js));}
function randomNature(){const a=Object.keys(EXTRA.natures);return a[Math.floor(Math.random()*a.length)]||"seria";}
function natureName(k){return EXTRA.natures[k]?.name||"Seria";}
const JOHTO_BRANCH_STANDALONE=Object.freeze({
  j_eevee:Object.freeze({134:"j_vaporeon",135:"j_jolteon",136:"j_flareon",196:"j_espeon",197:"j_umbreon"}),
  j_oddish:Object.freeze({45:"j_vileplume",182:"j_bellossom"}),
  j_poliwag:Object.freeze({62:"j_poliwrath",186:"j_politoed"}),
  j_slowpoke:Object.freeze({80:"j_slowbro",199:"j_slowking"}),
  j_tyrogue:Object.freeze({106:"j_hitmonlee",107:"j_hitmonchan",237:"j_hitmontop"})
});
const JOHTO_BRANCH_STANDALONE_FAMILIES=Object.freeze({
  j_vaporeon:{id:"j_vaporeon",name:"Vaporeon",members:[133,134],evolutions:[],tags:["standalone_branch"]},
  j_jolteon:{id:"j_jolteon",name:"Jolteon",members:[133,135],evolutions:[],tags:["standalone_branch"]},
  j_flareon:{id:"j_flareon",name:"Flareon",members:[133,136],evolutions:[],tags:["standalone_branch"]},
  j_espeon:{id:"j_espeon",name:"Espeon",members:[133,196],evolutions:[],tags:["standalone_branch"]},
  j_umbreon:{id:"j_umbreon",name:"Umbreon",members:[133,197],evolutions:[],tags:["standalone_branch"]},
  j_vileplume:{id:"j_vileplume",name:"Vileplume",members:[43,44,45],evolutions:[],tags:["standalone_branch"]},
  j_bellossom:{id:"j_bellossom",name:"Bellossom",members:[43,44,182],evolutions:[],tags:["standalone_branch"]},
  j_poliwrath:{id:"j_poliwrath",name:"Poliwrath",members:[60,61,62],evolutions:[],tags:["standalone_branch"]},
  j_politoed:{id:"j_politoed",name:"Politoed",members:[60,61,186],evolutions:[],tags:["standalone_branch"]},
  j_slowbro:{id:"j_slowbro",name:"Slowbro",members:[79,80],evolutions:[],tags:["standalone_branch"]},
  j_slowking:{id:"j_slowking",name:"Slowking",members:[79,199],evolutions:[],tags:["standalone_branch"]},
  j_hitmonlee:{id:"j_hitmonlee",name:"Hitmonlee",members:[236,106],evolutions:[],tags:["standalone_branch"]},
  j_hitmonchan:{id:"j_hitmonchan",name:"Hitmonchan",members:[236,107],evolutions:[],tags:["standalone_branch"]},
  j_hitmontop:{id:"j_hitmontop",name:"Hitmontop",members:[236,237],evolutions:[],tags:["standalone_branch"]}
});
const JOHTO_BRANCH_TARGET_TO_ROOT=Object.freeze(Object.fromEntries(Object.entries(JOHTO_BRANCH_STANDALONE).flatMap(([root,map])=>Object.values(map).map(id=>[id,root]))));
function fam(id){return DATA().families?.[id]||JOHTO_BRANCH_STANDALONE_FAMILIES[id]||null;}
const JOHTO_BRANCH_FINAL_MOVESETS=Object.freeze({
  // Eevee: cada evolución final conserva una identidad de combate propia.
  j_vaporeon:Object.freeze([
    Object.freeze({kind:"attack",name:"Pistola Agua",type:"water",power:40,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Mordisco",type:"dark",power:60,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Hidrobomba",type:"water",power:120,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Deseo",type:"support",effect:"heal",unlockStage:0})
  ]),
  j_jolteon:Object.freeze([
    Object.freeze({kind:"attack",name:"Impactrueno",type:"electric",power:40,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Ataque Rápido",type:"normal",power:40,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Rayo",type:"electric",power:95,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Agilidad",type:"support",effect:"haste",unlockStage:0})
  ]),
  j_flareon:Object.freeze([
    Object.freeze({kind:"attack",name:"Ascua",type:"fire",power:40,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Mordisco",type:"dark",power:60,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Lanzallamas",type:"fire",power:95,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Foco Energía",type:"support",effect:"power",unlockStage:0})
  ]),
  j_espeon:Object.freeze([
    Object.freeze({kind:"attack",name:"Confusión",type:"psychic",power:50,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Psicorrayo",type:"psychic",power:65,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Psíquico",type:"psychic",power:90,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Paz Mental",type:"support",effect:"power",unlockStage:0})
  ]),
  j_umbreon:Object.freeze([
    Object.freeze({kind:"attack",name:"Mordisco",type:"dark",power:60,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Ataque Rápido",type:"normal",power:40,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Triturar",type:"dark",power:90,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Amnesia",type:"support",effect:"guard",unlockStage:0})
  ]),

  // Oddish: Vileplume se inclina a Veneno/ofensiva; Bellossom a Planta/sostenimiento.
  j_vileplume:Object.freeze([
    Object.freeze({kind:"attack",name:"Absorber",type:"grass",power:35,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Bomba Lodo",type:"poison",power:90,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Danza Pétalo",type:"grass",power:100,unlockStage:1,area:true}),
    Object.freeze({kind:"support",name:"Dulce Aroma",type:"support",effect:"heal",unlockStage:0})
  ]),
  j_bellossom:Object.freeze([
    Object.freeze({kind:"attack",name:"Absorber",type:"grass",power:35,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Hoja Afilada",type:"grass",power:55,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Danza Pétalo",type:"grass",power:100,unlockStage:1,area:true}),
    Object.freeze({kind:"support",name:"Síntesis",type:"support",effect:"heal",unlockStage:0})
  ]),

  // Poliwag: Poliwrath prioriza el híbrido Agua/Lucha; Politoed el daño especial y control.
  j_poliwrath:Object.freeze([
    Object.freeze({kind:"attack",name:"Burbuja",type:"water",power:40,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Demolición",type:"fighting",power:75,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Surf",type:"water",power:95,unlockStage:1,area:true}),
    Object.freeze({kind:"support",name:"Foco Energía",type:"support",effect:"power",unlockStage:0})
  ]),
  j_politoed:Object.freeze([
    Object.freeze({kind:"attack",name:"Hidropulso",type:"water",power:60,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Golpe Cuerpo",type:"normal",power:85,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Hidrobomba",type:"water",power:120,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Hipnosis",type:"support",effect:"guard",unlockStage:0})
  ]),

  // Slowpoke: Slowbro mantiene el set defensivo clásico; Slowking gana cobertura y enfoque especial.
  j_slowbro:Object.freeze([
    Object.freeze({kind:"attack",name:"Pistola Agua",type:"water",power:40,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Confusión",type:"psychic",power:50,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Psíquico",type:"psychic",power:90,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Relajo",type:"support",effect:"heal",unlockStage:0})
  ]),
  j_slowking:Object.freeze([
    Object.freeze({kind:"attack",name:"Hidropulso",type:"water",power:60,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Psíquico",type:"psychic",power:90,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Poder Pasado",type:"rock",power:60,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Amnesia",type:"support",effect:"guard",unlockStage:0})
  ]),

  // Tyrogue: cada Hitmon refleja su estilo (patadas, puños o giro técnico).
  j_hitmonlee:Object.freeze([
    Object.freeze({kind:"attack",name:"Patada Baja",type:"fighting",power:65,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Demolición",type:"fighting",power:75,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Doble Golpe",type:"normal",power:90,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Foco Energía",type:"support",effect:"power",unlockStage:0})
  ]),
  j_hitmonchan:Object.freeze([
    Object.freeze({kind:"attack",name:"Ultrapuño",type:"fighting",power:55,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Puño Fuego",type:"fire",power:75,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Puño Hielo",type:"ice",power:75,unlockStage:1,area:false}),
    Object.freeze({kind:"support",name:"Detección",type:"support",effect:"guard",unlockStage:0})
  ]),
  j_hitmontop:Object.freeze([
    Object.freeze({kind:"attack",name:"Ataque Rápido",type:"normal",power:40,unlockStage:0,area:false}),
    Object.freeze({kind:"attack",name:"Patada Baja",type:"fighting",power:65,unlockStage:1,area:false}),
    Object.freeze({kind:"attack",name:"Giro Bola",type:"steel",power:90,unlockStage:1,area:true}),
    Object.freeze({kind:"support",name:"Detección",type:"support",effect:"guard",unlockStage:0})
  ])
});
function johtoInstallStandaloneBranchMovesets(){
  const d=DATA();if(!d?.movesets)return;
  // Todas las evoluciones finales ramificadas de Johto tienen set propio.
  // No se permite volver a heredar silenciosamente el moveset de la familia raíz.
  for(const target of Object.values(JOHTO_BRANCH_STANDALONE).flatMap(map=>Object.values(map))){
    const set=JOHTO_BRANCH_FINAL_MOVESETS[target];
    if(set)d.movesets[target]=set.map(m=>({...m}));
  }
}
function johtoStandaloneTargetId(rootId,toDex){return JOHTO_BRANCH_STANDALONE[rootId]?.[Number(toDex)]||null;}
function johtoCanonicalFamilyId(id){return JOHTO_BRANCH_TARGET_TO_ROOT[id]||id;}

function species(d){
  const x=DATA().species?.find(s=>Number(s.dex)===Number(d));
  if(x)return x;
  return {dex:Number(d),name:EXTRA.crossNames[String(d)]||EXTRA.crossNames[d]||("#"+d),types:EXTRA.crossTypes[String(d)]||EXTRA.crossTypes[d]||["normal"],baseStats:EXTRA.crossStats[String(d)]||EXTRA.crossStats[d]||[60,60,60,60,60,60]};
}
function name(d){return species(d).name;}
function gif(d,back=false,shiny=false){const animate=window.PokeSendaPokemonGifAllowed?.()??(!window.matchMedia('(max-width: 980px)').matches&&!document.documentElement.classList.contains("no-anim"));return animate?ANIM+(back?(shiny?"back/shiny/":"back/"):(shiny?"shiny/":""))+d+".gif":`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${back?(shiny?"back/shiny/":"back/"):(shiny?"shiny/":"")}${d}.png`; }
function xpNeed(l){if(l>=MAX_LEVEL)return 0;return Math.round(42*Math.pow(l,1.27));}
function idlePower(base){return Math.max(.66,Math.min(1.28,.62+(Number(base)||40)*.0052));}
function defenseFactor(v){return Math.max(.52,Math.min(1.22,1/(1+(Number(v||60)-60)*.004)));}
function typeMult(t,types){let m=1;for(const d of types||[])m*=TYPE[t]?.[d]??1;return m;}
function starterForRoute(c,id){if(id==="johto_route1")return c;if(id==="johto_route2")return WEAK[c];if(id==="johto_route3")return STRONG[c];return null;}
const JOHTO_ROUTE_ORDER=["johto_route1","johto_route2","johto_route3"];
function currentRouteId(){return JOHTO_ROUTE_ORDER.includes(js?.currentRoute)?js.currentRoute:"johto_route1";}
function currentRouteDef(){return DATA().routes?.[currentRouteId()]||DATA().routes.johto_route1;}
function currentRouteState(){return js.routes[currentRouteId()];}
function currentDropProfile(){return DATA().drops?.[currentRouteDef().dropProfile]||DATA().drops.route1;}
function routeClass(id=currentRouteId()){return id==="johto_route2"?"route2":id==="johto_route3"?"route3":"route1";}
function routeUnlocked(id){return Array.isArray(js?.unlockedRoutes)&&js.unlockedRoutes.includes(id);}

function currentItem(p){return p?.heldItem?EXTRA.itemDefs[p.heldItem]||null:null;}
function canEquip(itemId,p){
  const it=EXTRA.itemDefs[itemId];if(!it||it.consumable||it.evolutionStone||it.tradeOnly)return false;
  const hasCombat=!!(it.hp||it.atk||it.physicalAtk||it.speed||it.crit||it.survive||it.roundHeal||it.xp||it.slowProc||it.boostType||it.dodge||it.statusResist||it.money);
  if(it.evolutionCatalyst&&!hasCombat)return false;
  if(it.restrictDex&&!it.restrictDex.includes(Number(p.dex)))return false;
  return true;
}
const J_LEGENDARY_CAPTURE_MONEY=25000;
function grantJohtoLegendaryCaptureBonus(){
  js.money=Math.max(0,Number(js.money||0))+J_LEGENDARY_CAPTURE_MONEY;
  js.achievements=js.achievements&&typeof js.achievements==="object"?js.achievements:{};
  js.achievements.premiumTickets=Math.max(0,Math.floor(Number(js.achievements.premiumTickets||0)))+1;
  return {money:J_LEGENDARY_CAPTURE_MONEY,tickets:1};
}
function johtoEvolutionReachable(fid,fromDex,toDex){
  fromDex=Number(fromDex);toDex=Number(toDex);if(fromDex===toDex)return false;const f=fam(fid);if(!f)return false;const seen=new Set([fromDex]),q=[fromDex];
  while(q.length){const cur=q.shift();for(const e of f.evolutions||[]){if(Number(e.from)!==cur)continue;const next=Number(e.to);if(next===toDex)return true;if(!seen.has(next)){seen.add(next);q.push(next);}}}return false;
}
function johtoAdoptCapturedHigherForm(fid,capturedDex,capturedLevel){
  const p=js.pokemon?.[fid],f=fam(fid);capturedDex=Number(capturedDex);if(!p||!f||!johtoEvolutionReachable(fid,p.dex,capturedDex))return null;
  const fromDex=Number(p.dex),oldLevel=Math.max(1,Number(p.level||1)),newLevel=Math.max(oldLevel,Math.min(MAX_LEVEL,Math.max(1,Number(capturedLevel)||oldLevel))),gained=Math.max(0,newLevel-oldLevel);
  p.level=newLevel;p.skillPoints=Math.max(0,Number(p.skillPoints||0))+gained;p.dex=capturedDex;p.shinyEquipped=!!p.shinyEquipped&&johtoHasShinyDex(capturedDex);p.evolutionPromptLevel=0;p.friendship=Math.max(0,Math.min(255,Number(p.friendship??70)));
  const stage=Math.max(0,(f.members||[]).indexOf(capturedDex)),moves=DATA().movesets?.[fid]||[];p.moveRanks=Array.isArray(p.moveRanks)?p.moveRanks.slice(0,4):[];while(p.moveRanks.length<4)p.moveRanks.push(0);
  moves.forEach((m,i)=>{if((m.kind==="support"||Number(m.unlockStage||0)<=stage)&&Number(p.moveRanks[i]||0)<=0)p.moveRanks[i]=1;});markJohtoDexNew(capturedDex);if(run?.team?.[fid])refreshCombatant(fid);return {fromDex,toDex:capturedDex,gained};
}
function johtoShinyDexSet(){
  js.shinyDex=Array.isArray(js.shinyDex)?[...new Set(js.shinyDex.map(Number).filter(d=>d>=1&&d<=251))]:[];return new Set(js.shinyDex);
}
function johtoHasShinyDex(dex){return johtoShinyDexSet().has(Number(dex));}
function registerJohtoShinyDex(dex){
  dex=Number(dex);if(!Number.isFinite(dex)||dex<1||dex>251)return false;const set=johtoShinyDexSet(),fresh=!set.has(dex);if(fresh){js.shinyDex.push(dex);js.shinyDex.sort((a,b)=>a-b);}markJohtoDexNew(dex);return fresh;
}
function johtoNewPokemonProgress(fid,level=1,starter=false,shiny=false,dexOverride=null){
  const f=fam(fid);if(!f)return null;const dex=Number(dexOverride||f.members?.[0]);if(!dex)return null;
  const lv=Math.max(1,Math.min(MAX_LEVEL,Number(level)||1));
  const p={familyId:fid,dex,level:lv,xp:0,nature:randomNature(),copies:1,candies:0,friendship:70,shinyUnlocked:!!shiny,shinyEquipped:!!shiny,starter:!!starter,heldItem:null,stars:familyRarity(fid,dex)==="legendary"?5:1,skillPoints:Math.max(0,lv-1),moveRanks:[0,0,0,0],tmLoadout:[null,null,null,null],maxLevelRelearnUsed:false};
  const stage=Math.max(0,(f.members||[]).indexOf(dex)),moves=DATA().movesets?.[fid]||[];
  moves.forEach((m,i)=>{if(i<4&&(m.kind==="support"||Number(m.unlockStage||0)<=stage))p.moveRanks[i]=1;});
  return p;
}
function johtoBranchFamily(fid){return !!JOHTO_BRANCH_STANDALONE[fid];}
function johtoBranchTerminalDexes(fid){return Object.keys(JOHTO_BRANCH_STANDALONE[fid]||{}).map(Number);}
function johtoBranchRootFor(id){return JOHTO_BRANCH_STANDALONE[id]?id:(JOHTO_BRANCH_TARGET_TO_ROOT[id]||null);}
function johtoBranchTargetIds(rootId){return Object.values(JOHTO_BRANCH_STANDALONE[rootId]||{});}
function johtoBranchComplete(rootId,state=js){const ids=johtoBranchTargetIds(rootId);return !!ids.length&&ids.every(id=>!!state?.pokemon?.[id]);}
function johtoBranchStarRefund(p){let n=0;for(let star=1;star<Math.max(1,Math.min(5,Number(p?.stars||1)));star++)n+=Number(STAR_COSTS[star]||0);return n;}
function johtoSyncBranchCandyMirrors(rootId){const total=Math.max(0,Math.floor(Number(js?.branchCandies?.[rootId]||0)));for(const id of [rootId,...johtoBranchTargetIds(rootId)])if(js?.pokemon?.[id])js.pokemon[id].candies=total;return total;}
function johtoEnsureBranchCandyState(){
  js.branchCandies=js.branchCandies&&typeof js.branchCandies==="object"?js.branchCandies:{};
  if(Number(js.branchCandyModelVersion||0)<1){
    for(const root of Object.keys(JOHTO_BRANCH_STANDALONE)){
      let total=Math.max(0,Math.floor(Number(js.branchCandies[root]||0)));
      for(const id of [root,...johtoBranchTargetIds(root)]){const p=js.pokemon?.[id];if(p)total+=Math.max(0,Math.floor(Number(p.candies||0)));}
      js.branchCandies[root]=total;
    }
    js.branchCandyModelVersion=1;
  }
  for(const root of Object.keys(JOHTO_BRANCH_STANDALONE)){js.branchCandies[root]=Math.max(0,Math.floor(Number(js.branchCandies[root]||0)));johtoSyncBranchCandyMirrors(root);}
  return js.branchCandies;
}
function johtoCandyBalance(id){const root=johtoBranchRootFor(id);if(root){johtoEnsureBranchCandyState();return Math.max(0,Number(js.branchCandies[root]||0));}return Math.max(0,Number(js.pokemon?.[id]?.candies||0));}
function johtoAddCandies(id,amount){amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return johtoCandyBalance(id);const root=johtoBranchRootFor(id);if(root){johtoEnsureBranchCandyState();js.branchCandies[root]=Math.max(0,Number(js.branchCandies[root]||0))+amount;return johtoSyncBranchCandyMirrors(root);}const p=js.pokemon?.[id];if(p)p.candies=Math.max(0,Number(p.candies||0))+amount;return Math.max(0,Number(p?.candies||0));}
function johtoSpendCandies(id,amount){amount=Math.max(0,Math.floor(Number(amount)||0));const root=johtoBranchRootFor(id);if(root){johtoEnsureBranchCandyState();if(Number(js.branchCandies[root]||0)<amount)return false;js.branchCandies[root]-=amount;johtoSyncBranchCandyMirrors(root);return true;}const p=js.pokemon?.[id];if(!p||Number(p.candies||0)<amount)return false;p.candies-=amount;return true;}
function johtoBranchCandyRecipient(rootId){const ids=johtoBranchTargetIds(rootId).filter(id=>js?.pokemon?.[id]);if(!ids.length)return null;return ids.slice().sort((a,b)=>Number(js.pokemon[a]?.stars||1)-Number(js.pokemon[b]?.stars||1)||Number(js.pokemon[a]?.level||1)-Number(js.pokemon[b]?.level||1)||String(a).localeCompare(String(b)))[0];}
function johtoRetireCompletedBranchRoot(rootId){
  if(!johtoBranchComplete(rootId))return {retired:false};
  johtoEnsureBranchCandyState();let changed=false,returnedItems=[],refund=0;
  const p=js.pokemon?.[rootId]||null;
  if(p){
    refund+=johtoBranchStarRefund(p);
    if(p.heldItem&&materialItemDef(p.heldItem)){js.inventory=js.inventory&&typeof js.inventory==="object"?js.inventory:{};js.inventory[p.heldItem]=Math.max(0,Number(js.inventory[p.heldItem]||0))+1;returnedItems.push(p.heldItem);}
    const replacement=johtoBranchCandyRecipient(rootId),used=new Set((js.formation||[]).filter(x=>x&&x!==rootId));
    if(Array.isArray(js.formation))js.formation=js.formation.map(x=>x===rootId?(replacement&&!used.has(replacement)?replacement:null):x);
    if(run){
      const remapList=a=>Array.isArray(a)?a.map(x=>x===rootId?replacement:x).filter((x,i,arr)=>x&&arr.indexOf(x)===i):a;
      run.partyIds=remapList(run.partyIds);run.lockedPartyIds=remapList(run.lockedPartyIds);run.roundCombatants=remapList(run.roundCombatants);
      if(run.team?.[rootId]){if(replacement&&!run.team[replacement])run.team[replacement]=run.team[rootId];delete run.team[rootId];}
      if(run.teamArchive?.[rootId]){if(replacement&&!run.teamArchive[replacement])run.teamArchive[replacement]=run.teamArchive[rootId];delete run.teamArchive[rootId];}
      if(run.damageDone&&Object.prototype.hasOwnProperty.call(run.damageDone,rootId)){if(replacement)run.damageDone[replacement]=(run.damageDone[replacement]||0)+(run.damageDone[rootId]||0);delete run.damageDone[rootId];}
      if(run.stats?.[rootId]){if(replacement&&!run.stats[replacement])run.stats[replacement]=run.stats[rootId];delete run.stats[rootId];}
    }
    delete js.pokemon[rootId];pendingEvolutionPrompts?.delete?.(rootId);changed=true;
  }
  const q=Array.isArray(js.branchLegacyQueue?.[rootId])?js.branchLegacyQueue[rootId]:[];
  if(q.length){const baseCandy=Number(RARITY_CANDY[captureFamilyRarity(rootId)]||10);for(const raw of q){const clean=johtoSanitizeLegacyBase(rootId,raw);if(!clean)continue;refund+=Math.max(0,Number(clean.candies||0))+johtoBranchStarRefund(clean)+baseCandy;if(clean.heldItem&&materialItemDef(clean.heldItem)){js.inventory=js.inventory&&typeof js.inventory==="object"?js.inventory:{};js.inventory[clean.heldItem]=Math.max(0,Number(js.inventory[clean.heldItem]||0))+1;returnedItems.push(clean.heldItem);}}delete js.branchLegacyQueue[rootId];changed=true;}
  if(refund>0){js.branchCandies[rootId]=Math.max(0,Number(js.branchCandies[rootId]||0))+refund;changed=true;}
  johtoSyncBranchCandyMirrors(rootId);return {retired:changed,refund,returnedItems};
}
function johtoMigrateBranchFinalModelV3(){johtoEnsureBranchCandyState();let changed=false;for(const root of Object.keys(JOHTO_BRANCH_STANDALONE)){if(johtoBranchComplete(root)){const r=johtoRetireCompletedBranchRoot(root);if(r.retired)changed=true;}else if(!js.pokemon?.[root]&&Array.isArray(js.branchLegacyQueue?.[root])&&js.branchLegacyQueue[root].length){if(johtoPromoteLegacyBranchBase(root))changed=true;}johtoSyncBranchCandyMirrors(root);}js.branchFinalModelVersion=3;return changed;}
function johtoCanonicalOwnedGroups(state=js){const groups=new Map();for(const [id,p] of Object.entries(state?.pokemon||{})){const root=johtoCanonicalFamilyId(id);if(!groups.has(root))groups.set(root,[]);groups.get(root).push([id,p]);}return groups;}
function johtoCanonicalFamilyCount(state=js){return johtoCanonicalOwnedGroups(state).size;}
function johtoCanonicalLevelCount(level=60,state=js){let n=0;for(const list of johtoCanonicalOwnedGroups(state).values())if(list.some(([,p])=>Number(p?.level||0)>=Number(level)))n++;return n;}
function johtoCanonicalStarsCount(stars=5,state=js){let n=0;for(const list of johtoCanonicalOwnedGroups(state).values())if(list.some(([,p])=>Number(p?.stars||1)>=Number(stars)))n++;return n;}
function johtoCanonicalRarityCount(rarity,state=js){let n=0;for(const list of johtoCanonicalOwnedGroups(state).values())if(list.some(([id,p])=>familyRarity(id,p?.dex)===rarity))n++;return n;}
function johtoCloneStandaloneProgress(source,targetId,toDex){const p=JSON.parse(JSON.stringify(source||{}));p.familyId=targetId;p.dex=Number(toDex);p.level=Math.max(1,Math.min(MAX_LEVEL,Number(p.level)||1));p.xp=p.level>=MAX_LEVEL?0:Math.max(0,Number(p.xp)||0);p.copies=Math.max(1,Math.floor(Number(p.copies)||1));p.candies=Math.max(0,Math.floor(Number(p.candies)||0));p.friendship=Math.max(0,Math.min(255,Math.floor(Number(p.friendship??70))));p.stars=Math.max(1,Math.min(5,Math.floor(Number(p.stars||1))));p.skillPoints=Math.max(0,Math.floor(Number(p.skillPoints)||0));p.moveRanks=Array.isArray(p.moveRanks)?p.moveRanks.slice(0,4):[1,0,0,1];while(p.moveRanks.length<4)p.moveRanks.push(0);p.tmLoadout=Array.isArray(p.tmLoadout)?p.tmLoadout.slice(0,4):[null,null,null,null];while(p.tmLoadout.length<4)p.tmLoadout.push(null);p.evolutionPromptLevel=0;p.starter=false;p.shinyUnlocked=johtoHasShinyDex(p.dex);p.shinyEquipped=!!p.shinyEquipped&&p.shinyUnlocked;p.maxLevelRelearnUsed=!!p.maxLevelRelearnUsed;return p;}
function johtoMergeStandaloneProgress(target,incoming){if(!target||!incoming)return target;target.level=Math.max(Number(target.level||1),Number(incoming.level||1));target.xp=Math.max(Number(target.xp||0),Number(incoming.xp||0));target.copies=Math.max(1,Number(target.copies||1))+Math.max(1,Number(incoming.copies||1));target.candies=Math.max(0,Number(target.candies||0))+Math.max(0,Number(incoming.candies||0));target.skillPoints=Math.max(Number(target.skillPoints||0),Number(incoming.skillPoints||0));target.stars=Math.max(Number(target.stars||1),Number(incoming.stars||1));target.friendship=Math.max(Number(target.friendship||70),Number(incoming.friendship||70));target.shinyUnlocked=!!target.shinyUnlocked||!!incoming.shinyUnlocked||johtoHasShinyDex(target.dex);if(!target.heldItem&&incoming.heldItem)target.heldItem=incoming.heldItem;return target;}
function johtoRemapOwnedId(oldId,newId){if(oldId===newId)return;if(Array.isArray(js?.formation))js.formation=js.formation.map(x=>x===oldId?newId:x);if(!run)return;const remap=a=>Array.isArray(a)?a.map(x=>x===oldId?newId:x):a;run.partyIds=remap(run.partyIds);run.lockedPartyIds=remap(run.lockedPartyIds);run.roundCombatants=remap(run.roundCombatants);if(run.team?.[oldId]){run.team[newId]=run.team[oldId];delete run.team[oldId];}if(run.teamArchive?.[oldId]){run.teamArchive[newId]=run.teamArchive[oldId];delete run.teamArchive[oldId];}if(run.damageDone&&Object.prototype.hasOwnProperty.call(run.damageDone,oldId)){run.damageDone[newId]=(run.damageDone[newId]||0)+(run.damageDone[oldId]||0);delete run.damageDone[oldId];}if(run.stats?.[oldId]){run.stats[newId]=run.stats[oldId];delete run.stats[oldId];}if(run.itemStats){const rebuilt={};for(const [key,val] of Object.entries(run.itemStats)){if(val?.pokemonId===oldId){const nv={...val,pokemonId:newId};rebuilt[newId+"::"+nv.itemId]=nv;}else rebuilt[key]=val;}run.itemStats=rebuilt;}}
function johtoLegacyQueue(rootId){js.branchLegacyQueue=js.branchLegacyQueue&&typeof js.branchLegacyQueue==="object"?js.branchLegacyQueue:{};const q=Array.isArray(js.branchLegacyQueue[rootId])?js.branchLegacyQueue[rootId]:[];js.branchLegacyQueue[rootId]=q;return q;}
function johtoSanitizeLegacyBase(rootId,raw){const f=fam(rootId),dex=Number(raw?.dex);if(!raw||!f||(f.members||[]).map(Number).includes(dex)===false||johtoStandaloneTargetId(rootId,dex))return null;const p=JSON.parse(JSON.stringify(raw));p.familyId=rootId;p.dex=dex;p.level=Math.max(1,Math.min(MAX_LEVEL,Number(p.level)||1));p.xp=p.level>=MAX_LEVEL?0:Math.max(0,Number(p.xp)||0);p.copies=Math.max(1,Math.floor(Number(p.copies)||1));p.candies=Math.max(0,Math.floor(Number(p.candies)||0));p.friendship=Math.max(0,Math.min(255,Number(p.friendship??70)));p.stars=Math.max(1,Math.min(5,Number(p.stars||1)));p.skillPoints=Math.max(0,Math.floor(Number(p.skillPoints)||0));p.moveRanks=Array.isArray(p.moveRanks)?p.moveRanks.slice(0,4):[1,0,0,1];while(p.moveRanks.length<4)p.moveRanks.push(0);p.tmLoadout=Array.isArray(p.tmLoadout)?p.tmLoadout.slice(0,4):[null,null,null,null];while(p.tmLoadout.length<4)p.tmLoadout.push(null);p.evolutionPromptLevel=0;p.shinyUnlocked=(f.members||[]).some(d=>johtoHasShinyDex(d));p.shinyEquipped=!!p.shinyEquipped&&johtoHasShinyDex(dex);return p;}
function johtoPromoteLegacyBranchBase(rootId){if(johtoBranchComplete(rootId)){johtoRetireCompletedBranchRoot(rootId);return null;}if(js.pokemon?.[rootId])return null;const q=johtoLegacyQueue(rootId);while(q.length){const p=johtoSanitizeLegacyBase(rootId,q.shift());if(!p)continue;js.pokemon[rootId]=p;if(Number(js.branchCandyModelVersion||0)>=1){if(Number(p.candies||0)>0)js.branchCandies[rootId]=Math.max(0,Number(js.branchCandies[rootId]||0))+Math.max(0,Number(p.candies||0));johtoSyncBranchCandyMirrors(rootId);}if(!q.length)delete js.branchLegacyQueue[rootId];return p;}if(!q.length)delete js.branchLegacyQueue[rootId];return null;}
function johtoMigrateBranchOwnershipV2(){johtoInstallStandaloneBranchMovesets();js.pokemon=js.pokemon&&typeof js.pokemon==="object"?js.pokemon:{};js.branchLegacyQueue=js.branchLegacyQueue&&typeof js.branchLegacyQueue==="object"?js.branchLegacyQueue:{};if(Number(js.branchOwnershipModelVersion||0)>=2){for(const root of Object.keys(JOHTO_BRANCH_STANDALONE)){const q=johtoLegacyQueue(root),clean=q.map(x=>johtoSanitizeLegacyBase(root,x)).filter(Boolean);if(clean.length)js.branchLegacyQueue[root]=clean;else delete js.branchLegacyQueue[root];johtoPromoteLegacyBranchBase(root);}delete js.branchReserves;delete js.branchReserveModelVersion;return false;}let changed=false;const legacyReserves=js.branchReserves&&typeof js.branchReserves==="object"?js.branchReserves:{};
  for(const root of Object.keys(JOHTO_BRANCH_STANDALONE)){
    const active=js.pokemon[root];if(active){const targetId=johtoStandaloneTargetId(root,active.dex);if(targetId){const converted=johtoCloneStandaloneProgress(active,targetId,active.dex);if(js.pokemon[targetId])johtoMergeStandaloneProgress(js.pokemon[targetId],converted);else js.pokemon[targetId]=converted;johtoRemapOwnedId(root,targetId);delete js.pokemon[root];changed=true;}}
    const queue=johtoLegacyQueue(root);for(const raw of (Array.isArray(legacyReserves[root])?legacyReserves[root]:[])){const targetId=johtoStandaloneTargetId(root,raw?.dex);if(targetId){const converted=johtoCloneStandaloneProgress(raw,targetId,raw.dex);if(js.pokemon[targetId])johtoMergeStandaloneProgress(js.pokemon[targetId],converted);else js.pokemon[targetId]=converted;changed=true;}else{const clean=johtoSanitizeLegacyBase(root,raw);if(clean){queue.push(clean);changed=true;}}}
    const missingTargets=Object.values(JOHTO_BRANCH_STANDALONE[root]).filter(id=>!js.pokemon[id]).length;let capacity=(js.pokemon[root]?1:0)+queue.length;if(capacity<missingTargets){const logs=(js.captureLog||[]).filter(x=>String(x?.id||"")===root&&/Duplicado|Copia reservada/i.test(String(x?.outcome||"")));for(const row of logs){if(capacity>=missingTargets)break;const dex=Number(row.dex||fam(root)?.members?.[0]||0),clean=johtoSanitizeLegacyBase(root,johtoNewPokemonProgress(root,Number(row.level)||js.pokemon[root]?.level||1,false,!!row.shiny,dex));if(!clean)continue;queue.push(clean);capacity++;changed=true;}let spare=Math.max(0,Math.floor(Number(js.pokemon[root]?.copies||1))-1-queue.length);const baseDex=Number(fam(root)?.members?.[0]||0);while(capacity<missingTargets&&spare>0&&baseDex){const clean=johtoSanitizeLegacyBase(root,johtoNewPokemonProgress(root,js.pokemon[root]?.level||1,false,false,baseDex));if(!clean)break;queue.push(clean);capacity++;spare--;changed=true;}}
    if(!js.pokemon[root]&&!johtoBranchComplete(root)&&johtoPromoteLegacyBranchBase(root))changed=true;
  }
  delete js.branchReserves;delete js.branchReserveModelVersion;js.branchOwnershipModelVersion=2;return changed;
}
function johtoHandleExistingCapture(fid,capturedDex,capturedLevel,rarity,shiny=false){const p=js.pokemon?.[fid];if(!p)return {p:null,promoted:null,reserved:null,candies:0};p.copies=(p.copies||1)+1;const promoted=johtoAdoptCapturedHigherForm(fid,capturedDex,capturedLevel);let candies=0;if(!promoted){candies=candyReward(rarity);johtoAddCandies(fid,candies);}if(shiny){registerJohtoShinyDex(capturedDex);p.shinyUnlocked=true;if(Number(p.dex)===Number(capturedDex))p.shinyEquipped=true;}return {p,promoted,reserved:null,candies};}
function johtoRegisterCapturedPokemon(fid,capturedDex,capturedLevel,rarity,shiny=false){
  const directTarget=johtoStandaloneTargetId(fid,capturedDex),isBranchRoot=johtoBranchFamily(fid);
  if(isBranchRoot&&johtoBranchComplete(fid)&&!directTarget){
    johtoRetireCompletedBranchRoot(fid);const candies=candyReward(rarity);johtoAddCandies(fid,candies);if(shiny)registerJohtoShinyDex(capturedDex);markJohtoDexNew(Number(capturedDex));const recipient=johtoBranchCandyRecipient(fid),p=recipient?js.pokemon?.[recipient]:null;return {id:recipient||fid,p,fresh:false,candies,promoted:null,reserved:null,branchShared:true,branchComplete:true};
  }
  const storageId=directTarget||fid;let p=js.pokemon?.[storageId],fresh=false,candies=0,promoted=null;
  if(!p){fresh=true;p=createPokemon(storageId,capturedLevel,false,!!shiny,capturedDex);const empty=js.formation.findIndex(x=>!x);if(empty>=0)js.formation[empty]=storageId;}
  else if(storageId!==fid){p.copies=(p.copies||1)+1;candies=candyReward(rarity);johtoAddCandies(storageId,candies);if(shiny){registerJohtoShinyDex(capturedDex);p.shinyUnlocked=true;p.shinyEquipped=true;}}
  else{const handled=johtoHandleExistingCapture(fid,capturedDex,capturedLevel,rarity,!!shiny);p=handled.p;promoted=handled.promoted;candies=handled.candies;}
  markJohtoDexNew(Number(capturedDex));if(isBranchRoot&&johtoBranchComplete(fid)){johtoRetireCompletedBranchRoot(fid);const actualId=directTarget||johtoBranchCandyRecipient(fid)||storageId;p=js.pokemon?.[actualId]||p;return {id:actualId,p,fresh,candies,promoted,reserved:null,branchShared:true,branchComplete:true};}
  if(johtoBranchRootFor(storageId))johtoSyncBranchCandyMirrors(johtoBranchRootFor(storageId));return {id:storageId,p,fresh,candies,promoted,reserved:null,branchShared:!!johtoBranchRootFor(storageId),branchComplete:false};
}
function createPokemon(fid,level=1,starter=false,shiny=false,dexOverride=null){
  const p=johtoNewPokemonProgress(fid,level,starter,shiny,dexOverride);if(!p)return null;js.pokemon[fid]=p;markJohtoDexNew(p.dex);if(shiny)registerJohtoShinyDex(p.dex);return p;
}
function markJohtoDexNew(dex){
  dex=Number(dex);if(!Number.isFinite(dex)||dex<1||dex>251)return false;
  js.dex=Array.isArray(js.dex)?js.dex:[];js.dexUnread=Array.isArray(js.dexUnread)?js.dexUnread:[];
  const fresh=!js.dex.includes(dex);if(fresh){js.dex.push(dex);if(!js.dexUnread.includes(dex))js.dexUnread.push(dex);}
  js.dex=[...new Set(js.dex.map(Number).filter(d=>d>=1&&d<=251))].sort((a,b)=>a-b);js.dexUnread=[...new Set(js.dexUnread.map(Number).filter(d=>js.dex.includes(d)))];return fresh;
}
function clearJohtoDexUnread(dex){dex=Number(dex);js.dexUnread=Array.isArray(js.dexUnread)?js.dexUnread:[];const before=js.dexUnread.length;js.dexUnread=js.dexUnread.filter(d=>Number(d)!==dex);if(js.dexUnread.length!==before)save();return true;}
function recordJohtoCapture({fid,dex,level,rarity='common',outcome='Capturado',source='Poké Ball',shiny=false}={}){
  dex=Number(dex);if(!Number.isFinite(dex))return;js.captureLog=Array.isArray(js.captureLog)?js.captureLog:[];js.captureLog.unshift({ts:Date.now(),id:String(fid||''),dex,name:name(dex),level:Math.max(1,Number(level)||1),rarity:String(rarity||'common'),outcome:String(outcome||'Capturado'),source:String(source||'Poké Ball'),shiny:!!shiny});js.captureLog=js.captureLog.slice(0,150);
}
function premiumCaptureSourceLabel(source){return source==='paid'?'Gachapon Premium comprado':source==='achievement'?'Ticket Premium de Logros':source==='shinyAchievement'?'Ticket Shiny de Logros':source==='devGift'?'Gachapon Premium regalado':'Gachapon Premium 8h';}
function migrate(){
  js=load();johtoInstallStandaloneBranchMovesets();const hadJohtoItemSeen=Array.isArray(js.itemSeen);js.version=Math.max(3,Number(js.version)||0);
  js.pokemon=js.pokemon&&typeof js.pokemon==="object"?js.pokemon:{};
  js.dex=Array.isArray(js.dex)?js.dex:[];
  js.inventory=js.inventory&&typeof js.inventory==="object"?js.inventory:{};
  js.routes=js.routes&&typeof js.routes==="object"?js.routes:{};
  for(const rid of JOHTO_ROUTE_ORDER){js.routes[rid]=Object.assign({checkpoint:0,farmCheckpoint:null,bestDistance:0,completions:0,bosses:0,deaths:0,centersSeen:[]},js.routes[rid]||{});if(![null,0,2500,5000,7500].includes(js.routes[rid].farmCheckpoint))js.routes[rid].farmCheckpoint=null;}
  js.unlockedRoutes=["johto_route1"];if(Number(js.routes.johto_route1.completions||0)>0)js.unlockedRoutes.push("johto_route2");if(Number(js.routes.johto_route2.completions||0)>0)js.unlockedRoutes.push("johto_route3");
  js.currentRoute=JOHTO_ROUTE_ORDER.includes(js.currentRoute)&&js.unlockedRoutes.includes(js.currentRoute)?js.currentRoute:"johto_route1";
  js.stats=Object.assign({defeated:0,runs:0},js.stats||{});
  js.skillTree=js.skillTree&&typeof js.skillTree==="object"?js.skillTree:{};
  js.tms=js.tms&&typeof js.tms==="object"?js.tms:{};
  js.mtGacha=Object.assign({tickets:0,pulls:0,duplicateStreak:0,history:[]},js.mtGacha||{});
  js.expeditionHistory=Array.isArray(js.expeditionHistory)?js.expeditionHistory.slice(0,10):[];
  js.achievements=js.achievements&&typeof js.achievements==="object"?js.achievements:{unlocked:{},unread:[],claimedRewards:[],claimedMilestones:[],premiumTickets:0,shinyTickets:0,tmChoices:{}};
  js.achievements.unlocked=js.achievements.unlocked&&typeof js.achievements.unlocked==="object"?js.achievements.unlocked:{};
  js.achievements.unread=Array.isArray(js.achievements.unread)?js.achievements.unread:[];
  js.achievements.claimedRewards=Array.isArray(js.achievements.claimedRewards)?js.achievements.claimedRewards:[];
  js.achievements.claimedMilestones=Array.isArray(js.achievements.claimedMilestones)?js.achievements.claimedMilestones:[];
  js.achievements.tmChoices=js.achievements.tmChoices&&typeof js.achievements.tmChoices==="object"?js.achievements.tmChoices:{};
  js.achievements.premiumTickets=Math.max(0,Math.floor(Number(js.achievements.premiumTickets||0)));
  js.achievements.shinyTickets=Math.max(0,Math.floor(Number(js.achievements.shinyTickets||0)));
  js.routeEventStats=Object.assign({seen:0,completed:0,ignored:0,battlesWon:0,camps:0,backpacks:0},js.routeEventStats||{});
  js.gyms=js.gyms&&typeof js.gyms==="object"?js.gyms:{};
  js.gyms.badges=Array.isArray(js.gyms.badges)?js.gyms.badges:[];
  js.gyms.wins=js.gyms.wins&&typeof js.gyms.wins==="object"?js.gyms.wins:{};
  js.gyms.attempts=js.gyms.attempts&&typeof js.gyms.attempts==="object"?js.gyms.attempts:{};
  js.gyms.bestTimes=js.gyms.bestTimes&&typeof js.gyms.bestTimes==="object"?js.gyms.bestTimes:{};
  js.gyms.firstWinAt=js.gyms.firstWinAt&&typeof js.gyms.firstWinAt==="object"?js.gyms.firstWinAt:{};
  js.gyms.lastTeam=js.gyms.lastTeam&&typeof js.gyms.lastTeam==="object"?js.gyms.lastTeam:{};
  js.gyms.leagueUnlocked=!!js.gyms.leagueUnlocked;
  js.timedGacha=Object.assign({cycleStartMs:0,giftReady:false,unlockedAt:0,pending:null,purchasedPending:null,achievementPending:null,shinyPending:null,claimed:0,purchasedClaimed:0,purchasedSpent:0,clockOffsetMs:0,lastTrustedMs:0},js.timedGacha||{});
  for(const k of ["cycleStartMs","unlockedAt","claimed","purchasedClaimed","purchasedSpent","clockOffsetMs","lastTrustedMs"])js.timedGacha[k]=Number(js.timedGacha[k]||0);
  js.timedGacha.giftReady=!!js.timedGacha.giftReady;
  js.premiumStats=Object.assign({free:0,paid:0,tickets:0,shinyTickets:0,total:0},js.premiumStats||{});
  js.achievements.dex131ShinyReward=!!js.achievements.dex131ShinyReward;
  js.mints=js.mints&&typeof js.mints==="object"?js.mints:{};
  js.masterMints=Math.max(0,Math.floor(Number(js.masterMints||0)));
  js.vendorStats=Object.assign({incenseSeen:0,incenseBought:0,mintSeen:0,mintsBought:0},js.vendorStats||{});
  js.itemUnread=Array.isArray(js.itemUnread)?js.itemUnread.filter(id=>materialItemDef(id)):[];
  const legacyJohtoItems=[...Object.keys(js.inventory||{}),...Object.values(js.pokemon||{}).map(p=>p?.heldItem).filter(Boolean),...js.itemUnread].filter(id=>materialItemDef(id));
  js.itemSeen=hadJohtoItemSeen?[...new Set((js.itemSeen||[]).filter(id=>materialItemDef(id)))]:[...new Set(legacyJohtoItems)];
  js.dexUnread=Array.isArray(js.dexUnread)?[...new Set(js.dexUnread.map(Number).filter(d=>d>=1&&d<=251))]:[];
  js.shinyDex=Array.isArray(js.shinyDex)?[...new Set(js.shinyDex.map(Number).filter(d=>d>=1&&d<=251))]:[];
  js.captureLog=Array.isArray(js.captureLog)?js.captureLog.filter(x=>x&&Number(x.dex)>=1&&Number(x.dex)<=251).slice(0,150):[];
  js.totalChests=Math.max(0,Math.floor(Number(js.totalChests||0)));
  js.options=Object.assign({autoRepeat:false,autoPotion:false,autoOpen:false,battleSpeed:1,animations:true,combatFloats:true,confirmStop:true,routeEvents:true},js.options||{});
  js.options.battleSpeed=[1,2,4].includes(Number(js.options.battleSpeed))?Number(js.options.battleSpeed):1;
  if(Number(js.skillTree?.a2||0)<1)js.options.autoOpen=false;
  if(Number(js.skillTree?.a3||0)<1)js.options.autoRepeat=false;
  if(Number(js.skillTree?.a5||0)<1)js.options.autoPotion=false;
  if(STARTERS.includes(js.starter)&&!js.pokemon[js.starter])createPokemon(js.starter,1,true,false);
  johtoMigrateBranchOwnershipV2();
  johtoMigrateBranchFinalModelV3();
  for(const [fid,p] of Object.entries(js.pokemon)){
    if(!p||!fam(fid))continue;
    p.level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(p.level)||1)));
    p.xp=p.level>=MAX_LEVEL?0:Math.max(0,Number(p.xp)||0);
    const stage=Math.max(0,(fam(fid).members||[]).indexOf(Number(p.dex)));
    const moves=DATA().movesets?.[fid]||[];
    if(!Number.isFinite(Number(p.skillPoints)))p.skillPoints=Math.max(0,Number(p.level||1)-1);
    p.skillPoints=Math.max(0,Math.floor(Number(p.skillPoints)||0));
    p.moveRanks=Array.isArray(p.moveRanks)?p.moveRanks.slice(0,4):[];
    while(p.moveRanks.length<4)p.moveRanks.push(0);
    moves.forEach((m,i)=>{
      if((m.kind==="support"||Number(m.unlockStage||0)<=stage)&&Number(p.moveRanks[i]||0)<=0)p.moveRanks[i]=1;
      p.moveRanks[i]=Math.max(0,Math.min(25,Math.floor(Number(p.moveRanks[i]||0))));
    });
    p.stars=familyRarity(fid)==="legendary"?5:Math.max(1,Math.min(5,Math.floor(Number(p.stars||1))));
    p.candies=johtoBranchRootFor(fid)?johtoCandyBalance(fid):Math.max(0,Math.floor(Number(p.candies||0)));
    p.tmLoadout=Array.isArray(p.tmLoadout)?p.tmLoadout.slice(0,4):[null,null,null,null];while(p.tmLoadout.length<4)p.tmLoadout.push(null);
    p.friendship=Math.max(0,Math.min(255,Math.floor(Number(p.friendship??70))));
    const familyDexes=(fam(fid).members||[]).map(Number),familyHasRegisteredShiny=familyDexes.some(d=>js.shinyDex.includes(d));
    if(p.shinyUnlocked&&!familyHasRegisteredShiny&&familyDexes.includes(Number(p.dex)))js.shinyDex.push(Number(p.dex));
    p.shinyUnlocked=familyDexes.some(d=>js.shinyDex.includes(d));p.shinyEquipped=!!p.shinyEquipped&&js.shinyDex.includes(Number(p.dex));
    p.maxLevelRelearnUsed=!!p.maxLevelRelearnUsed;
  }
  // V36.66.8 · Johto conserva los 6 puestos tácticos reales igual que Kanto.
  // No compactar la Formación: Guardia/Asalto/Apoyo y sus bancas deben mantener sus huecos.
  const legacy=Array.isArray(js.formation)?js.formation:(Array.isArray(js.team)?js.team:[]),nextFormation=Array(6).fill(null),formationSeen=new Set();
  for(let i=0;i<6;i++){
    const id=legacy[i];
    if(id&&js.pokemon[id]&&!formationSeen.has(id)){nextFormation[i]=id;formationSeen.add(id);}
  }
  js.formation=nextFormation;
  if(js.starter&&!js.formation.some(Boolean))js.formation[0]=js.starter;
  js.shinyDex=[...new Set((js.shinyDex||[]).map(Number).filter(d=>d>=1&&d<=251))].sort((a,b)=>a-b);
  if(johtoMtGachaPoolCompleted()){const retired=Math.max(0,Math.floor(Number(js.mtGacha?.tickets||0)));if(retired>0){js.mtGacha.tickets=0;js.money=(js.money||0)+retired*5000;}}
  ensureJohtoCasinoState();
  save();
}
// V36.66.9 · Las consultas de UI no deben volver a migrar/escribir el save.
// migrate() queda reservado para carga/restauración y acciones que realmente mutan estado.
function ensureJohtoState(){if(!js)migrate();return js;}
function formationIds(){return js.formation.filter(Boolean);}
function battleAssignments(){
  if(!run)return js.formation.slice(0,3).map((id,role)=>id?{id,role}:null).filter(Boolean);
  const used=new Set(),out=[],benches=js.formation.slice(3,6);
  const available=id=>!!(id&&run.team[id]?.alive&&!used.has(id));
  for(let role=0;role<3;role++){
    let id=js.formation[role];
    if(!available(id)){
      const preferred=js.formation[role+3];
      if(available(preferred))id=preferred;else id=benches.find(available)||null;
    }
    if(available(id)){used.add(id);out.push({id,role});}
  }
  return out;
}
function battleIds(){return battleAssignments().map(x=>x.id);}
function roleFor(id){return battleAssignments().find(x=>x.id===id)?.role??-1;}
function typeSynergy(){
  const ids=battleIds();if(ids.length!==3)return false;
  let common=[...(species(js.pokemon[ids[0]].dex).types||[])];
  for(const id of ids.slice(1)){const types=species(js.pokemon[id].dex).types||[];common=common.filter(t=>types.includes(t));}
  return common.length>0;
}
function rawStatsForDex(dex){
  const a=[...(species(dex).baseStats||[60,60,60,60,60,60])],k=["hp","atk","def","spAtk","spDef","speed"],b=Object.fromEntries(k.map((x,i)=>[x,Number(a[i]||60)]));b.total=k.reduce((n,x)=>n+b[x],0);return b;
}
function baseStats(p){
  const b={...rawStatsForDex(p.dex)},n=EXTRA.natures[p.nature];
  if(n&&!n.neutral&&n.up!==n.down){b[n.up]*=1.1;b[n.down]*=.9;b.total=b.hp+b.atk+b.def+b.spAtk+b.spDef+b.speed;}return b;
}
function derived(p,id=null){
  const b=baseStats(p),lv=Math.max(1,p.level||1),item=currentItem(p),stars=Math.max(1,p.stars||1),master=skillRank("c9")?1.05:1;
  const star=(1+.10*(stars-1))*master,speed=(1+.025*(stars-1))*(1+.005*skillRank("c3"))*master;
  let maxHp=(55+b.hp*.85+(lv-1)*(2.8+b.hp*.055))*star*(1+.009*skillRank("c2"));
  let atk=(5+b.atk*.11+(lv-1)*(.55+b.atk*.0085))*star*(1+.009*skillRank("c1"));
  let spAtk=(5+b.spAtk*.11+(lv-1)*(.55+b.spAtk*.0085))*star*(1+.009*skillRank("c1"));
  let def=b.def*(1+(lv-1)*.018)*star,spDef=b.spDef*(1+(lv-1)*.018)*star;
  let cd=Math.max(.82,Math.min(1.82,1.85-b.speed*.0065))/speed;
  let crit=.05+.01*(stars-1)+.002*skillRank("c4"),reduction=Math.min(.35,.0035*skillRank("c5")+.0035*skillRank("e9"));
  let roundHeal=ROUND_HEAL+.0018*skillRank("e3"),xpBoost=.018*skillRank("e1")+.005*skillRank("e13")+(skillRank("e8") ? 0.08 : 0);
  let survive=0,slowProc=0,supportMult=1,lifesteal=.0025*skillRank("c13"),critDamage=1.65+.02*skillRank("c14");
  if(item&&canEquip(p.heldItem,p)){
    if(item.hp)maxHp*=1+item.hp;if(item.atk){atk*=1+item.atk;spAtk*=1+item.atk;}if(item.physicalAtk)atk*=1+item.physicalAtk;
    if(item.speed){item.speed>0?cd/=1+item.speed:cd*=1+Math.abs(item.speed);}
    crit+=item.crit||0;roundHeal+=item.roundHeal||0;xpBoost+=item.xp||0;survive+=item.survive||0;slowProc+=item.slowProc||0;
  }
  if(id&&run){
    const role=roleFor(id);
    if(role===0){def*=1.18+.01*skillRank("a10");spDef*=1.18+.01*skillRank("a10");reduction+=.06+.0015*skillRank("a10");}
    if(role===1){atk*=1.12+.01*skillRank("a11");spAtk*=1.12+.01*skillRank("a11");crit+=.03+.0015*skillRank("a11");}
    if(role===2){cd/=1.15+.01*skillRank("a12");supportMult*=1.20+.015*skillRank("a12");}
    if(typeSynergy()){atk*=1.05;spAtk*=1.05;supportMult*=1.05;}
  }
  return{maxHp:Math.max(1,Math.round(maxHp)),atk,spAtk,def,spDef,cd:Math.max(.25,cd),crit:Math.min(.95,crit),reduction:Math.min(.45,reduction),roundHeal,xpBoost,survive,slowProc,supportMult,lifesteal,critDamage,dodge:Number(item?.dodge||0),statusResist:Number(item?.statusResist||0),moneyBonus:Number(item?.money||0),types:species(p.dex).types||["normal"]};
}
function derivedNoItem(p,id=null){return p?.heldItem?derived({...p,heldItem:null},id):derived(p,id);}
function ensureItemRunStat(id,itemId){if(!run||!id||!itemId||!EXTRA.itemDefs?.[itemId])return null;run.itemStats=run.itemStats||{};const key=id+"::"+itemId;return run.itemStats[key]||(run.itemStats[key]={pokemonId:id,itemId,damage:0,healing:0,mitigated:0,xpBonus:0,survivals:0,slowProcs:0,slowSeconds:0,dodges:0,statusBlocks:0,moneyBonus:0,uses:0});}
function touchRunItem(id){const itemId=js?.pokemon?.[id]?.heldItem;if(itemId)ensureItemRunStat(id,itemId);}
function recordItemContribution(id,itemId,field,amount=1){const s=ensureItemRunStat(id,itemId);if(!s)return;s[field]=(s[field]||0)+Math.max(0,Number(amount)||0);}
function snapshotJohtoItemStats(){return Object.values(run?.itemStats||{}).map(x=>({...x}));}


const GEN2_TM_COMPAT_SOURCE="https://raw.githubusercontent.com/Fortelle/pokemon-learnsets/master/dist/goldsilver.json";
const GEN2_TM_COMPAT_CACHE_KEY="pokesenda_johto_tm_compat_gs_v1";
// V36.64.9 auditoría profunda · Compatibilidad TM Gold/Silver embebida para las 131 formas que pueden existir en un save Johto.
// La fuente remota queda solo como procedencia/caché ampliada; enseñar MT ya no depende de Internet.
const GEN2_TM_COMPAT_EMBEDDED={"25":[1,2,3,4,6,7,10,13,17,18,20,21,23,25,27,31,32,34,35,39,40,41,43,44,45],"26":[1,2,3,4,6,7,10,13,15,17,18,20,21,23,25,27,31,32,34,35,39,40,41,43,44,45,46],"35":[1,2,3,4,6,7,9,10,11,13,14,17,18,20,21,22,23,25,27,29,30,31,32,33,34,35,38,40,41,42,43,44,45,48,50],"36":[1,2,3,4,6,7,9,10,11,13,14,15,17,18,20,21,22,23,25,27,29,30,31,32,33,34,35,38,40,41,42,43,44,45,48,50],"39":[1,2,3,4,6,7,9,10,11,13,14,17,18,20,21,22,25,27,29,30,31,32,33,34,35,38,40,41,42,43,44,45,48,50],"40":[1,2,3,4,6,7,9,10,11,13,14,15,17,18,20,21,22,25,27,29,30,31,32,33,34,35,38,40,41,42,43,44,45,48,50],"41":[3,6,10,11,13,17,19,20,21,27,32,34,35,39,43,44,45,46,47],"42":[3,6,10,11,13,15,17,19,20,21,27,32,34,35,39,43,44,45,46,47],"43":[3,6,10,11,12,13,17,19,20,21,22,27,32,34,35,36,44,45],"44":[3,6,10,11,12,13,17,19,20,21,22,27,32,34,35,36,44,45],"45":[3,6,10,11,12,13,15,17,19,20,21,22,27,32,34,35,36,44,45],"60":[2,3,6,10,13,14,16,17,18,20,21,27,29,32,34,35,40,44,45,46],"61":[2,3,6,8,10,13,14,16,17,18,20,21,26,27,29,31,32,33,34,35,40,43,44,45,46],"62":[1,2,3,6,8,10,13,14,15,16,17,18,20,21,26,27,29,31,32,33,34,35,40,43,44,45,46],"79":[2,3,6,7,9,10,11,13,14,16,17,18,20,21,23,26,27,28,29,30,31,32,34,35,38,39,42,44,45,50],"80":[1,2,3,6,7,8,9,10,11,13,14,15,16,17,18,20,21,23,26,27,28,29,30,31,32,33,34,35,38,39,42,44,45,49,50],"95":[2,3,5,6,8,10,11,13,17,20,21,23,26,27,28,31,32,34,35,37,44,45],"106":[1,2,3,6,8,10,11,13,17,20,21,27,31,32,34,35,39,43,44,45,46],"107":[1,2,3,6,8,10,11,13,17,20,21,27,31,32,33,34,35,39,41,43,44,45,46,48],"113":[1,2,3,4,6,7,8,9,10,11,13,14,15,16,17,18,20,21,22,23,25,27,29,30,31,32,34,35,37,38,40,42,44,45],"116":[2,3,6,10,13,14,16,17,18,20,21,24,27,32,34,35,39,44,45],"117":[2,3,6,10,13,14,15,16,17,18,20,21,24,27,32,34,35,39,44,45],"123":[2,3,6,8,10,11,13,15,17,20,21,27,32,34,35,39,43,44,45,46,47,49],"124":[1,2,3,6,9,10,12,13,14,15,16,17,18,20,21,27,29,30,31,32,33,34,35,42,44,45,46,50],"125":[1,2,3,6,7,8,10,13,15,17,18,20,21,23,25,27,29,31,32,33,34,35,39,41,43,44,45,46,48],"126":[1,2,3,6,8,10,11,13,15,17,20,21,23,27,29,31,32,34,35,38,41,43,44,45,46,48],"133":[2,3,6,10,11,13,17,18,20,21,23,27,30,31,32,34,35,39,43,44,45],"134":[2,3,5,6,10,11,13,14,15,16,17,18,20,21,23,27,30,31,32,34,35,39,43,44,45],"135":[2,3,5,6,7,10,11,13,15,17,18,20,21,23,25,27,30,31,32,34,35,39,43,44,45],"136":[2,3,5,6,7,10,11,13,15,17,18,20,21,23,27,30,31,32,34,35,38,39,43,44,45],"137":[3,6,7,9,10,11,13,14,15,16,17,18,20,21,23,25,27,29,32,34,35,39,42,44,46,50],"152":[2,3,6,10,11,12,13,17,19,20,21,22,23,27,31,32,34,35,43,44,45],"153":[2,3,6,8,10,11,12,13,17,19,20,21,22,23,27,31,32,34,35,43,44,45,49],"154":[2,3,6,8,10,11,12,13,15,17,19,20,21,22,23,26,27,31,32,34,35,43,44,45,49],"155":[2,3,4,6,10,11,13,17,20,21,23,27,28,31,32,34,35,38,39,40,43,44,45],"156":[2,3,4,5,6,8,10,11,13,17,20,21,23,27,28,31,32,34,35,38,39,40,43,44,45,49],"157":[1,2,3,4,5,6,8,10,11,13,15,17,20,21,23,26,27,28,31,32,34,35,38,39,40,41,43,44,45,48,49],"158":[1,2,3,6,10,13,14,16,17,18,20,21,23,27,28,31,32,33,34,35,43,44,45],"159":[1,2,3,5,6,8,10,13,14,16,17,18,20,21,23,27,28,31,32,33,34,35,43,44,45,49],"160":[1,2,3,5,6,8,10,13,14,15,16,17,18,20,21,23,26,27,28,31,32,33,34,35,43,44,45,49],"161":[1,2,3,4,6,10,11,13,17,20,21,23,27,28,30,31,32,33,34,35,39,40,41,43,44,45,46,48,49],"162":[1,2,3,4,6,10,11,13,15,17,20,21,23,27,28,30,31,32,33,34,35,39,40,41,43,44,45,46,48,49],"163":[3,6,10,11,13,17,20,21,27,31,32,34,35,39,42,43,44,45,46,47,50],"164":[3,6,10,11,13,15,17,20,21,27,31,32,34,35,39,42,43,44,45,46,47,50],"165":[1,2,3,4,6,10,11,12,13,17,19,20,21,22,27,28,32,33,34,35,39,41,44,45,46],"166":[1,2,3,4,6,10,11,12,13,15,17,19,20,21,22,27,28,32,33,34,35,39,41,44,45,46],"167":[3,6,10,11,13,17,19,20,21,22,27,28,29,32,34,35,36,44,45,46],"168":[3,6,10,11,13,15,17,19,20,21,22,27,28,29,32,34,35,36,44,45,46],"169":[3,6,10,11,13,15,17,19,20,21,27,32,34,35,39,43,44,45,46,47],"170":[3,6,7,10,13,17,18,20,21,25,27,32,34,35,44,45],"171":[3,6,7,10,13,15,17,18,20,21,25,27,32,34,35,44,45],"172":[2,3,4,6,7,10,13,17,18,20,21,23,25,27,31,32,34,35,39,40,43,44,45],"173":[2,3,4,6,7,9,10,11,13,16,17,18,20,21,22,23,27,29,30,31,32,34,35,38,40,42,43,44,45,50],"174":[2,3,4,6,7,9,10,11,13,16,17,18,20,21,22,27,29,30,31,32,34,35,38,40,42,43,44,45,50],"175":[2,3,4,6,7,8,9,10,11,13,17,18,20,21,22,27,29,30,31,32,34,35,38,39,40,42,43,44,45],"176":[2,3,4,6,7,8,9,10,11,13,15,17,18,20,21,22,27,29,30,31,32,34,35,38,39,40,42,43,44,45,47],"177":[3,6,9,10,11,13,17,19,20,21,22,27,29,32,34,35,39,42,43,44,45,46,50],"178":[3,6,9,10,11,13,15,17,19,20,21,22,27,29,32,34,35,39,42,43,44,45,46,50],"179":[2,3,6,7,10,13,17,18,20,21,23,25,27,32,34,35,39,40,44,45],"180":[1,2,3,6,7,8,10,13,17,18,20,21,23,25,27,32,34,35,39,40,41,44,45,48],"181":[1,2,3,6,7,8,10,13,15,17,18,20,21,23,25,27,32,34,35,39,40,41,44,45,48],"182":[3,6,10,11,12,13,15,17,19,20,21,22,27,32,34,35,44,45],"183":[1,2,3,4,6,10,13,14,16,17,18,20,21,23,27,31,32,33,34,35,39,40,44,45],"184":[1,2,3,4,6,8,10,13,14,15,16,17,18,20,21,23,27,31,32,33,34,35,39,40,44,45],"185":[1,2,3,4,6,8,9,10,11,13,17,20,21,26,27,28,31,32,33,34,35,37,40,41,44,45,46,48],"186":[1,2,3,6,8,10,13,14,15,16,17,18,20,21,26,27,29,31,32,33,34,35,40,43,44,45,46],"187":[2,3,6,10,11,12,13,17,19,20,21,22,27,32,34,35,40,44,45],"188":[2,3,6,10,11,12,13,17,19,20,21,22,27,32,34,35,40,44,45],"189":[2,3,6,10,11,12,13,15,17,19,20,21,22,27,32,34,35,40,44,45],"190":[1,2,3,6,7,8,10,11,13,17,20,21,23,25,27,30,31,32,33,34,35,39,40,41,42,43,44,45,46,48,49,50],"191":[3,6,10,11,12,13,17,19,20,21,22,27,32,34,35,36,44,45],"192":[3,6,10,11,12,13,15,17,19,20,21,22,27,32,34,35,36,44,45],"193":[2,3,6,10,11,13,17,19,20,21,22,27,32,34,35,39,43,44,45,46],"194":[1,2,3,4,6,8,10,13,17,18,20,21,23,26,27,28,31,32,33,34,35,36,37,40,44,45],"195":[1,2,3,4,6,8,10,13,15,17,18,20,21,23,26,27,28,31,32,33,34,35,36,37,40,44,45],"196":[2,3,6,7,9,10,11,13,15,17,18,20,21,23,27,29,30,31,32,34,35,39,42,43,44,45,50],"197":[2,3,6,7,9,10,11,13,15,17,18,20,21,23,27,29,30,31,32,34,35,39,42,43,44,45,50],"198":[3,6,9,10,11,13,16,17,20,21,27,30,31,32,34,35,39,42,43,44,45,46,47,50],"199":[1,2,3,6,7,8,9,10,11,13,14,15,16,17,18,20,21,23,26,27,28,29,30,31,32,33,34,35,38,39,42,44,45,49,50],"200":[2,3,6,7,9,10,11,13,17,18,20,21,25,27,29,30,32,34,35,39,40,42,44,45,46,50],"201":[],"202":[],"203":[2,3,6,7,8,9,10,11,13,17,20,21,23,25,26,27,29,30,31,32,34,35,39,42,44,45,46,50],"204":[2,3,4,6,8,10,11,12,13,17,19,20,21,22,27,32,34,35,40,44,45],"205":[2,3,4,6,8,10,11,12,13,15,17,19,20,21,22,27,32,34,35,37,40,44,45],"206":[2,3,4,6,7,8,9,10,11,13,17,18,20,21,22,23,25,27,28,31,32,34,35,40,42,44,45,46,50],"207":[2,3,6,8,10,11,13,17,20,21,23,27,32,34,35,36,37,39,43,44,45,46,49],"208":[2,3,4,5,6,8,10,11,13,15,17,20,21,23,24,26,27,28,31,32,34,35,37,40,44,45],"209":[1,2,3,5,6,7,8,10,11,13,17,18,20,21,25,27,30,31,32,33,34,35,36,40,41,43,44,45,46,48],"210":[1,2,3,5,6,7,8,10,11,13,15,17,18,20,21,25,27,30,31,32,33,34,35,36,40,41,43,44,45,46,48],"211":[2,3,4,6,10,13,14,16,17,18,20,21,27,32,34,35,36,39,40,44,45],"212":[2,3,6,8,10,11,13,15,17,20,21,27,32,34,35,37,39,43,44,45,46,47,49],"213":[2,3,4,6,8,10,11,13,17,20,21,26,27,28,31,32,34,35,36,37,40,44,45],"214":[2,3,6,8,10,11,13,17,20,21,26,27,32,34,35,43,44,45,46,49],"215":[1,2,3,6,8,9,10,13,14,16,17,18,20,21,23,27,28,30,31,32,33,34,35,39,40,42,43,44,45,46,49,50],"216":[1,2,3,4,5,6,7,8,10,11,13,17,20,21,26,27,28,31,32,33,34,35,39,40,41,44,45,46,48,49],"217":[1,2,3,4,5,6,7,8,10,11,13,15,17,20,21,26,27,28,31,32,33,34,35,39,40,41,44,45,46,48,49],"218":[3,4,6,8,10,11,13,17,20,21,27,31,32,34,35,38,40,44,45],"219":[3,4,6,8,10,11,13,15,17,20,21,26,27,31,32,34,35,38,40,44,45],"220":[2,3,5,6,8,10,13,14,16,17,18,20,21,26,27,31,32,34,35,40,43,44,45],"221":[2,3,5,6,8,10,13,14,15,16,17,18,20,21,26,27,31,32,34,35,40,43,44,45],"222":[2,3,4,6,8,10,11,13,17,18,20,21,26,27,29,31,32,34,35,37,40,44,45],"223":[3,6,10,13,15,17,18,20,21,27,31,32,34,35,39,40,44,45,46],"224":[3,6,10,13,15,17,18,20,21,27,31,32,34,35,39,40,44,45,46],"225":[2,3,6,10,13,14,16,17,18,20,21,27,31,32,34,35,39,43,44,45,46],"226":[2,3,6,10,13,14,16,17,18,20,21,27,31,32,34,35,39,44,45],"227":[3,6,10,11,13,17,20,21,27,31,32,34,35,37,39,43,44,45,46,47],"228":[2,3,5,6,8,10,11,13,17,20,21,22,23,27,30,31,32,34,35,36,38,39,42,43,44,45,46,50],"229":[2,3,5,6,8,10,11,13,15,17,20,21,22,23,27,30,31,32,34,35,36,38,39,42,43,44,45,46,50],"230":[2,3,6,10,13,14,15,16,17,18,20,21,24,27,32,34,35,39,44,45],"231":[2,3,4,5,6,8,10,11,13,17,20,21,26,27,31,32,34,35,37,40,44,45],"232":[2,3,4,5,6,8,10,11,13,15,17,20,21,26,27,31,32,34,35,37,40,44,45],"233":[3,6,7,9,10,11,13,14,15,16,17,18,20,21,23,25,27,29,32,34,35,39,40,42,44,46,50],"234":[2,3,5,6,9,10,11,13,17,18,20,21,26,27,29,31,32,34,35,39,42,43,44,45,46,50],"235":[],"236":[2,3,6,8,10,11,13,17,20,21,27,31,32,34,35,39,43,44,45,46],"237":[2,3,6,8,10,11,13,17,20,21,27,28,31,32,34,35,39,43,44,45,46],"238":[1,3,6,9,10,12,13,14,16,17,18,20,21,27,29,30,31,32,33,34,35,42,44,45,46,50],"239":[1,2,3,6,7,10,13,17,18,20,21,25,27,29,31,32,33,34,35,39,41,43,44,45,46,48],"240":[1,2,3,6,10,11,13,17,20,21,23,27,29,31,32,34,35,38,41,43,44,45,46,48],"241":[1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,23,25,26,27,30,31,32,33,34,35,37,40,41,44,45,48],"242":[1,2,3,4,6,7,8,10,11,13,14,15,16,17,18,20,21,22,25,27,29,30,31,32,34,35,37,38,40,42,44,45],"243":[2,3,5,6,7,8,9,10,11,13,15,17,18,20,21,23,25,27,28,31,32,34,35,37,39,43,44],"244":[2,3,5,6,8,9,10,11,13,15,17,18,20,21,22,23,27,28,31,32,34,35,37,38,39,43,44],"245":[2,3,5,6,8,9,10,11,13,14,15,16,17,18,20,21,23,27,28,31,32,34,35,37,39,43,44],"246":[2,3,6,10,11,13,15,17,18,20,21,26,27,28,31,32,34,35,37,43,44,45],"247":[2,3,6,10,11,13,15,17,18,20,21,26,27,28,31,32,34,35,37,43,44,45],"248":[1,2,3,5,6,8,10,11,13,15,17,18,20,21,23,24,26,27,28,31,32,34,35,37,38,43,44,45,48,49,50],"249":[2,3,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,23,24,25,26,27,29,30,31,32,34,35,37,39,42,43,44,47,50],"250":[3,5,6,7,8,9,10,11,13,15,17,18,19,20,21,22,24,25,26,27,29,30,31,32,34,35,37,38,39,42,43,44,47,50],"251":[3,6,9,10,11,12,13,15,17,18,19,20,21,22,27,29,30,31,32,34,35,37,39,40,42,43,44,50]};
const cloneEmbeddedGen2TMCompat=()=>Object.fromEntries(Object.entries(GEN2_TM_COMPAT_EMBEDDED).map(([dex,nums])=>[dex,nums.slice()]));
let GEN2_TM_COMPAT=cloneEmbeddedGen2TMCompat(),GEN2_TM_COMPAT_READY=true,GEN2_TM_COMPAT_LOADING=false,GEN2_TM_COMPAT_ERROR=false,GEN2_TM_COMPAT_REMOTE_READY=false,GEN2_TM_COMPAT_REMOTE_ERROR=false;
function normalizeMoveName(x){return String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");}
function buildGen2TMCompat(data){
  if(!Array.isArray(data))throw new Error("Dataset Gold/Silver inválido");
  const out={};
  for(const row of data){
    const dex=Number(row?.pokemon);if(!Number.isInteger(dex)||dex<1||dex>251)continue;
    const nums=(row.moves||[]).filter(m=>m?.method==="tm"&&/^TM\d{2}$/i.test(String(m.item||""))).map(m=>Number(String(m.item).slice(2))).filter(n=>n>=1&&n<=50);
    out[dex]=[...new Set(nums)].sort((a,b)=>a-b);
  }
  if(Object.keys(out).length!==251)throw new Error("Se esperaban 251 especies Gold/Silver");
  return out;
}
function hydrateGen2TMCompat(){
  // Un cache histórico completo de 251 puede ampliar la tabla local, pero nunca es requisito para Johto.
  try{const raw=localStorage.getItem(GEN2_TM_COMPAT_CACHE_KEY);if(!raw)return false;const c=JSON.parse(raw)?.compat;if(!c||Object.keys(c).length!==251)return false;GEN2_TM_COMPAT={...cloneEmbeddedGen2TMCompat(),...c};GEN2_TM_COMPAT_READY=true;GEN2_TM_COMPAT_REMOTE_READY=true;GEN2_TM_COMPAT_ERROR=false;GEN2_TM_COMPAT_REMOTE_ERROR=false;return true;}catch(_){return false;}
}
async function loadGen2TMCompat(){
  // Actualización remota opcional. No se invoca al arrancar: la tabla embebida ya cubre el universo regional completo.
  if(GEN2_TM_COMPAT_REMOTE_READY||GEN2_TM_COMPAT_LOADING)return GEN2_TM_COMPAT_REMOTE_READY;GEN2_TM_COMPAT_LOADING=true;
  try{
    const r=await fetch(GEN2_TM_COMPAT_SOURCE,{cache:"force-cache"});if(!r.ok)throw new Error("HTTP "+r.status);
    const remote=buildGen2TMCompat(await r.json());GEN2_TM_COMPAT={...cloneEmbeddedGen2TMCompat(),...remote};GEN2_TM_COMPAT_READY=true;GEN2_TM_COMPAT_REMOTE_READY=true;GEN2_TM_COMPAT_ERROR=false;GEN2_TM_COMPAT_REMOTE_ERROR=false;
    try{localStorage.setItem(GEN2_TM_COMPAT_CACHE_KEY,JSON.stringify({compat:remote,at:Date.now()}));}catch(_){}
  }catch(e){GEN2_TM_COMPAT_REMOTE_ERROR=true;GEN2_TM_COMPAT_ERROR=false;}
  finally{GEN2_TM_COMPAT_LOADING=false;window.PokeSendaJohtoRuntime?.onTMCompatChanged?.();}
  return GEN2_TM_COMPAT_REMOTE_READY;
}
hydrateGen2TMCompat();
function tmDef(id){return DATA().tms?.[id]||null;}
function tmSlotLabel(slot){return ["Ataque A","Ataque B","Ataque C","Support"][Math.max(0,Math.min(3,Number(slot)||0))];}
function tmCapacity(id){const r=familyRarity(id);return r==="legendary"?4:r==="epic"?3:r==="rare"?2:1;}
function tmSlotAccepts(slot,tmId){const tm=tmDef(tmId);return !!tm&&(tm.kind==="support"?Number(slot)===3:Number(slot)>=0&&Number(slot)<=2);}
function tmLoadout(p){const a=Array.isArray(p?.tmLoadout)?p.tmLoadout.slice(0,4):[];while(a.length<4)a.push(null);return a.map(x=>x||null);}
function tmDuplicatesNatural(tmId,id){const tm=tmDef(tmId),key=normalizeMoveName(tm?.moveName);return !!key&&(DATA().movesets?.[id]||[]).some(m=>normalizeMoveName(m.name)===key);}
function tmIsCompatible(tmId,id){
  const p=js?.pokemon?.[id],tm=tmDef(tmId);if(!p||!tm)return false;
  if(!GEN2_TM_COMPAT_READY)return tmLoadout(p).includes(tmId);
  return (GEN2_TM_COMPAT[Number(p.dex)]||[]).includes(Number(tm.number));
}
function tmMove(tmId){
  const t=tmDef(tmId);if(!t)return null;
  const m={kind:t.kind,name:t.moveName,type:t.type,power:Number(t.power||0),unlockStage:0,tmId,tmAccuracy:Number(t.accuracy??1),effect:t.effect,statusType:t.status,statusChance:Number(t.statusChance??1),supportAccuracyRoll:!!t.supportAccuracyRoll,slow:!!t.slow,drain:Number(t.drain||0),accuracyDown:!!t.accuracyDown,ramping:!!t.ramping};
  if(tmId==="j_tm06")m.statusChance=.85;
  if(tmId==="j_tm44")Object.assign(m,{healPct:1,selfHeal:true,rest:true});
  return m;
}
function johtoMovesFor(id){
  const p=js.pokemon[id],base=(DATA().movesets?.[id]||[]).map(m=>({...m})),load=tmLoadout(p);
  for(let slot=0;slot<4;slot++){const tmId=load[slot];if(tmId&&tmDef(tmId)&&tmIsCompatible(tmId,id)&&tmSlotAccepts(slot,tmId)&&!tmDuplicatesNatural(tmId,id))base[slot]=tmMove(tmId);}
  return base;
}

function stageIndex(fid,dex){return Math.max(0,(fam(fid)?.members||[]).indexOf(Number(dex)));}
function unlockedMoves(fid,dex,kind="attack"){const idx=stageIndex(fid,dex);return(DATA().movesets?.[fid]||[]).filter(m=>m.kind===kind&&Number(m.unlockStage||0)<=idx);}
function playerMoveEntries(id,kind="attack"){
  const p=js.pokemon[id],idx=stageIndex(id,p?.dex),moves=johtoMovesFor(id);
  return moves.map((m,i)=>({m,i,rank:Math.max(0,Number(p?.moveRanks?.[i]||0))}))
    .filter(x=>x.m&&x.m.kind===kind&&(x.m.tmId||Number(x.m.unlockStage||0)<=idx)&&(kind==="support"||x.rank>0));
}
function moveRankMult(rank){return 1+.018*(Math.max(1,Number(rank)||1)-1);}

function moveCategory(m){
  if(m?.kind==="support")return "status";
  if(m?.category)return m.category;
  if(PHYSICAL_MOVE_NAMES.has(m?.name))return "physical";
  if(SPECIAL_MOVE_NAMES.has(m?.name))return "special";
  return PHYSICAL_TYPES.has(m?.type)?"physical":"special";
}
function statusImmune(ent,type){const types=ent.stats?.types||species(ent.dex).types||[];return(type==="burn"&&types.includes("fire"))||(type==="poison"&&(types.includes("poison")||types.includes("steel")))||(type==="paralysis"&&types.includes("electric"))||(type==="freeze"&&types.includes("ice"));}
function applyStatus(ent,type,source=null){if(!ent||ent.status||statusImmune(ent,type))return false;if(ent.ownerId&&js?.pokemon?.[ent.ownerId]){const d=derivedFor(ent.ownerId);if(d.statusResist&&Math.random()<d.statusResist){const itemId=js.pokemon[ent.ownerId]?.heldItem,item=currentItem(js.pokemon[ent.ownerId]);if(itemId&&item?.statusResist)recordItemContribution(ent.ownerId,itemId,"statusBlocks",1);return false;}}ent.status={type,turns:type==="sleep"?2+Math.floor(Math.random()*3):0,source};ent.statusTick=3;return true;}
function maybeMoveStatus(m,e,source){
  const n=m?.name||"";let type=null,chance=0;
  if(m?.statusType&&m.statusType!=="confusion"&&["burn","poison","paralysis","sleep","freeze"].includes(m.statusType)){type=m.statusType;chance=Number(m.statusChance??1);}
  else if(n==="Llamarada"){type="burn";chance=.30;}
  else if(["Ascua","Lanzallamas","Colmillo Ígneo"].includes(n)){type="burn";chance=.10;}
  else if(["Impactrueno","Rayo"].includes(n)){type="paralysis";chance=.10;}
  else if(["Chispa","Descarga","Trueno","Golpe Cuerpo","Lengüetazo"].includes(n)){type="paralysis";chance=.30;}
  else if(["Aguijón Venenoso","Picotazo Veneno","Bomba Lodo"].includes(n)){type="poison";chance=.30;}
  else if(n==="Veneno Cruzado"||n==="Ácido"){type="poison";chance=.10;}
  else if(["Rayo Hielo","Ventisca"].includes(n)){type="freeze";chance=.10;}
  if(type&&Math.random()<chance&&applyStatus(e,type,source)){log((STATUS_META[type]||"")+" "+name(e.dex)+" queda afectado.");return true;}
  const confusionChance=m?.statusType==="confusion"?Number(m.statusChance??1):n==="Hidropulso"?.20:["Confusión","Psicorrayo"].includes(n)?.10:0;
  if(confusionChance&&Math.random()<confusionChance&&(e.confusion||0)<=0){e.confusion=2+Math.floor(Math.random()*4);log("💫 "+name(e.dex)+" queda confundido.");return true;}
  return false;
}
function actionBlocked(ent,label){
  if(!ent)return false;
  const isPlayer=!!(ent.familyId&&run?.team?.[ent.familyId]===ent),id=isPlayer?ent.familyId:null,st=ent.status;
  if(st?.type==="sleep"){st.turns=Math.max(0,Number(st.turns||1)-1);if(st.turns<=0){ent.status=null;log("💤 "+label+" se despertó.");}else{log("💤 "+label+" está dormido.");return true;}}
  if(st?.type==="freeze"){if(Math.random()<.20){ent.status=null;log("❄ "+label+" se descongeló.");}else{log("❄ "+label+" está congelado.");return true;}}
  if(st?.type==="paralysis"&&Math.random()<.25){log("⚡ "+label+" no puede moverse por la parálisis.");return true;}
  if((ent.confusion||0)>0){ent.confusion--;if(ent.confusion<=0){log("💫 "+label+" dejó de estar confundido.");}else if(Math.random()<.33){const dmg=Math.min(ent.hp,Math.max(1,ent.maxHp*.08));ent.hp-=dmg;if(isPlayer&&id&&run.stats?.[id])run.stats[id].damageTaken+=dmg;battleFx(isPlayer?{kind:"hit",side:"player",targetId:id,amount:dmg,moveType:"psychic",eff:1,status:"confusion"}:{kind:"hit",side:"enemy",targetUid:ent.uid,amount:dmg,moveType:"psychic",eff:1,status:"confusion"});log("💫 "+label+" se golpea a sí mismo por confusión.");if(ent.hp<=0){if(isPlayer&&id)faint(id,"confusión");else killEnemy(ent,null);}return true;}else return true;}
  return false;
}
function processStatus(dt){
  if(!run)return;
  for(const [id,t] of Object.entries(run.team||{})){if(!t?.alive||!["burn","poison"].includes(t.status?.type))continue;t.statusTick=(t.statusTick??3)-dt;if(t.statusTick<=0){t.statusTick+=3;const pct=t.status.type==="burn"?.045:.065,actual=Math.min(t.hp,Math.max(1,t.maxHp*pct));t.hp-=actual;if(run.stats?.[id])run.stats[id].damageTaken+=actual;battleFx({kind:"hit",side:"player",targetId:id,amount:actual,moveType:t.status.type==="burn"?"fire":"poison",eff:1,status:t.status.type});log((STATUS_META[t.status.type]||"")+" "+name(js.pokemon[id]?.dex||0)+" sufre "+Math.ceil(actual)+" PS por "+(t.status.type==="burn"?"quemadura":"veneno")+".");if(t.hp<=0)faint(id,t.status.type==="burn"?"quemadura":"veneno");}}
  for(const e of run.enemies||[]){if(!e?.alive||!["burn","poison"].includes(e.status?.type))continue;e.statusTick=(e.statusTick??3)-dt;if(e.statusTick<=0){e.statusTick+=3;const pct=e.status.type==="burn"?.045:.065,actual=Math.min(e.hp,Math.max(1,e.maxHp*pct));e.hp-=actual;battleFx({kind:"hit",side:"enemy",targetUid:e.uid,amount:actual,moveType:e.status.type==="burn"?"fire":"poison",eff:1,status:e.status.type});if(e.hp<=0)killEnemy(e,e.status?.source||null);}}
}
function johtoEnemyBaseCore(dex,level){
  const b=rawStatsForDex(dex),lv=Math.max(1,Number(level)||1);
  return {maxHp:55+b.hp*.85+(lv-1)*(2.8+b.hp*.055),atk:5+b.atk*.11+(lv-1)*(.55+b.atk*.0085),spAtk:5+b.spAtk*.11+(lv-1)*(.55+b.spAtk*.0085),def:b.def*(1+(lv-1)*.018),spDef:b.spDef*(1+(lv-1)*.018),cd:Math.max(.82,Math.min(1.82,1.85-b.speed*.0065))};
}
function effectiveEnemyStats(fid,dex,level,boss=false){
  const routeId=currentRouteId(),cfg=JOHTO_ACT_DIFFICULTY[routeId]||JOHTO_ACT_DIFFICULTY.johto_route1,curve=johtoRouteDifficultyCurve(routeId,run?.distance||0),core=johtoEnemyBaseCore(dex,level),teamAvg=averageBattleLevel(),gap=Math.max(0,level-teamAvg),steps=Math.min(6,gap),early=routeId==="johto_route1"&&run.distance<=1000?.80:1,km=boss?Math.max(1,Math.min(10,Math.round(run.distance/1000))):0,final=boss&&km===10,hpf=boss?(final?cfg.finalBossHp:cfg.bossHp):1;
  return{maxHp:Math.max(1,Math.round(core.maxHp*cfg.hp*curve.hp*(1+steps*.04)*hpf*early)),atk:core.atk*cfg.atk*curve.atk*(1+steps*.06)*(boss?cfg.bossAtk:1)*early,spAtk:core.spAtk*cfg.atk*curve.atk*(1+steps*.06)*(boss?cfg.bossAtk:1)*early,def:core.def*cfg.def*curve.def,spDef:core.spDef*cfg.def*curve.def,cd:Math.max(.70,core.cd*cfg.speed*curve.speed*(boss?.98:1)),types:species(dex).types||["normal"]};
}
function averageBattleLevel(){const ids=battleIds();return ids.length?ids.reduce((n,id)=>n+(js.pokemon[id]?.level||1),0)/ids.length:1;}
function enemyLevel(distance){const r=currentRouteDef(),km=Math.floor(distance/1000),base=Math.max(1,Number(r.levelBase||1));return Math.min(MAX_LEVEL,base+km*2+Math.floor((distance%1000)/350));}
const JOHTO_HELD_ITEM_CHANCE=.05;
const JOHTO_TYPE_ITEM={normal:"pink_bow",bug:"silver_powder",poison:"poison_barb",grass:"miracle_seed",water:"mystic_water",fire:"charcoal",electric:"magnet",flying:"sharp_beak",ground:"soft_sand",rock:"hard_stone",fighting:"black_belt",psychic:"twisted_spoon",ghost:"spell_tag",ice:"never_melt_ice",dragon:"dragon_fang",dark:"black_glasses",steel:"metal_coat",fairy:"pink_bow"};
const JOHTO_HELD_BY_FAMILY={j_pikachu:"light_ball",j_chansey:"lucky_punch",j_snorlax:"leftovers",j_onix:"hard_stone",j_scyther:"silver_powder",j_electabuzz:"magnet",j_magmar:"charcoal",j_eevee:"pink_bow",j_horsea:"mystic_water",j_zubat:"sharp_beak",j_porygon:"up_grade",j_sneasel:"quick_claw",j_murkrow:"black_glasses",j_misdreavus:"spell_tag",j_heracross:"black_belt",j_delibird:"never_melt_ice",j_skarmory:"metal_coat",j_dragonite:"dragon_fang"};
function enemyHeldItem(fid,dex){if(Math.random()>=JOHTO_HELD_ITEM_CHANCE)return null;const types=species(dex)?.types||[];return JOHTO_HELD_BY_FAMILY[fid]||JOHTO_TYPE_ITEM[types[0]]||"oran_berry";}
function tryHeldItemDrop(e){if(!e?.heldItem)return false;const dp=currentDropProfile(),chance=Number(dp.heldItemDropChance||0)*(1+.035*skillRank("f4")+(skillRank("f8")?.10:0));if(Math.random()<chance){const ok=grantItem(e.heldItem);if(ok)log("🎒 "+name(e.dex)+" soltó "+(EXTRA.itemDefs[e.heldItem]?.name||"su objeto")+".");return ok;}log("🎒 "+name(e.dex)+" llevaba "+(EXTRA.itemDefs[e.heldItem]?.name||"un objeto")+", pero no lo soltó.");return false;}
function battleFx(payload){if(backgroundCatchingUp)return;try{window.PokeSendaJohtoRuntime?.onBattleFx?.(payload);}catch(_){}}
function strugglePlayer(id,e){const t=run?.team?.[id],p=js.pokemon?.[id];if(!t?.alive||!e?.alive||!p)return 0;const d=derivedFor(id),before=e.hp,raw=Math.max(1,d.atk*idlePower(50)*.45*defenseFactor(e.stats.def)*(.90+Math.random()*.20)),actual=Math.max(0,Math.min(before,raw));battleFx({kind:"attack",side:"player",sourceId:id,targetUids:[e.uid],moveType:"normal",area:false});e.hp-=raw;run.stats[id].damage+=actual;battleFx({kind:"hit",side:"enemy",targetUid:e.uid,amount:actual,moveType:"normal",eff:1});if(!t.struggleWarned){log("⚠️ "+name(p.dex)+" no tiene ningún movimiento capaz de afectar a los rivales actuales y recurre a Forcejeo.");t.struggleWarned=true;}else log(name(p.dex)+" usa Forcejeo: "+Math.round(actual)+" PS.");if(e.hp<=0)killEnemy(e,id);if(run&&t.alive){const recoil=Math.max(1,t.maxHp*.05),taken=Math.min(t.hp,recoil);t.hp-=recoil;run.stats[id].damageTaken+=taken;battleFx({kind:"hit",side:"player",targetId:id,amount:taken,moveType:"normal",eff:1,recoil:true});if(t.hp<=0)faint(id,"retroceso de Forcejeo");}return actual;}
function struggleEnemy(e,id){const t=run?.team?.[id];if(!e?.alive||!t?.alive)return 0;const d=derivedFor(id),before=t.hp,raw=Math.max(1,e.stats.atk*idlePower(e.move?.power||50)*.45*defenseFactor(d.def)*(.90+Math.random()*.20)*(1-(d.reduction||0))*(1-(t.guard||0))*(run.centerBuffRounds>0?Math.max(.72,1-.01*skillRank("e12")):1)),actual=Math.max(0,Math.min(before,raw));battleFx({kind:"attack",side:"enemy",sourceUid:e.uid,targetIds:[id],moveType:"normal",area:false});t.hp-=raw;run.stats[id].damageTaken+=actual;battleFx({kind:"hit",side:"player",targetId:id,amount:actual,moveType:"normal",eff:1});if(t.hp<=0){if(d.survive&&Math.random()<d.survive){t.hp=1;log("🎗️ "+name(js.pokemon[id].dex)+" resiste el Forcejeo con 1 PS.");}else faint(id,"Forcejeo");}if(e.alive){e.hp-=Math.max(1,e.maxHp*.05);if(e.hp<=0)killEnemy(e,null);}return actual;}
function makeEnemy(fid,index,boss=false,forced=null){
  const level=Math.min(MAX_LEVEL,forced??(enemyLevel(run.distance)+(boss?2:0))),members=fam(fid)?.members||[152],idx=Math.min(stageIndexForLevel(fid,level),members.length-1),dex=Number(members[idx]),st=effectiveEnemyStats(fid,dex,level,boss),moves=unlockedMoves(fid,dex,"attack"),mv=moves[Math.floor(Math.random()*moves.length)]||{name:"Placaje",type:"normal",power:40};
  return{familyId:fid,dex,level,stats:st,maxHp:st.maxHp,hp:st.maxHp,attackTimer:st.cd*(.7+Math.random()*.35),status:null,statusTick:3,move:mv,boss,alive:true,uid:"r"+run.roundIndex+"e"+index,xp:Math.max(1,Math.round((3.2+level*.65)*(boss?2.2:1))),heldItem:enemyHeldItem(fid,dex)};
}
function stageIndexForLevel(fid,level){
  const f=fam(fid),members=f?.members||[];let idx=0;
  for(const e of f?.evolutions||[]){if(e.method==="level"&&Number(e.from)===Number(members[idx])&&level>=Number(e.level||999)){const ni=members.indexOf(Number(e.to));if(ni>=0)idx=ni;}}
  return idx;
}
function routePools(){
  const rid=currentRouteId(),r=currentRouteDef(),o={};for(const[k,v]of Object.entries(r.gachaByRarity||{}))o[k]=[...v];
  const s=starterForRoute(js.starter,rid);o.rare=Array.isArray(o.rare)?o.rare:[];if(s&&!o.rare.includes(s))o.rare.push(s);return o;
}
function johtoOpeningEncounterPool(){
  const p=routePools(),base=[...(p.common||[])],starter=js.pokemon?.[js.starter];
  if(!starter)return base;
  const starterTypes=species(starter.dex)?.types||[];
  const level=Math.max(1,enemyLevel(Number(run?.distance||0)));
  const safe=base.filter(fid=>{
    const dex=enemyDexForFamily(fid,level),moves=unlockedMoves(fid,dex,"attack");
    // Igual que el arranque curado de Kanto: durante el primer km evitamos que
    // la única pieza del jugador se encuentre repetidamente con un counter directo.
    return !moves.some(m=>typeMult(m.type,starterTypes)>1.01);
  });
  return safe.length>=4?safe:base;
}
function encounterPool(){const p=routePools();if(currentRouteId()==="johto_route1"&&Number(run?.distance||0)<1000)return johtoOpeningEncounterPool();return[...(p.common||[]),...(p.uncommon||[]),...(p.rare||[]).filter(id=>!STARTERS.includes(id))];}

const ROUTE_EVENT_CHANCE=.032;
// Johto · la Vendedora de Mentas se decide dentro de los eventos de ruta.
// Ajuste de frecuencia: 2% por evento de ruta elegible, máximo una aparición por expedición.
// La protección anti-mala-suerte queda muy lejana para que siga siendo un encuentro realmente raro.
const JOHTO_MINT_VENDOR_EVENT_CHANCE=.02; // 2% exacto por evento elegible · máximo una visita por expedición
const ROUTE_EVENTS=[
 {id:"backpack",weight:24,icon:"🎒",title:"Mochila abandonada",text:"Encuentras una mochila tirada junto al camino. Podría contener algo útil... o simplemente estar vacía.",primary:"Revisar mochila",secondary:"Seguir"},
 {id:"camp",weight:24,icon:"🏕️",title:"Campamento tranquilo",text:"Hay un pequeño campamento abandonado y parece seguro descansar unos minutos.",primary:"Descansar",secondary:"Seguir"},
 {id:"mystery",weight:18,icon:"❓",title:"Pokémon misterioso",text:"Escuchas un ruido extraño fuera del sendero. Parece un Pokémon poco habitual para esta zona.",primary:"Investigar",secondary:"Ignorar"},
 {id:"rich",weight:14,icon:"💰",title:"Entrenador adinerado",text:"Un entrenador presume de su equipo y ofrece una buena cantidad de Pokédólares a quien consiga derrotarlo.",primary:"Desafiar",secondary:"Dejarlo pasar"},
 {id:"ambush",weight:13,icon:"⚠️",title:"¡Emboscada!",text:"Una manada especialmente agresiva bloquea el camino. El combate será más duro, pero parece que protegen algo valioso.",primary:"Enfrentar",secondary:"Rodear la zona"},
 {id:"incense_vendor",weight:7,icon:"🧿",title:"Vendedor de Inciensos",text:"Un comerciante ambulante ofrece tres Inciensos de tipo. Favorecen familias afines dentro de la rareza que ya haya salido.",primary:"Ver ofertas",secondary:"Seguir"}
];
function rollRouteEvent(){const total=ROUTE_EVENTS.reduce((n,e)=>n+e.weight,0);let x=Math.random()*total;for(const e of ROUTE_EVENTS){x-=e.weight;if(x<=0)return e;}return ROUTE_EVENTS[0];}
function tryRouteEvent(){
  if(js.options.routeEvents===false||!run||run.distance<300||run.distance>=MAX_DISTANCE||run.bossActive||run.pendingBoss||run.rewardPending||run.centerPending||run.eventPending||run.eventBattle)return false;
  run.eventCooldown=Math.max(0,Number(run.eventCooldown||0)-1);if(run.eventCooldown>0||Math.random()>=ROUTE_EVENT_CHANCE)return false;
  const eventNumber=Math.max(1,Number(run.eventCount||0)+1);
  let ev;if(!run.mintVendorSeen&&Math.random()<JOHTO_MINT_VENDOR_EVENT_CHANCE){ev={id:"mint_vendor",icon:"🌿",title:"Vendedora de Mentas",text:"Una especialista en naturalezas aparece de forma excepcional. Ofrece tres Mentas regionales; muy rara vez trae una Menta Maestra.",primary:"Ver ofertas",secondary:"Seguir"};run.mintVendorSeen=true;}else ev=rollRouteEvent();run.eventPending=ev.id;run.eventCooldown=5+Math.floor(Math.random()*4);run.eventCount=eventNumber;js.routeEventStats.seen++;run.paused=true;run.eventPauseWallMs=Date.now();save();window.PokeSendaJohtoRuntime?.onRouteEvent?.(ev);return true;
}
function eventRewardMoney(amount,label){amount=Math.max(1,Math.round(amount*(1+.025*skillRank("f1")+(skillRank("f8")?.10:0)+(skillRank("trainer")?.03:0))));js.money+=amount;run.earned+=amount;log("💰 "+label+": +₽"+amount.toLocaleString("es-CL")+".");}
function eventGuaranteedItem(min="common",source="Evento de ruta"){
  const order=["common","uncommon","rare","epic","legendary"],minIdx=Math.max(0,order.indexOf(min)),weights={common:52,uncommon:30,rare:13,epic:4.5,legendary:.5};
  let candidates=Object.entries(EXTRA.itemDefs||{}).filter(([_,it])=>it&&!it.specialReward&&!it.consumable&&!it.restrictDex&&order.indexOf(it.rarity||"common")>=minIdx);
  if(!candidates.length)candidates=Object.entries(EXTRA.itemDefs||{}).filter(([_,it])=>it&&!it.specialReward&&!it.consumable&&!it.restrictDex);if(!candidates.length)return false;
  let total=candidates.reduce((n,[_,it])=>n+(weights[it.rarity]||1),0),x=Math.random()*total,pick=candidates[candidates.length-1][0];for(const [id,it] of candidates){x-=weights[it.rarity]||1;if(x<=0){pick=id;break;}}
  const ok=grantItem(pick);if(ok)log("🎒 "+source+": "+(EXTRA.itemDefs[pick]?.name||pick)+".");return ok;
}
function johtoWeightedEventFamily(rareOnly=false){
  const eventKm=Math.max(1,Math.min(10,Math.floor(Number(run?.distance||0)/1000))),pools=rewardPools(eventKm),groups=rareOnly?["rare","epic","legendary"]:["common","uncommon","rare","epic","legendary"],base={common:63,uncommon:24,rare:10,epic:2.5,legendary:.5},entries=[];
  for(const rar of groups){const ids=pools[rar]||[],w=(base[rar]||1)/Math.max(1,ids.length);for(const fid of ids)entries.push({fid,w});}if(!entries.length){const pool=encounterPool();return pool[Math.floor(Math.random()*Math.max(1,pool.length))]||currentRouteDef().bosses?.[0];}
  let x=Math.random()*entries.reduce((n,e)=>n+e.w,0);for(const e of entries){x-=e.w;if(x<=0)return e.fid;}return entries[0].fid;
}
function startEventBattle(type){
  if(!run)return;run.eventPending=null;run.eventPauseWallMs=0;run.eventBattle={type};run.paused=false;run.wallTickMs=Date.now();run.roundIndex++;run.roundXp=0;run.roundCombatants=[];markCombatants();
  const pool=encounterPool(),base=enemyLevel(run.distance);let enemies=[];
  if(type==="mystery"){const fid=johtoWeightedEventFamily(true),count=Math.random()<.35?2:1;for(let i=0;i<count;i++){const e=makeEnemy(fid,i,false,Math.max(1,base+1+Math.floor(Math.random()*2)));e.eventEnemy=true;enemies.push(e);}}
  else if(type==="rich"){for(let i=0;i<3;i++){const fid=pool[Math.floor(Math.random()*pool.length)],e=makeEnemy(fid,i,false,Math.max(1,base+1+Math.floor(Math.random()*3)));e.eventEnemy=true;enemies.push(e);}}
  else if(type==="ambush"){const fid=pool[Math.floor(Math.random()*pool.length)];for(let i=0;i<4;i++){const e=makeEnemy(fid,i,false,Math.max(1,base+2+Math.floor(Math.random()*3)));e.eventEnemy=true;e.maxHp*=1.22;e.hp=e.maxHp;e.stats.atk*=1.12;e.stats.spAtk*=1.12;enemies.push(e);}}
  run.enemies=enemies;log((type==="ambush"?"⚠️ Emboscada":type==="rich"?"💰 Desafío":"❓ Encuentro misterioso")+" · combate especial.");window.PokeSendaJohtoRuntime?.onRouteEventClosed?.();render();
}
function completeEventBattle(){
  if(!run?.eventBattle)return;const type=run.eventBattle.type;run.eventBattle=null;js.routeEventStats.completed++;js.routeEventStats.battlesWon++;
  if(type==="mystery"){eventRewardMoney(100+Math.floor(run.distance/1000)*18,"Encuentro misterioso");if(Math.random()<.55)eventGuaranteedItem("uncommon","Pokémon misterioso");}
  else if(type==="rich"){eventRewardMoney(420+Math.floor(run.distance/1000)*60,"Entrenador adinerado");}
  else if(type==="ambush"){eventRewardMoney(150+Math.floor(run.distance/1000)*25,"Emboscada superada");eventGuaranteedItem("uncommon","Botín de la emboscada");if(Math.random()<.25)rollEvolution(12);}
  run.spawnDelay=.85;save();render();
}
function resolveRouteEvent(action){
  if(!run?.eventPending)return false;const id=run.eventPending;
  if(action==="ignore"){js.routeEventStats.ignored++;run.eventPending=null;run.eventPauseWallMs=0;run.paused=false;run.wallTickMs=Date.now();run.spawnDelay=.55;save();return true;}
  if(id==="backpack"){js.routeEventStats.backpacks++;const roll=Math.random();if(roll<.18)rollEvolution(9);else if(roll<.38){const ids=["potion","super_potion","hyper_potion","full_heal"],pick=ids[Math.floor(Math.random()*ids.length)];grantItem(pick);}else eventGuaranteedItem("common","Mochila abandonada");js.routeEventStats.completed++;run.eventPending=null;run.eventPauseWallMs=0;run.paused=false;run.wallTickMs=Date.now();run.spawnDelay=.55;save();return true;}
  if(id==="camp"){js.routeEventStats.camps++;let healedTotal=0;for(const pid of run.partyIds){const t=run.team[pid];if(t?.alive){const before=t.hp;t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.30);const healed=Math.max(0,t.hp-before);healedTotal+=healed;if(healed)battleFx({kind:"heal",side:"player",targetId:pid,amount:healed});}}js.routeEventStats.completed++;run.eventPending=null;run.eventPauseWallMs=0;run.paused=false;run.wallTickMs=Date.now();run.spawnDelay=.55;log("🏕️ Campamento: el equipo recupera "+Math.ceil(healedTotal)+" PS en total.");save();return true;}
  if(id==="incense_vendor"){run.incenseVendorOffers=Array.isArray(run.incenseVendorOffers)&&run.incenseVendorOffers.length?run.incenseVendorOffers:randomIncenseOffers();run.incenseVendorBought=run.incenseVendorBought||{};js.vendorStats.incenseSeen++;save();window.PokeSendaJohtoRuntime?.onIncenseVendorOpen?.();return true;}
  if(id==="mint_vendor"){run.mintVendorOffers=Array.isArray(run.mintVendorOffers)&&run.mintVendorOffers.length?run.mintVendorOffers:randomMintOffers();run.mintVendorBought=run.mintVendorBought||{};js.vendorStats.mintSeen++;save();window.PokeSendaJohtoRuntime?.onMintVendorOpen?.();return true;}
  if(["mystery","rich","ambush"].includes(id)){startEventBattle(id);return true;}return false;
}
function spawnRound(){
  if(!run||run.paused||run.rewardPending||run.centerPending)return;
  if(run.pendingBoss){spawnBoss();return;}
  run.roundIndex++;run.roundXp=0;run.roundCombatants=[];markCombatants();
  const pool=encounterPool(),km=Math.floor(run.distance/1000),routeIdx=Math.max(0,JOHTO_ROUTE_ORDER.indexOf(currentRouteId())),route3Opening=currentRouteId()==="johto_route3"&&Number(run.distance||0)<2500,count=route3Opening?Math.min(3,Math.max(2,battleIds().length)):Math.min(4,Math.max(2,battleIds().length+1+(routeIdx>0||km>=5?1:0))),baseLv=enemyLevel(run.distance),main=pool[Math.floor(Math.random()*pool.length)],mainTypes=species(enemyDexForFamily(main,baseLv)).types||[],same=pool.filter(id=>id!==main&&(species(enemyDexForFamily(id,baseLv)).types||[]).some(t=>mainTypes.includes(t))),alt=count>1&&same.length&&Math.random()<.38?same[Math.floor(Math.random()*same.length)]:null,ids=Array(count).fill(main);
  if(alt)ids[Math.floor(Math.random()*count)]=alt;
  const vars=[-2,-1,0,0,1,2];run.enemies=ids.map((id,i)=>makeEnemy(id,i,false,Math.max(1,baseLv+vars[Math.floor(Math.random()*vars.length)])));
  log("Manada · "+run.enemies.length+" rivales · "+run.enemies.map(e=>name(e.dex)+" Nv."+e.level).join(" · "));
}
function enemyDexForFamily(fid,level){const members=fam(fid)?.members||[152];return Number(members[Math.min(stageIndexForLevel(fid,level),members.length-1)]);}
function spawnBoss(){
  run.roundIndex++;run.roundXp=0;run.roundCombatants=[];markCombatants();
  const km=Math.max(1,Math.min(10,Math.round(run.distance/1000))),rid=currentRouteId(),r=currentRouteDef();
  let fid=r.bosses?.[km-1]||r.finalBoss;
  if(fid==="j_chikorita"||fid==="j_cyndaquil"||fid==="j_totodile")fid=starterForRoute(js.starter,rid);
  if(km===10)fid=r.finalBoss;
  const forced=km===10?Number(r.finalBossLevel||25):null;run.enemies=[makeEnemy(fid,0,true,forced)];run.pendingBoss=false;run.bossActive=true;log("⚠ JEFE "+km+" km: "+name(run.enemies[0].dex)+" Nv."+run.enemies[0].level+".");
}
function livingEnemies(){return(run?.enemies||[]).filter(e=>e.alive&&e.hp>0);}
function targetEnemy(){return livingEnemies()[0]||null;}
function markCombatants(){for(const id of battleIds())if(!run.roundCombatants.includes(id))run.roundCombatants.push(id);}
function derivedFor(id){return derived(js.pokemon[id],id);}
function refreshCombatant(id){
  const t=run?.team?.[id],p=js.pokemon?.[id];if(!t||!p)return false;
  const oldMax=Math.max(1,Number(t.maxHp)||1),oldHp=Math.max(0,Number(t.hp)||0),ratio=Math.max(0,Math.min(1,oldHp/oldMax)),d=derived(p,id);
  t.maxHp=Math.max(1,Number(d.maxHp)||1);t.hp=t.alive?Math.max(1,Math.min(t.maxHp,t.maxHp*ratio)):0;
  if(run?.paused&&run.pauseHpBaseline)run.pauseHpBaseline=johtoPauseHpSnapshot();
  return true;
}
function teamWiped(){return !!run&&Object.values(run.team).every(t=>!t.alive);}
function faint(id,reason="combate"){
  const t=run?.team?.[id];if(!t?.alive)return;const before=new Set(battleIds()),stat=run.stats?.[id];t.alive=false;t.hp=0;if(stat)stat.deaths=(stat.deaths||0)+1;log("💀 "+name(js.pokemon[id].dex)+" queda debilitado por "+reason+". Solo un Centro Pokémon puede revivirlo.");
  const after=battleIds(),incoming=after.find(x=>!before.has(x));if(incoming){if(!run.roundCombatants.includes(incoming))run.roundCombatants.push(incoming);const haste=.015*skillRank("e6"),power=.015*skillRank("e11"),it=run.team[incoming];if(haste){it.haste=Math.max(it.haste||0,haste);it.hasteTime=Math.max(it.hasteTime||0,8);}if(power){it.power=Math.max(it.power||0,power);it.powerTime=Math.max(it.powerTime||0,8);}const role=roleFor(incoming),slot=js.formation.indexOf(incoming),preferred=role>=0&&slot===role+3,roleName=["Guardia","Asalto","Apoyo"][role]||"combate";log("🔄 "+name(js.pokemon[incoming].dex)+" entra desde "+(preferred?"Banca "+roleName:"la banca para cubrir "+roleName)+((haste||power)?" con impulso":"")+".");}
  markCombatants();
}
function chooseAttack(id){const entries=playerMoveEntries(id,"attack"),enemies=livingEnemies();if(!entries.length||!enemies.length)return enemies.length?{struggle:true,e:enemies[0]}:null;let best=null;for(const entry of entries)for(const e of enemies){const mult=typeMult(entry.m.type,e.stats.types);if(mult<=0)continue;const d=estimatedDamage(id,e,entry),score=Math.min(e.hp,d)+(d>=e.hp?e.maxHp*.14:0)+(mult>1?e.maxHp*.035:0);if(!best||score>best.score)best={entry,e,score};}return best||{struggle:true,e:enemies[Math.floor(Math.random()*enemies.length)]};}
function estimatedDamage(id,e,entry){
  const m=entry.m,d=derivedFor(id),cat=moveCategory(m),off=cat==="special"?d.spAtk:d.atk,def=cat==="special"?e.stats.spDef:e.stats.def,stab=d.types.includes(m.type)?1.2:1,item=currentItem(js.pokemon[id]),itemBoost=item?.boostType===m.type?1+(item.power||0):1;
  return off*idlePower(m.power)*moveRankMult(entry.rank)*typeMult(m.type,e.stats.types)*stab*defenseFactor(def)*itemBoost;
}
function johtoSupportStatusEffect(m,rank=1){
  const r=Math.max(1,Math.min(25,Number(rank)||1)),bonus=.004*(r-1),known=["burn","poison","paralysis","sleep","freeze","confusion"];
  if(m?.statusType&&known.includes(m.statusType))return{type:m.statusType,chance:Math.min(.99,Number(m.statusChance??1))};
  const n=m?.name||"";let type=null,base=0;
  if(["Onda Trueno","Polvo Paralizador"].includes(n)){type="paralysis";base=.90;}
  else if(["Hipnosis","Canto"].includes(n)){type="sleep";base=.75;}
  else if(n==="Espora"){type="sleep";base=.95;}
  else if(["Supersónico","Rayo Confuso","Beso Dulce"].includes(n)){type="confusion";base=.85;}
  else if(n==="Tóxico"){type="poison";base=.80;}
  return type?{type,chance:Math.min(.99,base+bonus)}:null;
}
function smartSupport(id){
  const entries=playerMoveEntries(id,"support");if(!entries.length)return null;
  const self=run?.team?.[id];
  // V36.66 · Cadencia Support global de Johto.
  // Tras usar CUALQUIER Support, este Pokémon debe intentar 2 acciones ofensivas
  // antes de poder elegir Support otra vez. Evita bucles de cura/estado/buff sin
  // tocar movimientos especie por especie y mantiene el Support como decisión táctica.
  if(!self?.alive||Number(self.supportAttackDebt||0)>0)return null;
  // Paridad Kanto: además, buffs temporales no se recastean mientras ya estén activos.
  const entry=entries[0],m=entry.m,ids=battleIds().filter(x=>run.team[x]?.alive);if(!ids.length)return null;
  const ratios=ids.map(x=>run.team[x].hp/run.team[x].maxHp),min=Math.min(...ratios),avg=ratios.reduce((a,b)=>a+b,0)/ratios.length,boss=livingEnemies().some(e=>e.boss),statusFx=johtoSupportStatusEffect(m,entry.rank);
  if(statusFx&&livingEnemies().some(e=>statusFx.type==="confusion"?(e.confusion||0)<=0:!e.status?.type)&&Math.random()<.72)return entry;
  if(m.effect==="heal"&&min<.58)return entry;
  if(m.effect==="guard"&&(boss||avg<.62)&&ids.some(x=>(run.team[x].guard||0)<.02)&&Math.random()<.70)return entry;
  if(m.effect==="haste"&&(boss||livingEnemies().length>=3)&&ids.every(x=>(run.team[x].haste||0)<.02)&&Math.random()<.42)return entry;
  if(m.effect==="power"&&(boss||livingEnemies().length>=3)&&ids.every(x=>(run.team[x].power||0)<.02)&&Math.random()<.42)return entry;
  return null;
}
function useSupport(id,entry){
  const m=entry.m,rank=Math.max(1,entry.rank||1),ids=battleIds(),d=derivedFor(id),amount=(.05+.003*(rank-1))*(1+.01*skillRank("c7"))*(d.supportMult||1),stat=run.stats?.[id],self=run.team?.[id];
  if(self)self.supportAttackDebt=2;
  if(stat)stat.supports=(stat.supports||0)+1;
  const statusFx=johtoSupportStatusEffect(m,rank);
  if(statusFx){const candidates=livingEnemies().filter(e=>statusFx.type==="confusion"?(e.confusion||0)<=0:!e.status?.type),target=candidates[0]||targetEnemy();if(!target)return;if(m.supportAccuracyRoll&&Number.isFinite(Number(m.tmAccuracy))&&Math.random()>Number(m.tmAccuracy)){log("💨 "+name(js.pokemon[id].dex)+" usa "+m.name+", pero falla.");return;}if(Math.random()>=statusFx.chance)return;if(statusFx.type==="confusion"){if((target.confusion||0)<=0){target.confusion=2+Math.floor(Math.random()*4);log("💫 "+name(js.pokemon[id].dex)+" usa "+m.name+".");}}else if(applyStatus(target,statusFx.type,id))log((STATUS_META[statusFx.type]||"💫")+" "+name(js.pokemon[id].dex)+" usa "+m.name+".");return;}
  if(m.healPct&&m.selfHeal){const t=run.team[id],before=t.hp;t.hp=Math.min(t.maxHp,t.hp+t.maxHp*Number(m.healPct||0));const healed=Math.max(0,t.hp-before);if(stat)stat.healing+=healed;if(m.rest){t.status=null;t.confusion=0;t.statusTick=3;applyStatus(t,"sleep",id);}if(healed)battleFx({kind:"heal",side:"player",targetId:id,amount:healed});log("💚 "+name(js.pokemon[id].dex)+" usa "+m.name+": recupera "+Math.round(healed)+" PS"+(m.rest?" y queda dormido":"")+".");return;}
  if(m.effect==="heal"){const target=ids.slice().sort((a,b)=>run.team[a].hp/run.team[a].maxHp-run.team[b].hp/run.team[b].maxHp)[0]||id,b=run.team[target].hp;run.team[target].hp=Math.min(run.team[target].maxHp,run.team[target].hp+run.team[target].maxHp*amount);const healed=Math.max(0,run.team[target].hp-b);if(stat)stat.healing+=healed;if(healed)battleFx({kind:"heal",side:"player",targetId:target,amount:healed});log("💚 "+name(js.pokemon[id].dex)+" usa "+m.name+": +"+Math.ceil(healed)+" PS.");}
  else if(m.effect==="guard"){for(const x of ids){run.team[x].guard=Math.max(run.team[x].guard||0,amount);run.team[x].guardTime=5;}log("🛡️ "+name(js.pokemon[id].dex)+" usa "+m.name+".");}
  else if(m.effect==="haste"){for(const x of ids){run.team[x].haste=Math.max(run.team[x].haste||0,amount);run.team[x].hasteTime=5;}log("⚡ "+name(js.pokemon[id].dex)+" usa "+m.name+".");}
  else{for(const x of ids){run.team[x].power=Math.max(run.team[x].power||0,amount);run.team[x].powerTime=5;}log("💥 "+name(js.pokemon[id].dex)+" usa "+m.name+".");}
}
function playerAction(id){
  const t=run.team[id],p=js.pokemon[id];if(actionBlocked(t,name(p.dex)))return;
  const support=smartSupport(id);if(support){useSupport(id,support);return;}
  const best=chooseAttack(id);if(!best)return;
  const markOffensiveAttempt=()=>{if(Number(t.supportAttackDebt||0)>0)t.supportAttackDebt=Math.max(0,Number(t.supportAttackDebt||0)-1);};
  if(best.struggle){markOffensiveAttempt();strugglePlayer(id,best.e);return;}
  const entry=best.entry,m=entry.m,targets=m.area?livingEnemies().filter(e=>typeMult(m.type,e.stats.types)>0).slice(0,4):[best.e],d=derivedFor(id),item=currentItem(p),itemId=p.heldItem||null,dNoItem=item?derivedNoItem(p,id):d,cat=moveCategory(m),burn=cat==="physical"&&t.status?.type==="burn"?.75:1,off=(cat==="special"?d.spAtk:d.atk)*burn,offNoItem=(cat==="special"?dNoItem.spAtk:dNoItem.atk)*burn;
  markOffensiveAttempt();
  if(Number(m.tmAccuracy??1)<1&&Math.random()>Number(m.tmAccuracy)){log("💨 "+name(p.dex)+" falla "+m.name+".");battleFx({kind:"miss",side:"player",sourceId:id,targetUid:best.e?.uid,moveType:m.type});return;}battleFx({kind:"attack",side:"player",sourceId:id,targetUids:targets.map(e=>e.uid),moveType:m.type,area:!!m.area});
  const critRoll=Math.random(),crit=critRoll<d.crit,critNoItem=critRoll<dNoItem.crit,routeCritMult=1.65+.02*skillRank("c14"),variance=.92+Math.random()*.16;
  for(const e of targets){if(!e.alive)continue;const def=cat==="special"?e.stats.spDef:e.stats.def,stab=d.types.includes(m.type)?1.2+(skillRank("c6")?.08:0):1,mult=typeMult(m.type,e.stats.types),areaPenalty=m.area?Math.min(.82,.60+.015*skillRank("c12")):1,boost=item?.boostType===m.type?1+(item.power||0):1,categoryBoost=cat==="physical"?1+.008*skillRank("c10"):1+.008*skillRank("c11"),bossBoost=e.boss?1+.01*skillRank("e5")+(skillRank("e8") ? 0.05 : 0):1,last=t.hp/t.maxHp<.30&&skillRank("c8")?1.15:1,common=idlePower(m.power)*moveRankMult(entry.rank)*stab*mult*defenseFactor(def)*(1+(t.power||0))*areaPenalty*categoryBoost*bossBoost*last*variance*(run.centerBuffRounds>0?(1+.01*skillRank("e4")):1),raw=off*common*boost*(crit?routeCritMult:1),rawNoItem=offNoItem*common*(critNoItem?routeCritMult:1),beforeHp=e.hp,actual=Math.min(beforeHp,Math.max(0,raw)),actualNoItem=Math.min(beforeHp,Math.max(0,rawNoItem));e.hp-=raw;run.stats[id].damage+=actual;battleFx({kind:"hit",side:"enemy",targetUid:e.uid,amount:actual,moveType:m.type,eff:mult,crit});if(itemId){let itemDamage=Math.max(0,actual-actualNoItem);if((item?.speed||0)>0)itemDamage+=actual*((item.speed||0)/(1+(item.speed||0)));if(itemDamage>0)recordItemContribution(id,itemId,"damage",itemDamage);recordItemContribution(id,itemId,"uses",1);}if((d.lifesteal||m.drain)&&actual>0){const before=t.hp,totalPotential=actual*(d.lifesteal+(m.drain||0)),itemPotential=actual*(item?.lifesteal||0);t.hp=Math.min(t.maxHp,t.hp+totalPotential);const healed=Math.max(0,t.hp-before);run.stats[id].healing+=healed;if(itemId&&itemPotential>0&&totalPotential>0&&healed>0)recordItemContribution(id,itemId,"healing",healed*(itemPotential/totalPotential));if(healed)battleFx({kind:"heal",side:"player",targetId:id,amount:healed});}if(m.slow&&e.alive)e.attackTimer+=.45;if(m.statusType&&e.alive){if(m.statusType==="confusion")e.confusion=2+Math.floor(Math.random()*3);else if(["burn","poison","paralysis","freeze"].includes(m.statusType))applyStatus(e,m.statusType,id);}if(mult>1.01)run.stats[id].superEffective++;if(crit)run.stats[id].crits++;maybeMoveStatus(m,e,id);if(e.hp<=0)killEnemy(e,id);if(d.slowProc&&Math.random()<d.slowProc){e.attackTimer+=.38;if(itemId&&item?.slowProc){recordItemContribution(id,itemId,"slowProcs",1);recordItemContribution(id,itemId,"slowSeconds",.38);}}}
}
function enemyAction(e){
  if(actionBlocked(e,name(e.dex)))return;const ids=battleIds().filter(id=>run.team[id]?.alive);if(!ids.length)return;const m=e.move,cat=moveCategory(m),off=(cat==="special"?e.stats.spAtk:e.stats.atk)*(cat==="physical"&&e.status?.type==="burn"?.75:1),hittable=ids.filter(id=>typeMult(m.type,derivedFor(id).types)>0);if(!hittable.length){const id=ids[Math.floor(Math.random()*ids.length)],dealt=struggleEnemy(e,id);if(!e.struggleWarned){log("⚠️ "+name(e.dex)+" no puede afectar al equipo y recurre a Forcejeo.");e.struggleWarned=true;}else log(name(e.dex)+" usa Forcejeo: "+Math.round(dealt)+" PS.");return;}
  const area=Math.random()<.25,targets=area?ids:[hittable[Math.floor(Math.random()*hittable.length)]];battleFx({kind:"attack",side:"enemy",sourceUid:e.uid,targetIds:targets,moveType:m.type,area});for(const id of targets){const t=run.team[id],p=js.pokemon[id],item=currentItem(p),itemId=p?.heldItem||null,d=derivedFor(id),dNoItem=item?derivedNoItem(p,id):d,mult=typeMult(m.type,d.types);if(mult<=0){battleFx({kind:"immune",side:"player",targetId:id});continue;}if(d.dodge&&Math.random()<d.dodge){if(itemId&&item?.dodge)recordItemContribution(id,itemId,"dodges",1);log("✨ "+name(p.dex)+" evita el ataque con su objeto.");battleFx({kind:"miss",side:"player",targetId:id});continue;}const def=cat==="special"?d.spDef:d.def,stab=e.stats.types.includes(m.type)?1.2:1,areaF=area?(e.boss?.62:.55):1,beforeHp=t.hp,raw=off*idlePower(m.power)*stab*mult*defenseFactor(def)*areaF*(.92+Math.random()*.16)*(1-(d.reduction||0))*(1-(t.guard||0))*(run.centerBuffRounds>0?Math.max(.72,1-.01*skillRank("e12")):1),actual=Math.min(beforeHp,Math.max(0,raw));t.hp-=raw;run.stats[id].damageTaken+=actual;battleFx({kind:"hit",side:"player",targetId:id,amount:actual,moveType:m.type,eff:mult});if(itemId&&item?.hp){const bufferBefore=Math.max(0,beforeHp-dNoItem.maxHp),bufferAfter=Math.max(0,Math.max(0,t.hp)-dNoItem.maxHp),absorbed=Math.max(0,bufferBefore-bufferAfter);if(absorbed>0)recordItemContribution(id,itemId,"mitigated",absorbed);}maybeMoveStatus(m,t,e.uid);if(t.hp<=0){if(d.survive&&Math.random()<d.survive){t.hp=1;if(itemId&&item?.survive)recordItemContribution(id,itemId,"survivals",1);log("🎗️ "+name(p.dex)+" resiste con 1 PS.");}else faint(id,"combate");}}
}
const J_BG_VIRTUAL_REAL_STEP=.10,J_BG_BATCH_REAL_SECONDS=30,J_BG_CPU_SLICE_MS=10,J_BG_MAX_BACKLOG_REAL=86400;
function johtoSimStep(dt){
  if(!run||run.paused||run.rewardPending)return false;dt=Math.max(0,Number(dt)||0);if(dt<=0)return true;
  if(teamWiped()){failRun();return false;}processStatus(dt);if(!run||teamWiped()){if(run)failRun();return false;}processAutoPotion();
  markCombatants();
  for(const id of battleIds()){
    if(!run)break;const t=run.team[id];if(!t?.alive)continue;if(t.guardTime>0){t.guardTime-=dt;if(t.guardTime<=0)t.guard=0;}if(t.hasteTime>0){t.hasteTime-=dt;if(t.hasteTime<=0)t.haste=0;}if(t.powerTime>0){t.powerTime-=dt;if(t.powerTime<=0)t.power=0;}if((t.autoPotionCooldown||0)>0)t.autoPotionCooldown=Math.max(0,t.autoPotionCooldown-dt);t.attackTimer-=dt;const target=livingEnemies()[0];if(t.attackTimer<=0&&target){playerAction(id);if(!run)break;t.attackTimer+=derivedFor(id).cd/(1+(t.haste||0))*(t.status?.type==="paralysis"?2:1);}
  }
  if(!run||run.paused||run.rewardPending)return false;
  const enemies=livingEnemies();if(enemies.length){for(const e of enemies){if(!run)break;e.attackTimer-=dt;if(e.attackTimer<=0){enemyAction(e);if(run&&e.alive)e.attackTimer+=e.stats.cd*(e.status?.type==="paralysis"?2:1);if(run&&teamWiped())break;}}}else{run.spawnDelay-=dt;if(run.spawnDelay<=0)spawnRound();}
  if(run&&!teamWiped())processAutoPotion();if(run&&teamWiped()){failRun();return false;}if(!backgroundCatchingUp)render();return !!run;
}
function johtoFlushBackground(){if(backgroundSaveDirty){backgroundSaveDirty=false;localStorage.setItem(SAVE,JSON.stringify(js));}if(!backgroundCatchingUp)render();}
function johtoRequiresBlockingCelebration(roll){
  if(!roll)return false;
  let rarity=String(roll.rar||"").toLowerCase();
  try{rarity=String(familyRarity(roll.fid,roll.dex)||rarity).toLowerCase();}catch(_){}
  const master=window.PokeSendaCapturePolicy?.requiresBlockingCelebration;
  return typeof master==="function"?!!master(roll,rarity):(!!roll.shiny||["legendary","mythical","singular"].includes(rarity)||!!roll.legendary||!!roll.mythical||!!roll.singular);
}
function johtoAutoResolveReward(realBudget){
  if(!run?.rewardPending||!js.options.autoOpen||skillRank("a2")<1||!reward)return{handled:false,spent:0,blocked:true};
  let spent=0;
  if(!reward.opened){if(realBudget<.35)return{handled:false,spent:0,blocked:false,needMore:true};spent+=.35;reward.opened=true;const activeIncense=reward.incenseType||null;if(activeIncense){const iid=incenseItemId(activeIncense);if(Number(js.inventory?.[iid]||0)>0){js.inventory[iid]--;if(js.inventory[iid]<=0)delete js.inventory[iid];}else reward.incenseType=null;}const winner=rollReward(reward.km,reward.incenseType||null);reward.roll=winner;save();finalizeReward(winner);if(johtoRequiresBlockingCelebration(winner))return{handled:false,spent,blocked:true};}
  if(reward?.roll&&johtoRequiresBlockingCelebration(reward.roll))return{handled:false,spent,blocked:true};
  const need=2.85;if(realBudget-spent<need)return{handled:false,spent,blocked:false,needMore:true};spent+=need;continueReward();return{handled:true,spent,blocked:false};
}
function johtoBackgroundBacklog(){return Math.max(0,Math.min(J_BG_MAX_BACKLOG_REAL,Math.max(Number(backgroundCarryReal)||0,run?Number(run.backgroundBacklogReal||0):0)));}
function johtoSetBackgroundBacklog(value){const safe=Math.max(0,Math.min(J_BG_MAX_BACKLOG_REAL,Number(value)||0));backgroundCarryReal=safe;if(run)run.backgroundBacklogReal=safe;return safe;}
function johtoQueueBackgroundGap(seconds){const add=Math.max(0,Number(seconds)||0);if(add<=.0001)return johtoBackgroundBacklog();backgroundDrainFaulted=false;return johtoSetBackgroundBacklog(johtoBackgroundBacklog()+add);}
function johtoSafeBackgroundRender(){if(document.hidden)return false;try{render();window.PokeSendaJohtoRuntime?.renderAll?.();return true}catch(e){console.error("PokéSenda · render de recuperación Johto",e);try{window.PokeSendaJohtoRuntime?.showGame?.();window.PokeSendaJohtoRuntime?.renderAll?.();}catch(_){}return false;}}
function johtoBackgroundCanAutoContinue(){if(!run)return !!(floatingAutoRestartPending&&js.options.autoRepeat);if(run.rewardPending){if(!js.options.autoOpen||!reward)return false;if(reward.roll&&johtoRequiresBlockingCelebration(reward.roll))return false;return true;}if(run.paused&&!run.centerPending&&!run.eventPending)return false;return true;}
function johtoScheduleBackgroundDrain(delay=0){if(backgroundDrainFaulted||backgroundDrainTimer||backgroundCatchingUp||document.hidden||floatingDriver)return;if(johtoBackgroundBacklog()<=.0001||!johtoBackgroundCanAutoContinue())return;backgroundDrainTimer=setTimeout(()=>{backgroundDrainTimer=null;johtoProcessBackgroundGap(0);},Math.max(0,Number(delay)||0));}
function johtoFinishBackgroundRecoveryNotice(){if(backgroundRecoveredTotal<1||document.hidden)return;const sec=backgroundRecoveredTotal;backgroundRecoveredTotal=0;window.PokeSendaJohtoRuntime?.backgroundRecovered?.(sec);}
function johtoProcessBackgroundGap(realGap){
  if(realGap>0)johtoQueueBackgroundGap(realGap);if(backgroundDrainFaulted||(document.hidden&&!floatingDriver))return 0;
  let total=johtoBackgroundBacklog();if(total<=.0001)return 0;johtoSetBackgroundBacklog(0);
  const batch=Math.min(total,J_BG_BATCH_REAL_SECONDS),tail=Math.max(0,total-batch);let budget=batch,processed=0,halted=false,terminal=false;const sliceStarted=performance.now();backgroundCatchingUp=true;
  try{
    while(budget>.0001){
      if(performance.now()-sliceStarted>=J_BG_CPU_SLICE_MS)break;
      if(!run){if(floatingAutoRestartPending&&js.options.autoRepeat){if(budget+.0001<.01)break;budget-=.01;processed+=.01;startRun();if(run){run.wallTickMs=Date.now();continue;}}terminal=!floatingAutoRestartPending;halted=true;break;}
      if(run.rewardPending){const ar=johtoAutoResolveReward(budget);if(ar.spent){budget-=ar.spent;processed+=ar.spent;}if(ar.needMore)break;if(ar.handled)continue;halted=true;break;}
      if(run.centerPending){const age=Math.max(0,(Date.now()-Number(run.centerPauseWallMs||Date.now()))/1000),need=Math.max(0,10-age);if(need<=.001){closeCenter();continue;}if(budget+.0001<need){if(tail+budget>=need)break;halted=true;break;}budget-=need;processed+=need;closeCenter();continue;}
      if(run.eventPending&&run.paused){const age=Math.max(0,(Date.now()-Number(run.eventPauseWallMs||Date.now()))/1000),need=Math.max(0,10-age);if(need<=.001){resolveRouteEvent("ignore");continue;}if(budget+.0001<need){if(tail+budget>=need)break;halted=true;break;}budget-=need;processed+=need;resolveRouteEvent("ignore");continue;}
      if(run.paused){halted=true;break;}
      const realStep=Math.min(J_BG_VIRTUAL_REAL_STEP,budget);johtoSimStep(realStep*Math.max(1,Number(run.speed||js.options.battleSpeed||1)));budget-=realStep;processed+=realStep;
    }
    const leftover=Math.max(0,tail+budget);if((run||floatingAutoRestartPending)&&leftover>.0001)johtoSetBackgroundBacklog(leftover);else johtoSetBackgroundBacklog(0);if(terminal)johtoSetBackgroundBacklog(0);backgroundRecoveredTotal+=processed;
  }catch(e){console.error("PokéSenda · fallo protegido en recuperación Johto",e);backgroundDrainFaulted=true;johtoSetBackgroundBacklog(0);backgroundRecoveredTotal=0;}
  finally{backgroundCatchingUp=false;if(backgroundSaveDirty){backgroundSaveDirty=false;localStorage.setItem(SAVE,JSON.stringify(js));}}
  if(run)run.wallTickMs=Date.now();johtoSafeBackgroundRender();if(!floatingDriver&&run&&!run.paused&&!run.rewardPending&&!run.centerPending&&!timer)schedule();const left=johtoBackgroundBacklog();if(left>.0001&&!halted&&!backgroundDrainFaulted)johtoScheduleBackgroundDrain(0);else if(left<=.0001)johtoFinishBackgroundRecoveryNotice();return processed;
}
function tick(){
  if(!run)return;const now=Date.now();if(document.hidden&&!floatingDriver)return;
  if(run.centerPending){const age=(now-Number(run.centerPauseWallMs||now))/1000;if(age>=10){const extra=Math.max(0,age-10);closeCenter();if(run&&extra>0)johtoProcessBackgroundGap(extra);}return;}
  if(run.eventPending&&run.paused){const age=(now-Number(run.eventPauseWallMs||now))/1000;if(age>=10){const extra=Math.max(0,age-10);resolveRouteEvent("ignore");if(run&&extra>0)johtoProcessBackgroundGap(extra);}return;}
  const last=Number(run.wallTickMs||now-100),realGap=Math.max(0,Math.min(J_BG_MAX_BACKLOG_REAL,(now-last)/1000));run.wallTickMs=now;
  if(run.paused||run.rewardPending){if(run.rewardPending&&js.options.autoOpen&&(realGap>.35||johtoBackgroundBacklog()>.001))johtoProcessBackgroundGap(realGap);return;}
  if(realGap>.35||johtoBackgroundBacklog()>.001){johtoProcessBackgroundGap(realGap);return;}
  const baseDt=Math.min(.25,realGap||.10);johtoSimStep(baseDt*Math.max(1,Number(run.speed||1)));
}
function schedule(){clearInterval(timer);timer=null;if(run&&!floatingDriver)timer=setInterval(tick,100);}
function queueAutoRestart(){floatingAutoRestartPending=true;backgroundAutoRestartWallMs=Date.now();if(floatingDriver)return;setTimeout(()=>{if(run||!floatingAutoRestartPending)return;if(!js.options.autoRepeat||skillRank("a3")<1||!formationIds().length){floatingAutoRestartPending=false;backgroundAutoRestartWallMs=0;return;}const started=Number(backgroundAutoRestartWallMs||Date.now()),overdue=Math.max(0,(Date.now()-started)/1000);startRun();if(run&&overdue>.35)johtoProcessBackgroundGap(overdue);},0);}

function log(s){if(!run)return;run.log=[s,...(run.log||[])].slice(0,24);if(backgroundCatchingUp)return;const legacy=document.getElementById("pkIsoJohtoRoot");if(legacy&&!legacy.classList.contains("hidden")){const host=$("pkIsoBattleLog");if(host)host.innerHTML=run.log.map(x=>"• "+x).join("<br>");}}
function killEnemy(e,killer){if(!e?.alive)return;e.alive=false;e.hp=0;if(killer&&run.stats[killer])run.stats[killer].kos++;run.roundXp+=e.xp;run.defeated++;js.stats.defeated++;const moneyPairs=battleIds().map(pid=>[pid,Number(derivedFor(pid).moneyBonus||0)]).sort((a,b)=>b[1]-a[1]),moneyHolder=moneyPairs[0]?.[0]||null,heldMoney=moneyPairs[0]?.[1]||0,baseMult=1+.025*skillRank("f1")+(skillRank("f8") ? 0.10 : 0)+(skillRank("trainer") ? 0.03 : 0),repeatMult=Number(currentRouteState()?.completions||0)>0?(e.boss?.50:.35):1,unit=(2+e.level*.72)*(e.boss?5:1)*repeatMult,baseMoney=Math.max(1,Math.round(unit*baseMult)),money=Math.max(1,Math.round(unit*(baseMult+heldMoney)));js.money=(js.money||0)+money;run.earned+=money;if(moneyHolder&&heldMoney>0){const itemId=js.pokemon?.[moneyHolder]?.heldItem,item=currentItem(js.pokemon?.[moneyHolder]);if(itemId&&item?.money)recordItemContribution(moneyHolder,itemId,"moneyBonus",Math.max(0,money-baseMoney));}tryHeldItemDrop(e);if(livingEnemies().length)return;awardRoundXp(e.boss);if(run.eventBattle){completeEventBattle();return;}if(e.boss)completeBoss();else{rollPotion();rollEvolution();finishNormalRound();}}
function awardRoundXp(isBoss=false){
  const party=run.partyIds.filter(id=>js.pokemon[id]&&run.team[id]?.alive);if(!party.length)return;const fought=new Set(run.roundCombatants.filter(id=>party.includes(id))),total=Math.max(party.length,Math.round(run.roundXp||0)),share=Math.max(1,Math.floor(total/party.length)),awards=[];
  for(const id of party){const p=js.pokemon[id],beforeLevel=Number(p.level||1),beforeXp=Number(p.xp||0),d=derivedFor(id),dNoItem=p.heldItem?derivedNoItem(p,id):d,rate=fought.has(id)?1:RESERVE_XP_RATE,amt=Math.max(1,Math.round(share*rate*(1+d.xpBoost))),amtNoItem=Math.max(1,Math.round(share*rate*(1+dNoItem.xpBoost)));grantXp(id,amt);awards.push({id,amount:amt,beforeLevel,beforeXp,afterLevel:Number(p.level||1),afterXp:Number(p.xp||0),inCombat:fought.has(id)});if(p.heldItem&&amt>amtNoItem)recordItemContribution(id,p.heldItem,"xpBonus",amt-amtNoItem);}
  log("✨ XP de ronda: "+total+" total · combate 100% · reserva 10%"+(isBoss?" · jefe":"")+".");run.roundXp=0;run.roundCombatants=[];
  // El cierre de ronda/evento/jefe guarda inmediatamente después. Evitamos una segunda serialización completa por oleada.
  if(!backgroundCatchingUp)window.PokeSendaJohtoRuntime?.onXpAwarded?.(awards,total);
}
function grantXp(id,amount){
  const p=js.pokemon[id];if(!p)return;p.friendship=Math.min(255,Number(p.friendship||70)+1);if(Number(p.level||1)>=MAX_LEVEL){p.level=MAX_LEVEL;p.xp=0;tryLinearEvolution(id);return;}
  p.xp=Math.max(0,Number(p.xp||0))+Math.max(0,Number(amount)||0);
  while(p.level<MAX_LEVEL&&p.xp>=xpNeed(p.level)){
    p.xp-=xpNeed(p.level);p.level++;p.skillPoints=Math.max(0,Number(p.skillPoints||0))+1;p.friendship=Math.min(255,Number(p.friendship||70)+2);
    log(name(p.dex)+" sube a Nv."+p.level+" y gana 1 punto de movimiento.");if(p.level>=MAX_LEVEL){p.xp=0;if(!p.maxLevelRelearnUsed)log("🔮 "+name(p.dex)+": Orbe de Reaprendizaje personal de Nv."+MAX_LEVEL+" desbloqueado.");break;}tryLinearEvolution(id);
  }
  tryLinearEvolution(id);
}

const pendingEvolutionPrompts=new Set();
function tyrogueAllowedTargets(){const trio=[106,107,237],missing=trio.filter(d=>{const id=johtoStandaloneTargetId("j_tyrogue",d);return id&&!js.pokemon?.[id];});return missing.length?missing:trio;}
function evolutionRequiredItems(edge){if(edge.method==="stone")return [edge.item];if(edge.method==="trade_item")return [edge.item,"link_cable"];return [];}
function evolutionTimeOK(method){const h=new Date().getHours();return method==="friendship_day"?(h>=6&&h<18):method==="friendship_night"?(h<6||h>=18):true;}
function evolutionReady(id,edge){const p=js.pokemon?.[id];if(!p||Number(edge.from)!==Number(p.dex))return false;if(edge.method==="level")return p.level>=Number(edge.level||999);if(edge.method==="stone")return Number(js.inventory?.[edge.item]||0)>0;if(edge.method==="trade_item")return Number(js.inventory?.[edge.item]||0)>0&&Number(js.inventory?.link_cable||0)>0;if(String(edge.method).startsWith("friendship"))return Number(p.friendship||0)>=220&&evolutionTimeOK(edge.method);if(edge.method==="choice_completion")return p.level>=Number(edge.level||20)&&tyrogueAllowedTargets().includes(Number(edge.to));return false;}
function evolutionOptions(id){const p=js.pokemon?.[id],f=fam(id);if(!p||!f)return[];return (f.evolutions||[]).filter(e=>Number(e.from)===Number(p.dex)).filter(e=>{const targetId=johtoStandaloneTargetId(id,e.to);return !targetId||!js.pokemon?.[targetId];}).map(e=>({...e,ready:evolutionReady(id,e),consume:evolutionRequiredItems(e)}));}
function applyEvolution(id,toDex){if(run&&!run.paused)return{ok:false,msg:"Pausa la expedición para evolucionar."};const p=js.pokemon?.[id],f=fam(id),edge=(f?.evolutions||[]).find(e=>Number(e.from)===Number(p?.dex)&&Number(e.to)===Number(toDex));if(!p||!edge||!evolutionReady(id,edge))return{ok:false,msg:"Todavía no cumple los requisitos de evolución."};const targetId=johtoStandaloneTargetId(id,toDex);if(targetId&&js.pokemon?.[targetId])return{ok:false,msg:name(toDex)+" ya forma parte de tu colección. Evoluciona esta copia hacia otra rama."};for(const itemId of evolutionRequiredItems(edge)){if(Number(js.inventory?.[itemId]||0)<=0)return{ok:false,msg:"Falta "+(materialItemDef(itemId)?.name||itemId)+"."};}
  const from=Number(p.dex),carryShiny=!!p.shinyEquipped&&johtoHasShinyDex(from);for(const itemId of evolutionRequiredItems(edge)){js.inventory[itemId]--;if(js.inventory[itemId]<=0)delete js.inventory[itemId];}
  if(targetId){const evolved=johtoCloneStandaloneProgress(p,targetId,Number(toDex));if(carryShiny){registerJohtoShinyDex(Number(toDex));evolved.shinyUnlocked=true;evolved.shinyEquipped=true;}else{evolved.shinyUnlocked=johtoHasShinyDex(Number(toDex));evolved.shinyEquipped=false;}js.pokemon[targetId]=evolved;delete js.pokemon[id];johtoRemapOwnedId(id,targetId);pendingEvolutionPrompts.delete(id);pendingEvolutionPrompts.delete(targetId);markJohtoDexNew(Number(toDex));if(run?.team?.[targetId])refreshCombatant(targetId);const branchDone=johtoBranchComplete(id),promotedBase=branchDone?null:johtoPromoteLegacyBranchBase(id);if(branchDone)johtoRetireCompletedBranchRoot(id);johtoSyncBranchCandyMirrors(id);save();log("✨ Evolución: "+name(from)+" → "+name(toDex)+". "+name(toDex)+" queda como Pokémon independiente."+(promotedBase?" Otra copia de "+name(promotedBase.dex)+" quedó disponible en la Caja.":branchDone?" Rama completada: las capturas futuras de esta familia serán caramelos compartidos.":""));return{ok:true,from,to:Number(toDex),id:targetId,independent:true};}
  p.dex=Number(toDex);if(carryShiny){registerJohtoShinyDex(p.dex);p.shinyUnlocked=true;p.shinyEquipped=true;}else p.shinyEquipped=false;p.evolutionPromptLevel=0;pendingEvolutionPrompts.delete(id);markJohtoDexNew(p.dex);const stage=Math.max(0,(f.members||[]).indexOf(Number(p.dex))),moves=DATA().movesets?.[id]||[];p.moveRanks=Array.isArray(p.moveRanks)?p.moveRanks:[1,0,0,1];while(p.moveRanks.length<4)p.moveRanks.push(0);moves.forEach((m,i)=>{if((m.kind==="support"||Number(m.unlockStage||0)<=stage)&&Number(p.moveRanks[i]||0)<=0)p.moveRanks[i]=1;});if(run?.team[id])refreshCombatant(id);save();log("✨ Evolución: "+name(from)+" → "+name(toDex)+".");tryLinearEvolution(id);return{ok:true,from,to:Number(toDex),id};
}
function tryLinearEvolution(id){
  const p=js.pokemon?.[id],opts=evolutionOptions(id).filter(e=>e.ready&&(e.method==="level"||e.method==="choice_completion"||String(e.method||"").startsWith("friendship")));if(!p||!opts.length)return false;
  if(pendingEvolutionPrompts.has(id))return false;
  if(Number(p.evolutionPromptLevel||0)===Number(p.level||0))return false;
  const cb=window.PokeSendaJohtoRuntime?.onEvolutionReady;if(typeof cb!=="function")return false;
  const resumeAfter=!!run&&!run.paused&&!run.rewardPending&&!run.centerPending;
  let accepted=false;try{accepted=cb(id,opts.map(e=>Number(e.to)),{resumeAfter,source:backgroundCatchingUp?"background":"xp"})!==false;}catch(e){console.error("PokéSenda · cola de evolución Johto",e);accepted=false;}
  // Si la UI no pudo aceptar la solicitud, no se pausa la expedición.
  if(!accepted)return false;
  pendingEvolutionPrompts.add(id);p.evolutionPromptLevel=Number(p.level||0);if(run&&!run.paused)run.paused=true;save();return true;
}
function finishNormalRound(){
  for(const id of battleIds()){const t=run.team[id];if(!t?.alive)continue;const p=js.pokemon[id],d=derivedFor(id),item=currentItem(p),itemId=p?.heldItem||null,before=t.hp;t.hp=Math.min(t.maxHp,t.hp+d.roundHeal*t.maxHp);const healed=t.hp-before;if(healed>0){run.stats[id].healing+=healed;battleFx({kind:"heal",side:"player",targetId:id,amount:healed});if(itemId&&item?.roundHeal&&d.roundHeal>0)recordItemContribution(id,itemId,"healing",healed*((item.roundHeal||0)/d.roundHeal));}}
  rollGeneral();if(skillRank("f14")&&Math.random()<.06){rollGeneral();rollEvolution(1);log("✨ Doble Hallazgo activado.");}
  if((run.centerBuffRounds||0)>0)run.centerBuffRounds--;
  const old=run.distance,base=24+Math.floor(Math.random()*14),meters=Math.max(1,Math.round(base*(1+.007*skillRank("e2")+.005*skillRank("e13")))),target=Math.min(MAX_DISTANCE,old+meters),nextBoss=Math.min(MAX_DISTANCE,(Math.floor(old/1000)+1)*1000),center=POKEMON_CENTERS.find(c=>c>old&&c<=target&&!run.centersVisited.includes(c));
  if(center&&center<nextBoss){run.distance=center;openCenter(center);return;}
  if(old<nextBoss&&target>=nextBoss){run.distance=nextBoss;run.pendingBoss=true;run.spawnDelay=.7;log("Llegaste a "+nextBoss+" m. El jefe protege el Gachapon.");render();return;}
  if(center){run.distance=center;openCenter(center);return;}
  run.distance=target;run.spawnDelay=.55;currentRouteState().bestDistance=Math.max(currentRouteState().bestDistance,run.distance);save();render();if(tryRouteEvent())return;
}
function fullHeal(){for(const id of run.partyIds){const t=run.team[id],d=derivedFor(id);t.maxHp=d.maxHp;t.hp=d.maxHp;t.alive=true;t.attackTimer=.35;t.status=null;t.confusion=0;t.guard=0;t.haste=0;t.power=0;t.supportAttackDebt=0;}}
function openCenter(m){
  fullHeal();const rs=currentRouteState(),first=!rs.centersSeen.includes(m);if(first)rs.centersSeen.push(m);if(!run.centersVisited.includes(m))run.centersVisited.push(m);rs.checkpoint=Math.max(rs.checkpoint,m);run.centerBuffRounds=20;run.centerPending=true;run.paused=true;run.centerPauseWallMs=first?Date.now():0;save();render();
  if(!first){run.centerPending=false;run.paused=false;run.spawnDelay=.35;return;}
  centerDeadline=performance.now()+10000;clearInterval(centerTimer);centerTimer=setInterval(updateCenterTimer,100);if(window.PokeSendaJohtoRuntime?.onCenterOpen)window.PokeSendaJohtoRuntime.onCenterOpen(m,centerDeadline);else{$("pkIsoCenterTitle").textContent="Centro Pokémon · "+m.toLocaleString("es-CL")+" m";$("pkIsoCenterText").textContent="Todo el equipo fue curado y revivido. Este Centro queda desbloqueado como checkpoint de seguridad.";$("pkIsoCenterOverlay").classList.remove("hidden");}updateCenterTimer();
}
function updateCenterTimer(){if(!run?.centerPending)return clearInterval(centerTimer);const left=Math.max(0,centerDeadline-performance.now());if(window.PokeSendaJohtoRuntime?.onCenterTick)window.PokeSendaJohtoRuntime.onCenterTick(left);else{$("pkIsoCenterTimerText").textContent=(left/1000).toFixed(1)+" s";$("pkIsoCenterTimerFill").style.width=(left/10000*100)+"%";}if(left<=0){const overdue=Math.max(0,(performance.now()-centerDeadline)/1000);closeCenter();if(overdue>.35&&run)johtoProcessBackgroundGap(overdue);}}
function closeCenter(){clearInterval(centerTimer);centerTimer=null;if(window.PokeSendaJohtoRuntime?.onCenterClose)window.PokeSendaJohtoRuntime.onCenterClose();else $("pkIsoCenterOverlay").classList.add("hidden");if(!run)return;run.centerPending=false;run.centerPauseWallMs=0;run.paused=false;run.wallTickMs=Date.now();run.spawnDelay=.7;render();}
function completeBoss(){
  const km=Math.max(1,Math.min(10,Math.round(run.distance/1000)));
  if(skillRank("e7"))for(const t of Object.values(run.team||{})){if(t?.alive)t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.20);}
  run.bossActive=false;run.rewardPending=true;run.paused=true;currentRouteState().bosses++;rollGeneral();rollPotion();rollEvolution(3);rollRelearningOrbDrop(km===10?"routeFinal":"boss",km);save();showReward(km);
}

/* ============================================================
   GACHAPON PREMIUM / SHINY · PARIDAD KANTO
   ============================================================ */
const PREMIUM_INTERVAL_MS=8*60*60*1000;
const PREMIUM_BUY_COST=250000;
const PREMIUM_RARITY_CHANCE={common:0,uncommon:.22,rare:.48,epic:.28,legendary:.02};

function premiumUnlocked(){return skillRank("a15")>=1;}
function premiumEnsureUnlocked(){if(!js)migrate();if(!premiumUnlocked())return false;const tg=js.timedGacha;if(!tg.unlockedAt){tg.unlockedAt=Date.now();tg.giftReady=true;tg.cycleStartMs=0;save();}return true;}
function premiumPoolGroups(){
  // V36.78 · Premium/8h de Johto usa los pools COMPLETOS (km 10) de todas las rutas
  // ya desbloqueadas. Antes llamaba rewardPools() sin km y heredaba el tramo km 1 de
  // la ruta actual; con la Pokédex progresiva eso podía dejar solo el starter como
  // única familia no-Común y convertir toda la ruleta Premium en un solo Pokémon.
  const groups={uncommon:[],rare:[],epic:[],legendary:[]},routes=DATA().routes||{},unlocked=(js?.unlockedRoutes||["johto_route1"]).filter(id=>routes[id]);
  for(const routeId of unlocked){
    const route=routes[routeId]||{};
    for(const rar of Object.keys(groups))for(const fid of route.gachaByRarity?.[rar]||[])if(fid&&!groups[rar].includes(fid))groups[rar].push(fid);
    const starter=starterForRoute(js?.starter,routeId);if(starter&&!groups.rare.includes(starter))groups.rare.push(starter);
  }
  return groups;
}
function premiumAvailableRarities(){
  const groups=premiumPoolGroups();
  return Object.keys(groups).filter(r=>groups[r]?.length&&PREMIUM_RARITY_CHANCE[r]>0);
}
function premiumPickRarity(){
  const available=premiumAvailableRarities();if(!available.length)return null;
  const weights=available.map(r=>PREMIUM_RARITY_CHANCE[r]||0),total=weights.reduce((a,b)=>a+b,0);let x=Math.random()*total;
  for(let i=0;i<available.length;i++){x-=weights[i];if(x<=0)return available[i];}return available.at(-1);
}
function premiumShinyDexSet(){return new Set(johtoShinyDexSet());}
function premiumMakeRoll(forceShiny=false,wantedRarity=null){if(!js)migrate();const groups=premiumPoolGroups(),rar=wantedRarity&&groups[wantedRarity]?.length?wantedRarity:premiumPickRarity();if(!rar)return null;const arr=groups[rar],fid=arr[Math.floor(Math.random()*arr.length)],level=Math.min(25,Math.max(1,19+Math.floor(Math.random()*4))),dex=captureDex(fid,level);let shiny=forceShiny||Math.random()<(1/2048)*shinyRelativeMult(),roll={source:"premium",rar,fid,level,dex,shiny};if(shiny){const owned=premiumShinyDexSet();if(owned.has(Number(dex))){let choices=[];for(const r of [rar,...Object.keys(groups).filter(x=>x!==rar)]){choices=(groups[r]||[]).map(id=>{const lv=Math.min(25,Math.max(1,19+Math.floor(Math.random()*4))),dx=captureDex(id,lv);return{source:"premium",rar:r,fid:id,level:lv,dex:dx,shiny:true};}).filter(x=>!owned.has(Number(x.dex)));if(choices.length)break;}if(choices.length)roll=choices[Math.floor(Math.random()*choices.length)];else if(!forceShiny)roll.shiny=false;}}return roll;}
function premiumRoulette(finalRoll){
  const before=92,after=30,entries=[],recent=[];
  const next=()=>{let x=premiumMakeRoll(false);for(let tries=0;tries<14&&x&&recent.includes(x.fid);tries++){const n=premiumMakeRoll(false);if(n)x=n;}if(x){recent.push(x.fid);while(recent.length>2)recent.shift();}return x||{...finalRoll};};
  for(let i=0;i<before;i++)entries.push(next());
  entries.push({...finalRoll,winner:true});recent.length=0;recent.push(finalRoll.fid);
  for(let i=0;i<after;i++)entries.push(next());
  const order={common:0,uncommon:1,rare:2,epic:3,legendary:4};
  if(Math.random()<.76){
    const groups=premiumPoolGroups(),better=Object.keys(groups).filter(r=>groups[r]?.length&&order[r]>order[finalRoll.rar]);
    if(better.length){
      const br=better[Math.floor(Math.random()*better.length)],bait=premiumMakeRoll(false,br),offset=[-2,-1,1,2][Math.floor(Math.random()*4)],idx=before+offset;
      if(bait&&idx>=0&&idx<entries.length)entries[idx]={...bait,bait:true};
    }
  }
  return {entries,targetIndex:before};
}
function premiumPhase(now){ensureJohtoState();if(!premiumUnlocked())return {kind:"locked",progress:0,remaining:PREMIUM_INTERVAL_MS};premiumEnsureUnlocked();const tg=js.timedGacha;if(tg.pending)return {kind:"pending",progress:1,remaining:0};if(tg.giftReady)return {kind:"ready",gift:true,progress:1,remaining:0};if(!tg.cycleStartMs)return {kind:"sync",progress:0,remaining:PREMIUM_INTERVAL_MS};const elapsed=Math.max(0,Number(now||Date.now())-Number(tg.cycleStartMs||0));if(elapsed<PREMIUM_INTERVAL_MS)return {kind:"charging",progress:Math.min(1,elapsed/PREMIUM_INTERVAL_MS),remaining:PREMIUM_INTERVAL_MS-elapsed};return {kind:"ready",gift:false,progress:1,remaining:0};}
function premiumPrepare(source,now=Date.now()){
  migrate();if(!premiumUnlocked()&&["free","paid"].includes(source))return {ok:false,msg:"Desbloquea Gachapon Programado en el Árbol."};premiumEnsureUnlocked();const tg=js.timedGacha;
  if(source==="paid"){if(tg.purchasedPending)return {ok:true,source,roll:JSON.parse(JSON.stringify(tg.purchasedPending)),pending:true};if((js.money||0)<PREMIUM_BUY_COST)return {ok:false,msg:"Necesitas ₽"+PREMIUM_BUY_COST.toLocaleString("es-CL")};const roll=premiumMakeRoll(false);if(!roll)return {ok:false,msg:"Pool Premium vacío."};js.money-=PREMIUM_BUY_COST;tg.purchasedSpent+=PREMIUM_BUY_COST;tg.purchasedPending=roll;save();return {ok:true,source,roll:JSON.parse(JSON.stringify(roll)),purchased:true};}
  if(source==="free"){if(tg.pending)return {ok:true,source,roll:JSON.parse(JSON.stringify(tg.pending)),pending:true};let phase;if(tg.giftReady)phase={kind:"ready",gift:true};else if(!tg.cycleStartMs)phase={kind:"sync"};else{const elapsed=Math.max(0,Number(now||Date.now())-Number(tg.cycleStartMs||0));phase=elapsed>=PREMIUM_INTERVAL_MS?{kind:"ready",gift:false}:{kind:"charging"};}if(phase.kind!=="ready")return {ok:false,msg:phase.kind==="charging"?"El Gachapon Premium todavía se está cargando.":"Aún no está disponible."};const roll=premiumMakeRoll(false);if(!roll)return {ok:false,msg:"Pool Premium vacío."};tg.pending=roll;if(phase.gift)tg.giftReady=false;save();return {ok:true,source,roll:JSON.parse(JSON.stringify(roll)),gift:!!phase.gift};}
  if(source==="achievement"){if((js.achievements?.premiumTickets||0)<=0)return {ok:false,msg:"No tienes Tickets Premium."};if(!tg.achievementPending)tg.achievementPending=premiumMakeRoll(false);save();return {ok:true,source,roll:JSON.parse(JSON.stringify(tg.achievementPending))};}
  if(source==="shinyAchievement"){if((js.achievements?.shinyTickets||0)<=0)return {ok:false,msg:"No tienes Tickets Shiny."};if(!tg.shinyPending)tg.shinyPending=premiumMakeRoll(true);save();return {ok:true,source,roll:JSON.parse(JSON.stringify(tg.shinyPending))};}
  if(source==="devGift"){if(!tg.devGiftPending)tg.devGiftPending=premiumMakeRoll(false);if(!tg.devGiftPending)return {ok:false,msg:"Pool Premium vacío."};save();return {ok:true,source,roll:JSON.parse(JSON.stringify(tg.devGiftPending))};}
  return {ok:false,msg:"Fuente Premium desconocida."};
}
function premiumCapture(source,roll,now=Date.now()){
  migrate();if(!roll?.fid||!fam(roll.fid))return {ok:false,msg:"Recompensa Premium inválida."};const tg=js.timedGacha;let expected=null;if(source==="free")expected=tg.pending;else if(source==="paid")expected=tg.purchasedPending;else if(source==="achievement")expected=tg.achievementPending;else if(source==="shinyAchievement")expected=tg.shinyPending;else if(source==="devGift")expected=tg.devGiftPending;if(!expected)return {ok:false,msg:"No hay una recompensa Premium pendiente para capturar."};
  roll=JSON.parse(JSON.stringify(expected));const captured=johtoRegisterCapturedPokemon(roll.fid,roll.dex,roll.level,roll.rar,!!roll.shiny),p=captured.p,fresh=captured.fresh,candies=captured.candies,promoted=captured.promoted,reserved=null;
  markJohtoDexNew(Number(roll.dex));const legendary=familyRarity(roll.fid)==="legendary"||roll.rar==="legendary",legendaryBonus=legendary?grantJohtoLegendaryCaptureBonus():null,outcome=fresh?'Nueva familia obtenida':promoted?('Forma superior obtenida · '+name(roll.dex)):('Duplicado · +'+candies+' caramelos');recordJohtoCapture({fid:roll.fid,dex:roll.dex,level:roll.level,rarity:familyRarity(roll.fid,roll.dex),outcome,source:premiumCaptureSourceLabel(source),shiny:!!roll.shiny});
  if(source!=="devGift"){tg.claimed++;js.premiumStats.total++;}if(source==="free"){tg.pending=null;tg.cycleStartMs=Number(now||Date.now());js.premiumStats.free++;}else if(source==="paid"){tg.purchasedPending=null;tg.purchasedClaimed++;js.premiumStats.paid++;}else if(source==="achievement"){js.achievements.premiumTickets=Math.max(0,Number(js.achievements.premiumTickets||0)-1);tg.achievementPending=null;js.premiumStats.tickets++;}else if(source==="shinyAchievement"){js.achievements.shinyTickets=Math.max(0,Number(js.achievements.shinyTickets||0)-1);tg.shinyPending=null;js.premiumStats.shinyTickets++;}else if(source==="devGift"){tg.devGiftPending=null;}save();return {ok:true,roll:JSON.parse(JSON.stringify(roll)),pokemon:JSON.parse(JSON.stringify(p)),fresh,candies,promoted:!!promoted,reserved:!!reserved,legendaryBonus};
}

function johtoGachaDepthTier(km=1){km=Math.max(1,Math.min(10,Math.floor(Number(km)||1)));return km<=3?1:km<=6?2:km<=9?3:4;}
function johtoProgressiveRewardPools(route,km=1){
  const order=["common","uncommon","rare","epic","legendary"],full={};for(const r of order)full[r]=[...(route?.gachaByRarity?.[r]||[])];
  const tier=johtoGachaDepthTier(km),o={common:[],uncommon:[],rare:[],epic:[],legendary:[]};
  if(tier>=4){for(const r of order)o[r]=[...full[r]];return o;}
  const regular=[];for(const r of ["common","uncommon","rare","epic"])for(const fid of full[r])regular.push({fid,rarity:r});
  const limit=tier===1?Math.ceil(regular.length/3):tier===2?Math.ceil(regular.length*2/3):regular.length;
  for(const x of regular.slice(0,limit))o[x.rarity].push(x.fid);
  return o;
}
function rewardPools(km=1){const rid=currentRouteId(),r=currentRouteDef(),o=johtoProgressiveRewardPools(r,km);o.rare=Array.isArray(o.rare)?o.rare:[];const s=starterForRoute(js.starter,rid);if(s&&!o.rare.includes(s))o.rare.push(s);return o;}
function pick(items,weights){if(!items?.length)return null;let total=(weights||[]).reduce((a,b)=>a+Math.max(0,Number(b)||0),0);if(total<=0)return items[Math.floor(Math.random()*items.length)];let x=Math.random()*total;for(let i=0;i<items.length;i++){x-=Math.max(0,Number(weights[i])||0);if(x<=0)return items[i];}return items.at(-1);}
function rollReward(km,incenseType=null){
  const p=rewardPools(km),route=currentRouteDef(),rareBoost=1+.02*skillRank("f6"),endBoost=1+.02*skillRank("f13"),rw=DATA().drops?.[route.dropProfile]?.rarityWeights||{common:63.46,uncommon:24,rare:10,epic:2.5,legendary:.04},order=["common","uncommon","rare","epic","legendary"],rawWeights={common:Number(rw.common||0),uncommon:Number(rw.uncommon||0),rare:Number(rw.rare||0)*rareBoost,epic:Number(rw.epic||0)*rareBoost*endBoost,legendary:Number(rw.legendary||0)*rareBoost*endBoost},available=order.filter(r=>(p[r]||[]).length&&rawWeights[r]>0),rar=pick(available,available.map(r=>rawWeights[r])),arr=p[rar]||p.common||[],fw=arr.map(fid=>incenseType&&familyMatchesType(fid,incenseType)?INCENSE_WEIGHT_MULT:1),fid=pick(arr,fw),level=Math.min(Number(route.finalBossLevel||MAX_LEVEL),Math.max(1,Number(route.levelBase||1)+(km-1)*2+Math.floor(Math.random()*4))),dex=captureDex(fid,level),shiny=Math.random()<(1/1536)*shinyRelativeMult();
  return{km,rar,fid,level,dex,shiny,incenseType:incenseType||null};
}
function johtoNaturalCaptureDexes(fid,level){
  const f=fam(fid),root=Number(f?.members?.[0]||152),out=[root],seen=new Set(out),q=[root];
  while(q.length){const from=q.shift();for(const e of f?.evolutions||[]){if(e.method!=="level"||Number(e.from)!==from||level<Number(e.level||999))continue;const to=Number(e.to);if(!seen.has(to)){seen.add(to);out.push(to);q.push(to);}}}
  return out;
}
function captureDex(fid,level){
  const natural=johtoNaturalCaptureDexes(fid,level);if(natural.length<=1)return Number(natural[0]||fam(fid)?.members?.[0]||152);
  const highest=natural[natural.length-1],r=Math.random();if(r<.34)return Number(natural[0]);if(natural.length>=3&&r<.52)return Number(natural[natural.length-2]);if(r<.86)return Number(highest);return Number(natural[Math.floor(Math.random()*natural.length)]);
}
function johtoAutoOpenReward(){
  if(!reward||reward.opened||!js.options.autoOpen||skillRank("a2")<1)return false;
  reward.opened=true;
  const incenseType=reward.incenseType||null;
  if(incenseType){const iid=incenseItemId(incenseType);if(Number(js.inventory?.[iid]||0)>0){js.inventory[iid]--;if(js.inventory[iid]<=0)delete js.inventory[iid];}else reward.incenseType=null;}
  const activeIncense=reward.incenseType||null,winner=rollReward(reward.km,activeIncense);reward.roll=winner;save();
  finalizeReward(winner);return true;
}
function showReward(km){
  reward={km,roll:null,opened:false};
  if(window.PokeSendaJohtoRuntime?.onRewardReady){window.PokeSendaJohtoRuntime.onRewardReady(km);if(js.options.autoOpen&&skillRank("a2")>=1)setTimeout(johtoAutoOpenReward,0);return;}
  document.querySelectorAll("#pkIsoJohtoRoot .pk-iso-panel").forEach(x=>x.classList.add("hidden"));$("pkIsoBattleReward").classList.remove("hidden");$("pkIsoRewardKicker").textContent="🎰 GACHAPON · KM "+km;$("pkIsoRewardTitle").textContent=km===10?"Jefe final derrotado":"Jefe del km "+km+" derrotado";$("pkIsoRewardSubtitle").textContent="Como en Kanto, cada jefe de kilómetro protege una recompensa.";$("pkIsoRewardClosed").classList.remove("hidden");$("pkIsoRouletteWrap").classList.add("hidden");$("pkIsoBattleRewardCard").classList.add("hidden");$("pkIsoBattleRewardContinue").classList.add("hidden");$("pkIsoRouletteStrip").style.transform="translateX(0)";
  if(js.options.autoOpen&&skillRank("a2")>=1)setTimeout(johtoAutoOpenReward,0);
}
function openReward(){
  if(!reward||reward.opened)return;
  reward.opened=true;
  const incenseType=reward.incenseType||null;
  if(incenseType){const iid=incenseItemId(incenseType);if(Number(js.inventory?.[iid]||0)>0){js.inventory[iid]--;if(js.inventory[iid]<=0)delete js.inventory[iid];}else reward.incenseType=null;}
  const activeIncense=reward.incenseType||null,winner=rollReward(reward.km,activeIncense),before=92,after=30,entries=[],recent=[];
  const nextVisual=()=>{let x=rollReward(reward.km,activeIncense);for(let tries=0;tries<14&&x&&recent.includes(x.fid);tries++){const n=rollReward(reward.km,activeIncense);if(n)x=n;}if(x){recent.push(x.fid);while(recent.length>2)recent.shift();}return x||{...winner};};
  for(let i=0;i<before;i++)entries.push(nextVisual());
  entries.push({...winner,winner:true});recent.length=0;recent.push(winner.fid);
  for(let i=0;i<after;i++)entries.push(nextVisual());
  const order={common:0,uncommon:1,rare:2,epic:3,legendary:4};
  if(Math.random()<.68){
    const better=entries.map((x,i)=>({x,i})).filter(o=>o.i!==before&&order[o.x?.rar]>order[winner.rar]);
    if(better.length){const pickBait=better[Math.floor(Math.random()*better.length)].x,offset=[-2,-1,1,2][Math.floor(Math.random()*4)],idx=before+offset;if(idx>=0&&idx<entries.length)entries[idx]={...pickBait,bait:true};}
  }
  reward.roll=winner;save();
  if(window.PokeSendaJohtoRuntime?.onRewardRoll){window.PokeSendaJohtoRuntime.onRewardRoll(entries,winner);setTimeout(()=>finalizeReward(winner),5800);return;}
  $("pkIsoRewardClosed").classList.add("hidden");$("pkIsoRouletteWrap").classList.remove("hidden");const strip=$("pkIsoRouletteStrip"),wrap=$("pkIsoRouletteWrap");
  strip.innerHTML=entries.map((x,i)=>'<div class="pk-iso-roll-entry '+(i===before?'winner ':'')+(x.bait?'bait-card':'')+'"><img src="'+gif(x.dex,false,x.shiny)+'"><b>'+name(x.dex)+'</b><small>'+x.rar+'</small></div>').join("");
  requestAnimationFrame(()=>{const cardW=88,gap=6,startOffset=wrap.clientWidth/2-cardW/2,targetOffset=wrap.clientWidth/2-(before*(cardW+gap)+cardW/2),fastOffset=targetOffset+2350;strip.style.transition="none";strip.style.transform='translateX('+startOffset+'px)';requestAnimationFrame(()=>{strip.style.transition="transform 3.35s linear";strip.style.transform='translateX('+fastOffset+'px)';setTimeout(()=>{strip.style.transition="transform 2.35s cubic-bezier(.08,.70,.10,1)";strip.style.transform='translateX('+targetOffset+'px)';},3350);});});
  setTimeout(()=>finalizeReward(winner),5800);
}
function finalizeReward(r){
  const captured=johtoRegisterCapturedPokemon(r.fid,r.dex,r.level,r.rar,!!r.shiny),p=captured.p,fresh=captured.fresh,candies=captured.candies,promoted=captured.promoted,reserved=null;
  markJohtoDexNew(r.dex);const legendary=familyRarity(r.fid)==="legendary"||r.rar==="legendary",legendaryBonus=legendary?grantJohtoLegendaryCaptureBonus():null,outcome=fresh?'Nueva familia obtenida':promoted?('Forma superior obtenida · '+name(r.dex)):('Duplicado · +'+candies+' caramelos');js.totalChests=(js.totalChests||0)+1;recordJohtoCapture({fid:r.fid,dex:r.dex,level:r.level,rarity:familyRarity(r.fid,r.dex),outcome,source:(reward?.devGift?'Gachapon regalado · ':'')+currentRouteDef().name+' · Km '+Number(r.km||0),shiny:!!r.shiny});save();
  if(window.PokeSendaJohtoRuntime?.onRewardFinalized){window.PokeSendaJohtoRuntime.onRewardFinalized({roll:r,pokemon:JSON.parse(JSON.stringify(p)),fresh,candies,promoted:!!promoted,reserved:!!reserved,legendaryBonus});return;}
  reward={...r,p,fresh,candies,promoted:!!promoted,reserved:!!reserved,legendaryBonus};document.querySelectorAll("#pkIsoJohtoRoot .pk-iso-panel").forEach(x=>x.classList.add("hidden"));$("pkIsoBattleReward").classList.remove("hidden");
}
function continueReward(){
  if(!reward)return;const km=reward.km,isEnd=km===10;reward=null;if(window.PokeSendaJohtoRuntime?.onRewardClose)window.PokeSendaJohtoRuntime.onRewardClose();else $("pkIsoBattleReward").classList.add("hidden");
  if(!run){if(window.PokeSendaJohtoRuntime?.showLobby)window.PokeSendaJohtoRuntime.showLobby();else API()?.open?.();return;}
  run.rewardPending=false;run.paused=false;
  if(isEnd){completeRoute();return;}
  if(POKEMON_CENTERS.includes(run.distance)&&!run.centersVisited.includes(run.distance)){openCenter(run.distance);return;}
  run.spawnDelay=.9;openBattle();render();
}
function completeRoute(){
  const rid=currentRouteId(),rs=currentRouteState(),beforeCompletions=Number(rs.completions||0),casinoBefore=!!ensureJohtoCasinoState().unlocked;
  rs.completions=beforeCompletions+1;
  let casinoJustUnlocked=false;if(rid==="johto_route2"){const c=ensureJohtoCasinoState();casinoJustUnlocked=!casinoBefore||beforeCompletions===0;c.unlocked=true;}
  rs.bestDistance=MAX_DISTANCE;if(rs.farmCheckpoint===null||rs.farmCheckpoint===undefined||rs.farmCheckpoint==="auto")rs.farmCheckpoint=0;rs.checkpoint=routeStartPoint();
  const fullFromZero=Number(run?.startDistance||0)===0;if(fullFromZero&&!johtoMtGachaPoolCompleted())js.mtGacha.tickets=Math.max(0,Number(js.mtGacha.tickets||0))+1;
  const idx=JOHTO_ROUTE_ORDER.indexOf(rid),next=JOHTO_ROUTE_ORDER[idx+1];let unlockedNext=null;
  if(next&&!js.unlockedRoutes.includes(next)){js.unlockedRoutes.push(next);unlockedNext={id:next,name:DATA().routes?.[next]?.name||next};}
  pushHistory("Completada",MAX_DISTANCE,{mtTicket:fullFromZero});save();const auto=!!js.options.autoRepeat&&skillRank("a3")>=1&&formationIds().length>0;run=null;
  if(unlockedNext)window.PokeSendaJohtoRuntime?.onRouteUnlocked?.(unlockedNext);
  if(casinoJustUnlocked)window.PokeSendaJohtoRuntime?.onCasinoUnlocked?.();
  if(auto){queueAutoRestart();return;}if(window.PokeSendaJohtoRuntime?.showGame)window.PokeSendaJohtoRuntime.showGame();else if(window.PokeSendaJohtoRuntime?.showLobby)window.PokeSendaJohtoRuntime.showLobby();else API()?.open?.();
}
function rollPotion(){
  const mult=(1+.05*skillRank("f10"))*(skillRank("f8")?1.10:1);if(Math.random()>=currentDropProfile().potionDropChance*mult)return;
  const r=Math.random(),id=r<.64?"potion":r<.87?"super_potion":r<.96?"hyper_potion":"full_heal";grantItem(id);
}
function rollEvolution(mult=1){
  const dp=currentDropProfile(),skill=(1+.06*skillRank("f11"))*(skillRank("f8")?1.10:1);if(Math.random()>=dp.evolutionDropChance*mult*skill)return;
  const e=Object.entries(dp.evolutionWeights||{}),id=pick(e.map(x=>x[0]),e.map(x=>Number(x[1])||0));if(id)grantItem(id);
}
function rollRelearningOrbDrop(kind="boss",km=1){
  let chance=.0003;if(kind==="routeFinal")chance=.0015;if(Math.random()>=chance)return false;return grantItem("relearning_orb");
}
function rollItemRarity(){
  const dp=currentDropProfile(),quality=skillRank("f5"),base=dp.rarityWeights||{common:70,uncommon:23,rare:6,epic:.9,legendary:.1},entries=Object.entries(base).map(([id,w])=>[id,Number(w||0)*(id==="common"?Math.max(.55,1-quality*.03):(1+quality*.045))]),total=entries.reduce((s,x)=>s+x[1],0);let x=Math.random()*Math.max(.0001,total);for(const [id,w] of entries){x-=w;if(x<=0)return id;}return "common";
}
function rollGeneral(){
  const dp=currentDropProfile(),mult=1+.025*skillRank("f3")+(skillRank("f8") ? 0.10 : 0);if(Math.random()>=dp.generalDropChance*mult)return false;
  const rarity=rollItemRarity(),valid=Object.entries(EXTRA.itemDefs).filter(([_,it])=>!it.consumable&&!it.evolutionStone&&!it.tradeOnly&&!it.specialReward),pool=valid.filter(([_,it])=>it.rarity===rarity),use=pool.length?pool:valid.filter(([_,it])=>it.rarity==="common").length?valid.filter(([_,it])=>it.rarity==="common"):valid;if(!use.length)return false;return grantItem(use[Math.floor(Math.random()*use.length)][0]);
}
function rollHeldDrop(){
  const dp=currentDropProfile(),mult=1+.035*skillRank("f4")+(skillRank("f8") ? 0.10 : 0);if(Math.random()>=dp.heldItemDropChance*mult)return;
  const ids=Object.keys(EXTRA.itemDefs).filter(id=>{const it=EXTRA.itemDefs[id];return !it.consumable&&!it.evolutionStone&&!it.tradeOnly&&!it.specialReward;});if(ids.length)grantItem(ids[Math.floor(Math.random()*ids.length)]);
}
const J_ITEM_STACK_MAX=20;
function johtoIsPotionItem(id){const it=materialItemDef(id);return !!(it&&it.consumable&&!it.evolutionStone&&!it.tradeOnly&&(it.healPct||it.curesStatus));}
function johtoIsStoneItem(id){const it=materialItemDef(id);return !!(it&&(it.evolutionStone||it.tradeOnly||it.evolutionCatalyst||it.resetMoves||it.incense));}
function johtoInventoryKindFor(id){return johtoIsPotionItem(id)?"potions":johtoIsStoneItem(id)?"stones":"main";}
function johtoInventoryCapacity(kind="main"){
  if(kind==="potions")return Infinity;
  if(kind==="stones")return Object.keys(EXTRA.itemDefs||{}).filter(johtoIsStoneItem).length+INCENSE_TYPES.length;
  return 20+2*skillRank("f9");
}
function johtoInventorySlotsFor(items,kind="main"){return Object.entries(items||{}).reduce((n,[id,qty])=>Number(qty)>0&&materialItemDef(id)&&johtoInventoryKindFor(id)===kind?n+1:n,0);}
function johtoInventoryEffectiveCapacity(kind="main",items=js.inventory){return johtoInventoryCapacity(kind);}
function johtoCanStoreItem(id,amount=1){if(!materialItemDef(id))return false;const add=Math.max(0,Number(amount)||0),have=Math.max(0,Number(js.inventory?.[id]||0)),kind=johtoInventoryKindFor(id);if(kind==="potions")return true;if(have+add>J_ITEM_STACK_MAX)return false;if(have>0)return true;return johtoInventorySlotsFor(js.inventory,kind)<johtoInventoryCapacity(kind);}
function johtoCanSwapHeldItems(oldItem,newItem){const current={...(js.inventory||{})},test={...current};if(oldItem)test[oldItem]=Math.max(0,Number(test[oldItem]||0))+1;if(newItem)test[newItem]=Math.max(0,Number(test[newItem]||0)-1);for(const [id,qtyRaw] of Object.entries(test)){const qty=Math.max(0,Number(qtyRaw)||0);if(qty>0&&!johtoIsPotionItem(id)&&qty>J_ITEM_STACK_MAX)return false;}for(const kind of ["main","stones"]){const cap=johtoInventoryCapacity(kind),before=johtoInventorySlotsFor(current,kind),after=johtoInventorySlotsFor(test,kind);if(Number.isFinite(cap)&&after>Math.max(cap,before))return false;}return true;}
function grantItem(id){
  if(!johtoCanStoreItem(id,1)){const it=materialItemDef(id),kind=johtoInventoryKindFor(id),have=Math.max(0,Number(js.inventory?.[id]||0)),reason=kind!=="potions"&&have>=J_ITEM_STACK_MAX?"pila completa 20/20":"inventario lleno";if(run)log("🎒 "+(it?.name||id)+" no pudo recogerse ("+reason+").");window.PokeSendaJohtoRuntime?.toast?.((it?.name||id)+": "+reason+" · no se recogió");return false;}js.inventory[id]=Math.max(0,Number(js.inventory?.[id]||0))+1;markJohtoItemSeen(id);if(run)run.items++;if(!["potion","super_potion","hyper_potion","full_heal"].includes(id))window.PokeSendaJohtoRuntime?.playSfx?.("itemFoundSfx");save();return true;
}
function processAutoPotion(){
  if(!js.options.autoPotion||skillRank("a5")<1||!run)return;
  const active=battleIds(),ids=skillRank("a14")>=1?(run.partyIds||active):active,candidates=ids.filter(id=>run.team[id]?.alive).sort((a,b)=>{const aa=active.includes(a)?0:1,bb=active.includes(b)?0:1;if(aa!==bb)return aa-bb;return run.team[a].hp/run.team[a].maxHp-run.team[b].hp/run.team[b].maxHp;});
  const priority=skillRank("a7")>=1?["hyper_potion","super_potion","potion"]:skillRank("a6")>=1?["super_potion","potion"]:["potion"];
  for(const id of candidates){const t=run.team[id];if(!t?.alive||(t.autoPotionCooldown||0)>0)continue;const ratio=t.hp/Math.max(1,t.maxHp),p=js.pokemon[id];if(ratio<=.10){const itemId=priority.find(x=>(js.inventory[x]||0)>0);if(itemId){const it=EXTRA.itemDefs[itemId],before=t.hp,healMult=1+.05*skillRank("e10");t.hp=Math.min(t.maxHp,t.hp+t.maxHp*it.healPct*healMult);const healed=Math.max(0,t.hp-before),saved=Math.random()<Math.min(.20,.02*skillRank("a8"));if(!saved){js.inventory[itemId]=Math.max(0,(js.inventory[itemId]||0)-1);if(js.inventory[itemId]<=0)delete js.inventory[itemId];}t.autoPotionCooldown=2.2;if(skillRank("a9")){t.guard=Math.max(t.guard||0,.01*skillRank("a9"));t.guardTime=Math.max(t.guardTime||0,5);}if(healed)battleFx({kind:"heal",side:"player",targetId:id,amount:healed});log("💉 Auto-Poción: "+it.name+" en "+name(p.dex)+" +"+Math.ceil(healed)+" PS"+(saved?" · Ahorro Médico: no se consumió":"")+".");continue;}}
    if(skillRank("a13")>=1&&ratio<=.25&&(t.status?.type||(t.confusion||0)>0)&&(js.inventory.full_heal||0)>0){t.status=null;t.statusTick=3;t.confusion=0;const saved=Math.random()<Math.min(.20,.02*skillRank("a8"));if(!saved){js.inventory.full_heal=Math.max(0,(js.inventory.full_heal||0)-1);if(js.inventory.full_heal<=0)delete js.inventory.full_heal;}t.autoPotionCooldown=2.2;log("💊 Auto-Cura: Cura Total en "+name(p.dex)+(saved?" · Ahorro Médico: no se consumió":"")+".");}
  }
  save();
}
function routeStartPoint(){const rs=currentRouteState();if(rs.farmCheckpoint===null||rs.farmCheckpoint===undefined||rs.farmCheckpoint==="auto")return Number(rs.checkpoint||0);const fp=Number(rs.farmCheckpoint);return[0,2500,5000,7500].includes(fp)&&((rs.centersSeen||[]).includes(fp)||fp===0||rs.completions>0)?fp:Number(rs.checkpoint||0);}


/* ============================================================
   GIMNASIOS DE JOHTO · 6 VS 6 · PARIDAD DE REGLAS CON KANTO
   ============================================================ */
const J_GYM_ORDER=["falkner","bugsy","whitney","morty","chuck","jasmine","pryce","clair"];
const J_GYM_DEFS={
 falkner:{leader:"Falkner",city:"Ciudad Malva",gym:"Gimnasio Malva",type:"flying",badge:"Medalla Céfiro",icon:"🪽",color:"#8aa8d7",portrait:"falkner",money:75000,tickets:1,tm:"j_tm31",recommended:"Nv.60 · 4–5★ · endgame",rule:"Corriente Ascendente · alta velocidad y presión aérea; Noctowl JEFE acelera la segunda fase.",roster:[[193,60],[176,61],[225,61],[198,62],[227,62],[164,64]],ace:164},
 bugsy:{leader:"Bugsy",city:"Pueblo Azalea",gym:"Gimnasio Azalea",type:"bug",badge:"Medalla Colmena",icon:"🐝",color:"#9eb347",portrait:"bugsy",money:100000,tickets:1,tm:"j_tm49",recommended:"Nv.60 · 4–5★ · endgame",rule:"Enjambre · ataques múltiples y presión constante; Scizor JEFE aumenta su ofensiva en Fase 2.",roster:[[168,60],[166,61],[193,61],[205,62],[214,62],[212,64]],ace:212},
 whitney:{leader:"Whitney",city:"Ciudad Trigal",gym:"Gimnasio Trigal",type:"normal",badge:"Medalla Planicie",icon:"🌼",color:"#dd8fb1",portrait:"whitney",money:125000,tickets:1,tm:"j_tm45",recommended:"Nv.60 · 4–5★ · endgame",rule:"Ritmo Imparable · aguante, curación y presión prolongada; Miltank JEFE se recupera al entrar en Fase 2.",roster:[[162,60],[190,61],[203,61],[217,62],[242,62],[241,64]],ace:241},
 morty:{leader:"Morty",city:"Ciudad Iris",gym:"Gimnasio Iris",type:"ghost",badge:"Medalla Niebla",icon:"👻",color:"#80659b",portrait:"morty",money:150000,tickets:1,tm:"j_tm30",recommended:"Nv.60 · 4–5★ · endgame",rule:"Niebla Espectral · estados y Confusión dominan la pelea; Misdreavus JEFE intensifica el caos en Fase 2.",roster:[[198,60],[215,61],[178,61],[197,62],[229,62],[200,64]],ace:200},
 chuck:{leader:"Chuck",city:"Ciudad Orquídea",gym:"Gimnasio Orquídea",type:"fighting",badge:"Medalla Tormenta",icon:"🥋",color:"#c86a50",portrait:"chuck",money:200000,tickets:2,tm:"j_tm01",recommended:"Nv.60 · 4–5★ · endgame",rule:"Disciplina de Acero · potencia física y críticos; Hitmontop JEFE aumenta su fuerza al entrar en Fase 2.",roster:[[106,60],[107,61],[62,61],[214,62],[217,62],[237,64]],ace:237},
 jasmine:{leader:"Jasmine",city:"Ciudad Olivo",gym:"Gimnasio Olivo",type:"steel",badge:"Medalla Mineral",icon:"⚙️",color:"#aeb7c4",portrait:"jasmine",money:250000,tickets:2,tm:"j_tm23",recommended:"Nv.60 · 4–5★ · endgame",rule:"Fortaleza Mineral · enorme defensa y reducción de daño; Steelix JEFE endurece la segunda fase.",roster:[[205,60],[212,61],[227,61],[207,62],[248,62],[208,64]],ace:208},
 pryce:{leader:"Pryce",city:"Pueblo Caoba",gym:"Gimnasio Caoba",type:"ice",badge:"Medalla Glaciar",icon:"❄️",color:"#77b9cc",portrait:"pryce",money:350000,tickets:2,tm:"j_tm16",recommended:"Nv.60 · 4–5★ · endgame",rule:"Frío Extremo · ralentización y congelación; Piloswine JEFE reduce aún más el ritmo rival en Fase 2.",roster:[[238,60],[124,61],[215,61],[225,62],[220,62],[221,64]],ace:221},
 clair:{leader:"Clair",city:"Ciudad Endrino",gym:"Gimnasio Endrino",type:"dragon",badge:"Medalla Dragón",icon:"🐉",color:"#7561d9",portrait:"clair",money:500000,tickets:3,tm:"j_tm24",recommended:"Nv.60 · 4–5★ · endgame",rule:"Linaje Dragón · ofensiva equilibrada y gran resistencia; Kingdra JEFE desata todo su poder en Fase 2.",roster:[[117,60],[181,61],[207,61],[248,62],[160,62],[230,64]],ace:230}
};
const J_GYM_TRAINING={
 falkner:{stars:5,rank:12,hp:1.34,atk:1.32,def:1.24,speed:1.15,ai:.95,crit:.105,item:"sharp_beak",aceItem:"quick_claw",bossHp:2.20,bossAtk:1.38,bossDef:1.18,bossSpeed:1.24,bossReduction:.05,phaseAtk:1.16,phaseSpeed:1.18,phaseReduction:.05},
 bugsy:{stars:5,rank:12,hp:1.36,atk:1.36,def:1.25,speed:1.12,ai:.95,crit:.110,item:"silver_powder",aceItem:"scope_lens",bossHp:2.25,bossAtk:1.44,bossDef:1.20,bossSpeed:1.15,bossReduction:.06,phaseAtk:1.22,phaseSpeed:1.12,phaseReduction:.06},
 whitney:{stars:5,rank:12,hp:1.46,atk:1.30,def:1.30,speed:1.06,ai:.95,crit:.100,item:"pink_bow",aceItem:"focus_band",bossHp:2.55,bossAtk:1.34,bossDef:1.32,bossSpeed:1.05,bossReduction:.10,phaseAtk:1.12,phaseSpeed:1.05,phaseReduction:.10},
 morty:{stars:5,rank:12,hp:1.34,atk:1.40,def:1.24,speed:1.12,ai:.96,crit:.115,item:"spell_tag",aceItem:"scope_lens",bossHp:2.22,bossAtk:1.48,bossDef:1.18,bossSpeed:1.18,bossReduction:.05,phaseAtk:1.22,phaseSpeed:1.16,phaseReduction:.05},
 chuck:{stars:5,rank:12,hp:1.40,atk:1.40,def:1.28,speed:1.07,ai:.95,crit:.115,item:"black_belt",aceItem:"scope_lens",bossHp:2.42,bossAtk:1.46,bossDef:1.25,bossSpeed:1.08,bossReduction:.07,phaseAtk:1.25,phaseSpeed:1.08,phaseReduction:.07},
 jasmine:{stars:5,rank:12,hp:1.46,atk:1.30,def:1.42,speed:1.00,ai:.96,crit:.100,item:"metal_coat",aceItem:"focus_band",bossHp:2.60,bossAtk:1.34,bossDef:1.48,bossSpeed:1.00,bossReduction:.16,phaseAtk:1.10,phaseSpeed:1.02,phaseReduction:.16},
 pryce:{stars:5,rank:12,hp:1.40,atk:1.34,def:1.32,speed:1.06,ai:.95,crit:.105,item:"never_melt_ice",aceItem:"quick_claw",bossHp:2.42,bossAtk:1.38,bossDef:1.30,bossSpeed:1.06,bossReduction:.09,phaseAtk:1.15,phaseSpeed:1.05,phaseReduction:.09},
 clair:{stars:5,rank:12,hp:1.42,atk:1.40,def:1.34,speed:1.10,ai:.97,crit:.115,item:"dragon_fang",aceItem:"scope_lens",bossHp:2.50,bossAtk:1.48,bossDef:1.32,bossSpeed:1.12,bossReduction:.10,phaseAtk:1.25,phaseSpeed:1.12,phaseReduction:.10}
};
const J_GYM_NATURE_BY_DEX={
 62:"firme",106:"firme",107:"firme",117:"modesta",124:"miedosa",160:"firme",162:"alegre",164:"modesta",166:"alegre",168:"firme",176:"modesta",178:"miedosa",181:"modesta",190:"alegre",193:"miedosa",197:"serena",198:"miedosa",200:"miedosa",203:"modesta",205:"agitada",207:"agitada",208:"agitada",212:"firme",214:"firme",215:"alegre",217:"firme",220:"firme",221:"firme",225:"alegre",227:"agitada",229:"miedosa",230:"modesta",237:"firme",238:"miedosa",241:"alegre",242:"serena",248:"firme"
};
const J_GYM_DIFFICULTY_TUNE={hp:1.140,offense:1.070,defense:1.080,speed:1.030};
function jGymNatureForDex(dex){return J_GYM_NATURE_BY_DEX[Number(dex)]||"seria";}
function jGymItemDef(id){return (id&&(EXTRA.itemDefs?.[id]||DATA().items?.[id]))||null;}
let jGym=null,jGymTimer=null;
// V36.66.12 · El motor aislado de Johto necesita su propio límite de tiempo.
// El HUD regional define otra constante con el mismo valor en otro <script>,
// pero esa constante NO pertenece a este scope. Sin esta copia local, el primer
// tick del Gimnasio lanzaba ReferenceError y detenía todos los ataques.
const J_GYM_TIME_LIMIT=180;

function jGymDef(id){return J_GYM_DEFS[id]||null;}
function jGymTraining(id){return J_GYM_TRAINING[id]||J_GYM_TRAINING.falkner;}
function jGymHasBadge(id){return (js.gyms?.badges||[]).includes(id);}
function jGymUnlocked(id){const i=J_GYM_ORDER.indexOf(id);return i===0||(i>0&&jGymHasBadge(J_GYM_ORDER[i-1]));}
function jGymBadgeCount(){return (js.gyms?.badges||[]).filter(id=>J_GYM_ORDER.includes(id)).length;}
function jGymFamilyForDex(dex){return Object.keys(DATA().families||{}).find(id=>(fam(id)?.members||[]).includes(Number(dex)))||null;}
function jGymStats(){return {damage:0,healing:0,taken:0,kos:0,crits:0,superEffective:0,deaths:0,supports:0};}
const J_GYM_POSITION_BUFFS={
  0:{def:1.18,reduction:.06},
  1:{offense:1.12,crit:.03},
  2:{speed:1.15,support:1.20}
};
const J_GYM_TYPE_SYNERGY=.05;
function jGymBaseCore(dex,level,natureKey="seria"){
  const b={...rawStatsForDex(dex)},n=EXTRA.natures?.[natureKey],lv=Math.max(1,Number(level)||1);
  if(n&&!n.neutral&&n.up!==n.down){b[n.up]*=1.10;b[n.down]*=.90;}
  return {maxHp:55+b.hp*.85+(lv-1)*(2.8+b.hp*.055),atk:5+b.atk*.11+(lv-1)*(.55+b.atk*.0085),spAtk:5+b.spAtk*.11+(lv-1)*(.55+b.spAtk*.0085),def:b.def*(1+(lv-1)*.018),spDef:b.spDef*(1+(lv-1)*.018),cd:Math.max(.82,Math.min(1.82,1.85-b.speed*.0065))};
}
function jGymTrainingMoveScore(tm,dex,gymId){
  const m=tmMove(tm.id),types=species(dex).types||[],g=jGymDef(gymId),acc=Math.max(.01,Number(tm.accuracy??1)),power=Math.max(0,Number(tm.power||0));
  return power*acc+(types.includes(tm.type)?65:0)+(tm.type===g?.type?30:0)+acc*8;
}
function jGymTrainedMoves(dex,fid,stage,gymId,ace,tr){
  const natural=fid?(DATA().movesets?.[fid]||[]):[];
  let moves=natural.map((m,i)=>({m:{...m},rank:tr.rank+(ace?2:0),i})).filter(x=>Number(x.m.unlockStage||0)<=stage);
  const usedNames=new Set(moves.map(x=>x.m?.name).filter(Boolean)),compat=(GEN2_TM_COMPAT_EMBEDDED?.[String(dex)]||[]),candidates=compat.map(n=>DATA().tms?.[`j_tm${String(n).padStart(2,"0")}`]).filter(Boolean).filter(tm=>tm.kind==="attack"&&Number(tm.power||0)>=50&&Number(tm.power||0)<=100&&Number(tm.accuracy??1)>=.70).map(tm=>({tm,score:jGymTrainingMoveScore(tm,dex,gymId)})).sort((a,b)=>b.score-a.score);
  while(moves.filter(x=>x.m.kind==="attack").length<3){const pick=candidates.find(x=>!usedNames.has(x.tm.moveName));if(!pick)break;const m=tmMove(pick.tm.id);m.gymTrained=true;moves.push({m,rank:tr.rank+(ace?2:0),i:moves.length});usedNames.add(m.name);}
  const g=jGymDef(gymId),sig=ace&&tmDef(g?.tm)?tmMove(g.tm):null;
  if(sig){sig.leaderSignature=true;const same=moves.findIndex(x=>x.m.name===sig.name);if(same>=0)moves[same]={m:sig,rank:tr.rank+3,i:same};else if(sig.kind==="support"){let slot=moves.findIndex(x=>x.m.kind==="support");if(slot<0&&moves.length>=4){const attacks=moves.map((x,i)=>({x,i})).filter(z=>z.x.m.kind==="attack").sort((a,b)=>(Number(a.x.m.power||0)*Number(a.x.m.tmAccuracy??1))-(Number(b.x.m.power||0)*Number(b.x.m.tmAccuracy??1)));slot=attacks[0]?.i??moves.length-1;}if(slot>=0)moves[slot]={m:sig,rank:tr.rank+3,i:slot};else moves.push({m:sig,rank:tr.rank+3,i:moves.length});}else{const attacks=moves.map((x,i)=>({x,i})).filter(z=>z.x.m.kind==="attack").sort((a,b)=>(Number(a.x.m.power||0)*Number(a.x.m.tmAccuracy??1))-(Number(b.x.m.power||0)*Number(b.x.m.tmAccuracy??1)));const slot=attacks[0]?.i??0;moves[slot]={m:sig,rank:tr.rank+3,i:slot};}}
  if(!moves.some(x=>x.m.kind==="attack"))moves.unshift({m:{kind:"attack",name:"Placaje",type:"normal",power:40},rank:tr.rank,i:0});
  return moves.slice(0,4).map((x,i)=>({...x,i}));
}
function jGymPlayerEntity(id,formationIndex){
  const p=js.pokemon[id],d=derived(p),stage=stageIndex(id,p.dex),moves=[...playerMoveEntries(id,"attack"),...playerMoveEntries(id,"support")].filter(x=>x.m?.tmId||Number(x.m?.unlockStage||0)<=stage).sort((a,b)=>a.i-b.i).map(x=>({m:{...x.m},rank:Number(x.rank||0),i:x.i}));
  return {side:"player",id,ownerId:id,formationIndex,dex:p.dex,name:name(p.dex),level:p.level,types:[...d.types],maxHp:d.maxHp,hp:d.maxHp,atk:d.atk,spAtk:d.spAtk,def:d.def,spDef:d.spDef,cd:d.cd,crit:Math.min(.75,d.crit),critDamage:d.critDamage||1.65,reduction:d.reduction||0,lifesteal:d.lifesteal||0,survive:d.survive||0,dodge:d.dodge||0,statusResist:d.statusResist||0,moves,attackTimer:d.cd*(.65+Math.random()*.30),alive:true,status:null,statusTick:3,confusionTurns:0,confusion:0,powerBuff:0,powerTime:0,guard:0,guardTime:0,haste:0,hasteTime:0,index:formationIndex,stars:p.stars||1,itemId:p.heldItem||null,stats:jGymStats()};
}
function jGymEnemyEntity(dex,level,gymId,index){
  const fid=jGymFamilyForDex(dex),g=jGymDef(gymId),tr=jGymTraining(gymId),ace=Number(dex)===Number(g.ace),nature=jGymNatureForDex(dex),core=jGymBaseCore(dex,level,nature),star=1+.10*(Math.max(1,tr.stars)-1),bossHp=ace?tr.bossHp:1,bossAtk=ace?tr.bossAtk:1,bossDef=ace?tr.bossDef:1,bossSpeed=ace?tr.bossSpeed:1,itemId=ace?(tr.aceItem||tr.item):tr.item,item=jGymItemDef(itemId);
  const stage=fid?stageIndex(fid,dex):0,moves=jGymTrainedMoves(dex,fid,stage,gymId,ace,tr);
  let maxHp=core.maxHp*tr.hp*star*bossHp*J_GYM_DIFFICULTY_TUNE.hp,atk=core.atk*tr.atk*star*bossAtk*J_GYM_DIFFICULTY_TUNE.offense,spAtk=core.spAtk*tr.atk*star*bossAtk*J_GYM_DIFFICULTY_TUNE.offense,def=core.def*tr.def*star*bossDef*J_GYM_DIFFICULTY_TUNE.defense,spDef=core.spDef*tr.def*star*bossDef*J_GYM_DIFFICULTY_TUNE.defense,cd=Math.max(.50,core.cd/(tr.speed*(1+.025*(Math.max(1,tr.stars)-1))*bossSpeed*J_GYM_DIFFICULTY_TUNE.speed)),crit=Number(tr.crit||.10)+(ace?.035:0),lifesteal=0,survive=0,dodge=0,statusResist=0;
  if(item){if(item.hp)maxHp*=1+Number(item.hp);if(item.atk){atk*=1+Number(item.atk);spAtk*=1+Number(item.atk);}if(item.physicalAtk)atk*=1+Number(item.physicalAtk);if(item.speed){if(item.speed>0)cd/=1+Number(item.speed);else cd*=1+Math.abs(Number(item.speed));}crit+=Number(item.crit||0);lifesteal+=Number(item.lifesteal||0);survive+=Number(item.survive||0);dodge+=Number(item.dodge||0);statusResist+=Number(item.statusResist||0);}
  maxHp=Math.max(1,Math.round(maxHp));
  return {side:"enemy",familyId:fid,dex:Number(dex),name:name(dex),level:Number(level),types:[...(species(dex).types||["normal"])],stars:tr.stars,moveRank:tr.rank+(ace?2:0),nature,maxHp,hp:maxHp,atk,spAtk,def,spDef,cd,crit:Math.min(.55,crit),critDamage:1.65,moves,attackTimer:cd*(.65+Math.random()*.30),alive:true,status:null,statusTick:3,confusionTurns:0,confusion:0,powerBuff:0,powerTime:0,guard:0,guardTime:0,haste:0,hasteTime:0,index,ace,bossPhase:false,reduction:0,lifesteal,survive,dodge,statusResist,itemId,stats:jGymStats()};
}
function jGymActive(arr,slots){return slots.map(i=>i==null?null:arr[i]).filter(e=>e?.alive);}
function jGymAlive(arr){return arr.filter(e=>e.alive).length;}
function jGymCommonType(active){if(active.length!==3)return null;let common=[...(active[0]?.types||[])];for(const e of active.slice(1))common=common.filter(t=>(e.types||[]).includes(t));return common[0]||null;}
function jGymInitialPlayerSlots(player){
  const used=new Set(),slots=[null,null,null];
  for(let slot=0;slot<3;slot++){
    let idx=player.findIndex((e,i)=>e?.alive&&e.formationIndex===slot&&!used.has(i));
    if(idx<0)idx=player.findIndex((e,i)=>e?.alive&&e.formationIndex===slot+3&&!used.has(i));
    if(idx<0)idx=player.findIndex((e,i)=>e?.alive&&!used.has(i));
    if(idx>=0){slots[slot]=idx;used.add(idx);}
  }
  return slots;
}
function jGymFillSlot(side,slot){
  const arr=side==="player"?jGym.player:jGym.enemy,slots=side==="player"?jGym.playerSlots:jGym.enemySlots;
  if(slots[slot]!=null&&arr[slots[slot]]?.alive)return;
  const used=new Set(slots.filter(x=>x!=null));let next=-1;
  if(side==="player"){const preferred=slot+3;next=arr.findIndex((e,i)=>e?.alive&&e.formationIndex===preferred&&!used.has(i));}
  if(next<0)next=arr.findIndex((e,i)=>e?.alive&&!used.has(i));slots[slot]=next>=0?next:null;
  if(next>=0&&side==="player")jGymLog("🔄 "+arr[next].name+" entra desde la Banca "+(["Guardia","Asalto","Apoyo"][slot]||"Reserva")+".");
}
function jGymEnsureSlots(){for(let s=0;s<3;s++){jGymFillSlot("player",s);jGymFillSlot("enemy",s);}}
function jGymRoleMult(e,slot){
  slot=Math.max(0,Math.min(2,Number(slot)||0));const pos={...J_GYM_POSITION_BUFFS[slot]};
  if(e?.side==="player"){
    if(slot===0){const r=skillRank("a10");pos.def=(pos.def||1)+.01*r;pos.reduction=(pos.reduction||0)+.0015*r;}
    if(slot===1){const r=skillRank("a11");pos.offense=(pos.offense||1)+.01*r;pos.crit=(pos.crit||0)+.0015*r;}
    if(slot===2){const r=skillRank("a12");pos.speed=(pos.speed||1)+.01*r;pos.support=(pos.support||1)+.015*r;}
  }
  const active=e?.side==="enemy"?jGymActive(jGym?.enemy||[],jGym?.enemySlots||[]):jGymActive(jGym?.player||[],jGym?.playerSlots||[]),synergy=jGymCommonType(active)?1+J_GYM_TYPE_SYNERGY:1;
  return {atk:(pos.offense||1)*synergy,spAtk:(pos.offense||1)*synergy,def:pos.def||1,spDef:pos.def||1,cd:1/(pos.speed||1),reduction:pos.reduction||0,support:(pos.support||1)*synergy,crit:pos.crit||0};
}
function jGymPlayerEffective(ent,slot){
  const rm=jGymRoleMult(ent,slot);let atk=ent.atk*rm.atk,spAtk=ent.spAtk*rm.spAtk,def=ent.def*rm.def,spDef=ent.spDef*rm.spDef,cd=ent.cd*rm.cd,reduction=Math.min(.45,(ent.reduction||0)+(rm.reduction||0)),crit=(ent.crit||0)+(rm.crit||0),support=rm.support||1;
  if(ent.powerTime>0){atk*=1+(ent.powerBuff||0);spAtk*=1+(ent.powerBuff||0);}if(ent.guardTime>0)reduction=Math.min(.55,reduction+(ent.guard||0));if(ent.hasteTime>0)cd/=1+(ent.haste||0);
  return {atk,spAtk,def,spDef,cd:Math.max(.25,cd),reduction,crit:Math.min(.90,crit),support};
}
function jGymEnemyEffective(ent,slot){
  const rm=jGymRoleMult(ent,slot);let atk=ent.atk*rm.atk,spAtk=ent.spAtk*rm.spAtk,def=ent.def*rm.def,spDef=ent.spDef*rm.spDef,cd=ent.cd*rm.cd,reduction=(ent.reduction||0)+(rm.reduction||0),crit=(ent.crit||0)+(rm.crit||0),tr=jGymTraining(jGym?.gymId);
  if(ent.ace)reduction+=Number(tr.bossReduction||0);
  if(ent.bossPhase){atk*=tr.phaseAtk||1;spAtk*=tr.phaseAtk||1;cd/=tr.phaseSpeed||1;reduction+=tr.phaseReduction||0;crit+=.03;}
  if(ent.powerTime>0){atk*=1+(ent.powerBuff||0);spAtk*=1+(ent.powerBuff||0);}if(ent.guardTime>0)reduction+=ent.guard||0;if(ent.hasteTime>0)cd/=1+(ent.haste||0);
  return {atk,spAtk,def,spDef,cd:Math.max(.25,cd),reduction:Math.min(.68,reduction),crit:Math.min(.65,crit),support:rm.support||1};
}
function jGymTypeMult(type,types){return typeMult(type,types);}
function jGymMoveCat(m){return moveCategory(m);}
function jGymLog(msg){if(!jGym)return;jGym.logs=[msg,...jGym.logs].slice(0,28);window.PokeSendaJohtoRuntime?.onGymRender?.();}
function jGymStatusText(e){const a=[];if(e?.status?.type)a.push(STATUS_META[e.status.type]||e.status.type);if((e?.confusionTurns||e?.confusion||0)>0)a.push(STATUS_META.confusion);return a.join(" ");}
function jGymApplyStatus(e,type,source=null,chance=1){
  if(!e?.alive||Math.random()>=chance)return false;
  if(type==="confusion"){if((e.confusionTurns||e.confusion||0)>0)return false;e.confusionTurns=2+Math.floor(Math.random()*4);e.confusion=e.confusionTurns;return true;}
  if(e.status||statusImmune(e,type))return false;
  if(e.statusResist&&Math.random()<e.statusResist)return false;
  e.status={type,turns:type==="sleep"?2+Math.floor(Math.random()*3):0,source};e.statusTick=3;return true;
}
function jGymBlocked(e){
  if(e.status?.type==="sleep"){e.status.turns--;if(e.status.turns<=0)e.status=null;return true;}
  if(e.status?.type==="freeze"){if(Math.random()<.20)e.status=null;else return true;}
  if(e.status?.type==="paralysis"&&Math.random()<.25)return true;
  if((e.confusionTurns||e.confusion||0)>0){e.confusionTurns=Math.max(0,Number(e.confusionTurns||e.confusion||0)-1);e.confusion=e.confusionTurns;if(Math.random()<.33){const dmg=Math.max(1,e.maxHp*.08);jGymDealDamage(null,e,dmg,{uncredited:true});jGymFx({kind:"hit",side:e.side,index:jGymEntityIndex(e),amount:dmg,moveType:"psychic",status:"confusion"});if(e.hp<=0)jGymFaint(e,null);return true;}}
  return false;
}
function jGymMoveBypassesType(m){return !!(m?.fixedDamage||m?.fixedLevel||m?.fixedLevelRandom||m?.ohko);}
function jGymMoveCanDamage(m,target){return !!m&&!!target&&(jGymMoveBypassesType(m)||jGymTypeMult(m.type,target.types)>0);}
function jGymItemPower(attacker,m){if(!attacker?.itemId)return 1;const it=EXTRA.itemDefs?.[attacker.itemId]||DATA().items?.[attacker.itemId];return it?.boostType===m.type?1+Number(it.power||0):1;}
function jGymAttackScore(attacker,target,slot,targetSlot,entry){
  const m=entry.m,ae=attacker.side==="player"?jGymPlayerEffective(attacker,slot):jGymEnemyEffective(attacker,slot),cat=jGymMoveCat(m),off=cat==="special"?ae.spAtk:ae.atk,playerTarget=target.side==="player",te=playerTarget?jGymPlayerEffective(target,targetSlot):jGymEnemyEffective(target,targetSlot),def=cat==="special"?te.spDef:te.def,stab=attacker.types.includes(m.type)?1.20:1;
  const accuracy=m.alwaysHit?1:(Number.isFinite(Number(m.tmAccuracy))?Math.max(0,Math.min(1,Number(m.tmAccuracy))):1),statusBonus=m.statusPowerBonus&&(attacker.status?.type||(attacker.confusionTurns||attacker.confusion||0)>0)?Number(m.statusPowerBonus||1):1;return off*idlePower(m.power)*moveRankMult(entry.rank)*stab*jGymTypeMult(m.type,target.types)*jGymItemPower(attacker,m)*defenseFactor(def)*(1-Number(te.reduction||0))*accuracy*statusBonus;
}
function jGymBestAttack(attacker,target,slot,targetSlot=0){
  const attacks=attacker.moves.filter(x=>x.m.kind==="attack"&&jGymMoveCanDamage(x.m,target));if(!attacks.length)return null;let best=null;
  for(const x of attacks){const score=jGymAttackScore(attacker,target,slot,targetSlot,x);if(!best||score>best.score)best={...x,score};}return best;
}
function jGymEntityIndex(e){if(!jGym||!e)return-1;return(e.side==="player"?jGym.player:jGym.enemy).indexOf(e);}
function jGymFx(ev){try{window.PokeSendaJohtoRuntime?.onGymFx?.(ev);}catch(_){}}
function jGymSupportStatusEffect(m,rank=1){return johtoSupportStatusEffect(m,rank);}
function jGymUseSupport(e,slot){
  const supports=e.moves.filter(x=>x.m.kind==="support");if(!supports.length)return false;
  const enemy=e.side==="enemy",allies=jGymActive(enemy?jGym.enemy:jGym.player,enemy?jGym.enemySlots:jGym.playerSlots),enemies=jGymActive(enemy?jGym.player:jGym.enemy,enemy?jGym.playerSlots:jGym.enemySlots),x=supports[0],m=x.m,rank=Math.max(1,Number(x.rank)||1),status=jGymSupportStatusEffect(m,rank),avg=allies.reduce((a,z)=>a+z.hp/z.maxHp,0)/Math.max(1,allies.length),low=allies.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],support=enemy?1:jGymPlayerEffective(e,slot).support;
  if(status&&enemies.length&&Math.random()<.58){const t=enemies[Math.floor(Math.random()*enemies.length)];if(m.supportAccuracyRoll&&Number.isFinite(Number(m.tmAccuracy))&&Math.random()>Number(m.tmAccuracy)){e.stats.supports++;jGymLog("💨 "+e.name+" usa "+m.name+", pero falla.");return true;}if(jGymApplyStatus(t,status.type,e.name,status.chance)){e.stats.supports++;jGymLog("💫 "+e.name+" usa "+m.name+" sobre "+t.name+".");return true;}if(m.supportAccuracyRoll){e.stats.supports++;return true;}}
  if(e.side==="player"&&m.healPct&&m.selfHeal&&e.hp/e.maxHp<.75){const before=e.hp;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*Number(m.healPct||0));const healed=e.hp-before;e.stats.healing+=healed;e.stats.supports++;if(m.rest){e.status=null;e.confusion=0;e.statusTick=3;e.status={type:"sleep",turns:2};}if(healed)jGymFx({kind:"heal",side:e.side,index:jGymEntityIndex(e),amount:healed});jGymLog("💚 "+e.name+" usa "+m.name+": recupera "+Math.round(healed)+" PS"+(m.rest?" y queda dormido":"")+".");return true;}
  if(m.effect==="heal"&&low&&low.hp/low.maxHp<.62){const heal=Math.max(1,low.maxHp*(.18+.006*(rank-1))*support),before=low.hp;low.hp=Math.min(low.maxHp,low.hp+heal);const healed=low.hp-before;e.stats.healing+=healed;e.stats.supports++;if(healed)jGymFx({kind:"heal",side:low.side,index:jGymEntityIndex(low),amount:healed});jGymLog("💚 "+e.name+" usa "+m.name+": "+low.name+" recupera "+Math.round(healed)+" PS.");return true;}
  if(m.effect==="guard"&&avg<.78&&allies.some(a=>a.guardTime<=0)&&Math.random()<.55){const scale=Number(m.supportScale||1);for(const a of allies){a.guard=(.18+.004*(rank-1))*scale;a.guardTime=7;}if(m.disrupt&&enemies.length)enemies[0].attackTimer+=Number(m.disrupt)||0;e.stats.supports++;jGymLog("🛡 "+e.name+" usa "+m.name+": el equipo refuerza su defensa.");return true;}
  if(m.effect==="haste"&&allies.some(a=>a.hasteTime<=0)&&Math.random()<.36){const scale=Number(m.supportScale||1);for(const a of allies){a.haste=(.15+.003*(rank-1))*scale;a.hasteTime=7;}if(m.disrupt&&enemies.length)enemies[0].attackTimer+=Number(m.disrupt)||0;e.stats.supports++;jGymLog("💨 "+e.name+" usa "+m.name+": aumenta la velocidad del equipo.");return true;}
  if(m.effect==="power"&&allies.some(a=>a.powerTime<=0)&&Math.random()<.36){const scale=Number(m.supportScale||1);for(const a of allies){a.powerBuff=(.15+.003*(rank-1))*scale;a.powerTime=7;}if(m.disrupt&&enemies.length)enemies[0].attackTimer+=Number(m.disrupt)||0;e.stats.supports++;jGymLog("⚔ "+e.name+" usa "+m.name+": aumenta la ofensiva del equipo.");return true;}
  return false;
}
function jGymBossPhase(e){
  if(!e?.ace||e.bossPhase)return;e.bossPhase=true;
  if(jGym.gymId==="whitney")e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.15);
  if(jGym.gymId==="jasmine"){e.guard=Math.max(e.guard||0,.12);e.guardTime=999;}
  jGymLog("🔥 "+e.name+" entra en FASE 2.");
}
function jGymDealDamage(attacker,target,raw,{crit=false,eff=1,uncredited=false}={}){
  const before=Math.max(0,Number(target.hp)||0),dmg=Math.max(0,Number(raw)||0);let after=Math.max(0,before-dmg),trigger=false;
  if(target.side==="enemy"&&target.ace&&!target.bossPhase){const threshold=Math.max(1,Math.ceil(target.maxHp*.50));if(before>threshold&&after<=threshold){after=Math.max(after,threshold);trigger=true;}}
  target.hp=after;const actual=Math.max(0,before-after);if(attacker&&!uncredited){attacker.stats.damage+=actual;if(crit)attacker.stats.crits++;if(eff>1.01)attacker.stats.superEffective++;}target.stats.taken+=actual;if(trigger)jGymBossPhase(target);return actual;
}
function jGymMaybeMoveStatus(m,target,attacker){
  const n=m?.name||"";let type=null,chance=0;if(m?.statusType&&m.statusType!=="confusion"&&["burn","poison","paralysis","sleep","freeze"].includes(m.statusType)){type=m.statusType;chance=Number(m.statusChance??1);}else if(n==="Llamarada"){type="burn";chance=.30;}else if(["Ascua","Lanzallamas","Colmillo Ígneo","Puño Fuego"].includes(n)){type="burn";chance=.10;}else if(["Impactrueno","Rayo"].includes(n)){type="paralysis";chance=.10;}else if(["Chispa","Descarga","Trueno","Golpe Cuerpo","Lengüetazo","DragonBreath"].includes(n)){type="paralysis";chance=.30;}else if(["Aguijón Venenoso","Picotazo Veneno","Bomba Lodo"].includes(n)){type="poison";chance=.30;}else if(["Veneno Cruzado","Ácido"].includes(n)){type="poison";chance=.10;}else if(["Rayo Hielo","Ventisca"].includes(n)){type="freeze";chance=.10;}
  if(type)jGymApplyStatus(target,type,attacker?.name,chance);
  const cc=m?.statusType==="confusion"?Number(m.statusChance??1):n==="Hidropulso"?.20:["Confusión","Psicorrayo"].includes(n)?.10:0;if(cc)jGymApplyStatus(target,"confusion",attacker?.name,cc);
}
function jGymDamage(attacker,target,moveEntry,slot,targetSlot){
  const m=moveEntry.m,isPlayer=attacker.side==="player",ae=isPlayer?jGymPlayerEffective(attacker,slot):jGymEnemyEffective(attacker,slot),cat=jGymMoveCat(m),off=cat==="special"?ae.spAtk:ae.atk,playerTarget=target.side==="player",te=playerTarget?jGymPlayerEffective(target,targetSlot):jGymEnemyEffective(target,targetSlot),def=cat==="special"?te.spDef:te.def,stab=attacker.types.includes(m.type)?1.2:1,mult=jGymTypeMult(m.type,target.types),crit=Math.random()<ae.crit,itemPower=jGymItemPower(attacker,m);
  if(playerTarget&&target.dodge&&Math.random()<target.dodge){jGymFx({kind:"miss",side:"player",index:jGymEntityIndex(target)});jGymLog("✨ "+target.name+" evita el ataque con su objeto.");return {actual:0,crit:false,mult,dodged:true};}
  const reduction=Math.max(0,Math.min(.90,Number(te?.reduction||0))),variance=isPlayer?(.92+Math.random()*.16):(.90+Math.random()*.20);
  const statusBonus=m.statusPowerBonus&&(attacker.status?.type||(attacker.confusionTurns||attacker.confusion||0)>0)?Number(m.statusPowerBonus||1):1;let raw=off*idlePower(m.power)*moveRankMult(moveEntry.rank)*stab*mult*itemPower*defenseFactor(def)*variance*(crit?1.5:1)*(1-reduction)*statusBonus,actual=jGymDealDamage(attacker,target,raw,{crit,eff:mult});jGymFx({kind:"hit",side:target.side,index:jGymEntityIndex(target),amount:actual,moveType:m.type,crit,eff:mult});
  if(attacker.lifesteal&&actual>0){const before=attacker.hp;attacker.hp=Math.min(attacker.maxHp,attacker.hp+actual*attacker.lifesteal);const healed=attacker.hp-before;attacker.stats.healing+=healed;if(healed)jGymFx({kind:"heal",side:attacker.side,index:jGymEntityIndex(attacker),amount:healed});}
  if(m.drain&&actual>0){const before=attacker.hp;attacker.hp=Math.min(attacker.maxHp,attacker.hp+actual*Number(m.drain||0));attacker.stats.healing+=Math.max(0,attacker.hp-before);}
  jGymMaybeMoveStatus(m,target,attacker);if(m.slow)target.attackTimer+=.45;return {actual,crit,mult};
}
function jGymFaint(e,killer=null){
  if(!e?.alive)return;e.alive=false;e.hp=0;e.stats=e.stats||jGymStats();e.stats.deaths=Number(e.stats.deaths||0)+1;if(killer)killer.stats.kos++;
  if(e.side==="player")jGym.playerFaints++;else jGym.enemyFaints++;jGymLog("💀 "+e.name+" queda fuera de combate.");
  const slots=e.side==="player"?jGym.playerSlots:jGym.enemySlots,slot=slots.findIndex(i=>i!=null&&(e.side==="player"?jGym.player[i]:jGym.enemy[i])===e);if(slot>=0)slots[slot]=null;jGymEnsureSlots();
}
function jGymStruggle(attacker,slot,target,targetSlot){
  const ae=attacker.side==="player"?jGymPlayerEffective(attacker,slot):jGymEnemyEffective(attacker,slot),te=target.side==="player"?jGymPlayerEffective(target,targetSlot):jGymEnemyEffective(target,targetSlot),def=attacker.side==="player"?target.def:te.def,reduction=attacker.side==="player"?(1-(target.guardTime>0?target.guard:0)):(1-te.reduction),raw=Math.max(1,ae.atk*idlePower(50)*.45*defenseFactor(def)*(.90+Math.random()*.20)*reduction),actual=jGymDealDamage(attacker,target,raw,{crit:false,eff:1});
  jGymFx({kind:"hit",side:target.side,index:jGymEntityIndex(target),amount:actual,moveType:"normal"});if(!attacker.struggleWarned){jGymLog("⚠️ "+attacker.name+" no tiene un movimiento capaz de afectar a sus rivales y recurre a Forcejeo.");attacker.struggleWarned=true;}else jGymLog(attacker.name+" usa Forcejeo: "+Math.round(actual)+" PS.");if(target.hp<=0)jGymFaint(target,attacker);if(attacker.alive){const recoil=Math.max(1,attacker.maxHp*.05);jGymDealDamage(null,attacker,recoil,{uncredited:true});if(attacker.hp<=0)jGymFaint(attacker,null);}return {actual,crit:false,mult:1,struggle:true};
}
function jGymAction(e,slot){
  if(!e?.alive||jGymBlocked(e))return;if(jGymUseSupport(e,slot))return;
  const targets=jGymActive(e.side==="player"?jGym.enemy:jGym.player,e.side==="player"?jGym.enemySlots:jGym.playerSlots);if(!targets.length)return;let best=null;
  for(const t of targets){const targetSlot=(t.side==="player"?jGym.playerSlots:jGym.enemySlots).findIndex(i=>i!=null&&(t.side==="player"?jGym.player[i]:jGym.enemy[i])===t),mv=jGymBestAttack(e,t,slot,targetSlot);if(mv&&(!best||mv.score>best.mv.score))best={t,targetSlot,mv};}
  if(!best){const t=targets[Math.floor(Math.random()*targets.length)],targetSlot=(t.side==="player"?jGym.playerSlots:jGym.enemySlots).findIndex(i=>i!=null&&(t.side==="player"?jGym.player[i]:jGym.enemy[i])===t);jGymStruggle(e,slot,t,targetSlot);return;}
  const sourceIndex=jGymEntityIndex(e),targetIndex=jGymEntityIndex(best.t),m=best.mv.m;jGymFx({kind:"attack",side:e.side,index:sourceIndex,targetSide:best.t.side,targetIndex,moveType:m.type,important:!!(e.ace||best.t.ace)});
  if(Number(m.tmAccuracy??1)<1&&Math.random()>Number(m.tmAccuracy)){jGymLog("💨 "+e.name+" falla "+m.name+".");jGymFx({kind:"miss",side:best.t.side,index:targetIndex});return;}
  if(jGymMoveBypassesType(m)){
    let dmg=m.fixedDamage||0;if(m.fixedLevel||m.fixedLevelRandom)dmg=e.level*(m.fixedLevelRandom?(.5+Math.random()):1);if(m.ohko)dmg=best.t.ace?best.t.maxHp*.35:best.t.hp;const actual=jGymDealDamage(e,best.t,Math.max(1,dmg),{crit:false,eff:1});jGymFx({kind:"hit",side:best.t.side,index:targetIndex,amount:actual,moveType:m.type});if(best.t.hp<=0)jGymFaint(best.t,e);return;
  }
  const res=jGymDamage(e,best.t,best.mv,slot,best.targetSlot);if(best.t.hp>0&&m.slowChance&&Math.random()<Number(m.slowChance))best.t.attackTimer+=Number(m.slowSeconds||.5);if(best.t.hp>0&&m.weakenChance&&Math.random()<Number(m.weakenChance)){best.t.powerBuff=Math.min(Number(best.t.powerBuff||0),-.12);best.t.powerTime=Math.max(Number(best.t.powerTime||0),6);}if(e.alive&&m.selfGuard){e.guard=Math.max(Number(e.guard||0),Number(m.selfGuard));e.guardTime=Math.max(Number(e.guardTime||0),5);}const held=jGymItemDef(e.itemId);if(best.t.hp>0&&held?.slowProc&&Math.random()<Number(held.slowProc))best.t.attackTimer+=.38;if(e.alive&&m.cooldownMult)e.attackTimer*=Number(m.cooldownMult);if(best.t.hp<=0){if(best.t.survive&&Math.random()<best.t.survive){best.t.hp=1;jGymLog("🎗️ "+best.t.name+" resiste con su Cinta Focus.");}else jGymFaint(best.t,e);}if((res.mult>1.01||res.crit)&&!res.dodged)jGymLog((res.crit?"💥 CRÍTICO · ":"")+e.name+" usa "+m.name+(res.mult>1.01?" · ¡Supereficaz!":"")+".");
}
function jGymProcessStatus(dt){
  if(!jGym)return;for(const e of [...jGym.player,...jGym.enemy]){if(!e.alive)continue;
    for(const k of ["powerTime","guardTime","hasteTime"])if(e[k]>0)e[k]=Math.max(0,e[k]-dt);
    if(!["burn","poison"].includes(e.status?.type))continue;e.statusTick=(e.statusTick??3)-dt;if(e.statusTick<=0){e.statusTick+=3;const dmg=Math.max(1,e.maxHp*(e.status.type==="burn"?.045:.065));jGymDealDamage(null,e,dmg,{uncredited:true});jGymFx({kind:"hit",side:e.side,index:jGymEntityIndex(e),amount:dmg,moveType:e.status.type==="burn"?"fire":"poison",status:e.status.type});if(e.hp<=0)jGymFaint(e,null);}
  }
}
function jGymLeaderPulse(){
  if(!jGym)return;const g=jGym.gymId,enemy=jGymActive(jGym.enemy,jGym.enemySlots),player=jGymActive(jGym.player,jGym.playerSlots);if(!enemy.length||!player.length)return;
  if(g==="falkner")for(const e of enemy)e.attackTimer=Math.max(0,e.attackTimer-.18);
  else if(g==="bugsy")for(const e of enemy){e.atk*=1.012;e.spAtk*=1.012;}
  else if(g==="whitney"){const e=enemy.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],before=e.hp;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.025);const healed=e.hp-before;if(healed)jGymFx({kind:"heal",side:e.side,index:jGymEntityIndex(e),amount:healed});}
  else if(g==="morty"&&Math.random()<.35){const t=player[Math.floor(Math.random()*player.length)];if((t.confusionTurns||0)<=0){t.confusionTurns=2;t.confusion=2;}}
  else if(g==="chuck")for(const e of enemy){e.atk*=1.015;e.spAtk*=1.015;}
  else if(g==="jasmine")for(const e of enemy){e.guard=Math.max(e.guard||0,.03);e.guardTime=4.2;}
  else if(g==="pryce"&&Math.random()<.25){const t=player[Math.floor(Math.random()*player.length)];t.attackTimer+=.28;}
  else if(g==="clair")for(const e of enemy){e.atk*=1.012;e.spAtk*=1.012;}
}
function jGymTick(){
  if(!jGym||jGym.finished||jGym.paused)return;const now=performance.now(),dt=Math.min(.22,(now-jGym.lastTick)/1000);jGym.lastTick=now;jGym.elapsed+=dt;if(jGym.elapsed>=J_GYM_TIME_LIMIT){jGym.elapsed=J_GYM_TIME_LIMIT;jGymLog("⏱ Tiempo agotado: el desafío llegó al límite de 03:00.");window.PokeSendaJohtoRuntime?.onGymRender?.();jGymFinish(false,{timeout:true});return;}jGym.pulse-=dt;if(jGym.pulse<=0){jGym.pulse+=4;jGymLeaderPulse();}jGymProcessStatus(dt);jGymEnsureSlots();
  if(jGymAlive(jGym.player)<=0){jGymFinish(false);return;}if(jGymAlive(jGym.enemy)<=0){jGymFinish(true);return;}
  for(let slot=0;slot<3;slot++){const i=jGym.playerSlots[slot],e=i==null?null:jGym.player[i];if(!e?.alive)continue;if(!Number.isFinite(Number(e.attackTimer)))e.attackTimer=0;e.attackTimer-=dt;if(e.attackTimer<=0){jGymAction(e,slot);if(!jGym||jGym.finished)break;if(e.alive){const ef=jGymPlayerEffective(e,slot),cd=Math.max(.15,Number(ef.cd)||1),speed=e.status?.type==="paralysis"?2:1;e.attackTimer=Math.max(0,e.attackTimer)+cd*speed;}}}
  if(!jGym||jGym.finished)return;
  for(let slot=0;slot<3;slot++){const i=jGym.enemySlots[slot],e=i==null?null:jGym.enemy[i];if(!e?.alive)continue;if(!Number.isFinite(Number(e.attackTimer)))e.attackTimer=0;e.attackTimer-=dt;if(e.attackTimer<=0){jGymAction(e,slot);if(!jGym||jGym.finished)break;if(e.alive){const ef=jGymEnemyEffective(e,slot),cd=Math.max(.15,Number(ef.cd)||1),speed=e.status?.type==="paralysis"?2:1;e.attackTimer=Math.max(0,e.attackTimer)+cd*speed;}}}
  if(jGymAlive(jGym.player)<=0){jGymFinish(false);return;}if(jGymAlive(jGym.enemy)<=0){jGymFinish(true);return;}window.PokeSendaJohtoRuntime?.onGymRender?.();
}
function jGymStart(id){
  migrate();if(run||jGym||!jGymUnlocked(id))return {ok:false,msg:run?"Detén la expedición actual para desafiar un Gimnasio.":"Gimnasio no disponible."};
  const seen=new Set(),entries=(js.formation||[]).slice(0,6).map((pid,formationIndex)=>({pid,formationIndex})).filter(x=>x.pid&&js.pokemon[x.pid]&&!seen.has(x.pid)&&(seen.add(x.pid),true));if(entries.length<3)return {ok:false,msg:"Necesitas al menos 3 Pokémon en la Formación."};
  const g=jGymDef(id),previousBattleSpeed=[1,2,4].includes(Number(js.options?.battleSpeed))?Number(js.options.battleSpeed):1;
  js.gyms.attempts[id]=Number(js.gyms.attempts[id]||0)+1;js.options.battleSpeed=1;save();
  const player=entries.map(x=>jGymPlayerEntity(x.pid,x.formationIndex));
  jGym={gymId:id,player,enemy:g.roster.map(([dex,lv],i)=>jGymEnemyEntity(dex,lv,id,i)),playerSlots:jGymInitialPlayerSlots(player),enemySlots:[0,1,2],elapsed:0,lastTick:performance.now(),paused:false,finished:false,logs:[],playerFaints:0,enemyFaints:0,pulse:4,potionUses:0,result:null,speed:1,previousBattleSpeed};
  jGymLog("🏛 Comienza el desafío contra "+g.leader+".");jGymLog("⏱ Límite del Gimnasio: 03:00.");jGymLog("🔒 Velocidad del desafío fijada en x1.");jGymLog("🔥 6 vs 6 · el AS del Líder es un JEFE de dos fases.");jGymLog("📜 "+g.rule);clearInterval(jGymTimer);jGymTimer=setInterval(jGymTick,80);window.PokeSendaJohtoRuntime?.onGymStarted?.();return {ok:true};
}
function jGymPause(v=null){if(!jGym||jGym.finished)return false;jGym.paused=v==null?!jGym.paused:!!v;jGym.lastTick=performance.now();window.PokeSendaJohtoRuntime?.onGymRender?.();return jGym.paused;}
function jGymPotionItems(){return ["hyper_potion","super_potion","potion","full_heal"].filter(id=>Number(js.inventory?.[id]||0)>0);}
function jGymUsePotion(itemId,playerIndex){
  migrate();if(!jGym||jGym.finished||jGym.potionUses>=3)return {ok:false,msg:"Botiquín agotado."};const e=jGym.player[Number(playerIndex)],it=EXTRA.itemDefs?.[itemId];if(!e?.alive||!it||Number(js.inventory?.[itemId]||0)<=0)return {ok:false,msg:"No puedes usar ese objeto."};
  if(itemId==="full_heal"){if(!e.status&&!(e.confusionTurns||e.confusion))return {ok:false,msg:"Ese Pokémon no tiene estados que curar."};e.status=null;e.statusTick=3;e.confusionTurns=0;e.confusion=0;}
  else if(it.healPct){if(e.hp>=e.maxHp)return {ok:false,msg:"Ese Pokémon ya tiene todos sus PS."};const before=e.hp;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*it.healPct*(1+.05*skillRank("e10")));const healed=e.hp-before;e.stats.healing+=healed;if(healed)jGymFx({kind:"heal",side:e.side,index:jGymEntityIndex(e),amount:healed});}
  else return {ok:false,msg:"Objeto no válido para el Botiquín."};
  js.inventory[itemId]--;if(js.inventory[itemId]<=0)delete js.inventory[itemId];jGym.potionUses++;save();window.PokeSendaJohtoRuntime?.onGymRender?.();return {ok:true};
}
function jGymForfeit(){if(!jGym)return false;jGymFinish(false,{forfeit:true});return true;}
function jGymFinish(win,{forfeit=false,timeout=false}={}){
  if(!jGym||jGym.finished)return;const battle=jGym,g=jGymDef(battle.gymId);battle.finished=true;clearInterval(jGymTimer);jGymTimer=null;
  let first=false,money=0,tickets=0,tmNew=false;
  if(win){
    first=!jGymHasBadge(battle.gymId);js.gyms.wins[battle.gymId]=Number(js.gyms.wins[battle.gymId]||0)+1;const old=Number(js.gyms.bestTimes[battle.gymId]||0);if(!old||battle.elapsed<old)js.gyms.bestTimes[battle.gymId]=battle.elapsed;
    js.gyms.lastTeam[battle.gymId]=battle.player.map(e=>({id:e.id,name:e.name,dex:e.dex,level:e.level}));
    if(first){
      js.gyms.badges.push(battle.gymId);js.gyms.firstWinAt[battle.gymId]=Date.now();money=g.money;tickets=g.tickets;js.money=(js.money||0)+money;ensureGymAchievementState();js.achievements.premiumTickets=(js.achievements.premiumTickets||0)+tickets;
      tmNew=!js.tms?.[g.tm];js.tms=js.tms||{};js.tms[g.tm]=true;if(!tmNew){js.money+=50000;money+=50000;}
    }
    js.gyms.leagueUnlocked=jGymBadgeCount()>=8;
  }
  js.options.battleSpeed=[1,2,4].includes(Number(battle.previousBattleSpeed))?Number(battle.previousBattleSpeed):1;
  save();battle.result={win,first,money,tickets,tm:g.tm,tmNew,forfeit,timeout,badgeCount:jGymBadgeCount()};window.PokeSendaJohtoRuntime?.onGymFinished?.(JSON.parse(JSON.stringify(battle)));jGym=null;
}
function ensureGymAchievementState(){
  js.achievements=js.achievements&&typeof js.achievements==="object"?js.achievements:{};
  js.achievements.premiumTickets=Math.max(0,Number(js.achievements.premiumTickets||0));
}


function vendorSnapshot(){if(!run)return null;return{eventPending:run.eventPending,incenseOffers:run.incenseVendorOffers||[],incenseBought:run.incenseVendorBought||{},mintOffers:run.mintVendorOffers||[],mintBought:run.mintVendorBought||{}};}
function buyIncenseVendor(type){migrate();if(!run||run.eventPending!=="incense_vendor"||!(run.incenseVendorOffers||[]).includes(type))return{ok:false,msg:"Oferta no disponible."};if(run.incenseVendorBought?.[type])return{ok:false,msg:"Esa oferta ya fue comprada."};const id=incenseItemId(type),have=Number(js.inventory?.[id]||0);if(have>=20)return{ok:false,msg:"Stack lleno (20)."};if((js.money||0)<INCENSE_PRICE)return{ok:false,msg:"Necesitas ₽10.000."};js.money-=INCENSE_PRICE;js.inventory[id]=have+1;run.incenseVendorBought[type]=true;js.vendorStats.incenseBought++;markJohtoItemSeen(id);save();return{ok:true,id,qty:js.inventory[id]};}
function buyMintVendor(index){migrate();if(!run||run.eventPending!=="mint_vendor")return{ok:false,msg:"Oferta no disponible."};const o=run.mintVendorOffers?.[Number(index)];if(!o)return{ok:false,msg:"Oferta no disponible."};const key=o.kind==="master"?"master":o.nature;if(run.mintVendorBought?.[key])return{ok:false,msg:"Esa oferta ya fue comprada."};const price=o.kind==="master"?MASTER_MINT_PRICE:MINT_PRICE;if((js.money||0)<price)return{ok:false,msg:"Pokédolares insuficientes."};js.money-=price;if(o.kind==="master")js.masterMints++;else js.mints[o.nature]=Math.max(0,Number(js.mints[o.nature]||0))+1;run.mintVendorBought[key]=true;js.vendorStats.mintsBought++;save();return{ok:true,key};}
function closeVendorEvent(kind){if(!run)return false;const wanted=kind==="mint"?"mint_vendor":"incense_vendor";if(run.eventPending!==wanted)return false;js.routeEventStats.completed++;run.eventPending=null;run.paused=false;run.spawnDelay=.55;save();return true;}
function setRewardIncense(type){migrate();if(!reward||reward.opened)return false;if(!type){reward.incenseType=null;return true;}if(!INCENSE_TYPES.includes(type)||Number(js.inventory?.[incenseItemId(type)]||0)<=0)return false;reward.incenseType=type;return true;}
function equipHeldItem(id,itemId){migrate();const p=js.pokemon?.[id];if(!p)return{ok:false,msg:"Pokémon no encontrado."};if(run&&!run.paused)return{ok:false,msg:"Pausa la expedición para cambiar objetos."};const old=p.heldItem||null;if(itemId===old)return{ok:true};if(itemId){const it=materialItemDef(itemId);if(!it||it.consumable||it.evolutionStone||it.incense||!canEquip(itemId,p))return{ok:false,msg:"Ese objeto no es compatible."};if(Number(js.inventory?.[itemId]||0)<=0)return{ok:false,msg:"No quedan unidades en la mochila."};}if(!johtoCanSwapHeldItems(old,itemId)){const msg="🎒 Inventario lleno. Libera un espacio antes de retirar este objeto.";window.PokeSendaInventoryFullNotice?.(msg);return{ok:false,msg};}
  if(old){js.inventory[old]=Number(js.inventory?.[old]||0)+1;}if(itemId){js.inventory[itemId]--;if(js.inventory[itemId]<=0)delete js.inventory[itemId];}p.heldItem=itemId||null;if(run?.team?.[id]){refreshCombatant(id);if(itemId)touchRunItem(id);}save();return{ok:true,old,item:itemId||null};}
function useMint(id,natureKey,master=false){migrate();const p=js.pokemon?.[id],n=EXTRA.natures?.[natureKey];if(!p||!n)return{ok:false,msg:"Naturaleza inválida."};if(p.nature===natureKey)return{ok:false,msg:"Ese Pokémon ya tiene esa naturaleza."};if(master){if(js.masterMints<=0)return{ok:false,msg:"No tienes Menta Maestra."};js.masterMints--;}else{if(Number(js.mints?.[natureKey]||0)<=0)return{ok:false,msg:"No tienes esa Menta."};js.mints[natureKey]--;if(js.mints[natureKey]<=0)delete js.mints[natureKey];}const old=p.nature;p.nature=natureKey;if(run?.team?.[id])refreshCombatant(id);save();return{ok:true,old,nature:natureKey};}
function enemyView(uid){if(!run)return null;const e=(run.enemies||[]).find(x=>String(x.uid)===String(uid));if(!e)return null;const all=["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"],weak=[],resist=[],immune=[];for(const type of all){const m=typeMult(type,e.stats.types||species(e.dex).types||[]);if(m===0)immune.push(type);else if(m>1.01)weak.push(type);else if(m<.99)resist.push(type);}return{...JSON.parse(JSON.stringify(e)),name:name(e.dex),types:[...(e.stats.types||species(e.dex).types||[])],weak,resist,immune,moveCategory:moveCategory(e.move),baseStats:rawStatsForDex(e.dex)};}
function johtoRunSummarySnapshot(result,distance,checkpoint){
  if(!run)return null;
  const assignments=Object.fromEntries(battleAssignments().map(x=>[x.id,x.role]));
  const roles=["Guardia","Asalto","Apoyo"];
  const party=(run.partyIds||[]).filter(id=>js.pokemon?.[id]).map((id,index)=>{
    const p=js.pokemon[id],st=run.stats?.[id]||{},role=assignments[id];
    return {id,dex:Number(p.dex||0),name:name(p.dex||0),level:Number(p.level||1),stars:Number(p.stars||1),shiny:!!(p.shinyUnlocked&&p.shinyEquipped),heldItem:p.heldItem||null,heldItemName:p.heldItem?(materialItemDef(p.heldItem)?.name||p.heldItem):null,role:role==null?(index<3?roles[index]||"Reserva":"Reserva"):(roles[role]||"Reserva"),stats:{damage:Number(st.damage||0),healing:Number(st.healing||0),damageTaken:Number(st.damageTaken||0),crits:Number(st.crits||0),superEffective:Number(st.superEffective||0),kos:Number(st.kos||0),deaths:Number(st.deaths||0)}};
  });
  const totals=party.reduce((a,p)=>{a.damage+=p.stats.damage;a.healing+=p.stats.healing;a.damageTaken+=p.stats.damageTaken;a.kos+=p.stats.kos;a.deaths+=p.stats.deaths;return a;},{damage:0,healing:0,damageTaken:0,kos:0,deaths:0}),itemStats=snapshotJohtoItemStats();
  return {result:String(result||"stopped"),route:currentRouteDef().name,distance:Math.max(0,Number(distance??run.distance)||0),checkpoint:Math.max(0,Number(checkpoint)||0),rounds:Number(run.roundIndex||0),defeated:Number(run.defeated||0),earned:Number(run.earned||0),items:Number(run.items||0),duration:Math.max(0,Date.now()-Number(run.startedAt||Date.now())),pauseCount:Number(run.pauseCount||0),pauseHpCorrections:Number(run.pauseHpCorrections||0),pauseHpPrevented:Number(run.pauseHpPrevented||0),party,itemStats,totals};
}

function pushHistory(result,distance,extra={}){
  js.expeditionHistory=Array.isArray(js.expeditionHistory)?js.expeditionHistory:[];
  const stats=run?.stats||{},party=(run?.partyIds||[]).map(id=>{const p=js.pokemon[id]||{};return{id,dex:p.dex||0,name:name(p.dex||0),level:p.level||1,heldItem:p.heldItem||null,heldItemName:p.heldItem?(materialItemDef(p.heldItem)?.name||p.heldItem):null,damage:Math.round(stats[id]?.damage||0),taken:Math.round(stats[id]?.damageTaken||0),healing:Math.round(stats[id]?.healing||0),kos:stats[id]?.kos||0};}),itemStats=snapshotJohtoItemStats();
  js.expeditionHistory.unshift({id:Date.now()+"_"+Math.random().toString(36).slice(2,7),at:new Date().toISOString(),route:currentRouteDef().name,routeId:currentRouteId(),result,distance:Math.floor(distance||0),startDistance:run?.startDistance||0,rounds:run?.roundIndex||0,defeated:run?.defeated||0,money:run?.earned||0,items:run?.items||0,pauseCount:Number(run?.pauseCount||0),pauseHpCorrections:Number(run?.pauseHpCorrections||0),pauseHpPrevented:Number(run?.pauseHpPrevented||0),party,itemStats,...extra});
  js.expeditionHistory=js.expeditionHistory.slice(0,10);save();
}
function startRun(){
  migrate();floatingAutoRestartPending=false;backgroundAutoRestartWallMs=0;if(run)return;const ids=formationIds().slice(0,6);if(!ids.length)return;const start=routeStartPoint(),team={};
  for(const id of ids){const d=derived(js.pokemon[id]);team[id]={familyId:id,ownerId:id,hp:d.maxHp,maxHp:d.maxHp,alive:true,attackTimer:.25+Math.random()*.35,status:null,statusTick:3,confusion:0,guard:0,guardTime:0,haste:0,hasteTime:0,power:0,powerTime:0,autoPotionCooldown:0,supportAttackDebt:0};}
  run={routeId:currentRouteId(),distance:start,startDistance:start,startedAt:Date.now(),wallTickMs:Date.now(),backgroundBacklogReal:0,eventPauseWallMs:0,centerPauseWallMs:0,partyIds:ids,team,enemies:[],roundIndex:0,roundXp:0,roundCombatants:[],pendingBoss:false,bossActive:false,rewardPending:false,centerPending:false,centerBuffRounds:0,eventPending:null,eventBattle:null,eventCooldown:2,eventCount:0,incenseVendorOffers:null,incenseVendorBought:null,mintVendorOffers:null,mintVendorBought:null,mintVendorSeen:false,paused:false,centersVisited:POKEMON_CENTERS.filter(c=>c<=start),spawnDelay:0,defeated:0,earned:0,items:0,log:[],speed:js.options.battleSpeed,stats:Object.fromEntries(ids.map(id=>[id,{damage:0,healing:0,damageTaken:0,crits:0,superEffective:0,kos:0,deaths:0}])),itemStats:{},pauseCount:0,pauseHpCorrections:0,pauseHpPrevented:0};for(const id of ids)touchRunItem(id);
  js.stats.runs++;save();$("pkIsoRunEnd").classList.add("hidden");$("pkIsoCenterOverlay").classList.add("hidden");openBattle();log(currentRouteDef().name+": expedición iniciada desde "+start+" m con "+ids.length+" Pokémon.");spawnRound();schedule();render();
}
function openBattle(){if(window.PokeSendaJohtoRuntime?.showGame){window.PokeSendaJohtoRuntime.showGame();return;}document.querySelectorAll("#pkIsoJohtoRoot .pk-iso-panel").forEach(x=>x.classList.add("hidden"));$("pkIsoJohtoRoot").classList.remove("hidden");$("pkIsoBattle").classList.remove("hidden");}
function failRun(){
  clearInterval(timer);timer=null;const rs=currentRouteState();rs.deaths++;rs.bestDistance=Math.max(rs.bestDistance,run.distance);const failedDistance=Math.floor(run.distance),failedCheckpoint=routeStartPoint(),summary=johtoRunSummarySnapshot("defeat",failedDistance,failedCheckpoint);pushHistory("Derrota",run.distance);save();const auto=!!js.options.autoRepeat&&skillRank("a3")>=1&&formationIds().length>0;
  if(auto){run=null;queueAutoRestart();return;}
  if(window.PokeSendaJohtoRuntime?.onRunFailed){run=null;window.PokeSendaJohtoRuntime.onRunFailed(failedDistance,failedCheckpoint,summary);return;}
  $("pkIsoRunEndText").textContent="Llegaste a "+failedDistance+" m. La siguiente expedición partirá desde "+failedCheckpoint+" m.";$("pkIsoRunEnd").classList.remove("hidden");
}
function stopRun(silent=false){
  floatingAutoRestartPending=false;clearInterval(timer);timer=null;clearInterval(centerTimer);centerTimer=null;const distance=Number(run?.distance||0),checkpoint=routeStartPoint(),summary=run?johtoRunSummarySnapshot("stopped",distance,checkpoint):null;if(run&&run.distance>=(run.startDistance||0))pushHistory("Detenida",run.distance);run=null;if(silent)return true;if(summary&&window.PokeSendaJohtoRuntime?.onRunStopped){window.PokeSendaJohtoRuntime.onRunStopped(summary);return true;}if(window.PokeSendaJohtoRuntime?.showLobby)window.PokeSendaJohtoRuntime.showLobby();else API()?.open?.();return true;
}
function statusText(ent){const a=[];if(ent.status?.type)a.push(STATUS_META[ent.status.type]);if((ent.confusion||0)>0)a.push(STATUS_META.confusion);return a.join(" ");}
let pkIsoPartyRenderSig="",pkIsoEnemyRenderSig="";
function pkIsoRenderPartyStable(assign,roleNames){
  const host=$("pkIsoBattleTeam"),sig=JSON.stringify(run.partyIds.map(id=>{const p=js.pokemon[id];return[id,p?.dex,p?.level,!!p?.shinyUnlocked,p?.heldItem||"",p?.nature||"",assign[id]];}));
  if(pkIsoPartyRenderSig!==sig||host.querySelectorAll('[data-iso-party]').length!==run.partyIds.length){pkIsoPartyRenderSig=sig;host.innerHTML=run.partyIds.map(id=>{const t=run.team[id],p=js.pokemon[id],hp=Math.max(0,t.hp/t.maxHp*100),need=Math.max(1,xpNeed(p.level)),xp=p.level>=MAX_LEVEL?100:Math.min(100,(p.xp||0)/need*100),role=assign[id];return'<article class="pk-iso-battler '+(!t.alive?'fainted':'')+'" data-iso-party="'+id+'"><img src="'+gif(p.dex,true,!!p.shinyUnlocked)+'"><div><b data-iso-name>'+name(p.dex)+' · Nv.'+p.level+'</b><span class="pk-iso-role" data-iso-role>'+(role!=null?roleNames[role]:'Banca')+'</span><small data-iso-meta>'+natureName(p.nature)+(p.heldItem?' · '+(EXTRA.itemDefs[p.heldItem]?.name||p.heldItem):'')+'</small><div class="pk-iso-status" data-iso-status>'+statusText(t)+'</div><div class="pk-iso-hp '+(hp<30?'low':'')+'"><i style="width:'+hp+'%"></i></div><small data-iso-hp>'+Math.ceil(t.hp)+' / '+Math.ceil(t.maxHp)+' PS</small><div class="pk-iso-exp"><i style="width:'+xp+'%"></i></div></div></article>';}).join('');}
  for(const id of run.partyIds){const card=host.querySelector('[data-iso-party="'+id+'"]'),t=run.team[id],p=js.pokemon[id];if(!card||!t||!p)continue;const hp=Math.max(0,t.hp/t.maxHp*100),need=Math.max(1,xpNeed(p.level)),xp=p.level>=MAX_LEVEL?100:Math.min(100,(p.xp||0)/need*100),role=assign[id],bar=card.querySelector('.pk-iso-hp'),fill=bar?.querySelector('i');card.classList.toggle('fainted',!t.alive);if(fill)fill.style.width=hp+'%';bar?.classList.toggle('low',hp<30);const hpTxt=card.querySelector('[data-iso-hp]');if(hpTxt)hpTxt.textContent=Math.ceil(t.hp)+' / '+Math.ceil(t.maxHp)+' PS';const xpFill=card.querySelector('.pk-iso-exp i');if(xpFill)xpFill.style.width=xp+'%';const stat=card.querySelector('[data-iso-status]');if(stat)stat.textContent=statusText(t);const roleEl=card.querySelector('[data-iso-role]');if(roleEl)roleEl.textContent=role!=null?roleNames[role]:'Banca';}
}
function pkIsoRenderEnemiesStable(){
  const host=$("pkIsoEnemyTeam"),list=run.enemies||[],sig=JSON.stringify(list.map(e=>[e.uid,e.dex,e.level,!!e.boss,e.move?.name||'']));
  if(pkIsoEnemyRenderSig!==sig||host.querySelectorAll('[data-iso-enemy]').length!==list.length){pkIsoEnemyRenderSig=sig;host.innerHTML=list.map((e,i)=>{const hp=Math.max(0,e.hp/e.maxHp*100),key=e.uid||('e'+i);return'<article class="pk-iso-enemy-card '+(e.boss?'boss ':'')+(!e.alive?'dead':'')+'" data-iso-enemy="'+key+'"><img src="'+gif(e.dex)+'"><b>'+name(e.dex)+' · Nv.'+e.level+(e.boss?' · JEFE':'')+'</b><small>'+e.move.name+'</small><div class="pk-iso-status" data-iso-status>'+statusText(e)+'</div><div class="pk-iso-hp '+(hp<30?'low':'')+'" style="width:90%"><i style="width:'+hp+'%"></i></div><small data-iso-hp>'+Math.ceil(Math.max(0,e.hp))+' / '+Math.ceil(e.maxHp)+' PS</small></article>';}).join('');}
  list.forEach((e,i)=>{const key=e.uid||('e'+i),card=host.querySelector('[data-iso-enemy="'+key+'"]');if(!card)return;const hp=Math.max(0,e.hp/e.maxHp*100),bar=card.querySelector('.pk-iso-hp'),fill=bar?.querySelector('i');card.classList.toggle('dead',!e.alive);if(fill)fill.style.width=hp+'%';bar?.classList.toggle('low',hp<30);const hpTxt=card.querySelector('[data-iso-hp]');if(hpTxt)hpTxt.textContent=Math.ceil(Math.max(0,e.hp))+' / '+Math.ceil(e.maxHp)+' PS';const stat=card.querySelector('[data-iso-status]');if(stat)stat.textContent=statusText(e);});
}
function render(){
  if(backgroundCatchingUp)return;if(!run)return;const legacy=document.getElementById("pkIsoJohtoRoot");if(legacy?.classList.contains("hidden")&&window.PokeSendaJohtoRuntime)return;const rd=currentRouteDef(),sectors=rd.sectors||["Tramo I","Tramo II","Tramo III"],sec=run.distance<3334?[1,sectors[0]]:run.distance<6667?[2,sectors[1]]:[3,sectors[2]],rs=currentRouteState();
  $("pkIsoBattleScene").className="pk-iso-battle-scene sector-"+sec[0];$("pkIsoBattleSceneLabel").textContent=sec[1];$("pkIsoBattleSector").textContent=sec[1];$("pkIsoBattleDistance").textContent=Math.floor(run.distance).toLocaleString("es-CL")+" m / 10 km";$("pkIsoBattleDistanceFill").style.width=Math.min(100,run.distance/MAX_DISTANCE*100)+"%";$("pkIsoBattleCheckpoint").textContent="Checkpoint · "+routeStartPoint().toLocaleString("es-CL")+" m";$("pkIsoBattleMoney").textContent="₽"+Math.floor(js.money||0).toLocaleString("es-CL");
  const assign=Object.fromEntries(battleAssignments().map(x=>[x.id,x.role])),roleNames=["Guardia","Asalto","Apoyo"];
  pkIsoRenderPartyStable(assign,roleNames);
  pkIsoRenderEnemiesStable();
  $("pkIsoBattleEvent").textContent=run.bossActive?"⚠ Jefe de kilómetro":"Oleada "+run.roundIndex;$("pkIsoRunStats").innerHTML='<span><b>'+run.roundIndex+'</b>Oleadas</span><span><b>'+run.defeated+'</b>Derrotados</span><span><b>₽'+run.earned+'</b>Ganado</span><span><b>'+run.items+'</b>Objetos</span>';
  document.querySelectorAll("[data-iso-battle-speed]").forEach(b=>b.classList.toggle("active",Number(b.dataset.isoBattleSpeed)===run.speed));$("pkIsoBattleAuto").classList.toggle("active",!!js.options.autoRepeat);$("pkIsoBattleAutoPotion").classList.toggle("active",!!js.options.autoPotion);$("pkIsoBattleAutoBall").classList.toggle("active",!!js.options.autoOpen);
}
function renderFormation(){
  ensureJohtoState();const labels=["1 · Guardia","2 · Asalto","3 · Apoyo","4 · Guardia","5 · Asalto","6 · Apoyo"],owned=Object.keys(js.pokemon);
  $("pkIsoFormationGrid").innerHTML=labels.map((label,i)=>{const id=js.formation[i],p=id?js.pokemon[id]:null,options=['<option value="">— Vacío —</option>',...owned.map(x=>'<option value="'+x+'" '+(x===id?"selected":"")+'>'+name(js.pokemon[x].dex)+' · Nv.'+js.pokemon[x].level+'</option>')].join(""),itemOptions=p?['<option value="">Sin objeto</option>',...Object.keys(js.inventory).filter(x=>(js.inventory[x]||0)>0&&canEquip(x,p)).map(x=>'<option value="'+x+'" '+(p.heldItem===x?"selected":"")+'>'+(EXTRA.itemDefs[x]?.name||x)+' · x'+js.inventory[x]+'</option>')].join(""):"";return'<div class="pk-iso-form-slot '+(i>=3?"bench":"")+'"><h3>'+label+'</h3><select data-iso-form-slot="'+i+'">'+options+'</select><div class="pk-iso-form-mon">'+(p?'<img src="'+gif(p.dex)+'"><div><b>'+name(p.dex)+'</b><small>Nv.'+p.level+' · '+natureName(p.nature)+'</small><small>Copias: '+(p.copies||1)+'</small></div>':'<div></div><div><small>Sin Pokémon asignado</small></div>')+'</div>'+(p?'<select data-iso-held-for="'+id+'">'+itemOptions+'</select>':'')+'</div>';}).join("");
}
function setFormationSlot(i,id){
  i=Number(i);if(id&&js.formation.some((x,idx)=>x===id&&idx!==i)){const old=js.formation.indexOf(id);js.formation[old]=js.formation[i]||null;}js.formation[i]=id||null;save();renderFormation();
}
function renderCheckpointSelect(){
  ensureJohtoState();const rs=currentRouteState(),sel=$("pkIsoFarmCheckpoint");if(!sel)return;const unlocked=[0,...POKEMON_CENTERS.filter(c=>(rs.centersSeen||[]).includes(c)||rs.completions>0)],auto=rs.farmCheckpoint===null||rs.farmCheckpoint===undefined||rs.farmCheckpoint==="auto";sel.innerHTML='<option value="auto" '+(auto?"selected":"")+'>Automático · último checkpoint ('+Number(rs.checkpoint||0).toLocaleString("es-CL")+' m)</option>'+unlocked.map(c=>'<option value="'+c+'" '+(!auto&&Number(rs.farmCheckpoint)===c?"selected":"")+'>'+c.toLocaleString("es-CL")+' m'+(c===0?" · inicio":" · Centro Pokémon")+'</option>').join("");
}
function bind(){
  migrate();renderCheckpointSelect();
  $("pkIsoFormationBtn")?.addEventListener("click",()=>{document.querySelectorAll("#pkIsoJohtoRoot .pk-iso-panel").forEach(x=>x.classList.add("hidden"));$("pkIsoFormation").classList.remove("hidden");renderFormation();});
  $("pkIsoFormationBack")?.addEventListener("click",()=>API()?.open?.());
  $("pkIsoFormationGrid")?.addEventListener("change",e=>{if(e.target.matches("[data-iso-form-slot]"))setFormationSlot(e.target.dataset.isoFormSlot,e.target.value);if(e.target.matches("[data-iso-held-for]")){const p=js.pokemon[e.target.dataset.isoHeldFor];if(p){p.heldItem=e.target.value||null;save();renderFormation();}}});
  $("pkIsoFarmCheckpoint")?.addEventListener("change",e=>{currentRouteState().farmCheckpoint=e.target.value==="auto"?null:Number(e.target.value);save();});
  $("pkIsoPlayRoute1")?.addEventListener("click",startRun);
  document.querySelectorAll("[data-iso-battle-speed]").forEach(b=>b.addEventListener("click",()=>{const s=Number(b.dataset.isoBattleSpeed);if(![1,2,4].includes(s))return;js.options.battleSpeed=s;if(run)run.speed=s;save();render();}));
  $("pkIsoBattleAuto")?.addEventListener("click",()=>{js.options.autoRepeat=!js.options.autoRepeat;save();render();});
  $("pkIsoBattleAutoPotion")?.addEventListener("click",()=>{js.options.autoPotion=!js.options.autoPotion;save();render();});
  $("pkIsoBattleAutoBall")?.addEventListener("click",()=>{js.options.autoOpen=!js.options.autoOpen;save();render();});
  $("pkIsoBattleStop")?.addEventListener("click",stopRun);$("pkIsoBattleLobby")?.addEventListener("click",stopRun);$("pkIsoRetryCheckpoint")?.addEventListener("click",()=>{run=null;$("pkIsoRunEnd").classList.add("hidden");startRun();});
  $("pkIsoCenterContinue")?.addEventListener("click",closeCenter);$("pkIsoCenterLobby")?.addEventListener("click",stopRun);
  $("pkIsoOpenReward")?.addEventListener("click",openReward);$("pkIsoBattleRewardContinue")?.addEventListener("click",continueReward);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();

document.addEventListener("visibilitychange",()=>{
  try{
    if(document.hidden){backgroundWasEligibleOnHide=!!run&&(!run.paused||run.centerPending||run.eventPending);if(run)run.wallTickMs=Date.now();return;}
    const paintThenDrain=seconds=>{johtoSafeBackgroundRender();const go=()=>{if(seconds>.001)johtoQueueBackgroundGap(seconds);johtoScheduleBackgroundDrain(0);};if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>setTimeout(go,0));else setTimeout(go,0);};
    if(!run){if(floatingAutoRestartPending&&js.options.autoRepeat){const now=Date.now(),started=Number(backgroundAutoRestartWallMs||now),extra=Math.max(0,(now-started)/1000);startRun();paintThenDrain(extra);}backgroundWasEligibleOnHide=false;return;}
    const now=Date.now();if(!backgroundWasEligibleOnHide&&!run.centerPending&&!run.eventPending){run.wallTickMs=now;johtoSetBackgroundBacklog(0);johtoSafeBackgroundRender();return;}backgroundWasEligibleOnHide=false;
    if(run.centerPending){const age=(now-Number(run.centerPauseWallMs||now))/1000;if(age>=10){const extra=Math.max(0,age-10);closeCenter();paintThenDrain(extra);return;}}
    if(run.eventPending&&run.paused){const age=(now-Number(run.eventPauseWallMs||now))/1000;if(age>=10){const extra=Math.max(0,age-10);resolveRouteEvent("ignore");paintThenDrain(extra);return;}}
    const gap=Math.max(0,Math.min(J_BG_MAX_BACKLOG_REAL,(now-Number(run.wallTickMs||now))/1000));run.wallTickMs=now;if(gap>.35||johtoBackgroundBacklog()>.001)paintThenDrain(gap);else{if(backgroundSaveDirty){backgroundSaveDirty=false;localStorage.setItem(SAVE,JSON.stringify(js));}johtoSafeBackgroundRender();}
  }catch(e){console.error("PokéSenda · recuperación segundo plano Johto",e);backgroundDrainFaulted=true;johtoSetBackgroundBacklog(0);johtoSafeBackgroundRender();}
});

function johtoMaxLevelRelearnPlan(id){
  const p=js.pokemon?.[id];if(!p)return{refund:0,baseRanks:[1,0,0,1],oldRanks:[1,0,0,1]};
  const oldRanks=Array.isArray(p.moveRanks)?p.moveRanks.slice(0,4):[1,0,0,1];while(oldRanks.length<4)oldRanks.push(0);
  const stage=stageIndex(id,p.dex),moves=DATA().movesets?.[id]||[],load=tmLoadout(p);
  const baseRanks=oldRanks.map((_,i)=>{if(load[i]&&tmDef(load[i])&&tmSlotAccepts(i,load[i]))return 1;const m=moves[i];return m&&(m.kind==="support"||Number(m.unlockStage||0)<=stage)?1:0;});
  const refund=oldRanks.reduce((sum,r,i)=>sum+Math.max(0,Math.max(0,Number(r)||0)-baseRanks[i]),0);
  return{refund,baseRanks,oldRanks};
}
function johtoUseRelearningOrb(id){
  migrate();const p=js.pokemon?.[id],left=Math.max(0,Number(js.inventory?.relearning_orb||0));if(!p||left<=0)return{ok:false,msg:"No tienes Orbes de Reaprendizaje en el Inventario."};
  if(run&&!run.paused)return{ok:false,msg:"Pausa la expedición para reconfigurar movimientos."};
  const plan=johtoMaxLevelRelearnPlan(id);if(plan.refund<=0)return{ok:false,msg:"No hay puntos invertidos para recuperar."};
  p.moveRanks=plan.baseRanks.slice();p.skillPoints=Math.max(0,Number(p.skillPoints||0))+plan.refund;js.inventory.relearning_orb=left-1;if(js.inventory.relearning_orb<=0){delete js.inventory.relearning_orb;js.itemUnread=(js.itemUnread||[]).filter(x=>x!=="relearning_orb");}
  if(run?.team?.[id])refreshCombatant(id);save();log("🔮 Orbe de Reaprendizaje: "+name(p.dex)+" reinició sus movimientos y recuperó "+plan.refund+" punto"+(plan.refund===1?"":"s")+".");return{ok:true,refund:plan.refund,left:Math.max(0,Number(js.inventory?.relearning_orb||0))};
}
function johtoUseMaxLevelRelearn(id){
  migrate();const p=js.pokemon?.[id];if(!p||Number(p.level||0)<MAX_LEVEL)return{ok:false,msg:"Disponible al llegar a Nv.60."};
  if(p.maxLevelRelearnUsed)return{ok:false,msg:"Ese Orbe personal ya fue utilizado."};
  if(run&&!run.paused)return{ok:false,msg:"Pausa la expedición para reconfigurar movimientos."};
  const plan=johtoMaxLevelRelearnPlan(id);if(plan.refund<=0)return{ok:false,msg:"No hay puntos invertidos para recuperar."};
  p.moveRanks=plan.baseRanks.slice();p.skillPoints=Math.max(0,Number(p.skillPoints||0))+plan.refund;p.maxLevelRelearnUsed=true;if(run?.team?.[id])refreshCombatant(id);save();log("🔮 "+name(p.dex)+" usó su Orbe personal de Nv."+MAX_LEVEL+" y recuperó "+plan.refund+" punto"+(plan.refund===1?"":"s")+".");return{ok:true,refund:plan.refund};
}

function johtoMtGachaPoolIds(){return Object.values(DATA().tms||{}).filter(t=>!t.gymLeader).map(t=>t.id);}
function johtoMtGachaPoolCompleted(){const ids=johtoMtGachaPoolIds();return ids.length>0&&ids.every(id=>!!js.tms?.[id]);}
function johtoMtGachaCompensation(tmId){return tmDef(tmId)?.tier==="rare"?6000:3000;}
function johtoRetireMTTicketsIfComplete(persist=true){if(!johtoMtGachaPoolCompleted())return 0;js.mtGacha=Object.assign({tickets:0,pulls:0,duplicateStreak:0,history:[]},js.mtGacha||{});const retired=Math.max(0,Math.floor(Number(js.mtGacha.tickets||0)));if(!retired)return 0;js.mtGacha.tickets=0;js.money=(js.money||0)+retired*5000;if(persist)save();return retired;}
function johtoGrantMTGachaTicket(count=1){migrate();if(johtoMtGachaPoolCompleted()){johtoRetireMTTicketsIfComplete(true);return 0;}const n=Math.max(1,Math.floor(Number(count)||1));js.mtGacha.tickets=Math.max(0,Number(js.mtGacha.tickets||0))+n;save();return n;}

/* Casino Trigal · economía regional aislada, misma base de reglas que Kanto. */
function ensureJohtoCasinoState(){
  js.casino=js.casino&&typeof js.casino==="object"?js.casino:{};
  js.casino.unlocked=!!js.casino.unlocked||Number(js.routes?.johto_route2?.completions||0)>0;
  js.casino.chips=Math.max(0,Math.floor(Number(js.casino.chips)||0));
  js.casino.stats=Object.assign({blackjackHands:0,blackjackWins:0,blackjackPushes:0,blackjackNet:0,rouletteSpins:0,rouletteWins:0,rouletteNet:0,totalWagered:0,biggestWin:0,allTimeNet:0},js.casino.stats||{});
  js.casino.rouletteHistory=(Array.isArray(js.casino.rouletteHistory)?js.casino.rouletteHistory:[]).map(x=>Math.max(0,Math.min(36,Math.floor(Number(typeof x==="object"?x.n:x)||0)))).slice(0,18);
  return js.casino;
}
function johtoCasinoUnlocked(){ensureJohtoState();return !!ensureJohtoCasinoState().unlocked;}
function johtoCasinoMaxBet(){ensureJohtoState();if(Number(js.gyms?.badges?.length||0)>=8)return 250000;if(Number(js.routes?.johto_route3?.completions||0)>0)return 75000;return 25000;}
function johtoCasinoInfo(){ensureJohtoState();const c=ensureJohtoCasinoState();return JSON.parse(JSON.stringify({unlocked:johtoCasinoUnlocked(),maxBet:johtoCasinoMaxBet(),money:Math.max(0,Math.floor(Number(js.money)||0)),chips:c.chips,stats:c.stats,rouletteHistory:c.rouletteHistory}));}
function johtoCasinoDeposit(amount){migrate();if(!johtoCasinoUnlocked())return{ok:false,msg:"Completa Bosque Ancestral para desbloquear el Casino Trigal."};amount=Math.max(0,Math.floor(Number(amount)||0));if(amount<1000)return{ok:false,msg:"Ingreso mínimo: ₽1.000"};if(amount>Number(js.money||0))return{ok:false,msg:"No tienes suficientes Pokédólares"};const c=ensureJohtoCasinoState();js.money-=amount;c.chips+=amount;save();return{ok:true,...johtoCasinoInfo()};}
function johtoCasinoWithdrawAll(){migrate();const c=ensureJohtoCasinoState();if(c.chips<=0)return{ok:true,...johtoCasinoInfo()};js.money=Math.max(0,Number(js.money||0))+c.chips;c.chips=0;save();return{ok:true,...johtoCasinoInfo()};}
function johtoCasinoTake(amount){migrate();if(!johtoCasinoUnlocked())return{ok:false,msg:"Casino bloqueado"};amount=Math.max(0,Math.floor(Number(amount)||0));const c=ensureJohtoCasinoState();if(amount<=0)return{ok:false,msg:"Apuesta inválida"};if(c.chips<amount)return{ok:false,msg:"Fichas insuficientes · ingresa Pokédólares en la caja"};c.chips-=amount;save();return{ok:true,amount,...johtoCasinoInfo()};}
function johtoCasinoResolve(game,wager,payout,rouletteNumber=null){migrate();if(!johtoCasinoUnlocked())return{ok:false,msg:"Casino bloqueado"};const c=ensureJohtoCasinoState(),st=c.stats;wager=Math.max(0,Math.floor(Number(wager)||0));payout=Math.max(0,Math.floor(Number(payout)||0));c.chips+=payout;const net=payout-wager;st.totalWagered+=wager;st.allTimeNet+=net;if(net>0)st.biggestWin=Math.max(Number(st.biggestWin||0),net);if(game==="blackjack"){st.blackjackHands++;if(net>0)st.blackjackWins++;if(net===0)st.blackjackPushes++;st.blackjackNet+=net;}else if(game==="roulette"){st.rouletteSpins++;if(net>0)st.rouletteWins++;st.rouletteNet+=net;if(Number.isInteger(Number(rouletteNumber)))c.rouletteHistory=[Math.max(0,Math.min(36,Number(rouletteNumber))),...(c.rouletteHistory||[])].slice(0,18);}save();return{ok:true,net,...johtoCasinoInfo()};}

/* Johto runtime · integridad de pausa y puentes administrativos protegidos. */
// Pause integrity helpers belong to the Johto engine scope.
function johtoPauseHpSnapshot(){if(!run)return null;const snap={};for(const [id,t] of Object.entries(run.team||{})){if(t)snap[id]={hp:Math.max(0,Number(t.hp)||0),maxHp:Math.max(1,Number(t.maxHp)||1),alive:!!t.alive};}return snap;}
function johtoPauseIntegrityState(){const a=js.pauseIntegrity||(js.pauseIntegrity={version:1,totalPauses:0,preventedHealEvents:0,preventedHp:0,lastAt:0});return a;}
function johtoGuardPauseHp(snapshot,phase="pause"){if(!run||!snapshot)return 0;let events=0,prevented=0;for(const [id,before] of Object.entries(snapshot)){const t=run.team?.[id];if(!t)continue;if(!before.alive){if(t.alive||Number(t.hp)>0){prevented+=Math.max(0,Number(t.hp)||0);t.alive=false;t.hp=0;events++;}continue;}const ceiling=Math.max(0,Math.min(Number(t.maxHp)||before.maxHp,before.hp));if(Number(t.hp)>ceiling+.001){prevented+=Number(t.hp)-ceiling;t.hp=ceiling;events++;}}if(events){run.pauseHpCorrections=(run.pauseHpCorrections||0)+events;run.pauseHpPrevented=(run.pauseHpPrevented||0)+prevented;const a=johtoPauseIntegrityState();a.preventedHealEvents+=events;a.preventedHp+=prevented;a.lastAt=Date.now();console.warn(`PokéSenda Johto · integridad de pausa (${phase}): se bloquearon ${events} restauraciones de PS (${Math.round(prevented)} PS).`);}return events;}
const JOHTO_ROUTE_LEGENDARY_FIX={
 j_raikou:{dex:243,name:"Raikou"},j_entei:{dex:244,name:"Entei"},j_suicune:{dex:245,name:"Suicune"},
 j_lugia:{dex:249,name:"Lugia"},j_hooh:{dex:250,name:"Ho-Oh"},j_celebi:{dex:251,name:"Celebi"}
};
function johtoApplyAdminLegendaryCleanup(entry={}){
 try{
  migrate();
  const nonce=String(entry?.nonce||"");if(!nonce)return{ok:false,msg:"Corrección sin identificador"};
  const rawNote=String(entry?.note||"");
  const mode=rawNote.startsWith("AUDIT|")?"audit":rawNote.startsWith("FORCE|")?"force":rawNote.startsWith("GRANT|")?"grant":"auto";
  const forceIds=mode==="force"?rawNote.slice(6).split(",").map(x=>x.trim()).filter(x=>JOHTO_ROUTE_LEGENDARY_FIX[x]):[];
  const grantParts=mode==="grant"?rawNote.slice(6).split("|"):[];
  const grantId=mode==="grant"&&JOHTO_ROUTE_LEGENDARY_FIX[String(grantParts[0]||"").trim()]?String(grantParts[0]||"").trim():null;
  const grantFallbackLevel=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(grantParts[1]||20)||20)));
  js.adminLegendaryCorrections=Array.isArray(js.adminLegendaryCorrections)?js.adminLegendaryCorrections:[];
  if(mode!=="audit"&&js.adminLegendaryCorrections.some(x=>String(x?.nonce||"")===nonce))return{ok:false,msg:"Esta corrección ya fue aplicada",duplicate:true};
  const cutoff=Math.max(1,Number(entry?.cutoffMs)||Date.now()),ticketsPer=Math.max(0,Math.min(20,Math.floor(Number(entry?.ticketsPerLegendary)||2)));
  const captures=Array.isArray(js.captureLog)?js.captureLog:[],removed=[],preserved=[],uncertain=[];
  const routeSource=s=>/Pradera Ámbar|Bosque Ancestral|Senda Plateada/i.test(String(s||""));
  const premiumSource=s=>/Premium|Ticket Premium|Gachapon Premium|Gachapón Premium/i.test(String(s||""));
  const eventsFor=(id,meta)=>captures.filter(e=>String(e?.id||"")===id||Number(e?.dex)===meta.dex).slice().sort((a,b)=>Number(a?.ts||0)-Number(b?.ts||0));
  const auditLegend=(id,meta)=>{
   const poke=js.pokemon?.[id]||null,ev=eventsFor(id,meta),firstNew=ev.find(e=>/Nueva familia obtenida/i.test(String(e?.outcome||"")))||null;
   const routeEvents=ev.filter(e=>routeSource(e?.source)),premiumEvents=ev.filter(e=>premiumSource(e?.source));
   const copies=poke?Math.max(1,Number(poke.copies||1)):0,loggedCaptures=ev.length,historyComplete=!!poke&&loggedCaptures>=copies,earliest=ev[0]||null;
   let verdict="not_owned",reason="No está en la colección";
   if(poke){
    if(poke.adminRestoredPremium){verdict="premium_confirmed";reason="Restaurado por administración como captura Premium legítima";}
    else if(firstNew){
     const ts=Number(firstNew.ts||0);
     if(routeSource(firstNew.source)&&ts<=cutoff){verdict="route_confirmed";reason="Primera obtención registrada en ruta antes del corte";}
     else if(premiumSource(firstNew.source)){verdict="premium_confirmed";reason="Primera obtención registrada por Gachapón Premium";}
     else if(routeSource(firstNew.source)&&ts>cutoff){verdict="after_cutoff";reason="Primera obtención de ruta posterior al corte";}
     else{verdict="legit_other";reason="Primera obtención registrada fuera de rutas afectadas";}
    }else if(historyComplete&&earliest){
     const ts=Number(earliest.ts||0);
     if(premiumSource(earliest.source)){verdict="premium_confirmed";reason="El historial conserva todas sus capturas y la primera registrada es Premium";}
     else if(routeSource(earliest.source)&&ts<=cutoff){verdict="route_confirmed";reason="El historial conserva todas sus capturas y la primera registrada fue en ruta antes del corte";}
     else if(routeSource(earliest.source)&&ts>cutoff){verdict="after_cutoff";reason="El historial conserva todas sus capturas y la primera registrada fue en ruta después del corte";}
     else{verdict="legit_other";reason="El historial conserva todas sus capturas y la primera fue de una fuente no afectada";}
    }else if(copies===1&&premiumEvents.length){
     verdict="premium_confirmed";reason="Posee una sola copia y existe una captura Premium registrada; esa captura necesariamente fue su obtención";
    }else if(copies===1&&routeEvents.length&&!premiumEvents.length){
     const oldestRoute=routeEvents[0],ts=Number(oldestRoute?.ts||0);
     if(ts&&ts>cutoff){verdict="after_cutoff";reason="Posee una sola copia y la única evidencia disponible es una captura de ruta posterior al corte";}
     else{verdict="route_probable";reason="Posee una sola copia y existe captura de ruta antes del corte; evidencia fuerte de obtención afectada";}
    }else if(premiumEvents.length&&!routeEvents.length){
     verdict="premium_probable";reason="Hay evidencia Premium conservada, pero faltan capturas antiguas para demostrar el origen con certeza";
    }else{
     verdict="unknown";reason=ev.length?"El historial conservado no demuestra la primera obtención":"La primera captura ya salió del historial de 150 entradas";
    }
   }
   return{id,name:meta.name,dex:meta.dex,owned:!!poke,level:poke?Number(poke.level||1):0,copies,shiny:!!poke?.shinyUnlocked,verdict,reason,historyComplete,loggedCaptures,firstNew:firstNew?{ts:Number(firstNew.ts||0),source:String(firstNew.source||""),outcome:String(firstNew.outcome||"")}:null,routeEvidence:routeEvents.slice(-3).map(e=>({ts:Number(e.ts||0),source:String(e.source||""),outcome:String(e.outcome||"")})),premiumEvidence:premiumEvents.slice(-3).map(e=>({ts:Number(e.ts||0),source:String(e.source||""),outcome:String(e.outcome||"")}))};
  };
  const audit=Object.entries(JOHTO_ROUTE_LEGENDARY_FIX).map(([id,meta])=>auditLegend(id,meta));
  if(mode==="audit")return{ok:true,audit:true,cutoffMs:cutoff,legends:audit,historyLimit:150};
  if(mode==="grant"){
   if(!grantId)return{ok:false,msg:"Legendario inválido para restaurar"};
   const meta=JOHTO_ROUTE_LEGENDARY_FIX[grantId];
   try{localStorage.setItem("pokesenda_johto_before_admin_legendary_restore_v1",JSON.stringify({at:Date.now(),correctionId:nonce,data:JSON.parse(JSON.stringify(js))}));}catch(_){}
   if(js.pokemon?.[grantId]){
    js.adminLegendaryCorrections.unshift({nonce,at:Date.now(),mode:"grant",restored:[],alreadyOwned:[grantId],note:rawNote.slice(0,160)});
    js.adminLegendaryCorrections=js.adminLegendaryCorrections.slice(0,50);save();
    return{ok:true,mode:"grant",restored:[],alreadyOwned:true,preserved:[{id:grantId,name:meta.name,reason:"Ya lo tenía en la colección"}],tickets:0};
   }
   let restored=null,restoreSource="manual-fallback",exact=false,heldItemRestored=false;
   try{
    const snap=JSON.parse(localStorage.getItem("pokesenda_johto_before_admin_legendary_fix_v1")||"null");
    const prior=snap?.data?.pokemon?.[grantId];
    if(prior){
     restored=JSON.parse(JSON.stringify(prior));exact=true;restoreSource="admin-backup";
     const item=restored.heldItem||null;
     if(item){js.inventory=js.inventory&&typeof js.inventory==="object"?js.inventory:{};const have=Math.max(0,Number(js.inventory[item]||0));if(have>0){js.inventory[item]=have-1;if(js.inventory[item]<=0)delete js.inventory[item];heldItemRestored=true;}else restored.heldItem=null;}
     js.pokemon[grantId]=restored;markJohtoDexNew(Number(restored.dex||meta.dex));if(restored.shinyUnlocked)registerJohtoShinyDex(Number(restored.dex||meta.dex));
     const oldFormation=Array.isArray(snap?.data?.formation)?snap.data.formation:[],oldIndex=oldFormation.indexOf(grantId);js.formation=Array.isArray(js.formation)?js.formation:[];
     if(oldIndex>=0&&!js.formation.includes(grantId)&&js.formation.length<6){js.formation.splice(Math.min(oldIndex,js.formation.length),0,grantId);js.formation=js.formation.slice(0,6);}
    }
   }catch(_){}
   if(!restored){
    const ev=eventsFor(grantId,meta),premiumEvents=ev.filter(e=>premiumSource(e?.source)),premiumNew=premiumEvents.find(e=>/Nueva familia obtenida/i.test(String(e?.outcome||"")))||premiumEvents[0]||null;
    const level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(premiumNew?.level||grantFallbackLevel)||grantFallbackLevel)));
    restored=createPokemon(grantId,level,false,!!premiumNew?.shiny,meta.dex);restoreSource=premiumNew?"premium-history":"manual-fallback";
   }
   if(!restored)return{ok:false,msg:"No se pudo reconstruir el legendario"};
   restored.adminRestoredPremium=true;restored.adminRestoredAt=Date.now();restored.adminRestoredNonce=nonce;
   markJohtoDexNew(Number(restored.dex||meta.dex));if(restored.shinyUnlocked)registerJohtoShinyDex(Number(restored.dex||meta.dex));
   recordJohtoCapture({fid:grantId,dex:Number(restored.dex||meta.dex),level:Number(restored.level||grantFallbackLevel),rarity:"legendary",outcome:"Restaurado por corrección administrativa",source:"Restauración administrativa · Premium legítimo",shiny:!!restored.shinyUnlocked});
   const restoredInfo={id:grantId,name:meta.name,dex:meta.dex,level:Number(restored.level||1),shiny:!!restored.shinyUnlocked,exact,source:restoreSource,heldItemRestored};
   js.adminLegendaryCorrections.unshift({nonce,at:Date.now(),mode:"grant",restored:[grantId],source:restoreSource,note:rawNote.slice(0,160)});js.adminLegendaryCorrections=js.adminLegendaryCorrections.slice(0,50);
   save();try{render();}catch(_){}
   return{ok:true,mode:"grant",restored:[restoredInfo],tickets:0,exact,source:restoreSource};
  }
  try{localStorage.setItem("pokesenda_johto_before_admin_legendary_fix_v1",JSON.stringify({at:Date.now(),correctionId:nonce,data:JSON.parse(JSON.stringify(js))}));}catch(_){}
  const removeOne=(id,meta,reason,source="")=>{
   const poke=js.pokemon?.[id];if(!poke)return false;
   if(poke.heldItem){js.inventory=js.inventory&&typeof js.inventory==="object"?js.inventory:{};js.inventory[poke.heldItem]=Math.max(0,Number(js.inventory[poke.heldItem]||0))+1;}
   delete js.pokemon[id];
   js.formation=Array.isArray(js.formation)?js.formation.filter(x=>x!==id):[];
   js.dex=Array.isArray(js.dex)?js.dex.filter(d=>Number(d)!==meta.dex):[];
   js.shinyDex=Array.isArray(js.shinyDex)?js.shinyDex.filter(d=>Number(d)!==meta.dex):[];
   js.dexUnread=Array.isArray(js.dexUnread)?js.dexUnread.filter(d=>Number(d)!==meta.dex):[];
   removed.push({id,name:meta.name,dex:meta.dex,source:String(source||""),reason:String(reason||"")});
   return true;
  };
  if(mode==="force"){
   for(const id of [...new Set(forceIds)]){const meta=JOHTO_ROUTE_LEGENDARY_FIX[id];if(meta)removeOne(id,meta,"Retirada manual confirmada por administrador","Selección remota");}
  }else{
   for(const info of audit){
    if(!info.owned)continue;
    const meta=JOHTO_ROUTE_LEGENDARY_FIX[info.id];
    if(info.verdict==="route_confirmed"||info.verdict==="route_probable"){
     const laterLegit=eventsFor(info.id,meta).some(e=>{
      const ts=Number(e?.ts||0),firstTs=Number(info.firstNew?.ts||0);
      return ts>firstTs&&(premiumSource(e?.source)||(routeSource(e?.source)&&ts>cutoff));
     });
     if(laterLegit){preserved.push({id:info.id,name:info.name,reason:"Reobtenido legítimamente"});continue;}
     removeOne(info.id,meta,info.reason,info.firstNew?.source||info.routeEvidence?.[0]?.source||"");
    }else if(info.verdict==="unknown")uncertain.push({id:info.id,name:info.name,reason:info.reason});
    else preserved.push({id:info.id,name:info.name,reason:info.reason});
   }
  }
  js.achievements=js.achievements&&typeof js.achievements==="object"?js.achievements:{unlocked:{},unread:[],claimedRewards:[],claimedMilestones:[],premiumTickets:0,shinyTickets:0,tmChoices:{}};
  const tickets=removed.length*ticketsPer;js.achievements.premiumTickets=Math.max(0,Math.floor(Number(js.achievements.premiumTickets||0)))+tickets;
  js.adminLegendaryCorrections.unshift({nonce,at:Date.now(),mode,cutoffMs:cutoff,ticketsPerLegendary:ticketsPer,tickets,removed:removed.map(x=>x.id),preserved:preserved.map(x=>x.id),uncertain:uncertain.map(x=>x.id),note:rawNote.slice(0,160)});
  js.adminLegendaryCorrections=js.adminLegendaryCorrections.slice(0,50);
  save();try{render();}catch(_){}
  return{ok:true,mode,removed,preserved,uncertain,tickets,ticketsPerLegendary:ticketsPer,auditAfter:Object.entries(JOHTO_ROUTE_LEGENDARY_FIX).map(([id,meta])=>auditLegend(id,meta))};
 }catch(e){return{ok:false,msg:e?.message||"No se pudo aplicar la corrección de legendarios"};}
}
function johtoGlobalMinRouteTier(id){ensureJohtoState();const routes=DATA().routes||{};for(let i=0;i<JOHTO_ROUTE_ORDER.length;i++){const r=routes[JOHTO_ROUTE_ORDER[i]]||{},pool=[...(r.bosses||[]),...Object.values(r.gachaByRarity||{}).flat()];if(pool.includes(id))return i+1;}return 3;}
window.PokeSendaJohtoBattleIsolated={
 collectionSnapshot:()=>{
   const current=js||{},owned=Object.entries(current.pokemon||{}).filter(([id,p])=>p&&fam(id)).map(([id,p])=>({id,dex:Number(p.dex),name:name(p.dex),level:Number(p.level||1),stars:Number(p.stars||1),shiny:!!(p.shinyUnlocked&&p.shinyEquipped),heldItem:p.heldItem||null}));
   return {region:'johto',catalog:[...new Set(Object.values(DATA().families||{}).flatMap(f=>f.members||[]).map(Number))],seen:[...new Set([...(current.dex||[]).map(Number),...owned.map(p=>p.dex)])],shiny:[...new Set((current.shinyDex||[]).map(Number))],owned,badges:(current.gyms?.badges||[]).filter(id=>J_GYM_ORDER.includes(id))};
 },

 start:startRun,stop:silent=>stopRun(!!silent),openReward,continueReward,closeCenter,saveKey:SAVE,
 getState:()=>JSON.parse(JSON.stringify(js||{})),getRun:()=>run?JSON.parse(JSON.stringify(run)):null,getUiState:()=>js,getUiRun:()=>run,getReward:()=>reward?JSON.parse(JSON.stringify(reward)):null,
 getBattleAssignments:()=>{ensureJohtoState();return JSON.parse(JSON.stringify(battleAssignments()));},
 clearDexUnread:dex=>{migrate();return clearJohtoDexUnread(dex);},
 globalBusy:()=>({run:!!run,gym:!!jGym}),
 casinoInfo:()=>johtoCasinoInfo(),casinoUnlocked:()=>johtoCasinoUnlocked(),casinoMaxBet:()=>johtoCasinoMaxBet(),casinoDeposit:amount=>johtoCasinoDeposit(amount),casinoWithdrawAll:()=>johtoCasinoWithdrawAll(),casinoTake:amount=>johtoCasinoTake(amount),casinoResolve:(game,wager,payout,n)=>johtoCasinoResolve(game,wager,payout,n),
 floatingSetDriver:(on)=>{try{floatingDriver=!!on;clearInterval(timer);timer=null;if(!floatingDriver&&run&&!run.paused&&!run.rewardPending&&!run.centerPending)schedule();return true}catch(_){return false}},
 floatingPulse:()=>{try{if(!floatingDriver)return false;if(!run&&floatingAutoRestartPending){const started=Number(backgroundAutoRestartWallMs||Date.now()),extra=Math.max(0,(Date.now()-started)/1000);startRun();if(run&&extra>.001)johtoProcessBackgroundGap(extra);return true;}if(run?.centerPending)updateCenterTimer();else if(run&&!run.paused&&!run.rewardPending)tick();return true}catch(_){return false}},
 floatingSnapshot:()=>{try{ensureJohtoState();const active=!!run,ids=active?battleIds():[],team=ids.map(id=>{const t=run.team[id],p=js.pokemon[id];return{name:name(p?.dex||0),hp:Math.max(0,Number(t?.hp||0)),maxHp:Math.max(1,Number(t?.maxHp||1)),alive:!!t?.alive};});return{region:"johto",regionName:"Johto",active,autoRestart:!!floatingAutoRestartPending,paused:!!run?.paused,blocked:!!(run?.rewardPending||run?.centerPending||run?.eventPending),route:currentRouteDef().name,distance:Number(run?.distance||0),maxDistance:MAX_DISTANCE,infinite:false,speed:Number(run?.speed||js.options?.battleSpeed||1),money:Number(js.money||0),round:Number(run?.roundIndex||0),enemies:active?livingEnemies().length:0,team}}catch(_){return{region:"johto",regionName:"Johto",active:false,autoRestart:!!floatingAutoRestartPending,paused:false,route:"Pradera Ámbar",distance:0,maxDistance:MAX_DISTANCE,speed:1,money:0,round:0,enemies:0,team:[]}}},
 backgroundCatchUp:sec=>{try{return johtoProcessBackgroundGap(Math.max(0,Number(sec)||0))}catch(_){return 0}},
 floatingStart:()=>{try{floatingAutoRestartPending=false;backgroundAutoRestartWallMs=0;if(!run)startRun();return !!run}catch(_){return false}},
 devPauseAll:()=>{try{const snap={run:!!run&&!run.paused,gym:!!jGym&&!jGym.paused};if(snap.run){run.paused=true;render();}if(snap.gym)jGymPause(true);return snap;}catch(_){return {run:false,gym:false}}},
 devResumeAll:(snap={})=>{try{if(snap.run&&run?.paused&&!run.rewardPending&&!run.centerPending){run.paused=false;render();}if(snap.gym&&jGym?.paused)jGymPause(false);return true;}catch(_){return false}},
 abandonRunForGlobal:()=>{try{if(!run)return false;stopRun(true);return true;}catch(_){return false;}},
 devGrantLedger:()=>{ensureJohtoState();return JSON.parse(JSON.stringify(Array.isArray(js.devGrantsRedeemed)?js.devGrantsRedeemed:[]));},
 recoverDevGachaGrant:(nonce)=>{try{migrate();nonce=String(nonce||"");js.devGrantsRedeemed=Array.isArray(js.devGrantsRedeemed)?js.devGrantsRedeemed:[];const row=js.devGrantsRedeemed.find(x=>String(x?.nonce||"")===nonce);if(!row)return {ok:false,msg:"Grant técnico no encontrado"};if(row.gachaGiftRecovered)return {ok:true,duplicate:true};const amount=Math.max(0,Math.trunc(Number(row.amount)||0));if(amount>0)js.money=Math.max(0,Math.floor(Number(js.money||0))-amount);row.gachaGiftRecovered=true;row.gachaGiftRecoveredAt=Date.now();save();try{render();}catch(_){}return {ok:true,reversed:amount,balance:js.money};}catch(e){return {ok:false,msg:e?.message||"No se pudo recuperar el regalo técnico"};}},
 devOpenNormalGachaGift:(km=10)=>{try{migrate();km=Math.max(1,Math.min(10,Math.floor(Number(km)||10)));if(run||jGym||reward)return {ok:false,msg:"Termina o sal de la expedición/Gimnasio antes de abrir este regalo."};reward={km,roll:null,opened:false,devGift:true};if(window.PokeSendaJohtoRuntime?.onRewardReady)window.PokeSendaJohtoRuntime.onRewardReady(km);return {ok:true,routeId:currentRouteId(),km};}catch(e){return {ok:false,msg:e?.message||"No se pudo abrir el Gachapon normal regalado"};}},
 applyDevGrant:(amount,entry={})=>{try{migrate();amount=Math.trunc(Number(amount)||0);if(amount<=0||amount>10000000)return {ok:false,msg:"Cantidad DEV inválida"};js.devGrantsRedeemed=Array.isArray(js.devGrantsRedeemed)?js.devGrantsRedeemed:[];const nonce=String(entry?.nonce||"");if(!nonce)return {ok:false,msg:"Grant sin identificador"};if(js.devGrantsRedeemed.some(x=>String(x?.nonce||"")===nonce))return {ok:false,msg:"Este código DEV ya fue canjeado"};js.money=Math.max(0,Math.floor(Number(js.money||0)))+amount;js.devGrantsRedeemed.unshift({nonce,amount,at:Date.now(),issuedAt:Number(entry?.issuedAt||0),note:String(entry?.note||"").slice(0,120)});js.devGrantsRedeemed=js.devGrantsRedeemed.slice(0,200);save();try{render();}catch(_){}return {ok:true,balance:js.money};}catch(e){return {ok:false,msg:e?.message||"No se pudo aplicar el grant DEV"};}},
 applyAdminLegendaryCleanup:(entry={})=>johtoApplyAdminLegendaryCleanup(entry),
 getPokemonView:id=>{ensureJohtoState();const p=js.pokemon[id];if(!p)return null;const viewP=JSON.parse(JSON.stringify(p));viewP.candies=johtoCandyBalance(id);return {p:viewP,stats:derived(p,id),moves:johtoMovesFor(id).map((m,i)=>({m:{...m},i,rank:Number(p.moveRanks?.[i]||0),unlocked:!!m.tmId||Number(m.unlockStage||0)<=stageIndex(id,p.dex)||m.kind==="support"})),inRun:!!run,alive:run?.team?.[id]?.alive??null,hp:run?.team?.[id]?.hp??null,maxHp:run?.team?.[id]?.maxHp??null};},
 getRarity:(id,dex=null)=>familyRarity(id,dex),
 canonicalFamilyId:id=>johtoCanonicalFamilyId(id),
 canonicalFamilyCount:()=>{ensureJohtoState();return johtoCanonicalFamilyCount(js);},
 canonicalLevelCount:level=>{ensureJohtoState();return johtoCanonicalLevelCount(level,js);},
 canonicalStarsCount:stars=>{ensureJohtoState();return johtoCanonicalStarsCount(stars,js);},
 canonicalRarityCount:rarity=>{ensureJohtoState();return johtoCanonicalRarityCount(rarity,js);},
 getSpeciesInfo:d=>{ensureJohtoState();return JSON.parse(JSON.stringify(species(d)));},
 getItemDef:id=>materialItemDef(id),
 getTypeMatchup:dex=>{ensureJohtoState();const all=["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"],types=species(Number(dex)).types||[],weak=[],resist=[],immune=[];for(const type of all){const m=typeMult(type,types);if(m===0)immune.push(type);else if(m>1.01)weak.push(type);else if(m<.99)resist.push(type);}return{weak,resist,immune};},
 previewPokemon:(id,patch={})=>{ensureJohtoState();const src=js.pokemon?.[id];if(!src)return null;const cp={...src,...patch,moveRanks:Array.isArray(src.moveRanks)?[...src.moveRanks]:src.moveRanks,tmLoadout:Array.isArray(src.tmLoadout)?[...src.tmLoadout]:src.tmLoadout};return JSON.parse(JSON.stringify(derived(cp,id)));},
 getItemSellValue:id=>{ensureJohtoState();const it=materialItemDef(id);if(!it)return 0;const base={common:7,uncommon:18,rare:48,epic:125,legendary:320}[it.rarity]||5;return Math.max(1,Math.round(base*(it.consumable?.7:1)*(1+.05*skillRank("f12"))));},
 sellItem:(id,qty=1)=>{migrate();const it=materialItemDef(id),have=Math.max(0,Number(js.inventory?.[id]||0));qty=Math.max(1,Math.min(have,Math.floor(Number(qty)||1)));if(!it||have<=0)return{ok:false,msg:"No quedan unidades para vender."};const base={common:7,uncommon:18,rare:48,epic:125,legendary:320}[it.rarity]||5,value=Math.max(1,Math.round(base*(it.consumable?.7:1)*(1+.05*skillRank("f12")))),paid=value*qty;js.inventory[id]-=qty;if(js.inventory[id]<=0)delete js.inventory[id];js.money=Math.max(0,Number(js.money||0))+paid;js.itemUnread=(js.itemUnread||[]).filter(x=>x!==id);save();return{ok:true,paid,qty,left:Number(js.inventory?.[id]||0),money:js.money};},
 getTMDefs:()=>JSON.parse(JSON.stringify(DATA().tms||{})),
 getGymDefs:()=>JSON.parse(JSON.stringify(J_GYM_DEFS)),
 getGymTraining:id=>JSON.parse(JSON.stringify(jGymTraining(id))),
 getGymRoleMult:(entity,slot)=>JSON.parse(JSON.stringify(jGymRoleMult(entity,Number(slot)||0))),
 getGymStatsTemplate:()=>jGymStats(),
 getGlobalRoster:()=>{ensureJohtoState();return Object.entries(js.pokemon||{}).map(([id,p])=>{const d=derived(p),moves=johtoMovesFor(id).map((m,i)=>m?{m:{...m,category:moveCategory(m)},i,rank:Math.max(0,Number(p.moveRanks?.[i]||0))}:null).filter(x=>x&&(x.m.kind==="support"||x.rank>0));return {ref:"johto:"+id,region:"johto",id,dex:p.dex,name:name(p.dex),level:p.level,stars:p.stars||1,rarity:familyRarity(id),shiny:!!(p.shinyUnlocked&&p.shinyEquipped),heldItem:p.heldItem||null,stats:d,moves,mods:{stabBonus:(skillRank("c6") ? .08 : 0),physical:.008*skillRank("c10"),special:.008*skillRank("c11"),area:.015*skillRank("c12"),last:(skillRank("c8") ? .15 : 0),boss:.01*skillRank("e5")+(skillRank("e8") ? .05 : 0),meters:.007*skillRank("e2")+.005*skillRank("e13"),guardRank:skillRank("a10"),assaultRank:skillRank("a11"),supportRank:skillRank("a12"),supportSkill:.01*skillRank("c7"),entryHaste:.015*skillRank("e6"),entryPower:.015*skillRank("e11")}};});},
 getGlobalFormation:()=>{ensureJohtoState();return (js.formation||[]).filter(Boolean).map(id=>"johto:"+id);},
 getGlobalInfiniteProgress:()=>{ensureJohtoState();const c1=Number(js.routes?.johto_route1?.completions||0)>0,c2=Number(js.routes?.johto_route2?.completions||0)>0,c3=Number(js.routes?.johto_route3?.completions||0)>0,tier=c3?3:c2?2:c1?1:0;return {tier,route1Complete:c1,route2Complete:c2,route3Complete:c3,levelCap:[0,25,42,60][tier]||0};},
 getGlobalEnemyCatalog:()=>{ensureJohtoState();return Object.keys(DATA().families||{}).filter(id=>{const f=fam(id);return (f?.members||[]).some(d=>Number(d)>=152);}).map(id=>({region:"johto",id,rarity:familyRarity(id),minRouteTier:johtoGlobalMinRouteTier(id)}));},
 getGlobalBossCatalog:()=>{ensureJohtoState();return [...new Set(JOHTO_ROUTE_ORDER.flatMap(id=>DATA().routes?.[id]?.bosses||[]))].filter(id=>fam(id)).map(id=>({region:"johto",id,rarity:familyRarity(id),minRouteTier:johtoGlobalMinRouteTier(id)}));},
 getGlobalEnemyTemplate:(id,level)=>{ensureJohtoState();const f=fam(id);if(!f)return null;level=Math.max(1,Math.min(MAX_LEVEL,Number(level)||1));const idx=Math.min(stageIndexForLevel(id,level),(f.members||[]).length-1),dex=Number(f.members[idx]),p={dex,level,nature:"seria",stars:1,heldItem:null},core=derived(p),moves=(DATA().movesets?.[id]||[]).filter(m=>m.kind==="attack"&&Number(m.unlockStage||0)<=idx).map(m=>({...m,category:moveCategory(m)}));return {region:"johto",id,dex,name:name(dex),level,types:[...(species(dex).types||["normal"])],core:{maxHp:core.maxHp,atk:core.atk,spAtk:core.spAtk,def:core.def,spDef:core.spDef,cd:core.cd},moves:moves.length?moves:[{kind:"attack",name:"Placaje",type:"normal",power:40,category:"physical"}],rarity:familyRarity(id)};},
 // Infinita Global hereda la misma escala por metros usada por el renderer Johto.
 globalVisualMeters:(id,dex=null)=>{try{return johtoHeightMeters(Number(dex)||Number(js?.pokemon?.[id]?.dex)||0);}catch(_){return .8;}},
 grantGlobalXp:(id,amount)=>{migrate();if(!js.pokemon?.[id])return false;grantXp(id,Math.max(0,Number(amount)||0));save();return true;},
 rollGlobalDrops:(kind="round",km=1)=>{migrate();try{rollGeneral();rollPotion();rollEvolution(kind==="milestone"?3:1);save();return true;}catch(_){return false;}},
 grantGlobalMTTicket:()=>johtoGrantMTGachaTicket(1)>0,
 globalBossHealPct:()=>skillRank("e7")?.20:0,
 globalShinyChance:()=>Math.min(.01,(1/1536)*shinyRelativeMult()),
 globalAutoPotionState:()=>{ensureJohtoState();const priority=skillRank("a7")>=1?["hyper_potion","super_potion","potion"]:skillRank("a6")>=1?["super_potion","potion"]:["potion"],ids=[...new Set([...priority,"full_heal"])];return {enabled:!!js.options.autoPotion,unlocked:skillRank("a5")>=1,priority,inventory:Object.fromEntries(ids.map(id=>[id,Number(js.inventory?.[id]||0)])),healMult:1+.05*skillRank("e10"),saveChance:Math.min(.20,.02*skillRank("a8")),canFullHeal:skillRank("a13")>=1};},
 globalSetAutoPotion:v=>{migrate();if(skillRank("a5")<1)return false;js.options.autoPotion=!!v;save();return true;},
 globalConsumeMedicine:itemId=>{migrate();const it=materialItemDef(itemId),have=Number(js.inventory?.[itemId]||0);if(!it?.consumable||have<=0)return {ok:false};const saved=Math.random()<Math.min(.20,.02*skillRank("a8"));if(!saved){js.inventory[itemId]=Math.max(0,have-1);if(js.inventory[itemId]<=0)delete js.inventory[itemId];}save();return {ok:true,name:it.name||itemId,healPct:Number(it.healPct||0),curesStatus:!!it.curesStatus,healMult:1+.05*skillRank("e10"),saved};},

 grantGlobalCapture:(id,level,rarity,shiny=false)=>{migrate();const f=fam(id);if(!f)return {ok:false,msg:"Familia Johto inválida"};level=Math.max(1,Math.min(MAX_LEVEL,Number(level)||1));const dex=captureDex(id,level),captured=johtoRegisterCapturedPokemon(id,dex,level,rarity,!!shiny),p=captured.p,fresh=captured.fresh,candies=captured.candies,promoted=captured.promoted;recordJohtoCapture({fid:id,dex,level,rarity,outcome:fresh?'Nueva familia obtenida':promoted?('Forma superior obtenida · '+name(dex)):('Duplicado · +'+candies+' caramelos'),source:'Captura multirregional',shiny:!!shiny});save();return {ok:true,region:"johto",id:captured.id,dex,name:name(dex),level,stateNew:fresh,candies,promoted:!!promoted,reserved:false,shiny:!!shiny,pokemon:JSON.parse(JSON.stringify(p))};},
 getGlobalProfile:()=>{ensureJohtoState();if(!js.starter)return null;const team=(js.formation||[]).slice(0,6).map((id,i)=>{const p=id&&js.pokemon?.[id];return p?{ref:"johto:"+id,dex:p.dex,name:name(p.dex),level:p.level,stars:p.stars||1,shiny:!!(p.shinyUnlocked&&p.shinyEquipped),role:["Guardia","Asalto","Apoyo","Guardia","Asalto","Apoyo"][i]||"Reserva"}:null;}).filter(Boolean),badges=(js.gyms?.badges||[]).filter(id=>J_GYM_ORDER.includes(id)),points=window.PokeSendaJohtoRuntime?.achievementSummary?.().points||0,totalPoints=window.PokeSendaJohtoRuntime?.achievementSummary?.().total||0,dexList=[...new Set((js.dex||[]).map(Number))].sort((a,b)=>a-b),shinyDexList=[...johtoShinyDexSet()].sort((a,b)=>a-b),ownedDexList=[...new Set(Object.values(js.pokemon||{}).map(p=>Number(p?.dex)).filter(Number.isFinite))].sort((a,b)=>a-b),dexCatalog=[...new Set(Object.values(DATA().families||{}).flatMap(f=>Array.isArray(f?.members)?f.members:[]).map(Number).filter(Number.isFinite))].sort((a,b)=>a-b),gymTeams={};for(const [gid,list] of Object.entries(js.gyms?.lastTeam||{})){if(Array.isArray(list)&&list.length)gymTeams[gid]=list.slice(0,6).map(x=>({dex:Math.max(1,Number(x?.dex)||1),name:String(x?.name||name(x?.dex)||"Pokémon").slice(0,30),level:Math.max(1,Number(x?.level)||1)}));}return {v:2,region:"johto",stats:{badges:badges.length,dex:dexList.length,shinyDex:shinyDexList.length,achievementPoints:points,achievementUnlocked:Math.min(Number(window.PokeSendaJohtoRuntime?.achievementSummary?.().total||60),Object.values(js.achievements?.unlocked||{}).filter(Boolean).length),achievementTotal:Number(window.PokeSendaJohtoRuntime?.achievementSummary?.().total||60),totalChests:Number(js.totalChests||0),infiniteBestDistance:0,avgTeamLevel:team.length?team.reduce((n,p)=>n+p.level,0)/team.length:0,teamStars:team.reduce((n,p)=>n+p.stars,0),pokemonOwned:Object.keys(js.pokemon||{}).length},dexList,ownedDexList,shinyDexList,dexCatalog,team,badges:[...badges],gymBest:{...js.gyms?.bestTimes},gymTeams};},

 premiumIntervalMs:PREMIUM_INTERVAL_MS,
 premiumBuyCost:PREMIUM_BUY_COST,
 premiumUnlocked:()=>{ensureJohtoState();return premiumUnlocked();},
 premiumEnsureUnlocked:()=>premiumEnsureUnlocked(),
 premiumPhase:now=>{ensureJohtoState();return premiumPhase(Number(now)||Date.now());},
 premiumState:()=>{ensureJohtoState();return JSON.parse(JSON.stringify({timedGacha:js.timedGacha,premiumStats:js.premiumStats,achievements:js.achievements,money:js.money,unlocked:premiumUnlocked()}));},
 premiumSetClock:serverMs=>{migrate();serverMs=Number(serverMs);if(!Number.isFinite(serverMs))return false;js.timedGacha=js.timedGacha||{};js.timedGacha.lastTrustedMs=serverMs;js.timedGacha.clockOffsetMs=serverMs-Date.now();save();return true;},
 premiumPrepare:(source,now)=>premiumPrepare(source,Number(now)||Date.now()),
 premiumRoulette:roll=>premiumRoulette(roll),
 premiumCapture:(source,roll,now)=>premiumCapture(source,roll,Number(now)||Date.now()),

 getGymOrder:()=>[...J_GYM_ORDER],
 getGymState:()=>{ensureJohtoState();return JSON.parse(JSON.stringify(js.gyms||{}));},
 getGymBattle:()=>jGym?JSON.parse(JSON.stringify(jGym)):null,
 gymHasBadge:id=>{ensureJohtoState();return jGymHasBadge(id);},
 gymUnlocked:id=>{ensureJohtoState();return jGymUnlocked(id);},
 gymStart:id=>jGymStart(id),
 gymPause:v=>jGymPause(v),
 gymForfeit:()=>jGymForfeit(),
 gymPotionItems:()=>{ensureJohtoState();return jGymPotionItems();},
 gymUsePotion:(itemId,index)=>jGymUsePotion(itemId,index),

 getTMCompatStatus:()=>({ready:GEN2_TM_COMPAT_READY,local:true,embeddedCount:Object.keys(GEN2_TM_COMPAT_EMBEDDED).length,loading:GEN2_TM_COMPAT_LOADING,error:GEN2_TM_COMPAT_ERROR,remoteReady:GEN2_TM_COMPAT_REMOTE_READY,remoteError:GEN2_TM_COMPAT_REMOTE_ERROR,source:GEN2_TM_COMPAT_SOURCE}),
 tmIsCompatible:(tmId,id)=>{ensureJohtoState();return tmIsCompatible(tmId,id);},
 tmDuplicatesNatural:(tmId,id)=>{ensureJohtoState();return tmDuplicatesNatural(tmId,id);},
 tmCapacity:id=>{ensureJohtoState();return tmCapacity(id);},
 setTM:(id,slot,tmId)=>{migrate();if(run&&!run.paused)return {ok:false,msg:"Pausa la expedición para cambiar MT."};const p=js.pokemon[id],tm=tmId?tmDef(tmId):null;slot=Math.max(0,Math.min(3,Number(slot)||0));if(!p)return {ok:false,msg:"Pokémon no encontrado."};const load=tmLoadout(p),old=load[slot]||null;if(!tmId){load[slot]=null;p.tmLoadout=load;save();return {ok:true};}
   if(!GEN2_TM_COMPAT_READY)return {ok:false,msg:GEN2_TM_COMPAT_ERROR?"No se pudo verificar Gold/Silver. Revisa tu conexión.":"Verificando compatibilidad exacta Gold/Silver…"};
   if(!js.tms?.[tmId])return {ok:false,msg:"Todavía no tienes esa MT."};if(!tm||!tmSlotAccepts(slot,tmId))return {ok:false,msg:"Esa MT no corresponde a esta ranura."};if(!tmIsCompatible(tmId,id))return {ok:false,msg:"Este Pokémon no puede aprender esa MT en Gold/Silver."};if(tmDuplicatesNatural(tmId,id))return {ok:false,msg:"Ese movimiento ya forma parte de sus movimientos naturales."};
   const other=load.findIndex((x,i)=>i!==slot&&x===tmId),used=load.filter(Boolean).length;if(other<0&&!old&&used>=tmCapacity(id))return {ok:false,msg:"Límite de MT alcanzado según rareza."};if(other>=0)load[other]=null;load[slot]=tmId;p.tmLoadout=load;if(Number(p.moveRanks?.[slot]||0)<1)p.moveRanks[slot]=1;save();return {ok:true};},
 pullMT:()=>{migrate();const g=js.mtGacha,ids=johtoMtGachaPoolIds();if(johtoMtGachaPoolCompleted()){const retired=johtoRetireMTTicketsIfComplete(false);return {ok:false,msg:retired>0?`Pool MT completado · ${retired} Ticket${retired===1?"":"s"} retirado${retired===1?"":"s"}`:"Pool MT completado"};}if(g.tickets<=0)return {ok:false,msg:"Sin Tickets MT"};const missing=ids.filter(id=>!js.tms[id]),force=g.duplicateStreak>=10&&missing.length,pool=force?missing:ids,weights=pool.map(id=>tmDef(id)?.tier==="rare"?1:3);let x=Math.random()*weights.reduce((a,b)=>a+b,0),pickId=pool[0];for(let i=0;i<pool.length;i++){x-=weights[i];if(x<=0){pickId=pool[i];break;}}
   g.tickets=Math.max(0,g.tickets-1);g.pulls++;js.tms=js.tms||{};const duplicate=!!js.tms[pickId];let compensation=0;if(duplicate){g.duplicateStreak++;compensation=johtoMtGachaCompensation(pickId);js.money=(js.money||0)+compensation;}else{js.tms[pickId]=true;g.duplicateStreak=0;}g.history.unshift({id:pickId,duplicate,ts:Date.now(),compensation});g.history=g.history.slice(0,30);const retired=johtoRetireMTTicketsIfComplete(false);save();return {ok:true,id:pickId,duplicate,compensation,retiredTickets:retired,tm:tmDef(pickId),state:JSON.parse(JSON.stringify(g))};},
 resolveRouteEvent:action=>{migrate();return resolveRouteEvent(action);},
 setPlainOption:(k,v)=>{migrate();if(!["animations","combatFloats","confirmStop","routeEvents"].includes(k))return false;js.options[k]=!!v;save();return true;},
 addMT:(tmId)=>{migrate();if(!tmDef(tmId))return false;js.tms[tmId]=true;save();return true;},

 getStarCost:id=>{ensureJohtoState();const p=js.pokemon[id];return p&&p.stars<5?STAR_COSTS[p.stars]||0:0;},
 upgradeStar:id=>{migrate();if(!js.pokemon[id])return false;const p=js.pokemon[id],cost=p.stars<5?STAR_COSTS[p.stars]||0:0;if(!cost||johtoCandyBalance(id)<cost||familyRarity(id)==="legendary")return false;if(!johtoSpendCandies(id,cost))return false;p.stars++;if(run?.team?.[id])refreshCombatant(id);save();return true;},
 evolve:(id,toDex)=>{migrate();return applyEvolution(id,toDex);},
 getEvolutionOptions:id=>{ensureJohtoState();return JSON.parse(JSON.stringify(evolutionOptions(id)));},
 declineEvolution:id=>{migrate();const p=js.pokemon?.[id];pendingEvolutionPrompts.delete(id);if(p)p.evolutionPromptLevel=Number(p.level||0);save();return true;},
 releaseEvolutionPrompt:id=>{migrate();const p=js.pokemon?.[id];pendingEvolutionPrompts.delete(id);if(p)p.evolutionPromptLevel=0;save();return true;},
 setShiny:(id,on)=>{migrate();const p=js.pokemon[id];if(!p)return false;if(on&&!johtoHasShinyDex(p.dex))return false;p.shinyUnlocked=(fam(id)?.members||[]).some(d=>johtoHasShinyDex(d));p.shinyEquipped=!!on;save();return true;},
 getMaxLevelRelearn:id=>{ensureJohtoState();const p=js.pokemon?.[id],plan=johtoMaxLevelRelearnPlan(id);return {unlocked:!!p&&Number(p.level||0)>=MAX_LEVEL,used:!!p?.maxLevelRelearnUsed,refund:plan.refund,canUse:!!p&&Number(p.level||0)>=MAX_LEVEL&&!p.maxLevelRelearnUsed&&plan.refund>0&&(!run||!!run.paused)};},
 useMaxLevelRelearn:id=>johtoUseMaxLevelRelearn(id),
 getRelearnPlan:id=>{ensureJohtoState();const plan=johtoMaxLevelRelearnPlan(id),p=js.pokemon?.[id];return {...plan,canUse:!!p&&Number(js.inventory?.relearning_orb||0)>0&&plan.refund>0&&(!run||!!run.paused)};},
 useRelearningOrb:id=>johtoUseRelearningOrb(id),

 upgradeMove:(id,i)=>{migrate();const p=js.pokemon[id],m=DATA().movesets?.[id]?.[Number(i)];if(!p||!m||Number(p.skillPoints||0)<=0)return false;const stage=stageIndex(id,p.dex);if(m.kind!=="support"&&Number(m.unlockStage||0)>stage)return false;p.moveRanks=Array.isArray(p.moveRanks)?p.moveRanks:[1,0,0,1];while(p.moveRanks.length<4)p.moveRanks.push(0);const rank=Math.max(1,Number(p.moveRanks[i]||1));if(rank>=25)return false;p.moveRanks[i]=rank+1;p.skillPoints--;save();return true;},
 reload:()=>{migrate();return JSON.parse(JSON.stringify(js||{}));},
 setSpeed:s=>{migrate();s=Number(s);if(jGym||![1,2,4].includes(s))return false;js.options.battleSpeed=s;if(run)run.speed=s;save();render();return true;},
 setOption:(k,v)=>{migrate();if(!["autoRepeat","autoPotion","autoOpen"].includes(k))return false;const need={autoOpen:"a2",autoRepeat:"a3",autoPotion:"a5"}[k];if(v&&need&&skillRank(need)<1)return false;js.options[k]=!!v;save();render();return true;},
 togglePause:()=>{if(!run||run.rewardPending||run.centerPending)return false;const wasPaused=!!run.paused,hpBefore=wasPaused?(run.pauseHpBaseline||johtoPauseHpSnapshot()):johtoPauseHpSnapshot();run.paused=!run.paused;if(!run.paused){run.wallTickMs=Date.now();}else{johtoSetBackgroundBacklog(0);run.pauseHpBaseline=hpBefore;run.pauseCount=(run.pauseCount||0)+1;const a=johtoPauseIntegrityState();a.totalPauses++;a.lastAt=Date.now();}render();if(johtoGuardPauseHp(hpBefore,wasPaused?"resume":"pause"))render();if(wasPaused)run.pauseHpBaseline=null;save();return run.paused;},
 getCurrentRoute:()=>{ensureJohtoState();return currentRouteId();},
 getUiRouteInfo:()=>{ensureJohtoState();const id=currentRouteId(),r=currentRouteDef(),s=currentRouteState();return {id,name:r.name,description:r.description,sectors:r.sectors,recommended:r.recommended,finalBossLevel:r.finalBossLevel,className:routeClass(id),state:s,unlocked:js.unlockedRoutes};},
 getCurrentRouteInfo:()=>{ensureJohtoState();const id=currentRouteId(),r=currentRouteDef(),s=currentRouteState();return JSON.parse(JSON.stringify({id,name:r.name,description:r.description,sectors:r.sectors,recommended:r.recommended,finalBossLevel:r.finalBossLevel,className:routeClass(id),state:s,unlocked:[...js.unlockedRoutes]}));},
 // V36.66.12 · Fuente única para la Guía: replica exactamente el pool base que usa rollReward (sin Incienso).
 getRouteRewardPoolPreview:(routeId=null,km=10)=>{
   ensureJohtoState();const id=JOHTO_ROUTE_ORDER.includes(routeId)?routeId:currentRouteId(),route=DATA().routes?.[id];if(!route)return null;km=Math.max(1,Math.min(10,Math.floor(Number(km)||10)));
   const pools=johtoProgressiveRewardPools(route,km);pools.rare=Array.isArray(pools.rare)?pools.rare:[];const starter=starterForRoute(js.starter,id);if(starter&&!pools.rare.includes(starter))pools.rare.push(starter);
   const rw=DATA().drops?.[route.dropProfile]?.rarityWeights||{common:63,uncommon:24,rare:10,epic:2.5,legendary:.5},rareBoost=1+.02*skillRank("f6"),endBoost=1+.02*skillRank("f13"),order=["common","uncommon","rare","epic","legendary"],weights={common:Number(rw.common||0),uncommon:Number(rw.uncommon||0),rare:Number(rw.rare||0)*rareBoost,epic:Number(rw.epic||0)*rareBoost*endBoost,legendary:Number(rw.legendary||0)*rareBoost*endBoost},available=order.filter(r=>(pools[r]||[]).length&&weights[r]>0),total=available.reduce((n,r)=>n+weights[r],0)||1,entries=[];
   for(const rarity of available){const ids=pools[rarity]||[],rarityPct=weights[rarity]/total*100,each=ids.length?rarityPct/ids.length:0;for(const fid of ids)entries.push({id:fid,rarity,pct:each,dynamicStarter:fid===starter});}
   return JSON.parse(JSON.stringify({routeId:id,km,tier:johtoGachaDepthTier(km),starter,entries,rarityWeights:weights}));
 },
 setCurrentRoute:id=>{migrate();if(run||jGym||!JOHTO_ROUTE_ORDER.includes(id)||!routeUnlocked(id))return false;js.currentRoute=id;save();return true;},
 setFarmCheckpoint:m=>{migrate();m=Number(m)||0;const rs=currentRouteState(),allowed=[0,...POKEMON_CENTERS.filter(c=>(rs.centersSeen||[]).includes(c)||rs.completions>0)];if(!allowed.includes(m))return false;rs.farmCheckpoint=m;save();return true;},
 setFormation:(arr)=>{migrate();const src=Array.isArray(arr)?arr.slice(0,6):[],next=Array(6).fill(null),seen=new Set();
   for(let i=0;i<6;i++){const id=src[i];if(id&&js.pokemon[id]&&!seen.has(id)){next[i]=id;seen.add(id);}}
   if(run){
     if(!run.paused)return false;
     const allowed=new Set(run.partyIds||[]);
     if(seen.size!==allowed.size||[...seen].some(id=>!allowed.has(id)))return false;
   }
   js.formation=next;
   if(run)run.partyIds=next.filter(Boolean);
   save();return true;},
 setHeldItem:(id,itemId)=>equipHeldItem(id,itemId),
 getEnemyView:uid=>{ensureJohtoState();return enemyView(uid);},
 usePotion:(itemId,id)=>{migrate();const it=materialItemDef(itemId),t=run?.team?.[id],p=js.pokemon?.[id];if(!it?.consumable||!t||!p||!t.alive||Number(js.inventory?.[itemId]||0)<=0)return{ok:false,msg:"No puedes usar ese objeto ahora."};let did=false,heal=0,cured=false;if(it.healPct&&t.hp<t.maxHp){const before=t.hp,healMult=1+.05*skillRank("e10");t.hp=Math.min(t.maxHp,t.hp+t.maxHp*it.healPct*healMult);heal=Math.max(0,Math.ceil(t.hp-before));did=heal>0;}if(it.curesStatus&&(t.status?.type||(t.confusion||0)>0)){t.status=null;t.statusTick=3;t.confusion=0;cured=true;did=true;}if(!did)return{ok:false,msg:"Ese Pokémon no necesita ese objeto."};js.inventory[itemId]=Math.max(0,Number(js.inventory[itemId]||0)-1);if(js.inventory[itemId]<=0)delete js.inventory[itemId];if(run?.paused&&run.pauseHpBaseline)run.pauseHpBaseline=johtoPauseHpSnapshot();save();return{ok:true,heal,cured,left:Number(js.inventory?.[itemId]||0),name:name(p.dex)};},
 getPauseIntegrity:()=>{ensureJohtoState();return JSON.parse(JSON.stringify(js.pauseIntegrity||{version:1,totalPauses:0,preventedHealEvents:0,preventedHp:0,lastAt:0}));},
 getMaterialState:()=>{ensureJohtoState();return JSON.parse(JSON.stringify({inventory:js.inventory,mints:js.mints,masterMints:js.masterMints,itemUnread:js.itemUnread,money:js.money,natures:EXTRA.natures,incenseTypes:INCENSE_TYPES}));},
 clearItemUnread:id=>{migrate();js.itemUnread=(js.itemUnread||[]).filter(x=>x!==id);save();return true;},
 useMint:(id,natureKey,master=false)=>useMint(id,natureKey,!!master),
 setRewardIncense:type=>setRewardIncense(type),
 getVendorState:()=>vendorSnapshot(),buyIncenseVendor:type=>buyIncenseVendor(type),buyMintVendor:index=>buyMintVendor(index),closeVendorEvent:kind=>closeVendorEvent(kind),
 getNatureEffect:k=>natureEffectText(k),getMintSprite:k=>mintSpriteUrl(k),
 renderFormation
};
})();
