// Les 24 communes de Kinshasa avec leurs quartiers principaux

const KINSHASA_COMMUNES = [
  {
    id: 'barumbu',
    name: 'Barumbu',
    quartiers: [
      'Kabambare',
      'Kintambo Magasin',
      'Mombele',
      'Molende',
      'Mososo',
      'Mushie',
      'Ngiri-Ngiri'
    ]
  },
  {
    id: 'gombe',
    name: 'Gombe',
    quartiers: [
      'Centre-ville',
      'Huileries',
      'Socimat',
      'Hopital General',
      'Concessions'
    ]
  },
  {
    id: 'kalamu',
    name: 'Kalamu',
    quartiers: [
      'Matonge',
      'Salongo',
      'Victoire',
      'St Jean',
      'Kamuna'
    ]
  },
  {
    id: 'kasa-vubu',
    name: 'Kasa-Vubu',
    quartiers: [
      'Kasa-Vubu',
      'Kimbangu',
      'Makelele',
      'Righini'
    ]
  },
  {
    id: 'kimbanseke',
    name: 'Kimbanseke',
    quartiers: [
      'Kingabwa',
      'Mikonga',
      'Mpasa',
      'Ndjili Brasserie',
      'Tshangu'
    ]
  },
  {
    id: 'kinshasa',
    name: 'Kinshasa',
    quartiers: [
      'Binza Meteo',
      'Binza Ozone',
      'Binza UPN',
      'Kalina',
      'Kimbanseke',
      'Lemba'
    ]
  },
  {
    id: 'kintambo',
    name: 'Kintambo',
    quartiers: [
      'Kintambo',
      'Makelele',
      'Bandalungwa'
    ]
  },
  {
    id: 'lemba',
    name: 'Lemba',
    quartiers: [
      'Lemba Terminus',
      'Lemba Imbu',
      'Salongo',
      'UPN'
    ]
  },
  {
    id: 'limete',
    name: 'Limete',
    quartiers: [
      'Kingasani',
      'Limete Industriel',
      'Limete 1ere Rue',
      'Ndanu',
      'Terminus'
    ]
  },
  {
    id: 'lingwala',
    name: 'Lingwala',
    quartiers: [
      'Lingwala',
      'Quartier 1',
      'Quartier 2',
      'Quartier 3'
    ]
  },
  {
    id: 'makala',
    name: 'Makala',
    quartiers: [
      'Makala',
      'Camp Luka',
      'Righini'
    ]
  },
  {
    id: 'maluku',
    name: 'Maluku',
    quartiers: [
      'Bibwa',
      'Kisenso',
      'Maluku 1',
      'Maluku 2'
    ]
  },
  {
    id: 'masina',
    name: 'Masina',
    quartiers: [
      'Masina',
      'Kimbanseke',
      'Ndjili',
      'Petro-Congo'
    ]
  },
  {
    id: 'matete',
    name: 'Matete',
    quartiers: [
      'Matete',
      'Camp Kokolo',
      'Kinsuka Pecheur',
      'Mitendi'
    ]
  },
  {
    id: 'mont-ngafula',
    name: 'Mont-Ngafula',
    quartiers: [
      'Mont-Ngafula 1',
      'Mont-Ngafula 2',
      'Kinsuka',
      'Mbinza Meteo',
      'Ngafani'
    ]
  },
  {
    id: 'ndjili',
    name: 'N\'djili',
    quartiers: [
      'Aeroport',
      'Ndjili Brasserie',
      'Ndjili Plateau',
      'Mikondo'
    ]
  },
  {
    id: 'ngaba',
    name: 'Ngaba',
    quartiers: [
      'Ngaba',
      'Camp Permanent',
      'Yolo Nord',
      'Yolo Sud'
    ]
  },
  {
    id: 'ngaliema',
    name: 'Ngaliema',
    quartiers: [
      'Joli-Parc',
      'Ma Campagne',
      'Binza',
      'Mont-Fleury',
      'Ngaliema'
    ]
  },
  {
    id: 'ngiri-ngiri',
    name: 'Ngiri-Ngiri',
    quartiers: [
      'Ngiri-Ngiri',
      'Camp Lufungula',
      'Bumba'
    ]
  },
  {
    id: 'nsele',
    name: 'N\'sele',
    quartiers: [
      'Maluku',
      'Nsele',
      'Kinkole'
    ]
  },
  {
    id: 'bumbu',
    name: 'Bumbu',
    quartiers: [
      'Bumbu',
      'Kisenso',
      'Selembao'
    ]
  },
  {
    id: 'bandalungwa',
    name: 'Bandalungwa',
    quartiers: [
      'Bandalungwa',
      'Kintambo'
    ]
  },
  {
    id: 'kisenso',
    name: 'Kisenso',
    quartiers: [
      'Kisenso',
      'Kisenso Village',
      'Kingasani'
    ]
  },
  {
    id: 'selembao',
    name: 'Selembao',
    quartiers: [
      'Selembao',
      'Bumbu',
      'Kingasani'
    ]
  }
];

// Fonction pour obtenir toutes les communes
function getAllCommunes() {
  return KINSHASA_COMMUNES.map(c => ({ id: c.id, name: c.name }));
}

// Fonction pour obtenir les quartiers d'une commune
function getQuartiersForCommune(communeId) {
  const commune = KINSHASA_COMMUNES.find(c => c.id === communeId);
  return commune ? commune.quartiers : [];
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KINSHASA_COMMUNES, getAllCommunes, getQuartiersForCommune };
}
