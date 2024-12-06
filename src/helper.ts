// Define the type for the result object
type  SupplierInfo =  {
    supplier: string;
    product: string;
    price: string;
    location: string;
    image: string;
  }

  export const convertStringToObject = (str: string): SupplierInfo => {

    const keyValuePairs = str.split(', ');


    const result = keyValuePairs.reduce((acc, pair) => {

      const [key, value] = pair.split(': ');

      const formattedKey = key.toLowerCase().replace(/\s+/g, '_') as keyof SupplierInfo;

      acc[formattedKey] = value;

      return acc;
    }, {} as SupplierInfo);

    return result;
  };

  export const formatDateWithSuffix = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const suffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${suffix(day)} ${month} ${year}`;
  };
