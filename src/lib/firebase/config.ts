import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };