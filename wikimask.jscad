// Wikimask
// Copyright 2013 - Fabrique d'Objets Libres
// Created by Stéphane Mor <stephanemor@gmail.com>
// Les objets créés avec cette application sont sous Licence Creative Commons (CC-BY-SA).

// Boucle principale du programme
function main(params)
{
  var epaisseur_flexibles = 1;
  var objets = [];
  if(params.genNez==1)
    objets.push(nez(params.largeur_nez,params.hauteur_nez,params.profondeur_nez,params.diametre_tuyau_nez,1));
  if(params.genClip==1)
    objets.push(clip(params.diametre_tuyau_nez - 2, params.diametre_tuyau_nez - 0.4, 1 + 2*params.epaisseur_flexibles, params.ecart, 2, 1 ).translate([0,-30,0]));
  if(params.genAttacheNez==1)
    objets.push(attache_nez(params.largeur_nez, params.hauteur_nez, params.diametre_tuyau_nez, params.epaisseur_flexibles).translate([60,0,0]));
  if(params.genRaccordTuyau==1)
    objets.push(raccord_tuyau(params.diametre_tuyau_nez,params.hauteur_nez + 5).translate([30,-30,0]));
  if(params.genAppuiFront==1)
    // Pas encore vraiment prêt
    objets.push(appui_frontal(params.largeur_nez + 10, params.hauteur_nez).translate([-60,-30,0]));

  // Pas utile à chaque fois
  //objets.push(adaptateur_tuyau(10,22).translate([30,20,0]));

  return(objets);
}

// Paramètres modifiables par l'utilisateur
function getParameterDefinitions() {
  return [
    // Parties à imprimer
    { name: 'genNez', type: 'choice', caption: 'Générer le masque?', values: [0, 1], captions: ["Non", "Oui"], initial: 1 },
    { name: 'genClip', type: 'choice', caption: 'Générer le clips?', values: [0, 1], captions: ["Non", "Oui"], initial: 1 },
    { name: 'genAttacheNez', type: 'choice', caption: 'Générer l\'attache nasale?', values: [0, 1], captions: ["Non", "Oui"], initial: 1 },
    { name: 'genRaccordTuyau', type: 'choice', caption: 'Générer le raccord de tuyau?', values: [0, 1], captions: ["Non", "Oui"], initial: 1 },
    { name: 'genAppuiFront', type: 'choice', caption: 'Générer l\'appui frontal?', values: [0, 1], captions: ["Non", "Oui"], initial: 1 },
    // Caractéristiques techniques du masque
    { name: 'largeur_nez', caption: 'Largeur nez:', type: 'float', default: 39 },
    { name: 'hauteur_nez', caption: 'Hauteur nez:', type: 'float', default: 23 },
    { name: 'profondeur_nez', caption: 'Profondeur nez:', type: 'float', default: 14 },
    { name: 'diametre_tuyau_nez', caption: 'Diamètre du tuyau d\'arrivée d\'air:', type: 'float', default: 10 },
    // Pour le clips
    { name: 'ecart', caption: 'Écartement du clips:', type: 'float', default: 2 },
    { name: 'epaisseur_flexibles', caption: 'Épaisseur des parties flexibles:', type: 'float', default: 1 },
  ];
}

// Partie nasale du masque; le masque proprement dit.
function nez(largeur, hauteur,profondeur,diametre,epaisseur){
  var rayon = largeur / 5;
  var g_cercle = circle({r: rayon + 2, center: true});
  var cercle = circle({r: rayon, center: true});
  var enveloppe_nez = hull(
      g_cercle.translate([(largeur/2) - rayon, 0, 0]),
      g_cercle.translate([-((largeur/2) - rayon),0,0]),
      g_cercle.translate([0,hauteur - rayon,0])
    ).scale([0.75,0.75]);
  // Base avec le trou pour le tuyau
  var base_nez = linear_extrude({height: epaisseur}, enveloppe_nez)
    .subtract(cylinder({h: epaisseur *2, r: diametre/2, center: true}).translate([0,hauteur/2 - rayon,0])) // Trou du tuyau
    //.subtract(cylinder({h: epaisseur *2, r: 1, center: true}).translate([largeur / 4, hauteur / 4,0])) // Fuite droite
    //.subtract(cylinder({h: epaisseur *2, r: 1, center: true}).translate([-(largeur / 4), hauteur / 4,0])) // Fuite gauche
  ;
  var trou_nez = hull(
    cercle.translate([(largeur/2) - rayon, 0, 0]),
    cercle.translate([-((largeur/2) - rayon),0,0]),
    cercle.translate([0,hauteur - rayon,0])
  ).scale([0.75,0.75]);

  // Vase extérieur
  var path = enveloppe_nez.getOutlinePaths()[0];
  var csg = CSG.Polygon.createFromPoints(path.points);

  var vase_exterieur = csg.solidFromSlices({
    numslices: 2,
    callback: function(t, slice) {
      return this.scale(1 + 0.45*t).translate([0,0,t * profondeur]);
    }
  });

  // Vase intérieur
  var path = trou_nez.getOutlinePaths()[0];
  var csg = CSG.Polygon.createFromPoints(path.points);

  var vase_interieur = csg.solidFromSlices({
    numslices: 2,
    callback: function(t, slice) {
      return this.scale(1 + 0.33*t).translate([0,0,t * profondeur]);
    }
  });

  // Fuites sous les narines, pour ne pas gêner?
  var vase = vase_exterieur.subtract(vase_interieur)
             .subtract(cylinder({r:1, h:10, center:true}).rotateX(90).translate([-(largeur/5), -rayon, profondeur/2]))
             .subtract(cylinder({r:1, h:10, center:true}).rotateX(90).translate([largeur/5, -rayon, profondeur/2]))
            ;

  return base_nez.union(vase);
}

