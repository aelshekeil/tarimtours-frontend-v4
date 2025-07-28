// eSIM plan type
export interface EsimPlan {
  id: number;
  product_name: string;
  data_gb: string;
  net_price_usd: number;
  sms: number;
  voice: number;
}

// Country type: backend returns `Country` field for plans
export interface Country {
  id: number;
  name: string;
  isoCode?: string;
  flag_icon?: {
    url: string;
  };
  Country?: EsimPlan[]; // raw backend field
  plans?: EsimPlan[]; // normalized: holds actual plans
}

// Supabase response type
export interface SupabaseResponse<T> {
  data: T;
  error?: any;
}

import { supabase } from './supabaseClient';

// Fetch all countries with their plans
export const fetchCountriesWithPlans = async (): Promise<Country[]> => {
  try {
    const { data, error } = await supabase.from('eSIM').select('*');

    if (error) {
      throw new Error(error.message);
    }

    const countries: { [key: string]: Country } = {};

    data.forEach((plan: any) => {
      const countryName = plan['Country Region'];
      if (!countries[countryName]) {
        countries[countryName] = {
          id: Object.keys(countries).length + 1,
          name: countryName,
          plans: [],
        };
      }
      countries[countryName].plans?.push({
        id: plan.id,
        product_name: plan['Package Id'],
        data_gb: plan.Data,
        net_price_usd: plan.price,
        sms: plan.SMS,
        voice: plan.Voice,
      });
    });

    return Object.values(countries);
  } catch (error) {
    console.error('Error fetching countries with plans:', error);
    throw error;
  }
};

// Fetch plans for a specific country
export const fetchCountryPlans = async (countryId: number): Promise<EsimPlan[]> => {
  try {
    const countries = await fetchCountriesWithPlans();
    const country = countries.find(c => c.id === countryId);
    return country?.plans ?? [];
  } catch (error) {
    console.error('Error fetching country plans:', error);
    throw error;
  }
};

// Search countries by name
export const searchCountries = async (query: string): Promise<Country[]> => {
  try {
    const countries = await fetchCountriesWithPlans();
    return countries.filter(country => 
      country.name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching countries:', error);
    throw error;
  }
};
