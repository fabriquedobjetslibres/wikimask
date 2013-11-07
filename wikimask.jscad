// Wikimask
// Copyright 2013 - Fabrique d'Objets Libres
// Created by Stéphane Mor <stephanemor@gmail.com>
function main(params)
{
  return([
    //clip(
    //  params.diametre_interieur,
    //  params.diametre_exterieur,
    //  params.hauteur_interstice,
    //  params.ecart
    //),
    adaptateur_tuyau(10,16).translate([30,20,0])
    //insert_tuyau(20)
    //raccord_tuyau(22)
  ]);
}

// Paramètres modifiables par l'utilisateur
function getParameterDefinitions() {
  return [
    { name: 'diametre_interieur', caption: 'Diamètre intérieur:', type: 'float', default: 8 },
    { name: 'diametre_exterieur', caption: 'Diametre extérieur:', type: 'float', default: 10 },
    { name: 'hauteur_interstice', caption: 'Hauteur de l\'interstice:', type: 'float', default: 4 },
    { name: 'ecart', caption: 'Écart:', type: 'float', default: 1 },
  ];
}

// Revoir les mesures: diamètres au lieu de rayons!!
function clip(diametre_interieur, diametre_exterieur, hauteur_interstice, ecart, largeur_deport, epaisseur_deport, largeur_clip, epaisseur_clip){
    if(arguments.length < 5) largeur_deport = 2;
    if(arguments.length < 6) epaisseur_deport = 2;
    if(arguments.length < 7) largeur_clip = largeur_deport / 2;
    if(arguments.length < 8) epaisseur_clip = epaisseur_deport;
   return difference(
       union(
         cylinder({r: diametre_exterieur + largeur_deport, h:epaisseur_deport}),
         cylinder({r:diametre_exterieur - 0.2, h: hauteur_interstice}).translate([0,0,epaisseur_deport]),
         cylinder({r1: diametre_exterieur + largeur_clip, r2: diametre_exterieur - 0.2, h: epaisseur_clip}).translate([0,0,hauteur_interstice + epaisseur_deport])
       ),
       cylinder({r: diametre_interieur, h:hauteur_interstice + epaisseur_deport + epaisseur_clip}),
       cube({size: [(diametre_exterieur + largeur_deport) * 2,ecart, hauteur_interstice + epaisseur_clip]}).translate([(diametre_exterieur  + largeur_deport)* -1,ecart * -0.5,epaisseur_deport ])
       );
  }

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

// Bancal
function raccord_tuyau(tuyau, largeur_contour){
  if(arguments.length < 2) largeur_contour = 3;
  var arete = tuyau + (largeur_contour * 2);
  return difference(
    union(
      // Base
      cylinder({r: (tuyau / 2) + largeur_contour, h: 2}),
      cube({size: [tuyau * 2, tuyau + (largeur_contour * 2), 2]}).translate([0, - (tuyau /2) - largeur_contour, 0]),
      // Passage coude
      cube({size: tuyau + (largeur_contour * 2)}).translate([tuyau - largeur_contour * 2, - (tuyau / 2) - largeur_contour, 2])
    ),
    cylinder({r: tuyau/2, h: 2}),
    cylinder({r: tuyau/2, h: tuyau + (largeur_contour*2)}).rotateY(90).translate([tuyau - largeur_contour * 2, 0, tuyau / 2 + largeur_contour * 2])
  );
} 
