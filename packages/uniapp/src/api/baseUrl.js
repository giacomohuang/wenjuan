const ENV = process.env.NODE_ENV;

const baseUrlMap = {
  development: "http://localhost:3000",
  production: "https://api.example.com",
};

export const baseUrl = baseUrlMap[ENV];
