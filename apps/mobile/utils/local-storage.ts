import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveDataToLocalStorage = async (key: string, value: any) => {
  try {
    if (value === null || value === undefined || value === '') {
      await AsyncStorage.removeItem(key);
      return;
    }
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
    console.log(`Saved ${key} to storage:`, value);
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const getDataFromLocalStorage = async (key: string): Promise<any> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      console.warn(`No data found for key: ${key}`);
      return null;
    }

    console.log(`Retrieved ${key} from storage:`, value);
    try {
      return JSON.parse(value);
    } catch {
      return value; // fallback: raw string
    }
  } catch (error) {
    console.error(`Error retrieving ${key} from storage:`, error);
    return null;
  }
};

