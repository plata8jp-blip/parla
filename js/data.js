// Contenido de los cursos. Cada unidad tiene palabras (w) y frases (p).
// Formato de cada entrada: [texto en el idioma, traducción al español]
// La unidad marcada con plus:true se muestra como «Bonus» (expresiones coloquiales).
// Las traducciones se han elaborado con ayuda de IA: si se corrige alguna, basta con editarla aquí.

window.PARLA_COURSES = {
  en: {
    name: "Inglés", voice: "en-US", flag: "EN", color: "#3B6FE0",
    units: [
      { title: "Saludos", city: "Londres",
        w: [["hello","hola"],["goodbye","adiós"],["please","por favor"],["thank you","gracias"],["friend","amigo"]],
        p: [["Nice to meet you","Encantado de conocerte"],["How are you?","¿Cómo estás?"],["My name is Ana","Me llamo Ana"]] },
      { title: "Comida", city: "Nueva York",
        w: [["water","agua"],["bread","pan"],["apple","manzana"],["coffee","café"],["cheese","queso"]],
        p: [["I am hungry","Tengo hambre"],["The soup is hot","La sopa está caliente"],["I would like a coffee","Quisiera un café"]] },
      { title: "De viaje", city: "Dublín",
        w: [["train","tren"],["street","calle"],["ticket","billete"],["airport","aeropuerto"],["beach","playa"]],
        p: [["Where is the station?","¿Dónde está la estación?"],["I need a ticket","Necesito un billete"],["Turn left here","Gira a la izquierda aquí"]] },
      { title: "Familia y tiempo", city: "Sídney",
        w: [["mother","madre"],["brother","hermano"],["today","hoy"],["tomorrow","mañana"],["week","semana"]],
        p: [["My sister lives in London","Mi hermana vive en Londres"],["See you tomorrow","Hasta mañana"],["We eat together on Sundays","Comemos juntos los domingos"]] },
      { title: "Hablar como un local", city: "Edimburgo", plus: true,
        w: [["cheers","salud"],["awesome","genial"],["mate","colega"],["deal","trato hecho"],["no worries","no pasa nada"]],
        p: [["It is a piece of cake","Es pan comido"],["Break a leg tonight","Mucha suerte esta noche"],["I am feeling under the weather","Me siento un poco mal"]] }
    ]
  },
  fr: {
    name: "Francés", voice: "fr-FR", flag: "FR", color: "#2F5BB7",
    units: [
      { title: "Saludos", city: "París",
        w: [["bonjour","hola"],["au revoir","adiós"],["s'il vous plaît","por favor"],["merci","gracias"],["ami","amigo"]],
        p: [["Ravi de te rencontrer","Encantado de conocerte"],["Comment ça va ?","¿Cómo estás?"],["Je m'appelle Ana","Me llamo Ana"]] },
      { title: "Comida", city: "Lyon",
        w: [["eau","agua"],["pain","pan"],["pomme","manzana"],["café","café"],["fromage","queso"]],
        p: [["J'ai faim","Tengo hambre"],["La soupe est chaude","La sopa está caliente"],["Je voudrais un café","Quisiera un café"]] },
      { title: "De viaje", city: "Marsella",
        w: [["train","tren"],["rue","calle"],["billet","billete"],["aéroport","aeropuerto"],["plage","playa"]],
        p: [["Où est la gare ?","¿Dónde está la estación?"],["J'ai besoin d'un billet","Necesito un billete"],["Tournez à gauche ici","Gire a la izquierda aquí"]] },
      { title: "Familia y tiempo", city: "Montreal",
        w: [["mère","madre"],["frère","hermano"],["aujourd'hui","hoy"],["demain","mañana"],["semaine","semana"]],
        p: [["Ma sœur habite à Londres","Mi hermana vive en Londres"],["À demain","Hasta mañana"],["Nous mangeons ensemble le dimanche","Comemos juntos los domingos"]] },
      { title: "Hablar como un local", city: "Bruselas", plus: true,
        w: [["santé","salud"],["génial","genial"],["pote","colega"],["d'accord","de acuerdo"],["bof","ni fu ni fa"]],
        p: [["C'est du gâteau","Es pan comido"],["Je croise les doigts","Cruzo los dedos"],["Je suis un peu patraque","Me siento un poco mal"]] }
    ]
  },
  it: {
    name: "Italiano", voice: "it-IT", flag: "IT", color: "#157A52",
    units: [
      { title: "Saludos", city: "Roma",
        w: [["ciao","hola"],["arrivederci","adiós"],["per favore","por favor"],["grazie","gracias"],["amico","amigo"]],
        p: [["Piacere di conoscerti","Encantado de conocerte"],["Come stai?","¿Cómo estás?"],["Mi chiamo Ana","Me llamo Ana"]] },
      { title: "Comida", city: "Nápoles",
        w: [["acqua","agua"],["pane","pan"],["mela","manzana"],["caffè","café"],["formaggio","queso"]],
        p: [["Ho fame","Tengo hambre"],["La zuppa è calda","La sopa está caliente"],["Vorrei un caffè","Quisiera un café"]] },
      { title: "De viaje", city: "Florencia",
        w: [["treno","tren"],["strada","calle"],["biglietto","billete"],["aeroporto","aeropuerto"],["spiaggia","playa"]],
        p: [["Dov'è la stazione?","¿Dónde está la estación?"],["Ho bisogno di un biglietto","Necesito un billete"],["Gira a sinistra qui","Gira a la izquierda aquí"]] },
      { title: "Familia y tiempo", city: "Milán",
        w: [["madre","madre"],["fratello","hermano"],["oggi","hoy"],["domani","mañana"],["settimana","semana"]],
        p: [["Mia sorella vive a Londra","Mi hermana vive en Londres"],["A domani","Hasta mañana"],["Mangiamo insieme la domenica","Comemos juntos los domingos"]] },
      { title: "Hablar como un local", city: "Venecia", plus: true,
        w: [["salute","salud"],["magari","ojalá"],["figo","guay"],["boh","ni idea"],["dai","venga"]],
        p: [["È un gioco da ragazzi","Es pan comido"],["In bocca al lupo","Mucha suerte"],["Non vedo l'ora","Tengo muchas ganas"]] }
    ]
  },
  de: {
    name: "Alemán", voice: "de-DE", flag: "DE", color: "#C2462E",
    units: [
      { title: "Saludos", city: "Berlín",
        w: [["hallo","hola"],["tschüss","adiós"],["bitte","por favor"],["danke","gracias"],["Freund","amigo"]],
        p: [["Schön dich kennenzulernen","Encantado de conocerte"],["Wie geht es dir?","¿Cómo estás?"],["Ich heiße Ana","Me llamo Ana"]] },
      { title: "Comida", city: "Múnich",
        w: [["Wasser","agua"],["Brot","pan"],["Apfel","manzana"],["Kaffee","café"],["Käse","queso"]],
        p: [["Ich habe Hunger","Tengo hambre"],["Die Suppe ist heiß","La sopa está caliente"],["Ich hätte gern einen Kaffee","Quisiera un café"]] },
      { title: "De viaje", city: "Hamburgo",
        w: [["Zug","tren"],["Straße","calle"],["Fahrkarte","billete"],["Flughafen","aeropuerto"],["Strand","playa"]],
        p: [["Wo ist der Bahnhof?","¿Dónde está la estación?"],["Ich brauche eine Fahrkarte","Necesito un billete"],["Biegen Sie hier links ab","Gire aquí a la izquierda"]] },
      { title: "Familia y tiempo", city: "Viena",
        w: [["Mutter","madre"],["Bruder","hermano"],["heute","hoy"],["morgen","mañana"],["Woche","semana"]],
        p: [["Meine Schwester wohnt in London","Mi hermana vive en Londres"],["Bis morgen","Hasta mañana"],["Wir essen sonntags zusammen","Comemos juntos los domingos"]] },
      { title: "Hablar como un local", city: "Zúrich", plus: true,
        w: [["Prost","salud"],["toll","genial"],["Kumpel","colega"],["na ja","bueno..."],["Feierabend","fin de la jornada"]],
        p: [["Das ist ein Kinderspiel","Es pan comido"],["Ich drücke dir die Daumen","Cruzo los dedos por ti"],["Ich verstehe nur Bahnhof","No entiendo nada"]] }
    ]
  }
};

// Cada unidad se divide en tres paradas del recorrido.
window.PARLA_STOPS = [
  { kind: "words",   label: "Palabras" },
  { kind: "phrases", label: "Frases" },
  { kind: "challenge", label: "Desafío" }
];
