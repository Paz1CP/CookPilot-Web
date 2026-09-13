const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const supabaseConfig = {
  url: required("NEXT_PUBLIC_SUPABASE_URL"),
  publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  siteUrl: required("NEXT_PUBLIC_SITE_URL"),
  mediaBaseUrl: required("NEXT_PUBLIC_MEDIA_BASE_URL"),
};