// Attache du bandeau sur la partie nasale du masque en 2D, pour la découpe laser.
function attache_nez_2D(largeur_nez, hauteur_nez, diametre_tuyau){
  var centre = circle({r: diametre_tuyau/2 + 4, center: true});
  var branche = hull(centre,circle({r: 5, center: true}).translate([largeur_nez / 2 + 10,-10,0]))
    .subtract(circle({r: 3, center: true}).translate([largeur_nez/2 + 10, -10,0])); // Trou d'attache du bandeau
  branche.subtract(circle({r: 6, center: true}));
  var branche2 = branche.mirroredX(); // 2ème branche en miroir
  // Branche du haut
  var branche_haut = hull(circle({r: diametre_tuyau /2 + 1, center: true}), circle({r: 5, center: true}).translate([0,hauteur_nez + 10, 0]))
                     //.subtract(circle({r: 3, center: true}).translate([0,hauteur_nez+10,0]))
                     ;
  var base = branche.union(branche2).union(branche_haut).subtract(circle({r: diametre_tuyau / 2, center: true})); // Trou pour le tuyau
  return base;
}

// Attache du bandeau en 3D
function attache_nez(largeur_nez, hauteur_nez, diametre_tuyau, epaisseur){
  var base = linear_extrude({height: epaisseur}, attache_nez_2D(largeur_nez,hauteur_nez,diametre_tuyau))
             .union(cylinder({r: 1.5, h: 3}).translate([0,hauteur_nez+10]))
             .union(sphere(3).translate([0,hauteur_nez+10, 5]))
             ;
  return base;
}

// Clip permettant de relier les pièces du dispositif entre elles au niveau du nez 
function clip(diametre_interieur, diametre_exterieur, hauteur_interstice, ecart, largeur_deport, epaisseur_deport, largeur_clip, epaisseur_clip){
    var ri = diametre_interieur / 2;
    var re = diametre_exterieur / 2;
    if(arguments.length < 5) largeur_deport = 2;
    if(arguments.length < 6) epaisseur_deport = 2;
    if(arguments.length < 7) largeur_clip = largeur_deport / 2;
    if(arguments.length < 8) epaisseur_clip = epaisseur_deport;
   return difference(
       union(
         cylinder({r: re + largeur_deport, h:epaisseur_deport}),
         cylinder({r:re - 0.2, h: hauteur_interstice}).translate([0,0,epaisseur_deport]),
         cylinder({r1: re + largeur_clip, r2: re - 0.2, h: epaisseur_clip}).translate([0,0,hauteur_interstice + epaisseur_deport])
       ),
       cylinder({r: ri, h:hauteur_interstice + epaisseur_deport + epaisseur_clip}),
       cube({size: [(re + largeur_deport) * 2,ecart, hauteur_interstice + epaisseur_clip]}).translate([(re  + largeur_deport)* -1,ecart * -0.5,epaisseur_deport ])
       );
  }

// Appui frontal, relié à la partie nasale
function appui_frontal(largeur, hauteur){
  var base = cylinder({r: largeur, h: 1, center: true}).scale([1,hauteur/largeur,1]).subtract(cylinder({r: 3, center:true}));
  for(var i=0; i<5; i++){
    var x= -(largeur/2) + (i* 1/4 * largeur);
    base.union(cylinder({r: 2, h: 20, center: true}).translate([x,0,5] ).rotateX(90));
  }
  return base;
}

// Un insert de tuyau permet de connecter un tuyau au reste d'un dispositif
// TODO: très lent, essayer avec une révolution d'une forme 2D
function insert_tuyau(diametre){
  var rayon = diametre / 2;
  return difference(
    union(
      cylinder({r: rayon - 1, h: 15}),
      torus({ro: rayon - 2, ri: 2}).translate([0,0,3]),
      torus({ro: rayon - 2, ri: 2}).translate([0,0,7.5]),
      torus({ro: rayon - 2, ri: 2}).translate([0,0,12])
    ),
    cylinder({r: rayon - 2.5, h: 15})
  );
}

// Adaptateur pour raccorder deux tuyaux de tailles différentes.
function adaptateur_tuyau(diametre_petit, diametre_grand){
  var rp = diametre_petit / 2;
  var rg = diametre_grand / 2;

  return union(
    insert_tuyau(diametre_grand),
    // Transition conique
    translate([0,0,15], difference(
      cylinder({r1: rg - 1, r2: rp - 1, h: 5}),
      cylinder({r1: rg - 2.5, r2: rp - 2.5, h: 5})
    )),
    insert_tuyau(diametre_petit).translate([0,0,20])
  );
}

// Raccord reliant le tuyau du masque au reste du circuit d'air
function raccord_tuyau(diametre_tuyau, longueur){
  var base = circle({r: diametre_tuyau /2 + 2, center: true})
    .union(square([longueur, diametre_tuyau + 4]).center([false,true]))
    .subtract(circle({r: diametre_tuyau / 2, center:true}))
    .extrude({height: 2});
  var pont = cylinder({r: diametre_tuyau /2 + 2, h: longueur / 3}) // enveloppe
    .union(cube([diametre_tuyau / 2 + 2, diametre_tuyau + 4, longueur/3]).center([false, true]))
    .subtract(cylinder({r: diametre_tuyau/2, h: longueur/3})) // trou pour le tuyau
    .center([false, true])
    .rotateY(90)
    .translate([longueur, 0,diametre_tuyau / 2 + 2]) // Placement
  ;
  return base.union(pont);
} 
