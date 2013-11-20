// Wikimask
// Copyright 2013 - Fabrique d'Objets Libres
// Created by Stéphane Mor <stephanemor@gmail.com>
function main(params)
{
  return([
    //clip(params.diametre_interieur, params.diametre_exterieur, params.hauteur_interstice, params.ecart, 2, 1 ),
    //adaptateur_tuyau(10,22).translate([30,20,0]),
    nez(params.largeur_nez,params.hauteur_nez,params.diametre_tuyau_nez,0.4)
    //raccord_tuyau(12).translate([0,0,2])
  ]);
}

// Paramètres modifiables par l'utilisateur
function getParameterDefinitions() {
  return [
    //{ name: 'diametre_interieur', caption: 'Diamètre intérieur:', type: 'float', default: 12 },
    //{ name: 'diametre_exterieur', caption: 'Diametre extérieur:', type: 'float', default: 14 },
    //{ name: 'hauteur_interstice', caption: 'Hauteur de l\'interstice:', type: 'float', default: 4 },
    //{ name: 'ecart', caption: 'Écart:', type: 'float', default: 1 },
    { name: 'largeur_nez', caption: 'Largeur nez:', type: 'float', default: 39 },
    { name: 'hauteur_nez', caption: 'Hauteur nez:', type: 'float', default: 23 },
    { name: 'diametre_tuyau_nez', caption: 'Diamètre du tuyau d\'arrivée d\'air:', type: 'float', default: 10 },
  ];
}

// Partie nasale du masque; le masque proprement dit.
function nez(largeur, hauteur,diametre,epaisseur){
  var rayon = 3;
  var g_cercle = circle({r: rayon + 2, center: true});
  var cercle = circle({r: rayon, center: true});
  var enveloppe_nez = hull(
      g_cercle.translate([(largeur/2) - rayon, 0, 0]),
      g_cercle.translate([-((largeur/2) - rayon),0,0]),
      g_cercle.translate([0,hauteur - rayon,0])
    );
  // Base avec le trou pour le tuyau
  var base_nez = linear_extrude({height: epaisseur}, enveloppe_nez).subtract(cylinder({h: epaisseur *2, r: diametre/2, center: true}).translate([0,hauteur/2 - rayon,0]));
  var trou_nez = hull(
    cercle.translate([(largeur/2) - rayon, 0, 0]),
    cercle.translate([-((largeur/2) - rayon),0,0]),
    cercle.translate([0,hauteur - rayon,0])
  );

  // Extrusion
  var base_extrusion = enveloppe_nez.subtract(trou_nez).translate([0,0,epaisseur]);
  return base_nez.union(linear_extrude({height: 10}, base_extrusion));
}

// Revoir les mesures: diamètres au lieu de rayons!!
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
