import { supabase } from '@/integrations/supabase/client';

interface RepairerImportData {
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
}

const repairersData: RepairerImportData[] = [
  { nom: "R.V.I 88", adresse: "3 rue Maquisards", codePostal: "88510", ville: "Eloyes", email: "N/A", telephone: "N/A" },
  { nom: "Devornot", adresse: "44 avenue Gén de Gaulle", codePostal: "88420", ville: "Moyenmoutier", email: "N/A", telephone: "N/A" },
  { nom: "ARM PHONE", adresse: "13 rue François Blaudez", codePostal: "88000", ville: "Epinal", email: "N/A", telephone: "N/A" },
  { nom: "My Home Phone", adresse: "1 rue Thierry de Hamelant", codePostal: "88000", ville: "Epinal", email: "N/A", telephone: "N/A" },
  { nom: "Avelis Connect", adresse: "41 rue France", codePostal: "88300", ville: "Neufchâteau", email: "N/A", telephone: "N/A" },
  { nom: "Boutique Orange", adresse: "256 rue Verdun", codePostal: "88800", ville: "Vittel", email: "N/A", telephone: "N/A" },
  { nom: "MLK Phone", adresse: "11 avenue Mar de Lattre De Tassigny", codePostal: "88000", ville: "Epinal", email: "N/A", telephone: "N/A" },
  { nom: "Sam Informatique", adresse: "1590 avenue Division Leclerc", codePostal: "88300", ville: "Neufchâteau", email: "N/A", telephone: "N/A" },
  { nom: "FastPhone88", adresse: "6 rue 170ème RI", codePostal: "88000", ville: "Epinal", email: "N/A", telephone: "N/A" },
  { nom: "Coriolis Télécom", adresse: "16 rue Gén Leclerc", codePostal: "88500", ville: "Mirecourt", email: "N/A", telephone: "N/A" },
  { nom: "Orange", adresse: "Centre Commercial Carrefour Epinal, 33 rue Saut Le Cerf", codePostal: "88000", ville: "Jeuxey", email: "N/A", telephone: "N/A" },
  { nom: "I.T.S", adresse: "29 rue Charles de Gaulle", codePostal: "88200", ville: "Remiremont", email: "N/A", telephone: "N/A" },
  { nom: "Replayce", adresse: "10 rue Stanislas", codePostal: "88100", ville: "Saint Dié des Vosges", email: "N/A", telephone: "N/A" },
  { nom: "Pcj Cash", adresse: "62 rue Thiers", codePostal: "88100", ville: "Saint Dié des Vosges", email: "N/A", telephone: "N/A" },
  { nom: "Neuro-Technologies", adresse: "rue Rebeuval", codePostal: "88300", ville: "Neufchâteau", email: "N/A", telephone: "N/A" },
  { nom: "Thermal Com", adresse: "294 rue Verdun", codePostal: "88800", ville: "Vittel", email: "N/A", telephone: "N/A" },
  { nom: "WeFix Strasbourg Halles", adresse: "Centre Commercial, 24 Place Des Halles", codePostal: "67000", ville: "Strasbourg", email: "N/A", telephone: "N/A" },
  { nom: "WeFix Fnac Strasbourg", adresse: "Centre Commercial La Maison Rouge, 22 Place Kléber", codePostal: "67000", ville: "Strasbourg", email: "N/A", telephone: "N/A" },
  { nom: "WeFix Fnac Metz", adresse: "4 Rue Winston Churchill", codePostal: "57000", ville: "Metz", email: "N/A", telephone: "N/A" },
  { nom: "WeFix Metz Muse", adresse: "2 rue des Messageries", codePostal: "57000", ville: "Metz", email: "N/A", telephone: "N/A" },
  { nom: "Repar'phone", adresse: "55 rue de la Hache", codePostal: "54000", ville: "Nancy", email: "reparphone54@gmail.com", telephone: "09 54 57 80 48" },
  { nom: "AC Téléphonie Mobile", adresse: "2 A rue Morilles", codePostal: "67610", ville: "La Wantzenau", email: "contact@ac-telephonie-67.com", telephone: "07 75 77 05 65" },
  { nom: "Save Metz", adresse: "11 bis place du Forum, Centre commercial Saint Jacques", codePostal: "57000", ville: "Metz", email: "N/A", telephone: "03 87 52 81 23" },
  { nom: "Save Thionville", adresse: "4 rue du Maillet, CC Geric", codePostal: "57100", ville: "Thionville", email: "N/A", telephone: "03 82 34 67 37" },
  { nom: "Save Châlons En Champagne", adresse: "5 rue des Poissonniers", codePostal: "51000", ville: "Châlons En Champagne", email: "N/A", telephone: "03 52 74 02 22" },
  { nom: "Save Champfleury", adresse: "51 Route Nationale, Centre Commercial E.LECLERC", codePostal: "51500", ville: "Champfleury", email: "N/A", telephone: "03 52 74 02 40" },
  { nom: "Save Epernay", adresse: "4 rue Jean Pierrot", codePostal: "51200", ville: "Epernay", email: "N/A", telephone: "09 82 51 45 91" },
  { nom: "Save Haguenau", adresse: "4 rue du Maréchal Joffre", codePostal: "67500", ville: "Haguenau", email: "N/A", telephone: "03 88 06 48 48 96" },
  { nom: "Save Strasbourg", adresse: "23 Rue du Jeu des Enfants", codePostal: "67000", ville: "Strasbourg", email: "N/A", telephone: "03 88 34 16 75" },
  { nom: "Sos Gsm", adresse: "34 Rue Bourbon", codePostal: "08000", ville: "Charleville-Mézières", email: "N/A", telephone: "03 24 42 36 91" },
  { nom: "New Life Phone", adresse: "28 Rue Pierre Beregovoy", codePostal: "08000", ville: "Charleville-Mézières", email: "N/A", telephone: "N/A" },
  { nom: "Réa-pc EIRL", adresse: "rue Roger Sommer", codePostal: "08300", ville: "Rethel", email: "N/A", telephone: "06 89 47 05 74" },
  { nom: "Tri-Fox", adresse: "13 rue de la Paix", codePostal: "08000", ville: "Charleville-Mézières", email: "N/A", telephone: "N/A" },
  { nom: "Maintenance sav 08", adresse: "41 Rue Ferroul", codePostal: "08000", ville: "Charleville-Mézières", email: "maintenancesav08@gmail.com", telephone: "06 14 89 44 42" },
  { nom: "Capdav", adresse: "13 rue Maryse Bastié", codePostal: "10100", ville: "Romilly-sur-Seine", email: "N/A", telephone: "N/A" },
  { nom: "Kesyco", adresse: "N/A", codePostal: "N/A", ville: "Marigny-le-Châtel", email: "francois@kesyco.fr", telephone: "06 71 06 37 93" },
  { nom: "Mistertel", adresse: "54 avenue Pasteur", codePostal: "10000", ville: "Troyes", email: "contact@mister-tel.fr", telephone: "06 62 25 56 30" },
  { nom: "Docteur PC GSM", adresse: "23 rue Colonel Driant", codePostal: "10000", ville: "Troyes", email: "N/A", telephone: "06 52 95 05 94" },
  { nom: "6netic", adresse: "9 rue de l'Etape", codePostal: "51100", ville: "Reims", email: "contact@6netic.fr", telephone: "N/A" },
  { nom: "L'Univers du Mobile", adresse: "24 Rue de l'Étape", codePostal: "51100", ville: "Reims", email: "N/A", telephone: "03 26 83 06 01" },
  { nom: "Nom'o'Phone", adresse: "217 boulevard Charles Arnould", codePostal: "51100", ville: "Reims", email: "N/A", telephone: "07 71 66 47 72" },
  { nom: "Guéryphone", adresse: "17 Rue des Bouchers", codePostal: "51170", ville: "Fismes", email: "gueryphone@gmail.com", telephone: "06 99 06 30 68" },
  { nom: "ECOPHONE 52", adresse: "9 rue Louis Massotte", codePostal: "52600", ville: "Torcenay", email: "zico.nico@live.fr", telephone: "06 73 09 58 09" },
  { nom: "Platinium Informatique", adresse: "N/A", codePostal: "N/A", ville: "N/A", email: "N/A", telephone: "N/A" },
  { nom: "GSM 70", adresse: "14 rue Carnot", codePostal: "70300", ville: "Luxeuil-les-Bains", email: "N/A", telephone: "06 72 55 21 10" },
  { nom: "Eco Technologie", adresse: "44 avenue République", codePostal: "52000", ville: "Chaumont", email: "N/A", telephone: "03 25 31 62 29" },
  { nom: "Chris informatique", adresse: "33 rue St Vallier", codePostal: "52000", ville: "Chamarandes-Choignes", email: "N/A", telephone: "07 69 65 67 09" },
  { nom: "Omer phone repart's omer", adresse: "38 rue Doct Mougeot", codePostal: "52100", ville: "Saint-Dizier", email: "N/A", telephone: "N/A" },
  { nom: "Widep", adresse: "4 A rue des Michottes", codePostal: "54000", ville: "Nancy", email: "N/A", telephone: "03 83 46 64 11" },
  { nom: "Wimobiles Media", adresse: "5 place St Antoine", codePostal: "54700", ville: "Pont-à-Mousson", email: "N/A", telephone: "N/A" },
  { nom: "Sinam-Informatique", adresse: "17 Rue Saint-Laurent", codePostal: "54700", ville: "Pont-à-Mousson", email: "assistance.informatique@sinam.fr", telephone: "06 10 39 00 87" },
  { nom: "Cristal'Mobil Sylvain", adresse: "6 rue des 3 freres clement", codePostal: "54120", ville: "Baccarat", email: "N/A", telephone: "N/A" },
  { nom: "Monsieur Téléphone", adresse: "Avenue de Chaudeau (Intermarché)", codePostal: "54710", ville: "Ludres", email: "N/A", telephone: "07 48 17 20 89" },
  { nom: "Electronirep", adresse: "8 r capit vaisseau mine", codePostal: "55100", ville: "Verdun", email: "N/A", telephone: "06 14 24 24 00" },
  { nom: "MF Pagny Informatique", adresse: "3 Rue du Puits", codePostal: "55140", ville: "Pagny-la-Blanche-Côte", email: "N/A", telephone: "07 45 14 76 27" },
  { nom: "MediaClinic", adresse: "1 rue Saint-Pierre", codePostal: "55100", ville: "Verdun", email: "verdun@mediaclinic.fr", telephone: "03 55 09 10 75" },
  { nom: "L'Atelier de Réparations", adresse: "1 Avenue de la Grande Terre (Centre E. Leclerc)", codePostal: "55000", ville: "Bar-le-Duc", email: "N/A", telephone: "03 29 90 43 83" },
  { nom: "Acces Informatique 2", adresse: "4 rue Maillet", codePostal: "57100", ville: "Thionville", email: "contact@acces-informatique.net", telephone: "03 82 34 67 37" },
  { nom: "Réparation D&B Multimédia", adresse: "Allée des Sapins", codePostal: "57600", ville: "Forbach", email: "N/A", telephone: "N/A" },
  { nom: "Twenty Repair", adresse: "11 place du Forum", codePostal: "57000", ville: "Metz", email: "N/A", telephone: "N/A" },
  { nom: "Repar and go", adresse: "1 avenue Ney", codePostal: "57000", ville: "Metz", email: "reparandgo57@gmail.com", telephone: "09 82 23 63 53" },
  { nom: "Cash and Repair", adresse: "20 route Arlon", codePostal: "57100", ville: "Thionville", email: "N/A", telephone: "03 82 83 33 18" },
  { nom: "SB Communication & Multimedia", adresse: "17 rue Kuhn", codePostal: "67000", ville: "Strasbourg", email: "N/A", telephone: "09 82 53 16 84" },
  { nom: "MediaRepair", adresse: "10 place du Temple Neuf", codePostal: "67000", ville: "Strasbourg", email: "N/A", telephone: "09 82 51 11 11" },
  { nom: "handydoc", adresse: "N/A", codePostal: "N/A", ville: "N/A", email: "N/A", telephone: "N/A" },
  { nom: "Geek-avenue", adresse: "Rue de l'Artisanat", codePostal: "67116", ville: "Reichstett", email: "N/A", telephone: "N/A" },
  { nom: "Tech-iPhone", adresse: "3 rue Frères Lumière", codePostal: "67201", ville: "Eckbolsheim", email: "contact@tech-iphone.com", telephone: "07 50 84 40 71" },
  { nom: "Planete GSM", adresse: "51 rue des Trois Rois", codePostal: "68100", ville: "Mulhouse", email: "N/A", telephone: "06 36 84 84 37" },
  { nom: "repairNstore", adresse: "N/A", codePostal: "N/A", ville: "N/A", email: "N/A", telephone: "N/A" },
  { nom: "Atelier du Smartphone", adresse: "8 rue de l'Industrie", codePostal: "68730", ville: "Blotzheim", email: "N/A", telephone: "06 52 37 23 47" },
  { nom: "Phonekaze", adresse: "130 Rue de Soultz", codePostal: "68270", ville: "Wittenheim", email: "info@phonekaze.fr", telephone: "06 61 76 88 28" },
  { nom: "Phone'Repair", adresse: "Centre Commercial Hyper U, pont d'Aspach", codePostal: "68520", ville: "Burnhaupt-le-Haut", email: "N/A", telephone: "06 40 54 13 39" },
  { nom: "ASRéparation", adresse: "5 rue des Minimes", codePostal: "88000", ville: "Epinal", email: "asreparation88@gmail.com", telephone: "03 54 31 11 27" },
  { nom: "Trouble Clic", adresse: "36 rue Léopold Bourg", codePostal: "88000", ville: "Epinal", email: "N/A", telephone: "N/A" },
  { nom: "AVELIS connect", adresse: "56 rue Charles de Gaulle", codePostal: "88400", ville: "Gérardmer", email: "espacetelephone88@gmail.com", telephone: "03 29 63 06 04" }
];

export const importRepairers = async (): Promise<{ success: boolean; message: string; imported: number; errors: string[] }> => {
  console.log('🚀 Début de l\'importation des réparateurs...');
  
  try {
    // Utiliser l'Edge Function pour traiter l'import avec géocodage
    const { data, error } = await supabase.functions.invoke('import-repairers', {
      body: { repairersData }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: data.success,
      message: data.message,
      imported: data.imported,
      errors: data.errors || []
    };
    
  } catch (error) {
    const errorMsg = `Erreur fatale lors de l'import: ${error}`;
    console.error('💥', errorMsg);
    return {
      success: false,
      message: errorMsg,
      imported: 0,
      errors: [errorMsg]
    };
  }
};

export default importRepairers;