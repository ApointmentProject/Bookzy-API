interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  idNumber: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  passwordHash: string;
  createdAt: Date;
}

export default User;
