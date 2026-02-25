// =============================================
// Pakistan Cities & Areas — Comprehensive Data
// Used for area-wise delivery charge selection
// =============================================

export interface PakistanCity {
  city: string;
  province: string;
  areas: string[];
}

export const PAKISTAN_CITIES: PakistanCity[] = [
  // ─── PUNJAB ────────────────────────────────────────────────────────
  {
    city: 'Lahore',
    province: 'Punjab',
    areas: [
      'Allama Iqbal Town', 'Anarkali', 'Bahria Town', 'Baghbanpura',
      'Cantt', 'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4',
      'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8',
      'Faisal Town', 'Garden Town', 'Gulberg I', 'Gulberg II', 'Gulberg III',
      'Gulshan-e-Ravi', 'Ichhra', 'Iqbal Town', 'Johar Town', 'LDA Avenue',
      'Liberty Market', 'Model Town', 'Mughalpura', 'Muslim Town',
      'New Garden Town', 'Paragon City', 'Raiwind Road', 'Samanabad',
      'Shadbagh', 'Thokar Niaz Baig', 'Township', 'Valencia Town',
      'Wapda Town', 'Wahdat Road', 'Youhanabad', 'Zaman Park',
    ],
  },
  {
    city: 'Faisalabad',
    province: 'Punjab',
    areas: [
      'Batala Colony', 'Canal Road', 'D-Ground', 'Eden Gardens',
      'Gulistan Colony', 'Ghulam Muhammad Abad', 'Jail Road', 'Jinnah Colony',
      'Kohinoor City', 'Lahore Road', 'Madina Town', 'Manawala',
      'Model Town', 'Peoples Colony', 'Sargodha Road', 'Susan Road',
      'Westwood Colony',
    ],
  },
  {
    city: 'Rawalpindi',
    province: 'Punjab',
    areas: [
      'Adiala Road', 'Bahria Town Phase 1–8', 'Cantt', 'Chaklala',
      'Commercial Market', 'DHA', 'Dhoke Hassu', 'Gujar Khan',
      'Murree Road', 'PWD Colony', 'Riaz Ul Jannah', 'Saddar',
      'Satellite Town', 'Taxila', 'Westridge', 'Chakri Road',
    ],
  },
  {
    city: 'Gujranwala',
    province: 'Punjab',
    areas: [
      'Akbar Town', 'Ali Town', 'Canal Road', 'Civil Lines', 'DHA',
      'Gondlanwala Road', 'Gulshan Colony', 'Jinnah Colony',
      'Model Town', 'Peoples Colony', 'Railway Road', 'Satellite Town',
      'Trust Colony',
    ],
  },
  {
    city: 'Multan',
    province: 'Punjab',
    areas: [
      'Bosan Road', 'Cantt', 'DHA', 'Gulgasht Colony', 'Hussain Agahi',
      'Khawaja Road', 'LMQ Road', 'Model Town', 'New Multan',
      'Shah Rukn-e-Alam Colony', 'Qasimpur Colony', 'Vehari Road',
    ],
  },
  {
    city: 'Sialkot',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'Defence Road', 'Eminabad Road',
      'Jail Road', 'Model Town', 'Paris Road', 'Shahabpura',
      'Younis Colony',
    ],
  },
  {
    city: 'Bahawalpur',
    province: 'Punjab',
    areas: [
      'Airport Road', 'Cantt', 'Civil Lines', 'Circular Road',
      'DHA', 'Farid Gate', 'Model Town', 'New City Colony',
      'Satellite Town',
    ],
  },
  {
    city: 'Sargodha',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'DHA', 'Lahore Road', 'Model Town',
      'Muslim Town', 'Peoples Colony', 'Quaid Road', 'University Road',
    ],
  },
  {
    city: 'Gujrat',
    province: 'Punjab',
    areas: [
      'Bilal Gunj', 'Canal Road', 'Civil Lines', 'Defence Road',
      'GT Road', 'Mandi Bahauddin Road', 'Model Town', 'Sadr',
    ],
  },
  {
    city: 'Sheikhupura',
    province: 'Punjab',
    areas: [
      'Canal Road', 'Civil Lines', 'Faisalabad Road', 'Lahore Road',
      'Model Town', 'Sharaqpur Road',
    ],
  },
  {
    city: 'Jhang',
    province: 'Punjab',
    areas: [
      'Chiniot Road', 'Civil Lines', 'Faisalabad Road', 'Model Town',
      'Sat Hazari', 'Shorkot Road',
    ],
  },
  {
    city: 'Rahim Yar Khan',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'DHA', 'Khanpur Road', 'Model Town',
      'Satellite Town',
    ],
  },
  {
    city: 'Kasur',
    province: 'Punjab',
    areas: [
      'Civil Lines', 'Chunian Road', 'Kot Radha Kishan',
      'Lahore Road', 'Pattoki', 'Phool Nagar',
    ],
  },
  {
    city: 'Dera Ghazi Khan',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'Dajal Road', 'Model Town',
      'Multan Road', 'Taunsa Road',
    ],
  },
  {
    city: 'Okara',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'Depalpur', 'Lahore Road',
      'Model Town', 'Renala Khurd',
    ],
  },
  {
    city: 'Sahiwal',
    province: 'Punjab',
    areas: [
      'Civil Lines', 'DHA', 'Faisalabad Road', 'Model Town',
      'Multan Road', 'Qasim Colony',
    ],
  },
  {
    city: 'Chiniot',
    province: 'Punjab',
    areas: ['Faisalabad Road', 'Jhang Road', 'Model Town', 'Rakh Branch'],
  },
  {
    city: 'Jhelum',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'GT Road', 'Model Town',
      'Pind Dadan Khan', 'Rawalpindi Road',
    ],
  },
  {
    city: 'Narowal',
    province: 'Punjab',
    areas: ['Civil Lines', 'GT Road', 'Shakargarh', 'Zafarwal'],
  },
  {
    city: 'Attock',
    province: 'Punjab',
    areas: ['Attock City', 'Cantt', 'Fateh Jang', 'Hazro', 'Pindigheb'],
  },
  {
    city: 'Chakwal',
    province: 'Punjab',
    areas: ['Choa Saidan Shah', 'Civil Lines', 'Dhamial Road', 'Talagang'],
  },
  {
    city: 'Muzaffargarh',
    province: 'Punjab',
    areas: ['Ali Pur', 'Civil Lines', 'DG Khan Road', 'Kot Addu', 'Multan Road'],
  },
  {
    city: 'Vehari',
    province: 'Punjab',
    areas: ['Burewala', 'Civil Lines', 'Mailsi', 'Model Town', 'Multan Road'],
  },
  {
    city: 'Bahawalnagar',
    province: 'Punjab',
    areas: ['Civil Lines', 'Fort Abbas', 'Haroonabad', 'Model Town'],
  },
  {
    city: 'Khanewal',
    province: 'Punjab',
    areas: ['Civil Lines', 'Jahanian', 'Mian Channu', 'Model Town'],
  },
  {
    city: 'Hafizabad',
    province: 'Punjab',
    areas: ['Civil Lines', 'Hafizabad City', 'Pindi Bhattian', 'Vanike Tarar'],
  },
  {
    city: 'Mandi Bahauddin',
    province: 'Punjab',
    areas: ['Civil Lines', 'Malikwal', 'Phalia', 'Gujjar Khan Road'],
  },
  {
    city: 'Pakpattan',
    province: 'Punjab',
    areas: ['Arif Wala', 'Civil Lines', 'Pakpattan City'],
  },
  {
    city: 'Khushab',
    province: 'Punjab',
    areas: ['Civil Lines', 'Joharabad', 'Naushehra', 'Quaidabad'],
  },
  {
    city: 'Toba Tek Singh',
    province: 'Punjab',
    areas: ['Civil Lines', 'Faisalabad Road', 'Gojra', 'Kamalia', 'Pirmahal'],
  },
  // ─── SINDH ─────────────────────────────────────────────────────────
  {
    city: 'Karachi',
    province: 'Sindh',
    areas: [
      'Bahria Town', 'Baldia Town', 'Bath Island', 'Cantt',
      'Clifton Block 1–9', 'Defence DHA Phase 1', 'Defence DHA Phase 2',
      'Defence DHA Phase 3', 'Defence DHA Phase 4', 'Defence DHA Phase 5',
      'Defence DHA Phase 6', 'Defence DHA Phase 7', 'Defence DHA Phase 8',
      'Defence View', 'Federal B Area', 'Garden', 'Gulistan-e-Johar',
      'Gulshan-e-Iqbal', 'PECHS', 'Johar Town', 'Keamari', 'Korangi',
      'Landhi', 'Liaquatabad', 'Lyari', 'Malir', 'Manghopir',
      'Nazimabad', 'New Karachi', 'North Nazimabad', 'Orangi Town',
      'Saddar', 'Scheme 33', 'Shah Faisal Colony', 'Silver Jubilee Area',
      'Sir Syed Town', 'Surjani Town',
    ],
  },
  {
    city: 'Hyderabad',
    province: 'Sindh',
    areas: [
      'Cantt', 'Civil Lines', 'Hyderabad City', 'Latifabad',
      'Model Colony', 'Qasimabad', 'Tando Allahyar Road',
    ],
  },
  {
    city: 'Sukkur',
    province: 'Sindh',
    areas: [
      'Airport Road', 'Civil Lines', 'Minara Road', 'New Sukkur',
      'Rohri', 'Stadium Road',
    ],
  },
  {
    city: 'Larkana',
    province: 'Sindh',
    areas: [
      'Civil Lines', 'Dokri', 'Larkana City', 'Nawabshah Road',
      'Shahdadkot Road',
    ],
  },
  {
    city: 'Nawabshah',
    province: 'Sindh',
    areas: [
      'Civil Lines', 'Model Colony', 'Nawabshah City', 'Sakrand Road',
    ],
  },
  {
    city: 'Mirpur Khas',
    province: 'Sindh',
    areas: ['Civil Lines', 'Digri Road', 'Mirpur Khas City', 'Umerkot Road'],
  },
  {
    city: 'Jacobabad',
    province: 'Sindh',
    areas: ['Civil Lines', 'Garhi Khairo Road', 'Jacobabad City'],
  },
  {
    city: 'Shikarpur',
    province: 'Sindh',
    areas: ['Civil Lines', 'Lakhi Road', 'Shikarpur City'],
  },
  {
    city: 'Khairpur',
    province: 'Sindh',
    areas: ['Civil Lines', 'Gambat', 'Khairpur City', 'Kingri'],
  },
  // ─── KPK ─────────────────────────────────────────────────────────
  {
    city: 'Peshawar',
    province: 'KPK',
    areas: [
      'Ander Sheher', 'Bahria Town', 'Cantt', 'Charsadda Road',
      'DHA', 'Dalazak Road', 'Faqirabad', 'Gulbahar',
      'Hayatabad Phase 1', 'Hayatabad Phase 2', 'Hayatabad Phase 3',
      'Hayatabad Phase 4', 'Hayatabad Phase 5', 'Hayatabad Phase 6',
      'Kohat Road', 'Kohati Gate', 'Namak Mandi', 'Palosi',
      'Phase 5 Ext', 'Saddar', 'University Road', 'Warsak Road',
    ],
  },
  {
    city: 'Mardan',
    province: 'KPK',
    areas: [
      'Civil Lines', 'Gulshan Abad', 'Mardan City', 'Takht Bhai Road',
      'University Road',
    ],
  },
  {
    city: 'Mingora',
    province: 'KPK',
    areas: [
      'Amankot', 'Batkhela Road', 'Civil Lines', 'Fizagat',
      'Mingora City', 'Saidu Sharif',
    ],
  },
  {
    city: 'Abbottabad',
    province: 'KPK',
    areas: [
      'Abbottabad City', 'Cantt', 'Civil Lines', 'Kakul Road',
      'Mansehra Road', 'PMA Road', 'Shimla Hill',
    ],
  },
  {
    city: 'Mansehra',
    province: 'KPK',
    areas: ['Battal Road', 'Civil Lines', 'Garhi Habibullah', 'Mansehra City'],
  },
  {
    city: 'Kohat',
    province: 'KPK',
    areas: ['Cantt', 'Civil Lines', 'Hangu Road', 'Kohat City', 'Peshawar Road'],
  },
  {
    city: 'Nowshera',
    province: 'KPK',
    areas: ['Cantt', 'Civil Lines', 'Mardan Road', 'Nowshera City', 'Pabbi'],
  },
  {
    city: 'Charsadda',
    province: 'KPK',
    areas: ['Charsadda City', 'Civil Lines', 'Mardan Road', 'Shabqadar'],
  },
  {
    city: 'Dera Ismail Khan',
    province: 'KPK',
    areas: ['Cantt', 'City Centre', 'Civil Lines', 'Daraban Road', 'Model Town'],
  },
  {
    city: 'Haripur',
    province: 'KPK',
    areas: ['Abbottabad Road', 'DHA Haripur', 'Haripur City'],
  },
  {
    city: 'Bannu',
    province: 'KPK',
    areas: ['Bannu City', 'Civil Lines', 'DI Khan Road'],
  },
  {
    city: 'Swabi',
    province: 'KPK',
    areas: ['Civil Lines', 'Mardan Road', 'Swabi City', 'Topi Road'],
  },
  // ─── BALOCHISTAN ────────────────────────────────────────────────
  {
    city: 'Quetta',
    province: 'Balochistan',
    areas: [
      'Airport Road', 'Brewery Road', 'Cantt', 'Civil Lines',
      'DHA', 'Jinnah Road', 'Kuchlak Road', 'Mir Suleman Road',
      'Pishin Road', 'Prince Road', 'Rail Road', 'Samungli Road',
      'Satellite Town', 'Sariab Road', 'Zarghoon Road',
    ],
  },
  {
    city: 'Turbat',
    province: 'Balochistan',
    areas: ['Civil Lines', 'Mand Road', 'Turbat City'],
  },
  {
    city: 'Khuzdar',
    province: 'Balochistan',
    areas: ['Civil Lines', 'Khuzdar City', 'Surab Road'],
  },
  {
    city: 'Hub',
    province: 'Balochistan',
    areas: ['Hub Chowki', 'Hub Industrial Area', 'Hub Town', 'Karachi Road'],
  },
  {
    city: 'Gwadar',
    province: 'Balochistan',
    areas: [
      'Airport Road', 'CPEC Zone', 'Gwadar City', 'Marine Drive',
      'New Town', 'Pasni Road',
    ],
  },
  {
    city: 'Chaman',
    province: 'Balochistan',
    areas: ['Chaman City', 'Quetta Road'],
  },
  {
    city: 'Zhob',
    province: 'Balochistan',
    areas: ['Civil Lines', 'Quetta Road', 'Zhob City'],
  },
  {
    city: 'Loralai',
    province: 'Balochistan',
    areas: ['Civil Lines', 'Loralai City', 'Zhob Road'],
  },
  // ─── ISLAMABAD (ICT) ────────────────────────────────────────────
  {
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    areas: [
      'Bahria Town Phase 1–8', 'Bani Gala', 'Blue Area',
      'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3',
      'E-6', 'E-7', 'E-8', 'E-11',
      'F-6', 'F-7', 'F-8', 'F-10', 'F-11',
      'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11', 'G-13', 'G-14', 'G-15',
      'H-8', 'H-9', 'H-11', 'H-13',
      'I-8', 'I-9', 'I-10', 'I-14', 'I-15', 'I-16',
      'Margalla Hills', 'Park Road', 'PWD Colony', 'Rawat', 'Tarnol',
    ],
  },
  // ─── AJK ────────────────────────────────────────────────────────
  {
    city: 'Mirpur',
    province: 'AJK',
    areas: [
      'Allama Iqbal Town', 'Chaksawari Road', 'Civil Lines',
      'DHA', 'Mirpur City', 'New Mirpur City',
    ],
  },
  {
    city: 'Muzaffarabad',
    province: 'AJK',
    areas: [
      'Block A–F', 'Civil Lines', 'Domel', 'Muzaffarabad City', 'Neelum Road',
    ],
  },
  {
    city: 'Rawalakot',
    province: 'AJK',
    areas: ['Civil Lines', 'Hajira Road', 'Rawalakot City'],
  },
  {
    city: 'Bagh',
    province: 'AJK',
    areas: ['Bagh City', 'Civil Lines', 'Dhirkot Road'],
  },
  {
    city: 'Kotli',
    province: 'AJK',
    areas: ['Civil Lines', 'Kotli City', 'Mirpur Road'],
  },
  // ─── GILGIT-BALTISTAN ───────────────────────────────────────────
  {
    city: 'Gilgit',
    province: 'Gilgit-Baltistan',
    areas: ['Airport Road', 'Civil Lines', 'Gilgit City', 'Jutial', 'Konodas'],
  },
  {
    city: 'Skardu',
    province: 'Gilgit-Baltistan',
    areas: ['Civil Lines', 'Kachura Road', 'Skardu City'],
  },
  {
    city: 'Chilas',
    province: 'Gilgit-Baltistan',
    areas: ['Chilas City', 'Karakoram Highway'],
  },
];

/** Get sorted city names */
export const getCityNames = (): string[] =>
  PAKISTAN_CITIES.map((c) => c.city).sort((a, b) => a.localeCompare(b));

/** Get areas for a specific city */
export const getAreasByCity = (city: string): string[] => {
  const found = PAKISTAN_CITIES.find(
    (c) => c.city.toLowerCase() === city.toLowerCase()
  );
  return found ? [...found.areas].sort((a, b) => a.localeCompare(b)) : [];
};

/** Get province for a city */
export const getProvinceByCity = (city: string): string | null => {
  const found = PAKISTAN_CITIES.find(
    (c) => c.city.toLowerCase() === city.toLowerCase()
  );
  return found?.province ?? null;
};

/** Group cities by province for admin area block navigation */
export const getCitiesByProvince = (): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const c of PAKISTAN_CITIES) {
    if (!result[c.province]) result[c.province] = [];
    result[c.province].push(c.city);
  }
  // Sort cities within each province
  for (const province in result) {
    result[province].sort((a, b) => a.localeCompare(b));
  }
  return result;
};
