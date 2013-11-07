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

function adaptateur_tuyau(diametre_petit, diametre_grand){
  return difference(
    union(
      // Grand côté
      cylinder({r: diametre_grand - 1, h:15}),
      torus({ro: diametre_grand - 2, ri: 2}).translate([0,0,3]),
      torus({ro: diametre_grand - 2, ri: 2}).translate([0,0,8]),
      torus({ro: diametre_grand - 2, ri: 2}).translate([0,0,13]),
      // Transition
      cylinder({r1: diametre_grand - 1, r2: diametre_petit - 1, h: 5}).translate([0,0,15]),
      // Petit côté
      translate([0,0,20],
      cylinder({r: diametre_petit - 1, h: 15}),
      torus({ro: diametre_petit - 2, ri: 2}).translate([0,0,2]),
      torus({ro: diametre_petit - 2, ri: 2}).translate([0,0,7]),
      torus({ro: diametre_petit - 2, ri: 2}).translate([0,0,12])
      )
      
    ),
    // Trou
    cylinder({r1: diametre_grand - 4, r2: diametre_grand - 4, h: 15}),
    cylinder({r1: diametre_grand - 4, r2: diametre_petit - 4, h: 5}).translate([0,0,15]),
    cylinder({r: diametre_petit - 4, h: 15}).translate([0,0,20])
  );
}
