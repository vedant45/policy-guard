import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.OPENMETADATA_URL || "http://localhost:8585";
let token: string | null = null;

async function getAuthToken(): Promise<string> {
  if (token) return token;
  
  const encodedPassword = Buffer.from(process.env.OPENMETADATA_PASSWORD || "").toString("base64");
  
  const res = await axios.post(`${BASE_URL}/api/v1/users/login`, {
    email: process.env.OPENMETADATA_USER,
    password: encodedPassword,
  });

  token = res.data.accessToken;
  return token!;
}
export async function getClient(): Promise<AxiosInstance> {
  const t = await getAuthToken();
  return axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: { Authorization: `Bearer ${t}` },
  });
}

export async function getPolicies() {
  const client = await getClient();
  const res = await client.get("/policies?limit=50");
  return res.data.data;
}

export async function getRoles() {
  const client = await getClient();
  const res = await client.get("/roles?limit=50");
  return res.data.data;
}

export async function getGlossaries() {
  const client = await getClient();
  const res = await client.get("/glossaries?limit=50&fields=owners,tags");
  return res.data.data;  // remove the console.log line
}


export async function getGlossaryTerms(glossaryId: string) {
  const client = await getClient();
  const res = await client.get(`/glossaryTerms?glossary=${glossaryId}&limit=100`);
  return res.data.data;
}

export async function getUsers() {
  const client = await getClient();
  const res = await client.get("/users?limit=50&isBot=false");
  return res.data.data;
}

export async function getTeams() {
  const client = await getClient();
  const res = await client.get("/teams?limit=50&teamType=Group");
  return res.data.data;
}



export async function getUserByName(name: string) {
  const client = await getClient();
  const res = await client.get(`/users/name/${name}`);
  return res.data;
}

export async function getTables() {
  const client = await getClient();
  const res = await client.get("/tables?limit=50&include=all");
  return res.data.data;
}

export async function getDashboards() {
  const client = await getClient();
  const res = await client.get("/dashboards?limit=50&include=all");
  return res.data.data;
}

export async function getTopics() {
  const client = await getClient();
  const res = await client.get("/topics?limit=50&include=all");
  return res.data.data;
}


export async function assignOwner(
  assetType: string,
  assetId: string,
  ownerType: "user" | "team",
  ownerId: string,
  ownerName: string
) {
  const client = await getClient();

  const entityPath = 
    assetType === "Glossary" ? "glossaries" :
    assetType === "Table" ? "tables" :
    assetType === "Dashboard" ? "dashboards" : "topics";

  // OpenMetadata expects owners as an array
  const res = await client.patch(
    `/${entityPath}/${assetId}`,
    [
      {
        op: "add",
        path: "/owners",
        value: [
          {
            id: ownerId,
            type: ownerType,
          }
        ]
      }
    ],
    {
      headers: { "Content-Type": "application/json-patch+json" },
    }
  );
  return res.data;
}



export async function createGroupTeam(name: string) {
  const client = await getClient();
  const res = await client.post("/teams", {
    name: name,
    displayName: name,
    teamType: "Group",
    description: "Auto-created by PolicyGuard for ownership delegation",
  });
  return res.data;
}


export async function getUserById(userId: string) {
  const client = await getClient();
  try {
    const res = await client.get(`/users/${userId}?include=all`);
    return res.data;
  } catch (e) {
    return null;
  }
}