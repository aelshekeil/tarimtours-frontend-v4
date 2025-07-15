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

// Fetch all countries with their plans
export const fetchCountriesWithPlans = async (): Promise<Country[]> => {
  try {
    // For now, return mock data since we don't have countries table in Supabase yet
    // In a real implementation, you would create a countries table and esim_plans table
    const mockCountries: Country[] = [
      {
        id: 1,
        name: 'Yemen',
        isoCode: 'YE',
        flag_icon: {
          url: 'https://flagcdn.com/w320/ye.png'
        },
        plans: [
          {
            id: 1,
            product_name: 'Yemen 5GB - 30 Days',
            data_gb: '5GB',
            net_price_usd: 25.99,
            sms: 0,
            voice: 0
          },
          {
            id: 2,
            product_name: 'Yemen 10GB - 30 Days',
            data_gb: '10GB',
            net_price_usd: 45.99,
            sms: 0,
            voice: 0
          }
        ]
      },
      {
        id: 2,
        name: 'Saudi Arabia',
        isoCode: 'SA',
        flag_icon: {
          url: 'https://flagcdn.com/w320/sa.png'
        },
        plans: [
          {
            id: 3,
            product_name: 'Saudi Arabia 3GB - 15 Days',
            data_gb: '3GB',
            net_price_usd: 19.99,
            sms: 0,
            voice: 0
          },
          {
            id: 4,
            product_name: 'Saudi Arabia 8GB - 30 Days',
            data_gb: '8GB',
            net_price_usd: 39.99,
            sms: 0,
            voice: 0
          }
        ]
      },
      {
        id: 3,
        name: 'United Arab Emirates',
        isoCode: 'AE',
        flag_icon: {
          url: 'https://flagcdn.com/w320/ae.png'
        },
        plans: [
          {
            id: 5,
            product_name: 'UAE 5GB - 30 Days',
            data_gb: '5GB',
            net_price_usd: 29.99,
            sms: 0,
            voice: 0
          },
          {
            id: 6,
            product_name: 'UAE 15GB - 30 Days',
            data_gb: '15GB',
            net_price_usd: 59.99,
            sms: 0,
            voice: 0
          }
        ]
      }
    ];

    return mockCountries;
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

