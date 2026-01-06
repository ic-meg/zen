import usePostalPH from 'use-postal-ph';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';


const postalPH = usePostalPH();

// Fetch all regions
export const fetchRegions = async () => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/regions`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

// Fetch provinces by region code
export const fetchProvinces = async (regionCode) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/regions/${regionCode}/provinces`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

// Fetch cities/municipalities by province code
export const fetchCities = async (provinceCode) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Fetch cities directly by region code (for NCR which has no provinces)
export const fetchCitiesByRegion = async (regionCode) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cities by region:', error);
    return [];
  }
};

// Fetch barangays by city/municipality code
export const fetchBarangays = async (cityCode) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${cityCode}/barangays`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching barangays:', error);
    return [];
  }
};

// Helper function to normalize city names for postal code search
const normalizeCityName = (cityName) => {
  if (!cityName) return '';
  
  // Remove common prefixes and suffixes
  let normalized = cityName.trim()
    .replace(/^City of\s+/i, '')
    .replace(/^Municipality of\s+/i, '')
    .replace(/\s+City$/i, '')
    .replace(/\s+Municipality$/i, '')
    .trim();
    
  return normalized;
};

// Get postal code using use-postal-ph package
export const getPostalCodeForCity = (cityName) => {

  
  try {
    const normalizedName = normalizeCityName(cityName);
    const locations = postalPH.fetchLocations({ search: normalizedName, limit: 1 });

    if (locations && locations.data && locations.data.length > 0) {
      const postalCode = locations.data[0].post_code?.toString() || '';

      return postalCode;
    }
    
    // If no exact match, try searching in data lists by location
    const dataList = postalPH.fetchDataLists({ location: normalizedName, limit: 1 });

    if (dataList && dataList.data && dataList.data.length > 0) {
      const postalCode = dataList.data[0].post_code?.toString() || '';

      return postalCode;
    }
    
    // Try searching by municipality as the most likely match
    const municipalities = postalPH.fetchDataLists({ municipality: normalizedName, limit: 1 });

    
    if (municipalities && municipalities.data && municipalities.data.length > 0) {
      const postalCode = municipalities.data[0].post_code?.toString() || '';

      return postalCode;
    }
    
    // Try with original city name if normalized didn't work
    if (normalizedName !== cityName) {

      const originalSearch = postalPH.fetchDataLists({ municipality: cityName, limit: 1 });
      
      if (originalSearch && originalSearch.data && originalSearch.data.length > 0) {
        const postalCode = originalSearch.data[0].post_code?.toString() || '';

        return postalCode;
      }
    }

    return '';
  } catch (error) {
    console.error('Error getting postal code:', error);
    return '';
  }
};

// Get postal code by searching municipality/city name
export const searchPostalCodeByMunicipality = (municipalityName) => {
  try {
    const municipalities = postalPH.fetchMunicipalities({ search: municipalityName, limit: 1 });
    
    if (municipalities && municipalities.data && municipalities.data.length > 0) {
      const dataList = postalPH.fetchDataLists({ municipality: municipalityName, limit: 1 });
      
      if (dataList && dataList.data && dataList.data.length > 0) {
        return dataList.data[0].post_code?.toString() || '';
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error searching postal code by municipality:', error);
    return '';
  }
};

export const getZipCodeFromCity = (cityData) => {
  const postalCode = getPostalCodeForCity(cityData.name);
  if (postalCode) {
    return postalCode;
  }
  
  return cityData.zipCode || cityData.postalCode || '';
};
//get zip code f rom barangay if not found in city
export const getZipCodeFromBarangay = (barangayData, cityName = null) => {
  if (cityName) {
    const postalCode = getPostalCodeForCity(cityName);
    if (postalCode) {
      return postalCode;
    }
  }
  
  return barangayData.zipCode || barangayData.postalCode || '';
};

//  function to search cities by name (for autocomplete)
export const searchCities = async (searchTerm) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities`);
    const data = await response.json();
    return data.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

//  function to get full address details by barangay code
export const getFullAddressDetails = async (barangayCode) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}/barangays/${barangayCode}`);
    const barangay = await response.json();
    
    if (barangay) {
      // Fetch parent city
      const cityResponse = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${barangay.cityCode || barangay.municipalityCode}`);
      const city = await cityResponse.json();
      
      // Fetch parent province
      const provinceResponse = await fetch(`${PSGC_BASE_URL}/provinces/${city.provinceCode}`);
      const province = await provinceResponse.json();
      
      // Fetch parent region
      const regionResponse = await fetch(`${PSGC_BASE_URL}/regions/${province.regionCode}`);
      const region = await regionResponse.json();
      
      // Get postal code using use-postal-ph package
      const postalCode = getPostalCodeForCity(city.name);
      
      return {
        barangay: barangay.name,
        city: city.name,
        province: province.name,
        region: region.name,
        zipCode: postalCode || barangay.zipCode || city.zipCode || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting full address details:', error);
    return null;
  }
};