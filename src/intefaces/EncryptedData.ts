interface EncryptedData {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export default EncryptedData;
