import Business from "../models/business.model";
import { encryptData, decryptData } from "../utils/cypher";

export const encryptBusiness = (business: Business): Business => {
  return {
    ...business,
    email: encryptData(business.email),
    phone_number: encryptData(business.phone_number),
  };
};

export const decryptBusiness = (business: Business): Business => {
  return {
    ...business,
    email: decryptData(business.email),
    phone_number: decryptData(business.phone_number),
  };
};

export const encryptBusinessArray = (businesses: Business[]): Business[] => {
  return businesses.map(business => encryptBusiness(business));
};

export const decryptBusinessArray = (businesses: Business[]): Business[] => {
  return businesses.map(business => decryptBusiness(business));
};