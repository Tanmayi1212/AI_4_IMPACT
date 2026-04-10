export const YEAR_OPTIONS = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year",
] as const;

export const BRANCH_OPTIONS = [
  "CSE",
  "AIDS",
  "IOT",
  "CSM",
  "IT",
  "BIO",
  "CHEM",
  "MECH",
  "ECE",
  "EVL",
  "EEE",
  "CIVIL",
] as const;

export const OTHER_BRANCH_OPTION = "Other" as const;

export const BRANCH_OPTIONS_WITH_OTHER = [
  ...BRANCH_OPTIONS,
  OTHER_BRANCH_OPTION,
] as const;

export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
