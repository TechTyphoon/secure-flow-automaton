
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      // Log the not found access
      const body = await req.json();
      console.log("[404-Log] route:", body.path, "referrer:", body.referrer, "userAgent:", body.userAgent);
      // Here you could insert into a "not_found_logs" table if you want.
      return new Response(
        JSON.stringify({ success: true, message: "404 logged." }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (req.method === "GET") {
      // Optionally return a dynamic custom error message
      const params = new URL(req.url).searchParams;
      const path = params.get("path") ?? "";
      // You could dynamically return content based on path if desired:
      return new Response(
        JSON.stringify({
          notFound: true,
          message: `Sorry, the page '${path}' does not exist in our system.`,
          tip: "Try checking the URL or return to the homepage."
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response("Not allowed", { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error("Error in not-found-log function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
