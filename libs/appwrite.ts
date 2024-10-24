import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.ENDPOINT ?? 'https://cloud.appwrite.io/v1',
    platform: process.env.PLATFORM ?? 'com.jsm.aora',
    projectId: process.env.PROJECT_ID ?? '67195d4e001f3ce4aa0e',
    storageId: process.env.STORAGE_ID ?? '671a8ffb0021c9723bd4',
    databaseId: process.env.DATABASE_ID ?? '67195e8e001c4868f753',
    userCollectionId: process.env.USER_COLLECTION_ID ?? '67195ead002350a48165',
    videoCollectionId: process.env.VIDEO_COLLECTION_ID ?? '67195ed10005dea8fec1',
};

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(
    email: string,
    password: string,
    username: string
) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw new Error("Account creation failed");

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
            }
        );

        return newUser;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// Sign In
export async function signIn(email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// Get Account
export async function getAccount() {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}